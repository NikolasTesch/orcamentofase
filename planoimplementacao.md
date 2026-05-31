# Plano de Implementação — Fase Esporte: Orçamento como Coração

**Versão:** 3.0  
**Data:** 31 de Maio de 2026  
**Status:** Aguardando execução  
**Banco:** Neon PostgreSQL (Must Have confirmado)

---

## Visão Geral e Decisões Confirmadas

Este plano detalha a implementação completa de um banco de dados relacional no **Neon** via Prisma para substituir os dados hardcoded e o `localStorage`. O **gerador de orçamentos** se torna o coração do produto, com histórico completo, rastreamento de status e métricas em tempo real.

| Decisão | Status |
|---|---|
| Schema relacional completo (sem Json blobs para preços/medidas) | ✅ Confirmado |
| Histórico de orçamentos com funil de conversão | ✅ Confirmado |
| Sem `localStorage` — JSON não-commitado como seed | ✅ Confirmado |
| Neon PostgreSQL como banco definitivo (Must Have) | ✅ Confirmado |

---

## Estado Atual vs. Estado Alvo

### O que existe hoje
- `prisma/schema.prisma`: modelos `Pricebook` (Json blob), `Budget`, `BudgetLineItem` (básico)
- `src/data/pricebook.ts`: preços hardcoded em `DEFAULT_PB` + localStorage
- `src/data/sizes.ts`: medidas hardcoded em `DEFAULT_SIZES` + localStorage
- `src/data/prices.ts`: estrutura legada
- `PARTNERS` hardcoded em `pricebook.ts`
- `/api/pricebook`: salva Json blob inteiro
- `/api/sizes`: inexistente (apenas em BudgetContext)
- `/api/budgets`: GET e POST básicos
- `/metricas`: dados 100% mockados, fallback para mocks se API falhar
- `/tabela`: lê localStorage via `getPB()`, salva Json blob no banco

### O que teremos
- Schema 100% relacional com 12 modelos e 2 enums
- JSONs privados (gitignored) como única fonte de valores reais
- Seed idempotente que popula o banco a partir dos JSONs
- APIs granulares (editar uma célula, não o documento inteiro)
- `BudgetContext` com persistência real, histórico de status, `clearBudget`
- Gerador com bracket pill, badges de parceria, botão salvar integrado
- `/metricas` com dados 100% reais do banco

---

## FASE 1 — Schema Prisma Relacional Completo

### Arquivo: `prisma/schema.prisma`

**Substituir completamente o conteúdo atual pelo schema abaixo:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ═══════════════════════════════════════════════════════
// TABELA DE PREÇOS — Estrutura relacional por categoria
// ═══════════════════════════════════════════════════════

// Representa cada uma das 8 categorias do sistema
// (kit_esportivo, camisa_malha, estampa_total, etc.)
model PriceCategory {
  id          String       @id @default(uuid())
  catKey      String       @unique   // "camisa_malha", "kit_esportivo", etc.
  label       String                 // "Camisa de Malha"
  icon        String                 // SVG path d do ícone
  kind        String                 // "kit" | "esportivo" | "promocional" | "abada"
  hasBrackets Boolean      @default(false)  // Se usa faixas de volume
  sortOrder   Int          @default(0)
  groups      PriceGroup[]

  @@map("price_categories")
}

// As 5 faixas de volume (10-50, 51-100, 101-300, 301-500, 501+)
// Compartilhada por todas as categorias que usam brackets
model PriceBracket {
  id        String       @id @default(uuid())
  label     String                 // "10–50", "51–100", etc.
  minQty    Int
  maxQty    Int                    // 999999 para representar Infinity
  sortOrder Int          @default(0)
  entries   PriceEntry[]

  @@map("price_brackets")
}

// Grupos de precificação dentro de uma categoria
// Ex: camisa_malha tem grupos: tecMatrix, gola, extras
// Ex: kit_esportivo tem grupos: kit, extras
model PriceGroup {
  id         String         @id @default(uuid())
  categoryId String
  category   PriceCategory  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  groupKey   String         // "tecMatrix", "gola", "extras", "baseRow", "peca", etc.
  title      String         // Título de exibição na tela /tabela
  groupType  PriceGroupType
  sortOrder  Int            @default(0)
  entries    PriceEntry[]

  @@unique([categoryId, groupKey])
  @@map("price_groups")
}

// Tipos de grupo que determinam como os valores são interpretados
enum PriceGroupType {
  SCALAR          // Mapa chave→valor sem faixas. Ex: gola { polo: 4, redonda: 0, v: 0 }
  BRACKET_ROW     // Uma linha de 5 valores indexada por faixa. Ex: baseRow [28,26,24,22,20]
  BRACKET_MATRIX  // N linhas × 5 faixas. Ex: tecMatrix { PP:[44,41,...], PV:[52,...] }
}

// Valor individual de preço. Cobre todos os 3 tipos de grupo:
// SCALAR:         subKey="polo",  bracketId=null,   value=4
// BRACKET_ROW:    subKey=null,    bracketId=<id51>, value=26
// BRACKET_MATRIX: subKey="PP",   bracketId=<id51>, value=41
model PriceEntry {
  id        String        @id @default(uuid())
  groupId   String
  group     PriceGroup    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  subKey    String?                // null para BRACKET_ROW
  bracketId String?                // null para SCALAR
  bracket   PriceBracket? @relation(fields: [bracketId], references: [id])
  value     Float
  updatedAt DateTime      @updatedAt

  @@unique([groupId, subKey, bracketId])
  @@map("price_entries")
}

// ═══════════════════════════════════════════════════════
// TABELA DE MEDIDAS — Estrutura relacional por grade
// ═══════════════════════════════════════════════════════

// Representa cada uma das 5 grades de tamanho
// (camisa_normal, camisa_infantil, camisa_social, calca_normal, baby_look)
model SizeChart {
  id        String       @id @default(uuid())
  chartKey  String       @unique   // "camisa_normal", "baby_look", etc.
  label     String                 // "Tabela Camisa Normal - Unissex"
  svgType   String                 // "tshirt" | "social" | "pants"
  obs       String       @default("")  // Observações técnicas editáveis
  sortOrder Int          @default(0)
  columns   SizeColumn[]
  rows      SizeRow[]

  @@map("size_charts")
}

