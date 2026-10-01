import {
  searchResearchersV2,
  SearchResearchersV2Params,
} from '../../../../services/researchers-v2';
import { ResearcherV2 } from '../../../../types/researcher-v2';

const EXPORT_PAGE_SIZE = 100; // máximo aceito pela API
const MAX_EXPORT_PAGES = 100;

const toRow = (researcher: ResearcherV2) => ({
  researcher_id: researcher.researcher_id,
  name: researcher.name,
  graduation: researcher.graduation ?? '',
  classification: researcher.classification ?? '',
  institutions: researcher.affiliations
    .map(({ institution }) => institution.acronym || institution.name)
    .join(' / '),
  articles: researcher.counts.articles,
  books: researcher.counts.books,
  book_chapters: researcher.counts.book_chapters,
  patents: researcher.counts.patents,
  software: researcher.counts.software,
  brands: researcher.counts.brands,
  lattes_update: researcher.lattes_update ?? '',
});

const toCsv = (rows: Record<string, string | number>[]) => {
  if (rows.length === 0) return '';
  const header = Object.keys(rows[0]);
  return [
    '﻿' + header.join(';'),
    ...rows.map((row) =>
      header.map((field) => JSON.stringify(row[field] ?? '')).join(';'),
    ),
  ].join('\r\n');
};

/**
 * Exporta todos os pesquisadores da busca atual (mesmos filtros e ordenação),
 * sem facets nem evidências para gastar o mínimo de consultas por página.
 */
export async function exportProfileSearchCsv(
  params: Omit<SearchResearchersV2Params, 'page' | 'facets' | 'includeMatches'>,
) {
  const researchers: ResearcherV2[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= MAX_EXPORT_PAGES) {
    const response = await searchResearchersV2({
      ...params,
      page,
      perPage: EXPORT_PAGE_SIZE,
    });
    researchers.push(...response.data);
    hasNext = response.pagination.has_next;
    page += 1;
  }

  const csv = toCsv(researchers.map(toRow));
  if (!csv) return;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'pesquisadores.csv';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
