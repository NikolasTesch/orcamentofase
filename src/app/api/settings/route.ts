import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { DEFAULT_SETTINGS } from '../../../lib/settings'

export async function GET() {
  try {
    const row = await prisma.settings.findUnique({ where: { id: 'default' } })
    const data = row ? { ...DEFAULT_SETTINGS, ...(row.data as object) } : DEFAULT_SETTINGS
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS, fallback: true })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data } = body
    if (!data) return NextResponse.json({ success: false, error: 'data is required' }, { status: 400 })

    const row = await prisma.settings.upsert({
      where: { id: 'default' },
      update: { data },
      create: { id: 'default', data },
    })
    return NextResponse.json({ success: true, data: row.data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
