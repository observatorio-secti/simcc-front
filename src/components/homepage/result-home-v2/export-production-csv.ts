import {
  searchProductionsV2,
  SearchProductionsV2Params,
} from '../../../services/productions-v2';
import { ProductionKindV2 } from '../../../types/production-v2';
import { PRODUCTION_DEFINITIONS } from './production-registry';

const EXPORT_PAGE_SIZE = 100; // máximo aceito pela API
const MAX_EXPORT_PAGES = 100;

const toCsv = (rows: Record<string, string | number>[]) => {
  const header = Object.keys(rows[0]);
  return [
    '﻿' + header.join(';'),
    ...rows.map((row) =>
      header.map((field) => JSON.stringify(row[field] ?? '')).join(';'),
    ),
  ].join('\r\n');
};

/**
 * Exporta as produções da busca atual (mesmos filtros e ordenação).
 * Devolve quantas linhas foram exportadas e o total do resultado, para o
 * chamador avisar quando o limite de páginas cortar a exportação.
 */
export async function exportProductionCsv(
  kind: ProductionKindV2,
  params: Omit<SearchProductionsV2Params, 'page' | 'perPage'>,
) {
  const definition = PRODUCTION_DEFINITIONS[kind];
  const rows: Record<string, string | number>[] = [];
  let page = 1;
  let hasNext = true;
  let total = 0;

  while (hasNext && page <= MAX_EXPORT_PAGES) {
    const response = await searchProductionsV2(kind, {
      ...params,
      page,
      perPage: EXPORT_PAGE_SIZE,
    });
    response.data.forEach((item) =>
      rows.push({
        id: item.id,
        title: item.title,
        year: item.year ?? '',
        platform_authors: item.platform_authors
          .map((author) => author.name)
          .join(' / '),
        ...definition.csv(item),
      }),
    );
    total = response.pagination.total_items;
    hasNext = response.pagination.has_next;
    page += 1;
  }

  if (rows.length > 0) {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = definition.csvFileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  return { exported: rows.length, total };
}
