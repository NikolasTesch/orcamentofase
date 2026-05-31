"use client"

import { useBudget, CartItem } from '../../context/budget-context'
import { fmtBRL } from '../../data/pricebook'

const CartIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M6 6h15l-1.5 9h-12L6 6Zm0 0L5 3H2" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
)

const TrashIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
)

interface DiscountTagProps {
  info: {
    kind: 'exempt' | 'discount' | 'none'
    d: number
    short?: string
  }
}

const DiscountTag = ({ info }: DiscountTagProps) =>
  info.kind === 'exempt' ? (
    <span className="tag tag--exempt">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Isento de desconto
    </span>
  ) : info.kind === 'discount' ? (
    <span className="tag tag--discount">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {info.short} −{info.d}%
    </span>
  ) : null

export default function BudgetCart() {
  const { cart, partnerInfo, removeFromCart, bumpCartQty, setCartQty, totals, client } = useBudget()

  return (
    <div className="panel">
      <div className="panel__title">
        Carrinho{' '}
        <span className="count">
          {cart.length} {cart.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="cart-list">
        {cart.length === 0 ? (
          <div className="cart-empty">
            {CartIcon}
            Nenhum item adicionado.
            <br />
            Configure uma peça e clique em <b>Adicionar</b>.
          </div>
        ) : (
          cart.map((it: CartItem) => {
            const info = partnerInfo(it)
            const gross = it.unit * it.qty
            const net = gross * (1 - info.d / 100)
            return (
              <div className="cart-row" key={it.uid}>
                <div className="cart-row__mini">
                  <button type="button" onClick={() => bumpCartQty(it.uid, -10)}>
                    −
                  </button>
                  <input
                    value={it.qty}
                    inputMode="numeric"
                    onChange={(e) => setCartQty(it.uid, parseInt(e.target.value, 10) || 1)}
                  />
                  <button type="button" onClick={() => bumpCartQty(it.uid, 10)}>
                    +
                  </button>
                </div>
                <div>
                  <div className="cart-row__desc">{it.desc}</div>
                  <div className="cart-row__sub">
                    {fmtBRL(it.unit)} un <DiscountTag info={info} />
                  </div>
                </div>
                <div className="cart-row__total">
                  {fmtBRL(net)}
                  {info.d ? <del>{fmtBRL(gross)}</del> : null}
                </div>
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => removeFromCart(it.uid)}
                  title="Remover item"
                >
                  {TrashIcon}
                </button>
              </div>
            )
          })
        )}
      </div>

      {(client.partnership !== 'Nenhuma' && totals.partnerDisc > 0) || totals.hasAbadaExempt ? (
        <div style={{ marginTop: 12 }}>
          {client.partnership !== 'Nenhuma' && totals.partnerDisc > 0 && (
            <div className="alert alert--partner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>
                <b>*INCLUSA LOGO DA FASE</b> na frente e costas em destaque (obrigatório para
                parceria, exceto formandos).
              </span>
            </div>
          )}
          {totals.hasAbadaExempt && (
            <div className="alert alert--warning" style={{ marginTop: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Abadá isento de desconto de parceria (regra de evento).</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
