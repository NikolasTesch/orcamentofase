"use client"

import { useCallback, useMemo, useState, useEffect, ReactNode } from 'react'
import {
  BudgetContext,
  CartItem,
  ClientData,
  DiscountData,
  ConditionsData,
  BudgetContextValue,
} from './budget-context'
import {
  CATEGORIES,
  getCat,
  computeUnit,
  partnerDiscount,
  updatePBFromServer,
  updatePartnersFromServer,
  getPartnerNames,
} from '../data/pricebook'
import { updateSizesFromServer } from '../data/sizes'
import { DEFAULT_SETTINGS } from '../lib/settings'
import type { AppSettings } from '../lib/settings'

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o))
const uid = () => Date.now() + '' + Math.random().toString(36).slice(2, 6)

// Config inicial por categoria: quantidade-base depende de haver faixa de volume.
function initialConfig() {
  const cfg: Record<string, any> = {}
  CATEGORIES.forEach((c) => {
    cfg[c.id] = Object.assign({ qty: c.brackets ? 100 : 12 }, clone(c.defaults))
  })
  return cfg
}

interface BudgetProviderProps {
  children: ReactNode
}

/**
 * Provedor comercial central.
 * Mantém configuração por categoria, carrinho, cliente, desconto e condições,
 * e expõe os totais calculados em tempo real.
 */
