import { useState, type FormEvent } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import {
  Building2,
  ChevronLeft,
  FileText,
  GraduationCap,
  Hash,
  MapPin,
  Search,
  Users,
  X,
} from 'lucide-react';
import { graduateProgramListQueryOptions } from '@/entities/graduate-program/queries';
import { ProgramCard } from '@/entities/graduate-program/ui/program-card';
import {
  formatInstitutionCount,
  formatInstitutionName,
  getInstitutionLogo,
  resolveInstitutionAcronym,
  stripAcronymFromName,
  type InstitutionDetail,
} from '@/entities/institution/model';
import { institutionDetailQueryOptions } from '@/entities/institution/queries';
import type { ProductionKind } from '@/entities/production/model';
import type { ResearcherSummary } from '@/entities/researcher/model';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import { PersonCard } from '@/entities/researcher/ui/person-card';
import { cn } from '@/shared/lib/cn';
import { Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { StatCard } from '@/shared/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { InstitutionProductionsTab } from './institution-productions-tab';
import {
  institutionDetailSearch,
  type InstitutionDetailSearch,
  type InstitutionDetailTab,
} from './search-schema';

export interface InstitutionDetailPageProps {
  institutionId: string;
  search: InstitutionDetailSearch;
  onOpenProduction?: (kind: ProductionKind, id: string) => void;
}

function InstitutionAvatar({
  institution,
}: {
  institution: InstitutionDetail;
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
        'flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-4 border-card bg-card p-2 text-muted-foreground shadow-md',
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
        <Building2 className="size-10 shrink-0" aria-hidden />
      )}
    </div>
  );
}

