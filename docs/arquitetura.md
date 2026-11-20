# Arquitetura

O objetivo é que **cada dado tenha um lugar e cada entidade tenha um jeito de aparecer**. As regras abaixo existem para evitar os problemas da versão anterior: Context global com 16 estados usado em 111 arquivos, modais funcionando como barramento global, três formas de buscar dados, 278 interfaces declaradas dentro de componentes e a mesma entidade renderizada de jeitos diferentes em cada tela.

## Princípios

1. **A URL é a fonte da verdade do que é navegável.** Termos de busca, filtros, aba ativa, página, ordenação e item aberto ficam nos search params ou no path, validados com zod na definição da rota. Link compartilhado, F5 e botão voltar sempre funcionam. ([ADR 0002](decisoes/0002-url-como-estado.md))
2. **Dado do servidor vive no TanStack Query.** Nenhum componente busca dado em `useEffect`, e nenhuma resposta da API é copiada para estado local ou global.
3. **Sem Context de domínio.** Context só para infraestrutura (tema, query client, router) e dentro de primitivos de UI. O lint bloqueia `createContext` fora de `src/app/` e `src/shared/ui/`.
4. **O que tem identidade tem rota.** Pesquisador, programa, grupo, instituição e produção têm URL própria. Um drawer sobre uma lista é uma rota com overlay, não um modal global. Diálogos efêmeros (confirmar, compartilhar, filtros no mobile) são estado local de quem abre. ([ADR 0004](decisoes/0004-modais-e-drawers-como-rotas.md))
5. **Tipos vêm do contrato.** Os tipos da API v2 são gerados do OpenAPI. Ninguém escreve à mão uma interface de resposta da v2. ([ADR 0003](decisoes/0003-tipos-gerados-do-openapi.md))
6. **Uma entidade, um componente.** Cada entidade tem seus componentes de apresentação (card, ref com link, avatar) em `src/entities/<entidade>/ui/`, e toda tela usa esses componentes.
7. **Cor por dado vem do kit.** Toda cor de dicionário (área, Qualis, tipo de produção…) passa por `src/shared/lib/design-tokens.ts` e pelas classes do tema. Nada de hex em classe nem de cadeia de ternários. ([ADR 0005](decisoes/0005-tailwind-4-e-design-kit.md))

## Camadas

```
src/
├── main.tsx           ponto de entrada
├── app/               providers, router, query client, estilos globais
├── routes/            rotas por arquivo (TanStack Router): path, validateSearch, loader, componente
├── routeTree.gen.ts   gerado pelo plugin do router (commitado, não editar)
├── features/<tela>/   composição de uma tela ou fluxo
├── entities/<nome>/   modelo, queries e componentes de uma entidade de domínio
├── api/               clientes HTTP, tipos gerados, adaptadores de APIs externas
├── shared/ui/         primitivos do design kit (shadcn adaptado)
├── shared/lib/        utilitários sem domínio (cn, formatação, design-tokens, storage)
├── config/            variáveis de ambiente validadas
└── test/              setup e utilitários de teste
```

Quem pode importar quem (garantido pelo `eslint-plugin-boundaries` em `eslint.config.js`):

| Camada         | Pode importar                                                   |
| -------------- | --------------------------------------------------------------- |
| `app`          | todas                                                           |
| `routes`       | `routes`, `features`, `entities`, `shared`, `config`            |
| `features/<x>` | a própria `features/<x>`, `entities`, `api`, `shared`, `config` |
| `entities`     | `entities`, `api`, `shared`, `config`                           |
| `api`          | `api`, `shared`, `config`                                       |
| `shared`       | `shared`, `config`                                              |
| `config`       | `config`                                                        |

Outras regras do lint:

- `fetch` só em `src/api/`.
- `localStorage` e `sessionStorage` só em `src/shared/lib/storage.ts`.
- `createContext` só em `src/app/` e `src/shared/ui/`.
- `import type` obrigatório para tipos (`consistent-type-imports`).

Uma feature **nunca** importa outra. Se duas telas precisam do mesmo pedaço, ele desce para `entities/` (quando é sobre uma entidade) ou `shared/` (quando é genérico). Se forem a mesma tela em estados diferentes (ex.: home e resultados da busca), são a mesma feature.

## Fluxo de dados de uma tela

```
URL ──validateSearch (zod)──► search tipado
                                  │
route.loader ── queryClient.ensureQueryData(entityQueryOptions(search)) ── pré-carrega
                                  │
feature ── useQuery/useSuspenseQuery(entityQueryOptions(search)) ── lê do cache
                                  │
entities/<x>/ui ── renderiza o modelo
```

- Cada entidade exporta `queryOptions` (de `@tanstack/react-query`), com a query key padronizada: `['<entidade>', '<operação>', params]`. Ex.: `['researcher', 'list', search]`, `['researcher', 'detail', id]`.
- Mudar filtro = navegar (`navigate({ search: … })`). O componente nunca guarda o filtro em estado próprio.
- Erros da API chegam como `ApiError` (`status`, `code`, `message`), normalizados em `src/api/`. A tela decide como exibir com os componentes de estado do kit (vazio, alerta).

## Convenções

| Item                               | Convenção                                                        | Exemplo                                |
| ---------------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| Arquivos e pastas                  | kebab-case                                                       | `researcher-card.tsx`                  |
| Componentes                        | PascalCase, export nomeado                                       | `export function ResearcherCard`       |
| Código (variáveis, tipos, funções) | inglês                                                           | `useResearcherList`, `ProductionKind`  |
| Texto da interface                 | pt-BR, sentence case                                             | "Baixar resultado"                     |
| URLs públicas                      | pt-BR, kebab-case                                                | `/pesquisadores/$id`, `/pos-graduacao` |
| Search params                      | snake_case, iguais aos da API quando a tela espelha uma listagem | `?q=&institution_id=&page=2`           |
| Testes                             | ao lado do arquivo, `*.test.ts(x)`                               | `design-tokens.test.ts`                |

## Variáveis de ambiente

Toda variável `VITE_*` vai para o JavaScript público: **nunca** coloque segredo nelas. As variáveis são validadas uma única vez em `src/config/env.ts`, e o resto do código importa `env` de lá. A lista está em `.env.example`.

## Estilo

O tema do design kit (`design-kit/tokens/tailwind.css`) é importado em `src/app/styles.css`, que também liga as variáveis do shadcn aos papéis do kit. As regras visuais estão em `design-kit/DESIGN.md`. Para importar arquivos do kit no código, use o alias `@kit/` (ex.: `@kit/assets/logo/simcc.svg`).

## Testes

- Vitest + Testing Library, ambiente jsdom.
- Lógica pura (mapeamentos, schemas de busca, adaptadores) tem teste unitário.
- Telas são testadas com a API simulada (MSW, tarefa F1.6), renderizando a rota de verdade.

## Consultar o legado

A plataforma anterior está na tag `legado-v1` (`git show legado-v1:<caminho>`). Ela serve de referência de comportamento e para recuperar mídia (vídeos, GeoJSON, imagens) quando uma tarefa precisar. O destino de cada tela está em [legado/inventario.md](legado/inventario.md).
