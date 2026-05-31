# Especificação Técnica — Gerador de Orçamentos Fase Esporte

**Versão:** 3.0  
**Data:** 31 de Maio de 2026  
**Status:** Em Produção  
**Stack:** Next.js 16 · React 19 · TypeScript 5 · Prisma 6 · PostgreSQL (Neon)

> Este documento é a **fonte de verdade técnica** da implementação. Para regras de negócio por categoria consulte `REGRAS_NEGOCIO.md`. Para requisitos de produto consulte `PRD.md`.

---

## 1. Visão Geral

A Fase Esporte (Teixeira de Freitas - BA) necessitava substituir um fluxo manual de planilhas Excel por uma aplicação web interativa. O sistema permite que vendedores configurem produtos por cliques, calculem preços automaticamente e gerem orçamentos formais em PDF/A4 — em desktop na loja e via WhatsApp em campo.

---

## 2. Stack e Arquitetura

### 2.1. Tecnologias

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Framework | Next.js 16 (App Router) | Roteamento, SSR, API routes |
| UI | React 19 + TypeScript 5 | Componentes tipados |
| Banco | PostgreSQL via Neon | Preços, parcerias, tamanhos, orçamentos |
| ORM | Prisma 6 | Schema, migrations, seed, queries |
| Animações | Framer Motion 12 | Transições e micro-interações |
| CSS | Vanilla CSS + variáveis HSL | Design system próprio, sem frameworks |
| PDF | CSS `@media print` | Geração A4 via `window.print()` |
| Auth | Cookie de sessão (APP_SECRET) | Proteção das rotas administrativas |

### 2.2. Estrutura de Diretórios

```
orcamentofase/
├── prisma/
│   ├── schema.prisma          — 8 modelos relacionais
│   ├── seed.ts                — popula banco a partir de defaults/*.json
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── page.tsx           — Gerador de Orçamentos (homepage)
│   │   ├── login/             — Autenticação por senha compartilhada
│   │   ├── historico/         — Histórico de orçamentos com filtro e status
│   │   ├── metricas/          — Dashboard de métricas comerciais
│   │   ├── tabela/            — Editor da tabela de preços (escreve no banco)
│   │   ├── tamanhos/          — Editor de tabelas de tamanho
│   │   ├── configuracoes/     — Configurações gerais do app
│   │   ├── design-system/     — Showcase do Design System
│   │   └── api/
│   │       ├── auth/          — POST login, POST logout
│   │       ├── budgets/       — GET/POST lista | GET/PUT/DELETE [id]
│   │       ├── metrics/       — GET métricas agregadas
│   │       ├── partners/      — GET/POST lista | GET/PUT/DELETE [id]
│   │       ├── pricebook/     — GET leitura | POST atualização
│   │       ├── settings/      — GET/POST configurações
│   │       └── sizes/         — GET leitura | POST atualização
│   ├── components/
│   │   ├── app/               — AppHeader, PageHeader, PageLayout
│   │   ├── ds/                — Nav (design system)
│   │   └── gerador/           — BudgetCart, CategoryTabs, ClientForm,
│   │                            Conditions, Configurator, MeasurementSvg,
│   │                            PreviewModal, PrintSheet, Simulator, Totals
│   ├── context/
│   │   ├── budget-context.ts  — Interfaces TypeScript + createContext
│   │   ├── BudgetContext.tsx  — Provider: cálculos, cart, save
│   │   ├── theme-context.ts   — Contexto de tema (re-export compat.)
│   │   └── theme.tsx          — ThemeProvider, ThemeToggle
│   ├── data/
│   │   ├── defaults/          — pricebook.json, sizes.json, partners.json
│   │   ├── pricebook.ts       — Engine de preços (CATEGORIES, DEFAULT_PB)
│   │   └── sizes.ts           — Lógica de tabelas de tamanho
│   ├── lib/
│   │   ├── auth.ts            — Helpers de sessão/cookie
│   │   ├── prisma.ts          — Singleton PrismaClient
│   │   ├── settings.ts        — Tipos e defaults de configuração
│   │   └── image-slot.js      — Custom Element drag & drop
│   ├── middleware.ts           — Proteção de rotas
│   └── styles/
│       ├── fase-tokens.css    — Variáveis HSL de cor, tipografia, espaçamento
│       ├── fase-components.css — Botões, inputs, cards, glassmorphism
│       ├── fase-guide.css     — Layout utilities (flex, grid)
│       ├── app.css            — Global + @media print A4
│       └── admin.css          — Páginas administrativas
├── docs/                      — Documentação de referência
├── .env.example
├── ARCHITECTURE.md
├── CLAUDE.md
├── DESIGN_SYSTEM.md
├── PRD.md
├── REGRAS_NEGOCIO.md
└── README.md
```

