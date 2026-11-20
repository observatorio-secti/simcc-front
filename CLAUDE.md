# Simcc Front

Front-end da plataforma Simcc (Observatório de CT&I da Bahia), em reescrita do zero sobre a API v2. O legado está na tag `legado-v1`.

## Comandos

```bash
npm run dev          # http://localhost:8080
npm run typecheck
npm run lint
npm run format       # Prettier (com ordenação de classes Tailwind)
npm run test
npm run build
npm run api:types    # gera src/api/generated/simcc-v2.d.ts do OpenAPI da v2
python3 -m http.server 8765 -d design-kit   # páginas de exemplo do kit
```

Antes de entregar: `typecheck`, `lint`, `format:check`, `test` e `build` sem erro (é o que a CI roda).

## Stack

React 19, Vite, TypeScript estrito, TanStack Router (rotas por arquivo em `src/routes/`), TanStack Query, zod, openapi-fetch, Tailwind 4, shadcn/radix, lucide-react, Vitest e Testing Library.

## Onde está cada coisa

- `docs/roadmap.md`: tarefas, dependências e status. Toda mudança pertence a uma tarefa.
- `docs/arquitetura.md`: camadas, fluxo de dados e convenções.
- `docs/decisoes/`: ADRs. Decisão nova de arquitetura vira ADR novo.
- `docs/backend/`: contrato da v2 negociado com o backend.
- `design-kit/DESIGN.md`: regras visuais. `design-kit/reference/components.md`: receitas de componentes.

## Regras

- **Camadas** (o lint bloqueia): `app → routes → features → entities → api/shared → config`. Uma feature nunca importa outra feature.
- **Estado navegável na URL** (search params validados com zod na rota). Nada de Context ou store global para busca, filtro, aba ou item aberto.
- **Dado do servidor só via TanStack Query**, com `queryOptions` exportadas pela entidade. Sem `fetch` fora de `src/api/` e sem buscar dados em `useEffect`.
- **Tipos da v2 vêm de `src/api/generated/`.** Não escreva interface de resposta à mão. Não use os campos `deprecated` (`researcher_id`, `image`): use `id` e `image_url`.
- **Entidade com identidade é rota** (pesquisador, programa, grupo, instituição, produção). Sem store global de modal.
- **Uma entidade, um conjunto de componentes**, em `src/entities/<nome>/ui/`.
- **Cor por dado** só via `src/shared/lib/design-tokens.ts` e classes do tema (`bg-area-saude`, `bg-qualis-A1`…). Sem hex em classe.
- `localStorage`/`sessionStorage` só via `src/shared/lib/storage.ts`. Nenhum segredo em variável `VITE_*`.
- Sem exportação CSV (ADR 0006). Grupos de pesquisa vêm da ODA (ADR 0007).
- Código em inglês; textos da interface em pt-BR, sentence case; URLs públicas em pt-BR, kebab-case.
- `src/routeTree.gen.ts` é gerado: não edite. Em conflito de merge, rode `npm run build` para regenerar.

## Fluxo de trabalho

Uma tarefa do roadmap = uma branch `feat/<id>-<slug>` a partir da `develop` = um PR para a `develop`. Atualize o status da tarefa em `docs/roadmap.md` no próprio PR. Não faça merge da `develop` na `main` antes da virada (fase 4): o deploy roda a cada push na `main`.

Para consultar o legado: `git show legado-v1:<caminho>`. Use como referência de comportamento, não de estrutura.
