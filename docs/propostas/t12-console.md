# Proposta T12 — Reimaginação do Console Administrativo

- **Status:** aprovada em 2026-11-22, com as decisões abaixo. Implementação dividida em T12.1, T12.2 e T12.3 (`docs/roadmap.md`).
- **Decisões do responsável:**
  - visual do kit público (`--sc-*` e `src/shared/ui/`), sem tokens `sm-*`;
  - tokens de status de execução (sucesso, falha, em execução, na fila) no tema: grupo `color.run-status` em `tokens.json`, classes `bg-run-*`, cor escolhida por `runStatusColor` em `src/shared/lib/design-tokens.ts`;
  - métricas do GA4 fora da primeira versão: a visão geral mostra o último run do ETL e as contagens (instituições, pesquisadores, coleções, admins);
  - o operador cadastra um admin digitando o `sub`; a tela "sem acesso" mostra o `sub` do usuário logado com botão de copiar, além de "Voltar ao observatório", "Trocar de conta" (`prompt=login`) e "Sair";
  - tipos da API de admin gerados do OpenAPI (`src/api/generated/simcc-admin.d.ts`, `npm run api:types`).
- **Data:** 2026-11-20
- **Referências principais:** [ADR 0002](../decisoes/0002-url-como-estado.md), [ADR 0003](../decisoes/0003-tipos-gerados-do-openapi.md), [ADR 0004](../decisoes/0004-modais-e-drawers-como-rotas.md), [ADR 0005](../decisoes/0005-tailwind-4-e-design-kit.md), [ADR 0008](../decisoes/0008-autenticacao.md), [ADR 0009](../decisoes/0009-analytics-page-view-por-caminho.md), [arquitetura.md](../arquitetura.md), [design-kit/DESIGN.md](../../design-kit/DESIGN.md)

---

## 1. Contexto e objetivo

O objetivo da tarefa **T12** é **reimaginar o Console administrativo do Simcc** sobre a nova arquitetura do front-end e sobre a versão `v3/develop` da API administrativa (`simcc-admin`), em vez de portar tela a tela o módulo existente em `legado-v1:src/components/console/`.

No legado, o console acumulou falhas estruturais e de segurança que inviabilizam o porte direto:

1. **Segurança e autorização quebradas:** `ProtectedRoute` verificava apenas `isAuthenticated`, sem exigir `isAdmin`. Usuários comuns do IdP conseguiam abrir `/console`, listar/criar/editar instituições, pesquisadores e coleções, e até disparar sincronizações do ETL pela tabela de pesquisadores. Além disso, `isAdmin` vinha do campo `role` do IdP (tornando qualquer admin do Observatório um admin do Simcc), os tokens ficavam em `localStorage` e cookies, e o navegador chamava o serviço ETL diretamente enviando uma chave estática (`VITE_ETL_API_KEY`) exposta no bundle público.
2. **Identidade visual e CSS fragmentados:** a maior parte do console usava tokens proprietários `sm-*` (`#2B2D74`, `#5B9BDD`, `#D43441`) apenas em tema claro, enquanto a moldura (`Header.tsx`, `AppSidebar`), `page-views-card.tsx` e `etl-activity-feed.tsx` usavam estilos do tema público/shadcn com suporte parcial a modo escuro.
3. **Estado fora da URL e links quebrados:** a busca, os filtros e a paginação eram duplicados entre `useState` e `useSearchParams`; abrir um pesquisador usava `useState` local (`ResearcherDetailDrawer`), sem link compartilhável; e `/console/etl/:runId` apagava o `runId` da URL logo após montar (`navigate('/console/etl', { replace: true })`), quebrando o F5.
4. **Lacuna funcional de administração:** o modelo novo ([ADR 0008](../decisoes/0008-autenticacao.md)) retira do IdP a gestão de papéis do Simcc e cria `/admins` na `simcc-admin`, exigindo uma nova tela no console para gerenciar quem é administrador.

O novo Console deve ser um ambiente operacional enxuto, seguro e previsível para administrar o cadastro acadêmico (instituições, pesquisadores e coleções), operar e auditar o pipeline ETL via `simcc-admin`, gerenciar administradores da plataforma e acompanhar indicadores operacionais.

---

## 2. Público e modelo de acesso

Conforme o [ADR 0008](../decisoes/0008-autenticacao.md) e a tarefa **F1.4**:

- **Papel único (`admin`):** até segunda ordem, **o admin faz tudo**. Não existem papéis intermediários, nem escopo restrito por instituição, grande área ou funcionalidade.
- **Autenticação vs. autorização:**
  - **IdP (`/idp/`)** autentica via OAuth 2.0 + PKCE (`aud: "simcc"`). O campo `role` presente no JWT pertence a outros sistemas do Observatório e é **ignorado pelo Simcc**.
  - **`simcc-admin`** autoriza via `GET <admin>/me`, retornando `{ user: { sub, name, email }, is_admin }`.
  - **Tokens só em memória:** `access_token` (15 min) e `refresh_token` rotacionado (30 dias) nunca vão para `localStorage` ou `sessionStorage`; a renovação passa por uma fila única na camada `src/api/`.
