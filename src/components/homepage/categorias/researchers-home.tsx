import { useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../../../context/context';
import { useSearchResearchersInfinite, useOpenAlexResearchers } from '../../../hooks/use-researcher-search';
import { MariaHome } from '../maria-home';
import { useResearcherFilters } from './researchers-home/hooks/use-researcher-filters';
import { useResearcherCityMap } from './researchers-home/hooks/use-researcher-city-map';
import { FiltersSidebar } from './researchers-home/filters/filters-sidebar';
import { FiltersSheet } from './researchers-home/filters/filters-sheet';
import { AppliedFiltersBadges } from './researchers-home/filters/applied-filters-badges';
import { ResearchersSummaryCards } from './researchers-home/summary/researchers-summary-cards';
import { ResearchersCloudSection } from './researchers-home/sections/researchers-cloud-section';
import { ResearchersListSection } from './researchers-home/sections/researchers-list-section';
import { ResearchersMapSection } from './researchers-home/sections/researchers-map-section';
import { ResearchersChartsSection } from './researchers-home/sections/researchers-charts-section';
import { ResearchersOpenAlexSection } from './researchers-home/sections/researchers-openalex-section';

// Re-exporta tipos para manter total compatibilidade com arquivos legados
export type {
  Research,
  Departments,
  Bolsistas,
  GraduatePrograms,
  ResearchOpenAlex,
  CityData,
} from '../../../types/researcher';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export function ResearchersHome() {
  const {
    itemsSelecionados,
    searchType,
    simcc,
    pesquisadoresSelecionados,
    idGraduateProgram,
  } = useContext(UserContext);

  const queryUrl = useQuery();
  const terms = queryUrl.get('terms') || '';
  const openAlexState = queryUrl.get('open_alex');
  const finalOpenAlex = openAlexState || '';

  // Persiste a seleção de pesquisadores no localStorage
  useEffect(() => {
    localStorage.setItem(
      'pesquisadoresSelecionados',
      JSON.stringify(pesquisadoresSelecionados),
    );
  }, [pesquisadoresSelecionados]);

  // Consulta paginada via TanStack Query (100 itens por página)
  const {
    data,
    isLoading: loadingResearchers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchResearchersInfinite({
    searchType,
    terms,
    idGraduateProgram: idGraduateProgram === '0' ? '' : idGraduateProgram,
  });

  // Lista agregada de todas as páginas carregadas sob demanda
  const allLoadedResearchers = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

  // Fallback para OpenAlex caso a busca padrão retorne vazio e open_alex esteja ativo
  const shouldQueryOpenAlex =
    !loadingResearchers &&
    allLoadedResearchers.length === 0 &&
    finalOpenAlex === 'true';

  const { data: openAlexResults, isLoading: loadingOpenAlex } =
    useOpenAlexResearchers(terms, shouldQueryOpenAlex);

  const isOpenAlex = Array.isArray(openAlexResults) && openAlexResults.length > 0;

  // Gerenciamento e aplicação de filtros nos pesquisadores carregados
  const filters = useResearcherFilters({
    researchers: allLoadedResearchers,
  });

  // Agregação espacial para visualização no mapa
  const cityData = useResearcherCityMap(filters.filteredResearchers);

  // Soma total de ocorrências
  const totalAmong = useMemo(() => {
    return filters.filteredResearchers.reduce(
      (sum, researcher) => sum + (researcher.among || 0),
      0,
    );
  }, [filters.filteredResearchers]);

  return (
    <div className="w-full h-full">
      <div className="w-full flex gap-4 justify-center items-start">
        {/* Sidebar retrátil no Desktop */}
        <FiltersSidebar filters={filters} />

        <div className="flex-1 gap-4 flex flex-col">
          {/* Badges de filtros ativos no topo */}
          <AppliedFiltersBadges filters={filters} />

          {/* Cards de estatísticas e ocorrências */}
          {!isOpenAlex && finalOpenAlex !== 'true' && (
            <ResearchersSummaryCards
              totalResearchers={filters.filteredCount}
              totalAmong={totalAmong}
              searchType={searchType}
              itemsSelecionados={itemsSelecionados}
            />
          )}

          {/* Assistente IA Maria */}
          <MariaHome />

          {/* Nuvem de palavras com pesquisadores mais frequentes */}
          <ResearchersCloudSection
            researchers={filters.filteredResearchers}
            loading={loadingResearchers}
            searchType={searchType}
          />

          {/* Listagem detalhada (Grade / Tabela) com botão 'Mostrar mais' sob demanda */}
          {!isOpenAlex && finalOpenAlex !== 'true' && (
            <ResearchersListSection
              researchers={filters.filteredResearchers}
              loading={loadingResearchers}
              onLoadMore={() => fetchNextPage()}
              hasMore={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}

          {/* Visualização de pesquisadores no mapa */}
          <ResearchersMapSection
            cityData={cityData}
            loading={loadingResearchers}
            searchType={searchType}
            simcc={simcc}
          />

          {/* Gráficos de titulação e área */}
          <ResearchersChartsSection
            loading={loadingResearchers}
            searchType={searchType}
          />

          {/* Resultados encontrados no OpenAlex */}
          <ResearchersOpenAlexSection
            researchers={filters.filteredResearchers}
            loading={loadingOpenAlex}
            isOpenAlex={isOpenAlex}
            finalOpenAlex={finalOpenAlex}
          />
        </div>

        {/* Drawer Sheet para Mobile */}
        <FiltersSheet filters={filters} />
      </div>
    </div>
  );
}
