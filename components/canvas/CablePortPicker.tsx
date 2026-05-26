'use client'
import { useState } from 'react'
import { Cable, ArrowRight, X, Wifi } from 'lucide-react'
import type { Node, Edge } from '@xyflow/react'
import { engine } from '@/lib/store/network'
import type { DeviceNodeData } from '@/lib/store/network'
import type { RouterDevice } from '@/lib/simulation/devices/router'
import type { SwitchDevice } from '@/lib/simulation/devices/switch'

function getFreePorts(node: Node<DeviceNodeData>, edges: Edge[]): string[] {
  const { deviceId, deviceType } = node.data
  const dev = engine.getDevice(deviceId)
  if (!dev) return []

  let all: string[]
  if (deviceType === 'router') all = Array.from((dev as RouterDevice).interfaces.keys())
  else if (deviceType === 'switch') all = (dev as SwitchDevice).ports
  else all = ['eth0']

  const usedIfs = new Set<string>()
  for (const e of edges) {
    if (e.source === node.id) usedIfs.add(e.sourceHandle?.split('::')[1] ?? '')
    if (e.target === node.id) usedIfs.add(e.targetHandle?.split('::')[1] ?? '')
  }
  return all.filter(p => !usedIfs.has(p))
}

function shortPort(p: string): string {
  return p
    .replace('GigabitEthernet', 'Gi')
    .replace('FastEthernet', 'Fa')
    .replace('TenGigabitEthernet', 'Te')
    .replace('HundredGigE', 'Hu')
    .replace('Management', 'Mgmt')
}

interface Props {
  node: Node<DeviceNodeData>
  edges: Edge[]
  step: 1 | 2
  sourceLabel?: string
  sourcePort?: string
  onConfirm: (port: string) => void
  onCancel: () => void
}

export function CablePortPicker({ node, edges, step, sourceLabel, sourcePort, onConfirm, onCancel }: Props) {
  const ports = getFreePorts(node, edges)
  const [selected, setSelected] = useState(ports[0] ?? '')

  const gridCols = ports.length > 12 ? 'grid-cols-3' : ports.length > 5 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#0d1117] border border-gray-700/60 rounded-2xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] p-5 w-80 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${step === 1 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
              <Cable className={`w-4 h-4 ${step === 1 ? 'text-blue-400' : 'text-green-400'}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {step === 1 ? 'Cable Origin' : 'Cable Destination'}
              </span>
              <span className="text-[10px] text-gray-500">
                Step {step} of 2
              </span>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 2: show source → dest context */}
        {step === 2 && sourceLabel && (
          <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700/40 rounded-xl px-3 py-2.5 text-xs">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-gray-500 mb-0.5">From</span>
              <span className="text-white font-semibold truncate">{sourceLabel}</span>
              {sourcePort && <span className="text-green-400 font-mono text-[10px]">{shortPort(sourcePort)}</span>}
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-gray-500 mb-0.5">To</span>
              <span className="text-blue-300 font-semibold truncate">{node.data.label}</span>
              {selected && <span className="text-blue-400 font-mono text-[10px]">{shortPort(selected)}</span>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-gray-900/50 border border-gray-700/40 rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-gray-500">Device</span>
            <div className="text-xs font-semibold text-white mt-0.5">{node.data.label}</div>
          </div>
        )}

        <div className="h-px bg-gray-800/80" />

        {/* Port grid */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            {step === 1 ? 'Select source port' : 'Select destination port'}
            <span className="ml-1.5 text-gray-600 normal-case font-normal">
              {ports.length} free
            </span>
          </span>

          {ports.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/30 rounded-xl px-3 py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              No free ports available
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-1 max-h-48 overflow-y-auto`}>
              {ports.map(p => {
                const active = selected === p
                return (
                  <button
                    key={p}
                    onClick={() => setSelected(p)}
                    title={p}
                    className={[
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-150 truncate text-left',
                      active
                        ? 'bg-blue-600 text-white border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                        : 'bg-gray-800/70 text-gray-300 border border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 hover:text-white',
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

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-xl bg-gray-800/60 text-gray-400 text-sm hover:bg-gray-700/60 hover:text-gray-200 border border-gray-700/40 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selected || ports.length === 0}
            onClick={() => selected && onConfirm(selected)}
            className={[
              'flex-1 px-3 py-2 rounded-xl text-white text-sm font-semibold border transition-all',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              step === 1
                ? 'bg-blue-600 hover:bg-blue-500 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                : 'bg-green-600 hover:bg-green-500 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.25)]',
            ].join(' ')}
          >
            {step === 1 ? 'Next →' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}
