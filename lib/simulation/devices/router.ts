import { BaseDevice } from '../engine'
import type { EthernetFrame, IPv4Packet, ARPPacket, ICMPPacket, NetworkInterface, RoutingEntry, ArpEntry, RouterSnapshot, OspfProcess, OspfArea, RipConfig, EigrpProcess, BgpConfig, NatConfig, AclEntry, DhcpPool } from '../types'
import { ICMP_ECHO_REPLY, ICMP_ECHO_REQUEST, ICMP_TTL_EXCEEDED, ICMP_DEST_UNREACHABLE } from '../types'
import { generateMac, isInSubnet, getNetworkAddress, isValidIp, isValidMask, maskToPrefixLen, prefixLenToMask } from '../ip-utils'
import { shortIf } from '../cli/shared'
import { CiscoRouterCLI } from '../cli/router/cisco'
import { HuaweiRouterCLI } from '../cli/router/huawei'
import { JuniperRouterCLI } from '../cli/router/juniper'
import { MikroTikRouterCLI } from '../cli/router/mikrotik'
import type { RouterBrandCLI } from '../cli/router/base'

interface PendingArp { iface: string; packets: IPv4Packet[] }
interface PingState {
  id: number; count: number; target: string; sent: number; results: string[]
  resolve: (lines: string[]) => void
  onReply?: (type: number, srcIp: string, seq: number) => void
}

let pingIdCounter = 1

// ────────────────────────────────────────────────────────────────────────────

export class RouterDevice extends BaseDevice {
  brand: string
  interfaces: Map<string, NetworkInterface> = new Map()
  arpTable:    Map<string, ArpEntry>        = new Map()
  routingTable: RoutingEntry[] = []
  readonly cli: RouterBrandCLI

  // ─── Routing protocol state ───────────────────────────────────────────────
  ospfProcesses: Map<number, OspfProcess> = new Map()
  ripConfig: RipConfig | null = null
  eigrpProcesses: Map<number, EigrpProcess> = new Map()
  bgpConfig: BgpConfig | null = null
  natConfig: NatConfig = {
    insideInterfaces: new Set(),
    outsideInterfaces: new Set(),
    pools: new Map(),
    staticMappings: new Map(),
    overload: false,
  }
  accessLists: Map<string, AclEntry[]> = new Map()
  dhcpPools: Map<string, DhcpPool> = new Map()
  dhcpExcluded: string[] = []
  domainName?: string

  private pendingArp:  Map<string, PendingArp>  = new Map()
  private pingStates:  Map<number, PingState>   = new Map()

  constructor(id: string, name: string, portCount = 4, brand = 'Cisco') {
    super(id, 'router', name)
    this.brand = brand
    for (let i = 0; i < portCount; i++) this.addInterface(this.buildIfName(i))
    this.cli = RouterDevice.createCLI(this)
  }

  private static createCLI(dev: RouterDevice): RouterBrandCLI {
    switch (dev.brand) {
      case 'Huawei':   return new HuaweiRouterCLI(dev)
      case 'Juniper':  return new JuniperRouterCLI(dev)
      case 'MikroTik': return new MikroTikRouterCLI(dev)
      default:         return new CiscoRouterCLI(dev)
    }
  }

  private buildIfName(i: number): string {
    if (this.brand === 'Huawei')   return `GigabitEthernet0/0/${i}`
    if (this.brand === 'Juniper')  return `ge-0/0/${i}`
    if (this.brand === 'MikroTik') return `ether${i + 1}`
    return `GigabitEthernet0/${i}`
  }

  addInterface(name: string): void {
    this.interfaces.set(name, { name, mac: generateMac(), status: 'down' })
  }

  // ─── Frame / packet handling ─────────────────────────────────────────────

  receiveFrame(ifName: string, frame: EthernetFrame): void {
    const iface = this.interfaces.get(ifName)
    if (!iface || iface.status === 'down') return
    if (frame.etherType === 0x0806) {
      this.handleARP(ifName, frame.payload as ARPPacket)
    } else if (frame.etherType === 0x0800) {
      if (frame.dstMac !== iface.mac && frame.dstMac !== 'ff:ff:ff:ff:ff:ff') return
      this.handleIP(ifName, frame.payload as IPv4Packet, frame.srcMac)
    }
  }

  private handleARP(ifName: string, arp: ARPPacket): void {
    const iface = this.interfaces.get(ifName)
    if (!iface?.ip) return
    this.arpTable.set(arp.senderIp, { ip: arp.senderIp, mac: arp.senderMac, iface: ifName })
    if (arp.operation === 1 && arp.targetIp === iface.ip) {
      this.log({ type: 'arp-reply', srcDevice: this.name, dstDevice: '', srcIp: iface.ip, dstIp: arp.senderIp, detail: `ARP Reply: ${iface.ip} is-at ${iface.mac}` })
      this.sendFrame(ifName, { srcMac: iface.mac, dstMac: arp.senderMac, etherType: 0x0806, payload: { operation: 2, senderMac: iface.mac, senderIp: iface.ip, targetMac: arp.senderMac, targetIp: arp.senderIp } })
    } else if (arp.operation === 2) {
      const pending = this.pendingArp.get(arp.senderIp)
      if (pending) { for (const pkt of pending.packets) this.forwardPacket(pkt, ifName, arp.senderMac); this.pendingArp.delete(arp.senderIp) }
    }
  }

  private handleIP(ifName: string, packet: IPv4Packet, prevHopMac?: string): void {
    const myIps = Array.from(this.interfaces.values()).map(i => i.ip).filter(Boolean)
    if (myIps.includes(packet.dstIp)) { if (packet.protocol === 1) this.handleICMP(ifName, packet); return }
    if (packet.ttl <= 1) { this.sendICMPTTLExceeded(ifName, packet, prevHopMac); return }
    this.routePacket({ ...packet, ttl: packet.ttl - 1 }, ifName)
  }

