import type { RouterDevice } from '../../devices/router'
import type { RouterBrandCLI } from './base'
import { maskToPrefixLen, prefixLenToMask, isValidMask } from '../../ip-utils'

export class HuaweiRouterCLI implements RouterBrandCLI {
  mode = 'user'
  currentIfs: string[] = []
  private routerProto = ''
  private ospfArea = -1

  constructor(readonly dev: RouterDevice) {}

  getPrompt(): string {
    const n = this.dev.name
    if (this.mode === 'user')      return `\x1b[36m<${n}>\x1b[0m`
    if (this.mode === 'system')    return `\x1b[36m[${n}]\x1b[0m`
    if (this.mode === 'interface') {
      const ifShort = this.currentIfs[0]?.replace('GigabitEthernet', 'GE') ?? ''
      return `\x1b[36m[${n}-${ifShort}]\x1b[0m`
    }
    if (this.mode === 'ospf')      return `\x1b[36m[${n}-ospf-${this.routerProto.split('-')[1]}]\x1b[0m`
    if (this.mode === 'ospf-area') return `\x1b[36m[${n}-ospf-${this.routerProto.split('-')[1]}-area-${this.ospfArea}]\x1b[0m`
    if (this.mode === 'rip')       return `\x1b[36m[${n}-rip-${this.routerProto.split('-')[1]}]\x1b[0m`
    if (this.mode === 'bgp')       return `\x1b[36m[${n}-bgp]\x1b[0m`
    if (this.mode === 'acl')       return `\x1b[36m[${n}-acl-${this.routerProto}]\x1b[0m`
    if (this.mode === 'dhcp')      return `\x1b[36m[${n}-dhcp-pool-${this.routerProto}]\x1b[0m`
    return `\x1b[36m[${n}]\x1b[0m`
  }

  getBanner(): string[] {
    return [
      '\x1b[36mHuawei Versatile Routing Platform Software',
      'VRP (R) software, Version 5.170 (AR2220 V200R009C00SPC500)',
      'Copyright (C) 2011-2018 HUAWEI TECH CO., LTD\x1b[0m',
      '',
      `\x1b[33m${this.dev.name}\x1b[0m uptime is 0 week(s), 0 day(s), 0 hour(s), 0 minute(s)`,
      '',
    ]
  }

  execute(cmd: string): string[] {
    const p = this.getPrompt()

    if (this.mode === 'user') {
      if (cmd === 'system-view') { this.mode = 'system'; return [this.getPrompt()] }
      if (cmd.startsWith('display '))  return [...this.show(cmd.slice(8).trim()), p]
      if (cmd.startsWith('ping '))     return ['__ASYNC_PING__' + cmd.slice(5).trim()]
      if (cmd.startsWith('tracert '))  return ['__ASYNC_TRACE__' + cmd.slice(8).trim()]
      if (cmd === '?' || cmd === 'help') return [
        '  system-view                 Enter system view',
        '  display ip routing-table    Routing table',
        '  display interface           Interfaces',
        '  display arp                 ARP table',
        '  display ospf peer brief     OSPF neighbors',
        '  display bgp routing-table   BGP table',
        '  ping <ip>                   Ping',
        '  tracert <ip>                Traceroute',
        p,
      ]
      return [`Error: Unrecognized command found at '^' position.`, p]
    }

    if (this.mode === 'system') {
      return this.execSystem(cmd)
    }

    if (this.mode === 'interface') {
      return this.execInterface(cmd)
    }

    if (this.mode === 'ospf') {
      return this.execOspf(cmd)
    }

    if (this.mode === 'ospf-area') {
      return this.execOspfArea(cmd)
    }

    if (this.mode === 'rip') {
      return this.execRip(cmd)
    }

    if (this.mode === 'bgp') {
      return this.execBgp(cmd)
    }

    if (this.mode === 'acl') {
      return this.execAcl(cmd)
    }

    if (this.mode === 'dhcp') {
      return this.execDhcp(cmd)
    }

    return [`Error: Unrecognized command found at '^' position.`, p]
  }

