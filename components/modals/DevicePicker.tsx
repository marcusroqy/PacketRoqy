'use client'
import { useState } from 'react'
import { X, Network, Monitor, Server } from 'lucide-react'
import {
  BRAND_COLORS,
  getBrandsByType,
  getModelsByType,
  type DeviceModel,
} from '@/lib/simulation/catalog'
import { DEVICE_PREVIEW } from '@/components/icons/DeviceIcons'
import type { DeviceType } from '@/lib/simulation/types'
import type { PCNetworkConfig } from '@/lib/store/network'

interface Props {
  deviceType: DeviceType
  onConfirm: (model: DeviceModel, pcConfig?: PCNetworkConfig) => void
  onClose: () => void
}

const TYPE_LABELS: Record<DeviceType, string> = {
  router: 'Router', switch: 'Switch', pc: 'PC', server: 'Server',
}

const PREFIX_OPTIONS = [8, 16, 24, 25, 26, 27, 28, 29, 30] as const

function prefixToMask(prefix: number): string {
  const mask = ~(0xffffffff >>> prefix) >>> 0
  return [(mask >>> 24) & 0xff, (mask >>> 16) & 0xff, (mask >>> 8) & 0xff, mask & 0xff].join('.')
}

const IP_RE = /^(\d{1,3}\.){3}\d{1,3}$/
function isValidIp(v: string) { return IP_RE.test(v) && v.split('.').every(n => parseInt(n) <= 255) }

/* Converts brand name to CSS class slug: "MikroTik" → "mikrotik" */
function brandSlug(brand: string) { return brand.toLowerCase().replace(/\s+/g, '') }

/* ─── PC / Server Network Config ─────────────────────────────── */
interface PCConfigProps {
  deviceType: 'pc' | 'server'
  config: PCNetworkConfig
  onChange: (c: PCNetworkConfig) => void
}

