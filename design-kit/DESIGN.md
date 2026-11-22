# Simcc Design Kit: área pública

Guia de referência para a reestruturação das telas públicas do Simcc (Observatório de CT&I da Bahia).
O objetivo é **manter a estética que já existe** (moldura neutra, azul `eng-blue`, tipografia Lexend, cards brancos sem sombra, cores semânticas fortes) e torná-la **uniforme entre telas**.

> Escopo: rotas do `SearchLayout` e do `DocsLayout` (home, resultados, pesquisador, instituições, pós-graduação, grupos, indicadores, institutos, listagens, docs…).
> Fora do escopo: o Console administrativo (`/console/*`). No legado ele usava tokens próprios `sm-*` (navy/sky/red); o console novo é uma tarefa do roadmap (`docs/roadmap.md`), que decide se adota este kit. O kit público usa `--sc-*` / classes `sc-*` / cores `brand`, `search`, `area`, `prod`, `qualis`…

## Conteúdo do kit

```
design-kit/
├── DESIGN.md                ← este guia (regras)
├── AGENT_PROMPT.md          ← prompt pronto para agentes que forem refatorar telas
├── index.html               ← vitrine: links para as páginas de exemplo
├── tokens/
│   ├── tokens.json          ← fonte de verdade dos tokens (formato W3C Design Tokens)
│   ├── simcc.css            ← tokens CSS (--sc-*, gerados) + classes de componente (sc-*)
│   └── tailwind.css         ← tema Tailwind 4 (@theme) com os dicionários semânticos (gerado)
├── assets/
│   ├── logo/                ← simcc.svg, simcc-white.svg, simbolo.svg, observatorio.svg, governo-bahia-secti.png
│   ├── backgrounds/         ← ilustrações de fundo (home, graduate, indicadores, researcher)
│   ├── icons/lucide-sprite.svg ← sprite com os ícones lucide usados na plataforma
│   └── fonts/README.md
├── reference/
│   ├── components.md        ← anatomia + receita Tailwind de cada componente
│   ├── icons.md             ← mapa de ícones (conceito → lucide) e migração phosphor → lucide
│   ├── packages.md          ← pacotes essenciais × substituíveis
│   ├── screens.md           ← inventário de telas públicas → template de página
│   └── build-assets.mjs     ← regenera logos e o sprite de ícones
└── examples/                ← 3 páginas estáticas construídas só com o kit
    ├── home.html  ├── resultados.html  ├── pesquisador.html  └── kit.js
```

Para ver as páginas:

```bash
python3 -m http.server 8765 -d design-kit
```

Depois abra `http://localhost:8765/`.

### Mudar um token

Edite só `tokens/tokens.json` e rode:

```bash
npm run tokens         # regenera tokens/tailwind.css e o bloco :root/.dark de tokens/simcc.css
npm run tokens:check   # falha se os arquivos gerados não batem com tokens.json (roda na CI)
```

O script (`scripts/tokens.mjs`) reescreve `tailwind.css` inteiro e, em `simcc.css`, só o trecho entre `/* @tokens:inicio */` e `/* @tokens:fim */`; as classes `sc-*` continuam escritas à mão. Os nomes das variáveis (`--color-*`, `--sc-*`) ficam no script: um token novo num dicionário existente (área, produção, Qualis…) entra sozinho nos dois arquivos; um grupo novo precisa ser listado lá.

### Uso no app (Tailwind 4)

O app importa o tema em `src/app/styles.css`:

```css
@import 'tailwindcss';
@import '../../design-kit/tokens/tailwind.css';
```

O mesmo arquivo faz a ponte entre as variáveis do shadcn (`--primary`, `--border`, `--background`…) e os papéis da §2.1. Para importar arquivos do kit em TypeScript, use o alias `@kit/` (ex.: `@kit/assets/logo/simcc.svg`, `@kit/tokens/tokens.json`).

Algumas receitas deste guia e de `reference/components.md` foram escritas com nomes do Tailwind 3. Ao aplicar, traduza:

| Tailwind 3 | Tailwind 4 |
|---|---|
| `shadow-sm` / `shadow` | `shadow-xs` / `shadow-sm` |
| `rounded-sm` / `rounded` | `rounded-xs` / `rounded-sm` |
| `ring` (3px) | `ring-3` (`ring` agora tem 1px) |
| `outline-none` | `outline-hidden` |
| `bg-opacity-50`, `text-opacity-*` | `bg-black/50`, `text-white/80` |
| borda padrão `gray-200` | borda padrão `currentColor`: o app define `border-border` na camada base |

`rounded-md`, `rounded-lg`, `rounded-xl` e as cores do kit não mudam.

