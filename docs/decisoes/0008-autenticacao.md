# 0008. Autenticação e autorização

- **Status:** aceita (revisada em 2026-11-20, com as respostas do IdP e da API de admin)
- **Data:** 2026-11-20

## Contexto

- **IdP compartilhado.** O login usa OAuth 2.0 com PKCE no IdP do Observatório (`/idp/`). O IdP fica um nível acima do Simcc: atende outros sistemas, e o admin dele é geral do Observatório, não do Simcc. Ele **não deve conter regra do Simcc**.
- **Papel do Simcc dentro do token.** A API de admin (`simcc-admin`) tirava o papel (`ADMIN`/`DEFAULT`) do campo `role` do token. Assim, todo admin do IdP virava admin do Simcc.
- **Tokens no `localStorage`.** O legado guardava o access token **e** o refresh token ali, então qualquer XSS rouba a sessão.
- **Chave do ETL exposta.** O legado chamava o ETL direto do navegador, com uma chave estática (`VITE_ETL_API_KEY`) que ia para o bundle público.
- **Login só no console.** O `simcc-back` (API v2) é público e só de leitura.

## Decisão

### Quem faz o quê

| Quem                         | Responsabilidade                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IdP do Observatório          | **Autenticação.** Login (PKCE), tokens e sessão do IdP. O access token (JWT RS256) traz `sub`, `name`, `email` e `aud: "simcc"`. O campo `role` continua no token para outros sistemas e **é ignorado pelo Simcc** |
| API de admin (`simcc-admin`) | **Autorização do Simcc.** Mantém a lista de admins (tabela `admins`, pelo `sub` do IdP) e expõe `GET /me` → `{ user: { sub, name, email }, is_admin }`. Aciona o ETL de servidor para servidor                     |
| ETL                          | Não é chamado pelo front. Só recebe chamadas da API de admin                                                                                                                                                       |
| Front                        | Faz o PKCE, guarda os tokens só em memória, lê `is_admin` de `GET <admin>/me` e envia o token só para a API de admin                                                                                               |

### Um só papel: admin

**Até segunda ordem, o admin faz tudo.** Não há escopos, permissões por área nem instituições vinculadas.

- Rotas do console exigem sessão **e** `is_admin`.
- Usuário logado sem `is_admin` vê uma tela de "sem acesso", e nada mais muda para ele: a área pública não depende de login.
- Se um dia precisar de granularidade, o `/me` ganha um campo novo, sem quebrar o atual. Isso vira um ADR novo.

### Sessão no navegador

Os valores abaixo são os padrões informados pelo IdP.

| Item                | Como funciona                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Access token        | Só em memória. Validade de 15 minutos                                                                                                                                                                                                                                                                                                                                                |
| Refresh token       | Só em memória. É **rotacionado a cada uso**, e reusar um token já consumido revoga a cadeia inteira (`400 invalid_grant`). Por isso a renovação passa por uma fila única (uma chamada por vez, como em `legado-v1:src/lib/api.ts`). Validade de 30 dias                                                                                                                              |
| Recarregar a página | A sessão em memória se perde. Ao entrar numa rota protegida sem sessão, o `beforeLoad` redireciona para `/authorize?prompt=none`. O IdP tem sessão própria em cookie `httpOnly` (`idp_session`, 30 dias): se ela existir, devolve um `code` sem mostrar a tela de login; senão, devolve `error=login_required` e o front vai para o login normal. A rota de destino volta no `state` |
| Falha na renovação  | Mesmo caminho do `prompt=none`                                                                                                                                                                                                                                                                                                                                                       |
| Logout              | `end_session` com `client_id=simcc` e `post_logout_redirect_uri`: encerra a sessão do IdP e revoga os refresh tokens do Simcc                                                                                                                                                                                                                                                        |

- **Nenhum token em `localStorage` nem em `sessionStorage`.** Não há solução provisória nem BFF: o `prompt=none` cobre a retomada.
- `prompt=login` força a reautenticação, caso seja útil ao trocar de conta.

### Erros da API de admin

| Status      | Significado                         | O que o front faz                                  |
| ----------- | ----------------------------------- | -------------------------------------------------- |
| `401`       | Token ausente, inválido ou expirado | Renova e repete uma vez; se falhar, volta ao login |
| `403`       | Logado, mas não é admin             | Mostra "sem acesso"                                |
| `502`/`504` | Falha ou timeout ao falar com o ETL | Mostra erro da ação; **não** encerra a sessão      |

A API de admin responde erros no formato `{ detail }` do FastAPI, diferente do envelope da v2. O cliente em `src/api/admin.ts` normaliza para o mesmo `ApiError`.

### O que a API de admin oferece ao console

Na branch `v3/develop` do `simcc-admin` (commit `57a7610`):

- `GET /me`;
- `GET|POST /admins` (lista paginada com `?q=`; `409` se o `sub` já existe) e `DELETE /admins/{admin_id}`;
- `GET /etl/routines`, `POST /etl/runs` (`202 { run_id, status }`), `GET /etl/runs`, `GET /etl/runs/{run_id}` e `GET /etl/runs/{run_id}/logs?offset=&limit=`;
- rotas acadêmicas em `/academic/*`.

O primeiro admin de cada ambiente vem de `ADMIN_BOOTSTRAP_SUBS`, no deploy da API de admin.

## Consequências

- **F1.4 sem bloqueio externo.** Tanto o IdP quanto a API de admin já entregaram o necessário. Enquanto a `v3/develop` do admin não está publicada, a F1.4 usa o `/me` simulado (MSW) ou a API de admin rodando localmente.
- **Console depende da sessão.** O console (T12) só pode ser construído depois da F1.4. A proposta da T12 parte das rotas acima.
- **Mudar quem é admin não exige mexer no IdP.**
- **Na virada (V3/V4):** as mudanças do IdP e a `v3/develop` do `simcc-admin` precisam estar em produção, e o `ADMIN_BOOTSTRAP_SUBS` de produção precisa estar definido.
- **Chave do ETL:** a API de admin ainda fala com o ETL usando `X-ETL-API-Key`, agora só no servidor. A chave que vazou no bundle do legado **precisa ser trocada**: o novo valor fica só no servidor.
