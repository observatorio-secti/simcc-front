# 0013. Exportação dos blocos de dados da MarIA

- **Status:** aceita
- **Data:** 2026-11-22
- **Relação:** abre uma exceção restrita ao [ADR 0006](0006-sem-exportacao-csv.md)

## Contexto

A especificação da tela de chat da MarIA (T10.1) pede "Copiar CSV", "Baixar CSV" e "Baixar PNG" nos gráficos e tabelas da resposta. O ADR 0006 tirou a exportação CSV do front porque montar um CSV completo de uma busca exigiria paginar a v2 ou criar uma rota de exportação sem teto, com risco de carga no backend.

Os blocos `chart` e `table` da MarIA são diferentes: chegam inteiros na resposta, já limitados pela própria API (`QUERY_MAX_ROWS`, 100 linhas por padrão, com `truncated` quando cortados). Exportá-los não faz nenhuma requisição nova.

## Decisão

- Os blocos `chart` e `table` de uma resposta da MarIA podem ser copiados e baixados em CSV, e os gráficos baixados em PNG.
- O CSV contém **só as linhas que já estão no bloco**: nada é buscado de novo. Quando o bloco veio com `truncated`, o aviso de corte aparece junto e o arquivo leva uma linha de comentário dizendo que o resultado foi limitado.
- Formato: separador `;`, BOM UTF-8 e decimal com vírgula, para abrir direto no Excel em pt-BR. Gráfico com `stacking: percent` exporta os valores absolutos que a API enviou.
- O PNG é gerado no navegador a partir do SVG do gráfico, com título, legenda e fonte.
- O ADR 0006 continua valendo para todo o resto: busca, listagens e perfis seguem sem "Baixar resultado".

## Consequências

- O código de exportação fica na feature `maria` e não é reaproveitado por outras telas sem um ADR novo.
- Se a API passar a mandar blocos maiores (ex.: aumentar `QUERY_MAX_ROWS`), a exportação acompanha sem mudar o front, porque continua sem chamada extra.
