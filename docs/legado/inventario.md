# Inventário do legado

Rotas da plataforma anterior (`legado-v1:src/App.tsx`) e o destino de cada uma no front novo. Na virada (V1 do [roadmap](../roadmap.md)), toda linha está fechada como **feito** ou **descontinuada**.

URLs antigas relevantes têm redirect em `src/routes/_public/` (V2).

## Estrutura antiga

```
DefaultLayout
├── SearchLayout (público)
│   ├── /                         InitialHome
│   ├── /resultados               ResultHome
│   ├── /resultados-perfil        ResearchersProfileHome
│   ├── /resultados-ia            Maria
│   ├── /researcher               ResearcherPage (+ ResearcherModal global)
│   ├── /pos-graduacao            GraduateProgram
│   ├── /grupos-pesquisa          GruposPesquisaPage
│   ├── /instituicao/:acronym?    Institution
│   ├── /indicadores              ContentIndicators
│   ├── /incites                  IncitesPage
│   ├── /producoes-recentes       NewsArticles
│   ├── /paines-dados-externos    PaineisDadosExternos
│   ├── /indice-pesquisador       IndicePesquisador
│   ├── /provimento-cargo         ProvimentoCargo
│   └── /listagens                TodosPesquisadores
├── ProtectedRoute → SearchLayout
│   ├── /console                  ConsolePage
│   ├── /console/instituicoes(/:id)
│   ├── /console/pesquisadores
│   ├── /console/colecoes
│   └── /console/etl(/:runId)
├── DocsLayout
│   ├── /termos-uso, /politica-privacidade, /api-docs
│   ├── /informacoes, /dicionario-cores, /videos
└── sem layout
    ├── /auth/callback, /observatorio, /tv, /sobre
    └── * (404)
```

## Destino de cada tela

