import type { RouterDevice } from '../../devices/router'
import type { RouterBrandCLI } from './base'
import type { AclEntry } from '../../types'
import { shortIf } from '../shared'
import { prefixLenToMask, isValidIp, isValidMask, maskToPrefixLen, getNetworkAddress } from '../../ip-utils'

export class CiscoRouterCLI implements RouterBrandCLI {
  mode = 'user'
  currentIfs: string[] = []

  // Sub-mode context
  private routerProto = ''   // 'ospf 1' | 'rip' | 'eigrp 100' | 'bgp 65000'
  private dhcpPool   = ''    // pool name when in dhcp-config mode
  private aclName    = ''    // ACL name/number when in acl mode
  private aclType    = ''    // 'standard' | 'extended'
  private aclSeq     = 10    // auto-sequence counter

  constructor(readonly dev: RouterDevice) {}

  getPrompt(): string {
    const n = this.dev.name
    if (this.mode === 'user')           return `\x1b[32m${n}>\x1b[0m `
    if (this.mode === 'enable')         return `\x1b[32m${n}#\x1b[0m `
    if (this.mode === 'config')         return `\x1b[32m${n}(config)#\x1b[0m `
    if (this.mode === 'config-if')      return `\x1b[32m${n}(config-if)#\x1b[0m `
    if (this.mode === 'config-router')  return `\x1b[32m${n}(config-router)#\x1b[0m `
    if (this.mode === 'config-dhcp')    return `\x1b[32m${n}(dhcp-config)#\x1b[0m `
    if (this.mode === 'config-std-nacl') return `\x1b[32m${n}(config-std-nacl)#\x1b[0m `
    if (this.mode === 'config-ext-nacl') return `\x1b[32m${n}(config-ext-nacl)#\x1b[0m `
    return `\x1b[32m${n}(config-if)#\x1b[0m `
  }
  private prompt(): string { return this.getPrompt() }

  getBanner(): string[] {
    if (this.dev.brand === 'Datacom') {
      const portCount = this.dev.interfaces.size
      const model = portCount <= 2 ? 'DM/440-E' : portCount <= 4 ? 'DM/460-E' : portCount <= 6 ? 'DM/890-E' : 'DM/1100-E'
      return [
        '\x1b[90m',
        `Datacom DataOS Software, Version 3.12.3 (DM Enterprise)`,
        `Technical Support: http://www.datacom.ind.br`,
        `Copyright (c) 2004-2024 Datacom Telematica Ltda.`,
        '',
        `        ${this.dev.name} uptime is 0 minutes`,
        `        System image file is "flash:dataos-universalk9-3.12.3.bin"`,
        `        Platform: Datacom ${model}`,
        '\x1b[0m',
        '',
        `\x1b[33mPress RETURN to get started.\x1b[0m`,
        '',
      ]
    }
    return [
      '\x1b[90mCisco IOS Software, Version 15.7(3)M8',
      'Technical Support: http://www.cisco.com/techsupport',
      'Copyright (c) 1986-2020 by Cisco Systems, Inc.',
      '\x1b[0m',
      `        \x1b[33m${this.dev.name}\x1b[0m uptime is 0 minutes`,
      `        System image file is \x1b[90m"flash:c2900-universalk9-mz.SPA.157-3.M8.bin"\x1b[0m`,
      '',
      '\x1b[33mPress RETURN to get started.\x1b[0m',
      '',
    ]
  }

  execute(cmd: string): string[] {
    if (this.dev.brand === 'Datacom') return this.execDatacom(cmd)
    return this.execCisco(cmd)
  }

  // ─── Abbreviation expander ────────────────────────────────────────────────

  private abv(w: string | undefined, target: string, minLen = 1): boolean {
    return !!w && w.length >= minLen && target.toLowerCase().startsWith(w.toLowerCase())
  }

  private tryExpand(raw: string): string {
    const ws = raw.trim().split(/\s+/)
    if (!ws.length) return raw
    const [a = '', b = '', c = '', d = ''] = ws.map(w => w.toLowerCase())
    const tail = (n: number) => ws.slice(n).join(' ')
    const join = (...parts: string[]) => parts.filter(Boolean).join(' ')

    if (this.abv(a, 'show', 2)) {
      if (!b) return raw
      if (this.abv(b, 'ip')) {
        if (!c) return raw
        if (this.abv(c, 'route') && !this.abv(c, 'routing')) return join('show', 'ip', 'route', tail(3))
        if (this.abv(c, 'interface') || c === 'int') {
          if (!d || this.abv(d, 'brief')) return 'show ip interface brief'
          return join('show', 'ip', 'interface', tail(3))
        }
        if (this.abv(c, 'arp'))         return 'show ip arp'
        if (this.abv(c, 'protocols'))   return 'show ip protocols'
        if (this.abv(c, 'ospf'))        return join('show', 'ip', 'ospf', tail(3))
        if (this.abv(c, 'eigrp'))       return join('show', 'ip', 'eigrp', tail(3))
        if (this.abv(c, 'bgp'))         return join('show', 'ip', 'bgp', tail(3))
        if (this.abv(c, 'nat'))         return join('show', 'ip', 'nat', tail(3))
        if (this.abv(c, 'dhcp'))        return join('show', 'ip', 'dhcp', tail(3))
        return join('show', 'ip', tail(2))
      }
      if (this.abv(b, 'interfaces'))                return join('show', 'interfaces', tail(2))
      if (this.abv(b, 'running-config') || b === 'run') return 'show running-config'
      if (this.abv(b, 'startup-config') || b === 'star') return 'show startup-config'
      if (this.abv(b, 'version', 3))               return 'show version'
      if (this.abv(b, 'arp'))                       return 'show arp'
      if (this.abv(b, 'clock'))                     return 'show clock'
      if (this.abv(b, 'cdp'))                       return join('show', 'cdp', tail(2))
      if (this.abv(b, 'spanning-tree', 4))          return join('show', 'spanning-tree', tail(2))
      if (this.abv(b, 'processes', 4))              return join('show', 'processes', tail(2))
      if (this.abv(b, 'memory', 3))                 return 'show memory'
      if (this.abv(b, 'flash'))                     return 'show flash'
      if (this.abv(b, 'users', 3))                  return 'show users'
      if (this.abv(b, 'logging', 3))                return 'show logging'
      if (this.abv(b, 'access-lists', 3))           return join('show', 'access-lists', tail(2))
      return join('show', tail(1))
    }
    if ((this.abv(a, 'configure', 3) || a === 'conf') && a !== 'cop') {
      if (!b || this.abv(b, 'terminal')) return 'configure terminal'
      return join('configure', tail(1))
    }
    if (this.abv(a, 'write', 2) || a === 'wr') {
      if (!b || this.abv(b, 'memory'))  return 'write memory'
      if (this.abv(b, 'erase'))         return 'write erase'
      if (this.abv(b, 'terminal'))      return 'write terminal'
      return join('write', tail(1))
    }
    if (this.abv(a, 'copy', 3)) return raw
    if (a === 'no' && b) return 'no ' + this.tryExpand(tail(1))
    if (a === 'do' && b) return 'do ' + this.tryExpand(tail(1))
    if ((this.abv(a, 'interface', 3) || a === 'int') && b) return join('interface', tail(1))
    if (this.abv(a, 'ping', 2) && b)      return join('ping', tail(1))
    if (this.abv(a, 'traceroute', 3) && b) return join('traceroute', tail(1))
    if (this.abv(a, 'clear', 3)) return raw
    if (this.abv(a, 'debug', 2))   return raw
    if (this.abv(a, 'undebug', 3)) return raw
    if (this.abv(a, 'enable', 2))      return join('enable', tail(1))
    if (this.abv(a, 'disable', 3))     return 'disable'
    if (this.abv(a, 'reload', 3))      return 'reload'
    if (this.abv(a, 'hostname', 3) && b) return join('hostname', tail(1))
    if (this.abv(a, 'ip') && a === 'ip' && b) {
      if (this.abv(b, 'route'))             return join('ip', 'route', tail(2))
      if (this.abv(b, 'address'))           return join('ip', 'address', tail(2))
      if (this.abv(b, 'default-gateway'))   return join('ip', 'default-gateway', tail(2))
      if (this.abv(b, 'domain-lookup'))     return 'ip domain-lookup'
      if (this.abv(b, 'access-group'))      return join('ip', 'access-group', tail(2))
      if (this.abv(b, 'ospf'))              return join('ip', 'ospf', tail(2))
      if (this.abv(b, 'nat'))               return join('ip', 'nat', tail(2))
      if (this.abv(b, 'dhcp'))              return join('ip', 'dhcp', tail(2))
      if (this.abv(b, 'access-list'))       return join('ip', 'access-list', tail(2))
      return raw
    }
    if (this.abv(a, 'shutdown', 3))         return 'shutdown'
    if (this.abv(a, 'description', 3) && b) return join('description', tail(1))
    if (this.abv(a, 'exit', 2))             return 'exit'
    if (this.abv(a, 'end', 2))              return 'end'
    if (this.abv(a, 'speed', 2) && b)       return join('speed', tail(1))
    if (this.abv(a, 'duplex', 3) && b)      return join('duplex', tail(1))
    if (this.abv(a, 'bandwidth', 3) && b)   return join('bandwidth', tail(1))
    if (this.abv(a, 'access-list', 3))      return raw
    if (this.abv(a, 'router', 3) && b)      return join('router', tail(1))
    if (this.abv(a, 'network', 3) && b)     return join('network', tail(1))
    if (this.abv(a, 'neighbor', 3) && b)    return join('neighbor', tail(1))
    if (this.abv(a, 'line', 2) && b)        return join('line', tail(1))
    if (this.abv(a, 'clock', 3))            return join('clock', tail(1))
    if (this.abv(a, 'service', 3))          return join('service', tail(1))
    return raw
  }

  // ─── Context-sensitive help ───────────────────────────────────────────────

