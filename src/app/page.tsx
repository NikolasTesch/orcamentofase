"use client"

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BudgetProvider } from '../context/BudgetContext'
import { useBudget } from '../context/budget-context'
import { fmtBRL } from '../data/pricebook'

import AppHeader from '../components/app/AppHeader'
import PageLayout from '../components/app/PageLayout'
import PageHeader from '../components/app/PageHeader'
import CategoryTabs from '../components/gerador/CategoryTabs'
import Configurator from '../components/gerador/Configurator'
import Simulator from '../components/gerador/Simulator'
import ClientForm from '../components/gerador/ClientForm'
import BudgetCart from '../components/gerador/BudgetCart'
import Conditions from '../components/gerador/Conditions'
import Totals from '../components/gerador/Totals'
import PrintSheet from '../components/gerador/PrintSheet'
import PreviewModal from '../components/gerador/PreviewModal'

const TrashIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
)

const PrintIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6Z" />
  </svg>
)

const EyeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const WaIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.4 8.4 0 0 1-12.9 7.1L3 21l2.4-5A8.4 8.4 0 1 1 21 11.5Z" />
  </svg>
)

const SaveIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const CloseIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const FabIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6h15l-1.5 9h-12L6 6Zm0 0L5 3H2" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
)

function ClearAction() {
  const { cart, clearCart } = useBudget()
  return (
    <button
      type="button"
      className="btn btn--ghost"
      title="Limpar orçamento"
      onClick={() => {
        if (!cart.length || window.confirm('Limpar todos os itens do orçamento?')) clearCart()
      }}
    >
      {TrashIcon}Limpar
    </button>
  )
}

function buildWhatsApp({ client, cart, cond, totals }: any) {
  let t = '*ORÇAMENTO FASE ESPORTE*\n'
  if (client.name) t += `Cliente: ${client.name}\n`
  t += '\n'
  cart.forEach((it: any) => {
    t += `• ${it.qty}x ${it.desc} — ${fmtBRL(it.unit * it.qty)}\n`
  })
  t += `\n*Total líquido:* ${fmtBRL(totals.net)}\n*Entrada (50%):* ${fmtBRL(totals.entry)}\n`
  t += `Entrega: ${cond.delivery} dias · Validade: ${cond.validity} dias`
  return t
}

function GeneratorBody() {
  const budget = useBudget()
  const reduced = useReducedMotion()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const doPrint = () => {
    setPreviewOpen(false)
    setTimeout(() => window.print(), 60)
  }
  const sendWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsApp(budget))
    const phone = (budget.client.phone || '').replace(/\D/g, '')
    window.open(`https://wa.me/${phone ? '55' + phone : ''}?text=${text}`, '_blank', 'noopener')
  }
  const saveBudget = async (status: 'open' | 'won' | 'lost' = 'open') => {
    if (!budget.cart.length) {
      alert('Adicione itens ao orçamento antes de salvar!')
      return
    }
    setSaving(true)
    const res = await budget.saveBudgetToServer(status)
    setSaving(false)
    if (res.success) {
      alert(`Orçamento salvo com sucesso no banco como "${status === 'won' ? 'Fechado' : 'Em aberto'}"!`)
    } else {
      alert('Erro ao salvar no banco: ' + res.error)
    }
  }

  return (
    <PageLayout maxWidth="wide" className={drawerOpen ? 'drawer-open' : ''}>
      <div className="app-body no-print">
        <PageHeader
          title="Gerador de Orçamentos"
          subtitle="Configure itens, tamanhos e quantidades para gerar orçamentos instantâneos."
          eyebrow="Teixeira de Freitas — BA"
          actions={<ClearAction />}
          className="col-span-full"
        />
        {/* configurador */}
        <div className="config-col">
          <div className="panel cat-tabs-wrap">
            <CategoryTabs />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={budget.activeCat}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'inherit' }}
            >
              <Configurator />
              <Simulator />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* checkout */}
        <div className="checkout-col">
          <button
            type="button"
            className="btn btn--ghost drawer-close"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => setDrawerOpen(false)}
          >
            {CloseIcon}Fechar
          </button>

          <ClientForm />
          <BudgetCart />
          <Conditions />

          <div className="panel glass-panel">
            <Totals />
            <div className="col" style={{ marginTop: 18 }}>
              <button type="button" className="btn btn--primary btn--block btn--lg" onClick={doPrint}>
                {PrintIcon}Gerar orçamento / Imprimir
              </button>
              <div className="row" style={{ gap: 10 }}>
                <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setPreviewOpen(true)}>
                  {EyeIcon}Visualizar A4
                </button>
                <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={sendWhatsApp}>
                  {WaIcon}WhatsApp
                </button>
              </div>
              <div className="row" style={{ gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ flex: 1 }}
                  disabled={saving || !budget.cart.length}
                  onClick={() => saveBudget('open')}
                >
                  {SaveIcon} Salvar Aberto
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{ flex: 1, backgroundColor: '#10b981', borderColor: '#10b981' }}
                  disabled={saving || !budget.cart.length}
                  onClick={() => saveBudget('won')}
                >
                  {SaveIcon} Salvar Fechado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile */}
      <button type="button" className="cart-fab no-print" onClick={() => setDrawerOpen(true)}>
        {FabIcon}Orçamento{' '}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={budget.cart.length}
            className="badge"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          >
            {budget.cart.length}
          </motion.span>
        </AnimatePresence>
      </button>
      <div className="drawer-backdrop no-print" onClick={() => setDrawerOpen(false)} />

      {/* impressão / preview */}
      <PrintSheet />
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} onPrint={doPrint} />
    </PageLayout>
  )
}

export default function GeneratorPage() {
  return (
    <BudgetProvider>
      <GeneratorBody />
    </BudgetProvider>
  )
}
