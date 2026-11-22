# Desligamento de rotas v1 no `simcc-back` (V5)

_Levantamento para a Onda 8 / Fase 4 (virada)._

## 1. Objetivo e contexto

Este documento lista todas as rotas da API v1 do `simcc-back` que o front legado (tag `legado-v1`, via `VITE_URL_GERAL` / `urlGeral` e cliente `api`) consumia e que o novo **Simcc Front** deixou de chamar.

No front novo, o consumo foi migrado para:

- **API v2 do `simcc-back`** (`VITE_SIMCC_API_URL`, prefixo `/v2/*`, cliente tipado em `src/api/simcc.ts` e `src/entities/*/queries.ts`);
- **API ODA** (`VITE_ODA_API_URL`, `src/api/oda/client.ts`) para grupos de pesquisa ([ADR 0007](../decisoes/0007-escopo-de-dados.md));
- **API independente da MarIA** (`VITE_MARIA_API_URL`, `src/api/maria.ts`) para conversas e streaming SSE;
- **API administrativa (`simcc-admin`)** (`VITE_ADMIN_API_URL`, `src/api/admin.ts`) para permissões (`/me`), admins, cadastro acadêmico (`/academic/*`) e ETL (`/etl/*`) ([ADR 0008](../decisoes/0008-autenticacao.md));
- **Power BI** embutido para painéis analíticos ([ADR 0012](../decisoes/0012-indicadores-via-power-bi.md));
- ou **descontinuadas** no escopo do produto ([inventário do legado](../legado/inventario.md)).

