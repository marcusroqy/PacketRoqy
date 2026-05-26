import type { BrandCLI } from './base'
import { internalToVendorIf, vendorToInternalIf, internalToVendorPort, vendorToInternalPort } from './base'
import type { RouterDevice } from '../devices/router'
import type { SwitchDevice } from '../devices/switch'
import { isValidIp, maskToPrefixLen, prefixLenToMask, getNetworkAddress } from '../ip-utils'

type RouterMode = 'user' | 'system' | 'interface' | 'static-route'

// ─── Huawei VRP Router ────────────────────────────────────────────────────────
export class HuaweiRouterCLI implements BrandCLI {
  private mode: RouterMode = 'user'
  private currentIf: string | null = null

  constructor(private dev: RouterDevice) {}

  getBanner(): string[] {
    return [
      '\x1b[90m',
      ``,
      `        Huawei Versatile Routing Platform Software`,
      `        VRP (R) software, Version 5.170 (AR2200 V200R010C00SPC600)`,
      `        Copyright (C) 2011-2020 HUAWEI TECH CO., LTD`,
      ``,
      `        ${this.dev.name} uptime is 0 week(s), 0 day(s), 0 hour(s), 0 minute(s)`,
      '\x1b[0m',
      '',
      `\x1b[36mInfo: The max number of VTY users is 5, and the number`,
      `      of current VTY users on line is 1.\x1b[0m`,
      '',
    ]
  }

  private prompt(): string {
    const n = this.dev.name
    if (this.mode === 'user') return `\x1b[36m<${n}>\x1b[0m`
    if (this.mode === 'system') return `\x1b[36m[${n}]\x1b[0m`
    if (this.mode === 'interface' && this.currentIf) {
      const iface = internalToVendorIf(this.currentIf, 'Huawei')
      return `\x1b[36m[${n}-${iface}]\x1b[0m`
    }
    return `\x1b[36m<${n}>\x1b[0m`
  }

  execute(raw: string): string[] {
    const cmd = raw.trim()
    if (!cmd) return [this.prompt()]

    if (this.mode === 'user') return this.execUser(cmd)
    if (this.mode === 'system') return this.execSystem(cmd)
    if (this.mode === 'interface') return this.execInterface(cmd)
    return [this.prompt()]
  }

  private execUser(cmd: string): string[] {
    if (cmd === 'system-view' || cmd === 'sys') {
      this.mode = 'system'
      return ['Enter system view, return user view with Ctrl+Z.', this.prompt()]
    }
    if (cmd.startsWith('display ')) return [...this.display(cmd.slice(8).trim()), this.prompt()]
    if (cmd.startsWith('ping ')) return ['__ASYNC_PING__' + cmd.slice(5).trim()]
    if (cmd.startsWith('tracert ') || cmd.startsWith('traceroute ')) {
      const ip = cmd.includes('tracert ') ? cmd.slice(8).trim() : cmd.slice(11).trim()
      return ['__ASYNC_TRACE__' + ip]
    }
    if (cmd === 'save' || cmd === 'save all') return ['Warning: The current configuration will be written to flash:/vrpcfg.zip.', 'Are you sure to continue?[Y/N]y', 'Now saving the current configuration to the slot 0.', 'Save the configuration successfully.', this.prompt()]
    if (cmd === 'quit' || cmd === 'q') return ['Connection closed.']
    if (cmd === '?' || cmd === 'help') return [
      '  system-view  Enter system view',
      '  display      Display current system information',
      '  ping         Ping operation',
      '  tracert      Trace route operation',
      '  quit         Exit from current view',
      this.prompt(),
    ]
    return [`\x1b[31mError: Unrecognized command found at '^' position.\x1b[0m`, `       ${cmd}`, `       ^`, this.prompt()]
  }

