'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Node, Edge } from '@xyflow/react'
import { SimulationEngine } from '../simulation/engine'
import { RouterDevice } from '../simulation/devices/router'
import { SwitchDevice } from '../simulation/devices/switch'
import { PCDevice } from '../simulation/devices/pc'
import type { PacketLogEntry, DeviceSnapshot } from '../simulation/types'
import { randomId, prefixLenToMask } from '../simulation/ip-utils'

export interface PCNetworkConfig {
  ip?: string
  prefixLen?: number
  gateway?: string
  dns?: string
}

export type DeviceNodeData = {
  deviceId: string
  deviceType: 'router' | 'switch' | 'pc' | 'server'
  label: string
  brand?: string
  model?: string
}

export const engine = new SimulationEngine()

function restoreEngine(
  snapshots: Record<string, DeviceSnapshot>,
  nodes: Node<DeviceNodeData>[],
  edges: Edge[]
): void {
  for (const snap of Object.values(snapshots)) {
    if (snap.type === 'router') {
      const d = new RouterDevice(snap.id, snap.name, snap.interfaces.length, snap.brand)
      d.restoreState(snap)
      engine.register(d)
    } else if (snap.type === 'switch') {
      const d = new SwitchDevice(snap.id, snap.name, snap.portCount, snap.brand)
      d.restoreState(snap)
      engine.register(d)
    } else {
      const d = new PCDevice(snap.id, snap.name, snap.brand, snap.subtype)
      d.restoreState(snap)
      engine.register(d)
    }
  }
  for (const edge of edges) {
    const srcNode = nodes.find(n => n.id === edge.source)
    const tgtNode = nodes.find(n => n.id === edge.target)
    if (!srcNode || !tgtNode) continue
    const srcIf = edge.sourceHandle?.replace(`${srcNode.data.deviceId}::`, '') ?? ''
    const tgtIf = edge.targetHandle?.replace(`${tgtNode.data.deviceId}::`, '') ?? ''
    if (srcIf && tgtIf) engine.addLink(srcNode.data.deviceId, srcIf, tgtNode.data.deviceId, tgtIf)
  }
}

function takeDeviceSnapshot(deviceId: string): DeviceSnapshot | null {
  const dev = engine.getDevice(deviceId)
  if (!dev) return null
  if (dev instanceof RouterDevice) return dev.takeSnapshot(deviceId)
  if (dev instanceof SwitchDevice) return dev.takeSnapshot(deviceId)
  if (dev instanceof PCDevice)     return dev.takeSnapshot(deviceId)
  return null
}

export type EdgeActivityEntry = { fwdTs: number; revTs: number; frameType: 'arp' | 'ip' }

interface NetworkStore {
  nodes: Node<DeviceNodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  packetLog: PacketLogEntry[]
  terminalOutputs: Record<string, string[]>
  deviceSnapshots: Record<string, DeviceSnapshot>
  deviceCounters: Record<string, number>
  edgeActivity: Record<string, EdgeActivityEntry>
  cableMode: boolean

