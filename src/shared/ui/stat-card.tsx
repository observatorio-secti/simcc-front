import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Skeleton } from './skeleton';

const numberFormat = new Intl.NumberFormat('pt-BR');

/**
 * KPI do kit (`sc-card` + `sc-stat__*`). A legenda explica o recorte
 * ("encontrados na busca"). Números saem com separador de milhar.
 */
export function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  loading = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  title: React.ReactNode;
  value?: number | string | null;
  caption?: React.ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
}) {
  const formatted =
    typeof value === 'number' ? numberFormat.format(value) : (value ?? '—');

  return (
    <Card data-slot="stat-card" className={className} {...props}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <CardTitle>{title}</CardTitle>
        {Icon && (
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </CardHeader>
      <CardContent aria-busy={loading || undefined}>
        {loading ? (
          <>
            <Skeleton className="h-7 w-20" />
            <span className="sr-only">Carregando</span>
          </>
        ) : (
          <div className="text-2xl leading-tight font-bold tracking-tight tabular-nums">
            {formatted}
          </div>
        )}
        {caption && (
          <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