  private help(prefix: string): string[] {
    const p = prefix.trim().toLowerCase()
    type Entry = [string, string]
    const fmt = (entries: Entry[]) => entries.map(([cmd, desc]) => `  ${cmd.padEnd(30)}${desc}`)

    if (!p) {
      const base: Entry[] = this.mode === 'user' ? [
        ['enable', 'Turn on privileged commands'],
        ['exit', 'Exit the CLI'],
        ['ping', 'Send echo messages'],
        ['show', 'Show running system information'],
        ['traceroute', 'Trace route to destination'],
      ] : this.mode === 'enable' ? [
        ['clear', 'Reset functions'],
        ['clock', 'Manage the system clock'],
        ['configure', 'Enter configuration mode'],
        ['copy', 'Copy from one file to another'],
        ['debug', 'Debugging functions'],
        ['disable', 'Turn off privileged commands'],
        ['exit', 'Exit the CLI'],
        ['no', 'Negate a command'],
        ['ping', 'Send echo messages'],
        ['reload', 'Halt and perform a cold restart'],
        ['show', 'Show running system information'],
        ['traceroute', 'Trace route to destination'],
        ['undebug', 'Disable debugging functions'],
        ['write', 'Write running configuration to memory'],
      ] : this.mode === 'config' ? [
        ['access-list', 'Add an access list entry'],
        ['banner', 'Define a login banner'],
        ['do', 'Run exec commands from config mode'],
        ['enable', 'Modify enable password parameters'],
        ['end', 'Exit to enable mode'],
        ['exit', 'Exit from configure mode'],
        ['hostname', 'Set system\'s network name'],
        ['interface', 'Select an interface to configure'],
        ['ip', 'Global IP configuration subcommands'],
        ['line', 'Configure a terminal line'],
        ['no', 'Negate a command or set its defaults'],
        ['router', 'Enable a routing process'],
        ['service', 'Set up miscellaneous service parameters'],
      ] : this.mode === 'config-router' ? [
        ['area', 'OSPF area parameters'],
        ['auto-cost', 'Calculate OSPF interface cost'],
        ['bgp', 'BGP specific commands'],
        ['default-information', 'Control distribution of default info'],
        ['end', 'Exit to enable mode'],
        ['exit', 'Exit to config mode'],
        ['neighbor', 'Specify BGP/EIGRP neighbor'],
        ['network', 'Enable routing on an IP network'],
        ['no', 'Negate a command'],
        ['passive-interface', 'Suppress updates on an interface'],
        ['redistribute', 'Redistribute information from another route'],
        ['router-id', 'Set OSPF Router-ID'],
        ['version', 'Set routing protocol version'],
      ] : this.mode === 'config-dhcp' ? [
        ['default-router', 'Default routers'],
        ['dns-server', 'DNS servers'],
        ['end', 'Exit to enable mode'],
        ['exit', 'Exit to config mode'],
        ['lease', 'Address lease time'],
        ['network', 'Network number and mask'],
      ] : [
        ['bandwidth', 'Set bandwidth informational parameter'],
        ['description', 'Interface specific description'],
        ['do', 'Run exec commands from interface mode'],
        ['duplex', 'Configure duplex operation'],
        ['end', 'Exit to enable mode'],
        ['exit', 'Exit from interface configuration'],
        ['ip', 'Interface Internet Protocol config commands'],
        ['no', 'Negate a command or set its defaults'],
        ['shutdown', 'Shutdown the selected interface'],
        ['speed', 'Configure speed operation'],
      ]
      return fmt(base)
    }

    if (p === 'show' || p.startsWith('show ')) {
      const rest = p.startsWith('show ') ? p.slice(5).trim() : ''
      if (!rest || rest === 'ip') {
        const showEntries: Entry[] = !rest ? [
          ['arp', 'ARP table'],
          ['cdp', 'CDP information'],
          ['clock', 'Display the system clock'],
          ['flash', 'Flash memory information'],
          ['interfaces', 'Interface status and configuration'],
          ['ip', 'IP information'],
          ['logging', 'Show the contents of logging buffers'],
          ['memory', 'Memory statistics'],
          ['processes', 'Active process statistics'],
          ['running-config', 'Current operating configuration'],
          ['spanning-tree', 'Spanning tree topology'],
          ['startup-config', 'Contents of startup configuration'],
          ['users', 'Display information about terminal lines'],
          ['version', 'System hardware and software status'],
        ] : [
          ['arp', 'IP ARP table'],
          ['bgp', 'BGP information'],
          ['dhcp', 'DHCP information'],
          ['eigrp', 'IP-EIGRP show commands'],
          ['interface', 'IP interface status and configuration'],
          ['nat', 'IP NAT information'],
          ['ospf', 'OSPF information'],
          ['protocols', 'IP routing protocol process statistics'],
          ['route', 'IP routing table'],
          ['rip', 'RIP routing information'],
        ]
        return fmt(showEntries)
      }
    }
    if (p === 'configure' || p === 'conf') return fmt([['terminal', 'Configure from the terminal']])
    if (p === 'write' || p === 'wr') {
      return fmt([
        ['erase', 'Erase the startup configuration'],
        ['memory', 'Write to NV memory'],
        ['terminal', 'Write to terminal'],
      ])
    }
    if (p === 'router' || p.startsWith('router ')) {
      return fmt([
        ['bgp', 'Border Gateway Protocol (BGP)'],
        ['eigrp', 'Enhanced Interior Gateway Routing Protocol (EIGRP)'],
        ['ospf', 'Open Shortest Path First (OSPF)'],
        ['rip', 'Routing Information Protocol (RIP)'],
      ])
    }
    if (p === 'ip' || p.startsWith('ip ')) {
      const rest2 = p.startsWith('ip ') ? p.slice(3).trim() : ''
      if (!rest2) {
        const ipEntries: Entry[] = this.mode === 'config' ? [
          ['access-list', 'Named access-list configuration'],
          ['default-gateway', 'Specify default gateway'],
          ['dhcp', 'DHCP configuration'],
          ['domain-name', 'Define IP domain name'],
          ['nat', 'NAT configuration'],
          ['route', 'Establish static routes'],
        ] : [
          ['access-group', 'Specify access control for packets'],
          ['address', 'Set the IP address of an interface'],
          ['mtu', 'Set IP Maximum Transmission Unit'],
          ['nat', 'NAT interface config'],
          ['ospf', 'OSPF interface commands'],
        ]
        return fmt(ipEntries)
      }
    }
    if (p === 'interface' || p === 'int' || p.startsWith('interface ') || p.startsWith('int ')) {
      const ifNames = Array.from(this.dev.interfaces.keys())
      return fmt(ifNames.map(n => [n, 'Interface ' + n] as Entry))
    }
    if (p === 'ping' || p.startsWith('ping ')) return fmt([['<ip>', 'IP address to ping']])
    if (p === 'traceroute' || p.startsWith('traceroute ')) return fmt([['<ip>', 'IP address']])
    return fmt([['<cr>', 'Execute this command']])
  }

  // ─── Main Cisco IOS handler ───────────────────────────────────────────────

  private execCisco(cmd: string): string[] {
    if (cmd.endsWith('?')) {
      const prefix = cmd.slice(0, -1).trimEnd()
      return [...this.help(prefix), this.prompt()]
    }
    cmd = this.tryExpand(cmd)

    if (this.mode === 'user') {
      if (cmd === 'enable') { this.mode = 'enable'; return [this.prompt()] }
      if (cmd === 'exit' || cmd === 'logout') return ['Connection closed.']
      if (cmd.startsWith('ping '))       return ['__ASYNC_PING__' + cmd.slice(5).trim()]
      if (cmd.startsWith('traceroute ')) return ['__ASYNC_TRACE__' + cmd.slice(11).trim()]
      if (cmd.startsWith('show '))       return [...this.showCisco(cmd.slice(5).trim()), this.prompt()]
      if (cmd === 'help') return [...this.help(''), this.prompt()]
      return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
    }

    if (this.mode === 'enable') {
      if (cmd === 'configure terminal') { this.mode = 'config'; return [this.prompt()] }
      if (cmd === 'disable' || cmd === 'exit') { this.mode = 'user'; return [this.prompt()] }
      if (cmd.startsWith('show ')) return [...this.showCisco(cmd.slice(5).trim()), this.prompt()]
      if (cmd.startsWith('ping '))       return ['__ASYNC_PING__' + cmd.slice(5).trim()]
      if (cmd.startsWith('traceroute ')) return ['__ASYNC_TRACE__' + cmd.slice(11).trim()]
      if (cmd === 'write memory' || cmd === 'write' || cmd === 'copy running-config startup-config') {
        return ['\x1b[32mBuilding configuration...\x1b[0m', '\x1b[32m[OK]\x1b[0m', this.prompt()]
      }
      if (cmd === 'write erase' || cmd === 'erase startup-config') {
        this.dev.routingTable = this.dev.routingTable.filter(r => r.source === 'connected')
        return ['\x1b[33mErasing the nvram filesystem will remove all configuration files! Continue? [confirm]\x1b[0m', '\x1b[32m[OK]\x1b[0m', this.prompt()]
      }
      if (cmd === 'copy startup-config running-config') {
        return ['\x1b[33mDestination filename [running-config]? \x1b[0m', this.prompt()]
      }
      if (cmd === 'reload') return ['\x1b[33mProceed with reload? [confirm]\x1b[0m', '\x1b[33mReload requested. (Simulation: state preserved)\x1b[0m', this.prompt()]
      if (cmd === 'clear ip arp') { this.dev.arpTable.clear(); return [this.prompt()] }
      if (cmd === 'clear ip route *') {
        this.dev.routingTable = this.dev.routingTable.filter(r => r.source === 'connected')
        return [this.prompt()]
      }
      if (cmd === 'undebug all' || cmd === 'no debug all') {
        return ['All possible debugging has been turned off', this.prompt()]
      }
      if (cmd.match(/^debug ip (icmp|packet|routing|ospf|eigrp|bgp|rip)$/)) {
        const what = cmd.split(' ')[2]
        return [`\x1b[33mIP ${what} debugging is on\x1b[0m`, this.prompt()]
      }
      if (cmd.startsWith('clock set ')) return [`\x1b[32mClock set.\x1b[0m`, this.prompt()]
      if (cmd === 'help') return [...this.help(''), this.prompt()]
      return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
    }

    if (this.mode === 'config') {
      return this.execConfig(cmd)
    }

    if (this.mode === 'config-if') {
      return this.execConfigIf(cmd)
    }

    if (this.mode === 'config-router') {
      return this.execConfigRouter(cmd)
    }

    if (this.mode === 'config-dhcp') {
      return this.execConfigDhcp(cmd)
    }

    if (this.mode === 'config-std-nacl' || this.mode === 'config-ext-nacl') {
      return this.execConfigAcl(cmd)
    }

    return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
  }

