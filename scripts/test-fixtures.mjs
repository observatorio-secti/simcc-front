// Gera as respostas de exemplo que os handlers MSW servem nos testes
// (src/test/msw/examples.gen.ts) a partir do OpenAPI da v2.
//
// Uso: npm run test:fixtures [-- <arquivo-ou-url-do-openapi>]
// Sem argumento, lê <VITE_SIMCC_API_URL>v2/openapi.json, a mesma fonte do
// `npm run api:types`. Rode os dois juntos: o typecheck confere cada exemplo
// contra os tipos gerados (`satisfies ResponseOf<...>`).
//
// Para cada GET com resposta 200 em JSON, monta um corpo determinístico:
// - usa `examples[0]`/`example` do schema quando existe (Meta, Pagination…);
// - senão `enum[0]`, `default` de valores simples, ou um valor pelo tipo e
//   formato (uuid sequencial, datas fixas, textos "<campo> de exemplo");
// - `anyOf`/`oneOf` com `null` escolhem o ramo não nulo;
// - listas têm um item; mapas, uma chave.
import { readFile, writeFile } from 'node:fs/promises';
import prettier from 'prettier';
import { loadEnv } from 'vite';

const output = 'src/test/msw/examples.gen.ts';

async function loadSpec(source) {
  if (source && !/^https?:\/\//.test(source)) {
    return JSON.parse(await readFile(source, 'utf8'));
  }
  let url = source;
  if (!url) {
    const env = {
      ...loadEnv('development', process.cwd(), 'VITE_'),
      ...process.env,
    };
    const base = env.VITE_SIMCC_API_URL;
    if (!base) {
      console.error('Defina VITE_SIMCC_API_URL ou passe o OpenAPI da v2.');
      process.exit(1);
    }
    url = new URL('v2/openapi.json', base.endsWith('/') ? base : `${base}/`)
      .href;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function createGenerator(spec) {
  const schemas = spec.components?.schemas ?? {};
  let uuidCounter = 0;

  const resolve = (schema) =>
    schema.$ref ? schemas[schema.$ref.split('/').pop()] : schema;

  const isNull = (schema) => resolve(schema).type === 'null';

  function stringValue(schema, name) {
    switch (schema.format) {
      case 'uuid':
        uuidCounter += 1;
        return `00000000-0000-4000-8000-${String(uuidCounter).padStart(12, '0')}`;
      case 'date-time':
        return '2026-01-15T12:00:00Z';
      case 'date':
        return '2026-01-15';
    }
    if (/(^|_)url$/.test(name)) return `https://example.org/${name}`;
    return name ? `${name} de exemplo` : 'exemplo';
  }

  function value(schema, name, seen) {
    if (schema.$ref) {
      const ref = schema.$ref.split('/').pop();
      // Schema recursivo: corta o ciclo; quem chamou decide como lidar.
      if (seen.has(ref)) return undefined;
      return value(schemas[ref], name, new Set([...seen, ref]));
    }
    if (schema.examples?.length) return structuredClone(schema.examples[0]);
    if (schema.example !== undefined) return structuredClone(schema.example);
    if (schema.const !== undefined) return schema.const;
    if (schema.enum?.length) return schema.enum[0];

    const branches = schema.anyOf ?? schema.oneOf;
    if (branches) {
      const branch = branches.find((option) => !isNull(option));
      return branch ? value(branch, name, seen) : null;
    }
    if (schema.allOf) {
      return Object.assign(
        {},
        ...schema.allOf.map((part) => value(part, name, seen)),
      );
    }

    if (
      schema.default !== undefined &&
      (schema.default === null || typeof schema.default !== 'object')
    ) {
      return schema.default;
    }

    switch (schema.type) {
      case 'string':
        return stringValue(schema, name);
      case 'integer':
        if (/year/.test(name ?? '')) return 2024;
        return Math.max(1, schema.minimum ?? 1);
      case 'number':
        return Math.max(1, schema.minimum ?? 1);
      case 'boolean':
        return false;
      case 'array': {
        if (schema.prefixItems) {
          return schema.prefixItems.map((item) => value(item, name, seen));
        }
        const item = schema.items ? value(schema.items, name, seen) : undefined;
        return item === undefined ? [] : [item];
      }
    }

    if (schema.type === 'object' || schema.properties) {
      const result = {};
      for (const [key, property] of Object.entries(schema.properties ?? {})) {
        const generated = value(property, key, seen);
        if (generated !== undefined) result[key] = generated;
      }
      if (schema.additionalProperties && !schema.properties) {
        const key = schema.propertyNames?.enum?.[0] ?? 'exemplo';
        const generated =
          schema.additionalProperties === true
            ? 'exemplo'
            : value(schema.additionalProperties, key, seen);
        if (generated !== undefined) result[key] = generated;
      }
      return result;
    }
    return null;
  }

  return (schema) => {
    uuidCounter = 0;
    return value(schema, undefined, new Set());
  };
}

const spec = await loadSpec(process.argv[2]);
const generate = createGenerator(spec);

const entries = [];
for (const [path, operations] of Object.entries(spec.paths).sort(([a], [b]) =>
  a.localeCompare(b),
)) {
  const schema =
    operations.get?.responses?.['200']?.content?.['application/json']?.schema;
  if (!schema) continue;
  const body = JSON.stringify(generate(schema));
  entries.push(
    `${JSON.stringify(path)}: ${body} satisfies ResponseOf<${JSON.stringify(path)}>,`,
  );
}

const source = `// Gerado por scripts/test-fixtures.mjs a partir do OpenAPI da v2. Não edite:
// rode \`npm run test:fixtures\` (junto com \`npm run api:types\`).
import type { ResponseOf } from '@/api/types';

/** Corpo da resposta 200 de cada GET da v2, servido pelos handlers padrão. */
export const examples = {
${entries.join('\n')}
};
`;

const options = await prettier.resolveConfig(output);
await writeFile(
  output,
  await prettier.format(source, { ...options, filepath: output }),
);
console.log(`${output}: ${entries.length} rotas.`);
