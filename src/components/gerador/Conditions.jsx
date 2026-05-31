import { useBudget } from '../../context/budget-context.js'

export default function Conditions() {
  const { disc, cond, setDisc, setCond } = useBudget()
  return (
    <div className="panel">
      <div className="panel__title">Condições &amp; desconto</div>
      <div className="col">
        <div className="disc-row">
          <div className="field">
            <label>Desconto adicional</label>
            <input
              className="input"
              type="number"
              min="0"
              value={disc.value}
              onChange={(e) => setDisc({ value: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="toggle-pair">
            <button
              type="button"
              className={disc.type === 'percentage' ? 'active' : undefined}
              onClick={() => setDisc({ type: 'percentage' })}
            >
              %
            </button>
            <button
              type="button"
              className={disc.type === 'fixed' ? 'active' : undefined}
              onClick={() => setDisc({ type: 'fixed' })}
            >
              R$
            </button>
          </div>
        </div>
        <div className="cond-row">
          <span>Prazo de entrega</span>
          <div className="row" style={{ gap: 6 }}>
            <input
              className="input"
              type="number"
              value={cond.delivery}
              onChange={(e) => setCond({ delivery: parseInt(e.target.value, 10) || 0 })}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>dias</span>
          </div>
        </div>
        <div className="cond-row">
          <span>Validade do orçamento</span>
          <div className="row" style={{ gap: 6 }}>
            <input
              className="input"
              type="number"
              value={cond.validity}
              onChange={(e) => setCond({ validity: parseInt(e.target.value, 10) || 0 })}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>dias</span>
          </div>
        </div>
      </div>
    </div>
  )
}
