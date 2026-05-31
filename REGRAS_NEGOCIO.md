# Regras de Negócio — Fase Esporte

**Versão:** 1.0  
**Data:** 31 de Maio de 2026  
**Status:** Em construção (categoria a categoria)  
**Fonte de Verdade:** Tabela de Preços 2024 + validação comercial direta

> Este documento detalha as **regras de negócio específicas por categoria de produto** que complementam o PRD e o SPEC.  
> Para regras financeiras gerais (desconto de parceria, abadás, entrada 50%), consulte o **PRD.md § 5** e **SPEC.md § 4.3**.

---

## CATEGORIA: Bandeiras Sublimadas (`bandeira`)

### Visão Geral

Bandeiras sublimadas são calculadas por **metro quadrado (m²)** de tecido utilizado.  
Existem dois modelos de produto principais e uma linha de acessórios Wind Banner com regras próprias.

---

### BR-BAND-01 · Tipos de Bandeira e Precificação por m²

O sistema oferece dois acabamentos de bandeira, diferenciados pelo número de faces estampadas:

| Tipo | Descrição | Preço por m² |
|------|-----------|:---:|
| **Simples** | Estampa em apenas um lado do tecido | R$ 50,00 |
| **Dupla Face** | Estampa nos dois lados (dois tecidos unidos) | R$ 80,00 |

**Fórmula de cálculo:**
```
Preço Unitário = Área (m²) × Preço por m² do tipo selecionado
```

**Exemplo:**
- Bandeira Simples 1,50 × 1,00 m → Área = 1,5 m² → R$ 50,00 × 1,5 = **R$ 75,00 / un.**
- Bandeira Dupla Face 1,50 × 1,00 m → Área = 1,5 m² → R$ 80,00 × 1,5 = **R$ 120,00 / un.**

> **Regra de negócio:** O sistema deve permitir dimensões personalizadas (largura × altura em metros).  
> A área é sempre calculada automaticamente: `area = largura × altura`.

---

### BR-BAND-02 · Dimensões Padrão (Atalhos no Configurador)

Para agilizar o atendimento, o configurador deve oferecer **medidas pré-configuradas de uso comum**, além de permitir entrada manual de dimensões:

| Label | Dimensões (L × A) | Área (m²) |
|-------|:-----------------:|:---------:|
| Pequena (P) | 0,70 × 0,50 m | 0,35 m² |
| Média (M) | 1,50 × 1,00 m | 1,50 m² |
| Grande (G) | 2,00 × 1,30 m | 2,60 m² |
| GG | 3,00 × 2,00 m | 6,00 m² |
| Personalizado | Entrada manual | variável |

> **Nota técnica:** Os valores de área (`tamM2`) no `pricebook.json` representam essas áreas pré-definidas  
> (`p: 0.54`, `m: 1.5`, `g: 2.6`, `gg: 6.0`). **Não são preços — são áreas em m² usadas no cálculo.**

---

### BR-BAND-03 · Bandeiras com Valores Promocionais (Casos Especiais)

Algumas linhas de bandeira possuem **preços promocionais fixos** condicionados a quantidade mínima ou contexto de uso. Esses valores **substituem** o cálculo padrão por m².

#### 3.1 · Bandeira de Política (Campanha Eleitoral)

| Campo | Valor |
|-------|-------|
| **Preço unitário** | R$ 30,00 / un. |
| **Quantidade mínima** | 20 unidades |
| **Dimensões fixas** | 0,90 × 0,70 m (área = 0,63 m²) |
| **Tipo** | Simples (uma face) |

**Regras:**
- O preço promocional de R$ 30,00 só se aplica a partir de **20 unidades**.
- Abaixo de 20 unidades, deve ser cotado pelo valor padrão de m² (Simples: R$ 50,00/m² × 0,63 m² = R$ 31,50), ou negociado manualmente.
- O configurador deve exibir aviso caso a quantidade seja inferior a 20 unidades nesta modalidade.
- Dimensões não são alteráveis nesta modalidade (tamanho fixo 0,90 × 0,70 m).

**Descrição técnica gerada:**
```
BANDEIRA DE POLÍTICA - Medida 0,90 x 0,70 m - Sublimada Simples
```

#### 3.2 · Bandeira de Escanteio (Futebol)

