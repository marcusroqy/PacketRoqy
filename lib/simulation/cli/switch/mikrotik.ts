import type { SwitchDevice } from '../../devices/switch'
import type { SwitchBrandCLI } from './base'
import { generateMac } from '../../ip-utils'

export class MikroTikSwitchCLI implements SwitchBrandCLI {
  mode = 'user'
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
    return `\x1b[34m[admin@${this.dev.name}] >\x1b[0m `
  }

  getBanner(): string[] {
    return [
      '',
      '\x1b[34mMikroTik RouterOS 7.9.2\x1b[0m  \x1b[90m(c) 1999-2023 MikroTik\x1b[0m',
      '\x1b[90mType \x1b[0m?\x1b[90m for help.\x1b[0m',
      '',
    ]
  }

  execute(cmd: string): string[] {
    const p = this.getPrompt()

    // Interface
    if (cmd === '/interface print' || cmd === '/interface ethernet print') return [...this.portsOut(), p]
    if (cmd === '/interface ethernet print detail') return [...this.portsDetail(), p]

    // Bridge / MAC
    if (cmd === '/bridge print') return [...this.bridgePrint(), p]
    if (cmd === '/bridge port print') return [...this.bridgePortPrint(), p]
    if (cmd === '/bridge host print' || cmd === '/interface bridge host print') return [...this.dev.macTableOut('mikrotik'), p]
    if (cmd === '/bridge host flush' || cmd === '/interface bridge host flush') { this.dev.macTable.clear(); return ['MAC table cleared.', p] }

    // VLAN
    if (cmd === '/interface vlan print') return [...this.vlanOut(), p]
    if (cmd === '/interface bridge vlan print') return [...this.bridgeVlanPrint(), p]
    const vlanAdd = cmd.match(/^\/interface vlan add\b/)
    if (vlanAdd) {
      const nameM = cmd.match(/name=(\S+)/), idM = cmd.match(/vlan-id=(\d+)/)
      if (nameM && idM) { this.vlans.set(parseInt(idM[1]), nameM[1]); return [p] }
      return ['usage: /interface vlan add name=<name> vlan-id=<id> interface=<port>', p]
    }

    // Port enable/disable
    const en = cmd.match(/^\/interface enable (\S+)$/)
    if (en) {
      if (!this.dev.ports.includes(en[1])) return [`failure: no such item (line 1 column 22)`, p]
      return [p]
    }
    const dis = cmd.match(/^\/interface disable (\S+)$/)
    if (dis) {
      if (!this.dev.ports.includes(dis[1])) return [`failure: no such item (line 1 column 23)`, p]
      return [p]
    }

    // System
    const sysId = cmd.match(/^\/system identity set name=(.+)$/)
    if (sysId) { this.dev.name = sysId[1].trim(); return [p] }
    if (cmd === '/system identity print') return [`name: ${this.dev.name}`, p]

    if (cmd === '/system resource print') return [...this.sysResource(), p]
    if (cmd === '/system clock print') {
      const d = new Date()
      return [
        `      time: ${d.toTimeString().split(' ')[0]}`,
        `      date: ${d.toISOString().split('T')[0]}`,
        `  time-zone-name: UTC`,
        p,
      ]
    }
    if (cmd === '/system routerboard print') {
      return [
        `       routerboard: yes`,
        `             model: CRS${this.dev.ports.length}G-${this.dev.ports.length}S+2Q+RM`,
        `     serial-number: HEX${Math.floor(Math.random()*1e9).toString(16).toUpperCase().padStart(9,'0')}`,
        `  firmware-version: 7.9.2`,
        `       factory-firmware: 7.9.2`,
        p,
      ]
    }

    if (cmd === '/log print') return [
      '  0 info    system,info router rebooted',
      `  1 info    interface,info ether1 link up`,
      p,
    ]

    if (cmd === '/ip address print') {
      return ['Flags: X - disabled, I - invalid, D - dynamic', ' # ADDRESS         NETWORK         INTERFACE', '', '(no IP addresses configured — use /ip address add)', p]
    }
    const ipAddrAdd = cmd.match(/^\/ip address add address=(\S+) interface=(\S+)$/)
    if (ipAddrAdd) {
      return [p]
    }

    if (cmd === '/port print') return [...this.portPrint(), p]

    if (cmd === '/export' || cmd === '/export compact') return [...this.exportConfig(), p]

    if (cmd === '?' || cmd === 'help') return [
      '\x1b[36m── Interface ───────────────────────────────────────────────────\x1b[0m',
      '  /interface print                     Port list',
      '  /interface ethernet print detail     Detailed port info',
      '  /interface enable <port>             Enable port',
      '  /interface disable <port>            Disable port',
      '  /interface vlan print                VLAN list',
      '  /interface vlan add name=<n> vlan-id=<id> interface=<port>',
      '\x1b[36m── Bridge ──────────────────────────────────────────────────────\x1b[0m',
      '  /bridge print                        Bridge list',
      '  /bridge port print                   Bridge ports',
      '  /bridge host print                   MAC table',
      '  /bridge host flush                   Clear MAC table',
      '  /interface bridge vlan print         Bridge VLAN table',
      '\x1b[36m── System ──────────────────────────────────────────────────────\x1b[0m',
      '  /system resource print               CPU, memory, uptime',
      '  /system clock print                  Date and time',
      '  /system identity print               Hostname',
      '  /system identity set name=<name>     Set hostname',
      '  /system routerboard print            Board info',
      '  /log print                           System log',
      '  /export                              Running config',
      p,
    ]
    return [`bad command name "${cmd.split(' ')[0]}" (line 1 column 1)`, p]
  }

  private sysResource(): string[] {
    return [
      `                   uptime: 0d 00:00:01`,
      `                  version: 7.9.2 (stable)`,
      `               build-time: Jan/01/2024 00:00:00`,
      `         factory-software: 7.9.2`,
      `              free-memory: 900.0MiB`,
      `             total-memory: 1024.0MiB`,
      `                      cpu: ARMv7`,
      `              cpu-count: 4`,
      `          cpu-frequency: 800MHz`,
      `               cpu-load: 2%`,
      `         free-hdd-space: 64.0MiB`,
      `        total-hdd-space: 128.0MiB`,
      `  write-sect-since-reboot: 0`,
      `         write-sect-total: 0`,
      `        bad-blocks: 0`,
      `  architecture-name: arm`,
      `         board-name: CRS${this.dev.ports.length}G-${this.dev.ports.length}S+2Q+RM`,
      `           platform: MikroTik`,
    ]
  }

  private bridgePrint(): string[] {
    return [
      'Flags: X - disabled, R - running',
      ' #   NAME      MTU   ARP       VLAN-FILTERING  MAC-ADDRESS',
      '',
      ' R   bridge    1500  enabled   yes             00:00:00:00:00:01',
    ]
  }

  private bridgePortPrint(): string[] {
    const lines = ['Flags: X - disabled, I - inactive, D - dynamic, H - hw-offload', ' #    INTERFACE   BRIDGE  HW   PVID  PRIORITY  PATH-COST  INTERNAL-PATH-COST  HORIZON', '']
    this.dev.ports.forEach((pp, i) => {
      const vlan = this.portVlan.get(pp) ?? 1
      lines.push(` H ${String(i).padEnd(4)} ${pp.padEnd(12)}bridge  yes  ${String(vlan).padEnd(6)}0x80      10         10                  none`)
    })
    return lines
  }

  private bridgeVlanPrint(): string[] {
    const lines = ['  VLAN  CURRENT-TAGGED  CURRENT-UNTAGGED', '']
    const seen = new Set<number>()
    for (const p of this.dev.ports) {
      const v = this.portVlan.get(p) ?? 1
      if (!seen.has(v)) {
        seen.add(v)
        const untagged = this.dev.ports.filter(pp => this.portVlan.get(pp) === v && (this.portMode.get(pp) ?? 'access') === 'access').join(', ')
        lines.push(`  ${String(v).padEnd(6)}                ${untagged}`)
      }
    }
    return lines
  }

  private portPrint(): string[] {
    const lines = ['Flags: I - inactive', ' #   NAME    AUTO-NEGOTIATION  SPEED      DUPLEX     TX-FLOW-CONTROL  RX-FLOW-CONTROL  ADVERTISE', '']
    this.dev.ports.forEach((pp, i) => {
      lines.push(` ${String(i).padEnd(4)} ${pp.padEnd(8)}yes               1Gbps      full       no               no               10M-full,100M-full,1000M-full`)
    })
    return lines
  }

  private exportConfig(): string[] {
    const lines = [
      `# RouterOS 7.9.2`,
      `# model = CRS${this.dev.ports.length}G-${this.dev.ports.length}S+2Q+RM`,
      `/interface bridge`,
      `add name=bridge vlan-filtering=yes`,
      `/interface bridge port`,
    ]
    for (const pp of this.dev.ports) {
      const vlan = this.portVlan.get(pp) ?? 1
      lines.push(`add bridge=bridge interface=${pp} pvid=${vlan}`)
    }
    for (const [id, name] of this.vlans) {
      if (id === 1) continue
      lines.push(`/interface bridge vlan`)
      lines.push(`add bridge=bridge comment="${name}" tagged=bridge vlan-ids=${id}`)
    }
    lines.push(`/system identity`)
    lines.push(`set name=${this.dev.name}`)
    return lines
  }

  private portsOut(): string[] {
    const lines = ['Flags: X - disabled, R - running', ' #   NAME       TYPE   MTU   MAC-ADDRESS        LAST-LINK-UP-TIME', '']
    this.dev.ports.forEach((pp, i) => lines.push(` R ${String(i).padEnd(4)} ${pp.padEnd(11)}ether  1500  ${generateMac()}  jan/01/2024 00:00:01`))
    return lines
  }

  private portsDetail(): string[] {
    const lines: string[] = []
    this.dev.ports.forEach((pp, i) => {
      lines.push(`        name: ${pp}`)
      lines.push(`    mac-address: ${generateMac()}`)
      lines.push(`         type: ether`)
      lines.push(`          mtu: 1500`)
      lines.push(`        speed: 1Gbps`)
      lines.push(`  full-duplex: yes`)
      lines.push(`auto-negotiate: yes`)
      lines.push(` rx-bytes: 0  tx-bytes: 0`)
      if (i < this.dev.ports.length - 1) lines.push('')
    })
    return lines
  }

  private vlanOut(): string[] {
    const lines = [' # NAME     VLAN-ID  INTERFACE', '']
    let i = 0
    for (const [id, name] of this.vlans) {
      const ports = this.dev.ports.filter(pp => this.portVlan.get(pp) === id).join(',')
      lines.push(` ${String(i++).padEnd(3)}${name.padEnd(9)}${String(id).padEnd(9)}${ports}`)
    }
    return lines
  }

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    const pool = [
      '/interface print',
      '/interface ethernet print',
      '/interface ethernet print detail',
      '/interface vlan print', '/interface vlan add ',
      '/interface bridge vlan print',
      '/bridge print',
      '/bridge port print',
      '/bridge host print', '/bridge host flush',
      '/port print',
      '/ip address print', '/ip address add ',
      '/system resource print',
      '/system clock print',
      '/system identity print', '/system identity set name=',
      '/system routerboard print',
      '/log print',
      '/export', '/export compact',
      ...this.dev.ports.map(pp => '/interface enable ' + pp),
      ...this.dev.ports.map(pp => '/interface disable ' + pp),
      '?', 'help',
    ]
    return pool.filter(c => c.startsWith(lo))
  }
}
