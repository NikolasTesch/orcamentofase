import { createContext, useContext } from 'react'

export interface CartItem {
  uid: string
  catId: string
  kind: string
  desc: string
  qty: number
  unit: number
  snap: any
}

export interface ClientData {
  name: string
  phone: string
  partnership: string
}

export interface DiscountData {
  type: 'percentage' | 'fixed'
  value: number
}

export interface ConditionsData {
  delivery: number
  validity: number
}

export interface TotalsData {
  sub: number
  partnerDisc: number
  add: number
  net: number
  entry: number
  hasAbadaExempt: boolean
}

export interface BudgetContextValue {
  activeCat: string
  config: Record<string, any>
  cur: any
  curCategory: any
  cart: CartItem[]
  client: ClientData
  disc: DiscountData
  cond: ConditionsData
  totals: TotalsData
  partners: string[]
  attachSizes: boolean
  selectedSizeChartId: string
  setActiveCat: (id: string) => void
  selectRadio: (key: string, v: any) => void
  toggleCheck: (key: string, v: any) => void
  setQty: (qty: number) => void
  bumpQty: (delta: number) => void
  addToCart: () => void
  removeFromCart: (uid: string) => void
  setCartQty: (uid: string, qty: number) => void
  bumpCartQty: (uid: string, delta: number) => void
  clearCart: () => void
  setClient: (patch: Partial<ClientData>) => void
  setDisc: (patch: Partial<DiscountData>) => void
  setCond: (patch: Partial<ConditionsData>) => void
  setAttachSizes: (attach: boolean) => void
  setSelectedSizeChartId: (id: string) => void
  partnerInfo: (it: CartItem) => { kind: 'exempt' | 'discount' | 'none'; d: number; short?: string }
  saveBudgetToServer: (status?: 'open' | 'won' | 'lost') => Promise<{ success: boolean; data?: any; error?: string }>
}

/* Contexto comercial isolado dos componentes. */
export const BudgetContext = createContext<BudgetContextValue | null>(null)

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget deve ser usado dentro de <BudgetProvider>')
  return ctx
}
