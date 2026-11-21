# `src/shared/ui/`

Primitivos de interface do Simcc Design Kit: componentes shadcn (Radix + Tailwind 4) adaptados às regras de `design-kit/DESIGN.md` e às receitas de `design-kit/reference/components.md`. Não conhecem nenhuma entidade de domínio. Podem importar só `shared/` e `config/`.

A vitrine de todos eles fica em `/dev/vitrine` (só no `npm run dev`; ver `src/routes/dev/vitrine.tsx`).

## O que há aqui

| Arquivo                                                                                                                                     | Componente                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`                                                                                                                                | `Button` (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, `searchType`)                                                                     |
| `card.tsx`                                                                                                                                  | `Card` e partes, **sem sombra**                                                                                                                                |
| `badge.tsx`                                                                                                                                 | `Badge` (sólido/outline), `Tag` (contador suave), `Dot` (marcador)                                                                                             |
| `input.tsx`, `select.tsx`, `checkbox.tsx`, `toggle.tsx`, `toggle-group.tsx`                                                                 | controles de formulário                                                                                                                                        |
| `tabs.tsx`, `accordion.tsx`, `table.tsx`, `scroll-area.tsx`, `separator.tsx`, `skeleton.tsx`                                                | navegação interna, dados e carregamento                                                                                                                        |
| `dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `tooltip.tsx`, `sonner.tsx`                                                  | sobreposições (estado local de quem abre; entidade com identidade é rota, ADR 0004)                                                                            |
| `pill-link.tsx`, `stat-card.tsx`, `section-header.tsx`, `result-toolbar.tsx`, `loading-block.tsx`, `empty-state.tsx`, `collapse-button.tsx` | componentes do kit                                                                                                                                             |
| `facet-panel.tsx`                                                                                                                           | `FacetPanel` (`sc-filters`, `Accordion` + `Checkbox` + `Dot` opcional + intervalo para `year`), `FacetSidebar` (260px desktop) e `FacetSheet` (`Sheet` mobile) |
| `pagination.tsx`                                                                                                                            | `Pagination` (aceita `pagination` da API v2 ou props explícitas, seletor opcional de `per_page`)                                                               |
| `sort-select.tsx`                                                                                                                           | `SortSelect` (`Select` de `sort_by` com direção padrão e alternância opcional `asc`/`desc`)                                                                    |
| `*-variants.ts`, `focus-ring.ts`                                                                                                            | variantes `cva` e o anel de foco, fora dos `.tsx` para eles exportarem só componentes (Fast Refresh)                                                           |

Controles de listagem (`FacetPanel`, `Pagination`, `SortSelect`) não conhecem rotas nem entidades específicas: recebem o estado/callbacks da URL via `src/shared/lib/search-params.ts`.

Cor por dado (área, Qualis, tipo de produção…) não é decidida aqui: vem de `src/shared/lib/design-tokens.ts` e entra por `className`.

## Regras do kit

Card sem sombra; `rounded-md` em controles, `rounded-lg` em cards; ação primária `bg-eng-blue hover:bg-eng-dark-blue`; cinzas `neutral-*` (exceto o carregamento, `slate-*`); ícones `lucide-react` 16px; foco visível com `focusRing`; textos em pt-BR e sentence case; botão só com ícone tem `aria-label`.

## Adicionar um primitivo

`components.json` aponta para cá (`npx shadcn@latest add <componente>`). Depois de gerar:

1. O registro atual do shadcn importa `cn` de um pacote npm `"cn"` e o adiciona ao `package.json`. Troque o import por `@/shared/lib/cn` e desinstale o pacote (`npm uninstall cn`).
2. Componentes que usam tema (ex.: `sonner`) vêm com `next-themes`: use `useTheme` de `@/shared/lib/theme` e desinstale `next-themes`.
3. Remova `'use client'`, mova variantes `cva` exportadas para um `*-variants.ts` e ajuste as classes às regras acima.
