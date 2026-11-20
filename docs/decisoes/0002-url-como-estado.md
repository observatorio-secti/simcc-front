# 0002. TanStack Router e a URL como estado

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

No legado, termos de busca, tipo de busca, aba ativa e filtros ficavam em Context ou em stores de "modal". Por isso, um link compartilhado não reproduzia o resultado, F5 perdia a busca e o botão voltar não restaurava o estado. A v2 recebe os filtros como query params (listas como chave repetida), o que permite espelhar a URL da tela na chamada à API.

## Decisão

- Usar o **TanStack Router** com rotas por arquivo (`src/routes/`, plugin do Vite).
- Todo estado navegável fica na URL: search params validados com zod em `validateSearch`, ou segmentos do path.
- Os search params de uma listagem usam os mesmos nomes dos parâmetros da API (`q`, `page`, `per_page`, `sort_by`, `institution_id`…), de modo que a conversão URL → API seja direta.
- O `loader` da rota pré-carrega as queries com o `queryClient` do contexto do router.

## Consequências

- Search params são tipados no `useSearch` e no `<Link search>`: um filtro com nome errado é erro de compilação.
- Rotas por arquivo reduzem conflitos entre tarefas paralelas: cada tela acrescenta seus próprios arquivos, e o `routeTree.gen.ts` é regenerado.
- O `routeTree.gen.ts` é commitado (o `tsc` da CI depende dele) e ignorado por lint e Prettier. Em conflito de merge, basta rodar `npm run dev` ou `npm run build` para regenerá-lo.
- O time precisa aprender a API do TanStack Router, que é diferente da do React Router usado no legado.
