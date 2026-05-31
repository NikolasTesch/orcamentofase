import { PrismaClient, PriceGroupType } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Usa DIRECT_URL quando disponível (Neon pooler não vê as tabelas do mesmo schema)
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
})

const CATEGORY_META = [
  { catKey: 'kit_esportivo',  label: 'Kit Esportivo',     kind: 'kit',        hasBrackets: false, sortOrder: 0,
    icon: 'M12 3 4 7v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7l-8-4Z' },
  { catKey: 'camisa_malha',   label: 'Camisa de Malha',   kind: 'esportivo',  hasBrackets: true,  sortOrder: 1,
    icon: 'M4 7 8 4l4 2 4-2 4 3-3 3v9H7v-9L4 7Z' },
  { catKey: 'estampa_total',  label: 'Estampa Total',     kind: 'esportivo',  hasBrackets: true,  sortOrder: 2,
    icon: 'M13.5 4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM6 10a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm12 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-8 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z' },
  { catKey: 'camisa_pp',      label: 'Camisa PP',         kind: 'promocional',hasBrackets: true,  sortOrder: 3,
    icon: 'M3 11 21 6v12L3 13v-2Zm0 0v6' },
  { catKey: 'social',         label: 'Linha Social',      kind: 'esportivo',  hasBrackets: false, sortOrder: 4,
    icon: 'M6 3h12l-2 4 2 13H6L8 7 6 3Z' },
  { catKey: 'tactel_helanca', label: 'Tactel & Helanca',  kind: 'esportivo',  hasBrackets: false, sortOrder: 5,
    icon: 'M8 3h8v6l3 3v9H5v-9l3-3V3Z' },
  { catKey: 'bandeira',       label: 'Bandeiras',         kind: 'esportivo',  hasBrackets: false, sortOrder: 6,
    icon: 'M5 3v18M5 4h11l-2 4 2 4H5' },
  { catKey: 'abada',          label: 'Abadás',            kind: 'abada',      hasBrackets: true,  sortOrder: 7,
    icon: 'M9 4 4 9l5 11h6l5-11-5-5-3 2-3-2Z' },
]

const GROUP_META: Record<string, Array<{ groupKey: string; title: string; groupType: PriceGroupType; sortOrder: number }>> = {
  kit_esportivo:  [
    { groupKey: 'kit',    title: 'Preço por kit', groupType: 'SCALAR', sortOrder: 0 },
    { groupKey: 'extras', title: 'Adicionais (acréscimo unit.)', groupType: 'SCALAR', sortOrder: 1 },
  ],
  camisa_malha:   [
    { groupKey: 'tecMatrix', title: 'Preço base por tecido · por faixa de volume', groupType: 'BRACKET_MATRIX', sortOrder: 0 },
    { groupKey: 'gola',      title: 'Acréscimo por gola', groupType: 'SCALAR', sortOrder: 1 },
    { groupKey: 'extras',    title: 'Opcionais (acréscimo unit.)', groupType: 'SCALAR', sortOrder: 2 },
  ],
  estampa_total:  [
    { groupKey: 'areaMatrix', title: 'Preço base por área · por faixa de volume', groupType: 'BRACKET_MATRIX', sortOrder: 0 },
    { groupKey: 'gola',       title: 'Acréscimo por gola', groupType: 'SCALAR', sortOrder: 1 },
    { groupKey: 'tecido',     title: 'Acréscimo por tecido', groupType: 'SCALAR', sortOrder: 2 },
    { groupKey: 'extras',     title: 'Opcionais (acréscimo unit.)', groupType: 'SCALAR', sortOrder: 3 },
  ],
  camisa_pp:      [
    { groupKey: 'baseRow', title: 'Preço base · por faixa de volume', groupType: 'BRACKET_ROW', sortOrder: 0 },
    { groupKey: 'cor',     title: 'Cor da camisa', groupType: 'SCALAR', sortOrder: 1 },
    { groupKey: 'config',  title: 'Configuração', groupType: 'SCALAR', sortOrder: 2 },
    { groupKey: 'area',    title: 'Área da estampa', groupType: 'SCALAR', sortOrder: 3 },
    { groupKey: 'fotos',   title: 'Fotos (acréscimo)', groupType: 'SCALAR', sortOrder: 4 },
  ],
  social:         [
    { groupKey: 'peca',   title: 'Preço por peça', groupType: 'SCALAR', sortOrder: 0 },
    { groupKey: 'tecido', title: 'Acréscimo por tecido', groupType: 'SCALAR', sortOrder: 1 },
    { groupKey: 'extras', title: 'Detalhes (acréscimo unit.)', groupType: 'SCALAR', sortOrder: 2 },
  ],
  tactel_helanca: [
    { groupKey: 'linha',  title: 'Linha', groupType: 'SCALAR', sortOrder: 0 },
    { groupKey: 'peca',   title: 'Preço por peça', groupType: 'SCALAR', sortOrder: 1 },
    { groupKey: 'faixa',  title: 'Faixa etária', groupType: 'SCALAR', sortOrder: 2 },
    { groupKey: 'extras', title: 'Acabamento (acréscimo unit.)', groupType: 'SCALAR', sortOrder: 3 },
  ],
  bandeira:       [
    { groupKey: 'acab',   title: 'Acabamento · R$ por m²', groupType: 'SCALAR', sortOrder: 0 },
    { groupKey: 'tamM2',  title: 'Medida · área em m²', groupType: 'SCALAR', sortOrder: 1 },
    { groupKey: 'extras', title: 'Opcionais (acréscimo unit.)', groupType: 'SCALAR', sortOrder: 2 },
  ],
  abada:          [
    { groupKey: 'baseRow', title: 'Preço base · por faixa de volume', groupType: 'BRACKET_ROW', sortOrder: 0 },
    { groupKey: 'tecido',  title: 'Acréscimo por tecido', groupType: 'SCALAR', sortOrder: 1 },
    { groupKey: 'extras',  title: 'Acessórios (acréscimo unit.)', groupType: 'SCALAR', sortOrder: 2 },
  ],
}

