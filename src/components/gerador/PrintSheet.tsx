"use client"

import React from 'react'
import { useBudget, CartItem } from '../../context/budget-context'
import { fmtBRL } from '../../data/pricebook'
import { getSizes } from '../../data/sizes'
import MeasurementSvg from './MeasurementSvg'
import logoAllWhite from '../../assets/logo-fase-allwhite.svg'

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const MON = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const dec = (n: number) => n.toFixed(2).replace('.', ',')

/* Folha A4 do orçamento. Lê o estado comercial. */
export function A4Body() {
  const { cart, client, cond, totals, settings, savedBudgetNumber, notes, attachedImages } = useBudget()
  const now = new Date()
  const partnerNote = client.partnership !== 'Nenhuma' && totals.partnerDisc > 0
  const budgetNum = savedBudgetNumber
    ? String(savedBudgetNumber).padStart(4, '0')
    : 'RASCUNHO'

  return (
    <div className="a4">
      <div className="a4__hero">
        <img className="a4__hero-logo" src={logoAllWhite.src || logoAllWhite} alt="Fase Esporte" />
        <div className="a4__hero-right">
          <div className="a4__hero-title">ORÇAMENTO</div>
          <div className="a4__hero-meta">
            Nº {budgetNum} · {String(now.getDate()).padStart(2, '0')} {MON[now.getMonth()]} {now.getFullYear()}
          </div>
        </div>
      </div>
      <div className="a4__company-bar">
        <span>
          <b>{settings.companyName}</b> · {settings.tagline}
        </span>
        <span>{settings.city} · {settings.phone} · {settings.email}</span>
      </div>
      <div className="a4__intro">
        <div className="a4__client">
          <div>
            <span className="a4__lbl">Cliente</span> {client.name || '—'}
          </div>
          <div>
            <span className="a4__lbl">WhatsApp</span> {client.phone || '—'}
          </div>
          <div>
            <span className="a4__lbl">Cidade / Data</span> Teixeira de Freitas — BA,{' '}
            {now.getDate()} de {MESES[now.getMonth()]} de {now.getFullYear()}
          </div>
        </div>

        {/* Imagens do material — mostra até 3 no cabeçalho */}
        {attachedImages.length > 0 ? (
          <div className="a4__material">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {attachedImages.slice(0, 3).map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Material ${idx + 1}`}
                  style={{ width: attachedImages.length === 1 ? 120 : 72, height: attachedImages.length === 1 ? 90 : 72, objectFit: 'cover', borderRadius: 5, border: '1px solid #ddd' }}
                />
              ))}
              {attachedImages.length > 3 && (
                <div style={{ width: 72, height: 72, borderRadius: 5, border: '1px solid #ddd', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#888', fontWeight: 600 }}>
                  +{attachedImages.length - 3}
                </div>
              )}
            </div>
            <span className="a4__material-cap">Material solicitado</span>
          </div>
        ) : (
          <div className="a4__material">
            <div style={{ width: 120, height: 90, borderRadius: 5, border: '1px dashed #ccc', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#aaa' }}>
              sem imagem
            </div>
            <span className="a4__material-cap">Imagem do material solicitado</span>
          </div>
        )}
      </div>

      {/* Imagens extras (4+) em linha separada */}
      {attachedImages.length > 3 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {attachedImages.slice(3).map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Material ${idx + 4}`}
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 5, border: '1px solid #ddd' }}
            />
          ))}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th style={{ width: '8%' }}>Qtd</th>
            <th style={{ width: '60%' }}>Descrição técnica do material</th>
            <th className="ar" style={{ width: '16%' }}>
              Valor R$
            </th>
            <th className="ar" style={{ width: '16%' }}>
              Total R$
            </th>
          </tr>
        </thead>
        <tbody>
          {cart.length ? (
            cart.map((it: CartItem) => (
              <tr key={it.uid}>
                <td>{it.qty}</td>
                <td>{it.desc}</td>
                <td className="ar">{dec(it.unit)}</td>
                <td className="ar">{dec(it.unit * it.qty)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: 18 }}>
                Nenhum item no orçamento.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="a4__foot">
        <div className="a4__terms">
          <b>Condição de pagamento:</b> entrada de 50% no ato do pedido e o restante na entrega (à
          vista, pix ou cartão).
          <br />
          <b>Previsão de entrega:</b> {cond.delivery} dias · <b>Validade:</b>{' '}
          {String(cond.validity).padStart(2, '0')} dias.
          {partnerNote && (
            <div style={{ marginTop: 6 }}>
              *INCLUSA LOGO DA FASE NA FRENTE E COSTAS EM DESTAQUE, EXCETO CAMISAS DE FORMANDOS.
            </div>
          )}
          {notes && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
              <b>Observações:</b> {notes}
            </div>
          )}
        </div>
        <div className="a4__fin">
          <div>
            <span>Valor total</span>
            <span>{fmtBRL(totals.sub)}</span>
          </div>
          <div>
            <span>Desconto</span>
            <span>− {fmtBRL(totals.partnerDisc + totals.add)}</span>
          </div>
          <div className="net">
            <span>Líquido</span>
            <span>{fmtBRL(totals.net)}</span>
          </div>
          <div>
            <span>Entrada 50%</span>
            <span>{fmtBRL(totals.entry)}</span>
          </div>
        </div>
      </div>
      <div className="a4__sign">
        <div>Assinatura do vendedor</div>
        <div>Assinatura do cliente</div>
      </div>
    </div>
  )
}

