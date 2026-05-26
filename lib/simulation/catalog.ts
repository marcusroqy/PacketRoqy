import type { DeviceType } from './types'

export interface DeviceModel {
  id: string
  brand: string
  model: string
  type: DeviceType
  description: string
  ports: number
}

export const ROUTER_BRANDS  = ['Cisco', 'Huawei', 'Juniper', 'MikroTik', 'Datacom'] as const
export const SWITCH_BRANDS  = ['Cisco', 'Huawei', 'Juniper', 'MikroTik', 'Datacom'] as const
export const PC_BRANDS      = ['Dell', 'HP', 'Lenovo', 'Apple'] as const
export const SERVER_BRANDS  = ['Dell', 'HP', 'IBM', 'Cisco'] as const

export type Brand =
  | (typeof ROUTER_BRANDS)[number]
  | (typeof PC_BRANDS)[number]
  | (typeof SERVER_BRANDS)[number]

export const BRAND_COLORS: Record<Brand, string> = {
  Cisco:    '#1ba0d7',
  Huawei:   '#cf0a2c',
  Juniper:  '#84bd00',
  MikroTik: '#293780',
  Dell:     '#007DB8',
  HP:       '#0096D6',
  Lenovo:   '#E2231A',
  Apple:    '#555555',
  IBM:      '#1F70C1',
  Datacom:  '#005FAD',
}

