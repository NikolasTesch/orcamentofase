/* ============================================================
   FASE ESPORTE — Livro de preços central, regras e schema
   Porta ESM de prices.js (handoff). PRICEBOOK = única fonte de
   números, editável na tela de Tabela de Preços e persistida em
   localStorage. Sem dependência de `window`.
   ============================================================ */

// localStorage removido — fonte única: banco relacional via /api/pricebook e /api/partners

export interface Bracket {
  label: string
  min: number
  max: number
}

export const BRACKETS: Bracket[] = [
  { label: '10–50', min: 10, max: 50 },
  { label: '51–100', min: 51, max: 100 },
  { label: '101–300', min: 101, max: 300 },
  { label: '301–500', min: 301, max: 500 },
  { label: '501+', min: 501, max: Infinity },
]

export const bracketIndex = (q: number): number => (q <= 50 ? 0 : q <= 100 ? 1 : q <= 300 ? 2 : q <= 500 ? 3 : 4)

export interface PartnerRate {
  kit: number
  esportivo: number
  promocional: number
}

// Parcerias carregadas do banco via /api/partners — não hardcoded
let PARTNERS_DB: Record<string, PartnerRate | null> = { Nenhuma: null }

export function updatePartnersFromServer(partners: Array<{
  name: string; kitDiscount: number; sportDiscount: number; promoDiscount: number
}>) {
  PARTNERS_DB = { Nenhuma: null }
  for (const p of partners) {
    PARTNERS_DB[p.name] = { kit: p.kitDiscount, esportivo: p.sportDiscount, promocional: p.promoDiscount }
  }
  subs.forEach((f) => f())
}

export const getPartners = () => PARTNERS_DB
export const getPartnerNames = () => Object.keys(PARTNERS_DB)

// Mantido para compatibilidade retroativa durante migração
export const PARTNERS = PARTNERS_DB

// Abadá é sempre isento de desconto de parceria (regra de evento).
export const partnerDiscount = (partner: string, kind: string): number => {
  if (kind === 'abada') return 0
  const rate = PARTNERS_DB[partner]
  if (!rate) return 0
  return (rate as any)[kind] || 0
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtBRL = (n: number): string => BRL.format(n || 0)
const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o))

/* ---- valores padrão (ajustados) ---- */
export const DEFAULT_PB: Record<string, any> = {
  kit_esportivo: {
    kit: { prata: 128, ouro: 150, prof: 170, escolinha: 133 },
    extras: { nome: 5, colete: 22, goleiro: 10, meiao: 20 },
  },
  camisa_malha: {
    tecMatrix: {
      PP: [44, 41, 38, 36, 34],
      PV: [52, 48, 45, 42, 40],
      DRY: [61, 57, 53, 50, 47],
      PIQUET: [66, 62, 58, 54, 51],
    },
    gola: { polo: 4, redonda: 0, v: 0 },
    extras: { ml: 4, bolso: 5, reflex: 7, nome: 6, lapela: 5 },
  },
  estampa_total: {
    areaMatrix: {
      fc_manga: [86, 80, 74, 69, 65],
      fc: [71, 66, 61, 57, 54],
      frente: [57, 53, 49, 46, 44],
    },
    gola: { redonda: 0, v: 0, polo: 4 },
    tecido: { PP: 0, DRY: 5, CAMB: 9 },
    extras: { nome: 6, sm: -3, mll: 4, mle: 12 },
  },
  camisa_pp: {
    baseRow: [24, 21, 19, 17, 16],
    cor: { branca: 0, cores: 5 },
    config: { fc: 5, pc: 3 },
    area: { lisa: 0, frente: 7, costas: 7, peito: 5 },
    fotos: { ff: 40, ffc: 45 },
  },
  social: {
    peca: { jaleco: 49, calca: 56, mc: 62, ml: 68, blazer: 142 },
    tecido: { Unioffice: 0, Ibiza: 14 },
    extras: { frisos: 7, revel: 6, bordado: 12 },
  },
  tactel_helanca: {
    linha: { Tactel: 0, Helanca: 8 },
    peca: { short: 34, bermuda: 41, calca: 56, jaqueta: 84, agasalho: 129 },
    faixa: { Adulto: 0, Infantil: -9 },
    extras: { stamp: 13, bolso: 6 },
  },
  bandeira: {
    acab: { simples: 50, dupla: 80 },
    tamM2: { p: 0.35, m: 1.5, g: 2.6, gg: 6.0 },
    extras: { haste: 70, base: 90, costura: 22 },
    wind_banner: { bandeira: 160, haste: 70, base: 90 },
    politica: { unitario: 30, minQty: 20, largura: 0.90, altura: 0.70 },
    escanteio: { kitTotal: 40, qtdKit: 4, largura: 0.25, altura: 0.30 },
  },
  abada: { baseRow: [28, 26, 24, 22, 20], tecido: { cacharel: 0, dry: 6 }, extras: { bandana: 5 } },
}

