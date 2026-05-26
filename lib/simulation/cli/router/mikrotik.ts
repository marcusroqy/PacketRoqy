import type { RouterDevice } from '../../devices/router'
import type { RouterBrandCLI } from './base'
import { maskToPrefixLen, prefixLenToMask, isValidIp } from '../../ip-utils'
import { generateMac } from '../../ip-utils'

interface OspfInstance { name: string; routerId?: string; redistribute?: string[] }
interface OspfArea { name: string; areaId: string }
interface OspfNetwork { network: string; area: string }
interface BgpInstance { name: string; as: number; routerId?: string }
interface BgpPeer { name: string; remoteAddress: string; remoteAs: number; disabled?: boolean }
interface FwFilterRule { id: number; chain: string; action: string; protocol?: string; srcAddress?: string; dstAddress?: string; inInterface?: string; outInterface?: string; dstPort?: string; srcPort?: string; connState?: string; comment?: string; disabled?: boolean }
interface FwNatRule { id: number; chain: string; action: string; protocol?: string; srcAddress?: string; dstAddress?: string; dstPort?: string; outInterface?: string; toAddresses?: string; toPorts?: string; comment?: string; disabled?: boolean }
interface DhcpPool { name: string; ranges: string }
interface DhcpServer { name: string; interface: string; addressPool: string; disabled?: boolean }
interface DhcpNetwork { address: string; gateway?: string; dns?: string; domain?: string }
interface IpService { name: string; port: number; disabled: boolean }

export class MikroTikRouterCLI implements RouterBrandCLI {
  mode = 'user'
  currentIfs: string[] = []

  // OSPF
  private ospfInstances: OspfInstance[] = [{ name: 'default' }]
  private ospfAreas: OspfArea[] = [{ name: 'backbone', areaId: '0.0.0.0' }]
  private ospfNetworks: OspfNetwork[] = []

  // BGP
  private bgpInstances: BgpInstance[] = []
  private bgpPeers: BgpPeer[] = []
  private bgpNetworks: string[] = []

  // Firewall
  private fwFilterRules: FwFilterRule[] = [
    { id: 0, chain: 'input', action: 'accept', protocol: 'icmp', comment: 'accept ICMP' },
    { id: 1, chain: 'input', action: 'accept', connState: 'established,related', comment: 'established/related' },
    { id: 2, chain: 'forward', action: 'accept', connState: 'established,related', comment: 'forward established' },
  ]
  private fwNatRules: FwNatRule[] = []
  private fwMangleRules: FwFilterRule[] = []

  // DHCP
  private ipPools: DhcpPool[] = []
  private dhcpServers: DhcpServer[] = []
  private dhcpNetworks: DhcpNetwork[] = []

  // IP Services
  private ipServices: IpService[] = [
    { name: 'telnet', port: 23, disabled: false },
    { name: 'ftp', port: 21, disabled: false },
    { name: 'www', port: 80, disabled: false },
    { name: 'ssh', port: 22, disabled: false },
    { name: 'api', port: 8728, disabled: false },
    { name: 'winbox', port: 8291, disabled: false },
  ]

  constructor(readonly dev: RouterDevice) {}

  getPrompt(): string {
    return `\x1b[34m[admin@${this.dev.name}] >\x1b[0m `
  }

  getBanner(): string[] {
    return [
      '',
      '\x1b[34m  MMM      MMM       KKK                          TTTTTTTTTTT      KKK',
      '  MMMM    MMMM       KKK                          TTTTTTTTTTT      KKK',
      '  MMM MMMM MMM  III  KKK  KKK  RRRRRR    OOOOOO      TTT     III  KKK  KKK',
      '  MMM  MM  MMM  III  KKKKK     RRR  RRR  OOO  OOO    TTT     III  KKKKK',
      '  MMM      MMM  III  KKK KKK   RRRRRR    OOO  OOO    TTT     III  KKK KKK',
      '  MMM      MMM  III  KKK  KKK  RRR  RRR  OOOOOO      TTT     III  KKK  KKK\x1b[0m',
      '\x1b[90m  MikroTik RouterOS 7.9.2 (c) 1999-2023       http://www.mikrotik.com/\x1b[0m',
      '',
      '\x1b[90m  Type \x1b[0m?\x1b[90m for help.\x1b[0m',
      '',
    ]
  }

