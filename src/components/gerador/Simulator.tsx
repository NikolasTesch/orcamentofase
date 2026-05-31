"use client"

import { useEffect, useRef, useState } from 'react'
import { useBudget } from '../../context/budget-context'
import { computeUnit, fmtBRL, BRACKETS, bracketIndex, partnerDiscount } from '../../data/pricebook'

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5v14" />
  </svg>
)

export default function Simulator() {
  const { curCategory: cat, cur: st, addToCart, client } = useBudget()
  const unit = computeUnit(cat, st)

  const sig = cat.id + '|' + JSON.stringify({ ...st, qty: undefined })
  const prev = useRef(sig)
  const [flashKey, setFlashKey] = useState(0)
  useEffect(() => {
    if (prev.current !== sig) {
      prev.current = sig
      setFlashKey((k) => k + 1)
    }
  }, [sig])

  // Bracket pill — faixa de volume ativa
  const qty = st.qty || 0
  const bIdx = cat.brackets ? bracketIndex(qty) : -1
  const bLabel = bIdx >= 0 ? BRACKETS[bIdx]?.label : null
  const isWarning = cat.brackets && qty < 10

  // Preço líquido com desconto de parceria (abadá é sempre isento)
  const discPct = client.partnership !== 'Nenhuma' ? partnerDiscount(client.partnership, cat.kind) : 0
  const netUnit = unit * (1 - discPct / 100)
  const hasDiscount = discPct > 0

  return (
    <div className="simulator">
      <div className="simulator__info">
        <div className="simulator__price-label">Preço unitário estimado</div>

        {cat.brackets && (
          <div className={`bracket-pill${isWarning ? ' bracket-pill--warn' : ''}`}>
            {isWarning ? '⚠ Mínimo: 10 un.' : `Faixa ${bLabel} un.`}
          </div>
        )}

        <div className="simulator__price flash" key={flashKey}>
          {hasDiscount ? (
            <span className="sim-price__group">
              <span className="sim-price__original">{fmtBRL(unit)}</span>
              <span className="sim-price__net">{fmtBRL(netUnit)}</span>
              <span className="sim-price__disc">−{discPct}%</span>
            </span>
          ) : (
            <>{fmtBRL(unit)} <small>/ un · {qty} un</small></>
          )}
        </div>

        <div className="simulator__desc">{cat.describe(st)}</div>
      </div>
      <button type="button" className="btn btn--primary btn--lg" onClick={addToCart}>
        {PlusIcon}Adicionar
      </button>
    </div>
  )
}
