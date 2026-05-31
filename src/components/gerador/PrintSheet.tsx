"use client"

import { useBudget, CartItem } from '../../context/budget-context'
import { fmtBRL } from '../../data/pricebook'
import logoAllWhite from '../../assets/logo-fase-allwhite.svg'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'image-slot': any
    }
  }
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const MON = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const dec = (n: number) => n.toFixed(2).replace('.', ',')

/* Folha A4 do orçamento (porta updateSheet de app.js). Lê o estado comercial. */
export function A4Body() {
  const { cart, client, cond, totals } = useBudget()
  const now = new Date()
  const partnerNote = client.partnership !== 'Nenhuma' && totals.partnerDisc > 0

  return (
    <div className="a4">
      <div className="a4__hero">
        <img className="a4__hero-logo" src={logoAllWhite.src || logoAllWhite} alt="Fase Esporte" />
        <div className="a4__hero-right">
          <div className="a4__hero-title">ORÇAMENTO</div>
          <div className="a4__hero-meta">
            Nº 0142 · {String(now.getDate()).padStart(2, '0')} {MON[now.getMonth()]} {now.getFullYear()}
          </div>
        </div>
      </div>
      <div className="a4__company-bar">
        <span>
          <b>FASE ESPORTE</b> · Uniformes e Equipamentos Esportivos
        </span>
        <span>Teixeira de Freitas — BA · (73) 99999-9999 · contato@faseesporte.com.br</span>
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
        <div className="a4__material">
          <image-slot
            id="a4-material"
            shape="rounded"
            radius="6"
            placeholder="Imagem do material solicitado"
          ></image-slot>
          <span className="a4__material-cap">Imagem do material solicitado</span>
        </div>
      </div>
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

/* Cópia oculta usada na impressão (visível apenas em @media print). */
export default function PrintSheet() {
  return (
    <div className="print-sheet">
      <A4Body />
    </div>
  )
}
