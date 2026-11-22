Coordene as ondas 7 e 8 da reescrita do front do Simcc. Antes de começar, leia CLAUDE.md, docs/roadmap.md, docs/arquitetura.md, os ADRs em docs/decisoes/ e docs/propostas/t12-console.md.

## Estado em 2026-11-22 (fim da onda 6)
A `develop` está em `5f7df85`, com tudo mergeado:
- V4.1 Contrato final da v2 (#54);
- V3 Ambiente de produção (#55);
- V2 Redirects (#56);
- T13 Detalhe de produção (#57);
- T10 MarIA (#58);
- T12.1 Console: base e admins (#59).

Nada foi para a `main`.

### O que a T12.1 deixou para a onda 7 reaproveitar
- **Entidades:**
  - `entities/session`: store, `useSession`, `requireAdmin` (devolve `{ viewer }`).
  - `entities/admin`.
  - `entities/academic`: queries de listas e contagens de instituições, pesquisadores e coleções, keys `['academic', …]`.
  - `entities/etl`: runs, run, logs, rotinas, último run, mutation de disparo, `isEtlRunActive`, duração e escopo, keys `['etl', …]`.
- **Componentes compartilhados:**
  - `src/shared/ui/confirm-impact-dialog.tsx`: estado em andamento e erro dentro do diálogo.
  - Tokens de status `run-status` no tema: `bg-run-succeeded|failed|running|queued`, via `runStatusColor`/`runStatusKey` em `design-tokens.ts`.
- **Layout e menu:** `ConsoleLayout` e `CONSOLE_NAV_ITEMS` em `features/shell/nav-config.ts`. Pesquisadores, Instituições, Coleções e Sincronização ficaram fora do menu porque as rotas ainda não existiam; a onda 7 acrescenta.
- **Em `features/console`:** `RunStatusBadge`, `SectionError` e `format.ts`. Atenção: uma feature não importa outra. O que a T12.2 e a T12.3 precisarem daqui desce para `entities/` ou `shared/`. Isso inclui mover arquivos, e quem move é a tarefa que precisa, avisando a outra.
- **Testes:** `src/test/msw/admin-handlers.ts` e a opção `session` do `renderRoute`.
- **OpenAPI real do admin**, diferente da proposta:
  - Paginação:
    - `/admins` e `/academic/*` usam `{ data, pagination }`;
    - `/etl/runs` é paginado (`page`, `per_page`, `status`).
  - Tipagem:
    - `GET /etl/routines` devolve `unknown[]`;
    - `status` de run e etapa é `string` livre (`PENDING`, `ACCEPTED`, `RUNNING`, `SUCCEEDED`, `FAILED`, tirados do `simcc-etl`);
    - `EtlRunTriggerRequest.force` sai obrigatório no tipo;
    - `/academic/*` exige token, mas não declara 401/403.
  - Erros:
    - os 409 vêm em inglês e o front traduz;
    - `DELETE /admins` dá 409 para si mesmo ou para o último admin.
  - Rotas `.../export/parquet` existem; não usar (ADR 0006).

### Serviços locais
| Serviço | Endereço |
| --- | --- |
| simcc-back | http://localhost:8088 |
| simcc-admin | http://localhost:8060 (OpenAPI em `/openapi.json`, erros em `{ detail }`) |
| IdP | http://localhost:8000 |
| MarIA | http://127.0.0.1:8020 (CORS `*`) |

O `.env` do checkout principal já aponta para todos.

`scripts/api-types.mjs` é uma lista de especificações (`simcc-v2`, `admin`, `maria`): `npm run api:types -- admin` gera só a do admin.

### Pendências conhecidas, fora do front
- **simcc-back:**
  - `/v2/production/magazine-text` e `/event-work` (lista, detalhe e métricas) dão 500 (provável migração `d3f1a2b4c5e6` não aplicada);
  - `/v2/researcher/{id}/terms` dá 500;
  - uma busca com todas as facetas passa de 60s.
- **MarIA:** sem limite por visitante e sem dono de conversa (quem tem o link lê). Os formatos do stream (`activity`, `content.delta`, `error`) não estão nos `components` do OpenAPI; o front os valida com zod em `src/api/maria.ts` (exceção provisória, como a ODA).
- **Login no IdP:** o IdP recusou `redirect_uri` em portas diferentes da 8080 (`http://localhost:8083/auth/callback` deu 400). Antes de verificar o console logado numa porta de tarefa, confirme comigo se a porta está autorizada. Senão, peça para eu fazer login no painel do navegador. **Nunca digite senha.**
- **ETL:** a chave vazada no legado continua sem troca. Não dispare run real do ETL sem eu autorizar na conversa.

### Lições da onda 6
- Com 4 ou 5 agentes em paralelo, o load passa de 25 e testes de rota antigos estouram o timeout de 5s. Rode `npx vitest run --maxWorkers=2` localmente quando a máquina estiver carregada (a CI passa). Uma tarefa pequena para subir o timeout global dos testes (F1.6) pode entrar na onda 8.
- O shell é zsh: use `"${var}"` com chaves (`$b:r` é modificador) e arrays (`for b in $arr`), ou escreva o script em bash.
- `src/routeTree.gen.ts` se resolve sozinho no merge, mas pode ficar errado: depois de todo merge, rode `npm run build`.
- Tabelas do `docs/roadmap.md` e do `docs/legado/inventario.md` conflitam linha a linha. Cada tarefa edita só as próprias linhas e mantém a largura das colunas.

## Regras de toda tarefa
- **Execução:** cada tarefa roda num subagente com isolamento em worktree.
  - Antes, rode `git fetch origin develop main`.
  - A branch `feat/<id>-<slug>` sai de `origin/develop`.
  - Copie o `.env` do checkout principal.
  - Suba o Vite numa porta só da tarefa (8087, 8089…; a 8088 é do backend).
- **Antes do PR:** passam sem erro `typecheck`, `lint`, `format:check`, `test` e `build` (e `tokens:check` se mexer em tokens).
- **Navegador:** verifique em 1440px e 375px, nos temas claro e escuro.
- **Commit:**
  - em português, `feat(<id>): …`, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - atualize o status no `docs/roadmap.md` e no `docs/legado/inventario.md` no próprio commit da tarefa;
  - quem entra na `develop` já entra como "feito".
- **Sem PR:** a tarefa vai direto para a `develop`, com merge feito por você (ver "Merge na develop" abaixo). Nunca para a `main`.
- **Tipos:** só gerados de OpenAPI (`simcc-v2.d.ts`, `simcc-admin.d.ts`, `maria.d.ts`). Nada de tipo de resposta escrito à mão, nada consumido da v1.
- **Bloqueio:** pare e relate. Não contorne, nem só para testar (proxy, mock no navegador, credencial inventada).
- **Merge na develop:** você mergeia direto, sem PR, uma tarefa por vez, na ordem que propuser. Nunca mexa na `main`. O subagente da tarefa só commita na própria branch; quem integra na `develop` é você, o coordenador. Para cada tarefa:
  1. **Atualize a branch:** `git fetch origin develop` e `git merge origin/develop` na branch da tarefa. Resolva os conflitos ali, nunca na `develop`.
  2. **Rode as checagens:** `npm run build` (regenera o `routeTree.gen.ts`), `typecheck`, `lint`, `format:check`, `tokens:check` e `npx vitest run --maxWorkers=2`. Tudo precisa passar sem erro.
  3. **Faça um smoke test do build:**
     - suba `npx vite preview --port <porta da tarefa>` sobre o `dist/` recém-gerado;
     - abra no navegador `/`, `/busca`, `/busca?q=solo`, um `/pesquisadores/<id>` real, `/producoes/artigo/<id>`, `/maria`, `/console` e as rotas novas da tarefa;
     - cada uma tem que renderizar sem tela de erro e sem erro no console do navegador. Erro de rede que já conhecemos do backend (os 500 listados acima) não conta;
     - confira também que `npm run build` não fez nenhum chunk crescer mais de 20% em relação à `develop` sem motivo.
  4. **Integre na develop:** faça `git checkout develop`, `git merge --ff-only origin/develop` e depois `git merge --no-ff feat/<id>-<slug> -m "Merge feat/<id>-<slug>"`. Antes de dar push, confira com `git diff --stat origin/develop` que só entraram os arquivos da tarefa.
  5. **Dê push:** `git push origin develop`, sem `--force` e sem reescrever o histórico. Se o push for recusado, alguém mexeu na develop: volte ao passo 1.
  6. **Acompanhe a CI:** espere a CI da `develop` terminar com `gh run watch`. Se ela falhar, rode `git revert -m 1 <merge>` e dê push na hora, antes de qualquer outra integração. Depois corrija na branch da tarefa e recomece do passo 1. Nunca deixe a `develop` vermelha.
  7. **Remova a branch:** só depois da CI verde, apague a branch remota da tarefa, se tiver dado push dela.
- **Ao fim de cada onda, entregue:**
  - uma tabela com tarefa, branch, commit de merge na develop, CI e verificação;
  - os conflitos;
  - a ordem de merge;
  - o que a próxima onda precisa.

  Depois **espere eu avisar** para começar a próxima. Dentro de uma onda, não precisa pedir ok.

## Onda 7 (em paralelo)
- **T12.2 Console: cadastro acadêmico**, branch `feat/t12.2-console-academico`, feature `features/console-academic`:
  - `/console/instituicoes` e `/console/instituicoes/$institutionId`;
  - `/console/pesquisadores` e `/console/pesquisadores/$researcherId`, aberto como overlay sobre a lista (ADR 0010; página direta no F5);
  - `/console/colecoes`, com atalho para `/console/pesquisadores?collection_id=`;
  - CRUD por `/academic/*`, com `Dialog` para criar e editar (409 e 422 inline, sem fechar) e `ConfirmImpactDialog` para excluir e desvincular;
  - filtros, ordenação e paginação na URL;
  - itens no menu do console.
- **T12.3 Console: sincronização**, branch `feat/t12.3-console-etl`, feature `features/console-etl`:
  - `/console/etl` (histórico paginado e disparo) e `/console/etl/$runId` (`?tab=etapas|logs&level=`);
  - `EtlTriggerDialog`: base completa ou avançado com rotinas e `lattes_ids` validados com 16 dígitos; sem `triggered_by` do cliente;
  - polling até o status final;
  - logs paginados por `offset`/`limit`;
  - `409` (lock ativo), `502` e `504` mostrados sem encerrar a sessão;
  - item no menu.
  - O "Sincronizar" por pesquisador da T12.2 usa a mutation de `entities/etl`, com link para `/console/etl/$runId`.
- Uma feature não importa outra: o que for comum vai para `entities/` ou `shared/`. As duas tarefas tocam `nav-config.ts`, o que deve dar só um conflito pequeno.

## Onda 8 (preparação da virada)
- **V1 Paridade:** cada linha do `docs/legado/inventario.md` fica como "feita" ou "descontinuada", com uma justificativa.
  - O que depende das pendências do backend acima entra como "feita", com a pendência registrada. Exemplos: as abas de texto em revista e trabalho em evento.
  - Registre também os desvios conhecidos:
    - `lattes_id` sem redirect, porque a v2 não busca por Lattes;
    - os links antigos com `prod_kind`/`prod_id` do perfil não abrem mais a produção.
- **V5 Desligamento:** `docs/backend/desligamento-v1.md`, com as rotas v1 que o front deixou de usar (o legado está em `legado-v1`).
- **Roteiro da V4:** `docs/virada.md`, só o documento; quem executa sou eu. Deve ter:
  - a ordem de publicação: back `develop` → `main` com a migração `d3f1a2b4c5e6` aplicada, admin (`v3/develop` com `ADMIN_BOOTSTRAP_SUBS`), IdP (com o `redirect_uri` de produção), MarIA (CORS restrito às origens do front em vez de `*`), front;
  - o `.env` de cada serviço. Para o front, use os build args listados no PR #55 e na seção "Build e deploy" de `docs/arquitetura.md`. Inclua a decisão do proxy do host, que hoje serve o `dist/` exportado; a alternativa é o nginx do `compose.yaml` na porta 7004;
  - o tratamento do revert `1b07d2b` antes do merge `develop` → `main` do front;
  - uma lista de commits de merge da `develop` desde a última publicação, para servir de referência de revert;
  - a troca da chave do ETL;
  - como reverter cada passo.
