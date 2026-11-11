# DESIGN.md — Simcc · Sistema de Mapeamento de Competências Científicas

Guia de design para agentes/LLMs que geram interfaces, slides ou materiais do **Simcc**.
Fonte: **página 2** do PDF `observatorio_logos.pdf` (capa do Simcc). Este kit é irmão do kit do **Observatório** (página 1): mesma família visual, outro nome, outro fundo.
**[extraído]** = medido no PDF · **[proposto]** = extrapolação coerente, não é regra oficial. Em conflito, vale a capa (`reference/page-2.png`).

---

## 1. Essência visual (leia primeiro)

1. **Fundo off-white `#FAFAFA`**, não branco puro, com uma **paisagem de ondas suaves** atrás do logo: três linhas finas e um preenchimento translúcido que forma uma "colina" de topo plano no centro.
2. **Cor saturada só no logo.** O fundo é quase monocromático (cinza-azulado claro). Navy, vermelho e azul-céu aparecem concentrados no símbolo e no nome.
3. **Logo centralizado**, ~30% da largura da página, com texto descritivo **alinhado à direita**.
4. **Lexend** com contraste Light (300) × ExtraBold (800), em caixa-alta no descritivo.
5. Tom: calmo, técnico, de "mapa" e "relevo". Menos festivo que o Observatório (que usa faixas saturadas).

### Observatório × Simcc (o que muda e o que não muda)

| | Observatório (pág. 1) | Simcc (pág. 2) |
|---|---|---|
| Fundo | Branco `#FFFFFF` | Off-white `#FAFAFA` |
| Decoração | Faixas saturadas (vermelho/azul) sangrando nas bordas | Ondas finas de baixo contraste, sangrando nas laterais |
| Quem tem cor | O fundo e o logo | Só o logo |
| Lockup | Nome grande + descritivo | Símbolo + "Simcc" + descritivo à direita |
| **Iguais** | Paleta navy/vermelho/azul-céu, Lexend 300/800, logo centralizado, muito espaço vazio | |

Se a tela é do Simcc, **não use as faixas do Observatório** e vice-versa.

## 2. Cores

| Token | Hex | Papel | Origem |
|---|---|---|---|
| `navy` | `#2B2D74` | Texto, "Simcc", botão primário | [extraído] |
| `red` | `#D43441` | Acento, barra superior do símbolo | [extraído] |
| `sky` | `#5B9BDD` | Triângulo do símbolo, último "c", dados secundários | [extraído] |
| `canvas` | `#FAFAFA` | Fundo padrão | [extraído] |
| `wash` | `#EFF1F4` | Preenchimento da colina (topo), superfícies suaves | [extraído] |
| `wave-blue` | `#D1DEE6` | Linha principal da onda, bordas leves | [extraído] |
| `wave-gray` | `#DEE0E3` | Segunda linha, `--sm-line` (bordas) | [extraído] |
| `wave-faint` | `#EDEEEF` | Terceira linha, quase invisível | [extraído] |
| `white` | `#FFFFFF` | Cards sobre o canvas | [proposto] |
| `navy-900` | `#1B1D4D` | Hover do primário | [proposto] |
| `navy-600` | `#4A4C8F` | Texto secundário | [proposto] |
| `sky-600` | `#3F7FC4` | Foco, ícones | [proposto] |
| `sky-100` | `#E1EDF9` | Tags, fundo informativo | [proposto] |
| `red-700` | `#B52633` | Vermelho em texto pequeno | [proposto] |

**Contraste sobre `#FAFAFA`:** navy 11,6:1 ✅ · navy-600 7,4:1 ✅ · red-700 6,1:1 ✅ · red 4,6:1 ✅ (AA) · sky-600 4,0:1 (só texto grande) · **sky 2,8:1 ❌** (nunca para texto).

