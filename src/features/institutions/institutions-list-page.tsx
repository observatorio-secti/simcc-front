import { useState, type FormEvent, type MouseEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  LayoutGrid,
  Rows3,
  Search,
  X,
} from 'lucide-react';
import {
  formatInstitutionName,
  getInstitutionLogo,
  INSTITUTION_SORT_OPTIONS,
  institutionPath,
  resolveInstitutionAcronym,
  stripAcronymFromName,
  type InstitutionSummary,
} from '@/entities/institution/model';
import { institutionListQueryOptions } from '@/entities/institution/queries';
import { InstitutionCard } from '@/entities/institution/ui/institution-card';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { focusRing } from '@/shared/ui/focus-ring';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { ResultToolbar } from '@/shared/ui/result-toolbar';
import { SectionHeader } from '@/shared/ui/section-header';
import { SortSelect, type SortSelection } from '@/shared/ui/sort-select';
import { StatCard } from '@/shared/ui/stat-card';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import {
  institutionListSearch,
  type InstitutionListSearch,
  type InstitutionViewMode,
} from './search-schema';

export interface InstitutionsListPageProps {
  search: InstitutionListSearch;
}

function InstitutionLogoThumb({
  institution,
}: {
  institution: InstitutionSummary;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const localLogo = getInstitutionLogo(institution);
  const remoteImage =
    !localLogo && institution.image && failedUrl !== institution.image
      ? institution.image
      : null;

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-card p-1 text-muted-foreground',
        localLogo?.lightSurface && 'dark:bg-white',
      )}
    >
      {localLogo ? (
        localLogo.dark ? (
          <>
            <img
              src={localLogo.light}
              alt=""
              aria-hidden
              className="size-full object-contain dark:hidden"
            />
            <img
              src={localLogo.dark}
              alt=""
              aria-hidden
              className="hidden size-full object-contain dark:block"
            />
          </>
        ) : (
          <img
            src={localLogo.light}
            alt=""
            aria-hidden
            className="size-full object-contain"
          />
        )
      ) : remoteImage ? (
        <img
          src={remoteImage}
          alt=""
          aria-hidden
          onError={() => setFailedUrl(remoteImage)}
          className="size-full object-contain"
        />
      ) : (
        <Building2 className="size-5 shrink-0" aria-hidden />
      )}
    </div>
  );
}