// Colunas da grade (Tamanho, Altura, Largura, Braço)
// Nota: "Tamanho" é sempre a primeira coluna e é o sizeKey da SizeRow
model SizeColumn {
  id        String     @id @default(uuid())
  chartId   String
  chart     SizeChart  @relation(fields: [chartId], references: [id], onDelete: Cascade)
  label     String     // "Tamanho", "Altura", "Largura", "Braço"
  sortOrder Int        @default(0)
  cells     SizeCell[]

  @@map("size_columns")
}

// Linhas da grade (PP, P, M, G, GG, XGG, XXGG ou PPP, 34, 36/38, etc.)
model SizeRow {
  id        String     @id @default(uuid())
  chartId   String
  chart     SizeChart  @relation(fields: [chartId], references: [id], onDelete: Cascade)
  sizeKey   String     // "PP", "P", "M", "34", "36/38", etc.
  sortOrder Int        @default(0)
  cells     SizeCell[]

  @@map("size_rows")
}

// Célula individual da grade (valor editável pelo admin)
model SizeCell {
  id        String     @id @default(uuid())
  rowId     String
  row       SizeRow    @relation(fields: [rowId], references: [id], onDelete: Cascade)
  columnId  String
  column    SizeColumn @relation(fields: [columnId], references: [id], onDelete: Cascade)
  value     String     // "70 cm", "49 cm", "62 cm", etc.
  updatedAt DateTime   @updatedAt

  @@unique([rowId, columnId])
  @@map("size_cells")
}

// ═══════════════════════════════════════════════════════
// PARCERIAS — Descontos por tipo de item
// ═══════════════════════════════════════════════════════

// Tabela de parcerias comerciais e seus descontos por categoria de item
// Regra de negócio: Abadás (kind="abada") são SEMPRE isentos — hard-coded no código, não aqui
model Partner {
  id            String  @id @default(uuid())
  name          String  @unique   // "Academias", "Escolinhas de Futebol", etc.
  kitDiscount   Int     @default(0)   // % desconto para items kind="kit"
  sportDiscount Int     @default(0)   // % desconto para items kind="esportivo"
  promoDiscount Int     @default(0)   // % desconto para items kind="promocional"
  isActive      Boolean @default(true)
  logoNote      Boolean @default(true)  // Se deve exibir nota "Inclusa logo da Fase"
  sortOrder     Int     @default(0)

  @@map("partners")
}

// ═══════════════════════════════════════════════════════
// ORÇAMENTOS — Core do produto com histórico completo
// ═══════════════════════════════════════════════════════

enum BudgetStatus {
  open   // Em aberto / Rascunho salvo
  won    // Fechado / Ganho
  lost   // Perdido
}

model Budget {
  id                  String              @id @default(uuid())
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  // Dados do cliente
  clientName          String
  clientPhone         String              @default("")
  clientPartnership   String              @default("Nenhuma")  // Nome da parceria selecionada

  // Condições comerciais
  delivery            Int                 @default(30)   // Prazo em dias
  validity            Int                 @default(7)    // Validade em dias
  notes               String?                            // Observações livres

  // Valores financeiros (desnormalizados para consultas rápidas)
  subtotal            Float               @default(0)    // Soma bruta dos itens
  partnerDiscount     Float               @default(0)    // Total de desconto de parceria em R$
  discountType        String              @default("percentage")  // "percentage" | "fixed"
  discountValue       Float               @default(0)    // % ou R$ do desconto adicional
  additionalDiscount  Float               @default(0)    // Valor do desconto adicional em R$
  netTotal            Float               @default(0)    // Valor líquido final
  entryValue          Float               @default(0)    // 50% de entrada sugerida

  // Status e rastreamento
  status              BudgetStatus        @default(open)

  // Configurações de impressão
  attachSizes         Boolean             @default(false)
  selectedSizeChartId String?             // chartKey da grade selecionada

  items               BudgetLineItem[]
  statusHistory       BudgetStatusEvent[]

  @@map("budgets")
}

// Item individual no carrinho do orçamento
// Desnormaliza netUnit e netTotal para evitar recalcular ao consultar métricas
model BudgetLineItem {
  id              String  @id @default(uuid())
  budgetId        String
  budget          Budget  @relation(fields: [budgetId], references: [id], onDelete: Cascade)

  catId           String  // ID da categoria: "camisa_malha", "kit_esportivo", etc.
  kind            String  // "kit" | "esportivo" | "promocional" | "abada"
  desc            String  // Descrição técnica gerada automaticamente

  qty             Int
  unit            Float   // Preço unitário calculado (ANTES do desconto de parceria)
  total           Float   // qty × unit (bruto, sem descontos)

  partnerDiscount Float   @default(0)  // % de desconto de parceria aplicado neste item
  netUnit         Float   // unit × (1 - partnerDiscount/100)
  netTotal        Float   // qty × netUnit (após desconto de parceria)

  snap            Json    // Snapshot completo do estado do configurador no momento da adição

  @@map("budget_line_items")
}

// Rastreia cada transição de status do orçamento
// Alimenta o funil de conversão nas métricas
model BudgetStatusEvent {
  id         String        @id @default(uuid())
  budgetId   String
  budget     Budget        @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  fromStatus BudgetStatus?              // null na criação inicial
  toStatus   BudgetStatus
  changedAt  DateTime      @default(now())
  notes      String?                    // Motivo da mudança (ex: "Cliente desistiu por prazo")

  @@map("budget_status_events")
}
```

### Comandos a executar

```bash
# 1. Aplicar a migração
npx prisma migrate dev --name relational_schema