---

## 1. Princípios

1. **Moldura neutra, conteúdo em branco.** Topbar e sidebar ficam sobre `neutral-100`; o conteúdo vive num painel `neutral-50` arredondado (12px) com borda; os blocos são cards brancos com borda `neutral-200`. **Sem sombras** em cards: a profundidade vem do contraste entre os três níveis de cinza.
2. **Um azul para agir.** `eng-blue #559FB8` é a única cor de ação genérica: botão primário, item de menu ativo, tab de visão ativa, destaque de hero. Hover sempre `eng-dark-blue #024A60`.
3. **A cor carrega significado.** Fora o azul de ação, toda cor saturada vem de um dicionário: tipo de busca, grande área, tipo de produção, Qualis, orientação, status, bolsa. Não invente cor; consulte `tokens.json`.
4. **Lexend em tudo.** Pesos 300 (lead), 400 (corpo), 500 (rótulos/títulos de card), 600 (títulos de página e seção), 700 (KPIs, hero, badges).
5. **Densidade de painel de dados.** Corpo de UI em 14px, metadados em 12px, controles de 32–40px de altura.
6. **Mesma tela, mesma ordem.** Toda página de listagem segue: cabeçalho, busca, toolbar, KPIs, seções colapsáveis (ver §6).

## 2. Cor

### 2.1 Papéis (tema claro / escuro)

| Papel | Token CSS | Tailwind (claro) | Claro | Escuro |
|---|---|---|---|---|
| Moldura (topbar, sidebar) | `--sc-frame` | `bg-neutral-100` | `#F5F5F5` | `#000000` |
| Painel de conteúdo | `--sc-panel` | `bg-neutral-50` | `#FAFAFA` | `#171717` |
| Superfície (card, input) | `--sc-surface` | `bg-white` | `#FFFFFF` | `#0A0A0A` |
| Superfície suave (tabs, chips, pill) | `--sc-surface-muted` | `bg-neutral-100` | `#F5F5F5` | `#262626` |
| Hover de item | `--sc-surface-hover` | `hover:bg-neutral-200` | `#E5E5E5` | `#262626` |
| Borda | `--sc-border` | `border-neutral-200` | `#E5E5E5` | `#262626` |
| Texto | `--sc-text` | `text-neutral-900` | `#171717` | `#FAFAFA` |
| Texto secundário | `--sc-text-muted` | `text-neutral-500` | `#737373` | `#A3A3A3` |
| Título do hero central | `--sc-text-strong` | `text-slate-800` | `#1E293B` | `#FAFAFA` |
| Bloco de carregamento | `--sc-loading` | `bg-slate-300` | `#CBD5E1` | `#404040` |

O tema escuro é aplicado pela classe `.dark` no `<html>` (no app, por `src/shared/lib/theme.ts`; preferência claro/escuro/sistema salva no navegador).

### 2.2 Marca

| Token | Hex | Uso |
|---|---|---|
| `brand` / `eng-blue` | `#559FB8` | ação primária, nav ativa, `sc-mark` no hero, avatar fallback |
| `brand-strong` / `eng-dark-blue` | `#024A60` | hover/pressed |
| `brand-soft` | `#E3F0F4` | fundo de `sc-tag` (contadores) |
| `brand-teal` | `#00757A` | sublinhado do hero da home (`sc-underline`) |
| `brand-wine` | `#9C1F2E` | ênfase final do hero da home (`sc-emphasis`) |
| `deco` / `deco-soft` | `#C8D7E1` / `#E1EAF0` | formas dos fundos ilustrados |
| logo | `#174EA6`, `#1A73E8`, `#ED1C24` | apenas dentro dos SVGs de logo |

### 2.3 Dicionários semânticos (não alterar valores)

Todos estão em `tokens.json`, como variável `--sc-*` e como cor Tailwind no tema (`tokens/tailwind.css`).

**Tipo de busca** (`search-*`, `--sc-type-*`): swatch do seletor, chip de termo, botão de buscar, ranking, badge de evidências.

| profile | article | book | patent | software | speaker | area | name | abstract | maria |
|---|---|---|---|---|---|---|---|---|---|
| `#1D4ED8` | `#3B82F6` | `#EC4899` | `#06B6D4` | `#0D9488` | `#F97316` | `#22C55E` | `#EF4444` | `#EAB308` | `#559FB8` |

**Grande área** (`area-*`): Agrárias `#F87171` · Exatas e da Terra `#4ADE80` · Saúde `#20BDBE` · Humanas `#F5831F` · Biológicas `#EB008B` · Engenharias `#FCB712` · Sociais Aplicadas `#009245` · Linguística, Letras e Artes `#A67C52` · Outros `#1B1464`.

