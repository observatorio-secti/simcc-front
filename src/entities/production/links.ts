import { z } from 'zod';
import { PRODUCTION_KINDS, type ProductionKind } from './model';
import { PRODUCTION_REGISTRY } from './registry';

// Endereços da produção (T13). A URL pública do detalhe é
// `/producoes/<slug>/<id>`, com o slug em pt-BR definido no registro da E2.
// Dentro de uma lista hospedeira (busca, perfil), a produção aberta como
// overlay fica num único search param, `production=<kind da v2>:<id>`
// (ADR 0010).

/** Produção identificada pelo tipo da v2 e pelo id. */
export interface ProductionRef {
  kind: ProductionKind;
  id: string;
}

const KIND_BY_SLUG: ReadonlyMap<string, ProductionKind> = new Map(
  PRODUCTION_KINDS.map((kind) => [PRODUCTION_REGISTRY[kind].slug, kind]),
);

/** Slug público (`artigo`, `capitulo-de-livro`…) de um tipo da v2. */
export function productionSlug(kind: ProductionKind): string {
  return PRODUCTION_REGISTRY[kind].slug;
}

/** Tipo da v2 a partir do slug público; `null` quando o slug não existe. */
export function productionKindFromSlug(slug: string): ProductionKind | null {
  return KIND_BY_SLUG.get(slug) ?? null;
}

/** Caminho público do detalhe da produção, respeitando `BASE_URL`. */
export function productionHref(kind: ProductionKind, id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/producoes/${productionSlug(kind)}/${encodeURIComponent(id)}`;
}

/** Params da rota `/producoes/$kind/$id` (para `Link` e `mask`). */
export function productionRouteParams(ref: ProductionRef): {
  kind: string;
  id: string;
} {
  return { kind: productionSlug(ref.kind), id: ref.id };
}

/** Valor do search param `production` (`article:<id>`). */
export function encodeProductionRef(ref: ProductionRef): string {
  return `${ref.kind}:${ref.id}`;
}

/** Lê o search param `production`; `undefined` quando ausente ou inválido. */
export function decodeProductionRef(
  value: string | undefined,
): ProductionRef | undefined {
  if (!value) return undefined;
  const separator = value.indexOf(':');
  if (separator <= 0) return undefined;
  const kind = value.slice(0, separator);
  const id = value.slice(separator + 1).trim();
  if (!id || !(PRODUCTION_KINDS as readonly string[]).includes(kind)) {
    return undefined;
  }
  return { kind: kind as ProductionKind, id };
}

/**
 * Search param `production` validado: só passa `<kind>:<id>` bem formado;
 * qualquer outro valor vira `undefined`. Opcional na entrada (como os
 * parâmetros de `shared/lib/search-params`), para `Link`/`navigate` omitirem.
 */
export const productionRefParam = z.preprocess((raw) => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return undefined;
  const ref = decodeProductionRef(value.trim());
  return ref ? encodeProductionRef(ref) : undefined;
}, z.string().optional()) as unknown as z.ZodOptional<
  z.ZodType<string, string>
>;
