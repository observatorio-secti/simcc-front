// Gera o tema Tailwind e os tokens CSS do design kit a partir de tokens.json.
//
//   npm run tokens          reescreve os arquivos gerados
//   npm run tokens:check    falha se algum deles não bate com tokens.json (CI)
//
// Saídas:
//   design-kit/tokens/tailwind.css  arquivo inteiro (@custom-variant, @theme, @utility)
//   design-kit/tokens/simcc.css     só o trecho entre /* @tokens:inicio */ e
//                                   /* @tokens:fim */ (:root e .dark); o resto
//                                   do arquivo é escrito à mão e fica intacto.
//
// tokens.json guarda os valores; este script guarda os nomes das variáveis
// (que são a API usada pelo app e pelas páginas do kit). Um token novo num
// dicionário (área, produção, Qualis…) entra sozinho nos dois arquivos; um
// grupo novo precisa ser listado aqui.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const root = fileURLToPath(new URL('../', import.meta.url));
const tokensDir = `${root}design-kit/tokens/`;
const files = {
  tokens: `${tokensDir}tokens.json`,
  tailwind: `${tokensDir}tailwind.css`,
  simcc: `${tokensDir}simcc.css`,
};
const START = '/* @tokens:inicio */';
const END = '/* @tokens:fim */';

const tokens = JSON.parse(readFileSync(files.tokens, 'utf8'));

// --- Leitura de tokens.json --------------------------------------------------

function node(path) {
  let current = tokens;
  for (const key of path.split('.')) {
    current = current?.[key];
    if (current === undefined)
      fail(`token inexistente em tokens.json: ${path}`);
  }
  return current;
}

function token(path) {
  const found = node(path);
  if (!('$value' in found)) fail(`${path} é um grupo, não um token`);
  return found;
}

const reference = /^\{([^}]+)\}$/;

// Valor final do token, seguindo referências ({color.brand.DEFAULT}).
function resolve(path, seen = []) {
  if (seen.includes(path))
    fail(`referência circular: ${[...seen, path].join(' → ')}`);
  const value = token(path).$value;
  const match = typeof value === 'string' && value.match(reference);
  return match ? resolve(match[1], [...seen, path]) : value;
}

// Uma entrada da saída: [variável CSS, caminho do token].
// Uma string solta vira comentário de seção.
function group(
  path,
  prefix,
  { rename = {}, exclude = [], lower = false } = {},
) {
  return Object.keys(node(path))
    .filter((key) => !key.startsWith('$') && !exclude.includes(key))
    .map((key) => {
      let name = rename[key] ?? key;
      if (lower) name = name.toLowerCase();
      // DEFAULT vira o nome do próprio grupo: --sc-deco, --sc-deco-soft.
      const variable =
        key === 'DEFAULT' ? prefix.replace(/-$/, '') : prefix + name;
      return [variable, `${path}.${key}`];
    });
}

// --- Layout dos arquivos -------------------------------------------------------

const tailwindTheme = [
  'Tipografia: Lexend em tudo',
  ['--font-sans', 'font.family.sans'],

  'Breakpoints do projeto (sm, md, lg e xl são os padrões do Tailwind)',
  ['--breakpoint-2xl', 'breakpoint.2xl'],

  'Marca',
  ['--color-eng-blue', 'color.brand.DEFAULT'],
  ['--color-eng-dark-blue', 'color.brand.strong'],
  ['--color-brand', 'color.brand.DEFAULT'],
  ['--color-brand-strong', 'color.brand.strong'],
  ['--color-brand-soft', 'color.brand.soft'],
  ['--color-brand-teal', 'color.brand.accent-teal'],
  ['--color-brand-wine', 'color.brand.accent-wine'],
  ...group('color.decoration', '--color-deco-'),

  'Tipo de busca',
  ...group('color.search-type', '--color-search-'),

  'Grande área do conhecimento (CNPq)',
  ...group('color.great-area', '--color-area-'),

  'Tipo de produção',
  ...group('color.production', '--color-prod-', {
    rename: { 'relatorio-tecnico': 'relatorio' },
  }),

  'Orientação',
  ...group('color.orientation', '--color-orient-', {
    rename: {
      'iniciacao-cientifica': 'ic',
      'outra-natureza': 'outra',
      'pos-doutorado': 'posdoc',
    },
  }),

  'Qualis (a chave mantém a caixa do dado: bg-qualis-A1)',
  ...group('color.qualis', '--color-qualis-'),

  'Status, estado de execução, bolsas e gênero',
  ['--color-status-concluida', 'color.status.concluida'],
  ['--color-status-andamento', 'color.status.em-andamento'],
  ...group('color.run-status', '--color-run-'),
  ...group('color.bolsa', '--color-bolsa-'),
  ...group('color.gender', '--color-gender-', {
    rename: { feminino: 'f', masculino: 'm' },
  }),

  'Escala neutra para gráficos sem semântica',
  ...group('color.chart-neutral', '--color-chart-neutral-'),

  'Nível do índice do pesquisador',
  ...group('color.index-level', '--color-index-'),

  'Raio: rounded-md (6px) controles, rounded-lg (8px) cards, rounded-panel (12px) painel',
  ['--radius-panel', 'radius.xl'],

  'Dimensões de layout: h-topbar, h-crumbbar, max-w-content',
  ['--spacing-topbar', 'layout.topbar-height'],
  ['--spacing-crumbbar', 'layout.crumbbar-height'],
  ['--container-content', 'layout.content-max'],

  'Hero de página: text-hero (30 → 48px)',
  ['--text-hero', 'font.size.hero'],
  ['--text-hero--line-height', 'font.line-height.hero'],
  ['--text-hero--letter-spacing', 'font.letter-spacing.hero'],
];

