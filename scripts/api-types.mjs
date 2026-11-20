// Gera os tipos TypeScript da API v2 a partir do OpenAPI publicado pelo backend.
// Uso: npm run api:types (lê VITE_SIMCC_API_URL do ambiente ou do .env).
//
// Use sempre /v2/openapi.json: o /openapi.json mesclado (v1 + v2) sobrescreve
// componentes de mesmo nome.
import { execFileSync } from 'node:child_process';
import { loadEnv } from 'vite';

const env = {
  ...loadEnv('development', process.cwd(), 'VITE_'),
  ...process.env,
};
const base = env.VITE_SIMCC_API_URL;

if (!base) {
  console.error('Defina VITE_SIMCC_API_URL (veja .env.example).');
  process.exit(1);
}

const spec = new URL('v2/openapi.json', base.endsWith('/') ? base : `${base}/`);
const output = 'src/api/generated/simcc-v2.d.ts';

console.log(`Gerando ${output} a partir de ${spec.href}`);
execFileSync('npx', ['openapi-typescript', spec.href, '-o', output], {
  stdio: 'inherit',
});
