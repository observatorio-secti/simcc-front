# 0007. Escopo de dados: grupos via ODA, UFMG descontinuada

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

O backend (`simcc-back`) informou na resposta ao pedido de contrato ([backend/resposta-backend-v2.md](../backend/resposta-backend-v2.md)) que:

- grupos de pesquisa não são responsabilidade dele, e o que existe hoje não será ampliado;
- os dados da UFMG foram descontinuados;
- a v1 continua no ar, porque também atende o Power BI e integrações externas.

## Decisão

- **Grupos de pesquisa** continuam vindo da **API ODA**, por meio de um adaptador em `src/api/oda/` (ver [ADR 0003](0003-tipos-gerados-do-openapi.md)). O filtro `research_group_id` não existe na v2.
- **Dados da UFMG** (rotas `ufmg/researcher` e `ufmg/technician`, campos `dep_nom`, `entradanaufmg`, `menagers` etc.) **não** têm equivalente no front novo.
- O front novo não consome a **v1**. O que ainda não existe na v2 fica bloqueado no roadmap até o backend entregar, em vez de ser feito sobre a v1.

## Consequências

- Telas que dependem de rotas ainda não migradas (indicadores, MarIA, produções recentes) ficam marcadas como **bloqueadas** no roadmap, com a fase do backend correspondente.
- O grupo de pesquisa é a única entidade cujo modelo não vem dos tipos gerados.
