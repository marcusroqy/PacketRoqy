import type { SwitchDevice } from '../../devices/switch'
import type { SwitchBrandCLI } from './base'

export class JuniperSwitchCLI implements SwitchBrandCLI {
  mode = 'operational'
  currentPorts: string[] = []
  currentVlan = 0
  vlans: Map<number, string> = new Map([[1, 'default']])
  portVlan: Map<string, number>
  portMode: Map<string, 'access' | 'trunk'>

  constructor(readonly dev: SwitchDevice) {
    this.portVlan = new Map(dev.ports.map(p => [p, 1]))
    this.portMode = new Map(dev.ports.map(p => [p, 'access' as const]))
  }

  getPrompt(): string {
    const n = this.dev.name
    if (this.mode === 'operational') return `\x1b[33m${n}>\x1b[0m `
    return `\x1b[90m[edit]\x1b[0m\n\x1b[33m${n}#\x1b[0m `
  }

  getBanner(): string[] {
    return [
      '',
      '\x1b[33mJunos 21.2R1.10',
      'Copyright (c) 1996-2021 Juniper Networks, Inc.\x1b[0m',
      '',
      `\x1b[90mType '\x1b[0mconfigure\x1b[90m' to enter configuration mode.\x1b[0m`,
      '',
    ]
  }

  execute(cmd: string): string[] {
    const p = this.getPrompt()

    if (this.mode === 'operational') {
      if (cmd === 'configure' || cmd === 'configure exclusive') { this.mode = 'configuration'; return [this.getPrompt()] }
      if (cmd === 'show ethernet-switching table' || cmd === 'show l2-learning mac-table') return [...this.dev.macTableOut('juniper'), p]
      if (cmd === 'show interfaces' || cmd === 'show interfaces terse') return [...this.portsOut(), p]
      if (cmd.startsWith('show interfaces ')) {
        const ifName = cmd.split(' ')[2]
        return [...this.portsOutDetail(ifName), p]
      }
      if (cmd === 'show vlans') return [...this.vlanOut(), p]
      if (cmd === 'show version') return [...this.showVersion(), p]
      if (cmd === 'show system uptime') return [...this.showUptime(), p]
      if (cmd === 'show chassis hardware') return [...this.showChassis(), p]
      if (cmd === 'show spanning-tree bridge' || cmd === 'show spanning-tree') return [...this.showStp(), p]
      if (cmd === 'show spanning-tree interface') return [...this.showStpInterface(), p]
      if (cmd === 'show lacp interfaces') return ['LACP not configured.', p]
      if (cmd === 'show lldp neighbors') return [...this.showLldp(), p]
      if (cmd === 'show pfe statistics traffic') {
        return [
          'Packet Forwarding Engine traffic statistics:',
          '  Input  packets              : 0',
          '  Output packets              : 0',
          '  Input  bytes                : 0',
          '  Output bytes                : 0',
          p,
        ]
      }
      if (cmd === 'clear ethernet-switching table') { this.dev.macTable.clear(); return ['MAC table cleared.', p] }
      if (cmd === 'request system reboot') return [
        'Reboot the system ? [yes,no] (no) yes',
        'Rebooting... (simulation: state preserved)',
        p,
      ]
      if (cmd === '?' || cmd === 'help') return [
        '  configure                          Config mode',
        '  show version                       Software version',
        '  show system uptime                 System uptime',
        '  show chassis hardware              Hardware inventory',
        '  show ethernet-switching table      MAC table',
        '  show interfaces [terse]            Port status',
        '  show interfaces <if>               Port detail',
        '  show vlans                         VLAN list',
        '  show spanning-tree bridge          STP info',
        '  show lldp neighbors                LLDP neighbors',
        '  clear ethernet-switching table     Clear MAC table',
        p,
      ]
      return [`error: unknown command: ${cmd}`, p]
    }

    // configuration mode
    if (cmd === 'exit' || cmd === 'quit') { this.mode = 'operational'; return ['Exiting configuration mode', this.getPrompt()] }
    if (cmd === 'commit') return ['commit complete', p]
    if (cmd.startsWith('set system host-name ')) { this.dev.name = cmd.slice(21).trim(); return [p] }
    if (cmd.startsWith('set vlans ')) {
      const m = cmd.match(/^set vlans (\S+) vlan-id (\d+)$/)
      if (!m) return ['error: usage: set vlans <name> vlan-id <id>', p]
      this.vlans.set(parseInt(m[2]), m[1]); return [p]
    }
    if (cmd.startsWith('delete vlans ')) {
      const m = cmd.match(/^delete vlans (\S+)$/)
      if (m) {
        for (const [id, name] of this.vlans) { if (name === m[1]) { this.vlans.delete(id); break } }
        return [p]
      }
    }
    if (cmd.startsWith('set interfaces ')) {
      const portModeM = cmd.match(/^set interfaces (\S+).*port-mode (access|trunk)$/)
      if (portModeM) {
        const port = this.dev.ports.find(pp => pp === portModeM[1])
        if (port) this.portMode.set(port, portModeM[2] as 'access' | 'trunk')
        return [p]
      }
      const vlanM = cmd.match(/^set interfaces (\S+).*vlan members (\S+)$/)
      if (vlanM) {
        for (const [id, name] of this.vlans) {
          if (name === vlanM[2] || String(id) === vlanM[2]) {
            const port = this.dev.ports.find(pp => pp === vlanM[1])
            if (port) this.portVlan.set(port, id)
            break
          }
        }
        return [p]
      }
      return [p]
    }
    if (cmd.startsWith('run ')) {
      const sub = cmd.slice(4).trim()
      return [...this.execute(sub)]
    }
    if (cmd === '?' || cmd === 'help') return [
      '  set system host-name <name>',
      '  set vlans <name> vlan-id <id>',
      '  delete vlans <name>',
      '  set interfaces <if> unit 0 family ethernet-switching port-mode access|trunk',
      '  set interfaces <if> unit 0 family ethernet-switching vlan members <name>',
      '  run show <...>',
      '  commit',
      '  exit',
      p,
    ]
    return [`error: unknown command: ${cmd}`, p]
  }

