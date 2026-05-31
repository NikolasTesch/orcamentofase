import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: any = {}
    if (status) where.status = status
    if (search) where.clientName = { contains: search, mode: 'insensitive' }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        include: {
          items: { select: { id: true, catId: true, kind: true, desc: true, qty: true, unit: true, total: true, partnerDiscount: true, netUnit: true, netTotal: true } },
          statusHistory: { orderBy: { changedAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.budget.count({ where }),
    ])

    return NextResponse.json({ success: true, data: budgets, total, page, limit })
  } catch (error: any) {
    console.error('Failed to fetch budgets:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      clientName, clientPhone, clientPartnership,
      delivery, validity, notes,
      subtotal, partnerDiscount, discountType, discountValue, additionalDiscount, netTotal, entryValue,
      attachSizes, selectedSizeChartId,
      status = 'open',
      items,
    } = body

    if (!clientName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'clientName e items são obrigatórios' }, { status: 400 })
    }

    const budget = await prisma.budget.create({
      data: {
        clientName: clientName || '',
        clientPhone: clientPhone || '',
        clientPartnership: clientPartnership || 'Nenhuma',
        delivery: Number(delivery) || 30,
        validity: Number(validity) || 7,
        notes: notes || null,
        subtotal: Number(subtotal) || 0,
        partnerDiscount: Number(partnerDiscount) || 0,
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue) || 0,
        additionalDiscount: Number(additionalDiscount) || 0,
        netTotal: Number(netTotal) || 0,
        entryValue: Number(entryValue) || 0,
        status: status as any,
        attachSizes: Boolean(attachSizes),
        selectedSizeChartId: selectedSizeChartId || null,
        items: {
          create: items.map((it: any) => ({
            catId: it.catId || '',
            kind: it.kind || '',
            desc: it.desc || '',
            qty: Number(it.qty) || 0,
            unit: Number(it.unit) || 0,
            total: Number(it.total) || Number(it.unit) * Number(it.qty) || 0,
            partnerDiscount: Number(it.partnerDiscount) || 0,
            netUnit: Number(it.netUnit) || Number(it.unit) || 0,
            netTotal: Number(it.netTotal) || Number(it.netUnit || it.unit) * Number(it.qty) || 0,
            snap: it.snap || {},
          })),
        },
        statusHistory: {
          create: { fromStatus: null, toStatus: status as any },
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, data: budget }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to save budget:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