function PCNetworkPanel({ deviceType, config, onChange }: PCConfigProps) {
  const set = (patch: Partial<PCNetworkConfig>) => onChange({ ...config, ...patch })
  const ipOk  = !config.ip      || isValidIp(config.ip)
  const gwOk  = !config.gateway || isValidIp(config.gateway)
  const dnsOk = !config.dns     || isValidIp(config.dns)

  return (
    <div className="picker-net-panel">
      <div className="picker-net-header">
        <Network className="w-3 h-3 text-[var(--noc-cyan)] flex-shrink-0" />
        <span className="picker-net-title">Network Configuration</span>
        <span className="picker-net-opt">opcional</span>
      </div>

      <div className="picker-net-grid">
        {/* IP + prefix */}
        <div className="col-span-2 flex flex-col gap-0">
          <label className="picker-net-label">IP Address</label>
          <div className="picker-net-row">
            <input
              type="text"
              placeholder="ex: 192.168.1.10"
              value={config.ip ?? ''}
              onChange={e => set({ ip: e.target.value })}
              className={`picker-net-input${!ipOk ? ' err' : ''}`}
            />
            <select
              title="Subnet prefix"
              value={config.prefixLen ?? 24}
              onChange={e => set({ prefixLen: parseInt(e.target.value) })}
              className="picker-net-select"
            >
              {PREFIX_OPTIONS.map(p => (
                <option key={p} value={p}>/{p}</option>
              ))}
            </select>
          </div>
          {config.prefixLen != null && (
            <span className="picker-net-mask">Máscara: {prefixToMask(config.prefixLen ?? 24)}</span>
          )}
        </div>

        {/* Gateway */}
        <div className="flex flex-col gap-0">
          <label className="picker-net-label">Default Gateway</label>
          <input
            type="text"
            placeholder="ex: 192.168.1.1"
            value={config.gateway ?? ''}
            onChange={e => set({ gateway: e.target.value })}
            className={`picker-net-input${!gwOk ? ' err' : ''}`}
          />
        </div>

        {/* DNS */}
        <div className="flex flex-col gap-0">
          <label className="picker-net-label">DNS Server</label>
          <input
            type="text"
            placeholder="ex: 8.8.8.8"
            value={config.dns ?? ''}
            onChange={e => set({ dns: e.target.value })}
            className={`picker-net-input${!dnsOk ? ' err' : ''}`}
          />
        </div>

        {/* Server role */}
        {deviceType === 'server' && (
          <div className="col-span-2 flex flex-col gap-1.5">
            <div className="picker-net-divider" />
            <label className="picker-net-label flex items-center gap-1.5">
              <Server className="w-3 h-3" />
              Server Role
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Web', 'Database', 'File', 'DNS', 'DHCP', 'Generic'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => set({ dns: role === 'DNS' ? '127.0.0.1' : config.dns })}
                  className="px-2 py-1.5 rounded-sm border border-[var(--noc-bd1)] bg-[var(--noc-base)] hover:border-[var(--noc-bd2)] hover:bg-[var(--noc-s2)] text-[var(--noc-tx2)] hover:text-[var(--noc-tx1)] text-[9px] font-mono font-medium tracking-wider uppercase transition-all text-center"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hint */}
        <div className="col-span-2">
          <div className="picker-net-hint">
            <Monitor className="w-3 h-3 flex-shrink-0" />
            Configure aqui ou use{' '}
            <code className="text-[var(--noc-tx2)]">ip &lt;addr&gt; &lt;mask&gt; [gw]</code>
            {' '}no terminal
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Picker ──────────────────────────────────────────────── */
export function DevicePicker({ deviceType, onConfirm, onClose }: Props) {
  const brands = getBrandsByType(deviceType)
  const [selectedBrand, setSelectedBrand] = useState<string>(brands[0])
  const models = getModelsByType(deviceType).filter(m => m.brand === selectedBrand)
  const [selectedModel, setSelectedModel] = useState<DeviceModel>(
    () => getModelsByType(deviceType).filter(m => m.brand === brands[0])[0]
  )
  const [pcConfig, setPcConfig] = useState<PCNetworkConfig>({ prefixLen: 24 })

  const isPC = deviceType === 'pc' || deviceType === 'server'

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    const first = getModelsByType(deviceType).filter(m => m.brand === brand)[0]
    setSelectedModel(first)
  }

  const PreviewSVG = DEVICE_PREVIEW[deviceType]

  const hasValidIpConfig = !!(
    pcConfig.ip && isValidIp(pcConfig.ip) && pcConfig.prefixLen != null
  )

  function handleConfirm() {
    if (!selectedModel) return
    onConfirm(selectedModel, isPC && hasValidIpConfig ? pcConfig : undefined)
  }

  // suppress unused import warning — BRAND_COLORS is the source of truth for brandSlug
  void BRAND_COLORS

  return (
    <div className="picker-overlay">
      <div className="picker-backdrop" onClick={onClose} />

      <div
        className={`picker-modal ${isPC ? 'picker-modal-lg' : 'picker-modal-md'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="picker-header">
          <div>
            <div className="flex items-center gap-0">
              <span className="picker-title">Adicionar</span>
              <span className="picker-type-chip">{TYPE_LABELS[deviceType]}</span>
            </div>
            <p className="picker-subtitle">
              {isPC ? 'Escolha o modelo e configure a rede' : 'Escolha a marca e o modelo'}
            </p>
          </div>
          <button type="button" title="Fechar" onClick={onClose} className="picker-close-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="picker-body">
          {/* Brand sidebar */}
          <div className="picker-brands">
            {brands.map(brand => (
              <button
                type="button"
                key={brand}
                onClick={() => handleBrandChange(brand)}
                className={`picker-brand-btn${selectedBrand === brand ? ' active' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 brand-dot-${brandSlug(brand)}`} />
                {brand}
              </button>
            ))}
          </div>

          {/* Model list */}
          <div className="picker-models">
            {models.map(model => {
              const active = selectedModel?.id === model.id
              return (
                <button
                  type="button"
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`picker-model-btn${active ? ' active' : ''}`}
                >
                  <span className="picker-model-name">{model.model}</span>
                  <span className="picker-model-desc">{model.description}</span>
                </button>
              )
            })}
          </div>

          {/* Preview + specs + config */}
          <div className="picker-preview">
            {/* SVG preview */}
            <div className={`picker-preview-svg picker-preview-${deviceType}`}>
              <PreviewSVG
                className="w-full max-w-[260px] drop-shadow-2xl"
                brand={selectedBrand}
                model={selectedModel?.model}
              />
            </div>

            {/* Specs */}
            {selectedModel && (
              <div className="picker-specs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="picker-spec-name">
                      {selectedModel.brand} {selectedModel.model}
                    </p>
                    <p className="picker-spec-desc">{selectedModel.description}</p>
                  </div>
                  <span className="picker-ports-tag">{selectedModel.ports}p</span>
                </div>
                <div className="picker-spec-pills">
                  <span className="picker-spec-pill text-[var(--noc-green)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--noc-green)] shrink-0" />
                    {selectedModel.ports} porta{selectedModel.ports !== 1 ? 's' : ''}
                  </span>
                  <span className="picker-spec-pill text-[var(--noc-cyan)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--noc-cyan)] shrink-0" />
                    {TYPE_LABELS[deviceType]}
                  </span>
                  <span className={`picker-spec-pill brand-txt-${brandSlug(selectedModel.brand)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 brand-dot-${brandSlug(selectedModel.brand)}`} />
                    {selectedModel.brand}
                  </span>
                </div>
              </div>
            )}

            {/* Network config — PC / Server only */}
            {isPC && (
              <PCNetworkPanel
                deviceType={deviceType as 'pc' | 'server'}
                config={pcConfig}
                onChange={setPcConfig}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="picker-footer">
          {isPC && hasValidIpConfig && (
            <div className="picker-footer-info">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--noc-green)] shrink-0" />
              {pcConfig.ip}/{pcConfig.prefixLen}
              {pcConfig.gateway && <span className="text-[var(--noc-tx2)] ml-1">gw {pcConfig.gateway}</span>}
            </div>
          )}
          {isPC && !hasValidIpConfig && (
            <span className="picker-footer-muted">Sem pré-configuração de rede</span>
          )}
          {!isPC && <div />}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="picker-cancel-btn">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedModel}
              className="picker-confirm-btn"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