  // ─── config mode ─────────────────────────────────────────────────────────

  private execConfig(cmd: string): string[] {
    if (cmd.startsWith('do ')) {
      const sub = cmd.slice(3).trim()
      if (sub.startsWith('show ')) return [...this.showCisco(sub.slice(5).trim()), this.prompt()]
      return [...this.execCisco(sub)]
    }
    if (cmd === 'end')  { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'enable'; return [this.prompt()] }

    // Interface selection
    if (cmd.startsWith('interface ') || cmd.startsWith('int ')) {
      const raw = cmd.replace(/^interface |^int /, '').trim()
      const names = this.dev.parseIfNames(raw)
      const valid = names.filter(n => this.dev.interfaces.has(n))
      if (!valid.length) return [`% Interface ${raw} not found. Available: ${this.dev.ifList()}`, this.prompt()]
      this.currentIfs = valid; this.mode = 'config-if'; return [this.prompt()]
    }

    // Static routes
    if (cmd.startsWith('ip route '))    return [...this.dev.addStaticRoute(cmd.slice(9).trim(), 'cisco'), this.prompt()]
    if (cmd.startsWith('no ip route ')) return [...this.dev.removeStaticRoute(cmd.slice(12).trim(), 'cisco'), this.prompt()]

    // Hostname / domain
    if (cmd.startsWith('hostname '))    { this.dev.name = cmd.slice(9).trim(); return [this.prompt()] }
    if (cmd.startsWith('ip domain-name ')) { this.dev.domainName = cmd.slice(16).trim(); return [this.prompt()] }
    if (cmd === 'no ip domain-lookup' || cmd === 'no ip domain lookup') {
      return ['\x1b[33mDNS lookup disabled.\x1b[0m', this.prompt()]
    }
    if (cmd === 'ip domain-lookup' || cmd === 'ip domain lookup') return [this.prompt()]
    if (cmd.startsWith('ip default-gateway ')) return [this.prompt()]
    if (cmd.startsWith('ip name-server ')) return [this.prompt()]

    // Router protocols
    if (cmd.startsWith('router ospf ')) {
      const pid = parseInt(cmd.slice(12).trim())
      if (isNaN(pid) || pid < 1 || pid > 65535) return [`% Invalid process ID`, this.prompt()]
      if (!this.dev.ospfProcesses.has(pid)) {
        this.dev.ospfProcesses.set(pid, {
          processId: pid, areas: new Map(), networks: [],
          redistributeConnected: false, redistributeStatic: false, defaultInformation: false,
        })
      }
      this.routerProto = `ospf ${pid}`; this.mode = 'config-router'; return [this.prompt()]
    }
    if (cmd === 'router rip') {
      if (!this.dev.ripConfig) {
        this.dev.ripConfig = { version: 2, networks: [], passive: new Set(), noAutoSummary: false, redistributeStatic: false, redistributeConnected: false }
      }
      this.routerProto = 'rip'; this.mode = 'config-router'; return [this.prompt()]
    }
    if (cmd.startsWith('router eigrp ')) {
      const as = parseInt(cmd.slice(13).trim())
      if (isNaN(as)) return [`% Invalid AS number`, this.prompt()]
      if (!this.dev.eigrpProcesses.has(as)) {
        this.dev.eigrpProcesses.set(as, { asNumber: as, networks: [], passive: new Set(), noAutoSummary: false })
      }
      this.routerProto = `eigrp ${as}`; this.mode = 'config-router'; return [this.prompt()]
    }
    if (cmd.startsWith('router bgp ')) {
      const as = parseInt(cmd.slice(11).trim())
      if (isNaN(as)) return [`% Invalid AS number`, this.prompt()]
      if (!this.dev.bgpConfig) {
        this.dev.bgpConfig = { localAs: as, neighbors: new Map(), networks: [] }
      }
      this.routerProto = `bgp ${as}`; this.mode = 'config-router'; return [this.prompt()]
    }
    if (cmd.startsWith('no router ospf ')) {
      const pid = parseInt(cmd.slice(15).trim())
      this.dev.ospfProcesses.delete(pid); return [this.prompt()]
    }
    if (cmd === 'no router rip') { this.dev.ripConfig = null; return [this.prompt()] }
    if (cmd.startsWith('no router eigrp ')) {
      const as = parseInt(cmd.slice(16).trim())
      this.dev.eigrpProcesses.delete(as); return [this.prompt()]
    }
    if (cmd.startsWith('no router bgp ')) { this.dev.bgpConfig = null; return [this.prompt()] }

    // Numbered ACLs
    const aclNum = cmd.match(/^access-list (\d+) (permit|deny) (.+)$/)
    if (aclNum) {
      return [...this.addNumberedAcl(aclNum[1], aclNum[2] as 'permit'|'deny', aclNum[3]), this.prompt()]
    }
    const noAclNum = cmd.match(/^no access-list (\d+)$/)
    if (noAclNum) { this.dev.accessLists.delete(noAclNum[1]); return [this.prompt()] }

    // Named ACLs
    const namedAcl = cmd.match(/^ip access-list (standard|extended) (\S+)$/)
    if (namedAcl) {
      this.aclName = namedAcl[2]; this.aclType = namedAcl[1]
      if (!this.dev.accessLists.has(this.aclName)) this.dev.accessLists.set(this.aclName, [])
      this.aclSeq = (this.dev.accessLists.get(this.aclName)!.length) * 10 + 10
      this.mode = this.aclType === 'standard' ? 'config-std-nacl' : 'config-ext-nacl'
      return [this.prompt()]
    }
    const noNamedAcl = cmd.match(/^no ip access-list (standard|extended) (\S+)$/)
    if (noNamedAcl) { this.dev.accessLists.delete(noNamedAcl[2]); return [this.prompt()] }

    // NAT global commands
    const natInsideSrc = cmd.match(/^ip nat inside source list (\S+) interface (\S+) overload$/)
    if (natInsideSrc) {
      this.dev.natConfig.aclRef = natInsideSrc[1]
      this.dev.natConfig.overload = true
      const ifName = this.dev.resolveIfName(natInsideSrc[2])
      this.dev.natConfig.outsideInterfaces.add(ifName)
      return [this.prompt()]
    }
    const natInsidePool = cmd.match(/^ip nat inside source list (\S+) pool (\S+)$/)
    if (natInsidePool) {
      this.dev.natConfig.aclRef = natInsidePool[1]
      this.dev.natConfig.overload = false
      return [this.prompt()]
    }
    const natInsideOverload2 = cmd.match(/^ip nat inside source list (\S+) pool (\S+) overload$/)
    if (natInsideOverload2) {
      this.dev.natConfig.aclRef = natInsideOverload2[1]
      this.dev.natConfig.overload = true
      return [this.prompt()]
    }
    const natStatic = cmd.match(/^ip nat inside source static (\S+) (\S+)$/)
    if (natStatic) {
      this.dev.natConfig.staticMappings.set(natStatic[1], natStatic[2])
      return [this.prompt()]
    }
    const noNatStatic = cmd.match(/^no ip nat inside source static (\S+) (\S+)$/)
    if (noNatStatic) {
      this.dev.natConfig.staticMappings.delete(noNatStatic[1])
      return [this.prompt()]
    }
    const natPool = cmd.match(/^ip nat pool (\S+) (\S+) (\S+) prefix-length (\d+)$/)
    if (natPool) {
      this.dev.natConfig.pools.set(natPool[1], { start: natPool[2], end: natPool[3], prefix: parseInt(natPool[4]) })
      return [this.prompt()]
    }
    const natPoolNetmask = cmd.match(/^ip nat pool (\S+) (\S+) (\S+) netmask (\S+)$/)
    if (natPoolNetmask) {
      const prefix = isValidMask(natPoolNetmask[4]) ? maskToPrefixLen(natPoolNetmask[4]) : 24
      this.dev.natConfig.pools.set(natPoolNetmask[1], { start: natPoolNetmask[2], end: natPoolNetmask[3], prefix })
      return [this.prompt()]
    }
    const noNatPool = cmd.match(/^no ip nat pool (\S+)/)
    if (noNatPool) { this.dev.natConfig.pools.delete(noNatPool[1]); return [this.prompt()] }

    // DHCP
    const dhcpExclude = cmd.match(/^ip dhcp excluded-address (\S+)(?:\s+(\S+))?$/)
    if (dhcpExclude) {
      this.dev.dhcpExcluded.push(dhcpExclude[2] ? `${dhcpExclude[1]} ${dhcpExclude[2]}` : dhcpExclude[1])
      return [this.prompt()]
    }
    const noDhcpExclude = cmd.match(/^no ip dhcp excluded-address (\S+)/)
    if (noDhcpExclude) {
      this.dev.dhcpExcluded = this.dev.dhcpExcluded.filter(e => !e.startsWith(noDhcpExclude[1]))
      return [this.prompt()]
    }
    const dhcpPool = cmd.match(/^ip dhcp pool (\S+)$/)
    if (dhcpPool) {
      const name = dhcpPool[1]
      if (!this.dev.dhcpPools.has(name)) {
        this.dev.dhcpPools.set(name, { name, network: '', prefix: 24, excludedAddresses: [] })
      }
      this.dhcpPool = name; this.mode = 'config-dhcp'; return [this.prompt()]
    }
    const noDhcpPool = cmd.match(/^no ip dhcp pool (\S+)$/)
    if (noDhcpPool) { this.dev.dhcpPools.delete(noDhcpPool[1]); return [this.prompt()] }

    // Misc config-mode commands that we acknowledge
    if (cmd.startsWith('enable secret ') || cmd.startsWith('enable password ')) return [this.prompt()]
    if (cmd.startsWith('no enable secret') || cmd.startsWith('no enable password')) return [this.prompt()]
    if (cmd.startsWith('banner motd ')) return [this.prompt()]
    if (cmd === 'service password-encryption' || cmd === 'no service password-encryption') return [this.prompt()]
    if (cmd.startsWith('line ')) {
      return [`\x1b[90mLine config mode not simulated. Use 'end' to exit.\x1b[0m`, this.prompt()]
    }
    if (cmd.startsWith('clock timezone ')) return [this.prompt()]
    if (cmd.startsWith('logging ')) return [this.prompt()]
    if (cmd.startsWith('ntp ')) return [this.prompt()]
    if (cmd === 'help') return [...this.help(''), this.prompt()]
    return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
  }

