# Product Requirements Document (PRD): Gerador de Orçamentos Fase Esporte

Este documento define os requisitos de produto, regras de negócio e especificações de experiência do usuário para o desenvolvimento do **Gerador de Orçamentos da Fase Esporte**. Ele serve como o guia estratégico e funcional do produto.

---

## 1. Controle de Documentação
- **Produto**: Gerador de Orçamentos Fase Esporte
- **Status**: Em Planejamento / Especificação
- **Autor**: Antigravity (AI Pair Programmer)
- **Data**: 30 de Maio de 2026
- **Versão**: 1.0 (Inicial)

---

## 2. Visão Geral do Produto

### 2.1. Declaração do Problema
Atualmente, o time de vendas da **Fase Esporte** utiliza um fluxo de trabalho manual baseado em planilhas Excel rígidas e tabelas de preços estáticas. Para cada orçamento, o vendedor precisa:
1. Analisar a descrição de material desejada pelo cliente.
2. Consultar a tabela de preços, identificando manualmente a faixa de quantidade e o tecido corretos.
3. Somar manualmente os opcionais (manga longa, bolso, etc.).
4. Digitar a descrição técnica e calcular os totais e parcelas de entrada na calculadora.

Esse processo consome muito tempo e gera frequentes erros de cálculo de preços unitários e formatação na descrição técnica das peças.

### 2.2. Proposta de Valor
Desenvolver uma aplicação web estática interativa e responsiva em React. O vendedor poderá configurar qualquer peça da Fase Esporte por meio de cliques rápidos em botões intuitivos. A aplicação calculará instantaneamente o preço unitário (usando a tabela de preços oficiais convertida para JS), gerará a descrição técnica formatada e criará uma visualização de orçamento limpa em formato A4, pronta para impressão ou exportação em PDF.

### 2.3. Público-Alvo
- Vendedores comerciais e representantes da Fase Esporte (utilizando tanto em desktops na loja física quanto em smartphones em atendimentos externos via WhatsApp).

---

## 3. Objetivos Estratégicos e KPIs

- **Objetivo 1**: Reduzir a zero a incidência de erros de cálculo matemático e digitação técnica em orçamentos comerciais.
- **Objetivo 2**: Diminuir o tempo médio de emissão de um orçamento de 10 minutos para menos de 60 segundos.
- **Objetivo 3**: Garantir consistência de marca visual na apresentação do orçamento A4 enviado aos clientes.

### Indicadores de Sucesso (KPIs):
- Taxa de divergência de valores: **0%**.
- Tempo médio de criação de orçamento: **< 45 segundos**.
- Adoção interna da ferramenta pela equipe de vendas: **100%**.

---

## 4. Requisitos Funcionais e MoSCoW

