# T12. Proposta do console

- **Status:** em revisão
- **Data:** 2026-11-20
- **Tarefa:** T12 ([roadmap](../roadmap.md), fase 3)
- **Depende de:** F1.4 (sessão), F1.2 (primitivos) e da aprovação desta proposta. Nenhum código do console é escrito antes disso.

Esta proposta descreve o que o console precisa fazer, para quem, com quais rotas e em que ordem construir. Ela parte do [ADR 0008](../decisoes/0008-autenticacao.md) (um só papel de admin, tudo pela API de admin) e das rotas reais do `simcc-admin` na branch `v3/develop` (commit `57a7610`). O legado foi lido só para levantar o que existia.

## Resumo das propostas

1. **Quatro áreas**: sincronização (ETL), cadastro acadêmico (pesquisadores, instituições, coleções), administradores e uma visão geral curta na entrada. Métricas de acesso (GA4) saem do console.
2. **Todas as rotas sob `/console`**, em pt-BR kebab-case. Cada execução do ETL, pesquisador, instituição e coleção tem rota própria. Criar e confirmar são diálogos locais ([ADR 0004](../decisoes/0004-modais-e-drawers-como-rotas.md)).
3. **Listas espelham a API na URL**: `q`, `page`, `per_page`, `sort_by`, `sort_order`, `institution_id`, `collection_id` ([ADR 0002](../decisoes/0002-url-como-estado.md)).
4. **O console adota o kit público** (tokens, primitivos, tema claro e escuro) com uma variação da moldura. Os tokens `sm-*` do legado não voltam.
5. **Tipos da API de admin gerados do OpenAPI do FastAPI**, num arquivo próprio em `src/api/generated/`, como já se faz com a v2. Isso pede um ADR quando a T12.1 começar.
6. **Entrega fatiada em seis cartões** (T12.1 a T12.6), com a sincronização logo depois da moldura.

## 1. Levantamento do legado

### 1.1 Telas

Rotas em `legado-v1:src/App.tsx`, todas dentro de `ProtectedRoute` e do `SearchLayout` público. Componentes em `legado-v1:src/components/console/`.

| Rota                        | Arquivo                                                                                         | O que fazia                                                                                                                                                                                             | Dados                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `/console`                  | `console-page.tsx`, `page-views-card.tsx`                                                       | "Métricas de acesso": 4 KPIs (visualizações, sessões, novos visitantes, interações), linha diária, países, eventos e páginas mais vistas por sistema (Simcc, ICTite, Licuri), dos últimos 30 dias       | `simcc-back` público: `GET /v2/analytics` e `GET /v2/analytics/pages` (GA4)              |
| `/console/instituicoes`     | `institutions-page.tsx`, `institution-dialog.tsx`                                               | Lista com busca, ordenação e paginação; criar, editar e excluir (nome e sigla)                                                                                                                          | `GET/POST/PUT/DELETE /academic/institutions`                                             |
| `/console/instituicoes/:id` | `institution-detail-page.tsx`                                                                   | Dados da instituição e a tabela de pesquisadores filtrada por ela; editar, excluir, remover afiliação                                                                                                   | `/academic/institutions/{id}`, `/academic/researchers?institution_id=`                   |
| `/console/pesquisadores`    | `researchers-page.tsx`, `researcher-list-table.tsx`, `researcher-create-dialog.tsx`             | Lista com busca (nome ou Lattes), filtros por instituição e coleção, criar pesquisador, botão "Sincronizar" por linha                                                                                   | `/academic/researchers`, `/academic/collections`, ETL `POST runs`                        |
| (drawer sobre a lista)      | `researcher-detail-drawer.tsx`, `institution-combobox.tsx`, `institution-chip.tsx`              | Editar nome e Lattes, adicionar e remover afiliações e coleções, "Sincronizar Lattes", excluir                                                                                                          | `/academic/researchers/{id}` e subrotas `institutions/{id}`, `collections/{id}`          |
| `/console/colecoes`         | `collections-page.tsx`, `collection-dialog.tsx`                                                 | Lista com busca; criar, editar e excluir (slug, nome, descrição, intervalo de atualização em dias, coleção padrão)                                                                                      | `/academic/collections`                                                                  |
| `/console/etl(/:runId)`     | `etl/etl-page.tsx` e vizinhos (`stepper`, `header-summary`, `history-table`, `technical-sheet`) | "Atualização de dados": execução em foco (cronômetro, etapas com encontrados/sucesso/falha), histórico das 20 últimas, disparo com escolha de rotinas e de Lattes, gaveta de logs com filtro e download | ETL **direto do navegador**: `routines`, `runs`, `runs/{id}`, `runs/{id}/logs`, `health` |
| (diálogo de confirmação)    | `confirm-impact-dialog.tsx`                                                                     | Confirmação de exclusão com texto de impacto                                                                                                                                                            | —                                                                                        |

