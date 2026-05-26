'use client'
import { useRef, useState } from 'react'
import {
  X, Trash2, Terminal as TermIcon, Info,
  Cpu, ArrowRightLeft, Network, Pencil, Check, ExternalLink, Monitor,
} from 'lucide-react'
import { useNetworkStore, engine } from '@/lib/store/network'
import { useTermWins } from '@/lib/store/termWindows'
import { TabbedTerminal } from '../terminal/TabbedTerminal'
import { RouterDevice } from '@/lib/simulation/devices/router'
import { SwitchDevice } from '@/lib/simulation/devices/switch'
import { PCDevice } from '@/lib/simulation/devices/pc'
import { prefixLenToMask } from '@/lib/simulation/ip-utils'
import type { DeviceSnapshot, RouterSnapshot, SwitchSnapshot, PCSnapshot } from '@/lib/simulation/types'

type Tab = 'info' | 'terminal'

const TYPE_DOT: Record<string, string> = {
  router: 'dp-device-dot-router',
  switch: 'dp-device-dot-switch',
  pc:     'dp-device-dot-pc',
  server: 'dp-device-dot-server',
}

const TYPE_LABEL: Record<string, string> = {
  router: 'Router', switch: 'Switch', pc: 'PC', server: 'Server',
}

/* ── Shared info primitives ─────────────────────────────────────────── */
function SectionTitle({ icon: Icon, title, count }: { icon: React.ComponentType<{className?: string}>; title: string; count?: number }) {
  return (
    <div className="info-section-hdr">
      <Icon className="w-3 h-3 flex-shrink-0" />
      {title}
      {count != null && <span className="info-section-count">{count}</span>}
    </div>
  )
}
function Badge({ up }: { up: boolean }) {
  return <span className={up ? 'info-badge-up' : 'info-badge-dn'}>{up ? 'UP' : 'DN'}</span>
}
function KVRow({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="info-kv-row">
      <span className="info-kv-key">{label}</span>
      <span className={`info-kv-val ${cls ?? ''}`}>{value}</span>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────── */
export function DevicePanel() {
  // ALL hooks before any conditional returns
  const { nodes, selectedNodeId, setSelectedNodeId, removeDevice, deviceSnapshots, renameDevice } = useNetworkStore()
  const { windows, openWindow } = useTermWins()
  const [tab, setTab]             = useState<Tab>('terminal')
  const [renaming, setRenaming]   = useState(false)
  const [renameVal, setRenameVal] = useState('')
  const renameInputRef            = useRef<HTMLInputElement>(null)

  const node = nodes.find(n => n.id === selectedNodeId)
  if (!node) return null

  const { deviceId, deviceType, label, brand, model } = node.data
  const dev  = engine.getDevice(deviceId)
  const snap = deviceSnapshots[deviceId]
  if (!dev) return null

  const startRename = () => {
    setRenameVal(label)
    setRenaming(true)
    setTimeout(() => renameInputRef.current?.select(), 0)
  }
  const commitRename = () => {
    if (renameVal.trim()) renameDevice(selectedNodeId!, renameVal.trim())
    setRenaming(false)
  }

  return (
    <div className="dp-root">

      {/* ── Header ── */}
      <div className="dp-header px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[deviceType] ?? 'bg-gray-400'}`} />
            {renaming ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <input ref={renameInputRef} value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false) }}
                  onBlur={commitRename} autoFocus className="dp-rename-input" placeholder="Device name" />
                <button type="button" onMouseDown={e => { e.preventDefault(); commitRename() }}
                  className="dp-rename-confirm shrink-0" title="Confirmar">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={startRename} title="Clique para renomear"
                className="dp-name-btn flex items-center gap-1.5 min-w-0">
                <span className="dp-name">{label}</span>
                <Pencil className="dp-pencil w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button type="button" title="Delete"
              onClick={() => { removeDevice(selectedNodeId!); setSelectedNodeId(null) }}
              className="dp-icon-btn dp-icon-btn-del p-1.5">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button type="button" title="Fechar" onClick={() => setSelectedNodeId(null)}
              className="dp-icon-btn p-1.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 pl-4">
          <span className="dp-type-chip font-mono text-[9px] font-bold tracking-[0.16em] uppercase px-2 py-px">
            {TYPE_LABEL[deviceType]}
          </span>
          {brand && <span className="dp-brand text-[10px]">{brand}</span>}
          {model && model !== label && <span className="dp-model text-[10px] truncate">· {model}</span>}
        </div>
      </div>

      {/* ── Panel tabs + pop-out ── */}
      <div className="dp-tabs">
        {([['info', Info, 'Info'], ['terminal', TermIcon, 'Terminal']] as const).map(([id, Icon, title]) => (
          <button type="button" key={id} onClick={() => setTab(id)}
            className={`dp-tab${tab === id ? ' dp-tab-active' : ''}`}>
            <Icon className="w-3.5 h-3.5" />{title}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          title="Abrir terminal em janela flutuante"
          onClick={() => {
            const off = windows.length * 36
            openWindow(
              { deviceId, label, brand, deviceType },
              Math.max(10, Math.round((window.innerWidth  - 560) / 2) + off),
              Math.max(60, Math.round((window.innerHeight - 460) / 4) + off),
            )
          }}
          className="dp-popout-btn"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Abrir terminal em nova janela do sistema (outro monitor)"
          onClick={() => {
            const url = `/detached?d=${encodeURIComponent(deviceId)}&l=${encodeURIComponent(label)}&t=${encodeURIComponent(deviceType)}&b=${encodeURIComponent(brand ?? '')}`
            window.open(url, `pq-${deviceId}`, 'width=900,height=640,resizable=yes,scrollbars=no')
          }}
          className="dp-popout-btn"
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Content — both always mounted, CSS hides inactive ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">

        <div className={`flex-1 overflow-y-auto p-4 space-y-5 dp-info-scroll${tab !== 'info' ? ' hidden' : ''}`}>
          <InfoContent deviceType={deviceType} dev={dev} snap={snap} />
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden min-h-0${tab !== 'terminal' ? ' hidden' : ''}`}>
          <TabbedTerminal
            key={deviceId}
            deviceId={deviceId}
            deviceLabel={label}
            brand={brand}
            deviceType={deviceType}
          />
        </div>

      </div>
    </div>
  )
}

/* ── Info content dispatcher ── */
function InfoContent({ deviceType, dev, snap }: {
  deviceType: string; dev: ReturnType<typeof engine.getDevice>; snap: DeviceSnapshot | undefined
}) {
  if (!dev) return null
  if (deviceType === 'router') return <RouterInfo dev={dev as RouterDevice} snap={snap as RouterSnapshot | undefined} />
  if (deviceType === 'switch') return <SwitchInfo dev={dev as SwitchDevice} snap={snap as SwitchSnapshot | undefined} />
  return <PCInfo dev={dev as PCDevice} snap={snap as PCSnapshot | undefined} />
}

/* ── Router Info ── */
function RouterInfo({ dev, snap }: { dev: RouterDevice; snap: RouterSnapshot | undefined }) {
  const ifaces = snap ? snap.interfaces : Array.from(dev.interfaces.values())
  const routes = snap ? snap.routingTable : dev.routingTable
  const arps   = Array.from(dev.arpTable.values())
  return (
    <>
      <div>
        <SectionTitle icon={Network} title="Interfaces" count={ifaces.length} />
        <div className="info-card space-y-0">
          {ifaces.map(iface => {
            const shortName = iface.name.replace('GigabitEthernet', 'Gi').replace('FastEthernet', 'Fa').replace('GigabitEthernet0/0/', 'GE0/')
            const isUp = iface.status === 'up'
            return (
              <div key={iface.name} className="info-iface-row">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isUp ? 'bg-[var(--noc-green)] led-pulse' : 'bg-[var(--noc-red)]'}`} />
                <span className="info-iface-name">{shortName}</span>
                <span className="info-iface-ip">
                  {iface.ip ? `${iface.ip}/${iface.prefixLen}` : <span className="text-[var(--noc-tx3)] italic">unassigned</span>}
                </span>
                <Badge up={isUp} />
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <SectionTitle icon={ArrowRightLeft} title="Routing Table" count={routes.length} />
        {routes.length === 0 ? <p className="info-empty">No routes configured.</p> : (
          <div className="info-card">
            <table className="info-table">
              <thead><tr><th className="w-8">Src</th><th>Network</th><th>Via</th></tr></thead>
              <tbody>
                {routes.map((r, i) => (
                  <tr key={i}>
                    <td><span className={r.source === 'connected' ? 'info-td-src-c' : 'info-td-src-s'}>{r.source === 'connected' ? 'C' : 'S'}</span></td>
                    <td className="info-td-net">{r.network}/{r.prefixLen}</td>
                    <td className="info-td-via">{r.nextHop ? r.nextHop : r.interface.replace('GigabitEthernet', 'Gi')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div>
        <SectionTitle icon={Cpu} title="ARP Cache" count={arps.length} />
        {arps.length === 0 ? <p className="info-empty">Empty — run ping to populate.</p> : (
          <div className="info-card">
            <table className="info-table">
              <thead><tr><th>IP</th><th>MAC</th><th>Iface</th></tr></thead>
              <tbody>
                {arps.map(e => (
                  <tr key={e.ip}>
                    <td className="info-td-ip">{e.ip}</td>
                    <td className="info-td-mac">{e.mac}</td>
                    <td className="info-td-port text-[11px]">{e.iface.replace('GigabitEthernet', 'Gi')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

/* ── Switch Info ── */
function SwitchInfo({ dev, snap }: { dev: SwitchDevice; snap: SwitchSnapshot | undefined }) {
  const macs = snap ? snap.macTable : Array.from(dev.macTable.values())
  return (
    <>
      <div>
        <SectionTitle icon={Network} title="Ports" count={dev.ports.length} />
        <div className="info-port-grid">
          {dev.ports.map(port => {
            const macEntry = macs.find(m => m.port === port)
            const shortPort = port.replace('GigabitEthernet0/', 'Gi').replace('GigabitEthernet0/0/', 'GE')
              .replace(/^ge-0\/0\/(\d+)$/, 'ge$1').replace(/^ether(\d+)$/, 'e$1')
            const active = !!macEntry
            return (
              <div key={port} title={`${port}${macEntry ? ` — ${macEntry.mac}` : ''}`}
                className={`info-port-tile ${active ? 'active' : 'inactive'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[var(--noc-green)]' : 'bg-[var(--noc-bd1)]'}`} />
                <span>{shortPort}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <SectionTitle icon={Cpu} title="MAC Address Table" count={macs.length} />
        {macs.length === 0 ? <p className="info-empty">Empty — no traffic yet.</p> : (
          <div className="info-card">
            <table className="info-table">
              <thead><tr><th>MAC Address</th><th className="text-right">Port</th></tr></thead>
              <tbody>
                {macs.map(e => (
                  <tr key={e.mac}>
                    <td className="info-td-mac">{e.mac}</td>
                    <td className="info-td-port text-right">{e.port.replace('GigabitEthernet0/', 'Gi').replace('GigabitEthernet0/0/', 'GE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

/* ── PC / Server Info ── */
function PCInfo({ dev, snap }: { dev: PCDevice; snap: PCSnapshot | undefined }) {
  const iface   = snap ? snap.iface   : dev.iface
  const gateway = snap ? snap.gateway : dev.gateway
  const arps    = Array.from(dev.arpTable.entries())
  const isUp    = iface.status === 'up'
  return (
    <>
      <div>
        <SectionTitle icon={Network} title="Network Interface" />
        <div className="info-card">
          <div className="info-iface-row border-b border-[var(--noc-bd1)] bg-[var(--noc-s2)]">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isUp ? 'bg-[var(--noc-green)] led-pulse' : 'bg-[var(--noc-red)]'}`} />
            <span className="info-iface-name font-bold">eth0</span>
            <span className="flex-1" />
            <Badge up={isUp} />
          </div>
          <div>
            <KVRow label="MAC"         value={iface.mac} />
            <KVRow label="IP Address"  value={iface.ip ? `${iface.ip}/${iface.prefixLen}` : '—'} cls={iface.ip ? 'green' : 'muted'} />
            <KVRow label="Subnet Mask" value={iface.prefixLen != null ? prefixLenToMask(iface.prefixLen) : '—'} />
            <KVRow label="Gateway"     value={gateway ?? '—'} cls={gateway ? 'cyan' : 'muted'} />
          </div>
        </div>
      </div>
      <div>
        <SectionTitle icon={Cpu} title="ARP Cache" count={arps.length} />
        {arps.length === 0 ? <p className="info-empty">Empty — run ping to populate.</p> : (
          <div className="info-card">
            <table className="info-table">
              <thead><tr><th>IP</th><th>MAC</th></tr></thead>
              <tbody>
                {arps.map(([ip, { mac }]) => (
                  <tr key={ip}>
                    <td className="info-td-ip">{ip}</td>
                    <td className="info-td-mac">{mac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
