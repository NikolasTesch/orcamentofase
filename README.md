# Fase Esporte - Gerador de Orçamentos Interativo 🚀

Este projeto é uma aplicação web interativa em **React** desenvolvida especificamente para a **Fase Esporte** (Teixeira de Freitas - BA). Ele substitui o fluxo de trabalho manual no Excel por uma página web interativa de alta performance, onde os vendedores podem configurar peças esportivas, malhas e uniformes sociais através de cliques intuitivos e gerar orçamentos formalizados em PDF de forma instantânea.

---

## 🛠️ Tecnologias Utilizadas

- **React**: Biblioteca principal para construção da interface de usuário.
- **Vite**: Ferramenta de build e servidor de desenvolvimento ultra-rápido.
- **Framer Motion**: Motor de animações utilizado para fornecer transições e micro-interações fluidas de alto padrão (UI/UX Pro Max).
- **Vanilla CSS**: Folhas de estilo modernas e customizadas com variáveis HSL para garantir uma estética visual premium e responsividade total.
- **Lucide React**: Biblioteca de ícones modernos e minimalistas.
- **HTML5 & CSS Print Media**: Layout de alta fidelidade otimizado para salvamento direto em PDF e impressão via navegador.

---

## 📂 Estrutura do Projeto

```text
orcamentofase/
├── public/
│   └── favicon.ico         # Favicon da aplicação
├── src/
│   ├── assets/
│   │   ├── logo-branco.svg # Logo oficial em vetor (Fundo Escuro)
│   │   └── logo-preto.svg  # Logo oficial em vetor (Fundo Claro)
│   ├── components/         # Componentes React (Seletor, Lista, Impressão)
│   ├── data/
│   │   └── prices.js       # Tabela de preços oficial importada do Excel
│   ├── App.jsx             # Componente central da aplicação
│   ├── index.css           # Design System & Estilos globais (Premium)
│   └── main.jsx            # Ponto de entrada do React
├── TABELA DE PREÇOS 2024.xlsx # Planilha original para referência
├── ORÇAMENTO.xltx          # Modelo original em Excel para referência
├── SPEC.md                 # Especificação técnica do sistema
├── package.json            # Dependências e scripts do projeto
└── README.md               # Este arquivo manual
```

---

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar o projeto em sua máquina:

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em seu computador (versão 16 ou superior recomendada).

### 2. Instalar Dependências
No terminal, dentro do diretório do projeto, execute o comando abaixo para instalar as bibliotecas necessárias:
```bash
npm install
```

### 3. Rodar em Modo de Desenvolvimento
Para iniciar o servidor de desenvolvimento local, execute:
```bash
npm run dev
```
O console exibirá um link local, geralmente `http://localhost:5173`. Abra este endereço em seu navegador para ver o sistema rodando.

### 4. Build de Produção
Para compilar a aplicação em uma versão otimizada de produção pronta para publicação:
```bash
npm run build
```
Os arquivos gerados serão salvos na pasta `dist/` e podem ser hospedados gratuitamente em serviços como Netlify, Vercel ou GitHub Pages.

---

## 💡 Como Funciona o Fluxo de Orçamento

1. **Escolha o Produto**: Navegue pelas abas superiores (Kit Esportivo, Camisa de Malha, Sublimação Total, Social, etc.).
2. **Configure com Cliques**: Selecione o tipo de gola, tecido e adicione extras (ex: manga longa, com bolso, nome individual) clicando nos respectivos botões. Os botões mudam de cor para indicar seleção.
3. **Defina a Quantidade**: Digite a quantidade total de peças. Para itens promocionais, o sistema ajusta automaticamente o preço unitário com base nas faixas de quantidade da tabela oficial!
4. **Adicione ao Orçamento**: Clique em "Adicionar ao Orçamento". O item irá para a lista geral.
5. **Preencha os Dados**: Digite o nome do cliente, telefone e defina prazos de entrega ou descontos adicionais (ou selecione uma das Parcerias da Fase Esporte para aplicar descontos automáticos).
6. **Imprima ou Salve em PDF**: Clique em "Gerar Orçamento / Imprimir". O navegador abrirá a tela de impressão (`window.print()`) já formatada como uma folha A4 oficial com a logo da Fase Esporte, pronta para ser enviada por WhatsApp ou impressa.

---

## 📄 Licença e Propriedade

Este software é propriedade exclusiva da **Fase Esporte** e foi desenvolvido sob medida para otimizar a operação comercial da empresa.