| Campo | Valor |
|-------|-------|
| **Preço do kit** | R$ 40,00 (kit com 4 unidades) |
| **Quantidade padrão** | 4 unidades por kit |
| **Preço por unidade** | R$ 10,00 / un. |
| **Dimensões fixas** | 0,25 × 0,30 m (área = 0,075 m²) |
| **Tipo** | Simples (uma face) |

**Regras:**
- A bandeira de escanteio é **vendida em kit de 4 unidades por R$ 40,00**.
- No carrinho, deve ser adicionada como 1 kit = 4 bandeiras = R$ 40,00 total.
- Não é permitida a venda de unidades individuais avulsas abaixo do kit de 4 (salvo exceção aprovada pelo gerente).
- Dimensões não são alteráveis (tamanho fixo padrão de escanteio).

**Descrição técnica gerada:**
```
BANDEIRA DE ESCANTEIO - Kit 4 unidades - Medida 0,25 x 0,30 m - Sublimada Simples
```

---

### BR-BAND-04 · Wind Banner (Sistema de Expositores)

O Wind Banner é um sistema de expositor composto por **3 peças vendidas separadamente** mas ofertadas **por padrão em conjunto (kit completo)**.

#### Composição e Preços

| Peça | Preço Unitário | Obrigatório |
|------|:--------------:|:-----------:|
| **Bandeira** (lona sublimada) | R$ 160,00 / un. | ✅ Sempre |
| **Haste** (estrutura tubular) | R$ 70,00 / un. | Opcional (avulso) |
| **Base** (suporte de chão) | R$ 90,00 / un. | Opcional (avulso) |
| **Kit Completo** (bandeira + haste + base) | R$ 320,00 / un. | — |

#### Regras de Venda

1. **Oferta padrão:** O configurador deve apresentar o **kit completo** como opção default (bandeira + haste + base = R$ 320,00).
2. **Venda avulsa permitida:** Cada peça pode ser vendida individualmente — útil para clientes que já possuem a estrutura e precisam apenas da bandeira nova.
3. **Combinações possíveis:**
   - Bandeira apenas: R$ 160,00
   - Bandeira + Haste: R$ 230,00
   - Bandeira + Base: R$ 250,00
   - Bandeira + Haste + Base (kit completo): R$ 320,00
   - Haste apenas (reposição): R$ 70,00
   - Base apenas (reposição): R$ 90,00

4. **Sem cálculo por m²:** O Wind Banner **não usa o sistema de precificação por m²**. O preço da bandeira é fixo por unidade (R$ 160,00), independente das dimensões.
5. **Dimensões do Wind Banner:** Formato padrão de wind banner (lona em formato gota/lágrima ou retangular vertical). Não há seletor de área — o preço é fixo.

**Descrição técnica gerada (exemplos):**
```
WIND BANNER - Kit Completo (Bandeira + Haste + Base)
WIND BANNER - Bandeira + Haste
WIND BANNER - Bandeira Sublimada (avulso)
WIND BANNER - Haste (reposição)
WIND BANNER - Base (reposição)
```

---

### BR-BAND-05 · Resumo: Árvore de Decisão do Configurador de Bandeiras

```
BANDEIRAS
├── Bandeira Standard (por m²)
│   ├── Tipo: Simples (R$ 50/m²) ou Dupla Face (R$ 80/m²)
│   ├── Dimensões: P / M / G / GG / Personalizado
│   └── Opcionais: Haste (R$70) · Base (R$90) · Costura extra (R$22)
│
├── Bandeira de Política [Promocional]
│   ├── Preço fixo: R$ 30/un. (mínimo 20 un.)
│   └── Dimensão fixa: 0,90 × 0,70 m
│
├── Bandeira de Escanteio [Kit]
│   ├── Preço fixo: R$ 40,00 / kit (4 unidades)
│   └── Dimensão fixa: 0,25 × 0,30 m
│
└── Wind Banner [Sistema de Expositor]
    ├── Bandeira: R$ 160/un.
    ├── Haste: R$ 70/un.
    ├── Base: R$ 90/un.
    └── Kit Completo: R$ 320/un. [padrão sugerido]
```

---

### BR-BAND-06 · Descrição Técnica Padrão (Template)

