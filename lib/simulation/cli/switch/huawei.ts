import type { SwitchDevice } from '../../devices/switch'
import type { SwitchBrandCLI } from './base'
import { isValidIp, isValidMask, maskToPrefixLen, prefixLenToMask, generateMac } from '../../ip-utils'

interface SviInfo { ip?: string; prefix?: number; status: 'up' | 'down'; description?: string }
interface EthTrunk { id: number; mode: 'lacp-dynamic' | 'lacp-static' | 'manual'; ports: string[] }

export class HuaweiSwitchCLI implements SwitchBrandCLI {
  mode = 'user'
  currentPorts: string[] = []
  currentVlan = 0
  vlans: Map<number, string> = new Map([[1, 'default']])
  portVlan: Map<string, number>
  portMode: Map<string, 'access' | 'trunk'>
  private portTrunkAllowed: Map<string, Set<number>> = new Map()
  private portTrunkPvid: Map<string, number> = new Map()

  // L3 state
  private ipRoutingEnabled = false
  private sviInterfaces: Map<number, SviInfo> = new Map()
  private staticRoutes: Array<{network: string; prefix: number; nextHop: string}> = []
  private ospfNetworks: Array<{ip: string; wildcard: string; area: number}> = []
  private ospfProcessId = 0
  private ospfRouterId?: string

  // EtherTrunk / LACP
  private ethTrunks: Map<number, EthTrunk> = new Map()
  private portEthTrunk: Map<string, number> = new Map()

  // STP
  private stpMode: 'stp' | 'rstp' | 'mstp' = 'mstp'
  private stpEnabled = true
  private stpPriority: Map<number, number> = new Map()

  // Routing context
  private routerProto = ''

  constructor(readonly dev: SwitchDevice) {
    this.portVlan = new Map(dev.ports.map(p => [p, 1]))
    this.portMode = new Map(dev.ports.map(p => [p, 'access' as const]))
    for (const p of dev.ports) this.portTrunkAllowed.set(p, new Set([1]))
  }

  getPrompt(): string {
    const n = this.dev.name
    if (this.mode === 'user')      return `\x1b[36m<${n}>\x1b[0m`
    if (this.mode === 'system')    return `\x1b[36m[${n}]\x1b[0m`
    if (this.mode === 'interface') {
      const port = this.currentPorts[0] ?? ''
      const shortPort = port.replace('GigabitEthernet', 'GE')
      return `\x1b[36m[${n}-${shortPort}]\x1b[0m`
    }
    if (this.mode === 'vlan')   return `\x1b[36m[${n}-vlan${this.currentVlan}]\x1b[0m`
    if (this.mode === 'ospf')   return `\x1b[36m[${n}-ospf-${this.routerProto}]\x1b[0m`
    return `\x1b[36m<${n}>\x1b[0m`
  }
  private prompt(): string { return this.getPrompt() }

  getBanner(): string[] {
    return [
      '\x1b[36mHuawei Versatile Routing Platform Software',
      'VRP (R) software, Version 5.110 (S5720 V200R011C10SPC600)',
      'Copyright (C) 2011-2019 HUAWEI TECH CO., LTD\x1b[0m',
      '',
      `\x1b[33m${this.dev.name}\x1b[0m uptime is 0 minutes`,
      '',
    ]
  }

  execute(cmd: string): string[] {
    const p = this.prompt()

    if (this.mode === 'user') {
      if (cmd === 'system-view') { this.mode = 'system'; return [this.getPrompt()] }
      if (cmd.startsWith('display ')) return [...this.show(cmd.slice(8).trim()), p]
      if (cmd.startsWith('ping '))    return ['__ASYNC_PING__' + cmd.slice(5).trim()]
      if (cmd === '?' || cmd === 'help') return [
        '  system-view              Enter system view',
        '  display mac-address      MAC table',
        '  display interface        Port status',
        '  display vlan             VLAN info',
        '  display ip routing-table Routing table',
        '  display stp brief        Spanning tree summary',
        '  display eth-trunk        EtherTrunk/LACP summary',
        '  ping <ip>                Ping',
        p,
      ]
      return [`Error: Unrecognized command found at '^' position.`, p]
    }

    if (this.mode === 'system')    return this.execSystem(cmd)
    if (this.mode === 'interface') return this.execInterface(cmd)
    if (this.mode === 'vlan')      return this.execVlan(cmd)
    if (this.mode === 'ospf')      return this.execOspf(cmd)

    return [`Error: Unrecognized command found at '^' position.`, p]
  }

