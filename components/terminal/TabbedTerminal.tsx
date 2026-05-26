'use client'
import { useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { DeviceTerminal, type TerminalActions } from './Terminal'
import { RouterDevice } from '@/lib/simulation/devices/router'
import { PCDevice } from '@/lib/simulation/devices/pc'
import { engine } from '@/lib/store/network'

type DiagMode = { cmd: 'ping' | 'traceroute'; ip: string } | null
interface TermTab { id: string; label: string }

const CMD_GROUPS: Record<string, Array<{ label: string; cmd: string; kind: 'show' | 'config' | 'diag' | 'danger' }>> = {
  router: [
    { label: 'int brief',  cmd: 'show ip interface brief',  kind: 'show'   },
    { label: 'ip route',   cmd: 'show ip route',            kind: 'show'   },
    { label: 'arp',        cmd: 'show arp',                 kind: 'show'   },
    { label: 'run-config', cmd: 'show running-config',      kind: 'show'   },
    { label: 'version',    cmd: 'show version',             kind: 'show'   },
    { label: 'enable',     cmd: 'enable',                   kind: 'config' },
    { label: 'conf t',     cmd: 'configure terminal',       kind: 'config' },
    { label: 'wr mem',     cmd: 'write memory',             kind: 'config' },
    { label: 'ping',       cmd: 'ping',                     kind: 'diag'   },
    { label: 'traceroute', cmd: 'traceroute',               kind: 'diag'   },
  ],
  switch: [
    { label: 'mac table',  cmd: 'show mac address-table',          kind: 'show'   },
    { label: 'int status', cmd: 'show interfaces status',          kind: 'show'   },
    { label: 'vlan',       cmd: 'show vlan brief',                 kind: 'show'   },
    { label: 'run-config', cmd: 'show running-config',             kind: 'show'   },
    { label: 'enable',     cmd: 'enable',                          kind: 'config' },
    { label: 'conf t',     cmd: 'configure terminal',              kind: 'config' },
    { label: 'clear mac',  cmd: 'clear mac address-table dynamic', kind: 'danger' },
  ],
  pc: [
    { label: 'ifconfig',   cmd: 'ifconfig',   kind: 'show'   },
    { label: 'ip addr',    cmd: 'ip addr',    kind: 'show'   },
    { label: 'ip route',   cmd: 'ip route',   kind: 'show'   },
    { label: 'arp',        cmd: 'arp -n',     kind: 'show'   },
    { label: 'ping',       cmd: 'ping',       kind: 'diag'   },
    { label: 'traceroute', cmd: 'traceroute', kind: 'diag'   },
    { label: 'help',       cmd: 'help',       kind: 'config' },
  ],
  server: [
    { label: 'ip addr',    cmd: 'ip addr',    kind: 'show'   },
    { label: 'ip route',   cmd: 'ip route',   kind: 'show'   },
    { label: 'arp',        cmd: 'arp -n',     kind: 'show'   },
    { label: 'ss -tlnp',   cmd: 'ss -tlnp',  kind: 'show'   },
    { label: 'ping',       cmd: 'ping',       kind: 'diag'   },
    { label: 'traceroute', cmd: 'traceroute', kind: 'diag'   },
    { label: 'ps aux',     cmd: 'ps aux',     kind: 'show'   },
  ],
}

function ModeBadge({ mode }: { mode: string }) {
  const MAP: Record<string, string> = {
    user:        'terminal-mode-badge user',
    enable:      'terminal-mode-badge enable',
    config:      'terminal-mode-badge config',
    'config-if': 'terminal-mode-badge config-if',
    system:      'terminal-mode-badge system',
    interface:   'terminal-mode-badge interface',
    linux:       'terminal-mode-badge linux',
    macos:       'terminal-mode-badge macos',
    windows:     'terminal-mode-badge windows',
  }
  const LABEL: Record<string, string> = {
    user: 'USER', enable: 'ENABLE', config: 'CONFIG', 'config-if': 'IF',
    system: 'SYSTEM', interface: 'IF', linux: 'LINUX', macos: 'macOS', windows: 'WIN',
  }
  return <span className={MAP[mode] ?? MAP['user']}>{LABEL[mode] ?? 'USER'}</span>
}

let _tabSeq = 0

export function TabbedTerminal({
  deviceId, deviceLabel, brand, deviceType,
}: {
  deviceId: string; deviceLabel: string; brand: string | undefined; deviceType: string
}) {
  const fid = useRef(`tt${++_tabSeq}`).current
  const [tabs, setTabs]         = useState<TermTab[]>([{ id: fid, label: '1' }])
  const [activeId, setActiveId] = useState(fid)
  const [tabModes, setTabModes] = useState<Record<string, string>>({ [fid]: 'user' })
  const [tabIps, setTabIps]     = useState<Record<string, string | undefined>>({ [fid]: undefined })
  const [diagMode, setDiagMode] = useState<DiagMode>(null)
  const diagInputRef = useRef<HTMLInputElement>(null)
  const actionsMap   = useRef<Record<string, { current: TerminalActions | null }>>({ [fid]: { current: null } })

  const cliMode = tabModes[activeId] ?? 'user'
  const devIp   = tabIps[activeId]
  const inject  = (cmd: string) => actionsMap.current[activeId]?.current?.inject(cmd)

  const addTab = () => {
    const id = `tt${++_tabSeq}`
    actionsMap.current[id] = { current: null }
    const n = Object.keys(actionsMap.current).length
    setTabs(prev => [...prev, { id, label: String(n) }])
    setTabModes(prev => ({ ...prev, [id]: 'user' }))
    setTabIps(prev => ({ ...prev, [id]: undefined }))
    setActiveId(id)
  }

  const closeTab = (id: string, curTabs: TermTab[]) => {
    if (curTabs.length === 1) return
    const idx  = curTabs.findIndex(t => t.id === id)
    const next = curTabs.filter(t => t.id !== id)
    if (id === activeId) setActiveId(next[Math.min(idx, next.length - 1)].id)
    delete actionsMap.current[id]
    setTabs(next)
    setTabModes(prev => { const n = { ...prev }; delete n[id]; return n })
    setTabIps(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const knownIps: string[] = (() => {
    try {
      const dev = engine.getDevice(deviceId) as any
      if (!dev) return []
      if (deviceType === 'router')
        return Array.from((dev as RouterDevice).arpTable.values()).map((v: any) => v.ip).filter(Boolean)
      return Array.from((dev as PCDevice).arpTable.keys())
    } catch { return [] }
  })()

  const handleCmdClick = (cmd: string, kind: string) => {
    if (kind === 'diag') {
      setDiagMode({ cmd: cmd as 'ping' | 'traceroute', ip: '' })
      setTimeout(() => diagInputRef.current?.focus(), 40)
    } else {
      inject(cmd)
    }
  }

  const runDiag = () => {
    if (!diagMode) return
    const t = diagMode.ip.trim()
    if (!t) return
    inject(`${diagMode.cmd} ${t}`)
    setDiagMode(null)
  }

  const groups     = CMD_GROUPS[deviceType] ?? []
  const showCmds   = groups.filter(g => g.kind === 'show')
  const configCmds = groups.filter(g => g.kind === 'config')
  const diagCmds   = groups.filter(g => g.kind === 'diag')
  const dangerCmds = groups.filter(g => g.kind === 'danger')

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">

      {/* ── Status bar ── */}
      <div className="terminal-statusbar">
        <div className="terminal-statusbar-item">
          <span className={`terminal-statusbar-dot ${
            cliMode === 'enable' || cliMode === 'linux' ? 'bg-green-400' :
            cliMode === 'config' || cliMode === 'config-if' ? 'bg-blue-400' :
            cliMode === 'system' ? 'bg-cyan-400' : 'bg-gray-600'
          }`} />
          <ModeBadge mode={cliMode} />
        </div>
        {devIp && (
          <div className="terminal-statusbar-item terminal-ip-glow">
            <span className="terminal-statusbar-dot bg-blue-400" />
            <span className="terminal-statusbar-ip">{devIp}</span>
          </div>
        )}
        <div className="terminal-statusbar-item terminal-statusbar-sep" />
        <div className="terminal-statusbar-item terminal-statusbar-right">PacketRoqy CLI</div>
      </div>

      {/* ── Diag picker ── */}
      {diagMode && (
        <div className="diag-bar">
          <span className="diag-bar-cmd">{diagMode.cmd}</span>
          <input ref={diagInputRef} type="text" placeholder="192.168.1.1"
            value={diagMode.ip}
            onChange={e => setDiagMode({ ...diagMode, ip: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') runDiag(); if (e.key === 'Escape') setDiagMode(null) }}
            className="diag-bar-input"
          />
          {knownIps.length > 0 && (
            <><span className="diag-sep" /><span className="diag-hint">ARP:</span>
              {knownIps.slice(0, 4).map(ip => (
                <button key={ip} type="button" className="diag-known-btn"
                  onClick={() => { inject(`${diagMode.cmd} ${ip}`); setDiagMode(null) }}>{ip}</button>
              ))}
            </>
          )}
          <span className="diag-sep" />
          <button type="button" onClick={runDiag} disabled={!diagMode.ip.trim()} className="diag-run-btn">Run</button>
          <button type="button" onClick={() => setDiagMode(null)} className="diag-cancel-btn" title="Esc">✕</button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="terminal-toolbar">
        {showCmds.length > 0 && (
          <div className="terminal-toolbar-group">
            {showCmds.map(({ label: l, cmd, kind }) => (
              <button key={cmd} type="button" className="terminal-cmd-btn show"
                onClick={() => handleCmdClick(cmd, kind)}>{l}</button>
            ))}
          </div>
        )}
        {configCmds.length > 0 && (<>
          <div className="terminal-toolbar-sep" />
          <div className="terminal-toolbar-group">
            {configCmds.map(({ label: l, cmd, kind }) => (
              <button key={cmd} type="button" className="terminal-cmd-btn config"
                onClick={() => handleCmdClick(cmd, kind)}>{l}</button>
            ))}
          </div>
        </>)}
        {diagCmds.length > 0 && (<>
          <div className="terminal-toolbar-sep" />
          <div className="terminal-toolbar-group">
            {diagCmds.map(({ label: l, cmd, kind }) => (
              <button key={cmd} type="button"
                className={`terminal-cmd-btn diag${diagMode?.cmd === cmd ? ' !border-amber-500/40 !text-amber-400' : ''}`}
                onClick={() => handleCmdClick(cmd, kind)}>{l}</button>
            ))}
          </div>
        </>)}
        {dangerCmds.length > 0 && (<>
          <div className="terminal-toolbar-sep" />
          <div className="terminal-toolbar-group">
            {dangerCmds.map(({ label: l, cmd, kind }) => (
              <button key={cmd} type="button" className="terminal-cmd-btn danger"
                onClick={() => handleCmdClick(cmd, kind)}>{l}</button>
            ))}
          </div>
        </>)}
        <div className="terminal-toolbar-sep ml-auto" />
        <button type="button" onClick={() => actionsMap.current[activeId]?.current?.clear()}
          title="Clear (Ctrl+L)" className="terminal-cmd-btn ml-1">
          <Eraser className="w-3 h-3" />clear
        </button>
      </div>

      {/* ── Terminal window ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ background: 'var(--terminal-bg)' }}>

        {/* Titlebar with embedded session tabs */}
        <div className="terminal-titlebar">
          <div className="terminal-traffic-lights">
            <div className="terminal-dot terminal-dot-close" />
            <div className="terminal-dot terminal-dot-min" />
            <div className="terminal-dot terminal-dot-max" />
          </div>

          <div className="tterm-tabs">
            {tabs.map(tab => (
              <button
                type="button"
                key={tab.id}
                className={`tterm-tab${tab.id === activeId ? ' active' : ''}`}
                onClick={() => setActiveId(tab.id)}
              >
                <span className="tterm-tab-label">{tab.label}</span>
                {tabs.length > 1 && (
                  <span
                    className="tterm-tab-close"
                    onClick={e => { e.stopPropagation(); closeTab(tab.id, tabs) }}
                  >×</span>
                )}
              </button>
            ))}
            <button type="button" className="tterm-tab-add" onClick={addTab} title="Nova sessão">+</button>
          </div>

          <div className="terminal-title">
            <span className="terminal-title-device">{deviceLabel}</span>
            {brand && <span className="terminal-title-brand"> — {brand}</span>}
          </div>
        </div>

        {/* Xterm area — all tabs mounted, CSS display toggle preserves state */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className="terminal-xterm-wrap"
              style={{ position: 'absolute', inset: 0, display: tab.id === activeId ? 'block' : 'none' }}
            >
              <div className="terminal-scanlines" />
              <DeviceTerminal
                key={tab.id}
                deviceId={deviceId}
                actionsRef={actionsMap.current[tab.id]}
                onModeChange={mode => setTabModes(prev => ({ ...prev, [tab.id]: mode }))}
                onIpChange={ip => setTabIps(prev => ({ ...prev, [tab.id]: ip }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