O motor de geração de texto deve seguir os padrões abaixo para o PDF formal:

| Modalidade | Padrão de Descrição |
|---|---|
| Standard Simples | `Bandeira Sublimada Simples - Medida {L} x {A} m` |
| Standard Dupla Face | `Bandeira Sublimada Dupla Face - Medida {L} x {A} m` |
| Com Haste | `[...] - Haste inclusa` |
| Com Base | `[...] - Base inclusa` |
| Com Haste e Base | `[...] - Haste e Base inclusas` |
| Política | `Bandeira de Política - Medida 0,90 x 0,70 m - Sublimada Simples` |
| Escanteio | `Bandeira de Escanteio - Kit 4 unidades - Medida 0,25 x 0,30 m` |
| Wind Banner Kit | `Wind Banner - Kit Completo (Bandeira + Haste + Base)` |
| Wind Banner Avulso | `Wind Banner - {peças selecionadas}` |

---

### BR-BAND-07 · Estrutura de Dados no Pricebook

#### Bandeira Standard (pricebook.json — GITIGNORED)
```json
"bandeira": {
  "tipo": { "simples": 50, "dupla": 80 },
  "tamM2": { "p": 0.35, "m": 1.5, "g": 2.6, "gg": 6.0 },
  "extras": { "haste": 70, "base": 90, "costura": 22 }
}
```

> **Nota de migração:** Os valores `acab.simples` e `acab.dupla` no pricebook legado (65 e 99) eram valores antigos.  
> Os novos valores corretos são **R$ 50/m² (simples) e R$ 80/m² (dupla face)**, confirmados em 05/2026.

#### Wind Banner e Promocionais (valores fixos — podem ser SCALAR no banco)
```json
"wind_banner": {
  "bandeira": 160,
  "haste": 70,
  "base": 90
},
"bandeira_politica": {
  "unitario": 30,
  "minQty": 20,
  "largura": 0.90,
  "altura": 0.70
},
"bandeira_escanteio": {
  "kitTotal": 40,
  "qtdKit": 4,
  "largura": 0.25,
  "altura": 0.30
}
```

---

## CATEGORIA: Personalização Geral (`personalizacao`)

### Visão Geral

A **Personalização Geral** é um serviço transversal que pode ser aplicado sobre qualquer camisa de malha, PP, social, tactel/helanca ou peça similar — **exceto Estampa Total** (que já possui sublimação total embutida no produto base).

O sistema oferece **4 técnicas distintas** de personalização, cada uma com sua própria lógica de precificação:

| Técnica | Aplicável em | Lógica de Preço |
|---------|:------------:|-----------------|
| **Serigrafia** | Todas as malhas | Fotolito ÷ quantidade + consumo de tinta |
| **Estampa (Transfer)** | Dry Fit e PP (poliéster) | Tabela por faixa de quantidade |
| **Bordado** | Todas as malhas | Preço fixo por tamanho e tipo |
| **DTF** (Direct to Film) | Todas as malhas | Tabela por faixa de quantidade |

> **Importante:** A personalização é um **serviço adicional** cobrado por cima do preço base da peça. Cada técnica pode ter múltiplas posições na mesma camisa (ex: peito + costas), e cada posição é calculada individualmente para o fotolito/área, mas o **consumo de tinta/material é somado uma única vez**.

---

### BR-PERS-01 · Serigrafia

A serigrafia é calculada em **duas partes**: custo do fotolito (amortizado por quantidade) + consumo de tinta (fixo por pedido, somado uma única vez).

#### 1.1 · Tamanhos de Fotolito

| Tipo | Condição | Preço do Fotolito |
|------|:--------:|:-----------------:|
| **Grande** | Estampa > 10 cm | R$ 19,30 |
| **Pequeno** | Estampa ≤ 10 cm | R$ 9,60 |

#### 1.2 · Fórmula do Custo de Fotolito (por posição)

```
Custo Fotolito (por posição) = Preço Fotolito × Nº de Cores ÷ Quantidade de Peças
```

Quando há **múltiplas posições** na mesma peça, o cálculo é repetido para cada posição e somado:

```
Custo Total Fotolitos = Σ (Preço_Fotolito_i × Cores_i ÷ Qtd)
```