  private execSystem(cmd: string): string[] {
    const p = this.getPrompt()

    if (cmd === 'quit' || cmd === 'return') { this.mode = 'user'; return [this.getPrompt()] }

    // Interface
    if (cmd.startsWith('interface ')) {
      const ifName = this.dev.resolveIfName(cmd.slice(10).trim())
      if (!this.dev.interfaces.has(ifName)) return [`Error: Interface ${ifName} not found. Available: ${this.dev.ifList()}`, p]
      this.currentIfs = [ifName]; this.mode = 'interface'; return [this.getPrompt()]
    }

    if (cmd.startsWith('sysname ')) { this.dev.name = cmd.slice(8).trim(); return [this.getPrompt()] }
    if (cmd.startsWith('ip route-static '))     return [...this.dev.addStaticRoute(cmd.slice(16).trim(), 'huawei'), p]
    if (cmd.startsWith('undo ip route-static ')) return [...this.dev.removeStaticRoute(cmd.slice(21).trim(), 'huawei'), p]
    if (cmd.startsWith('display '))             return [...this.show(cmd.slice(8).trim()), p]

    // OSPF
    const ospfM = cmd.match(/^ospf (\d+)(?:\s+router-id\s+(\S+))?$/)
    if (ospfM) {
      const pid = parseInt(ospfM[1])
      if (!this.dev.ospfProcesses.has(pid)) {
        this.dev.ospfProcesses.set(pid, {
          processId: pid, areas: new Map(), networks: [],
          redistributeConnected: false, redistributeStatic: false, defaultInformation: false,
          routerId: ospfM[2],
        })
      } else if (ospfM[2]) {
        this.dev.ospfProcesses.get(pid)!.routerId = ospfM[2]
      }
      this.routerProto = `ospf-${pid}`; this.mode = 'ospf'; return [this.getPrompt()]
    }
    const undoOspf = cmd.match(/^undo ospf (\d+)$/)
    if (undoOspf) { this.dev.ospfProcesses.delete(parseInt(undoOspf[1])); return [p] }

    // RIP
    const ripM = cmd.match(/^rip (\d+)$/)
    if (ripM) {
      if (!this.dev.ripConfig) {
        this.dev.ripConfig = { version: 2, networks: [], passive: new Set(), noAutoSummary: false, redistributeStatic: false, redistributeConnected: false }
      }
      this.routerProto = `rip-${ripM[1]}`; this.mode = 'rip'; return [this.getPrompt()]
    }

    // BGP
    const bgpM = cmd.match(/^bgp (\d+)$/)
    if (bgpM) {
      if (!this.dev.bgpConfig) {
        this.dev.bgpConfig = { localAs: parseInt(bgpM[1]), neighbors: new Map(), networks: [] }
      }
      this.mode = 'bgp'; return [this.getPrompt()]
    }

    // ACL
    const aclNumM = cmd.match(/^acl (number\s+)?(\d+)$/)
    if (aclNumM) {
      const name = aclNumM[2]
      if (!this.dev.accessLists.has(name)) this.dev.accessLists.set(name, [])
      this.routerProto = name; this.mode = 'acl'; return [this.getPrompt()]
    }
    const aclNameM = cmd.match(/^acl name (\S+) (basic|advanced)$/)
    if (aclNameM) {
      const name = aclNameM[1]
      if (!this.dev.accessLists.has(name)) this.dev.accessLists.set(name, [])
      this.routerProto = name; this.mode = 'acl'; return [this.getPrompt()]
    }

    // DHCP
    if (cmd === 'dhcp enable') { return [p] }
    const dhcpPool = cmd.match(/^dhcp server pool (\S+)$/)
    if (dhcpPool) {
      const name = dhcpPool[1]
      if (!this.dev.dhcpPools.has(name)) this.dev.dhcpPools.set(name, { name, network: '', prefix: 24, excludedAddresses: [] })
      this.routerProto = name; this.mode = 'dhcp'; return [this.getPrompt()]
    }

    // NAT address group
    const natGroup = cmd.match(/^nat address-group (\d+) (\S+) (\S+)$/)
    if (natGroup) {
      this.dev.natConfig.pools.set(`group${natGroup[1]}`, { start: natGroup[2], end: natGroup[3], prefix: 24 })
      return [p]
    }

    if (cmd === 'save') {
      return [
        `Warning: The current configuration will be written to the device.`,
        `Are you sure to continue?[Y/N]\x1b[33my\x1b[0m`,
        `\x1b[32mInfo: Please input the file name ( *.cfg, *.zip ) [vrpcfg.zip]:`,
        `vrpcfg.zip\x1b[0m`,
        `\x1b[32mNow saving the current configuration to the slot 0.`,
        `Save the configuration successfully.\x1b[0m`,
        p,
      ]
    }
    if (cmd === 'reset saved-configuration') {
      return [`\x1b[33mWarning: The action will delete the saved configuration. Continue? [Y/N]:y\x1b[0m`, `\x1b[32mReset saved configuration successfully.\x1b[0m`, p]
    }
    if (cmd === 'reboot') {
      return [`\x1b[33mInfo: The system is now comparing the configuration. Please wait.\x1b[0m`, `\x1b[33mReboot requested. (Simulation: state preserved)\x1b[0m`, p]
    }
    if (cmd.startsWith('header login ') || cmd.startsWith('banner ')) return [p]
    if (cmd.startsWith('aaa') || cmd.startsWith('local-user ')) return [p]
    if (cmd.startsWith('ntp') || cmd.startsWith('clock ')) return [p]
    if (cmd.startsWith('ip domain-name ')) return [p]
    if (cmd === '?' || cmd === 'help') return [
      `  interface <if>                  Enter interface view`,
      `  sysname <name>                  Set hostname`,
      `  ip route-static <dst> <pfx|mask> <nexthop>`,
      `  undo ip route-static <dst> <pfx|mask> <nexthop>`,
      `  ospf <id> [router-id <ip>]      Configure OSPF`,
      `  rip <id>                        Configure RIP`,
      `  bgp <as>                        Configure BGP`,
      `  acl [number] <id>               Configure numbered ACL`,
      `  acl name <name> basic|advanced  Configure named ACL`,
      `  dhcp enable                     Enable DHCP`,
      `  dhcp server pool <name>         DHCP pool`,
      `  nat address-group <id> <start> <end>`,
      `  display <...>                   Display information`,
      `  save                            Save current configuration`,
      `  quit / return                   Exit to user view`,
      p,
    ]
    return [`Error: Unrecognized command found at '^' position.`, p]
  }

