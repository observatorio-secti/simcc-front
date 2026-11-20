# `src/features/`

Uma pasta por tela ou fluxo (`search`, `researcher-profile`, `shell`, `auth`…). Compõe entidades e primitivos de UI. Pode importar `entities/`, `api/`, `shared/` e `config/`.

**Uma feature nunca importa outra** (o lint bloqueia). Se duas telas precisam do mesmo pedaço, ele desce para `entities/` (sobre uma entidade) ou `shared/` (genérico). Se são a mesma tela em estados diferentes, como a home e os resultados da busca, são a mesma feature.

Estado navegável não fica aqui: a feature lê os search params validados pela rota (`Route.useSearch()`) e muda a URL com `navigate`.

`home/` e `errors/` são provisórios da fase 0 e serão substituídos pelas tarefas T1 e F1.3.
