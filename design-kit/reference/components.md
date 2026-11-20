# Componentes: anatomia e receitas

Cada componente lista: **quando usar**, **anatomia**, a **receita Tailwind** para o código React e a **classe do kit** (`tokens/simcc.css`) usada nas páginas de exemplo. As receitas partem dos primitivos shadcn em `src/components/ui/` e mudam apenas o necessário.

Convenções: `muted` = `text-neutral-500 dark:text-neutral-400`; `border` = `border-neutral-200 dark:border-neutral-800`.

---

## Moldura

### Sidebar: `sc-sidebar`, `sc-nav-*`
- Base: `ui/sidebar.tsx` + `nav-projects.tsx` (Acesso rápido) + `nav-main.tsx` (grupos colapsáveis).
- Item: `h-8 px-2 gap-2 rounded-md text-sm`, ícone 16px.
- Ativo: `bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white`.
- Inativo: `hover:bg-neutral-200 dark:hover:bg-neutral-800`.
- Subitens: recuo com linha guia `border-l border-neutral-200 ml-3.5 pl-2.5`.
- Rótulos de grupo (“Acesso rápido”, “Plataforma”): `text-xs font-medium muted h-8 px-2`.
- **Regra:** o estado ativo vem de uma função única `isActive(url, pathname)` (inclui subrotas, ex.: `/instituicao/ufba` ativa “Instituições”). Hoje cada nav compara `url == pathname` manualmente.

### Topbar: `sc-topbar`
`h-10 px-2 flex items-center justify-between bg-neutral-100 dark:bg-black`.
Esquerda: logo Simcc (18px de altura), separador vertical `h-6 bg-slate-300`, logo Gov BA (`h-9 sm:h-[50px]`), separador e botão outline “Observatório”. Direita: Console (só autenticado), tema, Entrar/Avatar. Botões: `variant="outline" size="sm" className="h-8 px-2.5 text-xs font-medium"`.

### Crumbbar: `sc-crumbbar`
`sticky top-0 z-[3] h-[68px] flex items-center p-8 pt-8 pb-2 bg-neutral-50/60 dark:bg-neutral-900/60 backdrop-blur`.
`SidebarTrigger`, depois `Separator orientation="vertical" className="mr-2 h-4"` e o `Breadcrumb`. O último segmento é texto, não link.

### Painel: `sc-panel`
`bg-neutral-50 dark:bg-neutral-900 md:border md:rounded-xl overflow-y-auto` (já é o `SidebarInset`).

---

## Cabeçalhos

### Page header (template C)
```tsx
<div className="flex items-center gap-4">
  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigate(-1)} aria-label="Voltar">
    <ChevronLeft className="h-4 w-4" />
  </Button>
  <h1 className="flex-1 text-xl font-semibold tracking-tight">Instituições</h1>
  <div className="ml-auto flex gap-2">{/* ações */}</div>
</div>
```

### Hero de seção (template B): `sc-hero sc-hero--pattern`
```tsx
<section className="relative isolate flex flex-col gap-4 py-12">
  <img src={bg} alt="" className="absolute right-0 top-0 -z-10 h-full w-[62%] object-cover object-right-top dark:opacity-10" />
  <PillLink to="/informacoes">Saiba o que é e como utilizar a plataforma</PillLink>
  <h1 className="max-w-[800px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
    Confira as <strong className="rounded-md bg-eng-blue px-3 pb-2 font-medium text-white">estatísticas</strong> de produção do observatório
  </h1>
  <p className="max-w-[750px] text-lg font-light">…</p>
</section>
```
Fundo por contexto: `bg_indicadores` (indicadores), `bg_graduate` (pós-graduação, institutos, observatório), `bg_home` (docs, erros, vídeos), `bg_researcher` (card de total nos resultados).

### Hero central (template A)
`text-center text-3xl md:text-[2.6rem] font-medium text-slate-800 leading-snug lg:leading-[1.5] tracking-tight`.
Destaques: `sc-underline` = `text-[#00757a] font-semibold border-b-2 border-[#00757a] pb-1` (preset: `text-brand-teal border-brand-teal`); `sc-emphasis` = `text-brand-wine font-semibold`.

