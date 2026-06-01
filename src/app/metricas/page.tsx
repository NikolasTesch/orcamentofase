"use client"

import { useEffect, useState, useMemo, ReactNode, useCallback } from 'react'
import PageLayout from '../../components/app/PageLayout'
import PageHeader from '../../components/app/PageHeader'

/* ---- dados mock (fallback quando banco está vazio) ---- */
interface MonthData { m: string; v: number }
const MOCK_MONTHS: MonthData[] = [
  { m: 'Dez', v: 248 }, { m: 'Jan', v: 196 }, { m: 'Fev', v: 271 },
  { m: 'Mar', v: 243 }, { m: 'Abr', v: 289 }, { m: 'Mai', v: 312 },
]

interface MixData { nm: string; v: number; c: string }
const MOCK_MIX: MixData[] = [
  { nm: 'Kit Esportivo', v: 34, c: '#AF0608' },
  { nm: 'Estampa Total', v: 23, c: '#D90429' },
  { nm: 'Camisa de Malha', v: 18, c: '#f59e0b' },
  { nm: 'Abadás', v: 14, c: '#10b981' },
  { nm: 'Outros', v: 11, c: '#9ca3af' },
]

interface RankData { nm: string; v: string; pct: number }
const MOCK_RANK: RankData[] = [
  { nm: 'Kit Esportivo', v: '62 orç.', pct: 100 },
  { nm: 'Estampa Total', v: '48 orç.', pct: 77 },
  { nm: 'Camisa de Malha', v: '39 orç.', pct: 63 },
  { nm: 'Abadás', v: '28 orç.', pct: 45 },
  { nm: 'Linha Social', v: '19 orç.', pct: 31 },
]

interface RecentData { cli: string; cat: string; val: string; st: 'won' | 'open' | 'lost'; lbl: string }
const MOCK_RECENT: RecentData[] = [
  { cli: 'Academia Fitness', cat: 'Camisa de Malha', val: 'R$ 10.018', st: 'won', lbl: 'Fechado' },
  { cli: 'Escolinha Craque BA', cat: 'Kit Esportivo', val: 'R$ 8.640', st: 'won', lbl: 'Fechado' },
  { cli: 'Bloco Unidos do Sul', cat: 'Abadás', val: 'R$ 14.200', st: 'open', lbl: 'Em aberto' },
  { cli: 'Colégio Horizonte', cat: 'Linha Social', val: 'R$ 6.120', st: 'open', lbl: 'Em aberto' },
  { cli: 'Loja Mundo Esporte', cat: 'Estampa Total', val: 'R$ 22.480', st: 'won', lbl: 'Fechado' },
  { cli: 'Prefeitura — Eventos', cat: 'Bandeiras', val: 'R$ 3.260', st: 'lost', lbl: 'Perdido' },
]

interface KpiData { label: string; value: string; delta: string; cmp: string; icon: ReactNode }
const KPIS: KpiData[] = [
  { label: 'Orçamentos gerados', value: '184', delta: '+12%', cmp: 'vs. anterior', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></> },
  { label: 'Ticket médio', value: 'R$ 4.380', delta: '+6%', cmp: 'vs. anterior', icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
  { label: 'Taxa de fechamento', value: '38%', delta: '+3pp', cmp: 'vs. anterior', icon: <><path d="M22 12A10 10 0 1 1 12 2v10Z" /><path d="M12 2a10 10 0 0 1 10 10H12Z" /></> },
  { label: 'Faturamento estimado', value: 'R$ 312k', delta: '+9%', cmp: 'vs. anterior', icon: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></> },
]

const PERIOD_OPTIONS = [
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1m', label: 'Este mês' },
  { value: '1y', label: 'Este ano' },
]

const UpArrow = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m6 15 6-6 6 6" />
  </svg>
)

function Donut({ activeMix, totalCount }: { activeMix: MixData[]; totalCount: string }) {
  const C = 2 * Math.PI * 52
  let acc = 0
  const segs = activeMix.map((s) => {
    const dash = (s.v / 100) * C
    const seg = (
      <circle
        key={s.nm}
        cx="66" cy="66" r="52"
        fill="none"
        stroke={s.c}
        strokeWidth="20"
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={-acc}
        transform="rotate(-90 66 66)"
      />
    )
    acc += dash
    return seg
  })
  return (
    <svg width="132" height="132" viewBox="0 0 132 132">
      {segs}
      <text x="66" y="61" textAnchor="middle" fill="var(--text-primary)" fontFamily="var(--font-display)" fontWeight="800" fontSize="22">
        {totalCount}
      </text>
      <text x="66" y="80" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize="9">
        orçamentos
      </text>
    </svg>
  )
}

