import {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  MapIcon,
  MoreHorizontal,
  SlidersHorizontal,
  UserSearch,
} from 'lucide-react';
import { Plus, UserList } from 'phosphor-react';
import { toast } from 'sonner';
import { UserContext } from '../../../../context/context';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { useModal } from '../../../hooks/use-modal-store';
import {
  useResearcherMapFacets,
  useResearcherProfileSearch,
  PROFILE_PAGE_SIZE,
} from '../../../../hooks/use-researcher-profile-search';
import { Search } from '../../../search/search';
import { Alert } from '../../../ui/alert';
import { Button } from '../../../ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Skeleton } from '../../../ui/skeleton';
import {
  ResultFiltersSheet,
  ResultFiltersSidebar,
} from '../../result-filters-shell';
import { HeaderResultTypeHome } from '../header-result-type-home';
import { SortByV2 } from '../../../../types/researcher-v2';
import { facetsToRequest } from './facets/facet-registry';
import { FacetSections } from './facets/facet-sections';
import { AppliedFacetsBadges } from './facets/applied-facets-badges';
import {
  EXPANDED_FACET_LIMIT,
  useProfileSearchState,
} from './hooks/use-profile-search-state';
import { ProfileResearcherCard } from './profile-researcher-card';
import { ProfileSummaryCards } from './profile-summary-cards';
import { exportProfileSearchCsv } from './export-profile-csv';

// Leaflet e GeoJSON só são carregados quando a página de perfil é aberta.
const ProfileTerritoryMap = lazy(() =>
  import('./profile-territory-map').then((module) => ({
    default: module.ProfileTerritoryMap,
  })),
);

// O card mostra só o total e a contagem por tipo; basta 1 item de evidência.
const MATCHES_LIMIT = 1;

const tabClass = (active: boolean) =>
  `text-base rounded-md px-4 ${
    active
      ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white'
      : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
  }`;
const version = false;

// No máximo quatro pesquisadores por linha.
const masonryBreakpoints = { 350: 2, 900: 3, 1200: 4 };

export function ResearchersProfileHome() {
  const { itemsSelecionados } = useContext(UserContext);
  const { onOpen: onOpenModal } = useModal();
  const state = useProfileSearchState();
  const isMobile = useIsMobile();
  // O mapa, como na busca antiga, não é exibido no celular.
  const view = isMobile ? 'pesquisadores' : state.view;

  const [isOn, setIsOn] = useState(true);
  const [exporting, setExporting] = useState(false);

  const hasTerms = state.terms.trim().length > 0;

  const baseParams = {
    q: state.q,
    filters: state.filters,
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
      facets: facetsToRequest(state.hasQuery, 'list'),
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
      filters: state.filters,
      facets: facetsToRequest(state.hasQuery, 'map'),
      facetLimit: EXPANDED_FACET_LIMIT,
    },
    hasTerms,
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

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportProfileSearchCsv(baseParams);
    } catch (error) {
      console.error(error);
      toast('Não foi possível baixar o resultado', {
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setExporting(false);
    }
  };

  // Mesma técnica do ResultHome: expõe a altura do cabeçalho fixo para o layout.
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

  return (
    <div ref={rootRef} className="min-h-full w-full flex flex-col">
      <Helmet>
        <title>
          {hasTerms
            ? `Perfil: ${itemsSelecionados.map((item) => item.term).join(' ')}`
            : 'Pesquisa por perfil'}{' '}
          | {version ? 'Conectee' : 'Simcc'}
        </title>
        <meta
          name="description"
          content="Pesquisa por perfil completo do pesquisador"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="flex w-full">
        {hasTerms && (
          <ResultFiltersSidebar onClear={state.clearFilters}>
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        className={tabClass(view === 'pesquisadores')}
                        onClick={() => state.setView('pesquisadores')}
                      >
                        <UserSearch className="h-4 w-4" />
                        Pesquisadores por perfil
                      </Button>
                      {!isMobile && (
                        <Button
                          variant="ghost"
                          className={tabClass(view === 'mapa')}
                          onClick={() => state.setView('mapa')}
                        >
                          <MapIcon className="h-4 w-4" />
                          Mapa
                        </Button>
                      )}
                    </div>

                    <div className="hidden xl:flex xl:flex-nowrap gap-2">
                      <Button
                        onClick={handleExport}
                        variant="ghost"
                        disabled={exporting}
                      >
                        {exporting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        Baixar resultado
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
                        <DropdownMenuTrigger>
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
                            Baixar resultado
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

                {view === 'mapa' ? (
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
                    />

                    <Accordion defaultValue="item-1" type="single" collapsible>
                      <AccordionItem value="item-1">
                        <div className="flex mb-2">
                          <HeaderResultTypeHome
                            title="Pesquisadores por perfil"
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
                                  onClick={state.clearFilters}
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
                onClear={state.clearFilters}
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
                  Pesquise um tema e encontre pesquisadores em todo o perfil:
                  artigos, livros, patentes, softwares e mais.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
