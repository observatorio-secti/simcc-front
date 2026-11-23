import { useState, type FormEvent } from 'react';
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
  BookOpen,
  Building2,
  ChevronLeft,
  FlaskConical,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Trash2,
  User,
  Users,
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
import { researchGroupListQueryOptions } from '@/entities/research-group/queries';
import { ResearchGroupCard } from '@/entities/research-group/ui/research-group-card';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { FacetSidebar } from '@/shared/ui/facet-panel';
import { focusRing } from '@/shared/ui/focus-ring';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { ResultToolbar } from '@/shared/ui/result-toolbar';
import { SectionHeader } from '@/shared/ui/section-header';
import { SortSelect } from '@/shared/ui/sort-select';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import {
  ResearchGroupFilterSheet,
  ResearchGroupFilters,
} from './research-group-filters';
import {
  GROUP_SORT_OPTIONS,
  researchGroupsSearch,
  toOdaGroupQueryParams,
  type GroupViewMode,
  type ResearchGroupsSearch,
} from './search';

const PER_PAGE_OPTIONS = [12, 24, 48, 96] as const;

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

/** Tela de listagem paginada de grupos de pesquisa (dados da ODA). */
export function ResearchGroupsPage() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate({ from: '/grupos-pesquisa/' });
  const search = useSearch({ from: '/_public/grupos-pesquisa/' });

  const [prevSearchQ, setPrevSearchQ] = useState(search.q);
  const [queryInput, setQueryInput] = useState(search.q ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listOpen, setListOpen] = useState(true);

  if (prevSearchQ !== search.q) {
    setPrevSearchQ(search.q);
    setQueryInput(search.q ?? '');
  }

  const groupsQuery = useQuery(
    researchGroupListQueryOptions(toOdaGroupQueryParams(search)),
  );

  const groups = groupsQuery.data?.items ?? [];
  const meta = groupsQuery.data?.meta;
  const totalItems = meta?.totalItems ?? groups.length;
  const totalPages = Math.max(
    1,
    meta?.totalPages ?? Math.ceil(totalItems / search.per_page),
  );
  const currentPage = Math.min(search.page, totalPages);
  const viewMode: GroupViewMode = search.view ?? 'grid';
  const activeFiltersCount = researchGroupsSearch.countActiveFilters(search);
  const hasAnyFilterOrQuery = activeFiltersCount > 0 || Boolean(search.q);

  function commitSearch(next: ResearchGroupsSearch) {
    void navigate({
      search: () => researchGroupsSearch.clean(next),
      replace: false,
    });
  }

  function updateSearch(
    patch: Partial<ResearchGroupsSearch> | Record<string, unknown>,
    options?: { resetPage?: boolean },
  ) {
    commitSearch(researchGroupsSearch.update(search, patch, options));
  }

  function handleQuerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = queryInput.trim();
    updateSearch({ q: trimmed.length > 0 ? trimmed : undefined });
  }

  function handleClearQuery() {
    setQueryInput('');
    updateSearch({ q: undefined });
  }

  function handleClearFilters() {
    commitSearch(researchGroupsSearch.clearFilters(search));
  }

  function handleClearAll() {
    setQueryInput('');
    commitSearch(
      researchGroupsSearch.update(
        researchGroupsSearch.clearFilters(search),
        { q: undefined },
      ),
    );
  }

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/' });
  }

  const errorMessage = groupsQuery.isError
    ? isApiError(groupsQuery.error)
      ? groupsQuery.error.message
      : 'Não foi possível carregar os grupos de pesquisa da ODA.'
    : null;

  const filterProps = {
    search,
    onUpdateSearch: updateSearch,
    onClearFilters: handleClearFilters,
  };

  return (
    <div className="flex flex-col gap-6">
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
        <h1 className="text-xl font-semibold tracking-tight">
          Grupos de pesquisa
        </h1>
      </div>

      <form
        onSubmit={handleQuerySubmit}
        role="search"
        aria-label="Buscar grupos de pesquisa"
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
          placeholder="Pesquisar grupos por nome, área ou palavra-chave"
          aria-label="Pesquisar grupos por nome, área ou palavra-chave"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <FacetSidebar>
          <ResearchGroupFilters {...filterProps} />
        </FacetSidebar>

        <ResearchGroupFilterSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          {...filterProps}
        />

        <section className="flex min-w-0 flex-col gap-4">
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

          <ResultToolbar
            filtersCount={activeFiltersCount}
            onFiltersClick={() => setFiltersOpen(true)}
            actions={
              <div className="flex items-center gap-2">
                <SortSelect
                  options={GROUP_SORT_OPTIONS}
                  value={search.sort_by}
                  order={search.sort_order}
                  showOrderToggle
                  onChange={(next) => updateSearch(next)}
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
          />

          {listOpen && (
            <div id="grupos-lista" className="flex flex-col gap-4">
              {groupsQuery.isLoading ? (
                <LoadingBlock />
              ) : groups.length === 0 ? (
                <EmptyState
                  title="Nenhum grupo de pesquisa encontrado"
                  description={
                    hasAnyFilterOrQuery
                      ? 'Nenhum grupo corresponde aos filtros ou termos informados.'
                      : 'Nenhum grupo de pesquisa foi retornado pela API ODA.'
                  }
                  action={
                    hasAnyFilterOrQuery ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                      >
                        Limpar filtros
                      </Button>
                    ) : undefined
                  }
                />
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {groups.map((group) => (
                    <ResearchGroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {groups.map((group) => (
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
  );
}
