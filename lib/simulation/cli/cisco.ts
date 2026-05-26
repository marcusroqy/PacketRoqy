import type { BrandCLI } from './base'
import { internalToVendorIf, vendorToInternalIf, internalToVendorPort, vendorToInternalPort } from './base'
import type { RouterDevice } from '../devices/router'
import type { SwitchDevice } from '../devices/switch'
import { isValidIp, isValidMask, maskToPrefixLen, getNetworkAddress, prefixLenToMask } from '../ip-utils'

type RouterMode = 'user' | 'enable' | 'config' | 'config-if'
type SwitchMode = 'user' | 'enable' | 'config' | 'config-if'

// ─── Cisco IOS Router ─────────────────────────────────────────────────────────
export class CiscoRouterCLI implements BrandCLI {
  private mode: RouterMode = 'user'
  private currentIf: string | null = null

  constructor(private dev: RouterDevice) {}

  getBanner(): string[] {
    return [
      '\x1b[90m',
      `Cisco IOS Software, Version 15.7(3)M8`,
      `Technical Support: http://www.cisco.com/techsupport`,
      `Copyright (c) 1986-2020 by Cisco Systems, Inc.`,
      '',
      `        ${this.dev.name} uptime is 0 minutes`,
      `        System image file is "flash:c2900-universalk9-mz.SPA.157-3.M8.bin"`,
      '\x1b[0m',
      '',
      `\x1b[33mPress RETURN to get started.\x1b[0m`,
      '',
    ]
  }

  private prompt(): string {
    const n = this.dev.name
    if (this.mode === 'user') return `\x1b[32m${n}>\x1b[0m`
    if (this.mode === 'enable') return `\x1b[32m${n}#\x1b[0m`
    if (this.mode === 'config') return `\x1b[32m${n}(config)#\x1b[0m`
    return `\x1b[32m${n}(config-if)#\x1b[0m`
  }

  execute(raw: string): string[] {
    const cmd = raw.trim()
    if (!cmd) return [this.prompt()]

    if (this.mode === 'user') return this.execUser(cmd)
    if (this.mode === 'enable') return this.execEnable(cmd)
    if (this.mode === 'config') return this.execConfig(cmd)
    if (this.mode === 'config-if') return this.execConfigIf(cmd)
    return [this.prompt()]
  }

  private execUser(cmd: string): string[] {
    if (cmd === 'enable') { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === '?' || cmd === 'help') return [
      '  enable    Turn on privileged commands',
      '  exit      Exit from the EXEC',
      '  ping      Send echo messages',
      '  show      Show running system information',
      this.prompt(),
    ]
    if (cmd.startsWith('ping ')) return ['__ASYNC_PING__' + cmd.slice(5).trim()]
    if (cmd.startsWith('show ')) return [...this.show(cmd.slice(5).trim()), this.prompt()]
    if (cmd === 'exit' || cmd === 'logout') return ['Connection closed by foreign host.']
    return [`\x1b[31m% Unknown command or computer name, or unable to find computer address\x1b[0m`, this.prompt()]
  }