/* ---- estado mutável — fonte única: banco via /api/pricebook ---- */
let PB = clone(DEFAULT_PB)

function deepMerge(base: any, over: any): any {
  for (const k in over) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k])) {
      base[k] = base[k] || {}
      deepMerge(base[k], over[k])
    } else base[k] = over[k]
  }
  return base
}

const subs = new Set<() => void>()

export function subscribe(fn: () => void) {
  subs.add(fn)
  return () => subs.delete(fn)
}

export const getPB = () => PB

export function updatePBFromServer(data: any) {
  if (!data) return
  PB = deepMerge(clone(DEFAULT_PB), data)
  subs.forEach((f) => f())
}


/* ---- acessores usados pelas funções de preço ---- */
const N = (cat: string, g: string, k: string): number => {
  const o = PB[cat]?.[g]
  return o && typeof o[k] === 'number' ? o[k] : 0
}

const M = (cat: string, g: string, k: string, b: number): number => {
  const a = PB[cat]?.[g]?.[k]
  return a ? a[b] || 0 : 0
}

const R = (cat: string, g: string, b: number): number => {
  const a = PB[cat]?.[g]
  return a ? a[b] || 0 : 0
}

const sumC = (cat: string, g: string, arr: string[]): number => (arr || []).reduce((s, v) => s + N(cat, g, v), 0)

/* ---- ícones (path d) das categorias ---- */
const ico = {
  kit: 'M12 3 4 7v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7l-8-4Z',
  malha: 'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z',
  estampa:
    'M13.5 4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM6 10a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm12 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-8 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
  pp: 'M3 11 21 6v12L3 13v-2Zm0 0v6',
  social: 'M6 3h12l-2 4 2 13H6L8 7 6 3Z',
  tactel: 'M8 3h8v6l3 3v9H5v-9l3-3V3Z',
  bandeira: 'M5 3v18M5 4h11l-2 4 2 4H5',
  abada: 'M9 4 4 9l5 11h6l5-11-5-5-3 2-3-2Z',
}

const lbl = (sel: CategorySelector, v: string): string => {
  const o = sel.options.find((o) => o.v === v)
  return o ? o.label : v
}

const checks = (cat: Category, key: string, st: any): string[] => {
  const sel = cat.selectors.find((s) => s.key === key)
  if (!sel) return []
  return (st[key] || []).map((v: string) => lbl(sel, v))
}

export interface CategoryOption {
  v: string
  label: string
}

export interface CategorySelector {
  key: string
  label: string
  type: 'radio' | 'check'
  options: CategoryOption[]
}

export interface Category {
  id: string
  label: string
  icon: string
  kind: 'kit' | 'esportivo' | 'promocional' | 'abada'
  brackets: boolean
  selectors: CategorySelector[]
  defaults: Record<string, any>
  price: (st: any, b: number | null) => number
  describe: (st: any) => string
}

