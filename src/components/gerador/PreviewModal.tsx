"use client"

import { A4Body, A4SizesPage } from './PrintSheet'
import { useBudget } from '../../context/budget-context'
import { MouseEvent } from 'react'

const PrintIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6Z" />
  </svg>
)

const CloseIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  onPrint: () => void
}

/* Pré-visualização do A4 em modal (porta openModal/closeModal de app.js). */
export default function PreviewModal({ open, onClose, onPrint }: PreviewModalProps) {
  const { attachSizes, selectedSizeChartIds } = useBudget()
  return (
    <div
      className={`modal no-print${open ? ' open' : ''}`}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal__inner">
        <div className="modal__bar">
          <span className="ttl">Pré-visualização do orçamento</span>
          <div className="acts">
            <button type="button" className="btn btn--primary" onClick={onPrint}>
              {PrintIcon}Imprimir / PDF
            </button>
            <button type="button" className="icon-btn" onClick={onClose}>
              {CloseIcon}
            </button>
          </div>
        </div>
        {/* só monta o A4 quando aberto, para não duplicar o id do image-slot à toa */}
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <A4Body />
            {attachSizes && selectedSizeChartIds.map(id => (
              <A4SizesPage key={id} chartId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