---

## 3. Banco de Dados

### 3.1. Schema Prisma — Modelos

```
PriceCategory   — 8 categorias (kit_esportivo, camisa_malha, estampa_total, ...)
PriceBracket    — 5 faixas de volume (10-50, 51-100, 101-300, 301-500, 501+)
PriceGroup      — Agrupamento por tipo (SCALAR | BRACKET_ROW | BRACKET_MATRIX)
PriceEntry      — Valores individuais de preço

SizeChart       — 5 gabaritos de tabela de tamanho
SizeColumn      — Dimensões (Altura, Largura, Braço, Nº...)
SizeRow         — Labels de tamanho (PP, P, M, G, GG, XGG, XXGG)
SizeCell        — Valores de célula

Partner         — Parcerias com taxas kitDiscount, sportDiscount, promoDiscount
Budget          — Cabeçalho do orçamento (cliente, entrega, validade, totais, status)
BudgetLineItem  — Itens do orçamento (qty, unit, desconto parceria, netTotal)
BudgetStatusEvent — Histórico de mudanças de status
Settings        — Configurações gerais em JSON
```

### 3.2. Seed

O script `prisma/seed.ts` lê os três arquivos de `src/data/defaults/`:
- `pricebook.json` → popula PriceCategory + PriceBracket + PriceGroup + PriceEntry
- `sizes.json` → popula SizeChart + SizeColumn + SizeRow + SizeCell
- `partners.json` → popula Partner

Usar `npx prisma db seed` para popular o banco.

### 3.3. Tipos de Grupo de Preço

| Tipo | Estrutura | Exemplo |
|------|-----------|---------|
| `SCALAR` | `{ key: value }` | gola: { polo: 4, redonda: 0 } |
| `BRACKET_ROW` | `[v0, v1, v2, v3, v4]` (por faixa) | baseRow: [24, 21, 19, 17, 16] |
| `BRACKET_MATRIX` | `{ key: [v0...v4] }` | tecMatrix: { PP: [44,41,...] } |

---

## 4. Engine de Preços (`src/data/pricebook.ts`)

### 4.1. Estrutura de Faixas de Volume

```typescript
BRACKETS = [
  { label: '10–50',   min: 10,  max: 50  },  // índice 0
  { label: '51–100',  min: 51,  max: 100 },  // índice 1
  { label: '101–300', min: 101, max: 300 },  // índice 2
  { label: '301–500', min: 301, max: 500 },  // índice 3
  { label: '501+',    min: 501, max: ∞   },  // índice 4
]

bracketIndex(qty) → índice 0-4 conforme a quantidade
```

### 4.2. DEFAULT_PB — Fallback Local

`DEFAULT_PB` é usado apenas quando `/api/pricebook` está indisponível. A fonte canônica é o banco. **Deve estar sempre em sync com `src/data/defaults/pricebook.json`.**

Quando o banco responde, `updatePBFromServer(data)` faz deep-merge e notifica todos os subscribers via `Set<() => void>`.

### 4.3. Cálculo de Preço Unitário por Categoria

| Categoria | Fórmula | Brackets |
|-----------|---------|----------|
| `kit_esportivo` | `kit[linha] + Σ extras` | Não |
| `camisa_malha` | `tecMatrix[tecido][b] + gola[tipo] + Σ extras` | Sim |
| `estampa_total` | `areaMatrix[area][b] + gola[tipo] + tecido[tipo] + Σ extras` | Sim |
| `camisa_pp` | `baseRow[b] + cor[tipo] + config[tipo] + area[tipo] + Σ fotos` | Sim |
| `social` | `peca[tipo] + tecido[tipo] + Σ extras` | Não |
| `tactel_helanca` | `peca[tipo] + linha[tipo] + faixa[tipo] + Σ extras` | Não |
| `bandeira` | `acab[tipo] × tamM2[tamanho] + Σ extras` | Não |
| `abada` | `baseRow[b] + tecido[tipo] + Σ extras` | Sim |

