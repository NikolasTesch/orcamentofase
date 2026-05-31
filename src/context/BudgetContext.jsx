import { useCallback, useMemo, useState } from 'react'
import { BudgetContext } from './budget-context.js'
import {
  CATEGORIES,
  getCat,
  computeUnit,
  partnerDiscount,
  PARTNERS,
} from '../data/pricebook.js'

const clone = (o) => JSON.parse(JSON.stringify(o))
const uid = () => Date.now() + '' + Math.random().toString(36).slice(2, 6)

// Config inicial por categoria: quantidade-base depende de haver faixa de volume.
function initialConfig() {
  const cfg = {}
  CATEGORIES.forEach((c) => {
    cfg[c.id] = Object.assign({ qty: c.brackets ? 100 : 12 }, clone(c.defaults))
  })
  return cfg
}

/**
 * Provedor comercial central (porta app.js → React).
 * Mantém configuração por categoria, carrinho, cliente, desconto e condições,
 * e expõe os totais calculados em tempo real.
 */
export function BudgetProvider({ children }) {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id)
  const [config, setConfig] = useState(initialConfig)
  const [cart, setCart] = useState([])
  const [client, setClient] = useState({ name: '', phone: '', partnership: 'Nenhuma' })
  const [disc, setDisc] = useState({ type: 'percentage', value: 0 })
  const [cond, setCond] = useState({ delivery: 30, validity: 7 })

  const cur = config[activeCat]
  const curCategory = getCat(activeCat)

  /* ---------- edição da configuração da categoria ativa ---------- */
  const selectRadio = useCallback(
    (key, v) => setConfig((c) => ({ ...c, [activeCat]: { ...c[activeCat], [key]: v } })),
    [activeCat],
  )
  const toggleCheck = useCallback(
    (key, v) =>
      setConfig((c) => {
        const arr = c[activeCat][key] || []
        const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
        return { ...c, [activeCat]: { ...c[activeCat], [key]: next } }
      }),
    [activeCat],
  )
  const setQty = useCallback(
    (qty) =>
      setConfig((c) => ({ ...c, [activeCat]: { ...c[activeCat], qty: Math.max(0, qty || 0) } })),
    [activeCat],
  )
  const bumpQty = useCallback(
    (delta) =>
      setConfig((c) => ({
        ...c,
        [activeCat]: { ...c[activeCat], qty: Math.max(0, (c[activeCat].qty || 0) + delta) },
      })),
    [activeCat],
  )

  /* ---------- carrinho ---------- */
  const addToCart = useCallback(() => {
    const cat = getCat(activeCat)
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

  const removeFromCart = useCallback((id) => setCart((l) => l.filter((it) => it.uid !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])

  // Re-precifica itens com faixa de volume ao mudar a quantidade.
  const setCartQty = useCallback((id, qty) => {
    setCart((l) =>
      l.map((it) => {
        if (it.uid !== id) return it
        const q = Math.max(1, qty || 1)
        const cat = getCat(it.catId)
        const snap = { ...it.snap, qty: q }
        const unit = cat.brackets ? computeUnit(cat, snap) : it.unit
        return { ...it, qty: q, snap, unit }
      }),
    )
  }, [])
  const bumpCartQty = useCallback(
    (id, delta) => setCart((l) => {
      const it = l.find((x) => x.uid === id)
      if (!it) return l
      const q = Math.max(1, it.qty + delta)
      const cat = getCat(it.catId)
      const snap = { ...it.snap, qty: q }
      const unit = cat.brackets ? computeUnit(cat, snap) : it.unit
      return l.map((x) => (x.uid === id ? { ...x, qty: q, snap, unit } : x))
    }),
    [],
  )

  /* ---------- desconto de parceria por item ---------- */
  const partnerInfo = useCallback(
    (it) => {
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

  const value = {
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
    // helpers
    partnerInfo,
  }

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}
