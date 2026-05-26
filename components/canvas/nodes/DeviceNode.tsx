'use client'
import { memo, type ComponentType } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { DEVICE_PREVIEW } from '@/components/icons/DeviceIcons'
import type { DeviceNodeData } from '@/lib/store/network'
import { engine, useNetworkStore } from '@/lib/store/network'
import type { RouterDevice } from '@/lib/simulation/devices/router'
import type { SwitchDevice } from '@/lib/simulation/devices/switch'
import type { RouterSnapshot, PCSnapshot } from '@/lib/simulation/types'

export type DeviceFlowNode = Node<DeviceNodeData, 'device'>

function getInterfaces(deviceId: string, deviceType: DeviceNodeData['deviceType']): string[] {
  const dev = engine.getDevice(deviceId)
  if (!dev) return []
  if (deviceType === 'router') return Array.from((dev as RouterDevice).interfaces.keys())
  if (deviceType === 'switch') return (dev as SwitchDevice).ports
  if (deviceType === 'pc' || deviceType === 'server') return ['eth0']
  return []
}

function getDisplayIp(snap: ReturnType<typeof useNetworkStore.getState>['deviceSnapshots'][string] | undefined): string | null {
  if (!snap) return null
  if (snap.type === 'router') {
    const iface = (snap as RouterSnapshot).interfaces.find(i => i.ip && i.status === 'up')
      ?? (snap as RouterSnapshot).interfaces.find(i => i.ip)
    return iface?.ip ?? null
  }
  if (snap.type === 'pc' || snap.type === 'server') return (snap as PCSnapshot).iface.ip ?? null
  return null
}

function getLedStatus(snap: ReturnType<typeof useNetworkStore.getState>['deviceSnapshots'][string] | undefined): 'up' | 'down' | 'na' {
  if (!snap) return 'na'
  if (snap.type === 'router') return (snap as RouterSnapshot).interfaces.some(i => i.status === 'up') ? 'up' : 'down'
  if (snap.type === 'pc' || snap.type === 'server') return (snap as PCSnapshot).iface.status
  return 'up'
}

// ─── Canvas node ─────────────────────────────────────────────────────────────

const CENTER: React.CSSProperties = {
  left: '50%',
  top:  '50%',
  transform: 'translate(-50%, -50%)',
}

function DeviceNodeInner({ data, selected }: NodeProps<DeviceFlowNode>) {
  const { deviceId, deviceType, label, brand, model } = data

  const snap      = useNetworkStore(s => s.deviceSnapshots[deviceId])
  const displayIp = getDisplayIp(snap)
  const ledStatus = getLedStatus(snap)

  const interfaces = getInterfaces(deviceId, deviceType)
  const PreviewIcon = DEVICE_PREVIEW[deviceType]

  // Dimension mapping based on device type and model
  // Tower servers and desktops stand vertically, mini devices are compact squares
  const isTower = model?.includes('T550') || model?.includes('ML350') || model?.includes('IdeaCentre') || model?.includes('OptiPlex')
  const isMini = model?.includes('mini') || model?.includes('M70q')
  const isAIO = model?.includes('iMac')
  const isRack = deviceType === 'router' || deviceType === 'switch' || deviceType === 'server'

  let widthClass = 'w-[110px]'
  if (isRack) {
    widthClass = isTower ? 'w-[75px]' : 'w-[150px]'
  } else if (isTower) {
    widthClass = 'w-[75px]'
  } else if (isMini) {
    widthClass = 'w-[70px]'
  } else if (isAIO) {
    widthClass = 'w-[130px]'
  }

  return (
    <div className="relative flex flex-col items-center select-none group" style={{ perspective: '1000px' }}>

      {/* ── Dynamic Ambient Glow ── */}
      <div
        className={[
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px] pointer-events-none transition-all duration-500',
          selected ? 'w-36 h-36 bg-cyan-500/30 opacity-100' :
          ledStatus === 'up' ? 'w-28 h-28 bg-green-500/15 opacity-70 group-hover:bg-green-500/25 group-hover:scale-125' :
          'w-24 h-24 bg-gray-500/10 opacity-30',
        ].join(' ')}
      />

      {/* ── Realistic Device Icon with 3D Hover ── */}
      <div
        className={[
          'relative cursor-pointer transition-all duration-300 ease-out flex flex-col items-center justify-center',
          widthClass,
          selected 
            ? 'scale-110 drop-shadow-[0_12px_30px_rgba(59,130,246,0.6)] z-20' 
            : 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] group-hover:scale-105 group-hover:-translate-y-2 group-hover:drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] z-10',
        ].join(' ')}
        style={selected ? {} : { transformStyle: 'preserve-3d' }}
      >
        {/* Selection ring / border highlight */}
        {selected && (
          <div className="absolute -inset-3 rounded-sm border border-cyan-400/40 bg-gradient-to-b from-cyan-500/8 to-transparent pointer-events-none" />
        )}

        {/* The actual realistic equipment SVG */}
        <div className="relative z-10 w-full h-auto will-change-transform group-hover:brightness-110 transition-all duration-300">
          <PreviewIcon brand={brand} model={model} className="w-full h-auto" />
          
          {/* Glass glare effect overlaid on the device */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 pointer-events-none rounded transition-opacity duration-500" />
        </div>

        {/* Floor Reflection (Pseudo-3D) */}
        {!selected && (
          <div className="absolute -bottom-4 w-[85%] h-2.5 bg-black/50 blur-[5px] rounded-full opacity-60 group-hover:opacity-20 group-hover:w-[70%] group-hover:translate-y-5 transition-all duration-300 pointer-events-none" />
        )}

        {/* Premium Status LED indicator */}
        {ledStatus !== 'na' && (
          <span
            className={[
              'absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border border-gray-900/80 z-30 shadow-[0_0_12px_rgba(0,0,0,0.6)]',
              ledStatus === 'up' ? 'bg-green-400 shadow-[0_0_15px_#4ade80] led-pulse' : 'bg-red-500 shadow-[0_0_10px_#ef4444]',
            ].join(' ')}
            title={ledStatus === 'up' ? 'Interface up' : 'Interface down'}
          />
        )}

        {/* Per-interface handles (invisible, used by ReactFlow for edge endpoints) */}
        {interfaces.map(ifName => (
          <Handle
            key={`${deviceId}::${ifName}`}
            id={`${deviceId}::${ifName}`}
            type="source"
            position={Position.Top}
            style={{ ...CENTER, width: 8, height: 8, opacity: 0, pointerEvents: 'none' }}
          />
        ))}

        {/* Drag handle */}
        <Handle
          id={`${deviceId}::drag`}
          type="source"
          position={Position.Top}
          style={{ ...CENTER, width: 40, height: 40, opacity: 0, zIndex: 20 }}
          className="hover:!opacity-100 !bg-blue-400 !border-2 !border-white !transition-opacity !rounded-full"
        />
      </div>

      {/* ── NOC Labels ── */}
      <div className="mt-5 flex flex-col items-center gap-1 transition-transform duration-300 group-hover:translate-y-0.5">
        <span className="node-name-badge">{label}</span>
        {displayIp && <span className="node-ip-badge">{displayIp}</span>}
      </div>
    </div>
  )
}

export const DeviceNode = memo(DeviceNodeInner)
