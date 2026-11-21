import {
  BarChart3,
  BookOpen,
  CodeXml,
  Copyright,
  FileText,
  GraduationCap,
  Quote,
} from 'lucide-react';
import { ProgramRef } from '@/entities/graduate-program/ui/program-ref';
import { GroupRef } from '@/entities/research-group/ui/group-ref';
import type {
  ResearcherDetail,
  ResearcherTerm,
} from '@/entities/researcher/model';
import { formatCount } from '@/entities/researcher/model';
import type { Scholarship as ScholarshipItem } from '@/entities/scholarship/model';
import { productionColor, scholarshipColor } from '@/shared/lib/design-tokens';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { TermCloud } from './term-cloud';

export interface ProfileSidebarProps {
  researcher: ResearcherDetail;
  scholarships: readonly ScholarshipItem[];
  terms: readonly ResearcherTerm[];
  termsLoading?: boolean;
  termsError?: boolean;
}

function formatScholarshipLabel(item: ScholarshipItem): string {
  const parts = [item.modality?.trim(), item.category_level?.trim()].filter(
    Boolean,
  );
  if (parts.length > 0) return parts.join(' – ');
  return item.funding_program?.trim() || item.call_title?.trim() || 'Bolsa';
}

/**
 * Coluna lateral do perfil (320px em `lg+`, Template E, `pesquisador.html`).
 */
export function ProfileSidebar({
  researcher,
  scholarships,
  terms,
  termsLoading,
  termsError,
}: ProfileSidebarProps) {
  const bibliometrics = researcher.bibliometrics;
  const counts = researcher.counts;
  const booksAndChapters = (counts?.books ?? 0) + (counts?.book_chapters ?? 0);

  const productionBars = [
    {
      key: 'article',
      label: 'Artigos',
      value: counts?.articles ?? 0,
      color: productionColor('article'),
    },
    {
      key: 'book',
      label: 'Livros/cap.',
      value: booksAndChapters,
      color: productionColor('book_chapter'),
    },
    {
      key: 'software',
      label: 'Softwares',
      value: counts?.software ?? 0,
      color: productionColor('software'),
    },
    {
      key: 'patent',
      label: 'Patentes',
      value: counts?.patents ?? 0,
      color: productionColor('patent'),
    },
    {
      key: 'brand',
      label: 'Marcas',
      value: counts?.brands ?? 0,
      color: productionColor('brand'),
    },
    {
      key: 'guidance',
      label: 'Orientações',
      value: counts?.guidance ?? 0,
      color: productionColor('guidance'),
    },
    {
      key: 'report',
      label: 'Relatórios',
      value: counts?.reports ?? 0,
      color: productionColor('report'),
    },
  ];

  const maxProduction = Math.max(1, ...productionBars.map((bar) => bar.value));
  const hasAnyProduction = productionBars.some((bar) => bar.value > 0);
  const hasGeneralInfo =
    bibliometrics != null ||
    scholarships.length > 0 ||
    Boolean(researcher.classification);

  return (
    <aside className="flex flex-col gap-6">
      {hasGeneralInfo && (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Informações gerais
          </h2>
          <div className="flex flex-wrap gap-2">
            {bibliometrics?.h_index != null && (
              <Tag variant="outline">
                <BarChart3 aria-hidden />
                <span>
                  Índice H no OpenAlex: {formatCount(bibliometrics.h_index)}
                </span>
              </Tag>
            )}
            {bibliometrics?.cited_by_count != null && (
              <Tag variant="outline">
                <Quote aria-hidden />
                <span>
                  Citações: {formatCount(bibliometrics.cited_by_count)}
                </span>
              </Tag>
            )}
            {bibliometrics?.i10_index != null && (
              <Tag variant="outline">
                <BarChart3 aria-hidden />
                <span>Índice i10: {formatCount(bibliometrics.i10_index)}</span>
              </Tag>
            )}
            {scholarships.map((item) => {
              const color = scholarshipColor(
                item.modality ?? item.funding_program,
              );
              const label = formatScholarshipLabel(item);
              const details = [item.institute, item.call_title]
                .filter(Boolean)
                .join(' · ');
              return (
                <Tag key={item.id} variant="outline" title={details || label}>
                  <Dot className={color.bg} />
                  <span>{label}</span>
                </Tag>
              );
            })}
            {researcher.classification && (
              <span className="inline-flex items-center">
                <Badge size="sm" className="rounded-r-none bg-neutral-700">
                  Índice do pesquisador
                </Badge>
                <Badge size="sm" className="rounded-l-none bg-status-concluida">
                  {researcher.classification}
                </Badge>
              </span>
            )}
          </div>
        </section>
      )}

      {counts && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="gap-1 px-4 py-3.5">
            <span className="flex items-center gap-2 text-lg font-bold tabular-nums">
              <FileText className="size-4 text-muted-foreground" aria-hidden />
              {formatCount(counts.articles)}
            </span>
            <span className="text-xs text-muted-foreground">Artigos</span>
          </Card>

          <Card className="gap-1 px-4 py-3.5">
            <span className="flex items-center gap-2 text-lg font-bold tabular-nums">
              <BookOpen className="size-4 text-muted-foreground" aria-hidden />
              {formatCount(booksAndChapters)}
            </span>
            <span className="text-xs text-muted-foreground">
              Livros e capítulos
            </span>
          </Card>

          <Card className="gap-1 px-4 py-3.5">
            <span className="flex items-center gap-2 text-lg font-bold tabular-nums">
              <Copyright className="size-4 text-muted-foreground" aria-hidden />
              {formatCount(counts.brands)}
            </span>
            <span className="text-xs text-muted-foreground">Marcas</span>
          </Card>

          <Card className="gap-1 px-4 py-3.5">
            <span className="flex items-center gap-2 text-lg font-bold tabular-nums">
              <CodeXml className="size-4 text-muted-foreground" aria-hidden />
              {formatCount(counts.software)}
            </span>
            <span className="text-xs text-muted-foreground">Softwares</span>
          </Card>
        </div>
      )}

      <TermCloud terms={terms} isLoading={termsLoading} isError={termsError} />

      {researcher.graduate_programs.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Programas de pós-graduação
          </h2>
          <div className="flex flex-col gap-3">
            {researcher.graduate_programs.map((entry) => (
              <Card key={entry.program.id} className="gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    Programa de pós-graduação
                  </span>
                  <GraduationCap
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <ProgramRef program={entry.program} showAcronym />
                {entry.type && (
                  <div className="flex flex-wrap gap-1.5">
                    <Tag variant="neutral">{entry.type}</Tag>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {researcher.research_groups.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Grupos de pesquisa
          </h2>
          <Card className="gap-2.5 p-4">
            {researcher.research_groups.map((group) => (
              <GroupRef key={group.id} group={group} />
            ))}
          </Card>
        </section>
      )}

      {hasAnyProduction && (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Produção por tipo
          </h2>
          <Card className="p-4">
            <div className="flex flex-col gap-2.5">
              {productionBars.map((bar) => {
                const widthPct =
                  bar.value > 0
                    ? Math.max(4, Math.round((bar.value / maxProduction) * 100))
                    : 0;
                return (
                  <div
                    key={bar.key}
                    className="grid grid-cols-[84px_1fr_auto] items-center gap-2 text-xs"
                  >
                    <span className="truncate text-muted-foreground">
                      {bar.label}
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className={`h-full rounded-full ${bar.color.bg}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <b className="min-w-6 text-right font-semibold tabular-nums">
                      {formatCount(bar.value)}
                    </b>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}
    </aside>
  );
}