### Link-pílula: `sc-pill-link`
`inline-flex items-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 px-3 py-1 text-sm font-medium`, com `Info` 12px, divisor `h-full w-px bg-neutral-200` e `ArrowRight` 12px. Extrair para `components/ui/pill-link.tsx`: hoje está duplicado em várias páginas.

---

## Ações

### Botão: `sc-btn`
Mantém `ui/button.tsx` (`rounded-md text-sm font-medium`, alturas `h-10` / `sm h-9` / `lg h-11` / `icon h-10 w-10`).

| Variante | Uso | Classes |
|---|---|---|
| `default` | ação primária | `bg-eng-blue text-white hover:bg-eng-dark-blue` |
| `outline` | ações de topbar, seletores | `border bg-white hover:bg-neutral-100` |
| `secondary` | ação neutra | `bg-neutral-100 hover:bg-neutral-100/80` |
| `ghost` | toolbar (“Baixar resultado”, “Filtros”, colapsar) | `hover:bg-neutral-100` |
| `destructive` | excluir | `bg-red-500` |
| tipo de busca | submit da busca | `text-white` + `bg-search-{type}` |

Na toolbar use `size="sm"` com ícone 14–16px. Ícone de colapsar: `ChevronUp` (aberto) / `ChevronDown` (fechado).

---

## Busca

### Barra de busca principal: `sc-searchbar`
Anatomia: `[■ Perfil do pesquisador ⌄] [chip termo ×] [Buscar...        ] [🗑] [🔍]`
- Container: `Alert`-like `h-14 p-2 flex items-center gap-2 rounded-lg border bg-white`.
- Seletor de tipo: botão outline com **swatch 14px** `rounded-[2px] bg-search-{type}`.
- Chip de termo: `h-10 px-4 rounded-md text-xs text-white capitalize bg-search-{type}`. Na barra fixa de resultados use `h-7 px-2.5`.
- Input: sem borda (`border-0 flex-1`), placeholder “Buscar...”.
- Limpar: `Button ghost size="icon"` com `Trash2`.
- Buscar: `Button size="icon"` com `Search` e `bg-search-{type}`.

### Campo de busca de lista: `sc-search-field`
`h-[52px] flex items-center gap-3 px-4 rounded-lg border bg-white`, ícone `Search` muted, placeholder “Pesquisar”.

### Palavra sugerida: `sc-word`
`h-8 px-3 rounded-md bg-neutral-100 hover:bg-neutral-200 text-xs capitalize cursor-pointer`.

---

## Superfícies

### Card: `sc-card`
`rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950`. **Remover `shadow-sm` do `ui/card.tsx`**: todas as telas atuais anulam ou ignoram a sombra.

### KPI: `sc-card` + `sc-stat__*`
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total de instituições</CardTitle>
    <Building2 className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">12</div>
    <p className="text-xs text-muted-foreground">encontrados na busca</p>
  </CardContent>
</Card>
```
Carregando: `Skeleton className="h-7 w-20"` no lugar do número. Grade: `grid gap-4 md:grid-cols-3`.
Card de total dos resultados: mesmo card + fundo `bg_researcher` à direita + chip do termo + `sc-tag` por tipo de produção.

### Seção colapsável: `sc-section`
```
[icone 20 muted]  Título da seção (text-base font-medium)   [⊟ ⊞] [⌃]
```
Conteúdo abaixo com `gap-4`. Colapsar com `Accordion type="single" collapsible` ou estado local; o ícone alterna `ChevronUp`/`ChevronDown`.

### Toolbar: `sc-toolbar`
Linha `flex justify-between`, ações alinhadas à direita: `Download` “Baixar resultado”, `SlidersHorizontal` “Filtros”, `ChevronUp` colapsar.

---

## Marcadores

### Badge sólido: `sc-badge`
`inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-bold text-white`. Para grande área adicione `uppercase`. Pequeno: `h-5 px-2 text-[10px]`.
Usos: grande área, titulação, cidade, links externos (Orcid `#9DC356`, Scopus `search-speaker`, Lattes `area-outros`, LinkedIn `search-profile`), status (Ativo `green-500`), evidências.