  private execInterface(cmd: string): string[] {
    const p = this.getPrompt()
    if (cmd === 'quit')   { this.mode = 'system'; this.currentIfs = []; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   this.currentIfs = []; return [this.getPrompt()] }

    for (const currentIf of this.currentIfs) {
      const iface = this.dev.interfaces.get(currentIf)!
      if (cmd.startsWith('ip address ')) {
        const parts = cmd.slice(11).trim().split(/\s+/)
        iface.ip = parts[0]
        iface.prefixLen = isValidMask(parts[1]) ? maskToPrefixLen(parts[1]) : parseInt(parts[1])
      } else if (cmd === 'undo ip address') {
        iface.ip = undefined; iface.prefixLen = undefined
      } else if (cmd === 'undo shutdown') {
        iface.status = 'up'
      } else if (cmd === 'shutdown') {
        iface.status = 'down'
      } else if (cmd.startsWith('description ')) {
        iface.description = cmd.slice(12).trim()
      } else if (cmd === 'undo description') {
        iface.description = undefined
      } else if (cmd === 'ip nat inside') {
        this.dev.natConfig.insideInterfaces.add(currentIf)
        this.dev.natConfig.outsideInterfaces.delete(currentIf)
      } else if (cmd === 'ip nat outside') {
        this.dev.natConfig.outsideInterfaces.add(currentIf)
        this.dev.natConfig.insideInterfaces.delete(currentIf)
      }
    }
    this.dev.updateConnectedRoutes()

    // NAT outbound on interface
    const natOut = cmd.match(/^nat outbound (\S+)(?:\s+address-group (\d+))?$/)
    if (natOut) {
      this.dev.natConfig.aclRef = natOut[1]
      this.dev.natConfig.overload = true
      return [p]
    }
    const natStatic = cmd.match(/^nat static global (\S+) inside (\S+)$/)
    if (natStatic) {
      this.dev.natConfig.staticMappings.set(natStatic[2], natStatic[1])
      return [p]
    }

    return [p]
  }

  private execOspf(cmd: string): string[] {
    const p = this.getPrompt()
    const pid = parseInt(this.routerProto.split('-')[1])
    const proc = this.dev.ospfProcesses.get(pid)
    if (!proc) { this.mode = 'system'; return [this.getPrompt()] }

    if (cmd === 'quit')   { this.mode = 'system'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   return [this.getPrompt()] }

    const areaM = cmd.match(/^area (\d+)$/)
    if (areaM) {
      this.ospfArea = parseInt(areaM[1])
      if (!proc.areas.has(this.ospfArea)) proc.areas.set(this.ospfArea, { areaId: this.ospfArea, interfaces: [], stubArea: false })
      this.mode = 'ospf-area'; return [this.getPrompt()]
    }
    const ridM = cmd.match(/^router-id (\S+)$/)
    if (ridM) { proc.routerId = ridM[1]; return [p] }
    if (cmd.startsWith('silent-interface ')) return [p]
    if (cmd === 'default-route-advertise always' || cmd === 'default-route-advertise') {
      proc.defaultInformation = true; return [p]
    }
    if (cmd === 'import-route static') { proc.redistributeStatic = true; return [p] }
    if (cmd === 'import-route direct') { proc.redistributeConnected = true; return [p] }
    if (cmd === 'undo default-route-advertise') { proc.defaultInformation = false; return [p] }
    return [p]
  }

