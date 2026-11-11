# Simcc — Design Kit para agentes

Gerado a partir da **página 2** de `observatorio_logos.pdf` (capa do Simcc). Kit irmão do `observatorio-design-kit` (página 1).

```
DESIGN.md              ← guia principal
AGENT_PROMPT.md        ← bloco curto para o system prompt / CLAUDE.md
reference/page-2.png   ← capa original (para modelos com visão)
assets/
  logo/                ← lockup, compacto e símbolo (SVG + PNG; claro e sobre navy)
  waves/               ← ondas vetorizadas (capa com fundo, e versão transparente) + PNG de referência
  fonts/               ← Lexend 300–800 (woff2, OFL)
tokens/
  tokens.json · simcc.css · tailwind.preset.js
examples/
  cover.html           ← recriação da capa
  platform-shell.html  ← exemplo de plataforma (busca, resultados, gráfico, rodapé)
```

Uso: copie a pasta para o projeto (ex.: `design-kit/`), cole `AGENT_PROMPT.md` nas instruções do agente e abra `examples/*.html` para ver o resultado esperado.
Se as duas marcas convivem no mesmo ecossistema, mantenha os dois kits em pastas separadas (`design-kit/observatorio`, `design-kit/simcc`): paleta e fonte são as mesmas, o que muda é o fundo e o logo.
