import type { SwitchDevice } from '../../devices/switch'
import type { SwitchBrandCLI } from './base'
import { generateMac, isValidIp, isValidMask, maskToPrefixLen, prefixLenToMask } from '../../ip-utils'

interface SviInfo { ip?: string; prefix?: number; status: 'up' | 'down'; description?: string }

export class CiscoSwitchCLI implements SwitchBrandCLI {
  mode = 'user'
  currentPorts: string[] = []
  currentVlan = 0
  vlans: Map<number, string> = new Map([[1, 'default']])
  portVlan: Map<string, number>
  portMode: Map<string, 'access' | 'trunk'>

  // L3 switching state
  ipRouting = false
  sviInterfaces: Map<number, SviInfo> = new Map()
  trunkNativeVlan: Map<string, number> = new Map()
  trunkAllowedVlans: Map<string, Set<number>> = new Map()
  portVoiceVlan: Map<string, number> = new Map()
  vtpDomain = ''
  vtpMode: 'server' | 'client' | 'transparent' = 'server'
  vtpVersion = 2
  stpMode: 'pvst' | 'rapid-pvst' = 'pvst'
  stpPriority: Map<number, number> = new Map()
  portChannels: Map<number, {ports: string[], mode: 'active'|'passive'|'on'}> = new Map()
  portChannelGroup: Map<string, {group: number, mode: 'active'|'passive'|'on'}> = new Map()
  spanningTreePortfast = false

  // OSPF (L3 switch)
  private routerProto = ''
  ospfProcesses: Map<number, {processId: number, networks: Array<{ip: string, wildcard: string, area: number}>}> = new Map()
  staticRoutes: Array<{network: string, prefixLen: number, nextHop: string}> = []

  constructor(readonly dev: SwitchDevice) {
    this.portVlan = new Map(dev.ports.map(p => [p, 1]))
    this.portMode = new Map(dev.ports.map(p => [p, 'access' as const]))
    for (const p of dev.ports) this.trunkAllowedVlans.set(p, new Set([1]))
  }

  getPrompt(): string {
    const n = this.dev.name
    if (this.mode === 'user')          return `\x1b[32m${n}>\x1b[0m `
    if (this.mode === 'enable')        return `\x1b[32m${n}#\x1b[0m `
    if (this.mode === 'config')        return `\x1b[32m${n}(config)#\x1b[0m `
    if (this.mode === 'config-if')     return `\x1b[32m${n}(config-if)#\x1b[0m `
    if (this.mode === 'config-vlan')   return `\x1b[32m${n}(config-vlan)#\x1b[0m `
    if (this.mode === 'config-router') return `\x1b[32m${n}(config-router)#\x1b[0m `
    return `\x1b[32m${n}>\x1b[0m `
  }
  private prompt(): string { return this.getPrompt() }

  getBanner(): string[] {
    if (this.dev.brand === 'Datacom') {
      const portCount = this.dev.ports.length
      const model = portCount <= 24 ? 'DM/4270G-24T' : 'DM/4270G-48T'
      return [
        '\x1b[90m',
        `Datacom DataOS Software, Version 3.12.3 (DM Enterprise Switch)`,
        `Technical Support: http://www.datacom.ind.br`,
        `Copyright (c) 2004-2024 Datacom Telematica Ltda.`,
        `Platform: Datacom ${model}`,
        '\x1b[0m',
        '',
        `\x1b[33mPress RETURN to get started.\x1b[0m`,
        '',
      ]
    }
    return [
      '\x1b[90mCisco IOS Software, C2960-UNIVERSALK9-M, Version 12.2(58)SE2',
      'Copyright (c) 1986-2011 by Cisco Systems, Inc.\x1b[0m',
      '',
      '\x1b[33mPress RETURN to get started.\x1b[0m',
      '',
    ]
  }

  execute(cmd: string): string[] {
    if (this.dev.brand === 'Datacom') return this.execDatacom(cmd)
    return this.execCisco(cmd)
  }

