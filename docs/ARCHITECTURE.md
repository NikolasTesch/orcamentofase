# Arquitetura de Diretórios e Código: Fase Esporte Budget Generator

Este documento descreve a arquitetura de pastas, responsabilidades e diretrizes de organização do **Gerador de Orçamentos da Fase Esporte** sob a stack **Next.js + TypeScript + PostgreSQL (Neon)**.

---

## 1. Visão Geral do Design Arquitetural

A arquitetura segue os princípios de uma aplicação web moderna baseada em **Next.js (App Router)** com **TypeScript**. Três pilares fundamentais:

1. **Dados Relacionais via Prisma (`prisma/` + `/api`)**: Tabela de preços, parcerias, tabelas de tamanho e orçamentos são persistidos no PostgreSQL (Neon). O `pricebook.ts` mantém `DEFAULT_PB` apenas como fallback — a fonte canônica é o banco. Endpoints de API (`/api/pricebook`, `/api/partners`, `/api/sizes`) fornecem dados ao cliente.

2. **Gerenciador Comercial Unificado (`src/context/`)**: Toda a matemática financeira, seleção de brackets de volume, validações de regras e descontos de parcerias residem no `BudgetContext.tsx`. Componentes visuais apenas lêem ou despacham eventos para este provedor.

3. **Componentização Modular Reutilizável (`src/components/`)**: Seletores interativos e formulários são isolados por domínio em subpastas.

---

## 2. Árvore Geral do Workspace

```text
orcamentofase/
├── prisma/                         # ORM e banco de dados
│   ├── schema.prisma               # Schema relacional (8 modelos)
│   ├── seed.ts                     # Script de seed inicial com pricebook.json e sizes.json
│   └── migrations/                 # Histórico de migrações SQL
├── src/                            # Código-fonte principal
│   ├── app/                        # Rotas e layouts (Next.js App Router)
│   │   ├── layout.tsx              # Layout raiz (fontes, CSS global, providers)
│   │   ├── page.tsx                # Gerador de Orçamentos (homepage)
│   │   ├── login/                  # Página de autenticação (senha compartilhada)
│   │   ├── historico/              # Histórico de orçamentos salvos
│   │   ├── metricas/               # Dashboard de métricas comerciais
│   │   ├── tabela/                 # Editor da tabela de preços (escreve no DB)
│   │   ├── tamanhos/               # Editor de tabelas de tamanho
│   │   ├── configuracoes/          # Configurações do app (validade, entrega, etc.)
│   │   ├── design-system/          # Showcasedo Design System
│   │   └── api/                    # Rotas de API (Next.js Route Handlers)
│   │       ├── auth/               # login / logout (sessão com cookie)
│   │       ├── budgets/            # CRUD de orçamentos ([id]: GET/PUT/DELETE)
│   │       ├── metrics/            # Agregações comerciais
│   │       ├── partners/           # CRUD de parcerias ([id]: GET/PUT/DELETE)
│   │       ├── pricebook/          # Leitura e atualização do livro de preços
│   │       ├── settings/           # Configurações globais
│   │       └── sizes/              # Leitura e atualização das tabelas de tamanho
│   ├── assets/                     # Vetores de logo (SVG)
│   ├── components/                 # Componentes de UI
│   │   ├── app/                    # Estruturais: AppHeader, PageHeader, PageLayout
│   │   ├── ds/                     # Design System: Nav
│   │   └── gerador/                # Gerador de orçamento:
│   │       ├── BudgetCart.tsx      # Tabela de itens no orçamento ativo
│   │       ├── CategoryTabs.tsx    # Abas de navegação por categoria
│   │       ├── ClientForm.tsx      # Formulário de cliente e seleção de parceria
│   │       ├── Conditions.tsx      # Prazos, validade e desconto adicional
│   │       ├── Configurator.tsx    # Configurador dinâmico (gola, tecido, opcionais)
│   │       ├── MeasurementSvg.tsx  # SVG interativo de medidas
│   │       ├── PreviewModal.tsx    # Modal de pré-visualização do A4
│   │       ├── PrintSheet.tsx      # Layout formal A4 otimizado para @media print
│   │       ├── Simulator.tsx       # Simulação do preço unitário em tempo real
│   │       └── Totals.tsx          # Resumo financeiro líquido
│   ├── context/                    # Estado global comercial
│   │   ├── budget-context.ts       # Interfaces TypeScript + criação do contexto
│   │   ├── BudgetContext.tsx       # Provider: cálculos, cart, desconto, save
│   │   ├── theme-context.ts        # Tipos e contexto do tema (re-export compat.)
│   │   └── theme.tsx               # ThemeProvider, ThemeToggle, AccentSwatches
│   ├── data/                       # Lógica e defaults de precificação
│   │   ├── defaults/
│   │   │   ├── pricebook.json      # Valores canônicos usados no seed (fonte de verdade)
│   │   │   ├── sizes.json          # Tabelas de tamanho padrão para seed
│   │   │   └── partners.json       # Parcerias padrão para seed
│   │   ├── pricebook.ts            # Engine de preços: CATEGORIES, DEFAULT_PB (fallback), helpers
│   │   └── sizes.ts                # Lógica de tabelas de tamanho
│   ├── lib/                        # Utilitários
│   │   ├── auth.ts                 # Helpers de autenticação (cookie/session)
│   │   ├── image-slot.js           # Custom Element <image-slot> drag & drop
│   │   ├── prisma.ts               # Singleton do PrismaClient
│   │   └── settings.ts             # Tipos e defaults de configurações do app
│   ├── middleware.ts               # Proteção de rotas (redireciona para /login)
│   ├── styles/                     # Design System CSS
│   │   ├── fase-tokens.css         # Variáveis HSL (cores, espaçamento, tipografia)
│   │   ├── fase-components.css     # Componentes reutilizáveis (buttons, inputs, panels)
│   │   ├── fase-guide.css          # Layout utilities (flex, grid, glassmorphism)
│   │   ├── app.css                 # Global styles + @media print para A4
│   │   └── admin.css               # Estilos das páginas admin (tabela, historico, etc.)
│   ├── theme.tsx                   # Re-export de src/context/theme.tsx (compat. legado)
│   └── theme-context.ts            # Re-export de src/context/theme-context.ts (compat. legado)
├── docs/                           # Cópia dos documentos de referência
├── public/                         # Ativos estáticos
├── .env.example                    # Variáveis de ambiente necessárias
├── next.config.ts                  # Configuração do Next.js
├── tsconfig.json                   # Configuração TypeScript (path alias @/*)
├── package.json                    # Dependências e scripts
├── ARCHITECTURE.md                 # Este documento
├── DESIGN_SYSTEM.md                # Tokens, paleta e tipografia
├── PRD.md                          # Requisitos de produto
├── REGRAS_NEGOCIO.md               # Regras por categoria (bandeiras, personalização, kits)
├── SPEC.md                         # Especificação técnica
└── README.md                       # Manual de execução e setup
```

