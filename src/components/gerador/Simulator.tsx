"use client"

import { useEffect, useRef, useState } from 'react'
import { useBudget } from '../../context/budget-context'
import { computeUnit, fmtBRL } from '../../data/pricebook'

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5v14" />
  </svg>
)

export default function Simulator() {
  const { curCategory: cat, cur: st, addToCart } = useBudget()
  const unit = computeUnit(cat, st)

  // "flash" do preço quando a configuração muda (não na digitação de quantidade).
  const sig = cat.id + '|' + JSON.stringify({ ...st, qty: undefined })
  const prev = useRef(sig)
  const [flashKey, setFlashKey] = useState(0)
  useEffect(() => {
    if (prev.current !== sig) {
      prev.current = sig
      setFlashKey((k) => k + 1)
    }
  }, [sig])

  return (
    <div className="simulator">
      <div className="simulator__info">
        <div className="simulator__price-label">Preço unitário estimado</div>
        <div className="simulator__price flash" key={flashKey}>
          {fmtBRL(unit)} <small>/ un · {st.qty} un</small>
        </div>
        <div className="simulator__desc">{cat.describe(st)}</div>
      </div>
      <button type="button" className="btn btn--primary btn--lg" onClick={addToCart}>
        {PlusIcon}Adicionar
      </button>
    </div>
  )
}