| Rota antiga                            | Rota nova                                                           | Tarefa           | Status        | Observação / Justificativa                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------- | ---------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                    | `/`                                                                 | T1               | feito         | Home e barra de busca entregues em `src/routes/_public/index.tsx`                                                                            |
| `/resultados`, `/resultados-perfil`    | `/busca` (tipo, aba, termo e filtros nos search params)             | T2               | feito         | Busca unificada entregue; pendência conhecida no backend: busca com todas as facetas pode passar de 60s                                      |
| `/resultados-ia`                       | `/maria`                                                            | T10              | feito         | Chat com streaming SSE e citações em `/maria` e `/maria/$conversationId`; `/resultados-ia` redireciona                                       |
| `/researcher` (+ modal)                | `/pesquisadores/$id` (overlay a partir da busca)                    | T3               | feito         | Perfil completo; pendência no backend: `/v2/researcher/{id}/terms` retorna 500; desvio: `prod_kind`/`prod_id` substituídos por `production=` |
| Modal de produção (resultados, perfil) | `/producoes/$kind/$id` (overlay sobre a busca e o perfil, ADR 0010) | T13              | feito         | Substitui o modal global e o diálogo `prod_kind`/`prod_id` do perfil; pendência no backend para `event-work` (500)                           |
| `/pos-graduacao`                       | `/pos-graduacao`, `/pos-graduacao/$id`                              | T5               | feito         | Landing com mapa de territórios, lista, detalhe e painéis Power BI (ADR 0012)                                                                |
| `/grupos-pesquisa`                     | `/grupos-pesquisa`, `/grupos-pesquisa/$id`                          | T6               | feito         | Lista e detalhe consumindo a API ODA (ADR 0007)                                                                                              |
| `/instituicao/:acronym?`               | `/instituicoes`, `/instituicoes/$id`                                | T4               | feito         | Lista, detalhe com contagens e aba de painel Power BI (ADR 0012)                                                                             |
| `/indicadores`                         | `/indicadores`                                                      | T7               | feito         | Painéis do Power BI embutidos por aba (`?painel=`, ADR 0012); rotas próprias de métricas canceladas                                          |
| `/incites`                             | `/incites`                                                          | D1.1             | feito         | Página com cards e links para os painéis InCites                                                                                             |
| `/producoes-recentes`                  | —                                                                   | —                | descontinuada | Fora do escopo do front novo (decisão de 2026-11-20)                                                                                         |
| `/paines-dados-externos`               | `/paineis-dados-externos`                                           | D1.2             | feito         | Página com links para fontes externas; grafia antiga `/paines-dados-externos` redireciona                                                    |
| `/indice-pesquisador`                  | `/indice-pesquisador`                                               | D1.3             | feito         | Página explicativa dos níveis do índice do pesquisador                                                                                       |
| `/provimento-cargo`                    | —                                                                   | —                | descontinuada | Fora do escopo do front novo (decisão de 2026-11-20)                                                                                         |
| `/listagens`                           | `/busca` sem termo (`/listagens` redireciona, ADR 0011)             | D1.4, V4.1       | feito         | Catálogos unificados em `/busca` sem `q`; `/listagens` redireciona preservando `?tab=`                                                       |
| `/console`                             | `/console` (último run do ETL e totais)                             | T12.1            | feito         | Layout administrativo, guarda via `GET <admin>/me` (ADR 0008) e visão geral                                                                  |
| — (novo)                               | `/console/admins`                                                   | T12.1            | feito         | Gestão de administradores por `sub` do IdP (ADR 0008)                                                                                        |
| `/console/instituicoes(/:id)`          | `/console/instituicoes`, `/console/instituicoes/$institutionId`     | T12.2 (cadastro) | feito         | Cadastro e edição de instituições na API de admin                                                                                            |
| `/console/pesquisadores`               | `/console/pesquisadores`, `/console/pesquisadores/$researcherId`    | T12.2 (cadastro) | feito         | Cadastro e edição de pesquisadores na API de admin                                                                                           |
| `/console/colecoes`                    | `/console/colecoes`                                                 | T12.2 (cadastro) | feito         | Gestão de coleções acadêmicas na API de admin                                                                                                |
| `/console/etl(/:runId)`                | `/console/etl`, `/console/etl/$runId`                               | T12.3            | feito         | Execução e acompanhamento de logs de rotinas ETL via API de admin (ADR 0008)                                                                 |
| `/termos-uso`, `/politica-privacidade` | —                                                                   | —                | descontinuada | Página de documento fora do escopo do front novo (decisão de 2026-11-20)                                                                     |
| `/api-docs`, `/informacoes`            | —                                                                   | —                | descontinuada | Página de documento fora do escopo do front novo (decisão de 2026-11-20)                                                                     |
| `/dicionario-cores`                    | —                                                                   | —                | descontinuada | Página de documento fora do escopo do front novo (decisão de 2026-11-20)                                                                     |
| `/videos`                              | —                                                                   | —                | descontinuada | Vídeos fora do escopo do front novo (decisão de 2026-11-20)                                                                                  |
| `/auth/callback`                       | `/auth/callback`                                                    | F1.4             | feito         | Callback OAuth 2.0 PKCE com tokens mantidos apenas em memória (ADR 0008)                                                                     |
| `/observatorio`, `/tv`, `/sobre`       | —                                                                   | —                | descontinuada | Páginas autônomas fora do escopo do front novo (decisão de 2026-11-20)                                                                       |
| `*`                                    | `*`                                                                 | F1.3             | feito         | Página 404 definitiva no padrão do kit                                                                                                       |

### Abas das listagens

| Aba antiga (`/listagens?tab=`) | Aba nova em `/busca`                                   | Tarefa | Status        | Observação / Justificativa                                                                                            |
| ------------------------------ | ------------------------------------------------------ | ------ | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `texto-revista`                | `?tab=magazine_texts` (`/v2/production/magazine-text`) | V4.1   | feito         | Integrada no catálogo e no redirect de `/listagens`; pendência no backend: `/v2/production/magazine-text` retorna 500 |
| `work-event`                   | `?tab=event_works` (`/v2/production/event-work`)       | V4.1   | feito         | Integrada no catálogo e no redirect de `/listagens`; pendência no backend: `/v2/production/event-work` retorna 500    |
| `tecnicos`                     | —                                                      | —      | descontinuada | Dados de técnicos da UFMG descontinuados no backend ([ADR 0007](../decisoes/0007-escopo-de-dados.md))                 |