Regras:
- Texto corrido: navy sobre canvas ou branco. Secundário: navy-600.
- As cores das ondas **não são para texto nem ícones**: só decoração e bordas.
- **Gradiente e transparência**: permitidos **somente** no fundo de ondas (preenchimento da colina). Nunca em botões, cards, logo ou gráficos.
- Fundo escuro: navy com `logo-on-navy`. [proposto]

## 3. Tipografia

Igual ao Observatório: **Lexend** (`assets/fonts`, licença OFL). Light e ExtraBold [extraídos]; 400–700 [propostos].

**Assinatura do descritivo [extraído]**, caixa-alta, **alinhado à direita**, em duas linhas:

> SISTEMA DE MAPEAMENTO
> DE **COMPETÊNCIAS CIENTÍFICAS**

Light nas palavras de ligação, ExtraBold nas palavras-chave. Replique o padrão em eyebrows e rodapés (`.sm-eyebrow` + `<b>`). A linha 2 é mais longa que a 1 e define a largura do descritivo; a borda direita das duas coincide com a borda direita do "Simcc".

Escala [proposta]: H1 clamp(2.25–3.75rem)/800/1.1 · H2 clamp(1.75–2.5rem)/800 · H3 1.25rem/800 · Corpo 1rem/300 (use 400 em texto longo) · Eyebrow 0.9375rem caixa-alta · Botão 1rem/800.

## 4. Logo

Em `assets/logo/` (SVG e PNG; versões sobre claro e sobre navy):

| Arquivo | Uso |
|---|---|
| `logo-primary` | Capas, login, slides, rodapés grandes. Com descritivo. |
| `logo-compact` | Cabeçalho do app e tamanhos pequenos (símbolo + "Simcc", sem descritivo). |
| `symbol` | Favicon, avatar, ícone de app. Só as barras e o triângulo. |
| `*-on-navy` | Versões para fundo navy (texto/barra azul-marinho viram branco). |

Anatomia [extraído]:
- **Símbolo**: duas barras horizontais de cantos arredondados, uma **vermelha** (em cima) e uma **navy** (embaixo, deslocada para a esquerda), cortadas na diagonal à direita, e um **triângulo azul-céu** (pico) que invade o "S". O triângulo é "mordido" pelo contorno do S, com um respiro de ~8px.
- **Nome**: "Simcc" em geométrica pesada e arredondada. **"Simc" em navy e o último "c" em azul-céu.** Nunca recolorir.
- Na capa, o conjunto fica **centralizado exatamente** na página (centro ≈ 960×537 em 1920×1080), ocupando ≈ **30% da largura**.
- Área de respeito [proposto]: pelo menos a altura do "S" em todos os lados.
- Mínimos [propostos]: lockup 200px de largura · compacto 110px · símbolo 24px.
- Nunca: girar, esticar, recolorir, adicionar sombra/contorno, separar o último "c", trocar a fonte, colocar sobre fotos ou sobre linhas de onda de alto contraste. O logo pode ficar sobre o fundo de ondas (como na capa), pois elas têm contraste muito baixo.

## 5. O fundo de ondas

Arquivos em `assets/waves/`:
- `waves-cover.svg`: página inteira 1920×1080, com o fundo `#FAFAFA` incluso. Vetorização fiel da capa.
- `waves.svg`: as mesmas ondas, **transparentes**, proporção 1822×710, para usar como `background` de hero ou seção sobre `#FAFAFA`.
- `waves-cover.png`: render do fundo original (referência de fidelidade).

Anatomia [extraído]:
- **Três linhas** de ~7px (a 1822px de largura) que atravessam a página de ponta a ponta: azul-acinzentada `#D1DEE6` (a principal), cinza `#DEE0E3` e uma quase invisível `#EDEEEF`.
- A linha azul desenha uma **colina com topo plano** no centro-direita; as outras cruzam por dentro dela com curvas diferentes. Nada tem cantos: tudo é curva suave.
- **Preenchimento**: abaixo da linha azul há um véu `#EFF1F4` que **se dissolve em `#FAFAFA` para baixo**. É o único gradiente da marca.
- Ocupa uma **faixa horizontal no meio da página** (~30% a ~80% da altura). Topo e base ficam lisos.
- **Sangra pelas laterais**, nunca termina dentro da página.

