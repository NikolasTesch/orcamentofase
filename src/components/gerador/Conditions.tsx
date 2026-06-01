"use client"

import { useRef } from 'react'
import { useBudget } from '../../context/budget-context'

const SIZE_CHART_OPTIONS = [
  { id: 'camisa_normal',   label: 'Camisa Normal — Unissex' },
  { id: 'camisa_infantil', label: 'Camisa Infantil — Unissex' },
  { id: 'camisa_social',   label: 'Camisa Social Masculina' },
  { id: 'calca_normal',    label: 'Calça Normal — Unissex' },
  { id: 'baby_look',       label: 'Baby Look — Feminina' },
]

const XIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width={12} height={12}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const ImgIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={16} height={16}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
)

export default function Conditions() {
  const {
    disc, cond, setDisc, setCond,
    attachSizes, setAttachSizes,
    selectedSizeChartIds, setSelectedSizeChartIds,
    attachedImages, setAttachedImages,
    notes, setNotes,
  } = useBudget()

  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleChart(id: string) {
    if (selectedSizeChartIds.includes(id)) {
      setSelectedSizeChartIds(selectedSizeChartIds.filter(x => x !== id))
    } else {
      setSelectedSizeChartIds([...selectedSizeChartIds, id])
    }
  }

  function handleImageFiles(files: FileList | null) {
    if (!files) return
    const readers = Array.from(files).map(file => new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    }))
    Promise.all(readers).then(newImages => {
      setAttachedImages([...attachedImages, ...newImages])
    })
  }

  function removeImage(idx: number) {
    setAttachedImages(attachedImages.filter((_, i) => i !== idx))
  }

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

        {/* Observações */}
        <div className="cond-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Observações</label>
          <textarea
            className="input"
            placeholder="Informações adicionais para o cliente, condições especiais, prazos..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: '100%', resize: 'vertical', fontSize: 13, lineHeight: '1.5', padding: '10px 12px', borderRadius: 'var(--radius)' }}
          />
        </div>

        {/* Imagens de referência */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Imagens do material
          </div>

          {/* thumbnails */}
          {attachedImages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {attachedImages.map((src, idx) => (
                <div
                  key={idx}
                  style={{ position: 'relative', width: 64, height: 64, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}
                >
                  <img src={src} alt={`Imagem ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      background: 'rgba(0,0,0,0.65)', border: 'none',
                      borderRadius: '50%', width: 18, height: 18,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff', padding: 0,
                    }}
                    title="Remover imagem"
                  >
                    {XIcon}
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleImageFiles(e.target.files)}
          />
          <button
            type="button"
            className="btn btn--ghost"
            style={{ width: '100%', gap: 8, fontSize: 13 }}
            onClick={() => fileInputRef.current?.click()}
          >
            {ImgIcon}
            {attachedImages.length === 0 ? 'Adicionar imagens' : 'Adicionar mais imagens'}
          </button>
        </div>

        {/* Grades de tamanhos */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 4 }}>
          <label
            className="row"
            style={{ gap: 10, cursor: 'pointer', userSelect: 'none', width: '100%', alignItems: 'center', marginBottom: 10 }}
          >
            <input
              type="checkbox"
              checked={attachSizes}
              onChange={(e) => setAttachSizes(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--fase-red)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Anexar tabela(s) de tamanhos</span>
          </label>

          {attachSizes && (
            <div className="col" style={{ gap: 6, paddingLeft: 2 }}>
              {SIZE_CHART_OPTIONS.map(opt => (
                <label
                  key={opt.id}
                  className="row"
                  style={{ gap: 10, cursor: 'pointer', userSelect: 'none', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSizeChartIds.includes(opt.id)}
                    onChange={() => toggleChart(opt.id)}
                    style={{ width: 16, height: 16, accentColor: 'var(--fase-red)', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{opt.label}</span>
                </label>
              ))}
              {selectedSizeChartIds.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 26 }}>
                  Selecione ao menos uma tabela acima.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
