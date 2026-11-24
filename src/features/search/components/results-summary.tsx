import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import researcherBackground from '@kit/assets/backgrounds/researcher.png';
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  HandCoins,
  Layers,
  MapPin,
  Newspaper,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { FacetItem, FacetResult } from '@/api/types';
import type { ProductionMetricPoint } from '@/entities/production/metric-queries';
import {
  peakMetricPoint,
  sumMetricSince,
} from '@/entities/production/metric-queries';
import type { ProductionKind } from '@/entities/production/model';
import { formatCountNoun } from '@/entities/production/model';
import { getProductionDefinition } from '@/entities/production/registry';
import { scholarshipModalityKey } from '@/entities/scholarship/model';
import { cn } from '@/shared/lib/cn';
import {
  QUALIS_STATUS_COLORS,
  qualisStatusKey,
  SCHOLARSHIP_COLORS,
} from '@/shared/lib/design-tokens';
import { Dot, Tag } from '@/shared/ui/badge';
import { StatCard } from '@/shared/ui/stat-card';
import { sourceTypeLabel } from '../results-facets';
import { searchTypeBgClass, type SearchType } from '../search-schema';

type FacetsRecord = Record<string, FacetResult> | null | undefined;

type ValuedFacetItem = FacetItem & { value: string };

/**
 * Itens com valor. O `value` nulo só aparece no grupo "sem território" da
 * faceta `territory_city`, que este resumo não usa.
 */
function valuedItems(
  items: readonly FacetItem[] | undefined,
): ValuedFacetItem[] {
  return (items ?? []).filter(
    (item): item is ValuedFacetItem => item.value !== null,
  );
}

const QUERY_CAPTIONS: Record<SearchType, string> = {
  profile: 'em todo o perfil de',
  // `search_in` da v2 (V4.1): a busca fica só no nome ou só no resumo.
  name: 'com o nome contendo',
  abstract: 'com o resumo contendo',
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
  /** Mostra o atalho "Ver no mapa" no card de territórios (fora da visão mapa). */
  showMapLink?: boolean;
}

/** Card de total + 3 KPIs da aba de pesquisadores (template D). */
export function ResearcherSummary({
  q,
  type,
  total,
  facets,
  loading,
  showMapLink = false,
}: ResearcherSummaryProps) {
  const sourceTypes = valuedItems(facets?.source_type?.items);

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
        >
          {showMapLink && (
            <Link
              from="/busca"
              to="."
              search={(prev) => ({ ...prev, view: 'map' as const })}
              resetScroll={false}
              className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
            >
              Ver no mapa
            </Link>
          )}
        </StatCard>
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

/**
 * Itens da faceta dentro do recorte. As facetas da v2 ignoram o próprio
 * filtro (mostram as outras opções): com filtro, valem só as selecionadas.
 */
function facetItemsInScope(
  facets: FacetsRecord,
  key: string,
  selected: readonly string[] | undefined,
) {
  const items = valuedItems(facets?.[key]?.items);
  if (!selected?.length) return items;
  const chosen = new Set(selected);
  return items.filter((item) => chosen.has(item.value));
}

function sumCounts(items: readonly { count: number }[]): number {
  return items.reduce((total, item) => total + item.count, 0);
}

export interface ScholarshipSummaryProps {
  total: number | undefined;
  facets: FacetsRecord;
  loading: boolean;
  /** Filtro `modality` aplicado (a faceta não se filtra a si mesma). */
  modality?: readonly string[];
}

/** Card de total + 3 KPIs da aba de bolsistas (`/v2/scholarship`, D1.4). */
export function ScholarshipSummary({
  total,
  facets,
  loading,
  modality,
}: ScholarshipSummaryProps) {
  const items = facetItemsInScope(facets, 'modality', modality);
  const ready = !loading && facets?.modality !== undefined;
  const byKey = (key: 'PQ' | 'DT') =>
    ready
      ? sumCounts(
          items.filter((item) => scholarshipModalityKey(item.value) === key),
        )
      : undefined;

  return (
    <>
      <TotalCard
        title="Total de bolsas"
        icon={HandCoins}
        value={total}
        loading={loading}
        caption="de pesquisadores cadastrados na plataforma"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {(['PQ', 'DT'] as const).map((key) => (
          <StatCard
            key={key}
            title={SCHOLARSHIP_COLORS[key].label}
            icon={HandCoins}
            value={byKey(key)}
            loading={loading}
            caption={
              <span className="inline-flex items-center gap-1.5">
                <Dot className={SCHOLARSHIP_COLORS[key].bg} />
                bolsas {key} no resultado
              </span>
            }
          />
        ))}
        <StatCard
          title="Modalidades"
          icon={Layers}
          value={ready ? items.length : undefined}
          loading={loading}
          caption="modalidades e níveis no resultado"
        />
      </div>
    </>
  );
}

const QUALIS_A = new Set(['A1', 'A2', 'A3', 'A4']);

export interface MagazineSummaryProps {
  total: number | undefined;
  facets: FacetsRecord;
  loading: boolean;
  /** Filtro `qualis` aplicado (a faceta não se filtra a si mesma). */
  qualis?: readonly string[];
}

/** Card de total + 3 KPIs da aba de revistas (`/v2/magazine`, D1.4). */
export function MagazineSummary({
  total,
  facets,
  loading,
  qualis,
}: MagazineSummaryProps) {
  const items = facetItemsInScope(facets, 'qualis', qualis);
  const ready = !loading && facets?.qualis !== undefined;
  // A faceta traz também os motivos de ausência (`not_rated`,
  // `not_applicable`), que não contam como estrato.
  const strata = items.filter((item) => !qualisStatusKey(item.value));
  const rated = ready ? sumCounts(strata) : undefined;
  const stratumA = ready
    ? sumCounts(strata.filter((item) => QUALIS_A.has(item.value)))
    : undefined;
  const unrated =
    rated !== undefined && total !== undefined
      ? Math.max(0, total - rated)
      : undefined;

  return (
    <>
      <TotalCard
        title="Total de revistas"
        icon={Newspaper}
        value={total}
        loading={loading}
        caption="cadastradas na plataforma"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Com Qualis"
          icon={CheckCircle2}
          value={rated}
          loading={loading}
          caption="revistas com estrato no resultado"
        />
        <StatCard
          title="Qualis A1 a A4"
          icon={CheckCircle2}
          value={stratumA}
          loading={loading}
          caption="revistas nos estratos A no resultado"
        />
        <StatCard
          title={QUALIS_STATUS_COLORS.not_rated.label}
          icon={Newspaper}
          value={unrated}
          loading={loading}
          caption={
            <span className="inline-flex items-center gap-1.5">
              <Dot className={QUALIS_STATUS_COLORS.not_rated.bg} />
              revistas sem estrato no resultado
            </span>
          }
        />
      </div>
    </>
  );
}
