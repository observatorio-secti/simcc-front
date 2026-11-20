# 0003. Tipos gerados do OpenAPI e cliente openapi-fetch

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

O legado declarava os tipos de resposta à mão e eles ficaram desatualizados. Exemplos: facetas de produção e `filters_applied` tipado já existiam no backend, mas não nos tipos do front. O backend publica o OpenAPI da v2 em `/v2/openapi.json`, gerado pelo FastAPI e versionado com o código.

## Decisão

- Gerar os tipos com `openapi-typescript` (`npm run api:types`) em `src/api/generated/simcc-v2.d.ts`, sempre a partir de `/v2/openapi.json`. O `/openapi.json` mesclado (v1 + v2) sobrescreve componentes de mesmo nome e não deve ser usado.
- Fazer as chamadas com `openapi-fetch`, que tipa path, parâmetros e resposta pelo próprio contrato.
- A camada `src/api/` normaliza erros (`{ error: { code, message, details } }` e, durante a transição, o formato antigo `{ detail }`) num `ApiError`.
- Campos marcados como `deprecated` no OpenAPI (`researcher_id`, `image` etc.) não são usados: o front já nasce nos nomes novos (`id`, `image_url`).
- A API ODA (grupos de pesquisa) não tem contrato publicado. Ela ganha um adaptador próprio em `src/api/oda/`, com schema zod na borda e conversão para o modelo do front. É o único lugar com mapeamento "grosso".

## Consequências

- Quando o backend muda o contrato, `npm run api:types` mostra o impacto como erro de compilação.
- O arquivo gerado é commitado, para a CI não depender da API no ar.
- Os modelos das entidades derivam dos tipos gerados (`components['schemas']['…']`) e só acrescentam o que é do front (rótulos, cores, formatação).
