# Pedidos de contrato v2 — SIMCC

_Enviado em 2026-11-20._

> **Status: respondido.** A posição do backend, item por item, está em [resposta-backend-v2.md](resposta-backend-v2.md). Resumo do que mudou desde o envio:
>
> - **Recusados ou fora do escopo do `simcc-back`:** exportação `format=csv` (e o front decidiu não ter CSV, ver [ADR 0006](../decisoes/0006-sem-exportacao-csv.md)); grupos de pesquisa e `research_group_id` (continuam na ODA); rotas e campos da UFMG (descontinuados).
> - **Já existiam na v2:** OpenAPI publicado, detalhe do pesquisador, facetas em produções, `researcher_id` como filtro, catálogos de instituição e programa, enums de entrada, `per_page` máximo e 404 × lista vazia.
> - **`technical`:** substituído por `brand` (aceito) e `report` (ainda não pedido).
> - **Autenticação, IdP, ETL e API administrativa** são de outros times.

O front será reescrito do zero sobre a v2. Para que cada entidade apareça igual em todas as telas, pedimos ao backend um contrato único, descrito em OpenAPI, com as convenções abaixo. Os itens vêm do que o front consome hoje.

## 1. Contrato primeiro

Pedido principal: um documento **OpenAPI 3.1** da v2, publicado em uma URL estável e versionado junto com o código. O front gera os tipos a partir dele e deixa de escrever interfaces à mão.

- Todo campo com tipo, nulabilidade e descrição. Hoje `summary` e `filters_applied` são `unknown`.
- Enums declarados como enums no schema, não como `string`.
- Exemplos de resposta por rota, usados também como mocks durante o desenvolvimento do front.
- Mudança que quebra contrato só em nova versão de rota, com aviso no changelog.
- Validação do contrato na CI do backend: a resposta real precisa bater com o schema.

## 2. Convenções gerais

A mesma regra vale para todas as rotas. Cada linha é uma divergência que existe hoje na v2 ou na API administrativa.

| Tema                     | Hoje                                                                                                            | Pedido                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Identificador            | `ResearcherV2.researcher_id`, mas `ResearcherRefV2.id` e `InstitutionV2.id`; o admin também usa `researcher_id` | `id` em toda entidade; `<entidade>_id` só em filtros e referências                                      |
| Nome de tipo de produção | `book-chapter` em `/v2/production`, `BOOK_CHAPTER` em `/v2/suggestion`                                          | Um enum só, em snake_case minúsculo (`book_chapter`), igual em rota, filtro, faceta e sugestão          |
| Trecho destacado         | `[[termo]]` em pesquisador, `<b>termo</b>` em produção                                                          | Um formato, sem HTML: texto puro + lista de intervalos `[início, fim]`                                  |
| Datas                    | `YYYYMMDD` em analytics, ISO em `meta.timestamp`, `lattes_update` como string livre                             | ISO 8601 sempre (`2026-11-20` ou `2026-11-20T14:00:00Z`)                                                |
| Números                  | Contagens como string em rotas legadas (`scholarship_quantity`)                                                 | `number` para toda quantidade                                                                           |
| Ano                      | `year: number \| null` na v2, string nas legadas                                                                | `number \| null`                                                                                        |
| Qualis                   | `qualis: string \| null`, com valores como `None`, `NP`, `SQ`                                                   | Enum fechado (`A1`…`C`) e `null` quando não houver; o motivo da ausência em campo separado, se importar |
| JCR                      | `jcr: string \| null`                                                                                           | `number \| null`                                                                                        |
| Autores e palavras-chave | `all_authors_raw` e `keywords` como string única                                                                | Arrays: `authors: { name, researcher_id? }[]`, `keywords: string[]`                                     |
| Imagem do pesquisador    | Rota separada `ResearcherData/Image?name=` (busca por nome)                                                     | URL absoluta da imagem no payload (`image_url`)                                                         |
| Ausência de valor        | Mistura de `null`, string vazia e `"None"`                                                                      | Sempre `null`; nunca string vazia ou `"None"`                                                           |
| Nomes de campo           | Inglês e português misturados (`dep_nom`, `entradanaufmg`, `menagers`)                                          | Inglês, snake_case, sem abreviação; nada específico de uma instituição no modelo comum                  |

## 3. Envelope de resposta

