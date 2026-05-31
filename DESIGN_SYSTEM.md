# Design System: Fase Esporte Budget Generator

Este documento estabelece o **Design System oficial** para a interface do **Gerador de Orçamentos da Fase Esporte**. Ele serve como o guia visual, conceitual e técnico que orienta a implementação estilística da SPA em React, garantindo consistência, sofisticação e fidelidade de marca.

---

## 1. Conceito Criativo e Tom da Marca

A **Fase Esporte** é uma marca de uniformes e equipamentos esportivos de Teixeira de Freitas - BA. A identidade do produto deve refletir:
*   **Alta Performance**: Visual moderno, dinâmico, focado na energia do esporte.
*   **Sofisticação Tecnológica**: Utilização de interfaces escuras premium (*Dark Mode* por padrão) aliada a contrastes vibrantes e efeitos translúcidos (*Glassmorphism*).
*   **Agilidade e Confiança**: Layout limpo, legibilidade excelente para vendedores e clientes, e transições sutis que conferem robustez à aplicação.
*   **Formalidade Comercial**: Uma transição perfeita para um design limpo e econômico na folha de impressão A4 (salvar em PDF).

---

## 2. Tipografia Premium

A tipografia do sistema utiliza fontes do Google Fonts, balanceando a atitude atlética/esportiva nos títulos com a legibilidade de dados nas tabelas e formulários.

*   **Títulos e Cabeçalhos**: **Outfit**
    *   *Estilo*: Geométrica, moderna, com personalidade esportiva e forte presença visual.
    *   *Uso*: Títulos principais (`h1`), cabeçalhos de seções (`h2`), destaques de preços e botões principais de ação.
*   **Corpo de Texto e Dados**: **Inter**
    *   *Estilo*: Neo-grotesca, altamente legível em telas de alta e baixa resolução, com excelente espaçamento.
    *   *Uso*: Descrições de itens, inputs de formulário, dados de tabelas e textos informativos do rodapé.
*   **Dados Numéricos e Códigos**: **JetBrains Mono** ou **Consolas** (Mono-espaçados)
    *   *Uso*: Quantidades, brackets de preços e códigos de identificação de itens, garantindo alinhamento perfeito de colunas numéricas.

### Escala Tipográfica (CSS Tokens)

| Token CSS | Elemento | Tamanho (px) | Peso (Weight) | Espaçamento (Letter-spacing) |
| :--- | :--- | :--- | :--- | :--- |
| `--text-h1` | `h1` (Título Principal) | 56px / 3.5rem | 800 (Extra Bold) | -1.68px / -0.03em |
| `--text-h2` | `h2` (Subtítulo de Seção) | 24px / 1.5rem | 600 (Semi Bold) | -0.24px / -0.01em |
| `--text-h3` | `h3` (Títulos de Card) | 18px / 1.125rem | 600 (Semi Bold) | 0 |
| `--text-body`| `p`, `span` (Texto Geral) | 16px / 1rem | 400 (Regular) | 0.18px |
| `--text-btn` | `button` (Texto Botão) | 15px / 0.937rem | 600 (Semi Bold) | 0.5px / 0.03em |
| `--text-mono`| `code`, `.counter` | 14px / 0.875rem | 500 (Medium) | 0 |

---

## 3. Paleta de Cores e Tokens de Estilo

A paleta foi desenhada para priorizar o **Dark Mode** na tela do vendedor (evita fadiga ocular durante o dia e confere estética premium) e **Light Mode** otimizado para economia de tinta e contraste absoluto no PDF impresso.

### 3.1. Cores de Marca (Brand Colors)
O vermelho característico da Fase Esporte é a âncora visual do sistema.

```text
🔴 Fase RED
   HEX: #AF0608
   RGB: rgb(175, 6, 8)
   HSL: hsl(359, 93%, 35%)
   Uso: Marcação de estados ativos, botões primários de ação e acentos visuais cruciais.

🔴 Fase RED HOVER
   HEX: #D90429
   RGB: rgb(217, 4, 41)
   HSL: hsl(350, 96%, 43%)
   Uso: Feedback visual ao passar o mouse sobre botões ativos.
```

### 3.2. Tokens de Superfície (Temas)

#### 🌑 TEMA ESCURO (Tela do Vendedor - Padrão)
*   `--bg-app`: `#0e0f12` (Fundo principal ultra escuro).
*   `--bg-sidebar`: `#13151a` (Fundo lateral para navegação das abas de produtos).
*   `--bg-card`: `rgba(26, 28, 35, 0.75)` (Transparência de glassmorphism em cards do configurador).
*   `--bg-card-hover`: `rgba(35, 38, 48, 0.85)` (Feedback de hover nos cards).
*   `--border-color`: `rgba(255, 255, 255, 0.08)` (Borda elegante de separação).
*   `--border-color-active`: `rgba(175, 6, 8, 0.6)` (Borda vermelha que destaca elementos selecionados).
*   `--text-primary`: `#f3f4f6` (Cinza claro de altíssimo contraste para títulos).
*   `--text-secondary`: `#9ca3af` (Cinza médio para descrições).
*   `--text-muted`: `#6b7280` (Cinza escuro para observações secundárias).