### 4.4. Desconto de Parceria

```typescript
partnerDiscount(partner: string, kind: string): number
```

- `kind` = `'kit'` | `'esportivo'` | `'promocional'` | `'abada'`
- **Abadá é sempre isento** — retorna 0 independente da parceria
- Taxa lida da tabela `Partner` no banco, carregada via `/api/partners`

### 4.5. Linhas do Kit Esportivo

Cada linha representa o kit completo (Camisa + Short + Meião):

| Chave | Label | Preço Kit | Tecido | Observação |
|-------|-------|:---------:|--------|------------|
| `prata` | Prata | R$ 128,00 | Dry básico | — |
| `ouro` | Ouro | R$ 150,00 | Dry alta performance | — |
| `prof` | Profissional | R$ 170,00 | Elastano premium | Nome incluso no kit |
| `escolinha` | Escolinha | R$ 133,00 | Dry resistente | Nome incluso · desconto 25% via parceria |

**Extras do Kit (acréscimos por peça):**

| Chave | Label | Valor | Regra |
|-------|-------|:-----:|-------|
| `nome` | Nome Individual | +R$ 5,00 | Só para Prata e Ouro (Prof e Escolinha já incluem) |
| `colete` | Colete | +R$ 22,00 | Colete numerado |
| `goleiro` | Goleiro Manga Longa | +R$ 10,00 | Acréscimo para camisa do goleiro em manga longa |
| `meiao` | Meia Cano Longo | +R$ 20,00 | Para comissão técnica ou reposição |

> **Nota sobre Escolinha:** O desconto padrão de 25% não é aplicado automaticamente pelo `kit[escolinha]` — ele é configurado via a parceria da escola na tabela de Partners. A chave `escolinha` representa apenas o preço base do kit.

---

## 5. Estado Global (`src/context/BudgetContext.tsx`)

### 5.1. Inicialização

Na montagem do `BudgetProvider`, carrega em paralelo:
- `GET /api/partners` → `updatePartnersFromServer()`
- `GET /api/pricebook` → `updatePBFromServer()`
- `GET /api/sizes` → `updateSizesFromServer()`
- `GET /api/settings` → `setSettings()`

### 5.2. Estado Mantido

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `activeCat` | `string` | Categoria ativa no configurador |
| `config` | `Record<catId, any>` | Seleções atuais por categoria |
| `cart` | `CartItem[]` | Itens adicionados ao orçamento |
| `client` | `ClientData` | Nome, telefone, parceria |
| `disc` | `DiscountData` | Desconto adicional (% ou R$) |
| `cond` | `ConditionsData` | Prazo de entrega e validade |
| `totals` | `TotalsData` | Calculado em tempo real |
| `settings` | `AppSettings` | Configurações do app |
| `notes` | `string` | Observações do orçamento |

### 5.3. Cálculo de Totais

```
subtotal    = Σ (item.unit × item.qty)
partnerDisc = Σ (item.unit × item.qty × item.partnerDiscountPct / 100)
addDisc     = disc.type === 'percentage'
                ? (subtotal - partnerDisc) × disc.value / 100
                : disc.value
net         = subtotal - partnerDisc - addDisc
entry       = net × 0.50   ← 50% de entrada obrigatório (BR-04)
```

### 5.4. CartItem

```typescript
interface CartItem {
  uid: string            // identificador único (timestamp + random)
  catId: string          // ex: 'camisa_malha'
  kind: string           // 'kit' | 'esportivo' | 'promocional' | 'abada'
  desc: string           // descrição técnica gerada pelo describe()
  qty: number
  unit: number           // preço snapshot no momento da adição
  snap: any              // configuração snapshot (para auditoria)
  partnerDiscountPct: number
  netUnit: number        // unit × (1 - partnerDiscountPct/100)
}
```

### 5.5. Persistência de Orçamento