  private execEnable(cmd: string): string[] {
    if (cmd === 'configure terminal' || cmd === 'conf t' || cmd === 'conf term') {
      this.mode = 'config'
      return ['Enter configuration commands, one per line.  End with CNTL/Z.', this.prompt()]
    }
    if (cmd === 'disable' || cmd === 'exit') { this.mode = 'user'; return [this.prompt()] }
    if (cmd === 'end') { this.mode = 'user'; return [this.prompt()] }
    if (cmd.startsWith('show ')) return [...this.show(cmd.slice(5).trim()), this.prompt()]
    if (cmd.startsWith('ping ')) return ['__ASYNC_PING__' + cmd.slice(5).trim()]
    if (cmd.startsWith('traceroute ') || cmd.startsWith('trace ')) {
      const target = cmd.includes('traceroute ') ? cmd.slice(11).trim() : cmd.slice(6).trim()
      return ['__ASYNC_TRACE__' + target]
    }
    if (cmd === 'write memory' || cmd === 'wr' || cmd === 'copy run start' || cmd === 'copy running-config startup-config') {
      return ['Building configuration...', '[OK]', this.prompt()]
    }
    if (cmd === 'reload') return ['\x1b[33mProceed with reload? [confirm]\x1b[0m', this.prompt()]
    if (cmd === 'clear ip arp') { this.dev.arpTable.clear(); return ['\x1b[33mARP table cleared.\x1b[0m', this.prompt()] }
    if (cmd === 'clear ip route *') {
      this.dev.routingTable = this.dev.routingTable.filter(r => r.source === 'connected')
      return ['\x1b[33mStatic routes cleared.\x1b[0m', this.prompt()]
    }
    if (cmd === '?' || cmd === 'help') return [
      '  configure terminal  Enter configuration mode  (conf t)',
      '  disable             Turn off privileged commands',
      '  ping <ip>           Send echo messages',
      '  traceroute <ip>     Trace route to destination',
      '  show ...            Show running system information',
      '  write memory        Save configuration  (wr / copy run start)',
      '  clear ip arp        Clear ARP table',
      '  clear ip route *    Clear static routes',
      '  reload              Reload the router',
      this.prompt(),
    ]
    return [`\x1b[31m% Invalid input detected at '^' marker.\x1b[0m`, `          ${' '.repeat(cmd.length)}^`, this.prompt()]
  }

  private execConfig(cmd: string): string[] {
    if (cmd === 'end') { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'enable'; return [this.prompt()] }

    if (cmd.startsWith('interface ') || cmd.startsWith('int ')) {
      const raw = cmd.replace(/^interface |^int /, '').trim()
      const internal = vendorToInternalIf(raw, 'Cisco')
      if (!this.dev.interfaces.has(internal)) {
        const avail = Array.from(this.dev.interfaces.keys()).map(i => internalToVendorIf(i, 'Cisco')).join(', ')
        return [`\x1b[31m% Invalid interface specified. Available: ${avail}\x1b[0m`, this.prompt()]
      }
      this.currentIf = internal
      this.mode = 'config-if'
      return [this.prompt()]
    }

    if (cmd.startsWith('ip route ')) {
      const parts = cmd.slice(9).trim().split(/\s+/)
      if (parts.length < 3) return [`\x1b[31m% Incomplete command.\x1b[0m`, this.prompt()]
      const [net, mask, nexthop] = parts
      if (!isValidIp(net) || !isValidMask(mask) || !isValidIp(nexthop)) return [`\x1b[31m% Bad IP address or subnet mask.\x1b[0m`, this.prompt()]
      const plen = maskToPrefixLen(mask)
      const network = getNetworkAddress(net, plen)
      const nr = this.dev.lookupRoute(nexthop)
      this.dev.routingTable.push({ network, prefixLen: plen, nextHop: nexthop, interface: nr?.interface ?? '', metric: 1, source: 'static' })
      return [this.prompt()]
    }

    if (cmd.startsWith('no ip route ')) {
      const parts = cmd.slice(12).trim().split(/\s+/)
      if (parts.length >= 3) {
        const plen = maskToPrefixLen(parts[1])
        const net = getNetworkAddress(parts[0], plen)
        this.dev.routingTable = this.dev.routingTable.filter(r => !(r.network === net && r.prefixLen === plen && r.nextHop === parts[2]))
      }
      return [this.prompt()]
    }

    if (cmd.startsWith('hostname ')) { this.dev.name = cmd.slice(9).trim(); return [this.prompt()] }
    if (cmd.startsWith('no hostname')) { this.dev.name = 'Router'; return [this.prompt()] }
    if (cmd.startsWith('banner motd')) return [this.prompt()]
    if (cmd.startsWith('line ') || cmd.startsWith('router ')) return [this.prompt()]

    return [`\x1b[31m% Invalid input detected at '^' marker.\x1b[0m`, this.prompt()]
  }

