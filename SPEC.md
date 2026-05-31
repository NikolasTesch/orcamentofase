# EspecificaÃ§Ã£o TÃ©cnica Completa (SPEC): Sistema de OrÃ§amentos Fase Esporte

Este documento descreve a especificaÃ§Ã£o tÃ©cnica detalhada, as regras de negÃ³cios, os algoritmos de cÃ¡lculo de preÃ§os, as estruturas de estados e as especificaÃ§Ãµes de interface para o **Gerador de OrÃ§amentos da Fase Esporte**. 

Este documento servirÃ¡ como a **Ãºnica fonte da verdade** para a implementaÃ§Ã£o da aplicaÃ§Ã£o Next.js com TypeScript e o seu alinhamento com o Design System.

---

## 1. VisÃ£o Geral do Escopo

A **Fase Esporte** (Teixeira de Freitas - BA) necessita de uma aplicaÃ§Ã£o web responsiva e interativa que simplifique a elaboraÃ§Ã£o de orÃ§amentos formais por parte dos vendedores. 

Atualmente, o processo Ã© manual e suscetÃ­vel a erros de digitaÃ§Ã£o e cÃ¡lculo ao consultar tabelas Excel complexas. O novo sistema automatizarÃ¡ o cÃ¡lculo de preÃ§os unitÃ¡rios e totais e a geraÃ§Ã£o da descriÃ§Ã£o tÃ©cnica da peÃ§a, oferecendo um layout profissional otimizado para impressÃ£o em A4 (salvar em PDF e enviar no WhatsApp).

---

## 2. Tecnologias Utilizadas e Arquitetura de Estruturas

O sistema Ã© projetado para operar com o mÃ¡ximo de eficiÃªncia, velocidade e robustez, utilizando uma stack estÃ¡tica moderna que elimina a necessidade de bancos de dados remotos ou conexÃµes com servidores adicionais.

### 2.1. Stack de Tecnologias

1. **Next.js 16+ & React 19 (App Router)**: Framework para produÃ§Ã£o com renderizaÃ§Ã£o reativa e roteamento nativo sob `/src/app`.
2. **TypeScript 5+**: Tipagem estÃ¡tica estrita para assegurar a consistÃªncia dos dados de preÃ§os e regras comerciais.
3. **Vanilla CSS (Moderno)**: Uso de folhas de estilo customizadas com variÃ¡veis nativas CSS para os tokens de design, flexbox, grid layouts, glassmorphism e animaÃ§Ãµes fluidas. A escolha do Vanilla CSS garante controle absoluto sobre a estilizaÃ§Ã£o e impede incompatibilidades.
4. **React Context API**: Gerenciamento de estado global da aplicaÃ§Ã£o para unificar o carrinho, informaÃ§Ãµes de clientes e a lÃ³gica financeira sem a necessidade de bibliotecas externas complexas.
5. **Lucide React & Custom Icons**: Biblioteca de Ã­cones vetoriais modernos, limpos e responsivos.
6. **HTML5 Canvas / CSS Print**: Estrutura de visualizaÃ§Ã£o econÃ´mica A4 baseada em CSS Print Media para renderizaÃ§Ã£o nativa de PDF de altÃ­ssima fidelidade.

---

### 2.2. Estrutura do DiretÃ³rio do Projeto

A organizaÃ§Ã£o das pastas separa as responsabilidades entre dados estruturados, componentes visuais puros e o gerenciamento de estado global comercial:

```text
orcamentofase/
â”œâ”€â”€ public/                     # Arquivos pÃºblicos estÃ¡ticos
â”‚   â””â”€â”€ favicon.ico             # Favicon do app
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                    # Rotas e layouts do Next.js (App Router)
â”‚   â”‚   â”œâ”€â”€ layout.tsx          # Layout raiz (Fontes, CSS globais e Providers)
â”‚   â”‚   â”œâ”€â”€ page.tsx            # Gerador de OrÃ§amentos (Homepage)
â”‚   â”‚   â”œâ”€â”€ metricas/           # PÃ¡gina de anÃ¡lise comercial e mÃ©tricas
â”‚   â”‚   â”œâ”€â”€ tabela/             # PÃ¡gina de administraÃ§Ã£o da tabela de preÃ§os
â”‚   â”‚   â””â”€â”€ design-system/      # ApresentaÃ§Ã£o interativa do Design System
â”‚   â”œâ”€â”€ assets/                 # Ativos visuais do projeto (vetores SVG)
â”‚   â”œâ”€â”€ components/             # Componentes modulares reutilizÃ¡veis (.tsx)
â”‚   â”‚   â”œâ”€â”€ app/                # Componentes estruturais globais (AppHeader.tsx)
â”‚   â”‚   â”œâ”€â”€ ds/                 # Componentes do Design System (Nav.tsx)
â”‚   â”‚   â””â”€â”€ gerador/            # Configuradores especÃ­ficos do gerador de orÃ§amento
â”‚   â”‚       â”œâ”€â”€ BudgetCart.tsx
â”‚   â”‚       â”œâ”€â”€ ClientForm.tsx
â”‚   â”‚       â”œâ”€â”€ Conditions.tsx
â”‚   â”‚       â”œâ”€â”€ Configurator.tsx
â”‚   â”‚       â”œâ”€â”€ PreviewModal.tsx
â”‚   â”‚       â”œâ”€â”€ PrintSheet.tsx
â”‚   â”‚       â”œâ”€â”€ Simulator.tsx
â”‚   â”‚       â””â”€â”€ Totals.tsx
â”‚   â”œâ”€â”€ context/                # Gerenciador comercial (LÃ³gica e Estado)
â”‚   â”‚   â”œâ”€â”€ budget-context.ts
â”‚   â”‚   â””â”€â”€ BudgetContext.tsx
â”‚   â”œâ”€â”€ data/                   # Banco de dados e lÃ³gica de preÃ§os
â”‚   â”‚   â”œâ”€â”€ prices.ts
â”‚   â”‚   â””â”€â”€ pricebook.ts
â”‚   â”œâ”€â”€ lib/                    # Custom Elements
â”‚   â”‚   â””â”€â”€ image-slot.js
â”‚   â””â”€â”€ styles/                 # Estilos do Design System (.css)
â”œâ”€â”€ next.config.ts              # ConfiguraÃ§Ã£o do Next.js
â”œâ”€â”€ tsconfig.json               # ConfiguraÃ§Ã£o do TypeScript e Path Alias (@/*)
â”œâ”€â”€ package.json                # DependÃªncias e scripts do projeto
â”œâ”€â”€ README.md                   # Manual de desenvolvimento e execuÃ§Ã£o
â””â”€â”€ SPEC.md                     # Esta especificaÃ§Ã£o tÃ©cnica
```”‚   â”œâ”€â”€ index.css             # Tokens do Design System & Estilos globais
â”‚   â””â”€â”€ main.jsx              # InicializaÃ§Ã£o do React
â”œâ”€â”€ package.json              # DependÃªncias e scripts do projeto
â”œâ”€â”€ README.md                 # Manual de desenvolvimento e execuÃ§Ã£o
â””â”€â”€ SPEC.md                   # Esta especificaÃ§Ã£o tÃ©cnica
```

---

### 2.3. Diagrama do Fluxo de Estado Comercial

```mermaid
graph TD
    subgraph Configurador
        A[User seleciona botÃµes] --> B[Estado local do configurador]
        B --> C[GeraÃ§Ã£o de DescriÃ§Ã£o & PreÃ§o ProvisÃ³rios]
    end
    subgraph Contexto Global
        C -->|Clique em Adicionar| D[Adicionar item ao Carrinho]
        E[Seletor de Parceria] -->|Desconto %| F[CÃ¡lculo de Desconto AutomÃ¡tico por Item]
        G[Desconto Adicional R$ ou %] --> H[Algoritmo Financeiro Geral]
        D --> F
        F --> H
    end
    subgraph SaÃ­da
        H --> I[ExibiÃ§Ã£o de Totais na Tela]
        H -->|window.print| J[RenderizaÃ§Ã£o do PrintLayout em PDF A4]
    end
