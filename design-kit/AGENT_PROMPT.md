# Prompt para agentes: refatoração de telas públicas do Simcc

Cole o bloco abaixo ao delegar a refatoração de uma tela (troque `<ROTA>` e `<ARQUIVOS>`).

---

Você vai refatorar a tela `<ROTA>` (`<ARQUIVOS>`) do front-end Simcc (React 18 + Vite + Tailwind 3 + shadcn/radix) para o padrão do **Simcc Design Kit**, em `design-kit/`.

**Antes de editar, leia:**
1. `design-kit/DESIGN.md`: princípios, cores, tipografia, layout e templates de página.
2. `design-kit/reference/components.md`: anatomia e receita Tailwind de cada componente.
3. `design-kit/reference/icons.md`: ícone de cada conceito e migração phosphor → lucide.
4. `design-kit/reference/screens.md`: template e ajustes previstos para esta rota.
5. A página de exemplo mais próxima em `design-kit/examples/` (home, resultados ou pesquisador). Abra com `python3 -m http.server 8765 -d design-kit`.

**Regras obrigatórias**
- Preserve a estética atual: moldura `neutral-100`, painel `neutral-50` `rounded-xl`, cards brancos com borda e **sem sombra**, Lexend, ação primária `bg-eng-blue hover:bg-eng-dark-blue`.
- Siga o template da rota (A–F) e a ordem de blocos dele.
- Cores saturadas só de dicionário: `search-*`, `area-*`, `prod-*`, `qualis-*`, `orient-*`, `status-*`, `bolsa-*`, `chart-neutral-*` (preset `design-kit/tokens/tailwind.preset.js`). Proibido hex literal em classe (`bg-[#…]`) e cadeias de ternário para escolher cor; use `src/lib/design-tokens.ts`.
- Cinzas: só `neutral-*` (exceto o bloco de carregamento `slate-300`/`slate-500`).
- Raios: `rounded-md` em controles, `rounded-lg` em cards, `rounded-xl` só no painel.
- Ícones: só `lucide-react`, 16px por padrão, conforme `icons.md`. Remova importações de `phosphor-react`, `@phosphor-icons/react` e `@tabler/icons-react` da tela.
- Reutilize os primitivos de `src/components/ui/`; se um padrão do kit ainda não existe como componente (PillLink, StatCard, SectionHeader, ResultToolbar, PersonCard, ProductionCard, LoadingBlock), crie em `src/components/ui/` seguindo a receita e use em todas as ocorrências da tela.
- Microcopy em pt-BR, sentence case, legendas de KPI explicando o recorte.
- Acessibilidade: `aria-label` em botões só com ícone, `aria-selected`/`aria-pressed` em tabs e toggles, foco visível.
- Não mexa no Console (`src/components/console/`) nem nos tokens `sm-*`.
- Não altere lógica de dados, queries ou rotas, a não ser que a tela exija para seguir o template.

**Entrega**
- Diff restrito aos arquivos da tela (mais componentes `ui/` novos, se houver).
- Verificação: `npm run build` sem erros; a tela aberta em `npm run dev` (porta 8080) nos temas claro e escuro, em 1440px e 375px, sem rolagem horizontal.
- Resumo curto: o que mudou, componentes criados e qualquer desvio do kit, com o motivo.
