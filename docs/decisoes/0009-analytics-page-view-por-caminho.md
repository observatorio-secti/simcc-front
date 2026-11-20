# 0009. Analytics: um page_view por caminho, sem query string

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

- O Google Analytics 4 é opcional: só existe quando `VITE_GA_MEASUREMENT_ID` está definido.
- Com a URL como estado ([ADR 0002](0002-url-como-estado.md)), mudar filtro, página, ordenação ou termo de busca é uma navegação do router. Contar cada uma como `page_view` inflaria as visualizações e misturaria uso de filtro com acesso a página.
- A query string pode carregar o que não deve ir ao Google: termos digitados na busca e, no retorno do login, o `code` e o `state` do OAuth ([ADR 0008](0008-autenticacao.md)).
- O legado (`legado-v1:src/lib/analytics.ts`) já enviava só origem e caminho, um `page_view` por mudança de caminho, com o `page_view` automático do gtag desligado.

## Decisão

- O script do gtag é injetado em tempo de execução (`src/shared/lib/analytics.ts`) e só quando há ID. Sem ID, nada do Google é carregado e as chamadas são no-op.
- O `send_page_view` automático do gtag fica desligado. O `page_view` é enviado pelo router (`src/app/analytics.ts`, evento `onResolved`) quando o **caminho** muda, inclusive na primeira carga.
- `page_path` e `page_location` usam o href público do router (com o `basepath`, ex.: `/simcc/`) **sem query string e sem hash**. O mesmo valor vai em `gtag('set', …)` para que os eventos automáticos seguintes também não levem a URL crua.

## Consequências

- Mudança só de search params (filtro, busca, paginação) não gera `page_view`. Se for preciso medir uso de busca ou filtro, isso deve ser um evento próprio (ex.: `search`), com parâmetros escolhidos e sem dado pessoal.
- Trocar de pesquisador ou programa gera `page_view`, porque o identificador está no caminho ([ADR 0004](0004-modais-e-drawers-como-rotas.md)).
- Não há banner de consentimento. A necessidade dele perante a LGPD fica como pendência a decidir fora desta tarefa.
