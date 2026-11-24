import { normalizeProductionKind } from '@/entities/production/model';
import { getProductionDefinition } from '@/entities/production/registry';
import { scholarshipModalityColor } from '@/entities/scholarship/model';
import {
  areaColor,
  areaKey,
  qualisFacetColor,
  qualisStatusKey,
} from '@/shared/lib/design-tokens';
import { titleCaseLabel } from '@/shared/lib/format';
import type { FacetFieldConfig } from '@/shared/ui/facet-panel';

/** Rótulo do `source_type` de `/v2/researcher` (faceta e tags do total). */
export function sourceTypeLabel(value: string): string {
  if (value === 'area_specialty') return 'Áreas de especialidade';
  const kind = normalizeProductionKind(value);
  return kind ? getProductionDefinition(kind).title : value;
}

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
    // Estratos e motivos de ausência (`not_rated` → "Sem estrato").
    dotClassName: (value) => qualisFacetColor(value).bg,
    formatItemLabel: (item) =>
      qualisStatusKey(item.value)
        ? qualisFacetColor(item.value).label
        : item.label,
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
