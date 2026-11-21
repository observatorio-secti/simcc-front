import { useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  ChevronLeft,
  FlaskConical,
  LayoutGrid,
  List,
  MapPin,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import { isApiError } from '@/api/errors';
import {
  formatGroupLeaders,
  formatGroupLocation,
  formatGroupStatus,
  formatLinesLabel,
  formatMembersLabel,
  resolveGroupArea,
  type ResearchGroup,
} from '@/entities/research-group/model';
import { researchGroupAllQueryOptions } from '@/entities/research-group/queries';
import { ResearchGroupCard } from '@/entities/research-group/ui/research-group-card';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { FacetPanel, FacetSheet } from '@/shared/ui/facet-panel';
import { focusRing } from '@/shared/ui/focus-ring';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { ResultToolbar } from '@/shared/ui/result-toolbar';
import { SectionHeader } from '@/shared/ui/section-header';
import { SortSelect, type SortOption } from '@/shared/ui/sort-select';
import { StatCard } from '@/shared/ui/stat-card';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import {
  buildGroupFacets,
  computeGroupStats,
  filterAndSortGroups,
  getGroupFacetDotClass,
  type GroupFacetDistributionItem,
} from './filter-groups';
import {
  researchGroupsSearch,
  type GroupSortField,
  type GroupViewMode,
  type ResearchGroupsSearch,
} from './search';

const SORT_OPTIONS: readonly SortOption<GroupSortField>[] = [
  { value: 'name', label: 'Nome', defaultOrder: 'asc' },
  { value: 'members', label: 'Membros', defaultOrder: 'desc' },
  { value: 'lines', label: 'Linhas de pesquisa', defaultOrder: 'desc' },
  { value: 'year', label: 'Ano de formação', defaultOrder: 'desc' },
];

const PER_PAGE_OPTIONS = [12, 24, 48, 96] as const;

const FACET_CONFIG = {
  area: { label: 'Áreas do conhecimento', searchable: true },
  institution: { label: 'Instituições', searchable: true },
  status: { label: 'Situação cadastral' },
  state: { label: 'UF' },
};

const FACET_ORDER = ['area', 'institution', 'status', 'state'] as const;

function DistributionCard({
  title,
  items,
  total,
}: {
  title: string;
  items: readonly GroupFacetDistributionItem[];
  total: number;
}) {
  const maxCount = items[0]?.count ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum dado disponível para o recorte atual.
          </p>
        ) : (
          items.map((item) => {
            const widthPercent =
              maxCount > 0 ? Math.max(6, (item.count / maxCount) * 100) : 0;
            const share =
              total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {item.count.toLocaleString('pt-BR')} ({share}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      item.colorClass,
                    )}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function ResearchGroupListRow({ group }: { group: ResearchGroup }) {
  const resolvedArea = resolveGroupArea(group);
  const leadersText = formatGroupLeaders(group.leaders);
  const institutionText =
    group.institutionLabel || group.institutionAcronym || null;
  const locationText = formatGroupLocation(group.address);
  const status = formatGroupStatus(group.status);

  return (
    <Card className="relative transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            data-slot="entity-icon"
            className="grid size-11 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground"
          >
            <FlaskConical className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {resolvedArea &&
                (!resolvedArea.matched || resolvedArea.color.light ? (
                  <Badge variant="outline" size="sm" className="uppercase">
                    <Dot className={resolvedArea.color.bg} />
                    <span className="truncate">{resolvedArea.label}</span>
                  </Badge>
                ) : (
                  <Badge
                    size="sm"
                    className={cn(resolvedArea.color.bg, 'uppercase')}
                  >
                    <span className="truncate">{resolvedArea.label}</span>
                  </Badge>
                ))}
              {status && (
                <Badge
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Dot
                    className={
                      status.isActive ? 'bg-status-done' : 'bg-status-ongoing'
                    }
                  />
                  {status.label}
                </Badge>
              )}
            </div>

            <h3 className="mt-1.5 text-sm font-semibold text-foreground">
              <Link
                to="/grupos-pesquisa/$id"
                params={{ id: group.id }}
                className={cn(
                  'rounded-sm after:absolute after:inset-0 hover:text-eng-blue',
                  focusRing,
                )}
              >
                {group.name}
              </Link>
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {institutionText && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{institutionText}</span>
                </span>
              )}
              {leadersText && (
                <span className="inline-flex items-center gap-1">
                  <User className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{leadersText}</span>
                </span>
              )}
              {locationText && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  {locationText}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-muted-foreground tabular-nums sm:flex-col sm:items-end sm:gap-1">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3 shrink-0" aria-hidden />
            {formatMembersLabel(group.memberCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3 shrink-0" aria-hidden />
            {formatLinesLabel(group.researchLineCount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/** Tela de listagem de grupos de pesquisa (Template C, dados da ODA). */
export function ResearchGroupsPage() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate({ from: '/grupos-pesquisa/' });
  const search = useSearch({ from: '/_public/grupos-pesquisa/' });

  const [draftOverride, setDraftOverride] = useState<{
    base: string | undefined;
    value: string;
  } | null>(null);
  const queryDraft =
    draftOverride && draftOverride.base === search.q
      ? draftOverride.value
      : (search.q ?? '');
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);
  const [listOpen, setListOpen] = useState(true);

  const groupsQuery = useQuery(researchGroupAllQueryOptions());

  const allGroups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const filteredGroups = useMemo(
    () => filterAndSortGroups(allGroups, search),
    [allGroups, search],
  );
  const facets = useMemo(
    () => buildGroupFacets(allGroups, search),
    [allGroups, search],
  );
  const stats = useMemo(
    () => computeGroupStats(filteredGroups),
    [filteredGroups],
  );

  const totalItems = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / search.per_page));
  const currentPage = Math.min(search.page, totalPages);
  const pageStart = (currentPage - 1) * search.per_page;
  const pagedGroups = filteredGroups.slice(
    pageStart,
    pageStart + search.per_page,
  );

  const viewMode: GroupViewMode = search.view ?? 'grid';
  const activeFiltersCount = researchGroupsSearch.countActiveFilters(search);
  const hasActiveCriteria = activeFiltersCount > 0 || Boolean(search.q);

  function updateSearch(
    patch: Partial<ResearchGroupsSearch> | Record<string, unknown>,
    options?: { resetPage?: boolean },
  ) {
    const next = researchGroupsSearch.update(search, patch, options);
    void navigate({
      search: () => next,
      replace: false,
    });
  }

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/' });
  }

  function handleQuerySubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = queryDraft.trim();
    updateSearch({ q: trimmed || undefined });
  }

  function handleClearQuery() {
    setDraftOverride(null);
    updateSearch({ q: undefined });
  }

  function handleClearAll() {
    setDraftOverride(null);
    const cleared = researchGroupsSearch.clearFilters(search);
    const next = researchGroupsSearch.update(cleared, { q: undefined });
    void navigate({ search: () => next });
  }

  const errorMessage = groupsQuery.isError
    ? isApiError(groupsQuery.error)
      ? groupsQuery.error.message
      : 'Não foi possível carregar os grupos de pesquisa da ODA.'
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page header (Template C) */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shrink-0"
          onClick={handleBack}
          aria-label="Voltar"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <h1 className="flex-1 text-xl font-semibold tracking-tight">
          Grupos de pesquisa
        </h1>
      </div>

      {/* 2. Campo de busca de lista */}
      <form
        onSubmit={handleQuerySubmit}
        role="search"
        aria-label="Buscar grupos de pesquisa"
        className="flex h-[52px] items-center gap-3 rounded-lg border bg-card px-4"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={queryDraft}
          onChange={(event) =>
            setDraftOverride({ base: search.q, value: event.target.value })
          }
          placeholder="Pesquisar por nome, líder, área, linha de pesquisa ou instituição..."
          aria-label="Pesquisar grupos de pesquisa"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
        />
        {queryDraft && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={handleClearQuery}
            aria-label="Limpar busca"
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
        <Button type="submit" size="sm">
          Buscar
        </Button>
      </form>

      {/* 3. Toolbar */}
      <ResultToolbar
        filtersCount={activeFiltersCount}
        onFiltersClick={() => setFiltersSheetOpen(true)}
        actions={
          <div className="flex items-center gap-2">
            <SortSelect
              options={SORT_OPTIONS}
              value={search.sort_by}
              order={search.sort_order}
              showOrderToggle
              onChange={(next) =>
                updateSearch({
                  sort_by: next.sort_by,
                  sort_order: next.sort_order,
                })
              }
            />
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value === 'grid' || value === 'list') {
                  updateSearch(
                    { view: value === 'grid' ? undefined : value },
                    { resetPage: false },
                  );
                }
              }}
              aria-label="Modo de exibição"
            >
              <ToggleGroupItem value="grid" aria-label="Exibir em grade">
                <LayoutGrid className="size-4" aria-hidden />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Exibir em lista">
                <List className="size-4" aria-hidden />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        }
      >
        {hasActiveCriteria && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
          >
            Limpar filtros
          </Button>
        )}
      </ResultToolbar>

      {/* Erro de carregamento */}
      {errorMessage && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            <span>{errorMessage}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void groupsQuery.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* 4. KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Grupos de pesquisa"
          value={stats.totalGroups}
          caption="encontrados na listagem"
          icon={FlaskConical}
          loading={groupsQuery.isLoading}
        />
        <StatCard
          title="Instituições"
          value={stats.totalInstitutions}
          caption="instituições representadas"
          icon={Building2}
          loading={groupsQuery.isLoading}
        />
        <StatCard
          title="Membros"
          value={stats.totalMembers}
          caption="participantes nos grupos"
          icon={Users}
          loading={groupsQuery.isLoading}
        />
        <StatCard
          title="Linhas de pesquisa"
          value={stats.totalLines}
          caption="linhas cadastradas"
          icon={BookOpen}
          loading={groupsQuery.isLoading}
        />
      </div>

      {/* Layout principal: filtros (desktop) + conteúdo */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="hidden w-[260px] shrink-0 lg:block">
          <FacetPanel
            facets={facets}
            values={search}
            config={FACET_CONFIG}
            order={FACET_ORDER}
            defaultOpen={['area', 'institution']}
            getDotClassName={getGroupFacetDotClass}
            loading={groupsQuery.isLoading}
            onSearchChange={(patch) => updateSearch(patch)}
            onClear={handleClearAll}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* 5. Distribuição (seção colapsável) */}
          {!groupsQuery.isLoading && !groupsQuery.isError && totalItems > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeader
                title="Distribuição dos grupos"
                icon={BarChart3}
                open={statsOpen}
                onOpenChange={setStatsOpen}
                controls="grupos-distribuicao"
              />
              {statsOpen && (
                <div
                  id="grupos-distribuicao"
                  className="grid gap-4 md:grid-cols-2"
                >
                  <DistributionCard
                    title="Principais áreas do conhecimento"
                    items={stats.byArea}
                    total={stats.totalGroups}
                  />
                  <DistributionCard
                    title="Principais instituições"
                    items={stats.byInstitution}
                    total={stats.totalGroups}
                  />
                </div>
              )}
            </section>
          )}

          {/* 6. Listagem principal (seção colapsável) */}
          <section className="flex flex-col gap-4">
            <SectionHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <span>Grupos encontrados</span>
                  {!groupsQuery.isLoading && (
                    <Tag>{totalItems.toLocaleString('pt-BR')}</Tag>
                  )}
                </span>
              }
              icon={FlaskConical}
              open={listOpen}
              onOpenChange={setListOpen}
              controls="grupos-lista"
            />

            {listOpen && (
              <div id="grupos-lista" className="flex flex-col gap-4">
                {groupsQuery.isLoading ? (
                  <LoadingBlock />
                ) : pagedGroups.length === 0 ? (
                  <EmptyState
                    title="Nenhum grupo de pesquisa encontrado"
                    description={
                      hasActiveCriteria
                        ? 'Tente ajustar os termos de busca ou remover alguns filtros.'
                        : 'Nenhum grupo de pesquisa foi retornado pela API ODA.'
                    }
                    action={
                      hasActiveCriteria ? (
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
                ) : viewMode === 'grid' ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {pagedGroups.map((group) => (
                      <ResearchGroupCard key={group.id} group={group} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pagedGroups.map((group) => (
                      <ResearchGroupListRow key={group.id} group={group} />
                    ))}
                  </div>
                )}

                {totalItems > 0 && (
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    perPage={search.per_page}
                    perPageOptions={PER_PAGE_OPTIONS}
                    onPageChange={(page) =>
                      updateSearch({ page }, { resetPage: false })
                    }
                    onPerPageChange={(per_page) => updateSearch({ per_page })}
                    hideOnSinglePage={false}
                  />
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Sheet de filtros no mobile */}
      <FacetSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        facets={facets}
        values={search}
        config={FACET_CONFIG}
        order={FACET_ORDER}
        defaultOpen={['area', 'institution']}
        getDotClassName={getGroupFacetDotClass}
        loading={groupsQuery.isLoading}
        onSearchChange={(patch) => updateSearch(patch)}
        onClear={handleClearAll}
      />
    </div>
  );
}
