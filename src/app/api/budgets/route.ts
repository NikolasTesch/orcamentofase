import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json({ success: true, data: budgets })
  } catch (error: any) {
    console.error('Failed to fetch budgets from database:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      clientName,
      clientPhone,
      clientPartnership,
      delivery,
      validity,
      subtotal,
      partnerDiscount,
      additionalDiscount,
      netTotal,
      entryValue,
      status,
      items,
    } = body

    if (!clientName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client name and items are required' },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        clientName: clientName || '',
        clientPhone: clientPhone || '',
        clientPartnership: clientPartnership || 'Nenhuma',
        delivery: Number(delivery) || 30,
        validity: Number(validity) || 7,
        subtotal: Number(subtotal) || 0,
        partnerDiscount: Number(partnerDiscount) || 0,
        additionalDiscount: Number(additionalDiscount) || 0,
        netTotal: Number(netTotal) || 0,
        entryValue: Number(entryValue) || 0,
        status: status || 'open',
        items: {
          create: items.map((it: any) => ({
            catId: it.catId || '',
            kind: it.kind || '',
            desc: it.desc || '',
            qty: Number(it.qty) || 0,
            unit: Number(it.unit) || 0,
            snap: it.snap || {},
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (error: any) {
    console.error('Failed to save budget:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save budget' },
      { status: 500 }
    )
  }
}