#### ☀️ TEMA CLARO (Alternável / Acessibilidade)
*   `--bg-app`: `#f8fafc` (Branco azulado limpo).
*   `--bg-sidebar`: `#f1f5f9` (Fundo cinza claro para a barra lateral).
*   `--bg-card`: `rgba(255, 255, 255, 0.85)` (Cards brancos limpos).
*   `--bg-card-hover`: `rgba(255, 255, 255, 0.95)` (Feedback em hover).
*   `--border-color`: `rgba(0, 0, 0, 0.08)` (Borda cinza fina).
*   `--border-color-active`: `rgba(175, 6, 8, 0.5)` (Destaque da borda ativa em vermelho).
*   `--text-primary`: `#0f172a` (Preto azulado para contraste).
*   `--text-secondary`: `#475569` (Cinza escuro).
*   `--text-muted`: `#94a3b8` (Cinza claro).

### 3.3. Cores Semânticas
*   **Sucesso** (Adicionado ao carrinho, finalizado):
    *   `--color-success`: `#10b981` (Verde esmeralda).
    *   `--color-success-bg`: `rgba(16, 185, 129, 0.1)`.
*   **Alerta** (Brackets de quantidade abaixo do mínimo, avisos):
    *   `--color-warning`: `#f59e0b` (Ambar).
*   **Erro / Perigo** (Remover item, campos inválidos):
    *   `--color-danger`: `#ef4444` (Vermelho suave).
    *   `--color-danger-bg`: `rgba(239, 68, 68, 0.1)`.

---

## 4. Efeitos Visuais e Sombras

Para criar uma experiência premium, a interface utiliza:

*   **Glassmorphism (`.glass-panel`)**:
    *   `background: var(--bg-card);`
    *   `backdrop-filter: blur(12px);`
    *   `border: 1px solid var(--border-color);`
    *   Dá uma sensação de profundidade e fusão elegante com o plano de fundo da aplicação.
*   **Sombras Físicas**:
    *   `--shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.5)`
    *   `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.5)`
    *   `--shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.7)` (utilizado nos painéis flutuantes).
*   **Glow Neon Ativo (`--shadow-glow`)**:
    *   `box-shadow: 0 0 15px rgba(175, 6, 8, 0.35);`
    *   Aplicado a botões de confirmação principais e seletores ativos para guiar o foco visual do usuário.

---

## 5. Estrutura Espacial (Layout e Responsividade)

A SPA organiza a tela de forma a otimizar a velocidade de inserção e fechamento de pedidos pelo vendedor:

```text
+-----------------------------------------------------------------+
|                         Fase Esporte HEADBAR                      |
+------------------------------------+----------------------------+
|  COL. ESQUERDA (60%)               | COL. DIREITA (40%)         |
|  [Tabs de Categorias de Produtos]  | [Dados do Cliente]         |
|                                    |                            |
|  [Configurador de Detalhes]        | [Carrinho de Compras]      |
|  - Radios (Golas/Tecidos)          | - Lista de Itens           |
|  - Checkboxes (Extras)             | - Botão de Excluir         |
|  - Quantidade Selector (+/-)       |                            |
|                                    | [Condições Comerciais]     |
|  [Simulador de Item Fixo]          |                            |
|  - R$ Unitário / Descrição Técnica | [Totais Financeiros]       |
|  - Botão "Adicionar ao Orçamento"  | [Botão "Gerar PDF / A4"]   |
+------------------------------------+----------------------------+
```

### Grids e Spacers
*   `gap` padrão para seções: `24px` (fornece respiro visual adequado).
*   `padding` interno de painéis: `20px` a `24px`.
*   **Breakpoint Responsivo (`1024px`)**:
    *   Acima de `1024px`: Grid de duas colunas lateral a lateral.
    *   Abaixo de `1024px` (Tablets/Smartphones): O layout dobra em uma única coluna vertical (Configurador no topo, Carrinho e Totais na base).

---

## 6. Especificações de Componentes Visuais (UI)

### 6.1. Abas e Menu Lateral (Tabs Selector)
*   Botões horizontais/verticais com ícones do Lucide React.
*   **Estado Inativo**: Sem borda, cor de texto `--text-secondary`, fundo transparente.
*   **Estado Hover**: Fundo cinza sutil (`rgba(255,255,255,0.04)`).
*   **Estado Ativo**: Cor de texto `--text-primary`, borda esquerda ou inferior vermelha (`--Fase-red`), fundo `--bg-card`.

