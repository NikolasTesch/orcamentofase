# Constituição do Agente — Fase Esporte Budget Generator

> Leia este arquivo antes de qualquer ação neste projeto.
> **Este projeto é independente** do Cadife Smart Travel (pasta pai).

---

## Identidade do Projeto

**Gerador de Orçamentos Interativo** para a Fase Esporte (Teixeira de Freitas - BA) — empresa de confecção de uniformes e artigos esportivos.

O sistema substitui planilhas Excel por uma interface web que permite aos vendedores configurar produtos e gerar orçamentos formais em PDF/A4 em segundos.

**Stack:** Next.js 16 · React 19 · TypeScript 5 · Prisma 6 · PostgreSQL (Neon) · Vanilla CSS · Framer Motion

---

## Estrutura do Projeto

| Camada | Diretório | Responsabilidade |
|--------|-----------|-----------------|
| Banco de dados | `prisma/` | Schema, migrations, seed |
| API backend | `src/app/api/` | Route Handlers Next.js (auth, budgets, pricebook, partners, sizes, metrics, settings) |
| Estado global | `src/context/BudgetContext.tsx` | Cálculo financeiro, carrinho, desconto, save |
| Engine de preços | `src/data/pricebook.ts` | CATEGORIES, DEFAULT_PB (fallback), helpers de cálculo |
| Defaults/seed | `src/data/defaults/` | `pricebook.json`, `sizes.json`, `partners.json` — fonte canônica dos valores default |
| Componentes | `src/components/gerador/` | UI do gerador (Configurator, BudgetCart, PrintSheet, etc.) |
| Estilos | `src/styles/` | CSS: tokens HSL, componentes, print media A4 |
| Autenticação | `src/middleware.ts` + `src/lib/auth.ts` | Senha compartilhada + cookie de sessão |

---

## Regras Críticas do Negócio

1. **`pricebook.json` é a fonte de verdade dos preços default** — `DEFAULT_PB` em `pricebook.ts` deve sempre estar em sync com `src/data/defaults/pricebook.json`. Quando um preço muda, atualizar ambos. **Nota:** `pricebook.json` está no `.gitignore` (dados comerciais sensíveis) — alterações nele não são rastreadas pelo git.

2. **Abadá é sempre isento de desconto de parceria** — regra de evento implementada em `partnerDiscount()` (`kind === 'abada'` retorna 0).

3. **Preço unitário de bandeiras = `acab[tipo]` × `tamM2[tamanho]` + extras** — NÃO é preço fixo. `acab` é R$/m², `tamM2` é área em m².

4. **Brackets de volume** — `bracketIndex()` mapeia quantidade para índice 0-4 nas matrizes de preço. Categorias `brackets: false` ignoram volume (Kit Esportivo, Social, Tactel, Bandeiras).

5. **Dados do banco têm prioridade sobre DEFAULT_PB** — `updatePBFromServer()` faz deep-merge e notifica subscribers. DEFAULT_PB é fallback para quando `/api/pricebook` falha.

6. **Autenticação por cookie** — middleware protege todas as rotas exceto `/login` e `/api/auth/*`. Usar `APP_SECRET` do `.env` para assinar o cookie.

7. **Soft delete de orçamentos** — orçamentos têm status (`open`/`won`/`lost`), nunca são deletados fisicamente sem confirmação explícita.

---

## Fluxo de Preço por Categoria

| Categoria | Tipo de Preço | Brackets |
|-----------|---------------|----------|
| `kit_esportivo` | SCALAR — preço fixo por linha | Não |
| `camisa_malha` | BRACKET_MATRIX — tecido × volume | Sim |
| `estampa_total` | BRACKET_MATRIX — área × volume | Sim |
| `camisa_pp` | BRACKET_ROW — base por volume + acréscimos | Sim |
| `social` | SCALAR — peça + tecido + extras | Não |
| `tactel_helanca` | SCALAR — peça + linha + faixa etária | Não |
| `bandeira` | SCALAR — acab(R$/m²) × tamM2(m²) + extras | Não |
| `abada` | BRACKET_ROW — base por volume + tecido | Sim |

---

## Arquivos de Documentação do Projeto

| Arquivo | Conteúdo |
|---------|----------|
| `REGRAS_NEGOCIO.md` | Regras detalhadas por categoria (bandeiras, personalização, kits) — **fonte de verdade para regras comerciais** |
| `SPEC.md` | Especificação técnica geral (nota: tem problema de encoding em alguns trechos) |
| `PRD.md` | Requisitos de produto (MoSCoW) |
| `DESIGN_SYSTEM.md` | Tokens de design, paleta, tipografia |
| `ARCHITECTURE.md` | Arquitetura de diretórios e módulos |

---

## Padrões de Código

### TypeScript/React
- Componentes em `src/components/gerador/` usam `useBudget()` para acessar o contexto
- `"use client"` obrigatório em componentes que usam hooks ou interatividade
- Props tipadas com interfaces explícitas (sem `any` em assinaturas públicas)
- Sem `console.log` de debug no código commitado

### CSS
- Cores e espaçamentos **somente** via variáveis CSS de `fase-tokens.css` — nunca valores hardcoded
- Estilos de print em `app.css` (`@media print`) — manter sempre que tocar PrintSheet.tsx

### API Routes
- Todas as routes em `src/app/api/` verificam autenticação antes de processar
- Respostas padronizadas: `{ success: true, data: ... }` ou `{ success: false, error: "..." }`
- Usar o singleton `prisma` de `src/lib/prisma.ts`

### Banco de Dados
- Toda mudança de schema em `prisma/schema.prisma` → rodar `npx prisma db push` (dev) ou migration (prod)
- Seed em `prisma/seed.ts` lê de `src/data/defaults/*.json`
- Nunca hardcodar `DATABASE_URL` — sempre via `.env`

---

## Variáveis de Ambiente Necessárias

```env
DATABASE_URL=    # Pooled connection (queries em produção)
DIRECT_URL=      # Direct connection (migrations/seed)
APP_PASSWORD=    # Senha compartilhada da equipe
APP_SECRET=      # Segredo para assinar cookie de sessão
```

---

## Comandos Úteis

```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npx prisma db push       # Aplica schema ao banco (sem migration file)
npx prisma db seed       # Popula banco com dados defaults
npx prisma studio        # GUI para inspecionar banco
```