  // ─── config-if mode ───────────────────────────────────────────────────────

  private execConfigIf(cmd: string): string[] {
    if (cmd.startsWith('do ')) {
      const sub = cmd.slice(3).trim()
      if (sub.startsWith('show ')) return [...this.showCisco(sub.slice(5).trim()), this.prompt()]
      return [...this.execCisco(sub)]
    }
    if (cmd === 'end')  { this.mode = 'enable'; this.currentIfs = []; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'config'; this.currentIfs = []; return [this.prompt()] }

    if (cmd.startsWith('ip address ')) {
      return [...this.dev.setIfAddr(cmd.slice(11).trim(), 'cisco', this.currentIfs), this.prompt()]
    }
    if (cmd === 'no ip address') {
      for (const cIf of this.currentIfs) {
        const iface = this.dev.interfaces.get(cIf)!
        iface.ip = undefined; iface.prefixLen = undefined
      }
      this.dev.updateConnectedRoutes(); return [this.prompt()]
    }
    if (cmd === 'no shutdown' || cmd === 'no shut') {
      const msgs = this.dev.setIfUp(this.currentIfs)
      return [...msgs, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${this.currentIfs[0]}, changed state to up`, this.prompt()]
    }
    if (cmd === 'shutdown') {
      const msgs = this.dev.setIfDown(this.currentIfs)
      return [...msgs, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${this.currentIfs[0]}, changed state to down`, this.prompt()]
    }
    if (cmd.startsWith('description ')) {
      for (const cIf of this.currentIfs) this.dev.interfaces.get(cIf)!.description = cmd.slice(12).trim()
      return [this.prompt()]
    }
    if (cmd === 'no description') {
      for (const cIf of this.currentIfs) this.dev.interfaces.get(cIf)!.description = undefined
      return [this.prompt()]
    }

    // NAT inside/outside on interface
    if (cmd === 'ip nat inside') {
      for (const cIf of this.currentIfs) {
        this.dev.natConfig.insideInterfaces.add(cIf)
        this.dev.natConfig.outsideInterfaces.delete(cIf)
      }
      return [this.prompt()]
    }
    if (cmd === 'ip nat outside') {
      for (const cIf of this.currentIfs) {
        this.dev.natConfig.outsideInterfaces.add(cIf)
        this.dev.natConfig.insideInterfaces.delete(cIf)
      }
      return [this.prompt()]
    }
    if (cmd === 'no ip nat inside') {
      for (const cIf of this.currentIfs) this.dev.natConfig.insideInterfaces.delete(cIf)
      return [this.prompt()]
    }
    if (cmd === 'no ip nat outside') {
      for (const cIf of this.currentIfs) this.dev.natConfig.outsideInterfaces.delete(cIf)
      return [this.prompt()]
    }

    // OSPF per-interface
    const ospfIf = cmd.match(/^ip ospf (\d+) area (\d+)$/)
    if (ospfIf) {
      const pid = parseInt(ospfIf[1]), areaId = parseInt(ospfIf[2])
      for (const cIf of this.currentIfs) {
        const iface = this.dev.interfaces.get(cIf)
        if (!iface?.ip) continue
        if (!this.dev.ospfProcesses.has(pid)) {
          this.dev.ospfProcesses.set(pid, {
            processId: pid, areas: new Map(), networks: [],
            redistributeConnected: false, redistributeStatic: false, defaultInformation: false,
          })
        }
        const proc = this.dev.ospfProcesses.get(pid)!
        if (!proc.areas.has(areaId)) proc.areas.set(areaId, { areaId, interfaces: [], stubArea: false })
        const area = proc.areas.get(areaId)!
        if (!area.interfaces.includes(cIf)) area.interfaces.push(cIf)
        // Add a network statement automatically
        const net = getNetworkAddress(iface.ip, iface.prefixLen ?? 24)
        const wc = this.prefixToWildcard(iface.prefixLen ?? 24)
        if (!proc.networks.some(n => n.ip === net && n.area === areaId))
          proc.networks.push({ ip: net, wildcard: wc, area: areaId })
      }
      return [this.prompt()]
    }
    if (cmd.startsWith('no ip ospf ')) return [this.prompt()]

    // ACL on interface
    if (cmd.startsWith('ip access-group ')) return [this.prompt()]
    if (cmd.startsWith('no ip access-group ')) return [this.prompt()]

    // Sub-interface encapsulation
    if (cmd.startsWith('encapsulation dot1q ')) return [this.prompt()]

    if (cmd.match(/^speed (10|100|1000|auto)$/)) return [this.prompt()]
    if (cmd.match(/^duplex (full|half|auto)$/))  return [this.prompt()]
    if (cmd.match(/^bandwidth \d+$/))     return [this.prompt()]
    if (cmd.match(/^ip mtu \d+$/))        return [this.prompt()]
    if (cmd === 'help') return [...this.help(''), this.prompt()]
    return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
  }

  // ─── config-router mode ───────────────────────────────────────────────────

  private execConfigRouter(cmd: string): string[] {
    if (cmd.startsWith('do ')) {
      const sub = cmd.slice(3).trim()
      if (sub.startsWith('show ')) return [...this.showCisco(sub.slice(5).trim()), this.prompt()]
      return [...this.execCisco(sub)]
    }
    if (cmd === 'end')  { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'config'; return [this.prompt()] }

    // OSPF commands
    if (this.routerProto.startsWith('ospf')) {
      const pid = parseInt(this.routerProto.split(' ')[1])
      const proc = this.dev.ospfProcesses.get(pid)
      if (!proc) return [this.prompt()]

      const netM = cmd.match(/^network (\S+) (\S+) area (\S+)$/)
      if (netM) {
        const areaId = parseInt(netM[3])
        proc.networks.push({ ip: netM[1], wildcard: netM[2], area: areaId })
        if (!proc.areas.has(areaId)) proc.areas.set(areaId, { areaId, interfaces: [], stubArea: false })
        return [this.prompt()]
      }
      const noNetM = cmd.match(/^no network (\S+) (\S+) area (\S+)$/)
      if (noNetM) {
        const areaId = parseInt(noNetM[3])
        proc.networks = proc.networks.filter(n => !(n.ip === noNetM[1] && n.wildcard === noNetM[2] && n.area === areaId))
        return [this.prompt()]
      }
      if (cmd.startsWith('router-id ')) { proc.routerId = cmd.slice(10).trim(); return [this.prompt()] }
      if (cmd === 'no router-id') { proc.routerId = undefined; return [this.prompt()] }
      const areaStub = cmd.match(/^area (\d+) stub$/)
      if (areaStub) {
        const areaId = parseInt(areaStub[1])
        if (!proc.areas.has(areaId)) proc.areas.set(areaId, { areaId, interfaces: [], stubArea: false })
        proc.areas.get(areaId)!.stubArea = true
        return [this.prompt()]
      }
      const noAreaStub = cmd.match(/^no area (\d+) stub$/)
      if (noAreaStub) {
        const area = proc.areas.get(parseInt(noAreaStub[1]))
        if (area) area.stubArea = false
        return [this.prompt()]
      }
      if (cmd.startsWith('passive-interface ')) { return [this.prompt()] }
      if (cmd === 'redistribute connected subnets') { proc.redistributeConnected = true; return [this.prompt()] }
      if (cmd === 'redistribute static subnets')    { proc.redistributeStatic = true; return [this.prompt()] }
      if (cmd === 'no redistribute connected subnets') { proc.redistributeConnected = false; return [this.prompt()] }
      if (cmd === 'no redistribute static subnets')    { proc.redistributeStatic = false; return [this.prompt()] }
      if (cmd === 'default-information originate' || cmd === 'default-information originate always') {
        proc.defaultInformation = true; return [this.prompt()]
      }
      if (cmd === 'no default-information originate') { proc.defaultInformation = false; return [this.prompt()] }
      const refBw = cmd.match(/^auto-cost reference-bandwidth (\d+)$/)
      if (refBw) { proc.referenceBandwidth = parseInt(refBw[1]); return [this.prompt()] }
    }

    // RIP commands
    if (this.routerProto === 'rip') {
      const rip = this.dev.ripConfig
      if (!rip) return [this.prompt()]
      if (cmd === 'version 2') { rip.version = 2; return [this.prompt()] }
      if (cmd.startsWith('network ')) { rip.networks.push(cmd.slice(8).trim()); return [this.prompt()] }
      const noNet = cmd.match(/^no network (\S+)$/)
      if (noNet) { rip.networks = rip.networks.filter(n => n !== noNet[1]); return [this.prompt()] }
      if (cmd === 'no auto-summary') { rip.noAutoSummary = true; return [this.prompt()] }
      if (cmd === 'auto-summary')    { rip.noAutoSummary = false; return [this.prompt()] }
      if (cmd.startsWith('passive-interface ')) { rip.passive.add(cmd.slice(18).trim()); return [this.prompt()] }
      if (cmd.startsWith('no passive-interface ')) { rip.passive.delete(cmd.slice(21).trim()); return [this.prompt()] }
      if (cmd === 'redistribute static')    { rip.redistributeStatic = true; return [this.prompt()] }
      if (cmd === 'redistribute connected') { rip.redistributeConnected = true; return [this.prompt()] }
    }

    // EIGRP commands
    if (this.routerProto.startsWith('eigrp')) {
      const as = parseInt(this.routerProto.split(' ')[1])
      const proc = this.dev.eigrpProcesses.get(as)
      if (!proc) return [this.prompt()]
      const netWc = cmd.match(/^network (\S+) (\S+)$/)
      if (netWc) { proc.networks.push({ ip: netWc[1], wildcard: netWc[2] }); return [this.prompt()] }
      const netOnly = cmd.match(/^network (\S+)$/)
      if (netOnly) { proc.networks.push({ ip: netOnly[1] }); return [this.prompt()] }
      if (cmd === 'no auto-summary') { proc.noAutoSummary = true; return [this.prompt()] }
      if (cmd === 'auto-summary')    { proc.noAutoSummary = false; return [this.prompt()] }
      if (cmd.startsWith('passive-interface ')) { proc.passive.add(cmd.slice(18).trim()); return [this.prompt()] }
      if (cmd.startsWith('no passive-interface ')) { proc.passive.delete(cmd.slice(21).trim()); return [this.prompt()] }
      if (cmd.startsWith('redistribute static metric')) return [this.prompt()]
    }

    // BGP commands
    if (this.routerProto.startsWith('bgp')) {
      const bgp = this.dev.bgpConfig
      if (!bgp) return [this.prompt()]
      if (cmd.startsWith('bgp router-id ')) { bgp.routerId = cmd.slice(14).trim(); return [this.prompt()] }
      const nbrRemote = cmd.match(/^neighbor (\S+) remote-as (\d+)$/)
      if (nbrRemote) {
        const addr = nbrRemote[1], remoteAs = parseInt(nbrRemote[2])
        if (!bgp.neighbors.has(addr)) bgp.neighbors.set(addr, { remoteAs })
        else bgp.neighbors.get(addr)!.remoteAs = remoteAs
        return [this.prompt()]
      }
      const nbrDesc = cmd.match(/^neighbor (\S+) description (.+)$/)
      if (nbrDesc) {
        const addr = nbrDesc[1]
        if (bgp.neighbors.has(addr)) bgp.neighbors.get(addr)!.description = nbrDesc[2]
        return [this.prompt()]
      }
      const noNbr = cmd.match(/^no neighbor (\S+)$/)
      if (noNbr) { bgp.neighbors.delete(noNbr[1]); return [this.prompt()] }
      const netMask = cmd.match(/^network (\S+) mask (\S+)$/)
      if (netMask) { bgp.networks.push({ ip: netMask[1], mask: netMask[2] }); return [this.prompt()] }
      const noNetMask = cmd.match(/^no network (\S+) mask (\S+)$/)
      if (noNetMask) { bgp.networks = bgp.networks.filter(n => !(n.ip === noNetMask[1] && n.mask === noNetMask[2])); return [this.prompt()] }
    }

    return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
  }