  execute(cmd: string): string[] {
    const p = this.getPrompt()
    const lo = cmd.trim()

    // IP address
    if (lo === '/ip address print' || lo === '/ip addr print' || lo === '/ip address') return [...this.dev.fmtIntBrief('mikrotik'), p]

    const addrAdd = lo.match(/^\/ip address add\b/)
    if (addrAdd) {
      const addrM = lo.match(/address=(\d+\.\d+\.\d+\.\d+)\/(\d+)/)
      const ifM   = lo.match(/interface=(\S+)/)
      if (!addrM || !ifM) return ['usage: /ip address add address=<ip>/<prefix> interface=<if>', p]
      const ifName = ifM[1]
      if (!this.dev.interfaces.has(ifName)) return [`failure: interface "${ifName}" not found. Available: ${this.dev.ifList()}`, p]
      const iface = this.dev.interfaces.get(ifName)!
      iface.ip = addrM[1]; iface.prefixLen = parseInt(addrM[2]); iface.status = 'up'
      this.dev.updateConnectedRoutes()
      return [p]
    }

    const addrRemove = lo.match(/^\/ip address remove\s+(.+)/)
    if (addrRemove) {
      const addrM = addrRemove[1].match(/address=(\d+\.\d+\.\d+\.\d+)/)
      if (addrM) {
        for (const iface of this.dev.interfaces.values()) {
          if (iface.ip === addrM[1]) { iface.ip = undefined; iface.prefixLen = undefined; this.dev.updateConnectedRoutes(); break }
        }
      }
      return [p]
    }

    const addrSet = lo.match(/^\/ip address set (\d+|(?:\S+=\S+\s*)+)(.*)$/)
    if (addrSet) return [p]

    // IP routes
    if (lo === '/ip route print') return [...this.dev.fmtRoutes('mikrotik'), p]

    const routeAdd = lo.match(/^\/ip route add\b/)
    if (routeAdd) {
      const dstM = lo.match(/dst-address=(\d+\.\d+\.\d+\.\d+)\/(\d+)/)
      const gwM  = lo.match(/gateway=(\d+\.\d+\.\d+\.\d+)/)
      if (!dstM || !gwM) return ['usage: /ip route add dst-address=<ip>/<prefix> gateway=<ip>', p]
      return [...this.dev.addStaticRoute(`${dstM[1]}/${dstM[2]} ${gwM[1]}`, 'mikrotik'), p]
    }

    const routeRemove = lo.match(/^\/ip route remove\s+(\d+)$/)
    if (routeRemove) {
      const idx = parseInt(routeRemove[1])
      const statics = this.dev.routingTable.filter(r => r.source === 'static')
      if (statics[idx]) {
        const r = statics[idx]
        this.dev.routingTable = this.dev.routingTable.filter(rt => !(rt.network === r.network && rt.prefixLen === r.prefixLen && rt.source === 'static'))
      }
      return [p]
    }

    // Interfaces
    if (lo === '/interface print' || lo === '/interface ethernet print') return [...this.dev.fmtIfDetail('mikrotik'), p]
    if (lo === '/arp print') return [...this.dev.fmtArp('mikrotik'), p]

    const ifSet = lo.match(/^\/interface set (\S+) disabled=(yes|no)$/)
    if (ifSet) {
      if (!this.dev.interfaces.has(ifSet[1])) return [`failure: interface "${ifSet[1]}" not found`, p]
      this.dev.interfaces.get(ifSet[1])!.status = ifSet[2] === 'no' ? 'up' : 'down'
      this.dev.updateConnectedRoutes()
      return [p]
    }

    const ifComment = lo.match(/^\/interface comment (\S+) (.+)$/)
    if (ifComment) {
      if (this.dev.interfaces.has(ifComment[1])) this.dev.interfaces.get(ifComment[1])!.description = ifComment[2].replace(/"/g, '')
      return [p]
    }

    const en = lo.match(/^\/interface enable (\S+)$/)
    if (en) {
      if (!this.dev.interfaces.has(en[1])) return [`failure: interface "${en[1]}" not found`, p]
      this.dev.interfaces.get(en[1])!.status = 'up'; this.dev.updateConnectedRoutes(); return [p]
    }
    const dis = lo.match(/^\/interface disable (\S+)$/)
    if (dis) {
      if (!this.dev.interfaces.has(dis[1])) return [`failure: interface "${dis[1]}" not found`, p]
      this.dev.interfaces.get(dis[1])!.status = 'down'; this.dev.updateConnectedRoutes(); return [p]
    }

    // Ping / traceroute
    if (lo.match(/^\/ping /)) return ['__ASYNC_PING__' + lo.slice(6).trim().split(/\s+/)[0]]
    if (lo.match(/^\/tool traceroute /)) return ['__ASYNC_TRACE__' + lo.slice(17).trim()]
    if (lo.match(/^\/tool bandwidth-test /)) {
      return [`  status: done`, `  duration: 0s`, `  tx-current: 0bps`, `  rx-current: 0bps`, p]
    }

    // OSPF
    if (lo.startsWith('/routing ospf')) return [...this.execOspf(lo), p]

    // BGP
    if (lo.startsWith('/routing bgp')) return [...this.execBgp(lo), p]

    // Firewall filter
    if (lo.startsWith('/ip firewall filter')) return [...this.execFwFilter(lo), p]

    // Firewall NAT
    if (lo.startsWith('/ip firewall nat')) return [...this.execFwNat(lo), p]

    // Firewall mangle
    if (lo.startsWith('/ip firewall mangle')) return [...this.execFwMangle(lo), p]

    // DHCP
    if (lo.startsWith('/ip pool')) return [...this.execIpPool(lo), p]
    if (lo.startsWith('/ip dhcp-server network')) return [...this.execDhcpNetwork(lo), p]
    if (lo.startsWith('/ip dhcp-server')) return [...this.execDhcpServer(lo), p]
    if (lo === '/ip dhcp-client print') return [...this.dhcpClientPrint(), p]
    if (lo.match(/^\/ip dhcp-client add\b/)) return [p]

    // DNS
    if (lo === '/ip dns print') return [...this.dnsPrint(), p]
    const dnsSet = lo.match(/^\/ip dns set\b/)
    if (dnsSet) return [p]

    // IP services
    if (lo === '/ip service print') return [...this.servicesPrint(), p]
    const serviceDisable = lo.match(/^\/ip service disable (\S+)$/)
    if (serviceDisable) {
      const svc = this.ipServices.find(s => s.name === serviceDisable[1])
      if (svc) svc.disabled = true
      return [p]
    }
    const serviceEnable = lo.match(/^\/ip service enable (\S+)$/)
    if (serviceEnable) {
      const svc = this.ipServices.find(s => s.name === serviceEnable[1])
      if (svc) svc.disabled = false
      return [p]
    }
    const serviceSet = lo.match(/^\/ip service set (\S+) port=(\d+)$/)
    if (serviceSet) {
      const svc = this.ipServices.find(s => s.name === serviceSet[1])
      if (svc) svc.port = parseInt(serviceSet[2])
      return [p]
    }

    // System
    const sysId = lo.match(/^\/system identity set name=(.+)$/)
    if (sysId) { this.dev.name = sysId[1].trim(); return [p] }
    if (lo === '/system identity print') return [`                name: ${this.dev.name}`, p]

    if (lo === '/system resource print') return [...this.resourcePrint(), p]
    if (lo === '/system clock print') return [...this.clockPrint(), p]
    if (lo === '/log print' || lo === '/log print follow') return [...this.logPrint(), p]
    if (lo === '/system reboot') return ['\x1b[33mReboot requested. (Simulation: state preserved)\x1b[0m', p]

    // Export
    if (lo === '/export' || lo === '/export compact') return [...this.exportConfig(), p]

    if (lo === '?' || lo === 'help') return [...this.helpText(), p]
    return [`bad command name "${lo}" (line 1 column 1)`, p]
  }

  // ─── OSPF ─────────────────────────────────────────────────────────────────

  private execOspf(cmd: string): string[] {
    if (cmd === '/routing ospf instance print') return this.ospfInstancePrint()
    if (cmd === '/routing ospf area print') return this.ospfAreaPrint()
    if (cmd === '/routing ospf network print') return this.ospfNetworkPrint()
    if (cmd === '/routing ospf neighbor print') return this.ospfNeighborPrint()

    const instAdd = cmd.match(/^\/routing ospf instance add\b/)
    if (instAdd) {
      const nameM = cmd.match(/name=(\S+)/), ridM = cmd.match(/router-id=(\S+)/)
      const name = nameM ? nameM[1] : `ospf${this.ospfInstances.length}`
      if (!this.ospfInstances.find(i => i.name === name)) {
        const inst: OspfInstance = { name }
        if (ridM) inst.routerId = ridM[1]
        this.ospfInstances.push(inst)
      }
      this.syncOspfToDevice()
      return []
    }

    const instSet = cmd.match(/^\/routing ospf instance set (\S+)\b(.*)$/)
    if (instSet) {
      const inst = this.ospfInstances.find(i => i.name === instSet[1]) ?? this.ospfInstances[0]
      if (inst) {
        const ridM = instSet[2].match(/router-id=(\S+)/)
        if (ridM) inst.routerId = ridM[1]
        this.syncOspfToDevice()
      }
      return []
    }

    const instRemove = cmd.match(/^\/routing ospf instance remove (\S+)$/)
    if (instRemove) {
      this.ospfInstances = this.ospfInstances.filter(i => i.name !== instRemove[1])
      if (this.ospfInstances.length === 0) this.dev.ospfProcesses.clear()
      return []
    }

    const areaAdd = cmd.match(/^\/routing ospf area add\b/)
    if (areaAdd) {
      const nameM = cmd.match(/name=(\S+)/), areaIdM = cmd.match(/area-id=(\S+)/)
      if (nameM && areaIdM) {
        if (!this.ospfAreas.find(a => a.name === nameM[1]))
          this.ospfAreas.push({ name: nameM[1], areaId: areaIdM[1] })
      }
      return []
    }

    const netAdd = cmd.match(/^\/routing ospf network add\b/)
    if (netAdd) {
      const netM = cmd.match(/network=(\S+)/), areaM = cmd.match(/area=(\S+)/)
      if (netM && areaM) {
        if (!this.ospfNetworks.find(n => n.network === netM[1]))
          this.ospfNetworks.push({ network: netM[1], area: areaM[1] })
        this.syncOspfToDevice()
      } else return ['usage: /routing ospf network add network=<ip>/<prefix> area=<area-name>']
      return []
    }

    const netRemove = cmd.match(/^\/routing ospf network remove (\d+)$/)
    if (netRemove) {
      const idx = parseInt(netRemove[1])
      if (this.ospfNetworks[idx]) this.ospfNetworks.splice(idx, 1)
      this.syncOspfToDevice()
      return []
    }

    return [`failure: unknown ospf command: ${cmd}`]
  }

  private ospfInstancePrint(): string[] {
    const lines = [`Flags: X - disabled`, ` #   NAME        ROUTER-ID  REDISTRIBUTE  METRIC-TYPE`]
    this.ospfInstances.forEach((inst, i) => {
      lines.push(` ${String(i).padEnd(5)}${inst.name.padEnd(12)}${(inst.routerId ?? '').padEnd(11)}${(inst.redistribute?.join(',') ?? '').padEnd(14)}2`)
    })
    return lines
  }

  private ospfAreaPrint(): string[] {
    const lines = [` #   NAME           AREA-ID      TYPE     AUTHENTICATION`]
    this.ospfAreas.forEach((area, i) => {
      lines.push(` ${String(i).padEnd(5)}${area.name.padEnd(15)}${area.areaId.padEnd(13)}default  none`)
    })
    return lines
  }

  private ospfNetworkPrint(): string[] {
    const lines = [` #   NETWORK         AREA`]
    this.ospfNetworks.forEach((net, i) => {
      lines.push(` ${String(i).padEnd(5)}${net.network.padEnd(16)}${net.area}`)
    })
    if (!this.ospfNetworks.length) lines.push(' (empty)')
    return lines
  }

  private ospfNeighborPrint(): string[] {
    if (this.ospfNetworks.length === 0) return ['(OSPF not configured — add networks first)']
    const neighbors = this.dev.getOspfNeighbors(1)
    const lines = [` #   ADDRESS         INTERFACE      STATE       PRIORITY  ROUTER-ID`]
    neighbors.forEach((n, i) => {
      lines.push(` ${String(i).padEnd(5)}${n.neighborId.padEnd(16)}${n.ifName.padEnd(15)}${n.state.padEnd(12)}1         ${n.neighborId}`)
    })
    if (!neighbors.length) lines.push(' (no OSPF neighbors)')
    return lines
  }

  private syncOspfToDevice(): void {
    const inst = this.ospfInstances[0]
    if (!inst) return
    const pid = 1
    const networks = this.ospfNetworks.map(n => {
      const [ip, pfxStr] = n.network.split('/')
      const prefix = parseInt(pfxStr ?? '24')
      const wild = prefixLenToMask(prefix).split('.').map(o => String(255 - parseInt(o))).join('.')
      const areaObj = this.ospfAreas.find(a => a.name === n.area)
      const areaNum = areaObj ? parseInt(areaObj.areaId.split('.').pop() ?? '0') || 0 : 0
      return { ip, wildcard: wild, area: areaNum }
    })
    const existing = this.dev.ospfProcesses.get(pid)
    if (existing) { existing.networks = networks; if (inst.routerId) existing.routerId = inst.routerId }
    else this.dev.ospfProcesses.set(pid, { processId: pid, areas: new Map(), networks, redistributeConnected: false, redistributeStatic: false, defaultInformation: false, routerId: inst.routerId })
  }

  // ─── BGP ──────────────────────────────────────────────────────────────────

  private execBgp(cmd: string): string[] {
    if (cmd === '/routing bgp instance print') return this.bgpInstancePrint()
    if (cmd === '/routing bgp peer print') return this.bgpPeerPrint()
    if (cmd === '/routing bgp network print') return this.bgpNetworkPrint()
    if (cmd === '/routing bgp advertisements print') return this.bgpAdvPrint()

    const instAdd = cmd.match(/^\/routing bgp instance add\b/)
    if (instAdd) {
      const nameM = cmd.match(/name=(\S+)/), asM = cmd.match(/as=(\d+)/), ridM = cmd.match(/router-id=(\S+)/)
      if (!asM) return ['usage: /routing bgp instance add name=<name> as=<as-number> [router-id=<ip>]']
      const name = nameM ? nameM[1] : 'default'
      if (!this.bgpInstances.find(i => i.name === name)) {
        this.bgpInstances.push({ name, as: parseInt(asM[1]), routerId: ridM?.[1] })
        if (!this.dev.bgpConfig) this.dev.bgpConfig = { localAs: parseInt(asM[1]), neighbors: new Map(), networks: [] }
        else this.dev.bgpConfig.localAs = parseInt(asM[1])
        if (ridM) this.dev.bgpConfig.routerId = ridM[1]
      }
      return []
    }

    const instSet = cmd.match(/^\/routing bgp instance set (\S+)\b(.*)$/)
    if (instSet) {
      const inst = this.bgpInstances.find(i => i.name === instSet[1])
      if (inst) {
        const asM = instSet[2].match(/as=(\d+)/), ridM = instSet[2].match(/router-id=(\S+)/)
        if (asM) { inst.as = parseInt(asM[1]); if (this.dev.bgpConfig) this.dev.bgpConfig.localAs = inst.as }
        if (ridM) { inst.routerId = ridM[1]; if (this.dev.bgpConfig) this.dev.bgpConfig.routerId = ridM[1] }
      }
      return []
    }

    const peerAdd = cmd.match(/^\/routing bgp peer add\b/)
    if (peerAdd) {
      const nameM = cmd.match(/name=(\S+)/), remAddrM = cmd.match(/remote-address=(\S+)/), remAsM = cmd.match(/remote-as=(\d+)/)
      if (!remAddrM || !remAsM) return ['usage: /routing bgp peer add name=<name> remote-address=<ip> remote-as=<as>']
      const name = nameM ? nameM[1] : `peer${this.bgpPeers.length}`
      const peer: BgpPeer = { name, remoteAddress: remAddrM[1], remoteAs: parseInt(remAsM[1]) }
      this.bgpPeers.push(peer)
      const instAs = this.bgpInstances[0]?.as ?? 65000
      if (!this.dev.bgpConfig) this.dev.bgpConfig = { localAs: instAs, neighbors: new Map(), networks: [] }
      this.dev.bgpConfig.neighbors.set(remAddrM[1], { remoteAs: parseInt(remAsM[1]) })
      return []
    }

    const peerRemove = cmd.match(/^\/routing bgp peer remove (\d+)$/)
    if (peerRemove) {
      const idx = parseInt(peerRemove[1])
      if (this.bgpPeers[idx]) {
        this.dev.bgpConfig?.neighbors.delete(this.bgpPeers[idx].remoteAddress)
        this.bgpPeers.splice(idx, 1)
      }
      return []
    }

    const peerDisable = cmd.match(/^\/routing bgp peer disable (\d+)$/)
    if (peerDisable) { const idx = parseInt(peerDisable[1]); if (this.bgpPeers[idx]) this.bgpPeers[idx].disabled = true; return [] }

    const peerEnable = cmd.match(/^\/routing bgp peer enable (\d+)$/)
    if (peerEnable) { const idx = parseInt(peerEnable[1]); if (this.bgpPeers[idx]) this.bgpPeers[idx].disabled = false; return [] }

    const netAdd = cmd.match(/^\/routing bgp network add network=(\S+)$/)
    if (netAdd) {
      if (!this.bgpNetworks.includes(netAdd[1])) this.bgpNetworks.push(netAdd[1])
      if (this.dev.bgpConfig) {
        const [ip, pfxStr] = netAdd[1].split('/')
        this.dev.bgpConfig.networks.push({ ip, mask: prefixLenToMask(parseInt(pfxStr ?? '24')) })
      }
      return []
    }

    return [`failure: unknown bgp command: ${cmd}`]
  }

  private bgpInstancePrint(): string[] {
    const lines = [` #   NAME        AS    ROUTER-ID  REDISTRIBUTE`]
    this.bgpInstances.forEach((inst, i) => {
      lines.push(` ${String(i).padEnd(5)}${inst.name.padEnd(12)}${String(inst.as).padEnd(6)}${(inst.routerId ?? '').padEnd(11)}`)
    })
    if (!this.bgpInstances.length) lines.push(' (empty — use /routing bgp instance add)')
    return lines
  }

  private bgpPeerPrint(): string[] {
    const lines = [`Flags: X - disabled, E - established`, ` #    NAME            INSTANCE  REMOTE-ADDRESS  REMOTE-AS  STATE`]
    this.bgpPeers.forEach((peer, i) => {
      const flags = peer.disabled ? 'X ' : 'E '
      const state = peer.disabled ? 'Idle' : 'Established'
      lines.push(` ${flags}${String(i).padEnd(5)}${peer.name.padEnd(16)}${(this.bgpInstances[0]?.name ?? 'default').padEnd(10)}${peer.remoteAddress.padEnd(16)}${String(peer.remoteAs).padEnd(11)}${state}`)
    })
    if (!this.bgpPeers.length) lines.push(' (empty — use /routing bgp peer add)')
    return lines
  }

  private bgpNetworkPrint(): string[] {
    const lines = [` #   NETWORK`]
    this.bgpNetworks.forEach((net, i) => lines.push(` ${String(i).padEnd(5)}${net}`))
    if (!this.bgpNetworks.length) lines.push(' (empty)')
    return lines
  }

  private bgpAdvPrint(): string[] {
    const lines = [`Flags: * - best`, ` #   NETWORK         NEXTHOP         LOCAL-PREF  MED  AS-PATH`]
    this.bgpNetworks.forEach((net, i) => {
      const localIp = this.guessRouterId()
      lines.push(` *   ${net.padEnd(16)}${localIp.padEnd(16)}100         0`)
    })
    if (!this.bgpNetworks.length) lines.push(' (no advertised networks)')
    return lines
  }

  // ─── Firewall filter ──────────────────────────────────────────────────────

  private execFwFilter(cmd: string): string[] {
    if (cmd === '/ip firewall filter print') return this.fwFilterPrint()

    const add = cmd.match(/^\/ip firewall filter add\b/)
    if (add) {
      const rule: FwFilterRule = { id: this.fwFilterRules.length, chain: 'forward', action: 'accept' }
      const chainM = cmd.match(/chain=(\S+)/), actionM = cmd.match(/action=(\S+)/)
      if (!chainM || !actionM) return ['usage: /ip firewall filter add chain=<chain> action=<action> [protocol=<proto>] [src-address=<ip>] [dst-address=<ip>] [in-interface=<if>] [out-interface=<if>] [dst-port=<port>] [connection-state=<state>]']
      rule.chain = chainM[1]; rule.action = actionM[1]
      const protoM = cmd.match(/protocol=(\S+)/)
      const srcM = cmd.match(/src-address=(\S+)/)
      const dstM = cmd.match(/dst-address=(\S+)/)
      const inIfM = cmd.match(/in-interface=(\S+)/)
      const outIfM = cmd.match(/out-interface=(\S+)/)
      const dstPortM = cmd.match(/dst-port=(\S+)/)
      const srcPortM = cmd.match(/src-port=(\S+)/)
      const connM = cmd.match(/connection-state=(\S+)/)
      const commentM = cmd.match(/comment=([^=\s]+(?:\s+[^=\s]+)*?)(?:\s+\S+=|$)/)
      if (protoM)  rule.protocol = protoM[1]
      if (srcM)    rule.srcAddress = srcM[1]
      if (dstM)    rule.dstAddress = dstM[1]
      if (inIfM)   rule.inInterface = inIfM[1]
      if (outIfM)  rule.outInterface = outIfM[1]
      if (dstPortM) rule.dstPort = dstPortM[1]
      if (srcPortM) rule.srcPort = srcPortM[1]
      if (connM)   rule.connState = connM[1]
      if (commentM) rule.comment = commentM[1].replace(/"/g, '')
      rule.id = this.fwFilterRules.length
      this.fwFilterRules.push(rule)
      return []
    }

    const remove = cmd.match(/^\/ip firewall filter remove (\d+)$/)
    if (remove) { const idx = parseInt(remove[1]); if (idx < this.fwFilterRules.length) this.fwFilterRules.splice(idx, 1); return [] }

    const disable = cmd.match(/^\/ip firewall filter disable (\d+)$/)
    if (disable) { const idx = parseInt(disable[1]); if (this.fwFilterRules[idx]) this.fwFilterRules[idx].disabled = true; return [] }

    const enable = cmd.match(/^\/ip firewall filter enable (\d+)$/)
    if (enable) { const idx = parseInt(enable[1]); if (this.fwFilterRules[idx]) this.fwFilterRules[idx].disabled = false; return [] }

    const move = cmd.match(/^\/ip firewall filter move (\d+) destination=(\d+)$/)
    if (move) {
      const from = parseInt(move[1]), to = parseInt(move[2])
      if (this.fwFilterRules[from] && to < this.fwFilterRules.length) {
        const [rule] = this.fwFilterRules.splice(from, 1)
        this.fwFilterRules.splice(to, 0, rule)
      }
      return []
    }

    return [`failure: unknown firewall filter command`]
  }

  private fwFilterPrint(): string[] {
    const lines = ['Flags: X - disabled, I - invalid, D - dynamic']
    this.fwFilterRules.forEach((r, i) => {
      const flags = r.disabled ? 'X ' : '  '
      let desc = ` ${flags}${String(i).padEnd(4)} chain=${r.chain} action=${r.action}`
      if (r.protocol)    desc += ` protocol=${r.protocol}`
      if (r.srcAddress)  desc += ` src-address=${r.srcAddress}`
      if (r.dstAddress)  desc += ` dst-address=${r.dstAddress}`
      if (r.inInterface) desc += ` in-interface=${r.inInterface}`
      if (r.outInterface) desc += ` out-interface=${r.outInterface}`
      if (r.dstPort)     desc += ` dst-port=${r.dstPort}`
      if (r.srcPort)     desc += ` src-port=${r.srcPort}`
      if (r.connState)   desc += ` connection-state=${r.connState}`
      if (r.comment)     desc += ` \x1b[90m;;; ${r.comment}\x1b[0m`
      lines.push(desc)
    })
    return lines
  }

  // ─── Firewall NAT ─────────────────────────────────────────────────────────

  private execFwNat(cmd: string): string[] {
    if (cmd === '/ip firewall nat print') return this.fwNatPrint()

    const add = cmd.match(/^\/ip firewall nat add\b/)
    if (add) {
      const chainM = cmd.match(/chain=(\S+)/), actionM = cmd.match(/action=(\S+)/)
      if (!chainM || !actionM) return ['usage: /ip firewall nat add chain=srcnat|dstnat action=<action> [protocol=<proto>] [src-address=<ip>] [dst-address=<ip>] [out-interface=<if>] [to-addresses=<ip>] [to-ports=<port>]']
      const rule: FwNatRule = { id: this.fwNatRules.length, chain: chainM[1], action: actionM[1] }
      const protoM = cmd.match(/protocol=(\S+)/), srcM = cmd.match(/src-address=(\S+)/)
      const dstM = cmd.match(/dst-address=(\S+)/), outIfM = cmd.match(/out-interface=(\S+)/)
      const toAddrM = cmd.match(/to-addresses=(\S+)/), toPortsM = cmd.match(/to-ports=(\S+)/)
      const dstPortM = cmd.match(/dst-port=(\S+)/)
      if (protoM) rule.protocol = protoM[1]
      if (srcM)   rule.srcAddress = srcM[1]
      if (dstM)   rule.dstAddress = dstM[1]
      if (outIfM) rule.outInterface = outIfM[1]
      if (toAddrM) rule.toAddresses = toAddrM[1]
      if (toPortsM) rule.toPorts = toPortsM[1]
      if (dstPortM) rule.dstPort = dstPortM[1]
      rule.id = this.fwNatRules.length
      this.fwNatRules.push(rule)
      return []
    }

    const remove = cmd.match(/^\/ip firewall nat remove (\d+)$/)
    if (remove) { const idx = parseInt(remove[1]); if (idx < this.fwNatRules.length) this.fwNatRules.splice(idx, 1); return [] }

    return []
  }

  private fwNatPrint(): string[] {
    const lines = ['Flags: X - disabled, I - invalid, D - dynamic']
    this.fwNatRules.forEach((r, i) => {
      let desc = `   ${String(i).padEnd(4)} chain=${r.chain} action=${r.action}`
      if (r.protocol)    desc += ` protocol=${r.protocol}`
      if (r.srcAddress)  desc += ` src-address=${r.srcAddress}`
      if (r.dstAddress)  desc += ` dst-address=${r.dstAddress}`
      if (r.outInterface) desc += ` out-interface=${r.outInterface}`
      if (r.dstPort)     desc += ` dst-port=${r.dstPort}`
      if (r.toAddresses) desc += ` to-addresses=${r.toAddresses}`
      if (r.toPorts)     desc += ` to-ports=${r.toPorts}`
      if (r.comment)     desc += ` \x1b[90m;;; ${r.comment}\x1b[0m`
      lines.push(desc)
    })
    if (!this.fwNatRules.length) lines.push('(empty)')
    return lines
  }

  // ─── Firewall mangle ──────────────────────────────────────────────────────

  private execFwMangle(cmd: string): string[] {
    if (cmd === '/ip firewall mangle print') return ['(no mangle rules)']
    if (cmd.startsWith('/ip firewall mangle add')) return []
    return []
  }

  // ─── IP Pool ──────────────────────────────────────────────────────────────

  private execIpPool(cmd: string): string[] {
    if (cmd === '/ip pool print') {
      const lines = [` #   NAME             RANGES`]
      this.ipPools.forEach((pool, i) => lines.push(` ${String(i).padEnd(5)}${pool.name.padEnd(17)}${pool.ranges}`))
      if (!this.ipPools.length) lines.push(' (empty)')
      return lines
    }

    const add = cmd.match(/^\/ip pool add\b/)
    if (add) {
      const nameM = cmd.match(/name=(\S+)/), rangesM = cmd.match(/ranges=(\S+)/)
      if (!nameM || !rangesM) return ['usage: /ip pool add name=<name> ranges=<start-ip>-<end-ip>']
      if (!this.ipPools.find(p => p.name === nameM[1]))
        this.ipPools.push({ name: nameM[1], ranges: rangesM[1] })
      return []
    }

    const remove = cmd.match(/^\/ip pool remove (\d+)$/)
    if (remove) { const idx = parseInt(remove[1]); if (this.ipPools[idx]) this.ipPools.splice(idx, 1); return [] }

    return [`failure: unknown ip pool command`]
  }

  // ─── DHCP server ──────────────────────────────────────────────────────────

  private execDhcpServer(cmd: string): string[] {
    if (cmd === '/ip dhcp-server print') {
      const lines = [`Flags: X - disabled, I - invalid`, ` #   NAME      INTERFACE    ADDRESS-POOL  LEASE-TIME  STATUS`]
      this.dhcpServers.forEach((s, i) => {
        const flags = s.disabled ? 'X ' : '  '
        lines.push(` ${flags}${String(i).padEnd(4)} ${s.name.padEnd(10)}${s.interface.padEnd(13)}${s.addressPool.padEnd(14)}00:30:00    running`)
      })
      if (!this.dhcpServers.length) lines.push(' (empty — use /ip dhcp-server add)')
      return lines
    }

    if (cmd === '/ip dhcp-server lease print') {
      const lines = [` #   ADDRESS    MAC-ADDRESS        HOST-NAME  SERVER    STATUS`]
      lines.push(' (no static leases)')
      return lines
    }

    const add = cmd.match(/^\/ip dhcp-server add\b/)
    if (add) {
      const nameM = cmd.match(/name=(\S+)/), ifM = cmd.match(/interface=(\S+)/), poolM = cmd.match(/address-pool=(\S+)/)
      if (!ifM) return ['usage: /ip dhcp-server add name=<name> interface=<if> address-pool=<pool>']
      const name = nameM ? nameM[1] : `dhcp${this.dhcpServers.length}`
      if (!this.dhcpServers.find(s => s.name === name))
        this.dhcpServers.push({ name, interface: ifM[1], addressPool: poolM ? poolM[1] : '' })
      return []
    }

    const enable = cmd.match(/^\/ip dhcp-server enable (\d+)$/)
    if (enable) { const idx = parseInt(enable[1]); if (this.dhcpServers[idx]) this.dhcpServers[idx].disabled = false; return [] }

    const disable = cmd.match(/^\/ip dhcp-server disable (\d+)$/)
    if (disable) { const idx = parseInt(disable[1]); if (this.dhcpServers[idx]) this.dhcpServers[idx].disabled = true; return [] }

    const remove = cmd.match(/^\/ip dhcp-server remove (\d+)$/)
    if (remove) { const idx = parseInt(remove[1]); if (this.dhcpServers[idx]) this.dhcpServers.splice(idx, 1); return [] }

    return [`failure: unknown dhcp-server command`]
  }

  private execDhcpNetwork(cmd: string): string[] {
    if (cmd === '/ip dhcp-server network print') {
      const lines = [` #   ADDRESS        GATEWAY         DNS-SERVER      DOMAIN`]
      this.dhcpNetworks.forEach((n, i) => {
        lines.push(` ${String(i).padEnd(5)}${n.address.padEnd(15)}${(n.gateway ?? '').padEnd(16)}${(n.dns ?? '').padEnd(16)}${n.domain ?? ''}`)
      })
      if (!this.dhcpNetworks.length) lines.push(' (empty)')
      return lines
    }

    const add = cmd.match(/^\/ip dhcp-server network add\b/)
    if (add) {
      const addrM = cmd.match(/address=(\S+)/), gwM = cmd.match(/gateway=(\S+)/)
      const dnsM = cmd.match(/dns-server=(\S+)/), domainM = cmd.match(/domain=(\S+)/)
      if (!addrM) return ['usage: /ip dhcp-server network add address=<ip>/<prefix> [gateway=<ip>] [dns-server=<ip>] [domain=<name>]']
      const net: DhcpNetwork = { address: addrM[1] }
      if (gwM)     net.gateway = gwM[1]
      if (dnsM)    net.dns = dnsM[1]
      if (domainM) net.domain = domainM[1]
      this.dhcpNetworks.push(net)
      return []
    }

    const remove = cmd.match(/^\/ip dhcp-server network remove (\d+)$/)
    if (remove) { const idx = parseInt(remove[1]); if (this.dhcpNetworks[idx]) this.dhcpNetworks.splice(idx, 1); return [] }

    return [`failure: unknown dhcp-server network command`]
  }

  private dhcpClientPrint(): string[] {
    const lines = [' # INTERFACE    USE-PEER-DNS ADD-DEFAULT-ROUTE STATUS', '']
    Array.from(this.dev.interfaces.keys()).forEach((ifn, i) => {
      const iface = this.dev.interfaces.get(ifn)!
      const status = iface.ip ? 'bound' : 'searching'
      lines.push(` ${String(i).padEnd(2)}${ifn.padEnd(16)} yes          yes               ${status}`)
    })
    return lines
  }

  // ─── DNS ──────────────────────────────────────────────────────────────────

  private dnsPrint(): string[] {
    return [
      `           servers: 8.8.8.8,8.8.4.4`,
      `  dynamic-servers: `,
      `   use-doh-server: `,
      `        verify-doh-cert: no`,
      `  allow-remote-requests: no`,
      `    max-udp-packet-size: 4096`,
      `   query-server-timeout: 2s`,
      `      query-total-timeout: 10s`,
      `   max-concurrent-queries: 100`,
      `max-concurrent-tcp-sessions: 20`,
      `        cache-size: 2048KiB`,
      `     cache-max-ttl: 1w`,
      `          cache-used: 10KiB`,
    ]
  }

  private servicesPrint(): string[] {
    const lines = [` #   NAME     PORT   CERTIFICATE  AVAILABLE-FROM  TLS-VERSION  STATUS`]
    this.ipServices.forEach((svc, i) => {
      const flags = svc.disabled ? 'X ' : '  '
      lines.push(` ${flags}${String(i).padEnd(4)} ${svc.name.padEnd(9)}${String(svc.port).padEnd(7)}             (all)`)
    })
    return lines
  }

  // ─── System ───────────────────────────────────────────────────────────────

  private resourcePrint(): string[] {
    return [
      `                   uptime: 0d 0h 0m 0s`,
      `                  version: 7.9.2 (stable)`,
      `               build-time: Jan/01/2024 00:00:00`,
      `              factory-software: 7.9`,
      `         free-memory: 384.0MiB`,
      `        total-memory: 512.0MiB`,
      `               cpu: ARMv7`,
      `         cpu-count: 4`,
      `     cpu-frequency: 800MHz`,
      `           cpu-load: 0%`,
      `     free-hdd-space: 472.0MiB`,
      `    total-hdd-space: 512.0MiB`,
      `  write-sect-since-reboot: 0`,
      `         write-sect-total: 0`,
      `        bad-blocks: 0`,
      `     architecture-name: arm`,
      `           board-name: ${this.dev.name}`,
      `             platform: MikroTik`,
    ]
  }

  private clockPrint(): string[] {
    const now = new Date()
    return [
      `   time: ${now.toTimeString().slice(0, 8)}`,
      `   date: ${now.toLocaleDateString('en-US', {month:'short', day:'2-digit', year:'numeric'}).replace(/,/, '')}`,
      `  time-zone-autodetect: yes`,
      `       time-zone-name: UTC`,
      `             gmt-offset: +00:00`,
      `             dst-active: no`,
    ]
  }

  private logPrint(): string[] {
    const ts = new Date().toTimeString().slice(0, 8)
    return [
      `${ts} system,info router started`,
      `${ts} system,info,account user admin logged in from 127.0.0.1 via local`,
      `${ts} ospf,info ospf instance default started`,
    ]
  }

  private exportConfig(): string[] {
    const lines = [
      '# RouterOS export',
      `# ${new Date().toISOString().slice(0, 19)}`,
      `/ip address`,
    ]
    for (const iface of this.dev.interfaces.values()) {
      if (iface.ip) lines.push(`add address=${iface.ip}/${iface.prefixLen} interface=${iface.name}${iface.description ? ' comment="' + iface.description + '"' : ''}`)
    }
    lines.push('/ip route')
    for (const r of this.dev.routingTable.filter(s => s.source === 'static')) {
      lines.push(`add dst-address=${r.network}/${r.prefixLen} gateway=${r.nextHop}`)
    }
    if (this.ospfNetworks.length) {
      lines.push('/routing ospf instance')
      for (const inst of this.ospfInstances) lines.push(`add name=${inst.name}${inst.routerId ? ' router-id=' + inst.routerId : ''}`)
      lines.push('/routing ospf area')
      for (const area of this.ospfAreas) lines.push(`add name=${area.name} area-id=${area.areaId}`)
      lines.push('/routing ospf network')
      for (const net of this.ospfNetworks) lines.push(`add network=${net.network} area=${net.area}`)
    }
    if (this.bgpPeers.length) {
      lines.push('/routing bgp instance')
      for (const inst of this.bgpInstances) lines.push(`add name=${inst.name} as=${inst.as}${inst.routerId ? ' router-id=' + inst.routerId : ''}`)
      lines.push('/routing bgp peer')
      for (const peer of this.bgpPeers) lines.push(`add name=${peer.name} remote-address=${peer.remoteAddress} remote-as=${peer.remoteAs}`)
    }
    if (this.fwNatRules.length) {
      lines.push('/ip firewall nat')
      for (const r of this.fwNatRules) {
        let rule = `add chain=${r.chain} action=${r.action}`
        if (r.protocol)    rule += ` protocol=${r.protocol}`
        if (r.srcAddress)  rule += ` src-address=${r.srcAddress}`
        if (r.outInterface) rule += ` out-interface=${r.outInterface}`
        if (r.toAddresses) rule += ` to-addresses=${r.toAddresses}`
        lines.push(rule)
      }
    }
    if (this.ipPools.length) {
      lines.push('/ip pool')
      for (const pool of this.ipPools) lines.push(`add name=${pool.name} ranges=${pool.ranges}`)
    }
    if (this.dhcpServers.length) {
      lines.push('/ip dhcp-server')
      for (const s of this.dhcpServers) lines.push(`add name=${s.name} interface=${s.interface} address-pool=${s.addressPool}`)
      lines.push('/ip dhcp-server network')
      for (const n of this.dhcpNetworks) lines.push(`add address=${n.address}${n.gateway ? ' gateway=' + n.gateway : ''}${n.dns ? ' dns-server=' + n.dns : ''}`)
    }
    lines.push('/system identity')
    lines.push(`set name=${this.dev.name}`)
    return lines
  }

  private helpText(): string[] {
    return [
      '  /ip address print',
      '  /ip address add address=<ip>/<prefix> interface=<if>',
      '  /ip address remove address=<ip>',
      '  /ip route print',
      '  /ip route add dst-address=<ip>/<prefix> gateway=<ip>',
      '  /ip route remove <id>',
      '  /interface print',
      '  /interface set <if> disabled=yes|no',
      '  /interface comment <if> <text>',
      '  /arp print',
      '  /routing ospf instance print',
      '  /routing ospf instance add name=<name> [router-id=<ip>]',
      '  /routing ospf area print',
      '  /routing ospf area add name=<name> area-id=<X.X.X.X>',
      '  /routing ospf network print',
      '  /routing ospf network add network=<ip>/<prefix> area=<area-name>',
      '  /routing ospf neighbor print',
      '  /routing bgp instance print',
      '  /routing bgp instance add name=<name> as=<as> [router-id=<ip>]',
      '  /routing bgp peer print',
      '  /routing bgp peer add name=<name> remote-address=<ip> remote-as=<as>',
      '  /routing bgp network add network=<ip>/<prefix>',
      '  /ip firewall filter print',
      '  /ip firewall filter add chain=input|forward|output action=accept|drop [protocol=tcp|udp|icmp] [src-address=<ip>] [dst-port=<port>] [connection-state=established,related]',
      '  /ip firewall filter remove <id>',
      '  /ip firewall filter disable <id> / enable <id>',
      '  /ip firewall nat print',
      '  /ip firewall nat add chain=srcnat action=masquerade out-interface=<if>',
      '  /ip firewall nat add chain=dstnat action=dst-nat protocol=tcp dst-port=<port> to-addresses=<ip> to-ports=<port>',
      '  /ip firewall nat remove <id>',
      '  /ip pool print',
      '  /ip pool add name=<name> ranges=<start>-<end>',
      '  /ip dhcp-server print',
      '  /ip dhcp-server add name=<name> interface=<if> address-pool=<pool>',
      '  /ip dhcp-server network print',
      '  /ip dhcp-server network add address=<ip>/<prefix> gateway=<ip> [dns-server=<ip>]',
      '  /ip dhcp-server lease print',
      '  /ip dhcp-client print',
      '  /ip dns print',
      '  /ip dns set servers=8.8.8.8,8.8.4.4',
      '  /ip service print',
      '  /ip service disable|enable <name>',
      '  /ping <ip> [count=N]',
      '  /tool traceroute <ip>',
      '  /tool bandwidth-test <ip>',
      '  /system identity print',
      '  /system identity set name=<name>',
      '  /system resource print',
      '  /system clock print',
      '  /log print',
      '  /system reboot',
      '  /export',
    ]
  }

  private guessRouterId(): string {
    for (const [, iface] of this.dev.interfaces) { if (iface.ip && iface.status === 'up') return iface.ip }
    for (const [, iface] of this.dev.interfaces) { if (iface.ip) return iface.ip }
    return '0.0.0.0'
  }

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    const ifs = Array.from(this.dev.interfaces.keys())
    const pool = [
      '/ip address print', '/ip address add ', '/ip address remove ',
      '/ip route print', '/ip route add ',
      '/interface print', '/arp print',
      '/routing ospf instance print', '/routing ospf instance add ',
      '/routing ospf area print', '/routing ospf area add ',
      '/routing ospf network print', '/routing ospf network add ',
      '/routing ospf neighbor print',
      '/routing bgp instance print', '/routing bgp instance add ',
      '/routing bgp peer print', '/routing bgp peer add ',
      '/routing bgp network add ', '/routing bgp network print',
      '/ip firewall filter print', '/ip firewall filter add ',
      '/ip firewall filter remove ', '/ip firewall filter disable ', '/ip firewall filter enable ',
      '/ip firewall nat print', '/ip firewall nat add ',
      '/ip firewall nat remove ',
      '/ip firewall mangle print',
      '/ip pool print', '/ip pool add ',
      '/ip dhcp-server print', '/ip dhcp-server add ',
      '/ip dhcp-server network print', '/ip dhcp-server network add ',
      '/ip dhcp-server lease print',
      '/ip dhcp-client print',
      '/ip dns print', '/ip dns set ',
      '/ip service print', '/ip service disable ', '/ip service enable ',
      '/ping ', '/tool traceroute ', '/tool bandwidth-test ',
      '/system identity print', '/system identity set name=',
      '/system resource print', '/system clock print',
      '/log print', '/system reboot',
      '/export',
      ...ifs.map(n => '/interface set ' + n + ' disabled=yes'),
      ...ifs.map(n => '/interface set ' + n + ' disabled=no'),
      ...ifs.map(n => '/interface enable ' + n),
      ...ifs.map(n => '/interface disable ' + n),
    ]
    return pool.filter(c => c.toLowerCase().startsWith(lo))
  }
}
