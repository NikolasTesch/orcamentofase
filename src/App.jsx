import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { ThemeProvider, ThemeToggle, AccentSwatches } from './theme.jsx'
import { BudgetProvider } from './context/BudgetContext.jsx'
import { useBudget } from './context/budget-context.js'
import { formatBRL } from './lib/pricing.js'

import ClientForm from './components/ClientForm.jsx'
import BudgetCart from './components/BudgetCart.jsx'
import PrintLayout from './components/PrintLayout.jsx'

import KitEsportivoSelector from './components/ProductSelectors/KitEsportivoSelector.jsx'
import CamisaMalhaSelector from './components/ProductSelectors/CamisaMalhaSelector.jsx'
import EstampaTotalSelector from './components/ProductSelectors/EstampaTotalSelector.jsx'
import CamisaPPSelector from './components/ProductSelectors/CamisaPPSelector.jsx'
import SocialSelector from './components/ProductSelectors/SocialSelector.jsx'
import TactelHelancaSelector from './components/ProductSelectors/TactelHelancaSelector.jsx'
import BandeiraSelector from './components/ProductSelectors/BandeiraSelector.jsx'
import AbadaSelector from './components/ProductSelectors/AbadaSelector.jsx'

import logoBranco from './assets/logo-fase-branco.svg'

/* -------- Ícones -------- */
const IconPrint = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6Z" />
  </svg>
)
const IconWhatsApp = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-4-1L3 21l1.9-4.9A8.4 8.4 0 1 1 21 11.5Z" />
  </svg>
)
const IconTrash = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
)
const IconCart = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
)
const IconClose = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

/* -------- Definição das 8 abas (SPEC §3.1 / §8) -------- */
const TABS = [
  { id: 'kit', label: 'Kit Esportivo', icon: <><circle cx="12" cy="12" r="9" /><path d="m8 9 4-2 4 2-1.5 5h-5L8 9Z" /></>, Comp: KitEsportivoSelector },
  { id: 'malha', label: 'Camisa de Malha', icon: <path d="M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z" />, Comp: CamisaMalhaSelector },
  { id: 'estampa', label: 'Estampa Total', icon: <><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="19" cy="13" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="10" cy="20" r="2.5" /></>, Comp: EstampaTotalSelector },
  { id: 'pp', label: 'Camisa PP', icon: <path d="M3 11l18-5v12L3 13v-2ZM3 11v6" />, Comp: CamisaPPSelector },
  { id: 'social', label: 'Linha Social', icon: <path d="M6 4h12l-1 4-5 14L7 8 6 4Z" />, Comp: SocialSelector },
  { id: 'tactel', label: 'Tactel & Helanca', icon: <path d="M7 4h10l-1 5v11H8V9L7 4Z" />, Comp: TactelHelancaSelector },
  { id: 'bandeira', label: 'Bandeiras', icon: <path d="M5 3v18M5 4h13l-3 4 3 4H5" />, Comp: BandeiraSelector },
  { id: 'abada', label: 'Abadás', icon: <path d="M9 4 4 9l5 11h6l5-11-5-5-3 2-3-2Z" />, Comp: AbadaSelector },
]

const tabContentVariants = {
  initial: { opacity: 0, x: -12, scale: 0.99 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: 12, scale: 0.99, transition: { duration: 0.15 } },
}