export function BudgetProvider({ children }: BudgetProviderProps) {
  const [activeCat, setActiveCat] = useState<string>(CATEGORIES[0].id)
  const [config, setConfig] = useState<Record<string, any>>(initialConfig)
  const [cart, setCart] = useState<CartItem[]>([])
  const [client, setClient] = useState<ClientData>({ name: '', phone: '', partnership: 'Nenhuma' })
  const [disc, setDisc] = useState<DiscountData>({ type: 'percentage', value: 0 })
  const [cond, setCond] = useState<ConditionsData>({ delivery: 30, validity: 7 })
  const [attachSizes, setAttachSizes] = useState<boolean>(false)
  const [selectedSizeChartIds, setSelectedSizeChartIds] = useState<string[]>([])
  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [savedBudgetNumber, setSavedBudgetNumber] = useState<number | null>(null)
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null)
  const [budgetSaved, setBudgetSaved] = useState(false)
  const [budgetSaving, setBudgetSaving] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetch('/api/partners')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) updatePartnersFromServer(res.data) })
      .catch((err) => console.error('Error fetching partners:', err))

    fetch('/api/pricebook')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) updatePBFromServer(res.data) })
      .catch((err) => console.error('Error fetching pricebook:', err))

    fetch('/api/sizes')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) updateSizesFromServer(res.data) })
      .catch((err) => console.error('Error fetching sizes:', err))

    fetch('/api/settings')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) setSettings({ ...DEFAULT_SETTINGS, ...res.data }) })
      .catch((err) => console.error('Error fetching settings:', err))
  }, [])

  const cur = config[activeCat]
  const curCategory = getCat(activeCat)

  /* ---------- edição da configuração da categoria ativa ---------- */
  const selectRadio = useCallback(
    (key: string, v: any) => setConfig((c) => ({
      ...c,
      [activeCat]: { ...c[activeCat], [key]: c[activeCat][key] === v ? null : v },
    })),
    [activeCat],
  )
  const toggleCheck = useCallback(
    (key: string, v: any) =>
      setConfig((c) => {
        const arr = c[activeCat][key] || []
        const next = arr.includes(v) ? arr.filter((x: any) => x !== v) : [...arr, v]
        return { ...c, [activeCat]: { ...c[activeCat], [key]: next } }
      }),
    [activeCat],
  )
  const setQty = useCallback(
    (qty: number) =>
      setConfig((c) => ({ ...c, [activeCat]: { ...c[activeCat], qty: Math.max(0, qty || 0) } })),
    [activeCat],
  )
  const bumpQty = useCallback(
    (delta: number) =>
      setConfig((c) => ({
        ...c,
        [activeCat]: { ...c[activeCat], qty: Math.max(0, (c[activeCat].qty || 0) + delta) },
      })),
    [activeCat],
  )

  /* ---------- carrinho ---------- */
  const addToCart = useCallback(() => {
    const cat = getCat(activeCat)
    if (!cat) return
    const st = config[activeCat]
    if (!st.qty) return
    const unitPrice = computeUnit(cat, st)
    const discPct = partnerDiscount(client.partnership, cat.kind)
    const netUnitPrice = unitPrice * (1 - discPct / 100)
    setCart((list) => [
      ...list,
      {
        uid: uid(),
        catId: cat.id,
        kind: cat.kind,
        desc: cat.describe(st),
        qty: st.qty,
        unit: unitPrice,
        snap: clone(st),
        partnerDiscountPct: discPct,
        netUnit: netUnitPrice,
      },
    ])
  }, [activeCat, config, client.partnership])

  const removeFromCart = useCallback((id: string) => setCart((l) => l.filter((it) => it.uid !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])

  const setCartQty = useCallback((id: string, qty: number) => {
    setCart((l) =>
      l.map((it) => {
        if (it.uid !== id) return it
        const q = Math.max(1, qty || 1)
        const cat = getCat(it.catId)
        if (!cat) return it
        const snap = { ...it.snap, qty: q }
        const unit = cat.brackets ? computeUnit(cat, snap) : it.unit
        const netUnit = unit * (1 - it.partnerDiscountPct / 100)
        return { ...it, qty: q, snap, unit, netUnit }
      }),
    )
  }, [])

  const bumpCartQty = useCallback(
    (id: string, delta: number) =>
      setCart((l) => {
        const it = l.find((x) => x.uid === id)
        if (!it) return l
        const q = Math.max(1, it.qty + delta)
        const cat = getCat(it.catId)
        if (!cat) return l
        const snap = { ...it.snap, qty: q }
        const unit = cat.brackets ? computeUnit(cat, snap) : it.unit
        const netUnit = unit * (1 - it.partnerDiscountPct / 100)
        return l.map((x) => (x.uid === id ? { ...x, qty: q, snap, unit, netUnit } : x))
      }),
    [],
  )

  /* ---------- desconto de parceria por item ---------- */
  const partnerInfo = useCallback(
    (it: CartItem): { kind: 'exempt' | 'discount' | 'none'; d: number; short?: string } => {
      const d = partnerDiscount(client.partnership, it.kind)
      if (client.partnership !== 'Nenhuma' && it.kind === 'abada') return { kind: 'exempt', d: 0 }
      if (d > 0) return { kind: 'discount', d, short: client.partnership.split(' ')[0] }
      return { kind: 'none', d: 0 }
    },
    [client.partnership],
  )

  /* ---------- totais ---------- */
  const totals = useMemo(() => {
    let sub = 0
    let partnerDisc = 0
    let hasAbadaExempt = false
    cart.forEach((it) => {
      const line = it.unit * it.qty
      sub += line
      const d = partnerDiscount(client.partnership, it.kind)
      partnerDisc += (line * d) / 100
      if (client.partnership !== 'Nenhuma' && it.kind === 'abada') hasAbadaExempt = true
    })
    const afterPartner = sub - partnerDisc
    let add = 0
    if (disc.type === 'percentage') add = afterPartner * (Math.min(100, disc.value) / 100)
    else add = Math.min(disc.value, afterPartner)
    const net = Math.max(0, afterPartner - add)
    const entry = net * 0.5
    return { sub, partnerDisc, add, net, entry, hasAbadaExempt }
  }, [cart, client.partnership, disc])

  const saveBudgetToServer = useCallback(
    async (status: 'open' | 'won' | 'lost' = 'open') => {
      setBudgetSaving(true)
      try {
        const url = currentBudgetId ? `/api/budgets/${currentBudgetId}` : '/api/budgets'
        const method = currentBudgetId ? 'PATCH' : 'POST'
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: client.name || 'Cliente sem nome',
            clientPhone: client.phone || '',
            clientPartnership: client.partnership,
            delivery: cond.delivery,
            validity: cond.validity,
            notes: notes || null,
            subtotal: totals.sub,
            partnerDiscount: totals.partnerDisc,
            discountType: disc.type,
            discountValue: disc.value,
            additionalDiscount: totals.add,
            netTotal: totals.net,
            entryValue: totals.entry,
            attachSizes,
            selectedSizeChartIds,
            status,
            items: cart.map((it) => ({
              catId: it.catId,
              kind: it.kind,
              desc: it.desc,
              qty: it.qty,
              unit: it.unit,
              total: it.unit * it.qty,
              partnerDiscount: it.partnerDiscountPct,
              netUnit: it.netUnit,
              netTotal: it.netUnit * it.qty,
              snap: it.snap,
            })),
          }),
        })
        const res = await response.json()
        if (res.success) {
          if (res.data?.id) setCurrentBudgetId(res.data.id)
          if (res.data?.number) setSavedBudgetNumber(res.data.number)
          setBudgetSaved(true)
          return { success: true, data: res.data }
        }
        return { success: false, error: res.error || 'Falha ao salvar orçamento' }
      } catch (error: any) {
        return { success: false, error: error.message || 'Erro de conexão' }
      } finally {
        setBudgetSaving(false)
      }
    },
    [client, cond, totals, cart, disc, attachSizes, selectedSizeChartIds, notes, currentBudgetId],
  )

  const updateBudgetStatus = useCallback(async (id: string, status: 'open' | 'won' | 'lost', statusNotes?: string) => {
    await fetch(`/api/budgets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, statusNotes }),
    })
  }, [])

  const clearBudget = useCallback(() => {
    setCart([])
    setClient({ name: '', phone: '', partnership: 'Nenhuma' })
    setDisc({ type: 'percentage', value: 0 })
    setCond({ delivery: 30, validity: 7 })
    setAttachSizes(false)
    setSelectedSizeChartIds([])
    setAttachedImages([])
    setNotes('')
    setCurrentBudgetId(null)
    setBudgetSaved(false)
    setSavedBudgetNumber(null)
    setConfig(initialConfig())
  }, [])

  // Auto-detect relevant size charts when cart changes
  useEffect(() => {
    if (cart.length === 0) return

    const ids = new Set<string>()

    if (cart.some(it => it.catId === 'social')) ids.add('camisa_social')

    if (cart.some(it =>
      it.catId === 'tactel_helanca' && (it.snap.peca === 'calca' || it.snap.peca === 'short' || it.snap.peca === 'bermuda')
    )) ids.add('calca_normal')

    if (cart.some(it => it.snap.faixa === 'Infantil' || it.desc.toLowerCase().includes('infantil')))
      ids.add('camisa_infantil')

    if (cart.some(it => it.desc.toLowerCase().includes('baby look') || it.desc.toLowerCase().includes('feminino')))
      ids.add('baby_look')

    if (cart.some(it => ['kit_esportivo', 'camisa_malha', 'estampa_total', 'abada', 'camisa_pp'].includes(it.catId)))
      ids.add('camisa_normal')

    if (ids.size > 0) setSelectedSizeChartIds(Array.from(ids))
  }, [cart])

  const value: BudgetContextValue = {
    activeCat,
    config,
    cur,
    curCategory,
    cart,
    client,
    disc,
    cond,
    totals,
    partners: getPartnerNames(),
    attachSizes,
    selectedSizeChartIds,
    attachedImages,
    settings,
    savedBudgetNumber,
    currentBudgetId,
    budgetSaved,
    budgetSaving,
    notes,
    setActiveCat,
    selectRadio,
    toggleCheck,
    setQty,
    bumpQty,
    addToCart,
    removeFromCart,
    setCartQty,
    bumpCartQty,
    clearCart,
    setClient: (patch) => setClient((c) => ({ ...c, ...patch })),
    setDisc: (patch) => setDisc((d) => ({ ...d, ...patch })),
    setCond: (patch) => setCond((c) => ({ ...c, ...patch })),
    setAttachSizes,
    setSelectedSizeChartIds,
    setAttachedImages,
    partnerInfo,
    saveBudgetToServer,
    updateBudgetStatus,
    clearBudget,
    setNotes,
  }

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}
