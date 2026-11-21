import { useState } from 'react';
import { AlertCircle, BarChart3, RotateCcw } from 'lucide-react';
import type { ProductionKind } from '@/entities/production/model';
import { PRODUCTION_REGISTRY } from '@/entities/production/registry';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { SectionHeader } from '@/shared/ui/section-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import type { SeriesSummary } from './metrics';

const numberFormat = new Intl.NumberFormat('pt-BR');
const percentFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface ProductionSeriesChartProps {
  kind: ProductionKind;
  summary: SeriesSummary;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

/**
 * Exibe a série anual de `/v2/metrics/production/{kind}` como gráfico de barras
 * verticais e tabela complementar, com estados de carregamento, erro e vazio.
 */
export function ProductionSeriesChart({
  kind,
  summary,
  isLoading,
  isError,
  errorMessage,
  hasActiveFilters,
  onRetry,
  onClearFilters,
}: ProductionSeriesChartProps) {
  const [open, setOpen] = useState(true);
  const definition = PRODUCTION_REGISTRY[kind];
  const barColorClass = definition.color.light
    ? 'bg-eng-blue'
    : definition.color.bg;
  const maxValue = summary.peakValue > 0 ? summary.peakValue : 1;

  return (
    <section
      aria-labelledby="series-section-heading"
      className="flex flex-col gap-3"
    >
      <SectionHeader
        id="series-section-heading"
        title={`Série histórica — ${definition.title}`}
        icon={BarChart3}
        open={open}
        onOpenChange={setOpen}
        controls="series-section-content"
      />

      {open && (
        <div id="series-section-content" className="flex flex-col gap-4">
          {isLoading ? (
            <LoadingBlock
              title="Processando sua solicitação..."
              caption="Buscando série histórica de produção, aguarde um instante"
            />
          ) : isError ? (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="mt-0.5 size-5 shrink-0 text-destructive"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-destructive">
                      Não foi possível carregar os indicadores
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {errorMessage ||
                        'Ocorreu um erro ao consultar a API de métricas.'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RotateCcw className="size-4" aria-hidden />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : summary.points.length === 0 ? (
            <Card>
              <CardContent className="p-2">
                <EmptyState
                  title="Nenhum registro encontrado para este recorte"
                  description={
                    hasActiveFilters
                      ? 'Ajuste ou limpe os filtros aplicados para visualizar a série completa.'
                      : 'Ainda não há dados disponíveis na base v2 para este tipo de produção.'
                  }
                  action={
                    hasActiveFilters ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                      >
                        Limpar filtros
                      </Button>
                    ) : undefined
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Evolução anual ({definition.noun[1]})
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={cn('size-2.5 rounded-full', barColorClass)}
                      aria-hidden
                    />
                    <span>{definition.title}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    role="img"
                    aria-label={`Gráfico de barras de ${definition.title} por ano`}
                    className="overflow-x-auto pb-2"
                  >
                    <div className="flex h-60 min-w-max items-end gap-3 pt-6">
                      {summary.points.map((point) => {
                        const ratio = point.value / maxValue;
                        const heightPct = Math.max(
                          point.value > 0 ? Math.round(ratio * 100) : 0,
                          point.value > 0 ? 6 : 2,
                        );
                        return (
                          <div
                            key={point.period}
                            className="flex h-full min-w-11 flex-1 flex-col items-center justify-end gap-1.5"
                          >
                            <span className="text-xs font-medium text-muted-foreground tabular-nums">
                              {numberFormat.format(point.value)}
                            </span>
                            <div className="flex w-full flex-1 items-end justify-center">
                              <div
                                className={cn(
                                  'w-full max-w-10 rounded-t-xs transition-all',
                                  barColorClass,
                                )}
                                style={{ height: `${heightPct}%` }}
                                title={`${point.period}: ${numberFormat.format(point.value)}`}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {point.period}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Detalhamento por ano
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ano</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.points.map((point) => {
                        const pct =
                          summary.total > 0
                            ? (point.value / summary.total) * 100
                            : 0;
                        return (
                          <TableRow key={point.period}>
                            <TableCell className="font-medium tabular-nums">
                              {point.period}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {numberFormat.format(point.value)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground tabular-nums">
                              {percentFormat.format(pct)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