export function A4SizesPage({ chartId }: { chartId: string }) {
  const { settings } = useBudget()
  const sizesData = getSizes()
  const chart = sizesData[chartId]
  if (!chart) return null

  return (
    <div className="a4 a4-page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
      <div className="a4__hero">
        <img className="a4__hero-logo" src={logoAllWhite.src || logoAllWhite} alt="Fase Esporte" />
        <div className="a4__hero-right">
          <div className="a4__hero-title" style={{ fontSize: '1.4rem' }}>TABELA DE MEDIDAS</div>
          <div className="a4__hero-meta" style={{ fontSize: '11px' }}>FASE ESPORTE UNIFORMES</div>
        </div>
      </div>
      <div className="a4__company-bar">
        <span>
          <b>{chart.label.toUpperCase()}</b>
        </span>
        <span>{settings.city} · {settings.email}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '40px', marginBottom: '24px', alignItems: 'center' }}>
        {/* Tabela de tamanhos */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #111' }}>
            <thead>
              <tr style={{ background: '#111111', color: '#ffffff' }}>
                {chart.cols.map((col) => (
                  <th key={col} style={{ padding: '10px 12px', border: '1px solid #333', textAlign: col === 'Tamanho' ? 'left' : 'center', fontSize: '11px', textTransform: 'uppercase', color: '#ffffff', fontWeight: 'bold' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(chart.rows).map(([sizeKey, cellValues]) => (
                <tr key={sizeKey} style={{ borderBottom: '1px solid #dddddd' }}>
                  <td style={{ padding: '10px 12px', border: '1px solid #dddddd', fontWeight: 'bold', fontSize: '13px', color: '#B31217', background: '#fcfcfc' }}>
                    {sizeKey}
                  </td>
                  {cellValues.map((cell, idx) => (
                    <td key={idx} style={{ padding: '10px 12px', border: '1px solid #dddddd', textAlign: 'center', fontSize: '13px', color: '#000000', fontWeight: '500' }}>
                      {(() => { const n = String(cell).replace(/[^0-9.]/g, '').trim(); return n ? `${n} cm` : '—'; })()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Diagrama de medição */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '20px', borderRadius: '6px', border: '1px solid #dddddd' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#111111', letterSpacing: '0.5px' }}>Onde Medir a Peça</div>
          <div style={{ width: '100%', maxWidth: '210px' }}>
            <MeasurementSvg type={chart.svgType} />
          </div>
        </div>
      </div>

      {/* Observação */}
      <div className="a4__foot" style={{ marginTop: 'auto', display: 'block', padding: '15px', border: '2px dashed #B31217', background: '#fdfbfa', borderRadius: '4px' }}>
        <b style={{ color: '#B31217', textTransform: 'uppercase', fontSize: '11px', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Observação importante</b>
        <p style={{ fontSize: '11.5px', margin: 0, lineHeight: '1.5', color: '#111111', fontWeight: '500' }}>
          {chart.obs}
        </p>
      </div>

      {/* Rodapé */}
      <div className="a4__company-bar" style={{ marginTop: '40px' }}>
        <span>{settings.website} · {settings.phone2}</span>
        <span>Siga nossas redes sociais: {settings.social}</span>
      </div>
    </div>
  )
}

/* Cópia oculta usada na impressão (visível apenas em @media print). */
export default function PrintSheet() {
  const { attachSizes, selectedSizeChartIds } = useBudget()
  return (
    <div className="print-sheet">
      <A4Body />
      {attachSizes && selectedSizeChartIds.map(id => (
        <A4SizesPage key={id} chartId={id} />
      ))}
    </div>
  )
}
