import type { Schema } from '@/api/types';
import { AREA_COLORS } from '@/shared/lib/design-tokens';

export type SeriesPoint = Schema<'SeriesPoint'>;

export interface SeriesSummary {
  points: SeriesPoint[];
  total: number;
  peakYear: number | null;
  peakValue: number;
  minYear: number | null;
  maxYear: number | null;
  yearsCount: number;
}

/** Ordena os pontos por ano crescente e calcula os KPIs da série. */
export function computeSeriesSummary(
  data: readonly SeriesPoint[],
): SeriesSummary {
  const points = [...data].sort((a, b) => a.period - b.period);

  const first = points[0];
  const last = points[points.length - 1];

  if (!first || !last) {
    return {
      points: [],
      total: 0,
      peakYear: null,
      peakValue: 0,
      minYear: null,
      maxYear: null,
      yearsCount: 0,
    };
  }

  let total = 0;
  let peak = first;

  for (const point of points) {
    total += point.value;
    if (point.value > peak.value) {
      peak = point;
    }
  }

  return {
    points,
    total,
    peakYear: peak.period,
    peakValue: peak.value,
    minYear: first.period,
    maxYear: last.period,
    yearsCount: points.length,
  };
}

/** Opções de Grande Área derivadas do dicionário oficial do kit. */
export const AREA_FILTER_OPTIONS = Object.entries(AREA_COLORS).map(
  ([key, token]) => ({
    key,
    value: token.label,
    label: token.label,
    bg: token.bg,
  }),
);

export interface PendingLegacyIndicator {
  id: string;
  title: string;
  description: string;
  missingRoute: string;
}

/**
 * Indicadores presentes no legado (`legado-v1`) que não são séries de produção
 * e ainda aguardam rotas `/v2/metrics/*` dedicadas no backend.
 */
export const PENDING_LEGACY_INDICATORS: readonly PendingLegacyIndicator[] = [
  {
    id: 'busca_informacoes',
    title: 'Busca de informações',
    description:
      'Painel de métricas sobre termos e buscas realizadas na plataforma.',
    missingRoute: '/v2/metrics/search',
  },
  {
    id: 'programa_pos_graduacao',
    title: 'Programas de pós-graduação',
    description:
      'Indicadores agregados de programas de pós-graduação, conceitos e docentes.',
    missingRoute: '/v2/metrics/graduate-program',
  },
];
