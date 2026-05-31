"use client"

import { useBudget } from '../../context/budget-context'
import { fmtBRL } from '../../data/pricebook'

export default function Totals() {
  const { totals } = useBudget()
  return (
    <div className="totals">
      <div className="totals__row">
        <span>Subtotal bruto</span>
        <span className="num">{fmtBRL(totals.sub)}</span>
      </div>
      <div className="totals__row totals__row--discount">
        <span>Desconto de parceria</span>
        <span className="num">{(totals.partnerDisc > 0 ? '− ' : '') + fmtBRL(totals.partnerDisc)}</span>
      </div>
      <div className="totals__row totals__row--discount">
        <span>Desconto adicional</span>
        <span className="num">{(totals.add > 0 ? '− ' : '') + fmtBRL(totals.add)}</span>
      </div>
      <div className="totals__divider" />
      <div className="totals__net">
        <span>Valor líquido</span>
        <span className="num">{fmtBRL(totals.net)}</span>
      </div>
      <div className="totals__entry">
        <span>Entrada sugerida (50%)</span>
        <span className="num">{fmtBRL(totals.entry)}</span>
      </div>
    </div>
  )
}
