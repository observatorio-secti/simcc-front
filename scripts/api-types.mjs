// Gera os tipos TypeScript das APIs a partir do OpenAPI publicado por cada uma.
// Uso: npm run api:types [-- <nome>...] (lê as URLs do ambiente ou do .env).
// Sem nome, gera todas as especificações; com nome (ex.: `maria`), só aquelas.
//
// Na v2 use sempre /v2/openapi.json: o /openapi.json mesclado (v1 + v2)
// sobrescreve componentes de mesmo nome.
import { execFileSync } from 'node:child_process';
import { loadEnv } from 'vite';

const env = {
  ...loadEnv('development', process.cwd(), 'VITE_'),
  ...process.env,
};

const specs = [
  {
    name: 'simcc-v2',
    envVar: 'VITE_SIMCC_API_URL',
    path: 'v2/openapi.json',
    output: 'src/api/generated/simcc-v2.d.ts',
  },
  {
    name: 'maria',
    envVar: 'VITE_MARIA_API_URL',
    path: 'openapi.json',
    output: 'src/api/generated/maria.d.ts',
  },
];

const only = process.argv.slice(2);
const selected = only.length
  ? specs.filter((spec) => only.includes(spec.name))
  : specs;

if (selected.length === 0) {
  console.error(
    `Especificação desconhecida. Opções: ${specs.map((s) => s.name).join(', ')}.`,
  );
  process.exit(1);
}

for (const { envVar, path, output } of selected) {
  const base = env[envVar];
  if (!base) {
    console.error(`Defina ${envVar} (veja .env.example).`);
    process.exit(1);
  }

  const spec = new URL(path, base.endsWith('/') ? base : `${base}/`);
  console.log(`Gerando ${output} a partir de ${spec.href}`);
  execFileSync('npx', ['openapi-typescript', spec.href, '-o', output], {
    stdio: 'inherit',
  });
}