  private showVersion(): string[] {
    const portCount = this.dev.ports.length
    const model = portCount >= 48 ? 'EX4300-48T' : portCount >= 24 ? 'EX4300-24T' : 'EX2300-12T'
    return [
      `Junos: 21.2R1.10`,
      `JUNOS EX  Software Suite [21.2R1.10]`,
      `JUNOS Base OS boot [21.2R1.10]`,
      '',
      `Model: ${model}`,
      `Junos: 21.2R1.10`,
      `BIOS: 1.7.0`,
      `Base OS: junos-21.2R1.10-domestic`,
      '',
      `${this.dev.name}`,
    ]
  }

  private showUptime(): string[] {
    return [
      `Current time: ${new Date().toUTCString()}`,
      `System booted: 0:00:01 ago`,
      `Protocols started: 0:00:00 ago`,
      '',
      `System uptime: 0 days, 0 hours, 0 minutes, 1 second`,
    ]
  }

  private showChassis(): string[] {
    const portCount = this.dev.ports.length
    const model = portCount >= 48 ? 'EX4300-48T' : portCount >= 24 ? 'EX4300-24T' : 'EX2300-12T'
    const serial = 'BM' + Math.floor(Math.random() * 9000000000 + 1000000000)
    return [
      'Hardware inventory:',
      `Item             Version  Part number  Serial number     Description`,
      `Chassis                               ${serial}          ${model}`,
      `Midplane                                                  EX4300 48-port`,
      `Routing Engine   REV 05   750-043468   ${serial.slice(0,10)}  EX4300 RE`,
      `CB 0             REV 02   711-043471   ${serial.slice(0,10)}  EX4300 Switch Fabric Board`,
      `FPC 0            REV 11   750-043468   ${serial.slice(0,10)}  EX4300-48T`,
      `  PIC 0                   BUILTIN      BUILTIN            ${portCount}x 10/100/1000BASE-T`,
      `Fan Tray 0                                                 Fan Tray`,
      `Power Supply 0   Rev 03   740-041521   ${serial.slice(0,9)}   650W AC`,
    ]
  }

  private showStp(): string[] {
    const mac = Array(6).fill(0).map(() => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':')
    return [
      'STP bridge parameters:',
      `Context identifier  : 0`,
      `Enabled             : Y`,
      `Force Version       : rstp`,
      `Config Ident        : { 32768, ${mac} }`,
      `Current Root        : { 32768, ${mac} }`,
      `Root port           : -`,
      `Root Cost           : 0`,
      `Topology Changes    : 0`,
      `Time Since Last TC  : 0 sec`,
      `Root Max Age        : 20`,
      `Root Hello Time     : 2`,
      `Root Forward Delay  : 15`,
    ]
  }

