import { lazy, Suspense, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { magazineListQueryOptions } from '@/entities/magazine/queries';
import {
  defaultMetricGroupBy,
  productionMetricQueryOptions,
} from '@/entities/production/metric-queries';
import type { ProductionKind } from '@/entities/production/model';
import { productionListQueryOptions } from '@/entities/production/queries';
import { patentGrantSeries } from '@/entities/production/ui/production-year-chart-data';
import {
  MultiKindYearChart,
  ProductionYearChart,
} from '@/entities/production/ui/production-year-charts';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import { scholarshipListQueryOptions } from '@/entities/scholarship/queries';
import { splitTerritoryFacet, toggleCode } from '@/entities/territory/model';
import {
  FacetPanel,
  FacetSheet,
  FacetSidebar,
  type FacetsMap,
} from '@/shared/ui/facet-panel';
import { ResultToolbar } from '@/shared/ui/result-toolbar';
import { Skeleton } from '@/shared/ui/skeleton';
import type { SortSelection } from '@/shared/ui/sort-select';
import {
  MagazineResults,
  ScholarshipResults,
} from './components/catalog-results';
import { ProductionResults } from './components/production-results';
import { ResearcherRanking } from './components/researcher-ranking';
import { ResearcherResults } from './components/researcher-results';
import { ResultsTabs } from './components/results-tabs';
import {
  MagazineSummary,
  ProductionSummary,
  ResearcherSummary,
  ScholarshipSummary,
} from './components/results-summary';
import { RESULTS_FACET_CONFIG } from './results-facets';
import {
  activeTab,
  applyQuery,
  countTabFilters,
  isMapView,
  resolveSort,
  RESULTS_FACET_ORDER,
  resultsSearch,
  sortOptionsForTab,
  toMagazineQuery,
  toProductionMetricQuery,
  toProductionQuery,
  toResearcherMapQuery,
  toResearcherQuery,
  toResearcherRankingQuery,
  toScholarshipQuery,
  toggleQualisFilter,
  type ResultsSearch,
  type ResultsViewMode,
} from './results-search';
import { SearchBar } from './search-bar';
import { productionChartTitle, tabsForSearchType } from './search-tabs';

export interface SearchResultsPageProps {
  search: ResultsSearch;
  /** Abre o perfil como overlay (quem monta a rota decide a navegação). */
  onOpenResearcher: (id: string) => void;
  /** Abre a produção como overlay (T13; quem monta a rota decide a navegação). */
  onOpenProduction: (kind: ProductionKind, id: string) => void;
}

const TerritoryMap = lazy(
  () => import('@/entities/territory/ui/territory-map'),
);

const MAP_NOUN = ['pesquisador', 'pesquisadores'] as const;

// Sem aba de produção ativa, as queries de produção ficam desligadas; o tipo
// abaixo só satisfaz a assinatura.
const IDLE_KIND: ProductionKind = 'article';

/**
 * Resultados da busca (T2, template D de `DESIGN.md`): filtros por faceta,
 * busca fixa, tabs de visão por tipo, total com KPIs, ranking e lista paginada.
 * Sem termo (`q`), lista o catálogo da aba.
 */
export function SearchResultsPage({
  search,
  onOpenResearcher,
  onOpenProduction,
}: SearchResultsPageProps) {
  const navigate = useNavigate({ from: '/busca' });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const type = search.type ?? 'profile';
  const tab = activeTab(search);
  const hasQuery = Boolean(search.q);
  // Sem termo, as abas são os catálogos da v2 (listagens, D1.4 / ADR 0011).
  const tabs = tabsForSearchType(type, hasQuery);
  const sort = resolveSort(tab, search);
  const sortOptions = sortOptionsForTab(tab, hasQuery);
  const view: ResultsViewMode = search.view ?? 'grid';

  const isResearcherTab = tab.source === 'researcher';
  const isProductionTab = tab.source === 'production';
  const productionKind = tab.source === 'production' ? tab.kind : IDLE_KIND;

  const researcherQuery = useQuery({
    ...researcherListQueryOptions(toResearcherQuery(search)),
    enabled: isResearcherTab,
    placeholderData: keepPreviousData,
  });

  const showMap = isMapView(search);
  const mapQuery = useQuery({
    ...researcherListQueryOptions(toResearcherMapQuery(search)),
    enabled: showMap,
    placeholderData: keepPreviousData,
  });

  const rankingFromList = sort.sort_by === 'matches' && search.page === 1;
  const rankingQuery = useQuery({
    ...researcherListQueryOptions(toResearcherRankingQuery(search)),
    enabled: isResearcherTab && hasQuery && !rankingFromList && !showMap,
  });

  const productionQuery = useQuery({
    ...productionListQueryOptions(
      productionKind,
      toProductionQuery(productionKind, search),
    ),
    enabled: isProductionTab,
    // Mantém a página anterior só dentro do mesmo tipo de produção.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === productionKind ? previous : undefined,
  });

  const metricQuery = useQuery({
    ...productionMetricQueryOptions(
      productionKind,
      toProductionMetricQuery(productionKind, search),
    ),
    enabled: isProductionTab,
  });

  const scholarshipQuery = useQuery({
    ...scholarshipListQueryOptions(toScholarshipQuery(search)),
    enabled: tab.source === 'scholarship',
    placeholderData: keepPreviousData,
  });

  const magazineQuery = useQuery({
    ...magazineListQueryOptions(toMagazineQuery(search)),
    enabled: tab.source === 'magazine',
    placeholderData: keepPreviousData,
  });

  const listQuery = {
    researcher: researcherQuery,
    production: productionQuery,
    scholarship: scholarshipQuery,
    magazine: magazineQuery,
  }[tab.source];
  // `territory_city` só vem na query do mapa, mas nunca vai ao painel.
  const facets = splitTerritoryFacet(listQuery.data?.facets).rest ?? null;
  const activeFiltersCount = countTabFilters(search, tab);

  function commit(next: ResultsSearch) {
    void navigate({ search: () => next, resetScroll: false });
  }

  function update(
    patch: Partial<ResultsSearch> | Record<string, unknown>,
    options?: { resetPage?: boolean },
  ) {
    commit(resultsSearch.update(search, patch, options));
  }

  function handleToggleTerritory(code: string) {
    update({ identity_territory: toggleCode(search.identity_territory, code) });
  }

  function handleToggleCity(ibge: string) {
    update({ city_code: toggleCode(search.city_code, ibge) });
  }

  function handleClearMap() {
    update({ identity_territory: undefined, city_code: undefined });
  }

  function handleSortChange(next: SortSelection) {
    update({
      sort_by: next.sort_by as ResultsSearch['sort_by'],
      sort_order: next.sort_order,
    });
  }

  function handleClearFilters() {
    commit(resultsSearch.clearFilters(search));
  }

  function handleClearQuery() {
    commit(applyQuery(search, { q: undefined }));
  }

  const facetPanelProps = {
    facets: (facets ?? undefined) as FacetsMap | undefined,
    values: search as Record<string, unknown>,
    config: RESULTS_FACET_CONFIG,
    order: RESULTS_FACET_ORDER,
    loading: listQuery.isPending,
    onSearchChange: (patch: Record<string, string[] | number | undefined>) =>
      update(patch),
    onClear: handleClearFilters,
  };

  const listCallbacks = {
    onRetry: () => void listQuery.refetch(),
    onSortChange: handleSortChange,
    onPageChange: (page: number) => update({ page }, { resetPage: false }),
    onPerPageChange: (per_page: number) => update({ per_page }),
    onClearFilters: handleClearFilters,
    onClearQuery: handleClearQuery,
    onOpenResearcher,
  };

  const rankingResearchers = rankingFromList
    ? (researcherQuery.data?.data ?? []).slice(0, 10)
    : (rankingQuery.data?.data ?? []);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <FacetSidebar>
        <FacetPanel {...facetPanelProps} />
      </FacetSidebar>
      <FacetSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        {...facetPanelProps}
      />

      <div className="flex min-w-0 flex-col gap-5">
        <div className="z-[2] -mt-3 flex flex-col gap-3 bg-neutral-50/85 pt-3 pb-2 backdrop-blur md:sticky md:top-[68px] dark:bg-neutral-900/85">
          <h1 className="sr-only">
            {search.q ? `Resultados para ${search.q}` : 'Busca'}
          </h1>
          <SearchBar
            compact
            initialQuery={search.q ?? ''}
            initialType={type}
            onSearchSubmit={({ q, type: nextType }) =>
              commit(applyQuery(search, { q, type: nextType }))
            }
            onTypeChange={(nextType) =>
              commit(applyQuery(search, { q: search.q, type: nextType }))
            }
            onClear={handleClearQuery}
          />
          <ResultToolbar
            className="flex-nowrap"
            filtersCount={activeFiltersCount}
            onFiltersClick={() => setFiltersOpen(true)}
          >
            <ResultsTabs search={search} tabs={tabs} active={tab} />
          </ResultToolbar>
        </div>

        {tab.source === 'researcher' ? (
          <>
            <ResearcherSummary
              q={search.q}
              type={type}
              total={researcherQuery.data?.pagination.total_items}
              facets={researcherQuery.data?.facets}
              loading={researcherQuery.isPending}
              showMapLink={!showMap}
            />
            {hasQuery && !showMap && (
              <ResearcherRanking
                researchers={rankingResearchers}
                type={type}
                loading={
                  rankingFromList
                    ? researcherQuery.isPending
                    : rankingQuery.isPending
                }
                onOpenResearcher={onOpenResearcher}
              />
            )}
            <ResearcherResults
              {...listCallbacks}
              researchers={researcherQuery.data?.data}
              pagination={researcherQuery.data?.pagination}
              isPending={researcherQuery.isPending}
              isFetching={researcherQuery.isFetching}
              isError={researcherQuery.isError}
              q={search.q}
              type={type}
              view={view}
              sort={sort}
              sortOptions={sortOptions}
              hasFilters={activeFiltersCount > 0}
              onViewChange={(nextView) =>
                update(
                  { view: nextView === 'grid' ? undefined : nextView },
                  { resetPage: false },
                )
              }
              map={
                <Suspense
                  fallback={
                    <Skeleton className="h-[380px] w-full rounded-lg" />
                  }
                >
                  <TerritoryMap
                    facet={
                      splitTerritoryFacet(mapQuery.data?.facets).territoryCity
                    }
                    loading={mapQuery.isFetching}
                    selectedTerritories={search.identity_territory}
                    selectedCities={search.city_code}
                    onToggleTerritory={handleToggleTerritory}
                    onToggleCity={handleToggleCity}
                    onClear={handleClearMap}
                    noun={MAP_NOUN}
                    listTitle="Territórios com pesquisadores"
                  />
                </Suspense>
              }
            />
          </>
        ) : tab.source === 'scholarship' ? (
          <>
            <ScholarshipSummary
              total={scholarshipQuery.data?.pagination.total_items}
              facets={scholarshipQuery.data?.facets}
              loading={scholarshipQuery.isPending}
              modality={search.modality}
            />
            <ScholarshipResults
              {...listCallbacks}
              items={scholarshipQuery.data?.data}
              pagination={scholarshipQuery.data?.pagination}
              isPending={scholarshipQuery.isPending}
              isFetching={scholarshipQuery.isFetching}
              isError={scholarshipQuery.isError}
              sort={sort}
              sortOptions={sortOptions}
              hasFilters={activeFiltersCount > 0}
            />
          </>
        ) : tab.source === 'magazine' ? (
          <>
            <MagazineSummary
              total={magazineQuery.data?.pagination.total_items}
              facets={magazineQuery.data?.facets}
              loading={magazineQuery.isPending}
              qualis={search.qualis}
            />
            <MagazineResults
              {...listCallbacks}
              items={magazineQuery.data?.data}
              pagination={magazineQuery.data?.pagination}
              isPending={magazineQuery.isPending}
              isFetching={magazineQuery.isFetching}
              isError={magazineQuery.isError}
              sort={sort}
              sortOptions={sortOptions}
              hasFilters={activeFiltersCount > 0}
            />
          </>
        ) : (
          <>
            <ProductionSummary
              q={search.q}
              type={type}
              kind={tab.kind}
              total={productionQuery.data?.pagination.total_items}
              facets={productionQuery.data?.facets}
              loading={productionQuery.isPending}
              metric={metricQuery.data?.data}
              metricLoading={metricQuery.isPending}
            />
            {tab.kind === 'patent' ? (
              <MultiKindYearChart
                title={productionChartTitle(tab.kind)}
                query={toProductionMetricQuery(tab.kind, search)}
                kinds={patentGrantSeries()}
              />
            ) : (
              <ProductionYearChart
                title={productionChartTitle(tab.kind)}
                kind={tab.kind}
                groupBy={defaultMetricGroupBy(tab.kind)}
                metric={metricQuery.data?.data}
                isLoading={metricQuery.isPending}
                {...(tab.kind === 'article'
                  ? {
                      selectedKeys: search.qualis,
                      onToggleKey: (stratum: string) =>
                        update(toggleQualisFilter(search, stratum)),
                    }
                  : {})}
              />
            )}
            <ProductionResults
              {...listCallbacks}
              onOpenProduction={onOpenProduction}
              kind={tab.kind}
              items={productionQuery.data?.data}
              pagination={productionQuery.data?.pagination}
              isPending={productionQuery.isPending}
              isFetching={productionQuery.isFetching}
              isError={productionQuery.isError}
              q={search.q}
              sort={sort}
              sortOptions={sortOptions}
              hasFilters={activeFiltersCount > 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
