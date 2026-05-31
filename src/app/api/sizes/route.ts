import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { DEFAULT_SIZES } from '../../../data/sizes'

export async function GET() {
  try {
    const sizebook = await prisma.pricebook.findUnique({
      where: { id: 'sizes' },
    })

    if (sizebook) {
      return NextResponse.json({ success: true, data: sizebook.data })
    }

    return NextResponse.json({ success: true, data: DEFAULT_SIZES })
  } catch (error) {
    console.error('Failed to fetch size charts from database, using fallback:', error)
    return NextResponse.json({ success: true, data: DEFAULT_SIZES, fallback: true })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data) {
      return NextResponse.json({ success: false, error: 'Sizes data is required' }, { status: 400 })
    }

    const sizebook = await prisma.pricebook.upsert({
      where: { id: 'sizes' },
      update: { data },
      create: { id: 'sizes', data },
    })

    return NextResponse.json({ success: true, data: sizebook.data })
  } catch (error: any) {
    console.error('Failed to save sizes to database:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save sizes to database' },
      { status: 500 }
    )
  }
}
