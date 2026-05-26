import type { RouterDevice } from '../../devices/router'
import type { RouterBrandCLI } from './base'
import { maskToPrefixLen, prefixLenToMask, isValidIp, isValidMask } from '../../ip-utils'

interface OspfArea { areaId: string; interfaces: string[]; passive: Set<string> }
interface BgpGroup { name: string; type: 'external' | 'internal'; localAddress?: string; peerAs?: number; neighbors: Map<string, { peerAs: number; description?: string }> }
interface FwTerm { name: string; fromSrc?: string; fromDst?: string; fromProto?: string; fromPort?: string; fromDstPort?: string; then: 'accept' | 'reject' | 'discard' | 'next term' }
interface FwFilter { name: string; terms: FwTerm[] }
interface PolicyTerm { name: string; fromProto?: string; fromPrefix?: string; then: 'accept' | 'reject' | 'next term' }
interface PolicyStatement { name: string; terms: PolicyTerm[] }
interface NatRule { name: string; matchSrc: string; thenInterface?: boolean; thenPool?: string }
interface NatRuleSet { name: string; rules: NatRule[] }
interface DhcpPool { network: string; prefix: number; low?: string; high?: string; gateway?: string; dns?: string; lease?: number }

export class JuniperRouterCLI implements RouterBrandCLI {
  mode = 'operational'
  currentIfs: string[] = []

  // Extra Junos state
  private ospfAreas: Map<string, OspfArea> = new Map()
  private ospfExport: string[] = []
  private ospfRouterId?: string
  private bgpGroups: Map<string, BgpGroup> = new Map()
  private bgpRouterId?: string
  private bgpLocalAs?: number
  private fwFilters: Map<string, FwFilter> = new Map()
  private policyStatements: Map<string, PolicyStatement> = new Map()
  private prefixLists: Map<string, string[]> = new Map()
  private natRuleSets: Map<string, NatRuleSet> = new Map()
  private dhcpPools: Map<string, DhcpPool> = new Map()

  // edit-path tracking for hierarchical config mode
  private editPath: string[] = []

  constructor(readonly dev: RouterDevice) {}

  getPrompt(): string {
    const n = this.dev.name
    if (this.mode === 'operational') return `\x1b[33m${n}>\x1b[0m `
    const path = this.editPath.length ? ` ${this.editPath.join(' ')}` : ''
    return `\x1b[90m[edit${path}]\x1b[0m\n\x1b[33m${n}#\x1b[0m `
  }

  getBanner(): string[] {
    return [
      '',
      '\x1b[33mJunos 21.2R1.10',
      'Copyright (c) 1996-2021 Juniper Networks, Inc.\x1b[0m',
      '',
      `\x1b[90mType '\x1b[0mconfigure\x1b[90m' to enter configuration mode. Type '\x1b[0m?\x1b[90m' for help.\x1b[0m`,
      '',
    ]
  }

  execute(cmd: string): string[] {
    const p = this.getPrompt()

    if (this.mode === 'operational') {
      if (cmd === 'configure' || cmd === 'configure exclusive') {
        this.mode = 'configuration'; this.editPath = []; return [this.getPrompt()]
      }
      if (cmd.startsWith('show '))       return [...this.show(cmd.slice(5).trim()), p]
      if (cmd.startsWith('ping '))       return ['__ASYNC_PING__' + cmd.slice(5).trim()]
      if (cmd.startsWith('traceroute ')) return ['__ASYNC_TRACE__' + cmd.slice(11).trim()]
      if (cmd === 'clear arp') { this.dev.arpTable.clear(); return ['\x1b[32mARP cache cleared.\x1b[0m', p] }
      if (cmd === 'clear route table inet.0') {
        this.dev.routingTable = this.dev.routingTable.filter(r => r.source === 'connected')
        return ['\x1b[32mStatic routes cleared.\x1b[0m', p]
      }
      if (cmd === 'clear ospf neighbor all') return ['\x1b[32mOSPF neighbors cleared.\x1b[0m', p]
      if (cmd === 'clear bgp neighbor all') return ['\x1b[32mBGP neighbors cleared.\x1b[0m', p]
      if (cmd === 'request system reboot') return ['\x1b[33mReboot requested. (Simulation: state preserved)\x1b[0m', p]
      if (cmd === 'request system snapshot') return ['Snapshot requested.', p]
      if (cmd === '?' || cmd === 'help') return [
        '  configure [exclusive]              Enter configuration mode',
        '  show interfaces [terse|detail]     Interface summary',
        '  show route [table inet.0]          Routing table',
        '  show route protocol ospf           OSPF routes',
        '  show route protocol bgp            BGP routes',
        '  show ospf neighbor                 OSPF neighbors',
        '  show ospf database                 OSPF LSDB',
        '  show ospf interface                OSPF interface detail',
        '  show bgp summary                   BGP summary',
        '  show bgp neighbor                  BGP neighbor detail',
        '  show firewall                      Firewall filter counters',
        '  show policy                        Policy information',
        '  show arp                           ARP table',
        '  show version                       Version info',
        '  show system uptime                 System uptime',
        '  show chassis hardware              Hardware inventory',
        '  show log messages                  System log',
        '  ping <ip>                          Ping',
        '  traceroute <ip>                    Traceroute',
        '  clear arp                          Clear ARP cache',
        '  clear ospf neighbor all            Reset OSPF neighbors',
        '  clear bgp neighbor all             Reset BGP neighbors',
        '  request system reboot              Reboot device',
        p,
      ]
      return [`error: unknown command: ${cmd}`, p]
    }

    // configuration mode
    return this.execConfig(cmd)
  }

  private execConfig(cmd: string): string[] {
    const p = this.getPrompt()

    if (cmd === 'exit' || cmd === 'quit') {
      if (this.editPath.length > 0) { this.editPath.pop(); return [this.getPrompt()] }
      this.mode = 'operational'; return ['Exiting configuration mode', this.getPrompt()]
    }
    if (cmd === 'top') { this.editPath = []; return [this.getPrompt()] }
    if (cmd === 'up') { if (this.editPath.length > 0) this.editPath.pop(); return [this.getPrompt()] }
    if (cmd === 'commit') {
      this.dev.updateConnectedRoutes()
      this.syncOspfToDevice()
      this.syncBgpToDevice()
      return ['\x1b[32mcommit complete\x1b[0m', p]
    }
    if (cmd === 'commit check') {
      this.dev.updateConnectedRoutes()
      return ['\x1b[32mconfiguration check succeeds\x1b[0m', p]
    }
    if (cmd === 'rollback' || cmd === 'rollback 0') return ['load complete', p]
    if (cmd.startsWith('rollback ')) return [`error: rollback ${cmd.slice(9).trim()}: file not found`, p]
    if (cmd.startsWith('run ')) return [...this.show(cmd.slice(4).replace(/^show /, '').trim()), p]

    // show configuration
    if (cmd === 'show configuration' || cmd === 'show' || cmd === 'show | display set') return [...this.fmtConfig(), p]
    if (cmd.startsWith('show ')) return [...this.show(cmd.slice(5).trim()), p]

    // edit (navigate hierarchy)
    if (cmd.startsWith('edit ')) {
      const path = cmd.slice(5).trim().split(/\s+/)
      this.editPath = [...this.editPath, ...path]
      return [this.getPrompt()]
    }

    // set commands
    if (cmd.startsWith('set ')) return [...this.execSet(cmd.slice(4).trim()), p]
    if (cmd.startsWith('delete ')) return [...this.execDelete(cmd.slice(7).trim()), p]

    if (cmd === '?' || cmd === 'help') return [...this.configHelp(), p]
    return [`error: unknown command: ${cmd}`, p]
  }

