import type { ComponentProps, ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  locationLabel,
  modalityLabel,
  programSiteUrl,
  programStartLabel,
  researcherCountLabel,
  type GraduateProgramDetail,
} from '../model';

const linkClass = cn(
  'rounded-sm break-all text-eng-blue underline-offset-4 hover:underline dark:text-foreground',
  focusRing,
);

function institutionLabel(
  institution: GraduateProgramDetail['institution'],
): string | null {
  if (!institution) return null;
  const acronym = institution.acronym?.trim();
  return acronym ? `${institution.name} (${acronym})` : institution.name;
}

/**
 * Ficha do programa no detalhe: instituição, tipo, modalidade, conceito,
 * área, localização, coordenação e contato. Campos vazios não aparecem.
 *
 * A instituição é só o nome que o detalhe traz; quando a entidade
 * instituição existir, a tela pode trocar pelo `InstitutionRef`.
 */
export function ProgramFacts({
  program,
  className,
  ...props
}: Omit<ComponentProps<'dl'>, 'children'> & {
  program: GraduateProgramDetail;
}) {
  const site = programSiteUrl(program.site);
  const email = program.email?.trim();
  const phone = program.phone?.trim();

  const facts: [string, ReactNode][] = [
    ['Instituição', institutionLabel(program.institution)],
    ['Tipo', program.type],
    ['Modalidade', modalityLabel(program.modality)],
    ['Conceito CAPES', program.rating],
    ['Área de avaliação', program.area],
    ['Localização', locationLabel(program)],
    ['Início', programStartLabel(program.start)],
    ['Código CAPES', program.code],
    ['Coordenação', program.coordinator],
    [
      'Pesquisadores',
      program.counts ? researcherCountLabel(program.counts.researchers) : null,
    ],
    [
      'Site',
      site && (
        <a
          href={site}
          target="_blank"
          rel="noreferrer"
          className={cn(linkClass, 'inline-flex items-center gap-1')}
        >
          {program.site?.trim()}
          <ExternalLink className="size-3 shrink-0" aria-hidden />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      ),
    ],
    [
      'E-mail',
      email && (
        <a href={`mailto:${email}`} className={linkClass}>
          {email}
        </a>
      ),
    ],
    ['Telefone', phone],
  ];

  return (
    <dl
      data-slot="program-facts"
      className={cn('grid gap-x-6 gap-y-4 sm:grid-cols-2', className)}
      {...props}
    >
      {facts
        .filter(([, value]) =>
          typeof value === 'string' ? value.trim() !== '' : Boolean(value),
        )
        .map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm break-words">{value}</dd>
          </div>
        ))}
    </dl>
  );
}