const SIZE_CHART_META = [
  { chartKey: 'camisa_normal',   label: 'Tabela Camisa Normal - Unissex',            svgType: 'tshirt',  sortOrder: 0, columns: ['Altura','Largura'],        rows: ['PP','P','M','G','GG','XGG','XXGG'] },
  { chartKey: 'camisa_infantil', label: 'Tabela Camisa Infantil - Unissex',           svgType: 'tshirt',  sortOrder: 1, columns: ['Altura','Largura'],        rows: ['PPP','PP','P','M','G'] },
  { chartKey: 'camisa_social',   label: 'Tabela Camisas Social Masculinas',           svgType: 'social',  sortOrder: 2, columns: ['Altura','Largura','Braço'], rows: ['PP','P','M','G','GG','XGG','XXGG'] },
  { chartKey: 'calca_normal',    label: 'Tabela Calça Normal - Unissex - Com Elástico', svgType: 'pants', sortOrder: 3, columns: ['Nº','Altura','Largura'],   rows: ['PP','P','M','G','GG','XGG','XXGG'] },
  { chartKey: 'baby_look',       label: 'Tabela Camisa Baby Look - Feminino',         svgType: 'tshirt',  sortOrder: 4, columns: ['Altura','Largura'],        rows: ['PP','P','M','G','GG','XGG','XXGG'] },
]

const BRACKETS_META = [
  { label: '10–50',   minQty: 10,  maxQty: 50,     sortOrder: 0 },
  { label: '51–100',  minQty: 51,  maxQty: 100,    sortOrder: 1 },
  { label: '101–300', minQty: 101, maxQty: 300,    sortOrder: 2 },
  { label: '301–500', minQty: 301, maxQty: 500,    sortOrder: 3 },
  { label: '501+',    minQty: 501, maxQty: 999999, sortOrder: 4 },
]

