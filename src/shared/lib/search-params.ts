import {
  stripSearchParams,
  type SearchMiddleware,
} from '@tanstack/react-router';
import { z } from 'zod';

export type SortOrder = 'asc' | 'desc';

/** Opções para construir um esquema/motor de busca de listagem reutilizável. */
export interface ListSearchOptions<
  TSortBy extends readonly [string, ...string[]] | undefined = undefined,
  TFilters extends z.ZodRawShape = Record<never, never>,
  TExtra extends z.ZodRawShape = Record<never, never>,
> {
  /** Campos aceitos em `sort_by` (em geral o enum da rota na API v2). */
  sortBy?: TSortBy;
  /** Valor padrão de `sort_by` (omitido da URL ao limpar padrões). */
  defaultSortBy?: TSortBy extends readonly [string, ...string[]]
    ? TSortBy[number]
    : string;
  /** Direção padrão de ordenação (`asc` ou `desc`). */
  defaultSortOrder?: SortOrder;
  /** Página inicial padrão (padrão: `1`). */
  defaultPage?: number;
  /** Quantidade padrão de itens por página (padrão: `20`). */
  defaultPerPage?: number;
  /** Teto máximo de itens por página aceito pela API v2 (padrão: `100`). */
  maxPerPage?: number;
  /** Habilita `year_start` e `year_end` (padrão: `true`). */
  yearRange?: boolean;
  /** Filtros específicos da listagem enviados também para a API v2. */
  filters?: TFilters;
  /** Parâmetros de UI que ficam na URL mas não são enviados à API (ex.: `view`). */
  extra?: TExtra;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const DEFAULT_MAX_PER_PAGE = 100;
const MIN_YEAR = 1000;
const MAX_YEAR = 9999;

/** Janela padrão de anos exibida nos filtros (`anoCorrente - 10`). */
export const DEFAULT_YEAR_WINDOW = 10;

/** Retorna o ano inicial padrão (`anoCorrente - 10`). */
export function getDefaultYearStart(
  currentYear = new Date().getFullYear(),
): number {
  return currentYear - DEFAULT_YEAR_WINDOW;
}

/** Normaliza intervalo invertido de anos (`year_start > year_end`). */
export function normalizeYearRange<
  T extends { year_start?: number; year_end?: number },
>(obj: T): T {
  if (
    typeof obj.year_start === 'number' &&
    typeof obj.year_end === 'number' &&
    obj.year_start > obj.year_end
  ) {
    return {
      ...obj,
      year_start: obj.year_end,
      year_end: obj.year_start,
    };
  }
  return obj;
}

function flattenValues(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw === undefined || raw === null) return [];
  return [raw];
}

function parseNonEmptyString(raw: unknown): string | undefined {
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const parsed = parseNonEmptyString(item);
      if (parsed !== undefined) return parsed;
    }
    return undefined;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(raw);
  }
  return undefined;
}

function parseStringArray(raw: unknown): string[] | undefined {
  const unique = new Set<string>();
  for (const item of flattenValues(raw)) {
    const str = parseNonEmptyString(item);
    if (str !== undefined) unique.add(str);
  }
  return unique.size > 0 ? Array.from(unique) : undefined;
}

function parseBooleanValue(raw: unknown): boolean | undefined {
  for (const item of flattenValues(raw)) {
    if (item === true || item === 'true' || item === '1' || item === 1) {
      return true;
    }
    if (item === false || item === 'false' || item === '0' || item === 0) {
      return false;
    }
  }
  return undefined;
}

function parseInteger(raw: unknown): number | undefined {
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const parsed = parseInteger(item);
      if (parsed !== undefined) return parsed;
    }
    return undefined;
  }
  if (typeof raw === 'number') {
    return Number.isSafeInteger(raw) ? raw : undefined;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!/^-?\d+$/.test(trimmed)) return undefined;
    const num = Number(trimmed);
    return Number.isSafeInteger(num) ? num : undefined;
  }
  return undefined;
}

function clampPerPage(
  raw: unknown,
  fallback: number,
  maxPerPage: number,
): number {
  const num = parseInteger(raw);
  if (num === undefined || num < 1) return fallback;
  return Math.min(num, maxPerPage);
}

