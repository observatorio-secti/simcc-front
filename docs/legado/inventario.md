# Inventário do legado

Rotas da plataforma anterior (`legado-v1:src/App.tsx`) e o destino de cada uma no front novo. Na virada (V1 do [roadmap](../roadmap.md)), toda linha precisa estar como **feita** ou **descontinuada**.

As rotas novas são **propostas**: a tarefa de cada tela confirma o path e atualiza esta tabela. URLs antigas relevantes ganham redirect (V2).

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

| Rota antiga                            | Rota nova (proposta)                                                | Tarefa           | Status        |
| -------------------------------------- | ------------------------------------------------------------------- | ---------------- | ------------- |
| `/`                                    | `/`                                                                 | T1               | feito         |
| `/resultados`, `/resultados-perfil`    | `/busca` (confirmada; tipo, aba, termo e filtros nos search params) | T2               | em revisão    |
| `/resultados-ia`                       | `/maria`                                                            | T10              | em revisão    |
| `/researcher` (+ modal)                | `/pesquisadores/$id` (overlay a partir da busca)                    | T3               | feito         |
| Modal de produção (resultados, perfil) | `/producoes/$kind/$id` (overlay sobre a busca e o perfil, ADR 0010) | T13              | em revisão    |
| `/pos-graduacao`                       | `/pos-graduacao`, `/pos-graduacao/$id`                              | T5               | feito         |
| `/grupos-pesquisa`                     | `/grupos-pesquisa`, `/grupos-pesquisa/$id`                          | T6               | feito         |
| `/instituicao/:acronym?`               | `/instituicoes`, `/instituicoes/$id`                                | T4               | feito         |
| `/indicadores`                         | `/indicadores`                                                      | T7               | em revisão    |
| `/incites`                             | `/incites`                                                          | D1.1             | feito         |
| `/producoes-recentes`                  | —                                                                   | —                | descontinuada |
| `/paines-dados-externos`               | `/paineis-dados-externos`                                           | D1.2             | feito         |
| `/indice-pesquisador`                  | `/indice-pesquisador`                                               | D1.3             | feito         |
| `/provimento-cargo`                    | —                                                                   | —                | descontinuada |
| `/listagens`                           | `/busca` sem termo (`/listagens` redireciona, ADR 0011)             | D1.4, V4.1       | em revisão    |
| `/console`                             | `/console` (último run do ETL e totais)                             | T12.1            | em revisão    |
| — (novo)                               | `/console/admins`                                                   | T12.1            | em revisão    |
| `/console/instituicoes(/:id)`          | `/console/instituicoes`, `/console/instituicoes/$id`                | T12.2 (cadastro) | feito         |
| `/console/pesquisadores`               | `/console/pesquisadores`, `/console/pesquisadores/$id`              | T12.2 (cadastro) | feito         |
| `/console/colecoes`                    | `/console/colecoes`                                                 | T12.2 (cadastro) | feito         |
| `/console/etl(/:runId)`                | `/console/etl`, `/console/etl/$runId`                               | T12.3            | a fazer       |
| `/termos-uso`, `/politica-privacidade` | —                                                                   | —                | descontinuada |
| `/api-docs`, `/informacoes`            | —                                                                   | —                | descontinuada |
| `/dicionario-cores`                    | —                                                                   | —                | descontinuada |
| `/videos`                              | —                                                                   | —                | descontinuada |
| `/auth/callback`                       | `/auth/callback`                                                    | F1.4             | feito         |
| `/observatorio`, `/tv`, `/sobre`       | —                                                                   | —                | descontinuada |
| `*`                                    | `*`                                                                 | F1.3             | feito         |

### Abas das listagens

| Aba antiga (`/listagens?tab=`) | Aba nova em `/busca`                                   | Tarefa | Status        |
| ------------------------------ | ------------------------------------------------------ | ------ | ------------- |
| `texto-revista`                | `?tab=magazine_texts` (`/v2/production/magazine-text`) | V4.1   | em revisão    |
| `work-event`                   | `?tab=event_works` (`/v2/production/event-work`)       | V4.1   | em revisão    |
| `tecnicos`                     | —                                                      | —      | descontinuada |

### Redirects das URLs antigas (V2)

Rotas de redirecionamento em `src/routes/_public/` (`beforeLoad` com `redirect({ replace: true })`); a tradução dos parâmetros fica em `src/routes/-redirects/`. O parâmetro sem equivalente é descartado. Os ids da v2 são UUIDs; sigla e nome são resolvidos pela v2 no `beforeLoad`. O redirect não gera `page_view` próprio (ADR 0009): só o destino é contado.

| URL antiga                                    | Destino                   | Parâmetros preservados                                                                                                                                                                                                                                                                                                                                                                                                               | Descartados                                                                                                                          | Status     |
| --------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `/resultados`, `/resultados-perfil`           | `/busca`                  | `terms` → `q` (`;` = e, `\|` = ou); `type_search` → `type`; `tab` (`articles-home`, `book-home`, `patent-home`, `software-home`, `speaker-home`) → `tab`; `area`, `institution_id`, `graduate_program_id`, `city_id`, `identity_territory`, `graduation`, `classification`, `modality`, `qualis`, `source_type` (maiúsculas → minúsculas), `year_start`, `year_end`; `sort_by` ou, em aba de produção, `production_sort` → `sort_by` | `tab` de instituições e mapa, `open_access`, `facet_limit`, `researcher`, filtros da v1 separados por `;` (`areas`, `universities`…) | em revisão |
| `/researcher`                                 | `/pesquisadores/$id`      | `researcher_name` → id (resolvido em `/v2/researcher?q=&search_in=name`, nome exato); `terms` → `q`; `type_search`/`search_type` → `search_type`. Sem correspondência: `/busca?q=<nome>&type=name`                                                                                                                                                                                                                                   | `lattes_id` (a v2 não procura por Lattes: sem nome, vai para `/busca`)                                                               | em revisão |
| `/instituicao/:acronym?`                      | `/instituicoes/$id`       | sigla do path, `?acronym=` ou `?institution_id=` → id (UUID direto; sigla ou nome resolvidos em `/v2/institution?q=`); `pagina=programas_pos` → `tab=programs`. Sem identificador: `/instituicoes`; sem correspondência: `/instituicoes?q=<sigla>`                                                                                                                                                                                   | demais `pagina` (`producoes`, `grupos_pesquisa`, `bolsistas`); `docentes` é a aba padrão                                             | em revisão |
| `/pos-graduacao?graduate_program_id=`         | `/pos-graduacao/$id`      | `graduate_program_id` → `$id`                                                                                                                                                                                                                                                                                                                                                                                                        | filtros da lista (`cities`, `types`…)                                                                                                | em revisão |
| `/grupos-pesquisa?group_id=`                  | `/grupos-pesquisa/$id`    | `group_id` → `$id`                                                                                                                                                                                                                                                                                                                                                                                                                   | `institution`, `area`                                                                                                                | em revisão |
| `/paines-dados-externos`                      | `/paineis-dados-externos` | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                    | em revisão |
| `/resultados-ia`                              | `/maria`                  | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | todos                                                                                                                                | em revisão |
| `/listagens`                                  | `/busca` sem termo        | `tab` (ver abas acima)                                                                                                                                                                                                                                                                                                                                                                                                               | demais                                                                                                                               | em revisão |
| `/console/*`                                  | a definir (T12)           | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                    | a fazer    |
| Rotas descontinuadas (`/producoes-recentes`…) | 404                       | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                    | —          |

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
