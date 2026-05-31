"use client"

import { useBudget } from '../../context/budget-context'

export default function Conditions() {
  const { disc, cond, setDisc, setCond, attachSizes, selectedSizeChartId, setAttachSizes, setSelectedSizeChartId } = useBudget()
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

        {/* Size Chart Attachment Selection */}
        <div className="cond-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 4 }}>
          <label className="row" style={{ gap: 10, cursor: 'pointer', userSelect: 'none', width: '100%', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={attachSizes}
              onChange={(e) => setAttachSizes(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--fase-red)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Anexar tabela de tamanhos</span>
          </label>
          {attachSizes && (
            <select
              className="input"
              value={selectedSizeChartId}
              onChange={(e) => setSelectedSizeChartId(e.target.value)}
              style={{ width: '100%', marginTop: 6, height: 38, cursor: 'pointer', padding: '0 10px', fontSize: 13 }}
            >
              <option value="camisa_normal">Camisa Normal - Unissex</option>
              <option value="camisa_infantil">Camisa Infantil - Unissex</option>
              <option value="camisa_social">Camisa Social Masculina</option>
              <option value="calca_normal">Calça Normal - Unissex</option>
              <option value="baby_look">Baby Look - Feminina</option>
            </select>
          )}
        </div>
      </div>
    </div>
  )
}