# 2. Regenerar o cliente Prisma
npx prisma generate
```

> **Atenção:** A migração vai **dropar** os modelos `Pricebook` (antigo) e recriar `Budget`/`BudgetLineItem` com novos campos. Os dados de orçamentos existentes serão perdidos nesta migração.

---

## FASE 2 — Seed Data (JSONs Privados + Script)

### Estrutura de diretórios

```
src/data/defaults/
├── pricebook.json          ← GITIGNORED — preços reais
├── sizes.json              ← GITIGNORED — medidas reais
├── partners.json           ← GITIGNORED — parcerias reais
├── pricebook.example.json  ← Commitado — estrutura com valores zero
└── sizes.example.json      ← Commitado — estrutura exemplo
```

### `src/data/defaults/pricebook.json` (GITIGNORED — estrutura)

```json
{
  "kit_esportivo": {
    "kit": { "prata": 72, "ouro": 94, "prof": 128, "premium": 168 },
    "extras": { "nome": 7, "colete": 22, "goleiro": 38, "meiao": 12 }
  },
  "camisa_malha": {
    "tecMatrix": {
      "PP":    [44, 41, 38, 36, 34],
      "PV":    [52, 48, 45, 42, 40],
      "DRY":   [61, 57, 53, 50, 47],
      "PIQUET":[66, 62, 58, 54, 51]
    },
    "gola": { "polo": 4, "redonda": 0, "v": 0 },
    "extras": { "ml": 4, "bolso": 5, "reflex": 7, "nome": 6, "lapela": 5 }
  },
  "estampa_total": {
    "areaMatrix": {
      "fc_manga": [86, 80, 74, 69, 65],
      "fc":       [71, 66, 61, 57, 54],
      "frente":   [57, 53, 49, 46, 44]
    },
    "gola":   { "redonda": 0, "v": 0, "polo": 4 },
    "tecido": { "PP": 0, "DRY": 5, "CAMB": 9 },
    "extras": { "nome": 6, "sm": -3, "mll": 4, "mle": 12 }
  },
  "camisa_pp": {
    "baseRow": [24, 21, 19, 17, 16],
    "cor":     { "branca": 0, "cores": 5 },
    "config":  { "fc": 5, "pc": 3 },
    "area":    { "lisa": 0, "frente": 7, "costas": 7, "peito": 5 },
    "fotos":   { "ff": 40, "ffc": 45 }
  },
  "social": {
    "peca":   { "jaleco": 49, "calca": 56, "mc": 62, "ml": 68, "blazer": 142 },
    "tecido": { "Unioffice": 0, "Ibiza": 14 },
    "extras": { "frisos": 7, "revel": 6, "bordado": 12 }
  },
  "tactel_helanca": {
    "linha": { "Tactel": 0, "Helanca": 8 },
    "peca":  { "short": 34, "bermuda": 41, "calca": 56, "jaqueta": 84, "agasalho": 129 },
    "faixa": { "Adulto": 0, "Infantil": -9 },
    "extras":{ "stamp": 13, "bolso": 6 }
  },
  "bandeira": {
    "acab":  { "simples": 50, "dupla": 80 },
    "tamM2": { "p": 0.35, "m": 1.5, "g": 2.6, "gg": 6.0 },
    "extras":{ "haste": 70, "base": 90, "costura": 22 },
    "wind_banner": { "bandeira": 160, "haste": 70, "base": 90 },
    "politica":    { "unitario": 30, "minQty": 20, "largura": 0.90, "altura": 0.70 },
    "escanteio":   { "kitTotal": 40, "qtdKit": 4, "largura": 0.25, "altura": 0.30 }
  },
  "abada": {
    "baseRow": [28, 26, 24, 22, 20],
    "tecido":  { "cacharel": 0, "dry": 6 },
    "extras":  { "bandana": 5 }
  }
}
```

### `src/data/defaults/partners.json` (GITIGNORED — estrutura)

```json
[
  { "name": "Escolinhas de Futebol", "kitDiscount": 25, "sportDiscount": 15, "promoDiscount": 0, "logoNote": true, "sortOrder": 1 },
  { "name": "Academias",             "kitDiscount": 50, "sportDiscount": 30, "promoDiscount": 0, "logoNote": true, "sortOrder": 2 },
  { "name": "Escolas Rede Privada",  "kitDiscount": 15, "sportDiscount": 15, "promoDiscount": 0, "logoNote": true, "sortOrder": 3 },
  { "name": "Revendedores MG",       "kitDiscount": 30, "sportDiscount": 30, "promoDiscount": 0, "logoNote": true, "sortOrder": 4 },
  { "name": "Revendedores BA",       "kitDiscount": 15, "sportDiscount": 15, "promoDiscount": 15, "logoNote": true, "sortOrder": 5 },
  { "name": "Bola na Rede Medeiros Neto", "kitDiscount": 20, "sportDiscount": 20, "promoDiscount": 10, "logoNote": true, "sortOrder": 6 }
]
```

### `prisma/seed.ts` (script idempotente)

```typescript
import { PrismaClient, PriceGroupType } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Mapeamento de metadados das categorias (esses dados são commitados — não são preços)
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

// Metadados dos grupos de preço (títulos e tipos — não os valores)
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

// Definição das grades de tamanho (metadados commitados — medidas no sizes.json)
const SIZE_CHART_META = [
  { chartKey: 'camisa_normal',   label: 'Tabela Camisa Normal - Unissex', svgType: 'tshirt', sortOrder: 0,
    columns: ['Altura','Largura'], // Coluna "Tamanho" é sempre implícita no sizeKey
    rows: ['PP','P','M','G','GG','XGG','XXGG'] },
  { chartKey: 'camisa_infantil', label: 'Tabela Camisa Infantil - Unissex', svgType: 'tshirt', sortOrder: 1,
    columns: ['Altura','Largura'],
    rows: ['PPP','PP','P','M','G'] },
  { chartKey: 'camisa_social',   label: 'Tabela Camisas Social Masculinas', svgType: 'social', sortOrder: 2,
    columns: ['Altura','Largura','Braço'],
    rows: ['PP','P','M','G','GG','XGG','XXGG'] },
  { chartKey: 'calca_normal',    label: 'Tabela Calça Normal - Unissex - Com Elástico', svgType: 'pants', sortOrder: 3,
    columns: ['Nº','Altura','Largura'],
    rows: ['PP','P','M','G','GG','XGG','XXGG'] },
  { chartKey: 'baby_look',       label: 'Tabela Camisa Baby Look - Feminino', svgType: 'tshirt', sortOrder: 4,
    columns: ['Altura','Largura'],
    rows: ['PP','P','M','G','GG','XGG','XXGG'] },
]

