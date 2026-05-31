"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from '../../components/app/AppHeader'
import MeasurementSvg from '../../components/gerador/MeasurementSvg'
import { getSizes, saveSizes, resetSizes, setSizeValue, setSizeObs, subscribeSizes } from '../../data/sizes'

export default function SizesPage() {
  const [rev, setRev] = useState(0) // forces complete input remount after reset
  const sizesData = useMemo(() => getSizes(), [rev])
  const [activeChartId, setActiveChartId] = useState('camisa_normal')
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState({ show: false, text: 'Alterações salvas' })
  const detailRef = useRef<HTMLDivElement | null>(null)

  // Warn user about unsaved changes
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const activeChart = sizesData[activeChartId]
  if (!activeChart) return null

  const handleCellChange = (sizeKey: string, cellIndex: number, val: string) => {
    setSizeValue(activeChartId, sizeKey, cellIndex, val)
    setDirty(true)
  }

  const handleObsChange = (val: string) => {
    setSizeObs(activeChartId, val)
    setDirty(true)
  }

  const flashToast = (text: string) => {
    setToast({ show: true, text })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 1900)
  }

  const onSave = async () => {
    saveSizes()
    const currentSizes = getSizes()
    try {
      const response = await fetch('/api/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentSizes }),
      })
      const res = await response.json()
      if (res.success) {
        setDirty(false)
        detailRef.current?.querySelectorAll('.pe-input.changed').forEach((i) => i.classList.remove('changed'))
        flashToast('Medidas salvas no banco com sucesso!')
      } else {
        flashToast('Erro ao salvar no banco: ' + (res.error || 'Erro desconhecido'))
      }
    } catch (err) {
      console.error('Error saving sizes to server:', err)
      flashToast('Erro de conexão ao salvar no banco')
    }
  }

  const onReset = () => {
    if (!window.confirm('Restaurar todas as tabelas de tamanhos para os valores padrão de fábrica? As alterações não salvas serão perdidas.')) return
    resetSizes()
    setDirty(false)
    setRev((r) => r + 1)
    flashToast('Tabelas de tamanhos restauradas')
  }

  const actions = (
    <>
      <button type="button" className="btn btn--ghost" onClick={onReset}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Restaurar padrão
      </button>
      <button type="button" className="btn btn--primary" onClick={onSave}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
          <path d="M5 3h11l3 3v15H5V3Z" />
          <path d="M8 3v6h7M8 21v-7h8v7" />
        </svg>
        Salvar alterações
      </button>
    </>
  )

  // Map category icons to nice SVG paths
  const chartIcons: Record<string, string> = {
    camisa_normal: 'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z', // T-shirt icon
    camisa_infantil: 'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z', // T-shirt icon
    camisa_social: 'M6 3h12l-2 4 2 13H6L8 7 6 3Z', // Social icon
    calca_normal: 'M8 3h8v6l3 3v9H5v-9l3-3V3Z', // Pants icon
    baby_look: 'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z' // T-shirt icon
  }

  return (
    <div className="app">
      <AppHeader title="Grade de Tamanhos" subtitle="Administração" actions={actions} />

      <div className="admin-body">
        <div className="admin-head">
          <div>
            <p className="eyebrow">Administração · Tabelas de Medidas</p>
            <h1>Grades de tamanhos</h1>
            <p>
              Consulte e configure as medidas de cada modelo de uniforme. Estas tabelas são anexadas 
              automaticamente ao orçamento do cliente quando a opção de grade de tamanhos estiver ativa.
            </p>
          </div>
          <div className="admin-actions">{actions}</div>
        </div>

        <div className="pe-layout">
          {/* Sidebar selector */}
          <div className="pe-side">
            {Object.values(sizesData).map((chart) => {
              const rowCount = Object.keys(chart.rows).length
              return (
                <button
                  key={chart.id}
                  type="button"
                  className={`pe-cat${chart.id === activeChartId ? ' active' : ''}`}
                  onClick={() => setActiveChartId(chart.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d={chartIcons[chart.id] || chartIcons.camisa_normal} />
                  </svg>
                  <span>{chart.label.replace('Tabela ', '')}</span>
                  <span className="badge">{rowCount} tam.</span>
                </button>
              )
            })}
          </div>

          {/* Editor Area */}
          <div className="pe-detail" ref={detailRef} key={`${activeChartId}-${rev}`}>
            <div className="pe-cat-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 24, height: 24, color: 'var(--fase-red)' }}>
                <path d={chartIcons[activeChartId] || chartIcons.camisa_normal} />
              </svg>
              <h2>{activeChart.label}</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Editable Grid */}
              <div className="xl:col-span-7 flex flex-col gap-6">
                <div className="panel glass-panel">
                  <div className="pe-section__title">Grade de Medidas</div>
                  <div className="pe-section__sub">Preencha as dimensões correspondentes de cada tamanho da peça (ex: 70 cm).</div>
                  
                  <table className="pe-matrix" style={{ marginTop: 12 }}>
                    <thead>
                      <tr>
                        {activeChart.cols.map((col) => (
                          <th key={col} style={{ textAlign: col === 'Tamanho' ? 'left' : 'center' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(activeChart.rows).map(([sizeKey, cellValues]) => (
                        <tr key={sizeKey}>
                          <td style={{ fontWeight: 700, color: 'var(--fase-red)', fontSize: '14px', width: '60px' }}>
                            {sizeKey}
                          </td>
                          {cellValues.map((val, idx) => {
                            // Column labels (skips "Tamanho" column since that is the row key)
                            const isFirstCol = activeChart.cols[0] === 'Tamanho'
                            const colIndex = isFirstCol ? idx : idx
                            return (
                              <td key={idx}>
                                <div className="pe-num" style={{ width: '100%' }}>
                                  <input
                                    className="pe-input"
                                    type="text"
                                    defaultValue={val}
                                    style={{ width: '100%', textIndent: 0, paddingLeft: 12, textAlign: 'center', fontFamily: 'var(--font-sans)' }}
                                    onChange={(e) => {
                                      e.target.classList.add('changed')
                                      handleCellChange(sizeKey, colIndex, e.target.value)
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

                {/* Observation Box */}
                <div className="panel glass-panel">
                  <div className="pe-section__title" style={{ marginBottom: 6 }}>Observações Importantes</div>
                  <div className="pe-section__sub">Este texto será impresso em destaque no rodapé da folha de medidas.</div>
                  <textarea
                    className="pe-input"
                    defaultValue={activeChart.obs}
                    rows={4}
                    style={{ 
                      width: '100%', 
                      resize: 'vertical', 
                      fontFamily: 'var(--font-sans)', 
                      fontSize: '13px', 
                      lineHeight: '1.5',
                      padding: '12px',
                      borderRadius: 'var(--radius)'
                    }}
                    onChange={(e) => {
                      e.target.classList.add('changed')
                      handleObsChange(e.target.value)
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Visual Diagram */}
              <div className="xl:col-span-5 flex flex-col gap-6">
                <div className="panel glass-panel" style={{ padding: 24 }}>
                  <div className="pe-section__title" style={{ marginBottom: 4 }}>Como Medir a Peça</div>
                  <div className="pe-section__sub" style={{ marginBottom: 20 }}>Diagrama oficial de orientação para o cliente final.</div>
                  <div style={{ background: '#f5f5f7', borderRadius: 'var(--radius-lg)', padding: '24px 12px', border: '1px solid var(--border-color)' }}>
                    <MeasurementSvg type={activeChart.svgType} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`saved-toast${toast.show ? ' show' : ''}`}>{toast.text}</div>
    </div>
  )
}
