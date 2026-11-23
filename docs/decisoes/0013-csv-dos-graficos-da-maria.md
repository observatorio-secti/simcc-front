# 0013. CSV dos gráficos da MarIA

- **Status:** aceita
- **Data:** 2026-11-23
- **Relação:** exceção à [0006](0006-sem-exportacao-csv.md)

## Contexto

A 0006 tirou a exportação CSV do front porque gerar o arquivo de uma busca ampla exigiria varrer a API inteira, em lotes. Os gráficos da MarIA são outro caso: cada bloco `chart` já chega completo na resposta, com no máximo `QUERY_MAX_ROWS` linhas (100 por padrão), e o pedido é baixar exatamente o que está desenhado.

## Decisão

O bloco `chart` da MarIA tem o menu **Baixar** com **Imagem (PNG)** e **Dados (CSV)**. O CSV é montado no navegador só com as linhas do bloco (`src/shared/lib/download.ts`): `;` entre colunas, vírgula decimal e BOM UTF-8, para abrir direto no Excel em pt-BR.

## Consequências

- Nenhuma chamada nova à API e nenhuma carga extra no backend.
- Continua valendo a 0006 para buscas, listagens e perfis: nada de "Baixar resultado" nessas telas.
- Se o bloco veio cortado (`truncated`), o CSV também vem; o aviso aparece no rodapé do gráfico.