  // ─── config-dhcp mode ─────────────────────────────────────────────────────

  private execConfigDhcp(cmd: string): string[] {
    if (cmd === 'end')  { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'config'; return [this.prompt()] }
    const pool = this.dev.dhcpPools.get(this.dhcpPool)
    if (!pool) { this.mode = 'config'; return [this.prompt()] }

    const netM = cmd.match(/^network (\S+) (\S+)$/)
    if (netM) {
      pool.network = netM[1]
      pool.prefix = isValidMask(netM[2]) ? maskToPrefixLen(netM[2]) : parseInt(netM[2])
      return [this.prompt()]
    }
    if (cmd.startsWith('default-router ')) { pool.defaultRouter = cmd.slice(15).trim(); return [this.prompt()] }
    if (cmd.startsWith('dns-server '))     { pool.dnsServer = cmd.slice(11).trim(); return [this.prompt()] }
    const lease = cmd.match(/^lease (\d+)$/)
    if (lease) { pool.lease = parseInt(lease[1]); return [this.prompt()] }
    if (cmd === 'lease infinite') { pool.lease = 36500; return [this.prompt()] }
    return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
  }

  // ─── config-acl mode ──────────────────────────────────────────────────────

  private execConfigAcl(cmd: string): string[] {
    if (cmd === 'end')  { this.mode = 'enable'; return [this.prompt()] }
    if (cmd === 'exit') { this.mode = 'config'; return [this.prompt()] }
    const entries = this.dev.accessLists.get(this.aclName) ?? []
    if (!this.dev.accessLists.has(this.aclName)) this.dev.accessLists.set(this.aclName, entries)

    // Remove entry by seq
    const noSeq = cmd.match(/^no (\d+)$/)
    if (noSeq) {
      const seq = parseInt(noSeq[1])
      const filtered = entries.filter(e => e.seq !== seq)
      this.dev.accessLists.set(this.aclName, filtered)
      return [this.prompt()]
    }

    // Parse optional leading seq number
    let rest = cmd
    let seq = this.aclSeq
    const seqM = cmd.match(/^(\d+) (.+)$/)
    if (seqM && (seqM[2].startsWith('permit') || seqM[2].startsWith('deny'))) {
      seq = parseInt(seqM[1]); rest = seqM[2]
    }

    if (this.mode === 'config-std-nacl') {
      const m = rest.match(/^(permit|deny) (\S+)(?:\s+(\S+))?$/)
      if (m) {
        const entry: AclEntry = {
          seq, action: m[1] as 'permit'|'deny', protocol: 'ip',
          srcIp: m[2] === 'any' ? 'any' : m[2], srcWild: m[3] ?? '0.0.0.0',
          dstIp: 'any', dstWild: '0.0.0.0',
        }
        entries.push(entry)
        this.aclSeq = seq + 10
        return [this.prompt()]
      }
    } else {
      // Extended ACL
      const m = rest.match(/^(permit|deny) (\S+) (\S+) (\S+) (\S+) (\S+)(?:\s+eq\s+(\S+))?$/)
      if (m) {
        const entry: AclEntry = {
          seq, action: m[1] as 'permit'|'deny', protocol: m[2],
          srcIp: m[3], srcWild: m[4], dstIp: m[5], dstWild: m[6],
          dstPort: m[7],
        }
        entries.push(entry)
        this.aclSeq = seq + 10
        return [this.prompt()]
      }
    }
    return [`          ^`, `% Invalid input detected at '^' marker.`, this.prompt()]
  }

  // ─── show commands ────────────────────────────────────────────────────────

  private showCisco(sub: string): string[] {
    if (sub === 'ip route')                                     return this.dev.fmtRoutes('cisco')
    if (sub === 'arp' || sub === 'ip arp')                     return this.dev.fmtArp('cisco')
    if (sub === 'ip interface brief' || sub === 'ip int br')   return this.dev.fmtIntBrief('cisco')
    if (sub === 'interfaces' || sub === 'int')                 return this.dev.fmtIfDetail('cisco')
    if (sub === 'running-config' || sub === 'run')             return this.dev.fmtRunningConfig()
    if (sub === 'startup-config')                              return ['startup-config is not present']

    // show ip interface <name>
    if (sub.startsWith('ip interface ') && sub !== 'ip interface brief') {
      return this.showIpInterface(sub.slice(13).trim())
    }

    // OSPF show commands
    if (sub === 'ip ospf' || sub.startsWith('ip ospf ')) {
      return this.showOspf(sub.slice(8).trim())
    }

    // RIP show commands
    if (sub === 'ip rip database') return this.showRipDatabase()

    // EIGRP show commands
    if (sub.startsWith('ip eigrp')) return this.showEigrp(sub.slice(9).trim())

    // BGP show commands
    if (sub.startsWith('ip bgp')) return this.showBgp(sub.slice(7).trim())

    // NAT show commands
    if (sub === 'ip nat translations') return this.showNatTranslations()
    if (sub === 'ip nat statistics')   return this.showNatStatistics()

    // ACL show commands
    if (sub === 'access-lists')        return this.showAccessLists(null)
    if (sub.startsWith('access-lists ')) return this.showAccessLists(sub.slice(13).trim())

    // DHCP show commands
    if (sub === 'ip dhcp pool')        return this.showDhcpPool()
    if (sub === 'ip dhcp binding')     return this.showDhcpBinding()
    if (sub === 'ip dhcp conflict')    return [`No DHCP conflicts found.`]

    // CDP
    if (sub === 'cdp neighbors' || sub === 'cdp neighbors detail') return this.showCdpNeighbors()
    if (sub === 'cdp' || sub.startsWith('cdp '))              return ['% CDP is not enabled']

    // Spanning tree
    if (sub.startsWith('spanning-tree'))                       return [`VLAN0001 Spanning tree enabled protocol ieee`, `  Root ID Priority 32769`, `           This bridge is the root`]

    // ip protocols
    if (sub.match(/^ip protocols/)) return this.showIpProtocols()

    // Version
    if (sub === 'version') {
      const ifs = Array.from(this.dev.interfaces.values())
      return [
        `Cisco IOS Software, Version 15.7(3)M8`,
        `ROM: System Bootstrap, Version 15.0(1r)M9`,
        ``,
        `${this.dev.name} uptime is 0 minutes`,
        `System image file is "flash:c2900-universalk9-mz.SPA.157-3.M8.bin"`,
        ``,
        `cisco CISCO2911/K9 (revision 1.0) with 2048K bytes of memory.`,
        `Processor board ID FTX152400KS`,
        ``,
        `${ifs.length} Gigabit Ethernet interface(s)`,
        `1 terminal line`,
        ``,
        `Base ethernet MAC Address: ${ifs[0]?.mac ?? ''}`,
        `Motherboard assembly number: 73-12647-03`,
        ``,
        `Configuration register is 0x2102`,
      ]
    }
    if (sub === 'clock') {
      const now = new Date()
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return [`*${now.toTimeString().slice(0,8)}.000 UTC ${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`]
    }
    if (sub === 'processes cpu' || sub === 'memory') return [`CPU utilization: 0%; 1 min: 0%; 5 min: 0%; 60 min: 0%`]
    if (sub === 'users') return ['    Line       User       Host(s)       Idle    Location', `*  0 con 0               idle           00:00:00`]
    if (sub === 'flash') return ['System flash directory:', '-#- --length-- -----date/time------ path', `  1   55945196  Jan 01 2020 00:00:00  c2900-universalk9-mz.SPA.157-3.M8.bin`, `[60817408 bytes total / 4872212 bytes free]`]
    if (sub === 'logging') return ['Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)', 'Console logging: level debugging, 0 messages logged', 'Buffer logging: disabled']
    return [`% Invalid input detected at '^' marker.`]
  }

  // ─── Show sub-handlers ────────────────────────────────────────────────────