**Exemplo — 10 camisas, costas grande (1 cor) + peito pequeno (1 cor):**
```
Fotolito = (19,30 × 1 ÷ 10) + (9,60 × 1 ÷ 10)
         = 1,93 + 0,96
         = R$ 2,89
```

#### 1.3 · Consumo de Tinta — Pintura Grande

O consumo de tinta é adicionado **uma única vez** ao cálculo total (não multiplicado por posições):

| Nº de Cores | Consumo (≤ 25 peças) | Consumo (> 25 peças) |
|:-----------:|:--------------------:|:--------------------:|
| 1 cor       | R$ 2,00              | R$ 1,50              |
| 2 cores     | R$ 2,60              | R$ 2,10              |
| 3 cores     | R$ 3,00              | R$ 2,50              |
| 4 cores     | R$ 3,40              | R$ 2,90              |
| 5 cores     | R$ 3,90              | R$ 3,40              |
| 6 cores     | R$ 4,40              | R$ 3,90              |
| 7+ cores    | R$ 5,00              | R$ 4,50              |

> **Regra:** Acima de 25 peças, aplica-se desconto de **R$ 0,50** sobre o valor de consumo.

#### 1.4 · Consumo de Tinta — Pintura Pequena

Para pinturas pequenas (fotolito ≤ 10 cm), o consumo de tinta é **metade** do valor da pintura grande. Com desconto de **R$ 0,40** acima de 25 peças:

| Nº de Cores | Consumo (≤ 25 peças) | Consumo (> 25 peças) |
|:-----------:|:--------------------:|:--------------------:|
| 1 cor       | R$ 1,00              | R$ 0,60              |
| 2 cores     | R$ 1,30              | R$ 0,90              |
| 3 cores     | R$ 1,50              | R$ 1,10              |
| 4 cores     | R$ 1,70              | R$ 1,30              |
| 5 cores     | R$ 1,95              | R$ 1,55              |
| 6 cores     | R$ 2,20              | R$ 1,80              |
| 7+ cores    | R$ 2,50              | R$ 2,10              |

> **Regra:** Acima de 25 peças, aplica-se desconto de **R$ 0,40** sobre o valor de consumo.

> **Derivação:** Os valores base da tinta pequena equivalem a aproximadamente metade da tabela grande, compatível com o exemplo de referência (1 cor pequena = R$ 1,00 ✅).

#### 1.5 · Fórmula Final da Serigrafia

```
Preço Serigrafia por Peça =
    Σ (Fotolito_i × Cores_i ÷ Qtd)   ← custo de fotolitos (todas as posições)
  + Consumo_Tinta_Grande              ← tinta da posição grande (se houver)
  + Consumo_Tinta_Pequena            ← tinta da posição pequena (se houver)
```

**Exemplo completo — 10 camisas, costas grande 1 cor + peito pequeno 1 cor:**
```
= (19,30 × 1 ÷ 10) + (9,60 × 1 ÷ 10) + 2,00 + 1,00
= 1,93 + 0,96 + 2,00 + 1,00
= R$ 5,89 por peça
```

#### 1.6 · Regras do Configurador (Serigrafia)

- Permitir adicionar **múltiplas posições** (peito, costas, manga, etc.)
- Para cada posição: escolher tamanho (grande/pequeno) e número de cores
- O sistema calcula o custo de fotolito por posição automaticamente
- O consumo de tinta é exibido como item único no total
- Exibir aviso quando qty > 25 (desconto de tinta ativado)

**Descrição técnica gerada (exemplos):**
```
SERIGRAFIA - Costas Grande 1 cor + Peito Pequeno 1 cor
SERIGRAFIA - Costas Grande 3 cores
SERIGRAFIA - Peito Pequeno 2 cores
```

---

### BR-PERS-02 · Estampa (Transfer para Poliéster)

> **Restrição de aplicação:** A Estampa Transfer é utilizada **somente em camisas Dry Fit e PP** (tecido 100% poliéster). Não aplicável em malhas de algodão ou mistas.

A estampa é precificada por **faixa de quantidade**, com valores diferentes para tamanho grande e pequeno. **Não há custo de fotolito** — o preço já é tudo-incluído por peça.

#### 2.1 · Tabela de Preços — Estampa Grande

