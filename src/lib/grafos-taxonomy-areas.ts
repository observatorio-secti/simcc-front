// Derivação automática de campos da taxonomia (key + area_examples).
// Port de prototipo-classificador-pesquisadores/frontend/src/lib/taxonomyAreas.ts

import type { TaxonomyArea } from '../types/grafos-taxonomy-generator';

export function slugifyAreaKey(title: string): string {
  const normalized = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || 'area';
}

function dedupeKeys(areas: TaxonomyArea[]): TaxonomyArea[] {
  const seen = new Map<string, number>();
  return areas.map((area) => {
    const base = slugifyAreaKey(area.title);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const key = count === 0 ? base : `${base}_${count + 1}`;
    return { ...area, key };
  });
}

function computeAreaExamples(areas: TaxonomyArea[]): string[] {
  return areas
    .map((a) => a.title.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function withDerivedAreaFields(areas: TaxonomyArea[]): {
  areas: TaxonomyArea[];
  area_examples: string[];
} {
  const deduped = dedupeKeys(areas);
  return { areas: deduped, area_examples: computeAreaExamples(deduped) };
}
