import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Building2,
  Calendar,
  ChevronLeft,
  ExternalLink,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  Search,
  TextSearch,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  cleanProgramText,
  formatCapesRating,
  formatProgramArea,
  formatProgramLocation,
  formatProgramModality,
  formatProgramType,
  resolveProgramAreaColor,
} from '@/entities/graduate-program/model';
import { graduateProgramDetailQueryOptions } from '@/entities/graduate-program/queries';
import { ResearchLines } from '@/entities/graduate-program/ui/research-lines';
import { InstitutionRef } from '@/entities/institution/ui/institution-ref';
import type { ProductionKind } from '@/entities/production/model';
import {
  PRODUCTION_TAB_ITEMS,
  PRODUCTION_TAB_KINDS,
  ProductionsTab,
} from '@/entities/production/ui/productions-tab';
import type { ResearcherSummary } from '@/entities/researcher/model';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import { PersonCard } from '@/entities/researcher/ui/person-card';
import { cn } from '@/shared/lib/cn';
import { FALLBACK_COLOR } from '@/shared/lib/design-tokens';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { PowerBiEmbed } from '@/shared/ui/power-bi-embed';
import { StatCard } from '@/shared/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DISCENTES_PANEL } from './program-panels';
import {
  graduateProgramDetailSearch,
  type GraduateProgramDetailSearch,
  type GraduateProgramDetailTab,
} from './search';

const DEFAULT_DETAIL_SEARCH: GraduateProgramDetailSearch =
  graduateProgramDetailSearch.schema.parse({});

function isGraduateProgramDetailTab(
  value: string,
): value is GraduateProgramDetailTab {
  return (
    value === 'researchers' ||
    value === 'students' ||
    value in PRODUCTION_TAB_KINDS
  );
}

export interface GraduateProgramDetailPageProps {
  programId: string;
  search?: GraduateProgramDetailSearch;
  onOpenProduction?: (kind: ProductionKind, id: string) => void;
}

