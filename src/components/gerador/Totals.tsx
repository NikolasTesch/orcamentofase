"use client"

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useBudget } from '../../context/budget-context'
import { fmtBRL } from '../../data/pricebook'

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const XIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
const SaveIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

function AnimatedValue({ value }: { value: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <span className="num">{value}</span>
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className="num"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        style={{ display: 'inline-block' }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

export default function Totals() {
  const { totals, client, cart, saveBudgetToServer, updateBudgetStatus, budgetSaved, budgetSaving, currentBudgetId, savedBudgetNumber } = useBudget()

  const handleSave = async () => {
    if (!cart.length) return
    const res = await saveBudgetToServer('open')
    if (!res.success) alert('Erro ao salvar: ' + res.error)
  }

  const handleMarkWon = async () => {
    if (!currentBudgetId) return
    await updateBudgetStatus(currentBudgetId, 'won')
    alert('Orçamento marcado como Fechado/Ganho!')
  }

  const handleMarkLost = async () => {
    if (!currentBudgetId) return
    await updateBudgetStatus(currentBudgetId, 'lost')
    alert('Orçamento marcado como Perdido.')
  }

  return (
    <div className="totals">
      <div className="totals__row">
        <span>Subtotal bruto</span>
        <AnimatedValue value={fmtBRL(totals.sub)} />
      </div>
      {totals.partnerDisc > 0 && (
        <div className="totals__row totals__row--discount">
          <span>Desconto parceria {client.partnership !== 'Nenhuma' ? `(${client.partnership.split(' ')[0]})` : ''}</span>
          <AnimatedValue value={'− ' + fmtBRL(totals.partnerDisc)} />
        </div>
      )}
      {totals.add > 0 && (
        <div className="totals__row totals__row--discount">
          <span>Desconto adicional</span>
          <AnimatedValue value={'− ' + fmtBRL(totals.add)} />
        </div>
      )}
      <div className="totals__divider" />
      <div className="totals__net">
        <span>Valor líquido</span>
        <AnimatedValue value={fmtBRL(totals.net)} />
      </div>
      <div className="totals__entry">
        <span>Entrada sugerida (50%)</span>
        <AnimatedValue value={fmtBRL(totals.entry)} />
      </div>

      {/* Botão Salvar */}
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          className={`btn btn--primary btn--block${budgetSaving ? ' btn--loading' : ''}`}
          onClick={handleSave}
          disabled={cart.length === 0 || budgetSaving}
          style={{ width: '100%' }}
        >
          {SaveIcon}
          {budgetSaving ? 'Salvando...' : budgetSaved && savedBudgetNumber ? `✓ Orçamento #${savedBudgetNumber} Salvo` : 'Salvar Orçamento'}
        </button>
      </div>

      {/* Ações de status (pós-save) */}
      {budgetSaved && currentBudgetId && (
        <div className="row" style={{ gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ flex: 1, color: '#10b981', borderColor: '#10b981', fontSize: 12 }}
            onClick={handleMarkWon}
          >
            {CheckIcon} Ganho
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ flex: 1, color: '#ef4444', borderColor: '#ef4444', fontSize: 12 }}
            onClick={handleMarkLost}
          >
            {XIcon} Perdido
          </button>
        </div>
      )}
    </div>
  )
}
