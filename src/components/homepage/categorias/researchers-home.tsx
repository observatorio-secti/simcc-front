import { useContext, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../../../context/context';
import {
    useSearchResearchersInfinite,
    useOpenAlexResearchers,
    useResearcherFilterOptions,
    useResearcherMetrics,
} from '../../../hooks/use-researcher-search';
import { MariaHome } from '../maria-home';
import { useResearcherFilters } from './researchers-home/hooks/use-researcher-filters';
import { FiltersSidebar } from './researchers-home/filters/filters-sidebar';
import { FiltersSheet } from './researchers-home/filters/filters-sheet';
import { AppliedFiltersBadges } from './researchers-home/filters/applied-filters-badges';
import { ResearchersSummaryCards } from './researchers-home/summary/researchers-summary-cards';
import { ResearchersCloudSection } from './researchers-home/sections/researchers-cloud-section';
import { ResearchersListSection } from './researchers-home/sections/researchers-list-section';
import { ResearchersChartsSection } from './researchers-home/sections/researchers-charts-section';
import { ResearchersOpenAlexSection } from './researchers-home/sections/researchers-openalex-section';
import { ResultFiltersSlotContext } from '../result-filters-slot-context';
import { Research } from '../../../types/researcher';

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
        pesquisadoresSelecionados,
        idGraduateProgram,
    } = useContext(UserContext);
    const { slot: filtersSlot } = useContext(ResultFiltersSlotContext);

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

    // Adapta os autores retornados pelo OpenAlex para o formato de Research
    const openAlexResearchers: Research[] = useMemo(() => {
        if (!openAlexResults || !Array.isArray(openAlexResults)) return [];
        return openAlexResults.map((item) => ({
            among: 0,
            status: true,
            articles: Number(item.works_count) || 0,
            classe: '',
            cargo: '',
            rt: '',
            progressao: '',
            genero: '',
            entradanaufmg: '',
            book: 0,
            book_chapters: 0,
            id: item.id || '',
            name: item.display_name || '',
            university: '',
            lattes_id: '',
            area: '',
            lattes_10_id: '',
            abstract: '',
            city: '',
            orcid: item.orcid || '',
            image: '',
            graduation: '',
            patent: '',
            software: '',
            brand: '',
            lattes_update: new Date(),
            h_index: item.summary_stats?.h_index || '',
            relevance_score: item.relevance_score || '',
            works_count: item.works_count || '',
            cited_by_count: item.cited_by_count || '',
            i10_index: item.summary_stats?.i10_index || '',
            scopus: item.ids?.scopus || '',
            openalex: item.id || '',
            subsidy: [],
            graduate_programs: [],
            departments: [],
        }));
    }, [openAlexResults]);

    // Parâmetros para buscar opções dinâmicas em /researcher_filter
    const filterOptionsParams = useMemo(() => {
        const safeTerms = terms ?? '';
        let typeParam = 'ARTICLE';
        switch (searchType) {
            case 'article': typeParam = 'ARTICLE'; break;
            case 'book': typeParam = 'BOOK'; break;
            case 'speaker': typeParam = 'SPEAKER'; break;
            case 'patent': typeParam = 'PATENT'; break;
            case 'abstract': typeParam = 'ABSTRACT'; break;
            case 'area': typeParam = 'AREA'; break;
            case 'name': typeParam = 'NAME'; break;
            default: typeParam = 'ARTICLE';
        }

        const p: Record<string, any> = {};
        if (safeTerms) p.terms = safeTerms;
        if (typeParam) p.type = typeParam;
        if (idGraduateProgram && idGraduateProgram !== '0') {
            p.graduate_program_id = idGraduateProgram;
        }
        return p;
    }, [terms, searchType, idGraduateProgram]);

    const { data: apiFilterOptions } = useResearcherFilterOptions(filterOptionsParams);

    // Gerenciamento e aplicação de filtros nos pesquisadores carregados
    const filters = useResearcherFilters({
        researchers: allLoadedResearchers,
        apiFilters: apiFilterOptions,
    });

    // Parâmetros para calcular métricas consolidadas em /metrics/researcher/chart
    const metricsParams = useMemo(() => {
        const safeTerms = terms ?? '';
        let typeParam = 'ARTICLE';
        switch (searchType) {
            case 'article': typeParam = 'ARTICLE'; break;
            case 'book': typeParam = 'BOOK'; break;
            case 'speaker': typeParam = 'SPEAKER'; break;
            case 'patent': typeParam = 'PATENT'; break;
            case 'abstract': typeParam = 'ABSTRACT'; break;
            case 'area': typeParam = 'AREA'; break;
            case 'name': typeParam = 'NAME'; break;
            default: typeParam = 'ARTICLE';
        }

        const p: Record<string, any> = {
            terms: safeTerms,
            type: typeParam,
        };

        if (idGraduateProgram && idGraduateProgram !== '0') {
            p.graduate_program_id = idGraduateProgram;
        }
        if (filters.selectedIdentityTerritories.length > 0) {
            p.identity_territory = filters.selectedIdentityTerritories.join(';');
        }
        if (filters.selectedCities.length > 0) {
            p.city = filters.selectedCities.join(';');
        }
        if (filters.selectedUniversities.length > 0) {
            p.university = filters.selectedUniversities.join(';');
        }
        if (filters.selectedAreas.length > 0) {
            p.area = filters.selectedAreas.join(';');
        }
        if (filters.selectedGraduations.length > 0) {
            p.graduation = filters.selectedGraduations.join(';');
        }
        if (filters.selectedSubsidies.length > 0) {
            p.modality = filters.selectedSubsidies.join(';');
        }
        if (filters.selectedGraduatePrograms.length > 0) {
            p.graduate_program = filters.selectedGraduatePrograms.join(';');
        }
        return p;
    }, [
        terms,
        searchType,
        idGraduateProgram,
        filters.selectedIdentityTerritories,
        filters.selectedCities,
        filters.selectedUniversities,
        filters.selectedAreas,
        filters.selectedGraduations,
        filters.selectedSubsidies,
        filters.selectedGraduatePrograms,
    ]);

    const { data: metricsData, isLoading: loadingMetrics } = useResearcherMetrics(
        metricsParams,
        Boolean(terms && terms.trim().length > 0),
    );

    // Soma total de ocorrências local (fallback caso a rota de métricas não esteja disponível)
    const totalAmong = useMemo(() => {
        return filters.filteredResearchers.reduce(
            (sum, researcher) => sum + (researcher.among || 0),
            0,
        );
    }, [filters.filteredResearchers]);

    return (
        <div className="w-full h-full">
            <div className="w-full flex gap-4 justify-center items-start">
                {/* Sidebar retrátil no Desktop via slot portal */}
                {filtersSlot &&
                    createPortal(<FiltersSidebar filters={filters} />, filtersSlot)}

                <div className="flex-1 gap-4 flex flex-col">
                    {/* Badges de filtros ativos no topo */}
                    <AppliedFiltersBadges filters={filters} />

                    {/* Cards de estatísticas e ocorrências */}
                    {!isOpenAlex && finalOpenAlex !== 'true' && (
                        <ResearchersSummaryCards
                            totalResearchers={
                                metricsData?.researcher_count !== undefined
                                    ? metricsData.researcher_count
                                    : filters.filteredCount
                            }
                            totalAmong={
                                metricsData?.among !== undefined
                                    ? metricsData.among
                                    : totalAmong
                            }
                            searchType={searchType}
                            itemsSelecionados={itemsSelecionados}
                            loading={loadingMetrics || (loadingResearchers && !metricsData)}
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

                    {/* Gráficos de titulação e área */}
                    <ResearchersChartsSection
                        loading={loadingResearchers}
                        searchType={searchType}
                        researchers={filters.filteredResearchers}
                    />

                    {/* Resultados encontrados no OpenAlex */}
                    <ResearchersOpenAlexSection
                        researchers={openAlexResearchers}
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
