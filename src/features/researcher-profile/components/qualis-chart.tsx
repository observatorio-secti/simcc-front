import { useId, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { qualisColor } from '@/shared/lib/design-tokens';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/section-header';
import type { QualisStratum } from '../search-schema';

export interface QualisChartBucket {
  stratum: QualisStratum;
  label: string;
  count: number;
}

const CHART_STRATA: ReadonlyArray<{ stratum: QualisStratum; label: string }> = [
  { stratum: 'A1', label: 'A1' },
  { stratum: 'A2', label: 'A2' },
  { stratum: 'A3', label: 'A3' },
  { stratum: 'A4', label: 'A4' },
  { stratum: 'B1', label: 'B1' },
  { stratum: 'B2', label: 'B2' },
  { stratum: 'B3', label: 'B3' },
  { stratum: 'B4', label: 'B4' },
  { stratum: 'C', label: 'C' },
  { stratum: 'not_rated', label: 'SQ' },
];

export interface QualisChartProps {
  /** Mapa de contagem por estrato Qualis (aceita `A1`..`C`, `SQ` ou `not_rated`). */
  counts: Record<string, number>;
  /** Estratos atualmente selecionados no filtro da URL. */
  selectedQualis?: readonly QualisStratum[];
  /** Alterna um estrato ao clicar na coluna. */
  onToggleQualis?: (stratum: QualisStratum) => void;
}

/**
 * Gráfico de barras verticais por estrato Qualis (`pesquisador.html`, DESIGN.md).
 * Usa exclusivamente as cores do dicionário `qualis-*` via `design-tokens.ts`.
 */
export function QualisChart({
  counts,
  selectedQualis = [],
  onToggleQualis,
}: QualisChartProps) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  const buckets: QualisChartBucket[] = CHART_STRATA.map(
    ({ stratum, label }) => {
      const count =
        stratum === 'not_rated'
          ? (counts['not_rated'] ?? 0) +
            (counts['SQ'] ?? 0) +
            (counts['not_applicable'] ?? 0)
          : (counts[stratum] ?? 0);
      return { stratum, label, count };
    },
  );

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Gráfico de quantidade total por Qualis"
        icon={BarChart3}
        open={open}
        onOpenChange={setOpen}
        controls={contentId}
      />

      {open && (
        <Card id={contentId} className="p-4 sm:p-5">
          <div
            role="img"
            aria-label="Distribuição de artigos por estrato Qualis"
            className="grid grid-cols-10 items-end gap-2 pt-2"
          >
            {buckets.map((bucket) => {
              const color = qualisColor(
                bucket.stratum === 'not_rated' ? 'SQ' : bucket.stratum,
              );
              const heightPct =
                bucket.count > 0
                  ? Math.max(8, Math.round((bucket.count / maxCount) * 100))
                  : 3;
              const isSelected = selectedQualis.includes(bucket.stratum);
              const isDimmed = selectedQualis.length > 0 && !isSelected;

              return (
                <button
                  key={bucket.stratum}
                  type="button"
                  disabled={!onToggleQualis}
                  onClick={() => onToggleQualis?.(bucket.stratum)}
                  aria-pressed={onToggleQualis ? isSelected : undefined}
                  aria-label={`${bucket.label}: ${bucket.count} artigos`}
                  className={cn(
                    'group flex flex-col items-center gap-1.5 rounded-md py-1 outline-hidden transition-opacity focus-visible:ring-2 focus-visible:ring-ring',
                    onToggleQualis &&
                      'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    isDimmed && 'opacity-45',
                  )}
                >
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {bucket.count}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center px-1">
                    <div
                      className={cn(
                        'w-full max-w-8 rounded-t-sm transition-all',
                        color.bg,
                        isSelected && 'ring-2 ring-eng-blue ring-offset-1',
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {bucket.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </section>
  );
}
