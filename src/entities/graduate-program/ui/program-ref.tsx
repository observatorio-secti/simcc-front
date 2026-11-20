import type { ComponentProps, ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  cleanProgramText,
  programHref,
  type GraduateProgramRef,
} from '../model';

export interface ProgramRefProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'children'
> {
  program: Pick<GraduateProgramRef, 'id' | 'name'> & {
    acronym?: string | null;
  };
  /** Exibe o ícone padrão de pós-graduação (`GraduationCap`) antes do nome. */
  showIcon?: boolean;
  /** Exibe a sigla após o nome quando disponível e diferente do nome. */
  showAcronym?: boolean;
  /** Metadado curto ao lado do nome (ex.: tipo de vínculo ou conceito). */
  meta?: ReactNode;
}

/** Referência clicável para a página de um programa de pós-graduação. */
export function ProgramRef({
  program,
  showIcon = false,
  showAcronym = false,
  meta,
  className,
  ...props
}: ProgramRefProps) {
  const acronym = showAcronym ? cleanProgramText(program.acronym) : null;
  const distinctAcronym =
    acronym && acronym.toLowerCase() !== program.name.trim().toLowerCase()
      ? acronym
      : null;

  return (
    // TODO(T5): migrar para <Link to="/pos-graduacao/$id">
    <a
      data-slot="program-ref"
      href={programHref(program.id)}
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-eng-blue hover:underline',
        focusRing,
        className,
      )}
      {...props}
    >
      {showIcon && (
        <GraduationCap
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
      <span className="truncate">{program.name}</span>
      {distinctAcronym && (
        <span className="shrink-0 text-xs font-normal text-muted-foreground">
          ({distinctAcronym})
        </span>
      )}
      {meta != null && meta !== '' && (
        <span className="shrink-0 text-xs font-normal text-muted-foreground">
          {meta}
        </span>
      )}
    </a>
  );
}
