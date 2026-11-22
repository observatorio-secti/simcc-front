import { useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Award,
  Building2,
  FlaskConical,
  GraduationCap,
  Hash,
  Microscope,
  Search,
  Users,
  X,
} from 'lucide-react';
import { graduateProgramListQueryOptions } from '@/entities/graduate-program/queries';
import { ProgramCard } from '@/entities/graduate-program/ui/program-card';
import {
  formatInstitutionCount,
  formatInstitutionName,
  formatInstitutionScholarshipLabel,
  getInstitutionLogo,
  resolveInstitutionAcronym,
  stripAcronymFromName,
  type InstitutionDetail,
  type InstitutionScholarshipCount,
} from '@/entities/institution/model';
import { institutionDetailQueryOptions } from '@/entities/institution/queries';
import type { ProductionKind } from '@/entities/production/model';
import type { ResearcherSummary } from '@/entities/researcher/model';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import { PersonCard } from '@/entities/researcher/ui/person-card';
import { cn } from '@/shared/lib/cn';
import { Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { focusRing } from '@/shared/ui/focus-ring';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { StatCard } from '@/shared/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import {
  PRODUCTION_TAB_ITEMS,
  PRODUCTION_TAB_KINDS,
  ProductionsTab,
} from '@/entities/production/ui/productions-tab';
import {
  institutionDetailSearch,
  type InstitutionDetailSearch,
  type InstitutionDetailTab,
} from './search-schema';

function isInstitutionDetailTab(value: string): value is InstitutionDetailTab {
  return (
    value === 'researchers' ||
    value === 'programs' ||
    value in PRODUCTION_TAB_KINDS
  );
}

export interface InstitutionDetailPageProps {
  institutionId: string;
  search: InstitutionDetailSearch;
  onOpenProduction?: (kind: ProductionKind, id: string) => void;
}

function InstitutionCover({ cover }: { cover?: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const src = cover?.trim() ? cover.trim() : null;
  const showCover = src !== null && failedUrl !== src;

  return (
    <div className="h-40 bg-neutral-100 sm:h-52 md:h-64 dark:bg-neutral-800">
      {showCover && (
        <img
          src={src}
          alt=""
          aria-hidden
          onError={() => setFailedUrl(src)}
          className="size-full object-cover"
        />
      )}
    </div>
  );
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
        'relative z-10 -mt-12 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-card bg-card p-2.5 text-muted-foreground shadow-md sm:-mt-14 sm:size-28 md:-mt-16 md:size-32 md:p-3',
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

function ScholarshipBreakdownTooltip({
  breakdown,
  children,
}: {
  breakdown: readonly InstitutionScholarshipCount[];
  children: ReactNode;
}) {
  if (breakdown.length === 0) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-sm p-3">
        <p className="mb-1.5 font-medium">Detalhamento por tipo</p>
        <ul className="flex flex-col gap-1">
          {breakdown.map((item, index) => (
            <li
              key={`${item.modality ?? 'none'}-${item.category_level ?? 'none'}-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <span>{formatInstitutionScholarshipLabel(item)}</span>
              <span className="font-semibold tabular-nums">
                {formatInstitutionCount(item.researchers)}
              </span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

export function InstitutionDetailPage({
  institutionId,
  search,
  onOpenProduction,
}: InstitutionDetailPageProps) {
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

  function handleTabChange(nextValue: string) {
    if (!isInstitutionDetailTab(nextValue)) return;
    const isProductionTab =
      nextValue !== 'researchers' && nextValue !== 'programs';
    updateSearch({
      tab: nextValue === 'researchers' ? undefined : nextValue,
      q: undefined,
      ...(!isProductionTab
        ? {
            year_start: undefined,
            year_end: undefined,
            sort_by: undefined,
            sort_order: undefined,
            view: undefined,
          }
        : {}),
    });
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
  const scholarshipHoldersCount = institution.counts?.scholarship_holders ?? 0;
  const researchGroupsCount = institution.counts?.research_groups ?? 0;
  const labsCount = institution.counts?.labs ?? 0;
  const scholarshipsBreakdown = institution.scholarships ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <InstitutionCover cover={institution.cover} />
        <CardContent className="relative pt-0">
          <div className="flex flex-col gap-4">
            <InstitutionAvatar institution={institution} />
            <div className="min-w-0">
              {showAcronym && (
                <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  {acronym}
                </p>
              )}
              <h1 className="text-[1.8rem] font-semibold tracking-tight sm:text-4xl">
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

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
        <ScholarshipBreakdownTooltip breakdown={scholarshipsBreakdown}>
          <div
            tabIndex={scholarshipsBreakdown.length > 0 ? 0 : undefined}
            aria-label={
              scholarshipsBreakdown.length > 0
                ? `Bolsistas de produtividade: ${formatInstitutionCount(scholarshipHoldersCount)}. Passe o mouse ou foque para ver o detalhamento por tipo.`
                : undefined
            }
            className={cn(
              'rounded-xl',
              scholarshipsBreakdown.length > 0 && focusRing,
            )}
          >
            <StatCard
              title="Bolsistas de produtividade"
              value={scholarshipHoldersCount}
              caption="pesquisadores bolsistas distintos"
              icon={Award}
            />
          </div>
        </ScholarshipBreakdownTooltip>
        <StatCard
          title="Grupos de pesquisa"
          value={researchGroupsCount}
          caption="vinculados à instituição"
          icon={FlaskConical}
        />
        <StatCard
          title="Laboratórios"
          value={labsCount}
          caption="vinculados à instituição"
          icon={Microscope}
        />
      </div>

      <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex flex-col gap-4"
          >
            <TabsList variant="pills">
              <TabsTrigger value="researchers">
                <Users aria-hidden />
                <span>Pesquisadores</span>
              </TabsTrigger>
              <TabsTrigger value="programs">
                <GraduationCap aria-hidden />
                <span>Programas de pós-graduação</span>
              </TabsTrigger>
              {PRODUCTION_TAB_ITEMS.map(({ key, label, icon: Icon }) => (
                <TabsTrigger key={key} value={key}>
                  <Icon aria-hidden />
                  <span>{label}</span>
                </TabsTrigger>
              ))}
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

            {PRODUCTION_TAB_ITEMS.map(({ key, kinds }) => (
              <TabsContent key={key} value={key} className="mt-0">
                <ProductionsTab
                  scopeFilter={{ institution_id: [institution.id] }}
                  emptyContext={{
                    inScope: 'nesta instituição',
                    owner: 'Esta instituição',
                  }}
                  kinds={kinds}
                  search={search}
                  onUpdateSearch={updateSearch}
                  onOpenProduction={onOpenProduction}
                  onClearQuery={handleClearQuery}
                />
              </TabsContent>
            ))}
          </Tabs>
    </div>
  );
}
