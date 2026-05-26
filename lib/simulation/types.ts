export type DeviceType = 'router' | 'switch' | 'pc' | 'server'

export interface NetworkInterface {
  name: string
  mac: string
  ip?: string
  prefixLen?: number
  status: 'up' | 'down'
  description?: string
}

export interface RoutingEntry {
  network: string
  prefixLen: number
  nextHop: string
  interface: string
  metric: number
  source: 'connected' | 'static' | 'ospf' | 'rip' | 'eigrp' | 'bgp'
}

// ─── Routing protocol types ───────────────────────────────────────────────────

export interface OspfArea {
  areaId: number
  interfaces: string[]
  stubArea: boolean
}

export interface OspfProcess {
  processId: number
  routerId?: string
  areas: Map<number, OspfArea>
  networks: Array<{ip: string, wildcard: string, area: number}>
  redistributeConnected: boolean
  redistributeStatic: boolean
  defaultInformation: boolean
  referenceBandwidth?: number
}

export interface RipConfig {
  version: 2
  networks: string[]
  passive: Set<string>
  noAutoSummary: boolean
  redistributeStatic: boolean
  redistributeConnected: boolean
}

export interface EigrpProcess {
  asNumber: number
  networks: Array<{ip: string, wildcard?: string}>
  passive: Set<string>
  noAutoSummary: boolean
}

export interface BgpConfig {
  localAs: number
  routerId?: string
  neighbors: Map<string, {remoteAs: number, description?: string}>
  networks: Array<{ip: string, mask: string}>
}

export interface NatConfig {
  insideInterfaces: Set<string>
  outsideInterfaces: Set<string>
  pools: Map<string, {start: string, end: string, prefix: number}>
  staticMappings: Map<string, string>
  overload: boolean
  aclRef?: string
}

export interface AclEntry {
  seq: number
  action: 'permit' | 'deny'
  protocol: string
  srcIp: string
  srcWild: string
  dstIp: string
  dstWild: string
  srcPort?: string
  dstPort?: string
}

export interface DhcpPool {
  name: string
  network: string
  prefix: number
  defaultRouter?: string
  dnsServer?: string
  excludedAddresses: string[]
  lease?: number
}

export interface ArpEntry {
  ip: string
  mac: string
  iface: string
}

export interface MacTableEntry {
  mac: string
  port: string
}

export interface EthernetFrame {
  srcMac: string
  dstMac: string
  etherType: number
  payload: IPv4Packet | ARPPacket
}

export interface IPv4Packet {
  version: 4
  ttl: number
  protocol: number
  srcIp: string
  dstIp: string
  id: number
  payload: ICMPPacket | RawPayload
}

export interface RawPayload {
  raw: true
  data: string
}

export interface ARPPacket {
  operation: 1 | 2
  senderMac: string
  senderIp: string
  targetMac: string
  targetIp: string
}

export interface ICMPPacket {
  type: number
  code: number
  id: number
  sequence: number
  data?: string
}

// ICMP types
export const ICMP_ECHO_REQUEST = 8
export const ICMP_ECHO_REPLY = 0
export const ICMP_TTL_EXCEEDED = 11
export const ICMP_DEST_UNREACHABLE = 3

export interface RouterSnapshot {
  type: 'router'
  id: string
  name: string
  brand: string
  mode: string
  currentIfs: string[]
  interfaces: NetworkInterface[]
  routingTable: RoutingEntry[]
}

export interface SwitchSnapshot {
  type: 'switch'
  id: string
  name: string
  brand: string
  portCount: number
  mode: string
  macTable: MacTableEntry[]
}

export interface PCSnapshot {
  type: 'pc' | 'server'
  id: string
  name: string
  brand: string
  subtype: 'pc' | 'server'
  iface: NetworkInterface
  gateway?: string
}

export type DeviceSnapshot = RouterSnapshot | SwitchSnapshot | PCSnapshot

export interface PacketLogEntry {
  id: string
  timestamp: number
  type: 'arp-req' | 'arp-reply' | 'icmp-req' | 'icmp-reply' | 'icmp-ttl' | 'icmp-unreach' | 'ip-fwd' | 'info'
  srcDevice: string
  dstDevice: string
  srcIp?: string
  dstIp?: string
  srcMac?: string
  dstMac?: string
  detail: string
}
