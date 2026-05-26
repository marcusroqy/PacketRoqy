import { BaseDevice } from '../engine'
import type { EthernetFrame, MacTableEntry, SwitchSnapshot } from '../types'
import { generateMac } from '../ip-utils'
import { CiscoSwitchCLI } from '../cli/switch/cisco'
import { HuaweiSwitchCLI } from '../cli/switch/huawei'
import { JuniperSwitchCLI } from '../cli/switch/juniper'
import { MikroTikSwitchCLI } from '../cli/switch/mikrotik'
import type { SwitchBrandCLI } from '../cli/switch/base'

export class SwitchDevice extends BaseDevice {
  brand: string
  ports: string[] = []
  macTable: Map<string, MacTableEntry> = new Map()
  readonly cli: SwitchBrandCLI

  constructor(id: string, name: string, portCount = 8, brand = 'Cisco') {
    super(id, 'switch', name)
    this.brand = brand
    for (let i = 1; i <= portCount; i++) this.ports.push(this.buildPort(i))
    this.cli = SwitchDevice.createCLI(this)
  }

  private static createCLI(dev: SwitchDevice): SwitchBrandCLI {
    switch (dev.brand) {
      case 'Huawei':   return new HuaweiSwitchCLI(dev)
      case 'Juniper':  return new JuniperSwitchCLI(dev)
      case 'MikroTik': return new MikroTikSwitchCLI(dev)
      default:         return new CiscoSwitchCLI(dev)
    }
  }

  private buildPort(i: number): string {
    if (this.brand === 'Huawei')   return `GigabitEthernet0/0/${i}`
    if (this.brand === 'Juniper')  return `ge-0/0/${i - 1}`
    if (this.brand === 'MikroTik') return `ether${i}`
    return `GigabitEthernet0/${i}`
  }

  receiveFrame(ifName: string, frame: EthernetFrame): void {
    if (!this.ports.includes(ifName)) return
    this.macTable.set(frame.srcMac, { mac: frame.srcMac, port: ifName })
    this.log({ type: 'ip-fwd', srcDevice: this.name, dstDevice: '', srcMac: frame.srcMac, dstMac: frame.dstMac, detail: `Switch ${this.name}: learned ${frame.srcMac} on ${ifName}` })
    if (frame.dstMac === 'ff:ff:ff:ff:ff:ff') {
      this.flood(ifName, frame)
    } else {
      const entry = this.macTable.get(frame.dstMac)
      if (entry && entry.port !== ifName) this.sendFrame(entry.port, frame)
      else if (!entry) this.flood(ifName, frame)
    }
  }

  private flood(inPort: string, frame: EthernetFrame): void {
    for (const port of this.ports) { if (port !== inPort) this.sendFrame(port, frame) }
  }

  // ─── CLI delegation ───────────────────────────────────────────────────────

  executeCommand(raw: string): string[] { return this.cli.execute(raw.trim()) }
  getPrompt(): string { return this.cli.getPrompt() }
  getBanner(): string[] { return this.cli.getBanner() }
  getCompletions(partial: string): string[] { return this.cli.getCompletions(partial) }

  // ─── Shared helpers (used by CLI classes) ────────────────────────────────

  parsePortList(raw: string): string[] {
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
        for (let i = start; i <= end; i++) {
          const name = this.resolvePort(prefix + i)
          if (name) result.push(name)
        }
      } else {
        const name = this.resolvePort(part)
        if (name) result.push(name)
      }
    }
    return [...new Set(result)]
  }

  shortPort(p: string): string {
    return p.replace('GigabitEthernet', 'Gi').replace('FastEthernet', 'Fa')
  }

  resolvePort(s: string): string | null {
    if (this.ports.includes(s)) return s
    const lo = s.toLowerCase()
    for (const p of this.ports) {
      if (p.toLowerCase() === lo || this.shortPort(p).toLowerCase() === lo) return p
    }
    const m = lo.match(/^(?:gi|g|gigabitethernet)(\d+\/\d+)$/)
    if (m) {
      const full = `GigabitEthernet${m[1]}`
      if (this.ports.includes(full)) return full
    }
    return null
  }

  macTableOut(style: string): string[] {
    const entries = Array.from(this.macTable.values())
    if (style === 'cisco') {
      const lines = ['Vlan  Mac Address          Type     Ports', '----  -------------------  -------  -----']
      for (const e of entries) lines.push(`1     ${e.mac}  DYNAMIC  ${this.shortPort(e.port)}`)
      if (!entries.length) lines.push('MAC table empty.')
      return lines
    }
    if (style === 'huawei') {
      const lines = ['MAC Address    VLAN  MLAG  Learned-From   Type', '']
      for (const e of entries) lines.push(`${e.mac}  1     -     ${e.port.padEnd(15)}dynamic`)
      if (!entries.length) lines.push('(MAC table empty)')
      return lines
    }
    if (style === 'juniper') {
      const lines = [
        'Ethernet switching table:', ` ${entries.length} entries, ${entries.length} learned`, '',
        'MAC flags (D - dynamic, L - local)',
        'Routing instance : default-switch',
        '  Vlan              MAC                 Age  Interface',
        '',
      ]
      for (const e of entries) lines.push(`  default           ${e.mac}  -    ${e.port}`)
      if (!entries.length) lines.push('  (empty)')
      return lines
    }
    // mikrotik
    const lines = [' # BRIDGE  MAC-ADDRESS       ON-INTERFACE  AGE', '']
    entries.forEach((e, i) => lines.push(` ${String(i).padEnd(2)} bridge  ${e.mac}  ${e.port.padEnd(14)}10`))
    if (!entries.length) lines.push('(empty)')
    return lines
  }

  // ─── Serialization ────────────────────────────────────────────────────────

  takeSnapshot(id: string): SwitchSnapshot {
    return {
      type: 'switch',
      id,
      name: this.name,
      brand: this.brand,
      portCount: this.ports.length,
      mode: this.cli.mode,
      macTable: Array.from(this.macTable.values()),
    }
  }

  restoreState(snap: SwitchSnapshot): void {
    this.name = snap.name
    this.cli.mode = snap.mode
    this.macTable.clear()
    for (const e of snap.macTable) this.macTable.set(e.mac, e)
  }
}
