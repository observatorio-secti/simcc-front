# 0005. Tailwind 4 e o design kit como fonte de tokens

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

O design kit da área pública (`design-kit/`) foi escrito para Tailwind 3, com um preset JS. O projeto novo começa sem legado de estilo, e o Tailwind 4 configura o tema em CSS (`@theme`).

## Decisão

- Usar **Tailwind 4** com `@tailwindcss/vite`.
- O tema do kit fica em `design-kit/tokens/tailwind.css` (`@theme`, `@custom-variant dark`, utilitários `bg-deco-*`). O antigo `tailwind.preset.js` foi removido, para não existirem duas fontes de configuração.
- `design-kit/tokens/tokens.json` é a fonte de verdade dos valores. `tailwind.css` (app) e `simcc.css` (páginas de exemplo do kit) precisam ficar em sincronia com ele.
- `src/app/styles.css` importa o tema e liga as variáveis do shadcn (`--primary`, `--border`, `--background`…) aos papéis do kit, nos temas claro e escuro.
- Primitivos de UI vêm do shadcn (Radix + Tailwind 4), adaptados ao kit em `src/shared/ui/`.

## Consequências

- Algumas receitas do kit usam nomes do Tailwind 3 (`shadow-sm`, `rounded`, `ring`). A tabela de tradução está em `design-kit/DESIGN.md`, na seção "Uso no app".
- Mudar um token exige editar três arquivos. Uma tarefa futura pode gerar `tailwind.css` e `simcc.css` a partir de `tokens.json` (cartão K1 do roadmap).
- O app só lê classes de `src/` (`@import 'tailwindcss' source(none)` + `@source '../'`), para os HTML de exemplo do kit não inflarem o CSS.
