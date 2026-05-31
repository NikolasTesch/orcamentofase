# Fase Esporte — Gerador de Orçamentos

Aplicação web desenvolvida sob medida para a **Fase Esporte** (Teixeira de Freitas - BA). Substitui planilhas Excel por uma interface dinâmica que permite configurar produtos esportivos e gerar orçamentos formalizados em PDF/A4 de forma instantânea.

---

## Tecnologias

- **Next.js 16 (App Router)** + **React 19** + **TypeScript 5**
- **Prisma 6** + **PostgreSQL (Neon)** — banco de dados relacional em nuvem
- **Framer Motion** — animações e micro-interações
- **Vanilla CSS** com variáveis HSL — design system próprio da Fase Esporte
- **CSS Print Media** — geração de PDF A4 via `window.print()`

---

## Estrutura do Projeto

```text
orcamentofase/
├── prisma/              # Schema e seed do banco
├── src/
│   ├── app/             # Rotas Next.js (pages + API routes)
│   ├── components/      # Componentes de UI (gerador, estruturais, design system)
│   ├── context/         # Estado global comercial (BudgetContext)
│   ├── data/            # Engine de preços (pricebook.ts) + defaults para seed
│   ├── lib/             # Prisma, auth, settings
│   ├── middleware.ts    # Proteção de rotas
│   └── styles/          # CSS: tokens, componentes, print media
├── docs/                # Documentação de referência
├── .env.example         # Variáveis de ambiente necessárias
└── REGRAS_NEGOCIO.md    # Regras de negócio por categoria de produto
```

---

## Setup Local

### Pré-requisitos
- Node.js 18+ instalado
- Conta no [Neon](https://neon.tech) (ou outro PostgreSQL) com banco criado

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie `.env.example` para `.env` e preencha:

```env
DATABASE_URL="postgresql://user:pass@ep-host.region.pooler.neon.tech/orcamentofase?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-host.region.neon.tech/orcamentofase?sslmode=require"
APP_PASSWORD="sua-senha-de-acesso"
APP_SECRET="string-secreta-aleatoria-longa"
```

- `DATABASE_URL`: URL com pooler (usada pela app em produção/serverless)
- `DIRECT_URL`: URL direta (usada pelo Prisma para migrations e seed)
- `APP_PASSWORD`: Senha compartilhada da equipe de vendas
- `APP_SECRET`: Segredo para assinar o cookie de sessão

### 3. Criar tabelas no banco
```bash
npx prisma db push
```

### 4. Popular dados iniciais (preços, tamanhos, parcerias)
```bash
npx prisma db seed
```

### 5. Iniciar servidor de desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`. Faça login com `APP_PASSWORD`.

---

## Páginas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Gerador de Orçamentos (homepage) |
| `/login` | Autenticação por senha compartilhada |
| `/historico` | Histórico de orçamentos salvos (busca, filtro, edição de status) |
| `/metricas` | Dashboard de métricas comerciais |
| `/tabela` | Editor da tabela de preços (persiste no banco) |
| `/tamanhos` | Editor das tabelas de tamanho |
| `/configuracoes` | Configurações gerais do app |
| `/design-system` | Showcase do Design System |

---

## Fluxo de Orçamento

1. **Escolha a categoria** — abas superiores (Kit Esportivo, Camisa de Malha, Estampa Total, etc.)
2. **Configure com cliques** — tecido, gola, opcionais (manga longa, nome individual, etc.)
3. **Defina a quantidade** — para itens com bracket de volume, o preço unitário ajusta automaticamente
4. **Adicione ao orçamento** — item entra na lista com preço snapshot
5. **Preencha os dados do cliente** — nome, telefone, parceria (aplica desconto automático)
6. **Salve ou imprima** — salvar persiste no banco; imprimir gera PDF A4 formatado via `window.print()`

---

## Categorias de Produto

| Categoria | Tipo de Preço |
|-----------|---------------|
| Kit Esportivo | Preço fixo por linha (Prata/Ouro/Profissional/Premium) |
| Camisa de Malha | Matriz por tecido × faixa de volume |
| Estampa Total | Matriz por área × faixa de volume |
| Camisa PP | Base por faixa + acréscimos |
| Linha Social | Preço por peça + acréscimo de tecido |
| Tactel & Helanca | Preço por peça + linha + faixa etária |
| Bandeiras | Preço por m² (simples/dupla face) × área + opcionais |
| Abadás | Base por faixa de volume + tecido |

---

## Produção (Build)

```bash
npm run build
npm run start
```

---

## Propriedade

Software exclusivo da **Fase Esporte** — desenvolvido para otimizar a operação comercial da empresa.
