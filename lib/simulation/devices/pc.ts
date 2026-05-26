import { BaseDevice } from '../engine'
import type { EthernetFrame, IPv4Packet, ARPPacket, ICMPPacket, NetworkInterface, PCSnapshot } from '../types'
import { ICMP_ECHO_REPLY, ICMP_ECHO_REQUEST, ICMP_TTL_EXCEEDED, ICMP_DEST_UNREACHABLE } from '../types'
import { generateMac, isValidIp, isValidMask, maskToPrefixLen, getNetworkAddress, prefixLenToMask, isInSubnet } from '../ip-utils'

interface PingState {
  id: number; count: number; target: string; sent: number; results: string[]
  resolve: (lines: string[]) => void
  onReply?: (type: number, srcIp: string) => void
}

let pingIdCounter = 100

// Brands that use macOS CLI
const MACOS_BRANDS = new Set(['Apple'])
// Brands that use Linux CLI (servers)
const LINUX_BRANDS = new Set(['Dell', 'HP', 'IBM', 'Cisco'])

export class PCDevice extends BaseDevice {
  brand: string
  subtype: 'pc' | 'server'
  iface: NetworkInterface
  gateway?: string
  arpTable: Map<string, { mac: string }> = new Map()

  private pendingArp: Map<string, IPv4Packet[]> = new Map()
  private pingStates: Map<number, PingState>    = new Map()

  constructor(id: string, name: string, brand = 'Dell', subtype: 'pc' | 'server' = 'pc') {
    super(id, subtype, name)
    this.brand   = brand
    this.subtype = subtype
    this.iface   = { name: 'eth0', mac: generateMac(), status: 'up' }
  }

  // ─── Frame / packet handling (unchanged) ─────────────────────────────────

  receiveFrame(_ifName: string, frame: EthernetFrame): void {
    if (frame.etherType === 0x0806) {
      this.handleARP(frame.payload as ARPPacket)
    } else if (frame.etherType === 0x0800) {
      if (frame.dstMac !== this.iface.mac && frame.dstMac !== 'ff:ff:ff:ff:ff:ff') return
      this.handleIP(frame.payload as IPv4Packet)
    }
  }

  private handleARP(arp: ARPPacket): void {
    this.arpTable.set(arp.senderIp, { mac: arp.senderMac })
    if (arp.operation === 1 && arp.targetIp === this.iface.ip) {
      this.log({ type: 'arp-reply', srcDevice: this.name, dstDevice: '', srcIp: this.iface.ip!, dstIp: arp.senderIp, detail: `ARP Reply: ${this.iface.ip} is at ${this.iface.mac}` })
      this.sendFrame('eth0', { srcMac: this.iface.mac, dstMac: arp.senderMac, etherType: 0x0806, payload: { operation: 2, senderMac: this.iface.mac, senderIp: this.iface.ip!, targetMac: arp.senderMac, targetIp: arp.senderIp } })
    } else if (arp.operation === 2) {
      const pending = this.pendingArp.get(arp.senderIp)
      if (pending) { for (const pkt of pending) this.sendIPPacket(pkt, arp.senderMac); this.pendingArp.delete(arp.senderIp) }
    }
  }

  private handleIP(packet: IPv4Packet): void {
    if (packet.dstIp !== this.iface.ip) return
    if (packet.protocol !== 1) return
    const icmp = packet.payload as ICMPPacket
    if (icmp.type === ICMP_ECHO_REQUEST) {
      this.log({ type: 'icmp-req', srcDevice: '', dstDevice: this.name, srcIp: packet.srcIp, dstIp: packet.dstIp, detail: `ICMP Echo Request seq=${icmp.sequence}` })
      this.dispatchIP(packet.srcIp, { type: ICMP_ECHO_REPLY, code: 0, id: icmp.id, sequence: icmp.sequence })
    } else if (icmp.type === ICMP_ECHO_REPLY || icmp.type === ICMP_TTL_EXCEEDED || icmp.type === ICMP_DEST_UNREACHABLE) {
      this.log({ type: icmp.type === 0 ? 'icmp-reply' : 'icmp-ttl', srcDevice: packet.srcIp, dstDevice: this.name, srcIp: packet.srcIp, detail: `ICMP type=${icmp.type} id=${icmp.id} seq=${icmp.sequence}` })
      const state = this.pingStates.get(icmp.id)
      if (state) {
        if (state.onReply) state.onReply(icmp.type, packet.srcIp)
        else this.handlePingReply(state, icmp, packet.srcIp)
      }
    }
  }

  private dispatchIP(dstIp: string, icmp: ICMPPacket, ttl = 64): void {
    if (!this.iface.ip || !this.iface.prefixLen) return
    const net = getNetworkAddress(this.iface.ip, this.iface.prefixLen)
    const isLocal = isInSubnet(dstIp, net, this.iface.prefixLen)
    const nextHop = isLocal ? dstIp : (this.gateway ?? dstIp)
    const packet: IPv4Packet = { version: 4, ttl, protocol: 1, srcIp: this.iface.ip, dstIp, id: Math.floor(Math.random() * 65536), payload: icmp }
    const cached = this.arpTable.get(nextHop)
    if (cached) { this.sendIPPacket(packet, cached.mac) }
    else {
      const isNew = !this.pendingArp.has(nextHop)
      if (isNew) this.pendingArp.set(nextHop, [])
      this.pendingArp.get(nextHop)!.push(packet)
      if (isNew) this.sendARPRequest(nextHop)
    }
  }

  private sendIPPacket(packet: IPv4Packet, dstMac: string): void {
    this.log({ type: 'ip-fwd', srcDevice: this.name, dstDevice: '', srcIp: packet.srcIp, dstIp: packet.dstIp, detail: `Sending ${packet.srcIp} -> ${packet.dstIp}` })
    this.sendFrame('eth0', { srcMac: this.iface.mac, dstMac, etherType: 0x0800, payload: packet })
  }

  private sendARPRequest(targetIp: string): void {
    if (!this.iface.ip) return
    this.log({ type: 'arp-req', srcDevice: this.name, dstDevice: '', srcIp: this.iface.ip, dstIp: targetIp, detail: `ARP Request: who has ${targetIp}? Tell ${this.iface.ip}` })
    this.sendFrame('eth0', { srcMac: this.iface.mac, dstMac: 'ff:ff:ff:ff:ff:ff', etherType: 0x0806, payload: { operation: 1, senderMac: this.iface.mac, senderIp: this.iface.ip, targetMac: '00:00:00:00:00:00', targetIp } })
  }

