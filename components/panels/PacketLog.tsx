'use client'
import { useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { useNetworkStore } from '@/lib/store/network'
import type { PacketLogEntry } from '@/lib/simulation/types'

const PROTO_CLASS: Record<PacketLogEntry['type'], string> = {
  'arp-req':     'pkt-badge-arp-req',
  'arp-reply':   'pkt-badge-arp-reply',
  'icmp-req':    'pkt-badge-icmp-req',
  'icmp-reply':  'pkt-badge-icmp-reply',
  'icmp-ttl':    'pkt-badge-icmp-ttl',
  'icmp-unreach':'pkt-badge-icmp-unreach',
  'ip-fwd':      'pkt-badge-ip-fwd',
  'info':        'pkt-badge-info',
}

const PROTO_LABEL: Record<PacketLogEntry['type'], string> = {
  'arp-req':     'ARP·REQ',
  'arp-reply':   'ARP·REP',
  'icmp-req':    'ICMP·REQ',
  'icmp-reply':  'ICMP·REP',
  'icmp-ttl':    'TTL·EXC',
  'icmp-unreach':'UNREACH',
  'ip-fwd':      'IP·FWD',
  'info':        'INFO',
}

function fmtTs(ts: number): string {
  const d  = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

export function PacketLog() {
  const { packetLog, clearLog } = useNetworkStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLen   = useRef(0)

  useEffect(() => {
    if (packetLog.length > prevLen.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
    }
    prevLen.current = packetLog.length
  }, [packetLog.length])

  return (
    <div className="pkt-log-root flex flex-col h-full">

      {/* ── Header ── */}
      <div className="pkt-log-header flex items-center gap-3 px-3 h-7 flex-shrink-0">

        <div className="flex items-center gap-1.5">
          <span className="pkt-live-dot w-1.5 h-1.5 rounded-full led-pulse flex-shrink-0" />
          <span className="pkt-live-label text-[10px] font-bold tracking-[0.18em] uppercase">
            Capture
          </span>
        </div>

        <span className="pkt-hdr-sep w-px h-3.5 flex-shrink-0" />

        <span className="pkt-count text-[10px] tabular-nums">
          {packetLog.length > 0 ? `${packetLog.length} entries` : 'no packets'}
        </span>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-4">
          <span className="pkt-col-hdr text-[9px] tracking-[0.12em] uppercase w-[90px]">Timestamp</span>
          <span className="pkt-col-hdr text-[9px] tracking-[0.12em] uppercase w-[68px]">Protocol</span>
          <span className="pkt-col-hdr text-[9px] tracking-[0.12em] uppercase">Source → Dest</span>
        </div>

        <div className="flex-1 hidden lg:block" />

        <button type="button" onClick={clearLog}
          className="pkt-clear-btn flex items-center gap-1 text-[10px] tracking-wider uppercase">
          <Trash2 className="w-3 h-3" />
          CLR
        </button>
      </div>

      {/* ── Feed ── */}
      <div className="pkt-feed flex-1 overflow-y-auto">
        {packetLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
            <span className="pkt-empty-title text-[10px] tracking-[0.18em] uppercase">
              — No Traffic —
            </span>
            <span className="pkt-empty-sub text-[9px]">
              Connect devices and run ping
            </span>
          </div>
        ) : (
          <>
            {packetLog.map((entry, i) => {
              const badgeCls = PROTO_CLASS[entry.type] ?? 'pkt-badge-info'
              const label    = PROTO_LABEL[entry.type] ?? 'INFO'
              const isNew    = i === packetLog.length - 1

              return (
                <div key={entry.id} className={`pkt-row${isNew ? ' new-entry' : ''}`}>

                  <span className="pkt-ts">{fmtTs(entry.timestamp)}</span>

                  <span className={`pkt-badge font-mono font-extrabold ${badgeCls}`}>
                    {label}
                  </span>

                  {entry.srcDevice && (
                    <span className="pkt-src font-mono">{entry.srcDevice}</span>
                  )}
                  {entry.srcIp && (
                    <span className="pkt-ip-label font-mono text-[9px] ml-1 flex-shrink-0">
                      {entry.srcIp}
                    </span>
                  )}

                  {(entry.srcDevice || entry.dstDevice) && (
                    <span className="pkt-arrow">›</span>
                  )}

                  {entry.dstDevice && (
                    <span className="pkt-dst font-mono">{entry.dstDevice}</span>
                  )}
                  {entry.dstIp && (
                    <span className="pkt-ip-label font-mono text-[9px] ml-1 flex-shrink-0">
                      {entry.dstIp}
                    </span>
                  )}

                  <span className="pkt-detail ml-2">{entry.detail}</span>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  )
}
