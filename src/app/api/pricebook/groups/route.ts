import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.priceCategory.findMany({
      include: {
        groups: true,
      },
    })

    const brackets = await prisma.priceBracket.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    const bracketIds = brackets.map((b) => b.id)

    const data: Record<string, any> = {}
    for (const cat of categories) {
      for (const group of cat.groups) {
        data[`${cat.catKey}.${group.groupKey}`] = {
          id: group.id,
          bracketIds,
        }
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Failed to fetch pricebook groups:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
