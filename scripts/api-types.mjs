// Gera os tipos TypeScript das APIs a partir do OpenAPI publicado por cada uma.
//
//   npm run api:types              gera todos os contratos listados abaixo
//   npm run api:types -- admin     gera só os nomeados (simcc-v2, admin…)
//
// As URLs vêm do ambiente ou do .env (VITE_*). Uma API sem URL configurada é
// pulada com aviso; a falha ao baixar um contrato interrompe o script.
//
// Para acrescentar uma API, inclua uma entrada em `specs` com:
//   name     nome curto, usado no filtro da linha de comando;
//   envVar   variável com a URL base da API;
//   path     caminho do OpenAPI relativo à URL base;
//   output   arquivo gerado em src/api/generated/.
import { execFileSync } from 'node:child_process';
import { loadEnv } from 'vite';

const specs = [
  {
    // Use sempre /v2/openapi.json: o /openapi.json mesclado (v1 + v2)
    // sobrescreve componentes de mesmo nome.
    name: 'simcc-v2',
    envVar: 'VITE_SIMCC_API_URL',
    path: 'v2/openapi.json',
    output: 'src/api/generated/simcc-v2.d.ts',
  },
  {
    name: 'admin',
    envVar: 'VITE_ADMIN_API_URL',
    path: 'openapi.json',
    output: 'src/api/generated/simcc-admin.d.ts',
  },
  {
    name: 'maria',
    envVar: 'VITE_MARIA_API_URL',
    path: 'openapi.json',
    output: 'src/api/generated/maria.d.ts',
  },
];

const env = {
  ...loadEnv('development', process.cwd(), 'VITE_'),
  ...process.env,
};

const requested = process.argv.slice(2);
const unknown = requested.filter(
  (name) => !specs.some((spec) => spec.name === name),
);
if (unknown.length) {
  console.error(
    `Contrato desconhecido: ${unknown.join(', ')}. Opções: ${specs
      .map((spec) => spec.name)
      .join(', ')}.`,
  );
  process.exit(1);
}

const selected = requested.length
  ? specs.filter((spec) => requested.includes(spec.name))
  : specs;

let generated = 0;
for (const spec of selected) {
  const base = env[spec.envVar];
  if (!base) {
    console.warn(
      `Pulando ${spec.name}: defina ${spec.envVar} (veja .env.example).`,
    );
    continue;
  }
  const url = new URL(spec.path, base.endsWith('/') ? base : `${base}/`);
  console.log(`Gerando ${spec.output} a partir de ${url.href}`);
  execFileSync('npx', ['openapi-typescript', url.href, '-o', spec.output], {
    stdio: 'inherit',
  });
  generated += 1;
}

if (generated === 0) {
  console.error('Nenhum contrato gerado.');
  process.exit(1);
}
