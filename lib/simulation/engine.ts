import type { EthernetFrame, PacketLogEntry } from './types'
import { randomId } from './ip-utils'

export type LogCallback = (entry: PacketLogEntry) => void
export type LinkCallback = (fromDevice: string, fromIf: string, toDevice: string, toIf: string, frameType: 'arp' | 'ip') => void

export abstract class BaseDevice {
  engine?: SimulationEngine

  constructor(
    public id: string,
    public type: string,
    public name: string,
  ) {}

  abstract receiveFrame(ifName: string, frame: EthernetFrame): void
  abstract executeCommand(cmd: string): string[]
  getCompletions(_partial: string): string[] { return [] }

  protected sendFrame(ifName: string, frame: EthernetFrame): void {
    this.engine?.deliverFrame(this.id, ifName, frame)
  }

  protected log(entry: Omit<PacketLogEntry, 'id' | 'timestamp'>): void {
    this.engine?.emitLog({
      ...entry,
      id: randomId('log-'),
      timestamp: Date.now(),
    })
  }
}

export class SimulationEngine {
  private devices = new Map<string, BaseDevice>()
  // key: "deviceId:ifName" -> value: "deviceId:ifName"
  private links = new Map<string, string>()
  private queue: Array<{ toDevice: string; ifName: string; frame: EthernetFrame }> = []
  private processing = false
  private logListeners: LogCallback[] = []
  private linkListeners: LinkCallback[] = []

  register(device: BaseDevice): void {
    device.engine = this
    this.devices.set(device.id, device)
  }

  remove(deviceId: string): void {
    this.devices.delete(deviceId)
    const prefix = `${deviceId}:`
    const toDelete = Array.from(this.links.entries())
      .filter(([k, v]) => k.startsWith(prefix) || v.startsWith(prefix))
    for (const [k, v] of toDelete) {
      this.links.delete(k)
      this.links.delete(v)
    }
  }

  addLink(aDevice: string, aIf: string, bDevice: string, bIf: string): void {
    const kA = `${aDevice}:${aIf}`
    const kB = `${bDevice}:${bIf}`
    this.links.set(kA, kB)
    this.links.set(kB, kA)
  }

  removeLink(aDevice: string, aIf: string, bDevice: string, bIf: string): void {
    this.links.delete(`${aDevice}:${aIf}`)
    this.links.delete(`${bDevice}:${bIf}`)
  }

  removeLinkByEndpoint(deviceId: string, ifName: string): void {
    const key = `${deviceId}:${ifName}`
    const other = this.links.get(key)
    if (other) {
      this.links.delete(key)
      this.links.delete(other)
    }
  }

  getLinkedEndpoint(deviceId: string, ifName: string): { deviceId: string; ifName: string } | null {
    const v = this.links.get(`${deviceId}:${ifName}`)
    if (!v) return null
    const [d, i] = v.split(':')
    return { deviceId: d, ifName: i }
  }

  deliverFrame(fromDevice: string, fromIf: string, frame: EthernetFrame): void {
    const v = this.links.get(`${fromDevice}:${fromIf}`)
    if (!v) return
    const [toDevice, toIf] = v.split(':')
    const frameType = frame.etherType === 0x0806 ? 'arp' : 'ip'
    for (const cb of this.linkListeners) cb(fromDevice, fromIf, toDevice, toIf, frameType)
    this.queue.push({ toDevice, ifName: toIf, frame })
    this.processQueue()
  }

  private processQueue(): void {
    if (this.processing) return
    this.processing = true
    while (this.queue.length > 0) {
      const ev = this.queue.shift()!
      const dev = this.devices.get(ev.toDevice)
      dev?.receiveFrame(ev.ifName, ev.frame)
    }
    this.processing = false
  }

  getDevice<T extends BaseDevice>(id: string): T | undefined {
    return this.devices.get(id) as T | undefined
  }

  onLog(cb: LogCallback): () => void {
    this.logListeners.push(cb)
    return () => { this.logListeners = this.logListeners.filter(l => l !== cb) }
  }

  onLinkActivity(cb: LinkCallback): () => void {
    this.linkListeners.push(cb)
    return () => { this.linkListeners = this.linkListeners.filter(l => l !== cb) }
  }

  emitLog(entry: PacketLogEntry): void {
    for (const cb of this.logListeners) cb(entry)
  }
}