**Produção** (`prod-*`): Artigo `#5F82ED` · Livro+capítulo `#D15697` · Livro `#792F4C` · Capítulo `#DBAFD0` · Patente `#66B4D0` · Software `#096670` · Marca `#1B1464` · Relatório técnico `#662D91` · Congresso/Evento `#FF5800` · Simpósio `#D53A2C` · Seminário `#FFBD7B` · Oficina `#FCEE21` · Texto em jornal ou revista `#E9A700` · Trabalho em evento `#DE2834`.

**Qualis** (`qualis-*`): A1 `#34663C` · A2 `#9DC356` · A3 `#B1C38A` · A4 `#BEC4B3` · B1 `#D56438` · B2 `#DD883D` · B3 `#E3B081` · B4 `#E3AC96` · C `#CE3830` · SQ `#4A1314` (também "Sem estrato", `not_rated`).

**Orientação** (`orient-*`): IC `#8BFBD3` · Mestrado `#67A896` · Doutorado `#425450` · TCC `#77D2B6` · Outra natureza `#577E74` · Monografia `#2F7F7C` · Pós-doc `#46724B`.

**Status**: Concluída `#6BC26B` · Em andamento `#DBB540`. **Bolsas**: PQ `#00D000` · DT `#183EFF`. **Gênero**: F `#D15697` · M `#5F82ED`. **Escala neutra para gráficos**: `#213E59 → #98A8BA` (6 passos).

A página `/dicionario-cores` é a documentação pública desses dicionários. Ela deve ler de `tokens.json`, e não manter uma cópia própria.

### 2.4 Regras de cor

- Texto sobre cor de dicionário é **branco e bold** (badge sólido). Para cores claras (`area-exatas`, `qualis-A3/A4`, `prod-capitulo`, `orient-ic`, `prod-oficina`, `prod-texto-revista`) prefira usá-las como **marcador** (`sc-dot`, borda esquerda, barra) e não como fundo de texto.
- Não use hex literal em componente (`bg-[#20BDBE]`). Use a classe do tema (`bg-area-saude`) ou uma função de mapeamento única (ver `reference/components.md` §Mapeamentos).
- Gráficos: série única usa a cor do dicionário correspondente; série sem semântica usa `chart-neutral-1…6`; nunca a paleta padrão do Recharts/Highcharts.

## 3. Tipografia

Família única: **Lexend** (Google Fonts, `wght 100..900`). Remover o carregamento de **Ubuntu** do `index.html`, que não é usado pelo Tailwind (`fontFamily.sans = Lexend`).

| Papel | Tamanho | Peso | Extra | Tailwind |
|---|---|---|---|---|
| Hero de página | 30 → 48px | 700 | `leading-[1.1] tracking-tighter` | `text-3xl md:text-5xl font-bold` |
| Hero central (home) | 30 → 42px | 500 | `leading-[1.5] tracking-tight` | `text-3xl md:text-[2.6rem] font-medium text-slate-800` |
| Lead do hero | 18px | 300 | — | `text-lg font-light` |
| Nome no perfil | 30px | 600 | `tracking-tight` | `text-3xl font-semibold` |
| Título de página | 20px | 600 | `tracking-tight` | `text-xl font-semibold` |
| Título de coluna lateral | 24px | 600 | — | `text-2xl font-semibold` |
| Título de seção | 16px | 500 | ícone 20px à esquerda | `text-base font-medium` |
| Título de card / rótulo | 14px | 500 | — | `text-sm font-medium` |
| KPI | 24px | 700 | — | `text-2xl font-bold` |
| Corpo de UI | 14px | 400 | — | `text-sm` |
| Metadado / legenda | 12px | 400 | `text-neutral-500` | `text-xs text-muted-foreground` |
| Badge | 12px | 700 | `uppercase` p/ áreas | `text-xs font-bold` |
| Micro (kbd, eyebrow) | 10px | 500 | `uppercase tracking-wider` p/ eyebrow | `text-[10px]` |

Título de produção (artigo etc.) fica **em caixa alta** (`uppercase`), como nos dados do Lattes; o veículo (periódico) fica acima, em `font-semibold`.

## 4. Espaço, raio, elevação, movimento