  private execSystem(cmd: string): string[] {
    if (cmd === 'quit' || cmd === 'q' || cmd === 'return') { this.mode = 'user'; return ['Return to user view.', this.prompt()] }

    if (cmd.startsWith('interface ') || cmd.startsWith('int ')) {
      const raw = cmd.replace(/^interface |^int /, '').trim()
      const internal = vendorToInternalIf(raw, 'Huawei')
      if (!this.dev.interfaces.has(internal)) {
        const avail = Array.from(this.dev.interfaces.keys()).map(i => internalToVendorIf(i, 'Huawei')).join(', ')
        return [`\x1b[31mError: Interface does not exist. Available: ${avail}\x1b[0m`, this.prompt()]
      }
      this.currentIf = internal
      this.mode = 'interface'
      return [this.prompt()]
    }

    if (cmd.startsWith('ip route-static ')) {
      const parts = cmd.slice(16).trim().split(/\s+/)
      if (parts.length < 3) return [`\x1b[31mError: Incomplete command.\x1b[0m`, this.prompt()]
      // Format: ip route-static X.X.X.X {mask|prefix-len} nexthop
      const [net, maskOrPlen, nexthop] = parts
      const plen = maskOrPlen.includes('.') ? maskToPrefixLen(maskOrPlen) : parseInt(maskOrPlen)
      const network = getNetworkAddress(net, plen)
      const nr = this.dev.lookupRoute(nexthop)
      this.dev.routingTable.push({ network, prefixLen: plen, nextHop: nexthop, interface: nr?.interface ?? '', metric: 60, source: 'static' })
      return [this.prompt()]
    }

    if (cmd.startsWith('undo ip route-static ')) {
      const parts = cmd.slice(21).trim().split(/\s+/)
      if (parts.length >= 3) {
        const plen = parts[1].includes('.') ? maskToPrefixLen(parts[1]) : parseInt(parts[1])
        const net = getNetworkAddress(parts[0], plen)
        this.dev.routingTable = this.dev.routingTable.filter(r => !(r.network === net && r.prefixLen === plen && r.nextHop === parts[2]))
      }
      return [this.prompt()]
    }

    if (cmd.startsWith('sysname ')) { this.dev.name = cmd.slice(8).trim(); return [this.prompt()] }
    if (cmd.startsWith('display ')) return [...this.display(cmd.slice(8).trim()), this.prompt()]
    if (cmd.startsWith('ntp-service') || cmd.startsWith('aaa') || cmd.startsWith('user-interface')) return [this.prompt()]

    return [`\x1b[31mError: Unrecognized command found at '^' position.\x1b[0m`, this.prompt()]
  }

  private execInterface(cmd: string): string[] {
    if (cmd === 'quit' || cmd === 'q') { this.mode = 'system'; this.currentIf = null; return [this.prompt()] }
    if (cmd === 'return') { this.mode = 'user'; this.currentIf = null; return [this.prompt()] }

    const iface = this.dev.interfaces.get(this.currentIf!)!
    const ifDisplay = internalToVendorIf(this.currentIf!, 'Huawei')

    if (cmd.startsWith('ip address ')) {
      const parts = cmd.slice(11).trim().split(/\s+/)
      if (parts.length < 2 || !isValidIp(parts[0])) return [`\x1b[31mError: Invalid IP address format.\x1b[0m`, this.prompt()]
      iface.ip = parts[0]
      // Accept both mask and prefix length
      iface.prefixLen = parts[1].includes('.') ? maskToPrefixLen(parts[1]) : parseInt(parts[1])
      this.dev['updateConnectedRoutes']?.()
      return [this.prompt()]
    }

    if (cmd === 'undo shutdown') {
      iface.status = 'up'
      this.dev['updateConnectedRoutes']?.()
      return [`\x1b[36mInfo: Interface ${ifDisplay} is not shutdown.\x1b[0m`, this.prompt()]
    }

    if (cmd === 'shutdown') {
      iface.status = 'down'
      this.dev['updateConnectedRoutes']?.()
      return [`\x1b[33mWarning: Interface ${ifDisplay} has been shutdown.\x1b[0m`, this.prompt()]
    }

    if (cmd.startsWith('undo ip address')) { iface.ip = undefined; iface.prefixLen = undefined; this.dev['updateConnectedRoutes']?.(); return [this.prompt()] }
    if (cmd.startsWith('description ')) { iface.description = cmd.slice(12).trim(); return [this.prompt()] }
    if (cmd.startsWith('display ')) return [...this.display(cmd.slice(8).trim()), this.prompt()]

    return [`\x1b[31mError: Unrecognized command found at '^' position.\x1b[0m`, this.prompt()]
  }

