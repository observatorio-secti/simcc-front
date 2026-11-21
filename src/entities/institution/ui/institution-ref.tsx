import type { ComponentProps } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  formatInstitutionName,
  institutionPath,
  resolveInstitutionAcronym,
  stripAcronymFromName,
  type InstitutionSummary,
} from '../model';

export interface InstitutionRefProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'children'
> {
  institution: Pick<InstitutionSummary, 'id' | 'name' | 'acronym'>;
  /**
   * `full` (padrão): sigla · nome; `acronym`: só a sigla (com fallback para
   * o nome); `name`: nome completo formatado.
   */
  display?: 'full' | 'acronym' | 'name';
  /** Exibe o ícone `Building2` (14px) antes do texto. */
  showIcon?: boolean;
  href?: string;
}

/** Referência inline a uma instituição com link para a página de detalhe. */
export function InstitutionRef({
  institution,
  display = 'full',
  showIcon = false,
  href,
  className,
  title,
  ...props
}: InstitutionRefProps) {
  const acronym = resolveInstitutionAcronym(institution);
  const fullName = formatInstitutionName(institution.name);
  const cleanName = acronym
    ? stripAcronymFromName(fullName, acronym)
    : fullName;

  const showBoth =
    display === 'full' &&
    Boolean(acronym) &&
    cleanName.toUpperCase() !== acronym?.toUpperCase();

  const resolvedTitle =
    title ?? (display === 'acronym' && acronym ? cleanName : undefined);

  // TODO(T4): migrar para <Link to="/instituicoes/$id">
  return (
    <a
      data-slot="institution-ref"
      href={href ?? institutionPath(institution.id)}
      title={resolvedTitle}
      className={cn(
        'inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-xs text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-eng-blue hover:underline',
        focusRing,
        className,
      )}
      {...props}
    >
      {showIcon && (
        <Building2
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
      {display === 'acronym' ? (
        <span>{acronym ?? fullName}</span>
      ) : display === 'name' ? (
        <span>{fullName}</span>
      ) : showBoth ? (
        <>
          <span className="font-semibold">{acronym}</span>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <span>{cleanName}</span>
        </>
      ) : (
        <span>{fullName}</span>
      )}
    </a>
  );
}