  async ping(targetIp: string, count = 4): Promise<string[]> {
    return new Promise(resolve => {
      const id = pingIdCounter++
      const state: PingState = { id, count, target: targetIp, sent: 0, results: [], resolve: (l) => resolve(l) }
      this.pingStates.set(id, state)
      const sendNext = () => {
        if (state.sent >= count) return
        state.sent++
        this.dispatchIP(targetIp, { type: ICMP_ECHO_REQUEST, code: 0, id, sequence: state.sent })
        setTimeout(() => { if (state.results.length < state.sent) { state.results.push('Request timed out.'); if (state.results.length >= state.count) this.finishPing(state) } }, 120)
        if (state.sent < count) setTimeout(sendNext, 25)
      }
      sendNext()
    })
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
      this.dispatchIP(targetIp, { type: ICMP_ECHO_REQUEST, code: 0, id, sequence: 1 }, ttl)
      timer = setTimeout(() => { if (done) return; done = true; this.pingStates.delete(id); resolve(null) }, 150)
    })
  }

  async traceroute(targetIp: string): Promise<string[]> {
    const hops: string[] = []
    for (let ttl = 1; ttl <= 15; ttl++) {
      const hopIp = await this.sendTraceProbe(targetIp, ttl)
      if (this.isLinux()) {
        hops.push(hopIp ? ` ${ttl}  ${hopIp}  ${(1 + Math.random() * 3).toFixed(3)} ms` : ` ${ttl}  * * *`)
      } else if (this.isMacOS()) {
        hops.push(hopIp ? ` ${ttl}  ${hopIp}  ${(1 + Math.random() * 3).toFixed(3)} ms` : ` ${ttl}  * * *`)
      } else {
        const ms = `${Math.floor(1 + Math.random() * 3)} ms`
        hops.push(hopIp
          ? `  ${String(ttl).padEnd(3)}  ${ms.padEnd(9)}${ms.padEnd(9)}${ms.padEnd(9)}${hopIp}`
          : `  ${String(ttl).padEnd(3)}  *        *        *        Request timed out.`)
      }
      if (hopIp === targetIp) break
    }
    if (this.isLinux()) return [`traceroute to ${targetIp} (${targetIp}), 15 hops max, 60 byte packets`, ...hops]
    if (this.isMacOS()) return [`traceroute to ${targetIp} (${targetIp}), 15 hops max, 40 byte packets`, ...hops]
    return [`Tracing route to ${targetIp} over a maximum of 15 hops:`, '', ...hops, '', 'Trace complete.']
  }

  private handlePingReply(state: PingState, icmp: ICMPPacket, srcIp: string): void {
    if (icmp.sequence > state.sent) return
    if (icmp.type === ICMP_ECHO_REPLY)    state.results.push(`Reply from ${srcIp}: bytes=32 time<1ms TTL=64`)
    else if (icmp.type === ICMP_TTL_EXCEEDED) state.results.push(`Reply from ${srcIp}: TTL expired in transit.`)
    else                                  state.results.push(`Destination unreachable.`)
    if (state.results.length >= state.count) this.finishPing(state)
  }

  private finishPing(state: PingState): void {
    this.pingStates.delete(state.id)
    const success = state.results.filter(r => r.startsWith('Reply from')).length
    const total   = state.results.length
    if (this.isLinux()) {
      // Linux ping output
      state.resolve([
        `PING ${state.target} (${state.target}) 56(84) bytes of data.`,
        ...state.results.map((r, i) => r.startsWith('Reply from')
          ? `64 bytes from ${state.target}: icmp_seq=${i + 1} ttl=64 time=${(0.15 + Math.random() * 0.5).toFixed(3)} ms`
          : `Request timeout for icmp_seq ${i + 1}`),
        '',
        `--- ${state.target} ping statistics ---`,
        `${total} packets transmitted, ${success} received, ${Math.round(((total - success) / total) * 100)}% packet loss, time ${(total - 1) * 1000 + 100}ms`,
        success > 0 ? `rtt min/avg/max/mdev = 0.150/0.301/0.512/0.089 ms` : '',
      ].filter(l => l !== ''))
    } else if (this.isMacOS()) {
      state.resolve([
        `PING ${state.target}: 56 data bytes`,
        ...state.results.map((r, i) => r.startsWith('Reply from')
          ? `64 bytes from ${state.target}: icmp_seq=${i} ttl=64 time=${(0.12 + Math.random() * 0.3).toFixed(3)} ms`
          : `Request timeout for icmp_seq ${i}`),
        '',
        `--- ${state.target} ping statistics ---`,
        `${total} packets transmitted, ${success} packets received, ${Math.round(((total - success) / total) * 100)}% packet loss`,
        success > 0 ? `round-trip min/avg/max/stddev = 0.120/0.255/0.421/0.089 ms` : '',
      ].filter(l => l !== ''))
    } else {
      // Windows
      state.resolve([
        `Pinging ${state.target} with 32 bytes of data:`,
        ...state.results.map(r => r.startsWith('Reply from')
          ? `Reply from ${state.target}: bytes=32 time<1ms TTL=64`
          : `Request timed out.`),
        '',
        `Ping statistics for ${state.target}:`,
        `    Packets: Sent = ${total}, Received = ${success}, Lost = ${total - success} (${Math.round(((total - success) / total) * 100)}% loss),`,
        success > 0 ? `Approximate round trip times in milli-seconds:` : '',
        success > 0 ? `    Minimum = 0ms, Maximum = 1ms, Average = 0ms` : '',
      ].filter(l => l !== ''))
    }
  }

  private isLinux(): boolean  { return this.subtype === 'server' || LINUX_BRANDS.has(this.brand) }
  private isMacOS(): boolean  { return MACOS_BRANDS.has(this.brand) }
  private isWindows(): boolean { return !this.isLinux() && !this.isMacOS() }

  // ─── CLI entry point ─────────────────────────────────────────────────────

  executeCommand(raw: string): string[] {
    if (this.isLinux())   return this.execLinux(raw.trim())
    if (this.isMacOS())   return this.execMacOS(raw.trim())
    return this.execWindows(raw.trim())
  }

  private prompt(): string {
    if (this.isLinux())  return `\x1b[32m[root@${this.name} ~]#\x1b[0m `
    if (this.isMacOS())  return `\x1b[34m${this.name}@mac ~ %\x1b[0m `
    return `\x1b[37mC:\\Users\\User>\x1b[0m `
  }

  getPrompt(): string { return this.prompt() }

  getBanner(): string[] {
    if (this.isLinux()) {
      return [
        `\x1b[90mDebian GNU/Linux 12 ${this.name} tty1\x1b[0m`,
        '',
        `${this.name} login: \x1b[37mroot\x1b[0m`,
        '\x1b[90mLast login: Mon Jan  1 00:00:00 2024\x1b[0m',
        '',
      ]
    }
    if (this.isMacOS()) {
      return [
        '',
        `\x1b[34mWelcome to macOS — ${this.name}\x1b[0m`,
        '\x1b[90mLast login: Mon Jan  1 00:00:00 on ttys000\x1b[0m',
        '',
      ]
    }
    return [
      '\x1b[37mMicrosoft Windows [Version 10.0.19045.3803]\x1b[0m',
      '\x1b[90m(c) Microsoft Corporation. All rights reserved.\x1b[0m',
      '',
    ]
  }

  // ─── Windows CLI (Dell, HP, Lenovo) ──────────────────────────────────────

  private execWindows(cmd: string): string[] {
    // Internal config shortcut
    if (cmd.startsWith('ip ')) return [...this.setIpCisco(cmd.slice(3).trim()), this.prompt()]

    if (cmd === 'ipconfig') {
      if (!this.iface.ip) return ['Windows IP Configuration', '', 'Ethernet adapter Ethernet:', '   Media State . . . . : Media disconnected', this.prompt()]
      return [
        'Windows IP Configuration', '',
        'Ethernet adapter Ethernet:',
        `   Connection-specific DNS Suffix  . :`,
        `   IPv4 Address. . . . . . . . . . : ${this.iface.ip}`,
        `   Subnet Mask . . . . . . . . . . : ${prefixLenToMask(this.iface.prefixLen!)}`,
        `   Default Gateway . . . . . . . . : ${this.gateway ?? ''}`,
        this.prompt(),
      ]
    }

    if (cmd === 'ipconfig /all') {
      return [
        'Windows IP Configuration', `   Host Name . . . . . : ${this.name}`, '',
        'Ethernet adapter Ethernet:',
        `   Physical Address. . . . . . . . : ${this.iface.mac.toUpperCase()}`,
        `   DHCP Enabled. . . . . . . . . . : No`,
        this.iface.ip
          ? [`   IPv4 Address. . . . . . . . . . : ${this.iface.ip}`,
             `   Subnet Mask . . . . . . . . . . : ${prefixLenToMask(this.iface.prefixLen!)}`,
             `   Default Gateway . . . . . . . . : ${this.gateway ?? ''}`].join('\n')
          : '   Media State . . . . : Media disconnected',
        this.prompt(),
      ]
    }

    if (cmd.startsWith('ping ')) {
      const target = cmd.slice(5).trim()
      if (!isValidIp(target)) return [`Ping request could not find host ${target}. Please check the name and try again.`, this.prompt()]
      if (!this.iface.ip) return ['PING: transmit failed. General failure.', this.prompt()]
      return ['__ASYNC_PING__' + target]
    }

    if (cmd.startsWith('tracert ')) {
      const target = cmd.slice(8).trim()
      if (!isValidIp(target)) return [`Unable to resolve target system name ${target}.`, this.prompt()]
      if (!this.iface.ip) return ['Unable to contact IP driver. General failure.', this.prompt()]
      return ['__ASYNC_TRACE__' + target]
    }

    if (cmd === 'route print' || cmd === 'netstat -r') {
      const lines = ['IPv4 Route Table', '='  .repeat(60), 'Interface List', `  1...${this.iface.mac.toUpperCase()} ......Ethernet`, '', 'Active Routes:', 'Network Destination   Netmask         Gateway         Interface  Metric']
      if (this.iface.ip && this.iface.prefixLen) {
        const net = getNetworkAddress(this.iface.ip, this.iface.prefixLen)
        lines.push(`${net.padEnd(22)}${prefixLenToMask(this.iface.prefixLen).padEnd(16)}On-link         ${this.iface.ip.padEnd(11)}261`)
      }
      if (this.gateway) lines.push(`${'0.0.0.0'.padEnd(22)}${'0.0.0.0'.padEnd(16)}${this.gateway.padEnd(16)}${(this.iface.ip ?? '').padEnd(11)}261`)
      return [...lines, this.prompt()]
    }

    if (cmd === 'arp -a') {
      const lines = [`Interface: ${this.iface.ip ?? '?'} --- 0x1`, '  Internet Address      Physical Address      Type']
      for (const [ip, { mac }] of this.arpTable) lines.push(`  ${ip.padEnd(22)}${mac.toUpperCase().padEnd(22)}dynamic`)
      if (!this.arpTable.size) lines.push('  (ARP table empty)')
      return [...lines, this.prompt()]
    }

    if (cmd.startsWith('netsh interface ip set address')) {
      // netsh interface ip set address "Ethernet" static <ip> <mask> [gw]
      const m = cmd.match(/static\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)(?:\s+(\d+\.\d+\.\d+\.\d+))?/)
      if (!m) return ['Usage: netsh interface ip set address "Ethernet" static <ip> <mask> [gateway]', this.prompt()]
      if (!isValidIp(m[1]) || !isValidMask(m[2])) return ['Invalid IP or mask.', this.prompt()]
      this.iface.ip = m[1]; this.iface.prefixLen = maskToPrefixLen(m[2])
      if (m[3] && isValidIp(m[3])) this.gateway = m[3]
      return [this.prompt()]
    }

    if (cmd === 'netstat -an' || cmd === 'netstat -b' || cmd === 'netstat -ano') {
      const lines = [
        '',
        'Active Connections',
        '',
        '  Proto  Local Address          Foreign Address        State',
        `  TCP    ${(this.iface.ip ?? '0.0.0.0') + ':22'} 0.0.0.0:0              LISTENING`,
        `  TCP    127.0.0.1:49152        0.0.0.0:0              LISTENING`,
      ]
      return [...lines, this.prompt()]
    }

    if (cmd === 'netsh interface ip show config' || cmd === 'netsh int ip show config') {
      return [
        'Configuration for interface "Ethernet"',
        `    DHCP enabled:                         No`,
        `    IP Address:                           ${this.iface.ip ?? '(none)'}`,
        `    Subnet Prefix:                        ${this.iface.ip ? `${this.iface.ip}/${this.iface.prefixLen}` : '(none)'}`,
        `    Default Gateway:                      ${this.gateway ?? '(none)'}`,
        `    Gateway Metric:                       0`,
        `    InterfaceMetric:                      25`,
        this.prompt(),
      ]
    }

    if (cmd.startsWith('nslookup ')) {
      const target = cmd.slice(9).trim()
      if (isValidIp(target)) return [
        `Server:  PacketRoqy-DNS`,
        `Address:  8.8.8.8`,
        '',
        `Name:    host.${target.split('.').reverse().join('.')}.in-addr.arpa`,
        `Address:  ${target}`,
        this.prompt(),
      ]
      return [
        `Server:  PacketRoqy-DNS`,
        `Address:  8.8.8.8`,
        '',
        `*** PacketRoqy-DNS can't find ${target}: Non-existent domain`,
        this.prompt(),
      ]
    }

    if (cmd === 'systeminfo') {
      return [
        `Host Name:                 ${this.name.toUpperCase()}`,
        `OS Name:                   Microsoft Windows 11 Pro`,
        `OS Version:                10.0.22631 N/A Build 22631`,
        `System Type:               x64-based PC`,
        `Total Physical Memory:     16,384 MB`,
        `Available Physical Memory: 8,192 MB`,
        `Network Card(s):           1 NIC(s) Installed.`,
        `  [01]: Intel(R) Ethernet Connection`,
        `        Connection Name: Ethernet`,
        `        DHCP Enabled:    No`,
        `        IP address(es)`,
        `        [01]: ${this.iface.ip ?? 'Not configured'}`,
        this.prompt(),
      ]
    }

    if (cmd === 'hostname') return [this.name, this.prompt()]
    if (cmd === 'whoami') return [`${this.name}\\User`, this.prompt()]
    if (cmd === 'date') { const n = new Date(); return [n.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' }), this.prompt()] }
    if (cmd === 'cls' || cmd === 'clear') return ['\x1b[2J\x1b[H', this.prompt()]
    if (cmd === 'ipconfig /flushdns') return ['\nWindows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.', this.prompt()]
    if (cmd === 'ipconfig /release') return ['\nWindows IP Configuration\n\nNo operation can be performed on Ethernet while it has its media disconnected.', this.prompt()]
    if (cmd === 'ipconfig /renew') return ['\nWindows IP Configuration\n\nNo operation can be performed on Ethernet while it has its media disconnected.', this.prompt()]

    if (cmd === '?' || cmd === 'help') return [
      '\x1b[1m\x1b[36m── Network ──────────────────────────────────────────────────────\x1b[0m',
      '  \x1b[32mipconfig\x1b[0m              Show IP configuration',
      '  \x1b[32mipconfig /all\x1b[0m         Full network info',
      '  \x1b[32mping\x1b[0m <ip>             Ping destination',
      '  \x1b[32mtracert\x1b[0m <ip>          Traceroute',
      '  \x1b[32mroute print\x1b[0m           Routing table',
      '  \x1b[32marp -a\x1b[0m                ARP cache',
      '  \x1b[32mnetstat -an\x1b[0m           Active connections',
      '  \x1b[32mnslookup\x1b[0m <ip>         DNS lookup',
      '  \x1b[32mnetsh interface ip set address\x1b[0m "Ethernet" static <ip> <mask> [gw]',
      '  \x1b[32mnetsh interface ip show config\x1b[0m',
      '\x1b[1m\x1b[36m── System ───────────────────────────────────────────────────────\x1b[0m',
      '  \x1b[32msysteminfo\x1b[0m            System information',
      '  \x1b[32mhostname\x1b[0m              Computer name',
      '  \x1b[32mwhoami\x1b[0m                Current user',
      '  \x1b[32mdate\x1b[0m                  Current date',
      '  \x1b[32mcls\x1b[0m                   Clear screen',
      '  \x1b[32mip\x1b[0m <addr> <mask> [gw]  Quick IP config',
      this.prompt(),
    ]
    return [`'${cmd}' is not recognized as a command. Type ? for help.`, this.prompt()]
  }

  // ─── macOS CLI (Apple) ────────────────────────────────────────────────────

  private execMacOS(cmd: string): string[] {
    if (cmd.startsWith('ip ')) return [...this.setIpCisco(cmd.slice(3).trim()), this.prompt()]

    if (cmd === 'ifconfig' || cmd === 'ifconfig en0') {
      const lines = [
        'lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384',
        '  inet 127.0.0.1 netmask 0xff000000',
        '',
        'en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500',
        `  ether ${this.iface.mac}`,
      ]
      if (this.iface.ip) {
        lines.push(`  inet ${this.iface.ip} netmask ${prefixLenToMask(this.iface.prefixLen!)}${this.gateway ? ` broadcast ${this.iface.ip.replace(/\.\d+$/, '.255')}` : ''}`)
        lines.push('  status: active')
      } else {
        lines.push('  status: inactive')
      }
      return [...lines, this.prompt()]
    }

    // ifconfig en0 <ip> netmask <mask>
    const ifcfg = cmd.match(/^ifconfig en0 (\d+\.\d+\.\d+\.\d+) netmask (\d+\.\d+\.\d+\.\d+)(?:\s+(\d+\.\d+\.\d+\.\d+))?$/)
    if (ifcfg) {
      if (!isValidIp(ifcfg[1]) || !isValidMask(ifcfg[2])) return ['ifconfig: bad address', this.prompt()]
      this.iface.ip = ifcfg[1]; this.iface.prefixLen = maskToPrefixLen(ifcfg[2])
      if (ifcfg[3] && isValidIp(ifcfg[3])) this.gateway = ifcfg[3]
      return [this.prompt()]
    }

    if (cmd.startsWith('ping ')) {
      const target = cmd.slice(5).trim().split(/\s/)[0]
      if (!isValidIp(target)) return [`ping: cannot resolve ${target}: Name or service not known`, this.prompt()]
      if (!this.iface.ip) return [`ping: sendto: No route to host`, this.prompt()]
      return ['__ASYNC_PING__' + target]
    }

    if (cmd.startsWith('traceroute ')) {
      const target = cmd.slice(11).trim()
      if (!isValidIp(target)) return [`traceroute: cannot resolve ${target}`, this.prompt()]
      if (!this.iface.ip) return [`traceroute: No route to host`, this.prompt()]
      return ['__ASYNC_TRACE__' + target]
    }

    if (cmd === 'netstat -rn' || cmd === 'netstat -r') {
      const lines = ['Routing tables', '', 'Internet:', 'Destination        Gateway            Flags  Netif Expire']
      if (this.iface.ip && this.iface.prefixLen) {
        const net = getNetworkAddress(this.iface.ip, this.iface.prefixLen)
        lines.push(`${(net + '/' + this.iface.prefixLen).padEnd(19)}${this.iface.ip.padEnd(19)}UCS    en0`)
      }
      if (this.gateway) lines.push(`default            ${this.gateway.padEnd(19)}UGSc   en0`)
      return [...lines, this.prompt()]
    }

    if (cmd === 'arp -a') {
      const lines = []
      for (const [ip, { mac }] of this.arpTable) lines.push(`? (${ip}) at ${mac} on en0 ifscope [ethernet]`)
      if (!lines.length) lines.push('(ARP table empty)')
      return [...lines, this.prompt()]
    }

    if (cmd === 'networksetup -listallhardwareports') {
      return [
        'Hardware Port: Ethernet',
        'Device: en0',
        `Ethernet Address: ${this.iface.mac}`,
        '',
        'Hardware Port: Wi-Fi',
        'Device: en1',
        'Ethernet Address: 00:00:00:00:00:00',
        this.prompt(),
      ]
    }

    if (cmd === 'networksetup -getinfo Ethernet' || cmd === 'networksetup -getinfo en0') {
      return [
        'DHCP Configuration',
        `IP address: ${this.iface.ip ?? 'none'}`,
        `Subnet mask: ${this.iface.prefixLen != null ? prefixLenToMask(this.iface.prefixLen) : 'none'}`,
        `Router: ${this.gateway ?? 'none'}`,
        `Client ID: `,
        `IPv6: Automatic`,
        `IPv6 IP address: none`,
        this.prompt(),
      ]
    }

    if (cmd === 'scutil --dns') {
      return [
        'DNS configuration',
        '',
        'resolver #1',
        '  nameserver[0] : 8.8.8.8',
        '  nameserver[1] : 1.1.1.1',
        '  flags    : Request A records',
        '  reach    : 0x00030002 (Reachable,Local Address,Directly Reachable Address)',
        this.prompt(),
      ]
    }

    if (cmd === 'netstat -an' || cmd === 'netstat -anp') {
      const lines = [
        'Active Internet connections (including servers)',
        'Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)',
        `tcp4       0      0  ${this.iface.ip ?? '*.*.*.0'}.22      *.*                    LISTEN`,
        'tcp6       0      0  *.22                   *.*                    LISTEN',
      ]
      return [...lines, this.prompt()]
    }

    if (cmd === 'ps aux' || cmd === 'ps -ef') {
      return [
        'USER               PID  %CPU %MEM      VSZ    RSS   TT  STAT STARTED      TIME COMMAND',
        `root                 1   0.0  0.1   411920   5120   ??  Ss    0:00.01 /sbin/launchd`,
        `root                99   0.0  0.0   408372    964  s000  Ss    0:00.01 -zsh`,
        `root               100   0.0  0.0   408624    864  s000  R+    0:00.00 ps aux`,
        this.prompt(),
      ]
    }

    if (cmd === 'df -h' || cmd === 'df') {
      return [
        'Filesystem       Size   Used  Avail Capacity  Mounted on',
        '/dev/disk3s3s1  228Gi   15Gi  195Gi     8%    /',
        'devfs           358Ki  358Ki    0Bi   100%    /dev',
        '/dev/disk3s4    228Gi  3.0Gi  195Gi     2%    /System/Volumes/VM',
        this.prompt(),
      ]
    }

    if (cmd === 'date') { const n = new Date(); return [n.toUTCString(), this.prompt()] }
    if (cmd === 'whoami') return ['root', this.prompt()]
    if (cmd === 'hostname') return [this.name, this.prompt()]
    if (cmd === 'clear' || cmd === 'reset') return ['\x1b[2J\x1b[H', this.prompt()]

    if (cmd === '?' || cmd === 'help') return [
      '\x1b[1m\x1b[36m── Network ──────────────────────────────────────────────────────\x1b[0m',
      '  \x1b[32mifconfig\x1b[0m                   Show interfaces',
      '  \x1b[32mifconfig en0\x1b[0m <ip> netmask <mask>  Configure IP',
      '  \x1b[32mping\x1b[0m <ip>                  Ping',
      '  \x1b[32mtraceroute\x1b[0m <ip>            Traceroute',
      '  \x1b[32mnetstat -rn\x1b[0m                Routing table',
      '  \x1b[32mnetstat -an\x1b[0m                Active connections',
      '  \x1b[32marp -a\x1b[0m                     ARP cache',
      '  \x1b[32mnetworksetup -listallhardwareports\x1b[0m',
      '  \x1b[32mnetworksetup -getinfo Ethernet\x1b[0m',
      '  \x1b[32mscutil --dns\x1b[0m               DNS config',
      '\x1b[1m\x1b[36m── System ───────────────────────────────────────────────────────\x1b[0m',
      '  \x1b[32mps aux\x1b[0m                     Process list',
      '  \x1b[32mdf -h\x1b[0m                      Disk usage',
      '  \x1b[32mdate\x1b[0m                       Current date/time',
      '  \x1b[32mwhoami\x1b[0m                     Current user',
      '  \x1b[32mhostname\x1b[0m                   Computer name',
      '  \x1b[32mclear\x1b[0m                      Clear screen',
      '  \x1b[32mip\x1b[0m <addr> <mask> [gw]      Quick IP config',
      this.prompt(),
    ]
    return [`${cmd}: command not found`, this.prompt()]
  }

  // ─── Linux CLI (Servers: Dell, HP, IBM, Cisco UCS) ───────────────────────

  private execLinux(cmd: string): string[] {
    // Quick IP shortcut: ip <addr> <mask> [gw]  (simulator convenience)
    const quickIp = cmd.match(/^ip\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)(?:\s+(\d+\.\d+\.\d+\.\d+))?$/)
    if (quickIp) return [...this.setIpCisco(`${quickIp[1]} ${quickIp[2]}${quickIp[3] ? ` ${quickIp[3]}` : ''}`), this.prompt()]

    if (cmd === 'ip addr show' || cmd === 'ip addr' || cmd === 'ip a' || cmd === 'ip -4 addr' || cmd === 'ip -4 addr show') {
      const lines = [
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000',
        '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
        '    inet 127.0.0.1/8 scope host lo',
        '       valid_lft forever preferred_lft forever',
        '',
        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000',
        `    link/ether ${this.iface.mac} brd ff:ff:ff:ff:ff:ff`,
      ]
      if (this.iface.ip) {
        lines.push(`    inet ${this.iface.ip}/${this.iface.prefixLen} brd ${this.iface.ip.replace(/\.\d+$/, '.255')} scope global eth0`)
        lines.push('       valid_lft forever preferred_lft forever')
      } else {
        lines.push('    (no ip address configured)')
      }
      return [...lines, this.prompt()]
    }

    // ip addr add <ip>/<prefix> dev eth0
    const addrAdd = cmd.match(/^ip addr(?:ess)? add (\d+\.\d+\.\d+\.\d+)\/(\d+) dev (\S+)$/)
    if (addrAdd) {
      if (addrAdd[3] !== 'eth0') return [`Cannot find device "${addrAdd[3]}"`, this.prompt()]
      this.iface.ip = addrAdd[1]; this.iface.prefixLen = parseInt(addrAdd[2])
      return [this.prompt()]
    }

    // ip addr del <ip>/<prefix> dev eth0
    const addrDel = cmd.match(/^ip addr(?:ess)? del (\d+\.\d+\.\d+\.\d+)\/(\d+) dev (\S+)$/)
    if (addrDel) {
      if (this.iface.ip === addrDel[1]) { this.iface.ip = undefined; this.iface.prefixLen = undefined }
      return [this.prompt()]
    }

    if (cmd === 'ip route show' || cmd === 'ip route' || cmd === 'ip r') {
      const lines: string[] = []
      if (this.iface.ip && this.iface.prefixLen) {
        const net = getNetworkAddress(this.iface.ip, this.iface.prefixLen)
        lines.push(`${net}/${this.iface.prefixLen} dev eth0 proto kernel scope link src ${this.iface.ip}`)
      }
      if (this.gateway) lines.push(`default via ${this.gateway} dev eth0`)
      if (!lines.length) lines.push('(no routes)')
      return [...lines, this.prompt()]
    }

    // ip route add <ip>/<prefix> via <gw>
    const routeAdd = cmd.match(/^ip route add (\d+\.\d+\.\d+\.\d+)\/(\d+) via (\d+\.\d+\.\d+\.\d+)/)
    if (routeAdd) {
      if (routeAdd[1] === '0.0.0.0' && parseInt(routeAdd[2]) === 0) this.gateway = routeAdd[3]
      else if (!this.iface.ip) return ['RTNETLINK answers: Network is unreachable', this.prompt()]
      else this.gateway = routeAdd[3]
      return [this.prompt()]
    }

    // ip route del
    const routeDel = cmd.match(/^ip route del (\d+\.\d+\.\d+\.\d+)\/(\d+)/)
    if (routeDel) {
      if (routeDel[1] === '0.0.0.0') this.gateway = undefined
      return [this.prompt()]
    }

    // ip route add default via <gw>
    const defRoute = cmd.match(/^ip route add default via (\d+\.\d+\.\d+\.\d+)/)
    if (defRoute) { this.gateway = defRoute[1]; return [this.prompt()] }

    if (cmd.startsWith('ping ')) {
      const target = cmd.slice(5).trim().split(/\s/)[0]
      if (!isValidIp(target)) return [`ping: ${target}: Name or service not known`, this.prompt()]
      if (!this.iface.ip) return [`ping: connect: Network is unreachable`, this.prompt()]
      return ['__ASYNC_PING__' + target]
    }

    if (cmd.startsWith('traceroute ')) {
      const target = cmd.slice(11).trim()
      if (!isValidIp(target)) return [`traceroute: ${target}: Name or service not known`, this.prompt()]
      if (!this.iface.ip) return [`traceroute: connect: Network is unreachable`, this.prompt()]
      return ['__ASYNC_TRACE__' + target]
    }

    if (cmd === 'arp -n' || cmd === 'arp') {
      const lines = ['Address          HWtype  HWaddress           Flags Mask  Iface']
      for (const [ip, { mac }] of this.arpTable) lines.push(`${ip.padEnd(17)}ether   ${mac}           C           eth0`)
      if (!this.arpTable.size) lines.push('(empty ARP table)')
      return [...lines, this.prompt()]
    }

    const hostnameSet = cmd.match(/^hostname (.+)$/)
    if (hostnameSet) { this.name = hostnameSet[1].trim(); return [this.prompt()] }
    if (cmd === 'hostname') return [this.name, this.prompt()]

    if (cmd === 'ip link show' || cmd === 'ip link' || cmd === 'ip l') {
      const up = this.iface.status === 'up'
      return [
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT',
        `2: eth0: <BROADCAST,MULTICAST,${up ? 'UP,LOWER_UP' : 'DOWN'}> mtu 1500 qdisc pfifo_fast state ${up ? 'UP' : 'DOWN'} mode DEFAULT`,
        `    link/ether ${this.iface.mac} brd ff:ff:ff:ff:ff:ff`,
        this.prompt(),
      ]
    }

    if (cmd === 'ip link set eth0 up') {
      this.iface.status = 'up'; return [this.prompt()]
    }
    if (cmd === 'ip link set eth0 down') {
      this.iface.status = 'down'; return [this.prompt()]
    }

    const addrFlush = cmd.match(/^ip addr(?:ess)? flush dev (\S+)$/)
    if (addrFlush) {
      if (addrFlush[1] === 'eth0') { this.iface.ip = undefined; this.iface.prefixLen = undefined }
      return [this.prompt()]
    }

    if (cmd === 'ip route del default') { this.gateway = undefined; return [this.prompt()] }

    if (cmd === 'arp -d' || cmd.startsWith('arp -d ')) {
      const ip = cmd.slice(7).trim()
      if (ip) this.arpTable.delete(ip)
      else this.arpTable.clear()
      return [this.prompt()]
    }

    if (cmd === 'clear' || cmd === 'reset') return ['\x1b[2J\x1b[H', this.prompt()]

    if (cmd === 'cat /etc/hostname') return [this.name, this.prompt()]
    if (cmd === 'cat /etc/hosts') return [
      '127.0.0.1   localhost',
      '127.0.1.1   ' + this.name,
      '',
      '# The following lines are desirable for IPv6 capable hosts',
      '::1     ip6-localhost ip6-loopback',
      this.prompt(),
    ]
    if (cmd === 'uname -n') return [this.name, this.prompt()]
    if (cmd === 'uname -a') return [`Linux ${this.name} 6.1.0-28-amd64 #1 SMP Debian 6.1.119-1 (2024-11-22) x86_64 GNU/Linux`, this.prompt()]
    if (cmd === 'uname -r') return ['6.1.0-28-amd64', this.prompt()]
    if (cmd === 'id') return ['uid=0(root) gid=0(root) groups=0(root)', this.prompt()]
    if (cmd === 'whoami') return ['root', this.prompt()]
    if (cmd === 'pwd') return ['/root', this.prompt()]
    if (cmd === 'uptime') return [` 00:00:01 up 0 min,  1 user,  load average: 0.00, 0.00, 0.00`, this.prompt()]
    if (cmd === 'date') {
      const now = new Date()
      return [now.toUTCString().replace('GMT', 'UTC'), this.prompt()]
    }
    if (cmd.startsWith('echo ')) return [cmd.slice(5).replace(/^["']|["']$/g, ''), this.prompt()]

    if (cmd === 'ss -tlnp' || cmd === 'ss -tlnpk' || cmd === 'ss -lntp') {
      const lines = [
        'Netid  State   Recv-Q Send-Q  Local Address:Port  Peer Address:Port  Process',
        'tcp    LISTEN  0      128     0.0.0.0:22         0.0.0.0:*          users:(("sshd",pid=1,fd=3))',
      ]
      if (this.subtype === 'server') {
        lines.push('tcp    LISTEN  0      511     0.0.0.0:80         0.0.0.0:*          users:(("nginx",pid=50,fd=6))')
        lines.push('tcp    LISTEN  0      511     0.0.0.0:443        0.0.0.0:*          users:(("nginx",pid=50,fd=7))')
        lines.push('tcp    LISTEN  0      128     127.0.0.1:5432     0.0.0.0:*          users:(("postgres",pid=80,fd=5))')
      }
      return [...lines, this.prompt()]
    }

    if (cmd === 'netstat -an' || cmd === 'netstat -antp' || cmd === 'netstat -tulnp') {
      const lines = [
        'Active Internet connections (servers and established)',
        'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program',
        `tcp        0      0 ${this.iface.ip ?? '0.0.0.0'}:22            0.0.0.0:*               LISTEN      1/sshd`,
      ]
      if (this.subtype === 'server') {
        lines.push(`tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      50/nginx`)
        lines.push(`tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      50/nginx`)
        lines.push(`tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN      80/postgres`)
      }
      return [...lines, this.prompt()]
    }

    if (cmd === 'ps aux' || cmd === 'ps -ef') {
      const lines = [
        'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        'root         1  0.0  0.1  20232  5312 ?        Ss   00:00   0:00 /sbin/init',
        'root        42  0.0  0.0   5756  1024 ?        S    00:00   0:00 /sbin/sshd',
        'root        99  0.0  0.0   4356   772 pts/0    Ss   00:00   0:00 -bash',
        'root       100  0.0  0.0   5912   840 pts/0    R+   00:00   0:00 ps aux',
      ]
      if (this.subtype === 'server') {
        lines.splice(3, 0, 'www-data    50  0.0  0.2  55120 12800 ?        Ss   00:00   0:00 nginx: master process /usr/sbin/nginx')
        lines.splice(4, 0, 'postgres    80  0.0  0.4 213456 18240 ?        Ss   00:00   0:00 /usr/lib/postgresql/15/bin/postgres')
      }
      return [...lines, this.prompt()]
    }

    if (cmd === 'df -h' || cmd === 'df') {
      return [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/sda1        20G  3.2G   16G  17% /',
        'tmpfs           512M     0  512M   0% /dev/shm',
        'tmpfs           512M  8.0K  512M   1% /run',
        this.prompt(),
      ]
    }

    if (cmd === 'free -m' || cmd === 'free -h' || cmd === 'free') {
      return [
        '               total        used        free      shared  buff/cache   available',
        'Mem:             512          87         312           8         112         416',
        'Swap:            512           0         512',
        this.prompt(),
      ]
    }

    if (cmd === 'ip neigh' || cmd === 'ip neigh show' || cmd === 'ip n') {
      const lines: string[] = []
      for (const [ip, { mac }] of this.arpTable) {
        lines.push(`${ip} dev eth0 lladdr ${mac} REACHABLE`)
      }
      if (!lines.length) lines.push('(neighbour table empty)')
      return [...lines, this.prompt()]
    }

    if (cmd === 'ip neigh flush all') {
      this.arpTable.clear()
      return [this.prompt()]
    }

    if (cmd === 'ip link' || cmd === 'ip l') {
      const up = this.iface.status === 'up'
      return [
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT',
        `2: eth0: <BROADCAST,MULTICAST,${up ? 'UP,LOWER_UP' : 'DOWN'}> mtu 1500 qdisc pfifo_fast state ${up ? 'UP' : 'DOWN'} mode DEFAULT`,
        `    link/ether ${this.iface.mac} brd ff:ff:ff:ff:ff:ff`,
        this.prompt(),
      ]
    }

    if (cmd === '?' || cmd === 'help') return [
      '\x1b[1m\x1b[36m── Network ──────────────────────────────────────────────────────\x1b[0m',
      '  \x1b[32mip addr show\x1b[0m | \x1b[32mip a\x1b[0m        Show interfaces',
      '  \x1b[32mip addr add\x1b[0m <ip>/<pfx> dev eth0',
      '  \x1b[32mip addr del\x1b[0m <ip>/<pfx> dev eth0',
      '  \x1b[32mip addr flush dev eth0\x1b[0m      Remove all IPs',
      '  \x1b[32mip link show\x1b[0m                Show link state',
      '  \x1b[32mip link set eth0 up|down\x1b[0m    Enable/disable interface',
      '  \x1b[32mip route show\x1b[0m | \x1b[32mip r\x1b[0m        Routing table',
      '  \x1b[32mip route add\x1b[0m <ip>/<pfx> via <gw>',
      '  \x1b[32mip route add default via\x1b[0m <gw>',
      '  \x1b[32mip route del default\x1b[0m        Remove default route',
      '  \x1b[32mip neigh\x1b[0m                    Neighbour/ARP table',
      '  \x1b[32mping\x1b[0m <ip>                   Ping',
      '  \x1b[32mtraceroute\x1b[0m <ip>              Traceroute',
      '  \x1b[32marp -n\x1b[0m                      ARP table',
      '\x1b[1m\x1b[36m── System ───────────────────────────────────────────────────────\x1b[0m',
      '  \x1b[32mss -tlnp\x1b[0m                    Listening TCP sockets',
      '  \x1b[32mnetstat -an\x1b[0m                 Network connections',
      '  \x1b[32mps aux\x1b[0m                      Process list',
      '  \x1b[32mdf -h\x1b[0m                       Disk usage',
      '  \x1b[32mfree -m\x1b[0m                     Memory usage',
      '  \x1b[32mhostname\x1b[0m [name]             Show/set hostname',
      '  \x1b[32muname -a\x1b[0m                    Kernel info',
      '  \x1b[32muptime\x1b[0m                      System uptime',
      '  \x1b[32mdate\x1b[0m                        Current date/time',
      '  \x1b[32mwhoami\x1b[0m | \x1b[32mid\x1b[0m               Current user',
      '  \x1b[32mpwd\x1b[0m                         Current directory',
      '  \x1b[32mclear\x1b[0m                       Clear screen',
      this.prompt(),
    ]
    return [`bash: ${cmd}: command not found`, this.prompt()]
  }

  takeSnapshot(id: string): PCSnapshot {
    return {
      type: this.subtype,
      id,
      name: this.name,
      brand: this.brand,
      subtype: this.subtype,
      iface: { ...this.iface },
      gateway: this.gateway,
    }
  }

  restoreState(snap: PCSnapshot): void {
    this.name = snap.name
    this.iface = { ...snap.iface }
    this.gateway = snap.gateway
  }

  // ─── Shared config shortcut ──────────────────────────────────────────────

  private setIpCisco(args: string): string[] {
    const parts = args.split(/\s+/)
    if (parts.length < 2) return ['Usage: ip <address> <mask> [gateway]']
    const [ip, mask, gw] = parts
    if (!isValidIp(ip))   return ['Error: invalid IP address']
    if (!isValidMask(mask)) return ['Error: invalid subnet mask']
    this.iface.ip = ip; this.iface.prefixLen = maskToPrefixLen(mask); this.iface.status = 'up'
    if (gw && isValidIp(gw)) this.gateway = gw
    return [`IP configured: ${ip}/${this.iface.prefixLen}${gw ? ` gateway ${gw}` : ''}`]
  }

  // ─── Tab completion ───────────────────────────────────────────────────────

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    if (this.isLinux())   return this.compLinux(lo)
    if (this.isMacOS())   return this.compMacOS(lo)
    return this.compWindows(lo)
  }

  private compLinux(lo: string): string[] {
    // Contextual: after 'ping ' suggest known IPs
    if (lo.startsWith('ping ') || lo.startsWith('traceroute ')) {
      const cmd = lo.startsWith('ping ') ? 'ping ' : 'traceroute '
      const knownIps = Array.from(this.arpTable.keys())
      return knownIps.map(ip => cmd + ip).filter(c => c.startsWith(lo))
    }
    const pool = [
      'ip addr show', 'ip a', 'ip addr',
      'ip addr add ', 'ip addr del ', 'ip addr flush dev eth0',
      'ip link show', 'ip l', 'ip link',
      'ip link set eth0 up', 'ip link set eth0 down',
      'ip route show', 'ip r', 'ip route',
      'ip route add ', 'ip route add default via ',
      'ip route del ', 'ip route del default',
      'ip neigh', 'ip neigh show', 'ip neigh flush all',
      'ping ', 'traceroute ',
      'arp -n', 'arp', 'arp -d ',
      'hostname', 'hostname ',
      'cat /etc/hostname', 'cat /etc/hosts',
      'uname -a', 'uname -n', 'uname -r',
      'whoami', 'id', 'pwd', 'uptime', 'date',
      'echo ',
      'ss -tlnp', 'netstat -an', 'netstat -tulnp',
      'ps aux', 'df -h', 'free -m',
      'clear', 'reset',
      'help', '?',
    ]
    return pool.filter(c => c.startsWith(lo))
  }

  private compMacOS(lo: string): string[] {
    if (lo.startsWith('ping ') || lo.startsWith('traceroute ')) {
      const cmd = lo.startsWith('ping ') ? 'ping ' : 'traceroute '
      return Array.from(this.arpTable.keys()).map(ip => cmd + ip).filter(c => c.startsWith(lo))
    }
    const pool = [
      'ifconfig', 'ifconfig en0', 'ifconfig en0 ',
      'ping ', 'traceroute ',
      'netstat -rn', 'netstat -r', 'netstat -an',
      'arp -a',
      'networksetup -listallhardwareports',
      'networksetup -getinfo Ethernet',
      'scutil --dns',
      'hostname',
      'uptime', 'date', 'whoami', 'pwd',
      'ps aux', 'df -h', 'free',
      'clear', 'help', '?', 'ip ',
    ]
    return pool.filter(c => c.startsWith(lo))
  }

  private compWindows(lo: string): string[] {
    if (lo.startsWith('ping ') || lo.startsWith('tracert ')) {
      const cmd = lo.startsWith('ping ') ? 'ping ' : 'tracert '
      return Array.from(this.arpTable.keys()).map(ip => cmd + ip).filter(c => c.startsWith(lo))
    }
    const pool = [
      'ipconfig', 'ipconfig /all', 'ipconfig /release', 'ipconfig /renew', 'ipconfig /flushdns',
      'ping ', 'tracert ',
      'route print', 'netstat -r', 'netstat -an', 'netstat -b',
      'arp -a',
      'netsh interface ip set address ',
      'netsh interface ip show config',
      'nslookup ',
      'systeminfo',
      'hostname', 'whoami',
      'ip ', 'help', '?',
    ]
    return pool.filter(c => c.startsWith(lo))
  }

}
