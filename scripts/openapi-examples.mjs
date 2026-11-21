// Extrai os exemplos declarados no OpenAPI da API v2 para a fixture usada pelos
// handlers MSW (mantendo a CI 100% offline).
//
// Uso: npm run api:examples
//   Lê VITE_SIMCC_API_URL do ambiente ou do .env e consulta <url>v2/openapi.json.
//   Opcional: `--input <arquivo.json>` para ler um OpenAPI salvo em disco.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';
import { loadEnv } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputPath = `${root}src/test/msw/openapi-examples.json`;

function readInputFlag() {
  const index = process.argv.indexOf('--input');
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function loadOpenApiSpec() {
  const inputFile = readInputFlag();
  if (inputFile) {
    return JSON.parse(readFileSync(inputFile, 'utf8'));
  }

  const env = {
    ...loadEnv('development', process.cwd(), 'VITE_'),
    ...process.env,
  };
  const base = env.VITE_SIMCC_API_URL;
  if (!base) {
    console.error('Defina VITE_SIMCC_API_URL (veja .env.example).');
    process.exit(1);
  }

  const specUrl = new URL(
    'v2/openapi.json',
    base.endsWith('/') ? base : `${base}/`,
  );
  console.log(`Lendo OpenAPI v2 de ${specUrl.href}`);
  const response = await fetch(specUrl);
  if (!response.ok) {
    throw new Error(`Falha ao buscar ${specUrl.href}: HTTP ${response.status}`);
  }
  return response.json();
}

function extractSchemaExamples(spec) {
  const schemas = spec.components?.schemas ?? {};
  const result = {};

  for (const name of Object.keys(schemas).sort()) {
    const schema = schemas[name];
    if (Array.isArray(schema.examples) && schema.examples.length > 0) {
      result[name] = schema.examples;
    } else if (schema.example !== undefined) {
      result[name] = [schema.example];
    }
  }

  return result;
}

function extractRouteExamples(spec) {
  const paths = spec.paths ?? {};
  const result = {};

  for (const path of Object.keys(paths).sort()) {
    const pathItem = paths[path];
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = pathItem?.[method];
      if (!operation?.responses) continue;

      for (const status of Object.keys(operation.responses).sort()) {
        const jsonContent =
          operation.responses[status]?.content?.['application/json'];
        if (!jsonContent) continue;

        let examples;
        if (jsonContent.examples && typeof jsonContent.examples === 'object') {
          examples = Object.fromEntries(
            Object.entries(jsonContent.examples).map(([key, entry]) => [
              key,
              entry && typeof entry === 'object' && 'value' in entry
                ? entry.value
                : entry,
            ]),
          );
        } else if (jsonContent.example !== undefined) {
          examples = { default: jsonContent.example };
        }

        if (examples && Object.keys(examples).length > 0) {
          result[path] ??= {};
          result[path][method.toUpperCase()] ??= {};
          result[path][method.toUpperCase()][status] = examples;
        }
      }
    }
  }

  return result;
}

const spec = await loadOpenApiSpec();
const payload = {
  openapi: spec.openapi ?? '3.1.0',
  info: {
    title: spec.info?.title ?? 'SIMCC API - v2',
    version: spec.info?.version ?? '2.0.0',
  },
  schemas: extractSchemaExamples(spec),
  routes: extractRouteExamples(spec),
};

const options = await prettier.resolveConfig(outputPath);
const formatted = await prettier.format(JSON.stringify(payload, null, 2), {
  ...options,
  filepath: outputPath,
});
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, formatted);

const schemaCount = Object.keys(payload.schemas).length;
const routeCount = Object.keys(payload.routes).length;
console.log(
  `openapi-examples: ${schemaCount} schemas e ${routeCount} rotas com exemplos gravados em src/test/msw/openapi-examples.json`,
);
