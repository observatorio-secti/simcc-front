# 0011. Listagens como a busca sem termo

- **Status:** aceita
- **Data:** 2026-11-21

## Contexto

O legado tinha duas telas com abas por tipo de dado: os resultados da busca (`/resultados`) e as listagens (`/listagens`, `TodosPesquisadores`), que mostravam o catálogo inteiro de cada tipo (bolsistas, pesquisadores, artigos, livros, patentes, softwares, marcas, relatórios técnicos, orientações, eventos, projetos de pesquisa, revistas…). Na v2, as duas consomem as mesmas rotas de listagem (`/v2/researcher`, `/v2/production/<kind>`, `/v2/scholarship`, `/v2/magazine`), com as mesmas facetas, ordenação e paginação.

A T2 entregou `/busca` com o motor da F1.5 e, sem termo (`q`), já listava o catálogo da aba. Uma segunda tela `/listagens` repetiria abas, facetas, KPIs e paginação, com outro estado na URL para o mesmo dado.

## Decisão

- As listagens são **`/busca` sem `q`**, na mesma feature `search` (T1, T2, D1.4). Não existe uma segunda tela.
- Sem termo, as abas são **um catálogo da v2 por aba** (`CATALOG_TABS` em `src/features/search/search-tabs.ts`), qualquer que seja o tipo de busca: pesquisadores, bolsistas, os dez tipos de produção do registro da E2 e revistas. Com termo, as abas continuam as do tipo de busca (T2).
- **Bolsistas** (`/v2/scholarship`) e **revistas** (`/v2/magazine`) só aparecem sem termo: a primeira rota não tem busca textual, e o `q` da segunda busca só o nome da revista, que não é o recorte da busca por perfil. Digitar um termo numa dessas abas volta à aba padrão.
- Os filtros seguem os parâmetros da v2 por aba (`filterKeysForTab`): bolsistas usam `modality` (mesmos valores da faceta de pesquisadores, por isso o filtro passa de uma aba à outra) e `category_level`; revistas usam `qualis` (mesmo enum dos artigos). Bolsas e revistas não têm ano.
- `/listagens` fica como rota de redirecionamento para `/busca` (`beforeLoad`), traduzindo o `?tab=` do legado para a aba nova (`bolsistas` → `scholarships`, `magazine` → `magazines`…). Abas sem destino (técnicos, texto em revista, trabalho em evento) caem na aba padrão.

## Consequências

- Uma única implementação de abas, facetas, KPIs e paginação; novos catálogos entram como aba em `search-tabs.ts` e um ramo em `results-page.tsx`.
- A query das bolsas desceu de `features/researcher-profile` para a entidade `src/entities/scholarship/`, usada pelo perfil (T3) e pela aba de bolsistas.
- O menu "Listagens" continua apontando para `/listagens`, que redireciona: favoritos e links antigos seguem válidos, e a URL canônica é `/busca`.
- "Texto em revista" e "trabalho em evento" do legado (`researcher_production/papers_magazine` e `researcher_production/events` da v1) não têm rota na v2: ficam fora até o backend criar as rotas ou a equipe decidir descontinuá-los. Técnicos estão descontinuados ([ADR 0007](0007-escopo-de-dados.md)). Sem exportação CSV ([ADR 0006](0006-sem-exportacao-csv.md)).

## Atualização (2026-11-22, V4.1)

O backend criou as rotas `/v2/production/magazine-text` e `/v2/production/event-work`. "Texto em revista" e "trabalho em evento" viraram abas do catálogo (`magazine_texts` e `event_works`, tipos `magazine_text` e `event_work` no registro da E2), e o redirect de `/listagens` passou a traduzir `?tab=texto-revista` e `?tab=work-event` para elas. Onde este ADR diz que essas abas caem na aba padrão ou ficam fora, vale esta atualização. Na mesma tarefa, bolsistas ganharam os filtros `institution_id` e `graduate_program_id` (facetas `institution` e `graduate_program`), e revistas, o filtro "Sem estrato" (`qualis=not_rated`).
