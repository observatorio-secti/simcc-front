import type { ReactNode } from 'react';
import researcherBackground from '@kit/assets/backgrounds/researcher.png';
import {
  BarChart3,
  Building2,
  Calendar,
  GraduationCap,
  MapPin,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { FacetResult } from '@/api/types';
import type { ProductionMetricPoint } from '@/entities/production/metric-queries';
import {
  peakMetricPoint,
  sumMetricSince,
} from '@/entities/production/metric-queries';
import type { ProductionKind } from '@/entities/production/model';
import { formatCountNoun } from '@/entities/production/model';
import { getProductionDefinition } from '@/entities/production/registry';
import { cn } from '@/shared/lib/cn';
import { Tag } from '@/shared/ui/badge';
import { StatCard } from '@/shared/ui/stat-card';
import { sourceTypeLabel } from '../results-facets';
import { searchTypeBgClass, type SearchType } from '../search-schema';

type FacetsRecord = Record<string, FacetResult> | null | undefined;

const QUERY_CAPTIONS: Record<SearchType, string> = {
  profile: 'em todo o perfil de',
  // A v2 não restringe a busca ao nome ou ao resumo: o recorte é o perfil.
  name: 'em todo o perfil de',
  abstract: 'em todo o perfil de',
  article: 'com artigos relacionados a',
  book: 'com livros ou capítulos relacionados a',
  patent: 'com patentes relacionadas a',
  software: 'com softwares relacionados a',
  speaker: 'com participações em eventos relacionadas a',
  area: 'com áreas de especialidade relacionadas a',
};

const CATALOG_CAPTIONS: Record<SearchType, string> = {
  profile: 'cadastrados na plataforma',
  name: 'cadastrados na plataforma',
  abstract: 'cadastrados na plataforma',
  article: 'com artigos na plataforma',
  book: 'com livros ou capítulos na plataforma',
  patent: 'com patentes na plataforma',
  software: 'com softwares na plataforma',
  speaker: 'com participações em eventos na plataforma',
  area: 'com áreas de especialidade na plataforma',
};

function TermChip({ term, type }: { term: string; type: SearchType }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 max-w-full items-center rounded-md px-2.5 text-xs font-medium text-white capitalize',
        searchTypeBgClass(type),
      )}
    >
      <span className="truncate">{term}</span>
    </span>
  );
}

function TotalCard({
  title,
  icon,
  value,
  loading,
  caption,
  children,
}: {
  title: string;
  icon: LucideIcon;
  value: number | undefined;
  loading: boolean;
  caption: ReactNode;
  children?: ReactNode;
}) {
  return (
    <StatCard
      title={title}
      icon={icon}
      value={value}
      loading={loading}
      caption={caption}
      className="relative isolate overflow-hidden"
    >
      <img
        src={researcherBackground}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-[55%] object-cover object-right-top opacity-20 sm:opacity-60 dark:opacity-10 dark:invert"
      />
      {children}
    </StatCard>
  );
}

function facetTotal(facets: FacetsRecord, key: string): number | undefined {
  const facet = facets?.[key];
  if (!facet) return undefined;
  return facet.total ?? facet.items.length;
}

export interface ResearcherSummaryProps {
  q?: string;
  type: SearchType;
  total: number | undefined;
  facets: FacetsRecord;
  loading: boolean;
}

/** Card de total + 3 KPIs da aba de pesquisadores (template D). */
export function ResearcherSummary({
  q,
  type,
  total,
  facets,
  loading,
}: ResearcherSummaryProps) {
  const sourceTypes = facets?.source_type?.items ?? [];

  return (
    <>
      <TotalCard
        title="Total de pesquisadores"
        icon={User}
        value={total}
        loading={loading}
        caption={
          q ? (
            <span className="flex flex-wrap items-center gap-2">
              {QUERY_CAPTIONS[type]} <TermChip term={q} type={type} />
            </span>
          ) : (
            CATALOG_CAPTIONS[type]
          )
        }
      >
        {q && sourceTypes.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">Tipos de produção</p>
            <div className="flex flex-wrap gap-2">
              {sourceTypes.map((item) => (
                <Tag key={item.value}>
                  {sourceTypeLabel(item.value)}{' '}
                  <b className="tabular-nums">
                    {item.count.toLocaleString('pt-BR')}
                  </b>
                </Tag>
              ))}
            </div>
          </div>
        )}
      </TotalCard>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Instituições"
          icon={Building2}
          value={facetTotal(facets, 'institution')}
          loading={loading}
          caption="com pesquisadores no resultado"
        />
        <StatCard
          title="Programas de pós-graduação"
          icon={GraduationCap}
          value={facetTotal(facets, 'graduate_program')}
          loading={loading}
          caption="com pesquisadores no resultado"
        />
        <StatCard
          title="Territórios de identidade"
          icon={MapPin}
          value={facetTotal(facets, 'identity_territory')}
          loading={loading}
          caption="com pesquisadores no resultado"
        />
      </div>
    </>
  );
}

export interface ProductionSummaryProps {
  q?: string;
  type: SearchType;
  kind: ProductionKind;
  total: number | undefined;
  facets: FacetsRecord;
  loading: boolean;
  metric: readonly ProductionMetricPoint[] | undefined;
  metricLoading: boolean;
  /** Ano corrente (injetável nos testes). */
  currentYear?: number;
}

const RECENT_YEARS = 5;

/** Card de total + 3 KPIs de uma aba de produção (série de `/v2/metrics`). */
export function ProductionSummary({
  q,
  type,
  kind,
  total,
  facets,
  loading,
  metric,
  metricLoading,
  currentYear = new Date().getFullYear(),
}: ProductionSummaryProps) {
  const definition = getProductionDefinition(kind);
  const [, plural] = definition.noun;
  const points = metric ?? [];
  const peak = peakMetricPoint(points);
  const since = currentYear - (RECENT_YEARS - 1);
  const recent = metric ? sumMetricSince(points, since) : undefined;

  return (
    <>
      <TotalCard
        title={`Total de ${plural}`}
        icon={definition.icon}
        value={total}
        loading={loading}
        caption={
          q ? (
            <span className="flex flex-wrap items-center gap-2">
              na busca por <TermChip term={q} type={type} />
            </span>
          ) : (
            'cadastrados na plataforma'
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Instituições"
          icon={Building2}
          value={facetTotal(facets, 'institution')}
          loading={loading}
          caption="com autores no resultado"
        />
        <StatCard
          title="Ano com mais produções"
          icon={BarChart3}
          value={peak ? String(peak.period) : metric ? '—' : undefined}
          loading={metricLoading}
          caption={
            peak
              ? `${formatCountNoun(peak.value, definition.noun)} no ano`
              : 'sem série no recorte'
          }
        />
        <StatCard
          title={`Últimos ${RECENT_YEARS} anos`}
          icon={Calendar}
          value={recent}
          loading={metricLoading}
          caption={`${plural} de ${since} a ${currentYear}`}
        />
      </div>
    </>
  );
}
