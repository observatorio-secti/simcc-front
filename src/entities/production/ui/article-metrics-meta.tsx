import { Hash, Quote } from 'lucide-react';
import { qualisColor } from '@/shared/lib/design-tokens';
import { Dot } from '@/shared/ui/badge';
import {
  formatJcr,
  formatQualisLabel,
  type ProductionMagazineRef,
} from '../model';

export interface ArticleMetricsMetaProps {
  magazine: ProductionMagazineRef | null | undefined;
  citationsCount: number;
}

/** Metadados bibliométricos de artigo: Qualis (`Dot`), JCR e citações. */
export function ArticleMetricsMeta({
  magazine,
  citationsCount,
}: ArticleMetricsMetaProps) {
  const qualis = qualisColor(magazine?.qualis ?? magazine?.qualis_status);
  const jcr = formatJcr(magazine?.jcr);

  return (
    <>
      <span className="inline-flex items-center gap-1.5">
        <Dot className={qualis.bg} />
        {formatQualisLabel(magazine)}
      </span>

      {jcr && (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Hash className="h-3 w-3 shrink-0" aria-hidden />
          JCR {jcr}
        </span>
      )}

      {citationsCount > 0 && (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Quote className="h-3 w-3 shrink-0" aria-hidden />
          Citações {citationsCount.toLocaleString('pt-BR')}
        </span>
      )}
    </>
  );
}