`saveBudgetToServer(status?)` faz `POST /api/budgets` com:
- Cabeçalho: cliente, entrega, validade, subtotal, desconto, líquido, status
- Line items: cada CartItem com qty, unit, desconto, netTotal

Retorna `{ success, data: { budgetNumber } }` — o número sequencial do orçamento exibido no PDF.

---

## 6. Autenticação

- **Senha compartilhada** via `APP_PASSWORD` no `.env`
- Login via `POST /api/auth/login` → define cookie HTTP-only assinado com `APP_SECRET`
- `src/middleware.ts` intercepta todas as requisições não públicas:
  - Rotas públicas: `/login`, `/api/auth/*`
  - Demais rotas → verifica cookie → redireciona para `/login` se inválido

---

## 7. API Routes — Contratos

Todas as respostas seguem o padrão:
```json
{ "success": true, "data": { ... } }
// ou
{ "success": false, "error": "mensagem" }
```

### `GET /api/pricebook`
Retorna o pricebook completo reconstruído do banco no formato `DEFAULT_PB`.

### `POST /api/pricebook`
Body: `{ catId, group, keyPath, value }` — atualiza um valor específico. Usado pela página `/tabela`.

### `GET /api/partners`
Retorna lista de parceiros: `[{ id, name, kitDiscount, sportDiscount, promoDiscount }]`

### `POST/PUT/DELETE /api/partners[/id]`
CRUD de parceiros.

### `GET/POST /api/budgets`
- GET: lista com `?search`, `?status`, `?dateFrom`, `?dateTo`, `?page`
- POST: cria orçamento + line items

### `GET/PUT/DELETE /api/budgets/[id]`
- GET: orçamento completo com line items e histórico de status
- PUT: atualiza status (`open` | `won` | `lost`) + notes
- DELETE: exclui orçamento (hard delete — usar com cautela)

### `GET /api/metrics`
Retorna: total de orçamentos, faturamento, ticket médio, taxa de conversão (won/total), breakdown por categoria.

### `GET/POST /api/settings`
Configurações globais em JSON (logo URL, validade padrão, etc.).

### `GET/POST /api/sizes`
Leitura e atualização das tabelas de tamanho.

---

## 8. Layout de Impressão A4

O componente `PrintSheet.tsx` é renderizado sempre, mas oculto via CSS. Ao chamar `window.print()`:

1. `@media print` em `app.css` oculta tudo exceto `#print-area`
2. Exibe o layout A4 formal com logo, dados do cliente, tabela de itens, totais e condições
3. Se `attachSizes === true`, renderiza também a tabela de tamanho selecionada via `MeasurementSvg.tsx`
4. A nota de parceria aparece automaticamente quando `partnership !== 'Nenhuma'`:
   ```
   *INCLUSA LOGO DA FASE NA FRENTE E COSTAS EM DESTAQUE,
   EXCETO CAMISAS DE FORMANDOS.*
   ```

---

## 9. Fluxo de Dados Completo

```
[PostgreSQL / Neon]
        ↓ (na inicialização)
  /api/pricebook, /api/partners, /api/sizes, /api/settings
        ↓
  BudgetContext.updatePBFromServer()
        ↓
  CATEGORIES.price() roda em tempo real a cada seleção
        ↓
  addToCart() → CartItem com preço snapshot
        ↓
  totals calculados via useMemo em tempo real
        ↓
  saveBudgetToServer() → POST /api/budgets → PostgreSQL
                    ↘ window.print() → PDF A4
```

---

## 10. Variáveis de Ambiente

| Variável | Uso | Obrigatório |
|----------|-----|:-----------:|
| `DATABASE_URL` | Queries (pooler Neon) | Sim |
| `DIRECT_URL` | Migrations e seed | Sim |
| `APP_PASSWORD` | Senha de acesso da equipe | Sim |
| `APP_SECRET` | Assinar cookie de sessão | Sim |

---

## 11. Comandos de Desenvolvimento

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npx prisma db push       # Aplica schema ao banco
npx prisma db seed       # Popula banco com defaults
npx prisma studio        # GUI de inspeção do banco
npx prisma generate      # Regenera o Prisma Client após mudança de schema
```
