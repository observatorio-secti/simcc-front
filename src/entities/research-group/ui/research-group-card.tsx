import {
  BookOpen,
  Building2,
  FlaskConical,
  MapPin,
  User,
  Users,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import {
  formatGroupLeaders,
  formatGroupLocation,
  formatLinesLabel,
  formatMembersLabel,
  researchGroupHref,
  resolveGroupArea,
  type ResearchGroup,
} from '../model';

export interface ResearchGroupCardProps {
  group: ResearchGroup;
  href?: string;
  className?: string;
}

/**
 * Card de grupo de pesquisa no padrão `sc-entity` (`design-kit/reference/components.md`):
 * card plano com borda, ícone `FlaskConical` em quadrado 56px, área via
 * `areaColor`, instituição, líderes e contagens de membros e linhas.
 */
export function ResearchGroupCard({
  group,
  href,
  className,
}: ResearchGroupCardProps) {
  const targetHref = href ?? researchGroupHref(group.id);
  const resolvedArea = resolveGroupArea(group);
  const leadersText = formatGroupLeaders(group.leaders);
  const institutionText =
    group.institutionLabel || group.institutionAcronym || null;
  const locationText = formatGroupLocation(group.address);

  return (
    <Card
      className={cn(
        'relative h-full transition-colors hover:border-neutral-300 dark:hover:border-neutral-700',
        className,
      )}
    >
      <CardContent className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
        <div
          data-slot="entity-icon"
          className="grid size-14 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground"
        >
          <FlaskConical className="size-6" aria-hidden />
        </div>

        {resolvedArea &&
          (!resolvedArea.matched || resolvedArea.color.light ? (
            <Badge
              variant="outline"
              className="max-w-full uppercase"
              title={resolvedArea.label}
            >
              <Dot className={resolvedArea.color.bg} />
              <span className="truncate">{resolvedArea.label}</span>
            </Badge>
          ) : (
            <Badge
              className={cn(resolvedArea.color.bg, 'max-w-full uppercase')}
              title={resolvedArea.label}
            >
              <span className="truncate">{resolvedArea.label}</span>
            </Badge>
          ))}

        <h3 className="text-base leading-snug font-semibold text-foreground">
          {/* TODO(T6): migrar para <Link to="/grupos-pesquisa/$id"> */}
          <a
            href={targetHref}
            className="rounded-sm after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
          >
            {group.name}
          </a>
        </h3>

        {institutionText && (
          <p
            className="flex max-w-full items-center justify-center gap-1.5 text-xs text-muted-foreground"
            title={institutionText}
          >
            <Building2 className="size-3 shrink-0" aria-hidden />
            <span className="line-clamp-2 min-w-0 break-words">
              {institutionText}
            </span>
          </p>
        )}

        {leadersText && (
          <p
            className="flex max-w-full items-center justify-center gap-1.5 text-xs text-muted-foreground"
            title={leadersText}
          >
            <User className="size-3 shrink-0" aria-hidden />
            <span className="line-clamp-2 min-w-0 break-words">
              {leadersText}
            </span>
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3 shrink-0" aria-hidden />
            {formatMembersLabel(group.memberCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3 shrink-0" aria-hidden />
            {formatLinesLabel(group.researchLineCount)}
          </span>
          {locationText && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 shrink-0" aria-hidden />
              {locationText}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
