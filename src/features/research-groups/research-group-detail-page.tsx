import { useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Link,
  useCanGoBack,
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  Calendar,
  ChevronLeft,
  ExternalLink,
  FlaskConical,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
  X,
} from 'lucide-react';
import { isApiError } from '@/api/errors';
import type {
  ResearchGroupMember,
  ResearchGroupResearcher,
} from '@/api/oda';
import {
  formatGroupLocation,
  formatGroupStatus,
  researchGroupDgpUrl,
  resolveGroupArea,
  type ResearchGroupAddress,
  type ResearchGroupInstitution,
} from '@/entities/research-group/model';
import {
  researchGroupDetailQueryOptions,
  researchGroupResearchersQueryOptions,
} from '@/entities/research-group/queries';
import { ResearcherAvatar } from '@/entities/researcher/ui/researcher-avatar';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { focusRing } from '@/shared/ui/focus-ring';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { StatCard } from '@/shared/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  researchGroupDetailSearch,
  type GroupDetailTab,
  type ResearchGroupDetailSearch,
} from './search';

const PER_PAGE_OPTIONS = [12, 24, 48] as const;

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

interface UnifiedMember {
  id: string;
  name: string;
  isLeader: boolean;
  graduation: string | null;
  lattesId: string | null;
  orcid: string | null;
  imageUrl: string | null;
}