### Tag suave: `sc-tag`
`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-brand-soft text-xs font-medium` + número em `font-bold`. Variante outline (`rounded-md border bg-white`) para métricas do perfil (“Índice H: 17”, “Atualização do Lattes”).

### Dot: `sc-dot`
`h-2.5 w-2.5 rounded-full` com a cor do dicionário; acompanha sempre um rótulo (filtros, Qualis do artigo, natureza da orientação).

### Ranking: `sc-rank`
Chips `rounded-md px-4 py-1.5 font-semibold text-white bg-search-{type}` com `font-size` proporcional à contagem (de 0.75rem a 1.5rem) e o número em `small`.

---

## Navegação interna

### Tabs segmentadas: `sc-tabs` (`ui/tabs.tsx`)
Lista `h-10 rounded-md bg-slate-100 p-1`, trigger `rounded-sm px-3 py-1.5 text-sm font-medium` e ativo `bg-white shadow-sm`. Usar para alternar **conteúdo do mesmo objeto** (tipos de produção do pesquisador). Ícone 14px antes do rótulo. Padronizar em `neutral-*` (hoje `slate-*`).

### Tabs de visão: `sc-viewtabs`
Botões `h-10 px-4 rounded-md bg-neutral-100 text-sm font-medium`, ativo `bg-eng-blue text-white`. Usar para trocar **a visão do resultado** (Pesquisadores / Instituições / Mapa).

### Alternância grade/lista: `sc-toggle`
`ToggleGroup` com dois botões 32px: `Rows3` (lista) e `LayoutGrid` (grade). Ativo `bg-white border`. Substitui `Rows` / `SquaresFour` do phosphor.

### Filtros: `sc-filters`
Título `text-xl font-semibold` com `SlidersHorizontal`; `Accordion type="multiple"`; trigger `text-sm font-semibold py-4`; opções `Checkbox` + (dot) + rótulo + contagem `text-xs muted` à direita. Coluna de 260px, sticky, com rolagem própria; no mobile vai para um `Sheet` aberto pelo botão “Filtros”.

---

## Cards de domínio

### Pesquisador: `sc-person`
Foto em `aspect-[3/4] rounded-lg overflow-hidden`, gradiente `from-black/75 via-black/5 to-black/15` (de baixo para cima), topo com classificação (badge branco 85%) e evidências (badge `bg-search-{type}`), base com nome `text-lg font-medium text-white` e instituição (`Building2` 12px). Hover: imagem `scale-[1.04]`. Sem foto: gradiente slate com `User`.

### Produção: `sc-prod`
`rounded-lg border border-l-[6px] bg-white p-4 flex flex-col gap-3`, borda esquerda `border-l-qualis-{X}` (artigos) ou `border-l-prod-{tipo}` (demais). Veículo `text-sm font-semibold`, título `text-sm uppercase`, meta `text-xs muted` com `Calendar` ano · dot Qualis · `Hash` JCR · `Quote` citações. Grade em colunas (`react-responsive-masonry` só quando as alturas variam muito).

### Entidade: `sc-entity`
Instituição / programa / grupo: card centralizado, logo ou ícone em quadrado 56px com borda, nome `text-base font-semibold`, meta com ícones 12px (`Users` pesquisadores · `GraduationCap` programas · `FlaskConical` grupos).

### Cabeçalho de perfil
Card com avatar 96px `rounded-lg border-4 border-white shadow-md` sobreposto ao topo; barra superior com atualização do Lattes + status (esquerda) e ações `Button size="icon"` (direita); nome `text-3xl font-semibold`; instituição com `Building2`; badges; resumo `text-sm muted text-justify` com o termo buscado em `font-semibold text-search-{type}`; `ChevronDown` para expandir.

---

## Dados