Mapeamos as funcionalidades do sistema utilizando a metodologia MoSCoW (*Must Have*, *Should Have*, *Could Have*, *Won't Have*):

### 4.1. Must Have (Obrigatório)
- **Seletor por Categorias**: Menu interativo para alternar entre as 8 categorias de produtos (Kit Esportivo, Camisa Malha, Estampa Total, Camisa PP, Social, Tactel/Helanca, Bandeira, Abadá).
- **Configurador por Cliques**: Botões interativos em formato de opções ativas onde o vendedor seleciona tecidos, golas, mangas e opcionais sem precisar digitar.
- **Cálculo Automático de Volume (Brackets)**: O sistema deve atualizar dinamicamente o valor base unitário assim que o campo de quantidade for alterado.
- **Geração de Texto Técnico**: Um motor de templates que constrói a string técnica da peça de forma automática à medida que as opções são clicadas.
- **Carrinho de Itens (BudgetCart)**: Lista onde o vendedor adiciona, edita a quantidade e remove itens configurados.
- **Painel Financeiro & Totais**: Cálculo de Subtotal bruto, aplicação automática de desconto de parcerias, descontos manuais adicionais, valor líquido e divisão de 50% de entrada regulamentar.
- **Layout de Impressão A4 de Alta Fidelidade**: Otimização total para `window.print()` ocultando controles do site e gerando uma folha formal limpa com a logo e dados da Fase Esporte.

### 4.2. Should Have (Desejável)
- **Modo Escuro / Modo Claro (Dark/Light Mode)**: Alternador de visualização para melhor conforto visual do vendedor, mantendo a impressão em A4 sempre em fundo claro econômico.
- **Parcerias Pré-configuradas**: Dropdown de seleção de parceiros comerciais oficiais para aplicação em 1 clique de descontos específicos.
- **Avisos Visuais Dinâmicos**: Mensagens e alertas caso o usuário tente selecionar regras inválidas (ex: "Não é permitido colocar numeração em camisas promocionais").

### 4.3. Could Have (Poderia Ter)
- **WhatsApp Direct**: Botão para abrir o WhatsApp Web diretamente com o texto resumido do orçamento formatado em markdown para envio rápido.
- **Personalização Dinâmica de Condições**: Área de configurações gerais onde o vendedor pode alterar de forma pontual a validade padrão (07 dias) ou prazo de entrega (30 dias).

### 4.4. Won't Have (Fora de Escopo do MVP)
- **Autenticação de Usuários**: Sem login/senha de vendedores nesta etapa.
- **Banco de Dados em Nuvem**: Sem persistência em servidor ou histórico de orçamentos salvos online (aplicação é estática e roda localmente).
- **Cadastro Dinâmico de Produtos na Tela**: A alteração de preços deve ser feita direto no arquivo de dados `prices.js` no código fonte, sem painel administrativo visual.

---

## 5. Regras de Negócio Detalhadas (Business Rules)

### BR-01: Tabela de Preços Regressiva por Volume
Itens promocionais (Malha, Estampa Total, Camisa PP, Abadás) devem seguir estritamente as 5 faixas de volume de compra para definir o valor unitário básico:
- **10 a 50 unidades**
- **51 a 100 unidades**
- **101 a 300 unidades**
- **300 a 500 unidades**
- **501 unidades para cima**

### BR-02: Regra de Ouro das Parcerias (Descontos e Isenções)
- **Regra de Isenção do Abadá**: Abadás de evento **nunca** recebem descontos de parceria. O sistema deve ignorar o desconto de parceria para itens de abadá mesmo se o cliente possuir uma parceria ativa.
- **Regra de Identidade de Parceria**: Todos os materiais de parceiro (Escolinhas, Academias, etc.) devem vir com uma nota no orçamento formal: `*INCLUSA LOGO DA FASE NA FRENTE E COSTAS EM DESTAQUE, EXCETO CAMISAS DE FORMANDOS.*`

### BR-03: Limitações Promocionais
- O sistema deve impedir visualmente ou avisar o vendedor caso ele tente adicionar itens incompatíveis em camisas promocionais (ex: numeração individual em camisa de estampa promocional).

### BR-04: Divisão Financeira de Entrada (Fluxo de Caixa)
Toda proposta formalizada deve exibir obrigatoriamente a divisão financeira padrão da Fase Esporte:
- **Sinal de Entrada**: 50% do valor líquido total exigido no ato de fechamento do pedido.
- **Saldo Restante (50%)**: A ser quitado na entrega do material (à vista, pix ou cartão).

---

## 6. Fluxos de Usuário (User Journeys)

### Fluxo 1: Elaboração de um Orçamento Comercial Rápido
1. O vendedor abre a aplicação web e insere os dados do cliente (Nome: `Academia Fitness`, WhatsApp: `(73) 99999-9999`).
2. Ele seleciona a aba **Camisa de Malha**.
3. Escolhe: **Gola Polo Simples**, Tecido: **PV**, Opcionais: **Manga Longa** e **Com Bolso**.
4. Insere a quantidade: `120 peças`.
5. O sistema atualiza dinamicamente o Preço Unitário (Base de bracket de 101 a 300 + adicionais) e monta a string: `CAMISA MALHA - Gola Polo Simples - Tecido PV - Manga Longa - Com Bolso`.
6. O vendedor clica em **Adicionar ao Orçamento**. O item é listado no carrinho lateral.
7. O vendedor seleciona no menu de Parcerias: `Academias`. O sistema identifica que o item é de revenda e aplica automaticamente **30% de desconto** sobre o subtotal daquele item.
8. O valor total líquido atualiza, exibindo a entrada sugerida de 50%.
9. O vendedor clica em **Imprimir/PDF**. O sistema renderiza o layout A4 e chama a tela de impressão nativa do browser em formato econômico (sem botões).
10. O vendedor salva como PDF e envia para o cliente.

---

## 7. Requisitos não Funcionais (RNF)

- **RNF-01: Performance**: Tempo de carregamento inicial menor que **1.5 segundos**. Toda a lógica de cálculo de cliques deve ser computada em menos de **50ms** (instantâneo para o usuário).
- **RNF-02: Design e Identidade Visual (Premium)**:
  - Estética visual baseada na marca Fase Esporte: uso do Vermelho Fase (`#AF0608`), Grafite (`#1a1a1a`) e fundos em tom cinza escuro/superfície fosca.
  - Visual de "vidro desfocado" (glassmorphism) nos painéis de controle.
  - Interface adaptável para celulares e tablets (Mobile-First Friendly).
- **RNF-03: Compatibilidade de Impressão**: O CSS `@media print` deve garantir formatação impecável em navegadores baseados em Chromium (Google Chrome, Microsoft Edge) e Mozilla Firefox nas configurações padrão de folha A4.
- **RNF-04: Segurança e Custos**: Aplicação estática (Static Web App). Não consome recursos de banco de dados SQL e pode ser hospedada de forma gratuita em redes globais CDN (Vercel, Netlify ou GitHub Pages).

---

Este PRD estabelece os limites, escopos e as metas de produto para o Gerador de Orçamentos Fase Esporte. Ele serve como base definitiva para o design da interface no Claude Design e posterior codificação no React.