Uso:
- Capa, hero, login, estados vazios, divisores de seção grandes.
- Telas densas (tabelas, formulários, dashboards): **fundo liso** `#FAFAFA` ou branco, sem ondas.
- Não recolorir, não aumentar contraste/espessura, não animar com movimento rápido. Se animar, deslocamento horizontal muito lento (≥ 60s) [proposto].
- Não misturar com as faixas saturadas do Observatório na mesma tela.

## 6. Composição

- Canvas off-white + **um bloco centralizado** (logo, ou título + busca) + ondas ao fundo.
- A capa é **simétrica** (centrada). Diferente do Observatório, aqui centralizar é correto.
- Muito espaço em branco; uma ideia por tela; um CTA primário por seção.
- Container máx. 1200px; gutters `clamp(20px,4vw,64px)`; seções com `padding-block: clamp(48px,8vw,112px)`.

## 7. Componentes [propostos, derivados da capa]

Em `tokens/simcc.css` (prefixo `sm-`). Veja `examples/platform-shell.html`.

- **Busca** (ação central de um sistema de mapeamento): campo branco, borda navy 2px, botão navy ExtraBold à direita (`.sm-search`).
- **Botão**: primário navy; secundário contorno navy. Raio 4px.
- **Card**: branco sobre canvas, borda `wave-gray` 1px, raio 8px, **sem sombra**. Variante com **filete vermelho de 4px no topo** (`.sm-card--accent`), eco da barra vermelha do símbolo.
- **Tag/competência**: pílula `sky-100` com texto navy em caixa-alta; versão forte navy/branco para a competência principal.
- **Cabeçalho**: branco, `logo-compact` (≈36px de altura), navegação 600, item ativo com sublinhado vermelho 3px.
- **Tabela**: cabeçalho ExtraBold com linha navy 2px, linhas com borda `wave-gray`.
- **Foco**: contorno 3px `sky-600`.
- **Sombra**: nenhuma. Separe por borda ou por contraste canvas/branco.

## 8. Dados e gráficos [propostos]

Ordem das séries: `navy → sky → red → navy-600 → sky-600 → red-700`. Chapados, sem borda; ≤ 6 séries; rótulos diretos; grade em `wave-gray`. Para grafos/redes de competências, nós em navy/sky/red e arestas em `wave-blue`.

## 9. Faça / não faça

**Faça**: canvas `#FAFAFA` · logo centralizado e grande na capa · ondas só em hero/capa · cor concentrada no logo · caixa-alta Light + ExtraBold · descritivo alinhado à direita · muito ar.

**Não faça**: faixas saturadas do Observatório · gradientes em UI · sombras · ondas atrás de tabelas/formulários · texto sky · recolorir o logo · separar o último "c" · fundo branco puro na capa · ilustrações genéricas de "IA/cérebro/circuitos".

## 10. Checklist antes de entregar

- [ ] É Simcc? Então fundo `#FAFAFA` e ondas (não faixas).
- [ ] Logo de `assets/logo`, com "c" azul e área de respeito?
- [ ] Ondas só de `assets/waves`, só em hero/capa?
- [ ] Gradiente só no fundo de ondas?
- [ ] Lexend 300/800 carregada?
- [ ] Texto ≥ 4,5:1 (navy / navy-600 / red-700)?
- [ ] Sem sombras? Um CTA primário por seção?

## 11. O que esta página **não** define

Espaçamento, componentes, estados, modo escuro, gráficos, ícones, movimento, fotos e voz. Foram propostos aqui a partir da capa. Um manual de marca completo, se existir, prevalece sobre o que está marcado [proposto]. As ondas foram vetorizadas por traçado a partir de uma imagem raster embutida no PDF; são equivalentes visualmente (conferido por sobreposição), não o desenho original do designer.