function clampPage(raw: unknown, fallback: number): number {
  const num = parseInteger(raw);
  if (num === undefined || num < 1) return fallback;
  return num;
}

function parseYearValue(
  raw: unknown,
  min: number,
  max: number,
): number | undefined {
  const num = parseInteger(raw);
  if (num === undefined || num < min || num > max) return undefined;
  return num;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, idx) => item === b[idx]);
  }
  return false;
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      next[key] = value;
    }
  }
  return next as T;
}

type OptionalParam<T> = z.ZodOptional<z.ZodType<T, T>>;
type DefaultedParam<T> = z.ZodDefault<z.ZodType<T, T>>;

/** Parâmetro de texto opcional (trimado; vazio vira `undefined`). */
export function searchStringParam() {
  return z.preprocess(
    (raw) => parseNonEmptyString(raw),
    z.string().optional(),
  ) as unknown as OptionalParam<string>;
}

/** Parâmetro de lista de strings (aceita chave repetida ou valor único; vazio vira `undefined`). */
export function searchStringArrayParam() {
  return z.preprocess(
    (raw) => parseStringArray(raw),
    z.array(z.string()).optional(),
  ) as unknown as OptionalParam<string[]>;
}

/** Parâmetro de lista restrita a um enum (descarta valores fora do enum; vazio vira `undefined`). */
export function searchEnumArrayParam<
  const T extends readonly [string, ...string[]],
>(values: T) {
  const allowed = new Set<string>(values);
  return z.preprocess(
    (raw) => {
      const list = parseStringArray(raw);
      if (!list) return undefined;
      const valid = list.filter((item) => allowed.has(item));
      return valid.length > 0 ? valid : undefined;
    },
    z.array(z.enum(values)).optional(),
  ) as unknown as OptionalParam<T[number][]>;
}

/** Parâmetro booleano opcional (`true`/`false`/`1`/`0`; inválido vira `undefined`). */
export function searchBooleanParam() {
  return z.preprocess(
    (raw) => parseBooleanValue(raw),
    z.boolean().optional(),
  ) as unknown as OptionalParam<boolean>;
}

/** Parâmetro de ano inteiro opcional (padrão `1000..9999`; inválido vira `undefined`). */
export function searchYearParam(options?: { min?: number; max?: number }) {
  const min = options?.min ?? MIN_YEAR;
  const max = options?.max ?? MAX_YEAR;
  return z.preprocess(
    (raw) => parseYearValue(raw, min, max),
    z.number().int().min(min).max(max).optional(),
  ) as unknown as OptionalParam<number>;
}

/** Parâmetro de ano inteiro com fallback dinâmico quando ausente ou inválido. */
export function searchDefaultedYearParam(
  getDefault: () => number,
  options?: { min?: number; max?: number },
) {
  const min = options?.min ?? MIN_YEAR;
  const max = options?.max ?? MAX_YEAR;
  return z.preprocess(
    (raw) => parseYearValue(raw, min, max) ?? getDefault(),
    z.number().int().min(min).max(max),
  ) as unknown as DefaultedParam<number>;
}

/**
 * Converte `URLSearchParams`, query string (`?a=1&a=2`) ou objeto plano em um
 * registro preservando chaves repetidas como arrays de strings.
 */
export function parseSearchInput(
  input: URLSearchParams | string | Record<string, unknown>,
): Record<string, unknown> {
  if (typeof input === 'string' || input instanceof URLSearchParams) {
    const usp =
      typeof input === 'string'
        ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
        : input;
    const record: Record<string, unknown> = {};
    for (const key of new Set(usp.keys())) {
      const all = usp.getAll(key);
      record[key] = all.length > 1 ? all : all[0];
    }
    return record;
  }
  return input;
}

/**
 * Remove valores vazios (`undefined`, `null`, `""`, `[]`) e valores iguais aos
 * padrões configurados, mantendo a URL limpa.
 */