| Faixa de Quantidade | Preço por peça |
|:-------------------:|:--------------:|
| 1 a 24 peças        | R$ 3,70        |
| 25 a 54 peças       | R$ 3,20        |
| 55 a 104 peças      | R$ 3,00        |
| 105 a 303 peças     | R$ 2,70        |

#### 2.2 · Tabela de Preços — Estampa Pequena

| Faixa de Quantidade | Preço por peça |
|:-------------------:|:--------------:|
| 1 a 24 peças        | R$ 1,90        |
| 25 a 54 peças       | R$ 1,60        |
| 55 a 104 peças      | R$ 1,50        |
| 105 a 303 peças     | R$ 1,30        |

#### 2.3 · Fórmula e Regras

```
Preço Estampa por Peça = Σ Valor_por_Faixa(Qtd, Tamanho_i)
```
- Quando há **múltiplas posições** (ex: peito + costas), soma-se o valor de cada estampa
- A faixa de quantidade é definida pelo **total de peças do pedido**, não por posição
- Sem diferenciação por número de cores (o preço já inclui qualquer quantidade de cores)

**Descrição técnica gerada (exemplos):**
```
ESTAMPA TRANSFER - Costas Grande + Peito Pequeno
ESTAMPA TRANSFER - Costas Grande
```

---

### BR-PERS-03 · Bordado

O bordado tem **preço fixo por peça**, sem variação por quantidade. A diferenciação é feita pelo **tamanho** e pelo **tipo/posição** do bordado.

#### 3.1 · Bordados de 7,5 cm (Peito / Pequenos)

| Tipo | Preço por peça |
|------|:--------------:|
| **Direto** (bordado convencional) | R$ 10,00 |
| **Sublimático** (base sublimada + bordado) | R$ 10,00 |
| **Com Nome Individual** (qualquer tipo) | R$ 12,80 |

> **Regra:** O tipo (Direto ou Sublimático) **deve constar na descrição técnica** do orçamento impresso, pois impacta o processo de produção, mesmo que o preço seja igual.

> **Regra:** "Com Nome Individual" aplica-se quando o bordado contém o nome específico de cada cliente/atleta. O preço R$ 12,80 substitui o R$ 10,00 (não é adicional).

#### 3.2 · Bordados de 15 cm (Costas / Grandes)

| Tipo | Preço por peça |
|------|:--------------:|
| **Costas — Nome** (texto com nome) | R$ 16,10 |
| **Costas — Chapado** (logotipo preenchido) | R$ 26,80 |
| **Costas — Sublimado** (base sublimada + bordado) | R$ 21,40 |

#### 3.3 · Regras do Configurador (Bordado)

- Selecionar tamanho: 7,5 cm ou 15 cm
- Para 7,5 cm: selecionar tipo (Direto / Sublimático) + toggle "Nome Individual" (R$ 12,80)
- Para 15 cm: selecionar tipo (Nome / Chapado / Sublimado)
- **Não há campo de quantidade de cores** — o preço é fixo
- Múltiplas posições: somar os valores de cada bordado individualmente

**Descrição técnica gerada (exemplos):**
```
BORDADO 7,5cm - Direto (Peito)
BORDADO 7,5cm - Sublimático - Nome Individual
BORDADO 15cm - Costas Chapado
BORDADO 15cm - Costas Sublimado
```

---

### BR-PERS-04 · DTF (Direct to Film)

O DTF também possui **dois tamanhos** (grande e pequeno) e preços decrescentes por faixa de quantidade — sem custo de fotolito e sem diferenciação por cor.

#### 4.1 · Tabela de Preços — DTF Grande

| Faixa de Quantidade | Preço por peça |
|:-------------------:|:--------------:|
| 1 a 4 peças         | R$ 30,00       |
| 5 a 9 peças         | R$ 25,00       |
| 10 a 49 peças       | R$ 15,00       |
| 50+ peças           | R$ 12,00       |

#### 4.2 · Tabela de Preços — DTF Pequeno

| Faixa de Quantidade | Preço por peça |
|:-------------------:|:--------------:|
| 1 a 4 peças         | R$ 15,00       |
| 5 a 9 peças         | R$ 10,00       |
| 10 a 49 peças       | R$ 5,00        |
| 50+ peças           | R$ 4,00        |

