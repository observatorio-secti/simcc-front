import {
  lazy,
  ReactNode,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import {
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  Code,
  Copyright,
  Download,
  Loader2,
  MapIcon,
  MoreHorizontal,
  SlidersHorizontal,
  Ticket,
  Users,
} from 'lucide-react';
import { File, Plus, UserList } from 'phosphor-react';
import { toast } from 'sonner';
import { UserContext } from '../../../context/context';
import { useIsMobile } from '../../../hooks/use-mobile';
import {
  PROFILE_PAGE_SIZE,
  useResearcherMapFacets,
  useResearcherProfileSearch,
} from '../../../hooks/use-researcher-profile-search';
import { ResultTypeConfig } from '../../../lib/search-types';
import { ProductionKindV2 } from '../../../types/production-v2';
import { SortByV2 } from '../../../types/researcher-v2';
import { useModal } from '../../hooks/use-modal-store';
import { Search } from '../../search/search';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import { Alert } from '../../ui/alert';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { HeaderResultTypeHome } from '../categorias/header-result-type-home';
import { exportProfileSearchCsv } from '../categorias/researchers-profile-home/export-profile-csv';
import { AppliedFacetsBadges } from '../categorias/researchers-profile-home/facets/applied-facets-badges';
import {
  facetFilterParams,
  facetsToRequest,
} from '../categorias/researchers-profile-home/facets/facet-registry';
import { FacetSections } from '../categorias/researchers-profile-home/facets/facet-sections';
import {
  EXPANDED_FACET_LIMIT,
  useProfileSearchState,
} from '../categorias/researchers-profile-home/hooks/use-profile-search-state';
import { ProfileResearcherCard } from '../categorias/researchers-profile-home/profile-researcher-card';
import { ProfileSummaryCards } from '../categorias/researchers-profile-home/profile-summary-cards';
import { MariaHome } from '../maria-home';
import {
  ResultFiltersSheet,
  ResultFiltersSidebar,
} from '../result-filters-shell';
import { exportProductionCsv } from './export-production-csv';
import { InstitutionsTab } from './institutions-tab';
import { ProductionList } from './production-list';
import {
  PRODUCTION_FILTER_PARAMS,
  useProductionParams,
} from './use-production-params';

// Leaflet e GeoJSON só são carregados quando a aba do mapa é aberta.
const ProfileTerritoryMap = lazy(() =>
  import('../categorias/researchers-profile-home/profile-territory-map').then(
    (module) => ({ default: module.ProfileTerritoryMap }),
  ),
);

// O card mostra só o total e a contagem por tipo; basta 1 item de evidência.
const MATCHES_LIMIT = 1;

// Mesmos identificadores de aba da página antiga, para os links existentes
// (`?tab=articles-home`) continuarem válidos.
const RESEARCHERS_TAB = 'researchers-home';
const INSTITUTIONS_TAB = 'institutions-home';
const MAP_TAB = 'mapa-home';

const PRODUCTION_ICONS: Record<ProductionKindV2, typeof BookOpen> = {
  article: File as unknown as typeof BookOpen,
  book: BookOpen,
  'book-chapter': BookOpen,
  software: Code,
  patent: Copyright,
  event: Ticket,
};

const tabClass = (active: boolean) =>
  `text-base rounded-md px-4 ${
    active
      ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white'
      : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
  }`;
const version = false;

// No máximo quatro pesquisadores por linha.
const masonryBreakpoints = { 350: 2, 900: 3, 1200: 4 };

interface ResultHomeV2Props {
  config: ResultTypeConfig;
}

// Resultados de uma busca por tipo (artigos, livros, patentes...) na API v2:
// pesquisadores com produção do tipo (/v2/researcher com `source_type`) e as
// próprias produções (/v2/production/*), sob os mesmos filtros da URL.
export function ResultHomeV2({ config }: ResultHomeV2Props) {
  const { itemsSelecionados, mode } = useContext(UserContext);
  const { onOpen: onOpenModal } = useModal();
  const state = useProfileSearchState();
  const productionParams = useProductionParams(state);
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOn, setIsOn] = useState(true);
  const [exporting, setExporting] = useState(false);

  const hasTerms = state.terms.trim().length > 0;
  const productionTab = config.productionTab;

  // O mapa, como na busca antiga, não é exibido no celular.
  const tabs = [
    RESEARCHERS_TAB,
    productionTab?.id,
    INSTITUTIONS_TAB,
    isMobile ? undefined : MAP_TAB,
  ];
  const tabParam = searchParams.get('tab');
  const tab = tabParam && tabs.includes(tabParam) ? tabParam : RESEARCHERS_TAB;

  const setTab = (value: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === RESEARCHERS_TAB) next.delete('tab');
        else next.set('tab', value);
        return next;
      },
      { replace: true },
    );

  const clearFilters = () =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        [...facetFilterParams(), ...PRODUCTION_FILTER_PARAMS].forEach((param) =>
          next.delete(param),
        );
        return next;
      },
      { replace: true },
    );

  const filters = useMemo(
    () => ({ ...state.filters, source_type: config.sourceTypes }),
    [state.filters, config.sourceTypes],
  );

  // O facet de tipos de produção conta todos os tipos, não só o da busca:
  // aqui o tipo já está fixado, então ele não é pedido.
  const listFacets = facetsToRequest(state.hasQuery, 'list').filter(
    (facet) => facet !== 'source_type',
  );

  const baseParams = {
    q: state.q,
    filters,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  };

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    fetchNextPage,
    hasNextPage,
  } = useResearcherProfileSearch(
    {
      ...baseParams,
      perPage: PROFILE_PAGE_SIZE,
      facets: listFacets,
      facetLimit: state.facetLimit,
      includeMatches: state.hasQuery,
      matchesLimit: MATCHES_LIMIT,
    },
    hasTerms,
  );

  const {
    data: mapFacets,
    isLoading: mapLoading,
    isError: mapError,
  } = useResearcherMapFacets(
    {
      q: state.q,
      filters,
      facets: facetsToRequest(state.hasQuery, 'map'),
      facetLimit: EXPANDED_FACET_LIMIT,
    },
    hasTerms,
  );

  // A aba de instituições pede o facet com o limite máximo, só quando aberta.
  const {
    data: institutionFacets,
    isLoading: institutionsLoading,
    isError: institutionsError,
  } = useResearcherMapFacets(
    {
      q: state.q,
      filters,
      facets: ['institution'],
      facetLimit: EXPANDED_FACET_LIMIT,
    },
    hasTerms && tab === INSTITUTIONS_TAB,
  );

  const { toggleMulti } = state;
  const toggleTerritory = useCallback(
    (value: string) => toggleMulti('identity_territory', value),
    [toggleMulti],
  );
  const toggleCity = useCallback(
    (value: string) => toggleMulti('city_id', value),
    [toggleMulti],
  );
  const toggleInstitution = useCallback(
    (value: string) => toggleMulti('institution_id', value),
    [toggleMulti],
  );

  const firstPage = data?.pages[0];
  const facets = firstPage?.facets;
  // Badges de filtros aplicados precisam dos rótulos de todos os facets.
  const allFacets = useMemo(
    () => ({ ...facets, ...mapFacets }),
    [facets, mapFacets],
  );
  const totalResearchers = firstPage?.pagination.total_items;
  const researchers = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  // Troca de filtros: o resultado anterior segue na tela, esmaecido, até a resposta chegar.
  const refreshing = isFetching && !isFetchingNextPage && isPlaceholderData;

  const onProductionTab = Boolean(productionTab && tab === productionTab.id);

  // Exporta o que a aba aberta lista: as produções ou os pesquisadores.
  const handleExport = async () => {
    setExporting(true);
    try {
      if (productionTab && onProductionTab) {
        for (const kind of productionTab.kinds) {
          const { exported, total } = await exportProductionCsv(
            kind,
            productionParams.paramsFor(kind),
          );
          if (exported < total) {
            toast('Exportação parcial', {
              description: `O arquivo traz os primeiros ${exported.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')} resultados.`,
            });
          }
        }
      } else {
        await exportProfileSearchCsv(baseParams);
      }
    } catch (error) {
      console.error(error);
      toast('Não foi possível baixar o resultado', {
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setExporting(false);
    }
  };

  // Expõe a altura do cabeçalho fixo para o layout (barra de filtros e mapa).
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = stickyHeaderRef.current;
    const root = rootRef.current;
    if (!header || !root) return;
    const update = () =>
      root.style.setProperty('--sticky-header-h', `${header.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, [hasTerms]);

  const facetSections = (
    <FacetSections facets={facets} state={state} loading={isLoading} />
  );

  const tabButton = (id: string, label: string, icon: ReactNode) => (
    <Button
      variant="ghost"
      className={tabClass(tab === id)}
      onClick={() => setTab(id)}
    >
      {icon}
      {label}
    </Button>
  );

  const ProductionTabIcon = productionTab
    ? PRODUCTION_ICONS[productionTab.kinds[0]]
    : null;

  return (
    <div ref={rootRef} className="min-h-full w-full flex flex-col">
      <Helmet>
        <title>
          {hasTerms
            ? `Pesquisa: ${itemsSelecionados.map((item) => item.term).join(' ')}`
            : 'Pesquisa'}{' '}
          | {version ? 'Conectee' : 'Simcc'}
        </title>
        <meta
          name="description"
          content={`Pesquisa | ${version ? 'Conectee' : 'Simcc'}`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="flex w-full">
        {hasTerms && (
          <ResultFiltersSidebar onClear={clearFilters}>
            {facetSections}
          </ResultFiltersSidebar>
        )}

        <div className="flex-1 min-w-0">
          {hasTerms ? (
            <>
              <div
                ref={stickyHeaderRef}
                className="top-[68px] h-fit sticky z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur"
              >
                <div className="w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800">
                  {isOn && (
                    <div className="w-full pt-4 flex justify-between items-center">
                      <Search />
                    </div>
                  )}
                  <div className="flex w-full flex-wrap gap-4 py-2 justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {tabButton(
                        RESEARCHERS_TAB,
                        'Pesquisadores',
                        <Users className="h-4 w-4" />,
                      )}
                      {productionTab &&
                        ProductionTabIcon &&
                        tabButton(
                          productionTab.id,
                          productionTab.label,
                          <ProductionTabIcon className="h-4 w-4" />,
                        )}
                      {tabButton(
                        INSTITUTIONS_TAB,
                        'Instituições',
                        <Building2 className="h-4 w-4" />,
                      )}
                      {!isMobile &&
                        tabButton(
                          MAP_TAB,
                          'Mapa',
                          <MapIcon className="h-4 w-4" />,
                        )}
                    </div>

                    <div className="hidden xl:flex xl:flex-nowrap gap-2">
                      <Button
                        onClick={handleExport}
                        variant="ghost"
                        disabled={exporting}
                        aria-busy={exporting}
                      >
                        {exporting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        {exporting ? 'Gerando arquivo…' : 'Baixar resultado'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOn(!isOn)}
                      >
                        {isOn ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="block xl:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={handleExport}
                            disabled={exporting}
                            className="gap-2"
                          >
                            <Download size={16} />
                            {exporting
                              ? 'Gerando arquivo…'
                              : 'Baixar resultado'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onOpenModal('filters')}
                            className="gap-2 lg:hidden"
                          >
                            <SlidersHorizontal size={16} />
                            Filtros
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 h-full flex flex-col gap-4 pb-16">
                <AppliedFacetsBadges facets={allFacets} state={state} />

                {productionTab && onProductionTab ? (
                  <div className="flex flex-col gap-4 pt-4">
                    {productionParams.hasResearcherOnlyFilters && (
                      <Alert className="p-4 text-sm text-muted-foreground">
                        Os filtros de território e cidade valem só para os
                        pesquisadores e não restringem esta lista.
                      </Alert>
                    )}
                    {productionTab.kinds.map((kind) => {
                      const Icon = PRODUCTION_ICONS[kind];
                      return (
                        <ProductionList
                          key={kind}
                          kind={kind}
                          params={productionParams}
                          hasQuery={state.hasQuery}
                          icon={<Icon size={24} className="text-gray-400" />}
                        />
                      );
                    })}
                  </div>
                ) : tab === INSTITUTIONS_TAB ? (
                  <InstitutionsTab
                    facet={institutionFacets?.institution}
                    loading={institutionsLoading}
                    error={institutionsError}
                    selected={state.getMulti('institution_id')}
                    onToggle={toggleInstitution}
                  />
                ) : tab === MAP_TAB ? (
                  <div className="flex flex-col gap-4 pt-4">
                    <HeaderResultTypeHome
                      title="Pesquisadores por território de identidade"
                      icon={<MapIcon size={24} className="text-gray-400" />}
                    />
                    {mapError ? (
                      <Alert className="p-6 text-sm">
                        Não foi possível carregar os dados de território e
                        cidade da API.
                      </Alert>
                    ) : (
                      <Suspense
                        fallback={
                          <Skeleton className="rounded-md w-full h-[400px]" />
                        }
                      >
                        <ProfileTerritoryMap
                          territoryFacet={mapFacets?.identity_territory}
                          cityFacet={mapFacets?.city}
                          onToggleTerritory={toggleTerritory}
                          onToggleCity={toggleCity}
                        />
                      </Suspense>
                    )}
                  </div>
                ) : (
                  <>
                    <ProfileSummaryCards
                      totalResearchers={totalResearchers}
                      facets={facets}
                      mapFacets={mapFacets}
                      mapLoading={mapLoading}
                      mapError={mapError}
                      terms={itemsSelecionados}
                      loading={isLoading}
                      caption={config.caption}
                      termClassName={config.color}
                    />

                    {mode !== '' && <MariaHome />}

                    <Accordion defaultValue="item-1" type="single" collapsible>
                      <AccordionItem value="item-1">
                        <div className="flex mb-2">
                          <HeaderResultTypeHome
                            title="Pesquisadores"
                            icon={
                              <UserList size={24} className="text-gray-400" />
                            }
                          >
                            <div className="mr-3">
                              <Select
                                value={state.sortBy}
                                onValueChange={(value) =>
                                  state.setSortBy(value as SortByV2)
                                }
                              >
                                <SelectTrigger className="w-[180px] h-9">
                                  <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                  {state.hasQuery && (
                                    <SelectItem value="relevance">
                                      Mais relevantes
                                    </SelectItem>
                                  )}
                                  <SelectItem value="name">
                                    Nome (A–Z)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </HeaderResultTypeHome>
                          <AccordionTrigger />
                        </div>
                        <AccordionContent>
                          {isError ? (
                            <Alert className="p-6 text-sm">
                              Não foi possível carregar os pesquisadores. Tente
                              novamente em instantes.
                            </Alert>
                          ) : isLoading ? (
                            <ResponsiveMasonry
                              columnsCountBreakPoints={masonryBreakpoints}
                            >
                              <Masonry gutter="16px">
                                {Array.from({ length: 12 }, (_, index) => (
                                  <Skeleton
                                    key={index}
                                    className="w-full rounded-md h-[360px]"
                                  />
                                ))}
                              </Masonry>
                            </ResponsiveMasonry>
                          ) : researchers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                              <p className="text-6xl text-eng-blue font-bold">
                                ._.
                              </p>
                              <p className="font-medium">
                                Nenhum pesquisador encontrado.
                              </p>
                              {state.hasActiveFilters && (
                                <Button
                                  variant="outline"
                                  onClick={clearFilters}
                                >
                                  Limpar filtros
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`transition-opacity ${refreshing ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              <ResponsiveMasonry
                                columnsCountBreakPoints={masonryBreakpoints}
                              >
                                <Masonry gutter="16px">
                                  {researchers.map((researcher) => (
                                    <ProfileResearcherCard
                                      key={researcher.researcher_id}
                                      researcher={researcher}
                                    />
                                  ))}
                                </Masonry>
                              </ResponsiveMasonry>

                              <div className="w-full flex flex-col items-center gap-3 mt-8">
                                <p className="text-xs text-muted-foreground">
                                  Exibindo{' '}
                                  {researchers.length.toLocaleString('pt-BR')}{' '}
                                  de{' '}
                                  {(totalResearchers ?? 0).toLocaleString(
                                    'pt-BR',
                                  )}{' '}
                                  pesquisadores
                                </p>
                                {hasNextPage && (
                                  <Button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="gap-2"
                                  >
                                    {isFetchingNextPage ? (
                                      <>
                                        <Loader2
                                          size={16}
                                          className="animate-spin"
                                        />
                                        Carregando mais...
                                      </>
                                    ) : (
                                      <>
                                        <Plus size={16} />
                                        Mostrar mais
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                )}
              </div>

              <ResultFiltersSheet
                onClear={clearFilters}
                onApply={() => undefined}
                filteredCount={totalResearchers ?? 0}
              >
                {facetSections}
              </ResultFiltersSheet>
            </>
          ) : (
            <div className="h-[calc(100vh-134px)] flex flex-col md:p-8 p-4 md:pt-4">
              <Search />
              <div className="w-full flex flex-col items-center justify-center h-full">
                <p className="text-9xl text-eng-blue font-bold mb-16 animate-pulse">
                  ^_^
                </p>
                <p className="font-medium text-lg text-center">
                  Experimente pesquisar um tema e veja o que a plataforma pode
                  filtrar para você.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