- **Comportamento por perfil de visitante:**
  1. **Visitante anônimo na área pública:** navega livremente por todo o Observatório (`simcc-back` v2 e ODA são públicos e somente leitura). O atalho "Console" na topbar não deve ser exibido para visitantes anônimos nem para usuários sem `is_admin` (diferente do legado `Header.tsx`, que mostrava o botão para todos).
  2. **Visitante anônimo acessando `/console/*` diretamente:** o `beforeLoad` redireciona para `/authorize?prompt=none` no IdP guardando a URL completa de destino (path + search) no `state`. Se houver sessão ativa no IdP (`idp_session`), retorna ao `/auth/callback` sem pedir senha e segue para a rota original; caso o IdP devolva `error=login_required`, redireciona para o login interativo.
  3. **Usuário logado sem `is_admin` (`is_admin === false` ou `403` da API de admin):** vê uma tela dedicada de **"Sem acesso"** dentro do fluxo do console, exibindo o usuário autenticado, explicando que a conta não possui permissão de administrador do Simcc e oferecendo ações claras: **"Voltar ao observatório"** (`/`), **"Trocar de conta"** (fluxo com `prompt=login`) e **"Sair"** (`end_session`).
  4. **Usuário logado com `is_admin === true`:** acessa todas as rotas e operações de `/console/*` e enxerga o atalho "Console" na topbar da área pública.

---

## 3. Levantamento do legado (`legado-v1:src/components/console/`)

O console legado possuía **21 arquivos** em `src/components/console/` (14 na raiz e 7 em `etl/`), além de infraestrutura de apoio em rotas, sidebar, serviços e hooks. A tabela abaixo inventaria cada item com a decisão recomendada (**manter**, **reimaginar** ou **descartar**).

### 3.1 Componentes e páginas em `src/components/console/`