  setNodes: (nodes: Node<DeviceNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  setSelectedNodeId: (id: string | null) => void
  setCableMode: (active: boolean) => void

  addDevice: (type: 'router' | 'switch' | 'pc' | 'server', position: { x: number; y: number }, brand?: string, model?: string, ports?: number, pcConfig?: PCNetworkConfig) => void
  removeDevice: (nodeId: string) => void
  addEdge: (edge: Edge) => void
  removeEdge: (edgeId: string) => void

  appendTerminalLine: (deviceId: string, line: string) => void
  executeCommand: (deviceId: string, cmd: string) => Promise<void>
  refreshSnapshot: (deviceId: string) => void
  renameDevice: (nodeId: string, newName: string) => void
  clearLog: () => void
}

// Keep cleanup refs to avoid duplicate listener registration (React Strict Mode)
let _unsubLog: (() => void) | null = null
let _unsubLink: (() => void) | null = null

function attachEngineListeners(
  set: (updater: (s: NetworkStore) => Partial<NetworkStore>) => void,
  get: () => NetworkStore,
) {
  if (_unsubLog)  { _unsubLog();  _unsubLog  = null }
  if (_unsubLink) { _unsubLink(); _unsubLink = null }

  _unsubLog = engine.onLog((entry) => {
    set(s => ({ packetLog: [entry, ...s.packetLog].slice(0, 200) }))
  })

  _unsubLink = engine.onLinkActivity((fromDevice, fromIf, toDevice, toIf, frameType) => {
    const { edges } = get()
    const a = `${fromDevice}::${fromIf}`
    const b = `${toDevice}::${toIf}`
    const edge = edges.find(e => {
      const sh = e.sourceHandle ?? ''
      const th = e.targetHandle ?? ''
      return (sh === a && th === b) || (sh === b && th === a)
    })
    if (edge) {
      const isForward = edge.sourceHandle === a
      const now = Date.now()
      set(s => {
        const prev = s.edgeActivity[edge.id]
        return {
          edgeActivity: {
            ...s.edgeActivity,
            [edge.id]: {
              fwdTs: isForward ? now : (prev?.fwdTs ?? 0),
              revTs: isForward ? (prev?.revTs ?? 0) : now,
              frameType,
            },
          },
        }
      })
    }
  })
}

export const useNetworkStore = create<NetworkStore>()(
  persist(
    (set, get) => {
      attachEngineListeners(set as Parameters<typeof attachEngineListeners>[0], get)

      return {
        nodes: [],
        edges: [],
        selectedNodeId: null,
        packetLog: [],
        terminalOutputs: {},
        deviceSnapshots: {},
        deviceCounters: { router: 0, switch: 0, pc: 0, server: 0 },
        edgeActivity: {},
        cableMode: false,

        setNodes: (nodes) => set({ nodes }),
        setEdges: (edges) => set({ edges }),
        setSelectedNodeId: (id) => set({ selectedNodeId: id }),
        setCableMode: (active) => set({ cableMode: active }),

        addDevice: (type, position, brand?, model?, ports?, pcConfig?) => {
          const counters = { ...get().deviceCounters }
          counters[type]++
          const prefix = { router: 'Router', switch: 'Switch', pc: 'PC', server: 'Server' }[type]
          const label = model ?? `${prefix}${counters[type]}`
          const id = randomId('node-')
          const deviceId = randomId('dev-')

          let device: RouterDevice | SwitchDevice | PCDevice
          if (type === 'router') {
            device = new RouterDevice(deviceId, label, ports ?? 4, brand ?? 'Cisco')
          } else if (type === 'switch') {
            device = new SwitchDevice(deviceId, label, ports ?? 8, brand ?? 'Cisco')
          } else {
            device = new PCDevice(deviceId, label, brand ?? 'Dell', type as 'pc' | 'server')
          }
          engine.register(device)

          if ((type === 'pc' || type === 'server') && pcConfig?.ip && pcConfig.prefixLen != null) {
            const mask = prefixLenToMask(pcConfig.prefixLen)
            device.executeCommand(`ip ${pcConfig.ip} ${mask}${pcConfig.gateway ? ` ${pcConfig.gateway}` : ''}`)
          }

          const snap = takeDeviceSnapshot(deviceId)!
          const node: Node<DeviceNodeData> = {
            id,
            type: 'device',
            position,
            data: { deviceId, deviceType: type, label, brand, model },
          }

          set(s => ({
            nodes: [...s.nodes, node],
            deviceCounters: counters,
            deviceSnapshots: { ...s.deviceSnapshots, [deviceId]: snap },
            terminalOutputs: {
              ...s.terminalOutputs,
              [deviceId]: [getWelcomeMessage(type, brand ?? '', label)],
            },
          }))
        },

        removeDevice: (nodeId) => {
          const node = get().nodes.find(n => n.id === nodeId)
          if (!node) return
          const { deviceId } = node.data
          engine.remove(deviceId)
          const edgesToRemove = get().edges.filter(e => e.source === nodeId || e.target === nodeId)
          for (const edge of edgesToRemove) {
            const [srcDevId, srcIf] = (edge.sourceHandle ?? '').split('::')
            const [tgtDevId, tgtIf] = (edge.targetHandle ?? '').split('::')
            if (srcDevId && srcIf && tgtDevId && tgtIf) engine.removeLink(srcDevId, srcIf, tgtDevId, tgtIf)
          }
          set(s => {
            const { [deviceId]: _snap, ...snapshots } = s.deviceSnapshots
            const { [deviceId]: _term, ...terminalOutputs } = s.terminalOutputs
            return {
              nodes: s.nodes.filter(n => n.id !== nodeId),
              edges: s.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
              deviceSnapshots: snapshots,
              terminalOutputs,
            }
          })
        },

        addEdge: (edge) => {
          const nodes = get().nodes
          const srcNode = nodes.find(n => n.id === edge.source)
          const tgtNode = nodes.find(n => n.id === edge.target)
          if (!srcNode || !tgtNode) return

          const srcIf = edge.sourceHandle?.replace(`${srcNode.data.deviceId}::`, '') ?? ''
          const tgtIf = edge.targetHandle?.replace(`${tgtNode.data.deviceId}::`, '') ?? ''

          if (!srcIf || !tgtIf) return
          if (get().edges.some(e => e.sourceHandle === edge.sourceHandle || e.targetHandle === edge.targetHandle || e.sourceHandle === edge.targetHandle || e.targetHandle === edge.sourceHandle)) return

          engine.addLink(srcNode.data.deviceId, srcIf, tgtNode.data.deviceId, tgtIf)
          set(s => ({ edges: [...s.edges, { ...edge, id: randomId('edge-') }] }))
        },

        removeEdge: (edgeId) => {
          const edge = get().edges.find(e => e.id === edgeId)
          if (!edge) return
          const nodes = get().nodes
          const srcNode = nodes.find(n => n.id === edge.source)
          const tgtNode = nodes.find(n => n.id === edge.target)
          if (srcNode && tgtNode) {
            const srcIf = edge.sourceHandle?.replace(`${srcNode.data.deviceId}::`, '') ?? ''
            const tgtIf = edge.targetHandle?.replace(`${tgtNode.data.deviceId}::`, '') ?? ''
            engine.removeLink(srcNode.data.deviceId, srcIf, tgtNode.data.deviceId, tgtIf)
          }
          set(s => ({ edges: s.edges.filter(e => e.id !== edgeId) }))
        },

        appendTerminalLine: (deviceId, line) => {
          set(s => ({
            terminalOutputs: {
              ...s.terminalOutputs,
              [deviceId]: [...(s.terminalOutputs[deviceId] ?? []), line],
            },
          }))
        },

        executeCommand: async (deviceId, cmd) => {
          const dev = engine.getDevice(deviceId)
          if (!dev) return
          const { appendTerminalLine } = get()

          const result = dev.executeCommand(cmd)
          for (const line of result) {
            if (line.startsWith('__ASYNC_PING__')) {
              const target = line.slice(14)
              appendTerminalLine(deviceId, `Pinging ${target}...`)
              let lines: string[]
              if (dev.type === 'router') {
                lines = await (dev as RouterDevice).ping(target)
              } else {
                lines = await (dev as PCDevice).ping(target)
              }
              for (const l of lines) appendTerminalLine(deviceId, l)
            } else if (line.startsWith('__ASYNC_TRACE__')) {
              const target = line.slice(15)
              appendTerminalLine(deviceId, `Tracing route to ${target}...`)
              let lines: string[]
              if (dev.type === 'router') {
                lines = await (dev as RouterDevice).traceroute(target)
              } else {
                appendTerminalLine(deviceId, 'traceroute not supported on this device type')
                lines = []
              }
              for (const l of lines) appendTerminalLine(deviceId, l)
            } else {
              appendTerminalLine(deviceId, line)
            }
          }

          const snap = takeDeviceSnapshot(deviceId)
          if (snap) set(s => ({ deviceSnapshots: { ...s.deviceSnapshots, [deviceId]: snap } }))
        },

        refreshSnapshot: (deviceId) => {
          const snap = takeDeviceSnapshot(deviceId)
          if (snap) set(s => ({ deviceSnapshots: { ...s.deviceSnapshots, [deviceId]: snap } }))
        },

        renameDevice: (nodeId, newName) => {
          const trimmed = newName.trim()
          if (!trimmed) return
          const node = get().nodes.find(n => n.id === nodeId)
          if (!node) return
          const { deviceId } = node.data
          // Update engine device name
          const dev = engine.getDevice(deviceId)
          if (dev) dev.name = trimmed
          // Update node label + snapshot
          const snap = takeDeviceSnapshot(deviceId)
          set(s => ({
            nodes: s.nodes.map(n =>
              n.id === nodeId ? { ...n, data: { ...n.data, label: trimmed } } : n
            ),
            deviceSnapshots: snap
              ? { ...s.deviceSnapshots, [deviceId]: snap }
              : s.deviceSnapshots,
          }))
        },

        clearLog: () => set({ packetLog: [] }),
      }
    },
    {
      name: 'packetroqy-network',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        nodes: s.nodes,
        edges: s.edges,
        deviceSnapshots: s.deviceSnapshots,
        deviceCounters: s.deviceCounters,
        terminalOutputs: s.terminalOutputs,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return
        // Restore simulation engine devices & links from persisted state
        restoreEngine(state.deviceSnapshots, state.nodes, state.edges)
        // Re-attach listeners (they may have been set up before rehydration)
        // This ensures the edgeActivity updates flow correctly post-restore
        attachEngineListeners(
          useNetworkStore.setState as Parameters<typeof attachEngineListeners>[0],
          useNetworkStore.getState,
        )
      },
    }
  )
)