- **Espaço**: base 4px. Gaps usuais: 8 (dentro de controles), 12–16 (entre cards), 24 (entre seções), 32 (gutter lateral da página; 16 no mobile).
- **Raio**: `rounded-md` 6px em **todos os controles** (botão, input, chip, badge, tab de visão, item de menu). `rounded-lg` 8px em cards. `rounded-xl` 12px só no painel de conteúdo. `rounded-full` só em `sc-tag` contador, dots e avatar pequeno.
- **Elevação**: plana. Sombra apenas em tab segmentada ativa (`shadow-xs`), avatar de perfil (`shadow-md`) e sobreposições (popover, dropdown, dialog: `shadow-lg`).
- **Movimento**: `transition-colors` 150ms `ease`. Acordeões usam as animações `accordion-down/up` já existentes. Hover de foto de pesquisador: `scale(1.04)` 300ms. Respeitar `prefers-reduced-motion`.

## 5. Ícones

- **Biblioteca única: `lucide-react`** (já é a mais usada, 155 arquivos). Tamanho padrão **16px** (`h-4 w-4`), 12px em metadados, 20px em cabeçalho de seção, `stroke-width` 2 padrão.
- Ícone de cabeçalho de card/KPI: canto superior direito, `text-muted-foreground`.
- Ícone sempre **antes** do texto no botão (exceto `ArrowRight`/`ChevronDown`, que vão depois).
- Botão só com ícone exige `aria-label`.
- O mapa conceito → ícone está em [`reference/icons.md`](reference/icons.md). **Um conceito, um ícone**: “Instituição” é sempre `Building2`, “Pós-graduação” sempre `GraduationCap`, “Baixar” sempre `Download`, e assim por diante.
- `phosphor-react` (114 arquivos), `@phosphor-icons/react` (1) e `@tabler/icons-react` (1) devem migrar para lucide; a tabela de equivalência também está em `icons.md`.

## 6. Layout

### 6.1 Moldura (`SearchLayout` / `DocsLayout`)

```
┌──────────────┬───────────────────────────────────────────────────────┐
│ Sidebar 16rem│ Topbar 40px: logo │ Gov BA │ [Observatório]   [☀][Entrar] │
│ bg-neutral-100├───────────────────────────────────────────────────────┤
│              │ ╭ Painel bg-neutral-50, border, rounded-xl ──────────╮ │
│ Acesso rápido│ │ Crumbbar 68px sticky, blur: [▣] │ Início > Página   │ │
│ Plataforma   │ │                                                     │ │
│  ▸ grupos    │ │   conteúdo (padding 32px)                           │ │
│              │ ╰─────────────────────────────────────────────────────╯ │
└──────────────┴───────────────────────────────────────────────────────┘
```

- Sidebar colapsável para ícones (3rem) e oculta no mobile (sheet).
- Item ativo: `bg-eng-blue text-white hover:bg-eng-dark-blue`. Inativo: `hover:bg-neutral-200`.
- Crumbbar: `sticky top-0 z-[3] backdrop-blur bg-neutral-50/60`, com o `SidebarTrigger`, um separador vertical e o breadcrumb. Os segmentos exibidos devem usar o **nome legível** da página (“Pós-graduação”, não “Pos-Graduacao”).

### 6.2 Templates de página

| Template | Ordem dos blocos | Telas |
|---|---|---|
| **A. Hero de busca** | pill “Saiba como…”, hero central, barra de busca, palavras sugeridas, (opcional) panorama | Home |
| **B. Landing de seção** | hero à esquerda com `sc-mark` + fundo ilustrado à direita, lead, atalhos em card | Indicadores, Pós-graduação (mapa à direita), Institutos |
| **C. Listagem** | page header (voltar + título), campo de busca, toolbar (Baixar resultado · Filtros · colapsar), card de total, seções colapsáveis com grade/lista | Instituições, Grupos, Pós-graduação (lista), Listagens |
| **D. Resultados** | coluna de filtros 260px + coluna principal: busca fixa, tabs de visão, toolbar, card total (com fundo ilustrado), 3 KPIs, ranking, grade de pesquisadores | /resultados, /resultados-perfil |
| **E. Perfil** | card de cabeçalho com avatar sobreposto, badges, resumo; tabs de produção + filtros + gráfico + cards de produção; coluna lateral 320px com informações gerais | Pesquisador, Instituição/Programa (detalhe) |
| **F. Documento** | título, card de introdução, conteúdo em cards | Termos, Privacidade, API, Dicionário de cores, Vídeos |

Larguras: o conteúdo ocupa toda a largura do painel; hero e home limitam o texto a `max-w-[800px]` e a busca a `~860px`; perfis usam grade `1fr 320px`.

### 6.3 Responsivo

