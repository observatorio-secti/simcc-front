# `src/api/`

Única camada que faz requisições HTTP (o lint bloqueia `fetch` fora daqui). Pode importar `shared/` e `config/`.

- `generated/simcc-v2.d.ts`: tipos gerados do OpenAPI da v2 (`npm run api:types`). Não edite à mão.
- `simcc.ts`: cliente `openapi-fetch` da v2, com o middleware de erro (tarefa F1.1).
- `errors.ts`: `ApiError` e a normalização dos formatos de erro.
- `oda/`: cliente e adaptador da API ODA (grupos de pesquisa), com schema zod na borda (tarefa E5).
- `idp.ts`: fluxo PKCE com o IdP (tarefa F1.4).

Componentes não importam daqui diretamente: quem chama a API são as `queries.ts` de cada entidade.
