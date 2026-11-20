import type { components, paths } from './generated/simcc-v2';

// Helpers de tipo sobre o contrato gerado (ADR 0003). Nada aqui é escrito à
// mão: tudo deriva de `paths` e `components` de `generated/simcc-v2.d.ts`.
//
// Envelopes da v2:
// - lista paginada: `{ data: T[], pagination, filters_applied, sort, meta, facets? }`;
// - lista curta (sugestões, termos, métricas): `{ data: T[], meta, … }`, sem paginação;
// - detalhe: `{ data: T, meta }`.

export type Schemas = components['schemas'];
export type Schema<K extends keyof Schemas> = Schemas[K];

export type Meta = Schemas['Meta'];
export type Pagination = Schemas['Pagination'];
export type Sort = Schemas['Sort'];
export type FacetResult = Schemas['FacetResult'];
export type FacetItem = Schemas['FacetItem'];

/** Caminhos com `GET` (relativos à base da v2, ex.: `/researcher`). */
export type GetPath = {
  [P in keyof paths]: paths[P] extends { get: object } ? P : never;
}[keyof paths];

type GetOperation<P extends GetPath> = paths[P] extends { get: infer O }
  ? O
  : never;

/** Corpo JSON da resposta 200 de `GET <P>`. */
export type ResponseOf<P extends GetPath> =
  GetOperation<P> extends {
    responses: { 200: { content: { 'application/json': infer R } } };
  }
    ? R
    : never;

/** Query string aceita por `GET <P>`. */
export type QueryOf<P extends GetPath> =
  GetOperation<P> extends { parameters: { query?: infer Q } }
    ? NonNullable<Q>
    : never;

/** Parâmetros de caminho de `GET <P>` (ex.: `{ researcher_id: string }`). */
export type PathParamsOf<P extends GetPath> =
  GetOperation<P> extends { parameters: { path: infer A } } ? A : never;

/** Caminhos cuja resposta é uma lista paginada. */
export type ListPath = {
  [P in GetPath]: ResponseOf<P> extends {
    data: unknown[];
    pagination: Pagination;
    meta: Meta;
  }
    ? P
    : never;
}[GetPath];

/** Caminhos cuja resposta é um detalhe `{ data: T, meta }`. */
export type DetailPath = {
  [P in GetPath]: ResponseOf<P> extends { data: infer D; meta: Meta }
    ? D extends unknown[]
      ? never
      : P
    : never;
}[GetPath];

/** Envelope completo de uma lista paginada. */
export type ListResponse<P extends ListPath> = ResponseOf<P>;

/** Item de uma lista paginada (ex.: `ResearcherSummary` em `/researcher`). */
export type ListItem<P extends ListPath> =
  ResponseOf<P> extends { data: (infer I)[] } ? I : never;

/** Filtros que o backend aplicou (`filters_applied`), já tipados por rota. */
export type ListFilters<P extends ListPath> =
  ResponseOf<P> extends { filters_applied: infer F } ? F : never;

/** Envelope completo de um detalhe. */
export type DetailResponse<P extends DetailPath> = ResponseOf<P>;

/** Entidade de um detalhe (ex.: `ResearcherDetail` em `/researcher/{researcher_id}`). */
export type DetailData<P extends DetailPath> =
  ResponseOf<P> extends { data: infer D } ? D : never;