  private execConfigIf(cmd: string): string[] {
    if (cmd === 'exit') { this.mode = 'config'; this.currentIf = null; return [this.prompt()] }
    if (cmd === 'end') { this.mode = 'enable'; this.currentIf = null; return [this.prompt()] }

    const iface = this.dev.interfaces.get(this.currentIf!)!

    if (cmd.startsWith('ip address ')) {
      const parts = cmd.slice(11).trim().split(/\s+/)
      if (parts.length < 2 || !isValidIp(parts[0]) || !isValidMask(parts[1])) {
        return [`\x1b[31m% Invalid IP or mask.\x1b[0m`, this.prompt()]
      }
      iface.ip = parts[0]
      iface.prefixLen = maskToPrefixLen(parts[1])
      this.dev['updateConnectedRoutes']?.()
      return [this.prompt()]
    }

    if (cmd === 'no shutdown' || cmd === 'no shut') {
      iface.status = 'up'
      this.dev['updateConnectedRoutes']?.()
      return [`\x1b[33m%LINK-5-CHANGED: Interface ${this.currentIf}, changed state to up\x1b[0m`,
              `\x1b[33m%LINEPROTO-5-UPDOWN: Line protocol on Interface ${this.currentIf}, changed state to up\x1b[0m`,
              this.prompt()]
    }

    if (cmd === 'shutdown') {
      iface.status = 'down'
      this.dev['updateConnectedRoutes']?.()
      return [`\x1b[33m%LINK-5-CHANGED: Interface ${this.currentIf}, changed state to administratively down\x1b[0m`, this.prompt()]
    }

    if (cmd.startsWith('no ip address')) { iface.ip = undefined; iface.prefixLen = undefined; this.dev['updateConnectedRoutes']?.(); return [this.prompt()] }
    if (cmd.startsWith('description ')) { iface.description = cmd.slice(12).trim(); return [this.prompt()] }
    if (cmd.startsWith('duplex ') || cmd.startsWith('speed ') || cmd.startsWith('ip access-group')) return [this.prompt()]

    return [`\x1b[31m% Invalid input detected at '^' marker.\x1b[0m`, this.prompt()]
  }

  private show(sub: string): string[] {
    if (sub === 'ip route' || sub === 'ip route all') return this.showIpRoute()
    if (sub === 'ip interface brief' || sub === 'ip int br' || sub === 'ip int brief') return this.showIpIntBrief()
    if (sub === 'interfaces' || sub === 'int') return this.showInterfaces()
    if (sub === 'arp' || sub === 'ip arp') return this.showArp()
    if (sub === 'running-config' || sub === 'run') return this.showRunning()
    if (sub === 'version') return this.showVersion()
    if (sub === 'ip protocols') return ['Routing Protocol is "static"', '  Outgoing update filter list for all interfaces is not set', '  Incoming update filter list for all interfaces is not set']
    if (sub === 'clock') {
      const now = new Date()
      return [`${now.toUTCString()}`, `Router uptime is 0 minutes`]
    }
    if (sub === 'users') return [
      '    Line       User       Host(s)              Idle       Location',
      '*   0 con 0                                    00:00:00',
    ]
    if (sub === 'logging') return [
      'Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)',
      '    Console logging: level debugging, 0 messages logged, xml disabled',
      '    Monitor logging: level debugging, 0 messages logged, xml disabled',
      '    Buffer logging: level debugging, 0 messages logged, xml disabled',
      '',
      'Log Buffer (8192 bytes):',
      `%SYS-5-CONFIG_I: Configured from console by console`,
    ]
    if (sub === 'history') return [
      '  show ip route', '  show ip interface brief', '  configure terminal', '  enable',
    ]
    if (sub === 'flash' || sub === 'flash:') return [
      '-#- --length-- -----date/time------ path',
      '1    33554432  Jan 1 2024 00:00:00   c2900-universalk9-mz.SPA.157-3.M8.bin',
      '',
      `33554432 bytes available (33554432 bytes used)`,
    ]
    return [`\x1b[31m% Invalid input: show ${sub}\x1b[0m`]
  }

