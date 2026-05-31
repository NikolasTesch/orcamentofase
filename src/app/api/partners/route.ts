import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: partners })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, kitDiscount, sportDiscount, promoDiscount, logoNote } = body
    if (!name) {
      return NextResponse.json({ success: false, error: 'name é obrigatório' }, { status: 400 })
    }
    const partner = await prisma.partner.create({
      data: {
        name,
        kitDiscount: Number(kitDiscount) || 0,
        sportDiscount: Number(sportDiscount) || 0,
        promoDiscount: Number(promoDiscount) || 0,
        logoNote: logoNote !== false,
      },
    })
    return NextResponse.json({ success: true, data: partner }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