// Fundos ilustrados: bg-deco-<nome> → assets/backgrounds/<nome>.png
const backgrounds = ['home', 'graduate', 'indicadores', 'researcher'];

const simccRoot = [
  'Marca',
  ['--sc-brand', 'color.brand.DEFAULT'],
  ['--sc-brand-strong', 'color.brand.strong'],
  ['--sc-brand-soft', 'color.brand.soft'],
  ['--sc-accent-teal', 'color.brand.accent-teal'],
  ['--sc-accent-wine', 'color.brand.accent-wine'],
  ...group('color.logo', '--sc-logo-'),

  'Neutros (escala Tailwind neutral)',
  ...group('color.neutral', '--sc-n-'),

  'Decoração (fundos ilustrados)',
  ...group('color.decoration', '--sc-deco-'),

  'Papéis semânticos — tema claro',
  ...group('color.role.light', '--sc-'),

  'Status',
  ['--sc-success', 'color.status.success'],
  ['--sc-success-strong', 'color.status.success-strong'],
  ['--sc-warning', 'color.status.warning'],
  ['--sc-danger', 'color.status.danger'],
  ['--sc-info', 'color.status.info'],

  'Estado de execução (ETL no console)',
  ...group('color.run-status', '--sc-run-'),

  'Tipografia',
  ['--sc-font', 'font.family.sans-kit'],
  ...group('font.size', '--sc-text-'),

  'Espaço (base 4px)',
  ...group('space', '--sc-space-'),

  'Raios',
  ...group('radius', '--sc-radius-'),

  'Sombras (a plataforma é plana; sombra só em sobreposições)',
  ...group('shadow', '--sc-shadow-'),

  'Dimensões de layout',
  ['--sc-topbar-h', 'layout.topbar-height'],
  ['--sc-crumbbar-h', 'layout.crumbbar-height'],
  ['--sc-sidebar-w', 'layout.sidebar-width'],
  ['--sc-sidebar-w-icon', 'layout.sidebar-width-icon'],
  ['--sc-content-max', 'layout.content-max'],
  ['--sc-gutter', 'layout.gutter'],

  'Movimento',
  ['--sc-ease', 'motion.easing'],
  ['--sc-dur', 'motion.duration'],

  'Cores de tipo de busca (search type) — não alterar',
  ...group('color.search-type', '--sc-type-'),

  'Grandes áreas do conhecimento (CNPq)',
  ...group('color.great-area', '--sc-area-'),

  'Tipos de produção',
  ...group('color.production', '--sc-prod-', {
    rename: { 'relatorio-tecnico': 'relatorio' },
    exclude: ['congresso', 'simposio', 'seminario', 'oficina'],
  }),
  ['--sc-prod-evento', 'color.production.congresso'],

  'Qualis',
  ...group('color.qualis', '--sc-qualis-', { lower: true }),

  'Bolsas',
  ...group('color.bolsa', '--sc-bolsa-', { lower: true }),

  'Escala neutra para gráficos (Cor 1–6 do dicionário)',
  ...group('color.chart-neutral', '--sc-chart-'),

  'Níveis do índice do pesquisador',
  ...group('color.index-level', '--sc-index-'),
];

// .dark sobrescreve --sc-<chave> com cada token de color.role.dark.
const simccDark = group('color.role.dark', '--sc-');

// --- Geração -----------------------------------------------------------------

function cssValue(value) {
  const text = String(value);
  return /^#[0-9a-f]{3,8}$/i.test(text) ? text.toLowerCase() : text;
}