  private handleICMP(ifName: string, packet: IPv4Packet): void {
    const icmp = packet.payload as ICMPPacket
    const state = icmp.id !== undefined ? this.pingStates.get(icmp.id) : undefined
    if (icmp.type === ICMP_ECHO_REQUEST) {
      const iface = this.interfaces.get(ifName)!
      this.log({ type: 'icmp-req', srcDevice: '', dstDevice: this.name, srcIp: packet.srcIp, dstIp: packet.dstIp, detail: `ICMP Echo Request id=${icmp.id} seq=${icmp.sequence}` })
      this.sendIPPacket(packet.srcIp, 1, { type: ICMP_ECHO_REPLY, code: 0, id: icmp.id, sequence: icmp.sequence }, iface.ip!)
    } else if (icmp.type === ICMP_ECHO_REPLY || icmp.type === ICMP_TTL_EXCEEDED || icmp.type === ICMP_DEST_UNREACHABLE) {
      this.log({ type: icmp.type === ICMP_ECHO_REPLY ? 'icmp-reply' : 'icmp-ttl', srcDevice: packet.srcIp, dstDevice: this.name, srcIp: packet.srcIp, detail: `ICMP type=${icmp.type} id=${icmp.id} seq=${icmp.sequence}` })
      if (state) { if (state.onReply) state.onReply(icmp.type, packet.srcIp, icmp.sequence); else this.handlePingReply(state, packet, icmp) }
    }
  }

  private routePacket(packet: IPv4Packet, inIface: string): void {
    const route = this.lookupRoute(packet.dstIp)
    if (!route) { this.sendICMPUnreachable(inIface, packet); return }
    let ifName = route.interface
    if (!ifName && route.nextHop) { const nr = this.lookupRoute(route.nextHop); if (nr) ifName = nr.interface }
    const outIface = this.interfaces.get(ifName)
    if (!outIface || outIface.status === 'down') return
    const nextHopIp = route.nextHop || packet.dstIp
    const arpEntry = this.arpTable.get(nextHopIp)
    if (arpEntry) this.forwardPacket(packet, ifName, arpEntry.mac)
    else this.queuePendingArp(packet, ifName, nextHopIp)
  }

  private forwardPacket(packet: IPv4Packet, ifName: string, dstMac: string): void {
    const iface = this.interfaces.get(ifName)!
    this.log({ type: 'ip-fwd', srcDevice: this.name, dstDevice: '', srcIp: packet.srcIp, dstIp: packet.dstIp, detail: `Fwd ${packet.srcIp}→${packet.dstIp} via ${shortIf(ifName, this.brand)} TTL=${packet.ttl}` })
    this.sendFrame(ifName, { srcMac: iface.mac, dstMac, etherType: 0x0800, payload: packet })
  }

  private queuePendingArp(packet: IPv4Packet, ifName: string, targetIp: string): void {
    if (!this.pendingArp.has(targetIp)) { this.pendingArp.set(targetIp, { iface: ifName, packets: [] }); this.sendARPRequest(ifName, targetIp) }
    this.pendingArp.get(targetIp)!.packets.push(packet)
  }

  private sendARPRequest(ifName: string, targetIp: string): void {
    const iface = this.interfaces.get(ifName)
    if (!iface?.ip) return
    this.log({ type: 'arp-req', srcDevice: this.name, dstDevice: '', srcIp: iface.ip, dstIp: targetIp, detail: `ARP Request: who-has ${targetIp}? Tell ${iface.ip}` })
    this.sendFrame(ifName, { srcMac: iface.mac, dstMac: 'ff:ff:ff:ff:ff:ff', etherType: 0x0806, payload: { operation: 1, senderMac: iface.mac, senderIp: iface.ip, targetMac: '00:00:00:00:00:00', targetIp } })
  }

  private sendICMPTTLExceeded(ifName: string, original: IPv4Packet, prevHopMac?: string): void {
    const iface = this.interfaces.get(ifName)
    if (!iface?.ip) return
    const icmp = original.payload as ICMPPacket
    this.log({ type: 'icmp-ttl', srcDevice: this.name, dstDevice: '', srcIp: iface.ip, dstIp: original.srcIp, detail: `TTL exceeded: ${original.srcIp}→${original.dstIp}` })
    const replyIcmp: ICMPPacket = { type: ICMP_TTL_EXCEEDED, code: 0, id: icmp.id ?? 0, sequence: icmp.sequence ?? 0 }
    // Prefer prevHopMac: avoids matching a default route (0.0.0.0/0) that would send
    // the reply in the wrong direction when there's no specific route back to the source.
    if (prevHopMac) {
      const replyPkt: IPv4Packet = { version: 4, ttl: 64, protocol: 1, srcIp: iface.ip, dstIp: original.srcIp, id: Math.floor(Math.random() * 65536), payload: replyIcmp }
      this.forwardPacket(replyPkt, ifName, prevHopMac)
      return
    }
    this.sendIPPacket(original.srcIp, 1, replyIcmp, iface.ip)
  }

  private sendICMPUnreachable(ifName: string, original: IPv4Packet): void {
    const iface = this.interfaces.get(ifName)
    if (!iface?.ip) return
    const icmp = original.payload as ICMPPacket
    this.sendIPPacket(original.srcIp, 1, { type: ICMP_DEST_UNREACHABLE, code: 0, id: icmp.id ?? 0, sequence: icmp.sequence ?? 0 }, iface.ip)
  }

