import type { ComponentProps } from 'react';
import { Building2, GraduationCap, MapPin, Star, Users } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { EntityCard, type EntityCardMetaItem } from '@/shared/ui/entity-card';
import {
  locationLabel,
  modalityLabel,
  ratingLabel,
  researcherCountLabel,
  type GraduateProgramDetail,
  type GraduateProgramSummary,
} from '../model';
import { ProgramRef } from './program-ref';

/**
 * Item da lista ou detalhe. A lista não traz instituição nem contagens: quem
 * tiver o nome da instituição por outra via pode passá-lo em `institution`.
 */
export type ProgramCardData = GraduateProgramSummary &
  Partial<Pick<GraduateProgramDetail, 'institution' | 'counts'>>;

/** Metadados do card, na ordem em que aparecem. */
function programCardMeta(program: ProgramCardData): EntityCardMetaItem[] {
  const institution = program.institution;
  const location = locationLabel(program);
  const rating = ratingLabel(program.rating);
  const meta: EntityCardMetaItem[] = [];
  if (institution) {
    meta.push({
      icon: Building2,
      label: institution.acronym?.trim() || institution.name,
    });
  }
  if (location) meta.push({ icon: MapPin, label: location });
  if (rating) meta.push({ icon: Star, label: rating });
  if (program.counts) {
    meta.push({
      icon: Users,
      label: researcherCountLabel(program.counts.researchers),
    });
  }
  return meta;
}

/**
 * Card do programa de pós-graduação (`sc-entity`), sobre o `EntityCard`.
 * O card inteiro leva ao detalhe: o link é o nome, esticado sobre o card.
 */
export function ProgramCard({
  program,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  program: ProgramCardData;
}) {
  const modality = modalityLabel(program.modality);
  const area = program.area?.trim();

  return (
    <EntityCard
      data-entity="graduate-program"
      icon={GraduationCap}
      name={
        <ProgramRef
          program={program}
          className="after:absolute after:inset-0 after:rounded-lg"
        />
      }
      meta={programCardMeta(program)}
      className={cn(
        'relative transition-colors hover:border-neutral-300 dark:hover:border-neutral-700',
        className,
      )}
      {...props}
    >
      {(modality ?? area) && (
        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          {[modality, area].filter(Boolean).join(' · ')}
        </p>
      )}
    </EntityCard>
  );
}