Não havia tela de administradores: quem era admin vinha do campo `role` do token do IdP.

### 1.2 O que funcionava mal

- **Chave do ETL no bundle.** `legado-v1:src/lib/api.ts` montava o cliente `apiEtl` com `X-ETL-API-Key` lido de `VITE_ETL_API_KEY`. A chave era pública. O download de logs abria a URL do ETL numa aba nova (`dashboard/api/runs/{id}/download`).
- **Papel tirado do token.** `isAdmin = user?.role === 'ADMIN'` (`legado-v1:src/context/auth-context.tsx`). Qualquer usuário logado no IdP entrava em `/console/*`, via as telas acadêmicas e recebia `403` da API. Os botões de editar só sumiam na interface (`isAdmin &&` espalhado em cinco arquivos).
- **Tokens em `localStorage`** (`legado-v1:src/lib/auth-storage.ts`), já tratado no ADR 0008.
- **Estado fora da URL.** Busca, página e filtros eram copiados de `useSearchParams` para `useState` com debounce e `useEffect` de volta. O pesquisador aberto no drawer não tinha link. A rota `/console/etl/:runId` redirecionava para `/console/etl` e guardava o id em estado local, então o link de uma execução se perdia.
- **Monitoramento do ETL fora do TanStack Query.** `useEtlRunMonitor` (`legado-v1:src/hooks/use-etl.ts`) fazia polling com `setInterval`, guardava logs acumulados em `useState` e tratava erro com `console.error`.
- **Tipos escritos à mão e divergentes da API.** `legado-v1:src/types/academic.ts` previa `researchers_count` na instituição e `etl_status`/`last_synced_at` no pesquisador, campos que a API não envia. A associação a uma coleção mandava `{ attributes }`, mas a API grava o corpo inteiro como atributos, então o valor era gravado aninhado.
- **Catálogo de rotinas no front.** Títulos, descrições e ícones das rotinas do ETL ficavam em `legado-v1:src/lib/etl-routines-catalog.ts`. Rotina nova no ETL aparecia sem nome.
- **Visual próprio.** Tokens `sm-*` (navy, sky, red), cores hex no gráfico e console dentro da moldura pública, sem tema escuro coerente.

### 1.3 O que não faz mais sentido

| Item do legado                                            | Motivo                                                                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Chamada direta ao ETL, `VITE_URL_ETL`, `VITE_ETL_API_KEY` | O ETL só é chamado pela API de admin (ADR 0008). A chave vazada precisa ser trocada no servidor                           |
| `health` do ETL e download do `.jsonl`                    | Não passam pela API de admin. Ver perguntas em aberto                                                                     |
| `role` e `isAdmin` do token                               | Um só papel, lido de `GET /me` (ADR 0008)                                                                                 |
| `triggered_by` enviado pelo front                         | A API de admin preenche com o e-mail ou o `sub` do token; o corpo de `POST /etl/runs` só aceita `routines` e `lattes_ids` |
| Métricas de acesso na entrada do console                  | Vêm do `simcc-back` público, não da API de admin; o próprio GA4 já oferece esses relatórios. Ver §8                       |
| Seletor de sistema (Simcc, ICTite, Licuri)                | Métrica de outros sistemas do Observatório não é tarefa do console do Simcc                                               |

## 2. Públicos e tarefas

**Quem usa:** a equipe do Observatório que mantém o Simcc. São poucas pessoas (dezenas no máximo), todas com o mesmo papel: admin. Usam no computador, com sessões curtas. O celular só precisa funcionar para consultar o estado de uma execução.

| Tarefa                                                                               | Frequência estimada                  | Hoje                            |
| ------------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------- |
| Ver se a última sincronização terminou bem e, se falhou, em que etapa e por quê      | semanal, e sempre que alguém reclama | tela do ETL                     |
| Disparar uma sincronização completa ou de algumas rotinas                            | mensal ou após mudança no cadastro   | tela do ETL                     |
| Atualizar o Lattes de um pesquisador específico                                      | sob demanda (pedido de pesquisador)  | botão na lista e no drawer      |
| Cadastrar pesquisador (nome, Lattes, instituição, coleção), corrigir dados, remover  | semanal em época de carga            | lista e drawer de pesquisadores |
| Manter instituições e coleções (incluindo a cadência de atualização de cada coleção) | raro                                 | telas próprias                  |
| Dar e tirar acesso de admin a alguém                                                 | raro                                 | não existia (dependia do IdP)   |