  sendIPPacket(dstIp: string, protocol: number, payload: ICMPPacket, srcIp?: string, ttlOverride?: number): void {
    const route = this.lookupRoute(dstIp)
    if (!route) return
    let ifName = route.interface
    if (!ifName && route.nextHop) { const nr = this.lookupRoute(route.nextHop); if (nr) ifName = nr.interface }
    const outIface = this.interfaces.get(ifName)
    if (!outIface || outIface.status === 'down') return
    const src = srcIp ?? outIface.ip ?? '0.0.0.0'
    const packet: IPv4Packet = { version: 4, ttl: ttlOverride ?? 64, protocol, srcIp: src, dstIp, id: Math.floor(Math.random() * 65536), payload }
    const nextHopIp = route.nextHop || dstIp
    const arpEntry = this.arpTable.get(nextHopIp)
    if (arpEntry) this.forwardPacket(packet, ifName, arpEntry.mac)
    else this.queuePendingArp(packet, ifName, nextHopIp)
  }

  lookupRoute(ip: string): RoutingEntry | null {
    const sorted = [...this.routingTable].sort((a, b) => b.prefixLen - a.prefixLen)
    for (const r of sorted) { if (isInSubnet(ip, r.network, r.prefixLen)) return r }
    return null
  }

  updateConnectedRoutes(): void {
    this.routingTable = this.routingTable.filter(r => r.source !== 'connected')
    for (const [, iface] of this.interfaces) {
      if (iface.ip && iface.prefixLen !== undefined && iface.status === 'up') {
        const net = getNetworkAddress(iface.ip, iface.prefixLen)
        this.routingTable.push({ network: net, prefixLen: iface.prefixLen, nextHop: '', interface: iface.name, metric: 0, source: 'connected' })
      }
    }
    for (const route of this.routingTable) {
      if (route.source === 'static' && !route.interface && route.nextHop) {
        const nr = this.lookupRoute(route.nextHop)
        if (nr) route.interface = nr.interface
      }
    }
  }

  // ─── Ping / Traceroute ───────────────────────────────────────────────────

  async ping(targetIp: string, count = 5): Promise<string[]> {
    return new Promise(resolve => {
      const id = pingIdCounter++
      const state: PingState = { id, count, target: targetIp, sent: 0, results: [], resolve: (lines) => resolve(lines) }
      this.pingStates.set(id, state)
      const sendNext = () => {
        if (state.sent >= count) return
        state.sent++
        this.sendIPPacket(targetIp, 1, { type: ICMP_ECHO_REQUEST, code: 0, id, sequence: state.sent })
        setTimeout(() => { if (state.results.length < state.sent) { state.results.push('.'); this.tryFinishPing(state) } }, 150)
        if (state.sent < count) setTimeout(sendNext, 25)
      }
      sendNext()
    })
  }

  private handlePingReply(state: PingState, _packet: IPv4Packet, icmp: ICMPPacket): void {
    if (icmp.sequence > state.sent) return
    if (icmp.type === ICMP_ECHO_REPLY) state.results.push('!')
    else if (icmp.type === ICMP_TTL_EXCEEDED) state.results.push('T')
    else state.results.push('U')
    this.tryFinishPing(state)
  }

  private tryFinishPing(state: PingState): void { if (state.results.length >= state.count) this.finishPing(state) }

  private finishPing(state: PingState): void {
    if (!this.pingStates.has(state.id)) return
    this.pingStates.delete(state.id)
    const success = state.results.filter(r => r === '!').length
    const total = state.results.length
    const pct = Math.round((success / total) * 100)
    const rtt = success > 0 ? `round-trip min/avg/max = 1/2/4 ms` : ''
    const header = `Type escape sequence to abort.\nSending ${total}, 100-byte ICMP Echos to ${state.target}, timeout is 2 seconds:`
    state.resolve([header, state.results.join(''), `Success rate is ${pct} percent (${success}/${total})${rtt ? ', ' + rtt : ''}`])
  }

  async traceroute(targetIp: string): Promise<string[]> {
    const lines: string[] = [`Tracing route to ${targetIp}`, '']
    for (let ttl = 1; ttl <= 15; ttl++) {
      const hopIp = await this.sendTraceProbe(targetIp, ttl)
      if (!hopIp) lines.push(`  ${ttl}  *  *  *  Request timeout`)
      else { lines.push(`  ${ttl}  ${hopIp}`); if (hopIp === targetIp) break }
    }
    lines.push(''); lines.push('Trace complete.')
    return lines
  }

  private sendTraceProbe(targetIp: string, ttl: number): Promise<string | null> {
    return new Promise(resolve => {
      const id = pingIdCounter++
      let done = false
      let timer: ReturnType<typeof setTimeout>
      const state: PingState = {
        id, count: 1, target: targetIp, sent: 1, results: [], resolve: () => {},
        onReply: (_type, srcIp) => { if (done) return; done = true; clearTimeout(timer); this.pingStates.delete(id); resolve(srcIp) },
      }
      this.pingStates.set(id, state)
      this.sendIPPacket(targetIp, 1, { type: ICMP_ECHO_REQUEST, code: 0, id, sequence: 1 }, undefined, ttl)
      timer = setTimeout(() => { if (done) return; done = true; this.pingStates.delete(id); resolve(null) }, 200)
    })
  }

  // ─── CLI delegation ───────────────────────────────────────────────────────

  executeCommand(raw: string): string[] { return this.cli.execute(raw.trim()) }
  getPrompt(): string { return this.cli.getPrompt() }
  getBanner(): string[] { return this.cli.getBanner() }
  getCompletions(partial: string): string[] { return this.cli.getCompletions(partial) }

  // ─── Shared helpers (used by CLI classes) ────────────────────────────────

