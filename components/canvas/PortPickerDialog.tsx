'use client'
import { useState } from 'react'
import { Cable, X, Wifi } from 'lucide-react'
import type { Node, Edge } from '@xyflow/react'
import { engine } from '@/lib/store/network'
import type { DeviceNodeData } from '@/lib/store/network'
import type { RouterDevice } from '@/lib/simulation/devices/router'
import type { SwitchDevice } from '@/lib/simulation/devices/switch'

function getDevicePorts(deviceId: string, deviceType: DeviceNodeData['deviceType']): string[] {
  const dev = engine.getDevice(deviceId)
  if (!dev) return []
  if (deviceType === 'router') return Array.from((dev as RouterDevice).interfaces.keys())
  if (deviceType === 'switch') return (dev as SwitchDevice).ports
  return ['eth0']
}

function getFreePorts(node: Node<DeviceNodeData>, edges: Edge[]): string[] {
  const { deviceId, deviceType } = node.data
  const all = getDevicePorts(deviceId, deviceType)
  const usedIfs = new Set<string>()
  for (const e of edges) {
    if (e.source === node.id) usedIfs.add(e.sourceHandle?.split('::')[1] ?? '')
    if (e.target === node.id) usedIfs.add(e.targetHandle?.split('::')[1] ?? '')
  }
  return all.filter(p => !usedIfs.has(p))
}

export interface PendingConnection {
  sourceNode: Node<DeviceNodeData>
  targetNode: Node<DeviceNodeData>
  /** handle ID already chosen by the drag (e.g. "devXYZ::GigabitEthernet0/0") */
  rawSourceHandle: string | null
  rawTargetHandle: string | null
}

interface Props {
  pending: PendingConnection
  edges: Edge[]
  onConfirm: (sourceHandle: string, targetHandle: string) => void
  onCancel: () => void
}

function shortPort(p: string): string {
  return p
    .replace('GigabitEthernet', 'Gi')
    .replace('FastEthernet', 'Fa')
    .replace('TenGigabitEthernet', 'Te')
    .replace('HundredGigE', 'Hu')
    .replace('Management', 'Mgmt')
}

function PortGrid({
  label,
  deviceLabel,
  deviceType,
  ports,
  value,
  onChange,
}: {
  label: string
  deviceLabel: string
  deviceType: DeviceNodeData['deviceType']
  ports: string[]
  value: string
  onChange: (v: string) => void
}) {
  const cols = ports.length > 12 ? 'grid-cols-3' : ports.length > 5 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-white truncate">{deviceLabel}</span>
      </div>

      {ports.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/30 rounded-xl px-3 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          No free ports
        </div>
      ) : (
        <div className={`grid ${cols} gap-1 max-h-40 overflow-y-auto pr-0.5 scrollbar-thin`}>
          {ports.map(p => {
            const active = value === p
            return (
              <button
                key={p}
                onClick={() => onChange(p)}
                title={p}
                className={[
                  'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-150 truncate text-left',
                  active
                    ? 'bg-blue-600 text-white border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                    : 'bg-gray-800/70 text-gray-300 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600/60 hover:text-white',
                ].join(' ')}
              >
                <Wifi className={`w-3 h-3 shrink-0 ${active ? 'text-white' : 'text-green-400'}`} />
                <span className="truncate">{shortPort(p)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PortPickerDialog({ pending, edges, onConfirm, onCancel }: Props) {
  const { sourceNode, targetNode, rawSourceHandle, rawTargetHandle } = pending

  const srcPorts = getFreePorts(sourceNode, edges)
  const tgtPorts = getFreePorts(targetNode, edges)

  const preSource = rawSourceHandle?.split('::')[1]
  const preTarget = rawTargetHandle?.split('::')[1]

  const [srcPort, setSrcPort] = useState(
    preSource && srcPorts.includes(preSource) ? preSource : (srcPorts[0] ?? ''),
  )
  const [tgtPort, setTgtPort] = useState(
    preTarget && tgtPorts.includes(preTarget) ? preTarget : (tgtPorts[0] ?? ''),
  )

  const canConnect = srcPort && tgtPort && srcPorts.length > 0 && tgtPorts.length > 0

  function handleConfirm() {
    if (!canConnect) return
    onConfirm(
      `${sourceNode.data.deviceId}::${srcPort}`,
      `${targetNode.data.deviceId}::${tgtPort}`,
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#0d1117] border border-gray-700/60 rounded-2xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] p-5 w-[440px] flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Cable className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-white">Connect Cable</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connection path preview */}
        <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700/40 rounded-xl px-4 py-3">
          <div className="flex flex-col items-center min-w-0 flex-1 text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">From</span>
            <span className="text-xs font-bold text-white truncate w-full">{sourceNode.data.label}</span>
            <span className="text-[10px] font-mono text-blue-400 mt-0.5 truncate w-full">
              {srcPort ? shortPort(srcPort) : '—'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 px-1">
            <div className="w-5 h-px bg-gradient-to-r from-transparent to-green-500/60" />
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="w-5 h-px bg-gradient-to-l from-transparent to-green-500/60" />
          </div>

          <div className="flex flex-col items-center min-w-0 flex-1 text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">To</span>
            <span className="text-xs font-bold text-white truncate w-full">{targetNode.data.label}</span>
            <span className="text-[10px] font-mono text-blue-400 mt-0.5 truncate w-full">
              {tgtPort ? shortPort(tgtPort) : '—'}
            </span>
          </div>
        </div>

        <div className="h-px bg-gray-800/80" />

        {/* Port pickers — side by side */}
        <div className="grid grid-cols-2 gap-4">
          <PortGrid
            label="Source Port"
            deviceLabel={sourceNode.data.label}
            deviceType={sourceNode.data.deviceType}
            ports={srcPorts}
            value={srcPort}
            onChange={setSrcPort}
          />
          <PortGrid
            label="Dest Port"
            deviceLabel={targetNode.data.label}
            deviceType={targetNode.data.deviceType}
            ports={tgtPorts}
            value={tgtPort}
            onChange={setTgtPort}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-xl bg-gray-800/60 text-gray-400 text-sm hover:bg-gray-700/60 hover:text-gray-200 border border-gray-700/40 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canConnect}
            onClick={handleConfirm}
            className="flex-1 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}
