# Prompt para agentes: construção de telas públicas do Simcc

Cole o bloco abaixo ao delegar uma tela (troque `<TAREFA>`, `<ROTA>` e `<TEMPLATE>`).

---

Você vai construir a tela `<ROTA>` do novo front-end Simcc, correspondente à tarefa `<TAREFA>` de `docs/roadmap.md`. Stack: React 19, Vite, TanStack Router (rotas por arquivo), TanStack Query, Tailwind 4 e primitivos shadcn/radix. A tela segue o **Simcc Design Kit**, em `design-kit/`.

**Antes de editar, leia:**

1. `CLAUDE.md` e `docs/arquitetura.md`: camadas, regras e convenções do projeto.
2. O cartão da tarefa em `docs/roadmap.md`: escopo, dependências e critério de pronto.
3. `design-kit/DESIGN.md`: princípios, cores, tipografia, layout, templates de página e a tabela de tradução para o Tailwind 4.
4. `design-kit/reference/components.md` e `design-kit/reference/icons.md`.
5. A página de exemplo mais próxima em `design-kit/examples/`. Abra com `python3 -m http.server 8765 -d design-kit`.
6. Se a tela existia no legado, o destino dela em `docs/legado/inventario.md`. O código antigo pode ser consultado com `git show legado-v1:<caminho>`, só como referência de comportamento, nunca para copiar estrutura.

**Onde cada coisa fica**

- `src/routes/`: só a definição da rota (path, `validateSearch` com zod, `loader` que pré-carrega queries) e o componente da feature.
- `src/features/<tela>/`: composição da tela. Não importa outra feature.
- `src/entities/<entidade>/`: modelo, queries (TanStack Query) e componentes de apresentação da entidade (card, ref, avatar). É aqui que a entidade ganha **um** jeito de aparecer.
- `src/shared/ui/`: primitivos do kit. Se um padrão do kit ainda não existe como componente (PillLink, StatCard, SectionHeader, ResultToolbar, PersonCard, ProductionCard, LoadingBlock), crie aqui seguindo a receita.
- `src/shared/lib/design-tokens.ts`: toda escolha de cor por dado (área, qualis, tipo de produção…).

**Regras obrigatórias**

- Estado navegável (termos, filtros, aba, página, item aberto) fica na URL. Nada de Context ou store global para isso.
- Dados só via TanStack Query, com hooks da entidade. Nada de `fetch` ou `useEffect` buscando dados em componente.
- Pesquisador, programa, grupo e instituição têm rota própria; um drawer sobre a lista é uma rota com overlay, não um modal global.
- Preserve a estética do kit: moldura `neutral-100`, painel `neutral-50` `rounded-xl`, cards brancos com borda e **sem sombra**, Lexend, ação primária `bg-eng-blue hover:bg-eng-dark-blue`.
- Siga o template `<TEMPLATE>` (A–F) e a ordem de blocos dele.
- Cores saturadas só de dicionário: `search-*`, `area-*`, `prod-*`, `qualis-*`, `orient-*`, `status-*`, `bolsa-*`, `chart-neutral-*`. Proibido hex literal em classe (`bg-[#…]`) e cadeias de ternário para escolher cor.
- Cinzas: só `neutral-*` (exceto o bloco de carregamento `slate-300`/`slate-500`).
- Raios: `rounded-md` em controles, `rounded-lg` em cards, `rounded-xl` só no painel.
- Ícones: só `lucide-react`, 16px por padrão, conforme `icons.md`.
- Microcopy em pt-BR, sentence case, legendas de KPI explicando o recorte.
- Acessibilidade: `aria-label` em botões só com ícone, `aria-selected`/`aria-pressed` em tabs e toggles, foco visível.

**Entrega**

- Uma branch `feat/<TAREFA>-<slug>` a partir da `develop` e um PR para a `develop`.
- `npm run typecheck`, `npm run lint`, `npm run test` e `npm run build` sem erros.
- A tela aberta em `npm run dev` (porta 8080) nos temas claro e escuro, em 1440px e 375px, sem rolagem horizontal.
- O status da tarefa atualizado em `docs/roadmap.md`.
- Resumo curto: o que mudou, componentes criados e qualquer desvio do kit, com o motivo.
