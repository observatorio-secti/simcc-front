import { Cloud } from 'lucide-react';
import type { ResearcherTerm } from '@/entities/researcher/model';
import { formatCount } from '@/entities/researcher/model';
import { cn } from '@/shared/lib/cn';
import { Tag } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export interface TermCloudProps {
  terms: readonly ResearcherTerm[];
  isLoading?: boolean;
  isError?: boolean;
}

function getTermTierClass(frequency: number, maxFrequency: number): string {
  if (maxFrequency <= 1) return 'text-xs font-medium';
  const ratio = frequency / maxFrequency;
  if (ratio >= 0.75) return 'text-sm font-semibold text-foreground';
  if (ratio >= 0.45) return 'text-xs font-semibold text-foreground';
  return 'text-xs font-normal text-muted-foreground';
}

/**
 * Nuvem de termos mais frequentes nos títulos das produções (`/v2/researcher/{id}/terms`).
 */
export function TermCloud({ terms, isLoading, isError }: TermCloudProps) {
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
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-18" />
          </div>
        </Card>
      </section>
    );
  }

  if (terms.length === 0) {
    return null;
  }

  const maxFrequency = Math.max(1, ...terms.map((item) => item.frequency));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Cloud className="size-5 text-muted-foreground" aria-hidden />
        Nuvem de termos
      </h2>
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {terms.map((item) => (
            <Tag
              key={item.term}
              variant="outline"
              title={`${item.term} (${formatCount(item.frequency)} ocorrências)`}
              className={cn(
                'capitalize',
                getTermTierClass(item.frequency, maxFrequency),
              )}
            >
              <span>{item.term}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {formatCount(item.frequency)}
              </span>
            </Tag>
          ))}
        </div>
      </Card>
    </section>
  );
}