  parseIfNames(raw: string): string[] {
    let str = raw.trim()
    if (str.startsWith('range ')) str = str.slice(6).trim()
    const parts = str.split(',').map(s => s.trim()).filter(Boolean)
    const result: string[] = []
    for (const part of parts) {
      const match = part.match(/^(.*?\d+\/)(\d+)\s*-\s*(\d+)$/) || part.match(/^(.*?\/)(\d+)\s*-\s*(\d+)$/)
      if (match) {
        const prefix = match[1]
        const start = parseInt(match[2])
        const end = parseInt(match[3])
        for (let i = start; i <= end; i++) result.push(this.resolveIfName(prefix + i))
      } else {
        result.push(this.resolveIfName(part))
      }
    }
    return [...new Set(result)]
  }

  resolveIfName(raw: string): string {
    if (this.interfaces.has(raw)) return raw
    const lower = raw.toLowerCase()
    for (const key of this.interfaces.keys()) {
      if (key.toLowerCase() === lower) return key
    }
    const expanded = raw
      .replace(/^[Gg]i(\d.*)$/, 'GigabitEthernet$1')
      .replace(/^[Ff]a(\d.*)$/, 'FastEthernet$1')
      .replace(/^[Ss]e(\d.*)$/, 'Serial$1')
      .replace(/^[Ll]o(\d*)$/, 'Loopback$1')
    if (this.interfaces.has(expanded)) return expanded
    for (const key of this.interfaces.keys()) {
      if (key.toLowerCase().startsWith(lower)) return key
    }
    return raw
  }

  ifList(): string {
    return Array.from(this.interfaces.keys()).map(n => shortIf(n, this.brand)).join(', ')
  }

  setIfAddr(args: string, style: string, currentIfs: string[]): string[] {
    const parts = args.split(/\s+/)
    if (parts.length < 2) return ['usage: ip address <ip> <mask|prefix>']
    const ip = parts[0]
    if (!isValidIp(ip)) return [`invalid IP address: ${ip}`]
    let prefixLen: number
    if (style === 'huawei' && !parts[1].includes('.')) {
      prefixLen = parseInt(parts[1])
      if (isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32) return [`invalid prefix length: ${parts[1]}`]
    } else {
      if (!isValidMask(parts[1])) return [`invalid subnet mask: ${parts[1]}`]
      prefixLen = maskToPrefixLen(parts[1])
    }
    for (const cIf of currentIfs) {
      const iface = this.interfaces.get(cIf)!
      iface.ip = ip; iface.prefixLen = prefixLen
    }
    this.updateConnectedRoutes()
    return []
  }

  setIfUp(currentIfs: string[]): string[] {
    for (const cIf of currentIfs) this.interfaces.get(cIf)!.status = 'up'
    this.updateConnectedRoutes()
    return [`%LINK-5-CHANGED: Interface ${currentIfs[0]} (and others), changed state to up`]
  }

  setIfDown(currentIfs: string[]): string[] {
    for (const cIf of currentIfs) this.interfaces.get(cIf)!.status = 'down'
    this.updateConnectedRoutes()
    return [`%LINK-5-CHANGED: Interface ${currentIfs[0]} (and others), changed state to administratively down`]
  }

