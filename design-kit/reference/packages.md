# Pacotes: essenciais × substituíveis

> **Levantamento do legado.** Este arquivo descreve a plataforma anterior, preservada na tag `legado-v1` (consulte com `git show legado-v1:<caminho>`). Os caminhos `src/...` citados aqui não existem na versão nova; o destino de cada tela está em `docs/legado/inventario.md`.

Levantamento feito por importações em `src/` (excluindo `components/console/`), em nov/2026. O número é a quantidade de arquivos que importam o pacote.

## Base de UI (manter: é sobre ela que o kit é escrito)

| Pacote | Arquivos | Papel no kit |
|---|---|---|
| `tailwindcss` + `tailwindcss-animate` | — | utilitários; o preset do kit entra em `presets` |
| `class-variance-authority`, `clsx`, `tailwind-merge` | — | variantes dos primitivos (`cn`, `cva`) |
| `@radix-ui/react-*` (accordion, alert-dialog, avatar, checkbox, collapsible, dialog, dropdown-menu, label, popover, scroll-area, select, separator, slot, switch, tabs, toggle, toggle-group, tooltip) | — | primitivos shadcn em `src/components/ui/` |
| `lucide-react` | 155 | **biblioteca única de ícones** |
| `next-themes` | 20 | tema claro/escuro por classe `.dark` |
| `sonner` | 23 | toasts (`<Toaster richColors position="top-right" />`) |
| `recharts` | 43 | **biblioteca padrão de gráficos** (`ui/chart.tsx`) |
| `@tanstack/react-table` | 30 | tabelas (`ui/data-table.tsx`) |
| `@tanstack/react-query` | 12 | dados (não visual, manter) |
| `react-leaflet` + `leaflet` | 2 | **mapa padrão** (mapa da Bahia, territórios) |
| `cmdk` | 1 | `ui/command.tsx` (busca rápida Ctrl+Q) |
| `vaul` | 1 | `ui/drawer.tsx` (filtros no mobile) |
| `react-day-picker` + `date-fns` | 1 / 4 | `ui/calendar.tsx` / datas |
| `embla-carousel-react` | 1 | `ui/carousel.tsx` |
| `react-resizable-panels` | 1 | `ui/resizable.tsx` |
| `react-router-dom`, `react`, `react-dom`, `zustand`, `axios`, `lodash.debounce` | — | infraestrutura |

Primitivos radix pouco usados (`navigation-menu`, `menubar`, `slider`, `progress`: 1 arquivo cada) seguem no kit porque fazem parte do conjunto shadcn; podem sair se a tela que os usa for refeita sem eles.

## Substituir (duplicam algo da base)

| Pacote | Arquivos | Substituto | Observação |
|---|---|---|---|
| `phosphor-react` | 114 | `lucide-react` | tabela em `icons.md`; maior ganho de uniformidade |
| `@phosphor-icons/react` | 1 | `lucide-react` | só `XLogoIcon` |
| `@tabler/icons-react` | 1 | `lucide-react` | só `IconCheck`/`IconCopy` em `ui/code-block.tsx` |
| `highcharts` + `highcharts-react-official` | 7 | `recharts` | hoje usado para **nuvem de palavras** (5) e exportação de mapa; manter só para wordcloud até haver substituto (ex.: `d3-cloud` ou lista ponderada com `sc-rank`) |
| `react-map-gl` + `mapbox-gl` | 1 / 0 | `react-leaflet` | um único mapa usa Mapbox; unificar no Leaflet |
| `framer-motion` | 2 | `tailwindcss-animate` / CSS | animações simples de entrada |
| `react-spring`, `@react-spring/web` | 0 | — | sem uso; remover |
| `react-responsive-masonry` | 54 | CSS grid (`sc-grid`) ou `columns-*` do Tailwind | migração gradual; grade regular é o padrão do kit; masonry só onde as alturas variam muito (cards de produção) |
| `react-helmet` | 23 | `react-helmet-async` (já instalado, 0 usos) | `react-helmet` não é mais mantido |
| `html2pdf.js` + `jspdf` + `html2canvas` | 1 / 1 / 0 | um só (`jspdf`) | relatório do pesquisador |
| Componentes decorativos `ui/hero-highlight`, `ui/hero-parallax`, `ui/infinite-moving-*` | 0–2 cada | `sc-card`, `sc-rank`, `ui/carousel` (embla) | importados de bibliotecas de efeitos, fora do padrão visual; os únicos consumidores de `framer-motion`. `hero-highlight`, `infinite-moving-article`, `infinite-moving-cards-researchers` e `infinite-moving-researcher-loading` não têm uso |

## Remover (sem uso no front)

`emoji-mart`, `@emoji-mart/data`, `@emoji-mart/react`, `emoji-picker-react`, `react-beautiful-dnd`, `react-dnd`, `react-dnd-html5-backend`, `@react-pdf-viewer/core`, `@react-pdf-viewer/default-layout`, `katex`, `html2canvas`, `react-dropzone`, `papaparse`, `xlsx`, `uuidv4`, `unorm`, `html-react-parser`, `next-images`, `react-email`, `@react-email/*`.

Confirme com `grep -rn "from '<pacote>'" src` antes de remover: alguns podem ser usados por scripts fora de `src/`.

## Fora do escopo visual (dependências de servidor no `package.json` do front)

`express`, `cors`, `body-parser`, `nodemailer`, `resend`, `googleapis`, `@google-cloud/bigquery`, `@google-cloud/translate`, `@google-analytics/data`, `geoip-lite`, `node-correios`, `correios-brasil`, `https`, `safer-buffer`, `rollup*`, `esbuild`, `terser`, `conectee: file:`. Não afetam o design system, mas inflam o `node_modules` e devem ir para o backend ou `devDependencies`.

## Fontes

- **Lexend** (Google Fonts, `wght@100..900`): manter.
- **Ubuntu**: carregada em `index.html` mas não usada pelo Tailwind. Remover o `<link>`.
