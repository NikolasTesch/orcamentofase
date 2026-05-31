# Arquitetura de Diretórios e Código: Fase Esporte Budget Generator

Este documento descreve detalhadamente a arquitetura de pastas, a finalidade de cada diretório e arquivo, as divisões de responsabilidades e as diretrizes de organização do **Gerador de Orçamentos da Fase Esporte** sob a stack **Next.js + TypeScript**.

---

## 1. Visão Geral do Design Arquitetural

A arquitetura do projeto segue os princípios de uma aplicação web moderna baseada em **Next.js (App Router)** com **TypeScript**. A organização divide-se em três pilares fundamentais:

1. **Dados Estáticos & Matrizes de Preços (`src/data/`)**: A tabela de preços e os coeficientes de descontos são separados da lógica de visualização. O banco de preços (`pricebook.ts`) é tipado estritamente e persistido em `localStorage`, permitindo edição local em tempo real sem afetar os dados originais (`prices.ts`).
2. **Gerenciador Comercial Unificado (`src/context/`)**: Toda a matemática financeira, seleção de brackets de volume, validações de regras e descontos de parcerias residem em um provedor de estado central (`BudgetContext.tsx`). Os componentes visuais apenas lêem ou despacham eventos para este provedor.
3. **Componentização Modular Reutilizável (`src/components/`)**: Os seletores de botões interativos e formulários são isolados por domínio, organizados de forma clara em subpastas.

---

## 2. Árvore Geral do Workspace

```text
orcamentofase/
├── public/                         # Ativos estáticos servidos diretamente
│   └── favicon.ico                 # Ícone da aplicação para a aba do navegador
├── src/                            # Diretório principal de código fonte
│   ├── app/                        # Rotas e layouts do Next.js (App Router)
│   │   ├── layout.tsx              # Layout raiz (Fontes, CSS globais e Providers)
│   │   ├── page.tsx                # Gerador de Orçamentos (Homepage)
│   │   ├── metricas/               # Página de análise comercial e métricas
│   │   ├── tabela/                 # Página administrativa de edição de preços
│   │   └── design-system/          # Apresentação do Design System interativo
│   ├── assets/                     # Recursos visuais (imagens, vetores, logos)
│   │   ├── logo-fase-branco.svg    # Logo da Fase Esporte em vetor para telas escurecidas
│   │   └── logo-fase-preto.svg     # Logo oficial para telas claras e folha de impressão
│   │   └── logo-fase-allwhite.svg  # Logo monocromática branca para cabeçalho do A4 PDF
│   ├── components/                 # Componentes de interface de usuário (UI)
│   │   ├── app/                    # Componentes estruturais globais (AppHeader.tsx)
│   │   ├── ds/                     # Componentes do Design System (Nav.tsx)
│   │   └── gerador/                # Configuradores específicos do gerador de orçamento
│   │       ├── BudgetCart.tsx      # Tabela de itens ativos inseridos no orçamento
│   │       ├── ClientForm.tsx      # Formulário de cliente, parcerias e prazos
│   │       ├── Conditions.tsx      # Configuração de validade e descontos extras
│   │       ├── Configurator.tsx    # Configurador dinâmico de golas, tecidos e opcionais
│   │       ├── PreviewModal.tsx    # Modal de visualização do A4
│   │       ├── PrintSheet.tsx      # Layout formal A4 otimizado para impressão
│   │       ├── Simulator.tsx       # Simulação de preço unitário em tempo real
│   │       └── Totals.tsx          # Resumo financeiro líquido do orçamento
│   ├── context/                    # Gerenciamento de Estado Global Comercial
│   │   ├── budget-context.ts       # Declarações de interfaces e criação do contexto
│   │   └── BudgetContext.tsx       # Provedor (Provider) de estado comercial reativo
│   ├── data/                       # Armazenamento de Dados de preços
│   │   ├── prices.ts               # Tabela original de preços convertidos do Excel
│   │   └── pricebook.ts            # Lógica e schema de preços oficiais editáveis
│   ├── lib/                        # Bibliotecas auxiliares e Custom Elements
│   │   └── image-slot.js           # Custom Element <image-slot> drag & drop
│   └── styles/                     # Estilos visuais e tokens (.css)
├── next.config.ts                  # Configuração do Next.js
├── tsconfig.json                   # Configuração do compilador TypeScript e aliases
├── package.json                    # Definição de dependências e scripts npm
├── SPEC.md                         # Especificações técnicas detalhadas
├── PRD.md                          # Documento de Requisitos de Produto
└── ARCHITECTURE.md                 # Este documento de arquitetura
```

