# `src/api/`

Única camada que faz requisições HTTP (o lint bloqueia `fetch` fora daqui). Pode importar `shared/` e `config/`.

- `generated/simcc-v2.d.ts`: tipos gerados do OpenAPI da v2 (`npm run api:types`, lê `<VITE_SIMCC_API_URL>v2/openapi.json`). Não edite à mão; o arquivo é commitado.
- `simcc.ts`: cliente `openapi-fetch` da v2 (`simcc`), com o middleware de erro, e o helper `unwrap`.
- `errors.ts`: `ApiError`, a normalização dos formatos de erro e o middleware.
- `types.ts`: helpers de tipo sobre o contrato gerado (envelopes de lista e de detalhe, query e parâmetros de caminho).
- `oda/`: cliente e adaptador da API ODA (grupos de pesquisa), com schema zod na borda (tarefa E5).
- `idp.ts`: fluxo PKCE com o IdP (tarefa F1.4). O IdP só autentica.
- `admin.ts`: API de admin, com o token do IdP. Permissões (`/me`) e ações do ETL; o front não chama o ETL ([ADR 0008](../../docs/decisoes/0008-autenticacao.md)).

Componentes não importam daqui diretamente: quem chama a API são as `queries.ts` de cada entidade.

## Chamando a v2

A base do cliente é `<VITE_SIMCC_API_URL>v2` e os caminhos são os do OpenAPI da v2, sem o prefixo (`/researcher`, `/production/article/{article_id}`). Arrays na query saem repetidos (`?institution_id=a&institution_id=b`), como a v2 espera.

```ts
import { simcc, unwrap } from '@/api/simcc';

queryFn: ({ signal }) =>
  unwrap(
    simcc.GET('/researcher/{researcher_id}', {
      params: { path: { researcher_id: id } },
      signal,
    }),
  ),
```

Passe sempre o `signal` do TanStack Query, para a requisição ser cancelada quando a query sair de uso.

## Erros

Toda chamada que não termina em sucesso **rejeita** com `ApiError` (`status`, `code`, `message`, `details`). Não é preciso olhar o campo `error` do `openapi-fetch`: o `unwrap` devolve só o corpo.

| Situação                                                       | `status` | `code`                                                          | `message`                    |
| -------------------------------------------------------------- | -------- | --------------------------------------------------------------- | ---------------------------- |
| Erro da v2 `{ error: { code, message, details } }`             | HTTP     | o da v2 (`not_found`, `validation_error`, `unknown_parameter`…) | a da v2                      |
| Formato antigo `{ detail: "..." }` (transição)                 | HTTP     | derivado do status                                              | o `detail`                   |
| 422 antigo do FastAPI `{ detail: [{ loc, msg, type }] }`       | 422      | `validation_error`                                              | genérica; itens em `details` |
| Corpo vazio, não-JSON (ex.: HTML do proxy) ou em outro formato | HTTP     | derivado do status (`not_found`, `server_error`, `http_error`…) | genérica, em pt-BR           |
| 2xx com corpo que não é JSON (ex.: URL base errada)            | HTTP     | `invalid_response`                                              | genérica                     |
| Falha de rede                                                  | `0`      | `network_error`                                                 | genérica                     |
| Cancelamento (`AbortError`)                                    | —        | não vira `ApiError`: o erro original passa adiante              | —                            |

Os códigos atribuídos pelo front estão em `clientErrorCodes`. A tela decide como exibir o erro; a `message` da v2 já vem em pt-BR.

## Tipos

Os modelos derivam do contrato, nunca de interface escrita à mão:

```ts
import type { DetailData, ListItem, QueryOf, Schema } from '@/api/types';

type ResearcherSummary = ListItem<'/researcher'>; // = Schema<'ResearcherSummary'>
type ResearcherDetail = DetailData<'/researcher/{researcher_id}'>;
type ResearcherSearch = QueryOf<'/researcher'>;
```

`ListPath` são as rotas de lista paginada (`{ data, pagination, filters_applied, sort, meta, facets }`) e `DetailPath` as de detalhe (`{ data, meta }`). As listas curtas (`/suggestion`, `/researcher/{researcher_id}/terms`, `/metrics/production/{kind}`, `/analytics`, `/analytics/pages`) não têm paginação e ficam fora das duas; use `ResponseOf<P>`.

Os campos `deprecated` (`researcher_id` e `image` do pesquisador) saíram do contrato na virada (V4.1): use `id` e `image_url`. Se o backend marcar outro campo como `@deprecated`, não o use.