  private display(sub: string): string[] {
    if (sub === 'ip routing-table' || sub === 'ip routing') return this.dispRoutingTable()
    if (sub === 'ip interface brief' || sub === 'ip int brief') return this.dispIpIntBrief()
    if (sub === 'interface' || sub === 'interfaces') return this.dispInterface()
    if (sub === 'arp' || sub === 'arp all') return this.dispArp()
    if (sub === 'current-configuration' || sub === 'current-config' || sub === 'this') return this.dispCurrentConfig()
    if (sub === 'version') return this.dispVersion()
    if (sub === 'ip interface') return this.dispIpInterface()
    if (sub === 'clock') {
      const d = new Date()
      return [`${d.toISOString().replace('T', ' ').slice(0, 19)}`, `Time Zone : UTC`]
    }
    if (sub === 'users') return [
      '  User-Intf    Delay    Type   Network Address     AuthenStatus    AuthorcmdFlag',
      '+ 0   CON 0   00:00:00                                                  no        ',
    ]
    if (sub === 'memory' || sub === 'memory-usage') return [
      '  Memory utilization statistics at 2024-01-01 00:00:00+00:00',
      '  System Total Memory Is: 536870912 bytes',
      '  Total Memory Used Is: 118400000 bytes',
      '  Memory Using Percentage Is: 22%',
    ]
    if (sub === 'cpu-usage') return [
      '  CPU Usage Stat. Cycle: 60 (Second)',
      '  CPU Usage            : 1% Max: 5%',
      '  CPU Usage Stat. Time : 2024-01-01 00:00:00',
    ]
    if (sub === 'logbuffer' || sub === 'log') return [
      'Logging buffer configuration and contents:',
      'Log buffer size: 1024',
      'Nov 1 2024 00:00:00+00:00 Huawei %%01SHELL/5/CMDRECORD(s)[1]:Record command information. (Task=CON0, Ip=**, VpnName=, User=**, Command="display logbuffer")',
    ]
    if (sub === 'history-command' || sub === 'history') return [
      '  1  system-view',
      '  2  display version',
      '  3  display ip routing-table',
      '  4  display current-configuration',
    ]
    if (sub === 'device') return [
      'Slot #    Type                Online    Register      Status      Primary   ',
      '0         AR2220              Present   Registered    Normal      Master    ',
    ]
    return [`\x1b[31mError: Unrecognized command: display ${sub}\x1b[0m`]
  }

  private dispRoutingTable(): string[] {
    const lines = [
      'Route Flags: R - relay, D - download to fib, T - to vpn-instance, B - black hole route',
      '------------------------------------------------------------------------------',
      `Routing Table : Public`,
      `         Destinations : ${this.dev.routingTable.length}        Routes : ${this.dev.routingTable.length}`,
      '',
      'Destination/Mask    Proto   Pre  Cost        Flags NextHop         Interface',
      '',
    ]
    for (const r of [...this.dev.routingTable].sort((a, b) => b.prefixLen - a.prefixLen)) {
      const dest = `${r.network}/${r.prefixLen}`.padEnd(20)
      const proto = r.source === 'connected' ? 'Direct ' : 'Static '
      const pre = r.source === 'connected' ? '0  ' : '60 '
      const cost = '0          '
      const flags = 'D  '
      const nh = (r.nextHop || r.interface.split('/').pop() || '0.0.0.0').padEnd(16)
      const iface = internalToVendorIf(r.interface, 'Huawei')
      lines.push(`${dest}${proto} ${pre} ${cost}${flags}${nh}${iface}`)
    }
    if (!this.dev.routingTable.length) lines.push('(no routes)')
    return lines
  }

  private dispIpIntBrief(): string[] {
    const lines = [
      '*down: administratively down',
      '^down: standby',
      '(l): loopback',
      '(s): spoofing',
      '(E): E-Trunk down',
      'The number of interface that is UP in Physical is 0',
      '',
      'Interface                         IP Address/Mask      Physical   Protocol',
    ]
    for (const iface of this.dev.interfaces.values()) {
      const name = internalToVendorIf(iface.name, 'Huawei').padEnd(34)
      const ip = (iface.ip ? `${iface.ip}/${iface.prefixLen}` : 'unassigned').padEnd(21)
      const phys = iface.status === 'up' ? 'up       ' : '*down    '
      const proto = iface.status === 'up' ? 'up' : 'down'
      lines.push(`${name}${ip}${phys}${proto}`)
    }
    return lines
  }

  private dispInterface(): string[] {
    const lines: string[] = []
    for (const iface of this.dev.interfaces.values()) {
      const name = internalToVendorIf(iface.name, 'Huawei')
      const state = iface.status === 'up' ? 'up' : 'down'
      lines.push(`${name} current state : ${state === 'up' ? 'UP' : 'Administratively DOWN'}`)
      lines.push(`Line protocol current state : ${state === 'up' ? 'UP' : 'DOWN'}`)
      lines.push(`Description:${iface.description ? iface.description : ''}`)
      lines.push(`Route Port,The Maximum Transmit Unit is 1500`)
      lines.push(`Internet Address is ${iface.ip ? `${iface.ip}/${iface.prefixLen}` : 'not assigned'}`)
      lines.push(`Encapsulation ARPA,  loopback not set`)
      lines.push(`Hardware address is ${iface.mac}`)
      lines.push('')
    }
    return lines
  }

