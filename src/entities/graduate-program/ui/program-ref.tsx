import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  programDisplayName,
  programHref,
  type GraduateProgramRef,
} from '../model';

/**
 * Nome do programa com link para o detalhe. Aceita a referência curta
 * (`GraduateProgramRef`), o item da lista ou o detalhe.
 *
 * Enquanto a rota de detalhe (T5) não existe, é uma âncora comum para
 * `programHref(id)`; a T5 troca pelo `Link` tipado do router.
 */
export function ProgramRef({
  program,
  className,
  children,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & {
  program: Pick<GraduateProgramRef, 'id' | 'name' | 'acronym'>;
}) {
  return (
    <a
      data-slot="program-ref"
      href={programHref(program.id)}
      className={cn(
        'rounded-sm font-medium text-foreground underline-offset-4 hover:underline',
        focusRing,
        className,
      )}
      {...props}
    >
      {children ?? programDisplayName(program)}
    </a>
  );
}
