import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: { orderBy: { changedAt: 'desc' } },
      },
    })
    if (!budget) return NextResponse.json({ success: false, error: 'Orçamento não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: budget })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { statusNotes, ...updateData } = body

    const oldBudget = await prisma.budget.findUnique({ where: { id } })
    if (!oldBudget) return NextResponse.json({ success: false, error: 'Orçamento não encontrado' }, { status: 404 })

    const safeUpdate: any = {}
    const allowedFields = [
      'clientName','clientPhone','clientPartnership','delivery','validity','notes',
      'subtotal','partnerDiscount','discountType','discountValue','additionalDiscount',
      'netTotal','entryValue','status','attachSizes','selectedSizeChartId',
    ]
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) safeUpdate[field] = updateData[field]
    }

    const updated = await prisma.budget.update({ where: { id }, data: safeUpdate })

    if (updateData.status && updateData.status !== oldBudget.status) {
      await prisma.budgetStatusEvent.create({
        data: {
          budgetId: id,
          fromStatus: oldBudget.status,
          toStatus: updateData.status,
          notes: statusNotes || null,
        },
      })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.budget.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