#### 4.3 · Regras do Configurador (DTF)

- Selecionar tamanho por posição: Grande ou Pequeno
- A faixa de quantidade é definida pelo **total de peças do pedido**
- Múltiplas posições: somar o valor de cada DTF separadamente
- Sem diferenciação por cores — o preço já inclui qualquer arte

**Descrição técnica gerada (exemplos):**
```
DTF - Costas Grande + Peito Pequeno
DTF - Costas Grande
DTF - Peito Pequeno
```

---

### BR-PERS-05 · Comparativo entre Técnicas

| Critério | Serigrafia | Estampa | Bordado | DTF |
|----------|:----------:|:-------:|:-------:|:---:|
| Varia por quantidade | ✅ (fotolito) | ✅ | ❌ | ✅ |
| Varia por nº de cores | ✅ (tinta) | ❌ | ❌ | ❌ |
| Varia por posição | ✅ | ✅ | ✅ | ✅ |
| Aplicável em algodão | ✅ | ❌ | ✅ | ✅ |
| Aplicável em Dry Fit | ✅ | ✅ | ✅ | ✅ |
| Aplicável em PP | ✅ | ✅ | ✅ | ✅ |
| Custo de setup (fotolito) | ✅ | ❌ | ❌ | ❌ |
| Mínimo viável (custo) | Alto em qtd baixa | Médio | Fixo | Alto em qtd baixa |

---

### BR-PERS-06 · Estrutura de Dados no Pricebook

```json
"personalizacao": {
  "serigrafia": {
    "fotolito": { "grande": 19.30, "pequeno": 9.60 },
    "tinta_grande": {
      "1": 2.00, "2": 2.60, "3": 3.00,
      "4": 3.40, "5": 3.90, "6": 4.40, "7+": 5.00,
      "desconto_acima25": 0.50
    },
    "tinta_pequena": {
      "1": 1.00, "2": 1.30, "3": 1.50,
      "4": 1.70, "5": 1.95, "6": 2.20, "7+": 2.50,
      "desconto_acima25": 0.40
    }
  },
  "estampa": {
    "grande": { "1-24": 3.70, "25-54": 3.20, "55-104": 3.00, "105-303": 2.70 },
    "pequena": { "1-24": 1.90, "25-54": 1.60, "55-104": 1.50, "105-303": 1.30 }
  },
  "bordado": {
    "7_5cm": { "direto": 10.00, "sublimatico": 10.00, "nome_individual": 12.80 },
    "15cm":  { "costas_nome": 16.10, "costas_chapado": 26.80, "costas_sublimado": 21.40 }
  },
  "dtf": {
    "grande":  { "1-4": 30.00, "5-9": 25.00, "10-49": 15.00, "50+": 12.00 },
    "pequeno": { "1-4": 15.00, "5-9": 10.00, "10-49": 5.00,  "50+": 4.00 }
  }
}
```

---

*Documento atualizado em 31/05/2026 · Categorias documentadas: Bandeiras, Personalização Geral*

---

## CATEGORIA: Materiais Esportivos (`kit_esportivo`)

### Visão Geral

A categoria de **Materiais Esportivos** é composta por kits de futebol completos e peças avulsas de vestuário e acessórios para equipes, escolinhas e arbitragem. O sistema oferece flexibilidade para escolher peças avulsas, montar kits ou aplicar opcionais específicos.

---

### BR-SPO-01 · Linhas Principais de Kits Esportivos

Os kits esportivos tradicionais da Fase Esporte são divididos em 3 linhas principais, além de uma linha especial para Escolinhas de Futebol. Cada kit completo é composto por: **Camisa (tecido especial) + Short + Meião**.

| Linha | Camisa | Short | Meião | Kit Completo | Descrição e Tecidos |
|:---|:---:|:---:|:---:|:---:|:---|
| **Prata** | R$ 68,00 | R$ 40,00 | R$ 20,00 | **R$ 128,00** | Tecido básico Dry, ótimo custo-benefício. |
| **Ouro** | R$ 73,00 | R$ 45,00 | R$ 32,00 | **| R$ 150,00** | Tecido Dry de alta performance, toque macio. |
| **Profissional** | R$ 83,00 | R$ 55,00 | R$ 32,00 | **R$ 170,00** | Tecido premium com elastano, absorção ultra. **Nome incluso**. |
| **Escolinha** | R$ 73,00 | R$ 40,00 | R$ 20,00 | **R$ 133,00** | Tecido resistente para treinos. **Nome incluso**. |