  addStaticRoute(args: string, style: string): string[] {
    if (style === 'mikrotik') {
      const [cidr, nextHop] = args.split(/\s+/)
      const [net, ps] = (cidr ?? '').split('/')
      const prefixLen = parseInt(ps ?? '0')
      if (!isValidIp(net ?? '') || !isValidIp(nextHop ?? '')) return ['invalid parameters']
      const network = getNetworkAddress(net, prefixLen)
      const iface = this.lookupRoute(nextHop)?.interface ?? ''
      this.routingTable.push({ network, prefixLen, nextHop, interface: iface, metric: 0, source: 'static' })
      return []
    }
    if (style === 'juniper') {
      const m = args.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)\s+next-hop\s+(\d+\.\d+\.\d+\.\d+)$/)
      if (!m) return ['usage: set routing-options static route <ip>/<prefix> next-hop <gw>']
      const network = getNetworkAddress(m[1], parseInt(m[2]))
      const iface = this.lookupRoute(m[3])?.interface ?? ''
      this.routingTable.push({ network, prefixLen: parseInt(m[2]), nextHop: m[3], interface: iface, metric: 5, source: 'static' })
      return []
    }
    if (style === 'huawei') {
      const parts = args.split(/\s+/)
      if (parts.length < 3) return ['usage: ip route-static <dst> <prefix|mask> <nexthop>']
      const [net, maskOrPrefix, nextHop] = parts
      if (!isValidIp(net) || !isValidIp(nextHop)) return ['invalid parameters']
      const prefixLen = maskOrPrefix.includes('.') ? maskToPrefixLen(maskOrPrefix) : parseInt(maskOrPrefix)
      const network = getNetworkAddress(net, prefixLen)
      const iface = this.lookupRoute(nextHop)?.interface ?? ''
      this.routingTable.push({ network, prefixLen, nextHop, interface: iface, metric: 60, source: 'static' })
      return []
    }
    // Cisco / Datacom: <network> <mask> <nexthop>
    const parts = args.split(/\s+/)
    if (parts.length < 3) return ['% usage: ip route <network> <mask> <nexthop>']
    const [net, mask, nextHop] = parts
    if (!isValidIp(net) || !isValidMask(mask) || !isValidIp(nextHop)) return ['% invalid parameters']
    const prefixLen = maskToPrefixLen(mask)
    const network = getNetworkAddress(net, prefixLen)
    const iface = this.lookupRoute(nextHop)?.interface ?? ''
    this.routingTable.push({ network, prefixLen, nextHop, interface: iface, metric: 1, source: 'static' })
    return []
  }

  removeStaticRoute(args: string, style: string): string[] {
    if (style === 'juniper') {
      const m = args.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/)
      if (!m) return ['usage: delete routing-options static route <ip>/<prefix>']
      const network = getNetworkAddress(m[1], parseInt(m[2]))
      this.routingTable = this.routingTable.filter(r => !(r.network === network && r.source === 'static'))
      return []
    }
    if (style === 'huawei') {
      const parts = args.split(/\s+/)
      if (parts.length < 3) return ['usage: undo ip route-static <dst> <prefix|mask> <nexthop>']
      const [net, mp, nextHop] = parts
      const prefixLen = mp.includes('.') ? maskToPrefixLen(mp) : parseInt(mp)
      const network = getNetworkAddress(net, prefixLen)
      this.routingTable = this.routingTable.filter(r => !(r.network === network && r.prefixLen === prefixLen && r.nextHop === nextHop))
      return []
    }
    // Cisco / Datacom
    const parts = args.split(/\s+/)
    if (parts.length < 3) return ['% usage: no ip route <network> <mask> <nexthop>']
    const [net, mask, nextHop] = parts
    const prefixLen = maskToPrefixLen(mask)
    const network = getNetworkAddress(net, prefixLen)
    this.routingTable = this.routingTable.filter(r => !(r.network === network && r.prefixLen === prefixLen && r.nextHop === nextHop))
    return []
  }

  // ─── Protocol helpers ─────────────────────────────────────────────────────

  /** Check if an interface IP falls in any OSPF network statement for a process */
  isInterfaceInOspf(processId: number, _ifName: string, ifIp: string): boolean {
    const proc = this.ospfProcesses.get(processId)
    if (!proc) return false
    for (const net of proc.networks) {
      if (this.ipMatchesWildcard(ifIp, net.ip, net.wildcard)) return true
    }
    return false
  }

  /** Wildcard mask matching (0 bits = must match, 1 bits = don't care) */
  private ipMatchesWildcard(ip: string, network: string, wildcard: string): boolean {
    const ipInt = this.ipToInt(ip)
    const netInt = this.ipToInt(network)
    const wcInt = this.ipToInt(wildcard)
    return (ipInt & ~wcInt) === (netInt & ~wcInt)
  }

  private ipToInt(ip: string): number {
    const p = ip.split('.').map(Number)
    return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0
  }

  /** Simulate a neighbor ID for an interface (invert last octet) */
  private simulateNeighborId(myIp: string): string {
    const parts = myIp.split('.')
    const last = parseInt(parts[3])
    parts[3] = String(last === 1 ? 2 : 1)
    return parts.join('.')
  }

  getOspfNeighbors(processId: number): Array<{neighborId: string, state: string, ifName: string, address: string}> {
    const proc = this.ospfProcesses.get(processId)
    if (!proc) return []
    const result: Array<{neighborId: string, state: string, ifName: string, address: string}> = []
    for (const [ifName, iface] of this.interfaces) {
      if (!iface.ip || iface.status !== 'up') continue
      if (!this.isInterfaceInOspf(processId, ifName, iface.ip)) continue
      const neighborId = this.simulateNeighborId(iface.ip)
      const neighborAddr = this.simulateNeighborId(iface.ip)
      result.push({ neighborId, state: 'FULL', ifName, address: neighborAddr })
    }
    return result
  }

  // ─── Display formatters ───────────────────────────────────────────────────

  fmtRoutes(style: string): string[] {
    const routes = [...this.routingTable].sort((a, b) => b.prefixLen - a.prefixLen)
    if (style === 'cisco') {
      const lines = [
        'Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP',
        '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area',
        '       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2',
        '       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2',
        '       ia - IS-IS inter area, * - candidate default, U - per-user static route',
        '',
      ]
      const defRoute = routes.find(r => r.network === '0.0.0.0' && r.prefixLen === 0)
      if (defRoute) lines.push(`Gateway of last resort is ${defRoute.nextHop} to network 0.0.0.0`)
      else lines.push('Gateway of last resort is not set')
      lines.push('')
      if (!routes.length) return [...lines, '(no routes)']
      for (const r of routes) {
        if (r.source === 'connected') {
          const iface = shortIf(r.interface, 'Cisco')
          lines.push(`C        ${r.network}/${r.prefixLen} is directly connected, ${iface}`)
          const localIp = Array.from(this.interfaces.values()).find(i => {
            if (!i.ip || !i.prefixLen) return false
            return getNetworkAddress(i.ip, i.prefixLen) === r.network && i.prefixLen === r.prefixLen
          })?.ip
          if (localIp) lines.push(`L        ${localIp}/32 is directly connected, ${iface}`)
        } else {
          const isDefault = r.network === '0.0.0.0' && r.prefixLen === 0
          let code: string
          let ad: number
          if (r.source === 'ospf')  { code = isDefault ? 'O*E2' : 'O '; ad = 110 }
          else if (r.source === 'rip')   { code = 'R '; ad = 120 }
          else if (r.source === 'eigrp') { code = 'D '; ad = 90 }
          else if (r.source === 'bgp')   { code = 'B '; ad = 20 }
          else { code = isDefault ? 'S*' : 'S '; ad = r.metric > 1 ? r.metric : 1 }
          const via  = r.nextHop ? ` via ${r.nextHop}` : ''
          const iface = r.interface ? `, ${shortIf(r.interface, 'Cisco')}` : ''
          lines.push(`${code.padEnd(9)}${r.network}/${r.prefixLen} [${ad}/0]${via}${iface}`)
        }
      }
      return lines
    }
    if (style === 'huawei') {
      const lines = ['Route Flags: R - relay, D - download to fib', '', `Destinations: ${routes.length}   Routes: ${routes.length}`, '', 'Destination/Mask    Proto   Pre  Cost  NextHop         Interface']
      for (const r of routes) {
        const proto = r.source === 'connected' ? 'Direct' : 'Static'
        const pre   = r.source === 'connected' ? 0 : 60
        const nh    = r.nextHop || '127.0.0.1'
        lines.push(`${(r.network + '/' + r.prefixLen).padEnd(20)}${proto.padEnd(8)}${String(pre).padEnd(5)}${String(r.metric).padEnd(6)}${nh.padEnd(16)}${shortIf(r.interface, 'Huawei')}`)
      }
      if (!routes.length) lines.push('(empty)')
      return lines
    }
    if (style === 'juniper') {
      const lines = [`inet.0: ${routes.length} destinations, ${routes.length} routes (${routes.length} active, 0 holddown, 0 hidden)`, '']
      for (const r of routes) {
        const proto = r.source === 'connected' ? 'Direct' : 'Static'
        lines.push(`${r.network}/${r.prefixLen} (1 entry, 1 announced)`)
        lines.push(`        *[${proto}/${r.source === 'connected' ? 0 : 5}] ...`)
        if (r.nextHop) lines.push(`                > to ${r.nextHop} via ${r.interface}`)
        else lines.push(`                  Direct, ${r.interface}`)
      }
      if (!routes.length) lines.push('(empty)')
      return lines
    }
    // mikrotik
    const lines = [' # DST-ADDRESS        GATEWAY         INTERFACE  DISTANCE', '']
    routes.forEach((r, i) => {
      const flag = r.source === 'connected' ? 'ADC' : 'AS '
      lines.push(` ${flag} ${String(i).padEnd(2)} ${(r.network + '/' + r.prefixLen).padEnd(20)}${(r.nextHop || 'direct').padEnd(16)}${r.interface.padEnd(11)}${r.metric}`)
    })
    if (!routes.length) lines.push('(empty routing table)')
    return lines
  }

  fmtArp(style: string): string[] {
    const entries = Array.from(this.arpTable.values())
    if (style === 'cisco') {
      const lines = ['Protocol  Address          Hardware Addr       Interface', '']
      for (const e of entries) lines.push(`Internet  ${e.ip.padEnd(17)}${e.mac}  ${shortIf(e.iface, 'Cisco')}`)
      if (!entries.length) lines.push('ARP table empty.')
      return lines
    }
    if (style === 'huawei') {
      const lines = ['IP ADDRESS      MAC ADDRESS     EXPIRE(M) TYPE INTERFACE', '']
      for (const e of entries) lines.push(`${e.ip.padEnd(16)}${e.mac}  ---       D    ${shortIf(e.iface, 'Huawei')}`)
      if (!entries.length) lines.push('(ARP table empty)')
      return lines
    }
    if (style === 'juniper') {
      const lines = ['MAC Address       Address         Interface', '']
      for (const e of entries) lines.push(`${e.mac}  ${e.ip.padEnd(16)}${e.iface}`)
      if (!entries.length) lines.push('(empty)')
      return lines
    }
    // mikrotik
    const lines = ['Flags: P - permanent, A - active', ' #  ADDRESS         MAC-ADDRESS       INTERFACE', '']
    entries.forEach((e, i) => lines.push(` ${String(i).padEnd(3)}${e.ip.padEnd(16)}${e.mac}  ${e.iface}`))
    if (!entries.length) lines.push('(empty)')
    return lines
  }

  fmtIntBrief(style: string): string[] {
    const ifaces = Array.from(this.interfaces.values())
    if (style === 'cisco') {
      const lines = ['Interface              IP-Address      OK? Method Status                Protocol', '']
      for (const f of ifaces) {
        const ip     = f.ip ?? 'unassigned'
        const ok     = f.ip ? 'YES' : 'NO '
        const method = f.ip ? 'manual' : 'unset '
        const status = f.status === 'up' ? 'up                   ' : 'administratively down'
        const proto  = f.status === 'up' ? 'up' : 'down'
        lines.push(`${shortIf(f.name, 'Cisco').padEnd(23)}${ip.padEnd(16)}${ok}  ${method}  ${status} ${proto}`)
      }
      return lines
    }
    if (style === 'huawei') {
      const upCount   = ifaces.filter(i => i.status === 'up').length
      const downCount = ifaces.filter(i => i.status !== 'up').length
      const lines = [
        '*down: administratively down',
        '^down: standby',
        '(l): loopback',
        `The number of interface that is UP in Physical is ${upCount}`,
        `The number of interface that is DOWN in Physical is ${downCount}`,
        '',
        'Interface                         IP Address/Mask      Physical   Protocol',
      ]
      for (const f of ifaces) {
        const ip = f.ip ? `${f.ip}/${f.prefixLen}` : 'unassigned'
        const st = f.status === 'up' ? 'up' : '*down'
        lines.push(`${shortIf(f.name, 'Huawei').padEnd(34)}${ip.padEnd(21)}${st.padEnd(11)}${f.status === 'up' ? 'up' : 'down'}`)
      }
      return lines
    }
    if (style === 'juniper') {
      const lines = ['Interface   Admin Link  Proto  Local']
      for (const f of ifaces) {
        const up = f.status === 'up'
        lines.push(`${f.name.padEnd(12)}up    ${up ? 'up  ' : 'down'}  inet   ${f.ip ? f.ip + '/' + f.prefixLen : '--'}`)
      }
      return lines
    }
    // mikrotik
    const lines = [' #  NAME          MAC-ADDRESS       IP-ADDRESS', '']
    ifaces.forEach((f, i) => {
      const flag = f.status === 'up' ? 'R ' : 'X '
      lines.push(` ${flag}${String(i).padEnd(3)} ${f.name.padEnd(14)}${f.mac}  ${f.ip ? f.ip + '/' + f.prefixLen : ''}`)
    })
    return lines
  }

  fmtIfDetail(style: string): string[] {
    const lines: string[] = []
    for (const f of this.interfaces.values()) {
      if (style === 'cisco') {
        const upStr = f.status === 'up' ? 'up, line protocol is up' : 'administratively down, line protocol is down'
        lines.push(`${f.name} is ${upStr}`)
        lines.push(`  Hardware is CN Gigabit Ethernet, address is ${f.mac} (bia ${f.mac})`)
        if (f.description) lines.push(`  Description: ${f.description}`)
        if (f.ip) lines.push(`  Internet address is ${f.ip}/${f.prefixLen}`)
        lines.push(`  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,`)
        lines.push(`     reliability 255/255, txload 1/255, rxload 1/255`)
        lines.push(`  Encapsulation ARPA, loopback not set`)
        lines.push(`  Keepalive set (10 sec)`)
        lines.push(`  Full Duplex, 1Gbps, media type is RJ45`)
        lines.push(`  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0`)
        lines.push(`  5 minute input rate 0 bits/sec, 0 packets/sec`)
        lines.push(`  5 minute output rate 0 bits/sec, 0 packets/sec`)
        lines.push(`     0 packets input, 0 bytes, 0 no buffer`)
        lines.push(`     0 packets output, 0 bytes, 0 underruns`)
        lines.push('')
      } else if (style === 'huawei') {
        const s = f.status === 'up' ? 'up' : 'down'
        lines.push(`${shortIf(f.name, 'Huawei')} current state: ${s}`)
        lines.push(`Line protocol current state: ${s}`)
        if (f.description) lines.push(`Description: ${f.description}`)
        lines.push(`Route Protocol is: OSPF`)
        lines.push(`The Maximum Transmit Unit is 1500`)
        lines.push(`Internet Address is ${f.ip ? f.ip + '/' + f.prefixLen : 'unassigned'}`)
        lines.push(`IP Sending Frames' Format is PKTFMT_ETHNT_2, Hardware address is ${f.mac}`)
        lines.push(`Last physical up time   : -`)
        lines.push(`Last physical down time : -`)
        lines.push(`Current system time: ${new Date().toTimeString().slice(0,8)}`)
        lines.push(`  Speed: 1000,   Loopback: NONE`)
        lines.push(`  Duplex: FULL,  Negotiation: ENABLE`)
        lines.push(`  Input  bandwidth utilization  :    0%`)
        lines.push(`  Output bandwidth utilization  :    0%`)
        lines.push('')
      } else if (style === 'mikrotik') {
        const flag = f.status === 'up' ? 'R' : 'X'
        lines.push(` ${flag} name="${f.name}" mac-address=${f.mac}${f.ip ? ` address=${f.ip}/${f.prefixLen}` : ''}`)
      }
    }
    return lines
  }

  fmtRunningConfig(): string[] {
    const statics = this.routingTable.filter(r => r.source === 'static')
    const bytes = 800 + this.interfaces.size * 80 + statics.length * 40 + this.ospfProcesses.size * 60
    const now = new Date()
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const lines: string[] = [
      'Building configuration...',
      '',
      `Current configuration : ${bytes} bytes`,
      '!',
      `! Last configuration change at ${now.toTimeString().slice(0,8)} UTC ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      'version 15.7',
      'service timestamps debug datetime msec',
      'service timestamps log datetime msec',
      'no service password-encryption',
      '!',
      `hostname ${this.name}`,
      '!',
    ]
    if (this.domainName) lines.push(`ip domain-name ${this.domainName}`, '!')
    lines.push('boot-start-marker', 'boot-end-marker', '!', 'no aaa new-model', '!', 'ip cef', 'no ipv6 cef', '!')

    // ACLs (numbered)
    for (const [name, entries] of this.accessLists) {
      if (!isNaN(Number(name))) {
        const num = Number(name)
        const type = num <= 99 ? 'standard' : 'extended'
        if (type === 'standard') {
          for (const e of entries)
            lines.push(`access-list ${name} ${e.action} ${e.srcIp}${e.srcWild !== '0.0.0.0' ? ' ' + e.srcWild : ''}`)
        } else {
          for (const e of entries) {
            let line = `access-list ${name} ${e.action} ${e.protocol} ${e.srcIp} ${e.srcWild} ${e.dstIp} ${e.dstWild}`
            if (e.dstPort) line += ` eq ${e.dstPort}`
            lines.push(line)
          }
        }
        lines.push('!')
      }
    }

    // Named ACLs
    for (const [name, entries] of this.accessLists) {
      if (isNaN(Number(name))) {
        const isExt = entries.some(e => e.protocol !== 'ip' || e.dstIp !== 'any')
        lines.push(`ip access-list ${isExt ? 'extended' : 'standard'} ${name}`)
        for (const e of entries) {
          if (isExt) {
            let line = ` ${e.seq} ${e.action} ${e.protocol} ${e.srcIp} ${e.srcWild} ${e.dstIp} ${e.dstWild}`
            if (e.dstPort) line += ` eq ${e.dstPort}`
            lines.push(line)
          } else {
            lines.push(` ${e.seq} ${e.action} ${e.srcIp}${e.srcWild !== '0.0.0.0' ? ' ' + e.srcWild : ''}`)
          }
        }
        lines.push('!')
      }
    }

    // DHCP excluded + pools
    if (this.dhcpExcluded.length) {
      for (const ex of this.dhcpExcluded)
        lines.push(`ip dhcp excluded-address ${ex}`)
      lines.push('!')
    }
    for (const [, pool] of this.dhcpPools) {
      lines.push(`ip dhcp pool ${pool.name}`)
      lines.push(` network ${pool.network} ${prefixLenToMask(pool.prefix)}`)
      if (pool.defaultRouter) lines.push(` default-router ${pool.defaultRouter}`)
      if (pool.dnsServer)     lines.push(` dns-server ${pool.dnsServer}`)
      if (pool.lease !== undefined) lines.push(` lease ${pool.lease}`)
      lines.push('!')
    }

    // NAT pools
    for (const [poolName, pool] of this.natConfig.pools) {
      lines.push(`ip nat pool ${poolName} ${pool.start} ${pool.end} prefix-length ${pool.prefix}`)
    }
    // NAT static
    for (const [local, global] of this.natConfig.staticMappings) {
      lines.push(`ip nat inside source static ${local} ${global}`)
    }
    // NAT overload / pool
    if (this.natConfig.aclRef) {
      if (this.natConfig.overload) {
        lines.push(`ip nat inside source list ${this.natConfig.aclRef} interface (outside) overload`)
      }
    }
    if (this.natConfig.pools.size || this.natConfig.staticMappings.size || this.natConfig.aclRef) lines.push('!')

    // Interfaces
    for (const [, iface] of this.interfaces) {
      lines.push(`interface ${iface.name}`)
      if (iface.description) lines.push(` description ${iface.description}`)
      if (iface.ip)          lines.push(` ip address ${iface.ip} ${prefixLenToMask(iface.prefixLen!)}`)
      if (this.natConfig.insideInterfaces.has(iface.name))  lines.push(' ip nat inside')
      if (this.natConfig.outsideInterfaces.has(iface.name)) lines.push(' ip nat outside')
      lines.push(' duplex auto')
      lines.push(' speed auto')
      lines.push(' media-type rj45')
      lines.push(iface.status === 'up' ? ' no shutdown' : ' shutdown')
      lines.push('!')
    }

    // Static routes
    for (const r of statics)
      lines.push(`ip route ${r.network} ${prefixLenToMask(r.prefixLen)} ${r.nextHop}`)
    if (statics.length) lines.push('!')

    // OSPF
    for (const [, proc] of this.ospfProcesses) {
      lines.push(`router ospf ${proc.processId}`)
      if (proc.routerId) lines.push(` router-id ${proc.routerId}`)
      if (proc.referenceBandwidth) lines.push(` auto-cost reference-bandwidth ${proc.referenceBandwidth}`)
      for (const net of proc.networks)
        lines.push(` network ${net.ip} ${net.wildcard} area ${net.area}`)
      for (const [, area] of proc.areas) {
        if (area.stubArea) lines.push(` area ${area.areaId} stub`)
      }
      if (proc.redistributeConnected) lines.push(` redistribute connected subnets`)
      if (proc.redistributeStatic)    lines.push(` redistribute static subnets`)
      if (proc.defaultInformation)    lines.push(` default-information originate`)
      lines.push('!')
    }

    // RIP
    if (this.ripConfig) {
      const rip = this.ripConfig
      lines.push('router rip')
      lines.push(` version ${rip.version}`)
      for (const n of rip.networks) lines.push(` network ${n}`)
      for (const p of rip.passive)  lines.push(` passive-interface ${p}`)
      if (rip.noAutoSummary)         lines.push(' no auto-summary')
      if (rip.redistributeStatic)   lines.push(' redistribute static')
      if (rip.redistributeConnected) lines.push(' redistribute connected')
      lines.push('!')
    }

    // EIGRP
    for (const [, proc] of this.eigrpProcesses) {
      lines.push(`router eigrp ${proc.asNumber}`)
      for (const n of proc.networks) {
        if (n.wildcard) lines.push(` network ${n.ip} ${n.wildcard}`)
        else            lines.push(` network ${n.ip}`)
      }
      for (const p of proc.passive) lines.push(` passive-interface ${p}`)
      if (proc.noAutoSummary) lines.push(' no auto-summary')
      lines.push('!')
    }

    // BGP
    if (this.bgpConfig) {
      const bgp = this.bgpConfig
      lines.push(`router bgp ${bgp.localAs}`)
      if (bgp.routerId) lines.push(` bgp router-id ${bgp.routerId}`)
      for (const [addr, nbr] of bgp.neighbors) {
        lines.push(` neighbor ${addr} remote-as ${nbr.remoteAs}`)
        if (nbr.description) lines.push(` neighbor ${addr} description ${nbr.description}`)
      }
      for (const net of bgp.networks)
        lines.push(` network ${net.ip} mask ${net.mask}`)
      lines.push('!')
    }

    lines.push('line con 0')
    lines.push(' logging synchronous')
    lines.push('line vty 0 4')
    lines.push(' login')
    lines.push(' transport input all')
    lines.push('!')
    lines.push('end')
    return lines
  }

  // ─── Serialization ────────────────────────────────────────────────────────

  takeSnapshot(id: string): RouterSnapshot {
    return {
      type: 'router',
      id,
      name: this.name,
      brand: this.brand,
      mode: this.cli.mode,
      currentIfs: this.cli.currentIfs,
      interfaces: Array.from(this.interfaces.values()).map(i => ({ ...i })),
      routingTable: this.routingTable.map(r => ({ ...r })),
    }
  }

  restoreState(snap: RouterSnapshot): void {
    this.name = snap.name
    this.cli.mode = snap.mode
    this.cli.currentIfs = snap.currentIfs || []
    this.interfaces.clear()
    for (const iface of snap.interfaces) this.interfaces.set(iface.name, { ...iface })
    this.routingTable = snap.routingTable.filter(r => r.source === 'static')
    this.updateConnectedRoutes()
  }
}
