# Facetas de território e município na v2

_Pedido em 2026-11-22, entregue na `develop` do backend em 2026-11-24 (commit `7e2cf5a` e correção do OpenAPI em `a77a87b`). Usado pela T2.3._

## Problema

- **Mapa da pós-graduação:** baixava até 100 programas (`per_page` máximo) e agrupava por cidade no navegador. Com mais de 100 programas, as contagens ficariam abaixo do real.
- **Território:** era deduzido pelo nome da cidade, comparado com o GeoJSON depois de normalizar acentos e caixa.
- **`/busca`:** não tinha mapa.

## O que a v2 entregou

- **Faceta hierárquica `territory_city`** em `/v2/researcher`, `/v2/production/{kind}` e `/v2/graduate-program`:
  - o primeiro nível é o território (`value` = código SEI, de 1 a 27);
  - `children` traz os municípios (`value` = código IBGE);
  - o `facet_limit` vale por nível, e com 100 vêm os 27 territórios e todos os municípios;
  - o grupo sem território vem por último, com `value: null`;
  - a faceta ignora os filtros de território e de município.
- **Códigos estáveis:** `FacetItem.code` traz o código SEI em `identity_territory` e o IBGE em `city`. O `value` de `identity_territory` passou de nome para código.
- **Filtros:**
  - `identity_territory` aceita o código ou o nome;
  - `city_code` (IBGE) é novo;
  - `/v2/graduate-program` ganhou o filtro e a faceta `identity_territory`.
- **`FacetResult.covered`:** itens distintos com algum valor na faceta.
- **Divisão de 27 territórios:** Costa do Descobrimento (27) saiu do Extremo Sul (7).

## Como o front usa

- **Entidade `territory`:** o mapa é `src/entities/territory/ui/territory-map.tsx`. O GeoJSON (`public/territorio_relacionado.json`) casa com a faceta pelo IBGE (`properties.id`) e pelo código SEI (`territorio_id`).
- **`/pos-graduacao`:** pede `territory_city` na própria query da lista, então o mapa segue o recorte.
- **`/busca`:** faz uma query à parte (`per_page=1`, `facets=territory_city`) só na visão `?view=map`.

## Pendências no backend

- **Busca por correspondência exata** (`acronym=` em `/v2/institution`, `name_exact=` em `/v2/researcher`), usada pelos redirects das URLs antigas. Ficou para outra entrega.
- **`ResearcherInstitution.identity_territory`** no payload do pesquisador ainda é o texto antigo, na divisão de 26. O front não exibe esse campo hoje.
- **Cidades fora da Bahia com nomes repetidos em vários estados** (ex.: São Carlos, Viçosa) ainda estão sem código IBGE.
