# Fase Esporte - Gerador de Orçamentos Interativo 🚀

Este projeto é uma aplicação web interativa desenvolvida sob medida para a **Fase Esporte** (Teixeira de Freitas - BA). O sistema substitui o fluxo de trabalho manual por uma interface dinâmica baseada em **Next.js** e **TypeScript**, permitindo que os vendedores configurem peças esportivas, malhas e uniformes sociais e gerem orçamentos formalizados em A4/PDF de forma instantânea.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js**: Framework React para produção, utilizando roteamento nativo sob o **App Router**.
- **TypeScript**: Tipagem estática estrita para garantir a consistência de dados comerciais e fórmulas de precificação.
- **Framer Motion**: Motor de animações utilizado para fornecer transições e micro-interações fluidas de alto padrão.
- **Vanilla CSS**: Estilização moderna e customizada com variáveis HSL para garantir uma estética visual premium e responsividade total.
- **HTML5 & CSS Print Media**: Layout de alta fidelidade otimizado para salvamento direto em PDF e impressão via navegador (`@media print`).

---

## 📂 Estrutura do Projeto

```text
orcamentofase/
├── public/                 # Arquivos públicos estáticos
│   └── favicon.ico         # Favicon da aplicação
├── src/
│   ├── app/                # Rotas e Layouts nativos do Next.js App Router
│   │   ├── layout.tsx      # Layout raiz (Fontes, Estilos globais e Providers)
│   │   ├── page.tsx        # Gerador de Orçamentos (Homepage)
│   │   ├── metricas/       # Página de Métricas Comerciais
│   │   ├── tabela/         # Página de Edição da Tabela de Preços
│   │   └── design-system/  # Visualizador Interativo do Design System
│   ├── assets/             # Recursos visuais (vetores de logos oficiais)
│   ├── components/         # Componentes de interface de usuário (UI)
│   │   ├── app/            # Componentes estruturais (AppHeader)
│   │   ├── ds/             # Componentes do Design System (Nav)
│   │   └── gerador/        # Componentes do Gerador (BudgetCart, Configurator, Simulator, etc.)
│   ├── context/            # Gerenciamento de Estado Global Comercial (BudgetContext)
│   ├── data/               # Tabela de preços e matrizes financeiras (prices, pricebook)
│   ├── lib/                # Bibliotecas de terceiros e Custom Elements (image-slot.js)
│   └── styles/             # Design System & Estilos globais (.css)
├── TABELA DE PREÇOS 2024.xlsx # Planilha original para referência
├── ORÇAMENTO.xltx          # Modelo original em Excel para referência
├── next.config.ts          # Configuração do Next.js
├── tsconfig.json           # Configuração do TypeScript e Path Alias (@/*)
├── package.json            # Dependências e scripts npm
└── README.md               # Este arquivo manual
```

---

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar o projeto em sua máquina:

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em seu computador (versão 18.x ou superior recomendada).

### 2. Instalar Dependências
No terminal, dentro do diretório do projeto, execute o comando abaixo para instalar as bibliotecas necessárias:
```bash
npm install
```

### 3. Rodar em Modo de Desenvolvimento
Para iniciar o servidor de desenvolvimento local do Next.js, execute:
```bash
npm run dev
```
O console exibirá o endereço local, geralmente `http://localhost:3000`. Abra este endereço em seu navegador para ver o sistema rodando.

### 4. Build de Produção
Para compilar e otimizar a aplicação para publicação em produção:
```bash
npm run build
```

### 5. Iniciar Servidor de Produção
Para executar a aplicação compilada localmente em modo de produção:
```bash
npm run start
```

---

## 💡 Como Funciona o Fluxo de Orçamento

1. **Escolha o Produto**: Navegue pelas abas superiores (Kit Esportivo, Camisa de Malha, Sublimação Total, Social, etc.).
2. **Configure com Cliques**: Selecione o tipo de gola, tecido e adicione extras (ex: manga longa, com bolso, nome individual) clicando nos respectivos botões.
3. **Defina a Quantidade**: Insira a quantidade de peças. Para itens com desconto por quantidade, o sistema ajusta automaticamente o preço unitário com base nas faixas da tabela de preços!
4. **Adicione ao Orçamento**: Clique em "Adicionar". O item irá para a lista geral.
5. **Preencha os Dados**: Digite o nome do cliente, telefone e defina prazos de entrega ou descontos adicionais (ou selecione uma das Parcerias da Fase Esporte para aplicar descontos automáticos).
6. **Imprima ou Salve em PDF**: Clique em "Gerar Orçamento / Imprimir". O navegador abrirá a tela de impressão (`window.print()`) já formatada como uma folha A4 oficial com a logo da Fase Esporte, pronta para ser enviada por WhatsApp ou impressa.

---

## 📄 Licença e Propriedade

Este software é propriedade exclusiva da **Fase Esporte** e foi desenvolvido sob medida para otimizar a operação comercial da empresa.