export const DEVICE_CATALOG: DeviceModel[] = [
  // ─── Cisco · Routers ─────────────────────────────────────
  { id: 'cisco-r-2911',    brand: 'Cisco', model: 'ISR 2911',        type: 'router', ports: 3,  description: 'Integrated Services Router, 3× GE' },
  { id: 'cisco-r-3945',    brand: 'Cisco', model: 'ISR 3945',        type: 'router', ports: 4,  description: 'High-perf ISR, 4× GE, modular' },
  { id: 'cisco-r-4321',    brand: 'Cisco', model: 'ISR 4321',        type: 'router', ports: 2,  description: 'ISR 4000 series, 2× GE WAN' },
  { id: 'cisco-r-asr1001', brand: 'Cisco', model: 'ASR 1001-X',      type: 'router', ports: 6,  description: 'Aggregation Services Router, 6× GE' },
  { id: 'cisco-r-isr1101', brand: 'Cisco', model: 'ISR 1101',        type: 'router', ports: 4,  description: 'Compact branch router, 4× GE' },

  // ─── Huawei · Routers ────────────────────────────────────
  { id: 'hw-r-ar2220',     brand: 'Huawei', model: 'AR2220',         type: 'router', ports: 3,  description: 'Enterprise router, 3× GE, modular' },
  { id: 'hw-r-ar6140',     brand: 'Huawei', model: 'AR6140',         type: 'router', ports: 4,  description: 'SD-WAN branch router, 4× GE' },
  { id: 'hw-r-ne40e',      brand: 'Huawei', model: 'NE40E-X3',       type: 'router', ports: 6,  description: 'Core router, 6× 10GE' },
  { id: 'hw-r-ne8000',     brand: 'Huawei', model: 'NetEngine 8000', type: 'router', ports: 8,  description: 'Carrier-grade, 8× 100GE' },
  { id: 'hw-r-ar169',      brand: 'Huawei', model: 'AR169',          type: 'router', ports: 2,  description: 'SOHO router, 2× GE, Wi-Fi integrado' },

  // ─── Juniper · Routers ───────────────────────────────────
  { id: 'jnpr-r-mx480',    brand: 'Juniper', model: 'MX480',         type: 'router', ports: 8,  description: 'Universal edge router, 8× 100GE' },
  { id: 'jnpr-r-mx240',    brand: 'Juniper', model: 'MX240',         type: 'router', ports: 4,  description: 'Mid-range MX series, 4× 100GE' },
  { id: 'jnpr-r-srx345',   brand: 'Juniper', model: 'SRX345',        type: 'router', ports: 8,  description: 'Services gateway, 8× GE, firewall' },
  { id: 'jnpr-r-ptx1000',  brand: 'Juniper', model: 'PTX1000',       type: 'router', ports: 6,  description: 'Packet transport router, 6× 100GE' },
  { id: 'jnpr-r-acx710',   brand: 'Juniper', model: 'ACX710',        type: 'router', ports: 4,  description: 'Metro access router, 4× 25GE' },

  // ─── MikroTik · Routers ──────────────────────────────────
  { id: 'mt-r-rb4011',     brand: 'MikroTik', model: 'RB4011iGS+',   type: 'router', ports: 10, description: '10-port GE, SFP+, RouterOS' },
  { id: 'mt-r-ccr1036',    brand: 'MikroTik', model: 'CCR1036-12G',  type: 'router', ports: 12, description: 'Cloud Core Router, 36-core, 12× GE' },
  { id: 'mt-r-ccr2004',    brand: 'MikroTik', model: 'CCR2004-1G',   type: 'router', ports: 4,  description: 'CCR2 series, 4× 25GE SFP28' },
  { id: 'mt-r-hexs',       brand: 'MikroTik', model: 'hEX S',        type: 'router', ports: 5,  description: 'Compacto, 5× GE, SFP, PoE out' },
  { id: 'mt-r-rb3011',     brand: 'MikroTik', model: 'RB3011UiAS',   type: 'router', ports: 10, description: '10-port GE, LCD, rackmount' },

  // ─── Datacom · Routers ───────────────────────────────────
  { id: 'dtc-r-dm460',   brand: 'Datacom', model: 'DM/460-E',       type: 'router', ports: 4,  description: 'Roteador branch enterprise, 4× GE' },
  { id: 'dtc-r-dm890',   brand: 'Datacom', model: 'DM/890-E',       type: 'router', ports: 6,  description: 'Roteador edge enterprise, 6× GE modular' },
  { id: 'dtc-r-dm990',   brand: 'Datacom', model: 'DM/990-E',       type: 'router', ports: 4,  description: 'Roteador core MPLS, 4× 10GE SFP+' },
  { id: 'dtc-r-dm1100',  brand: 'Datacom', model: 'DM/1100-E',      type: 'router', ports: 8,  description: 'Roteador metro carrier, 8× GE + 2× SFP+' },
  { id: 'dtc-r-dm440',   brand: 'Datacom', model: 'DM/440-E',       type: 'router', ports: 2,  description: 'Roteador SOHO compacto, 2× GE, PoE' },

  // ─── Cisco · Switches ────────────────────────────────────
  { id: 'cisco-s-c2960x',  brand: 'Cisco', model: 'Catalyst 2960-X', type: 'switch', ports: 24, description: '24p Layer 2 Gigabit switch' },
  { id: 'cisco-s-c3750x',  brand: 'Cisco', model: 'Catalyst 3750-X', type: 'switch', ports: 24, description: 'Stackable Layer 3, 24× GE' },
  { id: 'cisco-s-c9200',   brand: 'Cisco', model: 'Catalyst 9200',   type: 'switch', ports: 24, description: 'Next-gen enterprise, 24× GE' },
  { id: 'cisco-s-c9300',   brand: 'Cisco', model: 'Catalyst 9300',   type: 'switch', ports: 48, description: 'High-density Layer 3, 48× GE PoE' },
  { id: 'cisco-s-n5596',   brand: 'Cisco', model: 'Nexus 5596',      type: 'switch', ports: 48, description: 'Data center ToR, 48× 10GE SFP+' },

  // ─── Huawei · Switches ───────────────────────────────────
  { id: 'hw-s-s5735',      brand: 'Huawei', model: 'S5735-L',        type: 'switch', ports: 24, description: '24p Layer 3 Gigabit switch' },
  { id: 'hw-s-s6730',      brand: 'Huawei', model: 'S6730-H',        type: 'switch', ports: 24, description: 'High-speed Layer 3, 24× 25GE SFP28' },
  { id: 'hw-s-s5720',      brand: 'Huawei', model: 'S5720-28P',      type: 'switch', ports: 24, description: '24p PoE+ Layer 3 switch' },
  { id: 'hw-s-ce6870',     brand: 'Huawei', model: 'CloudEngine 6870', type: 'switch', ports: 48, description: 'DC fabric switch, 48× 25GE' },
  { id: 'hw-s-s2720',      brand: 'Huawei', model: 'S2720-28TP',     type: 'switch', ports: 24, description: 'Access Layer 2, 24× GE PoE' },

  // ─── Juniper · Switches ──────────────────────────────────
  { id: 'jnpr-s-ex2300',   brand: 'Juniper', model: 'EX2300-24T',    type: 'switch', ports: 24, description: '24p Layer 3, fanless' },
  { id: 'jnpr-s-ex3400',   brand: 'Juniper', model: 'EX3400-24T',    type: 'switch', ports: 24, description: '24p PoE+ Layer 3 switch' },
  { id: 'jnpr-s-ex4300',   brand: 'Juniper', model: 'EX4300-48T',    type: 'switch', ports: 48, description: '48p stackable Layer 3' },
  { id: 'jnpr-s-qfx5100',  brand: 'Juniper', model: 'QFX5100-48S',   type: 'switch', ports: 48, description: 'DC ToR, 48× 10GE SFP+' },
  { id: 'jnpr-s-ex4650',   brand: 'Juniper', model: 'EX4650-48Y',    type: 'switch', ports: 48, description: '48× 25GE + 8× 100GE uplinks' },

  // ─── MikroTik · Switches ─────────────────────────────────
  { id: 'mt-s-crs328',     brand: 'MikroTik', model: 'CRS328-24P',   type: 'switch', ports: 24, description: '24p PoE Layer 3, SwOS/RouterOS' },
  { id: 'mt-s-crs312',     brand: 'MikroTik', model: 'CRS312-4C+8XG', type: 'switch', ports: 12, description: '8× 10GE + 4× SFP+/GE combo' },
  { id: 'mt-s-css326',     brand: 'MikroTik', model: 'CSS326-24G',   type: 'switch', ports: 24, description: '24p GE managed, SwOS' },
  { id: 'mt-s-crs354',     brand: 'MikroTik', model: 'CRS354-48G',   type: 'switch', ports: 48, description: '48p GE + 2× QSFP+, Layer 3' },
  { id: 'mt-s-css610',     brand: 'MikroTik', model: 'CSS610-8G',    type: 'switch', ports: 8,  description: '8p GE + 2× SFP+, compacto' },

  // ─── Datacom · Switches ──────────────────────────────────
  { id: 'dtc-s-dm4270-24', brand: 'Datacom', model: 'DM/4270G-24T', type: 'switch', ports: 24, description: '24p GE Layer 2/3 gerenciável' },
  { id: 'dtc-s-dm4270-48', brand: 'Datacom', model: 'DM/4270G-48T', type: 'switch', ports: 48, description: '48p GE Layer 2/3, 4× SFP+' },
  { id: 'dtc-s-dm7540',    brand: 'Datacom', model: 'DM/7540T',     type: 'switch', ports: 24, description: 'Switch campus Layer 3, 24× GE + 4× SFP+' },
  { id: 'dtc-s-dm3000',    brand: 'Datacom', model: 'DM/3000-24G',  type: 'switch', ports: 24, description: 'Switch acesso Layer 2, 24× GE PoE+' },
  { id: 'dtc-s-dm7054',    brand: 'Datacom', model: 'DM/7054QX',    type: 'switch', ports: 48, description: 'Switch data center, 48× 10GE SFP+' },

  // ─── Dell · PCs ──────────────────────────────────────────
  { id: 'dell-p-lat5540',  brand: 'Dell', model: 'Latitude 5540',    type: 'pc', ports: 1, description: 'Notebook corporativo, 1× GE, Intel i5/i7' },
  { id: 'dell-p-opt7010',  brand: 'Dell', model: 'OptiPlex 7010',    type: 'pc', ports: 1, description: 'Desktop corporativo, 1× GE, Intel Core' },
  { id: 'dell-p-prec3580', brand: 'Dell', model: 'Precision 3580',   type: 'pc', ports: 1, description: 'Workstation móvel, 1× GE, Intel Core i7' },
  { id: 'dell-p-vos3530',  brand: 'Dell', model: 'Vostro 3530',      type: 'pc', ports: 1, description: 'Notebook PME, 1× GE, Intel Core i5' },
  { id: 'dell-p-xps15',    brand: 'Dell', model: 'XPS 15 9530',      type: 'pc', ports: 1, description: 'Premium laptop, 1× GE, Intel Core i9' },

  // ─── HP · PCs ────────────────────────────────────────────
  { id: 'hp-p-eb840',      brand: 'HP', model: 'EliteBook 840 G10',  type: 'pc', ports: 1, description: 'Notebook executivo, 1× GE, Intel Core i7' },
  { id: 'hp-p-pb450',      brand: 'HP', model: 'ProBook 450 G10',    type: 'pc', ports: 1, description: 'Notebook corporativo, 1× GE, Intel Core i5' },
  { id: 'hp-p-ed800',      brand: 'HP', model: 'EliteDesk 800 G9',   type: 'pc', ports: 1, description: 'Desktop corporativo, 1× GE, Intel Core' },
  { id: 'hp-p-zbooks',     brand: 'HP', model: 'ZBook Studio G10',   type: 'pc', ports: 1, description: 'Workstation móvel, 1× GE, Intel Xeon W' },
  { id: 'hp-p-omen16',     brand: 'HP', model: 'OMEN 16',            type: 'pc', ports: 1, description: 'Notebook gamer, 1× GE, Intel Core i9' },

  // ─── Lenovo · PCs ────────────────────────────────────────
  { id: 'lnv-p-x1c',       brand: 'Lenovo', model: 'ThinkPad X1 Carbon', type: 'pc', ports: 1, description: 'Ultrabook premium, 1× GE, Intel Core i7' },
  { id: 'lnv-p-e15',       brand: 'Lenovo', model: 'ThinkPad E15 Gen 4', type: 'pc', ports: 1, description: 'Notebook corporativo, 1× GE, Intel Core i5' },
  { id: 'lnv-p-m70q',      brand: 'Lenovo', model: 'ThinkCentre M70q',   type: 'pc', ports: 1, description: 'Mini desktop, 1× GE, Intel Core i5' },
  { id: 'lnv-p-ic5',       brand: 'Lenovo', model: 'IdeaCentre 5',       type: 'pc', ports: 1, description: 'Desktop doméstico, 1× GE, Intel Core i7' },
  { id: 'lnv-p-legion5',   brand: 'Lenovo', model: 'Legion 5 Pro',       type: 'pc', ports: 1, description: 'Notebook gamer, 1× GE, AMD Ryzen 7' },

  // ─── Apple · PCs ─────────────────────────────────────────
  { id: 'apl-p-mbp14',     brand: 'Apple', model: 'MacBook Pro 14"',  type: 'pc', ports: 1, description: 'Pro laptop, 1× GE via Thunderbolt, M3' },
  { id: 'apl-p-mba',       brand: 'Apple', model: 'MacBook Air M3',   type: 'pc', ports: 1, description: 'Ultralight laptop, 1× GE via USB-C, M3' },
  { id: 'apl-p-mini',      brand: 'Apple', model: 'Mac mini M4',      type: 'pc', ports: 1, description: 'Desktop compacto, 1× GE, M4' },
  { id: 'apl-p-imac',      brand: 'Apple', model: 'iMac 24" M3',      type: 'pc', ports: 1, description: 'All-in-one, 1× GE, M3' },
  { id: 'apl-p-mbp16',     brand: 'Apple', model: 'MacBook Pro 16"',  type: 'pc', ports: 1, description: 'High-perf laptop, 1× GE via Thunderbolt, M3 Max' },

  // ─── Dell · Servers ──────────────────────────────────────
  { id: 'dell-srv-r750',   brand: 'Dell', model: 'PowerEdge R750',   type: 'server', ports: 2, description: '2U rack, 2× 10GE, dual Xeon Scalable' },
  { id: 'dell-srv-r650',   brand: 'Dell', model: 'PowerEdge R650',   type: 'server', ports: 2, description: '1U rack, 2× 10GE, Xeon Scalable' },
  { id: 'dell-srv-t550',   brand: 'Dell', model: 'PowerEdge T550',   type: 'server', ports: 2, description: 'Tower server, 2× GE, Xeon Scalable' },
  { id: 'dell-srv-r250',   brand: 'Dell', model: 'PowerEdge R250',   type: 'server', ports: 2, description: '1U entry rack, 2× GE, Intel Xeon E' },
  { id: 'dell-srv-mx750',  brand: 'Dell', model: 'PowerEdge MX750c', type: 'server', ports: 2, description: 'Blade server, 2× 25GE, Xeon Scalable' },

  // ─── HP · Servers ────────────────────────────────────────
  { id: 'hp-srv-dl380',    brand: 'HP', model: 'ProLiant DL380 Gen11', type: 'server', ports: 2, description: '2U rack, 2× 10GE, dual Xeon Scalable' },
  { id: 'hp-srv-dl360',    brand: 'HP', model: 'ProLiant DL360 Gen11', type: 'server', ports: 2, description: '1U rack, 2× 10GE, Xeon Scalable' },
  { id: 'hp-srv-ml350',    brand: 'HP', model: 'ProLiant ML350 Gen11', type: 'server', ports: 2, description: 'Tower, 2× GE, Xeon Scalable' },
  { id: 'hp-srv-dl20',     brand: 'HP', model: 'ProLiant DL20 Gen11',  type: 'server', ports: 2, description: '1U entry rack, 2× GE, Intel Xeon E' },
  { id: 'hp-srv-bl460',    brand: 'HP', model: 'ProLiant BL460c',      type: 'server', ports: 2, description: 'Blade, 2× 10GE Flex, Xeon Scalable' },

  // ─── IBM · Servers ───────────────────────────────────────
  { id: 'ibm-srv-s1014',   brand: 'IBM', model: 'Power S1014',       type: 'server', ports: 2, description: '2U rack, 2× GE, Power10 (4-core)' },
  { id: 'ibm-srv-s1022',   brand: 'IBM', model: 'Power S1022',       type: 'server', ports: 4, description: '2U rack, 4× GE, Power10 (20-core)' },
  { id: 'ibm-srv-e1050',   brand: 'IBM', model: 'Power E1050',       type: 'server', ports: 4, description: '4U enterprise, 4× 25GE, Power10' },
  { id: 'ibm-srv-flex',    brand: 'IBM', model: 'FlexSystem p460',   type: 'server', ports: 4, description: 'Blade compute, 4× GE, Power7+' },
  { id: 'ibm-srv-pvs',     brand: 'IBM', model: 'Power VS',          type: 'server', ports: 2, description: 'Servidor virtual IBM Cloud, 2× GE' },

  // ─── Cisco · Servers ─────────────────────────────────────
  { id: 'cisco-srv-c220',  brand: 'Cisco', model: 'UCS C220 M6',     type: 'server', ports: 2, description: '1U rack, 2× 10GE, dual Intel Xeon' },
  { id: 'cisco-srv-c240',  brand: 'Cisco', model: 'UCS C240 M6',     type: 'server', ports: 2, description: '2U storage-opt, 2× 10GE, dual Intel Xeon' },
  { id: 'cisco-srv-b200',  brand: 'Cisco', model: 'UCS B200 M6',     type: 'server', ports: 2, description: 'Half-width blade, 2× GE, Intel Xeon' },
  { id: 'cisco-srv-s3260', brand: 'Cisco', model: 'UCS S3260',       type: 'server', ports: 2, description: 'Storage server, 2× 10GE, Intel Xeon' },
  { id: 'cisco-srv-x210c', brand: 'Cisco', model: 'UCS X210c M7',    type: 'server', ports: 2, description: 'Modular compute, 2× 25GE, Intel Xeon' },
]

const BRANDS_BY_TYPE: Record<DeviceType, readonly string[]> = {
  router: ROUTER_BRANDS,
  switch: SWITCH_BRANDS,
  pc:     PC_BRANDS,
  server: SERVER_BRANDS,
}

export function getModelsByType(type: DeviceType): DeviceModel[] {
  return DEVICE_CATALOG.filter(m => m.type === type)
}

export function getBrandsByType(type: DeviceType): string[] {
  return BRANDS_BY_TYPE[type] as string[]
}