  private showIpRoute(): string[] {
    const lines = [
      'Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP',
      '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area',
      '',
      `Gateway of last resort is not set`,
      '',
    ]
    for (const r of [...this.dev.routingTable].sort((a, b) => b.prefixLen - a.prefixLen)) {
      const code = r.source === 'connected' ? 'C' : 'S'
      const mask = prefixLenToMask(r.prefixLen)
      const net = `${r.network}/${r.prefixLen}`
      const via = r.nextHop ? ` [1/0] via ${r.nextHop}` : ''
      const iface = internalToVendorIf(r.interface, 'Cisco')
      lines.push(`${code}        ${net.padEnd(20)}${via}${via ? '' : ` is directly connected, ${iface}`}`)
    }
    if (!this.dev.routingTable.length) lines.push('      (no routes)')
    return lines
  }

  private showIpIntBrief(): string[] {
    const lines = [
      'Interface              IP-Address      OK? Method Status                Protocol',
    ]
    for (const iface of this.dev.interfaces.values()) {
      const name = internalToVendorIf(iface.name, 'Cisco').padEnd(23)
      const ip = (iface.ip ?? 'unassigned').padEnd(16)
      const ok = iface.ip ? 'YES' : 'NO '
      const method = iface.ip ? 'manual' : 'unset '
      const status = iface.status === 'up' ? 'up                   ' : 'administratively down'
      const proto = iface.status === 'up' ? 'up' : 'down'
      lines.push(`${name}${ip}${ok}  ${method} ${status} ${proto}`)
    }
    return lines
  }

  private showInterfaces(): string[] {
    const lines: string[] = []
    for (const iface of this.dev.interfaces.values()) {
      const name = internalToVendorIf(iface.name, 'Cisco')
      const updown = iface.status === 'up' ? 'up' : 'administratively down'
      lines.push(`${name} is ${updown}, line protocol is ${updown}`)
      lines.push(`  Hardware is GigabitEthernet, address is ${iface.mac} (bia ${iface.mac})`)
      if (iface.description) lines.push(`  Description: ${iface.description}`)
      if (iface.ip) lines.push(`  Internet address is ${iface.ip}/${iface.prefixLen}`)
      lines.push(`  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,`)
      lines.push(`     reliability 255/255, txload 1/255, rxload 1/255`)
      lines.push(`  Encapsulation ARPA, loopback not set`)
      lines.push(`  ARP type: ARPA, ARP Timeout 04:00:00`)
      lines.push('')
    }
    return lines
  }

  private showArp(): string[] {
    const lines = ['Protocol  Address          Age (min)  Hardware Addr   Type   Interface', '']
    for (const e of this.dev.arpTable.values()) {
      const iface = internalToVendorIf(e.iface, 'Cisco')
      lines.push(`Internet  ${e.ip.padEnd(17)}0          ${e.mac}  ARPA   ${iface}`)
    }
    if (!this.dev.arpTable.size) lines.push('(ARP table empty)')
    return lines
  }

  private showRunning(): string[] {
    const lines = [
      '!',
      '! Last configuration change at 00:00:00 UTC',
      '!',
      `version 15.7`,
      'service timestamps debug datetime msec',
      'service timestamps log datetime msec',
      '!',
      `hostname ${this.dev.name}`,
      '!',
    ]
    for (const iface of this.dev.interfaces.values()) {
      const name = internalToVendorIf(iface.name, 'Cisco')
      lines.push(`!`, `interface ${name}`)
      if (iface.description) lines.push(` description ${iface.description}`)
      if (iface.ip) lines.push(` ip address ${iface.ip} ${prefixLenToMask(iface.prefixLen!)}`)
      if (iface.status === 'up') lines.push(` no shutdown`)
    }
    for (const r of this.dev.routingTable.filter(r => r.source === 'static')) {
      lines.push(`ip route ${r.network} ${prefixLenToMask(r.prefixLen)} ${r.nextHop}`)
    }
    lines.push('!', 'end')
    return lines
  }

