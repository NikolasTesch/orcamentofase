# Arquitetura de Diretórios e Arquivos: Fase Esporte Budget Generator

Este documento descreve detalhadamente a arquitetura de pastas, a finalidade de cada diretório e arquivo, as divisões de responsabilidades e as diretrizes de organização para o desenvolvimento do **Gerador de Orçamentos da Fase Esporte**.

---

## 1. Visão Geral de Design Arquitetural

A arquitetura do projeto segue os princípios de uma **Static Single Page Application (SPA)** moderna desenvolvida em React. Visando velocidade de renderização, acoplamento fraco e facilidade de manutenção, a estrutura divide-se em três pilares fundamentais:

1. **Dados Estáticos Separados (`src/data/`)**: A tabela de preços e os coeficientes de descontos são separados da lógica de visualização. Qualquer reajuste futuro na tabela do Excel pode ser importado substituindo apenas este arquivo, sem alterar a lógica comercial ou o visual.
2. **Gerenciador Comercial Unificado (`src/context/`)**: Toda a matemática financeira, seleção de brackets de volume, validações de regras e descontos de parcerias residem em um provedor de estado central. Componentes visuais puros apenas lêem ou despacham eventos para este provedor.
3. **Componentização Modular Reutilizável (`src/components/`)**: Os seletores de botões interativos são isolados por categoria, impedindo vazamento de lógica de estado entre abas.

---

## 2. Árvore Geral do Workspace

```text
orcamentofase/
├── public/                         # Arquivos públicos estáticos servidos diretamente
│   └── favicon.ico                 # Ícone da aplicação para a aba do navegador
├── src/                            # Diretório principal de código fonte
│   ├── assets/                     # Recursos visuais (imagens, vetores, logos)
│   │   ├── logo-branco.svg         # Logo da Fase Esporte em vetor para telas escurecidas
│   │   └── logo-preto.svg          # Logo oficial para telas claras e folha de impressão
│   ├── components/                 # Componentes de interface de usuário (UI)
│   │   ├── ProductSelectors/       # Configuradores específicos de cada aba de produto
│   │   │   ├── KitEsportivoSelector.jsx
│   │   │   ├── CamisaMalhaSelector.jsx
│   │   │   ├── EstampaTotalSelector.jsx
│   │   │   ├── CamisaPPSelector.jsx
│   │   │   ├── SocialSelector.jsx
│   │   │   ├── TactelHelancaSelector.jsx
│   │   │   ├── BandeiraSelector.jsx
│   │   │   └── AbadaSelector.jsx
│   │   ├── BudgetCart.jsx          # Tabela de itens ativos inseridos no orçamento
│   │   ├── ClientForm.jsx          # Formulário de cliente, parcerias e prazos
│   │   └── PrintLayout.jsx         # Componente invisível estilizado para impressão A4
│   ├── context/                    # Gerenciamento de Estado Global Comercial
│   │   └── BudgetContext.jsx       # Contexto React com a matemática e regras comerciais
│   ├── data/                       # Armazenamento de Dados de preços
│   │   └── prices.js               # Banco de dados de preços convertidos do Excel
│   ├── App.jsx                     # Componente raiz estrutural (Grid principal)
│   ├── index.css                   # Design System global, variáveis e CSS de impressão
│   └── main.jsx                    # Ponto de inicialização do React no HTML
├── TABELA DE PREÇOS 2024.xlsx       # Arquivo de origem oficial para referências
├── ORÇAMENTO.xltx                  # Modelo de orçamento de origem para referências
├── package.json                    # Definição de dependências e scripts npm
├── SPEC.md                         # Especificações técnicas detalhadas
├── PRD.md                          # Documento de Requisitos de Produto
└── ARCHITECTURE.md                 # Este documento de arquitetura
```

---

## 3. Detalhamento de Pastas e Componentes

### 3.1. Diretório `/public`
Contém ativos estáticos que não passam pelo processo de build do Vite. Arquivos aqui são servidos diretamente a partir do caminho raiz (`/`).
- **`favicon.ico`**: Ícone visual que identifica a aplicação na aba de navegação.

### 3.2. Diretório `src/assets`
Armazena imagens vetoriais (SVG) e arquivos multimídia que serão otimizados no build.
- **`logo-branco.svg`**: Logo oficial da Fase Esporte em formato vetorial com caminhos de cor definidos para branco (`fill: white`) e o emblema em vermelho escuro (`#AF0608`). Otimizado para contraste premium em painéis de fundo cinza escuro.
- **`logo-preto.svg`**: Logo oficial em vetor configurada com cor de texto preto (`fill: black`) e o emblema vermelho escuro. Otimizada para impressão A4 econômica, garantindo altíssimo contraste de impressão no PDF final.

### 3.3. Diretório `src/data`
Este diretório funciona como a "camada de dados estáticos" do projeto.
- **`prices.js`**: Exporta o objeto de dados nativo do JavaScript `pricesData`. Ele contém o mapeamento de matrizes completas que descrevem os valores por tecido, faixas de quantidades regressivas, extras, parcerias e impressão de silk-screen.
  - *Vantagem técnica*: Ao separar os dados de precificação dos componentes, qualquer vendedor ou desenvolvedor futuro pode atualizar os preços simplesmente editando este arquivo estruturado, sem tocar em uma única linha de lógica React.