O console não é lido pelo público, não precisa de SEO e não entra na paridade visual da área pública.

## 3. Capacidades da API de admin

Levantadas em `simcc-admin@v3/develop` (`src/simcc_admin/routers/`, `schemas.py`). Todas exigem token do IdP e admin (`401` sem token válido, `403` sem admin), salvo `GET /me`, que só exige token. Erros vêm como `{ detail }`.

### 3.1 Sessão e administradores

| Rota                        | Parâmetros e corpo                                                                                                   | Resposta                                                       | Erros relevantes    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------- |
| `GET /me`                   | —                                                                                                                    | `{ user: { sub, name, email }, is_admin }`                     | `401`               |
| `GET /admins`               | `q` (sub, nome ou e-mail), `page`, `per_page` (≤100), `sort_by` (`sub`, `name`, `email`, `created_at`), `sort_order` | envelope com `data: AdminPublic[]` e `pagination`              | —                   |
| `POST /admins`              | `{ sub, name?, email? }`                                                                                             | `201 AdminPublic` (`id`, `sub`, `name`, `email`, `created_at`) | `409` sub já existe |
| `DELETE /admins/{admin_id}` | —                                                                                                                    | `{ message }`                                                  | `404`               |

A API não impede remover o último admin nem a si mesmo.

### 3.2 ETL (proxy para o `simcc-etl`)

| Rota                          | Parâmetros e corpo                               | Resposta                                                                                                          |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `GET /etl/routines`           | —                                                | `string[]` (só os ids)                                                                                            |
| `POST /etl/runs`              | `{ routines?: string[], lattes_ids?: string[] }` | `202 { run_id, status }`                                                                                          |
| `GET /etl/runs`               | `limit` (1 a 100, padrão 20); **sem offset**     | lista de execuções                                                                                                |
| `GET /etl/runs/{run_id}`      | —                                                | `{ id, status, started_at, ended_at, triggered_by, current_routine, routines, lattes_ids, steps, error_message }` |
| `GET /etl/runs/{run_id}/logs` | `offset` (≥0), `limit` (1 a 1000, padrão 500)    | `{ lines, next_offset, status }`                                                                                  |

