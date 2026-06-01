"use client"

import { motion, useReducedMotion } from 'framer-motion'
import { useBudget } from '../../context/budget-context'
import { BRACKETS, bracketIndex, metaFor, CategoryOption, CategorySelector } from '../../data/pricebook'

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const WarnIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h0" />
  </svg>
)

interface OptionButtonProps {
  catId: string
  sel: CategorySelector
  value: CategoryOption
  selected: boolean
  onClick: () => void
}

function OptionButton({ catId, sel, value, selected, onClick }: OptionButtonProps) {
  const reduced = useReducedMotion()
  const meta = metaFor(catId, sel.key, value.v)
  const modifier = sel.type === 'radio' ? 'radio' : 'checkbox'

  return (
    <motion.button
      type="button"
      className={`btn-option ${modifier}${selected ? ' selected' : ''}`}
      onClick={onClick}
      whileHover={reduced ? {} : { scale: 1.02 }}
      whileTap={reduced ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
    >
      <span className="btn-option__check">{CheckIcon}</span>
      <span className="btn-option__label">{value.label}</span>
      {meta && <span className="btn-option__meta">{meta}</span>}
    </motion.button>
  )
}

export default function Configurator() {
  const { curCategory: cat, cur: st, selectRadio, toggleCheck, setQty, bumpQty } = useBudget()
  const warn = st.qty < 10

  return (
    <div className="panel configurator">
      <div className="config-head">
        <h2>{cat.label}</h2>
        {cat.brackets && (
          <span className="bracket">
            Faixa <b>{BRACKETS[bracketIndex(st.qty)].label}</b> un
          </span>
        )}
      </div>

      {cat.selectors.map((sel: CategorySelector) => (
        <div className="sel-group" key={sel.key}>
          <p className="sel-group__label">
            {sel.label}
            {sel.type === 'check' ? ' · múltipla' : ''}
          </p>

          {sel.type === 'number' ? (
            <div className="dim-input-row">
              <input
                type="number"
                className={sel.max && (st[sel.key] || 0) > sel.max ? 'warn' : ''}
                min={sel.min}
                max={sel.max}
                step={sel.step ?? 0.01}
                value={st[sel.key] ?? ''}
                onChange={(e) => selectRadio(sel.key, parseFloat(e.target.value) || 0)}
              />
              {sel.unit && <span className="dim-input__unit">{sel.unit}</span>}
              {sel.max && (st[sel.key] || 0) > sel.max && (
                <span className="dim-input__warn">{WarnIcon} máx. {sel.max} m</span>
              )}
            </div>
          ) : (
            <div className="opt-grid">
              {sel.options.map((o: CategoryOption) => {
                const selected =
                  sel.type === 'radio' ? st[sel.key] === o.v : (st[sel.key] || []).includes(o.v)
                return (
                  <OptionButton
                    key={o.v}
                    catId={cat.id}
                    sel={sel}
                    value={o}
                    selected={selected}
                    onClick={() =>
                      sel.type === 'radio' ? selectRadio(sel.key, o.v) : toggleCheck(sel.key, o.v)
                    }
                  />
                )
              })}
            </div>
          )}
        </div>
      ))}

      <div className="sel-group">
        <p className="sel-group__label">Quantidade</p>
        <div className="qty-block">
          <div>
            <div className={`qty${warn ? ' warn' : ''}`}>
              <button type="button" data-step="-10" onClick={() => bumpQty(-10)}>
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={st.qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10) || 0)}
              />
              <button type="button" data-step="10" onClick={() => bumpQty(10)}>
                +
              </button>
            </div>
            <div className="qty-warn-text" style={{ visibility: warn ? 'visible' : 'hidden' }}>
              {WarnIcon}
              Abaixo do mínimo sugerido (10)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
