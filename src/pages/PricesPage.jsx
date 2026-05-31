import { useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from '../components/app/AppHeader.jsx'
import { editSchema, getPB, setPrice, savePB, resetPB } from '../data/pricebook.js'

const KIND_LABEL = {
  kit: 'Kit',
  esportivo: 'Esportivo',
  promocional: 'Promocional',
  abada: 'Abadá · isento de parceria',
}
const num = (n) => (Number.isInteger(n) ? n : (n + '').replace('.', ','))

function NumCell({ group, defaultValue, onChange }) {
  const pre = group === 'tamM2' ? '' : 'R$'
  return (
    <div className="pe-num">
      {pre && <span className="pre">{pre}</span>}
      <input
        className="pe-input"
        type="text"
        inputMode="decimal"
        defaultValue={num(defaultValue)}
        onChange={(e) => {
          e.target.classList.add('changed')
          onChange(e.target.value.replace(',', '.'))
        }}
      />
    </div>
  )
}

export default function PricesPage() {
  const [rev, setRev] = useState(0) // re-monta inputs após restaurar padrão
  const schema = useMemo(() => editSchema(), [rev])
  const [active, setActive] = useState(schema[0].catId)
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState({ show: false, text: 'Alterações salvas' })
  const detailRef = useRef(null)

  useEffect(() => {
    if (!dirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const cat = schema.find((c) => c.catId === active)
  const pb = getPB()[cat.catId]

  const touch = (catId, group, path, value) => {
    setPrice(catId, group, path, value)
    setDirty(true)
  }
  const flashToast = (text) => {
    setToast({ show: true, text })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 1900)
  }
  const onSave = () => {
    savePB()
    setDirty(false)
    detailRef.current?.querySelectorAll('.pe-input.changed').forEach((i) => i.classList.remove('changed'))
    flashToast('Alterações salvas')
  }
  const onReset = () => {
    if (!window.confirm('Restaurar todos os preços para o padrão da fábrica? As alterações salvas serão perdidas.')) return
    resetPB()
    setDirty(false)
    setRev((r) => r + 1)
    flashToast('Preços restaurados ao padrão')
  }

  const actions = (
    <>
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Restaurar padrão
      </button>
      <button type="button" className="btn btn--primary" onClick={onSave}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3h11l3 3v15H5V3Z" />
          <path d="M8 3v6h7M8 21v-7h8v7" />
        </svg>
        Salvar alterações
      </button>
    </>
  )

  return (
    <div className="app">
      <AppHeader title="Tabela de Preços" subtitle="Administração" actions={actions} />

      <div className="admin-body">
        <div className="admin-head">
          <div>
            <p className="eyebrow">Administração · preços 2024</p>
            <h1>Tabela de preços</h1>
            <p>
              Ajuste valores base por faixa de volume, acréscimos de gola/tecido e opcionais. As
              alterações são salvas neste navegador e passam a valer no gerador.
            </p>
          </div>
          <div className="admin-actions">{actions}</div>
        </div>

        <div className="pe-layout">
          <div className="pe-side">
            {schema.map((c) => {
              const fields = c.sections.reduce(
                (n, s) => n + (s.type === 'matrix' ? s.rows.length * s.cols.length : s.type === 'row' ? s.cols.length : s.items.length),
                0,
              )
              return (
                <button
                  key={c.catId}
                  type="button"
                  className={`pe-cat${c.catId === active ? ' active' : ''}`}
                  onClick={() => setActive(c.catId)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d={c.icon} />
                  </svg>
                  <span>{c.label}</span>
                  <span className="badge">{fields}</span>
                </button>
              )
            })}
          </div>

          <div className="pe-detail" ref={detailRef} key={`${cat.catId}-${rev}`}>
            <div className="pe-cat-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 24, height: 24, color: 'var(--fase-red)' }}>
                <path d={cat.icon} />
              </svg>
              <h2>{cat.label}</h2>
              <span className="tag tag--partner">{KIND_LABEL[cat.kind]}</span>
            </div>

            {cat.sections.map((sec) => (
              <div className="panel" key={sec.group}>
                <div className="pe-section__title">{sec.title}</div>

                {sec.type === 'matrix' && (
                  <>
                    <div className="pe-section__sub">Valores em R$ por unidade, conforme a faixa de quantidade.</div>
                    <table className="pe-matrix">
                      <thead>
                        <tr>
                          <th>Item</th>
                          {sec.cols.map((c2) => (
                            <th key={c2}>{c2}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sec.rows.map((row) => (
                          <tr key={row.key}>
                            <td>{row.label}</td>
                            {sec.cols.map((_, b) => (
                              <td key={b}>
                                <NumCell
                                  group={sec.group}
                                  defaultValue={pb[sec.group][row.key][b]}
                                  onChange={(v) => touch(cat.catId, sec.group, [row.key, b], v)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {sec.type === 'row' && (
                  <>
                    <div className="pe-section__sub">Valor base em R$ por unidade, conforme a faixa de quantidade.</div>
                    <table className="pe-matrix">
                      <thead>
                        <tr>
                          <th>Faixa</th>
                          {sec.cols.map((c2) => (
                            <th key={c2}>{c2}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Preço base</td>
                          {sec.cols.map((_, b) => (
                            <td key={b}>
                              <NumCell
                                group={sec.group}
                                defaultValue={pb[sec.group][b]}
                                onChange={(v) => touch(cat.catId, sec.group, b, v)}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {sec.type === 'list' && (
                  <div className="pe-list">
                    {sec.items.map((it) => (
                      <div className="pe-field" key={it.key}>
                        <label>{it.label}</label>
                        <NumCell
                          group={sec.group}
                          defaultValue={pb[sec.group][it.key]}
                          onChange={(v) => touch(cat.catId, sec.group, it.key, v)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`saved-toast${toast.show ? ' show' : ''}`}>{toast.text}</div>
    </div>
  )
}
