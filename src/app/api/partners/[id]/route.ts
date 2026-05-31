import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { kitDiscount, sportDiscount, promoDiscount, isActive, logoNote } = body
    const data: any = {}
    if (kitDiscount !== undefined) data.kitDiscount = Number(kitDiscount)
    if (sportDiscount !== undefined) data.sportDiscount = Number(sportDiscount)
    if (promoDiscount !== undefined) data.promoDiscount = Number(promoDiscount)
    if (isActive !== undefined) data.isActive = Boolean(isActive)
    if (logoNote !== undefined) data.logoNote = Boolean(logoNote)

    const partner = await prisma.partner.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: partner })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.partner.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
