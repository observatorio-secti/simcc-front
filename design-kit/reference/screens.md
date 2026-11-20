# Inventário de telas públicas

Mapa das rotas atuais (`src/App.tsx`) para os templates do `DESIGN.md` §6.2, com o que cada tela precisa ajustar para entrar no padrão. Levantado navegando a plataforma em execução (nov/2026).

| Rota | Componente | Template | Ajustes para o padrão |
|---|---|---|---|
| `/` | `homepage/inital-home.tsx` | A. Hero de busca | Extrair `PillLink`; usar `text-brand-teal`/`text-brand-wine` no lugar de hex; o gráfico de fundo (Recharts invisível, `h-[0vh]`) pode sair |
| `/resultados`, `/resultados-perfil` | `homepage/result-home*.tsx`, `categorias/*` | D. Resultados | Filtros em `Accordion` padrão; cor de tipo por `SEARCH_TYPE_BG`; grade/lista com `LayoutGrid`/`Rows3`; ranking com `sc-rank` |
| `/resultados-ia` | `maria/maria.tsx` | D (variante chat) | Cor de tipo `search-maria` (= `eng-blue`) |
| `/researcher` e modal de pesquisador | `researcher/researcher-page.tsx`, `timeline-researcher.tsx`, `researcher-indicators.tsx` | E. Perfil | Trocar ternários de grande área por `areaBg()`; badges `sc-badge`; tabs `ui/tabs` em `neutral-*` |
| `/pos-graduacao` | `graduate-program/*` | B (com mapa) → C | Hero com `sc-mark`; mapa Leaflet com territórios; lista no template C |
| `/instituicao/:acronym?` | `institution/*` | C. Listagem → E (detalhe) | Cards de instituição com `sc-entity`; KPIs no padrão |
| `/grupos-pesquisa` | `grupos-pesquisa/*` | C. Listagem | Bloco de carregamento padrão; toolbar padrão |
| `/indicadores` | `indicators/content-indicators.tsx` | B. Landing de seção | Atalhos em `sc-card--interactive`; dashboards Power BI dentro de card |
| `/incites` | `incites/content-incites.tsx` | B. Landing de seção | Fundo `bg_graduate` |
| `/producoes-recentes` | `novas-publicacoes/new-articles.tsx` | C. Listagem | Cards `sc-prod` |
| `/paines-dados-externos` | `homepage/paines-dados-externos.tsx` | C. Listagem | Cards de link com `ExternalLink` |
| `/indice-pesquisador` | `indice-pesquisador/*` | C. Listagem | Tabela `sc-table` |
| `/provimento-cargo` | `provimento-cargo/*` | C. Listagem | Cores de área via preset |
| `/listagens` | `listagens/*` | C. Listagem | Muitos `react-responsive-masonry`; migrar para grade |
| `/termos-uso`, `/politica-privacidade`, `/informacoes`, `/api-docs`, `/videos` | `docs-api/*`, `info/*` | F. Documento | Cabeçalho com fundo `bg_home`; `ui/code-block` sem tabler |
| `/dicionario-cores` | `docs-api/dicionario-cores.tsx` | F. Documento | Ler cores de `tokens.json` em vez da lista própria |
| `/sobre`, `/observatorio`, `/tv` | `pages/About`, `observatorio/*`, `pages/Tv` | autônomas | Fora da moldura; usar tokens de cor e tipografia |
| `*` (404), não autorizado | `errors/*` | F (estado) | `sc-empty` + fundo `bg_home` |

## Padrões repetidos que o kit unifica

| Padrão | Onde aparece | Componente do kit |
|---|---|---|
| “Saiba como utilizar a plataforma” | home, indicadores, pós-graduação | `sc-pill-link` |
| Palavra destacada em azul no hero | indicadores, pós-graduação, institutos | `sc-mark` |
| Busca com ícone + “Baixar resultado” + “Filtros” + colapsar | instituições, grupos, pós-graduação, listagens | `sc-search-field` + `sc-toolbar` |
| Card “Total de …” com número e legenda | todas as listagens e resultados | KPI (`sc-card` + `sc-stat`) |
| Seção com ícone, título e chevron | gráficos, listas, rankings | `sc-section` |
| “Processando sua solicitação…” | todos os carregamentos de bloco | `sc-loading` |
| Cor por tipo de busca | header, busca, chips, ranking, evidências | `search-*` |
| Cor por grande área | perfil, filtros, mapas, listagens, gráficos | `area-*` |
| Borda colorida por Qualis | cards de artigo | `sc-prod` + `qualis-*` |

## Inconsistências encontradas

- Três azuis de ação concorrentes: `eng-blue #559FB8` (botões, nav), `#07677E` (hover/foco em ~20 lugares) e `#006699` (spinner dos layouts). Padrão: `eng-blue`.
- Três escalas de cinza misturadas para o mesmo papel: `gray-*` (texto secundário, ~470 usos), `slate-*` (tabs, skeleton) e `neutral-*` (moldura, cards). Padrão: `neutral-*` (exceção: bloco de carregamento `slate-300`).
- `Card` do shadcn tem `shadow-sm`, mas as telas usam cards planos com borda. Padrão: sem sombra.
- Dicionário de cores duplicado em código (ternários com hex nas telas de perfil e listagens) e na página `/dicionario-cores`.
- Breadcrumb mostra o slug da URL (“Pos-Graduacao”, “Grupos-Pesquisa”). Padrão: nome legível por rota.
- `--chart-1…5` referenciados em `inital-home.tsx`, mas não definidos no `index.css`.
- Fonte Ubuntu carregada sem uso.