export function cleanSearchParams<T extends Record<string, unknown>>(
  search: T,
  defaults?: Record<string, unknown>,
): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(search)) {
    if (isEmptyValue(value)) continue;
    if (defaults && key in defaults && valuesEqual(value, defaults[key])) {
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned as Partial<T>;
}

/**
 * Serializa um objeto de busca em `URLSearchParams`, usando chaves repetidas
 * para arrays (`?institution_id=a&institution_id=b`) e omitindo valores vazios
 * ou iguais aos padrões.
 */
export function toURLSearchParams(
  search: Record<string, unknown>,
  defaults?: Record<string, unknown>,
): URLSearchParams {
  const usp = new URLSearchParams();
  const cleaned = cleanSearchParams(search, defaults);
  for (const [key, value] of Object.entries(cleaned)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!isEmptyValue(item)) usp.append(key, String(item));
      }
    } else if (value !== undefined && value !== null) {
      usp.set(key, String(value));
    }
  }
  return usp;
}

/**
 * Parser compatível com `parseSearch` do TanStack Router usando `URLSearchParams`
 * sem coerção implícita de strings numéricas (evita `?q=2024` virar número).
 */
export function parseListSearchString(
  searchStr: string,
): Record<string, unknown> {
  return parseSearchInput(searchStr);
}

/**
 * Serializer compatível com `stringifySearch` do TanStack Router usando chaves
 * repetidas para arrays (`?area=a&area=b`).
 */
export function stringifyListSearchObject(
  search: Record<string, unknown>,
): string {
  const query = toURLSearchParams(search).toString();
  return query ? `?${query}` : '';
}

type SortBySchema<
  TSortBy extends readonly [string, ...string[]] | undefined,
  TDefaultSortBy,
> = TSortBy extends readonly [string, ...string[]]
  ? TDefaultSortBy extends TSortBy[number]
    ? DefaultedParam<TSortBy[number]>
    : OptionalParam<TSortBy[number]>
  : TDefaultSortBy extends string
    ? DefaultedParam<string>
    : OptionalParam<string>;

type SortOrderSchema<TDefaultSortOrder> = TDefaultSortOrder extends SortOrder
  ? DefaultedParam<SortOrder>
  : OptionalParam<SortOrder>;

function buildSortBySchema<
  TSortBy extends readonly [string, ...string[]] | undefined,
  TDefault extends string | undefined,
>(sortBy: TSortBy, defaultSortBy: TDefault) {
  const allowed = sortBy ? new Set<string>(sortBy) : null;
  const resolveValue = (raw: unknown) => {
    const value = parseNonEmptyString(raw);
    if (value !== undefined && (!allowed || allowed.has(value))) return value;
    return defaultSortBy;
  };
  if (defaultSortBy !== undefined) {
    return z.preprocess(resolveValue, z.string()) as unknown as SortBySchema<
      TSortBy,
      TDefault
    >;
  }
  return z.preprocess(
    resolveValue,
    z.string().optional(),
  ) as unknown as SortBySchema<TSortBy, TDefault>;
}

function buildSortOrderSchema<TDefault extends SortOrder | undefined>(
  defaultSortOrder: TDefault,
) {
  const resolveValue = (raw: unknown) => {
    const value = parseNonEmptyString(raw)?.toLowerCase();
    if (value === 'asc' || value === 'desc') return value;
    return defaultSortOrder;
  };
  if (defaultSortOrder !== undefined) {
    return z.preprocess(
      resolveValue,
      z.enum(['asc', 'desc']),
    ) as unknown as SortOrderSchema<TDefault>;
  }
  return z.preprocess(
    resolveValue,
    z.enum(['asc', 'desc']).optional(),
  ) as unknown as SortOrderSchema<TDefault>;
}

/**
 * Cria um motor completo de search params para listagens:
 * - schema zod compatível com `validateSearch` do TanStack Router e chamadas à API v2;
 * - limpeza de valores vazios/padrão;
 * - serialização/parse round-trip com `URLSearchParams` (arrays repetidos);
 * - helpers de atualização com reset automático de `page` para `1` quando filtros,
 *   busca, ordenação ou `per_page` mudam.
 */
export function createListSearch<
  const TSortBy extends readonly [string, ...string[]] | undefined = undefined,
  TFilters extends z.ZodRawShape = Record<never, never>,
  TExtra extends z.ZodRawShape = Record<never, never>,
  TDefaultSortBy extends
    | (TSortBy extends readonly [string, ...string[]]
        ? TSortBy[number]
        : string)
    | undefined = undefined,
  TDefaultSortOrder extends SortOrder | undefined = undefined,
  TYearRange extends boolean = true,