```

---

### 2.4. Estrutura de Componentes, Props e Estados locais

Para garantir uma implementaÃ§Ã£o limpa e sustentÃ¡vel, definimos os papÃ©is de cada componente, suas propriedades de entrada (Props) e as estruturas de estado local (State) que eles mantÃªm:

| Componente | Papel Principal | Props Recebidas | Estados Locais (useState) |
| :--- | :--- | :--- | :--- |
| **App** | Inicializar layout global de 2 colunas e alternar as abas (tabs) da esquerda. | Nenhuma | `activeTab` (string indicando a aba selecionada). |
| **KitEsportivoSelector** | ConfiguraÃ§Ã£o de uniformes e peÃ§as da linha de treino de futebol. | Nenhuma | - `selectedKit` (string)<br>- `extras` (array de strings)<br>- `quantity` (number)<br>- `addedMaterials` (array). |
| **CamisaMalhaSelector** | ConfiguraÃ§Ã£o de camisas de malha com brackets regressivos. | Nenhuma | - `golaType` (string)<br>- `fabric` (string)<br>- `quantity` (number)<br>- `selectedExtras` (array de strings). |
| **EstampaTotalSelector**| ConfiguraÃ§Ã£o de camisas de estampa por sublimaÃ§Ã£o 100% total. | Nenhuma | - `golaType` (string)<br>- `fabric` (string)<br>- `area` (string)<br>- `quantity` (number)<br>- `selectedExtras` (array). |
| **CamisaPPSelector** | ConfiguraÃ§Ã£o de camisas promocionais prontas (PP branca/cores). | Nenhuma | - `color` (string)<br>- `config` (string)<br>- `area` (string)<br>- `quantity` (number)<br>- `usePhoto` (string). |
| **SocialSelector** | Escolha de uniformes sociais e industriais em Brim ou tecidos nobres. | Nenhuma | - `activeCategory` (string)<br>- `selectedItem` (object)<br>- `fabricSocial` (string/Ibiza ou Unioffice)<br>- `quantity` (number). |
| **TactelHelancaSelector**| SeleÃ§Ã£o de calÃ§as, jaquetas e shorts de tactel e helanca infantil/adulto. | Nenhuma | - `fabric` (tactel/helanca)<br>- `selectedItem` (object)<br>- `ageGroup` (adulto/infantil)<br>- `isStamped` (boolean)<br>- `quantity` (number). |
| **BandeiraSelector** | ConfiguraÃ§Ã£o de metragens e acessÃ³rios de bandeiras sublimadas. | Nenhuma | - `type` (simples/dupla face)<br>- `sizeDesc` (string)<br>- `extras` (array de strings)<br>- `quantity` (number). |
| **AbadaSelector** | ConfiguraÃ§Ã£o de abadÃ¡s promocionais de carnaval e micaretas. | Nenhuma | - `fabric` (string)<br>- `quantity` (number)<br>- `withBandana` (boolean). |
| **BudgetCart** | Listar os itens inseridos, permitindo excluir ou alterar volumes rapidamente. | Nenhuma | Nenhum (LÃª e edita dados via `BudgetContext`). |
| **ClientForm** | Coleta de dados cadastrais, descontos manuais, prazos e parcerias da Fase Esporte. | Nenhuma | Nenhum (Gerenciado globalmente via `BudgetContext`). |
| **PrintLayout** | OtimizaÃ§Ã£o do layout A4 formal, carregando a logo preta e condiÃ§Ãµes para impressÃ£o. | Nenhuma | Nenhum (Puxa totais e itens do Contexto global). |

---

### 2.5. Estrutura do Estado Global (BudgetContext)

O `BudgetContext` funciona como o cÃ©rebro comercial da aplicaÃ§Ã£o, expondo propriedades e mÃ©todos acessÃ­veis por todos os componentes por meio do hook personalizado `useBudget()`.

```javascript
// Exemplo da estrutura de estado compartilhada pelo Context
{
  cart: [
    {
      id: "timestamp-hash",
      category: "camisa_malha",
      description: "CAMISA MALHA - Gola Polo Simples - Tecido PV - Manga Longa",
      quantity: 120,
      unitPrice: 50.45,
      totalPrice: 6054.00,
      originalUnitPrice: 50.45, // Sem desconto de parceria
      partnerDiscountPercent: 15, // Desconto aplicado a este item
      finalUnitPrice: 42.88      // PreÃ§o com desconto de parceria aplicado
    }
  ],
  clientData: {
    name: "",
    phone: "",
    partnership: "Nenhuma" // SeleÃ§Ã£o de escolinha, academia, etc.
  },
  conditions: {
    paymentTerms: "entrada de 50% no ato do pedido e o restante na entrega do mesmo...",
    deliveryDays: 30,
    validityDays: 7
  },
  additionalDiscount: {
    type: "percentage", // "percentage" | "fixed"
    value: 0
  },
  
  // MÃ©todos expostos para manipulaÃ§Ã£o de aÃ§Ãµes
  addItemToBudget: (item) => void,
  removeItemFromBudget: (id) => void,
  updateItemQuantity: (id, qty) => void,
  updateClientData: (field, val) => void,
  updateConditions: (field, val) => void,
  updateAdditionalDiscount: (type, val) => void,
  clearBudget: () => void,
  
  // Totais calculados em tempo real
  subtotalBruto: 0,
  totalParceriaDesconto: 0,
  totalLÃ­quido: 0,
  totalLíquido: 0,
  entradaSugerida: 0
}
```

---

## 3. Estrutura da Interface do Usuário (UI)

A tela principal possui uma **Barra de Navegação Superior Persistente** e o conteúdo principal é dividido em um **layout responsivo de duas colunas (Desktop)**:

### 3.0. Barra de Navegação Superior Persistente (`AppHeader.tsx`)
Renderizada no topo de todas as páginas da SPA (fora do escopo de impressão via classe `.no-print`), ela unifica a identidade visual da marca e fornece trânsito instantâneo pelos módulos do ecossistema.
*   **Identidade Visual (Branding)**: Logo oficial da Fase Esporte no canto esquerdo, com alternância automática entre as versões clara (`logo-preto.svg`) e escura (`logo-branco.svg`) com base no tema ativo, acompanhado do título e subtítulo dinâmicos da página corrente.
*   **Menu de Navegação (`app-nav`)**: Elemento flexível central que renderiza os links para as 5 páginas ativas da plataforma. Cada item possui um ícone SVG semântico e estado ativo baseado no roteamento dinâmico do Next.js via hook `usePathname()`:
    1.  **Gerador** (`/`): Configurador interativo, simulador financeiro e carrinho de itens.
    2.  **Métricas** (`/metricas`): Visualização do faturamento, ticket médio e taxa de conversão em gráficos e KPIs reativos.
    3.  **Tabela de Preços** (`/tabela`): Área administrativa para edição direta de preços das categorias.
    4.  **Grade de Tamanhos** (`/tamanhos`): Área administrativa para customização de tabelas de medidas físicas e observações técnicas oficiais.
    5.  **Design System** (`/design-system`): Catálogo interativo contendo os tokens, estilos de botões, paleta de cores e tipografia.
*   **Ações e Utilitários**: Área direita que carrega botões de ações específicas da página ativa (ex: Botão "Limpar" no Gerador, dropdown de período nas Métricas) e o botão alternador de tema (`ThemeToggle`).

### 3.1. Coluna Esquerda: Configurador de Produtos (60% da largura)
- **Painel Superior de Abas (Tabs)**: Botões horizontais ou menu lateral com ícones para alternar entre as 8 categorias de produtos:
  - ⚽ *Kit Esportivo*
  - 👕 *Camisa de Malha*
  - 🎨 *Estampa Total*
  - 📢 *Camisa PP Promocional*
  - 👔 *Linha Social*
  - 🏃 *Tactel & Helanca*
  - 🚩 *Bandeiras*
  - 🎭 *Abadás*
- **Painel do Configurador**: Exibe os botões seletores da categoria ativa.
  - Os botões de opções (ex: tecidos, golas, mangas) devem se comportar como *Radio Groups* (apenas um ativo) ou *Checkboxes* (múltiplas seleções ativas no caso dos extras).
  - Um campo numérico destacado de **Quantidade** (Input numérico com incremento manual de +-10).
- **Simulador do Item**: Um rodapé fixo dentro do configurador que exibe dinamicamente:
  - *Preço Unitário Calculado*
  - *Descrição Técnica Gerada*
  - Botão principal **"Adicionar ao Orçamento"** com animação de ripple.

### 3.2. Coluna Direita: Carrinho e Fechamento (40% da largura)
- **Painel de Dados do Cliente**: Inputs para *Nome do Cliente*, *Telefone/WhatsApp* (com mÃ¡scara automÃ¡tica).
- **Carrinho de Compras (BudgetCart)**: Lista de itens adicionados. Cada linha mostra:
  - `Qtd` | `DescriÃ§Ã£o resumida` | `UnitÃ¡rio (R$)` | `Total (R$)`
  - BotÃ£o de exclusÃ£o rÃ¡pida (Ã�cone de lixeira com cor vermelha suave no hover).
- **Painel de CondiÃ§Ãµes Financeiras**:
  - Seletor de **Parcerias** (Dropdown com as opÃ§Ãµes da planilha de parcerias).
  - Campo de **Desconto Adicional** (Alternador entre R$ fixo ou % porcentagem).
  - Inputs para *CondiÃ§Ã£o de Pagamento*, *Prazo de Entrega* e *Validade do OrÃ§amento* (prÃ©-preenchidos com os padrÃµes da Fase Esporte).
- **Painel de Totais**:
  - `Subtotal` (Soma dos itens)
  - `Desconto de Parceria` (Calculado automaticamente por categoria)
  - `Desconto Adicional`
  - `Valor Total LÃ­quido` (Destaque visual em texto grande)
  - `Entrada sugerida de 50%` (Destaque em cor secundÃ¡ria)
- **BotÃ£o de AÃ§Ã£o Principal**: **"Gerar OrÃ§amento / Imprimir"** (Ã�cone de impressora/PDF).

---

## 4. Algoritmos de PrecificaÃ§Ã£o e LÃ³gica de NegÃ³cios

### 4.1. Algoritmo 1: SeleÃ§Ã£o de Bracket de Quantidade
Para as categorias que possuem preÃ§os regressivos com base no volume (Malha, Estampa Total, Camisa PP, AbadÃ¡s), o sistema lerÃ¡ a quantidade do item (`Q`) e determinarÃ¡ o bracket de preÃ§o utilizando a seguinte funÃ§Ã£o lÃ³gica:

$$\text{Bracket}(Q) = \begin{cases} 
\text{"10 a 50"} & \text{se } 10 \le Q \le 50 \\
\text{"51 a 100"} & \text{se } 51 \le Q \le 100 \\
\text{"101 a 300"} & \text{se } 101 \le Q \le 300 \\
\text{"300 a 500"} & \text{se } 301 \le Q \le 500 \\
\text{"501 acima"} & \text{se } Q \ge 501 \\
\text{"10 a 50"} & \text{se } Q < 10 \text{ (MÃ­nimo padrÃ£o com aviso ao vendedor)}
\end{cases}$$

---

### 4.2. Algoritmo 2: AcÃºmulo de PreÃ§o UnitÃ¡rio por Categoria

#### A. Categoria: Camisa de Malha
PreÃ§o final unitÃ¡rio ($P_u$) Ã© dado por:
$$P_u = \text{PreÃ§o Base}(\text{Categoria Gola}, \text{Tecido}, \text{Bracket}) + \sum \text{Valor Extras}$$

Onde:
- **PreÃ§o Base**: Obtido de `pricesData.camisa_malha.categories[CategoriaGola].prices[Bracket][Tecido]`.
- **Extras**: O somatÃ³rio algÃ©brico das operaÃ§Ãµes definidas no array `pricesData.camisa_malha.extras` (ex: Manga Longa $+3.00$, Sem Manga $-2.00$).

#### B. Categoria: Estampa Total (SublimaÃ§Ã£o)
O preÃ§o base depende da **Ã�rea de SublimaÃ§Ã£o**:
- `Frente/Costas/Manga`
- `Frente e Costas`
- `Frente`

$$P_u = \text{PreÃ§o Base}(\text{Ã�rea}, \text{Categoria Gola}, \text{Tecido}, \text{Bracket}) + \sum \text{Valor Extras}$$

Onde:
- **PreÃ§o Base**: `pricesData.estampa_total.blocks[Ã�rea][CategoriaGola][Bracket][Tecido]`.
- **Extras**: Nome Individual $+5.00$, Sem Manga $-2.00$, Manga Longa Lisa $+3.00$, Manga Longa Estampada $+10.00$.

#### C. Categoria: Camisa PP Promocional
O vendedor escolhe se a camisa Ã© **Branca** ou **Cores** e se a estampa Ã© **Frente/Costas** ou **Peito/Costas**.
- O preÃ§o unitÃ¡rio $P_u$ Ã© retirado diretamente de:
  - `pricesData.camisa_pp_promocional[Configuracao][Bracket][OpcaoEstampa]` (Lisa, Frente, Costas, Peito).
  - AdiÃ§Ã£o de Fotos: Foto Frente $+40.00$, Foto Frente e Costas $+45.00$.

#### D. Categoria: AbadÃ¡s
O preÃ§o base Ã© regressivo por quantidade e depende do tecido:
$$P_u = \text{PreÃ§o Base}(\text{Tecido}, \text{Bracket}) + \text{Bandana } (\text{se selecionada})$$
Onde:
- **PreÃ§o Base**: `pricesData.abada[Bracket][Tecido]` (Tecidos: `cacharel_pipoca` ou `dry_fit`).
- **Bandana**: Se marcada, soma `pricesData.abada[Bracket]["bandana"]`.

---

### 4.3. Algoritmo 3: Desconto de Parcerias e Regras EspecÃ­ficas
Ao selecionar uma **Parceria** no formulÃ¡rio do cliente, o sistema deve varrer os itens do carrinho e aplicar os descontos percentuais exatos definidos na planilha `PARCERIAS` conforme a categoria de cada item.

| Nome da Parceria | Kit Esportivo (Treino) | Outros Esportivos | Promocionais |
| :--- | :---: | :---: | :---: |
| **Escolinhas de Futebol** | 25% | 15% | 0% |
| **Academias** | 50% (Exclusivo) | 30% (Revenda) | 0% |
| **Escolas Rede Privada** | 15% (Uniforme Aluno) | 15% | 0% |
| **Revendedores MG** | 30% | 30% | 0% |
| **Revendedores BA** | 15% | 15% | 15% |
| **Bola na Rede Medeiros Neto**| 20% | 20% | 10% |

#### âš ï¸� Regras de Ouro de Parcerias (Edge Cases):
1. **Regra do AbadÃ¡**: AbadÃ¡s sÃ£o classificados como itens de eventos e carnaval. Conforme a regra de negÃ³cios expressa na planilha: **"ABADÃ�S NÃƒO ENTRAM DESCONTO DE PARCERIA"**. O desconto de parceria deles deve ser sempre $0\%$.
2. **Identidade Visual**: Caso um item receba desconto de parceria, o sistema deve adicionar automaticamente no rodapÃ© do item impresso e na sua descriÃ§Ã£o a seguinte observaÃ§Ã£o: `*INCLUSA LOGO DA FASE NA FRENTE E COSTAS EM DESTAQUE (obrigatÃ³rio para parceria, exceto formandos).*`

---

### 4.4. Algoritmo 4: Totais e Desconto Adicional
O fechamento financeiro do orÃ§amento calcula o valor final da seguinte forma:

1. **Subtotal Bruto ($S_b$)**: SumatÃ³rio de todos os itens (Quantidade $\times$ PreÃ§o UnitÃ¡rio Acumulado).
2. **Valor Desconto Parceria ($D_p$)**: SomatÃ³rio dos descontos de parceria calculados item a item.
3. **Subtotal com Parceria ($S_p$)**: $S_p = S_b - D_p$.
4. **Desconto Adicional ($D_a$)**:
   - Se em Porcentagem: $D_a = S_p \times (\text{Percentual} / 100)$.
   - Se em Valor Fixo: $D_a = \text{Valor Fixo}$.
5. **Valor Total LÃ­quido ($T_l$)**: $T_l = S_p - D_a$.
6. **Entrada sugerida (50% no ato do pedido)**: $E_{50\%} = T_l \times 0.5$.

---

## 5. Modelos de GeraÃ§Ã£o de DescriÃ§Ã£o TÃ©cnica (Texto)

Para garantir a formalizaÃ§Ã£o ideal no PDF final, a descriÃ§Ã£o tÃ©cnica de cada item inserido no orÃ§amento deve seguir um padrÃ£o textual estrito com base nas seleÃ§Ãµes de botÃµes efetuadas pelo usuÃ¡rio:

### 5.1. Kit Esportivo
- **PadrÃ£o**: `[Nome do Kit] Fase Esporte (Camisa Dry, Short [Dry/Hidro], MeiÃ£o [4/5] fios)`
  - *Exemplo*: `KIT PRATA Fase Esporte (Camisa Dry, Short Dry, MeiÃ£o 5 fios)`
- Se itens extras ou adicionais forem inseridos:
  - *Exemplo*: `BERMUDA HIDRO COM BOLSO` ou `CAMISA DE Ã�RBITRO`

### 5.2. Camisa de Malha
- **PadrÃ£o**: `CAMISA MALHA - [Tipo de Gola] - Tecido [Tecido] - [Opcional 1] - [Opcional 2]`
  - *Exemplo*: `CAMISA MALHA - Gola Polo Simples - Tecido PV - Manga Longa - Com Bolso`

### 5.3. Estampa Total (SublimaÃ§Ã£o)
- **PadrÃ£o**: `CAMISA SUBLIMADA TOTAL - [Tipo de Gola] - Tecido [Tecido] - Estampa [Ã�rea de Estampa] - [Opcionais...]`
  - *Exemplo*: `CAMISA SUBLIMADA TOTAL - Gola Redonda - Tecido Dry - Estampa Frente/Costas/Manga - Nome Individual`

### 5.4. Camisa PP Promocional
- **PadrÃ£o**: `CAMISA PP PROMOCIONAL [Branca/Cores] - Modelo [ConfiguraÃ§Ã£o] - Estampa [Ã�rea de Estampa] - [Extras...]`
  - *Exemplo*: `CAMISA PP PROMOCIONAL Branca - Modelo Peito/Costas - Estampa Lisa - Foto Frente`

### 5.5. Social
- **Brim**: `[Nome da PeÃ§a] de Brim`
  - *Exemplo*: `Jaleco Brim Curto ML de Brim`
- **Camisas Sociais**: `CAMISA SOCIAL [Tipo Manga] - Tecido [Tecido] [Detalhe]`
  - *Exemplo*: `Camisa Simples ML - Tecido Unioffice`
  - *Exemplo com Detalhes*: `Camisa MC com Frisos + Revel - Tecido Ibiza`

### 5.6. Tactel & Helanca
- **Tactel**: `[Nome da PeÃ§a] de Tactel`
  - *Exemplo*: `Bermuda Stamp de Tactel`
- **Helanca**: `[Nome da PeÃ§a] de Helanca - Linha [Adulto/Infantil]`
  - *Exemplo*: `CalÃ§a de Capoeira de Helanca - Linha Adulto`

### 5.7. Bandeiras
- **PadrÃ£o**: `Bandeira Sublimada [Simples/Dupla Face] - Medida [DimensÃµes] - [AcessÃ³rios]`
  - *Exemplo*: `Bandeira Sublimada Simples - Medida 1.50 x 1.00 m - Haste e Base inclusos`

### 5.8. AbadÃ¡s
- **PadrÃ£o**: `ABADÃ� DE EVENTO (Sem Manga) - Tecido [Tecido] - SublimaÃ§Ã£o Frente e Costas - [AcessÃ³rios]`
  - *Exemplo*: `ABADÃ� DE EVENTO (Sem Manga) - Tecido Dry Fit - SublimaÃ§Ã£o Frente e Costas - Com Bandana`

---

## 6. Layout A4 de ImpressÃ£o (Fidelidade ao Excel)

Ao acionar a impressÃ£o, a interface do vendedor Ã© omitida e renderiza-se o componente `PrintLayout`. Este componente deve ser estilizado especificamente para imitar a sobriedade e estrutura formal do modelo original em Excel (`ORÃ‡AMENTO.xltx`).

### 6.1. Elementos Estruturais do CabeÃ§alho:
- **Logo da Fase Esporte**: Posicionado no canto superior esquerdo ou centralizado em tamanho adequado.
- **IdentificaÃ§Ã£o da Empresa**:
  - `Fase Esporte UNIFORMES E EQUIPAMENTOS ESPORTIVOS`
  - Telefone comercial, e-mail e endereÃ§o.
- **IdentificaÃ§Ã£o da Cidade e Data**:
  - `Teixeira de Freitas - BA, [Dia] de [MÃªs por extenso] de [Ano Corrente]` (data preenchida de forma automÃ¡tica baseada no dia da emissÃ£o).
- **Tabela de Dados do Cliente**:
  - `Att.: [Nome do Cliente]`
  - `WhatsApp/Tel: [Telefone do Cliente]`

### 6.2. Tabela de Itens (Grade ClÃ¡ssica):
- Colunas com bordas elegantes em tom cinza-escuro:
  - `Qtd` (Largura: 10%)
  - `DescriÃ§Ã£o TÃ©cnica do Material` (Largura: 60%, alinhado Ã  esquerda)
  - `Valor R$` (Largura: 15%, alinhado Ã  direita)
  - `Total R$` (Largura: 15%, alinhado Ã  direita)
- Linhas com espaÃ§amento ideal para fÃ¡cil leitura.

### 6.3. Bloco de Fechamento Financeiro:
- Destaque em tabela menor posicionada no canto inferior direito:
  - `Valor Total do Pedido: R$ [Valor]`
  - `Desconto Aplicado: R$ [Valor]`
  - `Valor LÃ­quido a Pagar: R$ [Valor]`
  - `Entrada sugerida (50%): R$ [Valor]`

### 6.4. Bloco de CondiÃ§Ãµes Gerais de Venda (Texto padrÃ£o formal no rodapÃ©):
- `CondiÃ§Ã£o de pagamento: entrada de 50% no ato do pedido e o restante na entrega do mesmo (Ã  vista, pix ou cartÃ£o).`
- `PrevisÃ£o de entrega: [X] dias.`
- `Validade do orÃ§amento: [Y] dias.`

---

## 7. Folha de Estilo para ImpressÃ£o (CSS `@media print`)

Para garantir que o orÃ§amento seja gerado sem bordas indesejadas, sem cabeÃ§alhos do navegador (URLs, data automÃ¡tica do browser) e perfeitamente centralizado em uma folha A4, a folha de estilo global deve possuir as seguintes diretivas CSS:

```css
@media print {
  /* Ocultar elementos de interface de tela */
  body {
    background: #ffffff !important;
    color: #000000 !important;
    font-family: 'Outfit', 'Inter', 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
  }

  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  /* ForÃ§ar que a pÃ¡gina de impressÃ£o ocupe toda a largura A4 */
  .print-container {
    width: 100% !important;
    max-width: 800px;
    margin: 0 auto !important;
    padding: 20px !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* Evitar quebras de pÃ¡gina desnecessÃ¡rias no meio da tabela */
  tr {
    page-break-inside: avoid !important;
    page-break-after: auto !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  /* EstilizaÃ§Ã£o formal cinza/preto para impressÃ£o econÃ´mica */
  th {
    background-color: #f3f4f6 !important;
    color: #000000 !important;
    border: 1px solid #d1d5db !important;
    font-weight: 600 !important;
    padding: 8px !important;
  }

  td {
    border: 1px solid #e5e7eb !important;
    padding: 8px !important;
  }

  /* Ajustes de margem da pÃ¡gina no navegador */
  @page {
    size: A4 portrait;
    margin: 1.5cm 1.5cm 1.5cm 1.5cm;
  }
}
```

---

## 8. DefiniÃ§Ã£o do Escopo das Abas (tabs) e BotÃµes Interativos

Para fins de organizaÃ§Ã£o visual e alinhamento com a equipe de UI/Design System, a tabela a seguir mapeia os seletores interativos exatos que serÃ£o renderizados em cada aba da aplicaÃ§Ã£o:

| Categoria | Seletores PrimÃ¡rios (Radios) | Seletores SecundÃ¡rios (Checkboxes) |
| :--- | :--- | :--- |
| **Kit Esportivo** | - Tipo de Kit (Prata, Ouro, Profissional, etc.)<br>- Adicionais (Colete, CalÃ§a Goleiro, etc.) | - Nome Individual<br>- Sem Manga/Regata |
| **Camisa de Malha**| - Tipo de Gola (Polo, Redonda, V)<br>- Tecido (PP, PV, DRY, PIQUET) | - Reflex Simples/Duplo<br>- Manga Longa<br>- Com Bolso<br>- Adidas<br>- Lapela Stamp |
| **Estampa Total** | - Tipo de Gola (Redonda, V, Polo)<br>- Tecido (PP, DRY, CAMB)<br>- Ã�rea de Estampa (Frente/Costas/Manga, etc.) | - Nome Individual<br>- Sem Manga<br>- Manga Longa Lisa/Estampada |
| **Camisa PP** | - Cor da Camisa (Branca vs Colorida)<br>- Tipo Estampa (Frente/Costas vs Peito/Costas)<br>- SeleÃ§Ã£o da Ã�rea (Lisa, Frente, Costas, Peito) | - Foto Frente (+40)<br>- Foto Frente e Costas (+45) |
| **Linha Social** | - Categoria (Brim, Camisas, Opcionais, Toucas, BonÃ©s)<br>- SeleÃ§Ã£o da peÃ§a na lista | - Tipo Tecido Social (Unioffice vs Ibiza) |
| **Tactel & Helanca**| - Linha (Tactel vs Helanca)<br>- Tipo de PeÃ§a (Bermuda, CalÃ§a, Jaqueta)<br>- Faixa EtÃ¡ria Helanca (Adulto vs Infantil) | - Acabamento (Simples vs Estampado/Stamp) |
| **Bandeiras** | - Acabamento (Simples vs Dupla Face)<br>- DimensÃµes (Metragem MÂ²) | - Opcionais (Haste, Base, Costura MÂ²) |
| **AbadÃ¡s** | - Tecido (Cacharel/Pipoca vs Dry Fit) | - Com Bandana |

---

## 9. Integração e Especificação Técnica do Framer Motion

Esta seção define a implementação de código-padrão e as diretrizes detalhadas para a integração do **Framer Motion** na SPA React, garantindo que o desenvolvimento siga as especificações visuais rigorosas do Design System sem comprometer o desempenho da renderização.

### 9.1. Instalação e Requisitos do Pacote
Para habilitar os recursos avançados de animação, o projeto exige a instalação do pacote `framer-motion`:
```bash
npm install framer-motion
```

### 9.2. Variantes de Animação Globais (Reutilizáveis)
As seguintes configurações de variantes do Framer Motion devem ser declaradas como constantes para evitar reinstanciação a cada render:

#### A. Transição de Entrada Staggered (Painéis Laterais)
Utilizado para revelar sequencialmente os painéis da aplicação durante o carregamento inicial da página.
```javascript
export const pageRevealVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const panelItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 25
    }
  }
};
```

#### B. Transição de Troca de Abas (Tab Contents)
Garante que o configurador correspondente a cada categoria deslize e se revele suavemente sem causar quebras de layout.
```javascript
export const tabContentVariants = {
  initial: { opacity: 0, x: -12, scale: 0.99 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1] // Desaceleração suave (ultra premium)
    }
  },
  exit: { 
    opacity: 0, 
    x: 12, 
    scale: 0.99,
    transition: {
      duration: 0.15
    }
  }
};
```

#### C. Lista Dinâmica de Itens do Carrinho (`AnimatePresence`)
Essencial para que os itens do carrinho entrem e saiam da tabela com animação bi-dimensional (deslizamento horizontal + colapso de altura vertical para preencher o vácuo).
```javascript
export const cartItemRowVariants = {
  initial: { 
    opacity: 0, 
    x: -20,
    height: 0,
    backgroundColor: "rgba(175, 6, 8, 0.05)" // Destaque vermelho sutil na entrada
  },
  animate: { 
    opacity: 1, 
    x: 0, 
    height: "auto",
    backgroundColor: "rgba(175, 6, 8, 0)",
    transition: {
      height: { type: "spring", stiffness: 500, damping: 35 },
      opacity: { duration: 0.2 },
      x: { type: "spring", stiffness: 350, damping: 25 }
    }
  },
  exit: { 
    opacity: 0, 
    x: 40, 
    height: 0,
    backgroundColor: "rgba(239, 68, 68, 0.1)", // Destaque vermelho de perigo na saída
    transition: {
      height: { duration: 0.2, delay: 0.05 },
      opacity: { duration: 0.15 },
      x: { duration: 0.2 }
    }
  }
};
```

### 9.3. Indicadores Líquidos usando `layoutId`
Para conseguir o efeito de "deslocamento líquido" ao selecionar botões de abas ou opções de gola, utilize o `layoutId`. O React reordena o DOM fisicamente, mas o Framer Motion intercepta e faz a transição entre os elementos de forma fluida.
```jsx
// Exemplo de abas horizontais com indicador deslizante de fundo
import { motion } from 'framer-motion';

