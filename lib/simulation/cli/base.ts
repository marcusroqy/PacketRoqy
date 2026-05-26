import type { RouterDevice } from '../devices/router'
import type { SwitchDevice } from '../devices/switch'
import type { PCDevice } from '../devices/pc'

export interface BrandCLI {
  execute(cmd: string): string[]
  getBanner(): string[]
}

// ─── Interface name translation ───────────────────────────────────────────────
// Internal names: GigabitEthernet0/0..N for routers, FastEthernet0/1..N for switches

export function internalToVendorIf(internal: string, brand: string): string {
  const n = extractPortIndex(internal)
  switch (brand) {
    case 'Huawei':
      if (internal.startsWith('GigabitEthernet')) return `GigabitEthernet0/0/${n}`
      if (internal.startsWith('FastEthernet')) return `GigabitEthernet0/0/${n}`
      return internal
    case 'Juniper':
      return `ge-0/0/${n}`
    case 'MikroTik':
      return `ether${n + 1}`
    default: // Cisco
      return internal
  }
}

export function vendorToInternalIf(vendor: string, brand: string): string {
  switch (brand) {
    case 'Huawei': {
      // GigabitEthernet0/0/0, GE0/0/0, g0/0/0
      const m = vendor.match(/^(?:GigabitEthernet|GE|g|ge)(\d+)\/(\d+)\/(\d+)$/i)
      if (m) return `GigabitEthernet0/${m[3]}`
      return vendor
    }
    case 'Juniper': {
      // ge-0/0/0, xe-0/0/0, et-0/0/0
      const m = vendor.match(/^(?:ge|xe|et)-(\d+)\/(\d+)\/(\d+)$/)
      if (m) return `GigabitEthernet0/${m[3]}`
      return vendor
    }
    case 'MikroTik': {
      // ether1, ether2, sfp1
      const m = vendor.match(/^(?:ether|sfp)(\d+)$/)
      if (m) return `GigabitEthernet0/${parseInt(m[1]) - 1}`
      return vendor
    }
    default: { // Cisco
      const m = vendor.match(/^(?:GigabitEthernet|Gi|G|GE)(\d+\/\d+)$/i)
      if (m) return `GigabitEthernet${m[1]}`
      const fa = vendor.match(/^(?:FastEthernet|Fa|F)(\d+\/\d+)$/i)
      if (fa) return `FastEthernet${fa[1]}`
      return vendor
    }
  }
}

// For switch ports
export function internalToVendorPort(internal: string, brand: string): string {
  const n = extractPortIndex(internal) // FastEthernet0/1 → index 0 (1-based → 0-based)
  switch (brand) {
    case 'Huawei':  return `GigabitEthernet0/0/${n + 1}`
    case 'Juniper': return `ge-0/0/${n}`
    case 'MikroTik': return `ether${n + 1}`
    default:        return internal  // Cisco: FastEthernet0/1
  }
}

export function vendorToInternalPort(vendor: string, brand: string): string {
  switch (brand) {
    case 'Huawei': {
      const m = vendor.match(/^(?:GigabitEthernet|GE|g)(\d+)\/(\d+)\/(\d+)$/i)
      if (m) return `FastEthernet0/${m[3]}`
      return vendor
    }
    case 'Juniper': {
      const m = vendor.match(/^(?:ge|xe)-(\d+)\/(\d+)\/(\d+)$/)
      if (m) return `FastEthernet0/${m[3]}`
      return vendor
    }
    case 'MikroTik': {
      const m = vendor.match(/^ether(\d+)$/)
      if (m) return `FastEthernet0/${m[1]}`
      return vendor
    }
    default: {
      const fa = vendor.match(/^(?:FastEthernet|Fa|F)(\d+\/\d+)$/i)
      if (fa) return `FastEthernet${fa[1]}`
      return vendor
    }
  }
}

// FastEthernet0/3 → 2 (0-based), GigabitEthernet0/2 → 2
function extractPortIndex(name: string): number {
  const m = name.match(/\/(\d+)$/)
  return m ? parseInt(m[1]) : 0
}

export type { RouterDevice, SwitchDevice, PCDevice }