---

## 3. Detalhamento de Pastas e Componentes

### 3.1. Roteamento e Estrutura da Aplicação (`src/app/`)
Diferente da estrutura SPA tradicional, o Next.js gerencia as páginas de forma nativa e isolada através de rotas baseadas em diretórios:
- **`layout.tsx`**: Carrega as fontes do Google Fonts (`Outfit`, `Inter` e `JetBrains Mono`) usando `next/font/google` para otimização de CLS (Cumulative Layout Shift). Centraliza as importações globais de CSS e envolve as rotas no `ThemeProvider`.
- **`page.tsx`**: Ponto de entrada que renderiza o **Gerador de Orçamentos**. É reestilizado com `"use client"` e envelopado com o `BudgetProvider` para alimentar os seletores de forma modular.
- **`metricas/page.tsx`**: Página reativa com dashboards analíticos para acompanhamento comercial.
- **`tabela/page.tsx`**: Editor de preços dinâmicos que escreve diretamente no `pricebook.ts` e persiste no localStorage.

### 3.2. Provedor Comercial (`src/context/`)
- **`budget-context.ts`**: Define as interfaces TypeScript estritas (`CartItem`, `ClientData`, `DiscountData`, `ConditionsData`, `TotalsData`, `BudgetContextValue`) para garantir segurança de tipos em toda a aplicação.
- **`BudgetContext.tsx`**: Implementa a máquina de cálculo financeiro e estado comercial reativo.

### 3.3. Safegard para Server-Side Rendering (SSR)
O Custom Element `<image-slot>` (`src/lib/image-slot.js`) manipula APIs do navegador como `window.customElements`, `fetch` e eventos de `drag & drop`. Para evitar erros durante a renderização estática do Next.js no servidor, criamos o componente auxiliar **`src/components/ClientLoader.tsx`**, que carrega a biblioteca de forma segura no lado do cliente usando `useEffect`:
```typescript
"use client"
import { useEffect } from 'react'

export default function ClientLoader() {
  useEffect(() => {
    import('../lib/image-slot.js')
  }, [])
  return null
}
```

---

## 4. Fluxo de Dados Unidirecional

O fluxo de dados da aplicação segue a arquitetura unidirecional recomendada no ecossistema React/Next.js:

```text
                     [ BudgetContext Provider ]
                                 |
           +---------------------+---------------------+
           |                                           |
           v                                           v
   [ Configurator ]                             [ BudgetCart ]
 - Lê schema e dados de preços                - Lê array de itens ativos
 - Calcula preço unitário dinâmico            - Incrementa ou decrementa Qtd
 - Dispara addToCart()                        - Dispara removeFromCart()
           |                                           |
           +---------------------+---------------------+
                                 |
                                 v
                          [ ClientForm ]
                    - Atualiza clientData e parceria
                    - Dispara recálculo de descontos
                                 |
                                 v
                          [ PrintSheet ]
                    - Gera folha econômica A4
                    - Lê todos os dados e slots do cliente
```

---

## 5. Diretrizes de Codificação e Estilo CSS (Design System)

Toda a estilização premium da aplicação reside no arquivo central **`styles/`**, organizado da seguinte forma:
1. **Tokens de Design (`fase-tokens.css`)**: Definição do tema Fase Esporte com variáveis CSS HSL no `:root` e no `[data-theme="dark"]` ou `[data-theme="light"]`.
2. **Guias e Utilidades (`fase-guide.css` e `fase-components.css`)**: Layout e micro-componentes reutilizáveis (botões, inputs, painéis translúcidos com `backdrop-filter`).
3. **Estilo Print Media (`app.css`)**: Regras `@media print` para otimização em A4 sem poluição visual, ajustando cores de fundo para branco puro e texto para preto.
