'use client'
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import { useNetworkStore } from '@/lib/store/network'
import type { RouterSnapshot, PCSnapshot, SwitchSnapshot, DeviceSnapshot } from '@/lib/simulation/types'

const FADE_MS = 2000

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortIf(handle: string | null | undefined): string {
  const name = handle?.split('::')[1] ?? ''
  return name
    .replace('GigabitEthernet', 'Gi')
    .replace('FastEthernet', 'Fa')
    .replace(/^ge-(\d+\/\d+\/\d+)$/, 'ge-$1')
    .replace(/^ether(\d+)$/, 'eth$1')
    .replace('GigabitEthernet0/0/', 'GE0/0/')
}

function ifaceIsLive(snap: DeviceSnapshot | undefined, ifName: string): boolean {
  if (!snap) return false
  if (snap.type === 'router') {
    const iface = (snap as RouterSnapshot).interfaces.find(i => i.name === ifName)
    return !!(iface && iface.status === 'up' && iface.ip)
  }
  if (snap.type === 'pc' || snap.type === 'server') {
    const pc = snap as PCSnapshot
    return !!(pc.iface.status === 'up' && pc.iface.ip)
  }
  if (snap.type === 'switch') return (snap as SwitchSnapshot).portCount > 0
  return false
}

// ── Edge label position hook ──────────────────────────────────────────────────

function useEdgeLabelPos(
  ref: React.RefObject<HTMLDivElement | null>,
  x: number, y: number, angleDeg: number, visible: boolean,
) {
  useLayoutEffect(() => {
    if (!ref.current) return
    ref.current.style.setProperty('--ex', `${x}px`)
    ref.current.style.setProperty('--ey', `${y}px`)
    ref.current.style.setProperty('--ea', `${angleDeg}deg`)
  }, [ref, x, y, angleDeg, visible])
}

// ── Fiber pulse capsule ────────────────────────────────────────────────────────
function FiberPulseCapsule({ path, dur, begin = '0s', reverse = false, gradientId, filterId }: {
  path: string; dur: string; begin?: string; reverse?: boolean
  gradientId: string; filterId?: string
}) {
  return (
    <rect width={30} height={4} rx={2} fill={`url(#${gradientId})`}
      filter={filterId ? `url(#${filterId})` : undefined} x={-15} y={-2}
    >
      <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={path} rotate="auto"
        {...(reverse ? { keyPoints: '1;0', keyTimes: '0;1' } : {})} />
    </rect>
  )
}

// ── 3D RJ-45 connector dot ────────────────────────────────────────────────────
function ConnectorDot({ cx, cy, colors }: {
  cx: number; cy: number
  colors: { shadow: string; outer: string; mid: string; lit: string; spec: string }
}) {
  return (
    <g>
      {/* Drop shadow */}
      <circle cx={cx} cy={cy + 1} r={6.5} fill="#000" fillOpacity={0.45} />
      {/* Outer jacket ring */}
      <circle cx={cx} cy={cy}     r={6}   fill={colors.shadow} />
      {/* Body */}
      <circle cx={cx} cy={cy}     r={4.5} fill={colors.mid} />
      {/* Lit face */}
      <circle cx={cx} cy={cy - 1} r={2.5} fill={colors.lit} fillOpacity={0.75} />
      {/* Specular dot */}
      <circle cx={cx} cy={cy - 1.5} r={1} fill={colors.spec} fillOpacity={0.9} />
    </g>
  )
}

// ── Cable color palettes ────────────────────────────────────────────────────
// Jacket colors devem contrastar com o canvas escuro (#060b10)
// sem isso o cabo some e só aparece a linha especular fina

const PALETTE = {
  dead: {
    shadow: '#020408',
    outer:  '#111e2e',  // slate visível
    mid:    '#1c3048',  // corpo principal
    lit:    '#2a4665',  // face iluminada
    spec:   '#4a7298',  // especular fria
  },
  live: {
    shadow: '#020805',
    outer:  '#0c2016',  // verde escuro visível
    mid:    '#163d22',  // corpo principal verde
    lit:    '#225c35',  // face iluminada
    spec:   '#4ade80',  // especular verde brilhante
  },
  selected: {
    shadow: '#020408',
    outer:  '#0e1e38',
    mid:    '#1c3460',
    lit:    '#2e5090',
    spec:   '#60a5fa',  // especular azul brilhante
  },
}

// ── Main component ────────────────────────────────────────────────────────────