function getWelcomeMessage(type: string, brand: string, name: string): string {
  if (type === 'router') {
    if (brand === 'Huawei')   return `\r\nInfo: The max number of VTY users is 5, and the current number of VTY users on line is 1.\r\n\r\n<${name}>`
    if (brand === 'Juniper')  return `\r\n--- JUNOS 23.4R1 ---\r\n${name}> `
    if (brand === 'MikroTik') return `\r\nMikroTik RouterOS v7.14  (c) 1999-2024       https://www.mikrotik.com/\r\n\r\n[admin@${name}] > `
    return `\r\nUser Access Verification\r\n\r\n${name}>`
  }
  if (type === 'switch') {
    if (brand === 'Huawei')   return `\r\n<${name}>`
    if (brand === 'Juniper')  return `\r\n${name}> `
    if (brand === 'MikroTik') return `\r\n[admin@${name}] > `
    return `\r\n${name}>\r\nType 'enable' to enter privileged mode. Type '?' for help.\r\n${name}>`
  }
  if (type === 'server') {
    return `\r\n[root@${name} ~]# `
  }
  if (brand === 'Apple') return `\r\nLast login: Sat Jan  1 00:00:00 on ttys000\r\n${name}@mac ~ % `
  return `\r\nMicrosoft Windows [Version 11.0.26100]\r\n(c) Microsoft Corporation. All rights reserved.\r\n\r\nC:\\Users\\User> `
}