---

## 3. Detalhamento de Módulos Críticos

### 3.1. Roteamento e API (`src/app/`)

- **`layout.tsx`**: Carrega fontes (Outfit, Inter, JetBrains Mono), CSS global e envolve a app no `ThemeProvider` + `BudgetProvider`.
- **`page.tsx`**: Homepage — Gerador de Orçamentos. Compõe todos os componentes do gerador sob o `BudgetProvider`.
- **`login/`**: Autenticação por senha compartilhada (`APP_PASSWORD` via `.env`). Define cookie de sessão.
- **`historico/`**: Lista orçamentos salvos com filtro, busca e edição de status.
- **`tabela/`**: Editor de preços que lê/escreve no banco via `POST /api/pricebook`.
- **`tamanhos/`**: Editor de tabelas de tamanho via `POST /api/sizes`.
- **`metricas/`**: Agrega métricas comerciais (`/api/metrics`): volume, faturamento, conversão.
- **`configuracoes/`**: Edita configurações globais (`/api/settings`): logo, validade padrão, etc.
- **API routes**: Todos autenticados por cookie (exceto `/api/auth/*`). Usam `prisma.ts` singleton para acesso ao Neon.

### 3.2. Engine de Preços (`src/data/pricebook.ts`)

- **`DEFAULT_PB`**: Fallback local — usado apenas quando o banco está indisponível. Deve estar em sync com `src/data/defaults/pricebook.json`.
- **`updatePBFromServer()`**: Recebe dados de `/api/pricebook` e faz deep-merge sobre `DEFAULT_PB`.
- **`CATEGORIES`**: Array com definição de cada categoria: seletores, defaults, funções `price()` e `describe()`.
- **`computeUnit()`**: Calcula preço unitário de um item considerando bracket de volume quando aplicável.
- **`partnerDiscount()`**: Aplica desconto de parceria por `kind` (kit/esportivo/promocional/abada — abadá é isento).

### 3.3. Provedor Comercial (`src/context/BudgetContext.tsx`)

Na inicialização, carrega em paralelo: `/api/partners`, `/api/pricebook`, `/api/sizes`, `/api/settings`. Mantém:

- **`config`**: Estado do configurador por categoria (seleções atuais)
- **`cart`**: Items adicionados com preço snapshot no momento da adição
- **`totals`**: Calculado em tempo real: subtotal → desconto parceria → desconto adicional → líquido → entrada 50%
- **`saveBudgetToServer()`**: Persiste orçamento + line items no PostgreSQL via `POST /api/budgets`

### 3.4. Autenticação (`src/middleware.ts` + `src/lib/auth.ts`)

Proteção via cookie de sessão assinado com `APP_SECRET`. Rotas públicas: `/login`, `/api/auth/*`. Todas as demais exigem sessão válida.

---

## 4. Fluxo de Dados

```text
         [ PostgreSQL / Neon ]
                  |
     /api/pricebook, /api/partners, /api/sizes, /api/settings
                  |
         [ BudgetContext Provider ]
                  |
    +-------------+-------------+
    |                           |
    v                           v
[ Configurator ]          [ BudgetCart ]
- Lê CATEGORIES           - Lê cart[]
- price() em tempo real   - qty inline edit
- addToCart()             - removeFromCart()
    |                           |
    +-------------+-------------+
                  |
           [ ClientForm ]
         - cliente, parceria
         - desconto adicional
                  |
           [ PrintSheet ]
         - layout A4 @media print
         - PDF via window.print()
                  |
         [ /api/budgets POST ]
         - salva no banco
```

---

## 5. Design System CSS (`src/styles/`)

1. **`fase-tokens.css`**: Variáveis HSL no `:root`, `[data-theme="dark"]` e `[data-theme="light"]`.
2. **`fase-components.css`**: Botões, inputs, cards, glassmorphism panels.
3. **`fase-guide.css`**: Layout (flex, grid), utilidades de espaçamento.
4. **`app.css`**: Global + `@media print` — A4 sem poluição visual, fundo branco, texto preto.
5. **`admin.css`**: Páginas admin (historico, tabela de preços, configurações).

**Sem frameworks CSS externos** (sem Tailwind/Bootstrap) — controle total sobre a estética premium da Fase Esporte.