  private execCisco(cmd: string): string[] {
    const configModes = ['config', 'config-if', 'config-vlan', 'config-router']
    if (configModes.includes(this.mode) && cmd.startsWith('do ')) {
      const sub = cmd.slice(3).trim()
      if (sub.startsWith('show ')) return [...this.showCisco(sub.slice(5).trim()), this.prompt()]
      return [`% Invalid 'do' command: ${sub}`, this.prompt()]
    }

    if (this.mode === 'user') {
      if (cmd === 'enable') { this.mode = 'enable'; return [this.prompt()] }
      if (cmd === '?' || cmd === 'help') return ['  enable   Enter privileged mode', this.prompt()]
      return [`% Unknown command: ${cmd}`, this.prompt()]
    }

    if (this.mode === 'enable') {
      if (cmd === 'configure terminal' || cmd === 'conf t') { this.mode = 'config'; return [this.prompt()] }
      if (cmd === 'disable' || cmd === 'exit') { this.mode = 'user'; return [this.prompt()] }
      if (cmd.startsWith('show ')) return [...this.showCisco(cmd.slice(5).trim()), this.prompt()]
      if (cmd === 'clear mac address-table' || cmd === 'clear mac-address-table dynamic') {
        this.dev.macTable.clear(); return ['\x1b[32mMAC address table cleared.\x1b[0m', this.prompt()]
      }
      if (cmd === 'write memory' || cmd === 'write' || cmd === 'copy running-config startup-config') {
        return ['\x1b[32mBuilding configuration...\x1b[0m', '\x1b[32m[OK]\x1b[0m', this.prompt()]
      }
      if (cmd === '?' || cmd === 'help') return [
        '  conf t / configure terminal   Config mode',
        '  show mac address-table        MAC address table',
        '  show interfaces               Interface details',
        '  show interfaces status        Interface status table',
        '  show interfaces trunk         Trunk interface info',
        '  show vlan                     VLAN table with ports',
        '  show vlan brief               VLAN list',
        '  show vtp status               VTP status',
        '  show ip interface brief       IP interface summary (L3)',
        '  show ip route                 Routing table (L3)',
        '  show spanning-tree            Spanning tree',
        '  show running-config           Running configuration',
        '  show etherchannel summary     EtherChannel summary',
        '  show version                  Version info',
        '  clear mac address-table       Clear MAC table',
        '  write / write memory          Save config',
        '  disable                       Return to user mode',
        this.prompt(),
      ]
      return [`% Unknown command: ${cmd}`, this.prompt()]
    }

    if (this.mode === 'config') {
      return this.execConfig(cmd)
    }

    if (this.mode === 'config-vlan') {
      if (cmd === 'end')  { this.mode = 'enable'; return [this.prompt()] }
      if (cmd === 'exit') { this.mode = 'config'; return [this.prompt()] }
      if (cmd.startsWith('name ')) { this.vlans.set(this.currentVlan, cmd.slice(5).trim()); return [this.prompt()] }
      if (cmd.startsWith('state ')) return [this.prompt()]
      if (cmd === '?' || cmd === 'help') return ['  name <vlan-name>   Set VLAN name', '  exit / end', this.prompt()]
      return [`% Unknown VLAN config command: ${cmd}`, this.prompt()]
    }

    if (this.mode === 'config-router') {
      return this.execConfigRouter(cmd)
    }

    // config-if
    return this.execConfigIf(cmd)
  }