  private showStpInterface(): string[] {
    const lines = ['STP interface parameters:', '']
    for (const pp of this.dev.ports.slice(0, 4)) {
      lines.push(`Interface name: ${pp}`)
      lines.push(`  Port ID: 128.${this.dev.ports.indexOf(pp) + 1}`)
      lines.push(`  Designated port ID: 128.${this.dev.ports.indexOf(pp) + 1}`)
      lines.push(`  Port Cost: 20000`)
      lines.push(`  Port State: Forwarding`)
      lines.push(`  Port Role: Designated`)
      lines.push(``)
    }
    return lines
  }

  private showLldp(): string[] {
    const lines = ['LLDP Neighbor Information:', '']
    if (this.dev.macTable.size === 0) {
      lines.push('(no LLDP neighbors)')
      return lines
    }
    lines.push('Local Interface    Parent Interface  Chassis Id          Port info          System Name')
    for (const [, entry] of this.dev.macTable) {
      lines.push(`${entry.port.padEnd(19)}-                 ${entry.mac}  -                  -`)
    }
    return lines
  }

  private portsOut(): string[] {
    const lines = ['Interface   Admin Link  Speed    Duplex    VLAN']
    for (const pp of this.dev.ports) {
      const vlan = this.portVlan.get(pp) ?? 1
      lines.push(`${pp.padEnd(12)}up    up    1000mbps full      ${vlan}`)
    }
    return lines
  }

  private portsOutDetail(ifName: string): string[] {
    const pp = this.dev.ports.find(p => p === ifName) ?? this.dev.ports[0]
    if (!pp) return ['error: interface not found']
    const vlan = this.portVlan.get(pp) ?? 1
    const mode = this.portMode.get(pp) ?? 'access'
    return [
      `Physical interface: ${pp}, Enabled, Physical link is Up`,
      `  Interface index: ${this.dev.ports.indexOf(pp) + 1}`,
      `  Speed: 1000mbps, Duplex: Full-Duplex, VLAN: ${vlan}, Mode: ${mode}`,
      `  Link-level type: Ethernet, MTU: 1518, MRU: 1526`,
      `  Current address: 00:00:5e:00:01:${String(this.dev.ports.indexOf(pp)+1).padStart(2,'0')}`,
      `  Last flapped   : Never`,
      ``,
      `  Ethernet Switching:`,
      `    Interface mode: ${mode}`,
      `    VLAN members: ${vlan}`,
      ``,
      `  Traffic statistics:`,
      `    Input  bytes  : 0`,
      `    Output bytes  : 0`,
      `    Input  packets: 0`,
      `    Output packets: 0`,
    ]
  }

  private vlanOut(): string[] {
    const lines = ['Name              Tag   Interfaces', '']
    for (const [id, name] of this.vlans) {
      const ports = this.dev.ports.filter(pp => this.portVlan.get(pp) === id).join(', ')
      lines.push(`${name.padEnd(18)}${String(id).padEnd(6)}${ports}`)
    }
    return lines
  }

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    let pool: string[] = []
    if (this.mode === 'operational') pool = [
      'configure',
      'show version', 'show system uptime', 'show chassis hardware',
      'show ethernet-switching table', 'show l2-learning mac-table',
      'show interfaces', 'show interfaces terse',
      ...this.dev.ports.map(pp => `show interfaces ${pp}`),
      'show vlans',
      'show spanning-tree bridge', 'show spanning-tree interface',
      'show lacp interfaces', 'show lldp neighbors',
      'show pfe statistics traffic',
      'clear ethernet-switching table',
      'request system reboot',
      '?',
    ]
    else pool = [
      'commit', 'exit', 'quit',
      'set system host-name ',
      'set vlans ', 'delete vlans ',
      ...this.dev.ports.map(pp => `set interfaces ${pp} unit 0 family ethernet-switching port-mode access`),
      ...this.dev.ports.map(pp => `set interfaces ${pp} unit 0 family ethernet-switching port-mode trunk`),
      ...this.dev.ports.map(pp => `set interfaces ${pp} unit 0 family ethernet-switching vlan members `),
      'run show interfaces', 'run show ethernet-switching table', 'run show vlans', '?',
    ]
    return pool.filter(c => c.startsWith(lo))
  }
}
