'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'
import { useTermWins } from '@/lib/store/termWindows'
import type { TermWinDef } from '@/lib/store/termWindows'
import { TabbedTerminal } from './TabbedTerminal'

function openDetached(deviceId: string, label: string, deviceType: string, brand?: string) {
  const url = `/detached?d=${encodeURIComponent(deviceId)}&l=${encodeURIComponent(label)}&t=${encodeURIComponent(deviceType)}&b=${encodeURIComponent(brand ?? '')}`
  window.open(url, `pq-${deviceId}`, 'width=900,height=640,resizable=yes,scrollbars=no')
}

const MIN_W = 380
const MIN_H = 220

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

function FloatingWindow({
  winId, devices, activeDeviceId,
  x: initX, y: initY, w: initW, h: initH, z,
}: TermWinDef) {
  const {
    closeWindow, closeDevice, focusWindow,
    setActiveDevice, mergeWindows, setDragOver,
    dragOverId, updatePos, updateGeometry,
  } = useTermWins()

  const [pos,       setPos]       = useState({ x: initX, y: initY })
  const [size,      setSize]      = useState({ w: initW, h: initH })
  const [minimized, setMinimized] = useState(false)

  const isDragTarget = dragOverId === winId

  /* ── Drag ─────────────────────────────────────── */
  const onDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, span[role="button"], .fterm-dot'))
      return
    e.preventDefault()
    focusWindow(winId)

    const startMX = e.clientX, startMY = e.clientY
    const startX = pos.x, startY = pos.y
    const curW = size.w
    let lastX = startX, lastY = startY
    let targetId: string | null = null
    let moved = false

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startMX
      const dy = ev.clientY - startMY
      if (!moved && Math.hypot(dx, dy) < 5) return
      moved = true

      lastX = Math.max(0, Math.min(window.innerWidth  - curW,  startX + dx))
      lastY = Math.max(0, Math.min(window.innerHeight - 36,    startY + dy))
      setPos({ x: lastX, y: lastY })

      const { windows } = useTermWins.getState()
      let found: string | null = null
      for (const other of windows) {
        if (other.winId === winId) continue
        if (
          lastX < other.x + other.w && lastX + curW > other.x &&
          lastY < other.y + 36 && lastY + 36 > other.y
        ) { found = other.winId; break }
      }
      if (found !== targetId) { targetId = found; setDragOver(found) }
    }

    const onUp = () => {
      setDragOver(null)
      if (moved && targetId) mergeWindows(winId, targetId)
      else if (moved) updatePos(winId, lastX, lastY)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  /* ── Resize ───────────────────────────────────── */
  const onResizeStart = (e: React.MouseEvent, dir: ResizeDir) => {
    e.preventDefault()
    e.stopPropagation()
    focusWindow(winId)

    const startMX = e.clientX, startMY = e.clientY
    const startX = pos.x, startY = pos.y
    const startW = size.w, startH = size.h
    let lastX = startX, lastY = startY, lastW = startW, lastH = startH

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startMX
      const dy = ev.clientY - startMY
      let nx = startX, ny = startY, nw = startW, nh = startH

      if (dir.includes('e')) nw = Math.max(MIN_W, startW + dx)
      if (dir.includes('w')) { nw = Math.max(MIN_W, startW - dx); nx = startX + startW - nw }
      if (dir.includes('s')) nh = Math.max(MIN_H, startH + dy)
      if (dir.includes('n')) { nh = Math.max(MIN_H, startH - dy); ny = startY + startH - nh }

      lastX = nx; lastY = ny; lastW = nw; lastH = nh
      setPos({ x: nx, y: ny })
      setSize({ w: nw, h: nh })
    }

    const onUp = () => {
      updateGeometry(winId, lastX, lastY, lastW, lastH)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      className={`fterm-window${isDragTarget ? ' fterm-drop-target' : ''}`}
      style={{
        position: 'fixed',
        left: pos.x, top: pos.y,
        zIndex: z,
        width: size.w,
        height: minimized ? 'auto' : size.h,
      }}
      onMouseDown={() => focusWindow(winId)}
    >
      {/* Resize handles */}
      {!minimized && (
        <>
          <div className="fterm-resize fterm-resize-n"  onMouseDown={e => onResizeStart(e, 'n')} />
          <div className="fterm-resize fterm-resize-s"  onMouseDown={e => onResizeStart(e, 's')} />
          <div className="fterm-resize fterm-resize-e"  onMouseDown={e => onResizeStart(e, 'e')} />
          <div className="fterm-resize fterm-resize-w"  onMouseDown={e => onResizeStart(e, 'w')} />
          <div className="fterm-resize fterm-resize-ne" onMouseDown={e => onResizeStart(e, 'ne')} />
          <div className="fterm-resize fterm-resize-nw" onMouseDown={e => onResizeStart(e, 'nw')} />
          <div className="fterm-resize fterm-resize-se" onMouseDown={e => onResizeStart(e, 'se')} />
          <div className="fterm-resize fterm-resize-sw" onMouseDown={e => onResizeStart(e, 'sw')} />
        </>
      )}

      {/* ── Title / tab bar ── */}
      <div className="fterm-titlebar" onMouseDown={onDragStart}>

        {/* Traffic lights */}
        <div className="fterm-tl">
          <span
            className="fterm-dot fterm-dot-close"
            title="Fechar"
            onClick={e => { e.stopPropagation(); closeWindow(winId) }}
            onMouseDown={e => e.stopPropagation()}
          />
          <span
            className="fterm-dot fterm-dot-min"
            title={minimized ? 'Restaurar' : 'Minimizar'}
            onClick={e => { e.stopPropagation(); setMinimized(m => !m) }}
            onMouseDown={e => e.stopPropagation()}
          />
          <span className="fterm-dot fterm-dot-max" />
        </div>

        <div className="fterm-tl-sep" />

        {/* Device tabs */}
        <div className="fterm-devices">
          {devices.map(dev => (
            <button
              key={dev.deviceId}
              className={`fterm-device-tab${dev.deviceId === activeDeviceId ? ' active' : ''}`}
              onClick={e => { e.stopPropagation(); setActiveDevice(winId, dev.deviceId) }}
              onMouseDown={e => e.stopPropagation()}
            >
              <span className="fterm-device-label">{dev.label}</span>
              {devices.length > 1 && (
                <span
                  className="fterm-device-close"
                  role="button"
                  onClick={e => { e.stopPropagation(); closeDevice(winId, dev.deviceId) }}
                  onMouseDown={e => e.stopPropagation()}
                >×</span>
              )}
            </button>
          ))}
        </div>

        <div className="fterm-tl-actions">
          <button
            type="button"
            title="Abrir em nova janela do sistema"
            className="fterm-action-btn"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation()
              const active = devices.find(d => d.deviceId === activeDeviceId) ?? devices[0]
              if (active) openDetached(active.deviceId, active.label, active.deviceType, active.brand)
            }}
          >
            <Monitor className="w-3 h-3" />
          </button>
        </div>

        {isDragTarget && (
          <span className="fterm-drop-hint">← soltar para juntar</span>
        )}
      </div>

      {/* ── Terminal content ── */}
      {!minimized && (
        <div className="fterm-content">
          {devices.map(dev => (
            <div
              key={dev.deviceId}
              className="fterm-device-pane"
              style={{ display: dev.deviceId === activeDeviceId ? 'flex' : 'none' }}
            >
              <TabbedTerminal
                key={dev.deviceId}
                deviceId={dev.deviceId}
                deviceLabel={dev.label}
                brand={dev.brand}
                deviceType={dev.deviceType}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function FloatingTerminalManager() {
  const { windows } = useTermWins()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted || windows.length === 0) return null

  return createPortal(
    <>
      {windows.map(w => <FloatingWindow key={w.winId} {...w} />)}
    </>,
    document.body,
  )
}
