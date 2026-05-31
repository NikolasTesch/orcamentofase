import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const charts = await prisma.sizeChart.findMany({
      include: {
        columns: { orderBy: { sortOrder: 'asc' } },
        rows: {
          include: { cells: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const data: Record<string, any> = {}
    for (const chart of charts) {
      data[chart.chartKey] = {
        chartId: chart.id,
        label: chart.label,
        svgType: chart.svgType,
        obs: chart.obs,
        columns: chart.columns.map((c) => ({ id: c.id, label: c.label, sortOrder: c.sortOrder })),
        rows: chart.rows.map((r) => ({
          id: r.id,
          sizeKey: r.sizeKey,
          cells: r.cells.map((cell) => ({ columnId: cell.columnId, cellId: cell.id, value: cell.value })),
        })),
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Failed to fetch sizes:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Atualiza valor de uma SizeCell
// Body: { cellId, value }
export async function POST(request: Request) {
  try {
    const { cellId, value } = await request.json()
    if (!cellId || value === undefined) {
      return NextResponse.json({ success: false, error: 'cellId e value são obrigatórios' }, { status: 400 })
    }
    const cell = await prisma.sizeCell.update({ where: { id: cellId }, data: { value: String(value) } })
    return NextResponse.json({ success: true, data: cell })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Atualiza obs de um SizeChart
// Body: { chartId, obs }
export async function PATCH(request: Request) {
  try {
    const { chartId, obs } = await request.json()
    if (!chartId || obs === undefined) {
      return NextResponse.json({ success: false, error: 'chartId e obs são obrigatórios' }, { status: 400 })
    }
    const chart = await prisma.sizeChart.update({ where: { id: chartId }, data: { obs: String(obs) } })
    return NextResponse.json({ success: true, data: chart })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Re-seed a partir de sizes.json
export async function DELETE() {
  try {
    const fs = require('fs')
    const path = require('path')
    const sizesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/defaults/sizes.json'), 'utf-8'))

    const charts = await prisma.sizeChart.findMany({
      include: { columns: true, rows: { include: { cells: true } } },
    })

    for (const chart of charts) {
      const chartSrc = sizesData[chart.chartKey]
      if (!chartSrc) continue
      await prisma.sizeChart.update({ where: { id: chart.id }, data: { obs: chartSrc.obs || '' } })
      for (const row of chart.rows) {
        const cellValues: string[] = chartSrc.rows[row.sizeKey] || []
        for (let ci = 0; ci < chart.columns.length; ci++) {
          const cell = row.cells.find((c) => c.columnId === chart.columns[ci].id)
          if (cell) {
            await prisma.sizeCell.update({ where: { id: cell.id }, data: { value: cellValues[ci] || '' } })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