  private dispArp(): string[] {
    const lines = ['IP ADDRESS      MAC ADDRESS     EXPIRE(M) TYPE        INTERFACE', '------------------------------------------------------------------------------']
    for (const e of this.dev.arpTable.values()) {
      const iface = internalToVendorIf(e.iface, 'Huawei')
      lines.push(`${e.ip.padEnd(16)}${e.mac}  20        Dynamic     ${iface}`)
    }
    if (!this.dev.arpTable.size) lines.push('(ARP table empty)')
    lines.push(`Total:${this.dev.arpTable.size}    Dynamic:${this.dev.arpTable.size}    Static:0`)
    return lines
  }

  private dispCurrentConfig(): string[] {
    const lines = ['#', `sysname ${this.dev.name}`, '#']
    for (const iface of this.dev.interfaces.values()) {
      const name = internalToVendorIf(iface.name, 'Huawei')
      lines.push(`interface ${name}`)
      if (iface.description) lines.push(` description ${iface.description}`)
      if (iface.ip) lines.push(` ip address ${iface.ip} ${prefixLenToMask(iface.prefixLen!)}`)
      if (iface.status !== 'up') lines.push(` shutdown`)
      lines.push('#')
    }
    for (const r of this.dev.routingTable.filter(r => r.source === 'static')) {
      lines.push(`ip route-static ${r.network} ${r.prefixLen} ${r.nextHop}`)
    }
    lines.push('#', 'return')
    return lines
  }

  private dispVersion(): string[] {
    return [
      `Huawei Versatile Routing Platform Software`,
      `VRP (R) software, Version 5.170 (AR2200 V200R010C00SPC600)`,
      `Copyright (C) 2011-2020 HUAWEI TECH CO., LTD`,
      '',
      `${this.dev.name} uptime is 0 week(s), 0 day(s), 0 hour(s), 0 minute(s)`,
      ``,
      `Huawei AR2220 Router uptime is 0 week(s), 0 day(s), 0 hour(s), 0 minute(s)`,
      `Memory size: 512MB`,
      `Flash: 256MB`,
    ]
  }

  private dispIpInterface(): string[] {
    const lines: string[] = []
    for (const iface of this.dev.interfaces.values()) {
      const name = internalToVendorIf(iface.name, 'Huawei')
      lines.push(`${name}`)
      lines.push(`  Internet Address is ${iface.ip ? `${iface.ip}/${iface.prefixLen}` : 'not assigned'}`)
      lines.push(`  Broadcast address is 255.255.255.255`)
      lines.push(`  The Maximum Transmit Unit is 1500 bytes`)
      lines.push(`  input packets : 0, bytes : 0`)
      lines.push(`  output packets : 0, bytes : 0`)
      lines.push('')
    }
    return lines
  }
}

// ─── Huawei VRP Switch ────────────────────────────────────────────────────────
export class HuaweiSwitchCLI implements BrandCLI {
  private mode: 'user' | 'system' | 'interface' = 'user'
  private currentPort: string | null = null

  constructor(private dev: SwitchDevice) {}

  getBanner(): string[] {
    return [
      '\x1b[90m',
      `        Huawei Versatile Routing Platform Software`,
      `        VRP (R) software, Version 5.160 (S5735 V200R019C10SPC500)`,
      `        Copyright (C) 2011-2021 HUAWEI TECH CO., LTD`,
      '\x1b[0m',
      '',
    ]
  }

  private prompt(): string {
    const n = this.dev.name
    if (this.mode === 'user') return `\x1b[36m<${n}>\x1b[0m`
    if (this.mode === 'interface' && this.currentPort) {
      const p = internalToVendorPort(this.currentPort, 'Huawei')
      return `\x1b[36m[${n}-${p}]\x1b[0m`
    }
    return `\x1b[36m[${n}]\x1b[0m`
  }