>(options?: {
  sortBy?: TSortBy;
  defaultSortBy?: TDefaultSortBy;
  defaultSortOrder?: TDefaultSortOrder;
  defaultPage?: number;
  defaultPerPage?: number;
  maxPerPage?: number;
  yearRange?: TYearRange;
  filters?: TFilters;
  extra?: TExtra;
}) {
  const defaultPage = Math.max(1, options?.defaultPage ?? DEFAULT_PAGE);
  const maxPerPage = Math.max(1, options?.maxPerPage ?? DEFAULT_MAX_PER_PAGE);
  const defaultPerPage = Math.min(
    maxPerPage,
    Math.max(1, options?.defaultPerPage ?? DEFAULT_PER_PAGE),
  );
  const includeYearRange = options?.yearRange ?? true;
  const filtersShape = (options?.filters ?? {}) as TFilters;
  const extraShape = (options?.extra ?? {}) as TExtra;

  const yearShape = (
    includeYearRange
      ? {
          year_start: searchDefaultedYearParam(getDefaultYearStart),
          year_end: searchYearParam(),
        }
      : {}
  ) as TYearRange extends false
    ? Record<never, never>
    : {
        year_start: ReturnType<typeof searchDefaultedYearParam>;
        year_end: ReturnType<typeof searchYearParam>;
      };

  const baseObject = z.object({
    q: searchStringParam(),
    page: z.preprocess(
      (raw) => clampPage(raw, defaultPage),
      z.number().int().min(1),
    ) as unknown as DefaultedParam<number>,
    per_page: z.preprocess(
      (raw) => clampPerPage(raw, defaultPerPage, maxPerPage),
      z.number().int().min(1).max(maxPerPage),
    ) as unknown as DefaultedParam<number>,
    sort_by: buildSortBySchema<TSortBy, TDefaultSortBy>(
      options?.sortBy as TSortBy,
      options?.defaultSortBy as TDefaultSortBy,
    ),
    sort_order: buildSortOrderSchema<TDefaultSortOrder>(
      options?.defaultSortOrder as TDefaultSortOrder,
    ),
    ...yearShape,
    ...filtersShape,
    ...extraShape,
  });

  type RawOutput = z.output<typeof baseObject>;
  type RawInput = z.input<typeof baseObject>;

  const schema = baseObject.transform((parsed) => {
    const obj = includeYearRange
      ? normalizeYearRange({ ...parsed } as Record<string, unknown> & {
          year_start?: number;
          year_end?: number;
        })
      : ({ ...parsed } as Record<string, unknown>);
    return stripUndefined(obj) as RawOutput;
  }) as unknown as z.ZodType<RawOutput, RawInput>;

  type SearchState = RawOutput;
  type ApiParams = Omit<SearchState, keyof TExtra>;

  function getDefaults(): Record<string, unknown> {
    return {
      page: defaultPage,
      per_page: defaultPerPage,
      ...(options?.defaultSortBy !== undefined
        ? { sort_by: options.defaultSortBy }
        : {}),
      ...(options?.defaultSortOrder !== undefined
        ? { sort_order: options.defaultSortOrder }
        : {}),
      ...(includeYearRange ? { year_start: getDefaultYearStart() } : {}),
    };
  }

  const filterKeys = Object.keys(filtersShape);
  const extraKeys = new Set(Object.keys(extraShape));

  const middlewares: SearchMiddleware<SearchState>[] = [
    (ctx) =>
      stripSearchParams<SearchState>(getDefaults() as Partial<SearchState>)(
        ctx,
      ),
  ];

  function parse(
    input: URLSearchParams | string | Record<string, unknown> = {},
  ): SearchState {
    return schema.parse(parseSearchInput(input));
  }

  function fromURLSearchParams(input: URLSearchParams | string): SearchState {
    return parse(input);
  }

  function buildURLSearchParams(search: Partial<SearchState>): URLSearchParams {
    return toURLSearchParams(search as Record<string, unknown>, getDefaults());
  }

  function clean(search: Partial<SearchState>): Partial<SearchState> {
    return cleanSearchParams(
      search as Record<string, unknown>,
      getDefaults(),
    ) as Partial<SearchState>;
  }

  function toApiParams(search: SearchState): ApiParams {
    const api: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      search as Record<string, unknown>,
    )) {
      if (value === undefined || extraKeys.has(key)) continue;
      api[key] = value;
    }
    return api as ApiParams;
  }

  function update(
    prev: Partial<SearchState> | SearchState,
    patch: Partial<SearchState> | Record<string, unknown>,
    updateOptions?: { resetPage?: boolean },
  ): SearchState {
    const normalizedPrev = schema.parse(prev) as Record<string, unknown>;
    const nextRaw: Record<string, unknown> = { ...normalizedPrev, ...patch };
    const next = schema.parse(nextRaw) as Record<string, unknown>;

    const shouldReset = updateOptions?.resetPage ?? true;
    if (shouldReset) {
      const nonPageChanged = Object.keys({ ...normalizedPrev, ...next }).some(
        (key) => key !== 'page' && !valuesEqual(normalizedPrev[key], next[key]),
      );
      if (nonPageChanged) {
        next.page = defaultPage;
      }
    }

    return stripUndefined(next) as SearchState;
  }

  function toggleFilter(
    prev: Partial<SearchState> | SearchState,
    param: string,
    value: string,
  ): SearchState {
    const normalizedPrev = schema.parse(prev) as Record<string, unknown>;
    const current = parseStringArray(normalizedPrev[param]);
    const list = current ?? [];
    const nextList = list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
    return update(normalizedPrev as SearchState, {
      [param]: nextList.length > 0 ? nextList : undefined,
    });
  }

  function setYearRange(
    prev: Partial<SearchState> | SearchState,
    range: { year_start?: number; year_end?: number },
  ): SearchState {
    return update(prev, range);
  }

  function clearFilters(prev: Partial<SearchState> | SearchState): SearchState {
    const patch: Record<string, unknown> = {};
    for (const key of filterKeys) {
      patch[key] = undefined;
    }
    if (includeYearRange) {
      patch.year_start = undefined;
      patch.year_end = undefined;
    }
    return update(prev, patch);
  }

  function countActiveFilters(search: Partial<SearchState>): number {
    const record = search as Record<string, unknown>;
    let count = 0;
    for (const key of filterKeys) {
      const value = record[key];
      if (Array.isArray(value)) {
        count += value.length;
      } else if (value !== undefined) {
        count += 1;
      }
    }
    if (
      includeYearRange &&
      ((record.year_start !== undefined &&
        record.year_start !== getDefaultYearStart()) ||
        record.year_end !== undefined)
    ) {
      count += 1;
    }
    return count;
  }

  return {
    schema,
    get defaults() {
      return getDefaults() as Partial<SearchState>;
    },
    middlewares,
    parse,
    fromURLSearchParams,
    toURLSearchParams: buildURLSearchParams,
    clean,
    toApiParams,
    update,
    toggleFilter,
    setYearRange,
    clearFilters,
    countActiveFilters,
  };
}

/** Atalho para criar apenas o schema zod (para `validateSearch`) com as mesmas regras. */
export function createListSearchSchema<
  const TSortBy extends readonly [string, ...string[]] | undefined = undefined,
  TFilters extends z.ZodRawShape = Record<never, never>,
  TExtra extends z.ZodRawShape = Record<never, never>,
  TDefaultSortBy extends
    | (TSortBy extends readonly [string, ...string[]]
        ? TSortBy[number]
        : string)
    | undefined = undefined,
  TDefaultSortOrder extends SortOrder | undefined = undefined,
  TYearRange extends boolean = true,
>(options?: {
  sortBy?: TSortBy;
  defaultSortBy?: TDefaultSortBy;
  defaultSortOrder?: TDefaultSortOrder;
  defaultPage?: number;
  defaultPerPage?: number;
  maxPerPage?: number;
  yearRange?: TYearRange;
  filters?: TFilters;
  extra?: TExtra;
}) {
  return createListSearch(options).schema;
}

/** Motor de busca padrão (q, page, per_page, sort_by, sort_order, year_start, year_end). */
export const baseListSearch = createListSearch();
export const baseListSearchSchema = baseListSearch.schema;