async function main() {
  const defaultsDir = path.join(__dirname, '../src/data/defaults')
  const pb = JSON.parse(fs.readFileSync(path.join(defaultsDir, 'pricebook.json'), 'utf-8'))
  const sizesData = JSON.parse(fs.readFileSync(path.join(defaultsDir, 'sizes.json'), 'utf-8'))
  const partnersData = JSON.parse(fs.readFileSync(path.join(defaultsDir, 'partners.json'), 'utf-8'))

  console.log('🌱 Seeding price brackets...')
  const brackets: any[] = []
  for (const bMeta of BRACKETS_META) {
    const b = await prisma.priceBracket.upsert({
      where: { id: bMeta.label },
      create: { id: bMeta.label, ...bMeta },
      update: bMeta,
    })
    brackets.push(b)
  }

  console.log('🌱 Seeding price categories, groups, and entries...')
  for (const catMeta of CATEGORY_META) {
    const cat = await prisma.priceCategory.upsert({
      where: { catKey: catMeta.catKey },
      create: catMeta,
      update: catMeta,
    })

    const catData = pb[catMeta.catKey]
    const groupMetas = GROUP_META[catMeta.catKey] || []

    for (const gMeta of groupMetas) {
      const group = await prisma.priceGroup.upsert({
        where: { categoryId_groupKey: { categoryId: cat.id, groupKey: gMeta.groupKey } },
        create: { ...gMeta, categoryId: cat.id },
        update: gMeta,
      })

      const rawData = catData?.[gMeta.groupKey]
      if (!rawData) continue

      const upsertEntry = async (subKey: string | null, bracketId: string | null, value: number) => {
        const existing = await prisma.priceEntry.findFirst({ where: { groupId: group.id, subKey, bracketId } })
        if (existing) {
          await prisma.priceEntry.update({ where: { id: existing.id }, data: { value } })
        } else {
          const data: any = { groupId: group.id, value }
          if (subKey !== null) data.subKey = subKey
          if (bracketId !== null) data.bracketId = bracketId
          await prisma.priceEntry.create({ data })
        }
      }

      if (gMeta.groupType === 'SCALAR') {
        for (const [subKey, value] of Object.entries(rawData as Record<string, number>)) {
          if (typeof value !== 'number') continue
          await upsertEntry(subKey, null, value)
        }
      } else if (gMeta.groupType === 'BRACKET_ROW') {
        const arr = rawData as number[]
        for (let i = 0; i < arr.length; i++) {
          await upsertEntry(null, brackets[i].id, arr[i])
        }
      } else if (gMeta.groupType === 'BRACKET_MATRIX') {
        for (const [subKey, arr] of Object.entries(rawData as Record<string, number[]>)) {
          for (let i = 0; i < (arr as number[]).length; i++) {
            await upsertEntry(subKey, brackets[i].id, (arr as number[])[i])
          }
        }
      }
    }
  }

  console.log('🌱 Seeding size charts...')
  for (const chartMeta of SIZE_CHART_META) {
    const chartSrc = sizesData[chartMeta.chartKey]
    if (!chartSrc) { console.warn(`⚠️  sizes.json missing: ${chartMeta.chartKey}`); continue }

    const chart = await prisma.sizeChart.upsert({
      where: { chartKey: chartMeta.chartKey },
      create: { chartKey: chartMeta.chartKey, label: chartMeta.label, svgType: chartMeta.svgType,
                obs: chartSrc.obs || '', sortOrder: chartMeta.sortOrder },
      update: { label: chartMeta.label, svgType: chartMeta.svgType, obs: chartSrc.obs || '' },
    })

    const colMap: Record<string, any> = {}
    for (let i = 0; i < chartMeta.columns.length; i++) {
      const colId = `${chart.id}-col-${i}`
      const col = await prisma.sizeColumn.upsert({
        where: { id: colId },
        create: { id: colId, chartId: chart.id, label: chartMeta.columns[i], sortOrder: i },
        update: { label: chartMeta.columns[i] },
      })
      colMap[chartMeta.columns[i]] = col
    }

    for (let ri = 0; ri < chartMeta.rows.length; ri++) {
      const sizeKey = chartMeta.rows[ri]
      const rowId = `${chart.id}-row-${ri}`
      const row = await prisma.sizeRow.upsert({
        where: { id: rowId },
        create: { id: rowId, chartId: chart.id, sizeKey, sortOrder: ri },
        update: { sizeKey },
      })

      const cellValues: string[] = chartSrc.rows[sizeKey] || []
      for (let ci = 0; ci < chartMeta.columns.length; ci++) {
        const col = colMap[chartMeta.columns[ci]]
        const value = cellValues[ci] || ''
        await prisma.sizeCell.upsert({
          where: { rowId_columnId: { rowId: row.id, columnId: col.id } },
          create: { rowId: row.id, columnId: col.id, value },
          update: { value },
        })
      }
    }
  }

  console.log('🌱 Seeding partners...')
  for (const p of partnersData) {
    await prisma.partner.upsert({
      where: { name: p.name },
      create: p,
      update: p,
    })
  }

  console.log('✅ Seed concluído com sucesso!')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