export const CATEGORIES: Category[] = [
  {
    id: 'kit_esportivo',
    label: 'Kit Esportivo',
    icon: ico.kit,
    kind: 'kit',
    brackets: false,
    selectors: [
      {
        key: 'kit',
        label: 'Tipo de kit',
        type: 'radio',
        options: [
          { v: 'prata', label: 'Prata' },
          { v: 'ouro', label: 'Ouro' },
          { v: 'prof', label: 'Profissional' },
          { v: 'escolinha', label: 'Escolinha' },
        ],
      },
      {
        key: 'extras',
        label: 'Adicionais',
        type: 'check',
        options: [
          { v: 'nome', label: 'Nome Individual (+R$5)' },
          { v: 'colete', label: 'Colete' },
          { v: 'goleiro', label: 'Goleiro Manga Longa (+R$10)' },
          { v: 'meiao', label: 'Meia Cano Longo' },
        ],
      },
    ],
    defaults: { kit: 'prata', extras: [] },
    price(st: any) {
      return N(this.id, 'kit', st.kit) + sumC(this.id, 'extras', st.extras)
    },
    describe(st: any) {
      let d = `KIT ${lbl(this.selectors[0], st.kit).toUpperCase()} Fase Esporte (Camisa Dry, Short Dry, Meião 5 fios)`
      const e = checks(this, 'extras', st)
      if (e.length) d += ' + ' + e.join(', ')
      return d
    },
  },
  {
    id: 'camisa_malha',
    label: 'Camisa de Malha',
    icon: ico.malha,
    kind: 'esportivo',
    brackets: true,
    selectors: [
      {
        key: 'gola',
        label: 'Tipo de gola',
        type: 'radio',
        options: [
          { v: 'polo', label: 'Gola Polo' },
          { v: 'redonda', label: 'Redonda' },
          { v: 'v', label: 'Gola V' },
        ],
      },
      {
        key: 'tecido',
        label: 'Tecido',
        type: 'radio',
        options: [
          { v: 'PP', label: 'PP' },
          { v: 'PV', label: 'PV' },
          { v: 'DRY', label: 'DRY' },
          { v: 'PIQUET', label: 'Piquet' },
        ],
      },
      {
        key: 'extras',
        label: 'Opcionais',
        type: 'check',
        options: [
          { v: 'ml', label: 'Manga Longa' },
          { v: 'bolso', label: 'Com Bolso' },
          { v: 'reflex', label: 'Reflex Duplo' },
          { v: 'nome', label: 'Nome Individual' },
          { v: 'lapela', label: 'Lapela Stamp' },
        ],
      },
    ],
    defaults: { gola: 'polo', tecido: 'PV', extras: ['ml'] },
    price(st: any, b: number | null) {
      return M(this.id, 'tecMatrix', st.tecido, b || 0) + N(this.id, 'gola', st.gola) + sumC(this.id, 'extras', st.extras)
    },
    describe(st: any) {
      let d = `CAMISA MALHA - ${lbl(this.selectors[0], st.gola)} - Tecido ${st.tecido}`
      const e = checks(this, 'extras', st)
      if (e.length) d += ' - ' + e.join(' - ')
      return d
    },
  },
  {
    id: 'estampa_total',
    label: 'Estampa Total',
    icon: ico.estampa,
    kind: 'esportivo',
    brackets: true,
    selectors: [
      {
        key: 'area',
        label: 'Área de estampa',
        type: 'radio',
        options: [
          { v: 'fc_manga', label: 'Frente/Costas/Manga' },
          { v: 'fc', label: 'Frente e Costas' },
          { v: 'frente', label: 'Frente' },
        ],
      },
      {
        key: 'gola',
        label: 'Tipo de gola',
        type: 'radio',
        options: [
          { v: 'redonda', label: 'Redonda' },
          { v: 'v', label: 'Gola V' },
          { v: 'polo', label: 'Gola Polo' },
        ],
      },
      {
        key: 'tecido',
        label: 'Tecido',
        type: 'radio',
        options: [
          { v: 'PP', label: 'PP' },
          { v: 'DRY', label: 'DRY' },
          { v: 'CAMB', label: 'Camb.' },
        ],
      },
      {
        key: 'extras',
        label: 'Opcionais',
        type: 'check',
        options: [
          { v: 'nome', label: 'Nome Individual' },
          { v: 'sm', label: 'Sem Manga' },
          { v: 'mll', label: 'Manga Longa Lisa' },
          { v: 'mle', label: 'Manga Longa Estampada' },
        ],
      },
    ],
    defaults: { area: 'fc', gola: 'redonda', tecido: 'DRY', extras: [] },
    price(st: any, b: number | null) {
      return (
        M(this.id, 'areaMatrix', st.area, b || 0) +
        N(this.id, 'gola', st.gola) +
        N(this.id, 'tecido', st.tecido) +
        sumC(this.id, 'extras', st.extras)
      )
    },
    describe(st: any) {
      let d = `CAMISA SUBLIMADA TOTAL - ${lbl(this.selectors[1], st.gola)} - Tecido ${st.tecido} - Estampa ${lbl(this.selectors[0], st.area)}`
      const e = checks(this, 'extras', st)
      if (e.length) d += ' - ' + e.join(' - ')
      return d
    },
  },
  {
    id: 'camisa_pp',
    label: 'Camisa PP',
    icon: ico.pp,
    kind: 'promocional',
    brackets: true,
    selectors: [
      {
        key: 'cor',
        label: 'Cor da camisa',
        type: 'radio',
        options: [
          { v: 'branca', label: 'Branca' },
          { v: 'cores', label: 'Cores' },
        ],
      },
      {
        key: 'config',
        label: 'Configuração',
        type: 'radio',
        options: [
          { v: 'fc', label: 'Frente/Costas' },
          { v: 'pc', label: 'Peito/Costas' },
        ],
      },
      {
        key: 'area',
        label: 'Área da estampa',
        type: 'radio',
        options: [
          { v: 'lisa', label: 'Lisa' },
          { v: 'frente', label: 'Frente' },
          { v: 'costas', label: 'Costas' },
          { v: 'peito', label: 'Peito' },
        ],
      },
      {
        key: 'fotos',
        label: 'Fotos (opcional)',
        type: 'check',
        options: [
          { v: 'ff', label: 'Foto Frente' },
          { v: 'ffc', label: 'Foto Frente e Costas' },
        ],
      },
    ],
    defaults: { cor: 'branca', config: 'pc', area: 'lisa', fotos: [] },
    price(st: any, b: number | null) {
      return (
        R(this.id, 'baseRow', b || 0) +
        N(this.id, 'cor', st.cor) +
        N(this.id, 'config', st.config) +
        N(this.id, 'area', st.area) +
        sumC(this.id, 'fotos', st.fotos)
      )
    },
    describe(st: any) {
      let d = `CAMISA PP PROMOCIONAL ${lbl(this.selectors[0], st.cor)} - Modelo ${lbl(this.selectors[1], st.config)} - Estampa ${lbl(this.selectors[2], st.area)}`
      const e = checks(this, 'fotos', st)
      if (e.length) d += ' - ' + e.join(' - ')
      return d
    },
  },
  {
    id: 'social',
    label: 'Linha Social',
    icon: ico.social,
    kind: 'esportivo',
    brackets: false,
    selectors: [
      {
        key: 'peca',
        label: 'Peça',
        type: 'radio',
        options: [
          { v: 'jaleco', label: 'Jaleco Brim' },
          { v: 'calca', label: 'Calça Brim' },
          { v: 'mc', label: 'Camisa Social MC' },
          { v: 'ml', label: 'Camisa Social ML' },
          { v: 'blazer', label: 'Blazer Two Way' },
        ],
      },
      {
        key: 'tecido',
        label: 'Tecido',
        type: 'radio',
        options: [
          { v: 'Unioffice', label: 'Unioffice' },
          { v: 'Ibiza', label: 'Ibiza' },
        ],
      },
      {
        key: 'extras',
        label: 'Detalhes',
        type: 'check',
        options: [
          { v: 'frisos', label: 'Com Frisos' },
          { v: 'revel', label: 'Revel' },
          { v: 'bordado', label: 'Bordado' },
        ],
      },
    ],
    defaults: { peca: 'mc', tecido: 'Unioffice', extras: [] },
    price(st: any) {
      return N(this.id, 'peca', st.peca) + N(this.id, 'tecido', st.tecido) + sumC(this.id, 'extras', st.extras)
    },
    describe(st: any) {
      let d = `${lbl(this.selectors[0], st.peca)} - Tecido ${st.tecido}`
      const e = checks(this, 'extras', st)
      if (e.length) d += ' + ' + e.join(' + ')
      return d
    },
  },
  {
    id: 'tactel_helanca',
    label: 'Tactel & Helanca',
    icon: ico.tactel,
    kind: 'esportivo',
    brackets: false,
    selectors: [
      {
        key: 'linha',
        label: 'Linha',
        type: 'radio',
        options: [
          { v: 'Tactel', label: 'Tactel' },
          { v: 'Helanca', label: 'Helanca' },
        ],
      },
      {
        key: 'peca',
        label: 'Peça',
        type: 'radio',
        options: [
          { v: 'short', label: 'Short' },
          { v: 'bermuda', label: 'Bermuda' },
          { v: 'calca', label: 'Calça' },
          { v: 'jaqueta', label: 'Jaqueta' },
          { v: 'agasalho', label: 'Agasalho completo' },
        ],
      },
      {
        key: 'faixa',
        label: 'Faixa etária',
        type: 'radio',
        options: [
          { v: 'Adulto', label: 'Adulto' },
          { v: 'Infantil', label: 'Infantil' },
        ],
      },
      {
        key: 'extras',
        label: 'Acabamento',
        type: 'check',
        options: [
          { v: 'stamp', label: 'Estampado/Stamp' },
          { v: 'bolso', label: 'Com Bolso' },
        ],
      },
    ],
    defaults: { linha: 'Tactel', peca: 'bermuda', faixa: 'Adulto', extras: [] },
    price(st: any) {
      return N(this.id, 'peca', st.peca) + N(this.id, 'linha', st.linha) + N(this.id, 'faixa', st.faixa) + sumC(this.id, 'extras', st.extras)
    },
    describe(st: any) {
      let d = `${lbl(this.selectors[1], st.peca)} de ${st.linha} - Linha ${st.faixa}`
      const e = checks(this, 'extras', st)
      if (e.length) d += ' - ' + e.join(' - ')
      return d
    },
  },
  {
    id: 'bandeira',
    label: 'Bandeiras',
    icon: ico.bandeira,
    kind: 'esportivo',
    brackets: false,
    selectors: [
      {
        key: 'acab',
        label: 'Acabamento',
        type: 'radio',
        options: [
          { v: 'simples', label: 'Simples' },
          { v: 'dupla', label: 'Dupla Face' },
        ],
      },
      {
        key: 'tam',
        label: 'Medida',
        type: 'radio',
        options: [
          { v: 'p', label: '0,70 × 0,50 m' },
          { v: 'm', label: '1,50 × 1,00 m' },
          { v: 'g', label: '2,00 × 1,30 m' },
          { v: 'gg', label: '3,00 × 2,00 m' },
        ],
      },
      {
        key: 'extras',
        label: 'Opcionais',
        type: 'check',
        options: [
          { v: 'haste', label: 'Haste' },
          { v: 'base', label: 'Base' },
          { v: 'costura', label: 'Costura reforçada' },
        ],
      },
    ],
    defaults: { acab: 'simples', tam: 'm', extras: [] },
    price(st: any) {
      return N(this.id, 'acab', st.acab) * N(this.id, 'tamM2', st.tam) + sumC(this.id, 'extras', st.extras)
    },
    describe(st: any) {
      let d = `Bandeira Sublimada ${lbl(this.selectors[0], st.acab)} - Medida ${lbl(this.selectors[1], st.tam)}`
      const e = checks(this, 'extras', st)
      if (e.length) d += ' - ' + e.join(', ') + ' inclusos'
      return d
    },
  },
  {
    id: 'abada',
    label: 'Abadás',
    icon: ico.abada,
    kind: 'abada',
    brackets: true,
    selectors: [
      {
        key: 'tecido',
        label: 'Tecido',
        type: 'radio',
        options: [
          { v: 'cacharel', label: 'Cacharel/Pipoca' },
          { v: 'dry', label: 'Dry Fit' },
        ],
      },
      {
        key: 'extras',
        label: 'Acessórios',
        type: 'check',
        options: [{ v: 'bandana', label: 'Com Bandana' }],
      },
    ],
    defaults: { tecido: 'dry', extras: [] },
    price(st: any, b: number | null) {
      return R(this.id, 'baseRow', b || 0) + N(this.id, 'tecido', st.tecido) + sumC(this.id, 'extras', st.extras)
    },
    describe(st: any) {
      let d = `ABADÁ DE EVENTO (Sem Manga) - Tecido ${lbl(this.selectors[0], st.tecido)} - Sublimação Frente e Costas`
      const e = checks(this, 'extras', st)
      if (e.length) d += ' - ' + e.join(' - ')
      return d
    },
  },
]