O envelope de `/v2/researcher` é o modelo certo. O pedido é que toda rota siga um de três formatos, sempre com os mesmos campos.

| Formato | Campos                                                              | Divergências hoje                                                                                                                                                            |
| ------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lista   | `data[]`, `pagination`, `sort`, `filters_applied`, `facets`, `meta` | `/v2/production/*` não devolve `facets`; `/v2/suggestion` não tem `pagination`; `/v2/analytics` não tem `meta` e usa outro `summary`; no admin todos os campos são opcionais |
| Detalhe | `data` (um objeto), `meta`                                          | Cada rota de detalhe devolve o objeto solto, sem `meta`                                                                                                                      |
| Erro    | `error: { code, message, details[] }` com status HTTP correto       | Sem formato definido; o front não consegue distinguir "não encontrado" de "vazio"                                                                                            |

- `meta` sempre com `took_ms`, `cached`, `timestamp` e `data_as_of`. O `data_as_of` é o que permite mostrar "dados atualizados em" de forma igual em toda tela.
- `filters_applied` tipado: as mesmas chaves e tipos dos parâmetros aceitos.
- `summary` só quando a rota declarar o que ele contém; caso contrário, fora do envelope.
- 404 para entidade inexistente e lista vazia (`data: []`, 200) para busca sem resultado.

## 4. Busca, filtros e paginação

O front vai espelhar os parâmetros da URL da tela nos parâmetros da API, um para um. Para isso, toda listagem precisa aceitar o mesmo vocabulário.

- **Parâmetros comuns:** `q`, `page`, `per_page`, `sort_by`, `sort_order`, `facets`, `facet_limit` em todas as listagens.
- **Listas como chave repetida** (`institution_id=a&institution_id=b`), como já é hoje. Documentar isso no OpenAPI.
- **Mesmos nomes de filtro em todas as rotas:** `institution_id`, `graduate_program_id`, `research_group_id`, `researcher_id`, `year_start`, `year_end`, `city_id`, `area`.
- **Facetas em produções:** `/v2/production/{kind}` deve aceitar `facets` e devolver o mesmo `FacetV2` de pesquisadores (ano, instituição, qualis, programa).
- **Chave da faceta = nome do filtro:** hoje a faceta `institution` corresponde ao filtro `institution_id`. Pedimos um campo `param` em cada faceta, ou a mesma chave nos dois lados.
- **Ordenação:** a lista de valores aceitos em `sort_by` declarada como enum por rota.
- **Limites:** `per_page` máximo documentado, e `total_items` exato, ou marcado como estimado quando não for.
- **Exportação:** a mesma rota com `format=csv`, respeitando os mesmos filtros. Hoje o CSV é montado no front, a partir da página carregada.

## 5. Cobertura da v2

A v2 cobre hoje busca de pesquisadores, produções, sugestões e analytics. O front ainda chama cerca de 70 rotas legadas, além da API ODA para grupos. Os caminhos pedidos são sugestões; o importante é seguirem as convenções acima.

