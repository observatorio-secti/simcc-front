# 0010. Overlay de entidade sobre uma lista: máscara de rota do TanStack Router

- **Status:** aceita
- **Data:** 2026-11-21

## Contexto

O [ADR 0004](0004-modais-e-drawers-como-rotas.md) decide que um drawer de entidade sobre uma lista é uma rota com overlay: a lista continua montada, a URL muda e o botão voltar fecha o drawer. A T2 é a primeira tela que precisa disso: abrir um pesquisador a partir de `/busca` mostra o perfil (`/pesquisadores/$id`, da T3) por cima dos resultados.

O TanStack Router renderiza uma única árvore de rotas por vez. Se a navegação fosse de fato para `/pesquisadores/$id`, a rota `/busca` sairia da árvore e a lista seria desmontada (perde rolagem, estado local e a resposta na tela). As alternativas avaliadas:

- **Rota filha** (`/busca/pesquisadores/$id`): duplica a rota do perfil, e os search params do perfil (`q`, `page`, `sort_by`, `year_start`…) colidem com os da lista, porque o filho herda os do pai.
- **Layout sem path em comum** com a lista guardada no `history.state`: exige mover `pesquisadores/$id.tsx` de pasta e um layout que renderize a lista fora do `Outlet` para ela não remontar. Frágil e espalhado.
- **Máscara de rota** (`mask` em `navigate`/`Link`), recurso do próprio router para "modais com URL": a rota casada continua sendo a lista, e a barra de endereço mostra outra URL.

## Decisão

- O overlay é **estado da lista na URL real** e **a rota da entidade na URL visível**. Abrir um pesquisador em `/busca` navega para `/busca?…&researcher=<id>` com `mask: { to: '/pesquisadores/$id' }`. A lista continua casada e montada; a barra de endereço mostra `/pesquisadores/<id>?q=…`.
- O estado do perfil dentro do overlay (aba, filtros, página, produção aberta) fica num único parâmetro da lista, `profile`, como query string (`tab=books&year_start=2020`). O termo e o tipo de busca vêm da lista. A máscara recebe os mesmos search params da rota do perfil, então o link copiado abre a página completa no mesmo estado. Codificação em `src/features/researcher-profile/overlay-search.ts`.
- Mudanças dentro do overlay usam `replace`, para que **voltar feche o overlay** em vez de desfazer cada aba. Fechar pelo botão volta no histórico quando a entrada foi aberta pela lista (`history.state.searchOverlay`); quando a página foi aberta direto em `/busca?researcher=…`, fechar remove o parâmetro com `replace`.
- A composição fica na rota (`src/routes/_public/busca.tsx`): ela é a única camada que pode juntar duas features (`search` e `researcher-profile`). A feature da lista só recebe `onOpenResearcher(id)`. O painel é `ResearcherProfileOverlay`, que reusa o `ResearcherProfilePage` da T3 num `Sheet`.
- Links para a entidade continuam com o `href` real (`/pesquisadores/<id>`): Ctrl/Cmd+clique e "abrir em nova aba" levam à página completa. Só o clique simples vira overlay.
- A rota do perfil passou a omitir da URL os valores padrão (`stripSearchParams`), o que também limpa a URL mascarada.

## Consequências

- Recarregar a página com o overlay aberto restaura lista e overlay: o router guarda a URL real no `history.state` (`unmaskOnReload` fica no padrão, `false`). Abrir o link em outra aba ou compartilhá-lo leva à página completa do perfil.
- O `loader` da rota do perfil não roda no overlay. A lista pré-carrega o detalhe (`researcherDetailQueryOptions`) e o painel trata carregamento e erro (404) por conta própria, com `Suspense` e `CatchBoundary`.
- O analytics ([ADR 0009](0009-analytics-page-view-por-caminho.md)) lê o caminho real: abrir o overlay não gera `page_view` novo (o caminho continua `/busca`).
- O mesmo mecanismo serve para os próximos overlays: detalhe de produção (T13), programa, grupo e instituição sobre suas listas. Cada lista ganha um parâmetro com o id e, se a entidade tiver estado próprio, um parâmetro codificado como o `profile`.