function TabSelector({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          style={{ position: 'relative' }}
        >
          {/* Se a aba estiver ativa, renderiza o plano de fundo animado */}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabIndicator"
              className="tab-indicator-bg"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '8px',
                zIndex: 0
              }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

### 9.4. Diretrizes de Desempenho e Acessibilidade (Pré-requisitos)
1.  **Hardware Acceleration**: Animará apenas propriedades aceleradas por GPU, especificamente: `transform` (`x`, `y`, `scale`, `rotate`) e `opacity`. Evitar animar diretamente propriedades de box-model como `width`, `height`, `margin` ou `padding` fora do contexto de `AnimatePresence` controlado, pois elas disparam repinturas custosas de layout no navegador (*reflows*).
2.  **Redução de Movimento (Acessibilidade)**: A lógica do sistema deve respeitar a preferência do usuário. Adicionar o hook `useReducedMotion` do Framer Motion para anular transições de movimento físico:
    ```javascript
    import { useReducedMotion } from 'framer-motion';
    
    // Dentro do componente React
    const shouldReduceMotion = useReducedMotion();
    
    const customTransition = shouldReduceMotion 
      ? { duration: 0.1 } // Transição instantânea sem física de mola
      : { type: "spring", stiffness: 300, damping: 30 };
    ```
3.  **Comportamento na Impressão**: Todas as animações do Framer Motion devem ser limpas ou desativadas nas folhas de estilo `@media print` de forma automática. O componente `PrintLayout` deve ser renderizado de forma estática pura para evitar quebras parciais ou frames congelados de transição na impressão do PDF.

---

## 10. Gerenciamento e Anexo de Grades de Tamanho (Tabelas de Medidas)

O gerador de orçamentos incorpora um livro de grades de medidas completo para as confecções da Fase Esporte, permitindo que o vendedor anexe as especificações físicas de tamanhos como página complementar no PDF do orçamento.

### 10.1. Estrutura e Dicionário de Grades (`sizes.ts`)
A base de medidas oficiais é estruturada na memória e definida pela interface `SizeChart`:
```typescript
export interface SizeChart {
  id: string
  label: string
  svgType: 'tshirt' | 'social' | 'pants'
  cols: string[]
  rows: Record<string, string[]> // sizeKey -> array de células de medidas na ordem das colunas
  obs: string
}
```

Cinco grades oficiais são fornecidas por padrão:
1.  **Camisa Normal - Unissex (`camisa_normal`)**: Colunas: Altura e Largura. Abrange do `PP` ao `XXGG`.
2.  **Camisa Infantil - Unissex (`camisa_infantil`)**: Colunas: Altura e Largura. Abrange do `PPP` ao `G`.
3.  **Camisa Social Masculina (`camisa_social`)**: Colunas: Altura, Largura e Braço. Abrange do `PP` ao `XXGG`.
4.  **Calça Normal - Unissex com Elástico (`calca_normal`)**: Colunas: Nº, Altura e Largura. Mapeia tamanhos numéricos (`34` a `56/58`) para as dimensões corporais físicas.
5.  **Baby Look - Feminina (`baby_look`)**: Colunas: Altura e Largura. Molde feminino acinturado com manga mais curta.

### 10.2. Lógica Administrativa, Persistência e Sincronização (`/tamanhos`)
*   **Armazenamento**: As edições são armazenadas localmente em `localStorage` sob a chave `'fase_sizes_v2'`, garantindo que modificações feitas por vendedores ou gerentes persistam de forma individual no navegador.
*   **Fusão Segura (`deepMerge`)**: Durante a inicialização, uma fusão recursiva profunda é executada entre as grades default e os dados recuperados de `localStorage`, prevenindo erros de carregamento caso propriedades novas sejam introduzidas no livro original.
*   **Subscrição Reativa (`subscribeSizes`)**: O arquivo utiliza o padrão *Observer* mantendo um conjunto de subscrições. Qualquer componente visual reage em tempo real a atualizações na memória de tamanhos assim que `saveSizes()` ou `resetSizes()` (restauração de fábrica) são chamados.

### 10.3. Fluxo de Integração e Geração de PDF (`PrintSheet.tsx` / `Conditions.tsx`)
1.  **Seleção no Gerador**: O componente `Conditions.tsx` exibe o checkbox **"Anexar tabela de tamanhos"**. Se marcado, revela um seletor dropdown com as cinco grades oficiais de medidas. O estado é controlado no `BudgetContext` global pelas variáveis `attachSizes` e `selectedSizeChartId`.
2.  **Quebra de Página no PDF**: Durante a geração de impressão nativa (`window.print()`), se `attachSizes` for `true`, o componente `PrintSheet` renderiza `<A4SizesPage />` na sequência da folha de orçamento principal. O estilo CSS força a quebra de página:
    ```css
    .a4-page-break {
      page-break-before: always;
      break-before: page;
    }
    ```
3.  **Desenho Técnico Explicativo (`MeasurementSvg.tsx`)**: O documento exibe de forma reativa a tabela contendo a grade e um desenho vetorial explicativo (SVG) que ilustra dinamicamente onde medir a peça, variando com base no `svgType` da tabela ativa (`tshirt`, `social` ou `pants`).
4.  **Caixa de Alerta Comercial**: O rodapé da folha de medidas exibe uma caixa em destaque com bordas tracejadas vermelhas contendo as observações de fabricação e tolerância (ex: variação física de até 5% no encolhimento de tecidos).

---

## 11. Princípios de Experiência do Usuário (UI/UX Pro Max)

A interface de orçamentos da Fase Esporte foi arquitetada seguindo as mais altas diretrizes da Skill **UI/UX Pro Max**, minimizando atritos de conversão e garantindo que o vendedor feche pedidos de forma ágil e segura.

### 11.1. Redução de Carga Cognitiva
*   **Navegação Orientada a Cliques**: Sem necessidade de digitar termos técnicos complicados. O vendedor escolhe golas, tecidos, extras e parcerias por cliques rápidos em botões gráficos intuitivos (`.btn-option`) com feedback visual robusto.
*   **Visualização Estática da Descrição**: Em vez de caixas de entrada livres que causam erros gramaticais e de padronização, a descrição técnica oficial é gerada e exibida na base do configurador em tempo real, fornecendo validação imediata ao vendedor antes de lançar o item ao carrinho.

### 11.2. Prevenção e Mensagens de Validação Reativas
*   **Aviso de Bracket de Quantidade Mínima**: Se a quantidade inserida no configurador for menor que 10 unidades (mínimo de fabricação de personalizados da Fase), o container numérico assume uma borda e glow de cor âmbar (`--color-warning`) e exibe uma etiqueta de texto sutil de atenção, sem bloquear a usabilidade do usuário, preservando a sua autonomia de negociação.
*   **Etiquetas Verdes de Desconto**: Ao selecionar uma parceria, itens qualificados no carrinho lateral exibem de forma destacada uma etiqueta verde contendo o desconto percentual exato da parceria para aquele material.
*   **Sinalizador de Isenção do Abadá**: Se o carrinho possuir um item da categoria Abadá e o vendedor ativar uma parceria (ex: Academias), o abadá exibirá uma etiqueta cinza indicando: `"Isento de desconto (Regra de Evento)"`, explicando a regra de negócio e evitando tentativas frustradas de desconto manual.

### 11.3. Gestão de Fluxo Responsivo Mobile (Gaveta Drawer)
*   **Mobile-First de Alta Fidelidade**: Em smartphones de atendimento externo, a área de seleção de categorias e botões ocupa toda a tela.
*   **Botão FAB e Drawer Animado**: O carrinho de compras lateral é substituído por um botão de ação flutuante (FAB) no canto inferior direito que carrega um badge numérico animado do total de itens. Ao clicar, o carrinho se expande em uma gaveta lateral (*drawer*) de baixo para cima controlada pelo Framer Motion, respeitando a ergonomia do toque com apenas um polegar.

### 11.4. Impressão Inteligente Otimizada (Zero Waste)
*   **Mudança Reativa de Tema**: O tema escuro premium da SPA é instantaneamente desligado no momento do acionamento de `@media print`. Todos os componentes de controle interativo (botões, lixeiras de exclusão, formulários vazios e barras de status de tela) são completamente omitidos da folha.
*   **Margens Físicas e Grade Clássica A4**: O conteúdo é compilado de forma estática pura em uma grade limpa e minimalista de altíssimo contraste (fundo branco absoluto e texto preto), com margens de 1.5cm e proteção contra quebra de linhas internas de tabelas, assegurando um PDF comercial elegante e de baixo custo de tinta para o cliente final.

---

Este documento serve como a fundação lógica do projeto. A partir dele, os comportamentos de estado estão 100% delimitados e a equipe de design tem as dimensões funcionais de cada componente mapeadas com precisão.
