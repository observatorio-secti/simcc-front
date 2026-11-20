# `src/entities/`

Uma pasta por entidade de domínio (`researcher`, `production`, `institution`, `graduate-program`, `research-group`, `magazine`). Pode importar outras entidades, `api/`, `shared/` e `config/`; nunca `features/` ou `routes/`.

```
entities/researcher/
├── model.ts      tipos derivados de api/generated + rótulos e formatação
├── queries.ts    queryOptions: ['researcher', 'list' | 'detail', params]
└── ui/           ResearcherRef, ResearcherAvatar, PersonCard…
```

É aqui que cada entidade ganha **um** jeito de aparecer: toda tela usa estes componentes, e nenhuma tela cria o próprio card de pesquisador ou de artigo.
