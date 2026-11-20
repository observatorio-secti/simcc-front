import type { ComponentProps } from 'react';
import { Calendar, TextSearch } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { researchLinePeriod, type ResearchLine } from '../model';

/**
 * Linhas de pesquisa do programa (`research_lines` do detalhe): nome, área e
 * período. Sem linhas, mostra o estado vazio do kit.
 */
export function ResearchLineList({
  lines,
  className,
  ...props
}: Omit<ComponentProps<'ul'>, 'children'> & {
  lines: readonly ResearchLine[];
}) {
  if (lines.length === 0) {
    return (
      <EmptyState
        icon={TextSearch}
        title="Nenhuma linha de pesquisa"
        description="O programa não tem linhas de pesquisa cadastradas."
        className={cn('py-8', className)}
      />
    );
  }

  return (
    <ul
      data-slot="research-line-list"
      aria-label="Linhas de pesquisa"
      className={cn('flex flex-col divide-y', className)}
      {...props}
    >
      {lines.map((line, index) => {
        const period = researchLinePeriod(line);
        const area = line.area?.trim();
        return (
          <li
            key={`${line.name}-${index}`}
            className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
          >
            <p className="text-sm font-medium">{line.name}</p>
            {(area ?? period) && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {area && <span>{area}</span>}
                {period && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3 shrink-0" aria-hidden />
                    {period}
                  </span>
                )}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
