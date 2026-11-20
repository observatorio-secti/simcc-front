# 0008. Autenticação e sessão

- **Status:** aceita em parte (o armazenamento do refresh token depende do IdP)
- **Data:** 2026-11-20

## Contexto

- O login usa OAuth 2.0 com PKCE no IdP do Observatório (`/idp/`), e o fluxo funciona no legado.
- O legado guardava o access token **e** o refresh token no `localStorage`: qualquer XSS rouba a sessão.
- O legado enviava ao ETL uma chave estática (`VITE_ETL_API_KEY`). Como toda variável `VITE_*` vai para o bundle público, a chave estava exposta.
- O `simcc-back` (API v2) é público e só de leitura. Login só é necessário no console (API administrativa e ETL, mantidas por outros times).
- Front (`/simcc/`) e IdP (`/idp/`) estão no mesmo domínio, então um cookie `SameSite=Strict` funciona sem configuração entre origens.

## Decisão

- Manter o fluxo **PKCE** com o IdP, portado do legado (`legado-v1:src/services/auth.ts`, `legado-v1:src/lib/api.ts`).
- **Access token só em memória**, nunca em storage.
- **Refresh token em cookie `httpOnly`**, emitido pelo IdP. Isso depende do time do IdP. Até lá, a tarefa F1.4 deve registrar aqui a solução provisória escolhida e o risco aceito.
- Rotas protegidas usam `beforeLoad` do router. Permissões vêm como escopos de `/me` (`console:etl`, `console:researchers`…), e o front decide o que mostrar por escopo, nunca por nome de papel.
- **Nenhuma chave de API no front.** O ETL deve validar o token do IdP com o escopo `console:etl`.
- A área pública não depende de login. Se um dia mostrar dados por usuário, as query keys precisam incluir o usuário (ver [backend/resposta-backend-v2.md](../backend/resposta-backend-v2.md), §6).

## Consequências

- O console só pode ser construído (tarefa T12) depois da F1.4.
- Pendências externas: cookie `httpOnly` e `/me` com escopos (time do IdP), ETL validando o token e troca imediata da chave exposta (time do ETL).
