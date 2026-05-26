export function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

export function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.')
}

export function prefixLenToMask(prefixLen: number): string {
  if (prefixLen === 0) return '0.0.0.0'
  return intToIp((~0 << (32 - prefixLen)) >>> 0)
}

export function maskToPrefixLen(mask: string): number {
  const n = ipToInt(mask)
  return n.toString(2).replace(/0/g, '').length
}

export function getNetworkAddress(ip: string, prefixLen: number): string {
  if (prefixLen === 0) return '0.0.0.0'
  const mask = (~0 << (32 - prefixLen)) >>> 0
  return intToIp((ipToInt(ip) & mask) >>> 0)
}

export function isInSubnet(ip: string, network: string, prefixLen: number): boolean {
  if (prefixLen === 0) return true
  const mask = (~0 << (32 - prefixLen)) >>> 0
  return ((ipToInt(ip) & mask) >>> 0) === ((ipToInt(network) & mask) >>> 0)
}

export function isValidIp(ip: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split('.').every(o => parseInt(o) <= 255)
}

export function isValidMask(mask: string): boolean {
  if (!isValidIp(mask)) return false
  const n = ipToInt(mask)
  const inv = (~n) >>> 0
  return (inv & (inv + 1)) === 0
}

export function generateMac(): string {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  return `aa:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`
}

export function randomId(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 9)
}