  private execConfig(cmd: string): string[] {
    if (cmd === 'end')  { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'enable'; return [this.prompt()] }
    if (cmd.startsWith('hostname ')) { this.dev.name = cmd.slice(9).trim(); return [this.prompt()] }

    // Interface selection (physical + SVI)
    if (cmd.startsWith('interface ') || cmd.startsWith('int ')) {
      const raw = cmd.replace(/^interface |^int /, '').trim()
      // SVI: interface vlan <id>
      const sviM = raw.match(/^[Vv]lan\s*(\d+)$/)
      if (sviM) {
        const vlanId = parseInt(sviM[1])
        if (!this.sviInterfaces.has(vlanId)) this.sviInterfaces.set(vlanId, { status: 'down' })
        this.currentVlan = vlanId
        this.currentPorts = [`Vlan${vlanId}`]
        this.mode = 'config-if'
        return [this.prompt()]
      }
      // port-channel
      const pcM = raw.match(/^[Pp]ort-[Cc]hannel\s*(\d+)$/)
      if (pcM) {
        const pcId = parseInt(pcM[1])
        if (!this.portChannels.has(pcId)) this.portChannels.set(pcId, { ports: [], mode: 'active' })
        this.currentPorts = [`Port-channel${pcId}`]
        this.mode = 'config-if'
        return [this.prompt()]
      }
      const names = this.dev.parsePortList(raw)
      const valid = names.filter(n => this.dev.ports.includes(n))
      if (!valid.length) {
        return [`% Interface ${raw} not found. Available: ${this.dev.ports.map(p => this.dev.shortPort(p)).join(', ')}`, this.prompt()]
      }
      this.currentPorts = valid; this.mode = 'config-if'; return [this.prompt()]
    }

    // VLAN
    if (cmd.match(/^vlan (\d+)$/)) {
      const id = parseInt(cmd.slice(5))
      if (id < 1 || id > 4094) return ['% VLAN ID must be between 1 and 4094', this.prompt()]
      if (!this.vlans.has(id)) this.vlans.set(id, `VLAN${String(id).padStart(4, '0')}`)
      this.currentVlan = id; this.mode = 'config-vlan'; return [this.prompt()]
    }
    if (cmd.match(/^no vlan (\d+)$/)) {
      const id = parseInt(cmd.slice(8))
      if (id === 1) return ['% Cannot delete VLAN 1', this.prompt()]
      this.vlans.delete(id); return [this.prompt()]
    }

    // VTP
    if (cmd.startsWith('vtp domain ')) { this.vtpDomain = cmd.slice(11).trim(); return [this.prompt()] }
    const vtpMode = cmd.match(/^vtp mode (server|client|transparent)$/)
    if (vtpMode) { this.vtpMode = vtpMode[1] as 'server'|'client'|'transparent'; return [this.prompt()] }
    const vtpVer = cmd.match(/^vtp version (2|3)$/)
    if (vtpVer) { this.vtpVersion = parseInt(vtpVer[1]); return [this.prompt()] }

    // Spanning tree
    if (cmd === 'spanning-tree mode rapid-pvst') { this.stpMode = 'rapid-pvst'; return [`\x1b[33mSpanning-tree mode set.\x1b[0m`, this.prompt()] }
    if (cmd === 'spanning-tree mode pvst')       { this.stpMode = 'pvst'; return [`\x1b[33mSpanning-tree mode set.\x1b[0m`, this.prompt()] }
    if (cmd === 'spanning-tree portfast default') { this.spanningTreePortfast = true; return [this.prompt()] }
    const stpPri = cmd.match(/^spanning-tree vlan (\d+) priority (\d+)$/)
    if (stpPri) { this.stpPriority.set(parseInt(stpPri[1]), parseInt(stpPri[2])); return [this.prompt()] }
    const stpRoot = cmd.match(/^spanning-tree vlan (\d+) root (primary|secondary)$/)
    if (stpRoot) {
      const id = parseInt(stpRoot[1])
      this.stpPriority.set(id, stpRoot[2] === 'primary' ? 24576 : 28672)
      return [this.prompt()]
    }

    // ip routing
    if (cmd === 'ip routing')    { this.ipRouting = true; return [this.prompt()] }
    if (cmd === 'no ip routing') { this.ipRouting = false; return [this.prompt()] }

    // Static routes (L3 switch)
    const rtM = cmd.match(/^ip route (\S+) (\S+) (\S+)$/)
    if (rtM && this.ipRouting) {
      if (isValidIp(rtM[1]) && isValidMask(rtM[2]) && isValidIp(rtM[3])) {
        const pl = maskToPrefixLen(rtM[2])
        this.staticRoutes.push({ network: rtM[1], prefixLen: pl, nextHop: rtM[3] })
        return [this.prompt()]
      }
    }
    const noRtM = cmd.match(/^no ip route (\S+) (\S+) (\S+)$/)
    if (noRtM) {
      const pl = maskToPrefixLen(noRtM[2])
      this.staticRoutes = this.staticRoutes.filter(r => !(r.network === noRtM[1] && r.prefixLen === pl))
      return [this.prompt()]
    }

    // OSPF (L3 switch)
    const ospfM = cmd.match(/^router ospf (\d+)$/)
    if (ospfM && this.ipRouting) {
      const pid = parseInt(ospfM[1])
      if (!this.ospfProcesses.has(pid)) this.ospfProcesses.set(pid, { processId: pid, networks: [] })
      this.routerProto = `ospf ${pid}`; this.mode = 'config-router'; return [this.prompt()]
    }

    if (cmd.startsWith('ip default-gateway ')) return [this.prompt()]
    if (cmd === '?' || cmd === 'help') return [
      '  interface <port|vlan <id>>     Interface config',
      '  vlan <id>                      VLAN config mode',
      '  no vlan <id>                   Delete VLAN',
      '  hostname <name>                Set hostname',
      '  vtp domain <name>              VTP domain',
      '  vtp mode server|client|transparent',
      '  ip routing                     Enable L3 routing',
      '  ip route <net> <mask> <gw>     Static route',
      '  router ospf <id>               OSPF (requires ip routing)',
      '  spanning-tree mode rapid-pvst|pvst',
      '  spanning-tree vlan <id> priority <n>',
      '  spanning-tree vlan <id> root primary|secondary',
      '  spanning-tree portfast default',
      '  ip default-gateway <ip>        Default gateway',
      '  do show <...>                  Run show command',
      '  end / exit                     Exit config mode',
      this.prompt(),
    ]
    return [`% Unknown config command: ${cmd}`, this.prompt()]
  }

