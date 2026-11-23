import { useState, type ComponentProps } from 'react';
import {
  Building2,
  FlaskConical,
  GraduationCap,
  Microscope,
  Users,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  formatInstitutionCount,
  formatInstitutionName,
  getInstitutionLogo,
  institutionPath,
  resolveInstitutionAcronym,
  stripAcronymFromName,
  type InstitutionCounts,
  type InstitutionDetail,
  type InstitutionSummary,
} from '../model';

export interface InstitutionCardProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'children'
> {
  institution: InstitutionSummary | InstitutionDetail;
  counts?: InstitutionCounts;
  /** Contagem opcional de grupos de pesquisa (origem ODA, ADR 0007). */
  researchGroupsCount?: number | null;
  href?: string;
}

/**
 * Card centralizado de instituição no padrão `sc-entity` do Design Kit
 * (quadrado 56px para logo com fallback `Building2`, nome e contagens).
 */
export function InstitutionCard({
  institution,
  counts,
  researchGroupsCount,
  href,
  className,
  ...props
}: InstitutionCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const localLogo = getInstitutionLogo(institution);
  const remoteImage =
    !localLogo && institution.image && failedImageUrl !== institution.image
      ? institution.image
      : null;

  const acronym = resolveInstitutionAcronym(institution);
  const displayName = acronym
    ? stripAcronymFromName(institution.name, acronym)
    : formatInstitutionName(institution.name);
  const showEyebrow = Boolean(
    acronym && displayName.toUpperCase() !== acronym.toUpperCase(),
  );

  const resolvedCounts =
    counts ?? ('counts' in institution ? institution.counts : undefined);
  const hasMeta = Boolean(resolvedCounts) || researchGroupsCount != null;

  // TODO(T4): migrar para <Link to="/instituicoes/$id">
  return (
    <a
      data-slot="institution-card"
      href={href ?? institutionPath(institution.id)}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center text-card-foreground transition-colors hover:border-neutral-300 dark:hover:border-neutral-700',
        focusRing,
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-card p-1.5 text-muted-foreground',
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
            onError={() => setFailedImageUrl(remoteImage)}
            className="size-full object-contain"
          />
        ) : (
          <Building2 className="size-6 shrink-0" aria-hidden />
        )}
      </div>

      <div className="flex w-full min-w-0 flex-col items-center gap-1">
        {showEyebrow && (
          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            {acronym}
          </span>
        )}
        <h3 className="text-base leading-snug font-semibold text-balance">
          {displayName}
        </h3>
      </div>

      {hasMeta && (
        <div className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-muted-foreground">
          {resolvedCounts && (
            <>
              <span
                className="inline-flex items-center gap-1"
                title="Pesquisadores"
              >
                <Users className="size-3 shrink-0" aria-hidden />
                <span className="tabular-nums">
                  {formatInstitutionCount(resolvedCounts.researchers)}
                </span>
                <span className="sr-only"> pesquisadores</span>
              </span>
              <span
                className="inline-flex items-center gap-1"
                title="Programas de pós-graduação"
              >
                <GraduationCap className="size-3 shrink-0" aria-hidden />
                <span className="tabular-nums">
                  {formatInstitutionCount(resolvedCounts.graduate_programs)}
                </span>
                <span className="sr-only"> programas de pós-graduação</span>
              </span>
              {resolvedCounts.labs != null && resolvedCounts.labs > 0 && (
                <span
                  className="inline-flex items-center gap-1"
                  title="Laboratórios"
                >
                  <Microscope className="size-3 shrink-0" aria-hidden />
                  <span className="tabular-nums">
                    {formatInstitutionCount(resolvedCounts.labs)}
                  </span>
                  <span className="sr-only"> laboratórios</span>
                </span>
              )}
            </>
          )}
          {researchGroupsCount != null && (
            <span
              className="inline-flex items-center gap-1"
              title="Grupos de pesquisa"
            >
              <FlaskConical className="size-3 shrink-0" aria-hidden />
              <span className="tabular-nums">
                {formatInstitutionCount(researchGroupsCount)}
              </span>
              <span className="sr-only"> grupos de pesquisa</span>
            </span>
          )}
        </div>
      )}
    </a>
  );
}