function InstitutionListRow({
  institution,
  onNavigate,
}: {
  institution: InstitutionSummary;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const acronym = resolveInstitutionAcronym(institution);
  const displayName = acronym
    ? stripAcronymFromName(institution.name, acronym)
    : formatInstitutionName(institution.name);
  const showAcronym =
    Boolean(acronym) && displayName.toUpperCase() !== acronym?.toUpperCase();

  return (
    <a
      href={institutionPath(institution.id)}
      onClick={(event) => onNavigate(event, institution.id)}
      className={cn(
        'group flex items-center gap-4 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:border-neutral-300 dark:hover:border-neutral-700',
        focusRing,
      )}
    >
      <InstitutionLogoThumb institution={institution} />
      <div className="min-w-0 flex-1">
        {showAcronym && (
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            {acronym}
          </p>
        )}
        <p className="truncate text-sm font-semibold">{displayName}</p>
      </div>
      <ArrowRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-eng-blue"
        aria-hidden
      />
    </a>
  );
}

export function InstitutionsListPage({ search }: InstitutionsListPageProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate({ from: '/instituicoes/' });

  const [queryInput, setQueryInput] = useState(search.q ?? '');
  const [prevSearchQ, setPrevSearchQ] = useState(search.q);
  const [sectionOpen, setSectionOpen] = useState(true);

  if (prevSearchQ !== search.q) {
    setPrevSearchQ(search.q);
    setQueryInput(search.q ?? '');
  }

  const apiParams = institutionListSearch.toApiParams(search);
  const { data, isPending, isFetching } = useQuery(
    institutionListQueryOptions(apiParams),
  );

  const view: InstitutionViewMode = search.view ?? 'grid';

  function updateSearch(
    patch: Partial<InstitutionListSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = institutionListSearch.update(search, patch, options);
    void navigate({
      search: () => next,
    });
  }

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/' });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = queryInput.trim();
    updateSearch({ q: trimmed || undefined });
  }

  function handleClearQuery() {
    setQueryInput('');
    if (search.q) {
      updateSearch({ q: undefined });
    }
  }

  function handleSortChange(next: SortSelection<string>) {
    updateSearch({
      sort_by: next.sort_by as InstitutionListSearch['sort_by'],
      sort_order: next.sort_order,
    });
  }

  function handleViewChange(nextView: string) {
    if (nextView === 'grid' || nextView === 'list') {
      updateSearch(
        { view: nextView === 'grid' ? undefined : nextView },
        { resetPage: false },
      );
    }
  }

  function handleInstitutionNavigate(
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    void router.navigate({
      to: '/instituicoes/$id',
      params: { id },
    });
  }

  const items = data?.data ?? [];
  const totalItems = data?.pagination.total_items;

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
        <h1 className="flex-1 text-xl font-semibold tracking-tight">
          Instituições
        </h1>
      </div>

      <form
        role="search"
        aria-label="Buscar instituições"
        onSubmit={handleSearchSubmit}
        className="flex h-[52px] items-center gap-3 rounded-lg border bg-card px-4"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={queryInput}
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder="Pesquisar por nome ou sigla"
          aria-label="Pesquisar instituições por nome ou sigla"
          className="h-auto flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
        {queryInput && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
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

      <ResultToolbar
        actions={
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={handleViewChange}
            aria-label="Modo de visualização"
            className="rounded-md bg-neutral-100 p-0.5 dark:bg-neutral-800"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Visualização em grade"
              className="size-8 rounded-sm data-[state=on]:border data-[state=on]:bg-card"
            >
              <LayoutGrid className="size-4" aria-hidden />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="Visualização em lista"
              className="size-8 rounded-sm data-[state=on]:border data-[state=on]:bg-card"
            >
              <Rows3 className="size-4" aria-hidden />
            </ToggleGroupItem>
          </ToggleGroup>
        }
      >
        <SortSelect
          options={INSTITUTION_SORT_OPTIONS}
          value={search.sort_by}
          order={search.sort_order}
          onChange={handleSortChange}
          showOrderToggle
        />
      </ResultToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total de instituições"
          value={totalItems}
          caption={
            search.q ? 'encontradas na busca' : 'cadastradas na plataforma'
          }
          icon={Building2}
          loading={isPending}
        />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader
          icon={Building2}
          title={search.q ? 'Resultados da busca' : 'Instituições cadastradas'}
          open={sectionOpen}
          onOpenChange={setSectionOpen}
          controls="institutions-results-panel"
        />

        {sectionOpen && (
          <div
            id="institutions-results-panel"
            aria-busy={isFetching || undefined}
            className="flex flex-col gap-4"
          >
            {isPending ? (
              <LoadingBlock />
            ) : items.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Nenhuma instituição encontrada"
                description={
                  search.q
                    ? `Não encontramos instituições para "${search.q}".`
                    : 'Não há instituições cadastradas para exibir no momento.'
                }
                action={
                  search.q ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearQuery}
                    >
                      Limpar busca
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {view === 'list' ? (
                  <div className="flex flex-col gap-3">
                    {items.map((institution) => (
                      <InstitutionListRow
                        key={institution.id}
                        institution={institution}
                        onNavigate={handleInstitutionNavigate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((institution) => (
                      <InstitutionCard
                        key={institution.id}
                        institution={institution}
                        onClick={(event) =>
                          handleInstitutionNavigate(event, institution.id)
                        }
                      />
                    ))}
                  </div>
                )}

                {data?.pagination && (
                  <Pagination
                    pagination={data.pagination}
                    onPageChange={(page) =>
                      updateSearch({ page }, { resetPage: false })
                    }
                    onPerPageChange={(per_page) => updateSearch({ per_page })}
                  />
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