function TabSelector({ activeTab, setActiveTab }) {
  return (
    <div className="tabs cat-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          style={{ position: 'relative' }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabIndicator"
              className="tab-indicator"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            {tab.icon}
          </svg>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

function TotalsPanel() {
  const {
    subtotalBruto,
    totalParceriaDesconto,
    descontoAdicional,
    totalLiquido,
    entradaSugerida,
  } = useBudget()
  return (
    <div className="totals">
      <div className="totals__row">
        <span>Subtotal bruto</span>
        <span className="num">{formatBRL(subtotalBruto)}</span>
      </div>
      <div className="totals__row totals__row--discount">
        <span>Desconto de parceria</span>
        <span className="num">− {formatBRL(totalParceriaDesconto)}</span>
      </div>
      <div className="totals__row">
        <span>Desconto adicional</span>
        <span className="num">− {formatBRL(descontoAdicional)}</span>
      </div>
      <div className="totals__divider" />
      <div className="totals__net">
        <span>Valor líquido</span>
        <span className="num">{formatBRL(totalLiquido)}</span>
      </div>
      <div className="totals__entry">
        <span>Entrada sugerida (50%)</span>
        <span className="num">{formatBRL(entradaSugerida)}</span>
      </div>
    </div>
  )
}

function buildWhatsAppText(state) {
  const lines = ['*FASE ESPORTE — Orçamento*', '']
  if (state.clientData.name) lines.push(`Cliente: ${state.clientData.name}`)
  lines.push('')
  state.enrichedCart.forEach((i) => {
    lines.push(`• ${i.quantity}x ${i.description} — ${formatBRL(i.lineTotal)}`)
  })
  lines.push('')
  lines.push(`Valor líquido: ${formatBRL(state.totalLiquido)}`)
  lines.push(`Entrada (50%): ${formatBRL(state.entradaSugerida)}`)
  lines.push('')
  lines.push(
    `Pagamento: ${state.conditions.paymentTerms} Entrega: ${state.conditions.deliveryDays} dias. Validade: ${state.conditions.validityDays} dias.`,
  )
  return lines.join('\n')
}

function Actions() {
  const budget = useBudget()
  const empty = budget.enrichedCart.length === 0
  const dim = empty ? { opacity: 0.5, cursor: 'not-allowed' } : undefined

  const sendWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppText(budget))
    const phone = budget.clientData.phone.replace(/\D/g, '')
    const base = phone ? `https://wa.me/55${phone}` : 'https://wa.me/'
    window.open(`${base}?text=${text}`, '_blank', 'noopener')
  }

  return (
    <div className="col" style={{ gap: 10, marginTop: 16 }}>
      <button
        type="button"
        className="btn btn--primary btn--block btn--lg"
        onClick={() => window.print()}
        disabled={empty}
        style={dim}
      >
        {IconPrint} Gerar orçamento / Imprimir
      </button>
      <div className="row" style={{ gap: 10 }}>
        <button
          type="button"
          className="btn btn--ghost"
          style={{ flex: 1, ...dim }}
          onClick={sendWhatsApp}
          disabled={empty}
        >
          {IconWhatsApp} WhatsApp
        </button>
        <button type="button" className="btn btn--danger" onClick={budget.clearBudget} disabled={empty} style={dim}>
          {IconTrash} Limpar
        </button>
      </div>
    </div>
  )
}

function ConfigColumn() {
  const [activeTab, setActiveTab] = useState('malha')
  const reduce = useReducedMotion()
  const tab = TABS.find((t) => t.id === activeTab)
  const ActiveComp = tab?.Comp

  return (
    <section className="config-col">
      <div className="panel cat-tabs-wrap">
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="panel">
        <div className="configurator">
          <div className="config-head">
            <h2>{tab?.label}</h2>
            <span className="bracket">Preço unitário em tempo real</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={reduce ? undefined : tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {ActiveComp && <ActiveComp />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function CheckoutColumn({ onClose }) {
  const { enrichedCart } = useBudget()
  return (
    <aside className="checkout-col">
      <button type="button" className="drawer-close icon-btn" onClick={onClose} aria-label="Fechar">
        {IconClose}
      </button>
      <div className="panel">
        <h3 className="panel__title">Dados do cliente</h3>
        <ClientForm />
      </div>
      <div className="panel">
        <h3 className="panel__title">
          Itens do orçamento <span className="count">{enrichedCart.length} item(s)</span>
        </h3>
        <BudgetCart />
      </div>
      <div className="panel">
        <h3 className="panel__title">Resumo financeiro</h3>
        <TotalsPanel />
        <Actions />
      </div>
    </aside>
  )
}

function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <img src={logoBranco} alt="Fase Esporte" className="logo-themed" />
        <span className="div" />
        <div>
          <div className="name">Gerador de Orçamentos</div>
          <div className="sub">Fase Esporte · Teixeira de Freitas — BA</div>
        </div>
      </div>
      <div className="app-header__actions">
        <AccentSwatches />
        <ThemeToggle />
      </div>
    </header>
  )
}

function Workspace() {
  const { enrichedCart } = useBudget()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className={`app no-print${drawerOpen ? ' drawer-open' : ''}`}>
      <Header />
      <div className="app-body">
        <ConfigColumn />
        <CheckoutColumn onClose={() => setDrawerOpen(false)} />
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
      </div>
      <button type="button" className="cart-fab" onClick={() => setDrawerOpen(true)}>
        {IconCart}
        <span>Orçamento</span>
        <span className="badge">{enrichedCart.length}</span>
      </button>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <Workspace />
        <PrintLayout />
      </BudgetProvider>
    </ThemeProvider>
  )
}