| Arquivo legado                 | O que fazia                                                                                                                                                  | Decisão                                          | Justificativa e destino no novo front                                                                                                                                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `console-page.tsx`             | Página `/console` com 4 KPIs de GA4 (últimos 30 dias), gráfico de linhas `Recharts`, top 5 países, top 5 eventos (`GET /v2/analytics`) e `<PageViewsCard />` | **Reimaginar**                                   | Transformar `/console` em **Visão geral operacional** (status da última execução ETL, atalhos para cadastros/logs, totais cadastrais) e definir com o time se as métricas GA4 permanecem aqui ou em painel próprio (ver §5). Eliminar hex inline e `sm-*`                                                                                        |
| `page-views-card.tsx`          | Card de visualizações por caminho (`GET /v2/analytics/pages`) com seletor de sistema (`simcc`, `ictite`, `licuri`) e paginação em `useState`                 | **Reimaginar** (sujeito a confirmação de escopo) | Se mantido na visão geral, mover estado de `system`/`page` para search params (ADR 0002), adotar primitivos do kit e confirmar se `ictite`/`licuri` pertencem ao console do Simcc                                                                                                                                                                |
| `institutions-page.tsx`        | Lista paginada de instituições (`q`, `page`, `sort_by`, `sort_order`) com CRUD via modais e clique navegando para `/console/instituicoes/:id`                | **Reimaginar**                                   | Manter rota `/console/instituicoes`, substituindo `useState`+`useEffect` por `validateSearch` (zod) + `loader`, usando `api/admin.ts` e `EmptyState`/`LoadingBlock` do kit                                                                                                                                                                       |
| `institution-dialog.tsx`       | `Dialog` para criar/editar instituição (`acronym` até 20 chars em maiúsculas, `name`)                                                                        | **Manter** (adaptado)                            | Interação efêmera adequada a `Dialog` (ADR 0004). Adaptar validação para zod, mapear `ApiError` (`409`/`422`) sem fechar o modal em erro                                                                                                                                                                                                         |
| `institution-detail-page.tsx`  | `/console/instituicoes/:id` com breadcrumb manual, ações Editar/Excluir e `<ResearcherListTable fixedInstitutionId={id} />` com ação "Desvincular"           | **Reimaginar**                                   | Manter rota `/console/instituicoes/$institutionId`. Usar `Crumbbar` da moldura, adicionar ação de vincular pesquisador existente (além de criar novo já vinculado) e corrigir uso de `id` vs `researcher_id` conforme contrato                                                                                                                   |
| `researchers-page.tsx`         | Wrapper fino de cabeçalho para `<ResearcherListTable />` em `/console/pesquisadores`                                                                         | **Reimaginar**                                   | Fundir na definição da rota `/console/pesquisadores` com `validateSearch` e `loader`                                                                                                                                                                                                                                                             |
| `researcher-list-table.tsx`    | Tabela de pesquisadores com busca, filtro de instituição e coleção, ordenação, botão "Sincronizar" por linha, paginação e drawer em `useState`               | **Reimaginar**                                   | Mover filtros e paginação para a URL (ADR 0002), transformar o detalhe do pesquisador em rota filha com overlay (ADR 0004) e ligar "Sincronizar" ao `POST /etl/runs` via `simcc-admin` com feedback e link para `/console/etl/$runId`                                                                                                            |
| `researcher-detail-drawer.tsx` | `Sheet` para editar nome/`lattes_id`, vincular/desvincular instituições e coleções, disparar sync Lattes e excluir pesquisador                               | **Reimaginar**                                   | Virar rota `/console/pesquisadores/$researcherId` em overlay (`Sheet`/drawer sobre a lista ou página direta no F5, ADR 0004). Trocar `<select>` nativo por `Select`/`Popover` do kit                                                                                                                                                             |
| `researcher-create-dialog.tsx` | `Dialog` para cadastrar pesquisador (nome, Lattes 16 dígitos, instituições, coleções), tratando `409` e abrindo o detalhe após criar                         | **Manter** (adaptado)                            | Manter como `Dialog` efêmero (ADR 0004). Corrigir leitura de erro para `ApiError` (`status === 409`) e navegar para `/console/pesquisadores/$researcherId` ao criar                                                                                                                                                                              |
| `institution-combobox.tsx`     | `InstitutionCombobox` (única) e `MultiInstitutionSelect` (múltipla) com busca remota (`q`, `per_page: 50`)                                                   | **Reimaginar**                                   | Reconstruir com `Popover` + `Input` de `src/shared/ui/` e corrigir o bug em que `MultiInstitutionSelect` perdia nome/sigla de itens selecionados quando o termo de busca `q` filtrava a lista para fora dos 50 resultados                                                                                                                        |
| `institution-chip.tsx`         | `InstitutionChip` e `AffiliationChipsGroup` exibindo siglas até `maxVisible` + contador `+N`                                                                 | **Descartar** (absorver)                         | Mover representação de vínculo/tag institucional para `entities/admin-institution/ui/` usando `Tag`/`Badge` de `src/shared/ui/`                                                                                                                                                                                                                  |
| `collections-page.tsx`         | Lista paginada de coleções com criação/edição, exclusão (bloqueada se `is_default`) e clique abrindo `/console/pesquisadores?collection_id=`                 | **Reimaginar**                                   | Manter em `/console/colecoes` com `validateSearch` (zod) e atalho para `/console/pesquisadores?collection_id=$id`. Edição em `Dialog` é suficiente dada a simplicidade da entidade                                                                                                                                                               |
| `collection-dialog.tsx`        | `Dialog` para criar/editar coleção (`name`, `slug` auto-gerado na criação e imutável na edição, `description`, `refresh_interval_days`)                      | **Manter** (adaptado)                            | Adequado como `Dialog` efêmero (ADR 0004), com validação zod e exibição inline de `409`/`422` sem fechar em falha                                                                                                                                                                                                                                |
| `confirm-impact-dialog.tsx`    | `AlertDialog` padronizado com alerta visual de impacto antes de ações destrutivas ou desvinculações                                                          | **Manter** (promover)                            | Bom padrão de UX para operações irreversíveis. Reconstruir sobre `Dialog` de `src/shared/ui/` (ou primitivo equivalente em `shared/ui/`)                                                                                                                                                                                                         |
| `etl/etl-page.tsx`             | Tela `/console/etl(/:runId)` com foco na execução ativa/última, stepper, histórico, disparo e gaveta de logs                                                 | **Reimaginar**                                   | Separar `/console/etl` (histórico + disparo) e `/console/etl/$runId` (foco da execução preservado no F5 — corrigindo o bug do legado que substituía a URL por `/console/etl`). Consumir apenas `simcc-admin` (`/etl/*`)                                                                                                                          |
| `etl/etl-header-summary.tsx`   | Card com status da execução, timer em tempo real, barra de progresso, botão "Logs técnicos" e mensagem de erro                                               | **Reimaginar**                                   | Manter resumo com timer e progresso, corrigindo cálculo quando a etapa falha ou está na fila e usando tokens padronizados do kit                                                                                                                                                                                                                 |
| `etl/etl-stepper.tsx`          | Lista de etapas (`routines`/`steps`) com tradução amigável via catálogo e expansão de métricas (`duration_ms`, `found`, `succeeded`, `failed`, `error`)      | **Manter** (reimaginado)                         | Excelente para leitura operacional sem exigir conhecimento dos nomes internos das rotinas; adaptar visual ao kit e usar metadados da API quando disponíveis                                                                                                                                                                                      |
| `etl/etl-history-table.tsx`    | Tabela das últimas 20 execuções com status, escopo, duração e botão "Ver"/"Em foco"                                                                          | **Reimaginar**                                   | Adicionar paginação/filtros na URL se a API suportar e transformar cada linha em navegação real para `/console/etl/$runId`                                                                                                                                                                                                                       |
| `etl/etl-trigger-dialog.tsx`   | `Dialog` para disparar ETL (base completa por padrão + seção avançada com `lattes_ids` e checklist de `routines`)                                            | **Reimaginar**                                   | Manter como `Dialog` efêmero (ADR 0004). Remover `triggered_by` enviado pelo cliente (servidor identifica pelo JWT), validar cada Lattes ID (16 dígitos) e tratar `409` (lock ativo) e `502`/`504` sem encerrar sessão                                                                                                                           |
| `etl/etl-technical-sheet.tsx`  | `Sheet` de logs brutos com busca, filtro por nível (`all`, `error`, `warning`), cópia e botão `.jsonl` via URL direta do ETL                                 | **Reimaginar**                                   | **Descartar** download direto em `baseURLEtl/.../download` (expunha o serviço ETL sem auth). Ler logs paginados via `GET /etl/runs/{run_id}/logs?offset=&limit=` na `simcc-admin` (como aba da rota `/console/etl/$runId` ou `Sheet` com filtros) e copiar/exportar do buffer autenticado (ou endpoint de download da `simcc-admin`, se existir) |
| `etl/etl-activity-feed.tsx`    | Card "Atividades Recentes do Pipeline" exibindo os últimos 8 logs                                                                                            | **Descartar**                                    | Código morto no legado (não era importado por `etl-page.tsx`) e visualmente desalinhado do restante; o `EtlStepper` + visão de logs suprem a necessidade                                                                                                                                                                                         |

### 3.2 Infraestrutura de apoio no legado e lacuna identificada

