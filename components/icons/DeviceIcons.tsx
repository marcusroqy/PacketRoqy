import type React from 'react'
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
type PreviewP = P & { brand?: string; model?: string }

// ─── Small square icons (for canvas nodes and toolbar buttons) ────────────────

export function RouterIcon(props: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="9" width="28" height="16" rx="2.5" fill="currentColor" />
      <rect x="2" y="9" width="28" height="16" rx="2.5" stroke="white" strokeOpacity="0.2" strokeWidth="0.8" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={4.5 + i * 7.5} y="12" width="5.5" height="4.5" rx="1" fill="black" fillOpacity="0.55" />
          <rect x={6 + i * 7.5} y="14" width="2.5" height="1" rx="0.4" fill="white" fillOpacity="0.3" />
        </g>
      ))}
      <circle cx="27" cy="13.5" r="1.4" fill="#4ade80" />
      <circle cx="27" cy="18"   r="1.1" fill="#60a5fa" opacity="0.8" />
      <rect x="4.5" y="19" width="4" height="4" rx="0.8" fill="black" fillOpacity="0.4" />
      <circle cx="27" cy="23"   r="1.6" fill="#4ade80" opacity="0.6" />
    </svg>
  )
}

export function SwitchIcon(props: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1" y="11" width="30" height="12" rx="2.5" fill="currentColor" />
      <rect x="1" y="11" width="30" height="12" rx="2.5" stroke="white" strokeOpacity="0.2" strokeWidth="0.8" />
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <rect x={2.5 + i * 3.4} y="13.5" width="2.6" height="3.5" rx="0.5" fill="black" fillOpacity="0.5" />
          <circle cx={3.8 + i * 3.4} cy="18.8" r="0.8" fill="#4ade80" opacity={i < 6 ? 1 : 0.25} />
        </g>
      ))}
      <circle cx="30" cy="22.5" r="1.2" fill="#fbbf24" opacity="0.8" />
    </svg>
  )
}

export function PCIcon(props: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="4" width="24" height="18" rx="2.5" fill="currentColor" />
      <rect x="4" y="4" width="24" height="18" rx="2.5" stroke="white" strokeOpacity="0.18" strokeWidth="0.8" />
      <rect x="7" y="7" width="18" height="12" rx="1.2" fill="black" fillOpacity="0.5" />
      <rect x="9"  y="9"    width="8"  height="1.2" rx="0.4" fill="white" fillOpacity="0.25" />
      <rect x="9"  y="12"   width="5"  height="0.9" rx="0.3" fill="white" fillOpacity="0.15" />
      <rect x="9"  y="14.5" width="10" height="0.9" rx="0.3" fill="white" fillOpacity="0.12" />
      <rect x="14" y="22" width="4" height="5" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="9"  y="27" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.75" />
      <rect x="9"  y="27" width="14" height="3" rx="1.5" stroke="white" strokeOpacity="0.12" strokeWidth="0.6" />
    </svg>
  )
}

export function ServerIcon(props: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1" y="7"  width="30" height="10" rx="2" fill="currentColor" />
      <rect x="1" y="7"  width="30" height="10" rx="2" stroke="white" strokeOpacity="0.18" strokeWidth="0.8" />
      <rect x="1" y="19" width="30" height="8"  rx="2" fill="currentColor" opacity="0.85" />
      <rect x="1" y="19" width="30" height="8"  rx="2" stroke="white" strokeOpacity="0.1" strokeWidth="0.8" />
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={4 + i * 5.5} y="9.5" width="4" height="5" rx="0.8" fill="black" fillOpacity="0.5" />
      ))}
      <circle cx="27" cy="12" r="1.5" fill="#4ade80" />
      {[0, 1, 2].map(i => (
        <rect key={i} x={4 + i * 5.5} y="21.5" width="4" height="3.5" rx="0.8" fill="black" fillOpacity="0.45" />
      ))}
      <circle cx="27" cy="23" r="1.5" fill="#4ade80" opacity="0.7" />
      <circle cx="27" cy="26" r="1.2" fill="#60a5fa" opacity="0.6" />
    </svg>
  )
}

// ─── Brand mark icons (networking vendors) ────────────────────────────────────

export function CiscoBrandIcon(props: P) {
  // 6 pillars in arch profile (Cisco bridge logo)
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1.75"  y="20" width="3.5" height="8"  rx="1.75" fill="currentColor" opacity="0.65"/>
      <rect x="6.75"  y="15" width="3.5" height="13" rx="1.75" fill="currentColor" opacity="0.82"/>
      <rect x="11.75" y="10" width="3.5" height="18" rx="1.75" fill="currentColor"/>
      <rect x="16.75" y="10" width="3.5" height="18" rx="1.75" fill="currentColor"/>
      <rect x="21.75" y="15" width="3.5" height="13" rx="1.75" fill="currentColor" opacity="0.82"/>
      <rect x="26.75" y="20" width="3.5" height="8"  rx="1.75" fill="currentColor" opacity="0.65"/>
    </svg>
  )
}

