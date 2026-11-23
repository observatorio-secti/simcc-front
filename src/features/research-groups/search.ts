import { z } from 'zod';
import type { OdaGroupSortField } from '@/api/oda';
import type { ResearchGroupListParams } from '@/entities/research-group/queries';
import {
  createListSearch,
  searchStringParam,
} from '@/shared/lib/search-params';
import type { SortOption } from '@/shared/ui/sort-select';

export const GROUP_VIEW_MODES = ['grid', 'list'] as const;
export type GroupViewMode = (typeof GROUP_VIEW_MODES)[number];

export const GROUP_STATUS_VALUES = [
  'CERTIFICADO',
  'EM_PREENCHIMENTO',
  'AGUARDANDO_CERTIFICACAO',
  'EM_ANALISE',
  'INATIVO',
  'EXCLUIDO',
] as const;

export type GroupStatusFilterValue = (typeof GROUP_STATUS_VALUES)[number];

export const GROUP_SORT_VALUES = [
  'nome',
  'anoFormacao',
  'situacao',
] as const satisfies readonly OdaGroupSortField[];

export const GROUP_SORT_OPTIONS: readonly SortOption<OdaGroupSortField>[] = [
  { value: 'nome', label: 'Nome', defaultOrder: 'asc' },
  { value: 'anoFormacao', label: 'Ano de formação', defaultOrder: 'desc' },
  { value: 'situacao', label: 'Situação', defaultOrder: 'asc' },
];

export const researchGroupsSearch = createListSearch({
  sortBy: GROUP_SORT_VALUES,
  defaultSortBy: 'nome',
  defaultSortOrder: 'asc',
  defaultPerPage: 12,
  maxPerPage: 96,
  yearRange: false,
  filters: {
    situacao: z.enum(GROUP_STATUS_VALUES).optional(),
    area: searchStringParam(),
    uf: z
      .string()
      .trim()
      .transform((value) => (value ? value.toUpperCase() : undefined))
      .pipe(z.string().length(2).optional())
      .optional(),
    instituicao: searchStringParam(),
    cidade: searchStringParam(),
    ano: z.coerce.number().int().min(1900).max(2100).optional(),
  },
  extra: {
    view: z.enum(GROUP_VIEW_MODES).optional(),
  },
});

export type ResearchGroupsSearch = z.output<typeof researchGroupsSearch.schema>;

/** Converte o estado validado da URL nos parâmetros de query da API ODA. */
export function toOdaGroupQueryParams(
  search: ResearchGroupsSearch,
): Omit<ResearchGroupListParams, 'all'> {
  return {
    page: search.page,
    size: search.per_page,
    q: search.q,
    situacao: search.situacao,
    areaConhecimentoId: search.area,
    uf: search.uf,
    instituicaoId: search.instituicao,
    cidade: search.cidade,
    anoFormacao: search.ano,
    ordenarPor: search.sort_by,
    ordem: search.sort_order,
  };
}

export const GROUP_DETAIL_TABS = ['linhas', 'pesquisadores'] as const;
export type GroupDetailTab = (typeof GROUP_DETAIL_TABS)[number];

export const researchGroupDetailSearch = createListSearch({
  defaultPerPage: 12,
  maxPerPage: 100,
  yearRange: false,
  extra: {
    tab: z.enum(GROUP_DETAIL_TABS).optional(),
    q: searchStringParam(),
  },
});

export type ResearchGroupDetailSearch = z.output<
  typeof researchGroupDetailSearch.schema
>;
