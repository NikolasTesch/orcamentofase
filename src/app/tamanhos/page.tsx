"use client"

import { useEffect, useRef, useState } from 'react'
import PageLayout from '../../components/app/PageLayout'
import PageHeader from '../../components/app/PageHeader'
import MeasurementSvg from '../../components/gerador/MeasurementSvg'

interface ChartData {
  chartId: string
  label: string
  svgType: string
  obs: string
  columns: Array<{ id: string; label: string; sortOrder: number }>
  rows: Array<{ id: string; sizeKey: string; cells: Array<{ columnId: string; cellId: string; value: string }> }>
}

const chartIcons: Record<string, string> = {
  camisa_normal:   'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z',
  camisa_infantil: 'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z',
  camisa_social:   'M6 3h12l-2 4 2 13H6L8 7 6 3Z',
  calca_normal:    'M8 3h8v6l3 3v9H5v-9l3-3V3Z',
  baby_look:       'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z',
}

export default function SizesPage() {
  const [loading, setLoading] = useState(true)
  const [charts, setCharts] = useState<Record<string, ChartData>>({})
  const [activeKey, setActiveKey] = useState('camisa_normal')
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState({ show: false, text: '' })
  const [saving, setSaving] = useState(false)
  const detailRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadSizes()
  }, [])

  async function loadSizes() {
    setLoading(true)
    try {
      const res = await fetch('/api/sizes').then((r) => r.json())
      if (res.success && res.data) {
        setCharts(res.data)
        const keys = Object.keys(res.data)
        if (keys.length > 0) setActiveKey(keys[0])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const flashToast = (text: string) => {
    setToast({ show: true, text })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 1900)
  }

  const handleCellChange = (cellId: string, value: string, chartKey: string, rowId: string, columnId: string) => {
    setCharts((prev) => ({
      ...prev,
      [chartKey]: {
        ...prev[chartKey],
        rows: prev[chartKey].rows.map((r) =>
          r.id === rowId
            ? { ...r, cells: r.cells.map((c) => (c.cellId === cellId ? { ...c, value } : c)) }
            : r
        ),
      },
    }))
    setDirty(true)
  }

  const handleObsChange = (chartKey: string, obs: string) => {
    setCharts((prev) => ({ ...prev, [chartKey]: { ...prev[chartKey], obs } }))
    setDirty(true)
  }

  const onSave = async () => {
    const chart = charts[activeKey]
    if (!chart) return
    setSaving(true)
    try {
      // Salvar todas as células modificadas
      for (const row of chart.rows) {
        for (const cell of row.cells) {
          await fetch('/api/sizes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cellId: cell.cellId, value: cell.value }),
          })
        }
      }
      // Salvar obs
      await fetch('/api/sizes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartId: chart.chartId, obs: chart.obs }),
      })
      setDirty(false)
      detailRef.current?.querySelectorAll('.pe-input.changed').forEach((i) => i.classList.remove('changed'))
      flashToast('Medidas salvas no banco com sucesso!')
    } catch {
      flashToast('Erro de conexão ao salvar no banco')
    } finally {
      setSaving(false)
    }
  }

  const onReset = async () => {
    if (!window.confirm('Restaurar todas as tabelas de tamanhos para os valores padrão? As alterações serão perdidas.')) return
    try {
      await fetch('/api/sizes', { method: 'DELETE' })
      await loadSizes()
      setDirty(false)
      flashToast('Tabelas de tamanhos restauradas')
    } catch {
      flashToast('Erro ao restaurar tabelas')
    }
  }

  if (loading) {
    return (
      <PageLayout maxWidth="wide">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <span style={{ color: 'var(--text-muted)' }}>Carregando grades de tamanhos...</span>
        </div>
      </PageLayout>
    )
  }

  const activeChart = charts[activeKey]
  const actions = (
    <>
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
        </svg>
        Restaurar padrão
      </button>
      <button type="button" className={`btn btn--primary${!dirty ? ' btn--disabled' : ''}`} onClick={onSave} disabled={!dirty || saving}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
          <path d="M5 3h11l3 3v15H5V3Z" /><path d="M8 3v6h7M8 21v-7h8v7" />
        </svg>
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </>
  )

  return (
    <PageLayout maxWidth="wide">
      <div className="admin-body">
        <PageHeader
          title="Grades de tamanhos"
          subtitle="Consulte e configure as medidas de cada modelo de uniforme. Estas tabelas são anexadas ao orçamento quando a opção de grade estiver ativa."
          eyebrow="Administração · Tabelas de Medidas"
          actions={actions}
        />

        <div className="pe-layout">
          <div className="pe-side">
            {Object.entries(charts).map(([key, chart]) => (
              <button
                key={key}
                type="button"
                className={`pe-cat${key === activeKey ? ' active' : ''}`}
                onClick={() => setActiveKey(key)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d={chartIcons[key] || chartIcons.camisa_normal} />
                </svg>
                <span>{chart.label.replace('Tabela ', '')}</span>
                <span className="badge">{chart.rows.length} tam.</span>
              </button>
            ))}
          </div>

          {activeChart && (
            <div className="pe-detail" ref={detailRef} key={activeKey}>
              <div className="pe-cat-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 24, height: 24, color: 'var(--fase-red)' }}>
                  <path d={chartIcons[activeKey] || chartIcons.camisa_normal} />
                </svg>
                <h2>{activeChart.label}</h2>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-7 flex flex-col gap-6">
                  <div className="panel glass-panel">
                    <div className="pe-section__title">Grade de Medidas</div>
                    <div className="pe-section__sub">Preencha as dimensões correspondentes de cada tamanho (ex: 70 cm).</div>
                    <table className="pe-matrix" style={{ marginTop: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>Tamanho</th>
                          {activeChart.columns.map((col) => <th key={col.id}>{col.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {activeChart.rows.map((row) => (
                          <tr key={row.id}>
                            <td style={{ fontWeight: 700, color: 'var(--fase-red)', fontSize: '14px', width: '60px' }}>
                              {row.sizeKey}
                            </td>
                            {activeChart.columns.map((col) => {
                              const cell = row.cells.find((c) => c.columnId === col.id)
                              return (
                                <td key={col.id}>
                                  <div className="pe-num" style={{ width: '100%' }}>
                                    <input
                                      className="pe-input"
                                      type="text"
                                      defaultValue={cell?.value || ''}
                                      style={{ width: '100%', textIndent: 0, paddingLeft: 12, textAlign: 'center' }}
                                      onChange={(e) => {
                                        e.target.classList.add('changed')
                                        if (cell) handleCellChange(cell.cellId, e.target.value, activeKey, row.id, col.id)
                                      }}
                                    />
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="panel glass-panel">
                    <div className="pe-section__title" style={{ marginBottom: 6 }}>Observações Importantes</div>
                    <div className="pe-section__sub">Este texto será impresso no rodapé da folha de medidas.</div>
                    <textarea
                      className="pe-input"
                      defaultValue={activeChart.obs}
                      rows={4}
                      style={{ width: '100%', resize: 'vertical', fontSize: '13px', lineHeight: '1.5', padding: '12px', borderRadius: 'var(--radius)' }}
                      onChange={(e) => {
                        e.target.classList.add('changed')
                        handleObsChange(activeKey, e.target.value)
                      }}
                    />
                  </div>
                </div>

                <div className="xl:col-span-5 flex flex-col gap-6">
                  <div className="panel glass-panel" style={{ padding: 24 }}>
                    <div className="pe-section__title" style={{ marginBottom: 4 }}>Como Medir a Peça</div>
                    <div className="pe-section__sub" style={{ marginBottom: 20 }}>Diagrama oficial de orientação para o cliente.</div>
                    <div style={{ background: '#f5f5f7', borderRadius: 'var(--radius-lg)', padding: '24px 12px', border: '1px solid var(--border-color)' }}>
                      <MeasurementSvg type={activeChart.svgType as any} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`saved-toast${toast.show ? ' show' : ''}`}>{toast.text}</div>
    </PageLayout>
  )
}
