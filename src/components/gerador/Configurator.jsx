import { useBudget } from '../../context/budget-context.js'
import { BRACKETS, bracketIndex, metaFor } from '../../data/pricebook.js'

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

function OptionButton({ catId, sel, value, selected, onClick }) {
  const meta = metaFor(catId, sel.key, value.v)
  const modifier = sel.type === 'radio' ? 'radio' : 'checkbox'
  return (
    <button
      type="button"
      className={`btn-option ${modifier}${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <span className="btn-option__check">{CheckIcon}</span>
      <span className="btn-option__label">{value.label}</span>
      {meta && <span className="btn-option__meta">{meta}</span>}
    </button>
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

      {cat.selectors.map((sel) => (
        <div className="sel-group" key={sel.key}>
          <p className="sel-group__label">
            {sel.label}
            {sel.type === 'check' ? ' · múltipla' : ''}
          </p>
          <div className="opt-grid">
            {sel.options.map((o) => {
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
