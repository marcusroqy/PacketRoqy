'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Eraser } from 'lucide-react'

/* ── helpers (mirrors Terminal.tsx, but uses injected engine) ── */

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*[mGKHJABCDsuF]/g, '').replace(/\x1b[()][012AB]/g, '')
}

function colorizeOutput(line: string): string {
  if (line.includes('\x1b[')) return line
  let res = line.replace(/\b((?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?)\b/g, '\x1b[36m$1\x1b[0m')
  res = res.replace(/\b([0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}|(?:[0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2})\b/g, '\x1b[35m$1\x1b[0m')
  res = res.replace(/\b(up|UP)\b/g, '\x1b[32m$1\x1b[0m')
  res = res.replace(/\b(down|DOWN|administratively down)\b/gi, '\x1b[31m$1\x1b[0m')
  return res
}

function highlightLine(line: string, brand: string): string {
  if (!line) return ''
  if (line.trim().startsWith('!') || line.trim().startsWith('#'))
    return `\x1b[38;5;240m${line}\x1b[0m`
  const tokens = line.split(/(\s+)/)
  return tokens.map(token => {
    if (/^\s+$/.test(token)) return token
    const lower = token.toLowerCase()
    if (brand === 'Cisco') {
      if (['show','ping','traceroute','write','copy','clear','debug','undebug','reload'].includes(lower))
        return `\x1b[38;5;220m${token}\x1b[0m`
      if (['configure','terminal','interface','router','access-list','ip','no','shutdown','description','speed','bandwidth','duplex'].includes(lower))
        return `\x1b[38;5;117m${token}\x1b[0m`
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(token)) return `\x1b[38;5;84m${token}\x1b[0m`
      if (/^\d+$/.test(token)) return `\x1b[38;5;209m${token}\x1b[0m`
    } else {
      if (['show','display','ping','ip','interface','configure','set','delete','commit','exit','quit','sys','system-view','ls','cat','cd','ifconfig','sudo'].includes(lower))
        return `\x1b[38;5;117m${token}\x1b[0m`
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(token)) return `\x1b[38;5;84m${token}\x1b[0m`
      if (/^\d+$/.test(token)) return `\x1b[38;5;209m${token}\x1b[0m`
    }
    return token
  }).join('')
}

function isPromptLine(line: string): boolean {
  const last = stripAnsi(line).split('\n').pop()?.trimEnd() ?? ''
  return last.endsWith('>') || last.endsWith('#') || last.endsWith('%') || /^\[.+\]/.test(last)
}

function writeLine(t: XTerm, line: string, isLast: boolean): void {
  if (isLast && isPromptLine(line)) {
    const parts = line.split('\n')
    for (let i = 0; i < parts.length - 1; i++) t.writeln(colorizeOutput(parts[i]))
    t.write(colorizeOutput(parts[parts.length - 1]))
  } else {
    t.writeln(colorizeOutput(line))
  }
}

function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return ''
  let prefix = strs[0]
  for (const s of strs.slice(1)) {
    while (!s.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1)
    if (!prefix) return ''
  }
  return prefix
}

/* ── command toolbar config (mirrors TabbedTerminal.tsx) ── */
type CmdKind = 'show' | 'config' | 'diag' | 'danger'
type CmdDef  = { label: string; cmd: string; kind: CmdKind }

const CMD_GROUPS: Record<string, CmdDef[]> = {
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
    user: 'terminal-mode-badge user', enable: 'terminal-mode-badge enable',
    config: 'terminal-mode-badge config', 'config-if': 'terminal-mode-badge config-if',
    system: 'terminal-mode-badge system', interface: 'terminal-mode-badge interface',
    linux: 'terminal-mode-badge linux', macos: 'terminal-mode-badge macos',
    windows: 'terminal-mode-badge windows',
  }
  const LABEL: Record<string, string> = {
    user: 'USER', enable: 'ENABLE', config: 'CONFIG', 'config-if': 'IF',
    system: 'SYSTEM', interface: 'IF', linux: 'LINUX', macos: 'macOS', windows: 'WIN',
  }
  return <span className={MAP[mode] ?? MAP['user']}>{LABEL[mode] ?? 'USER'}</span>
}

