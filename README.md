# Simcc Front

Front-end da plataforma **Simcc**, do Observatório de Ciência, Tecnologia e Inovação da Bahia (SECTI-BA).

> **Em reconstrução.** Esta versão está sendo reescrita do zero sobre a API v2 e o Simcc Design Kit. O plano e o andamento estão em [`docs/roadmap.md`](docs/roadmap.md). A versão anterior está preservada na tag `legado-v1` e continua em produção a partir da `main`.

## Requisitos

- Node.js 20.19 ou superior (a CI usa Node 22)
- npm

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_SIMCC_API_URL
npm run dev            # http://localhost:8080
```

As variáveis estão documentadas em [`.env.example`](.env.example). Toda variável `VITE_*` vai para o JavaScript público: não coloque segredos nelas.

## Scripts

| Script                            | O que faz                                             |
| --------------------------------- | ----------------------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento na porta 8080             |
| `npm run build`                   | Checagem de tipos e build de produção em `dist/`      |
| `npm run preview`                 | Serve o build localmente                              |
| `npm run typecheck`               | Checagem de tipos                                     |
| `npm run lint`                    | ESLint, incluindo as regras de camadas da arquitetura |
| `npm run format` / `format:check` | Prettier                                              |
| `npm run test` / `test:watch`     | Vitest                                                |
| `npm run api:types`               | Gera os tipos da API v2 a partir do OpenAPI publicado |

## Estrutura

```
├── design-kit/   Simcc Design Kit: regras visuais, tokens, exemplos
├── docs/         arquitetura, roadmap, decisões, contrato com o backend
├── public/       arquivos estáticos servidos como estão
├── scripts/      scripts de apoio (geração de tipos)
└── src/
    ├── app/        providers, router, estilos globais
    ├── routes/     rotas por arquivo (TanStack Router)
    ├── features/   telas
    ├── entities/   entidades de domínio (modelo, queries, componentes)
    ├── api/        clientes HTTP e tipos gerados
    ├── shared/     primitivos de UI e utilitários
    └── config/     variáveis de ambiente validadas
```

Os detalhes estão em [`docs/arquitetura.md`](docs/arquitetura.md).

## Design kit

Para ver as páginas de exemplo:

```bash
python3 -m http.server 8765 -d design-kit
```

Depois abra `http://localhost:8765`. As regras estão em [`design-kit/DESIGN.md`](design-kit/DESIGN.md).

## Como contribuir

Veja [`docs/README.md`](docs/README.md): escolha uma tarefa no roadmap, crie a branch `feat/<id>-<slug>` a partir da `develop` e abra o PR para a `develop`.