  private execConfigIf(cmd: string): string[] {
    if (cmd === 'exit') { this.mode = 'config'; this.currentPorts = []; return [this.prompt()] }
    if (cmd === 'end')  { this.mode = 'enable'; this.currentPorts = []; return [this.prompt()] }

    // SVI interface commands
    const isSvi = this.currentPorts[0]?.startsWith('Vlan')
    if (isSvi) {
      const vlanId = this.currentVlan
      const svi = this.sviInterfaces.get(vlanId) ?? { status: 'down' }
      if (!this.sviInterfaces.has(vlanId)) this.sviInterfaces.set(vlanId, svi)

      if (cmd.startsWith('ip address ')) {
        const parts = cmd.slice(11).trim().split(/\s+/)
        if (parts.length >= 2 && isValidIp(parts[0]) && isValidMask(parts[1])) {
          svi.ip = parts[0]; svi.prefix = maskToPrefixLen(parts[1])
          return [this.prompt()]
        }
        return [`% Invalid IP address or mask`, this.prompt()]
      }
      if (cmd === 'no ip address') { svi.ip = undefined; svi.prefix = undefined; return [this.prompt()] }
      if (cmd === 'no shutdown' || cmd === 'no shut') {
        svi.status = 'up'
        return [`%LINK-5-CHANGED: Interface Vlan${vlanId}, changed state to up`, this.prompt()]
      }
      if (cmd === 'shutdown') {
        svi.status = 'down'
        return [`%LINK-5-CHANGED: Interface Vlan${vlanId}, changed state to administratively down`, this.prompt()]
      }
      if (cmd.startsWith('description ')) { svi.description = cmd.slice(12).trim(); return [this.prompt()] }
      if (cmd.startsWith('ip ospf ')) return [this.prompt()]
      if (cmd.startsWith('ip access-group ')) return [this.prompt()]
      return [`% Unknown SVI command: ${cmd}`, this.prompt()]
    }

    // Physical port commands
    for (const currentPort of this.currentPorts) {
      if (cmd.match(/^switchport mode (access|trunk)$/)) {
        this.portMode.set(currentPort, cmd.split(' ')[2] as 'access' | 'trunk')
        if (cmd.endsWith('trunk') && !this.trunkAllowedVlans.has(currentPort)) {
          this.trunkAllowedVlans.set(currentPort, new Set(Array.from(this.vlans.keys())))
        }
      } else if (cmd.match(/^switchport access vlan (\d+)$/)) {
        const id = parseInt(cmd.match(/\d+$/)![0])
        if (this.vlans.has(id)) this.portVlan.set(currentPort, id)
      } else if (cmd.match(/^switchport trunk native vlan (\d+)$/)) {
        const id = parseInt(cmd.match(/\d+$/)![0])
        this.trunkNativeVlan.set(currentPort, id)
      } else if (cmd.match(/^switchport voice vlan (\d+)$/)) {
        const id = parseInt(cmd.match(/\d+$/)![0])
        this.portVoiceVlan.set(currentPort, id)
      } else if (cmd.startsWith('switchport trunk allowed vlan ')) {
        const rest = cmd.slice(30).trim()
        this.updateTrunkVlans(currentPort, rest)
      } else if (cmd.startsWith('channel-group ')) {
        const m = cmd.match(/^channel-group (\d+) mode (active|passive|on)$/)
        if (m) {
          const grp = parseInt(m[1])
          const mode = m[2] as 'active'|'passive'|'on'
          this.portChannelGroup.set(currentPort, { group: grp, mode })
          if (!this.portChannels.has(grp)) this.portChannels.set(grp, { ports: [], mode })
          const pc = this.portChannels.get(grp)!
          if (!pc.ports.includes(currentPort)) pc.ports.push(currentPort)
        }
      }
    }

    if (cmd.match(/^switchport access vlan (\d+)$/)) {
      const id = parseInt(cmd.match(/\d+$/)![0])
      if (!this.vlans.has(id)) return [`% Access VLAN ${id} is not defined. Create it with: vlan ${id}`, this.prompt()]
    }
    if (cmd.startsWith('spanning-tree vlan ') && cmd.endsWith('portfast')) return [this.prompt()]
    if (cmd === 'spanning-tree portfast') return [this.prompt()]
    if (cmd === 'spanning-tree portfast trunk') return [this.prompt()]
    if (cmd === 'no shutdown' || cmd === 'no shut') return [`%LINK-5-CHANGED: Interface ${this.currentPorts[0]} (and others), changed state to up`, this.prompt()]
    if (cmd === 'shutdown') return [`%LINK-5-CHANGED: Interface ${this.currentPorts[0]} (and others), changed state to administratively down`, this.prompt()]
    if (cmd.startsWith('switchport ') || cmd.startsWith('spanning-tree ') || cmd.startsWith('description ') || cmd.match(/^speed /) || cmd.match(/^duplex /) || cmd.startsWith('channel-group ')) return [this.prompt()]
    if (cmd.startsWith('ip access-group ')) return [this.prompt()]
    if (cmd === 'switchport nonegotiate') return [this.prompt()]
    if (cmd.startsWith('storm-control')) return [this.prompt()]

    if (cmd === '?' || cmd === 'help') return [
      '  description <text>',
      '  switchport mode access | trunk',
      '  switchport access vlan <id>',
      '  switchport trunk native vlan <id>',
      '  switchport trunk allowed vlan <id-list|add|remove>',
      '  switchport voice vlan <id>',
      '  switchport nonegotiate',
      '  channel-group <id> mode active|passive|on',
      '  no shutdown / shutdown',
      '  speed 10 | 100 | 1000 | auto',
      '  duplex full | half | auto',
      '  spanning-tree portfast',
      '  ip access-group <acl> in|out   (SVI)',
      '  ip address <ip> <mask>         (SVI)',
      '  do show <...>',
      '  exit / end',
      this.prompt(),
    ]
    return [`% Unknown interface command: ${cmd}`, this.prompt()]
  }

  private execConfigRouter(cmd: string): string[] {
    if (cmd === 'end')  { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'config'; return [this.prompt()] }

    if (this.routerProto.startsWith('ospf')) {
      const pid = parseInt(this.routerProto.split(' ')[1])
      const proc = this.ospfProcesses.get(pid)
      if (!proc) return [this.prompt()]
      const netM = cmd.match(/^network (\S+) (\S+) area (\S+)$/)
      if (netM) {
        proc.networks.push({ ip: netM[1], wildcard: netM[2], area: parseInt(netM[3]) })
        return [this.prompt()]
      }
      const noNetM = cmd.match(/^no network (\S+) (\S+) area (\S+)$/)
      if (noNetM) {
        proc.networks = proc.networks.filter(n => !(n.ip === noNetM[1] && n.wildcard === noNetM[2]))
        return [this.prompt()]
      }
    }
    return [`% Unknown router config command: ${cmd}`, this.prompt()]
  }

