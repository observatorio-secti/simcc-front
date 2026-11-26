import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Camadas do src/ (ver docs/arquitetura.md). Cada import entre camadas
// precisa de uma política que o permita; o resto é erro.
const layers = [
  { type: 'app', pattern: 'src/app' },
  { type: 'app', pattern: 'src/*.{ts,tsx}' },
  { type: 'routes', pattern: 'src/routes' },
  { type: 'feature', pattern: 'src/features/*', capture: ['name'] },
  { type: 'entity', pattern: 'src/entities/*', capture: ['name'] },
  { type: 'api', pattern: 'src/api' },
  { type: 'shared', pattern: 'src/shared' },
  { type: 'config', pattern: 'src/config' },
  { type: 'test', pattern: 'src/test' },
].map((layer) => ({ ...layer, partialMatch: false }));

const allow = (from, to) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: to } } },
});

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'src/routeTree.gen.ts',
    'src/api/generated',
    'design-kit',
    // Worktrees locais de agentes (fora do git).
    '.agents',
  ]),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite(),
    ],
    languageOptions: {
      globals: globals.browser,
      // Raiz fixa: sem ela, os tsconfig dos worktrees em .agents/ confundem o parser.
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // Rotas por arquivo exportam `Route`, e não só componentes.
  {
    files: ['src/routes/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Regras que impedem os problemas da versão anterior de voltarem.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': layers,
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            allow('app', [
              'app',
              'routes',
              'feature',
              'entity',
              'api',
              'shared',
              'config',
            ]),
            allow('routes', [
              'routes',
              'feature',
              'entity',
              'shared',
              'config',
            ]),
            // Uma feature só importa a si mesma; nunca outra feature.
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: {
                    type: 'feature',
                    captured: { name: '{{ from.element.captured.name }}' },
                  },
                },
              },
            },
            allow('feature', ['entity', 'api', 'shared', 'config']),
            allow('entity', ['entity', 'api', 'shared', 'config']),
            allow('api', ['api', 'shared', 'config']),
            allow('shared', ['shared', 'config']),
            allow('config', ['config']),
            allow('test', [
              'app',
              'routes',
              'feature',
              'entity',
              'api',
              'shared',
              'config',
              'test',
            ]),
          ],
        },
      ],
      // Requisições só passam pela camada api/.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use os clientes de src/api/.' },
        { name: 'localStorage', message: 'Use src/shared/lib/storage.ts.' },
        { name: 'sessionStorage', message: 'Use src/shared/lib/storage.ts.' },
      ],
      // Estado de domínio vive na URL ou no TanStack Query, não em Context.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['createContext'],
              message:
                'Context só em src/app/ e src/shared/ui/. Estado de busca vai na URL; dado do servidor, no TanStack Query.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/api/**/*.{ts,tsx}'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['src/shared/lib/storage.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/shared/ui/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  {
    files: ['*.{js,ts}', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },

  prettier,
]);
