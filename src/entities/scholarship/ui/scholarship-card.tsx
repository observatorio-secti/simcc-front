import { Building2, HandCoins } from 'lucide-react';
import { ResearcherRef } from '@/entities/researcher/ui/researcher-ref';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import {
  formatScholarshipLevel,
  formatScholarshipModality,
  formatScholarshipQuantities,
  scholarshipModalityColor,
  type Scholarship,
} from '../model';

export interface ScholarshipModalityBadgeProps {
  modality: string | null | undefined;
  size?: 'default' | 'sm';
  className?: string;
}

/**
 * Marcador da modalidade pelo dicionário `bolsa-*` (PQ, DT). As cores das
 * bolsas são vivas: ficam no `Dot`, com o rótulo ao lado (`DESIGN.md` §2.4).
 */
export function ScholarshipModalityBadge({
  modality,
  size = 'default',
  className,
}: ScholarshipModalityBadgeProps) {
  const color = scholarshipModalityColor(modality);
  return (
    <Badge
      variant="outline"
      size={size}
      data-slot="scholarship-modality"
      className={cn('text-foreground', className)}
    >
      <Dot className={cn(color.bg, size === 'sm' && 'size-2')} />
      <span className="truncate">{color.label}</span>
    </Badge>
  );
}

export interface ScholarshipCardProps {
  scholarship: Scholarship;
  className?: string;
}

/**
 * Card do bolsista: borda lateral pela modalidade, pesquisador (link para o
 * perfil), modalidade, nível, instituição e chamada.
 */
export function ScholarshipCard({
  scholarship,
  className,
}: ScholarshipCardProps) {
  const color = scholarshipModalityColor(scholarship.modality);
  const modality = formatScholarshipModality(scholarship);
  const level = formatScholarshipLevel(scholarship.category_level);
  const quantities = formatScholarshipQuantities(scholarship);
  const institute = scholarship.institute?.trim() || null;
  const call = [scholarship.funding_program, scholarship.call_title]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      data-slot="scholarship-card"
      className={cn(
        'min-w-0 gap-3 border-l-[6px] p-4',
        color.borderLeft,
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <HandCoins className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{modality}</span>
        </span>
        {level && (
          <Badge variant="outline" size="sm" className="text-foreground">
            {level}
          </Badge>
        )}
      </div>

      <ResearcherRef
        researcher={scholarship.researcher}
        className="text-base font-semibold"
      />

      {(institute || call) && (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {institute && (
            <span className="inline-flex min-w-0 items-start gap-1.5">
              <Building2 className="mt-px size-3 shrink-0" aria-hidden />
              <span className="break-words">{institute}</span>
            </span>
          )}
          {call && <span className="break-words">{call}</span>}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <ScholarshipModalityBadge modality={scholarship.modality} />
        {quantities && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {quantities}
          </span>
        )}
      </div>
    </Card>
  );
}
