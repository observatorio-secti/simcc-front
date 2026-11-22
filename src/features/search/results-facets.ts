import { normalizeProductionKind } from '@/entities/production/model';
import { getProductionDefinition } from '@/entities/production/registry';
import { scholarshipModalityColor } from '@/entities/scholarship/model';
import { areaColor, areaKey, qualisColor } from '@/shared/lib/design-tokens';
import type { FacetFieldConfig } from '@/shared/ui/facet-panel';

const LOWERCASE_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

/** "METROPOLITANA DE SALVADOR" → "Metropolitana de Salvador". */
export function titleCaseLabel(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1),
    )
    .join(' ');
}

/** Rótulo do `source_type` de `/v2/researcher` (faceta e tags do total). */
export function sourceTypeLabel(value: string): string {
  if (value === 'area_specialty') return 'Áreas de especialidade';
  const kind = normalizeProductionKind(value);
  return kind ? getProductionDefinition(kind).title : value;
}

const QUALIS_LABELS: Record<string, string> = {
  not_rated: 'Sem Qualis',
  not_applicable: 'Não se aplica',
};

/** Apresentação das facetas de `/busca` (rótulos em pt-BR e cor por dado). */
export const RESULTS_FACET_CONFIG: Record<string, FacetFieldConfig> = {
  source_type: {
    label: 'Tipos de produção',
    formatItemLabel: (item) => sourceTypeLabel(item.value),
  },
  area: {
    label: 'Grandes áreas do conhecimento',
    dotClassName: (value) => areaColor(value).bg,
    formatItemLabel: (item) =>
      areaKey(item.value)
        ? areaColor(item.value).label
        : titleCaseLabel(item.label.replace(/_/g, ' ')),
  },
  qualis: {
    label: 'Qualis',
    dotClassName: (value) => qualisColor(value).bg,
    formatItemLabel: (item) => QUALIS_LABELS[item.value] ?? item.label,
  },
  year: { label: 'Ano de produção' },
  institution: { label: 'Instituições', searchable: true },
  graduate_program: {
    label: 'Programas de pós-graduação',
    searchable: true,
    formatItemLabel: (item) => titleCaseLabel(item.label),
  },
  identity_territory: {
    label: 'Territórios de identidade',
    searchable: true,
    formatItemLabel: (item) => titleCaseLabel(item.label),
  },
  city: { label: 'Cidades', searchable: true },
  graduation: { label: 'Maior titulação' },
  classification: { label: 'Classificação do pesquisador' },
  modality: {
    label: 'Bolsas de produtividade',
    searchable: true,
    dotClassName: (value) => scholarshipModalityColor(value).bg,
  },
  category_level: { label: 'Nível da bolsa' },
};
