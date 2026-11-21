import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import graduateBackground from '@kit/assets/backgrounds/graduate.png';
import {
  Building2,
  GraduationCap,
  LayoutGrid,
  MapPin,
  Rows3,
  Search,
  Trash2,
} from 'lucide-react';
import {
  formatCapesRating,
  formatProgramArea,
  formatProgramLocation,
  formatProgramModality,
  resolveProgramAreaColor,
  type GraduateProgramSummary,
} from '@/entities/graduate-program/model';
import { graduateProgramListQueryOptions } from '@/entities/graduate-program/queries';
import { ProgramCard } from '@/entities/graduate-program/ui/program-card';
import { ProgramRef } from '@/entities/graduate-program/ui/program-ref';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import {
  FacetPanel,
  FacetSheet,
  FacetSidebar,
  type FacetFieldConfig,
  type FacetsMap,
} from '@/shared/ui/facet-panel';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { PillLink } from '@/shared/ui/pill-link';
import { ResultToolbar } from '@/shared/ui/result-toolbar';
import { SectionHeader } from '@/shared/ui/section-header';
import { SortSelect } from '@/shared/ui/sort-select';
import { StatCard } from '@/shared/ui/stat-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import {
  GRADUATE_PROGRAM_FACET_ORDER,
  GRADUATE_PROGRAM_SORT_OPTIONS,
  graduateProgramListSearch,
  toGraduateProgramQueryParams,
  type GraduateProgramListSearchState,
  type GraduateProgramViewMode,
} from './search';
import { TerritoryMap } from './territory-map';

const FACET_CONFIG: Record<string, FacetFieldConfig> = {
  area: {
    label: 'Área de avaliação',
    searchable: true,
    dotClassName: (value) => resolveProgramAreaColor(value).bg,
  },
  rating: {
    label: 'Conceito CAPES',
    formatItemLabel: (item) => formatCapesRating(item.label) ?? item.label,
  },
  modality: {
    label: 'Modalidade',
    formatItemLabel: (item) => formatProgramModality(item.label) ?? item.label,
  },
  institution: {
    label: 'Instituição',
    searchable: true,
  },
  city: {
    label: 'Município',
    searchable: true,
  },
  state: {
    label: 'UF',
  },
};

export interface GraduateProgramsPageProps {
  search: GraduateProgramListSearchState;
}

/**
 * Tela de Pós-graduação (Template B → C): landing com hero e mapa Leaflet
 * dos territórios de identidade + listagem filtrável, ordenável e paginada.
 */
