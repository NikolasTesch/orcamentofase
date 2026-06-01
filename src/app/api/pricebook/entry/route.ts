import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Deleta todas as PriceEntry de um grupo+subKey (remove item da tabela)
export async function DELETE(request: Request) {
  try {
    const { groupId, subKey } = await request.json()
    if (!groupId || !subKey) {
      return NextResponse.json({ success: false, error: 'groupId e subKey obrigatórios' }, { status: 400 })
    }

    await prisma.priceEntry.deleteMany({ where: { groupId, subKey } })

    // Remove o label do registro de labels nas Settings
    const labelSettings = await prisma.settings.findUnique({ where: { id: 'priceLabels' } })
    if (labelSettings?.data) {
      const data = labelSettings.data as Record<string, Record<string, string>>
      if (data[groupId]?.[subKey] !== undefined) {
        delete data[groupId][subKey]
        await prisma.settings.update({ where: { id: 'priceLabels' }, data: { data } })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
