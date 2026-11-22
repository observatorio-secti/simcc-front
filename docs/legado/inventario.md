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
| `/console`, `/console/*`               | a definir na proposta                                               | T12 (reimaginar) | a fazer       |
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
