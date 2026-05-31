import { createContext, useContext } from 'react'

/* Contexto comercial isolado dos componentes (mantém o fast-refresh feliz). */
export const BudgetContext = createContext(null)

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget deve ser usado dentro de <BudgetProvider>')
  return ctx
}
