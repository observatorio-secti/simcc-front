import { useState, type ReactNode } from 'react';
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  GraduationCap,
  Link2,
  MapPin,
  Minus,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  areaColor,
  qualisColor,
  searchTypeColor,
} from '@/shared/lib/design-tokens';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  ABSTRACT_COLLAPSE_THRESHOLD,
  extractAffiliationCities,
  formatAffiliationNames,
  formatLattesUpdate,
  lattesProfileUrl,
  linkedinSearchUrl,
  normalizeOrcid,
  normalizeResearcherText,
  orcidProfileUrl,
  scopusProfileUrl,
  splitHighlightSegments,
  type ResearcherDetail,
} from '../model';
import { OrcidIcon } from './orcid-icon';
import { ResearcherAvatar } from './researcher-avatar';

export interface ResearcherProfileHeaderProps {
  researcher: ResearcherDetail;
  /** Grandes áreas de atuação, quando disponíveis. */
  areas?: readonly string[];
  /** Situação do pesquisador, quando informada. */
  active?: boolean;
  /** Termo buscado para destaque no resumo. */
  highlightQuery?: string | readonly string[];
  /** Tipo de busca que define a cor do destaque no resumo (padrão: `profile`). */
  searchType?: string | null;
  /** Ações exibidas no canto superior direito (ex.: abrir, mais). */
  actions?: ReactNode;
  /** Oculta avatar, barra superior, nome e instituição (quando já exibidos no header do overlay). */
  hideIdentity?: boolean;
  className?: string;
}

/** Ícone LinkedIn compatível com o traço 2px do sprite Lucide do design kit. */
function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0"
      aria-hidden
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

/**
 * Cabeçalho de perfil do pesquisador (`design-kit/reference/components.md`).
 * Avatar sobreposto 96px, barra superior, nome, instituição, badges e resumo expansível.
 */