  private showOspf(sub: string): string[] {
    if (!sub || sub === '') {
      // show ip ospf
      if (this.dev.ospfProcesses.size === 0) return ['% OSPF routing process not enabled']
      const lines: string[] = []
      for (const [, proc] of this.dev.ospfProcesses) {
        const rid = proc.routerId ?? this.guessRouterId()
        lines.push(`Routing Process "ospf ${proc.processId}" with ID ${rid}`)
        lines.push(`Start time: 00:00:00.000, Time elapsed: 00:00:00.000`)
        lines.push(`Supports only single TOS(TOS0) routes`)
        lines.push(`Supports opaque LSA`)
        lines.push(`SPF schedule delay 5 secs, Hold time between two SPFs 10 secs`)
        lines.push(`Minimum LSA interval 5 secs. Minimum LSA arrival 1 secs`)
        lines.push(`Number of external LSA 0. Checksum Sum 0x000000`)
        lines.push(`Number of areas in this router is ${proc.areas.size}. ${proc.areas.size} normal 0 stub 0 nssa`)
        for (const [, area] of proc.areas) {
          lines.push(`    Area ${area.areaId}${area.stubArea ? ' (STUB)' : ''}`)
          lines.push(`        Number of interfaces in this area is ${area.interfaces.length}`)
          lines.push(`        Area has no authentication`)
        }
        lines.push('')
      }
      return lines
    }

    if (sub === 'neighbor' || sub === 'neighbor detail') {
      if (this.dev.ospfProcesses.size === 0) return ['% OSPF routing process not enabled']
      const lines = ['Neighbor ID     Pri   State           Dead Time   Address         Interface']
      let found = false
      for (const [pid] of this.dev.ospfProcesses) {
        const neighbors = this.dev.getOspfNeighbors(pid)
        for (const n of neighbors) {
          found = true
          lines.push(`${n.neighborId.padEnd(16)}  1   ${n.state.padEnd(12)}     00:00:35    ${n.address.padEnd(16)}${shortIf(n.ifName, 'Cisco')}`)
        }
      }
      if (!found) lines.push('(no OSPF neighbors)')
      return lines
    }

    if (sub === 'database') {
      if (this.dev.ospfProcesses.size === 0) return ['% OSPF routing process not enabled']
      const lines: string[] = []
      for (const [, proc] of this.dev.ospfProcesses) {
        const rid = proc.routerId ?? this.guessRouterId()
        lines.push(``, `            OSPF Router with ID (${rid}) (Process ID ${proc.processId})`, ``)
        lines.push(`                Router Link States (Area 0)`, ``)
        lines.push(`Link ID         ADV Router      Age         Seq#       Checksum Link count`)
        lines.push(`${rid.padEnd(16)}${rid.padEnd(16)}42          0x80000001 0x00B6C0 ${proc.networks.length}`)
        lines.push(``)
      }
      return lines
    }

    if (sub === 'interface') {
      if (this.dev.ospfProcesses.size === 0) return ['% OSPF routing process not enabled']
      const lines: string[] = []
      for (const [, proc] of this.dev.ospfProcesses) {
        for (const [ifName, iface] of this.dev.interfaces) {
          if (!iface.ip || !this.dev.isInterfaceInOspf(proc.processId, ifName, iface.ip)) continue
          const area = proc.networks.find(n => this.dev.isInterfaceInOspf(proc.processId, ifName, iface.ip!))?.area ?? 0
          lines.push(`${ifName} is ${iface.status === 'up' ? 'up' : 'down'}, line protocol is ${iface.status === 'up' ? 'up' : 'down'}`)
          lines.push(`  Internet Address ${iface.ip}/${iface.prefixLen}, Area ${area}, Attached via Network Statement`)
          lines.push(`  Process ID ${proc.processId}, Router ID ${proc.routerId ?? this.guessRouterId()}, Network Type BROADCAST, Cost: 1`)
          lines.push(`  Transmit Delay is 1 sec, State DR, Priority 1`)
          lines.push(`  Designated Router (ID) ${proc.routerId ?? this.guessRouterId()}, Interface address ${iface.ip}`)
          lines.push(`  No backup designated router on this network`)
          lines.push(`  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5`)
          lines.push(`  Hello due in 00:00:05`)
          lines.push(`  Supports Link-local Signaling (LLS)`)
          lines.push(`  Index 1/1, flood queue length 0`)
          lines.push(`  Next 0x0(0)/0x0(0)`)
          lines.push(`  Last flood scan length is 0, maximum is 0`)
          lines.push(`  Last flood scan time is 0 msec, maximum is 0 msec`)
          lines.push(`  Neighbor Count is 0, Adjacent neighbor count is 0`)
          lines.push(`  Suppress hello for 0 neighbor(s)`)
          lines.push(``)
        }
      }
      if (!lines.length) return ['(no OSPF interfaces)']
      return lines
    }

    return [`% Unknown OSPF show command`]
  }

  private guessRouterId(): string {
    for (const [, iface] of this.dev.interfaces) {
      if (iface.ip && iface.status === 'up') return iface.ip
    }
    for (const [, iface] of this.dev.interfaces) {
      if (iface.ip) return iface.ip
    }
    return '0.0.0.0'
  }

  private showRipDatabase(): string[] {
    if (!this.dev.ripConfig) return ['% RIP is not enabled']
    const lines = ['RIP local RIB for main table', '', `  Code:    R - Rip, RC - connected (rip sourced)`, '']
    for (const net of this.dev.ripConfig.networks) {
      lines.push(`RC  ${net}/8     directly connected`)
    }
    if (!this.dev.ripConfig.networks.length) lines.push('(no RIP networks configured)')
    return lines
  }

  private showEigrp(sub: string): string[] {
    if (this.dev.eigrpProcesses.size === 0) return ['% EIGRP is not enabled']
    if (sub === 'neighbors' || sub === '') {
      const lines = ['EIGRP-IPv4 Neighbors for AS(', 'H   Address            Interface       Hold Uptime   SRTT   RTO  Q  Seq']
      for (const [, proc] of this.dev.eigrpProcesses) {
        lines[0] = `EIGRP-IPv4 Neighbors for AS(${proc.asNumber})`
        let h = 0
        for (const [, iface] of this.dev.interfaces) {
          if (!iface.ip || iface.status !== 'up') continue
          const inEigrp = proc.networks.some(n => this.dev['ipMatchesWildcard']?.(iface.ip!, n.ip, n.wildcard ?? '0.0.0.255') ?? false)
          if (!inEigrp) continue
          const nAddr = this.simulateNeighborIp(iface.ip)
          lines.push(`${h++}   ${nAddr.padEnd(19)}${shortIf(iface.name, 'Cisco').padEnd(16)}12   0:00:05    5    200  0  1`)
        }
      }
      return lines
    }
    if (sub === 'topology') {
      const lines = ['EIGRP-IPv4 Topology Table for AS()']
      for (const [, proc] of this.dev.eigrpProcesses) {
        lines[0] = `EIGRP-IPv4 Topology Table for AS(${proc.asNumber})/ID(${this.guessRouterId()})`
        lines.push('Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,', '       r - reply Status, s - sia Status', '')
        for (const route of this.dev.routingTable.filter(r => r.source === 'connected')) {
          lines.push(`P ${route.network}/${route.prefixLen}, 1 successors, FD is 28160`)
          lines.push(`        via Connected, ${shortIf(route.interface, 'Cisco')}`)
        }
      }
      return lines
    }
    return [`% Unknown EIGRP show command`]
  }

  private simulateNeighborIp(myIp: string): string {
    const parts = myIp.split('.')
    const last = parseInt(parts[3])
    parts[3] = String(last === 1 ? 2 : 1)
    return parts.join('.')
  }

  private showBgp(sub: string): string[] {
    if (!this.dev.bgpConfig) return ['% BGP not active']
    const bgp = this.dev.bgpConfig
    const rid = bgp.routerId ?? this.guessRouterId()

    if (!sub || sub === '') {
      // show ip bgp
      const lines = [
        `BGP table version is 1, local router ID is ${rid}`,
        `Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,`,
        `              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,`,
        `              x best-external, a additional-path, c RIB-compressed,`,
        `Origin codes: i - IGP, e - EGP, ? - incomplete`,
        ``,
        `   Network          Next Hop            Metric LocPrf Weight Path`,
      ]
      for (const net of bgp.networks)
        lines.push(`*> ${(net.ip + '/' + maskToPrefixLen(net.mask)).padEnd(20)}0.0.0.0              0         32768 i`)
      for (const [addr, nbr] of bgp.neighbors)
        lines.push(`*> (learned from ${addr} AS${nbr.remoteAs})`)
      if (!bgp.networks.length && !bgp.neighbors.size) lines.push('(no BGP entries)')
      return lines
    }

    if (sub === 'summary') {
      const lines = [
        `BGP router identifier ${rid}, local AS number ${bgp.localAs}`,
        `BGP table version is 1, main routing table version 1`,
        ``,
        `Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd`,
      ]
      for (const [addr, nbr] of bgp.neighbors)
        lines.push(`${addr.padEnd(16)}4    ${String(nbr.remoteAs).padEnd(12)}  5       5        1    0    0 00:00:05 Established`)
      if (!bgp.neighbors.size) lines.push('(no BGP neighbors)')
      return lines
    }

    if (sub === 'neighbors') {
      const lines: string[] = []
      for (const [addr, nbr] of bgp.neighbors) {
        lines.push(`BGP neighbor is ${addr},  remote AS ${nbr.remoteAs}, external link`)
        if (nbr.description) lines.push(`  Description: ${nbr.description}`)
        lines.push(`  BGP version 4, remote router ID ${addr}`)
        lines.push(`  BGP state = Established, up for 00:00:05`)
        lines.push(`  Last read 00:00:05, last write 00:00:05, hold time is 180, keepalive interval is 60 seconds`)
        lines.push(`  Neighbor capabilities:`)
        lines.push(`    Route refresh: advertised and received(new)`)
        lines.push(`    Address family IPv4 Unicast: advertised and received`)
        lines.push(`  Message statistics:`)
        lines.push(`    InQ depth is 0`)
        lines.push(`    OutQ depth is 0`)
        lines.push(`                         Sent       Rcvd`)
        lines.push(`    Opens:                  1          1`)
        lines.push(`    Notifications:          0          0`)
        lines.push(`    Updates:                1          1`)
        lines.push(`    Keepalives:             5          5`)
        lines.push(`    Route Refresh:          0          0`)
        lines.push(`    Total:                  7          7`)
        lines.push(`  Address tracking is enabled, the RIB does have a route to ${addr}`)
        lines.push(`  Connections established 1; dropped 0`)
        lines.push(``)
      }
      if (!bgp.neighbors.size) lines.push('(no BGP neighbors configured)')
      return lines
    }

    return [`% Unknown BGP show command`]
  }

  private showNatTranslations(): string[] {
    const lines = ['Pro Inside global      Inside local       Outside local      Outside global']
    for (const [local, global] of this.dev.natConfig.staticMappings)
      lines.push(`---  ${global.padEnd(22)}${local.padEnd(19)}---                ---`)
    if (!this.dev.natConfig.staticMappings.size) lines.push('(no NAT translations)')
    return lines
  }

