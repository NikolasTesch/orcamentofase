import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status || !['open', 'won', 'lost'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status inválido' }, { status: 400 })
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.budget.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