export const getCat = (id: string) => CATEGORIES.find((c) => c.id === id)

/* preço unitário de um item, considerando faixa de volume quando aplicável */
export const computeUnit = (cat: Category, st: any): number =>
  Math.max(0, cat.price(st, cat.brackets ? bracketIndex(st.qty || 0) : null))

/* ---- meta de exibição no configurador ---- */
export function metaFor(catId: string, key: string, v: string): string {
  const pb = PB[catId]
  if (!pb) return ''
  if ((catId === 'camisa_malha' && key === 'tecido') || (catId === 'estampa_total' && key === 'area')) return 'base'
  if (catId === 'bandeira' && key === 'tam') return (pb.tamM2[v] + '').replace('.', ',') + ' m²'
  if (catId === 'bandeira' && key === 'acab') return 'R$' + pb.acab[v] + '/m²'
  if (pb[key] && typeof pb[key][v] === 'number') {
    const n = pb[key][v]
    if ((catId === 'kit_esportivo' && key === 'kit') || (catId === 'social' && key === 'peca') || (catId === 'tactel_helanca' && key === 'peca'))
      return 'R$' + n
    if (n === 0) return 'base'
    return (n > 0 ? '+R$' : '−R$') + Math.abs(n)
  }
  return ''
}

/* ---- schema para a tela de edição de preços ---- */
const GROUP_TITLE: Record<string, string> = {
  kit: 'Preço por kit',
  tecMatrix: 'Preço base por tecido · por faixa de volume',
  areaMatrix: 'Preço base por área · por faixa de volume',
  baseRow: 'Preço base · por faixa de volume',
  gola: 'Acréscimo por gola',
  tecido: 'Acréscimo por tecido',
  extras: 'Opcionais (acréscimo unit.)',
  cor: 'Cor da camisa',
  config: 'Configuração',
  area: 'Área da estampa',
  fotos: 'Fotos (acréscimo)',
  peca: 'Preço por peça',
  faixa: 'Faixa etária',
  linha: 'Linha',
  acab: 'Acabamento · R$ por m²',
  tamM2: 'Medida · área em m²',
}