export function ResearcherProfileHeader({
  researcher,
  areas,
  active,
  highlightQuery,
  searchType = 'profile',
  actions,
  hideIdentity = false,
  className,
}: ResearcherProfileHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  const lattesUpdate = formatLattesUpdate(researcher.lattes_update);
  const affiliationNames = formatAffiliationNames(researcher.affiliations);
  const cities = extractAffiliationCities(researcher.affiliations);
  const graduation = researcher.graduation?.trim() || null;

  const orcid = normalizeOrcid(researcher.identifiers.orcid);
  const orcidUrl = orcidProfileUrl(researcher.identifiers.orcid);
  const scopusUrl = scopusProfileUrl(researcher.identifiers.scopus);
  const lattesUrl = lattesProfileUrl(researcher.identifiers.lattes_id);
  const linkedinUrl = linkedinSearchUrl(researcher.name);

  const uniqueAreas = Array.from(
    new Set((areas ?? []).map((area) => area.trim()).filter(Boolean)),
  );

  const abstractText = normalizeResearcherText(
    researcher.abstract ?? researcher.abstract_ai,
  );
  const isLongAbstract = abstractText.length > ABSTRACT_COLLAPSE_THRESHOLD;
  const abstractSegments = splitHighlightSegments(abstractText, highlightQuery);
  const highlightColor = searchTypeColor(searchType);
  const profileBadgeColor = searchTypeColor('profile');
  const scopusBadgeColor = searchTypeColor('speaker');
  const lattesBadgeColor = areaColor('outros');
  const orcidBadgeColor = qualisColor('A2');

  const hasBarContent = hideIdentity
    ? active !== undefined
    : lattesUpdate !== null || active !== undefined || actions !== undefined;

  return (
    <Card
      data-slot="researcher-profile-header"
      className={cn(
        'relative items-center gap-3 text-center',
        hideIdentity
          ? 'border-0 bg-transparent p-0 shadow-none'
          : 'mt-12 px-4 pt-16 pb-6 sm:px-6',
        className,
      )}
    >
      {!hideIdentity && (
        <ResearcherAvatar
          name={researcher.name}
          imageUrl={researcher.image_url}
          size="lg"
          decorative
          className="absolute -top-12 left-1/2 -translate-x-1/2"
        />
      )}

      {hasBarContent && (
        <div className="order-first flex w-full flex-wrap items-center justify-between gap-2 md:order-none md:w-auto">
          <div className="flex flex-wrap items-center gap-2 md:absolute md:top-4 md:left-4 md:max-w-[calc(50%-64px)]">
            {!hideIdentity && lattesUpdate !== null && (
              <Tag variant="outline">
                <Calendar aria-hidden />
                <span>Atualização do Lattes: {lattesUpdate}</span>
              </Tag>
            )}
            {active !== undefined && (
              <Badge
                size="sm"
                className={active ? 'bg-green-500' : 'bg-red-500'}
              >
                {active ? <Check aria-hidden /> : <Minus aria-hidden />}
                {active ? 'Ativo' : 'Inativo'}
              </Badge>
            )}
          </div>
          {!hideIdentity && actions !== undefined && (
            <div className="ml-auto flex flex-wrap items-center gap-1.5 md:absolute md:top-4 md:right-4 md:max-w-[calc(50%-64px)]">
              {actions}
            </div>
          )}
        </div>
      )}

      {!hideIdentity && (
        <>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {researcher.name}
          </h1>

          {affiliationNames && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:text-base">
              <Building2 className="size-4 shrink-0" aria-hidden />
              <span>{affiliationNames}</span>
            </p>
          )}
        </>
      )}

      <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2">
        {uniqueAreas.map((area) => {
          const color = areaColor(area);
          if (color.light) {
            return (
              <Badge key={area} variant="outline" className="uppercase">
                <Dot className={color.bg} />
                {area}
              </Badge>
            );
          }
          return (
            <Badge key={area} className={cn(color.bg, 'uppercase')}>
              {area}
            </Badge>
          );
        })}

        {graduation !== null && (
          <Badge className={profileBadgeColor.bg}>
            <GraduationCap aria-hidden />
            {graduation}
          </Badge>
        )}

        {cities.map((city) => (
          <Badge key={city} className={profileBadgeColor.bg}>
            <MapPin aria-hidden />
            {city}
          </Badge>
        ))}

        {orcid !== null && orcidUrl !== null && (
          <Badge
            asChild
            className={cn(
              orcidBadgeColor.bg,
              focusRing,
              'transition-opacity hover:opacity-90',
            )}
          >
            <a href={orcidUrl} target="_blank" rel="noopener noreferrer">
              <OrcidIcon aria-hidden />
              Orcid: {orcid}
            </a>
          </Badge>
        )}

        {scopusUrl !== null && (
          <Badge
            asChild
            className={cn(
              scopusBadgeColor.bg,
              focusRing,
              'transition-opacity hover:opacity-90',
            )}
          >
            <a href={scopusUrl} target="_blank" rel="noopener noreferrer">
              <Link2 aria-hidden />
              Scopus
            </a>
          </Badge>
        )}

        {lattesUrl !== null && (
          <Badge
            asChild
            className={cn(
              lattesBadgeColor.bg,
              focusRing,
              'transition-opacity hover:opacity-90',
            )}
          >
            <a href={lattesUrl} target="_blank" rel="noopener noreferrer">
              <Link2 aria-hidden />
              Currículo Lattes
            </a>
          </Badge>
        )}

        <Badge
          asChild
          className={cn(
            profileBadgeColor.bg,
            focusRing,
            'transition-opacity hover:opacity-90',
          )}
        >
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            <LinkedinIcon />
            Pesquisar no LinkedIn
          </a>
        </Badge>
      </div>

      {abstractText && (
        <>
          <p
            className={cn(
              'w-full text-left text-sm leading-relaxed text-muted-foreground sm:text-justify',
              isLongAbstract && !expanded && 'line-clamp-3',
            )}
          >
            {abstractSegments.map((segment, index) =>
              segment.highlighted ? (
                <strong
                  key={index}
                  className={cn('font-semibold', highlightColor.text)}
                >
                  {segment.text}
                </strong>
              ) : (
                <span key={index}>{segment.text}</span>
              ),
            )}
          </p>

          {isLongAbstract && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-expanded={expanded}
              aria-label={expanded ? 'Recolher resumo' : 'Expandir resumo'}
              onClick={() => setExpanded((current) => !current)}
            >
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  expanded && 'rotate-180',
                )}
                aria-hidden
              />
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
