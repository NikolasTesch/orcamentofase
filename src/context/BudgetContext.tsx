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
  PARTNERS,
  updatePBFromServer,
} from '../data/pricebook'
import { updateSizesFromServer } from '../data/sizes'

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
  const [selectedSizeChartId, setSelectedSizeChartId] = useState<string>('camisa_normal')

  useEffect(() => {
    // Sincroniza pricebook
    fetch('/api/pricebook')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          updatePBFromServer(res.data)
        }
      })
      .catch((err) => console.error('Error fetching pricebook:', err))

    // Sincroniza tamanhos (sizes)
    fetch('/api/sizes')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          updateSizesFromServer(res.data)
        }
      })
      .catch((err) => console.error('Error fetching sizes:', err))
  }, [])

  const cur = config[activeCat]
  const curCategory = getCat(activeCat)

  /* ---------- edição da configuração da categoria ativa ---------- */
  const selectRadio = useCallback(
    (key: string, v: any) => setConfig((c) => ({ ...c, [activeCat]: { ...c[activeCat], [key]: v } })),
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
    setCart((list) => [
      ...list,
      {
        uid: uid(),
        catId: cat.id,
        kind: cat.kind,
        desc: cat.describe(st),
        qty: st.qty,
        unit: computeUnit(cat, st),
        snap: clone(st),
      },
    ])
  }, [activeCat, config])

  const removeFromCart = useCallback((id: string) => setCart((l) => l.filter((it) => it.uid !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])

  // Re-precifica itens com faixa de volume ao mudar a quantidade.
  const setCartQty = useCallback((id: string, qty: number) => {
    setCart((l) =>
      l.map((it) => {
        if (it.uid !== id) return it
        const q = Math.max(1, qty || 1)
        const cat = getCat(it.catId)
        if (!cat) return it
        const snap = { ...it.snap, qty: q }
        const unit = cat.brackets ? computeUnit(cat, snap) : it.unit
        return { ...it, qty: q, snap, unit }
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
        return l.map((x) => (x.uid === id ? { ...x, qty: q, snap, unit } : x))
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
      try {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: client.name || 'Cliente sem nome',
            clientPhone: client.phone || '',
            clientPartnership: client.partnership,
            delivery: cond.delivery,
            validity: cond.validity,
            subtotal: totals.sub,
            partnerDiscount: totals.partnerDisc,
            additionalDiscount: totals.add,
            netTotal: totals.net,
            entryValue: totals.entry,
            status,
            items: cart.map((it) => ({
              catId: it.catId,
              kind: it.kind,
              desc: it.desc,
              qty: it.qty,
              unit: it.unit,
              snap: it.snap,
            })),
          }),
        })

        const res = await response.json()
        if (res.success) {
          return { success: true, data: res.data }
        } else {
          return { success: false, error: res.error || 'Failed to save budget' }
        }
      } catch (error: any) {
        console.error('Error saving budget to server:', error)
        return { success: false, error: error.message || 'Error connecting to server' }
      }
    },
    [client, cond, totals, cart],
  )

  // Auto-detect best match size chart when cart changes
  useEffect(() => {
    if (cart.length === 0) return

    // Detect first item that has specific category
    const socialItem = cart.find(it => it.catId === 'social')
    if (socialItem) {
      setSelectedSizeChartId('camisa_social')
      return
    }

    const pantsItem = cart.find(it => 
      it.catId === 'tactel_helanca' && (it.snap.peca === 'calca' || it.snap.peca === 'short' || it.snap.peca === 'bermuda')
    )
    if (pantsItem) {
      setSelectedSizeChartId('calca_normal')
      return
    }

    const infantilItem = cart.find(it => 
      it.snap.faixa === 'Infantil' || it.desc.toLowerCase().includes('infantil')
    )
    if (infantilItem) {
      setSelectedSizeChartId('camisa_infantil')
      return
    }

    const babyLookItem = cart.find(it => 
      it.desc.toLowerCase().includes('baby look') || it.desc.toLowerCase().includes('feminino')
    )
    if (babyLookItem) {
      setSelectedSizeChartId('baby_look')
      return
    }

    const shirtItem = cart.find(it => 
      ['kit_esportivo', 'camisa_malha', 'estampa_total', 'abada', 'camisa_pp'].includes(it.catId)
    )
    if (shirtItem) {
      setSelectedSizeChartId('camisa_normal')
    }
  }, [cart])

  const value: BudgetContextValue = {
    // estado
    activeCat,
    config,
    cur,
    curCategory,
    cart,
    client,
    disc,
    cond,
    totals,
    partners: Object.keys(PARTNERS),
    attachSizes,
    selectedSizeChartId,
    // ações de configuração
    setActiveCat,
    selectRadio,
    toggleCheck,
    setQty,
    bumpQty,
    // ações de carrinho
    addToCart,
    removeFromCart,
    setCartQty,
    bumpCartQty,
    clearCart,
    // formulário
    setClient: (patch) => setClient((c) => ({ ...c, ...patch })),
    setDisc: (patch) => setDisc((d) => ({ ...d, ...patch })),
    setCond: (patch) => setCond((c) => ({ ...c, ...patch })),
    setAttachSizes,
    setSelectedSizeChartId,
    // helpers
    partnerInfo,
    saveBudgetToServer,
  }

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}