const GROUP_SELECTOR: Record<string, string> = { tecMatrix: 'tecido', areaMatrix: 'area', tamM2: 'tam' }

function subLabel(catId: string, group: string, subKey: string): string {
  const cat = getCat(catId)
  if (!cat) return subKey
  const selKey = GROUP_SELECTOR[group] || group
  const sel = cat.selectors.find((s) => s.key === selKey)
  if (sel) {
    const o = sel.options.find((o) => o.v === subKey)
    if (o) return o.label
  }
  return subKey
}

export interface EditSection {
  type: 'row' | 'matrix' | 'list'
  catId: string
  group: string
  title: string
  cols?: string[]
  rows?: { key: string; label: string }[]
  items?: { key: string; label: string }[]
}

export interface EditCategorySchema {
  catId: string
  label: string
  icon: string
  kind: string
  sections: EditSection[]
}

export function editSchema(): EditCategorySchema[] {
  return CATEGORIES.map((cat) => {
    const sections: EditSection[] = []
    const data = PB[cat.id]
    if (data) {
      for (const group in data) {
        const val = data[group]
        const title = GROUP_TITLE[group] || group
        if (Array.isArray(val)) {
          sections.push({ type: 'row', catId: cat.id, group, title, cols: BRACKETS.map((b) => b.label) })
        } else {
          const keys = Object.keys(val)
          if (keys.length > 0 && Array.isArray(val[keys[0]])) {
            sections.push({
              type: 'matrix',
              catId: cat.id,
              group,
              title,
              cols: BRACKETS.map((b) => b.label),
              rows: keys.map((k) => ({ key: k, label: subLabel(cat.id, group, k) })),
            })
          } else {
            sections.push({ type: 'list', catId: cat.id, group, title, items: keys.map((k) => ({ key: k, label: subLabel(cat.id, group, k) })) })
          }
        }
      }
    }
    return { catId: cat.id, label: cat.label, icon: cat.icon, kind: cat.kind, sections }
  })
}

export function setPrice(catId: string, group: string, keyPath: any, value: string) {
  const v = parseFloat(value)
  if (isNaN(v)) return
  const node = PB[catId][group]
  if (!node) return
  if (Array.isArray(node)) node[keyPath] = v // keyPath = bracket index
  else if (Array.isArray(keyPath) && Array.isArray(node[keyPath[0]])) node[keyPath[0]][keyPath[1]] = v // [subKey, bIdx]
  else node[keyPath] = v // keyPath = subKey
}