  private execOspfArea(cmd: string): string[] {
    const p = this.getPrompt()
    const pid = parseInt(this.routerProto.split('-')[1])
    const proc = this.dev.ospfProcesses.get(pid)
    const area = proc?.areas.get(this.ospfArea)

    if (cmd === 'quit')   { this.mode = 'ospf'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user'; return [this.getPrompt()] }
    if (!proc || !area) { this.mode = 'system'; return [this.getPrompt()] }

    const netM = cmd.match(/^network (\S+) (\S+)$/)
    if (netM) {
      proc.networks.push({ ip: netM[1], wildcard: netM[2], area: this.ospfArea })
      if (!area.interfaces.includes(netM[1])) area.interfaces.push(netM[1])
      return [p]
    }
    if (cmd === 'stub') { area.stubArea = true; return [p] }
    if (cmd === 'undo stub') { area.stubArea = false; return [p] }
    return [p]
  }

  private execRip(cmd: string): string[] {
    const p = this.getPrompt()
    const rip = this.dev.ripConfig
    if (!rip) { this.mode = 'system'; return [this.getPrompt()] }

    if (cmd === 'quit')   { this.mode = 'system'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   return [this.getPrompt()] }
    if (cmd === 'version 2') { rip.version = 2; return [p] }
    if (cmd.startsWith('network ')) { rip.networks.push(cmd.slice(8).trim()); return [p] }
    if (cmd.startsWith('undo network ')) { rip.networks = rip.networks.filter(n => n !== cmd.slice(13).trim()); return [p] }
    if (cmd === 'undo summary') { rip.noAutoSummary = true; return [p] }
    if (cmd.startsWith('silent-interface ')) { rip.passive.add(cmd.slice(17).trim()); return [p] }
    if (cmd.startsWith('undo silent-interface ')) { rip.passive.delete(cmd.slice(22).trim()); return [p] }
    return [p]
  }

  private execBgp(cmd: string): string[] {
    const p = this.getPrompt()
    const bgp = this.dev.bgpConfig
    if (!bgp) { this.mode = 'system'; return [this.getPrompt()] }

    if (cmd === 'quit')   { this.mode = 'system'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   return [this.getPrompt()] }

    if (cmd.startsWith('router-id ')) { bgp.routerId = cmd.slice(10).trim(); return [p] }
    const peerAs = cmd.match(/^peer (\S+) as-number (\d+)$/)
    if (peerAs) {
      const addr = peerAs[1], remoteAs = parseInt(peerAs[2])
      if (!bgp.neighbors.has(addr)) bgp.neighbors.set(addr, { remoteAs })
      else bgp.neighbors.get(addr)!.remoteAs = remoteAs
      return [p]
    }
    const peerDesc = cmd.match(/^peer (\S+) description (.+)$/)
    if (peerDesc) {
      if (bgp.neighbors.has(peerDesc[1])) bgp.neighbors.get(peerDesc[1])!.description = peerDesc[2]
      return [p]
    }
    const undoPeer = cmd.match(/^undo peer (\S+)$/)
    if (undoPeer) { bgp.neighbors.delete(undoPeer[1]); return [p] }
    const netMask = cmd.match(/^network (\S+) (\S+)$/)
    if (netMask) { bgp.networks.push({ ip: netMask[1], mask: netMask[2] }); return [p] }
    return [p]
  }

  private execAcl(cmd: string): string[] {
    const p = this.getPrompt()
    const entries = this.dev.accessLists.get(this.routerProto) ?? []

    if (cmd === 'quit')   { this.mode = 'system'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   return [this.getPrompt()] }

    const ruleBasic = cmd.match(/^rule (\d+)? (deny|permit) source (\S+) (\S+)$/)
    if (ruleBasic) {
      const seq = ruleBasic[1] ? parseInt(ruleBasic[1]) : (entries.length * 5 + 5)
      entries.push({ seq, action: ruleBasic[2] as 'permit'|'deny', protocol: 'ip', srcIp: ruleBasic[3], srcWild: ruleBasic[4], dstIp: 'any', dstWild: '0.0.0.0' })
      return [p]
    }
    const ruleExt = cmd.match(/^rule (\d+)? (deny|permit) ip source (\S+) (\S+) destination (\S+) (\S+)$/)
    if (ruleExt) {
      const seq = ruleExt[1] ? parseInt(ruleExt[1]) : (entries.length * 5 + 5)
      entries.push({ seq, action: ruleExt[2] as 'permit'|'deny', protocol: 'ip', srcIp: ruleExt[3], srcWild: ruleExt[4], dstIp: ruleExt[5], dstWild: ruleExt[6] })
      return [p]
    }
    return [p]
  }

  private execDhcp(cmd: string): string[] {
    const p = this.getPrompt()
    const pool = this.dev.dhcpPools.get(this.routerProto)

    if (cmd === 'quit')   { this.mode = 'system'; return [this.getPrompt()] }
    if (cmd === 'return') { this.mode = 'user';   return [this.getPrompt()] }
    if (!pool) { this.mode = 'system'; return [this.getPrompt()] }

    const netM = cmd.match(/^network (\S+) mask (\S+)$/)
    if (netM) {
      pool.network = netM[1]
      pool.prefix = isValidMask(netM[2]) ? maskToPrefixLen(netM[2]) : parseInt(netM[2])
      return [p]
    }
    if (cmd.startsWith('gateway-list '))   { pool.defaultRouter = cmd.slice(13).trim(); return [p] }
    if (cmd.startsWith('dns-list '))       { pool.dnsServer = cmd.slice(9).trim(); return [p] }
    const excl = cmd.match(/^excluded-ip-address (\S+)(?: (\S+))?$/)
    if (excl) { pool.excludedAddresses.push(excl[2] ? `${excl[1]} ${excl[2]}` : excl[1]); return [p] }
    return [p]
  }

  private show(sub: string): string[] {
    if (sub === 'ip routing-table')                           return this.dev.fmtRoutes('huawei')
    if (sub === 'ip routing-table protocol ospf')             return this.showOspfRoutes()
    if (sub === 'arp' || sub === 'arp all')                   return this.dev.fmtArp('huawei')
    if (sub === 'interface brief' || sub === 'interface')     return this.dev.fmtIntBrief('huawei')
    if (sub === 'interface detail')                           return this.dev.fmtIfDetail('huawei')
    if (sub === 'current-configuration' || sub === 'current-config') return this.fmtCurrentConfig()
    if (sub === 'saved-configuration')   return ['No saved configuration.']

    if (sub === 'ospf peer brief' || sub === 'ospf peer') return this.showOspfPeer()
    if (sub === 'ospf lsdb')             return this.showOspfLsdb()
    if (sub === 'ospf routing')          return this.showOspfRouting()
    if (sub === 'ospf interface')        return this.showOspfInterface()

    if (sub === 'bgp routing-table')     return this.showBgpTable()
    if (sub === 'bgp peer')              return this.showBgpPeer()

    if (sub.startsWith('acl '))          return this.showAcl(sub.slice(4).trim())
    if (sub === 'acl all')               return this.showAcl(null)

    if (sub === 'dhcp server pool')      return this.showDhcpPool()
    if (sub === 'dhcp server binding')   return [`(no DHCP bindings – simulation only)`]
    if (sub === 'nat session')           return this.showNatSession()
    if (sub === 'nat outbound')          return this.showNatOutbound()

    if (sub === 'version') {
      return [
        `Huawei Versatile Routing Platform Software`,
        `VRP (R) software, Version 5.170 (AR2220 V200R009C00SPC500)`,
        `Copyright (C) 2011-2018 HUAWEI TECH CO., LTD`,
        ``,
        `${this.dev.name} uptime is 0 week(s) 0 day(s) 0 hour(s) 0 minute(s)`,
        ``,
        `HUAWEI AR2220 Router uptime is 0 week(s), 0 day(s), 0 hour(s), 0 minute(s)`,
        `1 main boards in chassis`,
      ]
    }
    if (sub.startsWith('cpu') || sub.startsWith('memory')) return [`CPU Usage: 0%`, `Memory Usage: 30%`]
    if (sub.startsWith('log')) return [`Info center not enabled.`]
    return [`Error: Unrecognized command.`]
  }

  private showOspfPeer(): string[] {
    if (this.dev.ospfProcesses.size === 0) return ['OSPF Process not found.']
    const lines = ['OSPF Process 1 with Router ID', '', 'Peer Statistic information', 'Area Id          Interface                        Neighbor id      State']
    for (const [pid] of this.dev.ospfProcesses) {
      const neighbors = this.dev.getOspfNeighbors(pid)
      for (const n of neighbors) {
        const areaId = this.dev.ospfProcesses.get(pid)!.networks[0]?.area ?? 0
        lines.push(`${String(areaId).padEnd(17)}${n.ifName.replace('GigabitEthernet','GE').padEnd(33)}${n.neighborId.padEnd(17)}${n.state}`)
      }
    }
    if (lines.length === 4) lines.push('(no OSPF neighbors)')
    return lines
  }

  private showOspfLsdb(): string[] {
    if (this.dev.ospfProcesses.size === 0) return ['OSPF Process not found.']
    const lines: string[] = []
    for (const [, proc] of this.dev.ospfProcesses) {
      const rid = proc.routerId ?? this.guessRouterId()
      lines.push(``, `            OSPF Process ${proc.processId} with Router ID ${rid}`, ``)
      lines.push(`                  Area: 0.0.0.0`, ``)
      lines.push(`  Type      LinkState ID    AdvRouter       Age  Len   Sequence   Metric`)
      lines.push(`  Router    ${rid.padEnd(16)}${rid.padEnd(16)}42   ${proc.networks.length * 28 + 36}   80000001   0`)
      lines.push(``)
    }
    return lines
  }

  private showOspfRouting(): string[] {
    if (this.dev.ospfProcesses.size === 0) return ['OSPF Process not found.']
    const lines = ['OSPF Process 1 with Router ID', '', 'Routing Tables:', '', 'Routing for Network:']
    for (const [, proc] of this.dev.ospfProcesses) {
      for (const net of proc.networks)
        lines.push(`  Destination: ${net.ip}    Area: ${net.area}`)
    }
    return lines
  }

  private showOspfInterface(): string[] {
    if (this.dev.ospfProcesses.size === 0) return ['OSPF Process not found.']
    const lines: string[] = []
    for (const [, proc] of this.dev.ospfProcesses) {
      for (const [ifName, iface] of this.dev.interfaces) {
        if (!iface.ip || !this.dev.isInterfaceInOspf(proc.processId, ifName, iface.ip)) continue
        const st = iface.status === 'up' ? 'up' : 'down'
        lines.push(`${ifName.replace('GigabitEthernet','GE')}`)
        lines.push(`  OSPF Process ${proc.processId}`)
        lines.push(`  IP Address: ${iface.ip}/${iface.prefixLen}`)
        lines.push(`  State: DR  Type: Broadcast  MTU: 1500`)
        lines.push(`  Timers: Hello 10, Dead 40, Poll 120, Retransmit 5, Transmit Delay 1`)
        lines.push(`  Link Status: ${st}`)
        lines.push(``)
      }
    }
    if (!lines.length) return ['(no OSPF interfaces)']
    return lines
  }

  private showOspfRoutes(): string[] {
    const ospfRoutes = this.dev.routingTable.filter(r => r.source === 'ospf')
    if (!ospfRoutes.length) return ['(no OSPF routes in routing table)']
    const lines = ['Route Flags: R - relay, D - download to fib', '', 'Routing Table : Public', 'Summary Count: ' + ospfRoutes.length, '', 'Destination/Mask    Proto   Pre  Cost  NextHop   Interface']
    for (const r of ospfRoutes) {
      lines.push(`${(r.network + '/' + r.prefixLen).padEnd(20)}OSPF    110  ${r.metric}     ${r.nextHop.padEnd(12)}${r.interface}`)
    }
    return lines
  }

  private showBgpTable(): string[] {
    if (!this.dev.bgpConfig) return ['BGP is not running.']
    const bgp = this.dev.bgpConfig
    const lines = [
      `BGP Local Router ID is ${bgp.routerId ?? this.guessRouterId()}`,
      `Status codes: * - valid, > - best, d - dampened, h - history`,
      `Origin : i - IGP, e - EGP, ? - incomplete`,
      ``,
      `Total Number of Routes: ${bgp.networks.length}`,
      ``,
      `      Network            NextHop        MED        LocPrf    PrefVal Path/Ogn`,
    ]
    for (const net of bgp.networks)
      lines.push(`*>    ${net.ip.padEnd(19)}0.0.0.0        0          100       0         i`)
    return lines
  }

  private showBgpPeer(): string[] {
    if (!this.dev.bgpConfig) return ['BGP is not running.']
    const bgp = this.dev.bgpConfig
    const lines = [
      `BGP local router ID : ${bgp.routerId ?? this.guessRouterId()}`,
      `Local AS number : ${bgp.localAs}`,
      `Total number of peers : ${bgp.neighbors.size}          Peers in established state : ${bgp.neighbors.size}`,
      ``,
      `  Peer            V          AS  MsgRcvd  MsgSent  OutQ  Up/Down       State  PrefRcv`,
    ]
    for (const [addr, nbr] of bgp.neighbors)
      lines.push(`  ${addr.padEnd(16)}4  ${String(nbr.remoteAs).padEnd(12)}5        5        0     00:00:05      Established  1`)
    return lines
  }

  private showAcl(name: string | null): string[] {
    if (this.dev.accessLists.size === 0) return ['No ACL configured.']
    const lines: string[] = []
    for (const [aclName, entries] of this.dev.accessLists) {
      if (name && aclName !== name) continue
      const num = Number(aclName)
      const type = isNaN(num) ? 'named' : (num >= 2000 && num <= 2999 ? 'basic' : 'advanced')
      lines.push(`ACL ${type === 'named' ? 'name ' + aclName : 'number ' + aclName} (${type})`)
      lines.push(` Acl's step is 5`)
      for (const e of entries)
        lines.push(` rule ${e.seq} ${e.action} source ${e.srcIp} ${e.srcWild}`)
    }
    return lines
  }

  private showDhcpPool(): string[] {
    if (this.dev.dhcpPools.size === 0) return ['No DHCP pool configured.']
    const lines: string[] = []
    for (const [, pool] of this.dev.dhcpPools) {
      lines.push(`Pool name: ${pool.name}`)
      lines.push(` Network: ${pool.network} mask ${pool.prefix ? prefixLenToMask(pool.prefix) : '0.0.0.0'}`)
      if (pool.defaultRouter) lines.push(` Gateway: ${pool.defaultRouter}`)
      if (pool.dnsServer)     lines.push(` DNS: ${pool.dnsServer}`)
      lines.push(` Status: activated`)
      lines.push(``)
    }
    return lines
  }

  private showNatSession(): string[] {
    const lines = [` Nat Session Table Information:`, ``, ` Protocol   GlobalIp:Port         LocalIp:Port          State`]
    for (const [local, global] of this.dev.natConfig.staticMappings)
      lines.push(` TCP         ${global.padEnd(22)}${local.padEnd(22)}ESTABLISHED`)
    if (!this.dev.natConfig.staticMappings.size) lines.push(`  (no NAT sessions)`)
    return lines
  }

  private showNatOutbound(): string[] {
    const lines = [` Nat Outbound Information:`, ``, ` Interface            Acl   Address-group/IP/Interface  Type`]
    for (const iface of this.dev.natConfig.outsideInterfaces)
      lines.push(` ${iface.replace('GigabitEthernet','GE').padEnd(22)}${(this.dev.natConfig.aclRef ?? '-').padEnd(6)}${' '.padEnd(30)}pat`)
    if (!this.dev.natConfig.outsideInterfaces.size) lines.push(`  (no NAT outbound rules)`)
    return lines
  }

  private fmtCurrentConfig(): string[] {
    const lines = ['#', `sysname ${this.dev.name}`, '#']
    for (const [, iface] of this.dev.interfaces) {
      lines.push(`interface ${iface.name.replace('GigabitEthernet','GigabitEthernet')}`)
      if (iface.description) lines.push(` description ${iface.description}`)
      if (iface.ip) lines.push(` ip address ${iface.ip} ${prefixLenToMask(iface.prefixLen!)}`)
      if (this.dev.natConfig.insideInterfaces.has(iface.name))  lines.push(` nat enable`)
      lines.push(iface.status === 'up' ? ' undo shutdown' : ' shutdown')
      lines.push('#')
    }
    const statics = this.dev.routingTable.filter(r => r.source === 'static')
    for (const r of statics)
      lines.push(`ip route-static ${r.network} ${prefixLenToMask(r.prefixLen)} ${r.nextHop}`)
    if (statics.length) lines.push('#')

    // OSPF
    for (const [, proc] of this.dev.ospfProcesses) {
      lines.push(`ospf ${proc.processId}${proc.routerId ? ' router-id ' + proc.routerId : ''}`)
      for (const [, area] of proc.areas) {
        lines.push(` area ${area.areaId}`)
        const areaNetworks = proc.networks.filter(n => n.area === area.areaId)
        for (const n of areaNetworks) lines.push(`  network ${n.ip} ${n.wildcard}`)
        if (area.stubArea) lines.push(`  stub`)
      }
      if (proc.redistributeStatic)    lines.push(` import-route static`)
      if (proc.redistributeConnected) lines.push(` import-route direct`)
      if (proc.defaultInformation)    lines.push(` default-route-advertise always`)
      lines.push('#')
    }

    // BGP
    if (this.dev.bgpConfig) {
      const bgp = this.dev.bgpConfig
      lines.push(`bgp ${bgp.localAs}`)
      if (bgp.routerId) lines.push(` router-id ${bgp.routerId}`)
      for (const [addr, nbr] of bgp.neighbors) lines.push(` peer ${addr} as-number ${nbr.remoteAs}`)
      for (const net of bgp.networks) lines.push(` network ${net.ip} ${net.mask}`)
      lines.push('#')
    }

    // NAT
    for (const [, pool] of this.dev.natConfig.pools)
      lines.push(`nat address-group 1 ${pool.start} ${pool.end}`)
    for (const [local, global] of this.dev.natConfig.staticMappings)
      lines.push(`nat static global ${global} inside ${local}`)
    if (this.dev.natConfig.pools.size || this.dev.natConfig.staticMappings.size) lines.push('#')

    // DHCP
    if (this.dev.dhcpPools.size) lines.push('dhcp enable')
    for (const [, pool] of this.dev.dhcpPools) {
      lines.push(`dhcp server pool ${pool.name}`)
      lines.push(` network ${pool.network} mask ${prefixLenToMask(pool.prefix)}`)
      if (pool.defaultRouter) lines.push(` gateway-list ${pool.defaultRouter}`)
      if (pool.dnsServer)     lines.push(` dns-list ${pool.dnsServer}`)
      lines.push('#')
    }

    lines.push('return')
    return lines
  }

  private guessRouterId(): string {
    for (const [, iface] of this.dev.interfaces) {
      if (iface.ip && iface.status === 'up') return iface.ip
    }
    for (const [, iface] of this.dev.interfaces) { if (iface.ip) return iface.ip }
    return '0.0.0.0'
  }

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    const ifLong = Array.from(this.dev.interfaces.keys())
    let pool: string[] = []
    if (this.mode === 'user') pool = [
      'system-view',
      'display ip routing-table', 'display interface brief', 'display interface',
      'display arp', 'display version', 'display current-configuration',
      'display ospf peer brief', 'display ospf lsdb', 'display ospf routing', 'display ospf interface',
      'display bgp routing-table', 'display bgp peer',
      'display acl all', 'display dhcp server pool', 'display nat session', 'display nat outbound',
      'ping ', 'tracert ', '?',
    ]
    else if (this.mode === 'system') pool = [
      'quit', 'return', 'sysname ',
      'ip route-static ', 'undo ip route-static ',
      'display ip routing-table', 'display ip routing-table protocol ospf',
      'display interface brief', 'display arp', 'display version', 'display current-configuration',
      'display ospf peer brief', 'display ospf lsdb', 'display ospf routing', 'display ospf interface',
      'display bgp routing-table', 'display bgp peer',
      'display acl all', 'display dhcp server pool', 'display dhcp server binding',
      'display nat session', 'display nat outbound',
      'ospf ', 'undo ospf ',
      'rip ', 'bgp ',
      'acl number ', 'acl name ',
      'dhcp enable', 'dhcp server pool ',
      'nat address-group ',
      'save', 'reboot', 'reset saved-configuration',
      ...ifLong.map(n => 'interface ' + n.replace('GigabitEthernet', 'GE')),
      '?',
    ]
    else if (this.mode === 'interface') pool = [
      'ip address ', 'undo ip address', 'undo shutdown', 'shutdown',
      'description ', 'undo description',
      'ip nat inside', 'ip nat outside',
      'nat outbound ', 'nat static global ',
      'quit', 'return', '?',
    ]
    else if (this.mode === 'ospf') pool = [
      'area ', 'router-id ', 'silent-interface ',
      'default-route-advertise always', 'import-route static', 'import-route direct',
      'quit', 'return', '?',
    ]
    else if (this.mode === 'ospf-area') pool = [
      'network ', 'stub', 'undo stub',
      'quit', 'return', '?',
    ]
    else if (this.mode === 'rip') pool = [
      'version 2', 'network ', 'undo network ',
      'undo summary', 'silent-interface ', 'undo silent-interface ',
      'quit', 'return', '?',
    ]
    else if (this.mode === 'bgp') pool = [
      'router-id ', 'peer ', 'undo peer ',
      'network ', 'quit', 'return', '?',
    ]
    else pool = [
      'quit', 'return', '?',
    ]
    return pool.filter(c => c.toLowerCase().startsWith(lo))
  }
}
