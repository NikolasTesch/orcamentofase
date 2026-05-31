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

const fmtBRL = (n: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)
}

export async function GET() {
  try {
    const totalCount = await prisma.budget.count()

    if (totalCount === 0) {
      // If no data exists in Neon yet, return standard seed/mockups so the dashboard remains beautiful
      return NextResponse.json({ success: true, empty: true })
    }

    const budgets = await prisma.budget.findMany({
      include: { items: true },
    })

    // 1. Orçamentos gerados
    const generated = totalCount

    // 2. Ticket Médio
    const sumNet = budgets.reduce((acc, b) => acc + b.netTotal, 0)
    const ticketAverage = generated > 0 ? sumNet / generated : 0

    // 3. Taxa de Fechamento
    const wonBudgets = budgets.filter((b) => b.status === 'won')
    const winRate = generated > 0 ? (wonBudgets.length / generated) * 100 : 0

    // 4. Faturamento Estimado (Sum of net totals of 'won' budgets)
    const totalRevenue = wonBudgets.reduce((acc, b) => acc + b.netTotal, 0)

    // 5. Orçamentos Recentes (last 6)
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

    // 6. Mix por categoria (percentage of total revenue from won items)
    const revenuePerCat: Record<string, number> = {}
    let totalItemsRevenue = 0

    wonBudgets.forEach((b) => {
      b.items.forEach((it) => {
        const itemRev = it.qty * it.unit
        revenuePerCat[it.catId] = (revenuePerCat[it.catId] || 0) + itemRev
        totalItemsRevenue += itemRev
      })
    })

    const mix = Object.entries(CAT_LABEL).map(([catId, label]) => {
      const rev = revenuePerCat[catId] || 0
      const pct = totalItemsRevenue > 0 ? Math.round((rev / totalItemsRevenue) * 100) : 0
      return {
        nm: label,
        v: pct,
        c: CAT_COLOR[catId] || '#9ca3af',
        rev,
      }
    }).sort((a, b) => b.v - a.v)

    // Filter out categories with 0% mix if there's database sales, otherwise show all
    const activeMix = totalItemsRevenue > 0 ? mix.filter((m) => m.v > 0) : mix.slice(0, 5)

    // 7. Categorias mais vendidas (Ranking by number of items or budgets)
    const countPerCat: Record<string, number> = {}
    budgets.forEach((b) => {
      // count category presence
      const uniqueCatsInBudget = new Set(b.items.map((it) => it.catId))
      uniqueCatsInBudget.forEach((catId) => {
        countPerCat[catId] = (countPerCat[catId] || 0) + 1
      })
    })

    const rank = Object.entries(CAT_LABEL).map(([catId, label]) => {
      const count = countPerCat[catId] || 0
      return {
        nm: label,
        v: `${count} orç.`,
        count,
      }
    }).sort((a, b) => b.count - a.count)

    // Calculate relative percentage for progress bars based on maximum count
    const maxCount = Math.max(...rank.map((r) => r.count), 1)
    const rankWithPct = rank.map((r) => ({
      nm: r.nm,
      v: r.v,
      pct: Math.round((r.count / maxCount) * 100),
    })).slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        kpis: [
          { label: 'Orçamentos gerados', value: String(generated) },
          { label: 'Ticket médio', value: fmtBRL(ticketAverage) },
          { label: 'Taxa de fechamento', value: `${Math.round(winRate)}%` },
          { label: 'Faturamento estimado', value: fmtBRL(totalRevenue) },
        ],
        recent,
        mix: activeMix,
        rank: rankWithPct,
      },
    })
  } catch (error: any) {
    console.error('Failed to calculate metrics from database:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate metrics' },
      { status: 500 }
    )
  }
}