  private execSystem(cmd: string): string[] {
    const p = this.prompt()

    if (cmd === 'quit' || cmd === 'return') { this.mode = 'user'; return [this.getPrompt()] }
    if (cmd.startsWith('sysname ')) { this.dev.name = cmd.slice(8).trim(); return [this.getPrompt()] }
    if (cmd.startsWith('display ')) return [...this.show(cmd.slice(8).trim()), p]
    if (cmd.startsWith('ping '))    return ['__ASYNC_PING__' + cmd.slice(5).trim()]

    if (cmd === 'undo mac-address all' || cmd === 'reset mac-address') {
      this.dev.macTable.clear(); return ['MAC address table cleared.', p]
    }

    // Interface
    if (cmd.startsWith('interface ')) {
      const raw = cmd.slice(10).trim()

      const vlanifM = raw.match(/^[Vv]lanif\s*(\d+)$/)
      if (vlanifM) {
        const vlanId = parseInt(vlanifM[1])
        if (!this.sviInterfaces.has(vlanId)) this.sviInterfaces.set(vlanId, { status: 'down' })
        this.currentVlan = vlanId
        this.currentPorts = [`Vlanif${vlanId}`]
        this.mode = 'interface'; return [this.getPrompt()]
      }

      const trunkM = raw.match(/^[Ee]th-[Tt]runk\s*(\d+)$/)
      if (trunkM) {
        const id = parseInt(trunkM[1])
        if (!this.ethTrunks.has(id)) this.ethTrunks.set(id, { id, mode: 'lacp-dynamic', ports: [] })
        this.currentPorts = [`Eth-Trunk${id}`]
        this.mode = 'interface'; return [this.getPrompt()]
      }

      const names = this.dev.parsePortList(raw)
      const valid = names.filter(n => this.dev.ports.includes(n))
      if (!valid.length) return [`Error: Interface ${raw} not found. Available: ${this.dev.ports.map(pp => pp.replace('GigabitEthernet', 'GE')).join(', ')}`, p]
      this.currentPorts = valid; this.mode = 'interface'; return [this.getPrompt()]
    }

    // VLAN
    if (cmd.match(/^vlan (\d+)$/)) {
      const id = parseInt(cmd.slice(5))
      if (id < 1 || id > 4094) return ['Error: VLAN ID must be between 1 and 4094', p]
      if (!this.vlans.has(id)) this.vlans.set(id, `VLAN${String(id).padStart(4, '0')}`)
      this.currentVlan = id; this.mode = 'vlan'; return [this.getPrompt()]
    }
    if (cmd.startsWith('vlan batch ')) {
      const spec = cmd.slice(11).trim()
      for (const part of spec.split(/\s+/)) {
        const m = part.match(/^(\d+)(?:to|-)(\d+)$/)
        if (m) { for (let i = parseInt(m[1]); i <= parseInt(m[2]); i++) if (!this.vlans.has(i)) this.vlans.set(i, `VLAN${String(i).padStart(4,'0')}`) }
        else if (part.match(/^\d+$/)) { const id = parseInt(part); if (!this.vlans.has(id)) this.vlans.set(id, `VLAN${String(id).padStart(4,'0')}`) }
      }
      return [p]
    }
    if (cmd.match(/^undo vlan (\d+)$/)) {
      const id = parseInt(cmd.slice(10))
      if (id === 1) return ['Error: Cannot delete VLAN 1', p]
      this.vlans.delete(id); return [p]
    }

    // STP
    if (cmd.startsWith('stp mode ')) { this.stpMode = cmd.slice(9).trim() as 'stp'|'rstp'|'mstp'; return [`Info: Spanning tree mode set to ${this.stpMode}.`, p] }
    if (cmd === 'stp enable' || cmd === 'stp global enable')   { this.stpEnabled = true;  return [p] }
    if (cmd === 'undo stp enable' || cmd === 'stp disable') { this.stpEnabled = false; return [p] }
    const stpPriM = cmd.match(/^stp vlan (\d+) priority (\d+)$/)
    if (stpPriM) { this.stpPriority.set(parseInt(stpPriM[1]), parseInt(stpPriM[2])); return [p] }
    const stpRootM = cmd.match(/^stp vlan (\d+) root (primary|secondary)$/)
    if (stpRootM) { this.stpPriority.set(parseInt(stpRootM[1]), stpRootM[2] === 'primary' ? 0 : 4096); return [p] }

    // IP routing
    if (cmd === 'ip routing-enable')      { this.ipRoutingEnabled = true;  return [p] }
    if (cmd === 'undo ip routing-enable') { this.ipRoutingEnabled = false; return [p] }

    // Static routes
    const rtM = cmd.match(/^ip route-static (\S+) (\S+) (\S+)$/)
    if (rtM && isValidIp(rtM[1]) && (isValidMask(rtM[2]) || rtM[2].match(/^\d+$/)) && isValidIp(rtM[3])) {
      const prefix = isValidMask(rtM[2]) ? maskToPrefixLen(rtM[2]) : parseInt(rtM[2])
      this.staticRoutes.push({ network: rtM[1], prefix, nextHop: rtM[3] }); return [p]
    }
    const noRtM = cmd.match(/^undo ip route-static (\S+) (\S+) (\S+)$/)
    if (noRtM) {
      const prefix = isValidMask(noRtM[2]) ? maskToPrefixLen(noRtM[2]) : parseInt(noRtM[2])
      this.staticRoutes = this.staticRoutes.filter(r => !(r.network === noRtM[1] && r.prefix === prefix)); return [p]
    }

    // OSPF
    const ospfM = cmd.match(/^ospf (\d+)$/)
    if (ospfM) {
      this.ospfProcessId = parseInt(ospfM[1]); this.routerProto = ospfM[1]
      this.mode = 'ospf'; return [this.getPrompt()]
    }

    // DHCP
    if (cmd === 'dhcp enable' || cmd === 'dhcp-snooping enable') return [p]

    // Save / misc
    if (cmd === 'save') {
      return [`Warning: The current configuration will be written to the device.`,
              `Are you sure to continue?[Y/N]\x1b[33my\x1b[0m`,
              `\x1b[32mSave the configuration successfully.\x1b[0m`, p]
    }
    if (cmd.startsWith('aaa') || cmd.startsWith('local-user ') || cmd.startsWith('ntp') || cmd.startsWith('snmp-agent') || cmd.startsWith('lldp')) return [p]

    if (cmd === '?' || cmd === 'help') return [
      '  interface <GEX/X/X | Vlanif X | Eth-Trunk X>',
      '  vlan <id>                         VLAN config mode',
      '  vlan batch <id-range>             Create multiple VLANs',
      '  undo vlan <id>                    Delete VLAN',
      '  sysname <name>                    Set hostname',
      '  stp mode stp|rstp|mstp            STP mode',
      '  stp vlan <id> priority <value>    STP VLAN priority',
      '  stp vlan <id> root primary|secondary',
      '  stp enable / undo stp enable',
      '  ip routing-enable                 Enable L3 routing',
      '  ip route-static <dst> <pfx|mask> <nexthop>',
      '  ospf <process-id>                 OSPF config mode',
      '  display mac-address               MAC table',
      '  display interface brief           Interface brief',
      '  display vlan                      VLAN info',
      '  display stp brief                 STP summary',
      '  display eth-trunk                 EtherTrunk summary',
      '  display ip interface brief        IP interface summary',
      '  display ip routing-table          Routing table',
      '  display ospf peer brief           OSPF neighbors',
      '  display current-configuration',
      '  save                              Save config',
      '  undo mac-address all              Clear MAC table',
      '  quit / return',
      p,
    ]
    return [`Error: Unrecognized command found at '^' position.`, p]
  }

