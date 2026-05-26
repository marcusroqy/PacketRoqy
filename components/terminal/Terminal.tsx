'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { engine, useNetworkStore } from '@/lib/store/network'
import { RouterDevice } from '@/lib/simulation/devices/router'
import { PCDevice } from '@/lib/simulation/devices/pc'

export interface TerminalActions {
  inject: (cmd: string) => void
  clear: () => void
}

interface Props {
  deviceId: string
  actionsRef?: React.MutableRefObject<TerminalActions | null>
  onModeChange?: (mode: string) => void
  onIpChange?: (ip: string | undefined) => void
}

const globalTerminalHistory = new Map<string, string[]>()

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
  if (line.trim().startsWith('!') || line.trim().startsWith('#')) {
    return `\x1b[38;5;240m${line}\x1b[0m`
  }
  
  const tokens = line.split(/(\s+)/)
  const highlighted = tokens.map(token => {
    if (/^\s+$/.test(token)) return token
    const lower = token.toLowerCase()
    
    if (brand === 'Cisco') {
      if (['show', 'ping', 'traceroute', 'write', 'copy', 'clear', 'debug', 'undebug', 'reload'].includes(lower)) {
        return `\x1b[38;5;220m${token}\x1b[0m` // Gold/Yellow
      }
      if (['configure', 'terminal', 'interface', 'router', 'access-list', 'ip', 'no', 'shutdown', 'description', 'speed', 'bandwidth', 'duplex'].includes(lower)) {
        return `\x1b[38;5;117m${token}\x1b[0m` // Sky Blue
      }
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(token)) {
        return `\x1b[38;5;84m${token}\x1b[0m` // Neon Green for IPs
      }
      if (/^\d+$/.test(token)) {
        return `\x1b[38;5;209m${token}\x1b[0m` // Warm Orange for numbers
      }
    } else {
      if (['show', 'display', 'ping', 'ip', 'interface', 'configure', 'set', 'delete', 'commit', 'exit', 'quit', 'sys', 'system-view', 'ls', 'cat', 'cd', 'ifconfig', 'sudo'].includes(lower)) {
        return `\x1b[38;5;117m${token}\x1b[0m`
      }
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(token)) {
        return `\x1b[38;5;84m${token}\x1b[0m`
      }
      if (/^\d+$/.test(token)) {
        return `\x1b[38;5;209m${token}\x1b[0m`
      }
    }
    return token
  })
  
  return highlighted.join('')
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
    while (!s.toLowerCase().startsWith(prefix.toLowerCase()))
      prefix = prefix.slice(0, -1)
    if (!prefix) return ''
  }
  return prefix
}

function devPrompt(deviceId: string): string {
  return (engine.getDevice(deviceId) as any)?.getPrompt?.() ?? '\x1b[32m> \x1b[0m'
}

/** Detect what CLI mode a device is currently in (for status bar) */
function getDeviceMode(deviceId: string): string {
  const dev = engine.getDevice(deviceId) as any
  if (!dev) return 'user'
  const cli = dev.cli as any
  if (!cli) {
    // PC device — detect by brand/subtype
    if (dev.subtype === 'server') return 'linux'
    if (dev.brand === 'Apple') return 'macos'
    return 'windows'
  }
  return cli.mode ?? 'user'
}

function getDeviceIp(deviceId: string): string | undefined {
  const dev = engine.getDevice(deviceId) as any
  if (!dev) return undefined
  // Router: first interface with IP
  if (dev.type === 'router') {
    for (const iface of (dev.interfaces?.values() ?? [])) {
      if (iface.ip) return iface.ip
    }
    return undefined
  }
  // PC/Server
  if (dev.iface?.ip) return dev.iface.ip
  return undefined
}

