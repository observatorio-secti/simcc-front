import { http, HttpResponse, type JsonBodyType, type PathParams } from 'msw';
import type { components } from '@/api/generated/simcc-v2';
import type { GetPath, ResponseOf } from '@/api/types';
import { examples } from './examples.gen';

// API v2 simulada nos testes. Os handlers padrão servem, para cada GET da v2,
// o exemplo gerado do OpenAPI (examples.gen.ts). Para mudar a resposta num
// teste, sobrescreva com `server.use(...)`:
//
//     server.use(
//       mockGet('/researcher', { ...fixture('/researcher'), data: [] }),
//       mockGetError('/institution/{institution_id}', 404),
//     );
//
// `server.resetHandlers()` (no setup, após cada teste) desfaz as sobrescritas.

/**
 * URL da API nos testes. O setup (`src/test/setup.ts`) a coloca em
 * `VITE_SIMCC_API_URL`, então o cliente `simcc` e os handlers usam a mesma base.
 */
export const TEST_SIMCC_API_URL = 'http://api.test/';

/** Caminhos da v2 com exemplo gerado (todo GET com resposta 200 em JSON). */
export type ExamplePath = keyof typeof examples & GetPath;

/**
 * URL absoluta que o MSW intercepta para um caminho do contrato:
 * `/researcher/{researcher_id}` → `http://api.test/v2/researcher/:researcher_id`.
 */
export function simccUrl(path: GetPath): string {
  const relative = path.replace(/^\//, '').replace(/\{(\w+)\}/g, ':$1');
  return new URL(`v2/${relative}`, TEST_SIMCC_API_URL).href;
}

/** Cópia do exemplo gerado para `GET <path>`, livre para alterar no teste. */
export function fixture<P extends ExamplePath>(path: P): ResponseOf<P> {
  return structuredClone(examples[path]) as ResponseOf<P>;
}

type ResolverInfo = { request: Request; params: PathParams };
type BodyResolver<P extends GetPath> = (
  info: ResolverInfo,
) => ResponseOf<P> | Promise<ResponseOf<P>>;

/**
 * Handler de `GET <path>` com corpo tipado pelo contrato. Aceita o corpo ou
 * uma função que o monta a partir da requisição (query, parâmetros de caminho).
 */
export function mockGet<P extends GetPath>(
  path: P,
  body: ResponseOf<P> | BodyResolver<P>,
  init?: ResponseInit,
) {
  return http.get(simccUrl(path), async (info) => {
    // Corpos da v2 são sempre objetos JSON, nunca funções.
    const resolved: unknown =
      typeof body === 'function' ? await (body as BodyResolver<P>)(info) : body;
    return HttpResponse.json(resolved as JsonBodyType, init);
  });
}

type ErrorBody = components['schemas']['ErrorBody'];

/** Handler de `GET <path>` que responde com o envelope de erro da v2. */
export function mockGetError(
  path: GetPath,
  status: number,
  error: Partial<ErrorBody> = {},
) {
  const body: components['schemas']['ErrorResponse'] = {
    error: {
      code: status === 404 ? 'not_found' : 'server_error',
      message: 'Erro simulado no teste.',
      details: [],
      ...error,
    },
  };
  return http.get(simccUrl(path), () => HttpResponse.json(body, { status }));
}

/** Um handler por GET da v2, servindo uma cópia nova do exemplo a cada chamada. */
export const simccHandlers = (Object.keys(examples) as ExamplePath[]).map(
  (path) => mockGet(path, () => fixture(path)),
);