function GraduateProgramResearchersTab({
  programId,
  search,
  onPageChange,
  onPerPageChange,
  onClearQuery,
}: {
  programId: string;
  search: GraduateProgramDetailSearch;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onClearQuery: () => void;
}) {
  const { data, isPending, isFetching } = useQuery(
    researcherListQueryOptions({
      graduate_program_id: [programId],
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
            ? `Não encontramos pesquisadores para "${search.q}" neste programa.`
            : 'Este programa ainda não possui pesquisadores listados.'
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

function normalizeSiteUrl(raw: string | null | undefined): string | null {
  const cleaned = cleanProgramText(raw);
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
}

/**
 * Página de detalhe de programa de pós-graduação (Template E: Perfil).
 * Exibe cabeçalho com badges, descrição, KPIs, linhas de pesquisa e coluna
 * lateral de informações gerais.
 */
export function GraduateProgramDetailPage({
  programId,
  search = DEFAULT_DETAIL_SEARCH,
  onOpenProduction,
}: GraduateProgramDetailPageProps) {
  const navigate = useNavigate({ from: '/pos-graduacao/$id' });
  const detailQuery = useQuery(graduateProgramDetailQueryOptions(programId));

  const [queryInput, setQueryInput] = useState(search.q ?? '');
  const [prevSearchQ, setPrevSearchQ] = useState(search.q);

  if (prevSearchQ !== search.q) {
    setPrevSearchQ(search.q);
    setQueryInput(search.q ?? '');
  }

  const activeTab: GraduateProgramDetailTab = search.tab ?? 'researchers';

  function updateSearch(
    patch: Partial<GraduateProgramDetailSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = graduateProgramDetailSearch.update(search, patch, options);
    void navigate({
      search: () => next,
    });
  }

  function handleTabChange(nextValue: string) {
    if (!isGraduateProgramDetailTab(nextValue)) return;
    const isProductionTab =
      nextValue !== 'researchers' && nextValue !== 'students';
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

  if (detailQuery.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => void navigate({ to: '/pos-graduacao' })}
            aria-label="Voltar para pós-graduação"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Pós-graduação
          </h1>
        </div>
        <LoadingBlock />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.data) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => void navigate({ to: '/pos-graduacao' })}
            aria-label="Voltar para pós-graduação"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Pós-graduação
          </h1>
        </div>
        <Card className="p-6">
          <EmptyState
            icon={GraduationCap}
            title="Programa não encontrado"
            description="Não foi possível carregar os dados deste programa de pós-graduação."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline">
                  <Link to="/pos-graduacao">Voltar ao catálogo</Link>
                </Button>
                <Button
                  type="button"
                  onClick={() => void detailQuery.refetch()}
                >
                  Tentar novamente
                </Button>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  const program = detailQuery.data.data;
  const acronym = cleanProgramText(program.acronym);
  const nameEn = cleanProgramText(program.name_en);
  const code = cleanProgramText(program.code);
  const capesLabel = formatCapesRating(program.rating);
  const modalityLabel = formatProgramModality(program.modality);
  const typeLabel = formatProgramType(program.type);
  const areaLabel = formatProgramArea(program.area);
  const areaColor = areaLabel ? resolveProgramAreaColor(program.area) : null;
  const useOutlineArea =
    areaColor !== null &&
    (Boolean(areaColor.light) || areaColor.bg === FALLBACK_COLOR.bg);
  const location = formatProgramLocation(program.city, program.state);
  const description = cleanProgramText(program.description);
  const siteUrl = normalizeSiteUrl(program.site);
  const coordinator = cleanProgramText(program.coordinator);
  const email = cleanProgramText(program.email);
  const phone = cleanProgramText(program.phone);
  const start = cleanProgramText(program.start);
  const researchLines = program.research_lines ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => void navigate({ to: '/pos-graduacao' })}
          aria-label="Voltar para pós-graduação"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-xl font-semibold tracking-tight">
          Pós-graduação
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                  {code && (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Hash className="size-3.5" aria-hidden />
                      Código CAPES: {code}
                    </span>
                  )}
                  {start && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" aria-hidden />
                      Início: {start}
                    </span>
                  )}
                </div>
                {siteUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                      Site do programa
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  aria-hidden
                  className="grid size-16 shrink-0 place-items-center rounded-lg border bg-card text-eng-blue"
                >
                  <GraduationCap className="size-8" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {acronym && (
                    <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                      {acronym}
                    </span>
                  )}
                  <h1 className="text-2xl leading-tight font-semibold tracking-tight text-foreground md:text-3xl">
                    {program.name}
                  </h1>
                  {nameEn && (
                    <p className="text-sm text-muted-foreground italic">
                      {nameEn}
                    </p>
                  )}

                  {program.institution && (
                    <div className="pt-1">
                      <InstitutionRef
                        institution={program.institution}
                        showIcon
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {capesLabel && <Tag variant="brand">{capesLabel}</Tag>}
                    {modalityLabel && (
                      <Badge variant="outline">{modalityLabel}</Badge>
                    )}
                    {typeLabel && <Badge variant="outline">{typeLabel}</Badge>}
                    {areaLabel &&
                      areaColor &&
                      (useOutlineArea ? (
                        <Badge
                          variant="outline"
                          className="text-foreground uppercase"
                        >
                          <Dot className={areaColor.bg} />
                          <span>{areaLabel}</span>
                        </Badge>
                      ) : (
                        <Badge className={cn(areaColor.bg, 'uppercase')}>
                          {areaLabel}
                        </Badge>
                      ))}
                    {location && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span>{location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {description && (
                <p className="border-t pt-4 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              title="Docentes vinculados"
              value={program.counts?.researchers ?? 0}
              caption="pesquisadores no programa"
              icon={Users}
            />
            <StatCard
              title="Linhas de pesquisa"
              value={researchLines.length}
              caption="cadastradas no programa"
              icon={TextSearch}
            />
          </div>

          <ResearchLines lines={researchLines} />

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
              {PRODUCTION_TAB_ITEMS.map(({ key, label, icon: Icon }) => (
                <TabsTrigger key={key} value={key}>
                  <Icon aria-hidden />
                  <span>{label}</span>
                </TabsTrigger>
              ))}
              <TabsTrigger value="students">
                <UserCheck aria-hidden />
                <span>{DISCENTES_PANEL.title}</span>
              </TabsTrigger>
            </TabsList>

            {activeTab !== 'students' && (
              <form
                role="search"
                aria-label={
                  activeTab === 'researchers'
                    ? 'Filtrar pesquisadores do programa'
                    : 'Filtrar produções do programa'
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
                      : 'Filtrar produções por título ou termo'
                  }
                  aria-label={
                    activeTab === 'researchers'
                      ? 'Filtrar pesquisadores por nome ou termo'
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
            )}

            <TabsContent value="researchers" className="mt-0">
              <GraduateProgramResearchersTab
                programId={programId}
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
                  scopeFilter={{ graduate_program_id: [programId] }}
                  emptyContext={{
                    inScope: 'neste programa',
                    owner: 'Este programa',
                  }}
                  kinds={kinds}
                  search={search}
                  onUpdateSearch={updateSearch}
                  onOpenProduction={onOpenProduction}
                  onClearQuery={handleClearQuery}
                />
              </TabsContent>
            ))}

            <TabsContent value="students" className="mt-0">
              <PowerBiEmbed
                src={DISCENTES_PANEL.src}
                title={DISCENTES_PANEL.title}
                description={DISCENTES_PANEL.description}
                previewSrc={DISCENTES_PANEL.previewSrc}
                unavailable={DISCENTES_PANEL.unavailable}
              />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Informações gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <User
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Coordenação</p>
                  <p className="font-medium text-foreground">
                    {coordinator ?? 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="font-medium break-all text-foreground underline-offset-4 hover:text-eng-blue hover:underline"
                    >
                      {email}
                    </a>
                  ) : (
                    <p className="font-medium text-foreground">Não informado</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium text-foreground">
                    {phone ?? 'Não informado'}
                  </p>
                </div>
              </div>

              {program.institution && (
                <div className="flex items-start gap-2.5">
                  <Building2
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Instituição</p>
                    <p className="font-medium text-foreground">
                      {program.institution.name}
                    </p>
                  </div>
                </div>
              )}

              {location && (
                <div className="flex items-start gap-2.5">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="font-medium text-foreground">{location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