// Em simcc.css uma referência vira var(--sc-…) quando o token referenciado
// tem variável no :root; no tema Tailwind o valor é sempre resolvido.
const simccVariable = new Map();
for (const entry of simccRoot) {
  if (Array.isArray(entry) && !simccVariable.has(entry[1])) {
    simccVariable.set(entry[1], entry[0]);
  }
}

function declarations(entries, { useVar = false } = {}) {
  const lines = [];
  for (const entry of entries) {
    if (typeof entry === 'string') {
      if (lines.length) lines.push('');
      lines.push(`  /* ${entry} */`);
      continue;
    }
    const [variable, path] = entry;
    // Os $description ficam só em tokens.json (comentário por linha faria o
    // Prettier quebrar valores longos).
    const raw = token(path).$value;
    const target = typeof raw === 'string' && raw.match(reference)?.[1];
    const value =
      useVar && target && simccVariable.has(target)
        ? `var(${simccVariable.get(target)})`
        : cssValue(resolve(path));
    lines.push(`  ${variable}: ${value};`);
  }
  return lines.join('\n');
}

function checkUnique(entries, where) {
  const seen = new Set();
  for (const entry of entries) {
    if (!Array.isArray(entry)) continue;
    if (seen.has(entry[0])) fail(`variável duplicada em ${where}: ${entry[0]}`);
    seen.add(entry[0]);
  }
}

const header = `/* ==========================================================================
   Simcc Design Kit — tema Tailwind 4 (área pública)

   ARQUIVO GERADO por scripts/tokens.mjs a partir de tokens.json. Não edite:
   mude tokens.json e rode \`npm run tokens\` (a CI roda \`npm run tokens:check\`).

   Uso no CSS de entrada do app:
     @import 'tailwindcss';
     @import '<caminho>/design-kit/tokens/tailwind.css';

     bg-eng-blue            → ação primária
     bg-search-article      → cor do tipo de busca "article"
     bg-area-saude          → grande área CIÊNCIAS DA SAÚDE
     border-l-qualis-A1     → borda do card de produção
     bg-prod-patente        → tipo de produção
   ========================================================================== */`;

function tailwindCss() {
  checkUnique(tailwindTheme, 'tailwind.css');
  const utilities = backgrounds
    .map(
      (name) =>
        `@utility bg-deco-${name} {\n  background-image: url('../assets/backgrounds/${name}.png');\n}`,
    )
    .join('\n');
  return `${header}

/* Tema escuro por classe: o app aplica .dark no <html> (src/shared/lib/theme.ts). */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
${declarations(tailwindTheme)}
}

/* Fundos ilustrados (o caminho é relativo a este arquivo) */
${utilities}
`;
}

function simccBlock() {
  checkUnique(simccRoot, 'simcc.css :root');
  checkUnique(simccDark, 'simcc.css .dark');
  return `${START}
:root {
${declarations(simccRoot, { useVar: true })}
}

/* Tema escuro (o app aplica .dark no <html>) */
.dark {
${declarations(simccDark, { useVar: true })}
}
${END}`;
}

async function format(css, filepath) {
  const options = await prettier.resolveConfig(filepath);
  return prettier.format(css, { ...options, filepath });
}

function spliceSimcc(current, block) {
  const start = current.indexOf(START);
  const end = current.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    fail(`simcc.css precisa dos marcadores ${START} e ${END}, nessa ordem.`);
  }
  return current.slice(0, start) + block + current.slice(end + END.length);
}

function fail(message) {
  console.error(`tokens: ${message}`);
  process.exit(1);
}

const check = process.argv.includes('--check');

const tailwind = await format(tailwindCss(), files.tailwind);
// O bloco é formatado sozinho: o resto de simcc.css segue o estilo à mão.
const block = (await format(simccBlock(), files.simcc)).trimEnd();
const simccCurrent = readFileSync(files.simcc, 'utf8');

const outputs = [
  [files.tailwind, readFileSync(files.tailwind, 'utf8'), tailwind],
  [files.simcc, simccCurrent, spliceSimcc(simccCurrent, block)],
];

const relative = (file) => file.slice(root.length);

if (check) {
  const stale = outputs.filter(([, current, next]) => current !== next);
  if (stale.length) {
    console.error(
      `tokens: fora de sincronia com tokens.json:\n${stale
        .map(([file]) => `  - ${relative(file)}`)
        .join('\n')}\nRode \`npm run tokens\` e commite o resultado.`,
    );
    process.exit(1);
  }
  console.log('tokens: tailwind.css e simcc.css em sincronia com tokens.json.');
} else {
  for (const [file, current, next] of outputs) {
    if (current === next) {
      console.log(`tokens: ${relative(file)} sem mudanças`);
    } else {
      writeFileSync(file, next);
      console.log(`tokens: ${relative(file)} atualizado`);
    }
  }
}