export function DeviceTerminal({ deviceId, actionsRef, onModeChange, onIpChange }: Props) {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitRef   = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!termRef.current || xtermRef.current) return

    const term = new XTerm({
      theme: {
        background:          '#0a0e17',
        foreground:          '#c9d1d9',
        cursor:              '#58a6ff',
        cursorAccent:        '#0a0e17',
        selectionBackground: '#264f7840',
        selectionForeground: '#ffffff',
        black:   '#161b22', brightBlack:   '#30363d',
        red:     '#f85149', brightRed:     '#f85149',
        green:   '#3fb950', brightGreen:   '#3fb950',
        yellow:  '#d29922', brightYellow:  '#e3b341',
        blue:    '#388bfd', brightBlue:    '#79c0ff',
        magenta: '#bc8cff', brightMagenta: '#d2a8ff',
        cyan:    '#39c5cf', brightCyan:    '#56d364',
        white:   '#b1bac4', brightWhite:   '#f0f6fc',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", Menlo, monospace',
      fontSize: 13.5,
      lineHeight: 1.55,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      padding: 10,
      allowProposedApi: true,
    } as any)

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(termRef.current)
    fit.fit()
    xtermRef.current = term
    fitRef.current   = fit

    const dev = engine.getDevice(deviceId) as any
    if (dev) {
      const banner: string[] | undefined = dev.getBanner?.()
      if (banner) {
        for (const l of banner) term.writeln(l)
      } else {
        term.writeln(`\x1b[32mPacketRoqy — ${dev.name}\x1b[0m`)
        term.writeln('')
      }
    }

    const getPrompt = () => devPrompt(deviceId)
    term.write(getPrompt())

    let line    = ''
    let cursor  = 0
    if (!globalTerminalHistory.has(deviceId)) globalTerminalHistory.set(deviceId, [])
    const hist = globalTerminalHistory.get(deviceId)!
    let histIdx = -1
    let histSaved = ''
    let prevTargetRow = 0
    let ghostText = ''
    let currentExecId = 0

    function redraw() {
      const promptStr = getPrompt()
      const promptVisLen = stripAnsi(promptStr).length
      const cols = term.cols || 80
      const device = engine.getDevice(deviceId) as any
      const brand = device?.brand ?? 'Cisco'
      
      ghostText = ''
      if (line.trim().length > 0 && cursor === line.length) {
        const all: string[] = device?.getCompletions?.(line) ?? []
        let match = ''
        if (all.length > 0) {
          match = all.find((c: string) => c.toLowerCase().startsWith(line.toLowerCase())) || ''
        }
        
        if (!match && hist.length > 0) {
          const histMatch = [...hist].reverse().find(c => c.toLowerCase().startsWith(line.toLowerCase()))
          if (histMatch) match = histMatch
        }

        if (match && match.length > line.length) {
          ghostText = match.slice(line.length)
        }
      }

      if (prevTargetRow > 0) term.write(`\x1b[${prevTargetRow}A`)
      term.write('\r')
      term.write('\x1b[J')
      term.write(promptStr)
      term.write(highlightLine(line, brand))
      
      if (ghostText) {
        term.write(`\x1b[38;5;244m${ghostText}\x1b[0m`)
      }

      const totalLen = promptVisLen + line.length + ghostText.length
      let endRow = Math.floor(totalLen / cols)
      let endCol = totalLen % cols
      if (endCol === 0 && totalLen > 0) {
        endRow--
        endCol = cols
      }

      const targetPos = promptVisLen + cursor
      let targetRow = Math.floor(targetPos / cols)
      let targetCol = targetPos % cols
      if (targetCol === 0 && targetPos > 0) {
        targetRow--
        targetCol = cols
      } else {
        targetCol++
      }

      const rowsUp = endRow - targetRow
      if (rowsUp > 0) term.write(`\x1b[${rowsUp}A`)
      term.write(`\x1b[${targetCol}G`)
      
      prevTargetRow = targetRow
    }

    function resetDrawnRows() { prevTargetRow = 0 }

    function insert(ch: string) {
      line   = line.slice(0, cursor) + ch + line.slice(cursor)
      cursor++
      redraw()
    }

    function deleteBack() {
      if (cursor === 0) return
      line   = line.slice(0, cursor - 1) + line.slice(cursor)
      cursor--
      redraw()
    }

    function deleteFwd() {
      if (cursor >= line.length) return
      line = line.slice(0, cursor) + line.slice(cursor + 1)
      redraw()
    }

    function histUp() {
      if (histIdx === -1) histSaved = line
      if (histIdx < hist.length - 1) {
        histIdx++
        line   = hist[hist.length - 1 - histIdx]
        cursor = line.length
        redraw()
      }
    }

    function histDown() {
      if (histIdx > 0) {
        histIdx--
        line   = hist[hist.length - 1 - histIdx]
        cursor = line.length
        redraw()
      } else if (histIdx === 0) {
        histIdx = -1
        line    = histSaved
        cursor  = line.length
        redraw()
      }
    }

    function doTab() {
      const device = engine.getDevice(deviceId) as any
      const all: string[] = device?.getCompletions?.(line) ?? []
      if (!all.length) { term.write('\x07'); return }

      if (all.length === 1) {
        line   = all[0].endsWith(' ') ? all[0] : all[0] + ' '
        cursor = line.length
        redraw()
        return
      }

      const lcp = longestCommonPrefix(all)
      if (lcp.length > line.length) {
        line   = lcp
        cursor = line.length
      }

      term.writeln('')
      const colW = Math.max(...all.map(c => c.length)) + 3
      const perRow = Math.max(1, Math.floor((term.cols - 4) / colW))
      for (let i = 0; i < Math.min(all.length, 30); i += perRow) {
        let row = '  '
        for (let j = 0; j < perRow && i + j < all.length; j++) {
          const item = all[i + j]
          const isKw = !item.endsWith(' ')
          row += (isKw ? '\x1b[36m' : '\x1b[38;5;244m') + item.padEnd(colW) + '\x1b[0m'
        }
        term.writeln(row)
      }
      if (all.length > 30) term.writeln(`  \x1b[38;5;244m... and ${all.length - 30} more\x1b[0m`)
      redraw()
    }

    const handleCommand = async (cmd: string) => {
      const execId = currentExecId
      const device = engine.getDevice(deviceId)
      if (!device) return

      const result = device.executeCommand(cmd)
      const sync   = result.filter(l => !l.startsWith('__ASYNC_'))
      const async_ = result.filter(l => l.startsWith('__ASYNC_'))

      for (let i = 0; i < sync.length; i++)
        writeLine(term, sync[i], i === sync.length - 1 && async_.length === 0)

      resetDrawnRows()
      useNetworkStore.getState().refreshSnapshot(deviceId)

      // Notify parent of mode/ip change
      onModeChange?.(getDeviceMode(deviceId))
      onIpChange?.(getDeviceIp(deviceId))

      for (const s of async_) {
        if (execId !== currentExecId) return
        if (s.startsWith('__ASYNC_PING__')) {
          const target = s.slice(14)
          term.writeln(`\x1b[33mPinging ${target}...\x1b[0m`)
          let lines: string[]
          if (device.type === 'router')                               lines = await (device as RouterDevice).ping(target)
          else if (device.type === 'pc' || device.type === 'server') lines = await (device as PCDevice).ping(target)
          else lines = ['ping not supported']
          if (execId !== currentExecId) return
          for (const l of lines) term.writeln(colorizeOutput(l))
          resetDrawnRows()
          term.write(getPrompt())
          onModeChange?.(getDeviceMode(deviceId))
          onIpChange?.(getDeviceIp(deviceId))
        } else if (s.startsWith('__ASYNC_TRACE__')) {
          const target = s.slice(15)
          term.writeln(`\x1b[33mTracing route to ${target}...\x1b[0m`)
          let lines: string[]
          if (device.type === 'router')                               lines = await (device as RouterDevice).traceroute(target)
          else if (device.type === 'pc' || device.type === 'server') lines = await (device as PCDevice).traceroute(target)
          else lines = ['traceroute not supported']
          if (execId !== currentExecId) return
          for (const l of lines) term.writeln(colorizeOutput(l))
          resetDrawnRows()
          term.write(getPrompt())
          onModeChange?.(getDeviceMode(deviceId))
          onIpChange?.(getDeviceIp(deviceId))
        }
      }
    }

    // Expose actions to parent
    if (actionsRef) {
      actionsRef.current = {
        inject: async (cmd: string) => {
          term.write(`${getPrompt()}${cmd}`)
          term.writeln('')
          if (cmd && hist[hist.length - 1] !== cmd) hist.push(cmd)
          histIdx = -1; histSaved = ''
          line = ''; cursor = 0
          await handleCommand(cmd)
        },
        clear: () => {
          term.write('\x1b[2J\x1b[H')
          term.write(getPrompt())
          term.write(line)
          if (line.length - cursor > 0) term.write(`\x1b[${line.length - cursor}D`)
        },
      }
    }

    term.onKey(({ key, domEvent: ev }) => {
      if (ev.ctrlKey && !ev.altKey) {
        switch (ev.key.toLowerCase()) {
          case 'c':
            if (term.hasSelection()) {
              navigator.clipboard.writeText(term.getSelection())
              return
            }
            term.writeln('^C')
            line = ''; cursor = 0; histIdx = -1; ghostText = ''
            currentExecId++
            term.write(getPrompt())
            return
          case 'l':
            term.write('\x1b[2J\x1b[H')
            term.write(getPrompt())
            term.write(line)
            if (line.length - cursor > 0) term.write(`\x1b[${line.length - cursor}D`)
            return
          case 'a': cursor = 0; redraw(); return
          case 'e': cursor = line.length; redraw(); return
          case 'u': line = line.slice(cursor); cursor = 0; redraw(); return
          case 'k': line = line.slice(0, cursor); redraw(); return
          case 'w': {
            let i = cursor
            while (i > 0 && line[i - 1] === ' ') i--
            while (i > 0 && line[i - 1] !== ' ') i--
            line = line.slice(0, i) + line.slice(cursor)
            cursor = i; redraw(); return
          }
          case 'p': histUp(); return
          case 'n': histDown(); return
          case 'b': if (cursor > 0) { cursor--; redraw() } return
          case 'f': if (cursor < line.length) { cursor++; redraw() } return
          case 'd':
            if (line.length === 0) { term.writeln('logout'); return }
            deleteFwd(); return
        }
        return
      }

      if (ev.keyCode === 13) {
        term.writeln('')
        const cmd = line.trim()
        if (cmd && hist[hist.length - 1] !== cmd) hist.push(cmd)
        histIdx = -1; histSaved = ''
        line = ''; cursor = 0
        if (cmd) handleCommand(cmd)
        else term.write(getPrompt())
        return
      }

      if (ev.key === 'Tab') { ev.preventDefault(); doTab(); return }
      if (ev.key === 'Backspace') { ev.preventDefault(); deleteBack(); return }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); histUp(); return }
      if (ev.key === 'ArrowDown') { ev.preventDefault(); histDown(); return }
      
      if (ev.ctrlKey && ev.key === 'ArrowLeft') {
        ev.preventDefault()
        let i = cursor
        while (i > 0 && line[i - 1] === ' ') i--
        while (i > 0 && line[i - 1] !== ' ') i--
        cursor = i; redraw(); return
      }
      if (ev.ctrlKey && ev.key === 'ArrowRight') {
        ev.preventDefault()
        let i = cursor
        while (i < line.length && line[i] === ' ') i++
        while (i < line.length && line[i] !== ' ') i++
        cursor = i; redraw(); return
      }

      if (ev.key === 'ArrowLeft') {
        ev.preventDefault()
        if (cursor > 0) { cursor--; redraw() }
        return
      }
      if (ev.key === 'ArrowRight') {
        ev.preventDefault()
        if (cursor < line.length) { cursor++; redraw() }
        else if (ghostText) { line += ghostText; cursor = line.length; redraw() }
        return
      }
      if (ev.key === 'Home') { ev.preventDefault(); cursor = 0; redraw(); return }
      if (ev.key === 'End') { ev.preventDefault(); cursor = line.length; redraw(); return }
      if (ev.key === 'Delete') { ev.preventDefault(); deleteFwd(); return }

      if (key && key.length === 1 && key.charCodeAt(0) >= 32 && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        insert(key)
      }
    })

    const handlePaste = async (e: Event) => {
      e.preventDefault()
      const data = (e as ClipboardEvent).clipboardData?.getData('text/plain') || ''
      const pasteExecId = currentExecId
      const lines = data.split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) {
        if (pasteExecId !== currentExecId) return
        const l = lines[i]
        if (i < lines.length - 1 || l.trim() !== '') {
           term.write(l)
           term.writeln('')
           const cmd = (line + l).trim()
           if (cmd && hist[hist.length - 1] !== cmd) hist.push(cmd)
           histIdx = -1; histSaved = ''
           line = ''; cursor = 0
           if (cmd) await handleCommand(cmd)
           else term.write(getPrompt())
        } else {
           line += l
           cursor += l.length
           redraw()
        }
      }
    }
    const handleCopy = (e: Event) => {
      const clipboardEvent = e as ClipboardEvent
      if (term.hasSelection()) {
        clipboardEvent.clipboardData?.setData('text/plain', term.getSelection())
        clipboardEvent.preventDefault()
      }
    }

    if (term.textarea) {
      term.textarea.addEventListener('paste', handlePaste)
      term.textarea.addEventListener('copy', handleCopy)
    }

    const obs = new ResizeObserver(() => fit.fit())
    obs.observe(termRef.current!)

    // Initial mode/ip report
    onModeChange?.(getDeviceMode(deviceId))
    onIpChange?.(getDeviceIp(deviceId))

    return () => {
      obs.disconnect()
      if (term.textarea) {
        term.textarea.removeEventListener('paste', handlePaste)
        term.textarea.removeEventListener('copy', handleCopy)
      }
      term.dispose()
      xtermRef.current = null
      if (actionsRef) actionsRef.current = null
    }
  }, [deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={termRef} className="w-full h-full" />
}