### Tabela: `sc-table` (`ui/table.tsx`, `data-table.tsx`)
Cabeçalho `h-12 px-4 text-left font-medium muted`, células `p-4 border-b`, hover `bg-neutral-100/50`. Números à direita com `tabular-nums`. Dentro de `Card` quando isolada.

### Gráficos
- Biblioteca padrão: **Recharts** via `ui/chart.tsx` (`ChartContainer`). Highcharts só para nuvem de palavras e mapas, até haver substituto.
- Barras com `radius={[3,3,0,0]}`, sem grid vertical, eixo `text-xs muted`, rótulo de valor acima.
- Cor por série: dicionário correspondente; sem semântica, `chart-neutral-*`. Configure `--chart-1…5` no `index.css` (hoje usado em `inital-home.tsx`, mas não definido) apontando para `eng-blue` e a escala neutra.

---

## Estados

| Estado | Receita |
|---|---|
| Carregando bloco | `Skeleton` grande: `bg-slate-300 animate-pulse rounded-md` + `Loader2 h-7 w-7 animate-spin text-slate-500` + “Processando sua solicitação...” / “Buscando resultados, aguarde um instante” |
| Carregando número | `Skeleton h-7 w-20` |
| Carregando página | spinner `h-8 w-8 border-4 border-eng-blue border-t-transparent rounded-full animate-spin` (substitui `#006699`) |
| Vazio | ícone 40px `text-neutral-400`, título `text-base font-semibold`, texto muted, ação opcional |
| Erro | `Alert variant="destructive"` + ação “Tentar novamente” |
| Toast | `sonner`, `richColors position="top-right"` (já configurado) |

---

## Mapeamentos (uma função por dicionário)

Criar `src/lib/design-tokens.ts` e substituir as cadeias de ternário espalhadas (`timeline-researcher.tsx`, `researcher-indicators.tsx`, `Header.tsx`, `filter-sections.tsx`, `applied-filters-badges.tsx`, `facet-registry.ts`, `mapa-home.tsx`, `infinite-moving-cards.tsx`, `listagens/*`):

```ts
import tokens from '../../design-kit/tokens/tokens.json';

const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

const AREA_KEYS: Record<string, keyof typeof AREA_CLASS> = {
  'CIENCIAS AGRARIAS': 'agrarias',
  'CIENCIAS EXATAS E DA TERRA': 'exatas',
  'CIENCIAS DA SAUDE': 'saude',
  'CIENCIAS HUMANAS': 'humanas',
  'CIENCIAS BIOLOGICAS': 'biologicas',
  ENGENHARIAS: 'engenharias',
  'CIENCIAS SOCIAIS APLICADAS': 'sociais',
  'LINGUISTICA LETRAS E ARTES': 'linguistica',
  OUTROS: 'outros',
};

// Classes completas, para o Tailwind encontrar no build
const AREA_CLASS = {
  agrarias: 'bg-area-agrarias', exatas: 'bg-area-exatas', saude: 'bg-area-saude',
  humanas: 'bg-area-humanas', biologicas: 'bg-area-biologicas', engenharias: 'bg-area-engenharias',
  sociais: 'bg-area-sociais', linguistica: 'bg-area-linguistica', outros: 'bg-area-outros',
} as const;

export function areaBg(area: string) {
  const key = Object.entries(AREA_KEYS).find(([k]) => norm(area).includes(k))?.[1];
  return key ? AREA_CLASS[key] : 'bg-neutral-900';
}

export const SEARCH_TYPE_BG = {
  profile: 'bg-search-profile', article: 'bg-search-article', book: 'bg-search-book',
  patent: 'bg-search-patent', software: 'bg-search-software', speaker: 'bg-search-speaker',
  area: 'bg-search-area', name: 'bg-search-name', abstract: 'bg-search-abstract', maria: 'bg-search-maria',
} as const;

export const qualisHex = (q: string) =>
  (tokens.color.qualis as Record<string, { $value: string }>)[q]?.$value ?? tokens.color.qualis.SQ.$value;
```

`getSearchTypeBadgeColor` e `RESULT_TYPE_CONFIG.color` em `lib/search-types.ts` passam a ler de `SEARCH_TYPE_BG`.
