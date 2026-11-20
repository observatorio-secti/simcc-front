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

| Rota antiga                            | Rota nova (proposta)                             | Tarefa                                       | Status    |
| -------------------------------------- | ------------------------------------------------ | -------------------------------------------- | --------- |
| `/`                                    | `/`                                              | T1                                           | a fazer   |
| `/resultados`, `/resultados-perfil`    | `/busca` (tipo e termos nos search params)       | T2                                           | a fazer   |
| `/resultados-ia`                       | `/maria`                                         | T10                                          | bloqueada |
| `/researcher` (+ modal)                | `/pesquisadores/$id` (overlay a partir da busca) | T3                                           | a fazer   |
| `/pos-graduacao`                       | `/pos-graduacao`, `/pos-graduacao/$id`           | T5                                           | a fazer   |
| `/grupos-pesquisa`                     | `/grupos-pesquisa`, `/grupos-pesquisa/$id`       | T6                                           | a fazer   |
| `/instituicao/:acronym?`               | `/instituicoes`, `/instituicoes/$id`             | T4                                           | a fazer   |
| `/indicadores`                         | `/indicadores`                                   | T7                                           | bloqueada |
| `/incites`                             | —                                                | D1                                           | a decidir |
| `/producoes-recentes`                  | —                                                | D1 (depende de "recentes" no backend fase 3) | a decidir |
| `/paines-dados-externos`               | —                                                | D1                                           | a decidir |
| `/indice-pesquisador`                  | —                                                | D1                                           | a decidir |
| `/provimento-cargo`                    | —                                                | D1                                           | a decidir |
| `/listagens`                           | —                                                | D1                                           | a decidir |
| `/console`, `/console/*`               | `/console/*`                                     | T12                                          | a fazer   |
| `/termos-uso`, `/politica-privacidade` | mesmas                                           | T8                                           | a fazer   |
| `/api-docs`, `/informacoes`            | mesmas                                           | T8                                           | a fazer   |
| `/dicionario-cores`                    | mesma (lendo `tokens.json`)                      | T8                                           | a fazer   |
| `/videos`                              | mesma                                            | T9                                           | a fazer   |
| `/auth/callback`                       | `/auth/callback`                                 | F1.4                                         | a fazer   |
| `/observatorio`, `/tv`, `/sobre`       | mesmas                                           | T11                                          | a fazer   |
| `*`                                    | `*`                                              | F1.3                                         | a fazer   |

## Funcionalidades descontinuadas

| O quê                                                | Motivo                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Exportação CSV ("Baixar resultado")                  | [ADR 0006](../decisoes/0006-sem-exportacao-csv.md)                                                     |
| Dados da UFMG (`ufmg/researcher`, `ufmg/technician`) | Descontinuados no backend ([ADR 0007](../decisoes/0007-escopo-de-dados.md))                            |
| Chave de API do ETL no front                         | Exposta publicamente; o ETL passa a usar o token do IdP ([ADR 0008](../decisoes/0008-autenticacao.md)) |

## Onde está a mídia do legado

| Conteúdo                    | Caminho na tag                       | Usado por |
| --------------------------- | ------------------------------------ | --------- |
| Vídeos tutoriais (144 MB)   | `public/vid/`                        | T9        |
| GeoJSON dos territórios     | `public/territorio_relacionado.json` | T5        |
| Prints dos painéis Power BI | `public/powerbi/`                    | T7 / D1   |
| Imagens do Observatório     | `assets/observatorio/`               | T11       |
| Logos de instituições       | `src/assets/logo_*.png`              | E3        |

Para recuperar um arquivo:

```bash
git show legado-v1:public/territorio_relacionado.json > public/territorio_relacionado.json
```