Erros: `400`, `404`, `409` e `422` do ETL são repassados com o `detail` dele; timeout vira `504`, falha de conexão ou status inesperado vira `502`, e ETL não configurado no servidor vira `503`. O `status` é `string` (o legado conhecia `ACCEPTED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `UNKNOWN`), `steps` é `dict[str, Any]` e cada linha de log é `dict[str, Any]`.

### 3.3 Cadastro acadêmico (`/academic/*`)

É a base que alimenta o ETL: quem é coletado (Lattes), a que instituição pertence e com que frequência é atualizado (coleção). O ETL lê essa base pelos exports Parquet abaixo. O `simcc-back` (v2) publica o resultado.

| Recurso                 | Rotas                                                                                                                                        | Listagem                                                                                                                                 | Regras que afetam a interface                                                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instituições            | `GET /academic/institutions`, `GET/PUT/DELETE /academic/institutions/{institution_id}`, `POST /academic/institutions`                        | `q` (nome ou sigla), `page`, `per_page`, `sort_by` (`name`, `acronym`, `created_at`), `sort_order`                                       | `409` se nome ou sigla já existem. Excluir **apaga em cascata as afiliações**, sem aviso da API. Sem contagem de pesquisadores na resposta                                                                 |
| Pesquisadores           | `GET /academic/researchers`, `GET/PUT/DELETE /academic/researchers/{researcher_id}`, `POST /academic/researchers`                            | `q` (nome ou Lattes), `institution_id`, `collection_id`, `page`, `per_page`, `sort_by` (`name`, `lattes_id`, `created_at`), `sort_order` | `409` se o Lattes já existe. Criar sem `collection_ids` põe na coleção padrão (`422` se não houver). Cada item já traz `affiliations` e `collections`. Identificador: `researcher_id`                      |
| Afiliações              | `POST/DELETE /academic/researchers/{researcher_id}/institutions/{institution_id}`                                                            | —                                                                                                                                        | `409` se já existe                                                                                                                                                                                         |
| Coleções do pesquisador | `POST/PUT/DELETE /academic/researchers/{researcher_id}/collections/{collection_id}`                                                          | —                                                                                                                                        | Corpo livre (`dict`) gravado como `attributes`. `409` se já é membro                                                                                                                                       |
| Coleções                | `GET /academic/collections`, `GET/PUT/DELETE /academic/collections/{collection_id}`, `POST /academic/collections`                            | `q` (nome ou slug), `page`, `per_page`, `sort_by` (`name`, `slug`, `created_at`), `sort_order`                                           | `slug` em kebab-case, imutável depois de criado. `refresh_interval_days ≥ 1`. Marcar `is_default` desmarca a anterior. `409` ao excluir a padrão ou uma coleção com pesquisadores. Traz `researcher_count` |
| Exports                 | `GET /academic/{institutions,researchers,collections}/export/parquet`, `GET /academic/researchers/{institutions,collections}/export/parquet` | —                                                                                                                                        | Para o ETL (token de serviço ou admin). **Não são usados pelo console**                                                                                                                                    |

As listas usam o envelope da API de admin: `{ data, pagination: { page, per_page, total_items, total_pages, has_next, has_prev }, filters_applied, sort, meta }`. É diferente do `{ data, meta }` da v2.

### 3.4 Lacunas para levar ao time do `simcc-admin`

1. **Tipar o contrato do ETL**: `status` como enum, `steps` como objeto tipado (status, duração, encontrados, sucesso, falha, erro), linha de log tipada (`timestamp`, `level`, `event`, `routine`). Sem isso, o tipo gerado é `Record<string, unknown>` e a tela teria de validar na borda.
2. **Rotinas com metadados**: `GET /etl/routines` devolver `{ id, title, description, order }`, para o nome das rotinas viver no ETL e não no front.
3. **Histórico paginado**: `offset` (ou `page`) em `GET /etl/runs`, e filtro por `status`, se o histórico precisar ir além das 100 últimas.
4. **Proteção de admins**: `409` ao remover o último admin.
5. **Identificador do pesquisador**: renomear `researcher_id` para `id` no `ResearcherItem`, como na v2 (ou confirmar que fica assim).
6. **Contagem de afiliados na instituição** (`researcher_count`, como já existe na coleção), para a confirmação de exclusão.

Nenhuma delas bloqueia a T12.1. As três primeiras afetam a T12.2.

## 4. Fluxos propostos

### 4.1 Mapa de rotas

| Rota                                   | Tela                                     | Search params                                                                       |
| -------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `/console`                             | Visão geral                              | —                                                                                   |
| `/console/sincronizacao`               | Execuções do ETL e disparo               | —                                                                                   |
| `/console/sincronizacao/$runId`        | Execução: resumo, etapas e logs          | `level` (`info`, `warning`, `error`), `q` (texto nos logs)                          |
| `/console/pesquisadores`               | Lista de pesquisadores                   | `q`, `institution_id`, `collection_id`, `page`, `per_page`, `sort_by`, `sort_order` |
| `/console/pesquisadores/$researcherId` | Pesquisador: dados, afiliações, coleções | —                                                                                   |
| `/console/instituicoes`                | Lista de instituições                    | `q`, `page`, `per_page`, `sort_by`, `sort_order`                                    |
| `/console/instituicoes/$institutionId` | Instituição e pesquisadores afiliados    | `q`, `page` (da lista de afiliados)                                                 |
| `/console/colecoes`                    | Lista de coleções                        | `q`, `page`, `per_page`, `sort_by`, `sort_order`                                    |
| `/console/colecoes/$collectionId`      | Coleção e membros                        | `q`, `page` (da lista de membros)                                                   |
| `/console/administradores`             | Administradores                          | `q`, `page`, `per_page`, `sort_by`, `sort_order`                                    |

`/console/sincronizacao` substitui `/console/etl`: o nome que o legado já mostrava na interface era "Sincronização", e "ETL" não diz nada a quem não é do time técnico. Os nomes dos search params são os da API, como manda o ADR 0002. Valores padrão (`page=1`, `per_page=20`, `sort_by=name`, `sort_order=asc`) não aparecem na URL.

Criar (pesquisador, instituição, coleção, admin), disparar sincronização e confirmar exclusão são **diálogos com estado local**. Depois de criar, a tela navega para a rota do item criado. Depois de disparar, navega para `/console/sincronizacao/$runId`.

A rota de layout `/console` aplica o `beforeLoad` da F1.4 (sessão e `is_admin`). A tela "sem acesso" é da F1.4; esta proposta só pede que ela mostre o `sub` do usuário com um botão de copiar (ver §4.6).

### 4.2 Estados comuns

| Situação           | Onde aparece            | O que a tela faz                                                                                                                     |
| ------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Carregando         | toda tela               | Skeleton com a forma da tabela ou do card (`LoadingBlock`, `Skeleton`). Nada de spinner de página inteira                            |
| Vazio, sem filtro  | listas                  | `EmptyState` com a ação de criar ("Nenhuma instituição cadastrada" + "Nova instituição")                                             |
| Vazio, com filtro  | listas                  | `EmptyState` "Nenhum resultado para os filtros" + "Limpar filtros" (navega sem os params)                                            |
| `401`              | qualquer chamada        | Tratado no cliente da F1.4: renova e repete uma vez; se falhar, volta ao login com a rota atual no `state`. A tela não trata         |
| `403`              | qualquer chamada        | O admin foi removido durante a sessão: a rota mostra "sem acesso" (mesma tela da F1.4)                                               |
| `404`              | rotas de detalhe        | "Não encontrado" com link de volta para a lista (o item foi excluído ou o link está errado)                                          |
| `409`, `422`       | formulários e exclusões | Mensagem junto do campo ou no diálogo, com o `detail` traduzido quando conhecido ("Já existe uma instituição com essa sigla")        |
| `502`, `504`       | telas de sincronização  | Alerta "Não foi possível falar com o serviço de sincronização" + "Tentar novamente". A sessão continua e o resto do console funciona |
| `503`              | telas de sincronização  | Mesmo alerta, com "O serviço de sincronização não está configurado neste ambiente"                                                   |
| Sucesso de mutação | formulários             | Toast curto (`sonner`) e invalidação das queries afetadas                                                                            |

### 4.3 Visão geral (`/console`)

Uma página curta que responde "está tudo bem?":

- card da última execução (status, início, duração, quem disparou, link para a execução) e o botão "Sincronizar agora";
- quatro `StatCard` com o total de pesquisadores, instituições, coleções e admins (`total_items` de cada lista com `per_page=1`);
- atalhos para as áreas.

Se a revisão achar desnecessária, `/console` redireciona para `/console/sincronizacao`.

### 4.4 Sincronização

**Lista (`/console/sincronizacao`).** Tabela das últimas execuções (`GET /etl/runs?limit=20`): status (badge com texto), início, duração, escopo ("Todas as rotinas" ou a lista; "Toda a base" ou N Lattes) e quem disparou. A linha leva à rota da execução. Se houver execução ativa (`ACCEPTED` ou `RUNNING`), ela aparece em destaque no topo e a lista se atualiza sozinha enquanto isso durar.

**Disparo (diálogo).** Rotinas em checkbox (todas marcadas por padrão, na ordem de `GET /etl/routines`), campo opcional de Lattes (um por linha ou separados por vírgula, validados com zod: 16 dígitos) e um resumo antes de confirmar ("Executar 12 rotinas para toda a base"). O botão fica desabilitado enquanto há execução ativa, a menos que o ETL aceite concorrência (pergunta em aberto). Em `202`, navega para a execução.

**Execução (`/console/sincronizacao/$runId`).**

- Cabeçalho: status, início e fim, duração (contando enquanto ativa), quem disparou, escopo, `error_message` em alerta quando houver.
- Etapas: uma linha por rotina, na ordem de `routines`, com status, duração e contadores (encontrados, sucesso, falha) quando existirem; a `current_routine` fica marcada.
- Logs: lista paginada por `offset`, 500 linhas por página, com "Carregar mais". Enquanto a execução está ativa, novas linhas chegam por polling a partir do `next_offset`. Filtro por nível e texto na URL (`level`, `q`), aplicado sobre as linhas já carregadas. Fonte mono, quebra de linha, sem rolagem horizontal da página.
- Polling: `refetchInterval` do TanStack Query no detalhe e nos logs, ligado só com status ativo (sugestão: 3 s). Nada de `setInterval` nem `useEffect` de busca. A forma exata da paginação incremental dos logs (`useInfiniteQuery` ou outra) fica para a T12.2.

**Sincronizar um pesquisador.** Botão na tela do pesquisador: confirma, chama `POST /etl/runs` com `lattes_ids: [lattes_id]` e oferece o link da execução no toast.

### 4.5 Cadastro acadêmico

As três listas seguem o mesmo desenho: cabeçalho com título e botão "Novo…", campo de busca, filtros (só pesquisadores), tabela com ordenação pelos cabeçalhos permitidos pela API e paginação. No mobile, a tabela vira lista de cards.

**Pesquisadores.**

- Lista: nome, Lattes (com link para o currículo), instituições (siglas), coleções. Filtros de instituição e coleção com combobox que busca na API.
- Novo (diálogo): nome, Lattes, instituições e coleções (opcionais; sem coleção, entra na padrão, e o diálogo diz isso). `409` aponta o campo Lattes.
- Detalhe (`/console/pesquisadores/$researcherId`): dados com edição no lugar (nome, Lattes), afiliações (adicionar por combobox, remover), coleções (adicionar, remover), "Sincronizar Lattes" e "Excluir" numa zona de perigo, com confirmação. A rota é uma página, não um drawer: dá link, funciona no mobile e evita a rota com overlay na primeira versão. Pode virar overlay sobre a lista depois, pelo ADR 0004.
- Atributos de coleção (`attributes`) ficam fora até alguém dizer para que servem.

**Instituições.** Lista: sigla, nome, cadastro. Detalhe: dados editáveis e a lista de pesquisadores afiliados (a mesma tabela, com `institution_id` fixo). Excluir mostra quantas afiliações serão apagadas (via `total_items` de `/academic/researchers?institution_id=&per_page=1`) e pede para digitar a sigla.

**Coleções.** Lista: nome, slug, intervalo de atualização ("a cada 7 dias"), padrão, nº de pesquisadores. Detalhe: dados editáveis (o slug não muda), "Tornar padrão" (avisa qual deixa de ser), membros. "Excluir" fica desabilitado, com o motivo, para a coleção padrão ou com membros, em vez de esperar o `409`.

### 4.6 Administradores (`/console/administradores`)

- Lista: nome, e-mail, `sub`, desde quando. A linha do próprio usuário tem a marca "você".
- Adicionar (diálogo): `sub` (obrigatório), nome e e-mail (opcionais, só para reconhecer na lista). O admin não tem como descobrir o `sub` de alguém sozinho, então o caminho proposto é: a pessoa entra no console, cai em "sem acesso", copia o próprio `sub` exibido ali e envia a um admin. `409` vira "Essa pessoa já é admin".
- Remover: confirmação com nome e e-mail. O botão fica desabilitado na própria linha e quando só resta um admin, até a API proteger isso (§3.4).

## 5. Kit

**Proposta: o console adota o kit público, com uma variação da moldura.**

Por que o kit serve:

- Os princípios de `design-kit/DESIGN.md` §1 já descrevem uma ferramenta de trabalho: moldura neutra com conteúdo em branco, um azul só para ação, "densidade de painel de dados" (corpo 14px, metadados 12px, controles de 32 a 40px).
- O console precisa de tabela, badge, input, select, checkbox, dialog, sheet, tabs, toast, skeleton, `EmptyState`, `StatCard` e alerta, que a F1.2 já entrega (`src/shared/ui/`). Um segundo sistema visual dobraria a manutenção, como aconteceu com os tokens `sm-*` do legado.
- Tema claro e escuro, foco visível e regras de acessibilidade (§9) vêm junto.

O que muda em relação à área pública:

| Item             | Área pública                               | Console                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Moldura (§6.1)   | sidebar da plataforma, topbar com "Entrar" | mesma estrutura (sidebar, topbar 40px, painel, crumbbar), com a navegação do console, a marca "Console" na topbar, o menu do usuário (nome, e-mail, sair) e o link "Voltar ao Observatório"                                                                                      |
| Templates (§6.2) | A a F                                      | **C (listagem)** em versão de tabela: cabeçalho, busca, filtros, tabela, paginação; sem card de total com fundo ilustrado e sem seções colapsáveis. **E (perfil)** simplificado para os detalhes: card de cabeçalho sem avatar, blocos em cards, coluna lateral só quando houver |
| Cor por dado     | dicionários de área, Qualis, produção      | um dicionário novo, **status da execução** (ativa, concluída, falhou, desconhecida), em `design-tokens.ts`, sempre com texto ao lado. Pode reaproveitar `status-andamento` e `status-concluida` e o `danger` do kit; a decisão fica na T12.2                                     |
| Destrutivo       | quase não existe                           | botão `destructive` só dentro de diálogo de confirmação ou zona de perigo                                                                                                                                                                                                        |
| Microcopy (§8)   | —                                          | igual: pt-BR, sentence case, números com separador de milhar, datas em `pt-BR` com hora                                                                                                                                                                                          |

A seção "Fora do escopo" do `DESIGN.md` deve passar a apontar para esta proposta quando ela for aprovada, e o kit ganha um parágrafo sobre a moldura do console.

## 6. Arquitetura

### 6.1 Onde fica cada coisa

| Camada        | Proposta                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/`        | `admin.ts` (da F1.4): cliente `openapi-fetch` da API de admin, com o token, a renovação e a normalização de `{ detail }` para `ApiError`. `generated/simcc-admin.d.ts`: tipos gerados (§6.2)                                                                                                                                                                                                              |
| `entities/`   | `etl-run` (execução, rotinas, logs), `academic-researcher`, `academic-institution`, `academic-collection`, `admin-account`. Cada uma com `model.ts` (tipos de `components['schemas']`, rótulos), `queries.ts` (`queryOptions` e mutações) e `ui/` (badge de status, ref com link, tabela reutilizável). O prefixo `academic-` evita confusão com `researcher` e `institution` da v2, que são outro modelo |
| `features/`   | `console-shell` (moldura e navegação), `console-overview`, `console-sync`, `console-researchers`, `console-institutions`, `console-collections`, `console-admins`. A tabela de pesquisadores usada nos detalhes de instituição e coleção fica em `entities/academic-researcher/ui/`, porque uma feature não importa outra                                                                                 |
| `routes/`     | `console.tsx` (layout com o `beforeLoad` da F1.4), `console/index.tsx`, `console/sincronizacao/index.tsx`, `console/sincronizacao/$runId.tsx` e assim por diante, cada uma com `validateSearch` (zod) e `loader` com `ensureQueryData`                                                                                                                                                                    |
| `shared/lib/` | `design-tokens.ts` ganha o dicionário de status da execução                                                                                                                                                                                                                                                                                                                                               |

Query keys no padrão do `arquitetura.md`: `['etl-run', 'list']`, `['etl-run', 'detail', runId]`, `['etl-run', 'logs', runId]`, `['etl-routine', 'list']`, `['academic-researcher', 'list', search]`, `['academic-researcher', 'detail', id]`, `['admin-account', 'list', search]`. Cada mutação invalida as listas e o detalhe que altera; associar ou remover afiliação invalida também o detalhe da instituição.

### 6.2 Tipos da API de admin

O `simcc-admin` é FastAPI e publica `openapi.json` na raiz (respeitando o `ROOT_PATH`). Proposta, como extensão do [ADR 0003](../decisoes/0003-tipos-gerados-do-openapi.md):

- um script `npm run api:types:admin` gera `src/api/generated/simcc-admin.d.ts` a partir de `<VITE_ADMIN_API_URL>openapi.json`, e o arquivo é commitado, como o da v2;
- `src/api/admin.ts` usa `openapi-fetch` com esses tipos;
- os campos que a API ainda devolve como `dict` (`steps`, linhas de log, `attributes`) não ganham interface à mão. Se o backend não tipar a tempo (§3.4), a T12.2 valida esses campos com zod na borda, como o adaptador da ODA, e registra isso no ADR.

Isso vira um ADR novo no início da T12.1, porque cria um segundo contrato gerado e um script novo no `package.json`.

### 6.3 Dependências

- **F1.4**: sessão, `beforeLoad` com `is_admin`, `useSession()`, tela "sem acesso", `src/api/admin.ts`. Sem ela, nenhuma tela do console pode ser feita.
- **F1.2**: primitivos (feita).
- **F1.3**: a moldura pública. O console reaproveita as peças dela (sidebar, topbar, crumbbar); se elas ficarem dentro de `features/shell`, a T12.1 as desce para `shared/ui/`.
- **F1.6**: MSW, para testar as telas com a API de admin simulada.
- **F1.5**: o motor de listagem foi pensado para o envelope da v2. As listas do console usam o motor se ele aceitar o envelope com `pagination`; senão, ficam com tabela e paginação simples, sem esperar por ele.
- **Ambiente**: a `v3/develop` do `simcc-admin` não está publicada. Para desenvolver, roda-se a API de admin localmente (com um ETL local ou com `ETL_API_URL` vazio, o que dá `503` nas telas de sincronização) ou usa-se o MSW.

## 7. Fora do escopo

- Métricas de acesso (GA4) e páginas mais vistas, inclusive de outros sistemas.
- Papéis, permissões por área, instituições vinculadas a admin (ADR 0008).
- Gestão de usuários, senhas ou sessões do IdP.
- Edição de dados publicados (produções, programas, grupos): a v2 é só leitura e grupos vêm da ODA ([ADR 0007](../decisoes/0007-escopo-de-dados.md)).
- Exportação CSV ([ADR 0006](../decisoes/0006-sem-exportacao-csv.md)) e os exports Parquet do admin, que são do ETL.
- Download do arquivo de logs e checagem de saúde do ETL, enquanto a API de admin não os expuser.
- Agendamento do ETL pelo console.
- Edição dos `attributes` da associação pesquisador–coleção.
- Importação em lote de pesquisadores por planilha (o admin tem um script de seed para isso).

## 8. Perguntas em aberto

**Para a revisão do front:**

1. A visão geral (§4.3) entra, ou `/console` redireciona para a sincronização?
2. `/console/sincronizacao` ou manter `/console/etl`?
3. Detalhe do pesquisador como página (proposta) ou como overlay sobre a lista?
4. O console precisa de métricas de acesso em algum momento? Se sim, a fonte é a API de admin, não o `simcc-back` público.

**Para o time do `simcc-admin` e do ETL:**

5. As lacunas da §3.4 (tipagem do ETL, metadados das rotinas, paginação do histórico, último admin, `researcher_id`, contagem na instituição): quais entram, e quando?
6. O ETL aceita duas execuções ao mesmo tempo? O que acontece se houver uma ativa?
7. `routines` e `lattes_ids` vazios significam "todas as rotinas padrão" e "toda a base"? Qual a ordem das rotinas?
8. O `researcher_id` do admin é o mesmo `id` do pesquisador na v2? Se for, o console liga para o perfil público (`/pesquisadores/$id`); se não, a ligação seria pelo Lattes, e isso precisa de rota na v2.
9. Excluir um pesquisador ou uma instituição no admin remove os dados publicados na próxima sincronização? A confirmação precisa dizer isso.
10. Para que servem os `attributes` da associação a uma coleção?
11. Download dos logs e saúde do ETL: vale expor pela API de admin?

**Para o `simcc-back`:**

12. `GET /v2/analytics` (e `/v2/analytics/pages`, que nem está no OpenAPI da v2) deve continuar público, já que o console não vai mais consumi-lo?

## 9. Fatiamento proposto

Cartões para a onda 4, todos dependentes da aprovação desta proposta. Não entram no quadro do roadmap até lá.

| ID    | Cartão                     | Depende de  | Pronto quando                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T12.1 | Moldura do console e tipos | F1.4, F1.3  | ADR dos tipos da API de admin aceito; `npm run api:types:admin` gera e commita `simcc-admin.d.ts`; rota de layout `/console` com `beforeLoad` da F1.4 e moldura do console (navegação, menu do usuário, sair, voltar ao Observatório), em 1440px e 375px, claro e escuro; "sem acesso" mostra o `sub` com botão de copiar; `/console` com a visão geral (ou o redirect decidido na revisão); teste com a API simulada para admin, não admin e sem sessão |
| T12.2 | Sincronização              | T12.1, F1.6 | Lista de execuções, execução por rota (`/console/sincronizacao/$runId`) com etapas e logs paginados por `offset`, filtro de logs na URL, disparo com escolha de rotinas e de Lattes, polling só com execução ativa via TanStack Query, estados `502`/`503`/`504` sem derrubar a sessão; dicionário de status da execução em `design-tokens.ts` com teste; nenhuma chamada ao ETL fora da API de admin                                                    |
| T12.3 | Pesquisadores              | T12.1, F1.6 | Lista com `q`, `institution_id`, `collection_id`, paginação e ordenação na URL; criar, editar, excluir com confirmação; afiliações e coleções; "Sincronizar Lattes" (usa a mutação da `etl-run`); `409` e `422` nos campos; teste com a API simulada                                                                                                                                                                                                     |
| T12.4 | Instituições               | T12.3       | Lista e detalhe com pesquisadores afiliados (tabela da T12.3); criar, editar, excluir com o número de afiliações afetadas; teste com a API simulada                                                                                                                                                                                                                                                                                                      |
| T12.5 | Coleções                   | T12.3       | Lista e detalhe com membros; criar, editar, tornar padrão; excluir bloqueado com o motivo para a padrão ou com membros; teste com a API simulada                                                                                                                                                                                                                                                                                                         |
| T12.6 | Administradores            | T12.1, F1.6 | Lista com busca e ordenação na URL; adicionar por `sub`; remover com confirmação, bloqueado para si mesmo e para o último admin; teste com a API simulada                                                                                                                                                                                                                                                                                                |

A T12.2 vem logo depois da moldura porque, na virada, o console antigo sai do ar e a sincronização é a tarefa mais frequente. A T12.6 pode ir em paralelo com a T12.3. O inventário (`legado/inventario.md`) ganha uma linha por rota do console quando cada cartão for feito, e a linha `/console/*` fica "feita" quando o último cartão for concluído.