export function HuaweiBrandIcon(props: P) {
  // 8-petal lotus (Huawei flower logo)
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {angles.map((angle, i) => (
        <ellipse
          key={i}
          cx="16" cy="10" rx="2.5" ry="6.5"
          fill="currentColor"
          opacity={i % 2 === 0 ? 0.95 : 0.6}
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
    </svg>
  )
}

export function JuniperBrandIcon(props: P) {
  // 3-layer pine tree (Juniper Networks motif)
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <polygon points="16,3 22,13 10,13" fill="currentColor"/>
      <polygon points="16,8 25,21 7,21"  fill="currentColor" opacity="0.85"/>
      <polygon points="16,14 27,27 5,27" fill="currentColor" opacity="0.7"/>
      <rect x="14.5" y="27" width="3" height="4" rx="1" fill="currentColor" opacity="0.55"/>
    </svg>
  )
}

export function MikrotikBrandIcon(props: P) {
  // Bold M letterform (MikroTik RouterOS logo)
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3,27 L3,7 L16,20 L29,7 L29,27"
        stroke="currentColor" strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// ─── Topology logo for header ─────────────────────────────────────────────────

export function TopologyLogo(props: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <line x1="16" y1="6"  x2="6"  y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <line x1="16" y1="6"  x2="26" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <line x1="6"  y1="22" x2="26" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      <line x1="16" y1="6"  x2="16" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <circle cx="16" cy="6"  r="3.5" fill="currentColor" />
      <circle cx="6"  cy="22" r="3"   fill="currentColor" />
      <circle cx="26" cy="22" r="3"   fill="currentColor" />
      <circle cx="16" cy="17" r="4"   fill="currentColor" opacity="0.9" />
      <circle cx="16" cy="17" r="2"   fill="white"        opacity="0.3" />
    </svg>
  )
}

// ─── Preview theme helpers ────────────────────────────────────────────────────

type PreviewTheme = { bg1: string; bg2: string; border: string; accent: string; label: string; sub: string }

function routerTheme(brand: string | undefined): PreviewTheme {
  switch (brand) {
    case 'Cisco':    return { bg1: '#0c1a3d', bg2: '#152a5c', border: '#2563eb', accent: '#3b82f6', label: 'CISCO',    sub: 'ISR Series'  }
    case 'Huawei':   return { bg1: '#2a0808', bg2: '#4a1010', border: '#dc2626', accent: '#f87171', label: 'HUAWEI',   sub: 'AR Series'   }
    case 'Juniper':  return { bg1: '#071a0e', bg2: '#0d2a16', border: '#16a34a', accent: '#4ade80', label: 'JUNIPER',  sub: 'MX Series'   }
    case 'MikroTik': return { bg1: '#0c0a1e', bg2: '#16143a', border: '#c2410c', accent: '#f97316', label: 'MIKROTIK', sub: 'CCR Series'  }
    case 'Datacom':  return { bg1: '#001a3d', bg2: '#002a5c', border: '#005FAD', accent: '#0099FF', label: 'DATACOM',  sub: 'DM Series'   }
    default:         return { bg1: '#1a2030', bg2: '#374151', border: '#4b5563', accent: '#9ca3af', label: 'ROUTER',   sub: 'Generic'     }
  }
}

function switchTheme(brand: string | undefined): PreviewTheme {
  switch (brand) {
    case 'Cisco':    return { bg1: '#081508', bg2: '#0d2010', border: '#16a34a', accent: '#4ade80', label: 'CISCO',    sub: 'CATALYST'    }
    case 'Huawei':   return { bg1: '#2a0808', bg2: '#4a1010', border: '#dc2626', accent: '#f87171', label: 'HUAWEI',   sub: 'CLOUDENGINE' }
    case 'Juniper':  return { bg1: '#071a0e', bg2: '#0d2010', border: '#16a34a', accent: '#4ade80', label: 'JUNIPER',  sub: 'EX SERIES'   }
    case 'MikroTik': return { bg1: '#0c0a1e', bg2: '#16143a', border: '#c2410c', accent: '#f97316', label: 'MIKROTIK', sub: 'CRS SERIES'  }
    case 'Datacom':  return { bg1: '#001530', bg2: '#002550', border: '#005FAD', accent: '#0099FF', label: 'DATACOM',  sub: 'DM SERIES'   }
    default:         return { bg1: '#081508', bg2: '#0d2010', border: '#2d4a2d', accent: '#4ade80', label: 'SWITCH',   sub: 'GENERIC'     }
  }
}

export function RouterPreview({ brand, model, ...props }: PreviewP) {
  const normalizedBrand = brand?.trim() || 'Cisco'
  const normalizedModel = model?.trim() || 'ISR 2911'

  // ==========================================
  // HUAWEI ROUTERS
  // ==========================================
  if (normalizedBrand === 'Huawei') {
    if (normalizedModel === 'AR6140') {
      // Huawei AR6140 (Slim 1U SD-WAN branch router) — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ar6140-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1c1e"/>
              <stop offset="100%" stopColor="#111314"/>
            </linearGradient>
            <linearGradient id="ar6140-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="ar6140-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ar6140-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ar6140-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#374151"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#374151"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#ar6140-ch)" filter="url(#ar6140-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#ar6140-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#4b5563" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#cf0a2c" fillOpacity="0.9"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,8],[226,8],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="58" height="34" rx="2" fill="#0d0e0f" stroke="#cf0a2c" strokeWidth="0.7"/>
          <rect x="13" y="9" width="56" height="5" rx="2" fill="#cf0a2c" fillOpacity="0.2"/>
          <circle cx="26" cy="22" r="7" fill="none" stroke="#cf0a2c" strokeWidth="1.2"/>
          <circle cx="26" cy="22" r="3" fill="#cf0a2c"/>
          <circle cx="26" cy="22" r="1.2" fill="white" fillOpacity="0.35"/>
          <text x="48" y="20" fill="#e5e7eb" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.4">HUAWEI</text>
          <text x="48" y="29" fill="#9ca3af" fontSize="4.5" fontFamily="monospace">AR6140</text>
          <text x="35" y="38" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SD-WAN Router</text>
          {/* Section header */}
          <rect x="74" y="5" width="88" height="9" fill="#0e0f10"/>
          <text x="118" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">WAN / LAN PORTS</text>
          {/* LED bezel */}
          <rect x="74" y="14" width="88" height="8" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {[0,1,2,3].map(i => {
            const bx = 77 + i * 22
            return (
              <g key={i}>
                <rect x={bx} y="15.5" width="7" height="5" rx="0.8" fill={i<3?"#4ade80":"#0a1a0a"} opacity={i<3?0.9:0.4} filter={i<3?"url(#ar6140-glow)":undefined}/>
                <rect x={bx+9} y="15.5" width="7" height="5" rx="0.8" fill={i===0?"#fbbf24":"#1a1000"} opacity={i===0?0.85:0.3} filter={i===0?"url(#ar6140-glow)":undefined}/>
              </g>
            )
          })}
          {/* 4 RJ45 ports */}
          {[0,1,2,3].map(i => {
            const px = 74 + i * 22
            return (
              <g key={i}>
                <rect x={px} y="23" width="18" height="15" rx="1.5" fill="#060708" stroke="#3d4044" strokeWidth="0.8"/>
                <rect x={px+1.5} y="24.5" width="15" height="11" rx="1" fill="url(#ar6140-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+2+p*1.7} y="26" width="1.2" height="7" rx="0.3" fill="#b8860b" opacity="0.6"/>
                ))}
                <rect x={px+3} y="35" width="12" height="2" rx="0.4" fill="#030405"/>
                <text x={px+9} y="44" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">GE{i}</text>
              </g>
            )
          })}
          {/* Divider */}
          <line x1="166" y1="5" x2="166" y2="67" stroke="#2d3033" strokeWidth="0.7"/>
          {/* Status section */}
          <rect x="166" y="5" width="30" height="9" fill="#0e0f10"/>
          <text x="181" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
          {([
            {cy:21,color:'#4ade80',label:'SYS',on:true},
            {cy:36,color:'#3b82f6',label:'WAN',on:true},
            {cy:51,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="177" cy={cy} r="5.5" fill="#060708" stroke="#2d3033" strokeWidth="0.6"/>
              <circle cx="177" cy={cy} r="4" fill={color} opacity={on?0.9:0.12} filter={on?"url(#ar6140-glow)":undefined}/>
              {on && <circle cx="176" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.4"/>}
              <text x="186" y={cy+1.8} fill="#4b5563" fontSize="4" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Ventilation */}
          <rect x="200" y="5" width="30" height="9" fill="#0e0f10"/>
          <text x="215" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">VENT</text>
          <rect x="200" y="14" width="30" height="48" rx="1" fill="#080809" stroke="#1a1c1e" strokeWidth="0.4"/>
          {Array.from({length:5}).map((_,i) => (
            <rect key={i} x="202" y={16+i*8} width="26" height="4.5" rx="0.6" fill="#050607" stroke="#131415" strokeWidth="0.4"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'NE40E-X3') {
      // Huawei NE40E-X3 (High-end 3U modular Core Router) — ultra-detailed
      return (
        <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ne40-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e2022"/>
              <stop offset="100%" stopColor="#111314"/>
            </linearGradient>
            <filter id="ne40-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ne40-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ne40-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="6" width="9" height="88" rx="2" fill="#4b5563"/>
          <rect x="231" y="6" width="9" height="88" rx="2" fill="#4b5563"/>
          <rect x="1.5" y="12" width="6" height="12" rx="1.5" fill="#1f2937"/>
          <rect x="1.5" y="74" width="6" height="12" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="12" width="6" height="12" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="74" width="6" height="12" rx="1.5" fill="#1f2937"/>
          {([[4.5,34],[4.5,62],[235.5,34],[235.5,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="96" rx="4" fill="url(#ne40-ch)" filter="url(#ne40-sh)"/>
          <rect x="9" y="2" width="222" height="96" rx="4" fill="url(#ne40-brush)"/>
          <rect x="9" y="2" width="222" height="96" rx="4" stroke="#4b5563" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="5" rx="3" fill="#cf0a2c" fillOpacity="0.9"/>
          <rect x="10" y="93" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,10],[226,10],[14,88],[226,88]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="16" width="68" height="64" rx="2" fill="#0d0e0f" stroke="#cf0a2c" strokeWidth="0.7"/>
          <rect x="13" y="17" width="66" height="6" rx="2" fill="#cf0a2c" fillOpacity="0.2"/>
          {Array.from({length:8}).map((_,i) => {
            const a = (i * Math.PI) / 4
            const r = 9
            const cx2 = 30 + Math.cos(a) * r
            const cy2 = 36 + Math.sin(a) * r
            return <ellipse key={i} cx={cx2} cy={cy2} rx="4" ry="1.8" transform={`rotate(${i*45} ${cx2} ${cy2})`} fill="#cf0a2c" opacity="0.9"/>
          })}
          <circle cx="30" cy="36" r="3" fill="#cf0a2c"/>
          <circle cx="30" cy="36" r="1.2" fill="white" fillOpacity="0.3"/>
          <text x="56" y="32" fill="#e5e7eb" fontSize="7" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">HUAWEI</text>
          <text x="56" y="41" fill="#9ca3af" fontSize="5" fontFamily="monospace">NE40E-X3</text>
          <text x="40" y="52" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">Core Router</text>
          {/* Status LEDs */}
          {([
            {cy:62,color:'#4ade80',label:'PWR',on:true},
            {cy:72,color:'#4ade80',label:'RUN',on:true},
            {cy:82,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="24" cy={cy} r="4" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="24" cy={cy} r="2.8" fill={color} opacity={on?0.9:0.12} filter={on?"url(#ne40-glow)":undefined}/>
              {on && <circle cx="23" cy={cy-1} r="1" fill="white" fillOpacity="0.4"/>}
              <text x="34" y={cy+1.8} fill="#4b5563" fontSize="4" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* 3 LPU module slots */}
          {[0,1,2].map(slot => {
            const sx = 84 + slot * 42
            return (
              <g key={slot}>
                <rect x={sx} y="10" width="38" height="80" rx="2" fill="#0d1117" stroke="#4b5563" strokeWidth="0.6"/>
                {/* Ejector tabs */}
                <rect x={sx} y="12" width="38" height="7" rx="1" fill="#cf0a2c" fillOpacity="0.2"/>
                <rect x={sx} y="79" width="38" height="9" rx="1" fill="#cf0a2c" fillOpacity="0.2"/>
                {/* LED bezel inside slot */}
                <rect x={sx+2} y="20" width="34" height="6" rx="0.8" fill="#080809" stroke="#1e2020" strokeWidth="0.3"/>
                {[0,1].map(p => (
                  <rect key={p} x={sx+4+p*16} y="21.5" width="12" height="3.5" rx="0.6" fill={slot<2?"#4ade80":"#0a1a0a"} opacity={slot<2?0.8:0.3} filter={slot<2?"url(#ne40-glow)":undefined}/>
                ))}
                {/* SFP cages inside slot — 4 per slot */}
                {[0,1,2,3].map(p => {
                  const py = 28 + p * 13
                  return (
                    <g key={p}>
                      <rect x={sx+4} y={py} width="13" height="10" rx="1" fill="#020617" stroke="#ffd700" strokeWidth="0.5"/>
                      <rect x={sx+5} y={py+1} width="11" height="8" fill="#ffd700" fillOpacity="0.25" rx="0.5"/>
                      <rect x={sx+20} y={py} width="13" height="10" rx="1" fill="#020617" stroke="#ffd700" strokeWidth="0.5"/>
                      <rect x={sx+21} y={py+1} width="11" height="8" fill="#ffd700" fillOpacity="0.25" rx="0.5"/>
                    </g>
                  )
                })}
                <text x={sx+19} y="77" textAnchor="middle" fill="#6b7280" fontSize="4" fontFamily="monospace">LPU{slot}</text>
              </g>
            )
          })}
          {/* Right status column */}
          <line x1="210" y1="4" x2="210" y2="96" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="210" y="4" width="20" height="9" fill="#0e0f10"/>
          <text x="220" y="10.5" textAnchor="middle" fill="#6b7280" fontSize="3" fontFamily="monospace">MGMT</text>
          {/* Ventilation slots */}
          <rect x="212" y="14" width="16" height="78" rx="1" fill="#080809" stroke="#1a1c1e" strokeWidth="0.3"/>
          {Array.from({length:12}).map((_,i) => (
            <rect key={i} x="214" y={16+i*6} width="12" height="3.5" rx="0.5" fill="#050607" stroke="#131415" strokeWidth="0.3"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'NetEngine 8000') {
      // Huawei NetEngine 8000 (Carrier-grade high-tech router) — ultra-detailed
      return (
        <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ne8k-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141517"/>
              <stop offset="100%" stopColor="#0d0e10"/>
            </linearGradient>
            <filter id="ne8k-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ne8k-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ne8k-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="6" width="9" height="76" rx="2" fill="#374151"/>
          <rect x="231" y="6" width="9" height="76" rx="2" fill="#374151"/>
          <rect x="1.5" y="12" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="1.5" y="64" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="12" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="64" width="6" height="10" rx="1.5" fill="#1f2937"/>
          {([[4.5,30],[4.5,56],[235.5,30],[235.5,56]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#ne8k-ch)" filter="url(#ne8k-sh)"/>
          <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#ne8k-brush)"/>
          <rect x="9" y="4" width="222" height="80" rx="4" stroke="#4b5563" strokeWidth="0.8"/>
          <rect x="10" y="5" width="220" height="4" rx="3" fill="#cf0a2c" fillOpacity="0.9"/>
          <rect x="10" y="80" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,10],[226,10],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="16" width="58" height="48" rx="2" fill="#cf0a2c"/>
          <rect x="13" y="17" width="56" height="6" rx="2" fill="white" fillOpacity="0.08"/>
          <text x="41" y="30" textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.4">NetEngine</text>
          <text x="41" y="39" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace" fontWeight="bold">8000</text>
          {/* LED display */}
          <rect x="16" y="46" width="50" height="12" rx="1.5" fill="#000" stroke="#374151" strokeWidth="0.5"/>
          <text x="41" y="54.5" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">NE8K</text>
          {/* Section header for 100GE ports */}
          <rect x="74" y="5" width="114" height="9" fill="#0e0f10"/>
          <text x="131" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">100GE HIGH-SPEED PORTS</text>
          {/* LED bezel */}
          <rect x="74" y="14" width="114" height="8" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {[0,1,2,3,4,5,6,7].map(i => {
            const bx = 76 + i * 14
            return (
              <rect key={i} x={bx} y="15.5" width="10" height="5" rx="0.8" fill={i<6?"#4ade80":"#0a1a0a"} opacity={i<6?0.9:0.4} filter={i<6?"url(#ne8k-glow)":undefined}/>
            )
          })}
          {/* 8 Golden 100GE SFP cages */}
          {[0,1,2,3,4,5,6,7].map(i => (
            <g key={i}>
              <rect x={74+i*14} y="23" width="12" height="16" rx="1" fill="#020617" stroke="#ffd700" strokeWidth="0.6"/>
              <rect x={75+i*14} y="24" width="10" height="14" fill="#ffd700" fillOpacity="0.3" rx="0.5"/>
              {/* LED above cage */}
              <circle cx={80+i*14} cy="21.5" r="1" fill={i<6?"#4ade80":"#0a1a0a"} opacity={i<6?0.9:0.4} filter={i<6?"url(#ne8k-glow)":undefined}/>
              <text x={80+i*14} y="46" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{i}</text>
            </g>
          ))}
          {/* Right status */}
          <line x1="192" y1="5" x2="192" y2="83" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="192" y="5" width="38" height="9" fill="#0e0f10"/>
          <text x="211" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
          {([
            {cy:22,color:'#cf0a2c',label:'PWR',on:true},
            {cy:36,color:'#4ade80',label:'RUN',on:true},
            {cy:50,color:'#ef4444',label:'ALM',on:false},
            {cy:64,color:'#3b82f6',label:'NET',on:true},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="203" cy={cy} r="5.5" fill="#060708" stroke="#2d3033" strokeWidth="0.6"/>
              <circle cx="203" cy={cy} r="4" fill={color} opacity={on?0.9:0.12} filter={on?"url(#ne8k-glow)":undefined}/>
              {on && <circle cx="202" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.4"/>}
              <text x="212" y={cy+1.8} fill="#4b5563" fontSize="4" fontFamily="monospace">{label}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'AR169') {
      // Huawei AR169 (SOHO small desktop router) — ultra-detailed
      return (
        <svg viewBox="0 0 180 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ar169-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5f6f7"/>
              <stop offset="100%" stopColor="#e0e2e4"/>
            </linearGradient>
            <linearGradient id="ar169-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1c1e"/>
              <stop offset="100%" stopColor="#0f1012"/>
            </linearGradient>
            <filter id="ar169-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Desktop casing — top highlight + bottom shadow */}
          <rect x="6" y="8" width="168" height="72" rx="6" fill="url(#ar169-ch)" stroke="#c8cdd2" strokeWidth="0.8"/>
          <rect x="8" y="9" width="164" height="8" rx="5" fill="white" fillOpacity="0.5"/>
          <rect x="8" y="74" width="164" height="4" rx="3" fill="black" fillOpacity="0.1"/>
          {/* Brand panel */}
          <rect x="14" y="16" width="54" height="20" rx="2" fill="#cf0a2c"/>
          <rect x="15" y="17" width="52" height="5" rx="2" fill="white" fillOpacity="0.12"/>
          <text x="41" y="29" textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="sans-serif" fontWeight="bold">HUAWEI</text>
          <text x="41" y="38" textAnchor="middle" fill="white" fontSize="5" fontFamily="monospace">AR169</text>
          {/* Wi-Fi badge */}
          <path d="M 130 26 A 5 5 0 0 1 140 26 M 127 22 A 9 9 0 0 1 143 22 M 124 18 A 13 13 0 0 1 146 18" stroke="#6b7280" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <circle cx="135" cy="30" r="2" fill="#4ade80" filter="url(#ar169-glow)"/>
          {/* Section divider */}
          <rect x="14" y="44" width="152" height="6" rx="1" fill="#f0f1f2" stroke="#d1d5db" strokeWidth="0.4"/>
          <text x="90" y="48.5" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">INTERFACES</text>
          {/* 4 RJ45 ports with gold pins */}
          {[0,1,2,3].map(i => {
            const px = 14 + i * 26
            return (
              <g key={i}>
                <rect x={px} y="52" width="20" height="14" rx="1.5" fill="#1e293b" stroke="#9ca3af" strokeWidth="0.6"/>
                <rect x={px+1.5} y="53.5" width="17" height="11" rx="1" fill="url(#ar169-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+2+p*1.9} y="55" width="1.4" height="6" rx="0.3" fill="#b8860b" opacity="0.6"/>
                ))}
                <rect x={px+4} y="64" width="12" height="2" rx="0.3" fill="#0f1218"/>
                {/* Per-port LED */}
                <circle cx={px+10} cy="70.5" r="2.5" fill="#060708" stroke="#2d3033" strokeWidth="0.4"/>
                <circle cx={px+10} cy="70.5" r="1.8" fill={i<3?"#4ade80":"#3b82f6"} opacity={0.9} filter="url(#ar169-glow)"/>
                <text x={px+10} y="77" textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="monospace">{i===0?"WAN":"LAN"+(i)}</text>
              </g>
            )
          })}
          {/* Ventilation dots */}
          <rect x="120" y="52" width="44" height="30" rx="2" fill="#e8eaec" stroke="#d1d5db" strokeWidth="0.4"/>
          {Array.from({length:5}).map((_,col) => (
            <g key={col}>
              {[0,1,2,3].map(row => (
                <circle key={row} cx={124+col*8} cy={56+row*6} r="1.2" fill="#c0c5ca"/>
              ))}
            </g>
          ))}
          {/* Power LED */}
          <circle cx="162" cy="20" r="5" fill="#e0e2e4" stroke="#c8cdd2" strokeWidth="0.6"/>
          <circle cx="162" cy="20" r="3.5" fill="#4ade80" opacity="0.9" filter="url(#ar169-glow)"/>
          <circle cx="161" cy="19" r="1.4" fill="white" fillOpacity="0.4"/>
          <text x="162" y="30" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">PWR</text>
        </svg>
      )
    }

    // Default Huawei AR2220 — Redesigned for realism
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="hw-rtr-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#202224"/>
            <stop offset="100%" stopColor="#131415"/>
          </linearGradient>
          <linearGradient id="hw-port-inner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#070809"/>
            <stop offset="100%" stopColor="#030404"/>
          </linearGradient>
          <filter id="hw-led-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hw-rtr-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="hw-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>

        {/* Rack ears */}
        <rect x="0"   y="4"  width="9" height="64" rx="2" fill="#374151"/>
        <rect x="231" y="4"  width="9" height="64" rx="2" fill="#374151"/>
        <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
          </g>
        ))}

        {/* Main chassis */}
        <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#hw-rtr-ch)"  filter="url(#hw-rtr-sh)"/>
        <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#hw-brush)"/>
        <rect x="9" y="2"  width="222" height="68" rx="3" stroke="#4b5563" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4"  rx="3" fill="#cf0a2c" fillOpacity="0.95"/>
        <rect x="10" y="3" width="220" height="8"  rx="3" fill="white"   fillOpacity="0.05"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black"   fillOpacity="0.4"/>

        {/* Corner screws */}
        {([[14,8],[226,8],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy}   x2={cx+2} y2={cy}   stroke="#3d4044" strokeWidth="0.8"/>
            <line x1={cx}   y1={cy-2} x2={cx}   y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
          </g>
        ))}

        {/* Huawei branding panel */}
        <rect x="12" y="8"  width="60" height="34" rx="2" fill="#0d0e0f" stroke="#cf0a2c" strokeWidth="0.7"/>
        <rect x="13" y="9"  width="58" height="5"  rx="2" fill="#cf0a2c" fillOpacity="0.2"/>
        {/* Huawei 8-petal flower */}
        {Array.from({length:8}).map((_,i) => {
          const a = (i * Math.PI) / 4
          const r = 7
          const cx2 = 26 + Math.cos(a) * r
          const cy2 = 22 + Math.sin(a) * r
          return (
            <ellipse key={i} cx={cx2} cy={cy2} rx="3.5" ry="1.6"
              transform={`rotate(${i*45} ${cx2} ${cy2})`}
              fill="#cf0a2c" opacity="0.9"/>
          )
        })}
        <circle cx="26" cy="22" r="2.5" fill="#cf0a2c"/>
        <circle cx="26" cy="22" r="1"   fill="white" fillOpacity="0.3"/>
        <text x="48" y="22" fill="#e5e7eb" fontSize="7" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">HUAWEI</text>
        <text x="48" y="31" fill="#9ca3af" fontSize="5" fontFamily="monospace">AR2220</text>
        <text x="36" y="40" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">Enterprise Router</text>

        <line x1="76" y1="5" x2="76" y2="67" stroke="#2d3033" strokeWidth="0.8"/>

        {/* GE section header */}
        <rect x="76" y="5" width="84" height="9" fill="#0e0f10"/>
        <text x="118" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">WAN / LAN GIGABIT</text>

        {/* LED bezel panel */}
        <rect x="76" y="14" width="84" height="8" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
        {[0,1,2].map(i => {
          const bx = 79 + i * 28
          return (
            <g key={i}>
              <rect x={bx}   y="15.5" width="7" height="5" rx="0.8" fill={i<2 ? "#4ade80" : "#0a1a0a"} opacity={i<2 ? 0.9 : 0.4} filter={i<2 ? "url(#hw-led-glow)" : undefined}/>
              <rect x={bx+9} y="15.5" width="7" height="5" rx="0.8" fill={i===0 ? "#fbbf24" : "#1a1000"} opacity={i===0 ? 0.85 : 0.3} filter={i===0 ? "url(#hw-led-glow)" : undefined}/>
            </g>
          )
        })}

        {/* 3 RJ45 ports */}
        {[0,1,2].map(i => {
          const px = 76 + i * 28
          return (
            <g key={i}>
              <rect x={px}     y="23" width="23" height="18" rx="2"   fill="#060708" stroke="#3d4044" strokeWidth="0.9"/>
              <rect x={px+1.5} y="24.5" width="20" height="14" rx="1.2" fill="url(#hw-port-inner)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+2.5+p*2.1} y="26" width="1.4" height="8" rx="0.4" fill="#b8860b" opacity="0.6"/>
              ))}
              <rect x={px+4}   y="37.5" width="15" height="2.5" rx="0.5" fill="#030405"/>
              <rect x={px+9.5} y="38.5" width="4"  height="2.5" rx="0.5" fill="#0a0b0c"/>
              <text x={px+11.5} y="47" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">GE{i}</text>
            </g>
          )
        })}

        <line x1="164" y1="5" x2="164" y2="67" stroke="#2d3033" strokeWidth="0.8"/>
        <rect x="164" y="5" width="34" height="9" fill="#0e0f10"/>
        <text x="181" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">MGMT</text>

        {/* CON port */}
        <rect x="165" y="14" width="16" height="18" rx="2" fill="#030405" stroke="#cf0a2c" strokeWidth="0.8"/>
        <rect x="166.5" y="15.5" width="13" height="14" rx="1" fill="#020304"/>
        {[0,1,2,3,4,5,6,7].map(p => (
          <rect key={p} x={167.5+p*1.35} y="17" width="1" height="8" rx="0.3" fill="#b8860b" opacity="0.55"/>
        ))}
        <rect x="169" y="28" width="9" height="2.5" rx="0.5" fill="#060708"/>
        <text x="173" y="38" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">CON</text>

        {/* USB */}
        <rect x="165" y="42" width="16" height="12" rx="1.5" fill="#060708" stroke="#3d4044" strokeWidth="0.7"/>
        <rect x="166.5" y="43.5" width="13" height="9" rx="0.5" fill="#030405"/>
        <rect x="166.5" y="47.5" width="13" height="1" fill="#1a1c1e"/>
        <text x="173" y="60" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">USB</text>

        <line x1="186" y1="5" x2="186" y2="67" stroke="#2d3033" strokeWidth="0.8"/>
        <rect x="186" y="5" width="30" height="9" fill="#0e0f10"/>
        <text x="201" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>

        {([
          {cy:21,color:'#4ade80',label:'SYS',on:true},
          {cy:36,color:'#cf0a2c',label:'RUN',on:true},
          {cy:51,color:'#ef4444',label:'ALM',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="197" cy={cy} r="5.5" fill="#060708" stroke="#2d3033" strokeWidth="0.6"/>
            <circle cx="197" cy={cy} r="4"   fill={color} opacity={on ? 0.9 : 0.12} filter={on ? "url(#hw-led-glow)" : undefined}/>
            {on && <circle cx="196" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.4"/>}
            <text x="206" y={cy+1.8} fill="#4b5563" fontSize="4" fontFamily="monospace">{label}</text>
          </g>
        ))}

        {/* Ventilation */}
        <rect x="18" y="50" width="52" height="14" rx="1.5" fill="#080809" stroke="#1a1c1e" strokeWidth="0.4"/>
        {Array.from({length:9}).map((_,i) => (
          <rect key={i} x={20+i*5.2} y="52" width="3.2" height="10" rx="0.6" fill="#050607" stroke="#131415" strokeWidth="0.4"/>
        ))}
      </svg>
    )
  }

  // ==========================================
  // JUNIPER ROUTERS
  // ==========================================
  if (normalizedBrand === 'Juniper') {
    if (normalizedModel === 'MX240') {
      // Juniper MX240 (Mid-range modular 2U) — ultra-detailed
      return (
        <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="mx240-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a2014"/>
              <stop offset="100%" stopColor="#051009"/>
            </linearGradient>
            <filter id="mx240-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="mx240-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="mx240-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="6" width="9" height="76" rx="2" fill="#334155"/>
          <rect x="231" y="6" width="9" height="76" rx="2" fill="#334155"/>
          <rect x="1.5" y="12" width="6" height="9" rx="1.5" fill="#1e293b"/>
          <rect x="1.5" y="64" width="6" height="9" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="12" width="6" height="9" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="64" width="6" height="9" rx="1.5" fill="#1e293b"/>
          {([[4.5,30],[4.5,58],[235.5,30],[235.5,58]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1e293b" stroke="#334155" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#334155" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#334155" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#mx240-ch)" filter="url(#mx240-sh)"/>
          <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#mx240-brush)"/>
          <rect x="9" y="4" width="222" height="80" rx="4" stroke="#16a34a" strokeWidth="0.8"/>
          <rect x="10" y="5" width="220" height="6" rx="4" fill="white" fillOpacity="0.05"/>
          <rect x="10" y="80" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,10],[226,10],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="14" width="52" height="56" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="15" width="50" height="6" rx="2" fill="#84bd00" fillOpacity="0.1"/>
          <path d="M 20 38 C 20 28 32 24 36 24 C 30 32 28 40 28 40 Z" fill="#84bd00" opacity="0.9"/>
          <path d="M 36 24 C 40 24 44 30 44 38 C 40 34 34 34 28 40 C 28 40 30 32 36 24 Z" fill="#4ade80" opacity="0.7"/>
          <text x="38" y="50" textAnchor="middle" fill="#84bd00" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">JUNIPER</text>
          <text x="38" y="59" textAnchor="middle" fill="#4b5563" fontSize="4.5" fontFamily="monospace">MX240</text>
          {/* Status LEDs */}
          {([
            {cy:65,color:'#4ade80',label:'SYS',on:true},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="24" cy={cy} r="4" fill="#030c05" stroke="#1e293b" strokeWidth="0.5"/>
              <circle cx="24" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.15} filter={on?"url(#mx240-glow)":undefined}/>
              {on && <circle cx="23" cy={cy-1} r="1" fill="white" opacity="0.35"/>}
              <text x="32" y={cy+1.8} fill="#4b5563" fontSize="4" fontFamily="monospace">{label}</text>
            </g>
          ))}
          <line x1="68" y1="6" x2="68" y2="82" stroke="#16a34a" strokeWidth="0.6"/>
          {/* FPC slot section header */}
          <rect x="68" y="6" width="162" height="9" fill="#0e0f10"/>
          <text x="149" y="12.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">LINE CARD SLOTS (FPC0–FPC3)</text>
          {/* 4 FPC slots */}
          {[0,1,2,3].map(slot => {
            const sx = 70 + slot * 38
            return (
              <g key={slot}>
                <rect x={sx} y="16" width="34" height="64" rx="2" fill="#0d1b11" stroke="#22c55e" strokeWidth="0.5"/>
                {/* Ejector tabs */}
                <rect x={sx} y="18" width="34" height="6" rx="1" fill="#84bd00" fillOpacity="0.25"/>
                <rect x={sx} y="72" width="34" height="6" rx="1" fill="#84bd00" fillOpacity="0.25"/>
                {/* LED bezel inside slot */}
                <rect x={sx+2} y="25" width="30" height="6" rx="0.8" fill="#080809" stroke="#1e2020" strokeWidth="0.3"/>
                {[0,1].map(p => (
                  <rect key={p} x={sx+4+p*14} y="26.5" width="10" height="3.5" rx="0.6" fill={slot<3?"#4ade80":"#0a1a0a"} opacity={slot<3?0.8:0.3} filter={slot<3?"url(#mx240-glow)":undefined}/>
                ))}
                {/* SFP+ cages (3 pairs per slot) */}
                {[0,1,2].map(p => (
                  <g key={p}>
                    <rect x={sx+3} y={33+p*12} width="12" height="9" rx="1" fill="#020617" stroke="#84bd00" strokeWidth="0.4"/>
                    <rect x={sx+3.5} y={33.5+p*12} width="11" height="8" fill="#ffd700" fillOpacity="0.2" rx="0.5"/>
                    <rect x={sx+17} y={33+p*12} width="12" height="9" rx="1" fill="#020617" stroke="#84bd00" strokeWidth="0.4"/>
                    <rect x={sx+17.5} y={33.5+p*12} width="11" height="8" fill="#ffd700" fillOpacity="0.2" rx="0.5"/>
                  </g>
                ))}
                <text x={sx+17} y="73" textAnchor="middle" fill="#4ade80" fontSize="4" fontFamily="monospace">FPC{slot}</text>
              </g>
            )
          })}
        </svg>
      )
    }

    if (normalizedModel === 'SRX345') {
      // Juniper SRX345 (Services Gateway 1U) — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="srx345-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#08180e"/>
              <stop offset="100%" stopColor="#040c07"/>
            </linearGradient>
            <linearGradient id="srx345-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="srx345-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="srx345-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="srx345-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#334155"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#334155"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#1e293b"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1e293b"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1e293b" stroke="#334155" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#334155" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#334155" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#srx345-ch)" filter="url(#srx345-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#srx345-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#16a34a" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="5" rx="3" fill="white" fillOpacity="0.05"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="50" height="32" rx="2" fill="#020804" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="9" width="48" height="5" rx="2" fill="#84bd00" fillOpacity="0.12"/>
          <path d="M 18 26 C 18 18 28 16 32 16 C 27 22 26 28 26 28 Z" fill="#84bd00" opacity="0.9"/>
          <path d="M 32 16 C 36 16 40 20 40 26 C 37 23 32 23 26 28 C 26 28 27 22 32 16 Z" fill="#4ade80" opacity="0.7"/>
          <text x="37" y="33" textAnchor="middle" fill="#84bd00" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.4">SRX345</text>
          {/* Section header — 8 GE ports */}
          <rect x="66" y="5" width="106" height="9" fill="#0e0f10"/>
          <text x="119" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GE PORTS (0-7)</text>
          {/* LED bezel — 8 ports in 2 groups of 4 */}
          <rect x="66" y="14" width="106" height="8" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {[0,1,2,3,4,5,6,7].map(i => {
            const groupOff = i >= 4 ? 14 : 0
            const bx = 68 + i * 11 + groupOff
            return (
              <rect key={i} x={bx} y="15.5" width="9" height="5" rx="0.8" fill={i<6?"#4ade80":"#0a1a0a"} opacity={i<6?0.9:0.4} filter={i<6?"url(#srx345-glow)":undefined}/>
            )
          })}
          {/* 8 RJ45 ports */}
          {[0,1,2,3,4,5,6,7].map(i => {
            const groupOff = i >= 4 ? 14 : 0
            const px = 66 + i * 11 + groupOff
            return (
              <g key={i}>
                <rect x={px} y="23" width="10" height="9" rx="1" fill="#060708" stroke="#3d4044" strokeWidth="0.7"/>
                <rect x={px+0.8} y="23.8" width="8.4" height="7" rx="0.7" fill="url(#srx345-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={px+1.2+p*1.5} y="24.8" width="1.1" height="4" rx="0.2" fill="#b8860b" opacity="0.55"/>
                ))}
                <text x={px+5} y="38" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{i}</text>
              </g>
            )
          })}
          {/* Divider */}
          <line x1="186" y1="5" x2="186" y2="67" stroke="#2d3033" strokeWidth="0.7"/>
          {/* MGMT section */}
          <rect x="186" y="5" width="26" height="9" fill="#0e0f10"/>
          <text x="199" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">MGMT</text>
          {/* CON port */}
          <rect x="187" y="14" width="12" height="10" rx="1" fill="#030810" stroke="#1e3a6b" strokeWidth="0.8"/>
          <rect x="188.5" y="15.5" width="9" height="7" rx="0.5" fill="#020408"/>
          {[0,1,2,3,4].map(p => (
            <rect key={p} x={189+p*1.5} y="16.5" width="1.1" height="4" rx="0.2" fill="#b8860b" opacity="0.5"/>
          ))}
          <text x="193" y="29" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">CON</text>
          {/* Status LEDs */}
          {([
            {cy:38,color:'#4ade80',label:'SYS',on:true},
            {cy:51,color:'#84bd00',label:'RUN',on:true},
            {cy:62,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="196" cy={cy} r="4.5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="196" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#srx345-glow)":undefined}/>
              {on && <circle cx="195" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
              <text x="205" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Ventilation */}
          <rect x="12" y="46" width="50" height="16" rx="1.5" fill="#080809" stroke="#1a1c1e" strokeWidth="0.4"/>
          {Array.from({length:8}).map((_,i) => (
            <rect key={i} x={14+i*5.5} y="48" width="3.5" height="12" rx="0.6" fill="#050607" stroke="#131415" strokeWidth="0.4"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'PTX1000') {
      // Juniper PTX1000 (Core transport router 2U) — ultra-detailed
      return (
        <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ptx1k-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#142c1c"/>
              <stop offset="100%" stopColor="#061008"/>
            </linearGradient>
            <filter id="ptx1k-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ptx1k-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ptx1k-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="6" width="9" height="76" rx="2" fill="#334155"/>
          <rect x="231" y="6" width="9" height="76" rx="2" fill="#334155"/>
          <rect x="1.5" y="12" width="6" height="9" rx="1.5" fill="#1e293b"/>
          <rect x="1.5" y="64" width="6" height="9" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="12" width="6" height="9" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="64" width="6" height="9" rx="1.5" fill="#1e293b"/>
          {([[4.5,30],[4.5,56],[235.5,30],[235.5,56]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1e293b" stroke="#334155" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#334155" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#334155" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#ptx1k-ch)" filter="url(#ptx1k-sh)"/>
          <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#ptx1k-brush)"/>
          <rect x="9" y="4" width="222" height="80" rx="4" stroke="#84bd00" strokeWidth="0.8"/>
          <rect x="10" y="5" width="220" height="6" rx="4" fill="white" fillOpacity="0.05"/>
          <rect x="10" y="80" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,10],[226,10],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="14" width="58" height="26" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="15" width="56" height="5" rx="2" fill="#84bd00" fillOpacity="0.1"/>
          <text x="41" y="27" textAnchor="middle" fill="#84bd00" fontSize="8" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">PTX1000</text>
          <text x="41" y="35" textAnchor="middle" fill="#4b5563" fontSize="4" fontFamily="monospace">Core Transport</text>
          {/* Status LEDs */}
          {([
            {cy:52,color:'#4ade80',label:'SYS',on:true},
            {cy:64,color:'#84bd00',label:'MST',on:true},
            {cy:74,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="24" cy={cy} r="4.5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="24" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#ptx1k-glow)":undefined}/>
              {on && <circle cx="23" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
              <text x="33" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          <line x1="74" y1="6" x2="74" y2="82" stroke="#16a34a" strokeWidth="0.6"/>
          {/* QSFP28 section header */}
          <rect x="74" y="6" width="134" height="9" fill="#0e0f10"/>
          <text x="141" y="12.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">QSFP28 100GE TRANSPORT PORTS</text>
          {/* LED bezel */}
          <rect x="74" y="15" width="134" height="8" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x={76+i*22} y="16.5" width="18" height="5" rx="0.8" fill={i<4?"#4ade80":"#0a1a0a"} opacity={i<4?0.9:0.4} filter={i<4?"url(#ptx1k-glow)":undefined}/>
          ))}
          {/* 6 QSFP28 cages */}
          {[0,1,2,3,4,5].map(i => (
            <g key={i}>
              <rect x={74+i*22} y="24" width="20" height="16" rx="1.5" fill="#020617" stroke="#ffd700" strokeWidth="0.7"/>
              <rect x={75.5+i*22} y="25.5" width="17" height="13" fill="#ffd700" fillOpacity="0.3" rx="1"/>
              {/* Active glow for first 4 */}
              {i<4 && <rect x={74+i*22} y="24" width="20" height="16" rx="1.5" fill="#4ade80" fillOpacity="0.04" filter="url(#ptx1k-glow)"/>}
              <text x={84+i*22} y="47" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">Q{i}</text>
            </g>
          ))}
          {/* Right status column */}
          <line x1="212" y1="6" x2="212" y2="82" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="212" y="6" width="18" height="9" fill="#0e0f10"/>
          <text x="221" y="12.5" textAnchor="middle" fill="#6b7280" fontSize="3" fontFamily="monospace">MGMT</text>
          {/* Ventilation */}
          <rect x="214" y="16" width="14" height="62" rx="1" fill="#080809" stroke="#1a1c1e" strokeWidth="0.3"/>
          {Array.from({length:10}).map((_,i) => (
            <rect key={i} x="216" y={18+i*5.5} width="10" height="3.5" rx="0.5" fill="#050607" stroke="#131415" strokeWidth="0.3"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'ACX710') {
      // Juniper ACX710 (Metro access 1U) — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="acx710-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d2516"/>
              <stop offset="100%" stopColor="#040c08"/>
            </linearGradient>
            <filter id="acx710-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="acx710-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="acx710-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#334155"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#334155"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#1e293b"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#1e293b"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1e293b"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1e293b" stroke="#334155" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#334155" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#334155" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#acx710-ch)" filter="url(#acx710-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#acx710-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#16a34a" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="5" rx="3" fill="white" fillOpacity="0.05"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="52" height="24" rx="2" fill="#020804" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="9" width="50" height="5" rx="2" fill="#84bd00" fillOpacity="0.12"/>
          <text x="38" y="21" textAnchor="middle" fill="#84bd00" fontSize="8" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">ACX710</text>
          <text x="38" y="29" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">Metro Access</text>
          {/* Section header */}
          <rect x="68" y="5" width="106" height="9" fill="#0e0f10"/>
          <text x="121" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">SFP / SFP+ PORTS</text>
          {/* LED bezel */}
          <rect x="68" y="14" width="106" height="8" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {[0,1,2,3].map(i => (
            <rect key={i} x={70+i*26} y="15.5" width="22" height="5" rx="0.8" fill="#4ade80" opacity={0.9} filter="url(#acx710-glow)"/>
          ))}
          {/* 4 SFP cages */}
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect x={68+i*26} y="23" width="24" height="16" rx="1.5" fill="#000" stroke="#84bd00" strokeWidth="0.6"/>
              <rect x={70+i*26} y="24.5" width="20" height="13" fill="#ffd700" fillOpacity="0.3" rx="1"/>
              {/* Gold insert detail */}
              <rect x={68+i*26+10} y="23" width="4" height="16" fill="#ffd700" fillOpacity="0.08"/>
              <text x={80+i*26} y="46" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SFP{i}</text>
            </g>
          ))}
          {/* Divider */}
          <line x1="178" y1="5" x2="178" y2="67" stroke="#2d3033" strokeWidth="0.7"/>
          {/* Status section */}
          <rect x="178" y="5" width="34" height="9" fill="#0e0f10"/>
          <text x="195" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
          {([
            {cy:22,color:'#4ade80',label:'SYS',on:true},
            {cy:36,color:'#84bd00',label:'MST',on:true},
            {cy:50,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="189" cy={cy} r="4.5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="189" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#acx710-glow)":undefined}/>
              {on && <circle cx="188" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
              <text x="198" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Ventilation */}
          <rect x="12" y="38" width="52" height="22" rx="1.5" fill="#080809" stroke="#1a1c1e" strokeWidth="0.4"/>
          {Array.from({length:8}).map((_,i) => (
            <rect key={i} x={14+i*5.8} y="40" width="3.5" height="18" rx="0.6" fill="#050607" stroke="#131415" strokeWidth="0.4"/>
          ))}
        </svg>
      )
    }

    // Default Juniper MX480 — Universal Edge Router, redesigned for realism
    return (
      <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="jnpr-rtr-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0f2818" />
            <stop offset="100%" stopColor="#081510" />
          </linearGradient>
          <filter id="jnpr-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.55" />
          </filter>
        </defs>
        {/* Rack ears */}
        <rect x="0"   y="6"  width="9" height="76" rx="2" fill="#334155" />
        <rect x="231" y="6"  width="9" height="76" rx="2" fill="#334155" />
        <rect x="1.5" y="12" width="6" height="9"  rx="1" fill="#1e293b" />
        <rect x="1.5" y="60" width="6" height="9"  rx="1" fill="#1e293b" />
        <rect x="232.5" y="12" width="6" height="9" rx="1" fill="#1e293b" />
        <rect x="232.5" y="60" width="6" height="9" rx="1" fill="#1e293b" />
        {/* Main chassis */}
        <rect x="9" y="4"  width="222" height="80" rx="4" fill="url(#jnpr-rtr-chassis)" filter="url(#jnpr-sh)" />
        <rect x="9" y="4"  width="222" height="80" rx="4" stroke="#16a34a" strokeWidth="0.8" />
        <rect x="10" y="5" width="220" height="10" rx="4" fill="white" fillOpacity="0.06" />
        {/* Juniper branding panel */}
        <rect x="12" y="10" width="52" height="28" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.6" />
        {/* Juniper leaf logo — simplified triangle */}
        <path d="M 20 28 C 20 18 32 14 36 14 C 30 22 28 30 28 30 Z" fill="#84bd00" opacity="0.9" />
        <path d="M 36 14 C 40 14 44 20 44 28 C 40 24 34 24 28 30 C 28 30 30 22 36 14 Z" fill="#4ade80" opacity="0.7" />
        <text x="38" y="34" textAnchor="middle" fill="#84bd00" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">JUNIPER</text>
        <text x="38" y="42" textAnchor="middle" fill="#4b5563" fontSize="4.5" fontFamily="monospace">MX480</text>
        {/* Status LEDs column */}
        {[
          {cy:18,color:'#4ade80',label:'SYS',on:true},
          {cy:32,color:'#3b82f6',label:'MST',on:true},
          {cy:46,color:'#84bd00',label:'FAN',on:true},
          {cy:60,color:'#ef4444',label:'ALM',on:false},
        ].map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="20" cy={cy} r="4"   fill="#030c05" stroke="#1e293b" strokeWidth="0.5" />
            <circle cx="20" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.15} />
            {on && <circle cx="19" cy={cy-1} r="1" fill="white" opacity="0.35" />}
            <text x="28" y={cy+1.8} fill="#4b5563" fontSize="4" fontFamily="monospace">{label}</text>
          </g>
        ))}
        <line x1="68" y1="6" x2="68" y2="82" stroke="#16a34a" strokeWidth="0.6" />
        {/* 4 FPC module slots */}
        <text x="72" y="12" fill="#4b5563" fontSize="3.5" fontFamily="monospace">LINE CARD SLOTS (FPC0–FPC3)</text>
        {[0,1,2,3].map(slot => {
          const sx = 72 + slot * 38
          return (
            <g key={slot}>
              {/* FPC slot bay */}
              <rect x={sx}   y="16" width="34" height="66" rx="2" fill="#0d1b11" stroke="#22c55e" strokeWidth="0.5" />
              {/* Ejector tabs */}
              <rect x={sx}   y="18" width="34" height="6" rx="1" fill="#84bd00" fillOpacity="0.25" />
              <rect x={sx}   y="72" width="34" height="8" rx="1" fill="#84bd00" fillOpacity="0.25" />
              {/* Port cages (3 SFP+ per FPC) */}
              {[0,1,2].map(p => (
                <g key={p}>
                  <rect x={sx+3}    y={26+p*14} width="12" height="10" rx="1" fill="#020617" stroke="#84bd00" strokeWidth="0.4" />
                  <rect x={sx+3.5}  y={26.5+p*14} width="11" height="9" fill="#ffd700" fillOpacity="0.2" rx="0.5" />
                  <rect x={sx+17}   y={26+p*14} width="12" height="10" rx="1" fill="#020617" stroke="#84bd00" strokeWidth="0.4" />
                  <rect x={sx+17.5} y={26.5+p*14} width="11" height="9" fill="#ffd700" fillOpacity="0.2" rx="0.5" />
                  <circle cx={sx+9}  cy={26+p*14-3} r="1.2" fill="#4ade80" opacity={slot<3?0.9:0.2} />
                  <circle cx={sx+23} cy={26+p*14-3} r="1.2" fill="#4ade80" opacity={slot<2?0.9:0.2} />
                </g>
              ))}
              <text x={sx+17} y="72" textAnchor="middle" fill="#4ade80" fontSize="4" fontFamily="monospace">FPC{slot}</text>
            </g>
          )
        })}
        {/* PWR module */}
        <rect x="226" y="16" width="12" height="66" rx="2" fill="#080f0a" stroke="#16a34a" strokeWidth="0.5" />
        <text x="232" y="50" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace" transform="rotate(-90,232,50)">PWR0</text>
      </svg>
    )
  }

  // ==========================================
  // MIKROTIK ROUTERS
  // ==========================================
  if (normalizedBrand === 'MikroTik') {
    if (normalizedModel === 'CCR1036-12G') {
      // MikroTik CCR1036-12G (2U, 12 RJ45 ports, LCD) — ultra-detailed
      return (
        <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ccr1036-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3f4f6"/>
              <stop offset="100%" stopColor="#c8d2dc"/>
            </linearGradient>
            <linearGradient id="ccr1036-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="ccr1036-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ccr1036-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.4"/>
            </filter>
            <pattern id="ccr1036-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.6" strokeOpacity="0.12"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="6" width="9" height="76" rx="2" fill="#c8d2dc"/>
          <rect x="231" y="6" width="9" height="76" rx="2" fill="#c8d2dc"/>
          <rect x="1.5" y="12" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="1.5" y="66" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="232.5" y="12" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="232.5" y="66" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          {([[4.5,30],[4.5,58],[235.5,30],[235.5,58]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#9aa8b4" stroke="#b0bcc8" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#b0bcc8" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#b0bcc8" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="4" width="222" height="80" rx="3" fill="url(#ccr1036-ch)" filter="url(#ccr1036-sh)"/>
          <rect x="9" y="4" width="222" height="80" rx="3" fill="url(#ccr1036-brush)"/>
          <rect x="9" y="4" width="222" height="80" rx="3" stroke="#b0bec5" strokeWidth="0.8"/>
          <rect x="10" y="5" width="220" height="8" rx="3" fill="white" fillOpacity="0.3"/>
          <rect x="10" y="80" width="220" height="3" rx="2" fill="black" fillOpacity="0.12"/>
          {/* Corner screws */}
          {([[14,10],[226,10],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#c8d2dc" stroke="#9aa8b4" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#8090a0" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#8090a0" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="14" width="50" height="60" rx="2" fill="#293780"/>
          <rect x="13" y="15" width="48" height="6" rx="2" fill="white" fillOpacity="0.08"/>
          <text x="37" y="30" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">MikroTik</text>
          <text x="37" y="39" textAnchor="middle" fill="#a0b0ff" fontSize="5" fontFamily="monospace">CCR1036</text>
          <text x="37" y="47" textAnchor="middle" fill="#6070cc" fontSize="3.5" fontFamily="monospace">36-core</text>
          {/* Power LED */}
          <circle cx="37" cy="61" r="5" fill="#1a256e" stroke="#3949ab" strokeWidth="0.6"/>
          <circle cx="37" cy="61" r="3.5" fill="#4ade80" opacity="0.9" filter="url(#ccr1036-glow)"/>
          <circle cx="36" cy="60" r="1.5" fill="white" fillOpacity="0.45"/>
          <line x1="66" y1="6" x2="66" y2="82" stroke="#c8d2dc" strokeWidth="0.8"/>
          {/* Port section header */}
          <rect x="66" y="6" width="152" height="9" fill="#b8c4d0"/>
          <text x="142" y="12.5" textAnchor="middle" fill="#5a6880" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET ×12</text>
          {/* LED bezel — 12 ports in 2 rows */}
          <rect x="66" y="15" width="110" height="7" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.4"/>
          {Array.from({length:12}).map((_,i) => {
            const col = i % 6
            const bx = 68 + col * 18
            return (
              <rect key={i} x={bx} y="16.2" width="14" height="4.5" rx="0.7" fill={i<9?"#4ade80":"#0c1a0c"} opacity={i<9?0.85:0.3} filter={i<9?"url(#ccr1036-glow)":undefined}/>
            )
          })}
          {/* 12 RJ45 ports — 2 rows of 6 */}
          {Array.from({length:12}).map((_,i) => {
            const col = i % 6, row = Math.floor(i / 6)
            const px = 66 + col * 18
            const py = 23 + row * 18
            return (
              <g key={i}>
                <rect x={px} y={py} width="15" height="12" rx="1.5" fill="#0e1216" stroke="#6a7888" strokeWidth="0.6"/>
                <rect x={px+1} y={py+1} width="13" height="10" rx="1" fill="url(#ccr1036-port)"/>
                {[0,1,2,3,4,5,6].map(p => (
                  <rect key={p} x={px+1.5+p*1.6} y={py+2.5} width="1.2" height="5.5" rx="0.3" fill="#b8860b" opacity="0.55"/>
                ))}
                <rect x={px+2.5} y={py+10} width="10" height="1.5" rx="0.4" fill="#0a0d10"/>
                <text x={px+7.5} y={py+16.5} textAnchor="middle" fill="#6b7280" fontSize="3" fontFamily="monospace">{i+1}</text>
              </g>
            )
          })}
          {/* LCD panel */}
          <rect x="180" y="14" width="50" height="56" rx="2" fill="#000" stroke="#b0bec5" strokeWidth="0.6"/>
          <rect x="182" y="16" width="46" height="52" rx="1" fill="#040810"/>
          <text x="205" y="28" textAnchor="middle" fill="#38bdf8" fontSize="4.5" fontFamily="monospace">Core: 36</text>
          <text x="205" y="37" textAnchor="middle" fill="#22c55e" fontSize="3.5" fontFamily="monospace">RouterOS v7</text>
          <path d="M 184 58 L 194 48 L 204 54 L 214 38 L 224 48" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" fill="none"/>
          <text x="205" y="64" textAnchor="middle" fill="#1e3a5f" fontSize="3" fontFamily="monospace">CPU 24%</text>
        </svg>
      )
    }

    if (normalizedModel === 'CCR2004-1G') {
      // MikroTik CCR2004-1G (SFP28 optical router 1U) — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ccr2004-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8f9fa"/>
              <stop offset="100%" stopColor="#dde2e8"/>
            </linearGradient>
            <filter id="ccr2004-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ccr2004-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.4"/>
            </filter>
            <pattern id="ccr2004-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.6" strokeOpacity="0.12"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#c8d2dc"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#c8d2dc"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#9aa8b4" stroke="#b0bcc8" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#b0bcc8" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#b0bcc8" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#ccr2004-ch)" filter="url(#ccr2004-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#ccr2004-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#cfd8dc" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="8" rx="3" fill="white" fillOpacity="0.3"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.12"/>
          {/* Corner screws */}
          {([[14,8],[226,8],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#c8d2dc" stroke="#9aa8b4" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#8090a0" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#8090a0" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="50" height="54" rx="2" fill="#293780"/>
          <rect x="13" y="9" width="48" height="6" rx="2" fill="white" fillOpacity="0.08"/>
          <text x="37" y="22" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">MikroTik</text>
          <text x="37" y="31" textAnchor="middle" fill="#a0b0ff" fontSize="5" fontFamily="monospace">CCR2004</text>
          <text x="37" y="40" textAnchor="middle" fill="#6070cc" fontSize="3.5" fontFamily="monospace">SFP28 25G</text>
          <circle cx="37" cy="54" r="5" fill="#1a256e" stroke="#3949ab" strokeWidth="0.6"/>
          <circle cx="37" cy="54" r="3.5" fill="#4ade80" opacity="0.9" filter="url(#ccr2004-glow)"/>
          <circle cx="36" cy="53" r="1.5" fill="white" fillOpacity="0.45"/>
          <line x1="66" y1="5" x2="66" y2="67" stroke="#c8d2dc" strokeWidth="0.8"/>
          {/* SFP28 section header */}
          <rect x="66" y="5" width="96" height="9" fill="#b8c4d0"/>
          <text x="114" y="11.5" textAnchor="middle" fill="#5a6880" fontSize="3.5" fontFamily="monospace">SFP28 25G ×4</text>
          {/* LED bezel */}
          <rect x="66" y="14" width="96" height="7" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.4"/>
          {[0,1,2,3].map(i => (
            <rect key={i} x={68+i*24} y="15.2" width="20" height="4.5" rx="0.7" fill="#4ade80" opacity={0.9} filter="url(#ccr2004-glow)"/>
          ))}
          {/* 4 SFP28 cages */}
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect x={66+i*24} y="22" width="22" height="16" rx="1.5" fill="#020617" stroke="#ffd700" strokeWidth="0.7"/>
              <rect x={67.5+i*24} y="23.5" width="19" height="13" fill="#ffd700" fillOpacity="0.35" rx="1"/>
              {i<3 && <rect x={66+i*24} y="22" width="22" height="16" rx="1.5" fill="#4ade80" fillOpacity="0.04" filter="url(#ccr2004-glow)"/>}
              <text x={77+i*24} y="45" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">Q{i}</text>
            </g>
          ))}
          {/* LCD panel */}
          <rect x="166" y="8" width="60" height="54" rx="2" fill="#0f172a" stroke="#b0bec5" strokeWidth="0.6"/>
          <rect x="168" y="10" width="56" height="50" rx="1" fill="#040810"/>
          <text x="196" y="24" textAnchor="middle" fill="#00d2ff" fontSize="5" fontFamily="monospace">SFP28 25G</text>
          <text x="196" y="34" textAnchor="middle" fill="#22c55e" fontSize="3.5" fontFamily="monospace">RouterOS v7</text>
          <path d="M 170 54 L 182 44 L 194 50 L 206 34 L 218 46" stroke="#00d2ff" strokeWidth="1" fill="none" strokeLinecap="round"/>
        </svg>
      )
    }

    if (normalizedModel === 'hEX S') {
      // MikroTik hEX S (compact desktop SOHO) — ultra-detailed
      return (
        <svg viewBox="0 0 180 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="hexs-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b"/>
              <stop offset="100%" stopColor="#0c1220"/>
            </linearGradient>
            <linearGradient id="hexs-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="hexs-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Compact box — top highlight + bottom shadow */}
          <rect x="8" y="8" width="164" height="72" rx="6" fill="url(#hexs-ch)" stroke="#475569" strokeWidth="0.8"/>
          <rect x="10" y="9" width="160" height="8" rx="5" fill="white" fillOpacity="0.06"/>
          <rect x="10" y="74" width="160" height="4" rx="3" fill="black" fillOpacity="0.2"/>
          {/* Brand panel */}
          <rect x="14" y="14" width="46" height="22" rx="2" fill="#293780"/>
          <rect x="15" y="15" width="44" height="5" rx="2" fill="white" fillOpacity="0.1"/>
          <text x="37" y="25" textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="sans-serif" fontWeight="bold">MikroTik</text>
          <text x="37" y="33" textAnchor="middle" fill="#a0b0ff" fontSize="5" fontFamily="monospace">hEX S</text>
          {/* Power ring LED */}
          <circle cx="150" cy="22" r="8" fill="#0f1a30" stroke="#293780" strokeWidth="0.8"/>
          <circle cx="150" cy="22" r="5.5" fill="#3b82f6" opacity="0.15"/>
          <circle cx="150" cy="22" r="3.5" fill="#60a5fa" opacity="0.9" filter="url(#hexs-glow)"/>
          <circle cx="149" cy="21" r="1.5" fill="white" fillOpacity="0.4"/>
          {/* Section divider */}
          <rect x="14" y="44" width="152" height="5" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.3"/>
          <text x="90" y="48" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">INTERFACES</text>
          {/* 5 RJ45 ports with gold pins */}
          {[0,1,2,3,4].map(i => {
            const px = 14 + i * 28
            return (
              <g key={i}>
                <rect x={px} y="51" width="24" height="17" rx="1.5" fill="#0e1216" stroke="#6a7888" strokeWidth="0.7"/>
                <rect x={px+1} y="52.2" width="22" height="14" rx="1" fill="url(#hexs-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+1.5+p*2.6} y="54" width="2" height="8" rx="0.4" fill="#b8860b" opacity="0.55"/>
                ))}
                <rect x={px+3} y="64" width="18" height="2" rx="0.4" fill="#0a0d10"/>
                {/* Per-port LED */}
                <circle cx={px+12} cy="71.5" r="2.5" fill="#060708" stroke="#2d3033" strokeWidth="0.4"/>
                <circle cx={px+12} cy="71.5" r="1.8" fill={i<4?"#4ade80":"#3b82f6"} opacity={i<4?0.9:0.8} filter="url(#hexs-glow)"/>
                <text x={px+12} y="78" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{i===0?"WAN":"LAN"+i}</text>
              </g>
            )
          })}
          {/* Ventilation slots on right side */}
          <rect x="154" y="44" width="16" height="26" rx="2" fill="#141e2c" stroke="#334155" strokeWidth="0.4"/>
          {Array.from({length:4}).map((_,i) => (
            <rect key={i} x="156" y={46+i*5.5} width="12" height="3.5" rx="0.5" fill="#0c1424" stroke="#1e293b" strokeWidth="0.3"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'RB3011UiAS') {
      // MikroTik RB3011UiAS (Rackmount 1U orange accent) — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="rb3011-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#252932"/>
              <stop offset="100%" stopColor="#141820"/>
            </linearGradient>
            <linearGradient id="rb3011-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="rb3011-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="rb3011-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.5"/>
            </filter>
            <pattern id="rb3011-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#4b5563"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#4b5563"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#374151"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#374151"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#374151"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#374151"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#374151" stroke="#4b5563" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#4b5563" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#4b5563" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#rb3011-ch)" filter="url(#rb3011-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#rb3011-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#ea580c" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="5" rx="3" fill="#ea580c" fillOpacity="0.15"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="50" height="54" rx="2" fill="#ea580c"/>
          <rect x="13" y="9" width="48" height="6" rx="2" fill="white" fillOpacity="0.12"/>
          <text x="37" y="22" textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="sans-serif" fontWeight="bold">MikroTik</text>
          <text x="37" y="31" textAnchor="middle" fill="white" fontSize="4.5" fontFamily="monospace">RB3011</text>
          <text x="37" y="39" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="3.5" fontFamily="monospace">RouterOS</text>
          <circle cx="37" cy="54" r="5" fill="#7c2d12" stroke="#c2410c" strokeWidth="0.6"/>
          <circle cx="37" cy="54" r="3.5" fill="#4ade80" opacity="0.9" filter="url(#rb3011-glow)"/>
          <circle cx="36" cy="53" r="1.5" fill="white" fillOpacity="0.4"/>
          <line x1="66" y1="5" x2="66" y2="67" stroke="#374151" strokeWidth="0.8"/>
          {/* Port section header */}
          <rect x="66" y="5" width="122" height="9" fill="#1a1d24"/>
          <text x="127" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET ×10</text>
          {/* LED bezel */}
          <rect x="66" y="14" width="122" height="7" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.4"/>
          {Array.from({length:10}).map((_,i) => {
            const groupOff = i >= 5 ? 14 : 0
            const bx = 68 + i * 10 + groupOff
            return (
              <rect key={i} x={bx} y="15.2" width="8" height="4.5" rx="0.7" fill={i<8?"#4ade80":"#0c1a0c"} opacity={i<8?0.85:0.3} filter={i<8?"url(#rb3011-glow)":undefined}/>
            )
          })}
          {/* 10 RJ45 ports */}
          {Array.from({length:10}).map((_,i) => {
            const groupOff = i >= 5 ? 14 : 0
            const px = 66 + i * 10 + groupOff
            return (
              <g key={i}>
                <rect x={px} y="22" width="9" height="10" rx="1" fill="#0e1216" stroke="#6a7888" strokeWidth="0.6"/>
                <rect x={px+0.8} y="22.8" width="7.4" height="8" rx="0.7" fill="url(#rb3011-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={px+1.2+p*1.2} y="24" width="0.9" height="4" rx="0.2" fill="#b8860b" opacity="0.5"/>
                ))}
                <rect x={px+2} y="32" width="5" height="1.5" rx="0.3" fill="#0a0d10"/>
                <text x={px+4.5} y="39" textAnchor="middle" fill="#6b7280" fontSize="2.8" fontFamily="monospace">{i+1}</text>
              </g>
            )
          })}
          {/* LCD */}
          <line x1="192" y1="5" x2="192" y2="67" stroke="#374151" strokeWidth="0.6"/>
          <rect x="192" y="5" width="38" height="9" fill="#1a1d24"/>
          <text x="211" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">DISPLAY</text>
          <rect x="194" y="14" width="34" height="44" rx="1.5" fill="#0c111a" stroke="#4b5563" strokeWidth="0.5"/>
          <rect x="196" y="16" width="30" height="40" rx="1" fill="#040810"/>
          <text x="211" y="28" textAnchor="middle" fill="#00d2ff" fontSize="4.5" fontFamily="monospace">RB3011</text>
          <text x="211" y="37" textAnchor="middle" fill="#22c55e" fontSize="3.5" fontFamily="monospace">RouterOS v7</text>
          <path d="M 198 50 L 206 44 L 214 48 L 222 38" stroke="#00d2ff" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        </svg>
      )
    }

    // Default MikroTik RB4011iGS+ — Redesigned for realism
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="mt-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#dde2e8"/>
            <stop offset="100%" stopColor="#adb5c0"/>
          </linearGradient>
          <linearGradient id="mt-port-inner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a1e26"/>
            <stop offset="100%" stopColor="#0f1218"/>
          </linearGradient>
          <filter id="mt-led-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="mt-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.4"/>
          </filter>
          <pattern id="mt-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.6" strokeOpacity="0.12"/>
          </pattern>
        </defs>

        {/* Rack ears */}
        <rect x="0"   y="4"  width="9" height="64" rx="2" fill="#c8d2dc"/>
        <rect x="231" y="4"  width="9" height="64" rx="2" fill="#c8d2dc"/>
        <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#9aa8b4"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
        <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#9aa8b4"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#9aa8b4" stroke="#b0bcc8" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#b0bcc8" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#b0bcc8" strokeWidth="0.5"/>
          </g>
        ))}

        {/* Main chassis */}
        <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#mt-ch)"    filter="url(#mt-sh)"/>
        <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#mt-brush)"/>
        <rect x="9" y="2"  width="222" height="68" rx="3" stroke="#c8d2dc" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="8"  rx="3" fill="white" fillOpacity="0.3"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.15"/>

        {/* Corner screws */}
        {([[14,8],[226,8],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#c8d2dc" stroke="#9aa8b4" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy}   x2={cx+2} y2={cy}   stroke="#8090a0" strokeWidth="0.8"/>
            <line x1={cx}   y1={cy-2} x2={cx}   y2={cy+2} stroke="#8090a0" strokeWidth="0.8"/>
          </g>
        ))}

        {/* MikroTik brand panel */}
        <rect x="12" y="8"  width="52" height="54" rx="2" fill="#293780"/>
        <rect x="13" y="9"  width="50" height="6"  rx="2" fill="white" fillOpacity="0.08"/>
        <text x="38" y="22" textAnchor="middle" fill="#ffffff" fontSize="7"   fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.3">MikroTik</text>
        <text x="38" y="31" textAnchor="middle" fill="#a0b0ff" fontSize="5"   fontFamily="monospace">RB4011</text>
        <text x="38" y="40" textAnchor="middle" fill="#6070cc" fontSize="4"   fontFamily="monospace">RouterOS</text>
        <text x="38" y="49" textAnchor="middle" fill="#4060aa" fontSize="3.5" fontFamily="monospace">v7.x</text>
        {/* Power LED */}
        <circle cx="38" cy="56" r="5"   fill="#1a256e" stroke="#3949ab" strokeWidth="0.6"/>
        <circle cx="38" cy="56" r="3.5" fill="#4ade80" opacity="0.9" filter="url(#mt-led-glow)"/>
        <circle cx="37" cy="55" r="1.5" fill="white" fillOpacity="0.45"/>

        <line x1="68" y1="5" x2="68" y2="67" stroke="#c8d2dc" strokeWidth="0.8"/>

        {/* Port section header */}
        <rect x="68" y="5" width="152" height="9" fill="#b8c4d0"/>
        <text x="144" y="11.5" textAnchor="middle" fill="#5a6880" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET  ×10      SFP+</text>

        {/* LED bezel panel for 10 ports */}
        <rect x="68" y="14" width="130" height="7" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.4"/>
        {Array.from({length:10}).map((_,i) => {
          const bx = 71 + i * 13
          return (
            <g key={i}>
              <rect x={bx}   y="15.2" width="5" height="4.5" rx="0.7" fill={i<8 ? "#4ade80" : "#0c1a0c"} opacity={i<8 ? 0.9 : 0.3} filter={i<8 ? "url(#mt-led-glow)" : undefined}/>
              <rect x={bx+6} y="15.2" width="5" height="4.5" rx="0.7" fill={i<3 ? "#fbbf24" : "#1a1000"} opacity={i<3 ? 0.7 : 0.2} filter={i<3 ? "url(#mt-led-glow)" : undefined}/>
            </g>
          )
        })}

        {/* 10 RJ45 ports */}
        {Array.from({length:10}).map((_,i) => {
          const px = 68 + i * 13
          return (
            <g key={i}>
              <rect x={px}     y="22" width="12" height="13" rx="1.5" fill="#0e1216" stroke="#6a7888" strokeWidth="0.7"/>
              <rect x={px+1}   y="23.2" width="10" height="10" rx="1" fill="url(#mt-port-inner)"/>
              {[0,1,2,3,4,5,6].map(p => (
                <rect key={p} x={px+1.5+p*1.2} y="24.5" width="0.9" height="5.5" rx="0.3" fill="#b8860b" opacity="0.55"/>
              ))}
              <rect x={px+2}   y="32.5" width="8"  height="1.8" rx="0.4" fill="#0a0d10"/>
              <rect x={px+4.5} y="33.2" width="3"  height="1.8" rx="0.4" fill="#0c1014"/>
              <text x={px+6} y="42" textAnchor="middle" fill="#6b7280" fontSize="3" fontFamily="monospace">{i+1}</text>
            </g>
          )
        })}

        <line x1="201" y1="5" x2="201" y2="67" stroke="#c8d2dc" strokeWidth="0.8"/>

        {/* SFP+ port */}
        <rect x="201" y="5"  width="30" height="9" fill="#b8c4d0"/>
        <rect x="202" y="22" width="16" height="16" rx="1.5" fill="#0e1216" stroke="#6a7888" strokeWidth="0.7"/>
        <rect x="203.5" y="23.5" width="13" height="13" rx="1" fill="#0a0d10"/>
        <rect x="204"   y="24"   width="12" height="12" rx="0.5" fill="#b8860b" fillOpacity="0.2"/>
        <rect x="203.5" y="29.5" width="13" height="1" fill="#1a1a00" fillOpacity="0.5"/>
        <circle cx="210" cy="44" r="3" fill="#0e1216" stroke="#4a5868" strokeWidth="0.5"/>
        <circle cx="210" cy="44" r="2" fill="#3b82f6" opacity="0.8" filter="url(#mt-led-glow)"/>
        <text x="210" y="52" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">SFP+</text>

        {/* Ventilation */}
        <rect x="220" y="12" width="16" height="48" rx="1" fill="#c0cad4" stroke="#9aa8b4" strokeWidth="0.4"/>
        {Array.from({length:7}).map((_,i) => (
          <rect key={i} x="222" y={14+i*6} width="12" height="3.5" rx="0.5" fill="#9aa8b4" stroke="#8090a0" strokeWidth="0.3"/>
        ))}
      </svg>
    )
  }

  // ==========================================
  // CISCO ROUTERS (Default / Generic)
  // ==========================================
  if (normalizedModel === 'ISR 3945') {
    // Cisco ISR 3945 (High-perf 2U modular) — ultra-detailed
    return (
      <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="isr3945-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1a3d"/>
            <stop offset="100%" stopColor="#070e22"/>
          </linearGradient>
          <linearGradient id="isr3945-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080c14"/>
            <stop offset="100%" stopColor="#030508"/>
          </linearGradient>
          <filter id="isr3945-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="isr3945-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="isr3945-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0" y="6" width="9" height="88" rx="2" fill="#1e2530"/>
        <rect x="231" y="6" width="9" height="88" rx="2" fill="#1e2530"/>
        <rect x="1.5" y="12" width="6" height="12" rx="1.5" fill="#0a0d12"/>
        <rect x="1.5" y="78" width="6" height="12" rx="1.5" fill="#0a0d12"/>
        <rect x="232.5" y="12" width="6" height="12" rx="1.5" fill="#0a0d12"/>
        <rect x="232.5" y="78" width="6" height="12" rx="1.5" fill="#0a0d12"/>
        {([[4.5,34],[4.5,62],[235.5,34],[235.5,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#0a0d12" stroke="#2a3040" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#2a3040" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#2a3040" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="96" rx="4" fill="url(#isr3945-ch)" filter="url(#isr3945-sh)"/>
        <rect x="9" y="2" width="222" height="96" rx="4" fill="url(#isr3945-brush)"/>
        <rect x="9" y="2" width="222" height="96" rx="4" stroke="#2563eb" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="5" rx="3" fill="white" fillOpacity="0.08"/>
        <rect x="10" y="93" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
        {/* Corner screws */}
        {([[14,8],[226,8],[14,90],[226,90]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#2a3550" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#2a3550" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#2a3550" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Cisco branding */}
        <rect x="12" y="10" width="58" height="50" rx="2" fill="#0c1525" stroke="#3b82f6" strokeWidth="0.7"/>
        <rect x="13" y="11" width="56" height="6" rx="2" fill="#3b82f6" fillOpacity="0.1"/>
        {([{x:16,h:9},{x:22,h:15},{x:28,h:19},{x:34,h:19},{x:40,h:15},{x:46,h:9}]).map(({x,h},i) => (
          <rect key={i} x={x} y={32-h} width="4" height={h} rx="2" fill="#3b82f6"/>
        ))}
        <text x="41" y="40" textAnchor="middle" fill="#3b82f6" fontSize="5.5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1.5">CISCO</text>
        <text x="41" y="48" textAnchor="middle" fill="#475569" fontSize="4.5" fontFamily="monospace">ISR 3945</text>
        {/* Power LEDs */}
        {([
          {cy:60,color:'#4ade80',label:'SYS',on:true},
          {cy:73,color:'#3b82f6',label:'ACT',on:true},
          {cy:84,color:'#ef4444',label:'ERR',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="24" cy={cy} r="4.5" fill="#060b10" stroke="#1e293b" strokeWidth="0.5"/>
            <circle cx="24" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#isr3945-glow)":undefined}/>
            {on && <circle cx="23" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
            <text x="33" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
        <line x1="74" y1="4" x2="74" y2="94" stroke="#1e293b" strokeWidth="0.8"/>
        {/* GE section header */}
        <rect x="74" y="4" width="86" height="9" fill="#0b1020"/>
        <text x="117" y="10.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET</text>
        {/* LED bezel */}
        <rect x="74" y="13" width="86" height="8" rx="1" fill="#060a10" stroke="#1a2338" strokeWidth="0.4"/>
        {[0,1,2,3].map(i => {
          const bx = 77 + i * 21
          return (
            <g key={i}>
              <rect x={bx} y="14.5" width="7" height="5" rx="0.8" fill={i<3?"#4ade80":"#0f2010"} opacity={i<3?0.9:0.4} filter={i<3?"url(#isr3945-glow)":undefined}/>
              <rect x={bx+9} y="14.5" width="7" height="5" rx="0.8" fill={i===0?"#fbbf24":"#201808"} opacity={i===0?0.85:0.3} filter={i===0?"url(#isr3945-glow)":undefined}/>
            </g>
          )
        })}
        {/* 4 RJ45 GE ports — 2 rows of 2 */}
        {[0,1,2,3].map(i => {
          const col = i % 2, row = Math.floor(i / 2)
          const px = 74 + col * 43
          const py = 22 + row * 24
          return (
            <g key={i}>
              <rect x={px} y={py} width="38" height="18" rx="2" fill="#08090e" stroke="#2a3550" strokeWidth="0.9"/>
              <rect x={px+1.5} y={py+1.5} width="35" height="14" rx="1.2" fill="url(#isr3945-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+3+p*3.8} y={py+3} width="2.8" height="8" rx="0.4" fill="#b8860b" opacity="0.6"/>
              ))}
              <rect x={px+6} y={py+16} width="26" height="2.5" rx="0.5" fill="#050710"/>
              <text x={px+19} y={py+27} textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GE{i}/0</text>
            </g>
          )
        })}
        {/* Divider */}
        <line x1="164" y1="4" x2="164" y2="94" stroke="#1e293b" strokeWidth="0.8"/>
        {/* Fan modules */}
        <rect x="164" y="4" width="50" height="9" fill="#0b1020"/>
        <text x="189" y="10.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">COOLING</text>
        {[0,1].map(fan => {
          const cx = 178 + fan * 28
          return (
            <g key={fan}>
              <circle cx={cx} cy="48" r="16" fill="#0c111a" stroke="#2d3748" strokeWidth="0.8"/>
              <circle cx={cx} cy="48" r="13" fill="#080e18" stroke="#1e2a3a" strokeWidth="0.4"/>
              {Array.from({length:8}).map((_,i) => (
                <line key={i} x1={cx} y1="48" x2={cx+Math.cos(i*Math.PI/4)*12} y2={48+Math.sin(i*Math.PI/4)*12} stroke="#334155" strokeWidth="1.2"/>
              ))}
              <circle cx={cx} cy="48" r="3" fill="#0f172a" stroke="#2d3748" strokeWidth="0.6"/>
              <circle cx={cx} cy="48" r="1.5" fill="#3b82f6" opacity="0.6" filter="url(#isr3945-glow)"/>
            </g>
          )
        })}
        {/* Status column */}
        <line x1="214" y1="4" x2="214" y2="94" stroke="#1e293b" strokeWidth="0.7"/>
        <rect x="214" y="4" width="16" height="9" fill="#0b1020"/>
        <text x="222" y="10.5" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">PWR</text>
        {/* Dual PSU LEDs */}
        {[0,1].map(psu => (
          <g key={psu}>
            <rect x="215" y={14+psu*16} width="14" height="12" rx="1.5" fill="#060b10" stroke="#1e293b" strokeWidth="0.6"/>
            <circle cx="222" cy={20+psu*16} r="4" fill="#4ade80" opacity="0.9" filter="url(#isr3945-glow)"/>
            <circle cx="221" cy={19+psu*16} r="1.5" fill="white" fillOpacity="0.4"/>
            <text x="222" y={31+psu*16} textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">PSU{psu}</text>
          </g>
        ))}
        {/* Module slots */}
        <text x="222" y="52" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">NM</text>
        {[0,1,2].map(nm => (
          <rect key={nm} x="215" y={54+nm*12} width="14" height="10" rx="1" fill="#040810" stroke="#1e2a38" strokeWidth="0.5"/>
        ))}
        {/* Ventilation */}
        <rect x="12" y="66" width="58" height="22" rx="1.5" fill="#060a10" stroke="#1a2030" strokeWidth="0.4"/>
        {Array.from({length:9}).map((_,i) => (
          <rect key={i} x={14+i*5.6} y="68" width="3.5" height="18" rx="0.6" fill="#040810" stroke="#141e2c" strokeWidth="0.4"/>
        ))}
      </svg>
    )
  }

  if (normalizedModel === 'ISR 4321') {
    // Cisco ISR 4321 (1U compact) — ultra-detailed
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="isr4321-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#081432"/>
            <stop offset="100%" stopColor="#040918"/>
          </linearGradient>
          <linearGradient id="isr4321-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080c14"/>
            <stop offset="100%" stopColor="#030508"/>
          </linearGradient>
          <filter id="isr4321-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="isr4321-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="isr4321-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0" y="4" width="9" height="64" rx="2" fill="#1e2530"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e2530"/>
        <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#0a0d12"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0a0d12"/>
        <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#0a0d12"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0a0d12"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#0a0d12" stroke="#2a3040" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#2a3040" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#2a3040" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#isr4321-ch)" filter="url(#isr4321-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#isr4321-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" stroke="#2563eb" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="5" rx="3" fill="white" fillOpacity="0.08"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#2a3550" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#2a3550" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#2a3550" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Angled bezel panel */}
        <path d="M 9 2 L 74 2 L 66 70 L 9 70 Z" fill="#090d16"/>
        {([{x:14,h:8},{x:20,h:13},{x:26,h:17},{x:32,h:17},{x:38,h:13},{x:44,h:8}]).map(({x,h},i) => (
          <rect key={i} x={x} y={28-h} width="4" height={h} rx="2" fill="#3b82f6"/>
        ))}
        <text x="40" y="34" textAnchor="middle" fill="#3b82f6" fontSize="5.5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1.5">CISCO</text>
        <text x="40" y="42" textAnchor="middle" fill="#475569" fontSize="4.5" fontFamily="monospace">ISR 4321</text>
        {/* GE section */}
        <rect x="74" y="5" width="86" height="9" fill="#0b1020"/>
        <text x="117" y="11.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET</text>
        {/* LED bezel */}
        <rect x="74" y="14" width="86" height="8" rx="1" fill="#060a10" stroke="#1a2338" strokeWidth="0.4"/>
        {[0,1].map(i => {
          const bx = 77 + i * 42
          return (
            <g key={i}>
              <rect x={bx} y="15.5" width="7" height="5" rx="0.8" fill="#4ade80" opacity={0.9} filter="url(#isr4321-glow)"/>
              <rect x={bx+9} y="15.5" width="7" height="5" rx="0.8" fill={i===0?"#fbbf24":"#201808"} opacity={i===0?0.85:0.3} filter={i===0?"url(#isr4321-glow)":undefined}/>
            </g>
          )
        })}
        {/* 2 GE ports */}
        {[0,1].map(i => {
          const px = 74 + i * 43
          return (
            <g key={i}>
              <rect x={px} y="23" width="38" height="20" rx="2" fill="#08090e" stroke="#2a3550" strokeWidth="0.9"/>
              <rect x={px+1.5} y="24.5" width="35" height="16" rx="1.2" fill="url(#isr4321-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+3+p*3.8} y="26.5" width="2.8" height="9" rx="0.4" fill="#b8860b" opacity="0.6"/>
              ))}
              <rect x={px+6} y="39.5" width="26" height="2.5" rx="0.5" fill="#050710"/>
              <text x={px+19} y="51" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GE{i}/0</text>
            </g>
          )
        })}
        {/* Divider */}
        <line x1="164" y1="5" x2="164" y2="67" stroke="#1e293b" strokeWidth="0.8"/>
        {/* MGMT + USB section */}
        <rect x="164" y="5" width="36" height="9" fill="#0b1020"/>
        <text x="182" y="11.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">MGMT</text>
        {/* CON port */}
        <rect x="165" y="14" width="16" height="14" rx="1.5" fill="#030810" stroke="#1e3a6b" strokeWidth="0.8"/>
        <rect x="166.5" y="15.5" width="13" height="10" rx="1" fill="#020408"/>
        {[0,1,2,3,4,5,6,7].map(p => (
          <rect key={p} x={167.5+p*1.35} y="17" width="1" height="7" rx="0.3" fill="#b8860b" opacity="0.55"/>
        ))}
        <text x="173" y="33" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">CON</text>
        {/* USB */}
        <rect x="165" y="38" width="14" height="10" rx="1.5" fill="#04060c" stroke="#2a3550" strokeWidth="0.7"/>
        <rect x="166.5" y="39.5" width="11" height="7" rx="0.5" fill="#020408"/>
        <rect x="166.5" y="43" width="11" height="1" fill="#1e293b"/>
        <text x="172" y="53" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">USB</text>
        {/* Status LEDs */}
        <line x1="204" y1="5" x2="204" y2="67" stroke="#1e293b" strokeWidth="0.7"/>
        <rect x="204" y="5" width="26" height="9" fill="#0b1020"/>
        <text x="217" y="11.5" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">STATUS</text>
        {([
          {cy:22,color:'#4ade80',label:'SYS',on:true},
          {cy:36,color:'#3b82f6',label:'ACT',on:true},
          {cy:50,color:'#ef4444',label:'ERR',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="213" cy={cy} r="4.5" fill="#060b10" stroke="#1e293b" strokeWidth="0.5"/>
            <circle cx="213" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#isr4321-glow)":undefined}/>
            {on && <circle cx="212" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
            <text x="222" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
      </svg>
    )
  }

  if (normalizedModel === 'ASR 1001-X') {
    // Cisco ASR 1001-X (Aggregation Service Router 1U) — ultra-detailed
    return (
      <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="asr1001-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b1c1e"/>
            <stop offset="100%" stopColor="#0f1012"/>
          </linearGradient>
          <filter id="asr1001-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="asr1001-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="asr1001-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0" y="6" width="9" height="76" rx="2" fill="#374151"/>
        <rect x="231" y="6" width="9" height="76" rx="2" fill="#374151"/>
        <rect x="1.5" y="12" width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="1.5" y="64" width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="232.5" y="12" width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="232.5" y="64" width="6" height="10" rx="1.5" fill="#1f2937"/>
        {([[4.5,30],[4.5,56],[235.5,30],[235.5,56]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#asr1001-ch)" filter="url(#asr1001-sh)"/>
        <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#asr1001-brush)"/>
        <rect x="9" y="4" width="222" height="80" rx="4" stroke="#3b82f6" strokeWidth="0.8"/>
        <rect x="10" y="5" width="220" height="5" rx="3" fill="white" fillOpacity="0.06"/>
        <rect x="10" y="80" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
        {/* Corner screws */}
        {([[14,10],[226,10],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#2a3550" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#2a3550" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#2a3550" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Brand panel */}
        <rect x="12" y="14" width="60" height="24" rx="2" fill="#000" stroke="#3b82f6" strokeWidth="0.6"/>
        <rect x="13" y="15" width="58" height="5" rx="2" fill="#3b82f6" fillOpacity="0.12"/>
        {([{x:17,h:7},{x:22,h:11},{x:27,h:14},{x:32,h:14},{x:37,h:11},{x:42,h:7}]).map(({x,h},i) => (
          <rect key={i} x={x} y={28-h} width="3.5" height={h} rx="1.5" fill="#3b82f6"/>
        ))}
        <text x="53" y="24" fill="#3b82f6" fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1">CISCO</text>
        <text x="36" y="33" textAnchor="middle" fill="#475569" fontSize="4.5" fontFamily="monospace">ASR 1001-X</text>
        {/* Status LEDs below brand */}
        {([
          {cy:46,color:'#4ade80',label:'SYS',on:true},
          {cy:58,color:'#3b82f6',label:'ACT',on:true},
          {cy:70,color:'#ef4444',label:'ERR',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="24" cy={cy} r="4.5" fill="#060b10" stroke="#1e293b" strokeWidth="0.5"/>
            <circle cx="24" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#asr1001-glow)":undefined}/>
            {on && <circle cx="23" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
            <text x="33" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
        <line x1="76" y1="6" x2="76" y2="82" stroke="#1e293b" strokeWidth="0.8"/>
        {/* SFP+ section header */}
        <rect x="76" y="6" width="120" height="9" fill="#0b1020"/>
        <text x="136" y="12.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">SFP+ HIGH-DENSITY PORTS</text>
        {/* LED bezel */}
        <rect x="76" y="15" width="120" height="8" rx="1" fill="#060a10" stroke="#1a2338" strokeWidth="0.4"/>
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={78+i*20} y="16.5" width="16" height="5" rx="0.8" fill="#4ade80" opacity={0.9} filter="url(#asr1001-glow)"/>
        ))}
        {/* 6 SFP+ cages */}
        {[0,1,2,3,4,5].map(i => (
          <g key={i}>
            <rect x={76+i*20} y="24" width="18" height="14" rx="1.2" fill="#020617" stroke="#3b82f6" strokeWidth="0.6"/>
            <rect x={77.5+i*20} y="25.5" width="15" height="11" fill="#ffd700" fillOpacity="0.3" rx="0.8"/>
            {i<4 && <rect x={76+i*20} y="24" width="18" height="14" rx="1.2" fill="#4ade80" fillOpacity="0.04" filter="url(#asr1001-glow)"/>}
            <text x={85+i*20} y="45" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SFP{i}</text>
          </g>
        ))}
        {/* Right column — dual PSU */}
        <line x1="200" y1="6" x2="200" y2="82" stroke="#1e293b" strokeWidth="0.7"/>
        <rect x="200" y="6" width="30" height="9" fill="#0b1020"/>
        <text x="215" y="12.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">POWER</text>
        {[0,1].map(psu => (
          <g key={psu}>
            <rect x="201" y={15+psu*18} width="28" height="14" rx="2" fill="#060b10" stroke="#1e293b" strokeWidth="0.6"/>
            <circle cx="215" cy={22+psu*18} r="5" fill="#4ade80" opacity="0.9" filter="url(#asr1001-glow)"/>
            <circle cx="214" cy={21+psu*18} r="2" fill="white" fillOpacity="0.4"/>
            <text x="215" y={33+psu*18} textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">PSU{psu+1}</text>
          </g>
        ))}
        {/* Ventilation */}
        <rect x="200" y="52" width="30" height="28" rx="1" fill="#060a10" stroke="#1a2030" strokeWidth="0.3"/>
        {Array.from({length:5}).map((_,i) => (
          <rect key={i} x="202" y={54+i*4.5} width="26" height="3" rx="0.5" fill="#040810" stroke="#141e2c" strokeWidth="0.3"/>
        ))}
      </svg>
    )
  }

  if (normalizedModel === 'ISR 1101') {
    // Cisco ISR 1101 (Compact fanless desktop) — ultra-detailed
    return (
      <svg viewBox="0 0 200 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="isr1101-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eceff1"/>
            <stop offset="100%" stopColor="#c8d2dc"/>
          </linearGradient>
          <linearGradient id="isr1101-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1e26"/>
            <stop offset="100%" stopColor="#0f1218"/>
          </linearGradient>
          <filter id="isr1101-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Desktop chassis */}
        <rect x="6" y="8" width="188" height="72" rx="6" fill="url(#isr1101-ch)" stroke="#b0bec5" strokeWidth="0.8"/>
        <rect x="8" y="9" width="184" height="8" rx="5" fill="white" fillOpacity="0.5"/>
        <rect x="8" y="74" width="184" height="4" rx="3" fill="black" fillOpacity="0.1"/>
        {/* Cisco brand panel */}
        <rect x="14" y="16" width="52" height="22" rx="2" fill="#0c1a3d"/>
        <rect x="15" y="17" width="50" height="5" rx="2" fill="white" fillOpacity="0.08"/>
        {([{x:18,h:5},{x:22,h:8},{x:26,h:10},{x:30,h:10},{x:34,h:8},{x:38,h:5}]).map(({x,h},i) => (
          <rect key={i} x={x} y={26-h} width="2.5" height={h} rx="1" fill="#3b82f6"/>
        ))}
        <text x="40" y="28" textAnchor="middle" fill="#3b82f6" fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1">CISCO</text>
        <text x="40" y="35" textAnchor="middle" fill="#60a5fa" fontSize="4" fontFamily="monospace">ISR 1101</text>
        {/* Power LED */}
        <circle cx="170" cy="22" r="7" fill="#0c1a3d" stroke="#1e3a6b" strokeWidth="0.8"/>
        <circle cx="170" cy="22" r="4.5" fill="#4ade80" opacity="0.9" filter="url(#isr1101-glow)"/>
        <circle cx="169" cy="21" r="1.8" fill="white" fillOpacity="0.4"/>
        {/* USB port */}
        <rect x="148" y="16" width="16" height="10" rx="1.5" fill="#0e1216" stroke="#6a7888" strokeWidth="0.6"/>
        <rect x="149.5" y="17.5" width="13" height="7" rx="0.5" fill="url(#isr1101-port)"/>
        <rect x="149.5" y="21" width="13" height="0.8" fill="#1a1c1e"/>
        <text x="156" y="30.5" textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="monospace">USB</text>
        {/* CON port */}
        <rect x="130" y="16" width="14" height="10" rx="1" fill="#0e1216" stroke="#6a7888" strokeWidth="0.6"/>
        <rect x="131.5" y="17.5" width="11" height="7" rx="0.5" fill="url(#isr1101-port)"/>
        {[0,1,2,3,4,5,6,7].map(p => (
          <rect key={p} x={132+p*1.25} y="18.5" width="1" height="4" rx="0.2" fill="#b8860b" opacity="0.5"/>
        ))}
        <text x="137" y="30.5" textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="monospace">CON</text>
        {/* Section divider */}
        <rect x="14" y="44" width="172" height="5" rx="1" fill="#d4d8de" stroke="#c0c6cc" strokeWidth="0.3"/>
        <text x="100" y="48" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">INTERFACES</text>
        {/* 4 GE RJ45 ports with gold pins */}
        {[0,1,2,3].map(i => {
          const px = 14 + i * 40
          return (
            <g key={i}>
              <rect x={px} y="51" width="35" height="20" rx="1.5" fill="#1e293b" stroke="#9ca3af" strokeWidth="0.6"/>
              <rect x={px+1.5} y="52.5" width="32" height="16" rx="1" fill="url(#isr1101-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+2.5+p*3.6} y="54.5" width="2.6" height="9" rx="0.4" fill="#b8860b" opacity="0.55"/>
              ))}
              <rect x={px+5} y="67.5" width="25" height="2.5" rx="0.4" fill="#0f1218"/>
              {/* LED indicator */}
              <circle cx={px+17.5} cy="74" r="2.5" fill="#060708" stroke="#2d3033" strokeWidth="0.4"/>
              <circle cx={px+17.5} cy="74" r="1.8" fill={i<3?"#4ade80":"#3b82f6"} opacity={0.9} filter="url(#isr1101-glow)"/>
              <text x={px+17.5} y="80" textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="monospace">{i===0?"WAN":"GE"+i}</text>
            </g>
          )
        })}
        {/* Vent slots on right */}
        <rect x="158" y="51" width="30" height="26" rx="2" fill="#d0d5dc" stroke="#b0bec5" strokeWidth="0.4"/>
        {Array.from({length:4}).map((_,i) => (
          <rect key={i} x="160" y={53+i*5.5} width="26" height="3.5" rx="0.5" fill="#c0c8d0"/>
        ))}
      </svg>
    )
  }

  // ==========================================
  // DATACOM ROUTERS
  // ==========================================
  if (normalizedBrand === 'Datacom') {

    if (normalizedModel === 'DM/890-E') {
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-dm890-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1828"/>
              <stop offset="100%" stopColor="#060f1a"/>
            </linearGradient>
            <linearGradient id="dtc-dm890-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="dtc-dm890-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-dm890-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="dtc-dm890-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-dm890-ch)" filter="url(#dtc-dm890-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-dm890-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Datacom brand panel */}
          <rect x="12" y="8" width="52" height="54" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="13" y="9" width="50" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
          {/* Diamond logo */}
          <rect x="16" y="16" width="10" height="10" rx="1" fill="#005FAD" transform="rotate(45 21 21)"/>
          <rect x="18" y="18" width="6" height="6" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 21 21)"/>
          <text x="34" y="22" fill="#e5e7eb" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="34" y="30" fill="#9ca3af" fontSize="4" fontFamily="monospace">DM/890-E</text>
          <text x="34" y="37" fill="#4b5563" fontSize="3" fontFamily="monospace">Enterprise Router</text>
          {/* Ventilation slots */}
          {[0,1,2,3].map(i => (
            <rect key={i} x="14" y={42+i*5} width="48" height="3" rx="0.8" fill="#001a35" stroke="#003366" strokeWidth="0.3"/>
          ))}
          {/* Status LEDs */}
          {([
            {cy:20,color:'#4ade80',label:'SYS',on:true},
            {cy:34,color:'#0099FF',label:'LNK',on:true},
            {cy:48,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="71" cy={cy} r="5.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.6"/>
              <circle cx="71" cy={cy} r="4" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-dm890-glow)":undefined}/>
              {on && <circle cx="70" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.4"/>}
              <text x="80" y={cy+1.8} fill="#374151" fontSize="4" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header */}
          <rect x="90" y="4" width="130" height="8" fill="#060f1a"/>
          <text x="155" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET × 6</text>
          {/* LED bezel */}
          <rect x="90" y="12" width="130" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
          {[0,1,2,3,4,5].map(i => {
            const bx = 92 + i * 21
            return (
              <g key={i}>
                <rect x={bx}   y="13.5" width="9" height="5" rx="0.8" fill={i<4?"#4ade80":"#0a1a0a"} opacity={i<4?0.9:0.4} filter={i<4?"url(#dtc-dm890-glow)":undefined}/>
                <rect x={bx+11} y="13.5" width="9" height="5" rx="0.8" fill={i===0?"#0099FF":"#001020"} opacity={i===0?0.85:0.3} filter={i===0?"url(#dtc-dm890-glow)":undefined}/>
              </g>
            )
          })}
          {/* 6 GE ports */}
          {[0,1,2,3,4,5].map(i => {
            const px = 90 + i * 21
            return (
              <g key={i}>
                <rect x={px} y="20" width="20" height="18" rx="1.5" fill="#050c18" stroke="#1a2a40" strokeWidth="0.8"/>
                <rect x={px+1.5} y="21.5" width="17" height="14" rx="1" fill="url(#dtc-dm890-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+2+p*1.8} y="23" width="1.3" height="8" rx="0.4" fill="#b8860b" opacity="0.65"/>
                ))}
                <rect x={px+3} y="33.5" width="14" height="2.5" rx="0.4" fill="#040810"/>
                <text x={px+10} y="43" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GE{i}</text>
              </g>
            )
          })}
          {/* Vent slots */}
          {[0,1,2].map(i => (
            <rect key={i} x="92" y={46+i*6} width="126" height="4" rx="0.8" fill="#030a14" stroke="#001a35" strokeWidth="0.3"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'DM/990-E') {
      return (
        <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-dm990-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1828"/>
              <stop offset="100%" stopColor="#060f1a"/>
            </linearGradient>
            <linearGradient id="dtc-dm990-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="dtc-dm990-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-dm990-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="dtc-dm990-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears — 2U */}
          <rect x="0"   y="4" width="9" height="80" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="80" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="10"  width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          <rect x="1.5" y="62" width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="10"  width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="62" width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          {([[4.5,30],[4.5,58],[235.5,30],[235.5,58]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="84" rx="3" fill="url(#dtc-dm990-ch)" filter="url(#dtc-dm990-sh)"/>
          <rect x="9" y="2" width="222" height="84" rx="3" fill="url(#dtc-dm990-brush)"/>
          <rect x="9" y="2" width="222" height="84" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
          <rect x="10" y="81" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,8],[226,8],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Datacom brand panel */}
          <rect x="12" y="10" width="52" height="68" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="13" y="11" width="50" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
          {/* Diamond logo */}
          <rect x="16" y="20" width="10" height="10" rx="1" fill="#005FAD" transform="rotate(45 21 25)"/>
          <rect x="18" y="22" width="6" height="6" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 21 25)"/>
          <text x="34" y="28" fill="#e5e7eb" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="34" y="37" fill="#9ca3af" fontSize="4" fontFamily="monospace">DM/990-E</text>
          <text x="34" y="44" fill="#4b5563" fontSize="3" fontFamily="monospace">Core MPLS Router</text>
          {/* Ventilation slots */}
          {[0,1,2,3].map(i => (
            <rect key={i} x="14" y={52+i*5} width="48" height="3" rx="0.8" fill="#001a35" stroke="#003366" strokeWidth="0.3"/>
          ))}
          {/* Status LEDs */}
          {([
            {cy:24,color:'#4ade80',label:'SYS',on:true},
            {cy:42,color:'#0099FF',label:'LNK',on:true},
            {cy:60,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="71" cy={cy} r="5.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.6"/>
              <circle cx="71" cy={cy} r="4" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-dm990-glow)":undefined}/>
              {on && <circle cx="70" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.4"/>}
              <text x="80" y={cy+1.8} fill="#374151" fontSize="4" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header — 10GE SFP+ */}
          <rect x="90" y="8" width="130" height="8" fill="#060f1a"/>
          <text x="155" y="14" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">10GE SFP+ × 4</text>
          {/* LED bezel */}
          <rect x="90" y="16" width="130" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
          {[0,1,2,3].map(i => (
            <rect key={i} x={92+i*32} y="17.5" width="28" height="4.5" rx="0.8" fill="#0099FF" opacity={i<3?0.7:0.2} filter={i<3?"url(#dtc-dm990-glow)":undefined}/>
          ))}
          {/* 4 × SFP+ cages */}
          {[0,1,2,3].map(i => {
            const px = 90 + i * 32
            return (
              <g key={i}>
                <rect x={px} y="24" width="30" height="36" rx="1.5" fill="#040c1a" stroke="#005FAD" strokeWidth="0.7"/>
                <rect x={px+1} y="25" width="28" height="34" rx="0.8" fill="#060f1a"/>
                <rect x={px+2} y="27" width="26" height="18" fill="#0099FF" fillOpacity="0.15"/>
                <rect x={px+3} y="44" width="24" height="4" rx="0.5" fill="#001830" stroke="#003366" strokeWidth="0.3"/>
                <circle cx={px+15} cy="64" r="3" fill="#0099FF" opacity="0.9" filter="url(#dtc-dm990-glow)"/>
                <circle cx={px+14} cy="63" r="1.2" fill="white" fillOpacity="0.4"/>
                <text x={px+15} y="72" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">SFP{i}</text>
              </g>
            )
          })}
          {/* Vent slots lower */}
          {[0,1,2].map(i => (
            <rect key={i} x="92" y={76+i*3} width="126" height="2" rx="0.5" fill="#030a14" stroke="#001a35" strokeWidth="0.3"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'DM/1100-E') {
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-dm1100-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1828"/>
              <stop offset="100%" stopColor="#060f1a"/>
            </linearGradient>
            <linearGradient id="dtc-dm1100-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="dtc-dm1100-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-dm1100-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="dtc-dm1100-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-dm1100-ch)" filter="url(#dtc-dm1100-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-dm1100-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Datacom brand panel */}
          <rect x="12" y="8" width="52" height="54" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="13" y="9" width="50" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
          {/* Diamond logo */}
          <rect x="16" y="16" width="10" height="10" rx="1" fill="#005FAD" transform="rotate(45 21 21)"/>
          <rect x="18" y="18" width="6" height="6" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 21 21)"/>
          <text x="34" y="22" fill="#e5e7eb" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="34" y="30" fill="#9ca3af" fontSize="4" fontFamily="monospace">DM/1100-E</text>
          <text x="34" y="37" fill="#4b5563" fontSize="3" fontFamily="monospace">Metro Carrier</text>
          {/* Ventilation slots */}
          {[0,1,2,3].map(i => (
            <rect key={i} x="14" y={42+i*5} width="48" height="3" rx="0.8" fill="#001a35" stroke="#003366" strokeWidth="0.3"/>
          ))}
          {/* Status LEDs */}
          {([
            {cy:20,color:'#4ade80',label:'SYS',on:true},
            {cy:34,color:'#0099FF',label:'LNK',on:true},
            {cy:48,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="71" cy={cy} r="5.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.6"/>
              <circle cx="71" cy={cy} r="4" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-dm1100-glow)":undefined}/>
              {on && <circle cx="70" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.4"/>}
              <text x="80" y={cy+1.8} fill="#374151" fontSize="4" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* GE ports section header */}
          <rect x="90" y="4" width="100" height="8" fill="#060f1a"/>
          <text x="140" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET × 8</text>
          {/* LED bezel */}
          <rect x="90" y="12" width="100" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
          {[0,1,2,3,4,5,6,7].map(i => (
            <rect key={i} x={92+i*12} y="13.5" width="10" height="4.5" rx="0.8" fill={i<6?"#4ade80":"#0a1a0a"} opacity={i<6?0.9:0.4} filter={i<6?"url(#dtc-dm1100-glow)":undefined}/>
          ))}
          {/* 8 GE ports */}
          {[0,1,2,3,4,5,6,7].map(i => {
            const px = 90 + i * 12
            return (
              <g key={i}>
                <rect x={px} y="20" width="11" height="16" rx="1.2" fill="#050c18" stroke="#1a2a40" strokeWidth="0.7"/>
                <rect x={px+1} y="21" width="9" height="13" rx="0.8" fill="url(#dtc-dm1100-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+1.2+p*0.95} y="22" width="0.75" height="7" rx="0.3" fill="#b8860b" opacity="0.6"/>
                ))}
                <rect x={px+1.5} y="33" width="8" height="1.5" rx="0.3" fill="#040810"/>
                <text x={px+5.5} y="42" textAnchor="middle" fill="#374151" fontSize="2.8" fontFamily="monospace">G{i}</text>
              </g>
            )
          })}
          {/* SFP+ section */}
          <rect x="194" y="4" width="32" height="8" fill="#060f1a"/>
          <text x="210" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">SFP+ × 2</text>
          {[0,1].map(i => {
            const px = 194 + i * 15
            return (
              <g key={i}>
                <rect x={px} y="14" width="13" height="22" rx="1.5" fill="#040c1a" stroke="#005FAD" strokeWidth="0.7"/>
                <rect x={px+1} y="15" width="11" height="20" rx="0.8" fill="#060f1a"/>
                <rect x={px+1.5} y="17" width="10" height="10" fill="#0099FF" fillOpacity="0.2"/>
                <circle cx={px+7} cy="40" r="1.5" fill="#0099FF" opacity="0.9" filter="url(#dtc-dm1100-glow)"/>
                <text x={px+7} y="47" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">XG{i}</text>
              </g>
            )
          })}
          {/* Vent slots */}
          {[0,1,2].map(i => (
            <rect key={i} x="92" y={46+i*6} width="130" height="4" rx="0.8" fill="#030a14" stroke="#001a35" strokeWidth="0.3"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'DM/440-E') {
      // SOHO desktop router — no rack ears, silver/gray chassis, 2 GE ports
      return (
        <svg viewBox="0 0 200 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-dm440-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4d8e0"/>
              <stop offset="100%" stopColor="#b0b8c8"/>
            </linearGradient>
            <linearGradient id="dtc-dm440-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="dtc-dm440-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-dm440-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.4"/>
            </filter>
          </defs>
          {/* Desktop chassis */}
          <rect x="6" y="6" width="188" height="76" rx="6" fill="url(#dtc-dm440-ch)" filter="url(#dtc-dm440-sh)" stroke="#9aabb8" strokeWidth="0.8"/>
          <rect x="8" y="7" width="184" height="8" rx="5" fill="white" fillOpacity="0.5"/>
          <rect x="8" y="78" width="184" height="3" rx="2" fill="black" fillOpacity="0.08"/>
          {/* Brand panel */}
          <rect x="14" y="16" width="56" height="54" rx="2" fill="#001830" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="15" y="17" width="54" height="5" rx="2" fill="#005FAD" fillOpacity="0.4"/>
          {/* Diamond logo */}
          <rect x="18" y="26" width="10" height="10" rx="1" fill="#005FAD" transform="rotate(45 23 31)"/>
          <rect x="20" y="28" width="6" height="6" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 23 31)"/>
          <text x="42" y="34" textAnchor="middle" fill="#e5e7eb" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="42" y="42" textAnchor="middle" fill="#9ca3af" fontSize="4.5" fontFamily="monospace">DM/440-E</text>
          <text x="42" y="50" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SOHO Router</text>
          {/* Power LED */}
          <circle cx="42" cy="62" r="5" fill="#001220" stroke="#003366" strokeWidth="0.6"/>
          <circle cx="42" cy="62" r="3.5" fill="#4ade80" opacity="0.9" filter="url(#dtc-dm440-glow)"/>
          <circle cx="41" cy="61" r="1.4" fill="white" fillOpacity="0.4"/>
          {/* GE ports label */}
          <rect x="76" y="18" width="58" height="6" rx="1" fill="#c8d0da" stroke="#b0bec5" strokeWidth="0.3"/>
          <text x="105" y="22.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET</text>
          {/* LED bezel */}
          <rect x="76" y="25" width="58" height="7" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.3"/>
          {[0,1].map(i => (
            <g key={i}>
              <rect x={78+i*28} y="26.5" width="12" height="4.5" rx="0.8" fill="#4ade80" opacity="0.9" filter="url(#dtc-dm440-glow)"/>
              <rect x={92+i*28} y="26.5" width="10" height="4.5" rx="0.8" fill="#0099FF" opacity={i===0?0.85:0.3} filter={i===0?"url(#dtc-dm440-glow)":undefined}/>
            </g>
          ))}
          {/* 2 GE ports */}
          {[0,1].map(i => {
            const px = 76 + i * 30
            return (
              <g key={i}>
                <rect x={px} y="33" width="28" height="22" rx="1.5" fill="#1e293b" stroke="#9ca3af" strokeWidth="0.6"/>
                <rect x={px+1.5} y="34.5" width="25" height="18" rx="1" fill="url(#dtc-dm440-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+2.5+p*2.8} y="36" width="2" height="11" rx="0.4" fill="#b8860b" opacity="0.6"/>
                ))}
                <rect x={px+5} y="51.5" width="18" height="2.5" rx="0.4" fill="#0c1018"/>
                <text x={px+14} y="61" textAnchor="middle" fill="#6b7280" fontSize="4" fontFamily="monospace">{i===0?"WAN":"LAN"}</text>
              </g>
            )
          })}
          {/* Vent slots on right */}
          <rect x="140" y="22" width="50" height="54" rx="3" fill="#c8d0da" stroke="#b0bec5" strokeWidth="0.4"/>
          {Array.from({length:6}).map((_,i) => (
            <rect key={i} x="143" y={26+i*8} width="44" height="4.5" rx="0.8" fill="#b8c4d0"/>
          ))}
        </svg>
      )
    }

    // Default DM/460-E — branch enterprise router
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="dtc-dm460-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1828"/>
            <stop offset="100%" stopColor="#060f1a"/>
          </linearGradient>
          <linearGradient id="dtc-dm460-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070809"/>
            <stop offset="100%" stopColor="#030404"/>
          </linearGradient>
          <filter id="dtc-dm460-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dtc-dm460-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="dtc-dm460-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
        <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-dm460-ch)" filter="url(#dtc-dm460-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-dm460-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Datacom brand panel */}
        <rect x="12" y="8" width="52" height="54" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
        <rect x="13" y="9" width="50" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
        {/* Diamond logo */}
        <rect x="16" y="16" width="10" height="10" rx="1" fill="#005FAD" transform="rotate(45 21 21)"/>
        <rect x="18" y="18" width="6" height="6" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 21 21)"/>
        <text x="34" y="22" fill="#e5e7eb" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
        <text x="34" y="30" fill="#9ca3af" fontSize="4" fontFamily="monospace">DM/460-E</text>
        <text x="34" y="37" fill="#4b5563" fontSize="3" fontFamily="monospace">Enterprise Router</text>
        {/* Ventilation slots */}
        {[0,1,2,3].map(i => (
          <rect key={i} x="14" y={42+i*5} width="48" height="3" rx="0.8" fill="#001a35" stroke="#003366" strokeWidth="0.3"/>
        ))}
        {/* Status LEDs */}
        {([
          {cy:20,color:'#4ade80',label:'SYS',on:true},
          {cy:34,color:'#0099FF',label:'LNK',on:true},
          {cy:48,color:'#ef4444',label:'ALM',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="71" cy={cy} r="5.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.6"/>
            <circle cx="71" cy={cy} r="4" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-dm460-glow)":undefined}/>
            {on && <circle cx="70" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.4"/>}
            <text x="80" y={cy+1.8} fill="#374151" fontSize="4" fontFamily="monospace">{label}</text>
          </g>
        ))}
        {/* Section header */}
        <rect x="90" y="4" width="130" height="8" fill="#060f1a"/>
        <text x="155" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET × 4</text>
        {/* LED bezel */}
        <rect x="90" y="12" width="130" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
        {[0,1,2,3].map(i => {
          const bx = 92 + i * 32
          return (
            <g key={i}>
              <rect x={bx}    y="13.5" width="14" height="5" rx="0.8" fill={i<3?"#4ade80":"#0a1a0a"} opacity={i<3?0.9:0.4} filter={i<3?"url(#dtc-dm460-glow)":undefined}/>
              <rect x={bx+16} y="13.5" width="14" height="5" rx="0.8" fill={i===0?"#0099FF":"#001020"} opacity={i===0?0.85:0.3} filter={i===0?"url(#dtc-dm460-glow)":undefined}/>
            </g>
          )
        })}
        {/* 4 GE ports */}
        {[0,1,2,3].map(i => {
          const px = 90 + i * 32
          return (
            <g key={i}>
              <rect x={px} y="20" width="30" height="22" rx="1.5" fill="#050c18" stroke="#1a2a40" strokeWidth="0.8"/>
              <rect x={px+1.5} y="21.5" width="27" height="18" rx="1" fill="url(#dtc-dm460-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+2.5+p*3.1} y="23" width="2.2" height="10" rx="0.4" fill="#b8860b" opacity="0.65"/>
              ))}
              <rect x={px+4} y="37.5" width="22" height="2.5" rx="0.4" fill="#040810"/>
              <text x={px+15} y="48" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">{i===0?"WAN":"GE"+i}</text>
            </g>
          )
        })}
        {/* Vent slots */}
        {[0,1,2].map(i => (
          <rect key={i} x="92" y={50+i*5} width="126" height="3.5" rx="0.8" fill="#030a14" stroke="#001a35" strokeWidth="0.3"/>
        ))}
      </svg>
    )
  }

  // Default Cisco ISR 2911 — Redesigned for realism
  const t = routerTheme(normalizedBrand)
  return (
    <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="rtr-ch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={t.bg1} />
          <stop offset="100%" stopColor={t.bg2} />
        </linearGradient>
        <linearGradient id="rtr-port-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#080c14" />
          <stop offset="100%" stopColor="#030508" />
        </linearGradient>
        <filter id="led-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="rtr-sh" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
        </filter>
        <pattern id="rtr-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
        </pattern>
      </defs>

      {/* ── Rack ears ── */}
      <rect x="0"   y="4"  width="9" height="64" rx="2" fill="#1e2530"/>
      <rect x="231" y="4"  width="9" height="64" rx="2" fill="#1e2530"/>
      <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0a0d12"/>
      <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0a0d12"/>
      <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0a0d12"/>
      <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0a0d12"/>
      <circle cx="4.5" cy="26" r="1.8" fill="#0a0d12" stroke="#2a3040" strokeWidth="0.4"/>
      <line x1="3.2" y1="26" x2="5.8" y2="26" stroke="#2a3040" strokeWidth="0.5"/>
      <line x1="4.5" y1="24.7" x2="4.5" y2="27.3" stroke="#2a3040" strokeWidth="0.5"/>
      <circle cx="4.5" cy="46" r="1.8" fill="#0a0d12" stroke="#2a3040" strokeWidth="0.4"/>
      <line x1="3.2" y1="46" x2="5.8" y2="46" stroke="#2a3040" strokeWidth="0.5"/>
      <line x1="4.5" y1="44.7" x2="4.5" y2="47.3" stroke="#2a3040" strokeWidth="0.5"/>
      <circle cx="235.5" cy="26" r="1.8" fill="#0a0d12" stroke="#2a3040" strokeWidth="0.4"/>
      <line x1="234.2" y1="26" x2="236.8" y2="26" stroke="#2a3040" strokeWidth="0.5"/>
      <line x1="235.5" y1="24.7" x2="235.5" y2="27.3" stroke="#2a3040" strokeWidth="0.5"/>
      <circle cx="235.5" cy="46" r="1.8" fill="#0a0d12" stroke="#2a3040" strokeWidth="0.4"/>
      <line x1="234.2" y1="46" x2="236.8" y2="46" stroke="#2a3040" strokeWidth="0.5"/>
      <line x1="235.5" y1="44.7" x2="235.5" y2="47.3" stroke="#2a3040" strokeWidth="0.5"/>

      {/* ── Main chassis ── */}
      <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#rtr-ch)"    filter="url(#rtr-sh)"/>
      <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#rtr-brush)"/>
      <rect x="9" y="2"  width="222" height="68" rx="3" stroke={t.border} strokeWidth="0.8"/>
      <rect x="10" y="3" width="220" height="5"  rx="3" fill="white" fillOpacity="0.1"/>
      <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>

      {/* ── Corner screws ── */}
      {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="3.2" fill={t.bg1} stroke="#2a3550" strokeWidth="0.6"/>
          <line x1={cx-2} y1={cy}   x2={cx+2} y2={cy}   stroke="#2a3550" strokeWidth="0.8"/>
          <line x1={cx}   y1={cy-2} x2={cx}   y2={cy+2} stroke="#2a3550" strokeWidth="0.8"/>
        </g>
      ))}

      {/* ── Cisco branding panel ── */}
      <rect x="18" y="8"  width="52" height="34" rx="2" fill="#0c1525" stroke={t.accent} strokeWidth="0.7"/>
      <rect x="19" y="9"  width="50" height="6"  rx="2" fill={t.accent} fillOpacity="0.1"/>
      {([{x:22,h:9},{x:28,h:15},{x:34,h:19},{x:40,h:19},{x:46,h:15},{x:52,h:9}]).map(({x,h},i) => (
        <rect key={i} x={x} y={24-h} width="4" height={h} rx="2" fill={t.accent}/>
      ))}
      <text x="44" y="31" textAnchor="middle" fill={t.accent}  fontSize="5.5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1.5">CISCO</text>
      <text x="44" y="39" textAnchor="middle" fill="#475569"    fontSize="4.5" fontFamily="monospace">ISR 2911</text>

      {/* ── Divider ── */}
      <line x1="74" y1="5" x2="74" y2="67" stroke="#1e293b" strokeWidth="0.8"/>

      {/* ── GE section header ── */}
      <rect x="75" y="5" width="84" height="9" fill="#0b1020"/>
      <text x="117" y="11.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace" letterSpacing="0.3">GIGABIT ETHERNET</text>

      {/* ── Per-port LED bezel panel ── */}
      <rect x="75" y="14" width="84" height="8" rx="1" fill="#060a10" stroke="#1a2338" strokeWidth="0.4"/>
      {[0,1,2].map(i => {
        const bx = 78 + i * 28
        return (
          <g key={i}>
            <rect x={bx}   y="15.5" width="7" height="5" rx="0.8" fill={i<2 ? "#4ade80" : "#0f2010"} opacity={i<2 ? 0.9 : 0.4} filter={i<2 ? "url(#led-glow)" : undefined}/>
            <rect x={bx+9} y="15.5" width="7" height="5" rx="0.8" fill={i===0 ? "#fbbf24" : "#201808"} opacity={i===0 ? 0.85 : 0.3} filter={i===0 ? "url(#led-glow)" : undefined}/>
            <text x={bx+3.5}  y="13.5" textAnchor="middle" fill="#2a3550" fontSize="2.5" fontFamily="monospace">LNK</text>
            <text x={bx+12.5} y="13.5" textAnchor="middle" fill="#2a3550" fontSize="2.5" fontFamily="monospace">ACT</text>
          </g>
        )
      })}

      {/* ── 3 RJ45 GE ports ── */}
      {[0,1,2].map(i => {
        const px = 75 + i * 28
        return (
          <g key={i}>
            <rect x={px}     y="23" width="23" height="18" rx="2"   fill="#08090e" stroke="#2a3550" strokeWidth="0.9"/>
            <rect x={px+1.5} y="24.5" width="20" height="14" rx="1.2" fill="url(#rtr-port-inner)"/>
            {[0,1,2,3,4,5,6,7].map(p => (
              <rect key={p} x={px+2.5+p*2.1} y="26" width="1.4" height="8" rx="0.4" fill="#b8860b" opacity="0.65"/>
            ))}
            <rect x={px+4}   y="37.5" width="15" height="2.5" rx="0.5" fill="#050710"/>
            <rect x={px+9.5} y="38.5" width="4"  height="2.5" rx="0.5" fill="#0c1020"/>
            <text x={px+11.5} y="47" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GE{i}/0</text>
          </g>
        )
      })}

      {/* ── Mgmt section ── */}
      <line x1="163" y1="5" x2="163" y2="67" stroke="#1e293b" strokeWidth="0.8"/>
      <rect x="163" y="5" width="35" height="9" fill="#0b1020"/>
      <text x="180" y="11.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">MGMT</text>

      {/* CON port */}
      <rect x="164" y="14" width="16" height="18" rx="2" fill="#030810" stroke="#1e3a6b" strokeWidth="0.9"/>
      <rect x="165.5" y="15.5" width="13" height="14" rx="1" fill="#020408"/>
      {[0,1,2,3,4,5,6,7].map(p => (
        <rect key={p} x={166.5+p*1.35} y="17" width="1"  height="8" rx="0.3" fill="#b8860b" opacity="0.55"/>
      ))}
      <rect x="168" y="28" width="9" height="2.5" rx="0.5" fill="#060810"/>
      <rect x="170.5" y="29" width="4" height="2.5" rx="0.5" fill="#0a0f18"/>
      <text x="172" y="38" textAnchor="middle" fill="#334155" fontSize="3.5" fontFamily="monospace">CON</text>

      {/* AUX port */}
      <rect x="164" y="42" width="16" height="16" rx="2" fill="#04060c" stroke="#2a3550" strokeWidth="0.9"/>
      <rect x="165.5" y="43.5" width="13" height="12" rx="1" fill="#020408"/>
      {[0,1,2,3,4,5,6,7].map(p => (
        <rect key={p} x={166.5+p*1.35} y="45" width="1" height="6" rx="0.3" fill="#b8860b" opacity="0.5"/>
      ))}
      <text x="172" y="63" textAnchor="middle" fill="#334155" fontSize="3.5" fontFamily="monospace">AUX</text>

      {/* USB port */}
      <rect x="183" y="22" width="14" height="11" rx="1.5" fill="#04060c" stroke="#2a3550" strokeWidth="0.7"/>
      <rect x="184.5" y="23.5" width="11" height="8" rx="0.5" fill="#020408"/>
      <rect x="184.5" y="27"   width="11" height="1" fill="#1e293b"/>
      <text x="190" y="39" textAnchor="middle" fill="#334155" fontSize="3.5" fontFamily="monospace">USB</text>

      {/* CF card slot */}
      <rect x="183" y="44" width="14" height="10" rx="1" fill="#04060c" stroke="#2a3550" strokeWidth="0.6"/>
      <rect x="184.5" y="45.5" width="11" height="7" rx="0.5" fill="#020408"/>
      <text x="190" y="60" textAnchor="middle" fill="#334155" fontSize="3.5" fontFamily="monospace">CF</text>

      {/* ── Status section ── */}
      <line x1="201" y1="5" x2="201" y2="67" stroke="#1e293b" strokeWidth="0.8"/>
      <rect x="201" y="5" width="30" height="9" fill="#0b1020"/>
      <text x="216" y="11.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">STATUS</text>
      {([
        {cy:21,color:'#4ade80',label:'SYS',on:true},
        {cy:36,color:t.accent, label:'ACT',on:true},
        {cy:51,color:'#ef4444',label:'ERR',on:false},
      ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
        <g key={label}>
          <circle cx="211" cy={cy} r="5.5" fill="#060b10" stroke="#1e293b" strokeWidth="0.6"/>
          <circle cx="211" cy={cy} r="4"   fill={color} opacity={on ? 0.9 : 0.12} filter={on ? "url(#led-glow)" : undefined}/>
          {on && <circle cx="210" cy={cy-1.5} r="1.5" fill="white" fillOpacity="0.45"/>}
          <text x="220" y={cy+1.8} fill="#4b5563" fontSize="4" fontFamily="monospace">{label}</text>
        </g>
      ))}

      {/* ── Ventilation grille ── */}
      <rect x="18" y="50" width="52" height="14" rx="1.5" fill="#060a10" stroke="#1a2030" strokeWidth="0.4"/>
      {Array.from({length:9}).map((_,i) => (
        <rect key={i} x={20+i*5.2} y="52" width="3.2" height="10" rx="0.6" fill="#040810" stroke="#141e2c" strokeWidth="0.4"/>
      ))}
    </svg>
  )
}

export function SwitchPreview({ brand, model, ...props }: PreviewP) {
  const normalizedBrand = brand?.trim() || 'Cisco'
  const normalizedModel = model?.trim() || 'Catalyst 2960-X'

  // ==========================================
  // HUAWEI SWITCHES
  // ==========================================
  if (normalizedBrand === 'Huawei') {
    if (normalizedModel === 'S6730-H') {
      // S6730-H: High-speed SFP+ switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="s6730-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1818"/>
              <stop offset="100%" stopColor="#100b0b"/>
            </linearGradient>
            <filter id="s6730-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="s6730-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="s6730-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#111827"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#111827"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#s6730-ch)" filter="url(#s6730-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#s6730-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#cf0a2c" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#cf0a2c" fillOpacity="0.8"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="36" height="32" rx="2" fill="#cf0a2c"/>
          <rect x="13" y="9" width="34" height="5" rx="2" fill="white" fillOpacity="0.1"/>
          <text x="30" y="20" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">HUAWEI</text>
          <text x="30" y="29" textAnchor="middle" fill="white" fontSize="4" fontFamily="monospace">S6730-H</text>
          <text x="30" y="36" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="3" fontFamily="monospace">10G SFP+</text>
          {/* Section header */}
          <rect x="52" y="5" width="142" height="9" fill="#0e0f10"/>
          <text x="123" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">10G SFP+ PORTS (24×)</text>
          {/* LED bezel */}
          <rect x="52" y="14" width="142" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={54+i*8.8} y="15.5" width="6.5" height="4" rx="0.6" fill={i<13?"#4ade80":"#0a1a0a"} opacity={i<13?0.9:0.4} filter={i<13?"url(#s6730-glow)":undefined}/>
          ))}
          {/* 16 SFP+ cages (2 rows of 8) */}
          {Array.from({length:16}).map((_,i) => {
            const col = i % 8, row = Math.floor(i / 8)
            const x = 52 + col * 11, y = 22 + row * 16
            return (
              <g key={i}>
                <rect x={x} y={y} width="10" height="13" rx="1" fill="#020617" stroke="#ffd700" strokeWidth="0.5"/>
                <rect x={x+1} y={y+1} width="8" height="11" fill="#ffd700" fillOpacity="0.25" rx="0.5"/>
              </g>
            )
          })}
          {/* Status section */}
          <line x1="196" y1="3" x2="196" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="196" y="3" width="34" height="9" fill="#0e0f10"/>
          <text x="213" y="9.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
          {(['SYS','PWR','ACT'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="206" cy={18+idx*14} r="5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="206" cy={18+idx*14} r="3.5" fill={idx===2?'#3b82f6':'#4ade80'} opacity={0.9} filter="url(#s6730-glow)"/>
              <circle cx="205" cy={17+idx*14} r="1.4" fill="white" fillOpacity="0.35"/>
              <text x="216" y={19.8+idx*14} fill="#4b5563" fontSize="4" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'S5720-28P') {
      // S5720-28P: PoE+ switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="s5720-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1c1e"/>
              <stop offset="100%" stopColor="#0f1012"/>
            </linearGradient>
            <linearGradient id="s5720-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="s5720-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="s5720-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="s5720-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#111827"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#111827"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#s5720-ch)" filter="url(#s5720-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#s5720-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#4ade80" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#4ade80" fillOpacity="0.3"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="36" height="32" rx="2" fill="#4ade80" fillOpacity="0.15" stroke="#4ade80" strokeWidth="0.6"/>
          <rect x="13" y="9" width="34" height="5" rx="2" fill="#4ade80" fillOpacity="0.1"/>
          <text x="30" y="20" textAnchor="middle" fill="#4ade80" fontSize="6" fontFamily="sans-serif" fontWeight="bold">S5720</text>
          <text x="30" y="29" textAnchor="middle" fill="#86efac" fontSize="4.5" fontFamily="monospace">28P PoE+</text>
          <text x="30" y="36" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">370W</text>
          {/* Section header */}
          <rect x="52" y="5" width="148" height="9" fill="#0e0f10"/>
          <text x="126" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GE PoE+ PORTS (24×)</text>
          {/* LED bezel — 16 ports */}
          <rect x="52" y="14" width="148" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={54+i*9.2} y="15.5" width="7" height="4" rx="0.6" fill="#4ade80" opacity={0.9} filter="url(#s5720-glow)"/>
          ))}
          {/* 16 RJ45 ports — 2 rows of 8 */}
          {Array.from({length:16}).map((_,i) => {
            const col = i % 8, row = Math.floor(i / 8)
            const x = 52 + col * 9.5, y = 22 + row * 16
            return (
              <g key={i}>
                <rect x={x} y={y} width="8.5" height="11" rx="1" fill="#060708" stroke="#3d4044" strokeWidth="0.6"/>
                <rect x={x+0.8} y={y+0.8} width="6.9" height="9" rx="0.7" fill="url(#s5720-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={x+1+p*1.3} y={y+2} width="1" height="5" rx="0.2" fill="#b8860b" opacity="0.5"/>
                ))}
                {/* PoE indicator */}
                <rect x={x+1} y={y+11.5} width="6.5" height="2" rx="0.3" fill="#4ade80" fillOpacity="0.5"/>
              </g>
            )
          })}
          {/* Status section */}
          <line x1="204" y1="3" x2="204" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="204" y="3" width="26" height="9" fill="#0e0f10"/>
          <text x="217" y="9.5" textAnchor="middle" fill="#6b7280" fontSize="3" fontFamily="monospace">STATUS</text>
          {(['SYS','PWR','PoE'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="212" cy={18+idx*14} r="5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="212" cy={18+idx*14} r="3.5" fill="#4ade80" opacity={0.9} filter="url(#s5720-glow)"/>
              <circle cx="211" cy={17+idx*14} r="1.4" fill="white" fillOpacity="0.35"/>
              <text x="222" y={19.8+idx*14} fill="#4b5563" fontSize="4" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'CloudEngine 6870') {
      // CloudEngine 6870: DC Fabric Switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ce6870-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#100b0b"/>
              <stop offset="100%" stopColor="#0a0707"/>
            </linearGradient>
            <filter id="ce6870-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ce6870-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ce6870-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#090d16"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#090d16"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ce6870-ch)" filter="url(#ce6870-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ce6870-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#cf0a2c" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#cf0a2c" fillOpacity="0.8"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="36" height="32" rx="2" fill="#cf0a2c"/>
          <rect x="13" y="9" width="34" height="5" rx="2" fill="white" fillOpacity="0.12"/>
          <text x="30" y="18" textAnchor="middle" fill="#fff" fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">CE6870</text>
          <text x="30" y="26" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="3.5" fontFamily="monospace">Fabric</text>
          <text x="30" y="33" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="3" fontFamily="monospace">DC Switch</text>
          {/* Section header for 100G ports */}
          <rect x="52" y="5" width="88" height="9" fill="#0e0f10"/>
          <text x="96" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">100GE QSFP28 (×32)</text>
          {/* LED bezel */}
          <rect x="52" y="14" width="88" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={54+i*5.4} y="15.5" width="4" height="4" rx="0.5" fill="#4ade80" opacity={0.85} filter="url(#ce6870-glow)"/>
          ))}
          {/* 32 QSFP28 port grid */}
          {Array.from({length:32}).map((_,i) => {
            const col = i % 16, row = Math.floor(i / 16)
            const x = 52 + col * 5.5, y = 22 + row * 16
            return (
              <g key={i}>
                <rect x={x} y={y} width="4.8" height="13" rx="0.5" fill="#020617" stroke="#ffd700" strokeWidth="0.4"/>
                <rect x={x+0.5} y={y+0.5} width="3.8" height="12" fill="#ffd700" fillOpacity="0.2" rx="0.3"/>
              </g>
            )
          })}
          {/* Uplink section */}
          <line x1="144" y1="3" x2="144" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="144" y="5" width="50" height="9" fill="#0e0f10"/>
          <text x="169" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">UPLINKS</text>
          {/* LED bezel for uplinks */}
          <rect x="144" y="14" width="50" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {[0,1,2,3].map(i => (
            <rect key={i} x={146+i*12} y="15.5" width="9" height="4" rx="0.6" fill={i<2?"#3b82f6":"#0a1a0a"} opacity={i<2?0.9:0.4} filter={i<2?"url(#ce6870-glow)":undefined}/>
          ))}
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect x={144+i*12} y="22" width="10" height="18" rx="1" fill="#000" stroke="#cf0a2c" strokeWidth="0.5"/>
              <rect x={145+i*12} y="23" width="8" height="16" fill="#ffd700" fillOpacity="0.25" rx="0.5"/>
            </g>
          ))}
          {/* Status section */}
          <line x1="198" y1="3" x2="198" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="198" y="3" width="32" height="9" fill="#0e0f10"/>
          <text x="214" y="9.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
          {(['SYS','PWR','FAN'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="208" cy={18+idx*14} r="5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="208" cy={18+idx*14} r="3.5" fill={idx===1?'#cf0a2c':'#4ade80'} opacity={0.9} filter="url(#ce6870-glow)"/>
              <circle cx="207" cy={17+idx*14} r="1.4" fill="white" fillOpacity="0.35"/>
              <text x="218" y={19.8+idx*14} fill="#4b5563" fontSize="4" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'S2720-28TP') {
      // S2720-28TP: Slim access switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="s2720-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d3748"/>
              <stop offset="100%" stopColor="#1a202c"/>
            </linearGradient>
            <linearGradient id="s2720-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="s2720-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="s2720-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.55"/>
            </filter>
            <pattern id="s2720-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#374151"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#374151"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#1f2937"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#s2720-ch)" filter="url(#s2720-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#s2720-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#475569" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#cf0a2c" fillOpacity="0.6"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="38" height="32" rx="2" fill="#cf0a2c"/>
          <rect x="13" y="9" width="36" height="5" rx="2" fill="white" fillOpacity="0.1"/>
          <text x="31" y="20" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="sans-serif" fontWeight="bold">S2720</text>
          <text x="31" y="29" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="4" fontFamily="monospace">28TP</text>
          <text x="31" y="36" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="3" fontFamily="monospace">Access</text>
          {/* Section header */}
          <rect x="54" y="5" width="142" height="9" fill="#0e0f10"/>
          <text x="125" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GE RJ45 PORTS (24×)</text>
          {/* LED bezel */}
          <rect x="54" y="14" width="142" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={56+i*8.8} y="15.5" width="6.5" height="4" rx="0.6" fill={i<12?"#4ade80":"#0a1a0a"} opacity={i<12?0.85:0.3} filter={i<12?"url(#s2720-glow)":undefined}/>
          ))}
          {/* 16 RJ45 ports — 2 rows */}
          {Array.from({length:16}).map((_,i) => {
            const col = i % 8, row = Math.floor(i / 8)
            const x = 54 + col * 9, y = 22 + row * 17
            return (
              <g key={i}>
                <rect x={x} y={y} width="8" height="12" rx="1" fill="#060708" stroke="#3d4044" strokeWidth="0.6"/>
                <rect x={x+0.8} y={y+0.8} width="6.4" height="10" rx="0.7" fill="url(#s2720-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={x+1+p*1.2} y={y+2} width="0.9" height="5" rx="0.2" fill="#b8860b" opacity="0.5"/>
                ))}
                <rect x={x+1.5} y={y+12.5} width="5" height="1.5" rx="0.3" fill="#0a0d10"/>
              </g>
            )
          })}
          {/* Status section */}
          <line x1="200" y1="3" x2="200" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="200" y="3" width="30" height="9" fill="#0e0f10"/>
          <text x="215" y="9.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
          {(['SYS','PWR','ACT'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="210" cy={18+idx*14} r="5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="210" cy={18+idx*14} r="3.5" fill={idx===2?'#3b82f6':'#4ade80'} opacity={0.9} filter="url(#s2720-glow)"/>
              <circle cx="209" cy={17+idx*14} r="1.4" fill="white" fillOpacity="0.35"/>
              <text x="220" y={19.8+idx*14} fill="#4b5563" fontSize="4" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    // Default Huawei Switch S5735-L — ultra-detailed
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="hw-sw-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1c1010"/>
            <stop offset="100%" stopColor="#0e0808"/>
          </linearGradient>
          <linearGradient id="hw-sw-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#070809"/>
            <stop offset="100%" stopColor="#030404"/>
          </linearGradient>
          <filter id="hw-sw-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hw-sw-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.6"/>
          </filter>
          <pattern id="hw-sw-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0"   y="4" width="9" height="64" rx="2" fill="#374151"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#374151"/>
        <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#1f2937"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#1f2937"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#hw-sw-chassis)" filter="url(#hw-sw-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#hw-sw-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" stroke="#cf0a2c" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="3" fill="#cf0a2c" fillOpacity="0.9"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Huawei brand panel */}
        <rect x="12" y="8" width="40" height="34" rx="2" fill="#0d0e0f" stroke="#cf0a2c" strokeWidth="0.7"/>
        <rect x="13" y="9" width="38" height="4" rx="2" fill="#cf0a2c" fillOpacity="0.2"/>
        {Array.from({length:8}).map((_,i) => {
          const a = (i*Math.PI)/4; const r=6; const cx2=26+Math.cos(a)*r; const cy2=22+Math.sin(a)*r
          return <ellipse key={i} cx={cx2} cy={cy2} rx="2.8" ry="1.3" transform={`rotate(${i*45} ${cx2} ${cy2})`} fill="#cf0a2c" opacity="0.9"/>
        })}
        <circle cx="26" cy="22" r="2" fill="#cf0a2c"/><circle cx="26" cy="22" r="0.8" fill="white" fillOpacity="0.3"/>
        <text x="35" y="19" fill="#e5e7eb" fontSize="5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.3">HUAWEI</text>
        <text x="35" y="26" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">S5735-L</text>
        <text x="35" y="34" fill="#4b5563" fontSize="3" fontFamily="monospace">Layer 3</text>
        <line x1="57" y1="4" x2="57" y2="66" stroke="#2d1a1a" strokeWidth="0.8"/>
        {/* GE section header + LED bezel */}
        <rect x="57" y="4"  width="112" height="8" fill="#0e0a0a"/>
        <text x="113" y="10" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">24× GIGABIT ETHERNET</text>
        <rect x="57" y="12" width="112" height="7" rx="1" fill="#080506" stroke="#1e1010" strokeWidth="0.4"/>
        {Array.from({length:8}).map((_,i) => {
          const bx = 59 + i*14
          return (
            <g key={i}>
              <rect x={bx}   y="13.5" width="5" height="4" rx="0.7" fill={i<6?"#4ade80":"#0a1a0a"} opacity={i<6?0.85:0.3} filter={i<6?"url(#hw-sw-glow)":undefined}/>
              <rect x={bx+6} y="13.5" width="5" height="4" rx="0.7" fill={i===0?"#fbbf24":"#1a1000"} opacity={i===0?0.8:0.25} filter={i===0?"url(#hw-sw-glow)":undefined}/>
            </g>
          )
        })}
        {/* 24 RJ45 ports in 2 rows of 12 */}
        {Array.from({length:24}).map((_,i) => {
          const col = i % 12, row = Math.floor(i/12)
          const px = 57 + col*9.3, py = 20 + row*21
          return (
            <g key={i}>
              <rect x={px} y={py} width="8.5" height="18" rx="1" fill="#050304" stroke="#3d2020" strokeWidth="0.6"/>
              <rect x={px+0.8} y={py+0.8} width="6.9" height="14" rx="0.7" fill="url(#hw-sw-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+1+p*0.87} y={py+2} width="0.6" height="7" rx="0.2" fill="#b8860b" opacity="0.55"/>
              ))}
              <rect x={px+1.5} y={py+14} width="5.5" height="2" rx="0.4" fill="#030203"/>
            </g>
          )
        })}
        <line x1="174" y1="4" x2="174" y2="66" stroke="#2d1a1a" strokeWidth="0.8"/>
        {/* SFP+ uplink section */}
        <rect x="174" y="4"  width="26" height="8" fill="#0e0a0a"/>
        <text x="187" y="10" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">SFP+</text>
        {[0,1].map(i => {
          const px = 176 + i*12
          return (
            <g key={i}>
              <rect x={px} y="14" width="10" height="22" rx="1.5" fill="#040203" stroke="#cf0a2c" strokeWidth="0.7"/>
              <rect x={px+1} y="15" width="8" height="20" rx="0.8" fill="#060304"/>
              <rect x={px+2} y="17" width="6" height="10" fill="#ffd700" fillOpacity="0.3"/>
              <circle cx={px+5} cy="40" r="1.5" fill="#3b82f6" opacity={i<1?0.9:0.2} filter={i<1?"url(#hw-sw-glow)":undefined}/>
            </g>
          )
        })}
        <line x1="202" y1="4" x2="202" y2="66" stroke="#2d1a1a" strokeWidth="0.8"/>
        {/* Status LEDs */}
        <rect x="202" y="4" width="24" height="8" fill="#0e0a0a"/>
        <text x="214" y="10" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
        {([
          {cy:18,color:'#4ade80',label:'SYS',on:true},
          {cy:30,color:'#cf0a2c',label:'RUN',on:true},
          {cy:42,color:'#ef4444',label:'ALM',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="210" cy={cy} r="4.5" fill="#060304" stroke="#2d1a1a" strokeWidth="0.5"/>
            <circle cx="210" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#hw-sw-glow)":undefined}/>
            {on && <circle cx="209" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
            <text x="218" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
      </svg>
    )
  }

  // ==========================================
  // JUNIPER SWITCHES
  // ==========================================
  if (normalizedBrand === 'Juniper') {
    if (normalizedModel === 'EX3400-24T') {
      // EX3400-24T: 24-port GE switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ex3400-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#041208"/>
              <stop offset="100%" stopColor="#020a05"/>
            </linearGradient>
            <linearGradient id="ex3400-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="ex3400-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ex3400-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ex3400-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a10" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ex3400-ch)" filter="url(#ex3400-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ex3400-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#84bd00" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="white" fillOpacity="0.04"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="38" height="32" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="9" width="36" height="5" rx="2" fill="#84bd00" fillOpacity="0.12"/>
          <path d="M 16 24 C 16 17 24 15 27 15 C 23 20 22 24 22 24 Z" fill="#84bd00" opacity="0.9"/>
          <path d="M 27 15 C 30 15 33 18 33 24 C 31 22 27 22 22 24 C 22 24 23 20 27 15 Z" fill="#4ade80" opacity="0.7"/>
          <text x="31" y="31" textAnchor="middle" fill="#84bd00" fontSize="5" fontFamily="sans-serif" fontWeight="bold">EX3400</text>
          <text x="31" y="37" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">24T</text>
          {/* GE section header */}
          <rect x="54" y="5" width="114" height="9" fill="#0e0f10"/>
          <text x="111" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GE PORTS (16×)</text>
          {/* LED bezel */}
          <rect x="54" y="14" width="114" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={56+i*7} y="15.5" width="5.5" height="4" rx="0.6" fill="#84bd00" opacity={0.85} filter="url(#ex3400-glow)"/>
          ))}
          {/* 16 RJ45 ports — 2 rows of 8 */}
          {Array.from({length:16}).map((_,i) => {
            const col = i % 8, row = Math.floor(i / 8)
            const x = 54 + col * 9.5, y = 22 + row * 16
            return (
              <g key={i}>
                <rect x={x} y={y} width="8.5" height="11" rx="1" fill="#060708" stroke="#3d4044" strokeWidth="0.6"/>
                <rect x={x+0.8} y={y+0.8} width="6.9" height="9" rx="0.7" fill="url(#ex3400-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={x+1+p*1.3} y={y+2} width="1" height="5" rx="0.2" fill="#b8860b" opacity="0.5"/>
                ))}
                <rect x={x+1.5} y={y+11.5} width="5.5" height="1.5" rx="0.3" fill="#0a0d10"/>
              </g>
            )
          })}
          {/* Uplink section */}
          <line x1="172" y1="3" x2="172" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="172" y="5" width="50" height="9" fill="#0e0f10"/>
          <text x="197" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">SFP+ UPL</text>
          {/* LED bezel uplinks */}
          <rect x="172" y="14" width="50" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {[0,1,2,3].map(i => (
            <rect key={i} x={174+i*12} y="15.5" width="9" height="4" rx="0.6" fill="#84bd00" opacity={0.9} filter="url(#ex3400-glow)"/>
          ))}
          {/* 4 SFP+ uplinks */}
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect x={172+i*12} y="22" width="10" height="15" rx="1.5" fill="#000" stroke="#84bd00" strokeWidth="0.5"/>
              <rect x={173+i*12} y="23" width="8" height="13" fill="#ffd700" fillOpacity="0.3" rx="1"/>
              <text x={177+i*12} y="44" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{i}</text>
            </g>
          ))}
          {/* Status */}
          <line x1="226" y1="3" x2="226" y2="69" stroke="#2d3033" strokeWidth="0.5"/>
          {(['MST','ALM'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="232" cy={20+idx*16} r="4.5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="232" cy={20+idx*16} r="3" fill={idx===1?'#ef4444':'#4ade80'} opacity={idx===1?0.2:0.9} filter={idx===0?"url(#ex3400-glow)":undefined}/>
              <text x="232" y={29+idx*16} textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'EX4300-48T') {
      // EX4300-48T: 48-port GE switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ex4300-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#041208"/>
              <stop offset="100%" stopColor="#020a05"/>
            </linearGradient>
            <filter id="ex4300-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ex4300-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ex4300-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a10" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ex4300-ch)" filter="url(#ex4300-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ex4300-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#84bd00" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="white" fillOpacity="0.04"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="38" height="54" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="9" width="36" height="5" rx="2" fill="#84bd00" fillOpacity="0.12"/>
          <text x="31" y="22" textAnchor="middle" fill="#84bd00" fontSize="6" fontFamily="sans-serif" fontWeight="bold">EX4300</text>
          <text x="31" y="31" textAnchor="middle" fill="#4ade80" fontSize="4" fontFamily="monospace">48T</text>
          {([
            {cy:42,color:'#4ade80',label:'SYS',on:true},
            {cy:55,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="22" cy={cy} r="4" fill="#030c05" stroke="#1e293b" strokeWidth="0.5"/>
              <circle cx="22" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.15} filter={on?"url(#ex4300-glow)":undefined}/>
              {on && <circle cx="21" cy={cy-1} r="1" fill="white" opacity="0.35"/>}
              <text x="32" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header for 32-port grid */}
          <rect x="54" y="5" width="104" height="9" fill="#0e0f10"/>
          <text x="106" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GE PORTS (48×)</text>
          {/* LED bezel */}
          <rect x="54" y="14" width="104" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:32}).map((_,i) => {
            const bx = 55 + i * 3.2
            return (
              <rect key={i} x={bx} y="15.5" width="2.4" height="4" rx="0.4" fill={i<26?"#84bd00":"#0a1a0a"} opacity={i<26?0.85:0.3} filter={i<26?"url(#ex4300-glow)":undefined}/>
            )
          })}
          {/* 32 ports grid — 2 rows */}
          {Array.from({length:32}).map((_,i) => {
            const col = i % 16, row = Math.floor(i / 16)
            const x = 54 + col * 6.5, y = 22 + row * 18
            return (
              <g key={i}>
                <rect x={x} y={y} width="5.8" height="14" rx="0.8" fill="#060708" stroke="#22c55e" strokeWidth="0.4"/>
                <rect x={x+0.5} y={y+0.5} width="4.8" height="13" fill="#ffd700" fillOpacity="0.12" rx="0.4"/>
              </g>
            )
          })}
          {/* LCD Panel */}
          <line x1="162" y1="3" x2="162" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="162" y="5" width="48" height="62" rx="2" fill="#000" stroke="#84bd00" strokeWidth="0.5"/>
          <rect x="164" y="7" width="44" height="58" rx="1" fill="#040810"/>
          <text x="186" y="22" textAnchor="middle" fill="#84bd00" fontSize="5" fontFamily="monospace" fontWeight="bold">EX4300</text>
          <text x="186" y="31" textAnchor="middle" fill="#22c55e" fontSize="3.5" fontFamily="monospace">48T</text>
          <text x="186" y="40" textAnchor="middle" fill="#4ade80" fontSize="3" fontFamily="monospace">Ports: 48</text>
          <path d="M 166 56 L 176 48 L 186 52 L 196 42 L 204 48" stroke="#84bd00" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          {/* Status column */}
          <line x1="214" y1="3" x2="214" y2="69" stroke="#2d3033" strokeWidth="0.5"/>
          {(['SYS','MST','FAN'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="222" cy={16+idx*16} r="4.5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="222" cy={16+idx*16} r="3" fill="#4ade80" opacity={0.9} filter="url(#ex4300-glow)"/>
              <circle cx="221" cy={15+idx*16} r="1.2" fill="white" fillOpacity="0.35"/>
              <text x="222" y={25+idx*16} textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'QFX5100-48S') {
      // QFX5100-48S: Top-of-Rack SFP+ switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="qfx5100-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#051c0d"/>
              <stop offset="100%" stopColor="#020e06"/>
            </linearGradient>
            <filter id="qfx5100-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="qfx5100-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="qfx5100-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Green-coded rack ears (Juniper QFX style) */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#84bd00"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#84bd00"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#4a7a00" stroke="#84bd00" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#84bd00" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#84bd00" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#qfx5100-ch)" filter="url(#qfx5100-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#qfx5100-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#84bd00" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="white" fillOpacity="0.04"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="42" height="54" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="9" width="40" height="5" rx="2" fill="#84bd00" fillOpacity="0.12"/>
          <text x="33" y="21" textAnchor="middle" fill="#84bd00" fontSize="5" fontFamily="sans-serif" fontWeight="bold">QFX5100</text>
          <text x="33" y="30" textAnchor="middle" fill="#4ade80" fontSize="4" fontFamily="monospace">48S</text>
          <text x="33" y="38" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">ToR Switch</text>
          {([
            {cy:48,color:'#4ade80',label:'SYS',on:true},
            {cy:58,color:'#84bd00',label:'MST',on:true},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="22" cy={cy} r="4" fill="#030c05" stroke="#1e293b" strokeWidth="0.5"/>
              <circle cx="22" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.15} filter={on?"url(#qfx5100-glow)":undefined}/>
              {on && <circle cx="21" cy={cy-1} r="1" fill="white" opacity="0.35"/>}
              <text x="32" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header */}
          <rect x="58" y="5" width="120" height="9" fill="#0e0f10"/>
          <text x="118" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">10G SFP+ PORTS (16×)</text>
          {/* LED bezel */}
          <rect x="58" y="14" width="120" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={59+i*7.4} y="15.5" width="5.5" height="4" rx="0.6" fill="#4ade80" opacity={0.9} filter="url(#qfx5100-glow)"/>
          ))}
          {/* 16 SFP+ cages — 2 rows of 8 */}
          {Array.from({length:16}).map((_,i) => {
            const col = i % 8, row = Math.floor(i / 8)
            const x = 58 + col * 7.5, y = 22 + row * 18
            return (
              <g key={i}>
                <rect x={x} y={y} width="6.5" height="14" rx="1" fill="#000" stroke="#ffd700" strokeWidth="0.5"/>
                <rect x={x+0.7} y={y+0.7} width="5.1" height="12.6" fill="#ffd700" fillOpacity="0.25" rx="0.5"/>
                {i<12 && <rect x={x} y={y} width="6.5" height="14" rx="1" fill="#4ade80" fillOpacity="0.04" filter="url(#qfx5100-glow)"/>}
              </g>
            )
          })}
          {/* Status column */}
          <line x1="182" y1="3" x2="182" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="182" y="5" width="48" height="62" rx="2" fill="#040810"/>
          <text x="206" y="14" textAnchor="middle" fill="#84bd00" fontSize="4.5" fontFamily="monospace" fontWeight="bold">QFX5100</text>
          <text x="206" y="22" textAnchor="middle" fill="#22c55e" fontSize="3.5" fontFamily="monospace">ToR 10GbE</text>
          <path d="M 184 56 L 194 48 L 202 52 L 212 40 L 226 48" stroke="#84bd00" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          {(['RUN','PWR','FAN'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="192" cy={28+idx*10} r="3.5" fill="#060708" stroke="#2d3033" strokeWidth="0.4"/>
              <circle cx="192" cy={28+idx*10} r="2.2" fill="#4ade80" opacity={0.9} filter="url(#qfx5100-glow)"/>
              <text x="200" y={29.8+idx*10} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'EX4650-48Y') {
      // EX4650-48Y: 48-port 25G SFP28 switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ex4650-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#041208"/>
              <stop offset="100%" stopColor="#020a05"/>
            </linearGradient>
            <filter id="ex4650-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ex4650-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="ex4650-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a10" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ex4650-ch)" filter="url(#ex4650-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#ex4650-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#84bd00" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="white" fillOpacity="0.04"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="42" height="54" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.6"/>
          <rect x="13" y="9" width="40" height="5" rx="2" fill="#84bd00" fillOpacity="0.12"/>
          <text x="33" y="21" textAnchor="middle" fill="#84bd00" fontSize="6" fontFamily="sans-serif" fontWeight="bold">EX4650</text>
          <text x="33" y="30" textAnchor="middle" fill="#4ade80" fontSize="4" fontFamily="monospace">48Y 25G</text>
          <text x="33" y="38" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SFP28</text>
          {([
            {cy:48,color:'#4ade80',label:'SYS',on:true},
            {cy:58,color:'#84bd00',label:'MST',on:true},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="22" cy={cy} r="4" fill="#030c05" stroke="#1e293b" strokeWidth="0.5"/>
              <circle cx="22" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.15} filter={on?"url(#ex4650-glow)":undefined}/>
              {on && <circle cx="21" cy={cy-1} r="1" fill="white" opacity="0.35"/>}
              <text x="32" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header */}
          <rect x="58" y="5" width="120" height="9" fill="#0e0f10"/>
          <text x="118" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">25G SFP28 PORTS (16×)</text>
          {/* LED bezel */}
          <rect x="58" y="14" width="120" height="7" rx="1" fill="#080809" stroke="#1e2020" strokeWidth="0.4"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={59+i*7.4} y="15.5" width="5.5" height="4" rx="0.6" fill="#4ade80" opacity={0.9} filter="url(#ex4650-glow)"/>
          ))}
          {/* 16 SFP28 golden cages — 2 rows of 8 */}
          {Array.from({length:16}).map((_,i) => {
            const col = i % 8, row = Math.floor(i / 8)
            const x = 58 + col * 7.5, y = 22 + row * 18
            return (
              <g key={i}>
                <rect x={x} y={y} width="6.5" height="14" rx="1" fill="#000" stroke="#ffd700" strokeWidth="0.6"/>
                <rect x={x+0.7} y={y+0.7} width="5.1" height="12.6" fill="#ffd700" fillOpacity="0.35" rx="0.5"/>
                {i<12 && <rect x={x} y={y} width="6.5" height="14" rx="1" fill="#4ade80" fillOpacity="0.04" filter="url(#ex4650-glow)"/>}
              </g>
            )
          })}
          {/* Vertical ventilation slots on right */}
          <line x1="182" y1="3" x2="182" y2="69" stroke="#2d3033" strokeWidth="0.6"/>
          <rect x="182" y="3" width="48" height="66" rx="1" fill="#060809" stroke="#1a1c1e" strokeWidth="0.3"/>
          {Array.from({length:9}).map((_,i) => (
            <rect key={i} x={184+i*4.8} y="5" width="3" height="62" rx="0.5" fill="#050607" stroke="#131415" strokeWidth="0.3"/>
          ))}
          {/* Status LEDs overlaid on vent area */}
          {([
            {cx:188,color:'#4ade80'},
            {cx:196,color:'#4ade80'},
            {cx:204,color:'#84bd00'},
          ] as {cx:number,color:string}[]).map(({cx,color},i) => (
            <circle key={i} cx={cx} cy="58" r="2.5" fill={color} opacity={0.9} filter="url(#ex4650-glow)"/>
          ))}
        </svg>
      )
    }

    // Default Juniper Switch EX2300-24T — ultra-detailed
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="jnpr-sw-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#041208"/>
            <stop offset="100%" stopColor="#020a05"/>
          </linearGradient>
          <linearGradient id="jnpr-sw-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#070809"/>
            <stop offset="100%" stopColor="#030404"/>
          </linearGradient>
          <filter id="jnpr-sw-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="jnpr-sw-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.55"/>
          </filter>
          <pattern id="jnpr-sw-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
        <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a10"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
        <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a10"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a10"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#0f1a10" stroke="#1e293b" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#jnpr-sw-chassis)" filter="url(#jnpr-sw-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#jnpr-sw-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="4" stroke="#16a34a" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="3" fill="white" fillOpacity="0.04"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#020a05" stroke="#1a3020" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a3020" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a3020" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Juniper brand panel */}
        <rect x="12" y="8" width="40" height="34" rx="2" fill="#041208" stroke="#84bd00" strokeWidth="0.7"/>
        <rect x="13" y="9" width="38" height="4" rx="2" fill="#84bd00" fillOpacity="0.12"/>
        <path d="M 16 26 C 16 17 26 14 30 14 C 25 21 24 26 24 26 Z" fill="#84bd00" opacity="0.9"/>
        <path d="M 30 14 C 34 14 38 18 38 26 C 35 22 30 22 24 26 C 24 26 25 21 30 14 Z" fill="#4ade80" opacity="0.7"/>
        <text x="34" y="32" textAnchor="middle" fill="#84bd00" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.3">JUNIPER</text>
        <text x="34" y="39" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">EX2300-24T</text>
        <line x1="57" y1="4" x2="57" y2="66" stroke="#0a1f0d" strokeWidth="0.8"/>
        {/* GE section header + LED bezel */}
        <rect x="57" y="4"  width="112" height="8" fill="#030a05"/>
        <text x="113" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">24× GIGABIT ETHERNET</text>
        <rect x="57" y="12" width="112" height="7" rx="1" fill="#020604" stroke="#0d1a0e" strokeWidth="0.4"/>
        {Array.from({length:8}).map((_,i) => {
          const bx = 59+i*14
          return (
            <g key={i}>
              <rect x={bx}   y="13.5" width="5" height="4" rx="0.7" fill={i<6?"#4ade80":"#0c1a0c"} opacity={i<6?0.85:0.3} filter={i<6?"url(#jnpr-sw-glow)":undefined}/>
              <rect x={bx+6} y="13.5" width="5" height="4" rx="0.7" fill={i===0?"#84bd00":"#0a1200"} opacity={i===0?0.8:0.25} filter={i===0?"url(#jnpr-sw-glow)":undefined}/>
            </g>
          )
        })}
        {/* 24 RJ45 ports in 2 rows of 12 */}
        {Array.from({length:24}).map((_,i) => {
          const col = i%12, row = Math.floor(i/12)
          const px = 57+col*9.3, py = 20+row*21
          return (
            <g key={i}>
              <rect x={px} y={py} width="8.5" height="18" rx="1" fill="#020604" stroke="#1a3a1c" strokeWidth="0.6"/>
              <rect x={px+0.8} y={py+0.8} width="6.9" height="14" rx="0.7" fill="url(#jnpr-sw-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+1+p*0.87} y={py+2} width="0.6" height="7" rx="0.2" fill="#b8860b" opacity="0.55"/>
              ))}
              <rect x={px+1.5} y={py+14} width="5.5" height="2" rx="0.4" fill="#030504"/>
            </g>
          )
        })}
        <line x1="174" y1="4" x2="174" y2="66" stroke="#0a1f0d" strokeWidth="0.8"/>
        {/* SFP+ uplinks */}
        <rect x="174" y="4"  width="24" height="8" fill="#030a05"/>
        <text x="186" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">SFP+</text>
        {[0,1].map(i => {
          const px = 176+i*11
          return (
            <g key={i}>
              <rect x={px} y="14" width="9" height="22" rx="1.5" fill="#020604" stroke="#84bd00" strokeWidth="0.7"/>
              <rect x={px+1} y="15" width="7" height="20" rx="0.8" fill="#030805"/>
              <rect x={px+1.5} y="17" width="6" height="9" fill="#ffd700" fillOpacity="0.3"/>
              <circle cx={px+4.5} cy="40" r="1.5" fill="#4ade80" opacity={0.9} filter="url(#jnpr-sw-glow)"/>
            </g>
          )
        })}
        <line x1="201" y1="4" x2="201" y2="66" stroke="#0a1f0d" strokeWidth="0.8"/>
        {/* Status LEDs */}
        <rect x="201" y="4" width="25" height="8" fill="#030a05"/>
        <text x="213" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">STATUS</text>
        {([
          {cy:18,color:'#4ade80',label:'SYS',on:true},
          {cy:30,color:'#84bd00',label:'MST',on:true},
          {cy:42,color:'#ef4444',label:'ALM',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="209" cy={cy} r="4.5" fill="#030a05" stroke="#0d1a0e" strokeWidth="0.5"/>
            <circle cx="209" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#jnpr-sw-glow)":undefined}/>
            {on && <circle cx="208" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
            <text x="217" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
      </svg>
    )
  }

  // ==========================================
  // MIKROTIK SWITCHES
  // ==========================================
  if (normalizedBrand === 'MikroTik') {
    if (normalizedModel === 'CRS312-4C+8XG') {
      // CRS312-4C+8XG: 12-port 10G switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="crs312-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3f4f6"/>
              <stop offset="100%" stopColor="#c8d2dc"/>
            </linearGradient>
            <linearGradient id="crs312-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="crs312-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="crs312-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.4"/>
            </filter>
            <pattern id="crs312-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.6" strokeOpacity="0.12"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#c8d2dc"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#c8d2dc"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#9aa8b4"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#9aa8b4" stroke="#b0bcc8" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#b0bcc8" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#b0bcc8" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#crs312-ch)" filter="url(#crs312-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#crs312-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#94a3b8" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="8" rx="3" fill="white" fillOpacity="0.3"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.12"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#c8d2dc" stroke="#9aa8b4" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#8090a0" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#8090a0" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="40" height="54" rx="2" fill="#293780"/>
          <rect x="13" y="9" width="38" height="6" rx="2" fill="white" fillOpacity="0.08"/>
          <text x="32" y="22" textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="sans-serif" fontWeight="bold">MikroTik</text>
          <text x="32" y="31" textAnchor="middle" fill="#a0b0ff" fontSize="4.5" fontFamily="monospace">CRS312</text>
          <text x="32" y="39" textAnchor="middle" fill="#6070cc" fontSize="3.5" fontFamily="monospace">10GbE</text>
          <circle cx="32" cy="52" r="5" fill="#1a256e" stroke="#3949ab" strokeWidth="0.6"/>
          <circle cx="32" cy="52" r="3.5" fill="#ea580c" opacity="0.9" filter="url(#crs312-glow)"/>
          <circle cx="31" cy="51" r="1.5" fill="white" fillOpacity="0.35"/>
          {/* Section header */}
          <rect x="56" y="5" width="120" height="9" fill="#b8c4d0"/>
          <text x="116" y="11.5" textAnchor="middle" fill="#5a6880" fontSize="3.5" fontFamily="monospace">10G RJ45 + SFP+ ×12</text>
          {/* LED bezel */}
          <rect x="56" y="14" width="120" height="7" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.4"/>
          {Array.from({length:8}).map((_,i) => {
            const col = i % 4
            const bx = 58 + col * 30 + (i >= 4 ? 0 : 0)
            const by = i < 4 ? 0 : 0
            return (
              <rect key={i} x={58+i*14.8} y={15.2+by} width="11" height="4.5" rx="0.7" fill={i<7?"#22c55e":"#0c1a0c"} opacity={i<7?0.85:0.3} filter={i<7?"url(#crs312-glow)":undefined}/>
            )
          })}
          {/* 8 large 10G RJ45 ports — 2 rows of 4 */}
          {Array.from({length:8}).map((_,i) => {
            const col = i % 4, row = Math.floor(i / 4)
            const px = 56 + col * 30, py = 22 + row * 22
            return (
              <g key={i}>
                <rect x={px} y={py} width="26" height="16" rx="1.5" fill="#0e1216" stroke="#ea580c" strokeWidth="0.7"/>
                <rect x={px+1.5} y={py+1.5} width="23" height="12" rx="1" fill="url(#crs312-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+2.5+p*2.6} y={py+3} width="2" height="7" rx="0.4" fill="#b8860b" opacity="0.6"/>
                ))}
                <rect x={px+5} y={py+14.5} width="16" height="2" rx="0.3" fill="#0a0d10"/>
                <text x={px+13} y={py+22} textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">{i+1}</text>
              </g>
            )
          })}
          {/* SFP+ section */}
          <line x1="180" y1="3" x2="180" y2="69" stroke="#c8d2dc" strokeWidth="0.6"/>
          <rect x="180" y="5" width="50" height="9" fill="#b8c4d0"/>
          <text x="205" y="11.5" textAnchor="middle" fill="#5a6880" fontSize="3.5" fontFamily="monospace">SFP+ 10G</text>
          {[0,1,2,3].map(i => {
            const col = i % 2, row = Math.floor(i / 2)
            const px = 182 + col * 22, py = 14 + row * 24
            return (
              <g key={i}>
                <rect x={px} y={py} width="18" height="18" rx="1.5" fill="#0e1216" stroke="#ffd700" strokeWidth="0.7"/>
                <rect x={px+1.5} y={py+1.5} width="15" height="15" fill="#ffd700" fillOpacity="0.3" rx="1"/>
                <circle cx={px+9} cy={py+21} r="2.5" fill="#22c55e" opacity={0.9} filter="url(#crs312-glow)"/>
              </g>
            )
          })}
        </svg>
      )
    }

    if (normalizedModel === 'CSS326-24G') {
      // CSS326-24G: Flat desktop GE switch — ultra-detailed
      return (
        <svg viewBox="0 0 220 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="css326-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#e8ecf0"/>
            </linearGradient>
            <linearGradient id="css326-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="css326-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Desktop casing */}
          <rect x="6" y="8" width="208" height="56" rx="6" fill="url(#css326-ch)" stroke="#cfd8dc" strokeWidth="0.8"/>
          <rect x="8" y="9" width="204" height="8" rx="5" fill="white" fillOpacity="0.7"/>
          <rect x="8" y="58" width="204" height="4" rx="3" fill="black" fillOpacity="0.08"/>
          {/* Brand panel */}
          <rect x="14" y="16" width="40" height="30" rx="2" fill="#293780"/>
          <rect x="15" y="17" width="38" height="5" rx="2" fill="white" fillOpacity="0.1"/>
          <text x="34" y="28" textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="sans-serif" fontWeight="bold">CSS326</text>
          <text x="34" y="37" textAnchor="middle" fill="#a0b0ff" fontSize="4" fontFamily="monospace">24G</text>
          {/* Power LED */}
          <circle cx="34" cy="52" r="4" fill="#1a256e" stroke="#3949ab" strokeWidth="0.5"/>
          <circle cx="34" cy="52" r="2.8" fill="#4ade80" opacity="0.9" filter="url(#css326-glow)"/>
          <circle cx="33" cy="51" r="1.2" fill="white" fillOpacity="0.4"/>
          {/* Section header */}
          <rect x="58" y="12" width="114" height="6" rx="1" fill="#e0e4e8" stroke="#d0d5dc" strokeWidth="0.3"/>
          <text x="115" y="16.5" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">GE PORTS (16×)</text>
          {/* LED bezel */}
          <rect x="58" y="18" width="114" height="6" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.3"/>
          {Array.from({length:16}).map((_,i) => (
            <rect key={i} x={59+i*7.1} y="19" width="5.5" height="4" rx="0.5" fill="#4ade80" opacity={0.85} filter="url(#css326-glow)"/>
          ))}
          {/* 16 RJ45 ports — 2 rows of 8 */}
          {Array.from({length:16}).map((_,i) => {
            const col = i % 8, row = Math.floor(i / 8)
            const x = 58 + col * 9, y = 25 + row * 14
            return (
              <g key={i}>
                <rect x={x} y={y} width="8" height="11" rx="1" fill="#1e293b" stroke="#9ca3af" strokeWidth="0.5"/>
                <rect x={x+0.8} y={y+0.8} width="6.4" height="9" rx="0.7" fill="url(#css326-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={x+1+p*1.2} y={y+2} width="0.9" height="5" rx="0.2" fill="#b8860b" opacity="0.5"/>
                ))}
                <rect x={x+1.5} y={y+11.5} width="5" height="1.5" rx="0.3" fill="#0a0d10"/>
              </g>
            )
          })}
          {/* Ventilation dots */}
          <rect x="176" y="16" width="36" height="36" rx="2" fill="#e8ecf0" stroke="#d0d5dc" strokeWidth="0.4"/>
          {Array.from({length:5}).map((_,col) => (
            <g key={col}>
              {[0,1,2,3].map(row => (
                <circle key={row} cx={180+col*7} cy={20+row*8} r="1.5" fill="#c0c8d0"/>
              ))}
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'CRS354-48G') {
      // CRS354-48G: 48-port GE switch — ultra-detailed
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="crs354-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b"/>
              <stop offset="100%" stopColor="#0c1220"/>
            </linearGradient>
            <linearGradient id="crs354-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="crs354-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="crs354-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.5"/>
            </filter>
            <pattern id="crs354-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0" y="4" width="9" height="64" rx="2" fill="#4b5563"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#4b5563"/>
          <rect x="1.5" y="9" width="6" height="10" rx="1.5" fill="#374151"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#374151"/>
          <rect x="232.5" y="9" width="6" height="10" rx="1.5" fill="#374151"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#374151"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#374151" stroke="#4b5563" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#4b5563" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#4b5563" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#crs354-ch)" filter="url(#crs354-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#crs354-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="4" stroke="#ea580c" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="5" rx="3" fill="#ea580c" fillOpacity="0.15"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Brand panel */}
          <rect x="12" y="8" width="40" height="54" rx="2" fill="#ea580c"/>
          <rect x="13" y="9" width="38" height="6" rx="2" fill="white" fillOpacity="0.12"/>
          <text x="32" y="22" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="sans-serif" fontWeight="bold">MikroTik</text>
          <text x="32" y="31" textAnchor="middle" fill="white" fontSize="4.5" fontFamily="monospace">CRS354</text>
          <text x="32" y="39" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="3.5" fontFamily="monospace">48G SwOS</text>
          <circle cx="32" cy="52" r="5" fill="#7c2d12" stroke="#c2410c" strokeWidth="0.6"/>
          <circle cx="32" cy="52" r="3.5" fill="#4ade80" opacity="0.9" filter="url(#crs354-glow)"/>
          <circle cx="31" cy="51" r="1.5" fill="white" fillOpacity="0.4"/>
          {/* Section header */}
          <rect x="56" y="5" width="132" height="9" fill="#1a1d24"/>
          <text x="122" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET ×48</text>
          {/* LED bezel */}
          <rect x="56" y="14" width="132" height="7" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.4"/>
          {Array.from({length:32}).map((_,i) => {
            const bx = 57 + i * 4.1
            return (
              <rect key={i} x={bx} y="15.2" width="3" height="4.5" rx="0.5" fill={i<26?"#4ade80":"#0c1a0c"} opacity={i<26?0.8:0.3} filter={i<26?"url(#crs354-glow)":undefined}/>
            )
          })}
          {/* 32 ports — 2 rows of 16 */}
          {Array.from({length:32}).map((_,i) => {
            const col = i % 16, row = Math.floor(i / 16)
            const x = 56 + col * 8.3, y = 22 + row * 18
            return (
              <g key={i}>
                <rect x={x} y={y} width="7.5" height="14" rx="1" fill="#0e1216" stroke="#ea580c" strokeWidth="0.5"/>
                <rect x={x+0.7} y={y+0.7} width="6.1" height="12" rx="0.7" fill="url(#crs354-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={x+1+p*1.1} y={y+2} width="0.8" height="5.5" rx="0.2" fill="#b8860b" opacity="0.5"/>
                ))}
              </g>
            )
          })}
          {/* Status column */}
          <line x1="192" y1="3" x2="192" y2="69" stroke="#374151" strokeWidth="0.6"/>
          <rect x="192" y="5" width="38" height="9" fill="#1a1d24"/>
          <text x="211" y="11.5" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
          {(['SYS','USR','PWR'] as string[]).map((lbl,idx) => (
            <g key={lbl}>
              <circle cx="202" cy={18+idx*14} r="5" fill="#060708" stroke="#2d3033" strokeWidth="0.5"/>
              <circle cx="202" cy={18+idx*14} r="3.5" fill={idx===0?'#ea580c':'#4ade80'} opacity={0.9} filter="url(#crs354-glow)"/>
              <circle cx="201" cy={17+idx*14} r="1.4" fill="white" fillOpacity="0.35"/>
              <text x="212" y={19.8+idx*14} fill="#4b5563" fontSize="4" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'CSS610-8G') {
      // CSS610-8G: Mini desktop switch — ultra-detailed
      return (
        <svg viewBox="0 0 180 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="css610-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eceff1"/>
              <stop offset="100%" stopColor="#b0bec5"/>
            </linearGradient>
            <linearGradient id="css610-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1e26"/>
              <stop offset="100%" stopColor="#0f1218"/>
            </linearGradient>
            <filter id="css610-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Desktop casing */}
          <rect x="6" y="8" width="168" height="56" rx="6" fill="url(#css610-ch)" stroke="#90a4ae" strokeWidth="0.8"/>
          <rect x="8" y="9" width="164" height="8" rx="5" fill="white" fillOpacity="0.5"/>
          <rect x="8" y="58" width="164" height="4" rx="3" fill="black" fillOpacity="0.08"/>
          {/* Brand panel */}
          <rect x="14" y="16" width="40" height="26" rx="2" fill="#293780"/>
          <rect x="15" y="17" width="38" height="5" rx="2" fill="white" fillOpacity="0.1"/>
          <text x="34" y="27" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">CSS610</text>
          <text x="34" y="36" textAnchor="middle" fill="#a0b0ff" fontSize="4" fontFamily="monospace">8G</text>
          {/* Power LED */}
          <circle cx="34" cy="48" r="4" fill="#1a256e" stroke="#3949ab" strokeWidth="0.5"/>
          <circle cx="34" cy="48" r="2.8" fill="#4ade80" opacity="0.9" filter="url(#css610-glow)"/>
          <circle cx="33" cy="47" r="1.1" fill="white" fillOpacity="0.4"/>
          {/* Section divider */}
          <rect x="58" y="14" width="104" height="5" rx="1" fill="#d8dde4" stroke="#c8cdd2" strokeWidth="0.3"/>
          <text x="110" y="17.5" textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="monospace">GE PORTS</text>
          {/* LED bezel */}
          <rect x="58" y="19" width="104" height="6" rx="1" fill="#0c1018" stroke="#485060" strokeWidth="0.3"/>
          {Array.from({length:8}).map((_,i) => (
            <rect key={i} x={59+i*13} y="20" width="10" height="4" rx="0.5" fill="#4ade80" opacity={0.85} filter="url(#css610-glow)"/>
          ))}
          {/* 8 RJ45 ports */}
          {Array.from({length:8}).map((_,i) => {
            const px = 58 + i * 13
            return (
              <g key={i}>
                <rect x={px} y="26" width="11" height="15" rx="1.2" fill="#1e293b" stroke="#9ca3af" strokeWidth="0.6"/>
                <rect x={px+1} y="27" width="9" height="13" rx="0.8" fill="url(#css610-port)"/>
                {[0,1,2,3,4,5,6,7].map(p => (
                  <rect key={p} x={px+1.2+p*1.05} y="28.5" width="0.8" height="6" rx="0.2" fill="#b8860b" opacity="0.55"/>
                ))}
                <rect x={px+2} y="40" width="7" height="1.5" rx="0.3" fill="#0a0d10"/>
                {/* Per-port status LED */}
                <circle cx={px+5.5} cy="46.5" r="2" fill="#060708" stroke="#2d3033" strokeWidth="0.4"/>
                <circle cx={px+5.5} cy="46.5" r="1.4" fill={i<6?"#4ade80":"#ea580c"} opacity={0.9} filter="url(#css610-glow)"/>
                <text x={px+5.5} y="52" textAnchor="middle" fill="#9ca3af" fontSize="3" fontFamily="monospace">{i+1}</text>
              </g>
            )
          })}
          {/* Vent dots on right */}
          <rect x="164" y="16" width="14" height="40" rx="2" fill="#d0d5dc" stroke="#b0bec5" strokeWidth="0.4"/>
          {Array.from({length:3}).map((_,col) => (
            <g key={col}>
              {[0,1,2,3].map(row => (
                <circle key={row} cx={167+col*4} cy={20+row*8} r="1.2" fill="#b0b8c2"/>
              ))}
            </g>
          ))}
        </svg>
      )
    }

    // Default MikroTik Switch CRS328-24P — ultra-detailed
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="mt-sw-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#edf0f4"/>
            <stop offset="100%" stopColor="#c8cdd6"/>
          </linearGradient>
          <linearGradient id="mt-sw-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#141820"/>
            <stop offset="100%" stopColor="#0a0c10"/>
          </linearGradient>
          <filter id="mt-sw-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="mt-sw-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.4"/>
          </filter>
          <pattern id="mt-sw-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.6" strokeOpacity="0.15"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0"   y="4" width="9" height="64" rx="2" fill="#94a3b8"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#94a3b8"/>
        <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#64748b"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#64748b"/>
        <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#64748b"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#64748b"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#64748b" stroke="#94a3b8" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#94a3b8" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#94a3b8" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#mt-sw-chassis)" filter="url(#mt-sw-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="4" fill="url(#mt-sw-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="4" stroke="#94a3b8" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="3" fill="white" fillOpacity="0.5"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.1"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#b0bec5" stroke="#8a9bb0" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#8a9bb0" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#8a9bb0" strokeWidth="0.8"/>
          </g>
        ))}
        {/* MikroTik brand panel */}
        <rect x="12" y="8" width="40" height="34" rx="2" fill="#293780"/>
        <rect x="13" y="9" width="38" height="4" rx="2" fill="white" fillOpacity="0.1"/>
        <text x="32" y="21" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">MikroTik</text>
        <text x="32" y="29" textAnchor="middle" fill="#94a3b8" fontSize="3.5" fontFamily="monospace">CRS328-24P</text>
        <text x="32" y="36" textAnchor="middle" fill="#f97316" fontSize="3.5" fontFamily="monospace">PoE Layer 3</text>
        <line x1="57" y1="4" x2="57" y2="66" stroke="#9ab0c0" strokeWidth="0.8"/>
        {/* GE section header + LED bezel */}
        <rect x="57" y="4"  width="112" height="8" fill="#d8dde8"/>
        <text x="113" y="10" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">24× GE PoE+</text>
        <rect x="57" y="12" width="112" height="7" rx="1" fill="#c0c8d4" stroke="#9ab0c0" strokeWidth="0.4"/>
        {Array.from({length:8}).map((_,i) => {
          const bx = 59+i*14
          return (
            <g key={i}>
              <rect x={bx}   y="13.5" width="5" height="4" rx="0.7" fill={i<6?"#4ade80":"#c8d0dc"} opacity={i<6?0.9:0.6} filter={i<6?"url(#mt-sw-glow)":undefined}/>
              <rect x={bx+6} y="13.5" width="5" height="4" rx="0.7" fill={i===0?"#f97316":"#c0c8d4"} opacity={i===0?0.9:0.5} filter={i===0?"url(#mt-sw-glow)":undefined}/>
            </g>
          )
        })}
        {/* 24 RJ45 ports in 2 rows of 12 */}
        {Array.from({length:24}).map((_,i) => {
          const col = i%12, row = Math.floor(i/12)
          const px = 57+col*9.3, py = 20+row*21
          return (
            <g key={i}>
              <rect x={px} y={py} width="8.5" height="18" rx="1" fill="#1a2030" stroke="#f97316" strokeWidth="0.5"/>
              <rect x={px+0.8} y={py+0.8} width="6.9" height="14" rx="0.7" fill="url(#mt-sw-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+1+p*0.87} y={py+2} width="0.6" height="7" rx="0.2" fill="#b8860b" opacity="0.55"/>
              ))}
              <rect x={px+1.5} y={py+14} width="5.5" height="2" rx="0.4" fill="#0d1018"/>
            </g>
          )
        })}
        <line x1="174" y1="4" x2="174" y2="66" stroke="#9ab0c0" strokeWidth="0.8"/>
        {/* SFP+ uplinks */}
        <rect x="174" y="4"  width="24" height="8" fill="#d8dde8"/>
        <text x="186" y="10" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">SFP+</text>
        {[0,1].map(i => {
          const px = 176+i*11
          return (
            <g key={i}>
              <rect x={px} y="14" width="9" height="22" rx="1.5" fill="#1a2030" stroke="#ffd700" strokeWidth="0.7"/>
              <rect x={px+1} y="15" width="7" height="20" rx="0.8" fill="#0a0c12"/>
              <rect x={px+1.5} y="17" width="6" height="9" fill="#ffd700" fillOpacity="0.3"/>
              <circle cx={px+4.5} cy="40" r="1.5" fill="#4ade80" opacity="0.9" filter="url(#mt-sw-glow)"/>
            </g>
          )
        })}
        <line x1="201" y1="4" x2="201" y2="66" stroke="#9ab0c0" strokeWidth="0.8"/>
        {/* Status LEDs */}
        <rect x="201" y="4" width="25" height="8" fill="#d8dde8"/>
        <text x="213" y="10" textAnchor="middle" fill="#6b7280" fontSize="3.5" fontFamily="monospace">STATUS</text>
        {([
          {cy:18,color:'#4ade80',label:'PWR',on:true},
          {cy:30,color:'#f97316',label:'USR',on:true},
          {cy:42,color:'#3b82f6',label:'ACT',on:true},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="209" cy={cy} r="4.5" fill="#c8d0dc" stroke="#9ab0c0" strokeWidth="0.5"/>
            <circle cx="209" cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#mt-sw-glow)":undefined}/>
            {on && <circle cx="208" cy={cy-1} r="1.2" fill="white" fillOpacity="0.4"/>}
            <text x="217" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
      </svg>
    )
  }

  // ==========================================
  // DATACOM SWITCHES
  // ==========================================
  if (normalizedBrand === 'Datacom') {

    if (normalizedModel === 'DM/4270G-48T') {
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-4270-48-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1828"/>
              <stop offset="100%" stopColor="#060f1a"/>
            </linearGradient>
            <linearGradient id="dtc-4270-48-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="dtc-4270-48-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-4270-48-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="dtc-4270-48-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-4270-48-ch)" filter="url(#dtc-4270-48-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-4270-48-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Datacom brand panel */}
          <rect x="12" y="8" width="40" height="54" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="13" y="9" width="38" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
          {/* Diamond logo */}
          <rect x="15" y="16" width="8" height="8" rx="1" fill="#005FAD" transform="rotate(45 19 20)"/>
          <rect x="17" y="18" width="4" height="4" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 19 20)"/>
          <text x="32" y="26" textAnchor="middle" fill="#e5e7eb" fontSize="5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="32" y="33" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">4270G-48T</text>
          <text x="32" y="40" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">L2/L3 Switch</text>
          {/* Status LEDs */}
          {([
            {cy:49,color:'#4ade80',label:'PWR',on:true},
            {cy:56,color:'#0099FF',label:'ACT',on:true},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="20" cy={cy} r="3.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.5"/>
              <circle cx="20" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-4270-48-glow)":undefined}/>
              {on && <circle cx="19" cy={cy-1} r="1" fill="white" fillOpacity="0.4"/>}
              <text x="27" y={cy+1.6} fill="#374151" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header — 48p */}
          <rect x="56" y="4" width="142" height="8" fill="#060f1a"/>
          <text x="127" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET × 48</text>
          {/* LED bezel */}
          <rect x="56" y="12" width="142" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
          {Array.from({length:24}).map((_,i) => (
            <rect key={i} x={58+i*5.9} y="13.5" width="4.5" height="4.5" rx="0.6" fill={i<20?"#4ade80":"#0a1a0a"} opacity={i<20?0.85:0.3} filter={i<20?"url(#dtc-4270-48-glow)":undefined}/>
          ))}
          {/* 48 ports in 2 rows of 24 */}
          {Array.from({length:48}).map((_,i) => {
            const col = i % 24, row = Math.floor(i / 24)
            const px = 56 + col * 5.9, py = 20 + row * 20
            return (
              <g key={i}>
                <rect x={px} y={py} width="5.5" height="16" rx="0.8" fill="#050c18" stroke="#1a2a40" strokeWidth="0.5"/>
                <rect x={px+0.5} y={py+0.5} width="4.5" height="14" rx="0.5" fill="url(#dtc-4270-48-port)"/>
                {[0,1,2,3].map(p => (
                  <rect key={p} x={px+0.6+p*1.1} y={py+1.5} width="0.8" height="7" rx="0.2" fill="#b8860b" opacity="0.55"/>
                ))}
              </g>
            )
          })}
          {/* SFP+ uplinks */}
          <rect x="202" y="4" width="26" height="8" fill="#060f1a"/>
          <text x="215" y="10" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">SFP+ ×4</text>
          {[0,1,2,3].map(i => {
            const row = Math.floor(i/2), col = i%2
            const px = 202 + col * 12, py = 14 + row * 24
            return (
              <g key={i}>
                <rect x={px} y={py} width="10" height="18" rx="1" fill="#040c1a" stroke="#005FAD" strokeWidth="0.6"/>
                <rect x={px+0.8} y={py+1} width="8.4" height="16" rx="0.5" fill="#060f1a"/>
                <rect x={px+1.2} y={py+2} width="7.6" height="8" fill="#0099FF" fillOpacity="0.18"/>
                <circle cx={px+5} cy={py+26} r="1.2" fill="#0099FF" opacity="0.9" filter="url(#dtc-4270-48-glow)"/>
              </g>
            )
          })}
        </svg>
      )
    }

    if (normalizedModel === 'DM/7540T') {
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-7540-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1828"/>
              <stop offset="100%" stopColor="#060f1a"/>
            </linearGradient>
            <linearGradient id="dtc-7540-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="dtc-7540-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-7540-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="dtc-7540-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-7540-ch)" filter="url(#dtc-7540-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-7540-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Datacom brand panel */}
          <rect x="12" y="8" width="40" height="54" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="13" y="9" width="38" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
          <rect x="15" y="16" width="8" height="8" rx="1" fill="#005FAD" transform="rotate(45 19 20)"/>
          <rect x="17" y="18" width="4" height="4" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 19 20)"/>
          <text x="32" y="26" textAnchor="middle" fill="#e5e7eb" fontSize="5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="32" y="33" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">DM/7540T</text>
          <text x="32" y="40" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">Campus L3</text>
          {([
            {cy:49,color:'#4ade80',label:'PWR',on:true},
            {cy:56,color:'#0099FF',label:'SYS',on:true},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="20" cy={cy} r="3.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.5"/>
              <circle cx="20" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-7540-glow)":undefined}/>
              {on && <circle cx="19" cy={cy-1} r="1" fill="white" fillOpacity="0.4"/>}
              <text x="27" y={cy+1.6} fill="#374151" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header */}
          <rect x="56" y="4" width="142" height="8" fill="#060f1a"/>
          <text x="127" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET × 24</text>
          {/* LED bezel */}
          <rect x="56" y="12" width="142" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
          {Array.from({length:24}).map((_,i) => (
            <rect key={i} x={58+i*5.9} y="13.5" width="4.5" height="4.5" rx="0.6" fill={i<20?"#4ade80":"#0a1a0a"} opacity={i<20?0.85:0.3} filter={i<20?"url(#dtc-7540-glow)":undefined}/>
          ))}
          {/* 24 ports — single row */}
          {Array.from({length:24}).map((_,i) => {
            const px = 56 + i * 5.9
            return (
              <g key={i}>
                <rect x={px} y="20" width="5.5" height="22" rx="0.8" fill="#050c18" stroke="#1a2a40" strokeWidth="0.5"/>
                <rect x={px+0.5} y="20.5" width="4.5" height="20" rx="0.5" fill="url(#dtc-7540-port)"/>
                {[0,1,2,3].map(p => (
                  <rect key={p} x={px+0.6+p*1.1} y="22" width="0.8" height="11" rx="0.2" fill="#b8860b" opacity="0.55"/>
                ))}
                <text x={px+2.75} y="47" textAnchor="middle" fill="#374151" fontSize="2.5" fontFamily="monospace">{i+1}</text>
              </g>
            )
          })}
          {/* SFP+ uplinks */}
          <rect x="202" y="4" width="26" height="8" fill="#060f1a"/>
          <text x="215" y="10" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">SFP+ ×4</text>
          {[0,1,2,3].map(i => {
            const row = Math.floor(i/2), col = i%2
            const px = 202 + col * 12, py = 14 + row * 24
            return (
              <g key={i}>
                <rect x={px} y={py} width="10" height="18" rx="1" fill="#040c1a" stroke="#005FAD" strokeWidth="0.6"/>
                <rect x={px+0.8} y={py+1} width="8.4" height="16" rx="0.5" fill="#060f1a"/>
                <rect x={px+1.2} y={py+2} width="7.6" height="8" fill="#0099FF" fillOpacity="0.18"/>
                <circle cx={px+5} cy={py+26} r="1.2" fill="#0099FF" opacity="0.9" filter="url(#dtc-7540-glow)"/>
              </g>
            )
          })}
          {/* Vent slots */}
          {[0,1,2].map(i => (
            <rect key={i} x="58" y={50+i*5} width="138" height="3.5" rx="0.8" fill="#030a14" stroke="#001a35" strokeWidth="0.3"/>
          ))}
        </svg>
      )
    }

    if (normalizedModel === 'DM/3000-24G') {
      return (
        <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-3000-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1828"/>
              <stop offset="100%" stopColor="#060f1a"/>
            </linearGradient>
            <linearGradient id="dtc-3000-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="dtc-3000-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-3000-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="dtc-3000-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears */}
          <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
          {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-3000-ch)" filter="url(#dtc-3000-sh)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-3000-brush)"/>
          <rect x="9" y="2" width="222" height="68" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
          <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Datacom brand panel */}
          <rect x="12" y="8" width="40" height="54" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="13" y="9" width="38" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
          <rect x="15" y="16" width="8" height="8" rx="1" fill="#005FAD" transform="rotate(45 19 20)"/>
          <rect x="17" y="18" width="4" height="4" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 19 20)"/>
          <text x="32" y="26" textAnchor="middle" fill="#e5e7eb" fontSize="5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="32" y="33" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">3000-24G</text>
          <text x="32" y="40" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">L2 PoE+</text>
          {/* PoE indicator */}
          <rect x="14" y="45" width="36" height="6" rx="1" fill="#001830" stroke="#0066CC" strokeWidth="0.4"/>
          <text x="32" y="49.5" textAnchor="middle" fill="#0099FF" fontSize="3.5" fontFamily="monospace">PoE+</text>
          {([
            {cy:57,color:'#4ade80',label:'PWR',on:true},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="20" cy={cy} r="3.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.5"/>
              <circle cx="20" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-3000-glow)":undefined}/>
              {on && <circle cx="19" cy={cy-1} r="1" fill="white" fillOpacity="0.4"/>}
              <text x="27" y={cy+1.6} fill="#374151" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header */}
          <rect x="56" y="4" width="172" height="8" fill="#060f1a"/>
          <text x="142" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET PoE+ × 24</text>
          {/* LED bezel */}
          <rect x="56" y="12" width="172" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
          {Array.from({length:24}).map((_,i) => (
            <rect key={i} x={58+i*7.1} y="13.5" width="5.5" height="4.5" rx="0.6" fill={i<18?"#4ade80":"#0a1a0a"} opacity={i<18?0.85:0.3} filter={i<18?"url(#dtc-3000-glow)":undefined}/>
          ))}
          {/* 24 PoE+ ports */}
          {Array.from({length:24}).map((_,i) => {
            const px = 56 + i * 7.1
            return (
              <g key={i}>
                <rect x={px} y="20" width="6.7" height="22" rx="0.9" fill="#050c18" stroke="#0066CC" strokeWidth="0.5"/>
                <rect x={px+0.5} y="20.5" width="5.7" height="20" rx="0.5" fill="url(#dtc-3000-port)"/>
                {[0,1,2,3,4].map(p => (
                  <rect key={p} x={px+0.6+p*1.1} y="22" width="0.8" height="11" rx="0.2" fill="#b8860b" opacity="0.55"/>
                ))}
                {/* PoE LED */}
                <rect x={px+1} y="42" width="4.7" height="2" rx="0.4" fill="#0066CC" fillOpacity="0.5"/>
                <text x={px+3.35} y="49" textAnchor="middle" fill="#374151" fontSize="2.2" fontFamily="monospace">{i+1}</text>
              </g>
            )
          })}
        </svg>
      )
    }

    if (normalizedModel === 'DM/7054QX') {
      // Data center 2U — 48x 10GE SFP+ cages in 2 rows of 24
      return (
        <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="dtc-7054-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1828"/>
              <stop offset="100%" stopColor="#060f1a"/>
            </linearGradient>
            <linearGradient id="dtc-7054-port" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#070809"/>
              <stop offset="100%" stopColor="#030404"/>
            </linearGradient>
            <filter id="dtc-7054-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="dtc-7054-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
            </filter>
            <pattern id="dtc-7054-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
            </pattern>
          </defs>
          {/* Rack ears — 2U */}
          <rect x="0"   y="4" width="9" height="80" rx="2" fill="#1e293b"/>
          <rect x="231" y="4" width="9" height="80" rx="2" fill="#1e293b"/>
          <rect x="1.5" y="10"  width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          <rect x="1.5" y="62" width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="10"  width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          <rect x="232.5" y="62" width="6" height="12" rx="1.5" fill="#0f1a2a"/>
          {([[4.5,30],[4.5,58],[235.5,30],[235.5,58]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
              <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
              <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Chassis */}
          <rect x="9" y="2" width="222" height="84" rx="3" fill="url(#dtc-7054-ch)" filter="url(#dtc-7054-sh)"/>
          <rect x="9" y="2" width="222" height="84" rx="3" fill="url(#dtc-7054-brush)"/>
          <rect x="9" y="2" width="222" height="84" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
          <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
          <rect x="10" y="81" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
          {/* Corner screws */}
          {([[14,8],[226,8],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
              <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
              <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Datacom brand panel */}
          <rect x="12" y="10" width="40" height="68" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
          <rect x="13" y="11" width="38" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
          <rect x="15" y="20" width="8" height="8" rx="1" fill="#005FAD" transform="rotate(45 19 24)"/>
          <rect x="17" y="22" width="4" height="4" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 19 24)"/>
          <text x="32" y="32" textAnchor="middle" fill="#e5e7eb" fontSize="5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
          <text x="32" y="40" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">DM/7054QX</text>
          <text x="32" y="47" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">DC 10GE Switch</text>
          {([
            {cy:58,color:'#4ade80',label:'PWR',on:true},
            {cy:66,color:'#0099FF',label:'SYS',on:true},
            {cy:74,color:'#ef4444',label:'ALM',on:false},
          ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
            <g key={label}>
              <circle cx="20" cy={cy} r="3.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.5"/>
              <circle cx="20" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-7054-glow)":undefined}/>
              {on && <circle cx="19" cy={cy-1} r="1" fill="white" fillOpacity="0.4"/>}
              <text x="27" y={cy+1.6} fill="#374151" fontSize="3.5" fontFamily="monospace">{label}</text>
            </g>
          ))}
          {/* Section header */}
          <rect x="56" y="8" width="172" height="8" fill="#060f1a"/>
          <text x="142" y="14" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">10GE SFP+ × 48  (2U DATA CENTER)</text>
          {/* LED bezel */}
          <rect x="56" y="16" width="172" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
          {Array.from({length:24}).map((_,i) => (
            <rect key={i} x={58+i*7.1} y="17.5" width="5.5" height="4.5" rx="0.6" fill={i<20?"#0099FF":"#001020"} opacity={i<20?0.85:0.3} filter={i<20?"url(#dtc-7054-glow)":undefined}/>
          ))}
          {/* 48 SFP+ cages in 2 rows of 24 */}
          {Array.from({length:48}).map((_,i) => {
            const col = i % 24, row = Math.floor(i / 24)
            const px = 56 + col * 7.1, py = 24 + row * 28
            return (
              <g key={i}>
                <rect x={px} y={py} width="6.7" height="22" rx="1" fill="#040c1a" stroke="#005FAD" strokeWidth="0.5"/>
                <rect x={px+0.5} y={py+0.5} width="5.7" height="21" rx="0.6" fill="#060f1a"/>
                <rect x={px+0.8} y={py+1} width="5.1" height="10" fill="#0099FF" fillOpacity="0.15"/>
                <circle cx={px+3.35} cy={py+26} r="1" fill="#0099FF" opacity={i<36?0.9:0.3} filter={i<36?"url(#dtc-7054-glow)":undefined}/>
              </g>
            )
          })}
          {/* Vent slots at bottom */}
          {[0,1].map(i => (
            <rect key={i} x="58" y={80+i*2.5} width="168" height="1.8" rx="0.5" fill="#030a14" stroke="#001a35" strokeWidth="0.2"/>
          ))}
        </svg>
      )
    }

    // Default Datacom switch: DM/4270G-24T — 24p GE L2/L3
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="dtc-4270-24-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1828"/>
            <stop offset="100%" stopColor="#060f1a"/>
          </linearGradient>
          <linearGradient id="dtc-4270-24-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070809"/>
            <stop offset="100%" stopColor="#030404"/>
          </linearGradient>
          <filter id="dtc-4270-24-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dtc-4270-24-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="dtc-4270-24-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0"   y="4" width="9" height="64" rx="2" fill="#1e293b"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#1e293b"/>
        <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0f1a2a"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#0f1a2a" stroke="#1e293b" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#1e293b" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#1e293b" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-4270-24-ch)" filter="url(#dtc-4270-24-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#dtc-4270-24-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" stroke="#005FAD" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="3" fill="#005FAD" fillOpacity="0.9"/>
        <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.4"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#06101e" stroke="#1a2a40" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#1a2a40" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#1a2a40" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Datacom brand panel */}
        <rect x="12" y="8" width="40" height="54" rx="2" fill="#00101f" stroke="#005FAD" strokeWidth="0.7"/>
        <rect x="13" y="9" width="38" height="4" rx="2" fill="#005FAD" fillOpacity="0.25"/>
        <rect x="15" y="16" width="8" height="8" rx="1" fill="#005FAD" transform="rotate(45 19 20)"/>
        <rect x="17" y="18" width="4" height="4" rx="0.5" fill="#0099FF" fillOpacity="0.5" transform="rotate(45 19 20)"/>
        <text x="32" y="26" textAnchor="middle" fill="#e5e7eb" fontSize="5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">DATACOM</text>
        <text x="32" y="33" textAnchor="middle" fill="#9ca3af" fontSize="3.5" fontFamily="monospace">4270G-24T</text>
        <text x="32" y="40" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">L2/L3 Switch</text>
        {([
          {cy:49,color:'#4ade80',label:'PWR',on:true},
          {cy:56,color:'#0099FF',label:'ACT',on:true},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="20" cy={cy} r="3.5" fill="#040c1a" stroke="#0a1828" strokeWidth="0.5"/>
            <circle cx="20" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.12} filter={on?"url(#dtc-4270-24-glow)":undefined}/>
            {on && <circle cx="19" cy={cy-1} r="1" fill="white" fillOpacity="0.4"/>}
            <text x="27" y={cy+1.6} fill="#374151" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
        {/* Section header */}
        <rect x="56" y="4" width="172" height="8" fill="#060f1a"/>
        <text x="142" y="10" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET × 24</text>
        {/* LED bezel */}
        <rect x="56" y="12" width="172" height="7" rx="1" fill="#030810" stroke="#0a1828" strokeWidth="0.4"/>
        {Array.from({length:24}).map((_,i) => (
          <rect key={i} x={58+i*7.1} y="13.5" width="5.5" height="4.5" rx="0.6" fill={i<20?"#4ade80":"#0a1a0a"} opacity={i<20?0.85:0.3} filter={i<20?"url(#dtc-4270-24-glow)":undefined}/>
        ))}
        {/* 24 GE ports */}
        {Array.from({length:24}).map((_,i) => {
          const px = 56 + i * 7.1
          return (
            <g key={i}>
              <rect x={px} y="20" width="6.7" height="22" rx="0.9" fill="#050c18" stroke="#1a2a40" strokeWidth="0.5"/>
              <rect x={px+0.5} y="20.5" width="5.7" height="20" rx="0.5" fill="url(#dtc-4270-24-port)"/>
              {[0,1,2,3,4].map(p => (
                <rect key={p} x={px+0.6+p*1.1} y="22" width="0.8" height="11" rx="0.2" fill="#b8860b" opacity="0.55"/>
              ))}
              <text x={px+3.35} y="47" textAnchor="middle" fill="#374151" fontSize="2.5" fontFamily="monospace">{i+1}</text>
            </g>
          )
        })}
        {/* Vent slots */}
        {[0,1,2].map(i => (
          <rect key={i} x="58" y={46+i*6} width="168" height="4" rx="0.8" fill="#030a14" stroke="#001a35" strokeWidth="0.3"/>
        ))}
      </svg>
    )
  }

  // ==========================================
  // CISCO SWITCHES
  // ==========================================
  if (normalizedModel === 'Catalyst 3750-X') {
    // Catalyst 3750-X: 2U modular switch — ultra-detailed
    return (
      <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="c3750-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1a3d"/>
            <stop offset="100%" stopColor="#070e22"/>
          </linearGradient>
          <linearGradient id="c3750-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080c14"/>
            <stop offset="100%" stopColor="#030508"/>
          </linearGradient>
          <filter id="c3750-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="c3750-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="c3750-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0" y="6" width="9" height="76" rx="2" fill="#475569"/>
        <rect x="231" y="6" width="9" height="76" rx="2" fill="#475569"/>
        <rect x="1.5" y="12" width="6" height="10" rx="1.5" fill="#1e293b"/>
        <rect x="1.5" y="64" width="6" height="10" rx="1.5" fill="#1e293b"/>
        <rect x="232.5" y="12" width="6" height="10" rx="1.5" fill="#1e293b"/>
        <rect x="232.5" y="64" width="6" height="10" rx="1.5" fill="#1e293b"/>
        {([[4.5,30],[4.5,58],[235.5,30],[235.5,58]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#1e293b" stroke="#475569" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#475569" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#475569" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#c3750-ch)" filter="url(#c3750-sh)"/>
        <rect x="9" y="4" width="222" height="80" rx="4" fill="url(#c3750-brush)"/>
        <rect x="9" y="4" width="222" height="80" rx="4" stroke="#2563eb" strokeWidth="0.8"/>
        <rect x="10" y="5" width="220" height="5" rx="3" fill="white" fillOpacity="0.08"/>
        <rect x="10" y="80" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>
        {/* Corner screws */}
        {([[14,10],[226,10],[14,78],[226,78]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#2a3550" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#2a3550" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#2a3550" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Cisco brand panel */}
        <rect x="12" y="12" width="40" height="60" rx="2" fill="#0c1525" stroke="#3b82f6" strokeWidth="0.6"/>
        <rect x="13" y="13" width="38" height="5" rx="2" fill="#3b82f6" fillOpacity="0.1"/>
        {([{x:16,h:7},{x:21,h:11},{x:26,h:14},{x:31,h:14},{x:36,h:11},{x:41,h:7}]).map(({x,h},i) => (
          <rect key={i} x={x} y={29-h} width="3.5" height={h} rx="1.5" fill="#3b82f6"/>
        ))}
        <text x="32" y="36" textAnchor="middle" fill="#3b82f6" fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1">CISCO</text>
        <text x="32" y="43" textAnchor="middle" fill="#475569" fontSize="3.8" fontFamily="monospace">3750-X</text>
        {([
          {cy:56,color:'#4ade80',label:'SYS',on:true},
          {cy:66,color:'#ef4444',label:'ALM',on:false},
        ] as {cy:number,color:string,label:string,on:boolean}[]).map(({cy,color,label,on}) => (
          <g key={label}>
            <circle cx="22" cy={cy} r="4" fill="#060b10" stroke="#1e293b" strokeWidth="0.5"/>
            <circle cx="22" cy={cy} r="2.5" fill={color} opacity={on?0.9:0.12} filter={on?"url(#c3750-glow)":undefined}/>
            {on && <circle cx="21" cy={cy-1} r="1" fill="white" fillOpacity="0.4"/>}
            <text x="30" y={cy+1.8} fill="#4b5563" fontSize="3.5" fontFamily="monospace">{label}</text>
          </g>
        ))}
        <line x1="56" y1="6" x2="56" y2="82" stroke="#1e293b" strokeWidth="0.8"/>
        {/* GE section header */}
        <rect x="56" y="6" width="90" height="9" fill="#0b1020"/>
        <text x="101" y="12.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">GE PORTS (16×)</text>
        {/* LED bezel */}
        <rect x="56" y="15" width="90" height="7" rx="1" fill="#060a10" stroke="#1a2338" strokeWidth="0.4"/>
        {Array.from({length:16}).map((_,i) => (
          <rect key={i} x={57+i*5.6} y="16.2" width="4" height="4.5" rx="0.6" fill={i<12?"#4ade80":"#0f2010"} opacity={i<12?0.85:0.3} filter={i<12?"url(#c3750-glow)":undefined}/>
        ))}
        {/* 16 ports — 2 rows of 8 */}
        {Array.from({length:16}).map((_,i) => {
          const col = i % 8, row = Math.floor(i / 8)
          const px = 56 + col * 11.2, py = 23 + row * 22
          return (
            <g key={i}>
              <rect x={px} y={py} width="10.2" height="14" rx="1.5" fill="#060810" stroke="#2563eb" strokeWidth="0.6"/>
              <rect x={px+1} y={py+1} width="8.2" height="12" rx="1" fill="url(#c3750-port)"/>
              {[0,1,2,3,4].map(p => (
                <rect key={p} x={px+1.5+p*1.4} y={py+2.5} width="1.1" height="6.5" rx="0.3" fill="#b8860b" opacity="0.5"/>
              ))}
              <rect x={px+2.5} y={py+13} width="5.2" height="1.5" rx="0.3" fill="#040608"/>
            </g>
          )
        })}
        {/* Modular uplink card */}
        <line x1="150" y1="6" x2="150" y2="82" stroke="#1e293b" strokeWidth="0.8"/>
        <rect x="150" y="6" width="60" height="9" fill="#0b1020"/>
        <text x="180" y="12.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">UPLINK MODULE</text>
        <rect x="150" y="16" width="60" height="64" rx="2" fill="#0c111a" stroke="#3b82f6" strokeWidth="0.6"/>
        <rect x="152" y="18" width="56" height="6" rx="1" fill="#3b82f6" fillOpacity="0.12"/>
        {/* LED bezel uplinks */}
        <rect x="152" y="25" width="56" height="6" rx="1" fill="#060a10" stroke="#1a2338" strokeWidth="0.3"/>
        {[0,1,2,3].map(i => (
          <rect key={i} x={153+i*14} y="26.2" width="11" height="3.5" rx="0.6" fill={i<2?"#4ade80":"#0f2010"} opacity={i<2?0.85:0.3} filter={i<2?"url(#c3750-glow)":undefined}/>
        ))}
        {/* 4 SFP+ uplinks — 2 rows of 2 */}
        {[0,1,2,3].map(i => {
          const col = i % 2, row = Math.floor(i / 2)
          const px = 152 + col * 26, py = 32 + row * 22
          return (
            <g key={i}>
              <rect x={px} y={py} width="22" height="16" rx="1.5" fill="#000" stroke="#ffd700" strokeWidth="0.6"/>
              <rect x={px+1.5} y={py+1.5} width="19" height="13" fill="#ffd700" fillOpacity="0.3" rx="1"/>
              <text x={px+11} y={py+22} textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SFP{i}</text>
            </g>
          )
        })}
      </svg>
    )
  }

  if (normalizedModel === 'Catalyst 9200') {
    // Cisco Catalyst 9200 (1U 24-port access switch) — ultra-detailed
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="c9200-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12141a"/>
            <stop offset="100%" stopColor="#080a0e"/>
          </linearGradient>
          <linearGradient id="c9200-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070809"/>
            <stop offset="100%" stopColor="#030404"/>
          </linearGradient>
          <filter id="c9200-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="c9200-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="c9200-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0" y="4" width="9" height="64" rx="2" fill="#374151"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#374151"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#c9200-ch)" filter="url(#c9200-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#c9200-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" stroke="#3b82f6" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="2" fill="white" fillOpacity="0.07"/>
        <rect x="10" y="66" width="220" height="2.5" rx="1.5" fill="black" fillOpacity="0.3"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Left brand panel */}
        <rect x="11" y="4" width="32" height="64" rx="2" fill="#0b0d12"/>
        <text x="27" y="28" textAnchor="middle" fill="#3b82f6" fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1">CISCO</text>
        <text x="27" y="36" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">C9200</text>
        {/* Cisco bridge pillars */}
        {([14,18,22,26,30,34] as number[]).map((bx,i) => (
          <rect key={i} x={bx} y={44} width="3" height={i===0||i===5?7:i===1||i===4?10:12} rx="1" fill="#3b82f6" opacity="0.5"/>
        ))}
        {/* GE section header */}
        <rect x="43" y="4" width="138" height="9" fill="#0e0f11"/>
        <text x="112" y="10.5" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET — 24 PORTS</text>
        {/* LED bezel */}
        <rect x="43" y="13" width="138" height="7" rx="1" fill="#06080a" stroke="#1a1f28" strokeWidth="0.4"/>
        {Array.from({length:24}).map((_,i) => {
          const bx = 45 + i * 5.6
          const on = i < 18
          return <rect key={i} x={bx} y="14.2" width="4.2" height="4.5" rx="0.6" fill={on?"#4ade80":"#091209"} opacity={on?0.85:0.4} filter={on?"url(#c9200-glow)":undefined}/>
        })}
        {/* 24 GE RJ45 ports in 2 rows of 12 */}
        {Array.from({length:24}).map((_,i) => {
          const col = i % 12, row = Math.floor(i / 12)
          const px = 43 + col * 11.5
          const py = 21 + row * 17
          return (
            <g key={i}>
              <rect x={px} y={py} width="10" height="14" rx="1.2" fill="#050607" stroke="#2a2f3a" strokeWidth="0.7"/>
              <rect x={px+0.8} y={py+1} width="8.4" height="10.5" rx="0.8" fill="url(#c9200-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+1.2+p*0.9} y={py+2} width="0.65" height="7" rx="0.3" fill="#b8860b" opacity="0.6"/>
              ))}
            </g>
          )
        })}
        {/* Divider */}
        <line x1="182" y1="4" x2="182" y2="68" stroke="#1a1f2a" strokeWidth="0.8"/>
        {/* SFP uplink section */}
        <rect x="182" y="4" width="38" height="9" fill="#0e0f11"/>
        <text x="201" y="10.5" textAnchor="middle" fill="#4b5563" fontSize="3.2" fontFamily="monospace">SFP+ UPLINK</text>
        {/* LED bezel uplink */}
        <rect x="182" y="13" width="38" height="7" rx="1" fill="#06080a" stroke="#1a1f28" strokeWidth="0.4"/>
        {[0,1,2,3].map(i => (
          <rect key={i} x={184+i*9} y="14.2" width="7" height="4.5" rx="0.6" fill="#4ade80" opacity="0.85" filter="url(#c9200-glow)"/>
        ))}
        {/* 4 SFP cages */}
        {[0,1,2,3].map(i => {
          const sx = 183 + i * 9
          return (
            <g key={i}>
              <rect x={sx} y="21" width="8" height="13" rx="1.2" fill="#040506" stroke="#2a3040" strokeWidth="0.8"/>
              <rect x={sx+1} y="22.5" width="6" height="9.5" rx="0.7" fill="#1a2a40" fillOpacity="0.35"/>
              <line x1={sx+1} y1="27" x2={sx+7} y2="27" stroke="#3b82f6" strokeWidth="0.4" strokeOpacity="0.4"/>
            </g>
          )
        })}
        {/* Status LEDs */}
        <rect x="182" y="38" width="38" height="9" fill="#0e0f11"/>
        <text x="201" y="44.5" textAnchor="middle" fill="#4b5563" fontSize="3.2" fontFamily="monospace">STATUS</text>
        {([
          {cx:191,cy:56,color:'#4ade80',label:'SYS',on:true},
          {cx:204,cy:56,color:'#3b82f6',label:'ACT',on:true},
          {cx:217,cy:56,color:'#ef4444',label:'ERR',on:false},
        ] as {cx:number,cy:number,color:string,label:string,on:boolean}[]).map(({cx,cy,color,label,on}) => (
          <g key={label}>
            <circle cx={cx} cy={cy} r="4.5" fill="#060708" stroke="#2a2f3a" strokeWidth="0.5"/>
            <circle cx={cx} cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#c9200-glow)":undefined}/>
            {on && <circle cx={cx-1} cy={cy-1.2} r="1.2" fill="white" fillOpacity="0.35"/>}
            <text x={cx} y={cy+9} textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{label}</text>
          </g>
        ))}
        {/* Ventilation slots */}
        {Array.from({length:5}).map((_,i) => (
          <rect key={i} x={13+i*3.6} y="53" width="2.2" height="12" rx="0.5" fill="#040507" stroke="#111316" strokeWidth="0.3"/>
        ))}
      </svg>
    )
  }

  if (normalizedModel === 'Catalyst 9300') {
    // Cisco Catalyst 9300 (1U 48-port stackable access switch) — ultra-detailed
    return (
      <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="c9300-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12141a"/>
            <stop offset="100%" stopColor="#080a0e"/>
          </linearGradient>
          <linearGradient id="c9300-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070809"/>
            <stop offset="100%" stopColor="#030404"/>
          </linearGradient>
          <filter id="c9300-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="c9300-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="c9300-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>
        {/* Rack ears */}
        <rect x="0" y="4" width="9" height="64" rx="2" fill="#374151"/>
        <rect x="231" y="4" width="9" height="64" rx="2" fill="#374151"/>
        {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#1f2937" stroke="#374151" strokeWidth="0.4"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#374151" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#374151" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#c9300-ch)" filter="url(#c9300-sh)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" fill="url(#c9300-brush)"/>
        <rect x="9" y="2" width="222" height="68" rx="3" stroke="#3b82f6" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="2" fill="white" fillOpacity="0.07"/>
        <rect x="10" y="66" width="220" height="2.5" rx="1.5" fill="black" fillOpacity="0.3"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#3d4044" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#3d4044" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#3d4044" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Left brand + stack display */}
        <rect x="11" y="4" width="30" height="64" rx="2" fill="#0b0d12"/>
        <text x="26" y="18" textAnchor="middle" fill="#3b82f6" fontSize="4.5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="0.8">CISCO</text>
        <text x="26" y="26" textAnchor="middle" fill="#4b5563" fontSize="3.2" fontFamily="monospace">C9300</text>
        {/* Stack number display */}
        <rect x="14" y="30" width="24" height="14" rx="2" fill="#040609" stroke="#3b82f6" strokeWidth="0.7"/>
        <text x="26" y="40" textAnchor="middle" fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="bold" filter="url(#c9300-glow)">1</text>
        {/* STACK label */}
        <text x="26" y="53" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">STACK</text>
        {/* Stacking port circles */}
        {[0,1].map(i => (
          <circle key={i} cx={17+i*18} cy="58" r="4" fill="#050607" stroke="#1e293b" strokeWidth="0.6"/>
        ))}
        {/* 48-port GE section header */}
        <rect x="41" y="4" width="155" height="9" fill="#0e0f11"/>
        <text x="118" y="10.5" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">GIGABIT ETHERNET — 48 PORTS</text>
        {/* LED bezel */}
        <rect x="41" y="13" width="155" height="7" rx="1" fill="#06080a" stroke="#1a1f28" strokeWidth="0.4"/>
        {Array.from({length:48}).map((_,i) => {
          const bx = 42.5 + i * 3.2
          const on = i < 40
          return <rect key={i} x={bx} y="14.2" width="2.4" height="4.5" rx="0.5" fill={on?"#4ade80":"#091209"} opacity={on?0.85:0.4} filter={on?"url(#c9300-glow)":undefined}/>
        })}
        {/* 48 GE RJ45 ports in 2 rows of 24 — compact */}
        {Array.from({length:48}).map((_,i) => {
          const col = i % 24, row = Math.floor(i / 24)
          const px = 41 + col * 6.45
          const py = 21 + row * 17
          return (
            <g key={i}>
              <rect x={px} y={py} width="5.8" height="14" rx="0.9" fill="#050607" stroke="#1e2330" strokeWidth="0.6"/>
              <rect x={px+0.5} y={py+0.8} width="4.8" height="10.5" rx="0.6" fill="url(#c9300-port)"/>
              {[0,1,2,3,4,5,6,7].map(p => (
                <rect key={p} x={px+0.7+p*0.5} y={py+1.5} width="0.38" height="7" rx="0.2" fill="#b8860b" opacity="0.55"/>
              ))}
            </g>
          )
        })}
        {/* Divider */}
        <line x1="197" y1="4" x2="197" y2="68" stroke="#1a1f2a" strokeWidth="0.8"/>
        {/* SFP+ uplink section */}
        <rect x="197" y="4" width="32" height="9" fill="#0e0f11"/>
        <text x="213" y="10.5" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">UPLINK</text>
        {/* LED uplink */}
        <rect x="197" y="13" width="32" height="7" rx="1" fill="#06080a" stroke="#1a1f28" strokeWidth="0.4"/>
        {[0,1,2,3].map(i => (
          <rect key={i} x={199+i*7.6} y="14.2" width="6" height="4.5" rx="0.6" fill="#4ade80" opacity="0.85" filter="url(#c9300-glow)"/>
        ))}
        {/* 4 SFP+ cages */}
        {[0,1,2,3].map(i => {
          const sx = 197.5 + i * 7.6
          return (
            <g key={i}>
              <rect x={sx} y="21" width="7" height="13" rx="1" fill="#040506" stroke="#2a3040" strokeWidth="0.7"/>
              <rect x={sx+0.8} y="22.5" width="5.4" height="9.5" rx="0.6" fill="#1a2a40" fillOpacity="0.35"/>
              <line x1={sx+0.8} y1="27" x2={sx+6.2} y2="27" stroke="#3b82f6" strokeWidth="0.4" strokeOpacity="0.4"/>
            </g>
          )
        })}
        {/* Status LEDs */}
        {([
          {cx:203,cy:46,color:'#4ade80',label:'SYS',on:true},
          {cx:213,cy:46,color:'#3b82f6',label:'ACT',on:true},
          {cx:223,cy:46,color:'#ef4444',label:'ERR',on:false},
        ] as {cx:number,cy:number,color:string,label:string,on:boolean}[]).map(({cx,cy,color,label,on}) => (
          <g key={label}>
            <circle cx={cx} cy={cy} r="4.5" fill="#060708" stroke="#2a2f3a" strokeWidth="0.5"/>
            <circle cx={cx} cy={cy} r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#c9300-glow)":undefined}/>
            {on && <circle cx={cx-1} cy={cy-1.2} r="1.2" fill="white" fillOpacity="0.35"/>}
            <text x={cx} y={cy+9} textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{label}</text>
          </g>
        ))}
        {/* Ventilation */}
        {Array.from({length:4}).map((_,i) => (
          <rect key={i} x={13+i*3.6} y="55" width="2.2" height="9" rx="0.5" fill="#040507" stroke="#111316" strokeWidth="0.3"/>
        ))}
      </svg>
    )
  }

  if (normalizedModel === 'Nexus 5596') {
    // Cisco Nexus 5596 (2U 48-port SFP+ DC switch) — ultra-detailed
    return (
      <svg viewBox="0 0 240 88" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="nx5596-ch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1117"/>
            <stop offset="100%" stopColor="#070a0f"/>
          </linearGradient>
          <linearGradient id="nx5596-port" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080c12"/>
            <stop offset="100%" stopColor="#040608"/>
          </linearGradient>
          <filter id="nx5596-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="nx5596-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
          </filter>
          <pattern id="nx5596-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.03"/>
          </pattern>
        </defs>
        {/* Rack ears — Cisco Nexus blue-accent */}
        <rect x="0" y="4" width="9" height="80" rx="2" fill="#1e3a5f"/>
        <rect x="231" y="4" width="9" height="80" rx="2" fill="#1e3a5f"/>
        {([[4.5,30],[4.5,58],[235.5,30],[235.5,58]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="1.8" fill="#0f1e30" stroke="#2563eb" strokeWidth="0.5"/>
            <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#2563eb" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#2563eb" strokeWidth="0.5"/>
          </g>
        ))}
        {/* Chassis */}
        <rect x="9" y="2" width="222" height="84" rx="3" fill="url(#nx5596-ch)" filter="url(#nx5596-sh)"/>
        <rect x="9" y="2" width="222" height="84" rx="3" fill="url(#nx5596-brush)"/>
        <rect x="9" y="2" width="222" height="84" rx="3" stroke="#2563eb" strokeWidth="0.8"/>
        <rect x="10" y="3" width="220" height="4" rx="2" fill="white" fillOpacity="0.06"/>
        <rect x="10" y="82" width="220" height="2.5" rx="1.5" fill="black" fillOpacity="0.3"/>
        {/* Corner screws */}
        {([[14,6],[226,6],[14,80],[226,80]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.2" fill="#141516" stroke="#2a3a50" strokeWidth="0.6"/>
            <line x1={cx-2} y1={cy} x2={cx+2} y2={cy} stroke="#2a3a50" strokeWidth="0.8"/>
            <line x1={cx} y1={cy-2} x2={cx} y2={cy+2} stroke="#2a3a50" strokeWidth="0.8"/>
          </g>
        ))}
        {/* Left brand panel */}
        <rect x="11" y="4" width="32" height="80" rx="2" fill="#0b0e14"/>
        <text x="27" y="26" textAnchor="middle" fill="#2563eb" fontSize="5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="1">CISCO</text>
        <text x="27" y="34" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">NEXUS</text>
        <text x="27" y="41" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">5596</text>
        {/* FCoE label */}
        <rect x="14" y="46" width="26" height="8" rx="1" fill="#0a1428" stroke="#2563eb" strokeWidth="0.5"/>
        <text x="27" y="51.5" textAnchor="middle" fill="#2563eb" fontSize="3" fontFamily="monospace">FCoE</text>
        {/* SFP+ section header — row 1 */}
        <rect x="43" y="4" width="177" height="9" fill="#0b0d12"/>
        <text x="131" y="10.5" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SFP+ 10GE — 48 PORTS</text>
        {/* LED bezel row 1 */}
        <rect x="43" y="13" width="177" height="7" rx="1" fill="#060810" stroke="#151c28" strokeWidth="0.4"/>
        {Array.from({length:24}).map((_,i) => {
          const bx = 45 + i * 7.3
          const on = i < 20
          return <rect key={i} x={bx} y="14.2" width="5.8" height="4.5" rx="0.6" fill={on?"#4ade80":"#091209"} opacity={on?0.85:0.4} filter={on?"url(#nx5596-glow)":undefined}/>
        })}
        {/* Row 1: 24 SFP+ cages */}
        {Array.from({length:24}).map((_,i) => {
          const sx = 43.5 + i * 7.4
          return (
            <g key={i}>
              <rect x={sx} y="21" width="6.8" height="16" rx="1" fill="#050709" stroke="#1e2a3c" strokeWidth="0.7"/>
              <rect x={sx+0.8} y="22.5" width="5.2" height="12" rx="0.7" fill="#0d1828" fillOpacity="0.45"/>
              <line x1={sx+0.8} y1="28.5" x2={sx+6} y2="28.5" stroke="#2563eb" strokeWidth="0.4" strokeOpacity="0.5"/>
              <rect x={sx+1.5} y="22.8" width="3.8" height="3" rx="0.4" fill="#b8860b" fillOpacity="0.25"/>
            </g>
          )
        })}
        {/* SFP+ section header — row 2 */}
        <rect x="43" y="38" width="177" height="9" fill="#0b0d12"/>
        <text x="131" y="44.5" textAnchor="middle" fill="#4b5563" fontSize="3.5" fontFamily="monospace">SFP+ 10GE — PORTS 25–48</text>
        {/* LED bezel row 2 */}
        <rect x="43" y="47" width="177" height="7" rx="1" fill="#060810" stroke="#151c28" strokeWidth="0.4"/>
        {Array.from({length:24}).map((_,i) => {
          const bx = 45 + i * 7.3
          const on = i < 16
          return <rect key={i} x={bx} y="48.2" width="5.8" height="4.5" rx="0.6" fill={on?"#4ade80":"#091209"} opacity={on?0.85:0.4} filter={on?"url(#nx5596-glow)":undefined}/>
        })}
        {/* Row 2: 24 SFP+ cages */}
        {Array.from({length:24}).map((_,i) => {
          const sx = 43.5 + i * 7.4
          return (
            <g key={i}>
              <rect x={sx} y="55" width="6.8" height="16" rx="1" fill="#050709" stroke="#1e2a3c" strokeWidth="0.7"/>
              <rect x={sx+0.8} y="56.5" width="5.2" height="12" rx="0.7" fill="#0d1828" fillOpacity="0.45"/>
              <line x1={sx+0.8} y1="62.5" x2={sx+6} y2="62.5" stroke="#2563eb" strokeWidth="0.4" strokeOpacity="0.5"/>
              <rect x={sx+1.5} y="56.8" width="3.8" height="3" rx="0.4" fill="#b8860b" fillOpacity="0.25"/>
            </g>
          )
        })}
        {/* Status LEDs + PSU bottom */}
        <rect x="43" y="72" width="88" height="12" rx="1" fill="#080b10" stroke="#151c28" strokeWidth="0.4"/>
        {([
          {cx:55,color:'#4ade80',label:'SYS',on:true},
          {cx:71,color:'#3b82f6',label:'ACT',on:true},
          {cx:87,color:'#f59e0b',label:'PSU',on:true},
          {cx:103,color:'#ef4444',label:'FAN',on:false},
          {cx:119,color:'#ef4444',label:'ERR',on:false},
        ] as {cx:number,color:string,label:string,on:boolean}[]).map(({cx,color,label,on}) => (
          <g key={label}>
            <circle cx={cx} cy="78" r="4.5" fill="#060810" stroke="#1e2a3c" strokeWidth="0.5"/>
            <circle cx={cx} cy="78" r="3" fill={color} opacity={on?0.9:0.12} filter={on?"url(#nx5596-glow)":undefined}/>
            {on && <circle cx={cx-1} cy="76.8" r="1.2" fill="white" fillOpacity="0.35"/>}
            <text x={cx} y="87" textAnchor="middle" fill="#4b5563" fontSize="3" fontFamily="monospace">{label}</text>
          </g>
        ))}
        {/* PSU bays */}
        <rect x="133" y="72" width="42" height="12" rx="1" fill="#06080c" stroke="#151c28" strokeWidth="0.5"/>
        <rect x="135" y="74" width="18" height="8" rx="1" fill="#040609" stroke="#1e2a3c" strokeWidth="0.5"/>
        <text x="144" y="79.5" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">PSU0</text>
        <rect x="155" y="74" width="18" height="8" rx="1" fill="#040609" stroke="#1e2a3c" strokeWidth="0.5"/>
        <text x="164" y="79.5" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">PSU1</text>
        {/* Ventilation */}
        <rect x="177" y="72" width="53" height="12" rx="1" fill="#050709" stroke="#111418" strokeWidth="0.4"/>
        {Array.from({length:9}).map((_,i) => (
          <rect key={i} x={179+i*5.5} y="74" width="3.5" height="8" rx="0.5" fill="#030508" stroke="#0e1118" strokeWidth="0.3"/>
        ))}
      </svg>
    )
  }

  // Cisco Switch (Default Catalyst 2960-X) — Redesigned for realism
  const t = switchTheme(normalizedBrand)
  return (
    <svg viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="sw-ch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={t.bg1}/>
          <stop offset="100%" stopColor={t.bg2}/>
        </linearGradient>
        <linearGradient id="sw-port-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#060810"/>
          <stop offset="100%" stopColor="#030508"/>
        </linearGradient>
        <filter id="sw-led-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sw-sh" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.65"/>
        </filter>
        <pattern id="sw-brush" x="0" y="0" width="240" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="240" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.04"/>
        </pattern>
      </defs>

      {/* Rack ears */}
      <rect x="0"   y="4"  width="9" height="64" rx="2" fill="#1e2530"/>
      <rect x="231" y="4"  width="9" height="64" rx="2" fill="#1e2530"/>
      <rect x="1.5" y="9"  width="6" height="10" rx="1.5" fill="#0a0d12"/>
      <rect x="1.5" y="51" width="6" height="10" rx="1.5" fill="#0a0d12"/>
      <rect x="232.5" y="9"  width="6" height="10" rx="1.5" fill="#0a0d12"/>
      <rect x="232.5" y="51" width="6" height="10" rx="1.5" fill="#0a0d12"/>
      {([[4.5,26],[4.5,46],[235.5,26],[235.5,46]] as [number,number][]).map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="1.8" fill="#0a0d12" stroke="#2a3040" strokeWidth="0.4"/>
          <line x1={cx-1.2} y1={cy} x2={cx+1.2} y2={cy} stroke="#2a3040" strokeWidth="0.5"/>
          <line x1={cx} y1={cy-1.2} x2={cx} y2={cy+1.2} stroke="#2a3040" strokeWidth="0.5"/>
        </g>
      ))}

      {/* Main chassis */}
      <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#sw-ch)"    filter="url(#sw-sh)"/>
      <rect x="9" y="2"  width="222" height="68" rx="3" fill="url(#sw-brush)"/>
      <rect x="9" y="2"  width="222" height="68" rx="3" stroke={t.border} strokeWidth="0.8"/>
      <rect x="10" y="3" width="220" height="5"  rx="3" fill="white" fillOpacity="0.1"/>
      <rect x="10" y="65" width="220" height="3" rx="2" fill="black" fillOpacity="0.35"/>

      {/* Corner screws */}
      {([[14,6],[226,6],[14,62],[226,62]] as [number,number][]).map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="3.2" fill={t.bg1} stroke="#2a3550" strokeWidth="0.6"/>
          <line x1={cx-2} y1={cy}   x2={cx+2} y2={cy}   stroke="#2a3550" strokeWidth="0.8"/>
          <line x1={cx}   y1={cy-2} x2={cx}   y2={cy+2} stroke="#2a3550" strokeWidth="0.8"/>
        </g>
      ))}

      {/* Brand + mode panel */}
      <rect x="12" y="6"  width="36" height="58" rx="2" fill="#0a0e14" stroke={t.accent} strokeWidth="0.6"/>
      <rect x="13" y="7"  width="34" height="5"  rx="2" fill={t.accent} fillOpacity="0.15"/>
      {([{x:15,h:9},{x:19,h:14},{x:23,h:18},{x:27,h:18},{x:31,h:14},{x:35,h:9}]).map(({x,h},i) => (
        <rect key={i} x={x} y={36-h} width="3" height={h} rx="1.5" fill={t.accent}/>
      ))}
      <text x="28" y="44" textAnchor="middle" fill={t.accent} fontSize="4.5" fontFamily="Arial,sans-serif" fontWeight="bold" letterSpacing="0.5">CISCO</text>
      <text x="28" y="51" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">{t.sub}</text>

      {/* Mode indicator LEDs */}
      {(['SYS','RPS','STAT','DPLX','SPD'] as string[]).map((lbl,i) => (
        <g key={lbl}>
          <rect x="14" y={56+i*0} width="0" height="0"/> {/* zero-size placeholder */}
        </g>
      ))}
      {/* Real mode LEDs */}
      <rect x="14" y="56" width="6" height="4" rx="0.8" fill={t.accent}      opacity="0.9" filter="url(#sw-led-glow)"/>
      <rect x="22" y="56" width="6" height="4" rx="0.8" fill="#ef4444"       opacity="0.12"/>
      <rect x="30" y="56" width="6" height="4" rx="0.8" fill="#fbbf24"       opacity="0.9" filter="url(#sw-led-glow)"/>
      <text x="14" y="64" fill="#2a3550" fontSize="2.8" fontFamily="monospace">SYS RPS STA</text>

      <line x1="52" y1="5" x2="52" y2="67" stroke="#1e293b" strokeWidth="0.8"/>

      {/* Port area header */}
      <rect x="52" y="5" width="148" height="9" fill="#0b1020"/>
      <text x="126" y="11.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">FAST/GIGABIT ETHERNET  24×</text>

      {/* LED bezel panel */}
      <rect x="52" y="14" width="148" height="8" rx="1" fill="#060a10" stroke="#1a2338" strokeWidth="0.4"/>
      {Array.from({length:12}).map((_,i) => {
        const bx = 54 + i * 12.2
        return (
          <g key={i}>
            <rect x={bx}     y="15.2" width="4.5" height="4.5" rx="0.7" fill={i<10 ? "#4ade80" : "#0a1a0a"} opacity={i<10 ? 0.85 : 0.3} filter={i<10 ? "url(#sw-led-glow)" : undefined}/>
            <rect x={bx+5.2} y="15.2" width="4.5" height="4.5" rx="0.7" fill={i<10 ? "#4ade80" : "#0a1a0a"} opacity={i<10 ? 0.75 : 0.2} filter={i<10 ? "url(#sw-led-glow)" : undefined}/>
          </g>
        )
      })}

      {/* 24 ports — 2 rows of 12 */}
      {Array.from({length:24}).map((_,i) => {
        const col = i % 12
        const row = Math.floor(i / 12)
        const px = 52 + col * 12.2
        const py = row === 0 ? 23 : 37
        return (
          <g key={i}>
            <rect x={px}     y={py}   width="11" height="10" rx="1.5" fill="#060810" stroke={t.border} strokeWidth="0.7"/>
            <rect x={px+1}   y={py+1} width="9"  height="8"  rx="1"   fill="url(#sw-port-inner)"/>
            {[0,1,2,3,4].map(p => (
              <rect key={p} x={px+2+p*1.5} y={py+2} width="1.1" height="5" rx="0.3" fill="#b8860b" opacity="0.5"/>
            ))}
            <rect x={px+2.5} y={py+8.5} width="6" height="1.5" rx="0.3" fill="#04060a"/>
          </g>
        )
      })}

      <line x1="200" y1="5" x2="200" y2="67" stroke="#1e293b" strokeWidth="0.8"/>

      {/* SFP+ uplinks */}
      <rect x="200" y="5" width="22" height="9" fill="#0b1020"/>
      <text x="211" y="11.5" textAnchor="middle" fill="#374151" fontSize="3.5" fontFamily="monospace">SFP+</text>
      {[0,1,2,3].map(i => {
        const col = i % 2, row = Math.floor(i / 2)
        const px = 201 + col * 10, py = 14 + row * 14
        return (
          <g key={i}>
            <rect x={px}   y={py}   width="9"  height="12" rx="1.2" fill="#020617" stroke={t.border} strokeWidth="0.6"/>
            <rect x={px+1} y={py+1} width="7"  height="10" fill="#b8860b" fillOpacity="0.22" rx="0.5"/>
            <circle cx={px+4.5} cy={py+14.5} r="1.8" fill={i<2?"#4ade80":"#0a180a"} opacity={i<2?0.9:0.3} filter={i<2?"url(#sw-led-glow)":undefined}/>
          </g>
        )
      })}

      <line x1="222" y1="5" x2="222" y2="67" stroke="#1e293b" strokeWidth="0.8"/>

      {/* Console + SYS/ACT LEDs */}
      <rect x="222" y="5" width="18" height="9" fill="#0b1020"/>
      <text x="231" y="11.5" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">MGMT</text>
      <rect x="223" y="14" width="14" height="12" rx="1.8" fill="#020810" stroke="#1e3a6b" strokeWidth="0.8"/>
      <rect x="224.5" y="15.5" width="11" height="9" rx="1" fill="#010306"/>
      {[0,1,2,3,4,5,6,7].map(p => (
        <rect key={p} x={225.5+p*1.1} y="17" width="0.8" height="6" rx="0.2" fill="#b8860b" opacity="0.45"/>
      ))}
      <text x="230" y="30" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">CON</text>
      <circle cx="230" cy="41" r="5" fill="#060b10" stroke="#1e293b" strokeWidth="0.6"/>
      <circle cx="230" cy="41" r="3.5" fill={t.accent} opacity="0.9" filter="url(#sw-led-glow)"/>
      <circle cx="229" cy="40" r="1.4" fill="white" fillOpacity="0.45"/>
      <text x="230" y="51" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">SYS</text>
      <circle cx="230" cy="60" r="5" fill="#060b10" stroke="#1e293b" strokeWidth="0.6"/>
      <circle cx="230" cy="60" r="3.5" fill={t.accent} opacity="0.75"/>
      <text x="230" y="70" textAnchor="middle" fill="#374151" fontSize="3" fontFamily="monospace">ACT</text>
    </svg>
  )
}

export function PCPreview({ brand, model, ...props }: PreviewP) {
  const normalizedBrand = brand?.trim() || 'Apple'
  const normalizedModel = model?.trim() || 'MacBook Air M3'

  if (normalizedBrand === 'Lenovo') {
    // Lenovo models: ThinkPad X1 Carbon / E15 Gen 4 / ThinkCentre M70q / IdeaCentre 5 / Legion 5 Pro
    const isMini = normalizedModel === 'ThinkCentre M70q'
    const isDesktop = normalizedModel === 'IdeaCentre 5'
    const isGaming = normalizedModel === 'Legion 5 Pro'
    const screenLabel = normalizedModel
    const accentColor = isGaming ? '#ef4444' : '#dc2626'

    if (isMini) {
      // ThinkCentre M70q — Ultra-compact mini PC
      return (
        <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="tc-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1e1e" />
              <stop offset="100%" stopColor="#111" />
            </linearGradient>
            <filter id="tc-sh" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.6" />
            </filter>
          </defs>
          <ellipse cx="100" cy="123" rx="66" ry="6" fill="black" fillOpacity="0.4" />
          <path d="M 158 12 L 172 4 L 172 88 L 158 96 Z" fill="#2a2a2a" />
          <path d="M 28 96 L 42 88 L 172 88 L 158 96 Z" fill="#161616" />
          <rect x="28" y="12" width="130" height="84" rx="5" fill="url(#tc-body)" filter="url(#tc-sh)" />
          <rect x="28" y="12" width="130" height="84" rx="5" stroke="#2d2d2d" strokeWidth="0.8" />
          <rect x="30" y="14" width="126" height="10" rx="4" fill="white" fillOpacity="0.06" />
          <rect x="36" y="22" width="68" height="24" rx="2" fill="#151515" stroke="#2a2a2a" strokeWidth="0.5" />
          <text x="70" y="32" textAnchor="middle" fill="#dc2626" fontSize="7" fontFamily="sans-serif" fontWeight="bold">ThinkCentre</text>
          <text x="70" y="41" textAnchor="middle" fill="#666" fontSize="5" fontFamily="monospace">M70q · Intel Core i5</text>
          <circle cx="130" cy="34" r="9" fill="#181818" stroke="#333" strokeWidth="0.8" />
          <circle cx="130" cy="34" r="6" fill="#dc2626" opacity="0.85" />
          <circle cx="129" cy="33" r="2.5" fill="white" fillOpacity="0.25" />
          <circle cx="145" cy="34" r="2.5" fill="#4ade80" />
          <rect x="36" y="58" width="118" height="26" rx="2" fill="#161616" stroke="#252525" strokeWidth="0.5" />
          {[0, 1].map(i => (
            <g key={i}>
              <rect x={42 + i * 20} y="63" width="14" height="9" rx="1.5" fill="#111" stroke="#2563eb" strokeWidth="0.6" />
              <rect x={43.5 + i * 20} y="64.5" width="11" height="6" rx="0.8" fill="#1e3a5f" />
            </g>
          ))}
          <rect x="84" y="63" width="12" height="9" rx="3.5" fill="#111" stroke="#555" strokeWidth="0.5" />
          <rect x="102" y="63" width="14" height="9" rx="1.5" fill="#111" stroke="#444" strokeWidth="0.5" />
          <circle cx="126" cy="67.5" r="5" fill="#111" stroke="#444" strokeWidth="0.5" />
          <circle cx="126" cy="67.5" r="2.5" fill="#0a0a0a" />
          <rect x="138" y="63" width="12" height="9" rx="1" fill="#151515" stroke="#333" strokeWidth="0.4" />
          <text x="144" y="69.5" textAnchor="middle" fill="#444" fontSize="4" fontFamily="monospace">SD</text>
          <text x="100" y="86" textAnchor="middle" fill="#3d3d3d" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">Lenovo</text>
        </svg>
      )
    }

    if (isDesktop) {
      // IdeaCentre 5 — Tower Desktop
      return (
        <svg viewBox="0 0 140 210" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="ic-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e1e1e" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>
            <filter id="ic-sh" x="-20%" y="-5%" width="140%" height="115%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.5" />
            </filter>
          </defs>
          <ellipse cx="66" cy="204" rx="40" ry="5" fill="black" fillOpacity="0.4" />
          <path d="M 30 16 L 44 6 L 108 6 L 94 16 Z" fill="#2a2a2a" />
          <path d="M 94 16 L 108 6 L 108 194 L 94 196 Z" fill="#222" />
          <rect x="30" y="16" width="64" height="180" rx="5" fill="url(#ic-body)" filter="url(#ic-sh)" />
          <rect x="30" y="16" width="64" height="180" rx="5" stroke="#333" strokeWidth="0.8" />
          <rect x="30" y="18" width="6" height="176" rx="3" fill="white" fillOpacity="0.06" />
          <circle cx="62" cy="34" r="9" fill="#181818" stroke="#333" strokeWidth="0.8" />
          <circle cx="62" cy="34" r="6" fill="#dc2626" opacity="0.8" />
          <circle cx="61" cy="33" r="2" fill="white" fillOpacity="0.2" />
          <circle cx="76" cy="34" r="2" fill="#4ade80" />
          <rect x="38" y="54" width="48" height="38" rx="2" fill="#151515" stroke="#252525" strokeWidth="0.5" />
          <rect x="44" y="60" width="16" height="10" rx="1.5" fill="#111" stroke="#2563eb" strokeWidth="0.6" />
          <rect x="45.5" y="61.5" width="13" height="7" rx="0.8" fill="#1e3a5f" />
          <rect x="44" y="74" width="14" height="10" rx="3.5" fill="#111" stroke="#555" strokeWidth="0.5" />
          <rect x="66" y="60" width="14" height="10" rx="1.5" fill="#111" stroke="#444" strokeWidth="0.5" />
          <circle cx="73" cy="79" r="5" fill="#111" stroke="#444" strokeWidth="0.5" />
          <circle cx="73" cy="79" r="2.5" fill="#0a0a0a" />
          <rect x="36" y="104" width="52" height="28" rx="3" fill="#151515" stroke="#2a2a2a" strokeWidth="0.5" />
          <text x="62" y="115" textAnchor="middle" fill="#dc2626" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">IdeaCentre</text>
          <text x="62" y="124" textAnchor="middle" fill="#555" fontSize="4.5" fontFamily="monospace">5 · Intel Core i7</text>
          <rect x="36" y="144" width="52" height="10" rx="1" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.5" />
          <rect x="38" y="146" width="48" height="6" rx="0.5" fill="#111" stroke="#333" strokeWidth="0.3" />
          <rect x="36" y="162" width="22" height="12" rx="1" fill="#151515" stroke="#333" strokeWidth="0.5" />
          <text x="47" y="170" textAnchor="middle" fill="#444" fontSize="4" fontFamily="monospace">SD</text>
          <text x="62" y="192" textAnchor="middle" fill="#3d3d3d" fontSize="6" fontFamily="sans-serif" fontWeight="bold">Lenovo</text>
        </svg>
      )
    }

    return (
      <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="tp-bezel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1c1c1c" />
            <stop offset="100%" stopColor="#121212" />
          </linearGradient>
          <linearGradient id="tp-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#022c22" />
            <stop offset="100%" stopColor="#011f18" />
          </linearGradient>
          <linearGradient id="tp-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#262626" />
            <stop offset="100%" stopColor="#171717" />
          </linearGradient>
          <filter id="tp-sh" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Screen Lid (Top Half) - ThinkPad signature matte black */}
        <rect x="25" y="15" width="150" height="96" rx="4" fill="url(#tp-bezel)" filter="url(#tp-sh)" />
        <rect x="25" y="15" width="150" height="96" rx="4" stroke="#404040" strokeWidth="0.5" />

        {/* ThinkPad Red status light on lid back reflection */}
        <circle cx="168" cy="18" r="0.8" fill="#ef4444" />

        {/* ThinkPad Screen */}
        <rect x="28" y="18" width="144" height="89" rx="1" fill="url(#tp-screen)" />

        {/* Screen Content: Linux terminal */}
        <rect x="36" y="26" width="128" height="70" rx="2" fill="#01120e" stroke="#047857" strokeWidth="0.6" />
        <text x="42" y="36" fill="#10b981" fontSize="4.5" fontFamily="monospace">root@thinkpad:~# nmap -sS 10.0.0.1</text>
        <text x="42" y="44" fill="#34d399" fontSize="4.5" fontFamily="monospace">Starting Nmap 7.92 at 2026-05-18</text>
        <text x="42" y="52" fill="#34d399" fontSize="4.5" fontFamily="monospace">Nmap scan report for router (10.0.0.1)</text>
        <text x="42" y="60" fill="#34d399" fontSize="4.5" fontFamily="monospace">Host is up (0.0021s latency).</text>
        <text x="42" y="68" fill="#34d399" fontSize="4.5" fontFamily="monospace">PORT   STATE SERVICE</text>
        <text x="42" y="76" fill="#10b981" fontSize="4.5" fontFamily="monospace">22/tcp open  ssh</text>
        <text x="42" y="84" fill="#10b981" fontSize="4.5" fontFamily="monospace">80/tcp open  http</text>
        <text x="42" y="92" fill="#10b981" fontSize="4.5" fontFamily="monospace">root@thinkpad:~# _</text>

        {/* Model label on screen */}
        <text x="42" y="92" fill={accentColor} fontSize="4.5" fontFamily="monospace">{screenLabel}</text>

        {/* ThinkPad Base (Keyboard Deck) */}
        <path d="M 15 111 L 185 111 L 195 126 L 5 126 Z" fill="url(#tp-chassis)" filter="url(#tp-sh)" />
        <path d="M 5 126 L 195 126 L 195 129 C 195 131 193 133 191 133 L 9 133 C 7 133 5 131 5 129 Z" fill="#171717" stroke="#262626" strokeWidth="0.5" />

        {/* ThinkPad Keyboard Area */}
        <path d="M 28 113 L 172 113 L 176 120 L 24 120 Z" fill="#171717" />
        {[0, 1, 2].map(row => (
          <line key={row} x1={30 - row * 1.5} y1={114 + row * 2} x2={170 + row * 1.5} y2={114 + row * 2} stroke={isGaming ? '#ff4500' : '#404040'} strokeWidth="1" strokeDasharray="3 2.5" />
        ))}

        {/* ThinkPad Red TrackPoint */}
        <circle cx="100" cy="116.5" r="1.5" fill={accentColor} />

        {/* TrackPad */}
        <path d="M 76 121 L 124 121 L 126 125 L 74 125 Z" fill="#262626" stroke="#404040" strokeWidth="0.5" />
        <line x1="77" y1="121.5" x2="98" y2="121.5" stroke={accentColor} strokeWidth="0.6" />
        <line x1="102" y1="121.5" x2="123" y2="121.5" stroke={accentColor} strokeWidth="0.6" />

        {/* Lenovo logo */}
        <text x="164" y="124" fill="#a3a3a3" fontSize="3.5" fontFamily="sans-serif" fontWeight="bold" transform="rotate(4 164 124)">Lenovo</text>
        {isGaming && <rect x="24" y="111" width="4" height="14" rx="1" fill="#ef4444" opacity="0.6" />}
      </svg>
    )
  }

  if (normalizedBrand === 'Dell') {
    // Dell models: Latitude 5540 / OptiPlex 7010 / Precision 3580 / Vostro 3530 / XPS 15 9530
    const isXPS = normalizedModel === 'XPS 15 9530'
    const isPrecision = normalizedModel === 'Precision 3580'
    const dellAccent = isXPS ? '#0ea5e9' : '#007db8'
    const dellModel = normalizedModel
    return (
      <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="dell-bezel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2d3748" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>
          <linearGradient id="dell-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="dell-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4a5568" />
            <stop offset="100%" stopColor="#2d3748" />
          </linearGradient>
          <filter id="dell-sh" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Screen Lid (Top Half) */}
        <rect x="25" y="15" width="150" height="96" rx="4" fill="url(#dell-bezel)" filter="url(#dell-sh)" />
        <rect x="25" y="15" width="150" height="96" rx="4" stroke="#4a5568" strokeWidth="0.5" />

        {/* Dell Screen */}
        <rect x="29" y="19" width="142" height="88" rx="1" fill="url(#dell-screen)" />

        {/* Screen Content: Windows PowerShell */}
        <rect x="36" y="27" width="128" height="68" rx="2.5" fill="#012456" stroke="#007db8" strokeWidth="0.6" />
        <rect x="36" y="27" width="128" height="8" rx="2.5" fill="#007db8" />
        <circle cx="41" cy="31" r="1.5" fill="#ef4444" />
        <text x="100" y="33" textAnchor="middle" fill="#ffffff" fontSize="4.5" fontFamily="monospace">Windows PowerShell</text>

        <text x="41" y="44" fill="#ffffff" fontSize="4.5" fontFamily="monospace">Windows PowerShell</text>
        <text x="41" y="52" fill="#ffffff" fontSize="4.5" fontFamily="monospace">Copyright (C) Microsoft Corporation.</text>
        <text x="41" y="62" fill="#fbbf24" fontSize="4.5" fontFamily="monospace">PS C:\Users\roqy&gt; test-connection 10.0.0.1</text>
        <text x="41" y="72" fill="#4ade80" fontSize="4.5" fontFamily="monospace">Source     Destination   LatencyStatus</text>
        <text x="41" y="80" fill="#4ade80" fontSize="4.5" fontFamily="monospace">roqy-pc    10.0.0.1      Success (1ms)</text>
        <text x="41" y="88" fill="#fbbf24" fontSize="4.5" fontFamily="monospace">PS C:\Users\roqy&gt; _</text>

        {/* Laptop Base */}
        <path d="M 15 111 L 185 111 L 195 125 L 5 125 Z" fill="url(#dell-chassis)" filter="url(#dell-sh)" />
        <path d="M 5 125 L 195 125 L 195 128 C 195 130 193 132 191 132 L 9 132 C 7 132 5 130 5 128 Z" fill="#1a202c" stroke="#2d3748" strokeWidth="0.5" />

        {/* Dell Keyboard Area */}
        <path d="M 28 113 L 172 113 L 176 119 L 24 119 Z" fill="#1a202c" />
        {[0, 1, 2].map(row => (
          <line key={row} x1={30 - row * 1.5} y1={114 + row * 2} x2={170 + row * 1.5} y2={114 + row * 2} stroke="#4a5568" strokeWidth="1" strokeDasharray="3 2" />
        ))}

        {/* Trackpad */}
        <path d="M 78 120 L 122 120 L 124 124 L 76 124 Z" fill="#4a5568" stroke="#1a202c" strokeWidth="0.5" />
        
        {/* Model label */}
        <text x="41" y="89" fill={dellAccent} fontSize="4.5" fontFamily="monospace">{dellModel}</text>

        {/* Dell logo Badge on palm rest */}
        <circle cx="166" cy="122" r="3" fill={dellAccent} />
        <text x="166" y="123.5" textAnchor="middle" fill="#ffffff" fontSize="4" fontFamily="sans-serif" fontWeight="bold">DELL</text>
        {isXPS && <rect x="24" y="111" width="3" height="14" rx="1" fill="#0ea5e9" opacity="0.5" />}
      </svg>
    )
  }

  if (normalizedBrand === 'HP') {
    // HP models: EliteBook 840 G10 / ProBook 450 G10 / EliteDesk 800 G9 / ZBook Studio G10 / OMEN 16
    const isOmen = normalizedModel === 'OMEN 16'
    const isZBook = normalizedModel === 'ZBook Studio G10'
    const hpAccent = isOmen ? '#ef4444' : '#0096d6'
    const hpModel = normalizedModel
    return (
      <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="hp-bezel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="hp-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="hp-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <filter id="hp-sh" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Screen Lid (Top Half) */}
        <rect x="25" y="15" width="150" height="96" rx="4" fill="url(#hp-bezel)" filter="url(#hp-sh)" />
        <rect x="25" y="15" width="150" height="96" rx="4" stroke="#cbd5e1" strokeWidth="0.5" />

        {/* HP Screen */}
        <rect x="29" y="19" width="142" height="88" rx="1" fill="url(#hp-screen)" />

        {/* Screen Content: macOS bash shell style */}
        <rect x="36" y="27" width="128" height="68" rx="3" fill="#0f172a" stroke="#0284c7" strokeWidth="0.6" />
        <rect x="36" y="27" width="128" height="9" rx="3" fill="#0284c7" />
        <circle cx="42" cy="31.5" r="1.5" fill="#ef4444" />
        <circle cx="47" cy="31.5" r="1.5" fill="#fbbf24" />
        <circle cx="52" cy="31.5" r="1.5" fill="#4ade80" />
        <text x="100" y="33.5" textAnchor="middle" fill="#ffffff" fontSize="4.5" fontFamily="monospace">bash — roqy@hp-elitebook</text>

        <text x="42" y="45" fill="#38bdf8" fontSize="4.5" fontFamily="monospace">roqy@hp:~$ ssh admin@10.0.0.1</text>
        <text x="42" y="53" fill="#e2e8f0" fontSize="4.5" fontFamily="monospace">Password: *********</text>
        <text x="42" y="63" fill="#4ade80" fontSize="4.5" fontFamily="monospace">Welcome to Switch CLI v1.0</text>
        <text x="42" y="73" fill="#38bdf8" fontSize="4.5" fontFamily="monospace">switch&gt; enable</text>
        <text x="42" y="81" fill="#38bdf8" fontSize="4.5" fontFamily="monospace">switch# show interfaces brief</text>
        <text x="42" y="89" fill="#e2e8f0" fontSize="4.5" fontFamily="monospace">Vlan1          10.0.0.1        YES manual up  up</text>

        {/* Laptop Base */}
        <path d="M 15 111 L 185 111 L 195 125 L 5 125 Z" fill="url(#hp-chassis)" filter="url(#hp-sh)" />
        <path d="M 5 125 L 195 125 L 195 128 C 195 130 193 132 191 132 L 9 132 C 7 132 5 130 5 128 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="0.5" />

        {/* HP Keyboard Deck */}
        <path d="M 28 113 L 172 113 L 176 119 L 24 119 Z" fill="#1e293b" />
        {[0, 1, 2].map(row => (
          <line key={row} x1={30 - row * 1.5} y1={114 + row * 2} x2={170 + row * 1.5} y2={114 + row * 2} stroke="#475569" strokeWidth="1" strokeDasharray="3 2" />
        ))}

        {/* Trackpad */}
        <path d="M 78 120 L 122 120 L 124 124 L 76 124 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
        
        {/* Model label */}
        <text x="42" y="90" fill={hpAccent} fontSize="4.5" fontFamily="monospace">{hpModel}</text>

        {/* HP Logo label on base */}
        <text x="166" y="122.5" fill={hpAccent} fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">hp</text>
        {isOmen && <rect x="24" y="111" width="3" height="14" rx="1" fill="#ef4444" opacity="0.6" />}
      </svg>
    )
  }

  if (normalizedModel === 'Mac mini M4') {
    // Mac mini M4 — compact square aluminum desktop
    return (
      <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="mini-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4d7da" />
            <stop offset="100%" stopColor="#b8bbbe" />
          </linearGradient>
          <linearGradient id="mini-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8eaec" />
            <stop offset="100%" stopColor="#d0d3d6" />
          </linearGradient>
          <filter id="mini-sh" x="-15%" y="-15%" width="130%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.4" />
          </filter>
        </defs>
        <ellipse cx="100" cy="134" rx="72" ry="6" fill="black" fillOpacity="0.3" />
        <path d="M 156 30 L 172 18 L 172 104 L 156 114 Z" fill="#9fa3a7" />
        <path d="M 28 114 L 44 102 L 172 102 L 156 114 Z" fill="#8a8e92" />
        <path d="M 28 30 L 44 18 L 172 18 L 156 30 Z" fill="url(#mini-top)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={104 + i * 5} y1="20" x2={104 + i * 5} y2="29" stroke="#b0b4b8" strokeWidth="0.8" strokeOpacity="0.6" />
        ))}
        <rect x="28" y="30" width="128" height="84" rx="4" fill="url(#mini-front)" filter="url(#mini-sh)" />
        <rect x="28" y="30" width="128" height="84" rx="4" stroke="#9ca0a4" strokeWidth="0.8" />
        <rect x="30" y="32" width="124" height="12" rx="3" fill="white" fillOpacity="0.18" />
        <rect x="56" y="44" width="72" height="36" rx="3" fill="#c8cbce" />
        <text x="92" y="58" textAnchor="middle" fill="#444" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Mac mini</text>
        <text x="92" y="70" textAnchor="middle" fill="#666" fontSize="5.5" fontFamily="monospace">M4 · Apple Silicon</text>
        {[0, 1].map(i => (
          <g key={i}>
            <rect x={38 + i * 18} y="90" width="14" height="10" rx="3" fill="#1a1a1a" stroke="#555" strokeWidth="0.5" />
            <rect x={40 + i * 18} y="92" width="10" height="6" rx="2" fill="#111" />
          </g>
        ))}
        <circle cx="148" cy="107" r="2.5" fill="#4ade80" opacity="0.9" />
        <rect x="152" y="60" width="8" height="24" rx="2" fill="#9fa3a7" />
        <rect x="153" y="66" width="6" height="12" rx="1.5" fill="#b8bbbe" />
      </svg>
    )
  }

  if (normalizedModel === 'iMac 24" M3') {
    // iMac 24" M3 — thin all-in-one with large display
    return (
      <svg viewBox="0 0 200 185" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="imac-scr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="imac-stand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>
          <linearGradient id="imac-chin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8eaec" />
            <stop offset="100%" stopColor="#d4d7db" />
          </linearGradient>
          <linearGradient id="macos-bg" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#0c1445" />
            <stop offset="50%" stopColor="#1a0a2e" />
            <stop offset="100%" stopColor="#0a0a1e" />
          </linearGradient>
          <filter id="imac-sh" x="-8%" y="-8%" width="116%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="8" floodOpacity="0.35" />
          </filter>
        </defs>
        <ellipse cx="100" cy="181" rx="38" ry="4" fill="#d1d5db" />
        <rect x="74" y="164" width="52" height="16" rx="4" fill="url(#imac-stand)" stroke="#9ca3af" strokeWidth="0.5" />
        <rect x="90" y="138" width="20" height="28" rx="2" fill="#e2e8f0" />
        <rect x="93" y="138" width="14" height="28" fill="#edf0f3" />
        <rect x="78" y="160" width="44" height="6" rx="3" fill="#d1d5db" />
        <rect x="6" y="6" width="188" height="134" rx="10" fill="#c0c4c8" filter="url(#imac-sh)" />
        <rect x="8" y="8" width="184" height="130" rx="9" fill="#0f172a" />
        <rect x="10" y="10" width="180" height="120" rx="8" fill="url(#imac-scr)" />
        <rect x="10" y="10" width="180" height="11" rx="8" fill="#1e2935" fillOpacity="0.95" />
        <text x="24" y="17.5" fill="#e5e7eb" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">Finder  File  Edit  View  Window</text>
        <rect x="10" y="21" width="180" height="99" fill="url(#macos-bg)" />
        <circle cx="100" cy="60" r="32" fill="#3b82f6" fillOpacity="0.08" />
        <circle cx="100" cy="60" r="16" fill="#60a5fa" fillOpacity="0.06" />
        <text x="100" y="56" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="sans-serif">iMac</text>
        <text x="100" y="66" textAnchor="middle" fill="#334155" fontSize="5.5" fontFamily="monospace">M3 · Apple Silicon</text>
        <rect x="38" y="113" width="124" height="14" rx="7" fill="#1e293b" fillOpacity="0.75" stroke="#334155" strokeWidth="0.5" />
        {['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'].map((c, i) => (
          <rect key={i} x={44 + i * 13} y="115" width="10" height="10" rx="2.5" fill={c} fillOpacity="0.85" />
        ))}
        <circle cx="100" cy="12" r="1.8" fill="#0f172a" stroke="#2d3748" strokeWidth="0.4" />
        <circle cx="100" cy="12" r="0.7" fill="#3b82f6" fillOpacity="0.5" />
        <rect x="8" y="130" width="184" height="8" rx="0" fill="url(#imac-chin)" />
        <path d="M 10 10 L 190 10 L 190 50 L 10 80 Z" fill="white" fillOpacity="0.025" />
      </svg>
    )
  }

  if (normalizedModel === 'MacBook Pro 14"' || normalizedModel === 'MacBook Pro 16"') {
    // MacBook Pro — Space Gray, thicker body, ProMotion display
    const is16 = normalizedModel === 'MacBook Pro 16"'
    return (
      <svg viewBox={is16 ? '0 0 210 155' : '0 0 200 150'} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="pro-bezel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1c1e" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </linearGradient>
          <linearGradient id="pro-scr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#060d14" />
          </linearGradient>
          <linearGradient id="pro-deck" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c2c2e" />
            <stop offset="100%" stopColor="#1c1c1e" />
          </linearGradient>
          <filter id="pro-sh" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.5" />
          </filter>
        </defs>
        <rect x="25" y="15" width={is16 ? 160 : 150} height="96" rx="4" fill="url(#pro-bezel)" filter="url(#pro-sh)" />
        <rect x="25" y="15" width={is16 ? 160 : 150} height="96" rx="4" stroke="#3a3a3c" strokeWidth="0.5" />
        <rect x="28" y="18" width={is16 ? 154 : 144} height="89" rx="1.5" fill="url(#pro-scr)" />
        <path d={is16 ? 'M 101 18 L 109 18 L 109 22 C 109 23 108 24 107 24 L 103 24 C 102 24 101 23 101 22 Z' : 'M 96 18 L 104 18 L 104 22 C 104 23 103 24 102 24 L 98 24 C 97 24 96 23 96 22 Z'} fill="#0a0a0c" />
        <circle cx={is16 ? 105 : 100} cy="21" r="1" fill="#1e3a5f" />
        <circle cx={is16 ? 105 : 100} cy="21" r="0.4" fill="#60a5fa" />
        <rect x="36" y="26" width={is16 ? 146 : 136} height="70" rx="3" fill="#0d1a2e" stroke="#1e3a5f" strokeWidth="0.6" />
        <rect x="36" y="26" width={is16 ? 146 : 136} height="10" rx="3" fill="#1e3a5f" />
        <circle cx="42" cy="31" r="2.5" fill="#ef4444" opacity="0.9" />
        <circle cx="49" cy="31" r="2.5" fill="#fbbf24" opacity="0.9" />
        <circle cx="56" cy="31" r="2.5" fill="#4ade80" opacity="0.9" />
        <text x={is16 ? 113 : 108} y="33" textAnchor="middle" fill="#93c5fd" fontSize="5" fontFamily="monospace">roqy@macbook-pro: ~</text>
        <text x="42" y="44" fill="#4ade80" fontSize="5" fontFamily="monospace">$ xcodebuild -list</text>
        <text x="42" y="52" fill="#60a5fa" fontSize="5" fontFamily="monospace">Information about project "PacketRoqy":</text>
        <text x="42" y="60" fill="#94a3b8" fontSize="5" fontFamily="monospace">    Schemes:</text>
        <text x="42" y="68" fill="#a3e635" fontSize="5" fontFamily="monospace">        PacketRoqy</text>
        <text x="42" y="76" fill="#4ade80" fontSize="5" fontFamily="monospace">$ swift build --configuration release</text>
        <text x="42" y="84" fill="#60a5fa" fontSize="5" fontFamily="monospace">Build complete! (2.4s)</text>
        <text x="42" y="92" fill="#4ade80" fontSize="5" fontFamily="monospace">$ _</text>
        <path d={is16 ? 'M 15 111 L 195 111 L 205 125 L 5 125 Z' : 'M 15 111 L 185 111 L 195 125 L 5 125 Z'} fill="url(#pro-deck)" filter="url(#pro-sh)" />
        <path d={is16 ? 'M 5 125 L 205 125 L 205 128 C 205 130 203 132 201 132 L 9 132 C 7 132 5 130 5 128 Z' : 'M 5 125 L 195 125 L 195 128 C 195 130 193 132 191 132 L 9 132 C 7 132 5 130 5 128 Z'} fill="#1c1c1e" stroke="#3a3a3c" strokeWidth="0.5" />
        <path d={is16 ? 'M 28 113 L 182 113 L 186 119 L 24 119 Z' : 'M 28 113 L 172 113 L 176 119 L 24 119 Z'} fill="#111113" />
        {[0, 1, 2].map(row => (
          <line key={row} x1={30 - row * 1.5} y1={114 + row * 2} x2={is16 ? 180 + row * 1.5 : 170 + row * 1.5} y2={114 + row * 2} stroke="#3a3a3c" strokeWidth="1" strokeDasharray="3 2" />
        ))}
        <path d={is16 ? 'M 82 120 L 128 120 L 130 124 L 80 124 Z' : 'M 76 120 L 124 120 L 126 124 L 74 124 Z'} fill="#2c2c2e" stroke="#3a3a3c" strokeWidth="0.5" />
        <path d={is16 ? 'M 96 125 L 114 125 C 114 126 112 127 105 127 C 98 127 96 126 96 125 Z' : 'M 90 125 L 110 125 C 110 126 108 127 100 127 C 92 127 90 126 90 125 Z'} fill="#3a3a3c" />
        <text x={is16 ? 195 : 185} y="122" textAnchor="end" fill="#6b7280" fontSize="4" fontFamily="monospace">{normalizedModel}</text>
      </svg>
    )
  }

  // Apple MacBook Air M3 (Default) - Silver unibody design
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="mac-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#111827" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
        <linearGradient id="mac-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0f172a" />
          <stop offset="100%" stopColor="#060d14" />
        </linearGradient>
        <linearGradient id="mac-chassis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
        <linearGradient id="mac-deck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <filter id="mac-sh" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Screen Lid (Top Half) */}
      <rect x="25" y="15" width="150" height="96" rx="4" fill="url(#mac-bezel)" filter="url(#mac-sh)" />
      
      {/* Screen Bezel Reflection */}
      <rect x="25" y="15" width="150" height="96" rx="4" stroke="#4b5563" strokeWidth="0.5" />
      
      {/* The Screen */}
      <rect x="28" y="18" width="144" height="89" rx="1.5" fill="url(#mac-screen)" />
      
      {/* Camera Notch */}
      <path d="M 96 18 L 104 18 L 104 22 C 104 23 103 24 102 24 L 98 24 C 97 24 96 23 96 22 Z" fill="#030712" />
      <circle cx="100" cy="21" r="1" fill="#1e3a5f" />
      <circle cx="100" cy="21" r="0.4" fill="#60a5fa" />

      {/* Screen Content: Terminal window */}
      <rect x="36" y="28" width="128" height="68" rx="3" fill="#0f172a" stroke="#1e3a5f" strokeWidth="0.6" />
      <rect x="36" y="28" width="128" height="10" rx="3" fill="#1e3a5f" />
      
      {/* Terminal buttons */}
      <circle cx="42" cy="33" r="2.5" fill="#ef4444" opacity="0.9" />
      <circle cx="49" cy="33" r="2.5" fill="#fbbf24" opacity="0.9" />
      <circle cx="56" cy="33" r="2.5" fill="#4ade80" opacity="0.9" />
      
      {/* Terminal Title */}
      <text x="100" y="35" textAnchor="middle" fill="#93c5fd" fontSize="5" fontFamily="monospace">roqy@macbook: ~</text>
      
      {/* Terminal Text */}
      <text x="42" y="46" fill="#4ade80" fontSize="5" fontFamily="monospace">$ ping 192.168.1.1</text>
      <text x="42" y="54" fill="#60a5fa" fontSize="5" fontFamily="monospace">Reply from 192.168.1.1: bytes=32 time=2ms</text>
      <text x="42" y="62" fill="#60a5fa" fontSize="5" fontFamily="monospace">Reply from 192.168.1.1: bytes=32 time=2ms</text>
      <text x="42" y="70" fill="#4ade80" fontSize="5" fontFamily="monospace">$ _</text>

      {/* Screen Glare Overlay */}
      <path d="M28 18 L172 18 L172 50 L28 80 Z" fill="#ffffff" fillOpacity="0.04" />

      {/* Laptop Base (Keyboard Deck) */}
      <path d="M 15 111 L 185 111 L 195 125 L 5 125 Z" fill="url(#mac-deck)" filter="url(#mac-sh)" />
      
      {/* Base Front Lip */}
      <path d="M 5 125 L 195 125 L 195 128 C 195 130 193 132 191 132 L 9 132 C 7 132 5 130 5 128 Z" fill="url(#mac-chassis)" stroke="#9ca3af" strokeWidth="0.5" />
      
      {/* Keyboard Area Recess */}
      <path d="M 28 113 L 172 113 L 176 119 L 24 119 Z" fill="#9ca3af" fillOpacity="0.3" />
      
      {/* Keyboard keys */}
      {[0, 1, 2].map(row => (
        <line key={row} x1={30 - row * 1.5} y1={114 + row * 2} x2={170 + row * 1.5} y2={114 + row * 2} stroke="#374151" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      ))}
      
      {/* Trackpad */}
      <path d="M 76 120 L 124 120 L 126 124 L 74 124 Z" fill="#cbd5e1" stroke="#9ca3af" strokeWidth="0.5" />
      
      {/* Base Cutout */}
      <path d="M 90 125 L 110 125 C 110 126 108 127 100 127 C 92 127 90 126 90 125 Z" fill="#6b7280" />
    </svg>
  )
}

export function ServerPreview({ brand, model, ...props }: PreviewP) {
  const normalizedBrand = brand?.trim() || 'Dell'
  const normalizedModel = model?.trim() || 'PowerEdge R750'

  if (normalizedBrand === 'HP') {
    // HP ProLiant DL380 Server style - Dark metal, blue smart-socket markings
    return (
      <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="hp-srv-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="hp-srv-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.5" />
          </filter>
        </defs>
        {/* Rack brackets */}
        <rect x="0"   y="6"  width="9" height="88" rx="2" fill="#334155" />
        <rect x="231" y="6"  width="9" height="88" rx="2" fill="#334155" />

        {/* Main Body */}
        <rect x="9" y="6"  width="222" height="88" rx="4" fill="url(#hp-srv-chassis)" filter="url(#hp-srv-sh)" />
        <rect x="9" y="6"  width="222" height="88" rx="4" stroke="#475569" strokeWidth="0.8" />

        {/* HP Server Badge */}
        <rect x="196" y="12" width="30" height="20" rx="2" fill="#090d16" stroke="#0096d6" strokeWidth="0.5" />
        <text x="211" y="20" textAnchor="middle" fill="#0096d6" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">HP</text>
        <text x="211" y="28" textAnchor="middle" fill="#475569" fontSize="4.5" fontFamily="monospace">ProLiant</text>

        {/* HP Blue smart sockets and ports */}
        {[0,1,2,3].map(i => (
          <g key={i}>
            <rect x={14 + i * 24} y="15" width="20" height="32" rx="1.5" fill="#0c111a" stroke="#0284c7" strokeWidth="0.6" />
            <rect x={16 + i * 24} y="17" width="16" height="28" rx="1" fill="#111" />
            <rect x={18 + i * 24} y="32" width="12" height="2"  fill="#0284c7" />
            <circle cx={19 + i * 24} cy="21" r="1" fill="#4ade80" />
          </g>
        ))}

        {/* Lower Drive Bays */}
        {[0,1,2,3].map(i => (
          <g key={i + 4}>
            <rect x={14 + i * 24} y="52" width="20" height="32" rx="1.5" fill="#0c111a" stroke="#334155" strokeWidth="0.6" />
            <rect x={16 + i * 24} y="54" width="16" height="28" rx="1" fill="#111" />
            <circle cx={19 + i * 24} cy="58" r="1" fill="#4ade80" opacity="0.9" />
          </g>
        ))}

        {/* HP Intelligent Status indicators */}
        <rect x="116" y="15" width="72" height="68" rx="2" fill="#090d16" stroke="#475569" strokeWidth="0.6" />
        <text x="122" y="23" fill="#94a3b8" fontSize="4.5" fontFamily="monospace">HP ILO STATUS</text>
        <circle cx="124" cy="35" r="2.5" fill="#4ade80" />
        <circle cx="124" cy="47" r="2.5" fill="#4ade80" />
        <circle cx="124" cy="59" r="2.5" fill="#fbbf24" opacity="0.25" />
        <circle cx="124" cy="71" r="2.5" fill="#3b82f6" />
        <text x="134" y="37" fill="#64748b" fontSize="4" fontFamily="monospace">POWER - OK</text>
        <text x="134" y="49" fill="#64748b" fontSize="4" fontFamily="monospace">TEMP  - OK</text>
        <text x="134" y="61" fill="#64748b" fontSize="4" fontFamily="monospace">DISK  - WARN</text>
        <text x="134" y="73" fill="#64748b" fontSize="4" fontFamily="monospace">ILO5  - ACTIVE</text>
      </svg>
    )
  }

  if (normalizedBrand === 'IBM') {
    // IBM Enterprise Server style - Red accents, blue slide slots
    return (
      <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="ibm-srv-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#111827" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
          <filter id="ibm-srv-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.5" />
          </filter>
        </defs>
        {/* Rack Ears */}
        <rect x="0"   y="6"  width="9" height="88" rx="2" fill="#374151" />
        <rect x="231" y="6"  width="9" height="88" rx="2" fill="#374151" />

        {/* Main Body */}
        <rect x="9" y="6"  width="222" height="88" rx="4" fill="url(#ibm-srv-chassis)" filter="url(#ibm-srv-sh)" />
        <rect x="9" y="6"  width="222" height="88" rx="4" stroke="#1f70c1" strokeWidth="0.8" />

        {/* IBM Red Ribbon and Logo */}
        <rect x="13" y="12" width="214" height="4" fill="#ef4444" />
        <rect x="196" y="20" width="30" height="20" rx="2" fill="#090d16" stroke="#1f70c1" strokeWidth="0.5" />
        <text x="211" y="29" textAnchor="middle" fill="#1f70c1" fontSize="7" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.5">IBM</text>
        <text x="211" y="37" textAnchor="middle" fill="#4b5563" fontSize="4.5" fontFamily="monospace">Power10</text>

        {/* Drive slots with blue slider indicators */}
        {[0,1,2,3,4,5].map(i => (
          <g key={i}>
            <rect x={14 + i * 22} y="22" width="18" height="28" rx="1.5" fill="#0c111a" stroke="#1f70c1" strokeWidth="0.6" />
            <rect x={15.5 + i * 22} y="23.5" width="15" height="25" rx="1" fill="#111827" />
            {/* Red slide lock tab */}
            <rect x={21 + i * 22} y="27" width="4" height="2" fill="#ef4444" />
            <circle cx={19 + i * 22} cy="42" r="1" fill="#4ade80" opacity={i < 5 ? 0.9 : 0.2} />
          </g>
        ))}

        {[0,1,2,3,4,5].map(i => (
          <g key={i + 6}>
            <rect x={14 + i * 22} y="54" width="18" height="32" rx="1.5" fill="#0c111a" stroke="#374151" strokeWidth="0.6" />
            <rect x={15.5 + i * 22} y="55.5" width="15" height="29" rx="1" fill="#111827" />
            <rect x={21 + i * 22} y="59" width="4" height="2" fill="#ef4444" />
            <circle cx={19 + i * 22} cy="78" r="1" fill="#4ade80" opacity={i < 4 ? 0.9 : 0.2} />
          </g>
        ))}

        {/* IBM logo detail lines on right */}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={i} x1="196" y1={46 + i * 8} x2="226" y2={46 + i * 8} stroke="#1f70c1" strokeWidth="1" />
        ))}
      </svg>
    )
  }

  if (normalizedBrand === 'Cisco') {
    const isCiscoRack = normalizedModel === 'UCS C220 M6' || normalizedModel === 'UCS C240 M6' || normalizedModel === 'UCS S3260' || normalizedModel === 'UCS X210c M7'

    if (isCiscoRack) {
      // Cisco UCS Rack Server (C220/C240/S3260/X210c) — 1U/2U front panel
      return (
        <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <defs>
            <linearGradient id="csc-rack-ch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e2530" />
              <stop offset="100%" stopColor="#131920" />
            </linearGradient>
            <filter id="csc-rack-sh" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.5" />
            </filter>
          </defs>
          <rect x="0"   y="6"  width="9" height="88" rx="2" fill="#334155" />
          <rect x="231" y="6"  width="9" height="88" rx="2" fill="#334155" />
          <rect x="9" y="6" width="222" height="88" rx="4" fill="url(#csc-rack-ch)" filter="url(#csc-rack-sh)" />
          <rect x="9" y="6" width="222" height="88" rx="4" stroke="#3b82f6" strokeWidth="0.8" />
          <rect x="13" y="10" width="214" height="3" fill="#3b82f6" />
          <rect x="14" y="18" width="54" height="18" rx="2" fill="#0c1a3d" stroke="#3b82f6" strokeWidth="0.5" />
          <text x="41" y="26" textAnchor="middle" fill="#3b82f6" fontSize="7" fontFamily="sans-serif" fontWeight="bold">CISCO</text>
          <text x="41" y="32" textAnchor="middle" fill="#475569" fontSize="4.5" fontFamily="monospace">{normalizedModel}</text>
          {[0,1,2,3,4,5,6,7].map(i => (
            <g key={i}>
              <rect x={76 + i * 17} y="16" width="14" height="22" rx="1.5" fill="#0d1520" stroke="#3b82f6" strokeWidth="0.5" />
              <rect x={78 + i * 17} y="18" width="10" height="18" rx="1" fill="#111827" />
              <circle cx={83 + i * 17} cy="22" r="1.2" fill="#4ade80" opacity={i < 6 ? 0.9 : 0.2} />
              <circle cx={83 + i * 17} cy="26" r="1.2" fill="#fbbf24" opacity={i === 1 ? 0.8 : 0.1} />
            </g>
          ))}
          {[0,1,2,3,4,5,6,7].map(i => (
            <g key={i}>
              <rect x={76 + i * 17} y="44" width="14" height="36" rx="1.5" fill="#0d1520" stroke="#334155" strokeWidth="0.5" />
              <rect x={78 + i * 17} y="46" width="10" height="32" rx="1" fill="#111827" />
              <circle cx={83 + i * 17} cy="50" r="1.1" fill="#4ade80" opacity={i < 5 ? 0.9 : 0.15} />
            </g>
          ))}
          <circle cx="18" cy="78" r="5" fill="#0c1a3d" stroke="#3b82f6" strokeWidth="0.8" />
          <circle cx="18" cy="78" r="3" fill="#3b82f6" opacity="0.7" />
          <circle cx="32" cy="78" r="2" fill="#4ade80" />
          <circle cx="40" cy="78" r="2" fill="#ef4444" opacity="0.2" />
          <circle cx="48" cy="78" r="2" fill="#fbbf24" opacity="0.2" />
        </svg>
      )
    }

    // Cisco UCS Blade Server style - Silver with blue accents, blade slots
    return (
      <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
          <linearGradient id="csc-srv-chassis" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <filter id="csc-srv-sh" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.45" />
          </filter>
        </defs>
        {/* Silver brackets */}
        <rect x="0"   y="6"  width="9" height="88" rx="2" fill="#cbd5e1" />
        <rect x="231" y="6"  width="9" height="88" rx="2" fill="#cbd5e1" />

        {/* Main Body */}
        <rect x="9" y="6"  width="222" height="88" rx="4" fill="url(#csc-srv-chassis)" filter="url(#csc-srv-sh)" />
        <rect x="9" y="6"  width="222" height="88" rx="4" stroke="#3b82f6" strokeWidth="0.8" />

        {/* Cisco Brand logo */}
        <rect x="196" y="12" width="30" height="22" rx="2" fill="#0c1a3d" stroke="#3b82f6" strokeWidth="0.5" />
        <text x="211" y="21" textAnchor="middle" fill="#3b82f6" fontSize="6" fontFamily="sans-serif" fontWeight="bold">CISCO</text>
        <text x="211" y="29" textAnchor="middle" fill="#64748b" fontSize="4.5" fontFamily="monospace">{normalizedModel}</text>

        {/* UCS blades vertical lines representing pull-out slots */}
        {[0,1,2,3,4,5,6].map(i => (
          <g key={i}>
            {/* Vertical Blade Slot border */}
            <rect x={14 + i * 25} y="12" width="22" height="76" rx="1.5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" />
            <rect x={16 + i * 25} y="14" width="18" height="72" rx="1" fill="#0f172a" />
            
            {/* Cisco signature blue ejector latches */}
            <rect x={18 + i * 25} y="16" width="14" height="4" fill="#3b82f6" rx="0.5" />
            <rect x={18 + i * 25} y="80" width="14" height="4" fill="#3b82f6" rx="0.5" />

            {/* HDD bays inside blade */}
            <rect x={19 + i * 25} y="26" width="12" height="8" rx="0.8" fill="#1e293b" />
            <rect x={19 + i * 25} y="38" width="12" height="8" rx="0.8" fill="#1e293b" />
            
            <circle cx={25 + i * 25} cy="52" r="1.2" fill="#4ade80" opacity={i < 5 ? 0.9 : 0.2} />
            <circle cx={25 + i * 25} cy="58" r="1.2" fill="#fbbf24" opacity={i === 2 ? 0.85 : 0.1} />

            <text x={25 + i * 25} y="72" textAnchor="middle" fill="#3b82f6" fontSize="4" fontFamily="monospace">B{i}</text>
          </g>
        ))}
      </svg>
    )
  }

  // Dell PowerEdge (Default) - Hexagonal honeycomb bezel front
  return (
    <svg viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="srv-u1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#374151" />
          <stop offset="100%" stopColor="#1c2333" />
        </linearGradient>
        <linearGradient id="srv-u2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2d3748" />
          <stop offset="100%" stopColor="#151e2d" />
        </linearGradient>
        <linearGradient id="srv-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id="srv-sh" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.5" />
        </filter>
      </defs>
      <rect x="0"   y="6"  width="9" height="88" rx="2" fill="#111827" />
      <rect x="231" y="6"  width="9" height="88" rx="2" fill="#111827" />
      {[18,48,72].map(y => (
        <g key={y}>
          <rect x="1"   y={y} width="6" height="8" rx="1" fill="#1f2937" />
          <rect x="233" y={y} width="6" height="8" rx="1" fill="#1f2937" />
        </g>
      ))}
      <rect x="9" y="6"  width="222" height="42" rx="4" fill="url(#srv-u1)" filter="url(#srv-sh)" />
      <rect x="9" y="6"  width="222" height="42" rx="4" stroke="#4b5563" strokeWidth="0.8" />
      <rect x="10" y="7" width="220" height="18" rx="3" fill="url(#srv-shine)" />
      <rect x="9" y="52" width="222" height="42" rx="4" fill="url(#srv-u2)" filter="url(#srv-sh)" />
      <rect x="9" y="52" width="222" height="42" rx="4" stroke="#374151" strokeWidth="0.8" />
      <rect x="10" y="53" width="220" height="16" rx="3" fill="url(#srv-shine)" />
      <circle cx="22" cy="27" r="7" fill="#0f172a" stroke="#374151" strokeWidth="0.8" />
      <circle cx="22" cy="27" r="4" fill="#4ade80" opacity="0.9" />
      <circle cx="21" cy="26" r="1.5" fill="white" opacity="0.35" />
      {[0,1,2,3,4,5].map(i => (
        <g key={i}>
          <rect x={36+i*26} y="13" width="22" height="20" rx="1.5" fill="#0c111a" stroke="#2d3748" strokeWidth="0.6" />
          <rect x={37.5+i*26} y="14.5" width="19" height="17" rx="1" fill="#111827" />
          <rect x={39+i*26}   y="21"   width="16" height="2"  rx="0.6" fill="#1e293b" />
          <circle cx={38+i*26+1} cy="16" r="1.2" fill="#fbbf24" opacity={i<4?0.85:0.2} />
          <circle cx={38+i*26+4} cy="16" r="1.2" fill="#4ade80" opacity={i<5?0.9:0.15} />
        </g>
      ))}
      <rect x="196" y="12" width="30" height="20" rx="2" fill="#0a0e1a" stroke="#2d3748" strokeWidth="0.5" />
      <text x="211" y="20" textAnchor="middle" fill="#007db8" fontSize="6" fontFamily="Arial,sans-serif" fontWeight="bold">DELL</text>
      <text x="211" y="28" textAnchor="middle" fill="#374151" fontSize="4" fontFamily="monospace">{normalizedModel}</text>
      {Array.from({length:5}).map((_,i) => (
        <line key={i} x1={14+i*3} y1="13" x2={14+i*3} y2="39" stroke="#2d3748" strokeWidth="0.8" />
      ))}
      <circle cx="22" cy="73" r="7" fill="#0f172a" stroke="#374151" strokeWidth="0.8" />
      <circle cx="22" cy="73" r="4" fill="#4ade80" opacity="0.75" />
      {[0,1,2,3,4,5].map(i => (
        <g key={i}>
          <rect x={36+i*26} y="58" width="22" height="28" rx="1.5" fill="#0c111a" stroke="#2d3748" strokeWidth="0.6" />
          <rect x={37.5+i*26} y="59.5" width="19" height="25" rx="1" fill="#111827" />
          <rect x={39+i*26}   y="67"   width="16" height="2"  rx="0.6" fill="#1e293b" />
          <rect x={39+i*26}   y="71"   width="16" height="2"  rx="0.6" fill="#1e293b" />
          <circle cx={38+i*26+1} cy="62" r="1.2" fill="#4ade80" opacity={i<4?0.9:0.2} />
          <circle cx={38+i*26+4} cy="62" r="1.2" fill="#60a5fa" opacity={i<3?0.8:0.15} />
        </g>
      ))}
      <rect x="196" y="58" width="30" height="28" rx="2" fill="#0a0e1a" stroke="#2d3748" strokeWidth="0.5" />
      {[0,1].map(i => (
        <rect key={i} x="198" y={62+i*8} width="8" height="6" rx="0.8" fill="#1e293b" stroke="#374151" strokeWidth="0.4" />
      ))}
      <rect x="210" y="62" width="14" height="10" rx="1" fill="#0d1f0d" stroke="#16a34a" strokeWidth="0.4" />
      <text x="217" y="69.5" textAnchor="middle" fill="#4ade80" fontSize="4.5" fontFamily="monospace">OK</text>
      <circle cx="212" cy="78" r="2" fill="#4ade80" opacity="0.9" />
      <circle cx="218" cy="78" r="2" fill="#60a5fa" opacity="0.75" />
      <circle cx="224" cy="78" r="2" fill="#fbbf24" opacity="0.25" />
      {Array.from({length:5}).map((_,i) => (
        <line key={i} x1={14+i*3} y1="58" x2={14+i*3} y2="92" stroke="#2d3748" strokeWidth="0.8" />
      ))}
    </svg>
  )
}

// ─── Lookup maps ──────────────────────────────────────────────────────────────

export const DEVICE_ICON = {
  router: RouterIcon,
  switch: SwitchIcon,
  pc:     PCIcon,
  server: ServerIcon,
} as const

export const DEVICE_PREVIEW = {
  router: RouterPreview,
  switch: SwitchPreview,
  pc:     PCPreview,
  server: ServerPreview,
} as const

export const BRAND_ICON: Record<string, React.ComponentType<P>> = {
  Cisco:    CiscoBrandIcon,
  Huawei:   HuaweiBrandIcon,
  Juniper:  JuniperBrandIcon,
  MikroTik: MikrotikBrandIcon,
}