| Prioridade | Entidade                        | Hoje (legado)                                                                                                                                                                                                                                                      | Pedido na v2                                                                                                            |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 1          | Pesquisador (detalhe)           | `researcher/DadosGerais`, `ResearcherData/DadosGerais`, `researcher_metrics`, `academic_degree`, `professional_experience`, `researcher/foment`                                                                                                                    | `GET /v2/researcher/{id}` com perfil, formação, experiência, fomento e contagens                                        |
| 1          | Produções de um pesquisador     | Uma rota por tipo: `bibliographic_production_researcher`, `book_production_researcher`, `patent_production_researcher`, `pevent_researcher`, `software_production_researcher`, `brand_production_researcher`, `guidance_researcher`, `researcher_research_project` | `/v2/production/{kind}?researcher_id=` para todos os tipos, incluindo `brand`, `guidance`, `project` e `technical`      |
| 1          | Instituição                     | `institution`, `institutionFrequenci`                                                                                                                                                                                                                              | `GET /v2/institution` (lista com facetas) e `/v2/institution/{id}`                                                      |
| 1          | Programa de pós-graduação       | `graduate_program`, `graduate_program/lines`, `graduate_program_production`, `graduate_program_profnit`                                                                                                                                                            | `/v2/graduate-program`, `/v2/graduate-program/{id}` com linhas de pesquisa; produções pelo filtro `graduate_program_id` |
| 1          | Grupo de pesquisa               | API ODA `grupos-pesquisa/simcc`, `research_group`, `research_group_lines`                                                                                                                                                                                          | `/v2/research-group` e `/v2/research-group/{id}` na mesma API                                                           |
| 2          | Revista                         | `magazine?initials=&issn=`                                                                                                                                                                                                                                         | `/v2/magazine` com busca por nome e ISSN, qualis e JCR tipados                                                          |
| 2          | Indicadores                     | ~15 rotas `metrics/*` e `metrics/*/chart`                                                                                                                                                                                                                          | `/v2/metrics/{indicador}` com os mesmos filtros das buscas e série no formato `{ period, value }[]`                     |
| 2          | Bolsistas                       | `metrics/researcher/scholarship` e rotas específicas                                                                                                                                                                                                               | `/v2/scholarship` com filtros comuns                                                                                    |
| 2          | Nuvem de palavras e áreas       | `lists_word_researcher`, `researcherArea_specialty`                                                                                                                                                                                                                | Faceta ou rota `/v2/researcher/{id}/terms`                                                                              |
| 3          | MarIA                           | `maria/researcher/*` (um por tipo)                                                                                                                                                                                                                                 | Uma rota de busca semântica que devolva `ResearcherV2` e produções nos formatos da v2                                   |
| 3          | Rotas específicas da UFMG       | `ufmg/researcher`, `ufmg/technician`                                                                                                                                                                                                                               | Decidir se continuam; se sim, como extensão opcional do modelo comum                                                    |
| 3          | Produções recentes e newsletter | `recently_updated`, `newsletter`                                                                                                                                                                                                                                   | `/v2/production/{kind}?sort_by=created_at`                                                                              |

## 6. Autenticação e sessão

> **Superado (2026-11-20):** o IdP só autentica; permissões do Simcc ficam na API de admin e o front não chama o ETL. Ver [ADR 0008](../decisoes/0008-autenticacao.md).

O fluxo PKCE com o IdP funciona e será mantido. O problema é onde os tokens ficam: hoje o access token e o refresh token estão no `localStorage`, e qualquer XSS rouba a sessão.

- **Refresh token em cookie `httpOnly`, `Secure`, `SameSite=Strict`**, emitido pelo IdP. Front (`/simcc/`) e IdP (`/idp/`) já estão no mesmo domínio, então o cookie funciona sem configuração entre origens. O front guarda só o access token, em memória.
- **Rota de refresh que leia o cookie**, sem o front enviar o refresh token no corpo.
- **`GET /me`** com usuário, instituições vinculadas e permissões como lista de escopos (`console:etl`, `console:researchers`...). O front decide o que mostrar a partir disso, sem checar papéis.
- **401 × 403 corretos:** 401 para token inválido ou expirado, 403 para falta de permissão.
- **ETL protegido pelo login, não por chave estática.** Hoje o front envia `X-ETL-API-Key` com o valor de `VITE_ETL_API_KEY`. Toda variável `VITE_*` vai para o JavaScript público, então essa chave está visível para qualquer visitante, e o ETL (`simcc.uesc.br/etl/`) aceita disparar rotinas com ela. Pedido: o ETL valida o token do IdP e exige o escopo `console:etl`; a chave atual deve ser trocada.
- **CORS no ETL:** é o único serviço fora de `observatoriocti.secti.ba.gov.br`. Liberar só a origem do front, com o cabeçalho `Authorization`.

## 7. Perguntas em aberto

- [ ] A área pública vai mostrar algo diferente para quem está logado (coleções, buscas salvas, dados restritos)? Isso define se o cache do front depende do usuário.
- [ ] Os grupos de pesquisa saem da ODA e passam a ser servidos pela v2?
- [ ] O IdP consegue emitir o refresh token em cookie `httpOnly`?
- [ ] O ETL continua em `simcc.uesc.br` ou passa para `observatoriocti.secti.ba.gov.br`?
- [ ] Qual o prazo para o OpenAPI da v2 estar publicado?
- [ ] As rotas legadas serão desligadas em que data, depois que o novo front estiver no ar?
- [ ] Qual o formato escolhido para o trecho destacado (intervalos ou marcadores)?
