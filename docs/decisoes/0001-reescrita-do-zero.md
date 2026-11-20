# 0001. Reescrever o front do zero

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

O front anterior acumulou decisões que tornavam os dados inconsistentes entre telas:

- **Estado global inchado:** um `UserContext` com 16 estados, usado em 111 arquivos, misturando configuração (`urlGeral`), estado de busca e preferências de UI. Qualquer letra digitada re-renderizava tudo, e a busca não ficava na URL.
- **Modais como barramento:** quatro stores zustand de modal, com um `ModalData` de cerca de 90 campos opcionais e merge com o estado anterior. O "modal" do pesquisador era uma página de 1.015 linhas que existia em paralelo com a página do pesquisador (1.432 linhas).
- **Três formas de buscar dados:** 79 componentes com `fetch` direto (58 dentro de `useEffect`), 50 com React Query e 14 com axios. A URL era montada à mão em 81 arquivos.
- **Tipos espalhados:** 278 interfaces declaradas em componentes, `Bolsistas` repetida 20 vezes e 257 usos de `any`.
- **Exibição duplicada:** cerca de 15 arquivos renderizando artigo, dois `Livro.tsx` quase idênticos e o mapa de cores do Qualis reimplementado em mais de 20 arquivos.

A API v2 nova tem um contrato consistente (envelope, facetas, paginação), e o backend aceitou padronizar o restante ([backend/](../backend/)). O design kit da área pública também foi consolidado. Não há compromisso de manter o código atual.

## Decisão

Começar um projeto novo na mesma branch `develop`, sem reaproveitar código do legado. O legado fica preservado na tag `legado-v1`, para consulta de comportamento e para recuperar mídia.

## Consequências

- A `develop` deixa de ter paridade com a produção até a virada (fase 4 do [roadmap](../roadmap.md)). **Não fazer merge da `develop` na `main` antes disso**: o deploy roda a cada push na `main`.
- Correções urgentes em produção, durante a reescrita, saem de uma branch criada a partir da `main`.
- Cada tela do legado precisa de um destino explícito: reconstruir, descontinuar ou decidir depois. Isso está em [legado/inventario.md](../legado/inventario.md).
- Mídia (vídeos, GeoJSON, imagens) não foi trazida. Cada tarefa recupera da tag o que precisar.
