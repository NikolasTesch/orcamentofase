import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

const CAT_LABEL: Record<string, string> = {
  kit_esportivo: 'Kit Esportivo',
  camisa_malha: 'Camisa de Malha',
  estampa_total: 'Estampa Total',
  camisa_pp: 'Camisa PP',
  social: 'Linha Social',
  tactel_helanca: 'Tactel & Helanca',
  bandeira: 'Bandeiras',
  abada: 'Abadás',
}

const CAT_COLOR: Record<string, string> = {
  kit_esportivo: '#AF0608',
  estampa_total: '#D90429',
  camisa_malha: '#f59e0b',
  abada: '#10b981',
  camisa_pp: '#3b82f6',
  social: '#8b5cf6',
  tactel_helanca: '#ec4899',
  bandeira: '#6b7280',
}

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)

function periodRange(period: string): { from: Date; to: Date } {
  const now = new Date()
  const to = now
  let from: Date

  if (period === '1m') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (period === '1y') {
    from = new Date(now.getFullYear(), 0, 1)
  } else {
    // default: 6m
    from = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  }

  return { from, to }
}

function monthlyChart(budgets: any[], from: Date, period: string) {
  // Build a map of year-month -> netTotal (won budgets only)
  const map = new Map<string, number>()

  const monthCount = period === '1y' ? 12 : period === '1m' ? 1 : 6
  const now = new Date()

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    map.set(key, 0)
  }

  budgets
    .filter((b) => b.status === 'won')
    .forEach((b) => {
      const d = new Date(b.createdAt)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + b.netTotal)
      }
    })

  return Array.from(map.entries()).map(([key, v]) => {
    const [year, month] = key.split('-').map(Number)
    return { m: MONTH_SHORT[month], v: Math.round(v / 1000) }
  })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6m'
    const { from, to } = periodRange(period)

    const totalCount = await prisma.budget.count()

    if (totalCount === 0) {
      return NextResponse.json({ success: true, empty: true })
    }

    // All budgets in period
    const budgets = await prisma.budget.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: { items: true },
    })

    const generated = budgets.length
    const sumNet = budgets.reduce((acc, b) => acc + b.netTotal, 0)
    const ticketAverage = generated > 0 ? sumNet / generated : 0

    const wonBudgets = budgets.filter((b) => b.status === 'won')
    const winRate = generated > 0 ? (wonBudgets.length / generated) * 100 : 0
    const totalRevenue = wonBudgets.reduce((acc, b) => acc + b.netTotal, 0)

    // Recent 6 (from all time, not filtered by period)
    const recentBudgetsRaw = await prisma.budget.findMany({
      take: 6,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    const recent = recentBudgetsRaw.map((b) => {
      const firstItem = b.items[0]
      const catLabel = firstItem ? CAT_LABEL[firstItem.catId] || 'Outros' : 'Nenhum'
      let statusLabel = 'Em aberto'
      if (b.status === 'won') statusLabel = 'Fechado'
      if (b.status === 'lost') statusLabel = 'Perdido'
      return {
        cli: b.clientName || 'Cliente sem nome',
        cat: catLabel,
        val: fmtBRL(b.netTotal),
        st: b.status as 'won' | 'open' | 'lost',
        lbl: statusLabel,
        createdAt: b.createdAt,
      }
    })

    // Mix por categoria (won budgets in period)
    const revenuePerCat: Record<string, number> = {}
    let totalItemsRevenue = 0
    wonBudgets.forEach((b) => {
      b.items.forEach((it) => {
        const itemRev = it.qty * it.unit
        revenuePerCat[it.catId] = (revenuePerCat[it.catId] || 0) + itemRev
        totalItemsRevenue += itemRev
      })
    })

    const mix = Object.entries(CAT_LABEL)
      .map(([catId, label]) => {
        const rev = revenuePerCat[catId] || 0
        const pct = totalItemsRevenue > 0 ? Math.round((rev / totalItemsRevenue) * 100) : 0
        return { nm: label, v: pct, c: CAT_COLOR[catId] || '#9ca3af', rev }
      })
      .sort((a, b) => b.v - a.v)

    const activeMix = totalItemsRevenue > 0 ? mix.filter((m) => m.v > 0) : mix.slice(0, 5)

    // Ranking
    const countPerCat: Record<string, number> = {}
    budgets.forEach((b) => {
      const uniqueCats = new Set(b.items.map((it) => it.catId))
      uniqueCats.forEach((catId) => {
        countPerCat[catId] = (countPerCat[catId] || 0) + 1
      })
    })

    const rank = Object.entries(CAT_LABEL)
      .map(([catId, label]) => ({ nm: label, count: countPerCat[catId] || 0 }))
      .sort((a, b) => b.count - a.count)

    const maxCount = Math.max(...rank.map((r) => r.count), 1)
    const rankWithPct = rank
      .map((r) => ({ nm: r.nm, v: `${r.count} orç.`, pct: Math.round((r.count / maxCount) * 100) }))
      .slice(0, 5)

    // Monthly chart
    const months = monthlyChart(budgets, from, period)

    return NextResponse.json({
      success: true,
      data: {
        period,
        kpis: [
          { label: 'Orçamentos gerados', value: String(generated) },
          { label: 'Ticket médio', value: fmtBRL(ticketAverage) },
          { label: 'Taxa de fechamento', value: `${Math.round(winRate)}%` },
          { label: 'Faturamento estimado', value: fmtBRL(totalRevenue) },
        ],
        months,
        recent,
        mix: activeMix,
        rank: rankWithPct,
      },
    })
  } catch (error: any) {
    console.error('Failed to calculate metrics from database:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate metrics' },
      { status: 500 },
    )
  }
}