  private showVersion(): string[] {
    return [
      `Cisco IOS Software, Version 15.7(3)M8`,
      `Technical Support: http://www.cisco.com/techsupport`,
      `Copyright (c) 1986-2020 by Cisco Systems, Inc.`,
      '',
      `ROM: System Bootstrap, Version 15.7(3)M8`,
      '',
      `${this.dev.name} uptime is 0 minutes`,
      `System image file is "flash:c2900-universalk9-mz.SPA.157-3.M8.bin"`,
      '',
      `cisco ISR2911 (revision 1.0) with 512MB/64MB memory.`,
      `Processor board ID FTX152400KS`,
      `4 GigabitEthernet interfaces`,
      `DRAM configuration is 64 bits wide with parity enabled.`,
      `255K bytes of non-volatile configuration memory.`,
      `250880K bytes of ATA System CompactFlash (Read/Write)`,
    ]
  }
}

// ─── Cisco IOS Switch ─────────────────────────────────────────────────────────
export class CiscoSwitchCLI implements BrandCLI {
  private mode: SwitchMode = 'user'
  private currentPort: string | null = null

  constructor(private dev: SwitchDevice) {}

  getBanner(): string[] {
    return [
      '\x1b[90m',
      `Cisco IOS Software, Version 12.2(58)SE2`,
      `Copyright (c) 1986-2011 by Cisco Systems, Inc.`,
      '\x1b[0m',
      '',
      `\x1b[33mPress RETURN to get started.\x1b[0m`,
      '',
    ]
  }

  private prompt(): string {
    const n = this.dev.name
    if (this.mode === 'user') return `\x1b[32m${n}>\x1b[0m`
    if (this.mode === 'enable') return `\x1b[32m${n}#\x1b[0m`
    if (this.mode === 'config') return `\x1b[32m${n}(config)#\x1b[0m`
    return `\x1b[32m${n}(config-if)#\x1b[0m`
  }

  execute(raw: string): string[] {
    const cmd = raw.trim()
    if (!cmd) return [this.prompt()]

    if (this.mode === 'user') {
      if (cmd === 'enable') { this.mode = 'enable'; return [this.prompt()] }
      if (cmd.startsWith('show ')) return [...this.show(cmd.slice(5).trim()), this.prompt()]
      return [`\x1b[31m% Unknown command\x1b[0m`, this.prompt()]
    }

    if (this.mode === 'enable') {
      if (cmd === 'configure terminal' || cmd === 'conf t') { this.mode = 'config'; return ['Enter configuration commands, one per line.  End with CNTL/Z.', this.prompt()] }
      if (cmd === 'disable' || cmd === 'exit') { this.mode = 'user'; return [this.prompt()] }
      if (cmd.startsWith('show ')) return [...this.show(cmd.slice(5).trim()), this.prompt()]
      if (cmd === 'clear mac address-table dynamic') { this.dev.macTable.clear(); return ['MAC address table cleared.', this.prompt()] }
      return [`\x1b[31m% Invalid input\x1b[0m`, this.prompt()]
    }

    if (this.mode === 'config') {
      if (cmd === 'exit' || cmd === 'end') { this.mode = 'enable'; return [this.prompt()] }
      if (cmd.startsWith('interface ') || cmd.startsWith('int ')) {
        const raw2 = cmd.replace(/^interface |^int /, '').trim()
        const internal = vendorToInternalPort(raw2, 'Cisco')
        if (!this.dev.ports.includes(internal)) {
          return [`\x1b[31m% Interface ${raw2} not found.\x1b[0m`, this.prompt()]
        }
        this.currentPort = internal
        this.mode = 'config-if'
        return [this.prompt()]
      }
      if (cmd.startsWith('hostname ')) { this.dev.name = cmd.slice(9).trim(); return [this.prompt()] }
      if (cmd.startsWith('vlan ')) return [`! VLAN configuration stored (not yet simulated)`, this.prompt()]
      return [`\x1b[31m% Invalid input\x1b[0m`, this.prompt()]
    }

    if (this.mode === 'config-if') {
      if (cmd === 'exit') { this.mode = 'config'; this.currentPort = null; return [this.prompt()] }
      if (cmd === 'end') { this.mode = 'enable'; this.currentPort = null; return [this.prompt()] }
      if (cmd === 'no shutdown' || cmd === 'no shut') return [`\x1b[33m%LINK-3-UPDOWN: Interface ${this.currentPort}, changed state to up\x1b[0m`, this.prompt()]
      if (cmd === 'shutdown') return [`\x1b[33m%LINK-3-UPDOWN: Interface ${this.currentPort}, changed state to down\x1b[0m`, this.prompt()]
      if (cmd.startsWith('switchport ') || cmd.startsWith('spanning-tree ') || cmd.startsWith('description ')) return [this.prompt()]
      return [`\x1b[31m% Invalid input\x1b[0m`, this.prompt()]
    }

    return [this.prompt()]
  }