| Item no legado                                   | O que fazia                                                                                      | Decisão               | Motivo                                                                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protected-route.tsx`                            | Checava apenas `isAuthenticated`, redirecionando para `/` durante `login()`                      | **Descartar**         | Substituído pelo `beforeLoad` do TanStack Router exigindo sessão + `is_admin` (F1.4 / ADR 0008)                                                                              |
| `apiEtl` (`src/lib/api.ts`) + `VITE_ETL_API_KEY` | Cliente axios direto para `VITE_URL_ETL` com chave pública no bundle                             | **Descartar**         | Front nunca fala com o ETL; toda chamada ETL passa pela `simcc-admin` com Bearer token (ADR 0008)                                                                            |
| `lib/etl-routines-catalog.ts`                    | Mapa local de IDs de rotina para título, descrição, categoria e ícone + `getFriendlyStatusText`  | **Reimaginar**        | Mover para `entities/etl/model.ts` como fallback amigável (sem classes Tailwind genéricas hardcoded), priorizando dados de `GET /etl/routines`                               |
| `app-sidebar.tsx` (`consoleData`)                | Menu lateral com "Métricas de Acesso", "Cadastro Acadêmico" e "Operação" condicional a `isAdmin` | **Reimaginar**        | Menu exclusivo do console com: Visão geral, Pesquisadores, Instituições, Coleções, Sincronização (ETL), **Administradores** (novo) e link de retorno ao Observatório público |
| **Gestão de administradores**                    | _Inexistente no legado_                                                                          | **Criar (essencial)** | Exigido pelo ADR 0008 (`GET\|POST /admins`, `DELETE /admins/{admin_id}`) para não depender mais do IdP                                                                       |

---

## 4. O que o novo console precisa fazer (escopo funcional)

### 4.1 Fluxos principais e jornadas passo a passo

1. **Guarda de entrada (`/console/*`)**
   - Admin acessa `/console` (ou deep link como `/console/etl/<run_id>`).
   - `beforeLoad` verifica sessão em memória. Se ausente, inicia retomada silenciosa (`prompt=none` no IdP, salvando path + search no `state`).
   - Com token válido, consulta `GET <admin>/me`. Se `is_admin === false`, exibe a tela **"Sem acesso"**; se `true`, carrega a rota solicitada.
2. **Visão geral (`/console`)**
   - Exibe o estado operacional da plataforma: último(s) `run(s)` do ETL (`GET /etl/runs`), situação atual (em execução, sucesso, falha), atalho rápido para "Sincronizar agora" ou abrir os logs da última falha, contagens resumidas de instituições, pesquisadores, coleções e administradores, e (se confirmado em §5) o painel de audiência do GA4.
3. **Instituições (`/console/instituicoes` e `/console/instituicoes/$institutionId`)**
   - Listagem paginada com busca por sigla/nome (`?q=`), ordenação (`acronym`, `name`, `created_at`) e paginação (`?page=&per_page=`).
   - Ações na lista: criar instituição (`Dialog`), editar (`Dialog`), excluir (`ConfirmImpactDialog`), clicar na linha para abrir `/console/instituicoes/$institutionId`.
   - No detalhe (`/console/instituicoes/$institutionId`): editar/excluir a instituição, visualizar e filtrar os pesquisadores vinculados, cadastrar um pesquisador já pré-vinculado à instituição (`Dialog`), vincular pesquisador existente (se suportado pelo contrato) e desvincular pesquisador da instituição com confirmação de impacto.
4. **Pesquisadores (`/console/pesquisadores` e `/console/pesquisadores/$researcherId`)**
   - Listagem paginada com filtros sincronizados na URL: `?q=`, `?institution_id=`, `?collection_id=`, `?sort_by=`, `?sort_order=`, `?page=&per_page=`.
   - Cadastrar pesquisador (`Dialog`): valida nome, Lattes ID (exatamente 16 dígitos numéricos), instituições e coleções opcionais. Em `409`, destaca o erro no campo `lattes_id` sem fechar o modal; no sucesso, navega para `/console/pesquisadores/$researcherId`.
   - Detalhe em rota com overlay (`Sheet`/drawer sobre a lista em `/console/pesquisadores/$researcherId`, ou página direta ao abrir o link): editar nome e Lattes ID, adicionar/remover vínculos institucionais, adicionar/remover coleções, disparar sincronização individual do Lattes (`POST /etl/runs` com `lattes_ids: [lattes_id]`, oferecendo link imediato para `/console/etl/$runId`) e excluir pesquisador (`ConfirmImpactDialog`).
5. **Coleções (`/console/colecoes`)**
   - Listagem paginada (`?q=&page=&per_page=&sort_by=&sort_order=`) exibindo nome, slug, descrição, frequência de atualização em dias, total de pesquisadores e marcação de coleção padrão (`is_default`).
   - Criar e editar coleção em `Dialog`; excluir com confirmação de impacto (ação desabilitada quando `is_default === true`).
   - Clicar na coleção (ou no botão "Ver pesquisadores") navega para `/console/pesquisadores?collection_id=$id`.
6. **Sincronização e ETL (`/console/etl` e `/console/etl/$runId`)**
   - `/console/etl`: lista histórico de execuções (`GET /etl/runs`) com status, data/hora, escopo e duração, e botão "Sincronizar agora" (`EtlTriggerDialog`: base completa ou modo avançado com seleção de rotinas de `GET /etl/routines` e lista validada de Lattes IDs). Ao disparar (`202 { run_id, status }`), navega para `/console/etl/$runId`.
   - `/console/etl/$runId`: rota dedicada à execução específica. Carrega `GET /etl/runs/{run_id}` e `GET /etl/runs/{run_id}/logs?offset=&limit=`, exibe cabeçalho com progresso e timer, stepper de etapas com métricas expandíveis e visualizador de logs com filtro por nível (`all`, `error`, `warning`) e busca textual. Mantém polling automático enquanto o status for `ACCEPTED` ou `RUNNING`, encerrando ao atingir `SUCCEEDED` ou `FAILED` (e limpando timers ao desmontar).
7. **Administradores (`/console/admins`) — tela nova essencial**
   - Listagem paginada (`?q=&page=&per_page=`) de administradores cadastrados (`GET /admins`), exibindo identificador, `sub` do IdP e dados de identificação disponíveis na resposta.
   - Adicionar administrador (`Dialog` via `POST /admins`), tratando `409` (já cadastrado) e `422` sem fechar o modal.
   - Remover administrador (`DELETE /admins/{admin_id}`) com `ConfirmImpactDialog`, exibindo aviso reforçado se o registro corresponder ao próprio usuário logado (`sub === session.user.sub`), prevenindo perda acidental de acesso.

### 4.2 Tratamento de erros e resiliência de sessão

Toda falha da API de admin chega normalizada como `ApiError` (`status`, `code`, `message`, `details`) via `src/api/admin.ts`:

| Status HTTP   | Significado                                                                 | Comportamento do Console                                                                                                                                                                                           |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `401`         | Token ausente, inválido ou expirado                                         | `api/admin.ts` tenta renovar uma única vez pela fila única de refresh; se falhar, aciona `prompt=none` / login preservando a URL atual                                                                             |
| `403`         | Sessão válida, mas usuário não é admin (ou foi removido da tabela `admins`) | Invalida cache de `/me` e renderiza a tela **"Sem acesso"**; nunca entra em loop de redirecionamento para o IdP                                                                                                    |
| `409`         | Conflito de domínio (Lattes/slug/`sub` duplicado ou lock ativo no ETL)      | Mantém o diálogo aberto exibindo mensagem objetiva; no lock de ETL, orienta aguardar ou abrir a execução ativa                                                                                                     |
| `422`         | Erro de validação de campos                                                 | Mapeia `ApiError.details` para os respectivos campos do formulário                                                                                                                                                 |
| `502` / `504` | Falha ou timeout da `simcc-admin` ao comunicar com o serviço de ETL         | Exibe alerta acionável na área/toast ("Serviço de sincronização indisponível no momento") com botão "Tentar novamente"; **nunca encerra a sessão nem limpa tokens** ([ADR 0008](../decisoes/0008-autenticacao.md)) |
| `0` / `5xx`   | Rede indisponível ou erro interno inesperado                                | Estado de erro recuperável na seção ("Tentar novamente") sem descartar formulários abertos                                                                                                                         |

### 4.3 Estado na URL ([ADR 0002](../decisoes/0002-url-como-estado.md)) e Rotas vs. Diálogos ([ADR 0004](../decisoes/0004-modais-e-drawers-como-rotas.md))

- **Regras de estado na URL:**
  - Todas as listas validam search params com `zod` na definição da rota (`validateSearch`): `q`, `page`, `per_page`, `sort_by`, `sort_order`, e filtros específicos (`institution_id`, `collection_id`).
  - Alterar filtro, ordenação ou página chama `navigate({ search: ... })`; alterar busca textual ou filtro redefine `page` para `1`.
  - É proibido espelhar search params em `useState` + `useEffect` (prática que causava dessincronia no legado). Inputs controlados de busca com debounce atualizam a URL via `navigate` ao expirar o debounce ou no submit.
  - Em `/console/etl/$runId`, a aba/visão de logs e filtro de nível podem ser opcionais na URL (`?tab=etapas|logs&level=all|error|warning&q=...`) para permitir compartilhar um link direto para um erro de execução.
- **Rotas (entidades com identidade) vs. Diálogos efêmeros (`Dialog` / `Sheet` local):**
  - **São rotas:** `/console`, `/console/instituicoes`, `/console/instituicoes/$institutionId`, `/console/pesquisadores`, `/console/pesquisadores/$researcherId` (drawer em overlay), `/console/colecoes`, `/console/etl`, `/console/etl/$runId`, `/console/admins`.
  - **São diálogos efêmeros (estado local de quem abre):** criar/editar instituição, criar pesquisador, criar/editar coleção, adicionar administrador, configurar e confirmar disparo de ETL (`EtlTriggerDialog`), confirmação de impacto destrutivo (`ConfirmImpactDialog`).

---

## 5. Contrato com a API de admin (`simcc-admin` `v3/develop`) e pontos em aberto

### 5.1 Mapeamento de fluxos para rotas citadas no ADR 0008

| Fluxo do Console                                         | Rotas na `simcc-admin` (`v3/develop`)                                                                                                                        | Origem alternativa / observação                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Guarda de acesso e identidade do operador                | `GET /me`                                                                                                                                                    | Retorna `{ user: { sub, name, email }, is_admin }`                                           |
| Listar, adicionar e remover admins                       | `GET /admins` (paginada com `?q=`), `POST /admins` (`409` se `sub` duplicado), `DELETE /admins/{admin_id}`                                                   | Tela nova essencial; não existia no legado                                                   |
| Catálogo de rotinas e disparo do ETL                     | `GET /etl/routines`, `POST /etl/runs` (`202 { run_id, status }`)                                                                                             | Substitui chamada direta a `apiEtl` com chave estática                                       |
| Histórico, monitoramento e logs do ETL                   | `GET /etl/runs`, `GET /etl/runs/{run_id}`, `GET /etl/runs/{run_id}/logs?offset=&limit=`                                                                      | Polling interrompido quando `status` for terminal (`SUCCEEDED`/`FAILED`)                     |
| CRUD de instituições, pesquisadores, coleções e vínculos | Rotas sob `/academic/*` (`academic/institutions`, `academic/collections`, `academic/researchers`, vínculos `.../institutions/{id}` e `.../collections/{id}`) | No legado eram chamadas via `apiAdmin`; precisa confirmação exata no OpenAPI da `v3/develop` |
| Métricas de page-views / GA4 (se mantidas)               | _Não ficam na `simcc-admin`_ — no legado vinham de `GET /v2/analytics` e `GET /v2/analytics/pages` na `simcc-back`                                           | Ver item 6 das pendências abaixo                                                             |

### 5.2 Pontos em aberto para confirmar antes da implementação (Onda 4)

1. **Inventário completo do OpenAPI da `simcc-admin` (`v3/develop`):**
   - Confirmar a URL do `/openapi.json` da `simcc-admin` e avaliar geração automática de tipos (`src/api/generated/simcc-admin.d.ts`, no mesmo espírito do [ADR 0003](../decisoes/0003-tipos-gerados-do-openapi.md)).
   - Confirmar todas as operações exatas sob `/academic/*`: métodos HTTP (`PUT` vs `PATCH`), query params aceitos (`q`, `page`, `per_page`, `sort_by`, `sort_order`, `institution_id`, `collection_id`) e se há rotas novas (ex.: vínculo em lote, contagens de impacto antes de deletar, status de sincronização por pesquisador).
   - Confirmar se `/academic/researchers` manteve o campo `researcher_id` (como no legado) ou se padronizou para `id`.
2. **Schemas de paginação, envelope e erro na `simcc-admin`:**
   - Confirmar se `/admins` e `/academic/*` compartilham o mesmo envelope paginado (`{ data, pagination: { page, per_page, total_items, total_pages, has_next, has_prev } }`) e se `GET /etl/runs` retorna array simples ou envelope paginado (e quais parâmetros aceita: `limit`/`offset` ou `page`/`per_page`).
   - Confirmar se todas as rotas da `simcc-admin` retornam erro no formato FastAPI `{ detail }` (inclusive erros encapsulados `502`/`504` vindos do ETL) para garantir normalização única em `src/api/admin.ts`.
3. **Contrato de `/admins` (`GET|POST /admins`, `DELETE /admins/{admin_id}`):**
   - O `POST /admins` recebe apenas `sub`, ou exige/aceita também `name`/`email` (ou busca esses dados no IdP)? Como o operador obtém o `sub` de um novo administrador (existe busca de usuários ou o admin informa `sub`/e-mail)?
   - O backend impede excluir o próprio usuário logado ou o último administrador da base? Qual status retorna (`400`, `409` ou `422`)?
4. **Contrato de `/etl/*` e remoção de dados redundantes:**
   - Confirmar payload de `POST /etl/runs`: o servidor infere `triggered_by` do JWT (dispensando envio pelo navegador)?
   - Confirmar o formato exato de `GET /etl/runs/{run_id}/logs?offset=&limit=` e se existe rota autenticada na `simcc-admin` para download do `.jsonl` completo (ou se o console oferecerá cópia/exportação apenas do que foi carregado no buffer, sem rota de download bruto).
5. **Troca da chave estática do ETL (`X-ETL-API-Key`):**
   - Confirmar (como pré-requisito de segurança da virada/ambiente, ADR 0008 e `docs/roadmap.md`) que a chave vazada no bundle do legado (`VITE_ETL_API_KEY`) foi rotacionada no servidor e configurada exclusivamente entre `simcc-admin` e o serviço ETL.
6. **Métricas de page-views e GA4 na página inicial do Console (`/console`):**
   - Confirmar com o produto/backend se os gráficos do GA4 (`GET /v2/analytics` e `GET /v2/analytics/pages`, incluindo o seletor `simcc | ictite | licuri`) permanecem no Console do Simcc ou se pertencem a outro painel do Observatório.
   - Caso permaneçam no Console do Simcc: `/analytics/pages` já aparece no `/v2/openapi.json` local de `feat/v2-contrato` (levantamento da F1.6), mas ainda precisa ser incorporado ao `src/api/generated/simcc-v2.d.ts` via `npm run api:types`; e os dados exibidos precisam considerar a padronização de `page_view` por caminho sem query string ([ADR 0009](../decisoes/0009-analytics-page-view-por-caminho.md)).
   - Caso contrário, definir se a `simcc-admin` fornecerá métricas operacionais próprias para `/console` ou se a visão inicial será composta exclusivamente pelos resumos de `/etl/runs`, `/academic/*` e `/admins`.

---

## 6. Arquitetura de rotas e camadas no front novo

Seguindo as regras garantidas pelo `eslint-plugin-boundaries` (`app → routes → features → entities → api/shared → config`, onde **uma feature nunca importa outra**):

### 6.1 Distribuição nas camadas (`src/`)

- **`src/api/`**
  - `src/api/admin.ts` (iniciado na F1.4): cliente autenticado da `simcc-admin` com Bearer token em memória, fila única de refresh em `401`, normalização de `{ detail }` para `ApiError` e preservação da sessão em `502`/`504`.
  - `src/api/generated/simcc-admin.d.ts` (se o OpenAPI da `simcc-admin` estiver publicado; caso contrário, schemas `zod` na borda de `src/api/admin.ts`, como feito em `src/api/oda/`).
- **`src/entities/`** (entidades administrativas separadas das entidades públicas da v2 para não acoplar contratos distintos)
  - **`src/entities/session/`** _(nota arquitetural para F1.4/T12)_: como `features/console` **não pode importar** `features/auth`, o `sessionQueryOptions()` (`GET <admin>/me`) e o hook `useSession()` precisam residir em `entities/session/` (ou `shared/`), nunca presos dentro de `features/auth/`.
  - **`src/entities/admin-institution/`**: `model.ts`, `queries.ts` (`list`, `detail`, mutations `create`/`update`/`delete`), `ui/` (chip/seletor de instituição).
  - **`src/entities/admin-researcher/`**: `model.ts`, `queries.ts` (`list`, `detail`, mutations de CRUD, afiliações e coleções).
  - **`src/entities/admin-collection/`**: `model.ts`, `queries.ts` (`list`, mutations `create`/`update`/`delete`).
  - **`src/entities/admin-user/`**: `model.ts`, `queries.ts` (`list`, `create`, `delete` para `/admins`).
  - **`src/entities/etl/`**: `model.ts` (tipos + catálogo fallback de metadados e status amigáveis), `queries.ts` (`routines`, `runs`, `runDetail`, `runLogs`, `triggerRun`).
  - **`src/entities/analytics/`** (opcional, se GA4 permanecer no console): `queries.ts` usando `src/api/simcc.ts`.
- **`src/features/console/`**
  - Feature única do módulo administrativo, organizada internamente por subdomínio (`shell/`, `overview/`, `institutions/`, `researchers/`, `collections/`, `etl/`, `admins/`, `dialogs/`), evitando imports cruzados entre features.
  - Inclui o componente de tela **"Sem acesso"** (`403` / `is_admin === false`) e os diálogos efêmeros com estado local (`ConfirmImpactDialog` pode ir para `src/shared/ui/` se útil à plataforma).
- **`src/routes/`** (TanStack Router por arquivo)
  - Rota de layout `src/routes/console.tsx` (ou `src/routes/_console/route.tsx` — usando prefixo `/console`):
    - `beforeLoad`: garante sessão em memória (ou inicia `prompt=none` com `state` da URL atual) e verifica `GET <admin>/me` via `queryClient.ensureQueryData`;
    - Se `is_admin === false`, o componente de layout renderiza o estado **"Sem acesso"** no lugar do `<Outlet />` (mantendo topbar limpa ou moldura segura);
    - Se `is_admin === true`, renderiza a moldura administrativa (`Topbar` + `Sidebar` do Console + `Crumbbar` com `staticData.crumb` + `<Outlet />`).

### 6.2 Mapa de rotas propostas sob `/console`

| Rota (`TanStack Router`)               | `staticData.crumb`                            | Propósito e estado na URL (`validateSearch`)                                                                        |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/console`                             | `Console`                                     | Visão geral operacional (status ETL, resumo cadastral, métricas se aplicável)                                       |
| `/console/instituicoes`                | `Instituições`                                | Lista paginada (`q`, `page`, `per_page`, `sort_by`, `sort_order`)                                                   |
| `/console/instituicoes/$institutionId` | `Detalhes da instituição` (dinâmico p/ sigla) | Detalhe da instituição + tabela de pesquisadores vinculados (`q`, `page`, `per_page`, `sort_by`, `sort_order`)      |
| `/console/pesquisadores`               | `Pesquisadores`                               | Lista paginada (`q`, `institution_id`, `collection_id`, `page`, `per_page`, `sort_by`, `sort_order`) + `<Outlet />` |
| `/console/pesquisadores/$researcherId` | `Pesquisador`                                 | Detalhe e edição do pesquisador em drawer/overlay sobre a lista (ADR 0004)                                          |
| `/console/colecoes`                    | `Coleções`                                    | Lista paginada (`q`, `page`, `per_page`, `sort_by`, `sort_order`)                                                   |
| `/console/etl`                         | `Sincronização (ETL)`                         | Histórico de execuções (`page`/`limit`, `status` se suportado) e disparo de novas rotinas                           |
| `/console/etl/$runId`                  | `Execução`                                    | Acompanhamento em tempo real da execução (`tab`, `level`, `q` opcionais para logs)                                  |
| `/console/admins`                      | `Administradores`                             | Gestão de administradores do Simcc (`q`, `page`, `per_page`)                                                        |

---

## 7. Decisão visual: kit público (`--sc-*`) vs. identidade própria (`sm-*`)

O `design-kit/DESIGN.md` deixou em aberto (nota de escopo no topo) se o novo Console herda o kit público (`--sc-*` / `eng-blue`) ou mantém a identidade própria do legado (`sm-*`: navy `#2B2D74`, sky `#5B9BDD`, red `#D43441`).

### 7.1 Análise comparativa

| Critério                                              | Kit público (`--sc-*` + `src/shared/ui/`)                                                                                                                                                    | Identidade própria (`sm-*` legado)                                                                                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reuso de primitivos (`src/shared/ui/`)**            | **Total (100%).** Todos os primitivos (`Button`, `Card`, `Badge`, `Tag`, `Table`, `Tabs`, `Dialog`, `Sheet`, `Skeleton`, `EmptyState`, `StatCard`, `sonner`) já estão prontos sobre `--sc-*` | **Baixo sem trabalho extra.** No legado, o console precisava sobrescrever classes em todo componente e usar `<button className="sm-btn">` no lugar de `Button` |
| **Tema claro e escuro**                               | **Nativo.** Papéis `--sc-frame`, `--sc-panel`, `--sc-surface`, `--sc-border` e `.dark` já configurados em `src/app/styles.css`                                                               | **Inexistente no legado.** `sm-*` só existia em modo claro; exigiria desenhar, validar contraste e manter uma paleta `.dark` separada                          |
| **Fonte de verdade (`tokens.json` e `tokens:check`)** | **Zero atrito.** Já existe `tokens.json`; `color.status.*` (`success`, `warning`, `danger`, `info`) já está declarado lá                                                                     | **Alto custo de manutenção.** Exigiria adicionar todo o grupo `sm-*` em `tokens.json`, `scripts/tokens.mjs` e criar classes utilitárias ou tema escopado       |
| **Consistência tipográfica e espacial**               | Lexend 300–700, corpo `14px`, controles `rounded-md` (6px), cards `rounded-lg` (8px) sem sombra                                                                                              | Misturava peso `800` (não carregado/padronizado no `DESIGN.md`), textos `12px`, raio `4px` e `2px` de borda em tabelas/botões                                  |
| **Distinção de contexto (público vs. admin)**         | A separação ocorre pela **Sidebar dedicada do Console**, `Crumbbar` (`Console > ...`), ausência de busca pública e marcador discreto de ambiente administrativo                              | Separação cromática forte (navy/vermelho), porém no legado gerava quebra brusca com a Topbar/Sidebar que já usavam o tema público                              |

### 7.2 Recomendação fundamentada

**Recomendação: adotar o kit público (`--sc-*` / `src/shared/ui/`) integralmente para o Console**, mantendo a mesma moldura (`Topbar`, `Sidebar` dedicada, `Crumbbar`, painel `neutral-50`/`neutral-900`, cards planos em `white`/`neutral-950`, ação primária `eng-blue`) e diferenciando o ambiente administrativo por **estrutura e semântica**, não por uma segunda marca:

1. **Identidade estrutural clara:** ao entrar em `/console`, a Sidebar troca para o menu administrativo com um indicador discreto no topo da navegação (ex.: etiqueta/eyebrow "Console administrativo") e `Crumbbar` iniciando em `Console`, deixando inequívoco para o operador onde ele está sem romper o tema escuro/claro da Topbar.
2. **Semântica de status já prevista no kit:** ações destrutivas e falhas de ETL usam `destructive` / `color.status.danger`; status de pipeline (`RUNNING`, `ACCEPTED`, `SUCCEEDED`, `FAILED`) usam os tokens `color.status.*` já presentes em `design-kit/tokens/tokens.json`.
   - _Detalhe técnico verificado:_ hoje `color.status.success`, `warning` e `danger` estão em `tokens.json` e são gerados para `simcc.css` (`--sc-success`, `--sc-warning`, `--sc-danger`), mas ainda não são exportados para o `@theme` em `design-kit/tokens/tailwind.css` (onde hoje saem apenas `status-concluida` e `status-andamento`). Na Onda 4, basta mapear esse grupo existente em `scripts/tokens.mjs` (sem inventar cores `sm-*`).
3. **Economia de implementação e paridade de qualidade:** evita duplicar design system, evita `<button className="sm-btn">` fora de `src/shared/ui/` e garante que melhorias de acessibilidade, foco (`focusRing`) e dark mode nos primitivos beneficiem o Console automaticamente.

### 7.3 Impacto documental caso a recomendação seja aprovada

- **`design-kit/DESIGN.md`:** atualizar a nota de escopo nas linhas 6–7 (removendo a exceção de `sm-*` para o Console e registrando que o Console adota o kit `--sc-*`).
- **Tokens (`design-kit/tokens/tokens.json` e `scripts/tokens.mjs`):** **não** criar tokens `sm-*`. Apenas expor as cores de `color.status.{success,warning,danger}` no `tailwind.css` (rodando `npm run tokens`) se usadas diretamente via classes Tailwind no monitor de ETL e alertas.
- **ADR:** registrar a escolha em um ADR curto (ou adendo ao [ADR 0005](../decisoes/0005-tailwind-4-e-design-kit.md)) formalizando que toda a aplicação, inclusive o Console, usa o mesmo design system (`--sc-*`). Caso o usuário prefira manter `sm-*`, será necessário especificar o conjunto de tokens `sm-*` claros/escuros em `tokens.json` e um ADR específico antes da Onda 4.

---

## 8. Critérios de pronto sugeridos para a Onda 4 ("Pronto quando")

Para a tarefa de implementação do Console (`T12`) na Onda 4 (após conclusão da `F1.4` e validação das pendências da §5):

- **Acesso e sessão ([ADR 0008](../decisoes/0008-autenticacao.md)):**
  - `beforeLoad` em `/console` bloqueia acesso anônimo (retoma via `prompt=none` preservando destino) e bloqueia usuário sem `is_admin` exibindo a tela "Sem acesso" com opções de sair/trocar de conta/voltar ao observatório;
  - `useSession()` / `GET <admin>/me` acessível à feature sem violar `eslint-plugin-boundaries` (camada `entities/session/` ou `shared/`);
  - erros `401` renovam pela fila única; erros `502`/`504` no ETL exibem erro recuperável sem derrubar a sessão; nenhuma chave do ETL no bundle nem chamada direta ao ETL.
- **Escopo funcional completo:**
  - Visão geral (`/console`), Instituições (`/console/instituicoes` + `/console/instituicoes/$institutionId`), Pesquisadores (`/console/pesquisadores` + overlay `/console/pesquisadores/$researcherId`), Coleções (`/console/colecoes`), ETL (`/console/etl` + `/console/etl/$runId` com polling e logs incrementais) e Administradores (`/console/admins`);
  - ações destrutivas protegidas por `ConfirmImpactDialog` e erros `409`/`422` exibidos no contexto do diálogo sem perder os dados preenchidos.
- **Estado na URL, rotas e camadas (ADRs 0002, 0003, 0004):**
  - filtros, busca, ordenação e paginação validados com `zod` em `validateSearch` (F5 e compartilhamento de link preservam listagens, pesquisador aberto e `runId` do ETL);
  - zero violações de camadas, zero `fetch` fora de `src/api/`, zero storage fora de `src/shared/lib/storage.ts`, tipos derivados do OpenAPI da `simcc-admin` (ou `zod` na borda se ainda não publicado).
- **Visual e responsividade:**
  - implementado com os primitivos do kit aprovado (`--sc-*` + `src/shared/ui/`, ícones `lucide-react`, textos pt-BR sentence case), verificado em `1440px` e `375px`, claro e escuro, sem rolagem horizontal.
- **Qualidade e verificação:**
  - testes de rota com `renderRoute()` + handlers MSW da `simcc-admin` cobrindo fluxo feliz, `403` ("Sem acesso"), `409` (conflito/lock), `502`/`504` (sessão preservada) e polling do ETL;
  - `docs/legado/inventario.md` e `docs/roadmap.md` atualizados e todos os checks da CI (`tokens:check`, `typecheck`, `lint`, `format:check`, `test`, `build`) passando sem warnings.
