import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const [categories, labelSettings] = await Promise.all([
      prisma.priceCategory.findMany({
        include: {
          groups: {
            include: { entries: { include: { bracket: true } } },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.settings.findUnique({ where: { id: 'priceLabels' } }),
    ])

    const pb: Record<string, any> = {}
    for (const cat of categories) {
      pb[cat.catKey] = {}
      for (const group of cat.groups) {
        if (group.groupType === 'SCALAR') {
          pb[cat.catKey][group.groupKey] = {}
          for (const entry of group.entries) {
            pb[cat.catKey][group.groupKey][entry.subKey!] = entry.value
          }
        } else if (group.groupType === 'BRACKET_ROW') {
          const sorted = [...group.entries].sort((a, b) => (a.bracket?.sortOrder ?? 0) - (b.bracket?.sortOrder ?? 0))
          pb[cat.catKey][group.groupKey] = sorted.map((e) => e.value)
        } else if (group.groupType === 'BRACKET_MATRIX') {
          pb[cat.catKey][group.groupKey] = {}
          for (const entry of group.entries) {
            if (!pb[cat.catKey][group.groupKey][entry.subKey!]) {
              pb[cat.catKey][group.groupKey][entry.subKey!] = [0, 0, 0, 0, 0]
            }
            pb[cat.catKey][group.groupKey][entry.subKey!][entry.bracket!.sortOrder] = entry.value
          }
        }
      }
    }

    // Constrói mapa de labels: catKey.groupKey -> { subKey: label }
    const labelsRaw = (labelSettings?.data as Record<string, Record<string, string>>) || {}
    const labels: Record<string, Record<string, string>> = {}
    for (const cat of categories) {
      for (const group of cat.groups) {
        const groupLabels = labelsRaw[group.id]
        if (groupLabels && Object.keys(groupLabels).length > 0) {
          labels[`${cat.catKey}.${group.groupKey}`] = groupLabels
        }
      }
    }

    return NextResponse.json({ success: true, data: pb, labels })
  } catch (error: any) {
    console.error('Failed to fetch pricebook:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { kind } = body

    // Atualiza label de um subKey
    if (kind === 'label') {
      const { groupId, subKey, label } = body
      if (!groupId || !subKey || label === undefined) {
        return NextResponse.json({ success: false, error: 'groupId, subKey e label obrigatórios' }, { status: 400 })
      }
      const current = await prisma.settings.findUnique({ where: { id: 'priceLabels' } })
      const data = ((current?.data || {}) as Record<string, Record<string, string>>)
      if (!data[groupId]) data[groupId] = {}
      data[groupId][subKey] = label
      await prisma.settings.upsert({
        where: { id: 'priceLabels' },
        create: { id: 'priceLabels', data },
        update: { data },
      })
      return NextResponse.json({ success: true })
    }

    // Atualiza valor de preço (comportamento original)
    const { groupId, subKey, bracketId, value } = body
    if (!groupId || value === undefined) {
      return NextResponse.json({ success: false, error: 'groupId e value são obrigatórios' }, { status: 400 })
    }
    const existing = await prisma.priceEntry.findFirst({
      where: { groupId, subKey: subKey ?? null, bracketId: bracketId ?? null },
    })
    let entry
    if (existing) {
      entry = await prisma.priceEntry.update({ where: { id: existing.id }, data: { value: Number(value) } })
    } else {
      const data: any = { groupId, value: Number(value) }
      if (subKey) data.subKey = subKey
      if (bracketId) data.bracketId = bracketId
      entry = await prisma.priceEntry.create({ data })
    }
    return NextResponse.json({ success: true, data: entry })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Re-seed PriceEntries + limpa órfãos + reseta labels
export async function DELETE() {
  try {
    const fs = require('fs')
    const path = require('path')
    const pb = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/defaults/pricebook.json'), 'utf-8'))
    const brackets = await prisma.priceBracket.findMany({ orderBy: { sortOrder: 'asc' } })

    const categories = await prisma.priceCategory.findMany({ include: { groups: true } })

    for (const cat of categories) {
      const catData = pb[cat.catKey]
      if (!catData) continue
      for (const group of cat.groups) {
        const rawData = catData[group.groupKey]
        if (!rawData) continue

        if (group.groupType === 'SCALAR') {
          const validKeys = Object.keys(rawData as Record<string, number>)
          // Deletar entradas órfãs (subKeys não existentes no pricebook.json)
          await prisma.priceEntry.deleteMany({
            where: { groupId: group.id, subKey: { notIn: validKeys } },
          })
          // Restaurar valores
          for (const [subKey, value] of Object.entries(rawData as Record<string, number>)) {
            const existing = await prisma.priceEntry.findFirst({ where: { groupId: group.id, subKey, bracketId: null } })
            if (existing) await prisma.priceEntry.update({ where: { id: existing.id }, data: { value: value as number } })
            else await prisma.priceEntry.create({ data: { groupId: group.id, subKey, value: value as number } })
          }
        } else if (group.groupType === 'BRACKET_ROW') {
          const arr = rawData as number[]
          for (let i = 0; i < arr.length; i++) {
            const existing = await prisma.priceEntry.findFirst({ where: { groupId: group.id, subKey: null, bracketId: brackets[i]?.id } })
            if (existing) await prisma.priceEntry.update({ where: { id: existing.id }, data: { value: arr[i] } })
            else await prisma.priceEntry.create({ data: { groupId: group.id, bracketId: brackets[i]?.id, value: arr[i] } })
          }
        } else if (group.groupType === 'BRACKET_MATRIX') {
          const validKeys = Object.keys(rawData as Record<string, number[]>)
          await prisma.priceEntry.deleteMany({
            where: { groupId: group.id, subKey: { notIn: validKeys } },
          })
          for (const [subKey, arr] of Object.entries(rawData as Record<string, number[]>)) {
            for (let i = 0; i < (arr as number[]).length; i++) {
              const existing = await prisma.priceEntry.findFirst({ where: { groupId: group.id, subKey, bracketId: brackets[i]?.id } })
              if (existing) await prisma.priceEntry.update({ where: { id: existing.id }, data: { value: (arr as number[])[i] } })
              else await prisma.priceEntry.create({ data: { groupId: group.id, subKey, bracketId: brackets[i]?.id, value: (arr as number[])[i] } })
            }
          }
        }
      }
    }

    // Reseta labels para os defaults
    await prisma.settings.deleteMany({ where: { id: 'priceLabels' } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