function InstitutionResearchersTab({
  institutionId,
  search,
  onPageChange,
  onPerPageChange,
  onClearQuery,
}: {
  institutionId: string;
  search: InstitutionDetailSearch;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onClearQuery: () => void;
}) {
  const { data, isPending, isFetching } = useQuery(
    researcherListQueryOptions({
      institution_id: [institutionId],
      q: search.q,
      page: search.page,
      per_page: search.per_page,
    }),
  );

  if (isPending) {
    return <LoadingBlock />;
  }

  const researchers = data?.data ?? [];
  if (researchers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum pesquisador encontrado"
        description={
          search.q
            ? `Não encontramos pesquisadores para "${search.q}" nesta instituição.`
            : 'Esta instituição ainda não possui pesquisadores listados.'
        }
        action={
          search.q ? (
            <Button type="button" variant="outline" onClick={onClearQuery}>
              Limpar filtro
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div aria-busy={isFetching || undefined} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {researchers.map((researcher) => (
          <PersonCard
            key={researcher.id}
            researcher={researcher as ResearcherSummary}
          />
        ))}
      </div>

      {data?.pagination && (
        <Pagination
          pagination={data.pagination}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
    </div>
  );
}

function InstitutionProgramsTab({
  institutionId,
  institutionLabel,
  search,
  onPageChange,
  onPerPageChange,
  onClearQuery,
}: {
  institutionId: string;
  institutionLabel: string;
  search: InstitutionDetailSearch;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onClearQuery: () => void;
}) {
  const { data, isPending, isFetching } = useQuery(
    graduateProgramListQueryOptions({
      institution_id: [institutionId],
      q: search.q,
      page: search.page,
      per_page: search.per_page,
    }),
  );

  if (isPending) {
    return <LoadingBlock />;
  }

  const programs = data?.data ?? [];
  if (programs.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Nenhum programa de pós-graduação encontrado"
        description={
          search.q
            ? `Não encontramos programas para "${search.q}" nesta instituição.`
            : 'Esta instituição ainda não possui programas de pós-graduação listados.'
        }
        action={
          search.q ? (
            <Button type="button" variant="outline" onClick={onClearQuery}>
              Limpar filtro
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div aria-busy={isFetching || undefined} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            institutionLabel={institutionLabel}
          />
        ))}
      </div>

      {data?.pagination && (
        <Pagination
          pagination={data.pagination}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
    </div>
  );
}

export function InstitutionDetailPage({
  institutionId,
  search,
  onOpenProduction,
}: InstitutionDetailPageProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate({ from: '/instituicoes/$id' });

  const { data: response } = useSuspenseQuery(
    institutionDetailQueryOptions(institutionId),
  );
  const institution = response.data;

  const [queryInput, setQueryInput] = useState(search.q ?? '');
  const [prevSearchQ, setPrevSearchQ] = useState(search.q);

  if (prevSearchQ !== search.q) {
    setPrevSearchQ(search.q);
    setQueryInput(search.q ?? '');
  }

  const activeTab: InstitutionDetailTab = search.tab ?? 'researchers';

  const acronym = resolveInstitutionAcronym(institution);
  const displayName = acronym
    ? stripAcronymFromName(institution.name, acronym)
    : formatInstitutionName(institution.name);
  const showAcronym =
    Boolean(acronym) && displayName.toUpperCase() !== acronym?.toUpperCase();

  function updateSearch(
    patch: Partial<InstitutionDetailSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = institutionDetailSearch.update(search, patch, options);
    void navigate({
      search: () => next,
    });
  }

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/instituicoes' });
  }

  function handleTabChange(nextValue: string) {
    if (
      nextValue === 'researchers' ||
      nextValue === 'programs' ||
      nextValue === 'productions'
    ) {
      updateSearch({
        tab: nextValue === 'researchers' ? undefined : nextValue,
        q: undefined,
        ...(nextValue !== 'productions'
          ? {
              kind: undefined,
              year_start: undefined,
              year_end: undefined,
              sort_by: undefined,
              sort_order: undefined,
              view: undefined,
            }
          : {}),
      });
    }
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

  const researchersCount = institution.counts?.researchers ?? 0;
  const programsCount = institution.counts?.graduate_programs ?? 0;
  const hasCoordinates =
    typeof institution.latitude === 'number' &&
    typeof institution.longitude === 'number';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
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
        <Link
          to="/instituicoes"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Instituições
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="h-24 bg-neutral-100 sm:h-32 dark:bg-neutral-800">
          {institution.cover && (
            <img
              src={institution.cover}
              alt=""
              aria-hidden
              className="size-full object-cover"
            />
          )}
        </div>
        <CardContent className="relative pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <InstitutionAvatar institution={institution} />
            <div className="min-w-0 flex-1 pb-1">
              {showAcronym && (
                <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  {acronym}
                </p>
              )}
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {displayName}
              </h1>
            </div>
          </div>

          {institution.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {institution.description}
            </p>
          )}

          {institution.lattes_id && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Tag variant="outline" className="gap-1.5">
                <Hash className="size-3 text-muted-foreground" aria-hidden />
                <span>Código Lattes: {institution.lattes_id}</span>
              </Tag>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              title="Pesquisadores"
              value={researchersCount}
              caption="vinculados à instituição"
              icon={Users}
            />
            <StatCard
              title="Programas de pós-graduação"
              value={programsCount}
              caption="ofertados pela instituição"
              icon={GraduationCap}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex flex-col gap-4"
          >
            <TabsList className="w-full justify-start overflow-x-auto bg-neutral-100 dark:bg-neutral-800">
              <TabsTrigger value="researchers" className="gap-2">
                <Users className="size-3.5" aria-hidden />
                <span>Pesquisadores</span>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-foreground tabular-nums dark:bg-neutral-700">
                  {formatInstitutionCount(researchersCount)}
                </span>
              </TabsTrigger>
              <TabsTrigger value="programs" className="gap-2">
                <GraduationCap className="size-3.5" aria-hidden />
                <span>Programas de pós-graduação</span>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-foreground tabular-nums dark:bg-neutral-700">
                  {formatInstitutionCount(programsCount)}
                </span>
              </TabsTrigger>
              <TabsTrigger value="productions" className="gap-2">
                <FileText className="size-3.5" aria-hidden />
                <span>Produções</span>
              </TabsTrigger>
            </TabsList>

            <form
              role="search"
              aria-label={
                activeTab === 'researchers'
                  ? 'Filtrar pesquisadores da instituição'
                  : activeTab === 'programs'
                    ? 'Filtrar programas da instituição'
                    : 'Filtrar produções da instituição'
              }
              onSubmit={handleSearchSubmit}
              className="flex h-[52px] items-center gap-3 rounded-lg border bg-card px-4"
            >
              <Search
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                placeholder={
                  activeTab === 'researchers'
                    ? 'Filtrar pesquisadores por nome ou termo'
                    : activeTab === 'programs'
                      ? 'Filtrar programas por nome ou sigla'
                      : 'Filtrar produções por título ou termo'
                }
                aria-label={
                  activeTab === 'researchers'
                    ? 'Filtrar pesquisadores por nome ou termo'
                    : activeTab === 'programs'
                      ? 'Filtrar programas por nome ou sigla'
                      : 'Filtrar produções por título ou termo'
                }
                className="h-auto flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              {queryInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearQuery}
                  aria-label="Limpar filtro"
                >
                  <X className="size-4" aria-hidden />
                </Button>
              )}
              <Button type="submit" size="sm">
                Filtrar
              </Button>
            </form>

            <TabsContent value="researchers" className="mt-0">
              <InstitutionResearchersTab
                institutionId={institution.id}
                search={search}
                onPageChange={(page) =>
                  updateSearch({ page }, { resetPage: false })
                }
                onPerPageChange={(per_page) => updateSearch({ per_page })}
                onClearQuery={handleClearQuery}
              />
            </TabsContent>

            <TabsContent value="programs" className="mt-0">
              <InstitutionProgramsTab
                institutionId={institution.id}
                institutionLabel={acronym ?? displayName}
                search={search}
                onPageChange={(page) =>
                  updateSearch({ page }, { resetPage: false })
                }
                onPerPageChange={(per_page) => updateSearch({ per_page })}
                onClearQuery={handleClearQuery}
              />
            </TabsContent>

            <TabsContent value="productions" className="mt-0">
              <InstitutionProductionsTab
                institutionId={institution.id}
                search={search}
                onUpdateSearch={updateSearch}
                onOpenProduction={onOpenProduction}
                onClearQuery={handleClearQuery}
              />
            </TabsContent>
          </Tabs>
        </div>

        <aside aria-label="Informações gerais" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Informações gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-start justify-between gap-2 border-b pb-2">
                <span className="text-muted-foreground">Pesquisadores</span>
                <span className="font-medium tabular-nums">
                  {formatInstitutionCount(researchersCount)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 border-b pb-2">
                <span className="text-muted-foreground">
                  Programas de pós-graduação
                </span>
                <span className="font-medium tabular-nums">
                  {formatInstitutionCount(programsCount)}
                </span>
              </div>
              {institution.lattes_id && (
                <div className="flex items-start justify-between gap-2 border-b pb-2">
                  <span className="text-muted-foreground">Código Lattes</span>
                  <span className="font-mono text-xs">
                    {institution.lattes_id}
                  </span>
                </div>
              )}
              {hasCoordinates && (
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden />
                    <span>Coordenadas</span>
                  </span>
                  <span className="text-right font-mono text-xs tabular-nums">
                    {institution.latitude?.toFixed(4)},{' '}
                    {institution.longitude?.toFixed(4)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
