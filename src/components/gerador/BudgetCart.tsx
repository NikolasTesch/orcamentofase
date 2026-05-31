"use client"

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
  info: { kind: 'exempt' | 'discount' | 'none'; d: number; short?: string }
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
  const reduced = useReducedMotion()

  const itemVariants = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, x: -24, height: 0, marginBottom: 0 },
    animate: reduced
      ? { opacity: 1 }
      : { opacity: 1, x: 0, height: 'auto', marginBottom: 8 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, x: 40, height: 0, marginBottom: 0 },
  }

  const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

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
          <motion.div
            className="cart-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {CartIcon}
            Nenhum item adicionado.
            <br />
            Configure uma peça e clique em <b>Adicionar</b>.
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {cart.map((it: CartItem) => {
              const info = partnerInfo(it)
              const gross = it.unit * it.qty
              const net = gross * (1 - info.d / 100)
              return (
                <motion.div
                  key={it.uid}
                  className="cart-row"
                  layout={!reduced}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={spring}
                >
                  <div className="cart-row__mini">
                    <button type="button" onClick={() => bumpCartQty(it.uid, -10)}>−</button>
                    <input
                      value={it.qty}
                      inputMode="numeric"
                      onChange={(e) => setCartQty(it.uid, parseInt(e.target.value, 10) || 1)}
                    />
                    <button type="button" onClick={() => bumpCartQty(it.uid, 10)}>+</button>
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
                  <motion.button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => removeFromCart(it.uid)}
                    title="Remover item"
                    whileHover={reduced ? {} : { scale: 1.12 }}
                    whileTap={reduced ? {} : { scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    {TrashIcon}
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {(client.partnership !== 'Nenhuma' && totals.partnerDisc > 0) || totals.hasAbadaExempt ? (
        <div style={{ marginTop: 12 }}>
          {client.partnership !== 'Nenhuma' && totals.partnerDisc > 0 && (
            <motion.div
              className="alert alert--partner"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>
                <b>*INCLUSA LOGO DA FASE</b> na frente e costas em destaque (obrigatório para
                parceria, exceto formandos).
              </span>
            </motion.div>
          )}
          {totals.hasAbadaExempt && (
            <motion.div
              className="alert alert--warning"
              style={{ marginTop: 8 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Abadá isento de desconto de parceria (regra de evento).</span>
            </motion.div>
          )}
        </div>
      ) : null}
    </div>
  )
}
