# Documentação do novo front do Simcc

O front está sendo reescrito do zero sobre a API v2 e o Simcc Design Kit. Esta pasta guarda o plano e as decisões, para que o trabalho possa ser dividido entre pessoas e agentes e retomado a qualquer momento.

## Por onde começar

| Arquivo                                            | Para quê                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [arquitetura.md](arquitetura.md)                   | Princípios, camadas, regras que o lint garante e convenções. Leia antes de escrever código |
| [roadmap.md](roadmap.md)                           | Fases, tarefas, dependências e status. É aqui que se escolhe o que fazer                   |
| [decisoes/](decisoes/)                             | Registros de decisão (ADRs): o porquê de cada escolha de arquitetura                       |
| [propostas/](propostas/)                           | Propostas em revisão antes de virar código (ex.: [console, T12](propostas/t12-console.md)) |
| [backend/](backend/)                               | Contrato da v2 negociado com o time do backend (pedido e resposta)                         |
| [legado/inventario.md](legado/inventario.md)       | Telas da plataforma anterior e o destino de cada uma (checklist de paridade)               |
| [../design-kit/DESIGN.md](../design-kit/DESIGN.md) | Regras visuais: cores, tipografia, layout e componentes                                    |

## Como contribuir

1. Escolha no [roadmap](roadmap.md) uma tarefa com status **a fazer** cujas dependências estejam **feitas**.
2. Marque a tarefa como **em andamento** e coloque seu nome em "Responsável", num commit pequeno ou já no primeiro commit da branch.
3. Crie a branch `feat/<id>-<slug>` a partir da `develop` (ex.: `feat/f1.2-primitivos-ui`).
4. Siga o critério de "Pronto quando" do cartão. Se o escopo mudar, atualize o cartão no mesmo PR.
5. Abra o PR para a `develop`. A CI roda `typecheck`, `lint`, `format:check`, `test` e `build`.
6. No PR, mude o status para **feito**. Se surgir trabalho novo, crie um cartão novo, em vez de aumentar o atual.

Para agentes, o prompt pronto está em [`design-kit/AGENT_PROMPT.md`](../design-kit/AGENT_PROMPT.md), e as regras resumidas em [`CLAUDE.md`](../CLAUDE.md).

## Decisões novas

Uma decisão que muda arquitetura, dependência ou contrato vira um ADR em `decisoes/`, numerado em sequência, com contexto, decisão e consequências. Decisões não são apagadas: uma nova pode substituir outra, citando o número.

## O legado

A plataforma anterior está preservada na tag `legado-v1`. Para consultar um arquivo:

```bash
git show legado-v1:src/App.tsx
```

Para listar o que existia numa pasta:

```bash
git ls-tree -r --name-only legado-v1 -- src/components/researcher
```

Use o legado como referência de **comportamento** (o que a tela fazia, quais dados mostrava), nunca como modelo de estrutura.
