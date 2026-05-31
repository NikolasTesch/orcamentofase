"use client"

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useBudget } from '../../context/budget-context'
import { fmtBRL } from '../../data/pricebook'

/* Valor numérico com fade suave quando muda. */
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
  const { totals } = useBudget()
  return (
    <div className="totals">
      <div className="totals__row">
        <span>Subtotal bruto</span>
        <AnimatedValue value={fmtBRL(totals.sub)} />
      </div>
      <div className="totals__row totals__row--discount">
        <span>Desconto de parceria</span>
        <AnimatedValue value={(totals.partnerDisc > 0 ? '− ' : '') + fmtBRL(totals.partnerDisc)} />
      </div>
      <div className="totals__row totals__row--discount">
        <span>Desconto adicional</span>
        <AnimatedValue value={(totals.add > 0 ? '− ' : '') + fmtBRL(totals.add)} />
      </div>
      <div className="totals__divider" />
      <div className="totals__net">
        <span>Valor líquido</span>
        <AnimatedValue value={fmtBRL(totals.net)} />
      </div>
      <div className="totals__entry">
        <span>Entrada sugerida (50%)</span>
        <AnimatedValue value={fmtBRL(totals.entry)} />
      </div>
    </div>
  )
}
