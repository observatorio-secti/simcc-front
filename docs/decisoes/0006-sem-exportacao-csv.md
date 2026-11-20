# 0006. Sem exportação CSV

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

O legado montava CSV no navegador a partir da página carregada. O pedido de `format=csv` à API foi recusado pelo backend por risco de carga: sem `per_page`, uma busca ampla varre a view materializada inteira. Montar o CSV no front com resultado completo exigiria paginar em lotes de no máximo 100 itens.

## Decisão

O front novo **não tem exportação CSV**, nem montada no navegador nem pela API.

## Consequências

- Nenhuma tela tem o botão "Baixar resultado". A toolbar de resultados do kit (`sc-toolbar`) é usada sem essa ação.
- Se a exportação voltar a ser pedida, ela precisa de um novo ADR e de uma rota no backend com streaming, teto de linhas e regras de achatamento por entidade.