  private updateTrunkVlans(port: string, spec: string): void {
    if (!this.trunkAllowedVlans.has(port)) this.trunkAllowedVlans.set(port, new Set())
    const allowed = this.trunkAllowedVlans.get(port)!
    if (spec.startsWith('add ')) {
      for (const id of this.parseVlanList(spec.slice(4))) allowed.add(id)
    } else if (spec.startsWith('remove ')) {
      for (const id of this.parseVlanList(spec.slice(7))) allowed.delete(id)
    } else if (spec.startsWith('except ')) {
      const except = new Set(this.parseVlanList(spec.slice(7)))
      allowed.clear()
      for (const [id] of this.vlans) if (!except.has(id)) allowed.add(id)
    } else {
      allowed.clear()
      for (const id of this.parseVlanList(spec)) allowed.add(id)
    }
  }

  private parseVlanList(spec: string): number[] {
    const ids: number[] = []
    for (const part of spec.split(',')) {
      const m = part.match(/^(\d+)-(\d+)$/)
      if (m) {
        for (let i = parseInt(m[1]); i <= parseInt(m[2]); i++) ids.push(i)
      } else if (part.trim() === 'all') {
        for (const [id] of this.vlans) ids.push(id)
      } else if (part.trim().match(/^\d+$/)) {
        ids.push(parseInt(part.trim()))
      }
    }
    return ids
  }

  private showCisco(sub: string): string[] {
    if (sub === 'mac address-table' || sub === 'mac-address-table') return this.dev.macTableOut('cisco')
    if (sub === 'interfaces') return this.portsOut()
    if (sub === 'interfaces status') return this.portsStatusOut()
    if (sub === 'interfaces trunk') return this.trunkOut()
    if (sub === 'vlan brief' || sub === 'vlan') return this.vlanOut()
    if (sub.startsWith('interfaces ') && sub !== 'interfaces status') {
      const portName = sub.slice(11).trim()
      if (portName.endsWith('switchport')) return this.portSwitchportOut(portName.replace(/\s*switchport$/, '').trim())
    }
    if (sub.startsWith('vtp')) return this.vtpStatusOut()
    if (sub === 'running-config' || sub === 'run') return this.fmtRunningConfig()
    if (sub === 'version') return [`${this.dev.name} — Cisco IOS C2960`, 'Cisco IOS Software, Version 12.2(58)SE2']
    if (sub.startsWith('spanning-tree')) return this.spanningTreeOut(sub.slice(13).trim())
    if (sub === 'etherchannel summary') return this.etherchannelSummary()
    if (sub.startsWith('etherchannel ')) {
      const m = sub.match(/^etherchannel (\d+) detail$/)
      if (m) return this.etherchannelDetail(parseInt(m[1]))
    }
    if (sub === 'ip interface brief') return this.ipInterfaceBrief()
    if (sub === 'ip route') return this.ipRoute()
    return [`% Unknown show command: ${sub}`]
  }

  private portsOut(): string[] {
    const lines = ['Port         Status    Vlan    Duplex  Speed   Type', '']
    for (const p of this.dev.ports) {
      const vlan = this.portVlan.get(p) ?? 1
      const mode = this.portMode.get(p) ?? 'access'
      const vlanCol = mode === 'trunk' ? 'trunk' : String(vlan)
      lines.push(`${this.dev.shortPort(p).padEnd(13)}connected ${vlanCol.padEnd(8)}full    1000    10/100/1000BaseTX`)
    }
    // SVIs
    for (const [id, svi] of this.sviInterfaces) {
      const st = svi.status === 'up' ? 'up' : 'down'
      lines.push(`${'Vlan' + id}${' '.repeat(Math.max(1, 13 - ('Vlan' + id).length))}${st}      ${String(id).padEnd(8)}auto    auto    EtherSVI`)
    }
    return lines
  }

  private portsStatusOut(): string[] {
    const lines = ['Port         Name     Status    Vlan    Duplex  Speed   Type', '']
    for (const p of this.dev.ports) {
      const sh = this.dev.shortPort(p)
      const vlan = this.portVlan.get(p) ?? 1
      const mode = this.portMode.get(p) ?? 'access'
      const vlanCol = mode === 'trunk' ? 'trunk' : String(vlan)
      lines.push(`${sh.padEnd(13)}         connected ${vlanCol.padEnd(8)}full    1000    10/100/1000BaseTX`)
    }
    return lines
  }