### Redirects das URLs antigas (V2)

Rotas de redirecionamento em `src/routes/_public/` (`beforeLoad` com `redirect({ replace: true })`); a tradução dos parâmetros fica em `src/routes/-redirects/`. O parâmetro sem equivalente é descartado. Os ids da v2 são UUIDs; sigla e nome são resolvidos pela v2 no `beforeLoad`. O redirect não gera `page_view` próprio (ADR 0009): só o destino é contado.

| URL antiga                                    | Destino                                                                                                           | Parâmetros preservados                                                                                                                                                                                                                                                                                                                                                                                                               | Descartados                                                                                                                          | Status        | Observação / Justificativa                                                                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `/resultados`, `/resultados-perfil`           | `/busca`                                                                                                          | `terms` → `q` (`;` = e, `\|` = ou); `type_search` → `type`; `tab` (`articles-home`, `book-home`, `patent-home`, `software-home`, `speaker-home`) → `tab`; `area`, `institution_id`, `graduate_program_id`, `city_id`, `identity_territory`, `graduation`, `classification`, `modality`, `qualis`, `source_type` (maiúsculas → minúsculas), `year_start`, `year_end`; `sort_by` ou, em aba de produção, `production_sort` → `sort_by` | `tab` de instituições e mapa, `open_access`, `facet_limit`, `researcher`, filtros da v1 separados por `;` (`areas`, `universities`…) | feito         | Implementado em `src/routes/_public/resultados.tsx` e `resultados-perfil.tsx`                                                            |
| `/researcher`                                 | `/pesquisadores/$id`                                                                                              | `researcher_name` → id (resolvido em `/v2/researcher?q=&search_in=name`, nome exato); `terms` → `q`; `type_search`/`search_type` → `search_type`. Sem correspondência: `/busca?q=<nome>&type=name`                                                                                                                                                                                                                                   | `lattes_id` (a v2 não procura por Lattes: sem nome, vai para `/busca`), `prod_kind`/`prod_id`                                        | feito         | Implementado em `src/routes/_public/researcher.tsx`; desvios: `lattes_id` sem redirect e `prod_kind`/`prod_id` não abrem mais a produção |
| `/instituicao/:acronym?`                      | `/instituicoes/$id`                                                                                               | sigla do path, `?acronym=` ou `?institution_id=` → id (UUID direto; sigla ou nome resolvidos em `/v2/institution?q=`); `pagina=programas_pos` → `tab=programs`. Sem identificador: `/instituicoes`; sem correspondência: `/instituicoes?q=<sigla>`                                                                                                                                                                                   | demais `pagina` (`producoes`, `grupos_pesquisa`, `bolsistas`); `docentes` é a aba padrão                                             | feito         | Implementado em `src/routes/_public/instituicao/index.tsx` e `$acronym.tsx`                                                              |
| `/pos-graduacao?graduate_program_id=`         | `/pos-graduacao/$id`                                                                                              | `graduate_program_id` → `$id`                                                                                                                                                                                                                                                                                                                                                                                                        | filtros da lista (`cities`, `types`…)                                                                                                | feito         | Tratado no `beforeLoad` de `src/routes/_public/pos-graduacao/index.tsx`                                                                  |
| `/grupos-pesquisa?group_id=`                  | `/grupos-pesquisa/$id`                                                                                            | `group_id` → `$id`                                                                                                                                                                                                                                                                                                                                                                                                                   | `institution`, `area`                                                                                                                | feito         | Tratado no `beforeLoad` de `src/routes/_public/grupos-pesquisa/index.tsx`                                                                |
| `/paines-dados-externos`                      | `/paineis-dados-externos`                                                                                         | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                    | feito         | Implementado em `src/routes/_public/paines-dados-externos.tsx` (redirect da grafia antiga)                                               |
| `/resultados-ia`                              | `/maria`                                                                                                          | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | todos                                                                                                                                | feito         | Implementado em `src/routes/_public/resultados-ia.tsx`                                                                                   |
| `/listagens`                                  | `/busca` sem termo                                                                                                | `tab` (ver abas acima)                                                                                                                                                                                                                                                                                                                                                                                                               | demais                                                                                                                               | feito         | Implementado em `src/routes/_public/listagens.tsx` (ADR 0011)                                                                            |
| `/console/*`                                  | Mesmas rotas (`/console`, `/console/instituicoes`, `/console/pesquisadores`, `/console/colecoes`, `/console/etl`) | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                    | feito         | As rotas em `src/routes/console/` mantiveram os mesmos paths do legado (mais `/console/admins`), sem necessidade de rotas de redirect    |
| Rotas descontinuadas (`/producoes-recentes`…) | 404                                                                                                               | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                    | descontinuada | Sem redirect; caem na rota `*` (404, F1.3) conforme decisão de escopo de 2026-11-20                                                      |