### 6.2. Botões Seletores de Opção (`.btn-option`)
Para escolhas de Gola, Tecido e Extras:
*   Fundo cinza translúcido escuro, cantos arredondados (`8px`), transições de 150ms.
*   **Estado Ativo (`.selected`)**:
    *   `border-color: var(--Fase-red);`
    *   `background: rgba(175, 6, 8, 0.12);`
    *   `color: #ffffff;`
    *   `box-shadow: 0 0 10px rgba(175, 6, 8, 0.15);`

### 6.3. Seletor Numérico de Quantidade (`.quantity-selector`)
*   Design unificado com botões de incremento/decremento integrados (`-` / `+`).
*   Botões com largura fixa (`45px`), hover brilhante e clique físico reativo (`transform: scale(0.95)`).
*   Se a quantidade for menor que 10: exibe um aviso luminoso semântico (Cor `--color-warning`) indicando que o pedido está abaixo da quantidade mínima recomendada.

### 6.4. Simulador do Item (Rodapé do Configurador)
*   Barra horizontal fixa ou flutuante no final do configurador de cor `--bg-sidebar` com borda superior vermelha fina.
*   Exibe de forma destacada em tempo real o preço estimado unitário acumulado e a descrição gerada dinamicamente por algoritmos para validação visual rápida antes de adicionar.

---

## 7. Diretrizes de Impressão Formal A4 (`@media print`)

Quando o vendedor dispara o comando de impressão (PDF), toda a interface interativa escura da aplicação é omitida para exibir o **PrintLayout** com as seguintes especificações estritas de design system econômico:

1.  **Monocromia e Contraste**:
    *   Fundo totalmente branco (`#ffffff`), texto totalmente preto (`#000000`).
    *   Substituição das logos coloridas/brancas por `logo-preto.svg` de altíssimo contraste.
2.  **Tabelas de Itens**:
    *   Grade de estilo clássico com bordas finas em cinza (`#d1d5db`).
    *   Linhas alternadas com fundo cinza ultra-claro (`#f9fafb`) para facilitar leitura.
    *   Alinhamento numérico impecável à direita para valores de R$ unitários e totais.
3.  **Tamanho de Página**:
    *   Forçado para **A4 Retrato** com margens de `1.5cm` nas bordas.
    *   Omissão automática de cabeçalhos/rodapés gerados pelo navegador (oculta URLs, data automática e números de página do browser para parecer um documento comercial formal).
4.  **Estrutura de Fechamento**:
    *   Layout formal com espaço designado para assinatura do vendedor e do cliente, além de observação visível de regra de parceria (exibição obrigatória do aviso de logo da Fase em destaque caso tenha recebido o desconto).

## 8. Diretrizes de Animação e Micro-interações (Framer Motion Pro)

Para elevar a interface da **Fase Esporte** a um nível de excelência visual verdadeiramente "Pro Max", utilizaremos a biblioteca **Framer Motion** para gerenciar todas as animações e transições de estado. As animações devem parecer orgânicas, responsivas (foco no feedback físico) e nunca devem atrasar a usabilidade do vendedor.

### 8.1. Princípios de Movimento
*   **Velocidade (Duration)**: Todas as transições devem durar entre `150ms` e `300ms`. Animações mais lentas cansam o usuário; animações mais rápidas passam despercebidas.
*   **Curva de Aceleração (Easing)**: Evitar curvas lineares. Utilizar a física de molas (`spring`) para botões e seletores interativos, e curvas de desaceleração suave (`cubic-bezier(0.16, 1, 0.3, 1)`) para transições de conteúdo.
*   **Acessibilidade**: Respeitar a diretiva do sistema operacional para redução de movimento (`prefers-reduced-motion`). Se ativo, desativar transições de deslocamento e usar apenas fade-in/fade-out ultra-rápidos.

### 8.2. Especificação das Micro-interações

#### A. Transição entre Abas (Tabs Transition)
Ao alternar entre as 8 categorias de produtos:
*   **Deslocamento de Destaque (Shared Layout)**: O indicador vermelho de "Aba Ativa" deve deslizar fluidamente da aba anterior para a nova usando o `layoutId` do Framer Motion. Isso gera um efeito líquido de fusão visual altamente premium.
*   **Entrada de Conteúdo (Tab Panel)**: O configurador correspondente à nova aba deve surgir com um leve fade-in e um deslocamento vertical sutil de baixo para cima:
    *   `initial={{ opacity: 0, y: 15 }}`
    *   `animate={{ opacity: 1, y: 0 }}`
    *   `transition={{ type: "spring", stiffness: 300, damping: 30 }}`