> ⚠️ **Regra de Parceria (Escolinhas):** A linha de **Escolinha** costuma receber por padrão **25% de desconto no kit completo fechado** (Camisa + Short + Meião = R$ 133,00 → **R$ 99,75** líquido), alinhada com as parcerias comerciais pré-configuradas.

---

### BR-SPO-02 · Variações e Opcionais nos Kits

São acréscimos ou descontos aplicados sobre a configuração base das peças do kit:

#### 2.1 · Nome Individual nas Camisas
- **Linhas Prata e Ouro:** Acréscimo de **+R$ 5,00** por camisa.
- **Linhas Profissional e Escolinha:** O nome individual **já vem incluso** no preço base da camisa (R$ 0,00 adicional).

#### 2.2 · Kit de Goleiro com Manga Longa
- Caso o cliente solicite a camisa do goleiro com manga longa, haverá um acréscimo de **+R$ 10,00** na camisa correspondente.

#### 2.3 · Blusa Sem Manga (Regata)
- Caso o cliente solicite a camisa no modelo sem manga (regata), é concedido um desconto de **-R$ 2,00** no valor da camisa.

#### 2.4 · Meia Cano Longo (Comissão / Extras)
- Para meias de cano longo (comum para comissão técnica ou reposição), o valor é de **R$ 20,00** a unidade.

---

### BR-SPO-03 · Outros Materiais (Acessórios de Time)

Peças e recipientes coletivos úteis para o dia a dia do time:

- **Bolsão de uniforme:** R$ 130,00 / un.
- **Bolsa de massagem:** R$ 150,00 / un.
- **Squeeze (garrafa de água):** R$ 10,00 / un.

---

### BR-SPO-04 · Produtos Individuais (Fora dos Kits)

Produtos de arbitragem e coletes de treino vendidos de forma avulsa:

#### 4.1 · Arbitragem
- **Camisa de Árbitro:** R$ 73,00 / un. (Tecido Dry Fit)
- **Short de Árbitro:** R$ 55,00 / un. (Tecido Dry Fit)

#### 4.2 · Bermudas Avulsas
- **Bermuda com bolso em Hidronatic:** R$ 65,00 / un.

#### 4.3 · Coletes
O sistema possui duas divisões de coletes: **Estampados** (com arte integrada) e **Numerados** (com número sublimado/estampado, que aceitam personalizações transversais):

- **Colete simples estampado:** R$ 43,00 / un. (aceita Nome Individual como opcional).
- **Colete dupla face estampado:** Preço sob consulta / a definir (aceita Nome Individual como opcional).
- **Colete simples numerado:** R$ 22,00 / un. base (aceita personalizações adicionais de serigrafia, DTF, bordado etc.).
- **Colete duplo numerado:** R$ 37,00 / un. base (aceita personalizações adicionais).

---

### BR-SPO-05 · Estrutura de Dados no Pricebook

```json
"kit_esportivo": {
  "linhas": {
    "prata": { "camisa": 68, "short": 40, "meiao": 20 },
    "ouro": { "camisa": 73, "short": 45, "meiao": 32 },
    "prof": { "camisa": 83, "short": 55, "meiao": 32 },
    "escolinha": { "camisa": 73, "short": 40, "meiao": 20 }
  },
  "opcionais": {
    "nome_individual": 5,
    "goleiro_manga_longa": 10,
    "sem_manga": -2,
    "meia_cano_longo": 20
  },
  "acessorios": {
    "bolsao_uniforme": 130,
    "bolsa_massagem": 150,
    "squeeze": 10
  },
  "individuais": {
    "camisa_arbitro": 73,
    "short_arbitro": 55,
    "bermuda_hidronatic": 65,
    "colete_simples_estampado": 43,
    "colete_dupla_face_estampado": null,
    "colete_simples_numerado": 22,
    "colete_duplo_numerado": 37
  }
}
```

---

*Documento atualizado em 31/05/2026 · Categorias documentadas: Bandeiras, Personalização Geral, Materiais Esportivos*