const BRACKETS_META = [
  { label: '10–50',  minQty: 10,  maxQty: 50,     sortOrder: 0 },
  { label: '51–100', minQty: 51,  maxQty: 100,    sortOrder: 1 },
  { label: '101–300',minQty: 101, maxQty: 300,    sortOrder: 2 },
  { label: '301–500',minQty: 301, maxQty: 500,    sortOrder: 3 },
  { label: '501+',   minQty: 501, maxQty: 999999, sortOrder: 4 },
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
      where: { id: bMeta.label }, // Usando label como id fixo para idempotência
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

      const rawData = catData[gMeta.groupKey]

      if (gMeta.groupType === 'SCALAR') {
        // { polo: 4, redonda: 0 } → PriceEntry por chave
        for (const [subKey, value] of Object.entries(rawData as Record<string, number>)) {
          await prisma.priceEntry.upsert({
            where: { groupId_subKey_bracketId: { groupId: group.id, subKey, bracketId: null } },
            create: { groupId: group.id, subKey, bracketId: null, value: value as number },
            update: { value: value as number },
          })
        }
      } else if (gMeta.groupType === 'BRACKET_ROW') {
        // [28, 26, 24, 22, 20] → PriceEntry por bracket index
        const arr = rawData as number[]
        for (let i = 0; i < arr.length; i++) {
          await prisma.priceEntry.upsert({
            where: { groupId_subKey_bracketId: { groupId: group.id, subKey: null, bracketId: brackets[i].id } },
            create: { groupId: group.id, subKey: null, bracketId: brackets[i].id, value: arr[i] },
            update: { value: arr[i] },
          })
        }
      } else if (gMeta.groupType === 'BRACKET_MATRIX') {
        // { PP: [44,41,38,36,34], PV: [...] } → PriceEntry por subKey + bracket
        for (const [subKey, arr] of Object.entries(rawData as Record<string, number[]>)) {
          for (let i = 0; i < arr.length; i++) {
            await prisma.priceEntry.upsert({
              where: { groupId_subKey_bracketId: { groupId: group.id, subKey, bracketId: brackets[i].id } },
              create: { groupId: group.id, subKey, bracketId: brackets[i].id, value: arr[i] },
              update: { value: arr[i] },
            })
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
      const col = await prisma.sizeColumn.upsert({
        where: { id: `${chart.id}-col-${i}` },
        create: { id: `${chart.id}-col-${i}`, chartId: chart.id, label: chartMeta.columns[i], sortOrder: i },
        update: { label: chartMeta.columns[i] },
      })
      colMap[chartMeta.columns[i]] = col
    }

    for (let ri = 0; ri < chartMeta.rows.length; ri++) {
      const sizeKey = chartMeta.rows[ri]
      const row = await prisma.sizeRow.upsert({
        where: { id: `${chart.id}-row-${ri}` },
        create: { id: `${chart.id}-row-${ri}`, chartId: chart.id, sizeKey, sortOrder: ri },
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
```

### Atualizar `.gitignore`

```gitignore
# Dados privados — valores reais de preço e medidas
src/data/defaults/pricebook.json
src/data/defaults/sizes.json
src/data/defaults/partners.json
```

### Atualizar `package.json`

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## FASE 3 — Refatoração do Data Layer

### `src/data/pricebook.ts` — O que muda

**REMOVER completamente:**
- `const STORE_KEY = 'fase_pricebook_v2'`
- `export const DEFAULT_PB: Record<string, any> = { ... }` (bloco inteiro de 50 linhas)
- `function loadPB(): Record<string, any>` (lê localStorage)
- `export function savePB()` (salva no localStorage)
- `export function resetPB()` (limpa localStorage)
- `export function setPrice(...)` (mutação em memória — agora vai direto pela API)

**MANTER (sem modificação):**
- `export interface Bracket`, `BRACKETS`, `bracketIndex` 
- `export interface PartnerRate` → **MUDAR**: agora virá do banco
- `export const PARTNERS: Record<string, PartnerRate | null>` → será `let` populado via `updatePartnersFromServer`
- `export const partnerDiscount` (lógica de negócio, incluindo regra do Abadá)
- `export const fmtBRL`
- `export interface Category`, `CategorySelector`, `CategoryOption`
- `export const CATEGORIES: Category[]` (metadados estáticos das 8 categorias)
- `export const getCat`, `export const computeUnit`, `export const metaFor`
- `export interface EditSection`, `EditCategorySchema`, `export function editSchema`
- `let PB`, `const subs`, `export function subscribe`, `export const getPB`
- `export function updatePBFromServer(data: any)`

**ADICIONAR:**
```typescript
// Parcerias são carregadas do banco, não hardcoded
let PARTNERS_DB: Record<string, PartnerRate | null> = { 'Nenhuma': null }

export function updatePartnersFromServer(partners: Array<{
  name: string; kitDiscount: number; sportDiscount: number; promoDiscount: number
}>) {
  PARTNERS_DB = { 'Nenhuma': null }
  for (const p of partners) {
    PARTNERS_DB[p.name] = { kit: p.kitDiscount, esportivo: p.sportDiscount, promocional: p.promoDiscount }
  }
  subs.forEach((f) => f())
}

// Re-exportar para uso nos componentes
export const getPartners = () => PARTNERS_DB
export const getPartnerNames = () => Object.keys(PARTNERS_DB)
```

**MODIFICAR `partnerDiscount`:**
```typescript
// Antes usava PARTNERS hardcoded, agora usa PARTNERS_DB
export const partnerDiscount = (partner: string, kind: string): number => {
  if (kind === 'abada') return 0  // Regra de negócio: abadá sempre isento
  const rate = PARTNERS_DB[partner]
  if (!rate) return 0
  return (rate as any)[kind] || 0
}
```

### `src/data/sizes.ts` — O que muda

**REMOVER completamente:**
- `const SIZES_STORE_KEY = 'fase_sizes_v2'`
- `export const DEFAULT_SIZES: Record<string, SizeChart> = { ... }` (bloco inteiro)
- `function loadSizes(): Record<string, SizeChart>` (lê localStorage)
- `export function saveSizes()` (salva no localStorage)
- `export function resetSizes()` (limpa localStorage)
- `export function setSizeValue(...)` — agora vai direto via API
- `export function setSizeObs(...)` — agora vai direto via API

**MANTER (sem modificação):**
- `export interface SizeChart`
- `let SIZES`, `const sizeSubs`
- `export function getSizes()`
- `export function updateSizesFromServer(data: any)`
- `export function subscribeSizes(fn: () => void)`

---

## FASE 4 — API Routes

### `/api/pricebook/route.ts` — Refatoração completa

```typescript
// GET — Serializa o schema relacional para o formato consumido por pricebook.ts
export async function GET() {
  const categories = await prisma.priceCategory.findMany({
    include: {
      groups: {
        include: {
          entries: { include: { bracket: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  // Serializar para o formato { catKey: { groupKey: valor } }
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
        const sorted = group.entries.sort((a, b) => a.bracket!.sortOrder - b.bracket!.sortOrder)
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
  return NextResponse.json({ success: true, data: pb })
}

// POST — Atualiza uma PriceEntry específica
// Body: { groupId: string, subKey: string | null, bracketId: string | null, value: number }
export async function POST(request: Request) {
  const { groupId, subKey, bracketId, value } = await request.json()
  const entry = await prisma.priceEntry.upsert({
    where: { groupId_subKey_bracketId: { groupId, subKey: subKey ?? null, bracketId: bracketId ?? null } },
    create: { groupId, subKey: subKey ?? null, bracketId: bracketId ?? null, value },
    update: { value },
  })
  return NextResponse.json({ success: true, data: entry })
}

// DELETE — Re-seed a partir do pricebook.json (restaurar padrão)
// Lê o arquivo JSON e faz upsert em todas as PriceEntry
export async function DELETE() {
  // ... executa re-seed apenas das PriceEntry (não recria categorias/grupos)
  return NextResponse.json({ success: true })
}
```

### `/api/sizes/route.ts` — Refatoração completa

```typescript
// GET — Serializa para Record<string, SizeChart>
export async function GET()
// Retorna { chartKey: { id, label, svgType, obs, cols: string[], rows: Record<string, string[]> } }

// POST — Atualiza uma SizeCell específica
// Body: { rowId: string, columnId: string, value: string }
export async function POST(request: Request)

// PATCH — Atualiza obs de um SizeChart
// Body: { chartId: string, obs: string }
export async function PATCH(request: Request)

// DELETE — Re-seed a partir de sizes.json
export async function DELETE()
```

### `/api/partners/route.ts` (NOVO)

```typescript
// GET — Lista todos os Partner ativos ordenados por sortOrder
export async function GET()
// Retorna [{ id, name, kitDiscount, sportDiscount, promoDiscount, logoNote, sortOrder }]

// POST — Cria novo Partner
// Body: { name, kitDiscount, sportDiscount, promoDiscount, logoNote }
export async function POST(request: Request)
```

### `/api/partners/[id]/route.ts` (NOVO)

```typescript
// PATCH — Atualiza descontos de um Partner
// Body: { kitDiscount?, sportDiscount?, promoDiscount?, isActive?, logoNote? }
export async function PATCH(request: Request, { params })

// DELETE — Soft-delete (isActive = false)
export async function DELETE(request: Request, { params })
```

### `/api/budgets/route.ts` — Expandido

```typescript
// GET — Lista orçamentos com filtros e paginação
// Query params: status, page, limit, search, dateFrom, dateTo
// Include: items (sem snap para economizar), statusHistory
export async function GET(request: Request)

// POST — Cria orçamento + BudgetStatusEvent inicial
// Body: todos os campos de Budget + items (array com unit, total, partnerDiscount, netUnit, netTotal)
export async function POST(request: Request) {
  // 1. Criar Budget com items
  const budget = await prisma.budget.create({
    data: {
      ...budgetFields,
      items: {
        create: items.map((it) => ({
          ...it,
          total: it.unit * it.qty,
          netUnit: it.unit * (1 - it.partnerDiscount / 100),
          netTotal: it.unit * (1 - it.partnerDiscount / 100) * it.qty,
        }))
      }
    },
    include: { items: true }
  })
  // 2. Criar BudgetStatusEvent inicial
  await prisma.budgetStatusEvent.create({
    data: { budgetId: budget.id, fromStatus: null, toStatus: status }
  })
  return NextResponse.json({ success: true, data: budget })
}
```

### `/api/budgets/[id]/route.ts` (NOVO)

```typescript
// GET — Orçamento completo (com snap dos items)
export async function GET(request: Request, { params: { id } })

// PATCH — Edita campos ou muda status
// Se status mudar, cria BudgetStatusEvent automaticamente
export async function PATCH(request: Request, { params: { id } }) {
  const body = await request.json()
  const oldBudget = await prisma.budget.findUnique({ where: { id } })
  
  const updated = await prisma.budget.update({
    where: { id },
    data: body,
  })
  
  if (body.status && body.status !== oldBudget?.status) {
    await prisma.budgetStatusEvent.create({
      data: {
        budgetId: id,
        fromStatus: oldBudget?.status || null,
        toStatus: body.status,
        notes: body.statusNotes || null,
      }
    })
  }
  return NextResponse.json({ success: true, data: updated })
}

// DELETE — Cascade (items e statusHistory)
export async function DELETE(request: Request, { params: { id } })
```

### `/api/metrics/route.ts` (NOVO)

```typescript
export async function GET(request: Request) {
  const [
    totalBudgets,
    byStatus,
    wonRevenue,
    topCategoriesRaw,
    recentBudgets,
    monthlyTrend,
  ] = await Promise.all([
    // Total de orçamentos
    prisma.budget.count(),
    
    // Por status
    prisma.budget.groupBy({ by: ['status'], _count: true }),
    
    // Faturamento dos won
    prisma.budget.aggregate({
      where: { status: 'won' },
      _sum: { netTotal: true },
      _avg: { netTotal: true },
    }),
    
    // Top categorias (dos itens de orçamentos won)
    prisma.budgetLineItem.groupBy({
      by: ['catId'],
      where: { budget: { status: 'won' } },
      _sum: { netTotal: true, qty: true },
      orderBy: { _sum: { netTotal: 'desc' } },
      take: 5,
    }),
    
    // Orçamentos recentes
    prisma.budget.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { catId: true }, take: 1 } },
    }),
    
    // Tendência mensal (últimos 6 meses, usando groupBy createdAt)
    // (query SQL raw para agrupar por mês)
    prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'won' THEN "netTotal" ELSE 0 END) as revenue
      FROM budgets
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `,
  ])

  const wonCount = byStatus.find((s) => s.status === 'won')?._count || 0
  const lostCount = byStatus.find((s) => s.status === 'lost')?._count || 0
  const conversionRate = wonCount + lostCount > 0
    ? Math.round((wonCount / (wonCount + lostCount)) * 100)
    : 0

  return NextResponse.json({
    success: true,
    data: {
      totalBudgets,
      byStatus: {
        open: byStatus.find((s) => s.status === 'open')?._count || 0,
        won: wonCount,
        lost: lostCount,
      },
      wonRevenue: wonRevenue._sum.netTotal || 0,
      avgTicket: wonRevenue._avg.netTotal || 0,
      conversionRate,
      topCategories: topCategoriesRaw,
      recentBudgets,
      monthlyTrend,
    }
  })
}
```

---

## FASE 5 — BudgetContext Expandido

### `src/context/budget-context.ts` — Novos tipos

```typescript
// Adicionar ao CartItem:
export interface CartItem {
  uid: string
  catId: string
  kind: string
  desc: string
  qty: number
  unit: number       // preço unitário bruto
  snap: any
  // NOVO:
  partnerDiscountPct: number  // % aplicado no momento da adição ao carrinho
  netUnit: number             // unit * (1 - partnerDiscountPct/100)
}

// Adicionar ao BudgetContextValue:
export interface BudgetContextValue {
  // ... existente ...
  
  // NOVO: estado de persistência
  currentBudgetId: string | null
  budgetSaved: boolean
  budgetSaving: boolean
  notes: string
  
  // NOVO: ações de persistência
  saveBudgetToServer: (status?: 'open' | 'won' | 'lost') => Promise<{ success: boolean; data?: any; error?: string }>
  updateBudgetStatus: (id: string, status: 'open' | 'won' | 'lost', notes?: string) => Promise<void>
  loadBudgetFromId: (id: string) => Promise<void>
  clearBudget: () => void  // Limpa cart + reseta todos os estados + currentBudgetId
  setNotes: (notes: string) => void
}
```

### `src/context/BudgetContext.tsx` — Mudanças

**Adicionar estados:**
```typescript
const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null)
const [budgetSaved, setBudgetSaved] = useState(false)
const [budgetSaving, setBudgetSaving] = useState(false)
const [notes, setNotes] = useState('')
```

**Carregar parcerias do banco:**
```typescript
useEffect(() => {
  // Carregar parcerias do banco (substituindo o PARTNERS hardcoded)
  fetch('/api/partners')
    .then((res) => res.json())
    .then((res) => {
      if (res.success && res.data) {
        updatePartnersFromServer(res.data)
      }
    })
    .catch((err) => console.error('Error fetching partners:', err))
  
  // Carregar pricebook do banco
  fetch('/api/pricebook')
    .then((res) => res.json())
    .then((res) => { if (res.success && res.data) updatePBFromServer(res.data) })
    .catch((err) => console.error('Error fetching pricebook:', err))

  // Carregar sizes do banco
  fetch('/api/sizes')
    .then((res) => res.json())
    .then((res) => { if (res.success && res.data) updateSizesFromServer(res.data) })
    .catch((err) => console.error('Error fetching sizes:', err))
}, [])
```

**`addToCart` — calcular partnerDiscountPct e netUnit no momento de adicionar:**
```typescript
const addToCart = useCallback(() => {
  const cat = getCat(activeCat)
  if (!cat) return
  const st = config[activeCat]
  if (!st.qty) return
  const unitPrice = computeUnit(cat, st)
  const discPct = partnerDiscount(client.partnership, cat.kind)
  const netUnitPrice = unitPrice * (1 - discPct / 100)
  setCart((list) => [
    ...list,
    {
      uid: uid(),
      catId: cat.id,
      kind: cat.kind,
      desc: cat.describe(st),
      qty: st.qty,
      unit: unitPrice,
      snap: clone(st),
      partnerDiscountPct: discPct,  // NOVO
      netUnit: netUnitPrice,         // NOVO
    },
  ])
}, [activeCat, config, client.partnership])
```

**`saveBudgetToServer` — expandido:**
```typescript
const saveBudgetToServer = useCallback(async (status = 'open') => {
  setBudgetSaving(true)
  try {
    const url = currentBudgetId ? `/api/budgets/${currentBudgetId}` : '/api/budgets'
    const method = currentBudgetId ? 'PATCH' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: client.name || 'Cliente sem nome',
        clientPhone: client.phone || '',
        clientPartnership: client.partnership,
        delivery: cond.delivery,
        validity: cond.validity,
        subtotal: totals.sub,
        partnerDiscount: totals.partnerDisc,
        discountType: disc.type,
        discountValue: disc.value,
        additionalDiscount: totals.add,
        netTotal: totals.net,
        entryValue: totals.entry,
        attachSizes,
        selectedSizeChartId,
        notes,
        status,
        items: cart.map((it) => ({
          catId: it.catId,
          kind: it.kind,
          desc: it.desc,
          qty: it.qty,
          unit: it.unit,
          total: it.unit * it.qty,          // bruto
          partnerDiscount: it.partnerDiscountPct,
          netUnit: it.netUnit,
          netTotal: it.netUnit * it.qty,
          snap: it.snap,
        })),
      }),
    })
    
    const res = await response.json()
    if (res.success) {
      setCurrentBudgetId(res.data.id)
      setBudgetSaved(true)
      return { success: true, data: res.data }
    }
    return { success: false, error: res.error }
  } catch (error: any) {
    return { success: false, error: error.message }
  } finally {
    setBudgetSaving(false)
  }
}, [client, cond, totals, cart, disc, attachSizes, selectedSizeChartId, notes, currentBudgetId])
```

**`clearBudget` — novo:**
```typescript
const clearBudget = useCallback(() => {
  setCart([])
  setClient({ name: '', phone: '', partnership: 'Nenhuma' })
  setDisc({ type: 'percentage', value: 0 })
  setCond({ delivery: 30, validity: 7 })
  setAttachSizes(false)
  setNotes('')
  setCurrentBudgetId(null)
  setBudgetSaved(false)
  setConfig(initialConfig())
}, [])
```

**`updateBudgetStatus` — novo:**
```typescript
const updateBudgetStatus = useCallback(async (id: string, status: string, statusNotes?: string) => {
  await fetch(`/api/budgets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, statusNotes }),
  })
}, [])
```

---

## FASE 6 — UI do Gerador (Coração do Produto)

### `Simulator.tsx` — Mudanças

```tsx
// ADICIONAR: Bracket pill (faixa de volume ativa)
// Localizado logo abaixo do input de quantidade, acima do preço calculado

const bracketPill = curCategory?.brackets ? (() => {
  const qty = cur.qty || 0
  const bIdx = bracketIndex(qty)
  const bLabel = BRACKETS[bIdx]?.label || ''
  const isWarning = qty < 10
  return (
    <span className={`bracket-pill ${isWarning ? 'bracket-pill--warn' : 'bracket-pill--active'}`}>
      {isWarning ? '⚠ Mínimo: 10 un.' : `Faixa: ${bLabel} un.`}
    </span>
  )
})() : null

// ADICIONAR: Preço com e sem desconto de parceria (quando parceria ativa)
const partnership = client.partnership
const hasPartner = partnership !== 'Nenhuma'
const discPct = curCategory ? partnerDiscount(partnership, curCategory.kind) : 0
const unitBruto = computedUnit
const unitLiquido = unitBruto * (1 - discPct / 100)

// Na renderização:
<div className="sim-price">
  {hasPartner && discPct > 0 ? (
    <>
      <span className="sim-price__original">{fmtBRL(unitBruto)}</span>
      <span className="sim-price__net">{fmtBRL(unitLiquido)}</span>
      <span className="sim-price__disc">−{discPct}%</span>
    </>
  ) : (
    <span className="sim-price__value">{fmtBRL(unitBruto)}</span>
  )}
</div>
```

### `BudgetCart.tsx` — Mudanças

```tsx
// ADICIONAR por item na lista do carrinho:

// 1. Badge de desconto de parceria
const info = partnerInfo(it)
{info.kind === 'discount' && (
  <span className="badge-partner badge-partner--discount">−{info.d}%</span>
)}
{info.kind === 'exempt' && (
  <span className="badge-partner badge-partner--exempt">Isento (Evento)</span>
)}

// 2. Nota de parceria
{info.kind === 'discount' && (
  <p className="item-logo-note">★ Inclusa logo da Fase na frente e costas</p>
)}

// 3. Preço netUnit destacado (quando desconto > 0)
{info.kind === 'discount' && (
  <span className="item-net-price">{fmtBRL(it.netUnit)} /un.</span>
)}
```

### `Totals.tsx` — Mudanças

```tsx
// SUBSTITUIR o painel de totais para incluir:
// 1. Breakdown completo
// 2. Botão "Salvar Orçamento" com loading
// 3. Ações de status (pós-save)

<div className="totals-panel">
  <div className="totals-row">
    <span>Subtotal</span>
    <span>{fmtBRL(totals.sub)}</span>
  </div>
  {totals.partnerDisc > 0 && (
    <div className="totals-row totals-row--discount">
      <span>Desconto parceria ({client.partnership})</span>
      <span>− {fmtBRL(totals.partnerDisc)}</span>
    </div>
  )}
  {totals.add > 0 && (
    <div className="totals-row totals-row--discount">
      <span>Desconto adicional</span>
      <span>− {fmtBRL(totals.add)}</span>
    </div>
  )}
  <div className="totals-row totals-row--net">
    <span>Valor Líquido</span>
    <span>{fmtBRL(totals.net)}</span>
  </div>
  <div className="totals-row totals-row--entry">
    <span>Entrada sugerida (50%)</span>
    <span>{fmtBRL(totals.entry)}</span>
  </div>

  <button
    className={`btn btn--primary btn--full ${budgetSaving ? 'btn--loading' : ''}`}
    onClick={() => saveBudgetToServer('open')}
    disabled={cart.length === 0 || budgetSaving}
  >
    {budgetSaving ? 'Salvando...' : budgetSaved ? '✓ Orçamento Salvo' : 'Salvar Orçamento'}
  </button>

  {budgetSaved && currentBudgetId && (
    <div className="budget-actions">
      <button onClick={() => updateBudgetStatus(currentBudgetId, 'won')} className="btn btn--won">
        ✓ Marcar como Ganho
      </button>
      <button onClick={() => updateBudgetStatus(currentBudgetId, 'lost')} className="btn btn--lost">
        ✗ Marcar como Perdido
      </button>
    </div>
  )}
</div>
```

### `Conditions.tsx` — Mudanças

```tsx
// ADICIONAR campo de observações antes do fechamento
<div className="form-group">
  <label htmlFor="budget-notes">Observações</label>
  <textarea
    id="budget-notes"
    className="textarea"
    placeholder="Informações adicionais para o cliente, condições especiais, prazos..."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    rows={3}
  />
</div>
```

### `page.tsx` (Gerador) — Mudanças

```tsx
// ADICIONAR barra de status de orçamento no topo da coluna direita
<div className="budget-status-bar">
  <div className="budget-status-bar__info">
    {budgetSaved && currentBudgetId ? (
      <>
        <span className="status-dot status-dot--saved" />
        <span>Orçamento #{currentBudgetId.slice(-6).toUpperCase()}</span>
      </>
    ) : (
      <>
        <span className="status-dot status-dot--draft" />
        <span>Rascunho não salvo</span>
      </>
    )}
  </div>
  <button className="btn btn--ghost btn--sm" onClick={clearBudget}>
    Limpar Orçamento
  </button>
</div>
```

---

## FASE 7 — `/tabela` Relacional

### O que muda em `src/app/tabela/page.tsx`

1. **Remover:** `import { editSchema, getPB, setPrice, savePB, resetPB }` do `pricebook.ts` local
2. **Adicionar:** fetch ao montar para `/api/pricebook` (schema serializado)
3. **Modificar `touch()`:** em vez de chamar `setPrice()` em memória, acumular um patch e enviar via `PATCH /api/pricebook` (debounced ou no Save)
4. **Modificar `onSave()`:** Enviar patch acumulado para `/api/pricebook` (upsert por PriceEntry)
5. **Modificar `onReset()`:** `DELETE /api/pricebook` + reload via GET
6. **Adicionar:** Loading skeleton enquanto carrega do banco
7. **Adicionar:** Timestamp do `updatedAt` do PriceEntry mais recente editado

```typescript
// Novo fluxo:
const [pbData, setPbData] = useState<Record<string, any> | null>(null)
const [loading, setLoading] = useState(true)
const [pendingPatches, setPendingPatches] = useState<PriceEntryPatch[]>([])

useEffect(() => {
  fetch('/api/pricebook')
    .then(res => res.json())
    .then(res => { if (res.success) setPbData(res.data) })
    .finally(() => setLoading(false))
}, [])

const onSave = async () => {
  // Envia todos os patches acumulados para o banco
  for (const patch of pendingPatches) {
    await fetch('/api/pricebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  }
  setPendingPatches([])
  setDirty(false)
}

const onReset = async () => {
  if (!confirm('Restaurar preços ao padrão?')) return
  await fetch('/api/pricebook', { method: 'DELETE' })
  // Recarregar
  const res = await fetch('/api/pricebook').then(r => r.json())
  if (res.success) setPbData(res.data)
  setPendingPatches([])
  setDirty(false)
}
```

---

## FASE 8 — `/tamanhos` Relacional

### O que muda em `src/app/tamanhos/page.tsx`

1. **Remover:** `import { getSizes, setSizeValue, setSizeObs, saveSizes, resetSizes }` do `sizes.ts` local
2. **Adicionar:** fetch ao montar para `/api/sizes`
3. **Edição de célula:** `PATCH /api/sizes` com `{ rowId, columnId, value }` — precisamos que o GET retorne os IDs de cada célula além dos valores
4. **Edição de obs:** `PATCH /api/sizes` com `{ chartId, obs }`
5. **Restaurar padrão:** `DELETE /api/sizes` + reload

**Atenção:** O GET de `/api/sizes` precisará retornar, além dos valores, os IDs das células para a edição inline funcionar:
```json
{
  "camisa_normal": {
    "chartId": "uuid",
    "label": "...",
    "obs": "...",
    "columns": [{ "id": "uuid", "label": "Altura", "sortOrder": 0 }],
    "rows": [
      {
        "id": "uuid",
        "sizeKey": "PP",
        "cells": [{ "columnId": "uuid", "value": "70 cm" }]
      }
    ]
  }
}
```

---

## FASE 9 — `/metricas` Dados Reais

### O que muda em `src/app/metricas/page.tsx`

1. **Remover** todos os dados mock hardcoded (`months`, `mix`, `rank`, `recent`, `KPIS`)
2. **Carregar** dados reais de `/api/metrics`
3. **Mapear** para o formato dos componentes existentes (Donut, BarChart, rank, recent)
4. **Adaptar o BarChart** para usar `monthlyTrend` do banco (valores reais de receita, não k fictícios)
5. **Manter** o skeleton de loading existente
6. **Remover** fallback para mocks (se API falhar, mostrar erro)

```typescript
// Novo fluxo:
const [metrics, setMetrics] = useState<MetricsData | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  fetch('/api/metrics')
    .then(res => res.json())
    .then(res => {
      if (res.success) setMetrics(res.data)
      else setError(res.error)
    })
    .catch(() => setError('Não foi possível carregar as métricas'))
    .finally(() => setLoading(false))
}, [])

// KPIs derivados dos dados reais:
const kpis = metrics ? [
  { label: 'Orçamentos gerados', value: String(metrics.totalBudgets), ... },
  { label: 'Ticket médio', value: fmtBRL(metrics.avgTicket), ... },
  { label: 'Taxa de fechamento', value: `${metrics.conversionRate}%`, ... },
  { label: 'Faturamento estimado', value: fmtBRL(metrics.wonRevenue), ... },
] : []
```

---

## Ordem de Execução Final

```
FASE 1  → schema.prisma + migrate dev + prisma generate
FASE 2  → seed.ts + pricebook.json + sizes.json + partners.json + npm run seed
FASE 3  → pricebook.ts refactor + sizes.ts refactor (remover localStorage)
FASE 4a → /api/pricebook refactor (GET relacional + POST entry + DELETE)
FASE 4b → /api/sizes refactor (GET relacional + POST cell + PATCH obs + DELETE)
FASE 4c → /api/partners/route.ts + /api/partners/[id]/route.ts (novos)
FASE 4d → /api/budgets/route.ts expansão (GET com filtros, POST expandido)
FASE 4e → /api/budgets/[id]/route.ts (novo: GET, PATCH com status event, DELETE)
FASE 4f → /api/metrics/route.ts (novo: agregações reais)
FASE 5  → budget-context.ts + BudgetContext.tsx (novos estados + ações)
FASE 6a → Simulator.tsx (bracket pill + preço com/sem desconto)
FASE 6b → BudgetCart.tsx (badges de parceria + nota)
FASE 6c → Totals.tsx (breakdown + botão salvar + ações de status)
FASE 6d → Conditions.tsx (campo observações)
FASE 6e → page.tsx gerador (barra de status + botão limpar)
FASE 7  → /tabela/page.tsx refactor (fetch banco + patch por entry)
FASE 8  → /tamanhos/page.tsx refactor (fetch banco + patch por célula)
FASE 9  → /metricas/page.tsx refactor (dados reais, remover mocks)
VERIF   → npx prisma generate + npm run build + testes manuais
```

---

## Checklist de Verificação

### Build & Tipos
- [ ] `npx prisma generate` — sem erros de tipo gerado
- [ ] `npx prisma migrate dev` — migração aplicada sem conflitos
- [ ] `npm run build` — zero erros TypeScript em todos os 9 módulos
- [ ] Nenhuma referência a `localStorage` restante no código

### Seed & Dados
- [ ] `npx prisma db seed` — concluído sem erros
- [ ] Prisma Studio: `PriceCategory` = 8 registros
- [ ] Prisma Studio: `PriceBracket` = 5 registros
- [ ] Prisma Studio: `PriceGroup` = 24 grupos (soma de todos grupos das 8 categorias)
- [ ] Prisma Studio: `PriceEntry` = todos os valores populados
- [ ] Prisma Studio: `SizeChart` = 5 registros
- [ ] Prisma Studio: `SizeCell` = todas as células populadas
- [ ] Prisma Studio: `Partner` = 6 registros

### APIs (DevTools Network)
- [ ] `GET /api/pricebook` → `{ success: true, data: { kit_esportivo: {...}, camisa_malha: {...} } }`
- [ ] `POST /api/pricebook` → Atualiza uma entry e retorna sucesso
- [ ] `GET /api/sizes` → `{ success: true, data: { camisa_normal: {...} } }`
- [ ] `GET /api/partners` → `[ { name: "Academias", kitDiscount: 50, ... } ]`
- [ ] `POST /api/budgets` → Cria orçamento com items + verifica BudgetStatusEvent criado
- [ ] `PATCH /api/budgets/[id]` → Muda status `open → won` → verifica novo BudgetStatusEvent
- [ ] `GET /api/metrics` → Retorna KPIs corretos após pelo menos 1 orçamento won

### UX Manual
- [ ] Preços carregam do banco no Gerador (não hardcoded)
- [ ] Parcerias carregam do banco (dropdown atualizado)
- [ ] Adicionar item ao carrinho → badge de desconto aparece (se parceria ativa)
- [ ] Abadá com parceria ativa → badge "Isento (Evento)" aparece
- [ ] Quantity < 10 → bracket pill com warning âmbar
- [ ] Bracket pill atualiza ao mudar quantidade (10-50, 51-100, etc.)
- [ ] Salvar orçamento → badge "Salvo #XXXXXX" aparece + botões Ganho/Perdido
- [ ] Marcar como Ganho → aparece em `/metricas`
- [ ] Editar preço em `/tabela` → recarregar Gerador → preço atualizado
- [ ] Restaurar padrão em `/tabela` → preços voltam ao JSON de seed
- [ ] Editar medida em `/tamanhos` → recarregar → confirmar
- [ ] Campo Observações → aparece no PDF impresso
- [ ] Limpar orçamento → carrinho vazio + ID resetado
- [ ] PDF com grade de tamanhos anexada funciona corretamente