> [!IMPORTANT]
> Conforme registrado em [resposta-backend-v2.md §7.6](resposta-backend-v2.md#7-o-que-pode-quebrar-o-backend), **as rotas legadas não podem ser desligadas em bloco**: a v1 também serve o Power BI (`/powerBi`) e eventuais integrações externas. Apenas as rotas listadas abaixo deixaram de ser usadas pelo front novo e devem passar pelos critérios da seção 3 antes da remoção.

---

## 2. Inventário de rotas v1 por domínio/tela

### 2.1 Pesquisadores (busca, perfil, indicadores, termos e imagens)

| Endpoint v1 no legado                   | Substituto no front novo                                                                               | Observações                                                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /researcher`                       | `GET /v2/researcher`                                                                                   | No legado também era chamada por grupo (`?group_id=`) e instituição (`?institution_id=`). No front novo, filtros acadêmicos vão em `/v2/researcher` e membros de grupo vêm da ODA (`/grupos-pesquisa/{id}/pesquisadores`). |
| `GET /researcherName`                   | `GET /v2/researcher?q=&search_in=name`                                                                 | Depende de `search_in` entregue na virada (V4.1). Também usada no redirect de `/researcher?researcher_name=`.                                                                                                              |
| `GET /researcherBook`                   | `GET /v2/researcher` e `GET /v2/production/book`                                                       | Busca de pesquisadores por livro consolidada na busca v2.                                                                                                                                                                  |
| `GET /researcherArea_specialty`         | `GET /v2/researcher`                                                                                   | Substituída por filtro `area` e busca textual na v2.                                                                                                                                                                       |
| `GET /researcherParticipationEvent`     | `GET /v2/researcher` e `GET /v2/production/event`                                                      | Consolidada na busca v2.                                                                                                                                                                                                   |
| `GET /researcherPatent`                 | `GET /v2/researcher` e `GET /v2/production/patent`                                                     | Consolidada na busca v2.                                                                                                                                                                                                   |
| `GET /researcher_filter`                | `GET /v2/researcher` (campo `facets`)                                                                  | Facetas (`area`, `graduation`, `city`, `institution`, `modality`, `graduate_program`, `identity_territory`) vêm no envelope padrão da v2.                                                                                  |
| `GET /researcher_metrics`               | `GET /v2/researcher` e `GET /v2/researcher/{researcher_id}`                                            | Contagens e bibliometria consolidadas nos payloads da v2.                                                                                                                                                                  |
| `GET /researcher/DadosGerais`           | `GET /v2/researcher/{researcher_id}?include=education,experience,foment`                               | Detalhe completo do pesquisador na v2.                                                                                                                                                                                     |
| `GET /ResearcherData/DadosGerais`       | `GET /v2/researcher/{researcher_id}?include=education,experience,foment`                               | Variante legada usada na home e em programas de pós-graduação.                                                                                                                                                             |
| `GET /ResearcherData/Image`             | `GET /v2/researcher/{researcher_id}/image` (e `image_url` nos payloads)                                | Na v1 buscava por `name` ou `researcher_id`; na v2 a resolução é sempre por `researcher_id`.                                                                                                                               |
| `GET /academic_degree`                  | `GET /v2/researcher/{researcher_id}?include=education` e faceta `graduation` em `GET /v2/researcher`   | Formação acadêmica no detalhe e agregação por titulação via faceta.                                                                                                                                                        |
| `GET /professional_experience`          | `GET /v2/researcher/{researcher_id}?include=experience`                                                | Experiência profissional movida para o `include=experience`.                                                                                                                                                               |
| `GET /lists_word_researcher`            | `GET /v2/researcher/{researcher_id}/terms`                                                             | Nuvem de palavras/termos do pesquisador.                                                                                                                                                                                   |
| `GET /researcher/{id}/guidance_metrics` | `GET /v2/metrics/production/guidance?researcher_id={id}`                                               | Série anual de orientações na v2.                                                                                                                                                                                          |
| `GET /researcher/{id}/article_metrics`  | `GET /v2/metrics/production/article?researcher_id={id}` e `bibliometrics` em `GET /v2/researcher/{id}` | Citações, Qualis e série de artigos na v2.                                                                                                                                                                                 |
| `GET /researcher/co-authorship/{id}`    | Descontinuada                                                                                          | Sem equivalente direto; coautores são exibidos nos itens de `/v2/production/*?researcher_id={id}`.                                                                                                                         |
| `GET /outstanding_researchers`          | Descontinuada                                                                                          | Bloco legado da home sem equivalente na v2.                                                                                                                                                                                |
| `GET /labs`                             | Descontinuada                                                                                          | Infraestrutura/laboratórios fora do escopo do front novo.                                                                                                                                                                  |

### 2.2 Produções científicas e técnicas

| Endpoint v1 no legado                        | Substituto no front novo                                                            | Observações                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `GET /bibliographic_production_article`      | `GET /v2/production/article`                                                        | Lista e busca de artigos na v2.                                                          |
| `GET /bibliographic_production_article_area` | `GET /v2/production/article` (filtro `area`)                                        | Filtro por área unificado na rota v2.                                                    |
| `GET /bibliographic_production_researcher`   | `GET /v2/production/article?researcher_id={id}` (ou demais `/v2/production/{kind}`) | No legado era chamada tanto para listagens quanto para produções de um pesquisador.      |
| `GET /book_production_researcher`            | `GET /v2/production/book`                                                           | Livros.                                                                                  |
| `GET /book_chapter_production_researcher`    | `GET /v2/production/book-chapter`                                                   | Capítulos de livro.                                                                      |
| `GET /software_production_researcher`        | `GET /v2/production/software`                                                       | Softwares.                                                                               |
| `GET /patent_production_researcher`          | `GET /v2/production/patent`                                                         | Patentes.                                                                                |
| `GET /pevent_researcher`                     | `GET /v2/production/event`                                                          | Participação em eventos.                                                                 |
| `GET /researcher_research_project`           | `GET /v2/production/research-project`                                               | Projetos de pesquisa.                                                                    |
| `GET /brand_production_researcher`           | `GET /v2/production/brand`                                                          | Marcas.                                                                                  |
| `GET /guidance_researcher`                   | `GET /v2/production/guidance`                                                       | Orientações.                                                                             |
| `GET /researcher_report`                     | `GET /v2/production/report`                                                         | Relatórios técnicos.                                                                     |
| `GET /papers_magazine`                       | `GET /v2/production/magazine-text`                                                  | **Depende da migração `d3f1a2b4c5e6`** aplicada no backend antes da virada/desligamento. |
| `GET /researcher_production/papers_magazine` | `GET /v2/production/magazine-text`                                                  | **Depende da migração `d3f1a2b4c5e6`** aplicada no backend antes da virada/desligamento. |
| `GET /researcher_production/events`          | `GET /v2/production/event-work`                                                     | **Depende da migração `d3f1a2b4c5e6`** aplicada no backend antes da virada/desligamento. |
| `GET /technical_production_researcher`       | `GET /v2/production/brand` e `GET /v2/production/report`                            | Tipo genérico `technical` substituído por `brand` e `report` na v2.                      |
| `GET /recently_updated`                      | Descontinuada                                                                       | Tela `/producoes-recentes` descontinuada ([inventário](../legado/inventario.md)).        |
| `GET /image/{id}`, `DELETE /image/{id}`      | Descontinuada                                                                       | Capas e remoção de imagem de produção não existem no front novo.                         |

### 2.3 Instituições e departamentos

| Endpoint v1 no legado       | Substituto no front novo                                       | Observações                                                                                        |
| --------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `GET /institution`          | `GET /v2/institution`                                          | Lista e busca de instituições com facetas.                                                         |
| `GET /institution/{id}`     | `GET /v2/institution/{institution_id}`                         | Detalhe público na v2; CRUD administrativo migrado para `simcc-admin` (`/academic/institutions*`). |
| `GET /institutionFrequenci` | `GET /v2/institution` e `GET /v2/institution/{institution_id}` | Contagens por instituição consolidadas na v2.                                                      |
| `GET /departament/rt`       | Descontinuada                                                  | Departamentos fora do escopo da v2.                                                                |

### 2.4 Programas de pós-graduação

| Endpoint v1 no legado                           | Substituto no front novo                                                                                              | Observações                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `GET /graduate_program_profnit`                 | `GET /v2/graduate-program` e `GET /v2/graduate-program/{program_id}`                                                  | Lista e detalhe de programas na v2.                               |
| `GET /graduate_program/lines`                   | `GET /v2/graduate-program/{program_id}`                                                                               | Linhas de pesquisa retornadas no detalhe do programa na v2.       |
| `GET /graduate_program_production`              | `GET /v2/graduate-program/{program_id}` e `GET /v2/production/{kind}?graduate_program_id={id}`                        | Totais e produções por programa na v2.                            |
| `GET /graduate_program/{id}/article_production` | `GET /v2/production/article?graduate_program_id={id}` e `GET /v2/metrics/production/article?graduate_program_id={id}` | Produção de artigos do programa via filtro `graduate_program_id`. |

### 2.5 Grupos de pesquisa

| Endpoint v1 no legado       | Substituto no front novo                                            | Observações                                                                       |
| --------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `GET /research_group`       | API ODA (`GET /grupos-pesquisa/simcc`, `GET /grupos-pesquisa/{id}`) | Fora do escopo do `simcc-back` ([ADR 0007](../decisoes/0007-escopo-de-dados.md)). |
| `GET /research_group_lines` | API ODA (`GET /grupos-pesquisa/{id}`)                               | Linhas de pesquisa obtidas diretamente do detalhe na ODA.                         |

### 2.6 Revistas e bolsistas

| Endpoint v1 no legado                 | Substituto no front novo                                                           | Observações                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `GET /magazine`                       | `GET /v2/magazine` (e `GET /v2/magazine/{magazine_id}`)                            | Inclui faceta `qualis` (com `not_rated` na V4.1) e JCR tipado.      |
| `GET /researcher/foment`              | `GET /v2/scholarship` (e `include=foment` em `GET /v2/researcher/{researcher_id}`) | Listagem de bolsistas com facetas de instituição e programa (V4.1). |
| `GET /foment`                         | `GET /v2/scholarship`                                                              | Rota auxiliar de fomento na home legada.                            |
| `GET /metrics/researcher/scholarship` | `GET /v2/scholarship`                                                              | Totais e distribuição de bolsas via listagem/facetas da v2.         |

### 2.7 Métricas e gráficos (`metrics/*`)

| Endpoint v1 no legado                 | Substituto no front novo                      | Observações                                                                                           |
| ------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `GET /metrics/article/chart`          | `GET /v2/metrics/production/article`          | Série anual com os mesmos filtros da listagem.                                                        |
| `GET /metrics/book/chart`             | `GET /v2/metrics/production/book`             | Série anual.                                                                                          |
| `GET /metrics/book-chapter/chart`     | `GET /v2/metrics/production/book-chapter`     | Série anual.                                                                                          |
| `GET /metrics/software/chart`         | `GET /v2/metrics/production/software`         | Série anual.                                                                                          |
| `GET /metrics/patent/chart`           | `GET /v2/metrics/production/patent`           | Série anual.                                                                                          |
| `GET /metrics/speaker/chart`          | `GET /v2/metrics/production/event`            | Série anual.                                                                                          |
| `GET /metrics/brand/chart`            | `GET /v2/metrics/production/brand`            | Série anual.                                                                                          |
| `GET /metrics/guidance/chart`         | `GET /v2/metrics/production/guidance`         | Série anual.                                                                                          |
| `GET /metrics/research-report/chart`  | `GET /v2/metrics/production/report`           | Série anual.                                                                                          |
| `GET /metrics/research-project/chart` | `GET /v2/metrics/production/research-project` | Série anual.                                                                                          |
| `GET /metrics/papers-magazine/chart`  | `GET /v2/metrics/production/magazine-text`    | **Depende da migração `d3f1a2b4c5e6`** no backend.                                                    |
| `GET /metrics/events/chart`           | `GET /v2/metrics/production/event-work`       | **Depende da migração `d3f1a2b4c5e6`** no backend.                                                    |
| `GET /metrics/researcher/chart`       | `GET /v2/researcher`                          | Totais e distribuição vêm no envelope (`pagination` e `facets`).                                      |
| `GET /metrics/research-group/chart`   | API ODA (`GET /grupos-pesquisa/simcc`)        | Grupos servidos exclusivamente pela ODA.                                                              |
| `GET /metrics/academic-degree/chart`  | `GET /v2/researcher` (faceta `graduation`)    | Contagem por titulação via faceta.                                                                    |
| `GET /metrics/great-area/chart`       | `GET /v2/researcher` (faceta `area`)          | Contagem por grande área via faceta.                                                                  |
| `GET /metrics/magazine/chart`         | `GET /v2/magazine` (faceta `qualis`)          | Contagem por estrato Qualis via faceta.                                                               |
| `GET /metrics/lattes-update/chart`    | Descontinuada                                 | Painéis analíticos migrados para Power BI ([ADR 0012](../decisoes/0012-indicadores-via-power-bi.md)). |

### 2.8 MarIA (busca semântica)

| Endpoint v1 no legado            | Substituto no front novo                                                                       | Observações                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `GET /maria/researcher`          | `VITE_MARIA_API_URL` (`POST /conversations`, `POST /conversations/{id}/messages/stream`, etc.) | Serviço independente (`observatorio-maria`), integrado na tela `/maria` (T10). |
| `GET /maria/researcher/article`  | `VITE_MARIA_API_URL`                                                                           | Idem.                                                                          |
| `GET /maria/researcher/book`     | `VITE_MARIA_API_URL`                                                                           | Idem.                                                                          |
| `GET /maria/researcher/area`     | `VITE_MARIA_API_URL`                                                                           | Idem.                                                                          |
| `GET /maria/researcher/event`    | `VITE_MARIA_API_URL`                                                                           | Idem.                                                                          |
| `GET /maria/researcher/patent`   | `VITE_MARIA_API_URL`                                                                           | Idem.                                                                          |
| `GET /maria/researcher/abstract` | `VITE_MARIA_API_URL`                                                                           | Idem.                                                                          |

### 2.9 Rotas UFMG e utilitários descontinuados

| Endpoint v1 no legado                     | Substituto no front novo | Observações                                                                                                   |
| ----------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `GET /ufmg/researcher`                    | Descontinuada            | Dados da UFMG descontinuados ([ADR 0007](../decisoes/0007-escopo-de-dados.md)); `/provimento-cargo` removido. |
| `GET /ufmg/technician`                    | Descontinuada            | Dados da UFMG descontinuados; aba `tecnicos` removida.                                                        |
| `POST /newsletter` (ou `GET /newsletter`) | Descontinuada            | Formulário de newsletter removido do front novo.                                                              |
| `GET /logs`                               | Descontinuada            | Página `/informacoes` fora do escopo; logs de ETL ficam no `simcc-admin` (`GET /etl/runs/{run_id}/logs`).     |

---

## 3. Critérios para desligamento seguro no backend

O desligamento das rotas v1 acima deve ocorrer somente **após** a virada de produção (V4) e seguindo todas as etapas abaixo:

1. **Virada concluída e estável (V4):**
   - `simcc-back` publicado na `main` com a migração `d3f1a2b4c5e6` aplicada (garantindo `/v2/production/magazine-text`, `/v2/production/event-work` e suas respectivas rotas de `/v2/metrics/production/*`);
   - novo **Simcc Front** publicado na `main` (sem nenhum fallback para rotas v1 ou `VITE_URL_GERAL` antiga) e redirects da V2 validados em produção.
2. **Janela de observação e confirmação de zero tráfego:**
   - monitorar os logs de acesso do `simcc-back` (proxy reverso / FastAPI) por uma janela mínima definida pelo time (ex.: 14 a 30 dias após a virada) para confirmar **zero requisições** às rotas listadas na seção 2;
   - verificar se algum cliente em cache antigo (PWA/aba aberta) ainda gera chamadas residuais antes de remover a rota.
3. **Preservação de consumidores externos:**
   - **não** desligar rotas v1 fora desta lista — em especial `/powerBi` e quaisquer endpoints consumidos por painéis do Power BI, scripts de ETL ou integrações externas conhecidas;
   - caso alguma rota da seção 2 apresente tráfego residual nos logs, identificar o `User-Agent` / `Referer` / origem antes de prosseguir.
4. **Desligamento gradual (recomendado):**
   - opcionalmente retornar `410 Gone` (ou logar alerta de depreciação) por um período curto antes da remoção definitiva do código no `simcc-back`, facilitando identificar consumidores externos não mapeados.