## Pendências conhecidas do backend (`simcc-back`)

O front está entregue para os itens abaixo, mas o comportamento completo em runtime depende de correções no `simcc-back`:

- **`/v2/production/magazine-text` (aba texto em revista) e `/v2/production/event-work` (trabalho em evento: lista, detalhe e métricas):** retornam `500` por provável migração `d3f1a2b4c5e6` não aplicada no banco.
- **`/v2/researcher/{id}/terms` (nuvem de termos no perfil do pesquisador):** retorna `500` no backend.
- **Busca com todas as facetas:** requisições com todas as facetas ativas estão ultrapassando o timeout de `60s`.

## Desvios conhecidos

- **`lattes_id` sem redirect:** o legado aceitava `lattes_id` em `/researcher`, mas a API v2 não busca por Lattes. Links antigos apenas com `lattes_id` (sem `id`/`researcher_id` UUID nem `researcher_name`) redirecionam para `/busca`.
- **`prod_kind`/`prod_id` no perfil:** os links antigos do perfil do pesquisador que usavam `prod_kind` e `prod_id` para abrir o diálogo de produção não abrem mais a produção automaticamente. Foram substituídos pelo parâmetro `production=<kind>:<id>` (overlay) e pela rota canônica `/producoes/$kind/$id` ([ADR 0010](../decisoes/0010-overlay-de-rota-com-mascara.md)).

## Funcionalidades descontinuadas

| O quê                                                                                                                                                       | Motivo                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Exportação CSV ("Baixar resultado")                                                                                                                         | [ADR 0006](../decisoes/0006-sem-exportacao-csv.md)                                                            |
| Dados da UFMG (`ufmg/researcher`, `ufmg/technician`)                                                                                                        | Descontinuados no backend ([ADR 0007](../decisoes/0007-escopo-de-dados.md))                                   |
| Páginas de documento (termos, privacidade, API, informações, dicionário de cores), vídeos, sobre, observatório, TV, provimento de cargo, produções recentes | Fora do escopo do front novo (decisão de 2026-11-20)                                                          |
| Técnicos nas listagens                                                                                                                                      | Dados da UFMG ([ADR 0007](../decisoes/0007-escopo-de-dados.md))                                               |
| Chave de API do ETL no front                                                                                                                                | Exposta publicamente; o console aciona o ETL pela API de admin ([ADR 0008](../decisoes/0008-autenticacao.md)) |

## Onde está a mídia do legado

| Conteúdo                    | Caminho na tag                       | Usado por |
| --------------------------- | ------------------------------------ | --------- |
| GeoJSON dos territórios     | `public/territorio_relacionado.json` | T5        |
| Prints dos painéis Power BI | `public/powerbi/`                    | T7        |
| Logos de instituições       | `src/assets/logo_*.png`              | E3        |

Para recuperar um arquivo:

```bash
git show legado-v1:public/territorio_relacionado.json > public/territorio_relacionado.json
```