const detachedHistory = new Map<string, string[]>()

/* ── main component ── */
function DetachedTerminalInner() {
  const params      = useSearchParams()
  const deviceId    = params.get('d') ?? ''
  const deviceLabel = params.get('l') ?? 'Device'
  const deviceType  = params.get('t') ?? 'router'
  const brand       = params.get('b') ?? ''

  const termRef    = useRef<HTMLDivElement>(null)
  const injectRef  = useRef<((cmd: string) => Promise<void>) | null>(null)
  const clearRef   = useRef<(() => void) | null>(null)

  const [cliMode,      setCliMode]      = useState('user')
  const [devIp,        setDevIp]        = useState<string | undefined>(undefined)
  const [diagMode,     setDiagMode]     = useState<{ cmd: 'ping' | 'traceroute'; ip: string } | null>(null)
  const [bridgeError,  setBridgeError]  = useState(false)
  const diagInputRef = useRef<HTMLInputElement>(null)

  /* xterm setup */
  useEffect(() => {
    if (!termRef.current) return

    const bridge = (window.opener as any)?.__pqBridge
    if (!bridge?.engine) { setBridgeError(true); return }

    const eng = bridge.engine

    const getDeviceMode = (): string => {
      const dev = eng.getDevice(deviceId) as any
      if (!dev) return 'user'
      const cli = dev.cli as any
      if (!cli) {
        if (dev.subtype === 'server') return 'linux'
        if (dev.brand === 'Apple') return 'macos'
        return 'windows'
      }
      return cli.mode ?? 'user'
    }

    const getDeviceIp = (): string | undefined => {
      const dev = eng.getDevice(deviceId) as any
      if (!dev) return undefined
      if (dev.type === 'router') {
        for (const iface of (dev.interfaces?.values() ?? [])) if (iface.ip) return iface.ip
        return undefined
      }
      return dev.iface?.ip
    }

    const term = new XTerm({
      theme: {
        background: '#0a0e17', foreground: '#c9d1d9',
        cursor: '#58a6ff', cursorAccent: '#0a0e17',
        selectionBackground: '#264f7840', selectionForeground: '#ffffff',
        black: '#161b22', brightBlack: '#30363d',
        red: '#f85149', brightRed: '#f85149',
        green: '#3fb950', brightGreen: '#3fb950',
        yellow: '#d29922', brightYellow: '#e3b341',
        blue: '#388bfd', brightBlue: '#79c0ff',
        magenta: '#bc8cff', brightMagenta: '#d2a8ff',
        cyan: '#39c5cf', brightCyan: '#56d364',
        white: '#b1bac4', brightWhite: '#f0f6fc',
      },
      fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code","Consolas",Menlo,monospace',
      fontSize: 13.5, lineHeight: 1.55, cursorBlink: true, cursorStyle: 'block',
      scrollback: 5000, padding: 10, allowProposedApi: true,
    } as any)

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(termRef.current)
    fit.fit()

    const dev = eng.getDevice(deviceId) as any
    if (dev) {
      const banner: string[] | undefined = dev.getBanner?.()
      if (banner) { for (const l of banner) term.writeln(l) }
      else { term.writeln(`\x1b[32mPacketRoqy — ${dev.name}\x1b[0m`); term.writeln('') }
    }

    const getPrompt = () => (eng.getDevice(deviceId) as any)?.getPrompt?.() ?? '\x1b[32m> \x1b[0m'
    term.write(getPrompt())

    let line = '', cursor = 0, ghostText = '', prevTargetRow = 0, currentExecId = 0
    if (!detachedHistory.has(deviceId)) detachedHistory.set(deviceId, [])
    const hist = detachedHistory.get(deviceId)!
    let histIdx = -1, histSaved = ''

    function redraw() {
      const promptStr    = getPrompt()
      const promptVisLen = stripAnsi(promptStr).length
      const cols         = term.cols || 80
      const device       = eng.getDevice(deviceId) as any
      const b            = device?.brand ?? 'Cisco'

      ghostText = ''
      if (line.trim().length > 0 && cursor === line.length) {
        const all: string[] = device?.getCompletions?.(line) ?? []
        let match = all.find((c: string) => c.toLowerCase().startsWith(line.toLowerCase())) || ''
        if (!match && hist.length > 0) {
          const hm = [...hist].reverse().find(c => c.toLowerCase().startsWith(line.toLowerCase()))
          if (hm) match = hm
        }
        if (match && match.length > line.length) ghostText = match.slice(line.length)
      }

      if (prevTargetRow > 0) term.write(`\x1b[${prevTargetRow}A`)
      term.write('\r\x1b[J')
      term.write(promptStr)
      term.write(highlightLine(line, b))
      if (ghostText) term.write(`\x1b[38;5;244m${ghostText}\x1b[0m`)

      const totalLen  = promptVisLen + line.length + ghostText.length
      let endRow      = Math.floor(totalLen / cols)
      let endCol      = totalLen % cols
      if (endCol === 0 && totalLen > 0) { endRow--; endCol = cols }

      const targetPos = promptVisLen + cursor
      let targetRow   = Math.floor(targetPos / cols)
      let targetCol   = targetPos % cols
      if (targetCol === 0 && targetPos > 0) { targetRow--; targetCol = cols }
      else targetCol++

      const rowsUp = endRow - targetRow
      if (rowsUp > 0) term.write(`\x1b[${rowsUp}A`)
      term.write(`\x1b[${targetCol}G`)
      prevTargetRow = targetRow
    }

    function resetDrawnRows() { prevTargetRow = 0 }
    function insert(ch: string) { line = line.slice(0, cursor) + ch + line.slice(cursor); cursor++; redraw() }
    function deleteBack() { if (!cursor) return; line = line.slice(0, cursor-1) + line.slice(cursor); cursor--; redraw() }
    function deleteFwd()  { if (cursor >= line.length) return; line = line.slice(0, cursor) + line.slice(cursor+1); redraw() }
    function histUp()   { if (histIdx === -1) histSaved = line; if (histIdx < hist.length-1) { histIdx++; line = hist[hist.length-1-histIdx]; cursor = line.length; redraw() } }
    function histDown() { if (histIdx > 0) { histIdx--; line = hist[hist.length-1-histIdx]; cursor = line.length; redraw() } else if (histIdx === 0) { histIdx = -1; line = histSaved; cursor = line.length; redraw() } }

    function doTab() {
      const device = eng.getDevice(deviceId) as any
      const all: string[] = device?.getCompletions?.(line) ?? []
      if (!all.length) { term.write('\x07'); return }
      if (all.length === 1) { line = all[0].endsWith(' ') ? all[0] : all[0]+' '; cursor = line.length; redraw(); return }
      const lcp = longestCommonPrefix(all)
      if (lcp.length > line.length) { line = lcp; cursor = line.length }
      term.writeln('')
      const colW  = Math.max(...all.map((c: string) => c.length)) + 3
      const perRow = Math.max(1, Math.floor((term.cols - 4) / colW))
      for (let i = 0; i < Math.min(all.length, 30); i += perRow) {
        let row = '  '
        for (let j = 0; j < perRow && i+j < all.length; j++) {
          const item = all[i+j]; const isKw = !item.endsWith(' ')
          row += (isKw ? '\x1b[36m' : '\x1b[38;5;244m') + item.padEnd(colW) + '\x1b[0m'
        }
        term.writeln(row)
      }
      if (all.length > 30) term.writeln(`  \x1b[38;5;244m... and ${all.length-30} more\x1b[0m`)
      redraw()
    }

    const handleCommand = async (cmd: string) => {
      const execId = currentExecId
      const device = eng.getDevice(deviceId)
      if (!device) return

      const result  = device.executeCommand(cmd)
      const sync    = result.filter((l: string) => !l.startsWith('__ASYNC_'))
      const async_  = result.filter((l: string) => l.startsWith('__ASYNC_'))

      for (let i = 0; i < sync.length; i++) writeLine(term, sync[i], i === sync.length-1 && async_.length === 0)
      resetDrawnRows()
      bridge.refreshSnapshot?.(deviceId)
      setCliMode(getDeviceMode())
      setDevIp(getDeviceIp())

      for (const s of async_) {
        if (execId !== currentExecId) return
        if (s.startsWith('__ASYNC_PING__')) {
          const target = s.slice(14)
          term.writeln(`\x1b[33mPinging ${target}...\x1b[0m`)
          const lines: string[] = await (device as any).ping(target)
          if (execId !== currentExecId) return
          for (const l of lines) term.writeln(colorizeOutput(l))
          resetDrawnRows(); term.write(getPrompt())
          setCliMode(getDeviceMode()); setDevIp(getDeviceIp())
        } else if (s.startsWith('__ASYNC_TRACE__')) {
          const target = s.slice(15)
          term.writeln(`\x1b[33mTracing route to ${target}...\x1b[0m`)
          const lines: string[] = await (device as any).traceroute(target)
          if (execId !== currentExecId) return
          for (const l of lines) term.writeln(colorizeOutput(l))
          resetDrawnRows(); term.write(getPrompt())
          setCliMode(getDeviceMode()); setDevIp(getDeviceIp())
        }
      }
    }

    injectRef.current = async (cmd: string) => {
      term.write(`${getPrompt()}${cmd}`); term.writeln('')
      if (cmd && hist[hist.length-1] !== cmd) hist.push(cmd)
      histIdx = -1; histSaved = ''; line = ''; cursor = 0
      await handleCommand(cmd)
    }
    clearRef.current = () => {
      term.write('\x1b[2J\x1b[H'); term.write(getPrompt()); term.write(line)
      if (line.length - cursor > 0) term.write(`\x1b[${line.length-cursor}D`)
    }

    term.onKey(({ key, domEvent: ev }) => {
      if (ev.ctrlKey && !ev.altKey) {
        switch (ev.key.toLowerCase()) {
          case 'c':
            if (term.hasSelection()) { navigator.clipboard.writeText(term.getSelection()); return }
            term.writeln('^C'); line = ''; cursor = 0; histIdx = -1; ghostText = ''; currentExecId++
            term.write(getPrompt()); return
          case 'l':
            term.write('\x1b[2J\x1b[H'); term.write(getPrompt()); term.write(line)
            if (line.length-cursor > 0) term.write(`\x1b[${line.length-cursor}D`); return
          case 'a': cursor = 0; redraw(); return
          case 'e': cursor = line.length; redraw(); return
          case 'u': line = line.slice(cursor); cursor = 0; redraw(); return
          case 'k': line = line.slice(0, cursor); redraw(); return
          case 'w': { let i = cursor; while (i > 0 && line[i-1] === ' ') i--; while (i > 0 && line[i-1] !== ' ') i--; line = line.slice(0,i)+line.slice(cursor); cursor = i; redraw(); return }
          case 'p': histUp(); return
          case 'n': histDown(); return
          case 'b': if (cursor > 0) { cursor--; redraw() } return
          case 'f': if (cursor < line.length) { cursor++; redraw() } return
          case 'd': if (!line.length) { term.writeln('logout'); return } deleteFwd(); return
        }
        return
      }
      if (ev.keyCode === 13) {
        term.writeln(''); const cmd = line.trim()
        if (cmd && hist[hist.length-1] !== cmd) hist.push(cmd)
        histIdx = -1; histSaved = ''; line = ''; cursor = 0
        if (cmd) handleCommand(cmd); else term.write(getPrompt()); return
      }
      if (ev.key === 'Tab')       { ev.preventDefault(); doTab(); return }
      if (ev.key === 'Backspace') { ev.preventDefault(); deleteBack(); return }
      if (ev.key === 'ArrowUp')   { ev.preventDefault(); histUp(); return }
      if (ev.key === 'ArrowDown') { ev.preventDefault(); histDown(); return }
      if (ev.ctrlKey && ev.key === 'ArrowLeft') {
        ev.preventDefault(); let i = cursor
        while (i > 0 && line[i-1] === ' ') i--; while (i > 0 && line[i-1] !== ' ') i--
        cursor = i; redraw(); return
      }
      if (ev.ctrlKey && ev.key === 'ArrowRight') {
        ev.preventDefault(); let i = cursor
        while (i < line.length && line[i] === ' ') i++; while (i < line.length && line[i] !== ' ') i++
        cursor = i; redraw(); return
      }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); if (cursor > 0) { cursor--; redraw() } return }
      if (ev.key === 'ArrowRight') {
        ev.preventDefault()
        if (cursor < line.length) { cursor++; redraw() }
        else if (ghostText) { line += ghostText; cursor = line.length; redraw() }
        return
      }
      if (ev.key === 'Home')   { ev.preventDefault(); cursor = 0; redraw(); return }
      if (ev.key === 'End')    { ev.preventDefault(); cursor = line.length; redraw(); return }
      if (ev.key === 'Delete') { ev.preventDefault(); deleteFwd(); return }
      if (key && key.length === 1 && key.charCodeAt(0) >= 32 && !ev.ctrlKey && !ev.altKey && !ev.metaKey) insert(key)
    })

    const handlePaste = async (e: Event) => {
      e.preventDefault()
      const data = (e as ClipboardEvent).clipboardData?.getData('text/plain') || ''
      const pasteExecId = currentExecId
      const lines = data.split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) {
        if (pasteExecId !== currentExecId) return
        const l = lines[i]
        if (i < lines.length-1 || l.trim() !== '') {
          term.write(l); term.writeln('')
          const cmd = (line+l).trim()
          if (cmd && hist[hist.length-1] !== cmd) hist.push(cmd)
          histIdx = -1; histSaved = ''; line = ''; cursor = 0
          if (cmd) await handleCommand(cmd); else term.write(getPrompt())
        } else { line += l; cursor += l.length; redraw() }
      }
    }
    const handleCopy = (e: Event) => {
      const ce = e as ClipboardEvent
      if (term.hasSelection()) { ce.clipboardData?.setData('text/plain', term.getSelection()); ce.preventDefault() }
    }
    if (term.textarea) { term.textarea.addEventListener('paste', handlePaste); term.textarea.addEventListener('copy', handleCopy) }

    const obs = new ResizeObserver(() => fit.fit())
    obs.observe(termRef.current!)

    setCliMode(getDeviceMode()); setDevIp(getDeviceIp())

    return () => {
      obs.disconnect()
      if (term.textarea) { term.textarea.removeEventListener('paste', handlePaste); term.textarea.removeEventListener('copy', handleCopy) }
      term.dispose()
      injectRef.current = null; clearRef.current = null
    }
  }, [deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const groups     = CMD_GROUPS[deviceType] ?? []
  const showCmds   = groups.filter(g => g.kind === 'show')
  const configCmds = groups.filter(g => g.kind === 'config')
  const diagCmds   = groups.filter(g => g.kind === 'diag')
  const dangerCmds = groups.filter(g => g.kind === 'danger')

  const knownIps: string[] = (() => {
    try {
      const bridge = (window.opener as any)?.__pqBridge
      const dev = bridge?.engine?.getDevice(deviceId) as any
      if (!dev) return []
      if (deviceType === 'router') return Array.from(dev.arpTable.values() as any[]).map((v: any) => v.ip).filter(Boolean)
      return Array.from(dev.arpTable.keys() as Iterable<string>)
    } catch { return [] }
  })()

  const inject = (cmd: string) => injectRef.current?.(cmd)

  const handleCmdClick = (cmd: string, kind: string) => {
    if (kind === 'diag') { setDiagMode({ cmd: cmd as 'ping' | 'traceroute', ip: '' }); setTimeout(() => diagInputRef.current?.focus(), 40) }
    else inject(cmd)
  }
  const runDiag = () => {
    if (!diagMode) return
    const t = diagMode.ip.trim()
    if (!t) return
    inject(`${diagMode.cmd} ${t}`)
    setDiagMode(null)
  }

  const TYPE_CHIP: Record<string, string> = { router: 'ROUTER', switch: 'SWITCH', pc: 'PC', server: 'SERVER' }

  if (bridgeError) {
    return (
      <div style={{ background: '#020810', color: '#c8dff0', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: 'monospace' }}>
        <div style={{ color: '#ff3050', fontSize: 18 }}>Bridge not found</div>
        <div style={{ color: '#6a9abf', fontSize: 13 }}>The main PacketRoqy window must be open to use a detached terminal.</div>
        <button onClick={() => window.close()} style={{ marginTop: 8, padding: '6px 18px', background: '#0e1e36', border: '1px solid #163050', borderRadius: 6, color: '#c8dff0', cursor: 'pointer', fontSize: 13 }}>Close</button>
      </div>
    )
  }

  return (
    <div className="dtach-root">

      {/* ── Titlebar ── */}
      <div className="dtach-header">
        <div className="dtach-tl">
          <span className="fterm-dot fterm-dot-close" onClick={() => window.close()} title="Close" />
          <span className="fterm-dot fterm-dot-min"   onClick={() => (window as any).blur()} title="Minimize" />
          <span className="fterm-dot fterm-dot-max"   title="" />
        </div>
        <div className="dtach-device-name">{deviceLabel}</div>
        {brand && <div className="dtach-brand">{brand}</div>}
        <div className="dtach-type-chip">{TYPE_CHIP[deviceType] ?? deviceType.toUpperCase()}</div>
      </div>

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
        <div className="terminal-statusbar-item terminal-statusbar-right">PacketRoqy CLI — Detached</div>
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
              <button key={cmd} type="button" className="terminal-cmd-btn show" onClick={() => handleCmdClick(cmd, kind)}>{l}</button>
            ))}
          </div>
        )}
        {configCmds.length > 0 && (<>
          <div className="terminal-toolbar-sep" />
          <div className="terminal-toolbar-group">
            {configCmds.map(({ label: l, cmd, kind }) => (
              <button key={cmd} type="button" className="terminal-cmd-btn config" onClick={() => handleCmdClick(cmd, kind)}>{l}</button>
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
              <button key={cmd} type="button" className="terminal-cmd-btn danger" onClick={() => handleCmdClick(cmd, kind)}>{l}</button>
            ))}
          </div>
        </>)}
        <div className="terminal-toolbar-sep ml-auto" />
        <button type="button" onClick={() => clearRef.current?.()} title="Clear (Ctrl+L)" className="terminal-cmd-btn ml-1">
          <Eraser className="w-3 h-3" />clear
        </button>
      </div>

      {/* ── xterm area ── */}
      <div className="dtach-term-area">
        <div className="terminal-scanlines" />
        <div ref={termRef} className="w-full h-full" />
      </div>

    </div>
  )
}

export default function DetachedPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#020810', color: '#6a9abf', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 13 }}>
        Loading terminal…
      </div>
    }>
      <DetachedTerminalInner />
    </Suspense>
  )
}