#### B. Seleção de Opções (Radio & Checkbox Buttons)
*   **Efeito Háptico Virtual (Tap Feedback)**: Ao clicar em qualquer opção de gola, tecido ou opcionais, o botão deve encolher ligeiramente e expandir de volta, imitando um clique físico:
    *   `whileTap={{ scale: 0.95 }}`
    *   `whileHover={{ scale: 1.02 }}`
*   **Efeito Glow Pulsante**: Quando uma opção é selecionada, a borda vermelha (`--border-color-active`) se acende, acompanhada por um leve brilho neon (`box-shadow`) que surge via transição suave de cor de borda.

#### C. Adição ao Orçamento (Cart Transition)
*   **Item no Carrinho (`AnimatePresence`)**: Ao clicar em "Adicionar ao Orçamento", o item deve entrar na lista do carrinho com um efeito de expansão e deslizamento lateral (da esquerda para a direita):
    *   `initial={{ opacity: 0, x: -30, height: 0 }}`
    *   `animate={{ opacity: 1, x: 0, height: "auto" }}`
    *   `exit={{ opacity: 0, x: 50, height: 0 }}`
*   **Reorganização Dinâmica (Layout Animations)**: Quando um item é excluído, os demais itens da lista devem deslizar suavemente para suas novas posições verticais (usando a propriedade `layout` do Framer Motion), evitando saltos bruscos na tela.

#### D. Atualização de Valores Financeiros (Counting & Fade Effects)
*   Quando o Subtotal ou Total Líquido é alterado (seja mudando a quantidade ou aplicando descontos), os valores numéricos devem passar por um efeito de transição visual suave, onde o número antigo faz um fade-out rápido e o novo surge com fade-in, ou um efeito de contador dinâmico veloz.
*   Avisos de desconto ou notas de parceria obrigatórias (ex: `*INCLUSA LOGO DA FASE...`) devem surgir na base da tela usando uma animação de "alerta deslizante" (slide-in) em tom verde esmeralda.

---

## 9. Princípios de Experiência do Usuário (UI/UX Pro Max)

A interface do **Gerador de Orçamentos Fase Esporte** não é apenas uma ferramenta de cálculo, mas um canal de conversão e produtividade. Por isso, as decisões de design seguem as diretrizes mais rigorosas de UX moderno:

### 9.1. Redução de Carga Cognitiva
*   **Foco Progressivo**: O vendedor não deve ser bombardeado com dezenas de campos de digitação. Todo o fluxo ocorre por cliques em botões visuais claros com termos técnicos de fácil identificação.
*   **Valores Estáticos vs Dinâmicos**: O preço unitário do item em configuração é exibido em tamanho gigante na parte inferior esquerda (Simulador de Item) antes de ser lançado ao carrinho. Isso dá segurança ao vendedor sobre o valor que está sendo cobrado.

### 9.2. Estados de Validação Reativos
*   **Alerta de Quantidade Mínima**: Se a quantidade inserida for inferior a 10 (mínimo para produção de uniformes personalizados), o container do input de quantidade assume uma borda e glow âmbar (`--color-warning`), exibindo um texto de aviso: `"Abaixo da quantidade mínima sugerida para este produto."`
*   **Regra de Parceria Exclusiva**: Ao selecionar a parceria "Academias" (que dá 30% de revenda e 50% em Kits), o sistema exibe visualmente etiquetas verdes indicando os descontos aplicados individualmente em cada item da lista do carrinho.
*   **Isenção de Abadá Visual**: Se houver um abadá no carrinho e uma parceria for ativada, o abadá exibe uma etiqueta cinza indicando: `"Isento de desconto (Regra de Evento)"`, garantindo clareza imediata e evitando que o vendedor tente calcular o desconto manualmente.

### 9.3. Responsividade Total (Mobile-First de Elite)
*   **Visual Adaptável**: Em telas desktop, a divisão 60% / 40% permite fluxo contínuo olho-a-olho.
*   **Fluxo de Rolagem em Mobile**: Em dispositivos móveis (smartphones dos vendedores externos), a área de configuração ocupa a tela inteira com navegação deslizante por abas no topo, e o botão "Carrinho" flutua no canto inferior direito com um badge dinâmico animado (indicando o número de itens ativos). Ao clicar no badge, o carrinho se expande em uma gaveta lateral (*drawer*) animada de baixo para cima.

### 9.4. Modo Impressão Inteligente (Zero Waste)
*   O tema escuro premium é totalmente desativado durante a impressão.
*   Elementos interativos como seletores, botões, inputs vazios e lixeiras são omitidos (`display: none`).
*   O documento final se auto-ajusta ao grid A4 retrato com margens simétricas de 1.5cm, gerando um PDF limpo, corporativo e com legibilidade ideal para o cliente final.

---

Este Design System é o pilar visual da aplicação **Fase Esporte Budget Generator**, garantindo que o código se mantenha limpo, modular e 100% fiel à identidade premium da marca.

