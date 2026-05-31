/* ============================================================
   FASE ESPORTE — Livro de grades de tamanhos
   Gerenciamento e persistência das grades de medidas oficiais
   e customizadas, editáveis na interface administrativa.
   ============================================================ */

const SIZES_STORE_KEY = 'fase_sizes_v2'

export interface SizeChart {
  id: string
  label: string
  svgType: 'tshirt' | 'social' | 'pants'
  cols: string[]
  rows: Record<string, string[]> // sizeKey -> array of cell values matching cols order
  obs: string
}

export const DEFAULT_SIZES: Record<string, SizeChart> = {
  camisa_normal: {
    id: 'camisa_normal',
    label: 'Tabela Camisa Normal - Unissex',
    svgType: 'tshirt',
    cols: ['Tamanho', 'Altura', 'Largura'],
    rows: {
      'PP': ['70 cm', '49 cm'],
      'P': ['73 cm', '52 cm'],
      'M': ['74 cm', '55 cm'],
      'G': ['76 cm', '58 cm'],
      'GG': ['79 cm', '61 cm'],
      'XGG': ['83 cm', '64 cm'],
      'XXGG': ['87 cm', '67 cm']
    },
    obs: 'Devido ao processo de fabricação, pode existir uma variação no tamanho das malhas em até 5%.'
  },
  camisa_infantil: {
    id: 'camisa_infantil',
    label: 'Tabela Camisa Infantil - Unissex',
    svgType: 'tshirt',
    cols: ['Tamanho', 'Altura', 'Largura'],
    rows: {
      'PPP': ['47 cm', '34 cm'],
      'PP': ['51 cm', '37 cm'],
      'P': ['54 cm', '40 cm'],
      'M': ['57 cm', '42 cm'],
      'G': ['60 cm', '45 cm']
    },
    obs: 'Devido ao processo de fabricação, pode existir uma variação no tamanho das malhas em até 5%.'
  },
  camisa_social: {
    id: 'camisa_social',
    label: 'Tabela Camisas Social Masculinas',
    svgType: 'social',
    cols: ['Tamanho', 'Altura', 'Largura', 'Braço'],
    rows: {
      'PP': ['67 cm', '49 cm', '62 cm'],
      'P': ['69 cm', '50 cm', '63 cm'],
      'M': ['70 cm', '54 cm', '65 cm'],
      'G': ['72 cm', '58 cm', '67 cm'],
      'GG': ['73 cm', '62 cm', '67 cm'],
      'XGG': ['75 cm', '66 cm', '68 cm'],
      'XXGG': ['77 cm', '69 cm', '68 cm']
    },
    obs: 'Devido ao processo de fabricação, pode existir uma variação no tamanho das malhas em até 5%.'
  },
  calca_normal: {
    id: 'calca_normal',
    label: 'Tabela Calça Normal - Unissex - Com Elástico',
    svgType: 'pants',
    cols: ['Tamanho', 'Nº', 'Altura', 'Largura'],
    rows: {
      'PP': ['34', '94 cm', '38 cm'],
      'P': ['36/38', '96 cm', '40 cm'],
      'M': ['40/42', '99 cm', '42 cm'],
      'G': ['44/46', '102 cm', '44 cm'],
      'GG': ['48/50', '105 cm', '46 cm'],
      'XGG': ['52/54', '108 cm', '48 cm'],
      'XXGG': ['56/58', '112 cm', '50 cm']
    },
    obs: 'Devido ao processo de fabricação, pode existir uma variação no tamanho das malhas em até 5%.'
  },
  baby_look: {
    id: 'baby_look',
    label: 'Tabela Camisa Baby Look - Feminino',
    svgType: 'tshirt',
    cols: ['Tamanho', 'Altura', 'Largura'],
    rows: {
      'PP': ['61 cm', '43 cm'],
      'P': ['63 cm', '46 cm'],
      'M': ['65 cm', '49 cm'],
      'G': ['67 cm', '52 cm'],
      'GG': ['69 cm', '55 cm'],
      'XGG': ['71 cm', '58 cm'],
      'XXGG': ['74 cm', '61 cm']
    },
    obs: 'Devido ao processo de fabricação, pode existir uma variação no tamanho das malhas em até 5%. As camisas Baby Look são em molde feminino, mais acinturadas e com manga mais curta.'
  }
}

// Clone helpers
const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o))

// State variables
let SIZES = loadSizes()
const sizeSubs = new Set<() => void>()

function loadSizes(): Record<string, SizeChart> {
  try {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem(SIZES_STORE_KEY) || 'null')
      if (stored) return deepMerge(clone(DEFAULT_SIZES), stored)
    }
  } catch {
    // Ignore localStorage unavailability
  }
  return clone(DEFAULT_SIZES)
}

function deepMerge(base: any, over: any): any {
  for (const k in over) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k])) {
      base[k] = base[k] || {}
      deepMerge(base[k], over[k])
    } else {
      base[k] = over[k]
    }
  }
  return base
}

export function saveSizes() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIZES_STORE_KEY, JSON.stringify(SIZES))
    }
  } catch {
    // Ignore
  }
  sizeSubs.forEach((fn) => fn())
}

export function resetSizes() {
  SIZES = clone(DEFAULT_SIZES)
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SIZES_STORE_KEY)
    }
  } catch {
    // Ignore
  }
  sizeSubs.forEach((fn) => fn())
}

export function getSizes(): Record<string, SizeChart> {
  return SIZES
}

export function setSizeValue(chartId: string, sizeKey: string, cellIndex: number, value: string) {
  const chart = SIZES[chartId]
  if (!chart || !chart.rows[sizeKey]) return
  chart.rows[sizeKey][cellIndex] = value
}

export function setSizeObs(chartId: string, obs: string) {
  const chart = SIZES[chartId]
  if (!chart) return
  chart.obs = obs
}

export function updateSizesFromServer(data: any) {
  if (!data) return
  SIZES = deepMerge(clone(DEFAULT_SIZES), data)
  sizeSubs.forEach((fn) => fn())
}

export function subscribeSizes(fn: () => void) {
  sizeSubs.add(fn)
  return () => sizeSubs.delete(fn)
}