### 3.4. Diretório `src/context`
Contém a infraestrutura do gerenciador comercial global da aplicação.
- **`BudgetContext.jsx`**: Implementa o Provedor do React Context API. Ele é responsável por:
  - Manter o array do carrinho (`cart`) contendo os itens cadastrados.
  - Manter o formulário do cliente (`clientData`) e prazos (`conditions`).
  - Executar as equações financeiras em tempo real (totais, descontos de parcerias por item, descontos adicionais em R$ ou %, entrada sugerida de 50%).
  - Expor funções utilitárias como `addItemToBudget()`, `removeItemFromBudget()`, `updateItemQuantity()` e `clearBudget()`.
  - Exportar o hook personalizado `useBudget()`, que simplifica o consumo do estado comercial pelos componentes.

### 3.5. Diretório `src/components`
Esta pasta centraliza os blocos modulares que formam a interface do usuário. A modularização é dividida por domínios:

#### A. Subpasta `ProductSelectors/`
Centraliza a lógica de botões seletores interativos divididos por tipo de produto:
- **`KitEsportivoSelector.jsx`**: Exibe o configurador para kits prontos (Prata, Ouro, etc.). Controla as regras de desconto em 25% para kits fechados de escolinhas registradas.
- **`CamisaMalhaSelector.jsx`**: Controla seletores de golas e tecidos em malhas básicas com cálculo automático de bracket regressivo de volume (10 a 501+).
- **`EstampaTotalSelector.jsx`**: Gerencia seletores para camisetas 100% sublimadas de estampa total, calculando o valor provisório baseado nas áreas (Frente, Frente/Costas, Frente/Costas/Manga).
- **`CamisaPPSelector.jsx`**: Seletor para camisas promocionais prontas com opção extra de aplicação de fotos (+40 / +45).
- **`SocialSelector.jsx`**: Seletor para linhas de brim industrial ou calças/blazers Two Way nobres, permitindo escolher entre tecidos de grife (Unioffice vs Ibiza).
- **`TactelHelancaSelector.jsx`**: Configurador focado em calças, agasalhos e shorts escolares/esportivos. Controla brackets diferenciados de preços de jaquetas infantis e adultas.
- **`BandeiraSelector.jsx`**: Permite definir as metragens quadradas (M²) de bandeiras simples ou dupla face e opcionais de instalação (haste, base).
- **`AbadaSelector.jsx`**: Focado no lançamento de abadás de carnaval e micaretas em Cacharel ou Dry Fit, com opcional de bandana.

#### B. Componentes do Orçamento e Fechamento
- **`BudgetCart.jsx`**: Renderiza a tabela do carrinho de itens, exibindo a descrição detalhada, quantidades, valor unitário e total. Fornece atalhos de incremento rápido e remoção.
- **`ClientForm.jsx`**: Fornece campos para o nome e telefone do cliente, dropdown para as 6 categorias de parcerias oficiais e inputs de condições comerciais (pagamento, entrega, validade).
- **`PrintLayout.jsx`**: Renderiza uma folha formal A4 limpa e profissional contendo cabeçalho formal, dados de Teixeira de Freitas - BA, assinatura, tabela de itens e condições.
  - *Comportamento*: Totalmente ocultado na interface web interativa do vendedor, sendo exibido em tela cheia de forma automática apenas ao acionar o atalho de impressão (`window.print()`).

---

## 4. Estrutura de Comunicação e Fluxo de Dados

A arquitetura do projeto utiliza um fluxo de dados unidirecional baseado nas diretrizes recomendadas de desenvolvimento React:

```text
                     [ useBudget() Context hook ]
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
    [ ProductSelectors ]                          [ BudgetCart ]
  - Lê estado de preços                        - Lê array de itens
  - Calcula visualmente preço unitário         - Exibe linhas de valores
  - Dispara addItemToBudget()                  - Dispara removeItem()
            |                                           |
            +---------------------+---------------------+
                                  |
                                  v
                           [ ClientForm ]
                     - Atualiza clientData
                     - Seleciona Parceria (Dispara recálculo automático)
                                  |
                                  v
                           [ PrintLayout ]
                     - Monta visual econômico A4
                     - Lê todos os estados consolidados
```

---

## 5. Diretrizes de Codificação e Estilo CSS (Design System)

Toda a estilização premium da aplicação reside no arquivo central **`index.css`**, organizado da seguinte forma:

1. **Tokens de Design (CSS Custom Properties)**: Definição do tema Fase Esporte com variáveis HSL para facilitar inversões de tema e manutenção cromática:
   - `--color-Fase-red`: Vermelho característico (`#AF0608` / HSL).
   - `--color-Fase-dark`: Grafite escuro para superfícies de fundo (`#1a1a1a`).
   - `--color-Fase-card`: Cinza superfície (`#262626`).
2. **Glassmorphism**: Efeitos de translucidez com desfoque de fundo (`backdrop-filter: blur(10px)`) para criar interfaces premium que dão sensação de modernidade e profundidade.
3. **Estados Ativos**: Classes específicas para botões selecionados, marcando bordas iluminadas em vermelho e sombras dinâmicas.
4. **Layout Responsivo**: Uso extensivo de CSS Grid Layout para flexibilidade em telas menores (mudando de grid de duas colunas em desktop para uma coluna única em smartphones).
5. **Estilo Print Media**: Regras `@media print` para otimização em A4 sem poluição visual, com remoção completa das camadas de animação ativa.
6. **Integração de Camada de Animação (Framer Motion)**: Utilização da biblioteca para fornecer transições e micro-interações nativas em React, aproveitando `AnimatePresence` para remoções de elementos e `layoutId` para transições de estado compartilhado (como abas de produtos).

---

Este documento serve como a documentação definitiva da estrutura de pastas. Qualquer alteração estrutural futura deve ser registrada e alinhada com as diretrizes aqui expostas.