  private trunkOut(): string[] {
    const trunks = this.dev.ports.filter(p => this.portMode.get(p) === 'trunk')
    if (!trunks.length) return ['(no trunk interfaces)']
    const lines = [
      'Port        Mode         Encapsulation  Status        Native vlan',
      ...trunks.map(p => `${this.dev.shortPort(p).padEnd(12)}on           802.1q         trunking      ${this.trunkNativeVlan.get(p) ?? 1}`),
      '',
      'Port        Vlans allowed on trunk',
      ...trunks.map(p => {
        const allowed = this.trunkAllowedVlans.get(p)
        const vlStr = allowed ? Array.from(allowed).sort((a,b)=>a-b).join(',') : '1-4094'
        return `${this.dev.shortPort(p).padEnd(12)}${vlStr}`
      }),
      '',
      'Port        Vlans allowed and active in management domain',
      ...trunks.map(p => {
        const allowed = this.trunkAllowedVlans.get(p)
        const active = allowed ? Array.from(allowed).filter(id => this.vlans.has(id)).sort((a,b)=>a-b).join(',') : ''
        return `${this.dev.shortPort(p).padEnd(12)}${active || '(none)'}`
      }),
    ]
    return lines
  }

  private vlanOut(): string[] {
    const lines = ['VLAN  Name                 Status    Ports', '----  -------------------  --------  -----']
    for (const [id, name] of this.vlans) {
      const ports = this.dev.ports
        .filter(p => this.portVlan.get(p) === id && (this.portMode.get(p) ?? 'access') === 'access')
        .map(p => this.dev.shortPort(p))
        .join(', ')
      lines.push(`${String(id).padEnd(6)}${name.padEnd(21)}active    ${ports}`)
    }
    return lines
  }

  private portSwitchportOut(portName: string): string[] {
    const p = this.dev.resolvePort(portName)
    if (!p) return [`% Port ${portName} not found`]
    const mode = this.portMode.get(p) ?? 'access'
    const vlan = this.portVlan.get(p) ?? 1
    const native = this.trunkNativeVlan.get(p) ?? 1
    const allowed = this.trunkAllowedVlans.get(p)
    return [
      `Name: ${this.dev.shortPort(p)}`,
      `Switchport: Enabled`,
      `Administrative Mode: ${mode === 'trunk' ? 'trunk' : 'static access'}`,
      `Operational Mode: ${mode === 'trunk' ? 'trunk' : 'static access'}`,
      `Administrative Trunking Encapsulation: dot1q`,
      `Operational Trunking Encapsulation: dot1q`,
      `Negotiation of Trunking: On`,
      `Access Mode VLAN: ${vlan} (${this.vlans.get(vlan) ?? 'unknown'})`,
      `Trunking Native Mode VLAN: ${native} (${this.vlans.get(native) ?? 'default'})`,
      `Administrative Native VLAN tagging: enabled`,
      `Voice VLAN: ${this.portVoiceVlan.get(p) ?? 'none'}`,
      `Trunking VLANs Enabled: ${allowed ? Array.from(allowed).sort((a,b)=>a-b).join(',') : 'ALL'}`,
    ]
  }

  private vtpStatusOut(): string[] {
    return [
      `VTP Version capable             : 1 to 3`,
      `VTP Version running             : ${this.vtpVersion}`,
      `VTP Domain Name                 : ${this.vtpDomain || '(null)'}`,
      `VTP Pruning Mode                : Disabled`,
      `VTP Traps Generation            : Disabled`,
      `Device ID                       : ${generateMac()}`,
      `Configuration last modified by 0.0.0.0 at 0-0-00 00:00:00`,
      ``,
      `Feature VLAN:`,
      `--------------`,
      `VTP Operating Mode              : ${this.vtpMode.charAt(0).toUpperCase() + this.vtpMode.slice(1)}`,
      `Maximum VLANs supported locally : 1005`,
      `Number of existing VLANs        : ${this.vlans.size}`,
      `Configuration Revision          : 0`,
      `MD5 digest                      : 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00`,
    ]
  }

  private spanningTreeOut(sub: string): string[] {
    if (sub.startsWith('vlan ')) {
      const vlanId = parseInt(sub.slice(5))
      const pri = this.stpPriority.get(vlanId) ?? 32768
      return [
        `VLAN${String(vlanId).padStart(4,'0')}`,
        `  Spanning tree enabled protocol ${this.stpMode === 'rapid-pvst' ? 'rstp' : 'ieee'}`,
        `  Root ID  Priority    ${pri + vlanId}`,
        `           Address     ${generateMac()}`,
        `           This bridge is the root`,
        `           Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec`,
        ``,
        `  Bridge ID  Priority    ${pri + vlanId}  (priority ${pri} sys-id-ext ${vlanId})`,
        `             Address     ${generateMac()}`,
        `             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec`,
        `             Aging Time  300 sec`,
        ``,
        `Interface           Role Sts Cost      Prio.Nbr Type`,
        `------------------- ---- --- --------- -------- --------------------------------`,
        ...this.dev.ports.filter(p => this.portVlan.get(p) === vlanId || this.portMode.get(p) === 'trunk')
          .map(p => `${this.dev.shortPort(p).padEnd(20)}Desg FWD 4         128.1    P2p`),
      ]
    }
    // Default: show spanning-tree for all VLANs
    const lines: string[] = []
    for (const [id] of this.vlans) {
      const pri = this.stpPriority.get(id) ?? 32768
      lines.push(`VLAN${String(id).padStart(4,'0')}`)
      lines.push(`  Spanning tree enabled protocol ${this.stpMode === 'rapid-pvst' ? 'rstp' : 'ieee'}`)
      lines.push(`  Root ID  Priority    ${pri + id}`)
      lines.push(`           Address     ${generateMac()}`)
      lines.push(`           This bridge is the root`)
      lines.push(``)
    }
    return lines
  }