function TrafficEdgeInner({
  id,
  sourceX, sourceY, targetX, targetY,
  selected,
  sourceHandleId: sourceHandle, targetHandleId: targetHandle,
}: EdgeProps) {
  const fwdTs     = useNetworkStore(s => s.edgeActivity[id]?.fwdTs ?? 0)
  const revTs     = useNetworkStore(s => s.edgeActivity[id]?.revTs ?? 0)
  const frameType = useNetworkStore(s => s.edgeActivity[id]?.frameType ?? 'ip')

  const snapshots = useNetworkStore(s => s.deviceSnapshots)
  const nodes     = useNetworkStore(s => s.nodes)
  const edges     = useNetworkStore(s => s.edges)

  const [fwdActive, setFwdActive] = useState(false)
  const [revActive, setRevActive] = useState(false)
  const fwdTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const revTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (fwdTs === 0) return
    setFwdActive(true)
    clearTimeout(fwdTimer.current)
    fwdTimer.current = setTimeout(() => setFwdActive(false), FADE_MS)
    return () => clearTimeout(fwdTimer.current)
  }, [fwdTs])

  useEffect(() => {
    if (revTs === 0) return
    setRevActive(true)
    clearTimeout(revTimer.current)
    revTimer.current = setTimeout(() => setRevActive(false), FADE_MS)
    return () => clearTimeout(revTimer.current)
  }, [revTs])

  const isLive: boolean = (() => {
    const edge = edges.find(e => e.id === id)
    if (!edge) return false
    const srcNode = nodes.find(n => n.id === edge.source)
    const tgtNode = nodes.find(n => n.id === edge.target)
    if (!srcNode || !tgtNode) return false
    const srcIfName = (sourceHandle ?? '').split('::')[1] ?? ''
    const tgtIfName = (targetHandle ?? '').split('::')[1] ?? ''
    return (
      ifaceIsLive(snapshots[srcNode.data.deviceId], srcIfName) &&
      ifaceIsLive(snapshots[tgtNode.data.deviceId], tgtIfName)
    )
  })()

  // ── Cable path ────────────────────────────────────────────────────────────
  const dx  = targetX - sourceX
  const dy  = targetY - sourceY
  const L   = Math.sqrt(dx * dx + dy * dy) || 1
  const sag = Math.min(L * 0.18, 55)

  const cp1x = sourceX + dx * 0.25
  const cp1y = sourceY + dy * 0.25 + sag
  const cp2x = sourceX + dx * 0.75
  const cp2y = sourceY + dy * 0.75 + sag
  const path = `M ${sourceX},${sourceY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${targetX},${targetY}`

  const labelX = (sourceX + 3 * cp1x + 3 * cp2x + targetX) / 8
  const labelY = (sourceY + 3 * cp1y + 3 * cp2y + targetY) / 8

  const px = -dy / L
  const py =  dx / L

  // Angle for rotating labels to match cable direction, never upside-down
  let cableAngle = Math.atan2(dy, dx) * 180 / Math.PI
  if (cableAngle > 90)  cableAngle -= 180
  if (cableAngle < -90) cableAngle += 180

  // 18px perpendicular = just clears cable surface (W/2=7px + label half-height~9px + 2px gap)
  const OFF = 18
  const labelSrcX = sourceX + dx * 0.15 + px * OFF
  const labelSrcY = sourceY + dy * 0.15 + py * OFF
  const labelTgtX = sourceX + dx * 0.85 + px * OFF
  const labelTgtY = sourceY + dy * 0.85 + py * OFF

  const isActive   = fwdActive || revActive
  const gradId     = frameType === 'arp' ? 'arpPulseGrad' : 'ipPulseGrad'
  const pal        = selected ? PALETTE.selected : isLive ? PALETTE.live : PALETTE.dead

  // Cable layer widths — diâmetro 14px dá espessura física real
  const W = 14
  const wOuter  = W           // borda escura externa
  const wMid    = W * 0.80    // corpo principal (cor mais visível)
  const wLit    = W * 0.48    // face iluminada (topo do cilindro)
  const wSpec   = W * 0.18    // linha especular brilhante (~2.5px)

  const srcLabel = shortIf(sourceHandle)
  const tgtLabel = shortIf(targetHandle)

  const edge    = edges.find(e => e.id === id)
  const srcName = nodes.find(n => n.id === edge?.source)?.data.label ?? ''
  const tgtName = nodes.find(n => n.id === edge?.target)?.data.label ?? ''

  // Label rente ao cabo — offset mínimo para não sobrepor o fio (W/2 + 2px)
  const midLabelX = labelX + px * 14
  const midLabelY = labelY + py * 14

  const srcLabelRef   = useRef<HTMLDivElement>(null)
  const tgtLabelRef   = useRef<HTMLDivElement>(null)
  const protoBadgeRef = useRef<HTMLDivElement>(null)

  const showIf    = !!(selected && (srcLabel || tgtLabel))
  const showProto = !!(isActive && !selected)

  useEdgeLabelPos(srcLabelRef,   labelSrcX, labelSrcY, cableAngle, showIf)
  useEdgeLabelPos(tgtLabelRef,   labelTgtX, labelTgtY, cableAngle, showIf)
  useEdgeLabelPos(protoBadgeRef, labelX,    labelY,    0,          showProto)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes energyFlow { from { stroke-dashoffset: 50; } to { stroke-dashoffset: 0; } }
        .energy-live      { stroke-dasharray: 10,20; animation: energyFlow 3.8s linear infinite; }
        .energy-active    { stroke-dasharray: 4,6;   animation: energyFlow 0.7s linear infinite; }
        .cable-transition { transition: stroke 0.35s ease; }
        .cable-spec-transition { transition: stroke 0.35s ease, stroke-opacity 0.35s ease; }
      `}} />

      <defs>
        <linearGradient id="ipPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1d4ed8" stopOpacity="0"/>
          <stop offset="50%"  stopColor="#3b82f6" stopOpacity="0.6"/>
          <stop offset="85%"  stopColor="#93c5fd" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#eff6ff"  stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="arpPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#92400e" stopOpacity="0"/>
          <stop offset="50%"  stopColor="#f59e0b" stopOpacity="0.6"/>
          <stop offset="85%"  stopColor="#fcd34d" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#fefce8"  stopOpacity="1"/>
        </linearGradient>

        {/* Neon glow */}
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Cable drop shadow */}
        <filter id="cableDrop" x="-20%" y="-60%" width="140%" height="260%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.7"/>
        </filter>
      </defs>

      {/* ── Ambient glow ───────────────────────────────────────────────────── */}
      {isLive && !isActive && (
        <>
          <path d={path} fill="none" stroke="#22c55e" strokeWidth={26} strokeOpacity={0.04} strokeLinecap="round"/>
          <path d={path} fill="none" stroke="#22c55e" strokeWidth={14} strokeOpacity={0.08} strokeLinecap="round"/>
        </>
      )}
      {isActive && (
        <>
          <path d={path} fill="none"
            stroke={frameType === 'arp' ? '#f59e0b' : '#3b82f6'}
            strokeWidth={32} strokeOpacity={0.04} strokeLinecap="round"/>
          <path d={path} fill="none"
            stroke={frameType === 'arp' ? '#f59e0b' : '#3b82f6'}
            strokeWidth={16} strokeOpacity={0.14} strokeLinecap="round"/>
        </>
      )}

      {/* ── Drop shadow cast by cable on canvas ───────────────────────────── */}
      <path d={path} fill="none" stroke="#000" strokeWidth={wOuter + 2}
        strokeOpacity={0.55} strokeLinecap="round" filter="url(#cableDrop)"/>

      {/* ── 3D cylinder layer stack ────────────────────────────────────────
           Widest dark stroke = outer jacket (bottom & sides of cylinder)
           Narrower mid stroke = main body tone
           Narrow lit stroke   = upper illuminated face
           Thin specular       = bright reflection line at top              */}

      {/* Layer 1 — outer jacket / shadow edge */}
      <path d={path} fill="none" stroke={pal.outer} strokeWidth={wOuter}
        strokeLinecap="round" className="cable-transition"/>

      {/* Layer 2 — mid-tone body */}
      <path d={path} fill="none" stroke={pal.mid} strokeWidth={wMid}
        strokeLinecap="round" className="cable-transition"/>

      {/* Layer 3 — illuminated face */}
      <path d={path} fill="none" stroke={pal.lit} strokeWidth={wLit}
        strokeLinecap="round" className="cable-transition"/>

      {/* Layer 4 — specular highlight (thin bright line along top) */}
      <path d={path} fill="none" stroke={pal.spec} strokeWidth={wSpec}
        strokeLinecap="round" strokeOpacity={isLive ? 0.8 : 0.4}
        className="cable-spec-transition"/>

      {/* ── BaseEdge (invisible, keeps ReactFlow interaction hitbox) ──────── */}
      <BaseEdge path={path} style={{ stroke: 'transparent', strokeWidth: wOuter + 4 }}/>

      {/* ── Carrier energy line ────────────────────────────────────────────── */}
      {isLive && !isActive && (
        <path d={path} fill="none" stroke={pal.spec}
          strokeWidth={1.1} strokeOpacity={0.45} className="energy-live" strokeLinecap="round"/>
      )}
      {isActive && (
        <path d={path} fill="none"
          stroke={frameType === 'arp' ? '#fbbf24' : '#60a5fa'}
          strokeWidth={1.4} strokeOpacity={0.9} className="energy-active" strokeLinecap="round"/>
      )}

      {/* ── Traffic pulses ─────────────────────────────────────────────────── */}
      {fwdActive && (
        <>
          <FiberPulseCapsule path={path} dur="0.40s" begin="0s"    gradientId={gradId} filterId="neonGlow"/>
          <FiberPulseCapsule path={path} dur="0.40s" begin="0.13s" gradientId={gradId} filterId="neonGlow"/>
        </>
      )}
      {revActive && (
        <>
          <FiberPulseCapsule path={path} dur="0.40s" begin="0s"    reverse gradientId={gradId} filterId="neonGlow"/>
          <FiberPulseCapsule path={path} dur="0.40s" begin="0.13s" reverse gradientId={gradId} filterId="neonGlow"/>
        </>
      )}

      {/* ── RJ-45 connector dots ───────────────────────────────────────────── */}
      <ConnectorDot cx={sourceX} cy={sourceY} colors={pal}/>
      <ConnectorDot cx={targetX} cy={targetY} colors={pal}/>

      {/* ── Port labels — paralelos ao cabo, um em cada extremidade ─────────── */}
      {showIf && (
        <>
          <EdgeLabelRenderer>
            <div ref={srcLabelRef} className="edge-label pointer-events-none select-none">
              <span className={`flex items-center gap-1 px-1.5 py-px font-mono text-[10px] font-bold tracking-[0.04em] border whitespace-nowrap
                ${isLive
                  ? 'text-[#4ade80] border-[rgba(74,222,128,0.3)] bg-[rgba(2,8,4,0.95)]'
                  : 'text-[#3a5870] border-[#0e2038] bg-[rgba(4,8,18,0.95)]'}`}>
                <span className={`w-1 h-1 rounded-full shrink-0 ${isLive ? 'bg-[#4ade80]' : 'bg-[#1e3050]'}`}/>
                <span className={`text-[9px] font-normal ${isLive ? 'text-[rgba(74,222,128,0.55)]' : 'text-[#253a50]'}`}>{srcName}</span>
                <span>{srcLabel || '—'}</span>
              </span>
            </div>
          </EdgeLabelRenderer>
          <EdgeLabelRenderer>
            <div ref={tgtLabelRef} className="edge-label pointer-events-none select-none">
              <span className={`flex items-center gap-1 px-1.5 py-px font-mono text-[10px] font-bold tracking-[0.04em] border whitespace-nowrap
                ${isLive
                  ? 'text-[#4ade80] border-[rgba(74,222,128,0.3)] bg-[rgba(2,8,4,0.95)]'
                  : 'text-[#3a5870] border-[#0e2038] bg-[rgba(4,8,18,0.95)]'}`}>
                <span>{tgtLabel || '—'}</span>
                <span className={`text-[9px] font-normal ${isLive ? 'text-[rgba(74,222,128,0.55)]' : 'text-[#253a50]'}`}>{tgtName}</span>
                <span className={`w-1 h-1 rounded-full shrink-0 ${isLive ? 'bg-[#4ade80]' : 'bg-[#1e3050]'}`}/>
              </span>
            </div>
          </EdgeLabelRenderer>
        </>
      )}

      {/* ── Protocol badge ─────────────────────────────────────────────────── */}
      {showProto && (
        <EdgeLabelRenderer>
          <div ref={protoBadgeRef} className="edge-label pointer-events-none select-none">
            <span className={`px-1.5 py-px font-mono text-[9px] font-bold tracking-[0.1em] border ${
              frameType === 'arp'
                ? 'text-[#fbbf24] border-[rgba(251,191,36,0.3)] bg-[rgba(20,10,0,0.92)]'
                : 'text-[#60a5fa] border-[rgba(96,165,250,0.25)] bg-[rgba(4,8,20,0.92)]'
            }`}>
              {frameType === 'arp' ? 'ARP' : 'IP'}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const TrafficEdge = memo(TrafficEdgeInner)