function formatFullAddress(address: ResearchGroupAddress): string | null {
  const line1 = [address.street, address.number, address.complement]
    .filter(Boolean)
    .join(', ');
  const cityState = formatGroupLocation(address);
  const parts = [
    line1 || null,
    address.neighborhood,
    cityState,
    address.postalCode ? `CEP ${address.postalCode}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function resolveGroupLeaders(
  apiResearchers: ReadonlyArray<ResearchGroupResearcher>,
  fallbackLeaders: ReadonlyArray<ResearchGroupMember>,
): UnifiedMember[] {
  const leaders: UnifiedMember[] = [];
  const seenIds = new Set<string>();
  const seenLattes = new Set<string>();
  const seenNames = new Set<string>();

  const register = (member: UnifiedMember) => {
    leaders.push(member);
    seenIds.add(member.id);
    if (member.lattesId) seenLattes.add(member.lattesId);
    seenNames.add(normalizeSearchText(member.name));
  };

  for (const researcher of apiResearchers) {
    if (!researcher.isLeader) continue;
    register(researcher);
  }

  for (const leader of fallbackLeaders) {
    const normalizedName = normalizeSearchText(leader.name);
    if (
      seenIds.has(leader.id) ||
      (leader.lattesId && seenLattes.has(leader.lattesId)) ||
      seenNames.has(normalizedName)
    ) {
      continue;
    }
    register({
      id: leader.id,
      name: leader.name,
      isLeader: true,
      graduation: null,
      lattesId: leader.lattesId,
      orcid: null,
      imageUrl: null,
    });
  }

  return leaders.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function MemberProfileLinks({
  lattesId,
  orcid,
}: {
  lattesId: string | null;
  orcid: string | null;
}) {
  if (!lattesId && !orcid) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
      {lattesId && (
        <a
          href={`https://lattes.cnpq.br/${encodeURIComponent(lattesId)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-eng-blue hover:underline"
        >
          Lattes
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
      {orcid && (
        <a
          href={`https://orcid.org/${encodeURIComponent(orcid)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-eng-blue hover:underline"
        >
          ORCID
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
    </div>
  );
}

function InstitutionItem({
  institution,
}: {
  institution: ResearchGroupInstitution;
}) {
  const label = institution.name || institution.acronym || 'Instituição';
  const location = [institution.unitName, institution.stateAcronym]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-start gap-2.5 rounded-md border bg-card p-3">
      <Building2
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {institution.acronym && institution.name && (
            <Tag variant="neutral">{institution.acronym}</Tag>
          )}
          {institution.isHeadquarters && <Tag variant="brand">Sede</Tag>}
        </div>
        {location && (
          <p className="mt-0.5 text-xs text-muted-foreground">{location}</p>
        )}
      </div>
    </div>
  );
}

/** Página de detalhe de um grupo de pesquisa (`/grupos-pesquisa/$id`, ODA). */
export function ResearchGroupDetailPage() {
  const { id } = useParams({ from: '/_public/grupos-pesquisa/$id' });
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate({ from: '/grupos-pesquisa/$id' });
  const search = useSearch({ from: '/_public/grupos-pesquisa/$id' });

  const [draftOverride, setDraftOverride] = useState<{
    base: string | undefined;
    value: string;
  } | null>(null);
  const queryDraft =
    draftOverride && draftOverride.base === search.q
      ? draftOverride.value
      : (search.q ?? '');

  const groupQuery = useQuery(researchGroupDetailQueryOptions(id));
  const researchersQuery = useQuery(
    researchGroupResearchersQueryOptions(id, { page: 1, size: 100 }),
  );

  const group = groupQuery.data;

  const unifiedMembers = useMemo<UnifiedMember[]>(() => {
    const apiResearchers = researchersQuery.data?.items ?? [];
    if (apiResearchers.length > 0) {
      return [...apiResearchers].sort((a, b) => {
        if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
        return a.name.localeCompare(b.name, 'pt-BR');
      });
    }
    const fallbackMembers = group?.members ?? [];
    return [...fallbackMembers]
      .map((member) => ({
        id: member.id,
        name: member.name,
        isLeader: member.isLeader,
        graduation: null,
        lattesId: member.lattesId,
        orcid: null,
        imageUrl: null,
      }))
      .sort((a, b) => {
        if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
        return a.name.localeCompare(b.name, 'pt-BR');
      });
  }, [researchersQuery.data, group?.members]);

  const groupLeaders = useMemo(
    () =>
      resolveGroupLeaders(
        researchersQuery.data?.items ?? [],
        group?.leaders ?? [],
      ),
    [researchersQuery.data?.items, group?.leaders],
  );

  const normalizedQuery = search.q ? normalizeSearchText(search.q) : '';

  const filteredLines = useMemo(() => {
    const lines = group?.researchLines ?? [];
    if (!normalizedQuery) return lines;
    return lines.filter(
      (line) =>
        normalizeSearchText(line.title).includes(normalizedQuery) ||
        (line.objective &&
          normalizeSearchText(line.objective).includes(normalizedQuery)),
    );
  }, [group?.researchLines, normalizedQuery]);

  const filteredMembers = useMemo(() => {
    if (!normalizedQuery) return unifiedMembers;
    return unifiedMembers.filter(
      (member) =>
        normalizeSearchText(member.name).includes(normalizedQuery) ||
        (member.graduation &&
          normalizeSearchText(member.graduation).includes(normalizedQuery)),
    );
  }, [unifiedMembers, normalizedQuery]);

  const activeTab: GroupDetailTab = search.tab ?? 'linhas';
  const totalMembersPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / search.per_page),
  );
  const currentPage = Math.min(search.page, totalMembersPages);
  const pagedMembers = filteredMembers.slice(
    (currentPage - 1) * search.per_page,
    currentPage * search.per_page,
  );

  function updateSearch(
    patch: Partial<ResearchGroupDetailSearch> | Record<string, unknown>,
    options?: { resetPage?: boolean },
  ) {
    const next = researchGroupDetailSearch.update(search, patch, options);
    void navigate({ search: () => next });
  }

  function handleBack() {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/grupos-pesquisa' });
  }

  function handleQuerySubmit(event: FormEvent) {
    event.preventDefault();
    updateSearch({ q: queryDraft.trim() || undefined });
  }

  function handleClearQuery() {
    setDraftOverride(null);
    updateSearch({ q: undefined });
  }

  if (groupQuery.isLoading) {
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
            Grupo de pesquisa
          </h1>
        </div>
        <LoadingBlock />
      </div>
    );
  }

  if (groupQuery.isError || !group) {
    const message = isApiError(groupQuery.error)
      ? groupQuery.error.message
      : 'Não foi possível carregar os detalhes deste grupo de pesquisa.';
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
            Grupo de pesquisa
          </h1>
        </div>
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            <span>{message}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void groupQuery.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const resolvedArea = resolveGroupArea(group);
  const status = formatGroupStatus(group.status);
  const dgpUrl = researchGroupDgpUrl(group.dgpId);
  const locationText = formatGroupLocation(group.address);
  const fullAddress = formatFullAddress(group.address);
  const institutions: ResearchGroupInstitution[] = [
    ...(group.headquarters ? [group.headquarters] : []),
    ...group.partnerInstitutions,
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center gap-4">
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
        <h1 className="min-w-0 flex-1 truncate text-xl font-semibold tracking-tight">
          {group.name}
        </h1>
        {dgpUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={dgpUrl} target="_blank" rel="noopener noreferrer">
              Espelho DGP CNPq
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Button>
        )}
      </div>

      {/* Cabeçalho do grupo */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <div
            data-slot="entity-icon"
            className="grid size-16 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground"
          >
            <FlaskConical className="size-7" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {resolvedArea &&
                (!resolvedArea.matched || resolvedArea.color.light ? (
                  <Badge variant="outline" className="uppercase">
                    <Dot className={resolvedArea.color.bg} />
                    <span>{resolvedArea.label}</span>
                  </Badge>
                ) : (
                  <Badge className={cn(resolvedArea.color.bg, 'uppercase')}>
                    <span>{resolvedArea.label}</span>
                  </Badge>
                ))}
              {status && (
                <Badge variant="outline" className="text-muted-foreground">
                  <Dot
                    className={
                      status.isActive ? 'bg-status-done' : 'bg-status-ongoing'
                    }
                  />
                  {status.label}
                </Badge>
              )}
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {group.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              {group.institutionLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4 shrink-0" aria-hidden />
                  <span>{group.institutionLabel}</span>
                </span>
              )}
              {locationText && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  <span>{locationText}</span>
                </span>
              )}
              {group.foundedYear !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4 shrink-0" aria-hidden />
                  <span>Formado em {group.foundedYear}</span>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Membros"
          value={group.memberCount}
          caption="integrantes registrados no grupo"
          icon={Users}
        />
        <StatCard
          title="Linhas de pesquisa"
          value={group.researchLineCount}
          caption="linhas vinculadas ao grupo"
          icon={BookOpen}
        />
        <StatCard
          title="Ano de formação"
          value={group.foundedYear ? String(group.foundedYear) : '—'}
          caption="registro no diretório"
          icon={Calendar}
        />
      </div>

      {/* Conteúdo principal + coluna lateral 320px */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {group.repercussion && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Repercussão dos trabalhos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {group.repercussion}
                </p>
              </CardContent>
            </Card>
          )}

          {groupLeaders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-4 text-eng-blue" aria-hidden />
                  <span>
                    {groupLeaders.length === 1
                      ? 'Liderança do grupo'
                      : 'Lideranças do grupo'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'grid gap-3',
                    groupLeaders.length > 1 && 'sm:grid-cols-2',
                  )}
                >
                  {groupLeaders.map((leader) => (
                    <div
                      key={leader.id}
                      className="flex items-start gap-3.5 rounded-lg border border-eng-blue/25 bg-eng-blue/[0.03] p-4"
                    >
                      <ResearcherAvatar
                        name={leader.name}
                        imageUrl={leader.imageUrl}
                        size="md"
                        decorative
                        className="size-12 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            to="/researcher"
                            search={{ name: leader.name }}
                            className={cn(
                              'truncate rounded-sm text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-eng-blue hover:underline',
                              focusRing,
                            )}
                          >
                            {leader.name}
                          </Link>
                          <Tag variant="brand">Líder</Tag>
                        </div>
                        {leader.graduation && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {leader.graduation}
                          </p>
                        )}
                        <MemberProfileLinks
                          lattesId={leader.lattesId}
                          orcid={leader.orcid}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Busca interna nas abas */}
          <form
            onSubmit={handleQuerySubmit}
            role="search"
            aria-label="Filtrar linhas ou pesquisadores do grupo"
            className="flex h-11 items-center gap-2 rounded-lg border bg-card px-3"
          >
            <Search
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={queryDraft}
              onChange={(event) =>
                setDraftOverride({ base: search.q, value: event.target.value })
              }
              placeholder="Filtrar linhas de pesquisa ou pesquisadores..."
              aria-label="Filtrar linhas de pesquisa ou pesquisadores"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
            {queryDraft && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
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

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (value === 'linhas' || value === 'pesquisadores') {
                updateSearch({
                  tab: value === 'linhas' ? undefined : value,
                });
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="linhas">Linhas de pesquisa</TabsTrigger>
              <TabsTrigger value="pesquisadores">Pesquisadores</TabsTrigger>
            </TabsList>

            <TabsContent value="linhas" className="flex flex-col gap-3">
              {filteredLines.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="Nenhuma linha de pesquisa encontrada"
                  description={
                    normalizedQuery
                      ? 'Nenhuma linha de pesquisa corresponde ao filtro informado.'
                      : 'Este grupo não possui linhas de pesquisa cadastradas.'
                  }
                  action={
                    normalizedQuery ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearQuery}
                      >
                        Limpar filtro
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                filteredLines.map((line, index) => (
                  <Card key={`${line.title}-${index}`}>
                    <CardContent className="flex flex-col gap-1.5 p-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        {line.title}
                      </h3>
                      {line.objective && (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {line.objective}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="pesquisadores" className="flex flex-col gap-4">
              {researchersQuery.isLoading && unifiedMembers.length === 0 ? (
                <LoadingBlock />
              ) : pagedMembers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Nenhum pesquisador encontrado"
                  description={
                    normalizedQuery
                      ? 'Nenhum pesquisador corresponde ao filtro informado.'
                      : 'Este grupo não possui pesquisadores vinculados.'
                  }
                  action={
                    normalizedQuery ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearQuery}
                      >
                        Limpar filtro
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pagedMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="flex items-start gap-3 p-4">
                          <ResearcherAvatar
                            name={member.name}
                            imageUrl={member.imageUrl}
                            size="md"
                            decorative
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Link
                                to="/researcher"
                                search={{ name: member.name }}
                                className={cn(
                                  'truncate rounded-sm text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-eng-blue hover:underline',
                                  focusRing,
                                )}
                              >
                                {member.name}
                              </Link>
                              {member.isLeader && (
                                <Tag variant="brand">Líder</Tag>
                              )}
                            </div>
                            {member.graduation && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {member.graduation}
                              </p>
                            )}
                            <MemberProfileLinks
                              lattesId={member.lattesId}
                              orcid={member.orcid}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Pagination
                    page={currentPage}
                    totalPages={totalMembersPages}
                    totalItems={filteredMembers.length}
                    perPage={search.per_page}
                    perPageOptions={PER_PAGE_OPTIONS}
                    onPageChange={(page) =>
                      updateSearch({ page }, { resetPage: false })
                    }
                    onPerPageChange={(per_page) => updateSearch({ per_page })}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Coluna lateral */}
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Instituições</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {institutions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma instituição vinculada informada.
                </p>
              ) : (
                institutions.map((inst, idx) => (
                  <InstitutionItem
                    key={`${inst.id ?? inst.name ?? 'inst'}-${idx}`}
                    institution={inst}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Contato e localização</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              {group.contact.email && (
                <a
                  href={`mailto:${group.contact.email}`}
                  className="inline-flex items-center gap-2 text-foreground hover:text-eng-blue hover:underline"
                >
                  <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{group.contact.email}</span>
                </a>
              )}
              {group.contact.phone && (
                <span className="inline-flex items-center gap-2 text-foreground">
                  <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>{group.contact.phone}</span>
                </span>
              )}
              {group.contact.website && (
                <a
                  href={group.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground hover:text-eng-blue hover:underline"
                >
                  <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{group.contact.website}</span>
                </a>
              )}
              {fullAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>{fullAddress}</span>
                </div>
              )}
              {!group.contact.email &&
                !group.contact.phone &&
                !group.contact.website &&
                !fullAddress && (
                  <p>Nenhuma informação de contato disponível.</p>
                )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