export function GraduateProgramsPage({ search }: GraduateProgramsPageProps) {
  const navigate = useNavigate({ from: '/pos-graduacao/' });
  const [prevSearchQ, setPrevSearchQ] = useState(search.q);
  const [queryInput, setQueryInput] = useState(search.q ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(true);

  if (prevSearchQ !== search.q) {
    setPrevSearchQ(search.q);
    setQueryInput(search.q ?? '');
  }

  const listQuery = useQuery(
    graduateProgramListQueryOptions(toGraduateProgramQueryParams(search)),
  );
  const mapQuery = useQuery(graduateProgramListQueryOptions({ per_page: 100 }));

  function commitSearch(next: GraduateProgramListSearchState) {
    void navigate({
      search: graduateProgramListSearch.clean(next),
      replace: false,
    });
  }

  function handleQuerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = queryInput.trim();
    commitSearch(
      graduateProgramListSearch.update(search, {
        q: trimmed.length > 0 ? trimmed : undefined,
      }),
    );
  }

  function handleClearQuery() {
    setQueryInput('');
    commitSearch(
      graduateProgramListSearch.update(search, {
        q: undefined,
      }),
    );
  }

  function handleFilterChange(param: string, values: string[]) {
    commitSearch(
      graduateProgramListSearch.update(search, {
        [param]: values.length > 0 ? values : undefined,
      }),
    );
  }

  function handleClearFilters() {
    commitSearch(graduateProgramListSearch.clearFilters(search));
  }

  function handleClearAll() {
    setQueryInput('');
    commitSearch(
      graduateProgramListSearch.update(
        graduateProgramListSearch.clearFilters(search),
        { q: undefined },
      ),
    );
  }

  function handleSelectMapCities(cities: string[]) {
    commitSearch(
      graduateProgramListSearch.update(search, {
        city: cities.length > 0 ? cities : undefined,
      }),
    );
  }

  const viewMode: GraduateProgramViewMode = search.view ?? 'grid';
  const activeFiltersCount =
    graduateProgramListSearch.countActiveFilters(search);
  const hasAnyFilterOrQuery = activeFiltersCount > 0 || Boolean(search.q);

  const items = (listQuery.data?.data ?? []) as GraduateProgramSummary[];
  const pagination = listQuery.data?.pagination;
  const facets = (listQuery.data?.facets ?? undefined) as FacetsMap | undefined;
  const mapPrograms = (mapQuery.data?.data ??
    items) as GraduateProgramSummary[];

  const facetPanelProps = {
    facets,
    values: search as Record<string, unknown>,
    config: FACET_CONFIG,
    order: GRADUATE_PROGRAM_FACET_ORDER,
    defaultOpen: ['area', 'rating', 'modality'],
    loading: listQuery.isPending,
    onFilterChange: handleFilterChange,
    onClear: handleClearFilters,
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Template B: Landing com hero e mapa Leaflet dos territórios */}
      <section className="relative isolate flex flex-col gap-8 pt-2">
        <img
          src={graduateBackground}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-[62%] object-cover object-right-top opacity-25 lg:opacity-60 dark:opacity-10"
        />

        <div className="flex max-w-[800px] flex-col gap-4">
          <PillLink to="/pos-graduacao" hash="catalogo">
            Explore o catálogo de programas da Bahia
          </PillLink>

          <h1 className="text-3xl leading-tight font-bold tracking-tighter md:text-5xl lg:leading-[1.1]">
            Programas de{' '}
            <strong className="rounded-md bg-eng-blue px-3 py-0.5 font-medium text-white">
              pós-graduação
            </strong>
          </h1>

          <p className="max-w-[750px] text-lg font-light text-muted-foreground">
            Consulte mestrados e doutorados avaliados pela CAPES por
            instituição, área de avaliação, conceito e território de identidade.
          </p>
        </div>

        <Card className="gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">
                Distribuição por Território de Identidade
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Clique em um território ou município para filtrar o catálogo
            </p>
          </div>
          <TerritoryMap
            programs={mapPrograms}
            selectedCities={search.city ?? []}
            onSelectCities={handleSelectMapCities}
          />
        </Card>
      </section>

      {/* Template C: Catálogo / Listagem */}
      <section id="catalogo" className="flex flex-col gap-6">
        <SectionHeader icon={GraduationCap} title="Catálogo de programas" />

        <form
          onSubmit={handleQuerySubmit}
          role="search"
          aria-label="Buscar programas de pós-graduação"
          className="flex h-[52px] items-center gap-2 rounded-lg border bg-card px-4"
        >
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Pesquisar programas por nome ou sigla"
            aria-label="Pesquisar programas por nome ou sigla"
            className="h-full flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          {queryInput.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearQuery}
              aria-label="Limpar busca"
            >
              <Trash2 aria-hidden />
            </Button>
          )}
          <Button type="submit" size="sm">
            Buscar
          </Button>
        </form>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <FacetSidebar>
            <FacetPanel {...facetPanelProps} />
          </FacetSidebar>

          <FacetSheet
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            {...facetPanelProps}
          />

          <div className="flex min-w-0 flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Total de programas"
                value={pagination?.total_items}
                caption="encontrados na busca"
                icon={GraduationCap}
                loading={listQuery.isPending}
              />
              <StatCard
                title="Instituições"
                value={
                  facets?.institution?.total ??
                  facets?.institution?.items.length
                }
                caption="com oferta no recorte"
                icon={Building2}
                loading={listQuery.isPending}
              />
              <StatCard
                title="Municípios"
                value={facets?.city?.total ?? facets?.city?.items.length}
                caption="com programas no recorte"
                icon={MapPin}
                loading={listQuery.isPending}
              />
            </div>

            <ResultToolbar
              filtersCount={activeFiltersCount}
              onFiltersClick={() => setFiltersOpen(true)}
              open={resultsOpen}
              onOpenChange={setResultsOpen}
              controls="graduate-programs-results"
              actions={
                <div className="flex items-center gap-2">
                  <SortSelect
                    options={GRADUATE_PROGRAM_SORT_OPTIONS}
                    value={search.sort_by}
                    order={search.sort_order}
                    showOrderToggle
                    onChange={(next) =>
                      commitSearch(
                        graduateProgramListSearch.update(search, next),
                      )
                    }
                  />
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => {
                      if (value === 'grid' || value === 'table') {
                        commitSearch(
                          graduateProgramListSearch.update(
                            search,
                            { view: value === 'grid' ? undefined : value },
                            { resetPage: false },
                          ),
                        );
                      }
                    }}
                    aria-label="Modo de exibição dos programas"
                  >
                    <ToggleGroupItem value="grid" aria-label="Exibir em grade">
                      <LayoutGrid aria-hidden />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="table"
                      aria-label="Exibir em tabela"
                    >
                      <Rows3 aria-hidden />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">
                {pagination
                  ? `${pagination.total_items.toLocaleString('pt-BR')} ${pagination.total_items === 1 ? 'programa' : 'programas'}`
                  : 'Programas'}
              </p>
            </ResultToolbar>

            {resultsOpen && (
              <div
                id="graduate-programs-results"
                className="flex flex-col gap-4"
              >
                {listQuery.isPending ? (
                  <LoadingBlock />
                ) : listQuery.isError ? (
                  <Card className="p-6">
                    <EmptyState
                      icon={GraduationCap}
                      title="Não foi possível carregar os programas"
                      description="Ocorreu um erro ao consultar a API. Tente novamente em instantes."
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void listQuery.refetch()}
                        >
                          Tentar novamente
                        </Button>
                      }
                    />
                  </Card>
                ) : items.length === 0 ? (
                  <Card className="p-6">
                    <EmptyState
                      icon={GraduationCap}
                      title="Nenhum programa encontrado"
                      description={
                        hasAnyFilterOrQuery
                          ? 'Nenhum programa corresponde aos filtros aplicados. Limpe os filtros para ver todo o catálogo.'
                          : 'Nenhum programa de pós-graduação cadastrado no momento.'
                      }
                      action={
                        hasAnyFilterOrQuery ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearAll}
                          >
                            Limpar filtros
                          </Button>
                        ) : undefined
                      }
                    />
                  </Card>
                ) : viewMode === 'table' ? (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Programa</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Modalidade</TableHead>
                          <TableHead>Conceito</TableHead>
                          <TableHead>Localidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((program) => {
                          const areaLabel = formatProgramArea(program.area);
                          const areaColor = areaLabel
                            ? resolveProgramAreaColor(program.area)
                            : null;
                          const modalityLabel = formatProgramModality(
                            program.modality,
                          );
                          const capesLabel = formatCapesRating(program.rating);
                          const location = formatProgramLocation(
                            program.city,
                            program.state,
                          );

                          return (
                            <TableRow key={program.id}>
                              <TableCell>
                                <ProgramRef program={program} showAcronym />
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {areaLabel && areaColor ? (
                                  <span className="inline-flex items-center gap-2">
                                    <Dot className={areaColor.bg} />
                                    <span>{areaLabel}</span>
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                              <TableCell>
                                {modalityLabel ? (
                                  <Badge variant="outline" size="sm">
                                    {modalityLabel}
                                  </Badge>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                              <TableCell>
                                {capesLabel ? (
                                  <Tag variant="brand">{capesLabel}</Tag>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {location ?? '—'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </div>
                )}

                {pagination && items.length > 0 && (
                  <Pagination
                    pagination={pagination}
                    onPageChange={(page) =>
                      commitSearch(
                        graduateProgramListSearch.update(
                          search,
                          { page },
                          { resetPage: false },
                        ),
                      )
                    }
                    onPerPageChange={(per_page) =>
                      commitSearch(
                        graduateProgramListSearch.update(search, { per_page }),
                      )
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
