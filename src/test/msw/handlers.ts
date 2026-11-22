import { http, HttpResponse, matchRequestUrl, type RequestHandler } from 'msw';
import type { GetPath } from '@/api/types';
import {
  openApiErrors,
  v2Fixtures,
  type V2Fixtures,
  type V2JsonPath,
} from './fixtures';

// Calcula `<VITE_SIMCC_API_URL>v2` sem importar `@/config/env` ou `@/api/simcc`
// no carregamento dos handlers, para não congelar `env` antes que testes como
// `src/api/simcc.test.ts` executem `vi.stubEnv`.
function getV2BaseUrl(): string {
  const raw =
    (import.meta.env.VITE_SIMCC_API_URL as string | undefined) ||
    'http://localhost:8088/';
  return new URL('v2', raw.endsWith('/') ? raw : `${raw}/`).href;
}

/**
 * Converte um caminho da v2 (aceita `{param}` do OpenAPI ou `:param` do MSW)
 * para a URL completa usada por `simcc` (`<VITE_SIMCC_API_URL>v2/...`).
 */
export function simccV2Url(path: GetPath | (string & {})): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const mswPath = normalized.replaceAll(/\{([^}]+)\}/g, ':$1');
  return `${getV2BaseUrl()}${mswPath}`;
}

function v2Route(path: GetPath) {
  return ({ request }: { request: Request }) => {
    const result = matchRequestUrl(new URL(request.url), simccV2Url(path));
    return {
      matches: result.matches,
      params: result.params ?? {},
    };
  };
}

const productionMetricKinds = new Set<
  V2Fixtures['/metrics/production/{kind}']['kind']
>([
  'article',
  'book',
  'book_chapter',
  'software',
  'patent',
  'event',
  'research_project',
  'brand',
  'guidance',
  'report',
  'magazine_text',
  'event_work',
]);

function isProductionMetricKind(
  value: string,
): value is V2Fixtures['/metrics/production/{kind}']['kind'] {
  return productionMetricKinds.has(
    value as V2Fixtures['/metrics/production/{kind}']['kind'],
  );
}

// PNG 1x1 mínimo para responder a `/researcher/{researcher_id}/image`.
const transparentPng = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120,
  156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68,
  174, 66, 96, 130,
]);

function jsonRoute<P extends Exclude<V2JsonPath, '/metrics/production/{kind}'>>(
  path: P,
) {
  return http.get(v2Route(path), () => HttpResponse.json(v2Fixtures[path]));
}

const jsonPaths = Object.keys(v2Fixtures).filter(
  (path): path is Exclude<V2JsonPath, '/metrics/production/{kind}'> =>
    path !== '/metrics/production/{kind}',
);

/** Cria os handlers padrão da API v2 a partir das fixtures tipadas do OpenAPI. */
export function createSimccHandlers(): RequestHandler[] {
  return [
    ...jsonPaths.map((path) => jsonRoute(path)),
    http.get(v2Route('/metrics/production/{kind}'), ({ params }) => {
      // O path usa hífen (`book-chapter`); o `kind` da resposta, sublinhado.
      const kind = String(params.kind ?? '').replaceAll('-', '_');
      if (!isProductionMetricKind(kind)) {
        return HttpResponse.json(openApiErrors.unknownParameter, {
          status: 422,
        });
      }
      return HttpResponse.json({
        ...v2Fixtures['/metrics/production/{kind}'],
        kind,
      });
    }),
    http.get(
      v2Route('/researcher/{researcher_id}/image'),
      () =>
        new HttpResponse(transparentPng, {
          status: 200,
          headers: { 'Content-Type': 'image/png' },
        }),
    ),
  ];
}

export const simccHandlers: RequestHandler[] = createSimccHandlers();