  private etherchannelSummary(): string[] {
    const lines = [
      `Flags:  D - down        P - bundled in port-channel`,
      `        I - stand-alone s - suspended`,
      `        H - Hot-standby (LACP only)`,
      `        R - Layer3      S - Layer2`,
      `        U - in use      f - failed to allocate aggregator`,
      ``,
      `Number of channel-groups in use: ${this.portChannels.size}`,
      `Number of aggregators:           ${this.portChannels.size}`,
      ``,
      `Group  Port-channel  Protocol    Ports`,
      `------+-------------+-----------+-----------------------------------------------`,
    ]
    for (const [id, pc] of this.portChannels) {
      const proto = pc.mode === 'on' ? 'None' : 'LACP'
      const ports = pc.ports.map(p => this.dev.shortPort(p) + '(P)').join('  ')
      lines.push(`${String(id).padEnd(7)}Po${id}${' '.repeat(12 - String(id).length)}${proto.padEnd(12)}${ports}`)
    }
    if (!this.portChannels.size) lines.push('(no EtherChannels)')
    return lines
  }

  private etherchannelDetail(id: number): string[] {
    const pc = this.portChannels.get(id)
    if (!pc) return [`% Port-channel ${id} not found`]
    return [
      `Group state = L2`,
      `Ports: ${pc.ports.length}   Maxports = 8`,
      `Port-channels: 1 Max Port-channels = 6`,
      `Protocol:   ${pc.mode === 'on' ? 'None' : 'LACP'}`,
      `Minimum Links: 0`,
      ``,
      `                Ports in the group:`,
      `                -------------------`,
      ` Port: ${pc.ports.map(p => this.dev.shortPort(p)).join(', ')}`,
      `----------------------------------------------------------------------------`,
      `Port state    = Up Mstr Assoc In-Bndl`,
      `Channel group = ${id}          Mode = ${pc.mode}`,
    ]
  }

  private ipInterfaceBrief(): string[] {
    if (!this.ipRouting) return ['% IP routing not enabled. Use: ip routing']
    const lines = ['Interface              IP-Address      OK? Method Status                Protocol', '']
    for (const [id, svi] of this.sviInterfaces) {
      const ip = svi.ip ?? 'unassigned'
      const ok = svi.ip ? 'YES' : 'NO '
      const st = svi.status === 'up' ? 'up                   ' : 'administratively down'
      const proto = svi.status === 'up' && svi.ip ? 'up' : 'down'
      lines.push(`${'Vlan' + id}${' '.repeat(Math.max(1, 23 - ('Vlan' + id).length))}${ip.padEnd(16)}${ok}  manual  ${st} ${proto}`)
    }
    return lines
  }

  private ipRoute(): string[] {
    if (!this.ipRouting) return ['% IP routing not enabled']
    const lines = [
      'Codes: C - connected, S - static, O - OSPF',
      '',
    ]
    for (const [id, svi] of this.sviInterfaces) {
      if (svi.ip && svi.status === 'up') {
        lines.push(`C        ${svi.ip}/${svi.prefix ?? 24} is directly connected, Vlan${id}`)
      }
    }
    for (const r of this.staticRoutes) {
      lines.push(`S        ${r.network}/${r.prefixLen} [1/0] via ${r.nextHop}`)
    }
    if (lines.length === 2) lines.push('(no routes)')
    return lines
  }

  private fmtRunningConfig(): string[] {
    const lines = ['!', `hostname ${this.dev.name}`, '!']
    if (this.vtpDomain) { lines.push(`vtp domain ${this.vtpDomain}`); lines.push(`vtp mode ${this.vtpMode}`); lines.push('!') }
    if (this.ipRouting) { lines.push('ip routing'); lines.push('!') }
    for (const [id, name] of this.vlans) {
      lines.push(`vlan ${id}`); lines.push(` name ${name}`); lines.push('!')
    }
    for (const p of this.dev.ports) {
      lines.push(`interface ${p}`)
      const mode = this.portMode.get(p) ?? 'access'
      const vlan = this.portVlan.get(p) ?? 1
      lines.push(` switchport mode ${mode}`)
      if (mode === 'access') lines.push(` switchport access vlan ${vlan}`)
      if (mode === 'trunk') {
        const native = this.trunkNativeVlan.get(p)
        if (native && native !== 1) lines.push(` switchport trunk native vlan ${native}`)
        const allowed = this.trunkAllowedVlans.get(p)
        if (allowed) lines.push(` switchport trunk allowed vlan ${Array.from(allowed).sort((a,b)=>a-b).join(',')}`)
      }
      const pcg = this.portChannelGroup.get(p)
      if (pcg) lines.push(` channel-group ${pcg.group} mode ${pcg.mode}`)
      const stpPri = this.stpPriority.get(vlan)
      if (stpPri !== undefined) lines.push(` spanning-tree vlan ${vlan} priority ${stpPri}`)
      lines.push('!')
    }
    for (const [id, svi] of this.sviInterfaces) {
      lines.push(`interface Vlan${id}`)
      if (svi.description) lines.push(` description ${svi.description}`)
      if (svi.ip && svi.prefix !== undefined) lines.push(` ip address ${svi.ip} ${prefixLenToMask(svi.prefix)}`)
      lines.push(svi.status === 'up' ? ' no shutdown' : ' shutdown')
      lines.push('!')
    }
    for (const [id, pc] of this.portChannels) {
      lines.push(`interface Port-channel${id}`)
      lines.push(' switchport mode trunk')
      lines.push('!')
    }
    for (const r of this.staticRoutes) {
      lines.push(`ip route ${r.network} ${prefixLenToMask(r.prefixLen)} ${r.nextHop}`)
    }
    if (this.staticRoutes.length) lines.push('!')
    for (const [, proc] of this.ospfProcesses) {
      lines.push(`router ospf ${proc.processId}`)
      for (const n of proc.networks) lines.push(` network ${n.ip} ${n.wildcard} area ${n.area}`)
      lines.push('!')
    }
    lines.push(`spanning-tree mode ${this.stpMode}`)
    if (this.spanningTreePortfast) lines.push('spanning-tree portfast default')
    lines.push('!')
    lines.push('end')
    return lines
  }

