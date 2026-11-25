import type { ComponentProps } from 'react';
import {
  Building2,
  GraduationCap,
  MapPin,
  TextSearch,
  Users,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { FALLBACK_COLOR } from '@/shared/lib/design-tokens';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  cleanProgramText,
  formatCapesRating,
  formatInstitutionLabel,
  formatProgramArea,
  formatProgramLocation,
  formatProgramModality,
  formatProgramType,
  formatResearchLinesCount,
  formatResearchersCount,
  programHref,
  resolveProgramAreaColor,
  type ProgramCardData,
} from '../model';

export interface ProgramCardProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'children'
> {
  program: ProgramCardData;
  /** Rótulo da instituição quando o item vier sem `institution` expandida. */
  institutionLabel?: string | null;
  /** Contagem de docentes vinculados quando `program.counts` não estiver presente. */
  researchersCount?: number | null;
  /** Contagem de linhas de pesquisa quando `program.research_lines` não estiver presente. */
  researchLinesCount?: number | null;
  /** Disposição em grade (`grid`) ou compacta horizontal para painéis estreitos (`compact`). */
  layout?: 'grid' | 'compact';
}

/**
 * Cartão de programa de pós-graduação (`sc-entity` em `design-kit/reference/components.md`).
 * Card plano sem sombra, ícone `GraduationCap` em quadrado 56px, conceito CAPES,
 * modalidade, área e metadados de instituição, cidade e contagens.
 */
export function ProgramCard({
  program,
  institutionLabel,
  researchersCount,
  researchLinesCount,
  layout = 'grid',
  className,
  ...props
}: ProgramCardProps) {
  const isCompact = layout === 'compact';
  const acronym = cleanProgramText(program.acronym);
  const showAcronym =
    acronym !== null &&
    acronym.toLowerCase() !== program.name.trim().toLowerCase();

  const capesLabel = formatCapesRating(program.rating);
  const modalityLabel =
    formatProgramModality(program.modality) ?? formatProgramType(program.type);
  const areaLabel = formatProgramArea(program.area);
  const areaColor = areaLabel ? resolveProgramAreaColor(program.area) : null;
  const useOutlineArea =
    areaColor !== null &&
    (Boolean(areaColor.light) || areaColor.bg === FALLBACK_COLOR.bg);

  const resolvedInstitution =
    cleanProgramText(institutionLabel) ??
    formatInstitutionLabel(program.institution);
  const location = formatProgramLocation(program.city, program.state);

  const resolvedResearchersCount =
    researchersCount ?? program.counts?.researchers ?? null;
  const researchersText = formatResearchersCount(resolvedResearchersCount);

  const resolvedLinesCount =
    researchLinesCount ?? program.research_lines?.length ?? null;
  const linesText = formatResearchLinesCount(resolvedLinesCount);

  const hasBadges =
    capesLabel !== null || modalityLabel !== null || areaLabel !== null;
  const hasMeta =
    resolvedInstitution !== null ||
    location !== null ||
    researchersText !== null ||
    linesText !== null;

  return (
    // TODO(T5): migrar para <Link to="/pos-graduacao/$id">
    <a
      data-slot="program-card"
      data-layout={layout}
      href={programHref(program.id)}
      className={cn(
        'group flex rounded-lg border bg-card text-card-foreground transition-colors hover:border-eng-blue',
        isCompact
          ? 'flex-row items-start gap-2.5 p-2.5 text-left'
          : 'flex-col items-center gap-3 p-6 text-center',
        focusRing,
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          'grid shrink-0 place-items-center rounded-md border bg-card text-muted-foreground transition-colors group-hover:text-eng-blue',
          isCompact ? 'size-9' : 'size-14',
        )}
      >
        <GraduationCap className={isCompact ? 'size-4' : 'size-6'} />
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          isCompact ? 'gap-1.5' : 'w-full items-center gap-3',
        )}
      >
        <div
          className={cn(
            'flex w-full min-w-0 flex-col gap-0.5',
            !isCompact && 'items-center gap-1',
          )}
        >
          {showAcronym && (
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              {acronym}
            </span>
          )}
          <p
            className={cn(
              'line-clamp-2 leading-snug font-semibold text-foreground transition-colors group-hover:text-eng-blue',
              isCompact ? 'text-sm' : 'text-base',
            )}
          >
            {program.name}
          </p>
        </div>

        {hasBadges && (
          <div
            className={cn(
              'flex max-w-full flex-wrap items-center gap-1.5',
              !isCompact && 'justify-center',
            )}
          >
            {capesLabel && <Tag variant="brand">{capesLabel}</Tag>}
            {modalityLabel && (
              <Badge variant="outline" size="sm">
                {modalityLabel}
              </Badge>
            )}
            {areaLabel &&
              areaColor &&
              (useOutlineArea ? (
                <Badge
                  variant="outline"
                  size="sm"
                  className="max-w-full text-foreground uppercase"
                >
                  <Dot className={areaColor.bg} />
                  <span className="truncate">{areaLabel}</span>
                </Badge>
              ) : (
                <Badge
                  size="sm"
                  className={cn(areaColor.bg, 'max-w-full uppercase')}
                >
                  <span className="truncate">{areaLabel}</span>
                </Badge>
              ))}
          </div>
        )}

        {hasMeta && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground',
              !isCompact && 'mt-auto justify-center gap-y-1.5 pt-1',
            )}
          >
            {resolvedInstitution && (
              <span className="inline-flex max-w-full items-center gap-1">
                <Building2 className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{resolvedInstitution}</span>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3 shrink-0" aria-hidden />
                <span>{location}</span>
              </span>
            )}
            {!isCompact && researchersText && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3 shrink-0" aria-hidden />
                <span>{researchersText}</span>
              </span>
            )}
            {!isCompact && linesText && (
              <span className="inline-flex items-center gap-1">
                <TextSearch className="size-3 shrink-0" aria-hidden />
                <span>{linesText}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
