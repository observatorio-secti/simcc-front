# Roteiro da virada para produção (V4)

Documento operacional para a publicação coordenada da nova versão do Simcc em produção. A execução é feita pelo responsável pela infraestrutura/deploy, seguindo a ordem abaixo para evitar janelas de incompatibilidade entre front-end, APIs, autenticação e ETL.

## 1. Ordem de publicação

Execute os passos **exatamente nesta sequência**:

1. **`simcc-back` (`develop` → `main` + migração `d3f1a2b4c5e6`)**
   - Publicar a branch `develop` na `main` do `simcc-back`.
   - Aplicar a migração de banco `d3f1a2b4c5e6` antes de liberar o tráfego para o front novo. Ela é necessária para as rotas `/v2/production/magazine-text`, `/v2/production/event-work`, `search_in`, facetas de bolsas, `not_rated` na faceta `qualis` e remoção dos campos `deprecated` (`researcher_id`, `image`).
   - Validar que `/v2/openapi.json` e os endpoints v2 respondem sem erro.

2. **`simcc-admin` (`v3/develop` em produção)**
   - Publicar a branch `v3/develop` do `simcc-admin` em produção com `ADMIN_BOOTSTRAP_SUBS` definido para o(s) primeiro(s) administrador(es).
   - Configurar a nova chave `X-ETL-API-Key` exclusivamente no servidor (ver [seção 5](#5-troca-da-chave-do-etl-x-etl-api-key)).
   - Validar que `GET /me`, `/admins` e `/etl/routines` respondem com validação do JWT (`aud: "simcc"`).

3. **`IdP` (Observatório `/idp/`)**
   - Confirmar que o cliente `simcc` está configurado com:
     - `redirect_uri` de produção: `https://observatoriocti.secti.ba.gov.br/simcc/auth/callback`
     - `post_logout_redirect_uri` de produção: `https://observatoriocti.secti.ba.gov.br/simcc/`
     - `aud: "simcc"` no access token JWT (RS256)
     - PKCE `S256`, `prompt=none` (via cookie `httpOnly` `idp_session`), rotação de refresh token e `end_session` ativos.

4. **`MarIA` (`/api-maria/`)**
   - Restringir o CORS da API da MarIA às origens de produção do front-end (`https://observatoriocti.secti.ba.gov.br`), removendo o curinga `*`.

5. **`simcc-front` (tratamento do revert `1b07d2b` + merge `develop` → `main` + deploy)**
   - Tratar o commit de revert `1b07d2b` na `develop` (ver [seção 3](#3-tratamento-do-revert-1b07d2b-antes-do-merge-develop--main)).
   - Fazer o merge `develop` → `main`.
   - O push na `main` dispara `.github/workflows/deploy-obs.yaml`, que atualiza `/opt/simcc/simcc-front` no servidor e gera `./dist` via `docker build --target export`.

---

## 2. Variáveis de ambiente (`.env`) e build args por serviço

### 2.1 Front-end (`simcc-front`)

> **Regra crítica:** toda variável `VITE_*` entra em **tempo de build** no JavaScript público enviado ao navegador. **Nunca** coloque segredos, tokens ou chaves privadas em variáveis `VITE_*`. Alterar qualquer URL exige um novo build.

No `Dockerfile`, o estágio `builder` declara cada `VITE_*` como `ARG` sem valor padrão (exceto `VITE_BASE_PATH=/simcc/`). Isso significa que:

- Quando um `--build-arg` é passado (caso de `.github/workflows/deploy-obs.yaml`), ele **vence** o `.env` do servidor.
- Quando um `--build-arg` **não** é passado (caso de `VITE_GA_MEASUREMENT_ID`), o valor do `.env` presente em `/opt/simcc/simcc-front/.env` continua valendo.

#### Build args de produção (conforme `Dockerfile`, `.env.example` e `deploy-obs.yaml`)

| Variável / Build Arg     | Obrigatória | Origem no deploy atual         | Valor em produção                                       |
| ------------------------ | ----------- | ------------------------------ | ------------------------------------------------------- |
| `VITE_BASE_PATH`         | Sim         | `--build-arg` / padrão `Dockerfile` | `/simcc/`                                               |
| `VITE_SIMCC_API_URL`     | Sim         | `--build-arg` (`deploy-obs.yaml`) | `https://observatoriocti.secti.ba.gov.br/simcc/api/`    |
| `VITE_ODA_API_URL`       | Opcional    | `--build-arg` (`deploy-obs.yaml`) | `https://observatoriocti.secti.ba.gov.br/oda/v1/`       |
| `VITE_ADMIN_API_URL`     | Opcional\*  | `--build-arg` (`deploy-obs.yaml`) | `https://observatoriocti.secti.ba.gov.br/simcc/admin/`  |
| `VITE_IDP_URL`           | Opcional\*  | `--build-arg` (`deploy-obs.yaml`) | `https://observatoriocti.secti.ba.gov.br/idp/`          |
| `VITE_MARIA_API_URL`     | Opcional    | `--build-arg` (`deploy-obs.yaml`) | `https://observatoriocti.secti.ba.gov.br/api-maria/`    |
| `VITE_GA_MEASUREMENT_ID` | Opcional    | `.env` do servidor             | `<PREENCHER_NO_SERVIDOR>` (ex.: `G-XXXXXXXXXX`, se usar) |

\* Opcionais no schema de `src/config/env.ts`, mas necessárias em produção para o console administrativo (`/console`) e login PKCE.

#### Decisão do proxy do host (`export` vs `runtime`)

Há duas formas suportadas pelo `Dockerfile` para servir o front em `/simcc/`:

- **Opção A — Estágio `export` (atual, usada pelo `deploy-obs.yaml`):**
  - Comando executado no servidor:
    `docker build --target export --output type=local,dest=./dist .` (com os `--build-arg` acima).
  - O servidor web / proxy do host serve diretamente o diretório `/opt/simcc/simcc-front/dist/` sob `/simcc/`.
  - **Requisito no proxy do host:** configurar fallback de SPA para `/simcc/index.html` (necessário para F5 e links diretos em rotas profundas, ex.: `/simcc/pesquisadores/<id>`) e cache imutável em `/simcc/assets/`.
- **Opção B — Estágio `runtime` via `compose.yaml` (alternativa com Nginx dedicado):**
  - Sobe o container `simcc-client` (`nginx:1.27-alpine`) na porta `7004` do host (`7004:80`, mesma porta do legado).
  - Usa `nginx/default.conf.template` com `BASE_PATH=/simcc/`, `absolute_redirect off`, cache imutável (`max-age=31536000, immutable`) em `/simcc/assets/`, `no-cache` no restante e fallback de SPA (`try_files $uri $uri/ /simcc/index.html`).
  - **Requisito no proxy do host:** caso adote esta opção, apontar o `proxy_pass` de `/simcc/` no host para `http://127.0.0.1:7004` (e garantir que os builds de produção no `compose.yaml` recebam os mesmos `--build-arg` ou `.env` atualizado).

---

### 2.2 Backend acadêmico (`simcc-back`)

Conferir no `.env` do servidor antes do deploy da `main`:

- `DATABASE_URL` (ou host/porta/usuário/senha/banco PostgreSQL): `<PREENCHER_NO_SERVIDOR>`
- Configurações de ambiente/CORS/workers conforme o `.env.example` do repositório `simcc-back`: `<PREENCHER_NO_SERVIDOR>`
- Migração obrigatória aplicada após o deploy: `d3f1a2b4c5e6`.

---

### 2.3 API de administração (`simcc-admin`, branch `v3/develop`)

Conferir no `.env` do servidor:

| Variável               | Descrição                                                                 | Valor esperado                         |
| ---------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| `ADMIN_BOOTSTRAP_SUBS` | Lista de `sub`s do IdP que recebem acesso inicial de admin na tabela `admins` | `<PREENCHER_NO_SERVIDOR>`              |
| `X-ETL-API-Key` (env)  | Chave secreta usada pelo `simcc-admin` no header `X-ETL-API-Key` ao chamar o ETL | `<PREENCHER_NO_SERVIDOR_APOS_ROTACAO>` |
| URL do ETL             | Endereço interno/privado ou público do serviço ETL (`simcc.uesc.br/etl/`) | `<PREENCHER_NO_SERVIDOR>`              |
| URL / JWKS do IdP      | Emissor do JWT para validação de assinatura RS256 e `aud: "simcc"`        | `https://observatoriocti.secti.ba.gov.br/idp/` |
| Banco do admin         | String de conexão do banco da API de admin                                | `<PREENCHER_NO_SERVIDOR>`              |

---

### 2.4 Provedor de Identidade (`IdP`)

Configuração do cliente `simcc` no IdP (`/idp/`):

- `client_id`: `simcc`
- `redirect_uri`: `https://observatoriocti.secti.ba.gov.br/simcc/auth/callback`
- `post_logout_redirect_uri`: `https://observatoriocti.secti.ba.gov.br/simcc/`
- `aud`: `"simcc"` (presente no access token JWT RS256, junto de `sub`, `name` e `email`; o campo `role` do IdP é ignorado pelo Simcc conforme [ADR 0008](decisoes/0008-autenticacao.md))
- Fluxo: Authorization Code com PKCE (`S256`), suporte a `prompt=none` e `end_session`.

---

### 2.5 MarIA (`/api-maria/`)

- Configuração de CORS (ex.: `CORS_ORIGINS` / `ALLOWED_ORIGINS` no `.env` da MarIA): restringir para `https://observatoriocti.secti.ba.gov.br` (remover `*`).

---

## 3. Tratamento do revert `1b07d2b` antes do merge `develop` → `main`

### O que o commit `1b07d2b` fez e por que ele bloqueia um merge direto

1. O PR #25 (`ac5fb85`) mesclou `develop` na `main` antes da hora (em 2026-11-20), levando a reescrita inicial para produção quando o `.env` do servidor ainda usava os nomes antigos e não definia `VITE_SIMCC_API_URL`.
2. Para restaurar o legado em produção imediatamente, o commit `1b07d2b` (`revert: desfaz o merge da develop na main (#25)`) reverteu `ac5fb85` na `main`, restaurando exatamente a árvore de `e34019c` (último estado do legado).
3. Como `bf81878` (pai da `develop` no PR #25) é o `merge-base` entre `origin/main` e `origin/develop`, o Git considera todos os commits da reescrita até `bf81878` **já mesclados** na `main`. Se você fizer `git merge develop` diretamente na `main`, o `1b07d2b` prevalecerá para todos os arquivos anteriores a `bf81878`, mantendo os arquivos da reescrita apagados/revertidos e gerando conflitos em massa.

### Comando exato antes do merge `develop` → `main`

Traga `origin/main` para a `develop` (ou para uma branch de preparação aberta a partir da `develop`), reverta o `1b07d2b` e valide o build antes de abrir o PR `develop` → `main`:

```bash
git checkout develop
git pull origin develop
git fetch origin main

# Traz o histórico da main (incluindo 1b07d2b) para a develop
git merge --no-edit origin/main

# Desfaz imediatamente o efeito do revert 1b07d2b para restaurar a reescrita
git revert --no-edit 1b07d2b

# Valida antes de enviar para a main
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
```

> **Nota sobre conflitos:** se o `git merge origin/main` apontar conflitos em arquivos modificados após `bf81878`, resolva mantendo a versão da `develop` (ou conclua o merge e execute `git revert --no-edit 1b07d2b` em seguida) e confirme com `git diff origin/develop` antes de prosseguir que apenas a remoção de vestígios do legado (se houver) e o histórico esperado permanecem.

Após validar localmente, publique na `develop` e faça o merge `develop` → `main` (via PR ou `--no-ff`).

---

## 4. Commits de merge da `develop` desde a última publicação (`origin/main..origin/develop`)

Referência gerada com `git log --first-parent --merges --oneline origin/main..origin/develop` (do mais recente para o mais antigo). Use `git revert -m 1 <hash>` caso seja necessário isolar e reverter um PR específico:

| Hash      | Mensagem                                                                          |
| --------- | --------------------------------------------------------------------------------- |
| `f7dad1d` | `Merge feat/t12.2-console-academico`                                              |
| `5282364` | `Merge feat/t12.3-console-etl`                                                    |
| `5f7df85` | `Merge pull request #58 from observatorio-secti/feat/t10-maria`                   |
| `a158022` | `Merge pull request #59 from observatorio-secti/feat/t12.1-console-base`          |
| `acff7f8` | `Merge pull request #56 from observatorio-secti/feat/v2-redirects`                |
| `e9cf425` | `Merge pull request #57 from observatorio-secti/feat/t13-detalhe-producao`        |
| `049fbfc` | `Merge pull request #55 from observatorio-secti/feat/v3-ambiente-producao`        |
| `9e4bff1` | `Merge pull request #54 from observatorio-secti/feat/v4.1-contrato-final`         |
| `933fdc9` | `Merge pull request #53 from observatorio-secti/feat/t7-paineis-power-bi`         |
| `0c39b3d` | `Merge pull request #52 from observatorio-secti/feat/d1.4-listagens`              |
| `c620d19` | `Merge pull request #51 from observatorio-secti/feat/t2-busca-resultados`         |
| `8f6514a` | `Merge pull request #48 from observatorio-secti/feat/t7-indicadores`              |
| `b638b59` | `Merge pull request #44 from observatorio-secti/feat/t3-perfil-pesquisador`       |
| `3b8e351` | `Merge pull request #47 from observatorio-secti/feat/t6-grupos-pesquisa`          |
| `3d906ae` | `Merge pull request #45 from observatorio-secti/feat/t4-instituicoes`             |
| `37793fa` | `Merge pull request #49 from observatorio-secti/feat/d1.2-paineis-externos`       |
| `b4ee3f5` | `Merge pull request #42 from observatorio-secti/feat/d1.1-incites`                |
| `cf7d9a4` | `Merge pull request #50 from observatorio-secti/feat/d1.3-indice-pesquisador`     |
| `becbf36` | `Merge pull request #43 from observatorio-secti/feat/t1-busca-home`               |
| `a0fa4f7` | `Merge pull request #46 from observatorio-secti/feat/t5-pos-graduacao`            |
| `8cf4f1d` | `Merge pull request #31 from observatorio-secti/feat/t12-console-proposta`        |
| `6c8b935` | `Merge pull request #41 from observatorio-secti/feat/e6-entidade-revista`         |
| `610e326` | `Merge pull request #39 from observatorio-secti/feat/e5-entidade-grupo-oda`       |
| `180ffd3` | `Merge pull request #40 from observatorio-secti/feat/e4-entidade-programa`        |
| `5f22513` | `Merge pull request #36 from observatorio-secti/feat/e3-entidade-instituicao`     |
| `e0f63f3` | `Merge pull request #37 from observatorio-secti/feat/e2-entidade-producao`        |
| `9f3ec0e` | `Merge pull request #35 from observatorio-secti/feat/e1-entidade-pesquisador`     |
| `8081855` | `Merge pull request #33 from observatorio-secti/feat/f1.5-motor-listagem`         |
| `dba340c` | `Merge pull request #38 from observatorio-secti/feat/f1.4-sessao-autenticacao`    |
| `9b2aee2` | `Merge pull request #34 from observatorio-secti/feat/f1.3-moldura-navegacao`      |
| `00d8b05` | `Merge pull request #32 from observatorio-secti/feat/f1.6-infraestrutura-testes-msw` |
| `6f8f558` | `Merge pull request #26 from observatorio-secti/docs/adr-0008-admin-unico`        |
| `37e305f` | `Merge pull request #22 from observatorio-secti/feat/f1.1-cliente-api-v2`         |
| `4236a80` | `Merge pull request #23 from observatorio-secti/feat/k1-tokens-gerados`           |
| `6cb62a4` | `Merge pull request #24 from observatorio-secti/feat/f1.2-primitivos-ui`          |

---

## 5. Troca da chave do ETL (`X-ETL-API-Key`)

No legado (`legado-v1`), o front-end enviava o header `X-ETL-API-Key` diretamente do navegador usando `VITE_ETL_API_KEY`, o que expôs a chave no bundle JavaScript público. No front novo, o navegador **não** fala com o ETL nem conhece essa chave: apenas o `simcc-admin` aciona o ETL servidor-para-servidor ([ADR 0008](decisoes/0008-autenticacao.md)).

### Passo a passo da rotação

1. **Gerar uma nova chave aleatória forte** no servidor (ex.: `openssl rand -hex 32`). Não registre o valor em repositórios Git nem em variáveis `VITE_*`.
2. **Atualizar a chave no serviço ETL** (`simcc.uesc.br/etl/`): substituir a chave antiga pela nova na configuração/`.env` do serviço ETL e reiniciar o serviço.
3. **Atualizar a chave no `simcc-admin`**: configurar o mesmo novo valor na variável de ambiente correspondente ao header `X-ETL-API-Key` no `.env` de produção do `simcc-admin` e reiniciar o serviço.
4. **Validar a integração**:
   - Confirmar que chamadas ao ETL usando a chave antiga retornam `401`/`403`.
   - Autenticar como admin no `/console/etl` (ou via `POST /etl/runs` autenticado no `simcc-admin`) e confirmar que o disparo de rotina funciona com a nova chave.
5. **Confirmar ausência no front**: no bundle gerado em `./dist/assets/*.js`, garantir que não há nenhuma ocorrência de `VITE_ETL_API_KEY` nem da chave antiga/nova.

---

## 6. Plano de rollback

Em caso de falha crítica durante ou após a virada, execute o rollback na **ordem inversa** da publicação:

1. **`simcc-front`**
   - Reverter o commit de merge da virada na `main`:
     ```bash
     git checkout main
     git pull origin main
     git revert -m 1 <HASH_DO_MERGE_DA_VIRADA>
     git push origin main
     ```
   - O workflow `.github/workflows/deploy-obs.yaml` reconstruirá `./dist` no servidor com o código anterior (`1b07d2b` / `legado-v1`).
   - Se o deploy automático falhar no servidor, faça checkout da tag `legado-v1` ou do commit `1b07d2b` diretamente em `/opt/simcc/simcc-front` e rode o build do legado.

2. **`MarIA`**
   - Restaurar a regra de CORS anterior no `.env`/configuração da MarIA e reiniciar o serviço caso alguma origem legítima tenha sido bloqueada.

3. **`IdP`**
   - Caso o login do Simcc falhe em produção, restaurar a configuração anterior do cliente `simcc` no IdP (sem alterar clientes de outros sistemas do Observatório).

4. **`simcc-admin`**
   - Voltar para a release/imagem anterior do `simcc-admin` e restaurar o `.env` anterior, **mantendo a nova `X-ETL-API-Key` rotacionada** (nunca reative a chave vazada no legado).

5. **`simcc-back` e migração `d3f1a2b4c5e6`**
   - Reverter a migração `d3f1a2b4c5e6` no banco (`alembic downgrade <revisao_anterior>` ou script de downgrade equivalente do `simcc-back`).
   - Fazer rollback da branch `main` do `simcc-back` para o commit anterior à virada e reiniciar a API.
   - Validar que os endpoints v1/v2 consumidos pelo legado voltaram a responder normalmente.