Breakpoints do projeto: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1920`.
- `< lg`: sidebar só com ícones; colunas laterais (filtros, coluna do perfil) passam para cima ou para baixo do conteúdo; o fundo ilustrado do hero fica atrás do texto com opacidade reduzida.
- `< md`: sidebar vira sheet, painel sem raio, gutter 16px, Gov BA some da topbar, a busca quebra em duas linhas (tipo + botão / input).
- Sem rolagem horizontal da página; tabs longas rolam dentro do próprio container.

## 7. Componentes

Resumo do catálogo (a anatomia e as receitas Tailwind estão em [`reference/components.md`](reference/components.md); a classe CSS equivalente está em `tokens/simcc.css`):

| Componente | Classe kit | Base React |
|---|---|---|
| Botão (primary, outline, secondary, ghost, danger; sm/default/lg/icon) | `sc-btn` | `ui/button.tsx` |
| Botão de tipo de busca | `sc-btn--type` | `Button` + `getSearchTypeButtonColor` |
| Barra de busca | `sc-searchbar` | `search/search.tsx` |
| Campo de busca de lista | `sc-search-field` | `Input` + `Search` icon |
| Chip de termo | `sc-chip` | badge do termo selecionado |
| Palavra sugerida | `sc-word` | home |
| Link-pílula “Saiba como…” | `sc-pill-link` | home, indicadores, pós |
| Destaques de hero | `sc-mark`, `sc-underline`, `sc-emphasis` | — |
| Card / KPI | `sc-card`, `sc-stat__*` | `ui/card.tsx` |
| Seção colapsável | `sc-section` | `Accordion`/estado local |
| Toolbar de resultado | `sc-toolbar` | — |
| Badge sólido / tag suave / dot | `sc-badge`, `sc-tag`, `sc-dot` | `ui/badge.tsx` |
| Ranking de ocorrências | `sc-rank` | — |
| Tabs segmentadas | `sc-tabs` | `ui/tabs.tsx` |
| Tabs de visão | `sc-viewtabs` | — |
| Alternância grade/lista | `sc-toggle` | `ToggleGroup` |
| Filtros (acordeão + checkbox) | `sc-filters`, `sc-accordion__*`, `sc-option` | `Accordion` + `Checkbox` |
| Card de pesquisador (foto) | `sc-person` | `researchers-home` |
| Card de produção | `sc-prod` | `articles-home` |
| Card de entidade | `sc-entity` | instituições, programas, grupos |
| Avatar | `sc-avatar` | `ui/avatar.tsx` |
| Tabela | `sc-table` | `ui/table.tsx` + `data-table.tsx` |
| Barras / colunas simples | `sc-bars`, `sc-columns` | Recharts |
| Carregamento | `sc-loading`, `sc-skeleton`, `sc-spinner` | `ui/skeleton.tsx` |
| Vazio / alerta | `sc-empty`, `sc-alert` | `ui/alert.tsx` |

## 8. Conteúdo e microcopy

- Português do Brasil, frases curtas, sentence case (“Baixar resultado”, “Pesquisadores com mais ocorrências”). Caixa alta só em badges de grande área e eyebrows.
- Legenda de KPI sempre explica o recorte: “com pesquisadores no resultado”, “encontrados na busca”.
- Carregamento: título “Processando sua solicitação...” e legenda “Buscando resultados, aguarde um instante”.
- Números com separador de milhar (`toLocaleString('pt-BR')`).

## 9. Acessibilidade

- Contraste: texto `neutral-500` sobre `neutral-50` só para metadados ≥12px; corpo usa `neutral-900`.
- Foco visível: anel 2px `eng-blue` (`focus-visible:ring-2 ring-eng-blue`).
- Toda cor de dicionário vem acompanhada de texto (rótulo, legenda ou tooltip); nunca só cor.
- Ícone sozinho tem `aria-label`; ícone decorativo tem `aria-hidden`.
- Tabs com `role="tab"`/`aria-selected`; toggles com `aria-pressed`; breadcrumb com `aria-current="page"`.

## 10. Do / Don’t

| Faça | Evite |
|---|---|
| `bg-eng-blue hover:bg-eng-dark-blue` para ação | `bg-blue-500`, `#006699`, `#07677E` como cor de ação |
| `rounded-md` em controles, `rounded-lg` em cards | misturar `rounded`, `rounded-sm`, `rounded-xl` em controles |
| Card com `border` e sem sombra | `shadow-sm`/`shadow-md` em cards de conteúdo |
| `bg-area-saude` / `areaColor(area)` | cadeias de ternário com hex inline |
| Ícone lucide do mapa | ícone phosphor/tabler, ou ícone diferente para o mesmo conceito |
| `text-neutral-*` | misturar `gray-*`, `slate-*`, `zinc-*` para o mesmo papel |
| Spinner `border-eng-blue` | spinner `#006699` (fallback atual dos layouts) |
