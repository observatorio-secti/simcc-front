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
  PieChart,
  Phone,
  TextSearch,
  User,
  Users,
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
import { cn } from '@/shared/lib/cn';
import { FALLBACK_COLOR } from '@/shared/lib/design-tokens';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { PowerBiEmbed } from '@/shared/ui/power-bi-embed';
import { SectionHeader } from '@/shared/ui/section-header';
import { StatCard } from '@/shared/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  PROGRAM_PANELS,
  type GraduateProgramDetailSearch,
} from './program-panels';

export interface GraduateProgramDetailPageProps {
  programId: string;
  search?: GraduateProgramDetailSearch;
}

function ProgramPanelSection({
  programId,
  search,
}: {
  programId: string;
  search: GraduateProgramDetailSearch;
}) {
  const navigate = useNavigate();
  const active = search.painel ?? 'producao';

  function handleChange(value: string) {
    const next = PROGRAM_PANELS.find((panel) => panel.id === value);
    if (!next) return;
    void navigate({
      to: '/pos-graduacao/$id',
      params: { id: programId },
      search: { painel: next.id === 'producao' ? undefined : next.id },
      replace: true,
      resetScroll: false,
    });
  }

  return (
    <section aria-labelledby="program-panel-heading" className="flex flex-col">
      <SectionHeader
        id="program-panel-heading"
        title="Painel"
        icon={PieChart}
      />
      <Tabs
        value={active}
        onValueChange={handleChange}
        className="flex flex-col gap-3"
      >
        <TabsList className="w-full justify-start overflow-x-auto bg-neutral-100 dark:bg-neutral-800">
          {PROGRAM_PANELS.map((panel) => (
            <TabsTrigger key={panel.id} value={panel.id}>
              {panel.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {PROGRAM_PANELS.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} className="mt-0">
            <PowerBiEmbed
              src={panel.src}
              title={panel.title}
              description={panel.description}
              previewSrc={panel.previewSrc}
              unavailable={panel.unavailable}
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
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
  search = {},
}: GraduateProgramDetailPageProps) {
  const navigate = useNavigate();
  const detailQuery = useQuery(graduateProgramDetailQueryOptions(programId));

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

          <ProgramPanelSection programId={programId} search={search} />
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
