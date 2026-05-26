'use client'
import { useCallback, useEffect, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Cable, HelpCircle } from 'lucide-react'
import { TopologyLogo, DEVICE_ICON } from '@/components/icons/DeviceIcons'
import { useNetworkStore, engine } from '@/lib/store/network'
import { ProjectSelector } from '@/components/header/ProjectSelector'
import { NetworkCanvas } from '@/components/canvas/NetworkCanvas'
import { DevicePanel } from '@/components/panels/DevicePanel'
import { PacketLog } from '@/components/panels/PacketLog'
import { DevicePicker } from '@/components/modals/DevicePicker'
import { FloatingTerminalManager } from '@/components/terminal/FloatingTerminal'
import type { DeviceType } from '@/lib/simulation/types'
import type { DeviceModel } from '@/lib/simulation/catalog'
import type { PCNetworkConfig } from '@/lib/store/network'

const DEVICE_BTNS: Array<{ type: DeviceType; label: string }> = [
  { type: 'router', label: 'ROUTER' },
  { type: 'switch', label: 'SWITCH' },
  { type: 'pc',     label: 'PC'     },
  { type: 'server', label: 'SERVER' },
]

function StatPill({ label, variant }: { label: string; variant: 'cyan' | 'green' }) {
  const { nodes, edges } = useNetworkStore()
  const value = variant === 'cyan' ? nodes.length : edges.length
  return (
    <div className="stat-pill flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 stat-dot-${variant}`} />
      <span className={`text-[10px] tracking-[0.12em] stat-lbl`}>{label}</span>
      <span className={`text-[12px] font-bold tabular-nums stat-val-${variant}`}>{value}</span>
    </div>
  )
}

export default function Home() {
  const { addDevice, selectedNodeId, cableMode, setCableMode } = useNetworkStore()
  const [pickerType, setPickerType] = useState<DeviceType | null>(null)

  useEffect(() => {
    ;(window as any).__pqBridge = {
      engine,
      refreshSnapshot: (id: string) => useNetworkStore.getState().refreshSnapshot(id),
    }
  }, [])

  const handleConfirm = useCallback(
    (model: DeviceModel, pcConfig?: PCNetworkConfig) => {
      if (!pickerType) return
      const jitter = () => 80 + Math.random() * 260
      addDevice(pickerType, { x: jitter(), y: jitter() }, model.brand, model.model, model.ports, pcConfig)
      setPickerType(null)
    },
    [pickerType, addDevice],
  )

  return (
    <ReactFlowProvider>
      <div className="noc-app flex flex-col h-screen overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="noc-header relative flex items-center h-10 px-4 shrink-0 overflow-hidden">

          {/* Scan line across bottom border */}
          <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none overflow-hidden">
            <div className="noc-scanline noc-scan-grad absolute top-0 h-full w-24" />
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
            <TopologyLogo className="noc-logo-icon w-4 h-4 flex-shrink-0" />
            <span className="noc-logo-text font-bold text-[13px] tracking-[0.2em] uppercase">
              PacketRoqy
            </span>
            <span className="noc-logo-ver text-[9px] px-1.5 py-px tracking-widest">
              v1.0
            </span>
          </div>

          <div className="noc-vdivider mx-4 h-4 w-px flex-shrink-0" />

          {/* Live stats */}
          <div className="flex items-center gap-2">
            <StatPill label="NODES" variant="cyan" />
            <StatPill label="LINKS" variant="green" />
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            <ProjectSelector />
            <span className="noc-hint hidden xl:block text-[9px] tracking-wider mr-1">
              CABO → selecione dispositivos · DELETE remove
            </span>

            <button
              type="button"
              onClick={() => setCableMode(!cableMode)}
              className={`noc-cable-btn${cableMode ? ' active' : ''}`}
            >
              <Cable className="w-3.5 h-3.5 flex-shrink-0" />
              Cabo
            </button>

            <button
              type="button"
              title="Ajuda"
              className="noc-help-btn"
              onClick={() => alert(
                'PacketRoqy — Como usar:\n\n' +
                'CONECTAR:\n  1. Botão Cabo\n  2. Clique origem → escolha porta\n  3. Clique destino → escolha porta\n  Esc cancela\n\n' +
                'ADICIONAR:\n  Botões na paleta inferior\n\n' +
                'ROUTER CLI:\n  enable → configure terminal\n  interface Gi0/0\n  ip address 192.168.1.1 255.255.255.0\n  no shutdown\n  ping 192.168.1.2\n\n' +
                'PC:\n  ip 192.168.1.10 255.255.255.0 192.168.1.1\n  ping 192.168.1.1'
              )}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ── Canvas + Side panel ──────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden">
            <NetworkCanvas />
          </div>

          {selectedNodeId && (
            <div className="noc-panel-divider w-[480px] shrink-0 overflow-hidden flex flex-col">
              <DevicePanel />
            </div>
          )}
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────── */}
        <div className="noc-bottom-bar shrink-0 flex">

          {/* Device palette */}
          <div className="noc-palette flex items-center gap-1 px-2 shrink-0">
            {DEVICE_BTNS.map(({ type, label }) => {
              const Icon = DEVICE_ICON[type]
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPickerType(type)}
                  className={`dev-btn dev-btn-${type} group`}
                >
                  <Icon className={`dev-icon-${type} w-6 h-6 transition-transform duration-150 group-hover:scale-110`} />
                  <span className="dev-btn-label">{label}</span>
                  <div className={`dev-btn-line dev-line-${type}`} />
                </button>
              )
            })}
          </div>

          {/* Packet log */}
          <div className="flex-1 overflow-hidden">
            <PacketLog />
          </div>
        </div>

      </div>

      {pickerType && (
        <DevicePicker
          deviceType={pickerType}
          onConfirm={handleConfirm}
          onClose={() => setPickerType(null)}
        />
      )}

      <FloatingTerminalManager />
    </ReactFlowProvider>
  )
}