  private showNatStatistics(): string[] {
    return [
      `Total active translations: ${this.dev.natConfig.staticMappings.size} (${this.dev.natConfig.staticMappings.size} static, 0 dynamic; 0 extended)`,
      `Outside interfaces:`,
      ...Array.from(this.dev.natConfig.outsideInterfaces).map(i => `  ${shortIf(i, 'Cisco')}`),
      `Inside interfaces:`,
      ...Array.from(this.dev.natConfig.insideInterfaces).map(i => `  ${shortIf(i, 'Cisco')}`),
      `Hits: 0  Misses: 0`,
      `CEF Translated packets: 0, CEF Punted packets: 0`,
      `Expired translations: 0`,
      `Dynamic mappings:`,
      this.dev.natConfig.aclRef ? `  In-to-out src-ip access-list ${this.dev.natConfig.aclRef}${this.dev.natConfig.overload ? ' overload' : ''}` : `  (none)`,
    ]
  }

  private showAccessLists(name: string | null): string[] {
    if (this.dev.accessLists.size === 0) return ['% No access lists configured']
    const lines: string[] = []
    for (const [aclName, entries] of this.dev.accessLists) {
      if (name && aclName !== name) continue
      const num = Number(aclName)
      if (!isNaN(num)) {
        const type = num <= 99 ? 'Standard' : 'Extended'
        lines.push(`${type} IP access list ${aclName}`)
      } else {
        const isExt = entries.some(e => e.protocol !== 'ip' || e.dstIp !== 'any')
        lines.push(`${isExt ? 'Extended' : 'Standard'} IP access list ${aclName}`)
      }
      for (const e of entries) {
        const num2 = Number(aclName)
        if (!isNaN(num2) && num2 <= 99) {
          const wc = e.srcWild !== '0.0.0.0' ? ` ${e.srcWild}` : ''
          lines.push(`    ${e.seq} ${e.action} ${e.srcIp}${wc}`)
        } else if (!isNaN(num2)) {
          let line = `    ${e.seq} ${e.action} ${e.protocol} ${e.srcIp} ${e.srcWild} ${e.dstIp} ${e.dstWild}`
          if (e.dstPort) line += ` eq ${e.dstPort}`
          lines.push(line)
        } else {
          const isExtEntry = entries.some(en => en.protocol !== 'ip' || en.dstIp !== 'any')
          if (isExtEntry) {
            let line = `    ${e.seq} ${e.action} ${e.protocol} ${e.srcIp} ${e.srcWild} ${e.dstIp} ${e.dstWild}`
            if (e.dstPort) line += ` eq ${e.dstPort}`
            lines.push(line)
          } else {
            const wc = e.srcWild !== '0.0.0.0' ? ` ${e.srcWild}` : ''
            lines.push(`    ${e.seq} ${e.action} ${e.srcIp}${wc}`)
          }
        }
      }
    }
    return lines
  }

  private showDhcpPool(): string[] {
    if (this.dev.dhcpPools.size === 0) return ['% No DHCP pools configured']
    const lines: string[] = []
    for (const [, pool] of this.dev.dhcpPools) {
      lines.push(`Pool ${pool.name} :`)
      lines.push(` Utilization mark (high/low)    : 100 / 0`)
      lines.push(` Subnet size (first/next)       : 0 / 0`)
      lines.push(` Total addresses                : 254`)
      lines.push(` Leased addresses               : 0`)
      lines.push(` Excluded addresses             : ${this.dev.dhcpExcluded.length}`)
      lines.push(` Pending event                  : none`)
      lines.push(` 1 subnet is currently in the pool :`)
      lines.push(` Current index        IP address range                    Leased/Excluded/Total`)
      lines.push(` ${pool.network}         ${pool.network}  - ${pool.network}   0    / ${this.dev.dhcpExcluded.length}   / 254`)
      if (pool.defaultRouter) lines.push(` Default router : ${pool.defaultRouter}`)
      if (pool.dnsServer)     lines.push(` DNS server     : ${pool.dnsServer}`)
      lines.push('')
    }
    return lines
  }

  private showDhcpBinding(): string[] {
    return [
      'Bindings from all pools not associated with VRF:',
      'IP address       Client-ID/ Lease expiration      Type       State      Interface',
      '                 Hardware address/',
      '                 User name',
      '(no DHCP bindings – simulation only)',
    ]
  }

  private showCdpNeighbors(): string[] {
    const lines = [
      'Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge',
      '                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,',
      '                  D - Remote, C - CVTA, M - Two-port Mac Relay',
      '',
      'Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID',
    ]
    if (this.dev.engine) {
      for (const [, iface] of this.dev.interfaces) {
        if (iface.status !== 'up') continue
        const ep = this.dev.engine.getLinkedEndpoint(this.dev.id, iface.name)
        if (!ep) continue
        const remDev = this.dev.engine.getDevice(ep.deviceId) as { name?: string; type?: string } | undefined
        if (!remDev?.name) continue
        const cap = remDev.type === 'router' ? 'R' : 'S'
        lines.push(`${remDev.name.padEnd(17)}${shortIf(iface.name,'Cisco').padEnd(18)}120        ${cap}           WS-C2911  ${ep.ifName}`)
      }
    }
    if (lines.length === 5) lines.push('(no CDP neighbors)')
    return lines
  }

  private showIpInterface(ifName: string): string[] {
    const iface = ifName ? this.dev.interfaces.get(this.dev.resolveIfName(ifName)) : null
    if (!iface) return [`% Interface ${ifName} not found`]
    const up = iface.status === 'up'
    const lines = [
      `${iface.name} is ${up ? 'up' : 'administratively down'}, line protocol is ${up ? 'up' : 'down'}`,
      `  Internet address is ${iface.ip ? iface.ip + '/' + iface.prefixLen : 'unassigned'}`,
      `  Broadcast address is 255.255.255.255`,
      `  Address determined by setup command`,
      `  MTU is 1500 bytes`,
      `  Helper address is not set`,
      `  Directed broadcast forwarding is disabled`,
      `  Outgoing access list is not set`,
      `  Inbound  access list is not set`,
    ]
    if (this.dev.natConfig.insideInterfaces.has(iface.name))  lines.push(`  IP NAT inside source`)
    if (this.dev.natConfig.outsideInterfaces.has(iface.name)) lines.push(`  IP NAT outside`)
    lines.push(`  Proxy ARP is enabled`)
    lines.push(`  Local Proxy ARP is disabled`)
    lines.push(`  Security level is default`)
    lines.push(`  Split horizon is enabled`)
    lines.push(`  ICMP redirects are always sent`)
    lines.push(`  ICMP unreachables are always sent`)
    lines.push(`  ICMP mask replies are never sent`)
    lines.push(`  IP fast switching is enabled`)
    lines.push(`  IP CEF switching is enabled`)
    return lines
  }

  private showIpProtocols(): string[] {
    const lines: string[] = ['*** IP Routing is NSF aware ***', '']
    let hasProto = false

    // Static
    const statics = this.dev.routingTable.filter(r => r.source === 'static')
    if (statics.length) {
      hasProto = true
      lines.push(`Routing Protocol is "static"`)
      lines.push(`  Number of routes: ${statics.length}`)
      for (const r of statics) lines.push(`    ${r.network}/${r.prefixLen} via ${r.nextHop}`)
      lines.push('')
    }

    // OSPF
    for (const [, proc] of this.dev.ospfProcesses) {
      hasProto = true
      const rid = proc.routerId ?? this.guessRouterId()
      lines.push(`Routing Protocol is "ospf ${proc.processId}"`)
      lines.push(`  Outgoing update filter list for all interfaces is not set`)
      lines.push(`  Incoming update filter list for all interfaces is not set`)
      lines.push(`  Router ID ${rid}`)
      lines.push(`  Number of areas in this router is ${proc.areas.size}. ${proc.areas.size} normal 0 stub 0 nssa`)
      lines.push(`  Maximum path: 4`)
      lines.push(`  Routing for Networks:`)
      for (const n of proc.networks) lines.push(`    ${n.ip} ${n.wildcard} area ${n.area}`)
      lines.push(`  Routing Information Sources:`)
      lines.push(`    Gateway         Distance      Last Update`)
      lines.push(`  Distance: (default is 110)`)
      lines.push('')
    }

    // RIP
    if (this.dev.ripConfig) {
      hasProto = true
      const rip = this.dev.ripConfig
      lines.push(`Routing Protocol is "rip"`)
      lines.push(`  Outgoing update filter list for all interfaces is not set`)
      lines.push(`  Incoming update filter list for all interfaces is not set`)
      lines.push(`  Sending updates every 30 seconds, next due in 30 seconds`)
      lines.push(`  Invalid after 180 seconds, hold down 180, flushed after 240`)
      lines.push(`  Redistributing: rip`)
      lines.push(`  Default version control: send version ${rip.version}, receive version ${rip.version}`)
      lines.push(`  Routing for Networks:`)
      for (const n of rip.networks) lines.push(`    ${n}`)
      lines.push(`  Distance: (default is 120)`)
      lines.push('')
    }

    // EIGRP
    for (const [, proc] of this.dev.eigrpProcesses) {
      hasProto = true
      lines.push(`Routing Protocol is "eigrp ${proc.asNumber}"`)
      lines.push(`  Outgoing update filter list for all interfaces is not set`)
      lines.push(`  Incoming update filter list for all interfaces is not set`)
      lines.push(`  Default networks flagged in outgoing updates`)
      lines.push(`  Default networks accepted from incoming updates`)
      lines.push(`  EIGRP-IPv4 Protocol for AS(${proc.asNumber})`)
      lines.push(`    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0`)
      lines.push(`    Soft SIA disabled`)
      lines.push(`  Routing for Networks:`)
      for (const n of proc.networks) lines.push(`    ${n.ip}${n.wildcard ? ' ' + n.wildcard : ''}`)
      lines.push(`  Distance: internal 90 external 170`)
      lines.push('')
    }

    // BGP
    if (this.dev.bgpConfig) {
      hasProto = true
      const bgp = this.dev.bgpConfig
      lines.push(`Routing Protocol is "bgp ${bgp.localAs}"`)
      lines.push(`  Outgoing update filter list for all interfaces is not set`)
      lines.push(`  Incoming update filter list for all interfaces is not set`)
      lines.push(`  IGP synchronization is disabled`)
      lines.push(`  Automatic route summarization is disabled`)
      lines.push(`  Neighbor(s):`)
      for (const [addr, nbr] of bgp.neighbors) lines.push(`    Address: ${addr}   AS: ${nbr.remoteAs}`)
      lines.push(`  Distance: external 20 internal 200 local 200`)
      lines.push('')
    }

    if (!hasProto) lines.push('(no routing protocols configured)')
    return lines
  }