export default function MetricsPage() {
  const [period, setPeriod] = useState('6m')
  const [loading, setLoading] = useState(true)
  const [dbData, setDbData] = useState<any>(null)

  const fetchMetrics = useCallback((p: string) => {
    setLoading(true)
    fetch(`/api/metrics?period=${p}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && !res.empty && res.data) setDbData(res.data)
        else setDbData(null)
      })
      .catch((err) => {
        console.error('Error fetching metrics, using mocks:', err)
        setDbData(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchMetrics(period) }, [period, fetchMetrics])

  const activeKPIS = useMemo(() => {
    if (!dbData) return KPIS
    return KPIS.map((k) => {
      const dbKpi = dbData.kpis.find((dk: any) => dk.label === k.label)
      return { ...k, value: dbKpi ? dbKpi.value : k.value, delta: dbKpi ? '' : k.delta, cmp: dbKpi ? 'no período' : k.cmp }
    })
  }, [dbData])

  const activeRecent: RecentData[] = dbData ? dbData.recent : MOCK_RECENT
  const activeMix: MixData[] = dbData ? dbData.mix : MOCK_MIX
  const activeRank: RankData[] = dbData ? dbData.rank : MOCK_RANK
  const activeMonths: MonthData[] = dbData?.months?.length ? dbData.months : MOCK_MONTHS
  const totalCount = dbData ? dbData.kpis.find((k: any) => k.label === 'Orçamentos gerados')?.value || '0' : '184'

  const max = Math.max(...activeMonths.map((m) => m.v), 1)

  const periodSelect = (
    <select
      className="select"
      style={{ width: 'auto' }}
      value={period}
      onChange={(e) => setPeriod(e.target.value)}
    >
      {PERIOD_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )

  return (
    <PageLayout maxWidth="wide">
      <div className="admin-body">
        <PageHeader
          title="Desempenho comercial"
          subtitle="Acompanhe orçamentos emitidos, ticket médio, taxa de fechamento e faturamento estimado da equipe de vendas."
          eyebrow="Visão geral · tempo real"
          actions={periodSelect}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Carregando métricas…
          </div>
        ) : (
          <>
            <div className="kpi-grid">
              {activeKPIS.map((k) => (
                <div className="panel kpi" key={k.label}>
                  <div className="kpi__label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{k.icon}</svg>
                    {k.label}
                  </div>
                  <div className="kpi__value">{k.value}</div>
                  <div className={`kpi__delta ${k.delta ? 'up' : ''}`}>
                    {k.delta && UpArrow}
                    {k.delta || 'Sincronizado'} <span>{k.cmp}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="metrics-2col">
              <div className="panel chart-card">
                <div className="chart-card__head">
                  <h3>Faturamento por mês</h3>
                  <span className="meta">em R$ mil · {PERIOD_OPTIONS.find((o) => o.value === period)?.label}</span>
                </div>
                <div className="bars">
                  {activeMonths.map((m) => (
                    <div className="bar-col" key={m.m}>
                      <div className="bar" style={{ height: `${((m.v / max) * 100).toFixed(1)}%` }}>
                        <span className="bar__val">R$ {m.v}k</span>
                      </div>
                      <span className="lbl">{m.m}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel chart-card">
                <div className="chart-card__head">
                  <h3>Mix por categoria</h3>
                  <span className="meta">% faturamento</span>
                </div>
                <div className="donut-wrap">
                  <Donut activeMix={activeMix} totalCount={totalCount} />
                  <div className="legend">
                    {activeMix.map((s: any) => (
                      <div className="legend__row" key={s.nm}>
                        <span className="legend__dot" style={{ background: s.c }} />
                        <span className="nm">{s.nm}</span>
                        <span className="vl">{s.v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="metrics-2col">
              <div className="panel chart-card">
                <div className="chart-card__head">
                  <h3>Orçamentos recentes</h3>
                  <span className="meta">{dbData ? 'últimos cadastrados' : 'últimos 6'}</span>
                </div>
                <table className="mtable">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Categoria</th>
                      <th className="ar">Valor</th>
                      <th className="ar">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRecent.map((r: any, idx: number) => (
                      <tr key={`${r.cli}-${idx}`}>
                        <td>{r.cli}</td>
                        <td>{r.cat}</td>
                        <td className="num ar">{r.val}</td>
                        <td className="ar">
                          <span className={`status-dot ${r.st}`}>
                            <i />
                            {r.lbl}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel chart-card">
                <div className="chart-card__head">
                  <h3>Categorias mais vendidas</h3>
                  <span className="meta">no período</span>
                </div>
                <div className="rank">
                  {activeRank.map((r: any, i: number) => (
                    <div className="rank__row" key={r.nm}>
                      <span className="rank__pos">{i + 1}</span>
                      <div className="rank__bar-wrap">
                        <div className="rank__nm">
                          {r.nm}
                          <span className="v">{r.v}</span>
                        </div>
                        <div className="rank__track">
                          <div className="rank__fill" style={{ width: `${r.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}