  private execDatacom(cmd: string): string[] {
    if (cmd === 'show version' || cmd === 'sh ver') {
      const portCount = this.dev.ports.length
      const model = portCount <= 24 ? 'DM/4270G-24T' : 'DM/4270G-48T'
      const serial = 'DTC' + Math.floor(Math.random() * 900000 + 100000)
      return [
        `Datacom DataOS Software, Version 3.12.3 (DM Enterprise Switch)`,
        `Technical Support: http://www.datacom.ind.br`,
        `Copyright (c) 2004-2024 Datacom Telematica Ltda.`,
        '',
        `${this.dev.name} uptime is 0 minutes`,
        `System image file is "flash:dataos-switch-3.12.3.bin"`,
        '',
        `Datacom ${model} (revision 2.0) with 256MB memory.`,
        `Processor board ID ${serial}`,
        `${portCount} GigabitEthernet interface(s)`,
        `512K bytes of non-volatile configuration memory.`,
        '',
        `Configuration register is 0x2102`,
        this.prompt(),
      ]
    }
    return this.execCisco(cmd)
  }

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    let pool: string[] = []
    if (this.mode === 'user') pool = ['enable', '?']
    else if (this.mode === 'enable') pool = [
      'configure terminal', 'conf t', 'disable', 'exit',
      'show mac address-table', 'show interfaces', 'show interfaces status',
      'show interfaces trunk', 'show vlan brief', 'show vlan', 'show running-config',
      'show version', 'show spanning-tree', 'show vtp status',
      'show etherchannel summary',
      'show ip interface brief', 'show ip route',
      'clear mac address-table', 'write memory', 'write', '?',
    ]
    else if (this.mode === 'config') pool = [
      'end', 'exit', 'hostname ',
      ...this.dev.ports.map(p => 'interface ' + this.dev.shortPort(p)),
      ...Array.from(this.vlans.keys()).map(id => `interface Vlan${id}`),
      'interface Vlan ', 'interface Port-channel ',
      'vlan ', 'no vlan ',
      'vtp domain ', 'vtp mode server', 'vtp mode client', 'vtp mode transparent',
      'vtp version 2', 'vtp version 3',
      'ip routing', 'no ip routing',
      'ip route ', 'no ip route ',
      'router ospf ',
      'ip default-gateway ',
      'spanning-tree mode rapid-pvst', 'spanning-tree mode pvst',
      'spanning-tree portfast default',
      'spanning-tree vlan ', 'spanning-tree vlan ',
      'do show mac address-table', 'do show vlan brief', 'do show interfaces',
      'do show running-config', 'do show ip interface brief', '?',
    ]
    else if (this.mode === 'config-vlan') pool = ['name ', 'exit', 'end', '?']
    else if (this.mode === 'config-router') pool = ['network ', 'no network ', 'exit', 'end', '?']
    else pool = [
      'description ', 'no shutdown', 'no shut', 'shutdown',
      'switchport mode access', 'switchport mode trunk',
      'switchport access vlan ', 'switchport trunk allowed vlan ',
      'switchport trunk allowed vlan add ', 'switchport trunk allowed vlan remove ',
      'switchport trunk native vlan ', 'switchport voice vlan ',
      'switchport trunk encapsulation dot1q', 'switchport nonegotiate',
      'channel-group ', 'channel-group 1 mode active', 'channel-group 1 mode passive', 'channel-group 1 mode on',
      'spanning-tree portfast', 'spanning-tree vlan ',
      'ip address ', 'no ip address',
      'ip access-group ', 'no ip access-group',
      'speed 10', 'speed 100', 'speed 1000', 'speed auto',
      'duplex full', 'duplex half', 'duplex auto',
      'do show mac address-table', 'do show interfaces status', 'do show vlan',
      'exit', 'end', '?',
    ]
    return pool.filter(c => c.startsWith(lo))
  }
}