  private execSet(args: string): string[] {
    // Interfaces
    const addrM = args.match(/^interfaces (\S+)(?:\s+unit\s+\d+)?\s+family\s+inet\s+address\s+(\d+\.\d+\.\d+\.\d+)\/(\d+)$/)
    if (addrM) {
      const ifName = this.dev.resolveIfName(addrM[1])
      if (!this.dev.interfaces.has(ifName)) return [`error: interface ${ifName} not found. Available: ${this.dev.ifList()}`]
      this.dev.interfaces.get(ifName)!.ip = addrM[2]
      this.dev.interfaces.get(ifName)!.prefixLen = parseInt(addrM[3])
      return []
    }
    const ifDisM = args.match(/^interfaces (\S+)\s+(enable|disable)$/)
    if (ifDisM) {
      const ifName = this.dev.resolveIfName(ifDisM[1])
      if (!this.dev.interfaces.has(ifName)) return [`error: interface ${ifName} not found`]
      this.dev.interfaces.get(ifName)!.status = ifDisM[2] === 'enable' ? 'up' : 'down'
      this.dev.updateConnectedRoutes()
      return []
    }
    const ifDescM = args.match(/^interfaces (\S+)\s+description\s+(.+)$/)
    if (ifDescM) {
      const ifName = this.dev.resolveIfName(ifDescM[1])
      if (this.dev.interfaces.has(ifName)) this.dev.interfaces.get(ifName)!.description = ifDescM[2].replace(/"/g, '')
      return []
    }

    // Filter input/output on interface
    const ifFilterM = args.match(/^interfaces (\S+)(?:\s+unit\s+\d+)?\s+family\s+inet\s+filter\s+(input|output)\s+(\S+)$/)
    if (ifFilterM) return []

    // Static routes
    if (args.startsWith('routing-options static route ')) return this.dev.addStaticRoute(args.slice(29).trim(), 'juniper')
    const defM = args.match(/^routing-options static route 0\.0\.0\.0\/0 next-hop (\S+)$/)
    if (defM) return this.dev.addStaticRoute(`0.0.0.0/0 ${defM[1]}`, 'juniper')

    // Router ID
    const ridM = args.match(/^routing-options router-id (\S+)$/)
    if (ridM) { this.ospfRouterId = ridM[1]; this.bgpRouterId = ridM[1]; return [] }

    // Autonomous system
    const asM = args.match(/^routing-options autonomous-system (\d+)$/)
    if (asM) {
      this.bgpLocalAs = parseInt(asM[1])
      if (!this.dev.bgpConfig) this.dev.bgpConfig = { localAs: this.bgpLocalAs, neighbors: new Map(), networks: [] }
      else this.dev.bgpConfig.localAs = this.bgpLocalAs
      return []
    }

    // Hostname
    if (args.startsWith('system host-name ')) { this.dev.name = args.slice(17).trim(); return [] }
    if (args.startsWith('system name-server ')) return []
    if (args.startsWith('system login ')) return []
    if (args.startsWith('system services ')) {
      const dhcpM = args.match(/^system services dhcp local-server group (\S+) interface (\S+)$/)
      if (dhcpM) return []
      return []
    }

    // OSPF
    if (args.startsWith('protocols ospf ')) return this.setOspf(args.slice(15).trim())

    // BGP
    if (args.startsWith('protocols bgp ')) return this.setBgp(args.slice(14).trim())

    // Firewall filter
    if (args.startsWith('firewall filter ')) return this.setFirewallFilter(args.slice(16).trim())

    // Policy options
    if (args.startsWith('policy-options policy-statement ')) return this.setPolicyStatement(args.slice(32).trim())
    if (args.startsWith('policy-options prefix-list ')) {
      const m = args.match(/^policy-options prefix-list (\S+) (\S+)$/)
      if (m) {
        if (!this.prefixLists.has(m[1])) this.prefixLists.set(m[1], [])
        this.prefixLists.get(m[1])!.push(m[2])
        return []
      }
    }
    if (args.startsWith('policy-options community ')) return []

    // NAT
    if (args.startsWith('services nat source rule-set ')) return this.setNat(args.slice(29).trim())

    // DHCP access pool
    if (args.startsWith('access address-assignment pool ')) return this.setDhcpPool(args.slice(31).trim())

    return [`error: set: unknown path: ${args}`]
  }

  private setOspf(args: string): string[] {
    const ridM = args.match(/^router-id (\S+)$/)
    if (ridM) { this.ospfRouterId = ridM[1]; return [] }

    const areaIfM = args.match(/^area (\S+) interface (\S+)$/)
    if (areaIfM) {
      const areaId = areaIfM[1], rawIf = areaIfM[2]
      if (!this.ospfAreas.has(areaId)) this.ospfAreas.set(areaId, { areaId, interfaces: [], passive: new Set() })
      const area = this.ospfAreas.get(areaId)!
      const ifName = this.dev.resolveIfName(rawIf)
      if (!area.interfaces.includes(ifName)) area.interfaces.push(ifName)
      return []
    }

    const areaIfPassiveM = args.match(/^area (\S+) interface (\S+) passive$/)
    if (areaIfPassiveM) {
      const areaId = areaIfPassiveM[1], rawIf = areaIfPassiveM[2]
      if (!this.ospfAreas.has(areaId)) this.ospfAreas.set(areaId, { areaId, interfaces: [], passive: new Set() })
      const area = this.ospfAreas.get(areaId)!
      const ifName = this.dev.resolveIfName(rawIf)
      if (!area.interfaces.includes(ifName)) area.interfaces.push(ifName)
      area.passive.add(ifName)
      return []
    }

    const exportM = args.match(/^export (\S+)$/)
    if (exportM) { if (!this.ospfExport.includes(exportM[1])) this.ospfExport.push(exportM[1]); return [] }

    if (args.match(/^area \S+ stub$/)) return []
    if (args.match(/^area \S+ nssa$/)) return []
    if (args.match(/^graceful-restart$/)) return []
    if (args.match(/^traffic-engineering$/)) return []

    return [`error: unknown ospf option: ${args}`]
  }

  private setBgp(args: string): string[] {
    const groupTypeM = args.match(/^group (\S+) type (external|internal)$/)
    if (groupTypeM) {
      const name = groupTypeM[1]
      if (!this.bgpGroups.has(name)) this.bgpGroups.set(name, { name, type: groupTypeM[2] as 'external'|'internal', neighbors: new Map() })
      else this.bgpGroups.get(name)!.type = groupTypeM[2] as 'external'|'internal'
      return []
    }

    const groupNbrAsM = args.match(/^group (\S+) neighbor (\S+) peer-as (\d+)$/)
    if (groupNbrAsM) {
      const [, gname, addr, asStr] = groupNbrAsM
      if (!this.bgpGroups.has(gname)) this.bgpGroups.set(gname, { name: gname, type: 'external', neighbors: new Map() })
      const grp = this.bgpGroups.get(gname)!
      const remoteAs = parseInt(asStr)
      if (!grp.neighbors.has(addr)) grp.neighbors.set(addr, { peerAs: remoteAs })
      else grp.neighbors.get(addr)!.peerAs = remoteAs
      if (!this.dev.bgpConfig) this.dev.bgpConfig = { localAs: this.bgpLocalAs ?? 65000, neighbors: new Map(), networks: [] }
      this.dev.bgpConfig.neighbors.set(addr, { remoteAs })
      return []
    }

    const groupPeerAsM = args.match(/^group (\S+) peer-as (\d+)$/)
    if (groupPeerAsM) {
      const [, gname, asStr] = groupPeerAsM
      if (!this.bgpGroups.has(gname)) this.bgpGroups.set(gname, { name: gname, type: 'external', neighbors: new Map() })
      this.bgpGroups.get(gname)!.peerAs = parseInt(asStr)
      return []
    }

    const groupLocalAddrM = args.match(/^group (\S+) local-address (\S+)$/)
    if (groupLocalAddrM) {
      if (!this.bgpGroups.has(groupLocalAddrM[1])) this.bgpGroups.set(groupLocalAddrM[1], { name: groupLocalAddrM[1], type: 'internal', neighbors: new Map() })
      this.bgpGroups.get(groupLocalAddrM[1])!.localAddress = groupLocalAddrM[2]
      return []
    }

    const groupNbrM = args.match(/^group (\S+) neighbor (\S+)$/)
    if (groupNbrM) {
      const [, gname, addr] = groupNbrM
      if (!this.bgpGroups.has(gname)) this.bgpGroups.set(gname, { name: gname, type: 'external', neighbors: new Map() })
      const grp = this.bgpGroups.get(gname)!
      if (!grp.neighbors.has(addr)) grp.neighbors.set(addr, { peerAs: grp.peerAs ?? 0 })
      if (!this.dev.bgpConfig) this.dev.bgpConfig = { localAs: this.bgpLocalAs ?? 65000, neighbors: new Map(), networks: [] }
      this.dev.bgpConfig.neighbors.set(addr, { remoteAs: grp.peerAs ?? 0 })
      return []
    }

    const groupNbrDescM = args.match(/^group (\S+) neighbor (\S+) description (.+)$/)
    if (groupNbrDescM) {
      if (!this.bgpGroups.has(groupNbrDescM[1])) this.bgpGroups.set(groupNbrDescM[1], { name: groupNbrDescM[1], type: 'external', neighbors: new Map() })
      const grp = this.bgpGroups.get(groupNbrDescM[1])!
      if (!grp.neighbors.has(groupNbrDescM[2])) grp.neighbors.set(groupNbrDescM[2], { peerAs: 0 })
      grp.neighbors.get(groupNbrDescM[2])!.description = groupNbrDescM[3].replace(/"/g, '')
      return []
    }

    const groupExportM = args.match(/^group (\S+) export (\S+)$/)
    if (groupExportM) return []

    if (args.match(/^local-as \d+$/) || args.match(/^router-id \S+$/)) return []

    return [`error: unknown bgp option: ${args}`]
  }

  private setFirewallFilter(args: string): string[] {
    const termFromSrcM = args.match(/^(\S+) term (\S+) from source-address (\S+)$/)
    if (termFromSrcM) {
      const [, fname, tname, src] = termFromSrcM
      const f = this.ensureFilter(fname)
      const t = this.ensureTerm(f, tname)
      t.fromSrc = src; return []
    }

    const termFromDstM = args.match(/^(\S+) term (\S+) from destination-address (\S+)$/)
    if (termFromDstM) {
      const [, fname, tname, dst] = termFromDstM
      const f = this.ensureFilter(fname)
      const t = this.ensureTerm(f, tname)
      t.fromDst = dst; return []
    }

    const termFromProtoM = args.match(/^(\S+) term (\S+) from protocol (\S+)$/)
    if (termFromProtoM) {
      const [, fname, tname, proto] = termFromProtoM
      const f = this.ensureFilter(fname)
      const t = this.ensureTerm(f, tname)
      t.fromProto = proto; return []
    }

    const termFromPortM = args.match(/^(\S+) term (\S+) from (?:destination-)?port (\S+)$/)
    if (termFromPortM) {
      const [, fname, tname, port] = termFromPortM
      const f = this.ensureFilter(fname)
      const t = this.ensureTerm(f, tname)
      t.fromDstPort = port; return []
    }

    const termThenM = args.match(/^(\S+) term (\S+) then (accept|reject|discard|next term)$/)
    if (termThenM) {
      const [, fname, tname, action] = termThenM
      const f = this.ensureFilter(fname)
      const t = this.ensureTerm(f, tname)
      t.then = action as FwTerm['then']; return []
    }

    const termFromPfxM = args.match(/^(\S+) term (\S+) from source-prefix-list (\S+)$/)
    if (termFromPfxM) return []

    return [`error: unknown firewall filter syntax: ${args}`]
  }

  private ensureFilter(name: string): FwFilter {
    if (!this.fwFilters.has(name)) this.fwFilters.set(name, { name, terms: [] })
    return this.fwFilters.get(name)!
  }

  private ensureTerm(f: FwFilter, name: string): FwTerm {
    let t = f.terms.find(x => x.name === name)
    if (!t) { t = { name, then: 'accept' }; f.terms.push(t) }
    return t
  }

  private setPolicyStatement(args: string): string[] {
    const termFromProtoM = args.match(/^(\S+) term (\S+) from protocol (\S+)$/)
    if (termFromProtoM) {
      const [, pname, tname, proto] = termFromProtoM
      if (!this.policyStatements.has(pname)) this.policyStatements.set(pname, { name: pname, terms: [] })
      const ps = this.policyStatements.get(pname)!
      let t = ps.terms.find(x => x.name === tname)
      if (!t) { t = { name: tname, then: 'accept' }; ps.terms.push(t) }
      t.fromProto = proto; return []
    }

    const termFromPfxM = args.match(/^(\S+) term (\S+) from route-filter (\S+) exact$/)
    if (termFromPfxM) {
      const [, pname, tname, pfx] = termFromPfxM
      if (!this.policyStatements.has(pname)) this.policyStatements.set(pname, { name: pname, terms: [] })
      const ps = this.policyStatements.get(pname)!
      let t = ps.terms.find(x => x.name === tname)
      if (!t) { t = { name: tname, then: 'accept' }; ps.terms.push(t) }
      t.fromPrefix = pfx; return []
    }

    const termThenM = args.match(/^(\S+) term (\S+) then (accept|reject|next term)$/)
    if (termThenM) {
      const [, pname, tname, action] = termThenM
      if (!this.policyStatements.has(pname)) this.policyStatements.set(pname, { name: pname, terms: [] })
      const ps = this.policyStatements.get(pname)!
      let t = ps.terms.find(x => x.name === tname)
      if (!t) { t = { name: tname, then: action as PolicyTerm['then'] }; ps.terms.push(t) }
      else t.then = action as PolicyTerm['then']
      return []
    }

    return []
  }

  private setNat(args: string): string[] {
    const ruleMatchM = args.match(/^(\S+) rule (\S+) match source-address (\S+)$/)
    if (ruleMatchM) {
      const [, rsName, ruleName, src] = ruleMatchM
      if (!this.natRuleSets.has(rsName)) this.natRuleSets.set(rsName, { name: rsName, rules: [] })
      const rs = this.natRuleSets.get(rsName)!
      let rule = rs.rules.find(r => r.name === ruleName)
      if (!rule) { rule = { name: ruleName, matchSrc: src }; rs.rules.push(rule) }
      else rule.matchSrc = src
      return []
    }
    const ruleThenIfM = args.match(/^(\S+) rule (\S+) then source-nat interface$/)
    if (ruleThenIfM) {
      const [, rsName, ruleName] = ruleThenIfM
      if (!this.natRuleSets.has(rsName)) this.natRuleSets.set(rsName, { name: rsName, rules: [] })
      const rs = this.natRuleSets.get(rsName)!
      let rule = rs.rules.find(r => r.name === ruleName)
      if (!rule) { rule = { name: ruleName, matchSrc: '0.0.0.0/0', thenInterface: true }; rs.rules.push(rule) }
      else rule.thenInterface = true
      return []
    }
    return []
  }

  private setDhcpPool(args: string): string[] {
    const rangeM = args.match(/^(\S+) family inet range (\S+) low (\S+) high (\S+)$/)
    if (rangeM) {
      const [, name, , low, high] = rangeM
      if (!this.dhcpPools.has(name)) this.dhcpPools.set(name, { network: name, prefix: 24, low, high })
      else { this.dhcpPools.get(name)!.low = low; this.dhcpPools.get(name)!.high = high }
      return []
    }
    const gwM = args.match(/^(\S+) family inet dhcp-attributes router (\S+)$/)
    if (gwM) {
      if (!this.dhcpPools.has(gwM[1])) this.dhcpPools.set(gwM[1], { network: gwM[1], prefix: 24 })
      this.dhcpPools.get(gwM[1])!.gateway = gwM[2]
      return []
    }
    const dnsM = args.match(/^(\S+) family inet dhcp-attributes name-server (\S+)$/)
    if (dnsM) {
      if (!this.dhcpPools.has(dnsM[1])) this.dhcpPools.set(dnsM[1], { network: dnsM[1], prefix: 24 })
      this.dhcpPools.get(dnsM[1])!.dns = dnsM[2]
      return []
    }
    return []
  }

  private execDelete(args: string): string[] {
    if (args.startsWith('routing-options static route ')) {
      return this.dev.removeStaticRoute(args.slice(29).trim(), 'juniper')
    }
    if (args.startsWith('interfaces ')) {
      const disM = args.match(/^interfaces (\S+)\s+disable$/)
      if (disM) {
        const ifName = this.dev.resolveIfName(disM[1])
        if (!this.dev.interfaces.has(ifName)) return [`error: interface ${ifName} not found`]
        this.dev.interfaces.get(ifName)!.status = 'up'
        this.dev.updateConnectedRoutes()
        return []
      }
      const addrM = args.match(/^interfaces (\S+)(?:\s+unit\s+\d+)?\s+family\s+inet\s+address\s+(\S+)$/)
      if (addrM) {
        const ifName = this.dev.resolveIfName(addrM[1])
        if (!this.dev.interfaces.has(ifName)) return [`error: interface ${ifName} not found`]
        const iface = this.dev.interfaces.get(ifName)!
        iface.ip = undefined; iface.prefixLen = undefined
        this.dev.updateConnectedRoutes()
        return []
      }
    }
    if (args.startsWith('protocols ospf area ')) {
      const m = args.match(/^protocols ospf area (\S+) interface (\S+)$/)
      if (m) {
        const area = this.ospfAreas.get(m[1])
        if (area) area.interfaces = area.interfaces.filter(i => i !== this.dev.resolveIfName(m[2]))
        return []
      }
    }
    if (args.startsWith('protocols bgp group ')) {
      const m = args.match(/^protocols bgp group (\S+) neighbor (\S+)$/)
      if (m) {
        const grp = this.bgpGroups.get(m[1])
        if (grp) { grp.neighbors.delete(m[2]); this.dev.bgpConfig?.neighbors.delete(m[2]) }
        return []
      }
      const gm = args.match(/^protocols bgp group (\S+)$/)
      if (gm) {
        const grp = this.bgpGroups.get(gm[1])
        if (grp) { for (const addr of grp.neighbors.keys()) this.dev.bgpConfig?.neighbors.delete(addr) }
        this.bgpGroups.delete(gm[1])
        return []
      }
    }
    if (args.startsWith('firewall filter ')) {
      const m = args.match(/^firewall filter (\S+)$/)
      if (m) { this.fwFilters.delete(m[1]); return [] }
      const tm = args.match(/^firewall filter (\S+) term (\S+)$/)
      if (tm) {
        const f = this.fwFilters.get(tm[1])
        if (f) f.terms = f.terms.filter(t => t.name !== tm[2])
        return []
      }
    }
    if (args.startsWith('policy-options policy-statement ')) {
      const m = args.match(/^policy-options policy-statement (\S+)$/)
      if (m) { this.policyStatements.delete(m[1]); return [] }
    }
    return []
  }

  private syncOspfToDevice(): void {
    if (this.ospfAreas.size === 0) return
    const pid = 1
    const existing = this.dev.ospfProcesses.get(pid)
    const networks: Array<{ip: string; wildcard: string; area: number}> = []
    for (const [, area] of this.ospfAreas) {
      for (const ifName of area.interfaces) {
        const iface = this.dev.interfaces.get(ifName)
        if (iface?.ip && iface.prefixLen !== undefined) {
          const wild = this.prefixToWildcard(iface.prefixLen)
          networks.push({ ip: iface.ip, wildcard: wild, area: this.areaToNum(area.areaId) })
        }
      }
    }
    if (existing) { existing.networks = networks; if (this.ospfRouterId) existing.routerId = this.ospfRouterId }
    else this.dev.ospfProcesses.set(pid, { processId: pid, areas: new Map(), networks, redistributeConnected: false, redistributeStatic: false, defaultInformation: false, routerId: this.ospfRouterId })
  }

  private syncBgpToDevice(): void {
    if (!this.bgpLocalAs && !this.dev.bgpConfig) return
    if (!this.dev.bgpConfig) this.dev.bgpConfig = { localAs: this.bgpLocalAs ?? 65000, neighbors: new Map(), networks: [] }
    if (this.bgpRouterId) this.dev.bgpConfig.routerId = this.bgpRouterId
  }

  private prefixToWildcard(prefix: number): string {
    const mask = prefixLenToMask(prefix)
    return mask.split('.').map(o => String(255 - parseInt(o))).join('.')
  }

  private areaToNum(area: string): number {
    if (area.includes('.')) { return parseInt(area.split('.')[3]) }
    return parseInt(area) || 0
  }

  // ─── Show commands ────────────────────────────────────────────────────────

  private show(sub: string): string[] {
    if (sub === 'interfaces' || sub === 'interfaces terse') return this.dev.fmtIntBrief('juniper')
    if (sub === 'interfaces detail' || sub === 'interfaces extensive') return this.fmtIfDetail()
    if (sub === 'route' || sub === 'route all' || sub === 'route table inet.0') return this.dev.fmtRoutes('juniper')
    if (sub === 'route protocol ospf') return this.showRouteProto('ospf')
    if (sub === 'route protocol bgp') return this.showRouteProto('bgp')
    if (sub === 'route protocol static') return this.showRouteProto('static')
    if (sub === 'arp') return this.dev.fmtArp('juniper')
    if (sub === 'version') return this.showVersion()
    if (sub === 'configuration' || sub === 'configuration | display set' || sub === '') return this.fmtConfig()
    if (sub === 'system uptime') return this.showUptime()
    if (sub === 'chassis hardware') return this.showChassis()
    if (sub === 'log messages' || sub === 'log messages | last 20') return this.showLog()
    if (sub === 'system alarms') return ['No alarms currently active']
    if (sub === 'pfe statistics traffic') return ['Ingress:  packets: 0  bytes: 0  pps: 0  bps: 0', 'Egress:   packets: 0  bytes: 0  pps: 0  bps: 0']

    // OSPF
    if (sub === 'ospf neighbor' || sub === 'ospf neighbor detail') return this.showOspfNeighbor()
    if (sub === 'ospf database' || sub === 'ospf database detail') return this.showOspfDatabase()
    if (sub === 'ospf interface' || sub === 'ospf interface detail') return this.showOspfInterface()
    if (sub === 'ospf statistics') return this.showOspfStats()
    if (sub === 'ospf route') return this.showOspfRoute()

    // BGP
    if (sub === 'bgp summary') return this.showBgpSummary()
    if (sub === 'bgp neighbor') return this.showBgpNeighbor()
    if (sub === 'bgp neighbor detail') return this.showBgpNeighbor()

    // Firewall / Policy
    if (sub === 'firewall' || sub === 'firewall filter') return this.showFirewall()
    if (sub.startsWith('firewall filter ')) return this.showFirewallFilter(sub.slice(16).trim())
    if (sub === 'policy') return this.showPolicy()
    if (sub.startsWith('route-map ')) return this.showPolicy()

    return [`error: unknown show command: ${sub}`]
  }

  private showVersion(): string[] {
    const portCount = this.dev.interfaces.size
    const model = portCount <= 4 ? 'MX240' : portCount <= 6 ? 'MX480' : 'MX960'
    return [
      `Junos: 21.2R1.10`,
      `JUNOS Base OS boot [21.2R1.10]`,
      ``,
      `Hostname: ${this.dev.name}`,
      `Model: ${model}`,
      `Junos: 21.2R1.10`,
      `JUNOS OS Kernel 64-bit  [20210617.f4049d3_builder_stable_11-21.2R1]`,
      `JUNOS OS libs [20210617.f4049d3_builder_stable_11-21.2R1]`,
      `JUNOS OS runtime [20210617.f4049d3_builder_stable_11-21.2R1]`,
    ]
  }

  private showUptime(): string[] {
    const now = new Date()
    return [
      `Current time: ${now.toUTCString()}`,
      `Time Source:  NTP CLOCK`,
      `System booted: ${now.toUTCString()} (00:00:00 ago)`,
      `Protocols started: ${now.toUTCString()} (00:00:00 ago)`,
      `Last configured: ${now.toUTCString()} (00:00:00 ago)`,
      `  0:00 up 0 mins, 1 user, load averages: 0.01, 0.01, 0.00`,
    ]
  }

  private showChassis(): string[] {
    const portCount = this.dev.interfaces.size
    const model = portCount <= 4 ? 'MX240' : portCount <= 6 ? 'MX480' : 'MX960'
    return [
      `Hardware inventory:`,
      `Item             Version  Part number  Serial number     Description`,
      `Chassis                                JN21AE4EAFAA      ${model}`,
      `Midplane         REV 04   710-029467   ABDCD6399         ${model} Midplane`,
      `FPC 0            REV 11   750-028467   CABBA3199         MPC Type 2 3D`,
      `  PIC 0          REV 04   750-028467   TAB00000          ${portCount}x GE SFP`,
      `Routing Engine 0 REV 03   740-013063   9009205066        RE-S-2000`,
    ]
  }

  private showLog(): string[] {
    const ts = new Date().toUTCString().slice(0, 24)
    return [
      `${ts}  ${this.dev.name} mgd[1234]: UI_DBASE_LOGIN_EVENT: User 'root' login, class 'super-user'`,
      `${ts}  ${this.dev.name} rpd[1235]: RPD_OSPF_NBRUP: OSPF neighbor state change`,
      `${ts}  ${this.dev.name} mgd[1234]: UI_COMMIT: User 'root' requested 'commit'`,
      `${ts}  ${this.dev.name} kernel: ifnet: ge-0/0/0 link state UP`,
    ]
  }

  private showRouteProto(proto: string): string[] {
    const routes = this.dev.routingTable.filter(r => r.source === proto)
    if (!routes.length) return [`inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)`, ``, `(no ${proto} routes)`]
    const lines = [`inet.0: ${routes.length} destinations, ${routes.length} routes (${routes.length} active, 0 holddown, 0 hidden)`, ``]
    for (const r of routes) {
      lines.push(`${r.network}/${r.prefixLen} *[${proto.toUpperCase()}/110] 00:00:10, metric 1`)
      lines.push(`                    > to ${r.nextHop} via ${r.interface ?? 'unknown'}`)
      lines.push(``)
    }
    return lines
  }

  private showOspfNeighbor(): string[] {
    if (this.ospfAreas.size === 0) return ['OSPF is not configured.']
    const neighbors = this.dev.getOspfNeighbors(1)
    if (!neighbors.length) return [
      `Address         Interface              State     ID               Pri  Dead`,
      `(no neighbors)`,
    ]
    const lines = [`Address         Interface              State     ID               Pri  Dead`]
    for (const n of neighbors) {
      const ifShort = n.ifName.replace('GigabitEthernet', 'ge-0/0/').replace(/ge-0\/0\/GigabitEthernet/, 'ge-0/0/')
      lines.push(`${n.neighborId.padEnd(16)}${ifShort.padEnd(23)}Full      ${n.neighborId.padEnd(17)}128  36`)
    }
    return lines
  }

  private showOspfDatabase(): string[] {
    if (this.ospfAreas.size === 0) return ['OSPF is not configured.']
    const rid = this.ospfRouterId ?? this.guessRouterId()
    const lines = [
      `    OSPF database, Area 0.0.0.0`,
      ` Type       ID               Adv Rtr          Seq      Age  Opt  Cksum  Len`,
      `Router      ${rid.padEnd(17)}${rid.padEnd(17)}0x80000001 42   0x22 0x0000 48`,
    ]
    for (const [, iface] of this.dev.interfaces) {
      if (iface.ip) lines.push(`Network     ${iface.ip.padEnd(17)}${rid.padEnd(17)}0x80000001 42   0x22 0x0000 32`)
    }
    return lines
  }

  private showOspfInterface(): string[] {
    if (this.ospfAreas.size === 0) return ['OSPF is not configured.']
    const lines: string[] = []
    for (const [, area] of this.ospfAreas) {
      for (const ifName of area.interfaces) {
        const iface = this.dev.interfaces.get(ifName)
        if (!iface) continue
        const ifShort = ifName.replace('GigabitEthernet', 'ge-0/0/')
        const st = iface.status === 'up' ? 'DR' : 'Down'
        lines.push(`${ifShort}`)
        lines.push(`  Area: ${area.areaId}, State: ${st}, DR ID: ${iface.ip ?? '0.0.0.0'}, BDR ID: 0.0.0.0, Nbrs: 0`)
        lines.push(`  Timer intervals: Hello: 10, Dead: 40, ReXmit: 5`)
        lines.push(`  Passive: ${area.passive.has(ifName) ? 'Yes' : 'No'}`)
        lines.push(``)
      }
    }
    if (!lines.length) return ['(no OSPF interfaces)']
    return lines
  }

  private showOspfStats(): string[] {
    return [
      `OSPF Statistics:`,
      `  Hellos sent: 0    Hellos received: 0`,
      `  DBDs sent: 0      DBDs received: 0`,
      `  LSRs sent: 0      LSRs received: 0`,
      `  LSUs sent: 0      LSUs received: 0`,
      `  LSAcks sent: 0    LSAcks received: 0`,
    ]
  }

  private showOspfRoute(): string[] {
    const ospfRoutes = this.dev.routingTable.filter(r => r.source === 'ospf')
    if (!ospfRoutes.length) return ['(no OSPF routes)']
    const lines = [`Prefix                    Path  Metric    Nexthop             Interface`]
    for (const r of ospfRoutes) {
      lines.push(`${(r.network + '/' + r.prefixLen).padEnd(26)}Intra ${String(r.metric ?? 10).padEnd(10)}${r.nextHop.padEnd(20)}${r.interface ?? ''}`)
    }
    return lines
  }

  private showBgpSummary(): string[] {
    if (!this.dev.bgpConfig && this.bgpGroups.size === 0) return ['BGP is not configured.']
    const localAs = this.bgpLocalAs ?? this.dev.bgpConfig?.localAs ?? 65000
    const rid = this.bgpRouterId ?? this.guessRouterId()
    const totalNbr = this.dev.bgpConfig?.neighbors.size ?? 0
    const lines = [
      `Groups: ${this.bgpGroups.size} Peers: ${totalNbr} Down peers: 0`,
      `Table          Tot Paths  Act Paths Suppressed    History Damp State    Pending`,
      `inet.0                 ${this.dev.bgpConfig?.networks.length ?? 0}          ${this.dev.bgpConfig?.networks.length ?? 0}          0          0          0       0`,
      ``,
      `Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...`,
    ]
    for (const [addr, nbr] of (this.dev.bgpConfig?.neighbors ?? new Map())) {
      lines.push(`${addr.padEnd(25)}${String(nbr.remoteAs).padEnd(8)}5         5         0      0     00:00:05 Established`)
    }
    if (!totalNbr) lines.push('(no BGP peers)')
    lines.push(``, `Local AS: ${localAs}   Router ID: ${rid}`)
    return lines
  }

  private showBgpNeighbor(): string[] {
    if (!this.dev.bgpConfig && this.bgpGroups.size === 0) return ['BGP is not configured.']
    const lines: string[] = []
    for (const [groupName, grp] of this.bgpGroups) {
      for (const [addr, nbr] of grp.neighbors) {
        lines.push(`Peer: ${addr}+179 AS ${nbr.peerAs}  Local: ${this.guessRouterId()}+12345 AS ${this.bgpLocalAs ?? 65000}`)
        lines.push(`  Group: ${groupName}            Routing-Instance: master`)
        if (nbr.description) lines.push(`  Description: ${nbr.description}`)
        lines.push(`  Type: ${grp.type.charAt(0).toUpperCase() + grp.type.slice(1)} State: Established    Flags: <Sync>`)
        lines.push(`  Last State: OpenConfirm   Last Event: RecvKeepAlive`)
        lines.push(`  Last Error: None`)
        lines.push(`  Options: <Preference HoldTime LogUpDown PeerAS Refresh>`)
        lines.push(`  Holdtime: 90 Preference: 170`)
        lines.push(`  Number of flaps: 0`)
        lines.push(`  Peer ID: ${addr}         Local ID: ${this.guessRouterId()}`)
        lines.push(``)
      }
    }
    if (!lines.length) return ['(no BGP neighbors configured)']
    return lines
  }

  private showFirewall(): string[] {
    if (!this.fwFilters.size) return ['(no firewall filters configured)']
    const lines = ['Filter                                                  Bytes       Packets']
    for (const [name, f] of this.fwFilters) {
      lines.push(`${name.padEnd(56)}0           0`)
      for (const t of f.terms) lines.push(`  ${t.name.padEnd(54)}0           0`)
    }
    return lines
  }

  private showFirewallFilter(name: string): string[] {
    const f = this.fwFilters.get(name)
    if (!f) return [`error: filter ${name} not found`]
    const lines = [`Filter: ${f.name}`, ``]
    for (const t of f.terms) {
      lines.push(`  Term: ${t.name}`)
      if (t.fromSrc)     lines.push(`    from source-address ${t.fromSrc}`)
      if (t.fromDst)     lines.push(`    from destination-address ${t.fromDst}`)
      if (t.fromProto)   lines.push(`    from protocol ${t.fromProto}`)
      if (t.fromDstPort) lines.push(`    from destination-port ${t.fromDstPort}`)
      lines.push(`    then ${t.then}`)
      lines.push(``)
    }
    return lines
  }

  private showPolicy(): string[] {
    if (!this.policyStatements.size) return ['(no policy statements configured)']
    const lines: string[] = []
    for (const [name, ps] of this.policyStatements) {
      lines.push(`Policy ${name}:`)
      for (const t of ps.terms) {
        lines.push(`  Term ${t.name}:`)
        if (t.fromProto)  lines.push(`    from protocol ${t.fromProto}`)
        if (t.fromPrefix) lines.push(`    from route-filter ${t.fromPrefix} exact`)
        lines.push(`    then ${t.then}`)
      }
      lines.push(``)
    }
    return lines
  }

  // ─── Config display ───────────────────────────────────────────────────────

  private fmtConfig(): string[] {
    const lines = ['## Last commit: (never)', '## Hierarchy:', '']
    lines.push('system {')
    lines.push(`    host-name ${this.dev.name};`)
    lines.push('}')

    lines.push('interfaces {')
    for (const [, iface] of this.dev.interfaces) {
      lines.push(`    ${iface.name} {`)
      if (iface.description) lines.push(`        description "${iface.description}";`)
      if (iface.status === 'down') lines.push(`        disable;`)
      lines.push(`        unit 0 {`)
      if (iface.ip) lines.push(`            family inet { address ${iface.ip}/${iface.prefixLen}; }`)
      lines.push(`        }`)
      lines.push(`    }`)
    }
    lines.push('}')

    const statics = this.dev.routingTable.filter(r => r.source === 'static')
    const hasRid = !!this.ospfRouterId
    if (statics.length || hasRid || this.bgpLocalAs) {
      lines.push('routing-options {')
      if (this.ospfRouterId) lines.push(`    router-id ${this.ospfRouterId};`)
      if (this.bgpLocalAs)   lines.push(`    autonomous-system ${this.bgpLocalAs};`)
      if (statics.length) {
        lines.push('    static {')
        for (const r of statics) lines.push(`        route ${r.network}/${r.prefixLen} next-hop ${r.nextHop};`)
        lines.push('    }')
      }
      lines.push('}')
    }

    if (this.ospfAreas.size > 0) {
      lines.push('protocols {')
      lines.push('    ospf {')
      if (this.ospfExport.length) lines.push(`        export [ ${this.ospfExport.join(' ')} ];`)
      for (const [, area] of this.ospfAreas) {
        lines.push(`        area ${area.areaId} {`)
        for (const ifName of area.interfaces) {
          const ifShort = ifName.replace('GigabitEthernet', 'ge-0/0/')
          if (area.passive.has(ifName)) lines.push(`            interface ${ifShort} { passive; }`)
          else lines.push(`            interface ${ifShort};`)
        }
        lines.push(`        }`)
      }
      lines.push('    }')
      lines.push('}')
    }

    if (this.bgpGroups.size > 0) {
      const hasBgpSection = lines.includes('protocols {')
      if (!hasBgpSection) lines.push('protocols {')
      else { lines.pop(); }
      lines.push('    bgp {')
      for (const [, grp] of this.bgpGroups) {
        lines.push(`        group ${grp.name} {`)
        lines.push(`            type ${grp.type};`)
        if (grp.localAddress) lines.push(`            local-address ${grp.localAddress};`)
        if (grp.peerAs) lines.push(`            peer-as ${grp.peerAs};`)
        for (const [addr, nbr] of grp.neighbors) {
          if (nbr.description) lines.push(`            neighbor ${addr} { description "${nbr.description}"; peer-as ${nbr.peerAs}; }`)
          else lines.push(`            neighbor ${addr};`)
        }
        lines.push(`        }`)
      }
      lines.push('    }')
      lines.push('}')
    }

    if (this.fwFilters.size > 0) {
      lines.push('firewall {')
      for (const [, f] of this.fwFilters) {
        lines.push(`    filter ${f.name} {`)
        for (const t of f.terms) {
          lines.push(`        term ${t.name} {`)
          if (t.fromSrc || t.fromDst || t.fromProto || t.fromDstPort) {
            lines.push(`            from {`)
            if (t.fromSrc)     lines.push(`                source-address ${t.fromSrc};`)
            if (t.fromDst)     lines.push(`                destination-address ${t.fromDst};`)
            if (t.fromProto)   lines.push(`                protocol ${t.fromProto};`)
            if (t.fromDstPort) lines.push(`                destination-port ${t.fromDstPort};`)
            lines.push(`            }`)
          }
          lines.push(`            then ${t.then};`)
          lines.push(`        }`)
        }
        lines.push(`    }`)
      }
      lines.push('}')
    }

    if (this.policyStatements.size > 0 || this.prefixLists.size > 0) {
      lines.push('policy-options {')
      for (const [name, pfxList] of this.prefixLists) {
        lines.push(`    prefix-list ${name} {`)
        for (const pfx of pfxList) lines.push(`        ${pfx};`)
        lines.push(`    }`)
      }
      for (const [, ps] of this.policyStatements) {
        lines.push(`    policy-statement ${ps.name} {`)
        for (const t of ps.terms) {
          lines.push(`        term ${t.name} {`)
          if (t.fromProto || t.fromPrefix) {
            lines.push(`            from {`)
            if (t.fromProto)  lines.push(`                protocol ${t.fromProto};`)
            if (t.fromPrefix) lines.push(`                route-filter ${t.fromPrefix} exact;`)
            lines.push(`            }`)
          }
          lines.push(`            then ${t.then};`)
          lines.push(`        }`)
        }
        lines.push(`    }`)
      }
      lines.push('}')
    }

    if (this.natRuleSets.size > 0) {
      lines.push('services {')
      lines.push('    nat {')
      lines.push('        source {')
      for (const [, rs] of this.natRuleSets) {
        lines.push(`            rule-set ${rs.name} {`)
        for (const rule of rs.rules) {
          lines.push(`                rule ${rule.name} {`)
          lines.push(`                    match { source-address ${rule.matchSrc}; }`)
          if (rule.thenInterface) lines.push(`                    then { source-nat interface; }`)
          lines.push(`                }`)
        }
        lines.push(`            }`)
      }
      lines.push('        }')
      lines.push('    }')
      lines.push('}')
    }

    return lines
  }

  private configHelp(): string[] {
    return [
      `  set interfaces <if> unit 0 family inet address <ip>/<prefix>`,
      `  set interfaces <if> description "<text>"`,
      `  set interfaces <if> enable | disable`,
      `  delete interfaces <if> disable`,
      `  set routing-options static route <ip>/<prefix> next-hop <gw>`,
      `  set routing-options router-id <ip>`,
      `  set routing-options autonomous-system <as>`,
      `  set protocols ospf area <area> interface <if> [passive]`,
      `  set protocols ospf export <policy>`,
      `  delete protocols ospf area <area> interface <if>`,
      `  set protocols bgp group <name> type external|internal`,
      `  set protocols bgp group <name> neighbor <ip> peer-as <as>`,
      `  set protocols bgp group <name> peer-as <as>`,
      `  set protocols bgp group <name> local-address <ip>`,
      `  set firewall filter <name> term <name> from source-address <ip>/<pfx>`,
      `  set firewall filter <name> term <name> from destination-address <ip>/<pfx>`,
      `  set firewall filter <name> term <name> from protocol tcp|udp|icmp`,
      `  set firewall filter <name> term <name> from destination-port <port>`,
      `  set firewall filter <name> term <name> then accept|reject|discard`,
      `  set interfaces <if> unit 0 family inet filter input <filter-name>`,
      `  set policy-options policy-statement <name> term <name> from protocol <proto>`,
      `  set policy-options policy-statement <name> term <name> then accept|reject`,
      `  set policy-options prefix-list <name> <ip>/<pfx>`,
      `  set services nat source rule-set <name> rule <name> match source-address <ip>/<pfx>`,
      `  set services nat source rule-set <name> rule <name> then source-nat interface`,
      `  set system host-name <name>`,
      `  show configuration                 Show current config`,
      `  run show <...>                     Operational command`,
      `  commit                             Apply changes`,
      `  commit check                       Validate without applying`,
      `  rollback [0]                       Revert to previous config`,
      `  edit <path>                        Enter edit mode at hierarchy`,
      `  top                                Go to top of hierarchy`,
      `  up                                 Go up one level`,
      `  exit                               Exit config mode`,
    ]
  }

  private fmtIfDetail(): string[] {
    const lines: string[] = []
    for (const f of this.dev.interfaces.values()) {
      const up = f.status === 'up'
      const ifShort = f.name.replace('GigabitEthernet', 'ge-0/0/')
      lines.push(`${ifShort}:`)
      lines.push(`  ${up ? 'Physical link is Up' : 'Physical link is Down'}`)
      lines.push(`  Interface index: ${Math.floor(Math.random() * 900 + 100)}, SNMP ifIndex: ${Math.floor(Math.random() * 900 + 100)}`)
      lines.push(`  Link-level type: Ethernet, MTU: 1514, MRU: 1522, Speed: 1000mbps, Loopback: Disabled`)
      lines.push(`  Current address: ${f.mac}, Hardware address: ${f.mac}`)
      if (f.description) lines.push(`  Description: ${f.description}`)
      lines.push(`  Input rate     : 0 bps (0 pps)`)
      lines.push(`  Output rate    : 0 bps (0 pps)`)
      lines.push(`  Logical interface ${ifShort}.0`)
      lines.push(`    Flags: SNMP-Traps 0x20004000`)
      lines.push(`    Protocol inet, MTU: 1500`)
      if (f.ip) lines.push(`      Destination: ${f.ip}/${f.prefixLen}, Local: ${f.ip}, Broadcast: ${f.ip.replace(/\.\d+$/, '.255')}`)
      else      lines.push(`      (no IP address)`)
      lines.push('')
    }
    return lines
  }

  private guessRouterId(): string {
    for (const [, iface] of this.dev.interfaces) { if (iface.ip && iface.status === 'up') return iface.ip }
    for (const [, iface] of this.dev.interfaces) { if (iface.ip) return iface.ip }
    return '0.0.0.0'
  }

  getCompletions(partial: string): string[] {
    const lo = partial.toLowerCase()
    const ifLong = Array.from(this.dev.interfaces.keys())
    const ifShort = ifLong.map(n => n.replace('GigabitEthernet', 'ge-0/0/'))
    let pool: string[] = []

    if (this.mode === 'operational') pool = [
      'configure', 'configure exclusive',
      'show route', 'show route table inet.0',
      'show route protocol ospf', 'show route protocol bgp', 'show route protocol static',
      'show interfaces terse', 'show interfaces', 'show interfaces detail',
      'show arp', 'show version',
      'show system uptime', 'show system alarms',
      'show chassis hardware',
      'show configuration', 'show log messages',
      'show ospf neighbor', 'show ospf database', 'show ospf interface', 'show ospf route',
      'show bgp summary', 'show bgp neighbor',
      'show firewall', 'show firewall filter', 'show policy',
      'show pfe statistics traffic',
      'clear arp', 'clear route table inet.0',
      'clear ospf neighbor all', 'clear bgp neighbor all',
      'request system reboot', 'request system snapshot',
      'ping ', 'traceroute ', '?',
    ]
    else pool = [
      'commit', 'commit check', 'rollback', 'rollback 0',
      'exit', 'quit', 'top', 'up',
      'show configuration', 'show',
      'set system host-name ', 'set system name-server ', 'set system login user ',
      ...ifShort.map(n => `set interfaces ${n} unit 0 family inet address `),
      ...ifShort.map(n => `set interfaces ${n} enable`),
      ...ifShort.map(n => `set interfaces ${n} disable`),
      ...ifShort.map(n => `delete interfaces ${n} disable`),
      ...ifShort.map(n => `set interfaces ${n} description `),
      'set routing-options static route ', 'delete routing-options static route ',
      'set routing-options router-id ', 'set routing-options autonomous-system ',
      'set protocols ospf area 0.0.0.0 interface ',
      'set protocols ospf area 0.0.0.0 interface lo0.0 passive',
      'set protocols ospf export ',
      'set protocols bgp group EBGP type external',
      'set protocols bgp group IBGP type internal',
      'set protocols bgp group EBGP neighbor ',
      'set protocols bgp group EBGP peer-as ',
      'set firewall filter ', 'delete firewall filter ',
      'set policy-options policy-statement ', 'set policy-options prefix-list ',
      'set services nat source rule-set ',
      'run show route', 'run show interfaces', 'run show arp',
      'run show ospf neighbor', 'run show bgp summary', '?',
    ]
    return pool.filter(c => c.toLowerCase().startsWith(lo))
  }
}
