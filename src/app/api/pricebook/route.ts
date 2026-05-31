import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { DEFAULT_PB } from '../../../data/pricebook'

export async function GET() {
  try {
    const pricebook = await prisma.pricebook.findUnique({
      where: { id: 'default' },
    })

    if (pricebook) {
      return NextResponse.json({ success: true, data: pricebook.data })
    }

    return NextResponse.json({ success: true, data: DEFAULT_PB })
  } catch (error) {
    console.error('Failed to fetch pricebook from database, using fallback:', error)
    // Graceful fallback to default pricebook if database is not fully connected yet
    return NextResponse.json({ success: true, data: DEFAULT_PB, fallback: true })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data) {
      return NextResponse.json({ success: false, error: 'Pricebook data is required' }, { status: 400 })
    }

    const pricebook = await prisma.pricebook.upsert({
      where: { id: 'default' },
      update: { data },
      create: { id: 'default', data },
    })

    return NextResponse.json({ success: true, data: pricebook.data })
  } catch (error: any) {
    console.error('Failed to save pricebook to database:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save pricebook to database' },
      { status: 500 }
    )
  }
}