  private execInterface(cmd: string): string[] {
    const p = this.prompt()
    if (cmd === 'quit')   { this.mode = 'system'; this.currentPorts = []; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   this.currentPorts = []; return [this.getPrompt()] }

    const isSvi = this.currentPorts[0]?.startsWith('Vlanif')
    if (isSvi) {
      const vlanId = this.currentVlan
      const svi = this.sviInterfaces.get(vlanId) ?? { status: 'down' }
      if (!this.sviInterfaces.has(vlanId)) this.sviInterfaces.set(vlanId, svi)

      if (cmd.startsWith('ip address ')) {
        const parts = cmd.slice(11).trim().split(/\s+/)
        if (parts.length >= 2 && isValidIp(parts[0]) && (isValidMask(parts[1]) || parts[1].match(/^\d+$/))) {
          svi.ip = parts[0]; svi.prefix = isValidMask(parts[1]) ? maskToPrefixLen(parts[1]) : parseInt(parts[1]); return [p]
        }
        return [`Error: Invalid IP address or mask`, p]
      }
      if (cmd === 'undo ip address') { svi.ip = undefined; svi.prefix = undefined; return [p] }
      if (cmd === 'undo shutdown') { svi.status = 'up'; return [`Info: Interface Vlanif${vlanId} is link up.`, p] }
      if (cmd === 'shutdown') { svi.status = 'down'; return [`Info: Interface Vlanif${vlanId} is link down.`, p] }
      if (cmd.startsWith('description ')) { svi.description = cmd.slice(12).trim().replace(/"/g, ''); return [p] }
      if (cmd === 'undo description') { svi.description = undefined; return [p] }
      if (cmd.startsWith('ospf ') || cmd.startsWith('ip ospf ')) return [p]
      return [`Error: Unrecognized command.`, p]
    }

    const isEthTrunk = this.currentPorts[0]?.startsWith('Eth-Trunk')
    if (isEthTrunk) {
      const id = parseInt(this.currentPorts[0].replace('Eth-Trunk', ''))
      const trunk = this.ethTrunks.get(id)
      if (!trunk) return [p]
      const modeM = cmd.match(/^mode (lacp-dynamic|lacp-static|manual)$/)
      if (modeM) { trunk.mode = modeM[1] as EthTrunk['mode']; return [p] }
      if (cmd.startsWith('trunkport ')) {
        const ports = this.dev.parsePortList(cmd.slice(10).trim())
        for (const port of ports) {
          if (this.dev.ports.includes(port) && !trunk.ports.includes(port)) {
            trunk.ports.push(port); this.portEthTrunk.set(port, id)
          }
        }
        return [p]
      }
      if (cmd.startsWith('undo trunkport ')) {
        const ports = this.dev.parsePortList(cmd.slice(15).trim())
        for (const port of ports) { trunk.ports = trunk.ports.filter(pp => pp !== port); this.portEthTrunk.delete(port) }
        return [p]
      }
      if (cmd.startsWith('port link-type ') || cmd.startsWith('port default vlan ') || cmd.startsWith('port trunk allow-pass vlan ') || cmd.startsWith('description ')) return [p]
      if (cmd === 'undo shutdown' || cmd === 'shutdown') return [p]
      return [p]
    }

    // Physical port commands
    for (const port of this.currentPorts) {
      if (cmd.match(/^port link-type (access|trunk|hybrid)$/))
        this.portMode.set(port, cmd.endsWith('trunk') ? 'trunk' : 'access')
      else if (cmd.match(/^port default vlan (\d+)$/)) {
        const id = parseInt(cmd.match(/\d+$/)![0])
        if (this.vlans.has(id)) this.portVlan.set(port, id)
      }
      else if (cmd.match(/^port trunk pvid vlan (\d+)$/))
        this.portTrunkPvid.set(port, parseInt(cmd.match(/\d+$/)![0]))
      else if (cmd.startsWith('port trunk allow-pass vlan '))
        this.updateTrunkAllowed(port, cmd.slice(27).trim())
      else if (cmd.startsWith('undo port trunk allow-pass vlan ')) {
        const allowed = this.portTrunkAllowed.get(port) ?? new Set()
        for (const id of this.parseVlanList(cmd.slice(32).trim())) allowed.delete(id)
      }
      else if (cmd.match(/^eth-trunk (\d+)$/)) {
        const id = parseInt(cmd.match(/\d+$/)![0])
        if (!this.ethTrunks.has(id)) this.ethTrunks.set(id, { id, mode: 'lacp-dynamic', ports: [] })
        const trunk = this.ethTrunks.get(id)!
        if (!trunk.ports.includes(port)) trunk.ports.push(port)
        this.portEthTrunk.set(port, id)
      }
      else if (cmd === 'undo eth-trunk') {
        const tid = this.portEthTrunk.get(port)
        if (tid !== undefined) {
          const trunk = this.ethTrunks.get(tid)
          if (trunk) trunk.ports = trunk.ports.filter(pp => pp !== port)
          this.portEthTrunk.delete(port)
        }
      }
    }

    if (cmd.match(/^port default vlan (\d+)$/)) {
      const id = parseInt(cmd.match(/\d+$/)![0])
      if (!this.vlans.has(id)) return [`Error: VLAN ${id} does not exist. Create first: vlan ${id}`, p]
    }
    if (cmd === 'undo shutdown') return [`Info: Interface ${this.currentPorts[0]?.replace('GigabitEthernet','GE')} is link up.`, p]
    if (cmd === 'shutdown')      return [`Info: Interface ${this.currentPorts[0]?.replace('GigabitEthernet','GE')} is link down.`, p]
    if (cmd.startsWith('description ') || cmd.startsWith('stp ') || cmd.startsWith('port ') || cmd.startsWith('undo port') || cmd.startsWith('eth-trunk') || cmd.startsWith('undo eth-trunk') || cmd.match(/^speed /) || cmd.match(/^duplex /) || cmd.startsWith('storm-control') || cmd.startsWith('qos') || cmd === 'loopback-detect enable') return [p]

    if (cmd === '?' || cmd === 'help') return [
      '  description <text>',
      '  port link-type access | trunk | hybrid',
      '  port default vlan <id>                Access VLAN',
      '  port trunk pvid vlan <id>             Native VLAN',
      '  port trunk allow-pass vlan <id-list|all>',
      '  undo port trunk allow-pass vlan <id-list>',
      '  eth-trunk <id>                        Join EtherTrunk',
      '  undo eth-trunk',
      '  stp edged-port enable|disable',
      '  undo shutdown / shutdown',
      '  speed 10|100|1000|auto',
      '  duplex full|half|auto',
      '  quit / return',
      p,
    ]
    return [`Error: Unrecognized command found at '^' position.`, p]
  }

  private execVlan(cmd: string): string[] {
    const p = this.prompt()
    if (cmd === 'quit')   { this.mode = 'system'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   return [this.getPrompt()] }
    if (cmd.startsWith('name '))   { this.vlans.set(this.currentVlan, cmd.slice(5).trim()); return [p] }
    if (cmd === 'undo name')       { this.vlans.set(this.currentVlan, `VLAN${String(this.currentVlan).padStart(4,'0')}`); return [p] }
    if (cmd.startsWith('description ')) return [p]
    if (cmd === '?' || cmd === 'help') return ['  name <vlan-name>', '  undo name', '  quit / return', p]
    return [`Error: Unrecognized command found at '^' position.`, p]
  }

  private execOspf(cmd: string): string[] {
    const p = this.prompt()
    if (cmd === 'quit')   { this.mode = 'system'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   return [this.getPrompt()] }

    const ridM = cmd.match(/^router-id (\S+)$/)
    if (ridM) { this.ospfRouterId = ridM[1]; return [p] }

    const netM = cmd.match(/^network (\S+) (\S+) area (\d+)$/)
    if (netM) { this.ospfNetworks.push({ ip: netM[1], wildcard: netM[2], area: parseInt(netM[3]) }); return [p] }

    const noNetM = cmd.match(/^undo network (\S+) (\S+) area (\d+)$/)
    if (noNetM) {
      this.ospfNetworks = this.ospfNetworks.filter(n => !(n.ip === noNetM[1] && n.wildcard === noNetM[2])); return [p]
    }

    if (cmd.startsWith('import-route ') || cmd.startsWith('default-route-advertise') || cmd.startsWith('silent-interface ') || cmd.match(/^area \d+$/)) return [p]

    if (cmd === '?' || cmd === 'help') return [
      '  router-id <ip>',
      '  network <ip> <wildcard> area <id>',
      '  undo network <ip> <wildcard> area <id>',
      '  import-route static|rip|bgp',
      '  default-route-advertise always',
      '  silent-interface <if>',
      '  quit / return',
      p,
    ]
    return [`Error: Unrecognized command found at '^' position.`, p]
  }

  private updateTrunkAllowed(port: string, spec: string): void {
    if (!this.portTrunkAllowed.has(port)) this.portTrunkAllowed.set(port, new Set())
    const allowed = this.portTrunkAllowed.get(port)!
    if (spec === 'all') { for (const [id] of this.vlans) allowed.add(id); return }
    for (const id of this.parseVlanList(spec)) allowed.add(id)
  }

  private parseVlanList(spec: string): number[] {
    const ids: number[] = []
    for (const part of spec.split(/[\s,]+/)) {
      const m = part.match(/^(\d+)(?:to|-)(\d+)$/)
      if (m) { for (let i = parseInt(m[1]); i <= parseInt(m[2]); i++) ids.push(i) }
      else if (part === 'all') { for (const [id] of this.vlans) ids.push(id) }
      else if (part.match(/^\d+$/)) ids.push(parseInt(part))
    }
    return ids
  }

  private show(sub: string): string[] {
    if (sub === 'mac-address' || sub === 'mac-address all') return this.dev.macTableOut('huawei')
    if (sub === 'interface brief' || sub === 'interface')   return this.portsOut()
    if (sub === 'vlan' || sub === 'vlan all')               return this.vlanOut()
    if (sub === 'vlan summary')                             return this.vlanSummary()
    if (sub === 'stp brief' || sub === 'stp')               return this.stpBrief()
    if (sub === 'eth-trunk' || sub === 'eth-trunk brief')   return this.ethTrunkOut()
    if (sub.startsWith('eth-trunk '))  return this.ethTrunkDetail(parseInt(sub.split(' ')[1]))
    if (sub === 'ip interface brief')  return this.ipIfBrief()
    if (sub === 'ip routing-table')    return this.ipRouteTable()
    if (sub === 'ospf peer brief' || sub === 'ospf peer') return this.ospfPeerBrief()
    if (sub === 'ospf interface')      return this.ospfInterface()
    if (sub === 'current-configuration' || sub === 'current-config') return this.fmtCurrentConfig()
    if (sub === 'version')   return [`${this.dev.name} — Huawei S5720 VRP Simulator`]
    if (sub === 'lldp neighbor brief') return ['(no LLDP neighbors)']
    if (sub === 'clock')     return [`${new Date().toISOString()}`]
    if (sub === 'cpu-usage') return [`CPU Usage: 5%`]
    if (sub === 'memory-usage') return [`Memory Usage: 30%`]
    if (sub === 'logbuffer') return [`(no log entries)`]
    if (sub === 'device')    return [`Huawei S5720-28X-LI-DC`]
    return [`Error: Unrecognized display command: ${sub}`]
  }

  private portsOut(): string[] {
    const lines = ['Interface              Status    Protocol  PVID  Link-type', '']
    for (const p of this.dev.ports) {
      const sh = p.replace('GigabitEthernet', 'GE')
      const vlan = this.portVlan.get(p) ?? 1
      const mode = this.portMode.get(p) ?? 'access'
      const trunkId = this.portEthTrunk.get(p)
      const pvid = mode === 'trunk' ? String(this.portTrunkPvid.get(p) ?? 1) : String(vlan)
      const typeStr = trunkId !== undefined ? `trunk(Et${trunkId})` : mode
      lines.push(`${sh.padEnd(23)}up        up        ${pvid.padEnd(6)}${typeStr}`)
    }
    for (const [id, svi] of this.sviInterfaces) {
      const st = svi.status === 'up' ? 'up' : 'down'
      lines.push(`Vlanif${String(id).padEnd(17)}${st.padEnd(10)}${st.padEnd(10)}${id}`)
    }
    for (const [id, trunk] of this.ethTrunks) {
      lines.push(`Eth-Trunk${String(id).padEnd(14)}up        up        1      trunk      (${trunk.ports.length} members)`)
    }
    return lines
  }

  private vlanOut(): string[] {
    const lines = ['VID   Status    Ports', '----  --------  -----']
    for (const [id, name] of this.vlans) {
      const ports = this.dev.ports
        .filter(p => this.portVlan.get(p) === id && (this.portMode.get(p) ?? 'access') === 'access')
        .map(p => p.replace('GigabitEthernet', 'GE')).join(', ')
      lines.push(`${String(id).padEnd(6)}enable    ${ports}  (${name})`)
    }
    return lines
  }

  private vlanSummary(): string[] {
    return [
      `The total number of VLANs is: ${this.vlans.size}`,
      `Static VLAN:`,
      `  ${Array.from(this.vlans.keys()).join(', ')}`,
    ]
  }

  private stpBrief(): string[] {
    return [
      `MSTP common bridge parameters:`,
      `  Max aging time = 20s    Hello time = 2s    Forward delay = 15s`,
      ``,
      `Bridge         STP Status    Priority    Address`,
      `CIST           ${this.stpEnabled ? 'enabled ' : 'disabled'}     ${this.stpPriority.get(1) ?? 32768}        ${generateMac()}`,
      ``,
      `Port              Role  STP State    Protection`,
      ...this.dev.ports.map(p => `${p.replace('GigabitEthernet','GE').padEnd(18)}DESI  Forwarding   none`),
    ]
  }

  private ethTrunkOut(): string[] {
    const lines = ['Eth-Trunk  LAG-ID  WorkingMode  Bandwidth(Mbps)  Member Ports', '']
    for (const [id, trunk] of this.ethTrunks) {
      const mode = trunk.mode === 'manual' ? 'Manual' : 'LACP'
      lines.push(`Eth-Trunk${id}  ${id}       ${mode.padEnd(13)}${String(trunk.ports.length * 1000).padEnd(17)}${trunk.ports.map(p => p.replace('GigabitEthernet','GE')).join(', ')}`)
    }
    if (!this.ethTrunks.size) lines.push('(no EtherTrunks configured)')
    return lines
  }

  private ethTrunkDetail(id: number): string[] {
    const trunk = this.ethTrunks.get(id)
    if (!trunk) return [`Error: Eth-Trunk${id} not found`]
    return [
      `Eth-Trunk${id} current state: UP`,
      `Working Mode: ${trunk.mode}   Hash arithmetic: According to SIP-XOR-DIP`,
      `Least Active-linknumber: 1   Max Bandwidth-affected-linknumber: 8`,
      ``,
      `ActorPortName    Status    PortType  PortPri  PortNo  PortKey  PortState`,
      ...trunk.ports.map(p => `${p.replace('GigabitEthernet','GE').padEnd(17)}Selected  1GE       32768    ${Math.floor(Math.random()*100)+1}       305      10111100`),
    ]
  }

  private ipIfBrief(): string[] {
    if (!this.ipRoutingEnabled && !this.sviInterfaces.size) return ['% IP routing not enabled. Use: ip routing-enable']
    const lines = ['Interface              IP Address/Mask       State  Protocol', '']
    for (const [id, svi] of this.sviInterfaces) {
      const ip = svi.ip ? `${svi.ip}/${svi.prefix ?? 24}` : 'unassigned'
      const st = svi.status === 'up' ? 'up' : 'down'
      lines.push(`Vlanif${String(id).padEnd(17)}${ip.padEnd(22)}${st.padEnd(7)}${svi.ip ? st : 'down'}`)
    }
    return lines
  }

  private ipRouteTable(): string[] {
    if (!this.ipRoutingEnabled && !this.sviInterfaces.size) return ['% IP routing not enabled.']
    const lines = ['Route Flags: R - relay, D - download to fib', '', 'Destination/Mask    Proto   Pre  Cost  Flags  NextHop         Interface']
    for (const [id, svi] of this.sviInterfaces) {
      if (svi.ip && svi.status === 'up') lines.push(`${(svi.ip + '/' + (svi.prefix ?? 24)).padEnd(20)}Direct  0    0     D      ${svi.ip.padEnd(16)}Vlanif${id}`)
    }
    for (const r of this.staticRoutes) lines.push(`${(r.network + '/' + r.prefix).padEnd(20)}Static  60   0     RD     ${r.nextHop.padEnd(16)}`)
    if (lines.length === 3) lines.push('(no routes)')
    return lines
  }

  private ospfPeerBrief(): string[] {
    if (this.ospfProcessId === 0) return ['OSPF is not configured.']
    const lines = [`OSPF Process ${this.ospfProcessId} with Router ID ${this.ospfRouterId ?? '0.0.0.0'}`, '', 'Peer Statistic information', 'Area Id          Interface                        Neighbor id      State']
    let found = false
    for (const [id, svi] of this.sviInterfaces) {
      if (svi.ip && svi.status === 'up') {
        lines.push(`0.0.0.0          Vlanif${String(id).padEnd(27)}${svi.ip.padEnd(17)}Full`)
        found = true
      }
    }
    if (!found) lines.push('(no OSPF neighbors)')
    return lines
  }

  private ospfInterface(): string[] {
    if (this.ospfProcessId === 0) return ['OSPF is not configured.']
    const lines: string[] = []
    for (const [id, svi] of this.sviInterfaces) {
      if (!svi.ip) continue
      lines.push(`Vlanif${id}`)
      lines.push(`  OSPF Process ${this.ospfProcessId}, Area 0.0.0.0`)
      lines.push(`  IP Address: ${svi.ip}/${svi.prefix ?? 24}, Cost: 1, State: DR, Type: Broadcast, MTU: 1500`)
      lines.push(`  Timers: Hello 10, Dead 40, Poll 120`)
      lines.push(``)
    }
    return lines.length ? lines : ['(no OSPF interfaces)']
  }

  private fmtCurrentConfig(): string[] {
    const lines = ['#', `sysname ${this.dev.name}`, '#']
    if (this.stpEnabled) { lines.push(`stp mode ${this.stpMode}`); lines.push('#') }
    for (const [id, name] of this.vlans) { lines.push(`vlan ${id}`); lines.push(` name ${name}`); lines.push('#') }
    for (const p of this.dev.ports) {
      const sh = p
      lines.push(`interface ${sh.replace('GigabitEthernet','GigabitEthernet')}`)
      const mode = this.portMode.get(p) ?? 'access'
      const vlan = this.portVlan.get(p) ?? 1
      const tid = this.portEthTrunk.get(p)
      if (tid !== undefined) lines.push(` eth-trunk ${tid}`)
      lines.push(` port link-type ${mode}`)
      if (mode === 'access') lines.push(` port default vlan ${vlan}`)
      if (mode === 'trunk') {
        const pvid = this.portTrunkPvid.get(p); if (pvid) lines.push(` port trunk pvid vlan ${pvid}`)
        const allowed = this.portTrunkAllowed.get(p)
        if (allowed?.size) lines.push(` port trunk allow-pass vlan ${Array.from(allowed).sort((a,b)=>a-b).join(' ')}`)
      }
      lines.push('#')
    }
    for (const [id, trunk] of this.ethTrunks) {
      lines.push(`interface Eth-Trunk${id}`); lines.push(` mode ${trunk.mode}`); lines.push('#')
    }
    for (const [id, svi] of this.sviInterfaces) {
      lines.push(`interface Vlanif${id}`)
      if (svi.description) lines.push(` description ${svi.description}`)
      if (svi.ip && svi.prefix !== undefined) lines.push(` ip address ${svi.ip} ${prefixLenToMask(svi.prefix)}`)
      lines.push(svi.status === 'up' ? ' undo shutdown' : ' shutdown')
      lines.push('#')
    }
    if (this.ipRoutingEnabled) { lines.push('ip routing-enable'); lines.push('#') }
    for (const r of this.staticRoutes) lines.push(`ip route-static ${r.network} ${prefixLenToMask(r.prefix)} ${r.nextHop}`)
    if (this.staticRoutes.length) lines.push('#')
    if (this.ospfProcessId > 0) {
      lines.push(`ospf ${this.ospfProcessId}${this.ospfRouterId ? ' router-id ' + this.ospfRouterId : ''}`)
      const areaMap = new Map<number, Array<{ip:string;wildcard:string}>>()
      for (const n of this.ospfNetworks) {
        if (!areaMap.has(n.area)) areaMap.set(n.area, [])
        areaMap.get(n.area)!.push({ ip: n.ip, wildcard: n.wildcard })
      }
      for (const [area, nets] of areaMap) {
        lines.push(` area ${area}`); for (const n of nets) lines.push(`  network ${n.ip} ${n.wildcard}`)
      }
      lines.push('#')
    }
    lines.push('return')
    return lines
  }

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    let pool: string[] = []
    const ports = this.dev.ports.map(p => p.replace('GigabitEthernet', 'GE'))

    if (this.mode === 'user') pool = [
      'system-view', 'display mac-address', 'display interface brief', 'display vlan',
      'display ip routing-table', 'display ip interface brief',
      'display stp brief', 'display eth-trunk',
      'display ospf peer brief', 'display current-configuration',
      'display version', 'display clock', 'ping ', '?',
    ]
    else if (this.mode === 'system') pool = [
      'quit', 'return', 'sysname ',
      'display mac-address', 'display interface brief', 'display vlan', 'display vlan summary',
      'display ip interface brief', 'display ip routing-table',
      'display stp brief', 'display eth-trunk', 'display ospf peer brief',
      'display current-configuration', 'display version',
      ...ports.map(p => 'interface ' + p),
      'interface Vlanif ', 'interface Eth-Trunk ',
      'vlan ', 'vlan batch ', 'undo vlan ',
      'stp mode stp', 'stp mode rstp', 'stp mode mstp',
      'stp vlan ', 'stp enable', 'undo stp enable',
      'ip routing-enable', 'undo ip routing-enable',
      'ip route-static ', 'undo ip route-static ',
      'ospf ', 'dhcp enable', 'undo mac-address all', 'save', '?',
    ]
    else if (this.mode === 'vlan') pool = ['name ', 'undo name', 'quit', 'return', '?']
    else if (this.mode === 'ospf') pool = ['router-id ', 'network ', 'undo network ', 'import-route static', 'default-route-advertise always', 'quit', 'return', '?']
    else {
      const isSvi = this.currentPorts[0]?.startsWith('Vlanif')
      const isEt  = this.currentPorts[0]?.startsWith('Eth-Trunk')
      if (isSvi) pool = ['ip address ', 'undo ip address', 'description ', 'undo description', 'undo shutdown', 'shutdown', 'quit', 'return', '?']
      else if (isEt) pool = ['mode lacp-dynamic', 'mode lacp-static', 'mode manual', 'trunkport ', 'undo trunkport ', 'port link-type trunk', 'description ', 'undo shutdown', 'shutdown', 'quit', 'return', '?']
      else pool = [
        'description ', 'undo shutdown', 'shutdown',
        'port link-type access', 'port link-type trunk',
        'port default vlan ', 'port trunk pvid vlan ', 'port trunk allow-pass vlan all',
        'port trunk allow-pass vlan ', 'undo port trunk allow-pass vlan ',
        'eth-trunk ', 'undo eth-trunk',
        'stp edged-port enable', 'stp edged-port disable',
        'speed 10', 'speed 100', 'speed 1000', 'speed auto',
        'duplex full', 'duplex half', 'duplex auto',
        'quit', 'return', '?',
      ]
    }
    return pool.filter(c => c.startsWith(lo))
  }
}