  // ─── Helper: prefix length to wildcard mask ───────────────────────────────

  private prefixToWildcard(prefix: number): string {
    if (prefix === 0) return '255.255.255.255'
    const mask = (~0 << (32 - prefix)) >>> 0
    const wc = (~mask) >>> 0
    return [
      (wc >>> 24) & 0xff,
      (wc >>> 16) & 0xff,
      (wc >>> 8) & 0xff,
      wc & 0xff,
    ].join('.')
  }

  // ─── Helper: add numbered ACL ─────────────────────────────────────────────

  private addNumberedAcl(num: string, action: 'permit'|'deny', rest: string): string[] {
    const n = Number(num)
    if (!this.dev.accessLists.has(num)) this.dev.accessLists.set(num, [])
    const entries = this.dev.accessLists.get(num)!
    const seq = entries.length * 10 + 10

    if (n <= 99) {
      // Standard: permit|deny <ip> [<wildcard>]
      const parts = rest.trim().split(/\s+/)
      const entry: AclEntry = {
        seq, action, protocol: 'ip',
        srcIp: parts[0] ?? 'any', srcWild: parts[1] ?? '0.0.0.0',
        dstIp: 'any', dstWild: '0.0.0.0',
      }
      entries.push(entry)
      return []
    } else {
      // Extended: permit|deny <proto> <src> <swild> <dst> <dwild> [eq <port>]
      const parts = rest.trim().split(/\s+/)
      if (parts.length < 5) return [`% Extended ACL requires: <proto> <src> <swild> <dst> <dwild>`]
      const entry: AclEntry = {
        seq, action, protocol: parts[0],
        srcIp: parts[1], srcWild: parts[2], dstIp: parts[3], dstWild: parts[4],
        dstPort: parts[5] === 'eq' ? parts[6] : undefined,
      }
      entries.push(entry)
      return []
    }
  }

  // ─── Datacom (Cisco-compatible) ───────────────────────────────────────────

  private execDatacom(cmd: string): string[] {
    const expanded = this.tryExpand(cmd.trim())
    if (expanded === 'show version') return [...this.showVersionDatacom(), this.prompt()]
    if (expanded === 'show running-config' || expanded === 'show run')
      return [...this.fmtRunningConfigDatacom(), this.prompt()]
    if (expanded.startsWith('do show version')) return [...this.showVersionDatacom(), this.prompt()]
    return this.execCisco(cmd)
  }

  private showVersionDatacom(): string[] {
    const portCount = this.dev.interfaces.size
    const model = portCount <= 2 ? 'DM/440-E' : portCount <= 4 ? 'DM/460-E' : portCount <= 6 ? 'DM/890-E' : 'DM/1100-E'
    const serial = 'DTC' + Math.floor(Math.random() * 900000 + 100000)
    const ifs = Array.from(this.dev.interfaces.values())
    return [
      `Datacom DataOS Software, Version 3.12.3 (DM Enterprise)`,
      `Technical Support: http://www.datacom.ind.br`,
      `Copyright (c) 2004-2024 Datacom Telematica Ltda.`,
      '',
      `ROM: DataOS Bootstrap, Version 3.0.1`,
      '',
      `${this.dev.name} uptime is 0 minutes`,
      `System image file is "flash:dataos-universalk9-3.12.3.bin"`,
      '',
      `Datacom ${model} (revision 2.0) with 512MB/128MB memory.`,
      `Processor board ID ${serial}`,
      `${ifs.length} GigabitEthernet interface(s)`,
      `DRAM configuration is 64 bits wide with parity enabled.`,
      `256K bytes of non-volatile configuration memory.`,
      `512MB bytes of flash (Read/Write)`,
      '',
      `Configuration register is 0x2102`,
    ]
  }

  private fmtRunningConfigDatacom(): string[] {
    const now = new Date()
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const lines: string[] = [
      '!',
      `! Last configuration change at ${now.toTimeString().slice(0,8)} UTC ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      '!',
      `version 3.12`,
      'service timestamps debug datetime msec',
      'service timestamps log datetime msec',
      '!',
      `hostname ${this.dev.name}`,
      '!',
    ]
    for (const [, iface] of this.dev.interfaces) {
      lines.push(`interface ${iface.name}`)
      if (iface.description) lines.push(` description ${iface.description}`)
      if (iface.ip)          lines.push(` ip address ${iface.ip} ${prefixLenToMask(iface.prefixLen!)}`)
      lines.push(iface.status === 'up' ? ' no shutdown' : ' shutdown')
      lines.push('!')
    }
    const statics = this.dev.routingTable.filter(r => r.source === 'static')
    for (const r of statics)
      lines.push(`ip route ${r.network} ${prefixLenToMask(r.prefixLen)} ${r.nextHop}`)
    if (statics.length) lines.push('!')
    lines.push('line con 0')
    lines.push('line vty 0 4')
    lines.push(' login')
    lines.push('!')
    lines.push('end')
    return lines
  }

  // ─── Tab completion ───────────────────────────────────────────────────────

  getCompletions(partial: string): string[] {
    return this.compCisco(partial, partial.toLowerCase())
  }

  private compCisco(partial: string, lo: string): string[] {
    const ifLong  = Array.from(this.dev.interfaces.keys())
    const ifShort = ifLong.map(n => shortIf(n, 'Cisco'))
    let pool: string[] = []
    if (this.mode === 'user') pool = ['enable', 'exit', 'logout', 'show version', '?']
    else if (this.mode === 'enable') pool = [
      'configure terminal', 'conf t', 'disable', 'exit',
      'show ip route', 'show ip interface brief', 'show ip int br',
      'show ip arp', 'show ip protocols',
      'show ip ospf', 'show ip ospf neighbor', 'show ip ospf database', 'show ip ospf interface',
      'show ip eigrp neighbors', 'show ip eigrp topology',
      'show ip bgp', 'show ip bgp summary', 'show ip bgp neighbors',
      'show ip nat translations', 'show ip nat statistics',
      'show ip dhcp pool', 'show ip dhcp binding', 'show ip dhcp conflict',
      'show ip rip database',
      'show arp', 'show interfaces', 'show version', 'show running-config', 'show startup-config',
      'show clock', 'show users', 'show processes cpu', 'show memory', 'show flash',
      'show logging', 'show access-lists', 'show spanning-tree', 'show cdp neighbors',
      'ping ', 'traceroute ',
      'write memory', 'write erase', 'write', 'reload',
      'copy startup-config running-config',
      'clear ip arp', 'clear ip route *',
      'debug ip icmp', 'debug ip packet', 'debug ip routing', 'debug ip ospf', 'debug ip eigrp', 'debug ip bgp', 'debug ip rip',
      'undebug all', 'no debug all',
      '?',
    ]
    else if (this.mode === 'config') pool = [
      'end', 'exit', 'hostname ',
      'ip route ', 'no ip route ',
      'ip default-gateway ', 'ip name-server ', 'no ip domain-lookup', 'ip domain-lookup',
      'ip domain-name ',
      'enable secret ', 'enable password ', 'no enable secret', 'no enable password',
      'banner motd ', 'service password-encryption',
      'line console 0', 'line vty 0 4',
      'router ospf ', 'router eigrp ', 'router rip', 'router bgp ',
      'no router ospf ', 'no router eigrp ', 'no router rip', 'no router bgp ',
      'access-list ', 'ip access-list extended ', 'ip access-list standard ',
      'no access-list ', 'no ip access-list extended ', 'no ip access-list standard ',
      'ip nat pool ', 'ip nat inside source list ', 'ip nat inside source static ',
      'no ip nat pool ', 'no ip nat inside source static ',
      'ip dhcp pool ', 'ip dhcp excluded-address ', 'no ip dhcp pool ', 'no ip dhcp excluded-address ',
      'clock timezone ', 'logging ', 'ntp ',
      ...ifLong.map(n => 'interface ' + n),
      ...ifShort.map(n => 'interface ' + n),
      '?',
    ]
    else if (this.mode === 'config-if') pool = [
      'ip address ', 'no ip address', 'no shutdown', 'no shut', 'shutdown',
      'description ', 'no description',
      'duplex full', 'duplex half', 'duplex auto',
      'speed 10', 'speed 100', 'speed 1000', 'speed auto',
      'bandwidth ', 'ip ospf ', 'no ip ospf',
      'ip nat inside', 'ip nat outside', 'no ip nat inside', 'no ip nat outside',
      'ip access-group ', 'no ip access-group',
      'encapsulation dot1q ',
      'do show ip interface brief', 'do show ip route', 'do show running-config',
      'exit', 'end', '?',
    ]
    else if (this.mode === 'config-router') pool = [
      'network ', 'no network ',
      'router-id ', 'no router-id',
      'area ', 'no area ',
      'passive-interface ', 'no passive-interface ',
      'redistribute connected subnets', 'redistribute static subnets',
      'no redistribute connected subnets', 'no redistribute static subnets',
      'default-information originate', 'default-information originate always',
      'no default-information originate',
      'auto-cost reference-bandwidth ',
      'version 2',
      'no auto-summary', 'auto-summary',
      'bgp router-id ',
      'neighbor ', 'no neighbor ',
      'redistribute static metric ',
      'exit', 'end', '?',
    ]
    else if (this.mode === 'config-dhcp') pool = [
      'network ', 'default-router ', 'dns-server ',
      'lease ', 'lease infinite',
      'exit', 'end', '?',
    ]
    else if (this.mode === 'config-std-nacl' || this.mode === 'config-ext-nacl') pool = [
      'permit ', 'deny ', 'no ',
      'exit', 'end', '?',
    ]
    else pool = [
      'ip address ', 'no ip address', 'no shutdown', 'no shut', 'shutdown',
      'description ', 'duplex full', 'duplex half', 'duplex auto',
      'speed 10', 'speed 100', 'speed 1000', 'speed auto',
      'bandwidth ', 'ip ospf ', 'no ip ospf',
      'ip access-group ', 'no ip access-group',
      'do show ip interface brief', 'do show ip route', 'do show running-config',
      'exit', 'end', '?',
    ]
    return pool.filter(c => c.toLowerCase().startsWith(lo))
  }
}
