"use client"

import { useEffect, useState, useMemo } from 'react'
import PageLayout from '../../components/app/PageLayout'
import PageHeader from '../../components/app/PageHeader'
import { fmtBRL } from '../../data/pricebook'

interface BudgetItem {
  id: string
  catId: string
  desc: string
  qty: number
  unit: number
}

interface Budget {
  id: string
  number: number
  createdAt: string
  clientName: string
  clientPhone: string
  clientPartnership: string
  netTotal: number
  subtotal: number
  partnerDiscount: number
  additionalDiscount: number
  entryValue: number
  delivery: number
  validity: number
  status: 'open' | 'won' | 'lost'
  items: BudgetItem[]
}

const STATUS_LABELS: Record<string, string> = { open: 'Em aberto', won: 'Fechado', lost: 'Perdido' }
const STATUS_FILTER = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Em aberto' },
  { value: 'won', label: 'Fechados' },
  { value: 'lost', label: 'Perdidos' },
]

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)

function statusClass(s: string) {
  if (s === 'won') return 'won'
  if (s === 'lost') return 'lost'
  return 'open'
}

export default function HistoricoPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [toast, setToast] = useState({ show: false, text: '', ok: true })

  const load = () => {
    setLoading(true)
    fetch('/api/budgets')
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setBudgets(r.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const flashToast = (text: string, ok = true) => {
    setToast({ show: true, text, ok })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200)
  }

  const updateStatus = async (id: string, status: 'open' | 'won' | 'lost') => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const r = await res.json()
      if (r.success) {
        setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
        flashToast(`Status atualizado para "${STATUS_LABELS[status]}"`)
      } else {
        flashToast('Erro ao atualizar: ' + (r.error || ''), false)
      }
    } catch {
      flashToast('Erro de conexão', false)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return budgets.filter((b) => {
      const matchStatus = filterStatus === 'all' || b.status === filterStatus
      const matchSearch =
        !q ||
        b.clientName.toLowerCase().includes(q) ||
        b.clientPhone.includes(q) ||
        String(b.number).includes(q)
      return matchStatus && matchSearch
    })
  }, [budgets, search, filterStatus])

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const actions = (
    <button type="button" className="btn btn--ghost" onClick={load}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
      </svg>
      Atualizar
    </button>
  )

  return (
    <PageLayout maxWidth="wide">
      <div className="admin-body">
        <PageHeader
          title="Histórico de orçamentos"
          subtitle="Consulte, filtre e atualize o status de todos os orçamentos gerados pela equipe."
          eyebrow={`${budgets.length} orçamentos no banco`}
          actions={actions}
        />

        {/* Filtros */}
        <div className="panel glass-panel" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
              {SearchIcon}
            </span>
            <input
              className="pe-input"
              type="text"
              placeholder="Buscar por cliente, telefone ou nº…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, fontSize: 14 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_FILTER.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`btn ${filterStatus === f.value ? 'btn--primary' : 'btn--ghost'}`}
                style={{ minWidth: 90 }}
                onClick={() => setFilterStatus(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Carregando orçamentos…
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            {budgets.length === 0 ? 'Nenhum orçamento salvo ainda.' : 'Nenhum resultado para o filtro aplicado.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((b) => {
              const open = expanded === b.id
              return (
                <div key={b.id} className="panel glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Linha resumo */}
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '56px 1fr auto auto auto',
                      gap: '12px 16px',
                      alignItems: 'center',
                      padding: '14px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit',
                    }}
                    onClick={() => setExpanded(open ? null : b.id)}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fase-red)', fontWeight: 700 }}>
                      #{String(b.number).padStart(4, '0')}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.clientName || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {fmt(b.createdAt)} · {b.items.length} {b.items.length === 1 ? 'item' : 'itens'}
                        {b.clientPartnership !== 'Nenhuma' && (
                          <span style={{ marginLeft: 8, color: 'var(--color-warning)', fontWeight: 600 }}>
                            {b.clientPartnership}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
                      {fmtBRL(b.netTotal)}
                    </span>
                    <span className={`status-dot ${statusClass(b.status)}`}>
                      <i />{STATUS_LABELS[b.status]}
                    </span>
                    <svg
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ width: 16, height: 16, transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {/* Detalhe expandido */}
                  {open && (
                    <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border-color)' }}>
                      {/* Itens */}
                      <table className="mtable" style={{ marginTop: 14, marginBottom: 14 }}>
                        <thead>
                          <tr>
                            <th>Qtd</th>
                            <th>Descrição</th>
                            <th className="ar">Unit.</th>
                            <th className="ar">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {b.items.map((it) => (
                            <tr key={it.id}>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>{it.qty}</td>
                              <td style={{ fontSize: 13 }}>{it.desc}</td>
                              <td className="num ar">{fmtBRL(it.unit)}</td>
                              <td className="num ar">{fmtBRL(it.unit * it.qty)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Totais + condições */}
                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        <span>Subtotal: <b>{fmtBRL(b.subtotal)}</b></span>
                        {b.partnerDiscount > 0 && <span>Desc. parceria: <b>−{fmtBRL(b.partnerDiscount)}</b></span>}
                        {b.additionalDiscount > 0 && <span>Desc. adicional: <b>−{fmtBRL(b.additionalDiscount)}</b></span>}
                        <span>Líquido: <b style={{ color: 'var(--text-primary)' }}>{fmtBRL(b.netTotal)}</b></span>
                        <span>Entrada 50%: <b>{fmtBRL(b.entryValue)}</b></span>
                        <span>Entrega: <b>{b.delivery} dias</b></span>
                        <span>Validade: <b>{b.validity} dias</b></span>
                        {b.clientPhone && <span>WhatsApp: <b>{b.clientPhone}</b></span>}
                      </div>

                      {/* Ações de status */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>
                          Alterar status:
                        </span>
                        {(['open', 'won', 'lost'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={b.status === s || updating === b.id}
                            className={`btn ${b.status === s ? 'btn--primary' : 'btn--ghost'}`}
                            style={{
                              fontSize: 12,
                              padding: '6px 14px',
                              ...(s === 'won' && b.status !== s ? { borderColor: '#10b981', color: '#10b981' } : {}),
                              ...(s === 'lost' && b.status !== s ? { borderColor: 'var(--color-danger)', color: 'var(--color-danger)' } : {}),
                            }}
                            onClick={() => updateStatus(b.id, s)}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div
        className={`saved-toast${toast.show ? ' show' : ''}`}
        style={!toast.ok ? { background: 'var(--color-danger)' } : undefined}
      >
        {toast.text}
      </div>
    </PageLayout>
  )
}
