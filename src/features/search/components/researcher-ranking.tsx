import { useState } from 'react';
import { ListOrdered } from 'lucide-react';
import {
  researcherHref,
  type ResearcherSummary,
} from '@/entities/researcher/model';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import { SectionHeader } from '@/shared/ui/section-header';
import { Skeleton } from '@/shared/ui/skeleton';
import { isPlainLeftClick } from '../researcher-links';
import { searchTypeBgClass, type SearchType } from '../search-schema';

const MIN_REM = 0.75;
const MAX_REM = 1.5;

export interface ResearcherRankingProps {
  researchers: readonly ResearcherSummary[];
  type: SearchType;
  loading: boolean;
  onOpenResearcher: (id: string) => void;
}

/**
 * Ranking "pesquisadores com mais ocorrências" (`sc-rank`): chips na cor do
 * tipo de busca, com fonte proporcional à contagem de evidências.
 */
export function ResearcherRanking({
  researchers,
  type,
  loading,
  onOpenResearcher,
}: ResearcherRankingProps) {
  const [open, setOpen] = useState(true);
  const ranked = researchers.filter((item) => (item.matches?.total ?? 0) > 0);
  const max = Math.max(1, ...ranked.map((item) => item.matches?.total ?? 0));

  if (!loading && ranked.length === 0) return null;

  return (
    <section className="flex flex-col gap-4" aria-busy={loading || undefined}>
      <SectionHeader
        icon={ListOrdered}
        title="Pesquisadores com mais ocorrências"
        open={open}
        onOpenChange={setOpen}
        controls="results-ranking"
      />
      {open && (
        <ol id="results-ranking" className="flex flex-wrap items-center gap-2">
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="h-8 w-36" />
                </li>
              ))
            : ranked.map((researcher) => {
                const total = researcher.matches?.total ?? 0;
                const weight = total / max;
                return (
                  <li key={researcher.id}>
                    <a
                      href={researcherHref(researcher.id)}
                      onClick={(event) => {
                        if (!isPlainLeftClick(event)) return;
                        event.preventDefault();
                        onOpenResearcher(researcher.id);
                      }}
                      style={{
                        fontSize: `${MIN_REM + (MAX_REM - MIN_REM) * weight}rem`,
                      }}
                      className={cn(
                        'inline-flex items-baseline gap-1.5 rounded-md px-4 py-1.5 leading-tight font-semibold text-white transition-opacity hover:opacity-90',
                        searchTypeBgClass(type),
                        focusRing,
                      )}
                    >
                      {researcher.name}
                      <small className="text-xs font-medium tabular-nums opacity-90">
                        {total.toLocaleString('pt-BR')}
                      </small>
                    </a>
                  </li>
                );
              })}
        </ol>
      )}
    </section>
  );
}
