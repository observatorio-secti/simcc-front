import { useMemo } from 'react';
import { Cloud } from 'lucide-react';
import type { ResearcherTerm } from '@/entities/researcher/model';
import { formatCount } from '@/entities/researcher/model';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  computeTermCloudLayout,
  DEFAULT_MAX_TERMS,
  TERM_CLOUD_HEIGHT,
  TERM_CLOUD_WIDTH,
} from './term-cloud-layout';

export interface TermCloudProps {
  terms: readonly ResearcherTerm[];
  isLoading?: boolean;
  isError?: boolean;
  maxTerms?: number;
}

/**
 * Nuvem de termos mais frequentes nos títulos das produções (`/v2/researcher/{id}/terms`).
 */
export function TermCloud({
  terms,
  isLoading,
  isError,
  maxTerms = DEFAULT_MAX_TERMS,
}: TermCloudProps) {
  const placedTerms = useMemo(
    () => computeTermCloudLayout(terms, { maxTerms }),
    [terms, maxTerms],
  );

  if (isError) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Cloud className="size-5 text-muted-foreground" aria-hidden />
          Nuvem de termos
        </h2>
        <Card className="p-4">
          <Skeleton className="h-[220px] w-full rounded-md" />
        </Card>
      </section>
    );
  }

  if (placedTerms.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Cloud className="size-5 text-muted-foreground" aria-hidden />
        Nuvem de termos
      </h2>
      <Card className="p-3">
        <svg
          viewBox={`0 0 ${TERM_CLOUD_WIDTH} ${TERM_CLOUD_HEIGHT}`}
          role="img"
          aria-label="Nuvem de termos mais frequentes nas produções"
          className="h-auto w-full select-none"
        >
          {placedTerms.map((item) => (
            <g
              key={item.term}
              transform={`translate(${item.x}, ${item.y}) rotate(${item.rotate})`}
            >
              <title>{`${item.term} (${formatCount(item.frequency)} ocorrências)`}</title>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={item.fontSize}
                fontWeight={item.fontWeight}
                className={cn(
                  'fill-current capitalize transition-opacity hover:opacity-75',
                  item.colorClass,
                )}
              >
                {item.term}
              </text>
            </g>
          ))}
        </svg>
      </Card>
    </section>
  );
}
