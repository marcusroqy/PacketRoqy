import type { BaseDevice, SimulationEngine } from './engine'
import type { ArpEntry, NetworkInterface } from './types'

// Loose view of any device as seen by the terminal UIs: every device type
// shares BaseDevice, the rest depends on whether it is a router, switch or PC.
export type TerminalDevice = BaseDevice & {
  brand?: string
  subtype?: string
  cli?: { mode?: string }
  iface?: NetworkInterface
  interfaces?: Map<string, NetworkInterface>
  arpTable?: Map<string, ArpEntry | { mac: string }>
  getPrompt?(): string
  getBanner?(): string[]
  ping?(target: string): Promise<string[]>
  traceroute?(target: string): Promise<string[]>
}

// Exposed on the main window so detached terminal popups can reach the engine.
export interface PqBridge {
  engine: SimulationEngine
  refreshSnapshot: (id: string) => void
}

declare global {
  interface Window {
    __pqBridge?: PqBridge
  }
}