  private show(sub: string): string[] {
    if (sub === 'mac address-table' || sub === 'mac-address-table') return this.showMac()
    if (sub === 'interfaces status') return this.showIntStatus()
    if (sub === 'interfaces') return this.showInt()
    if (sub === 'version') return [`Cisco IOS Software, C2960-UNIVERSALK9-M, Version 12.2(58)SE2`]
    if (sub === 'running-config' || sub === 'run') return this.showRun()
    if (sub === 'vlan brief' || sub === 'vlan') return this.showVlan()
    return [`\x1b[31m% Invalid input: show ${sub}\x1b[0m`]
  }

  private showMac(): string[] {
    const lines = [
      '          Mac Address Table',
      '-------------------------------------------',
      '',
      'Vlan    Mac Address       Type        Ports',
      '----    -----------       --------    -----',
    ]
    for (const e of this.dev.macTable.values()) {
      const port = internalToVendorPort(e.port, 'Cisco')
      lines.push(`   1    ${e.mac}    DYNAMIC     ${port}`)
    }
    if (!this.dev.macTable.size) lines.push('(MAC table empty)')
    return lines
  }

  private showIntStatus(): string[] {
    const lines = ['Port         Name               Status       Vlan       Duplex  Speed Type', '']
    for (const port of this.dev.ports) {
      const name = internalToVendorPort(port, 'Cisco').padEnd(13)
      const connected = this.dev.macTable.size > 0 ? 'connected' : 'notconnect'
      lines.push(`${name}                    ${connected.padEnd(13)}1          a-full  a-1000 10/100/1000BaseTX`)
    }
    return lines
  }

  private showInt(): string[] {
    const lines: string[] = []
    for (const port of this.dev.ports.slice(0, 4)) {
      const name = internalToVendorPort(port, 'Cisco')
      lines.push(`${name} is up, line protocol is up (connected)`)
      lines.push(`  Hardware is Fast Ethernet, address is aa:bb:cc:dd:ee:ff`)
      lines.push(`  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec`)
      lines.push('')
    }
    if (this.dev.ports.length > 4) lines.push(`  ... (${this.dev.ports.length - 4} more ports)`)
    return lines
  }

  private showRun(): string[] {
    return ['!', `hostname ${this.dev.name}`, '!', ...this.dev.ports.slice(0, 4).map(p => `interface ${internalToVendorPort(p, 'Cisco')}`), '!', 'end']
  }

  private showVlan(): string[] {
    return ['VLAN Name                             Status    Ports', '---- -------------------------------- --------- -------------------------------', '1    default                          active    ' + this.dev.ports.map(p => internalToVendorPort(p, 'Cisco')).join(', ')]
  }
}