  execute(raw: string): string[] {
    const cmd = raw.trim()
    if (!cmd) return [this.prompt()]

    if (this.mode === 'user') {
      if (cmd === 'system-view' || cmd === 'sys') { this.mode = 'system'; return ['Enter system view, return user view with Ctrl+Z.', this.prompt()] }
      if (cmd.startsWith('display ')) return [...this.display(cmd.slice(8).trim()), this.prompt()]
      if (cmd === 'quit') return ['Connection closed.']
      return [`\x1b[31mError: Unrecognized command.\x1b[0m`, this.prompt()]
    }

    if (this.mode === 'system') {
      if (cmd === 'quit' || cmd === 'return') { this.mode = 'user'; return ['Return to user view.', this.prompt()] }
      if (cmd.startsWith('interface ') || cmd.startsWith('int ')) {
        const raw2 = cmd.replace(/^interface |^int /, '').trim()
        const internal = vendorToInternalPort(raw2, 'Huawei')
        if (!this.dev.ports.includes(internal)) return [`\x1b[31mError: Interface does not exist.\x1b[0m`, this.prompt()]
        this.currentPort = internal
        this.mode = 'interface'
        return [this.prompt()]
      }
      if (cmd.startsWith('sysname ')) { this.dev.name = cmd.slice(8).trim(); return [this.prompt()] }
      if (cmd.startsWith('display ')) return [...this.display(cmd.slice(8).trim()), this.prompt()]
      if (cmd === 'clear mac-address dynamic') { this.dev.macTable.clear(); return ['Info: Operation succeeded.', this.prompt()] }
      return [`\x1b[31mError: Unrecognized command.\x1b[0m`, this.prompt()]
    }

    if (this.mode === 'interface') {
      if (cmd === 'quit') { this.mode = 'system'; this.currentPort = null; return [this.prompt()] }
      if (cmd === 'return') { this.mode = 'user'; this.currentPort = null; return [this.prompt()] }
      if (cmd === 'undo shutdown') return [`\x1b[36mInfo: Interface ${this.currentPort} is not shutdown.\x1b[0m`, this.prompt()]
      if (cmd === 'shutdown') return [`\x1b[33mWarning: Interface ${this.currentPort} has been shutdown.\x1b[0m`, this.prompt()]
      if (cmd.startsWith('port link-type') || cmd.startsWith('port default vlan') || cmd.startsWith('description ')) return [this.prompt()]
      if (cmd.startsWith('display ')) return [...this.display(cmd.slice(8).trim()), this.prompt()]
      return [`\x1b[31mError: Unrecognized command.\x1b[0m`, this.prompt()]
    }

    return [this.prompt()]
  }

  private display(sub: string): string[] {
    if (sub === 'mac-address' || sub === 'mac-address all') return this.dispMac()
    if (sub === 'interface brief' || sub === 'int brief') return this.dispIntBrief()
    if (sub === 'version') return ['Huawei VRP (R) software, Version 5.160 (S5735 V200R019)']
    if (sub === 'vlan' || sub === 'vlan all') return ['VLAN 1: default, active, ports: all']
    if (sub === 'clock') return [`${new Date().toISOString().replace('T', ' ').slice(0, 19)}`, `Time Zone : UTC`]
    if (sub === 'users') return ['  User-Intf    Delay    Type   Network Address     AuthenStatus    AuthorcmdFlag', '+ 0   CON 0   00:00:00                                                  no        ']
    if (sub === 'memory' || sub === 'memory-usage') return ['  System Total Memory Is: 268435456 bytes', '  Memory Using Percentage Is: 35%']
    if (sub === 'cpu-usage') return ['  CPU Usage            : 3% Max: 12%']
    if (sub === 'logbuffer' || sub === 'log') return ['Logging buffer configuration and contents:', 'Log buffer size: 1024']
    if (sub === 'history-command' || sub === 'history') return ['  1  display mac-address', '  2  display vlan']
    if (sub === 'device') return ['Slot #    Type                Online    Register      Status      Primary   ', '0         S5735               Present   Registered    Normal      Master    ']
    return [`\x1b[31mError: Unrecognized command: display ${sub}\x1b[0m`]
  }

  private dispMac(): string[] {
    const lines = [
      'MAC address table of slot 0:',
      '-------------------------------------------------------------------------------',
      'MAC Address    VLAN/VSI/BD   Learned-From        Type             Aging',
      '-------------------------------------------------------------------------------',
    ]
    for (const e of this.dev.macTable.values()) {
      const port = internalToVendorPort(e.port, 'Huawei')
      lines.push(`${e.mac}  1             ${port.padEnd(20)}dynamic          aging`)
    }
    if (!this.dev.macTable.size) lines.push('(No MAC addresses learned)')
    lines.push('-------------------------------------------------------------------------------')
    lines.push(`Total items: ${this.dev.macTable.size}`)
    return lines
  }

  private dispIntBrief(): string[] {
    const lines = [
      '*down: administratively down',
      '',
      'Interface            PHY   Protocol InUti OutUti   inErrors  outErrors',
    ]
    for (const port of this.dev.ports) {
      const name = internalToVendorPort(port, 'Huawei').padEnd(21)
      lines.push(`${name}up    up         0%    0%           0          0`)
    }
    return lines
  }
}
