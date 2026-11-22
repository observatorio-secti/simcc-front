import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, RefreshCw } from 'lucide-react';
import {
  ETL_RUN_STATUS_OPTIONS,
  etlRunDurationMs,
  etlRunScopeLabel,
  etlRunsListParams,
  formatDuration,
  formatShortRunId,
  type EtlRunsSearch,
} from '@/entities/etl/model';
import { etlRunsQueryOptions } from '@/entities/etl/queries';
import { RunStatusBadge } from '@/entities/etl/ui/run-status-badge';
import { formatDateTime } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { SectionError } from '@/shared/ui/section-error';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { EtlTriggerDialog } from './etl-trigger-dialog';

const ALL_STATUSES = '__all__';

export interface EtlRunsPageProps {
  search: EtlRunsSearch;
}

/** Histórico de execuções e disparo de sincronizações (`/console/etl`). */
export function EtlRunsPage({ search }: EtlRunsPageProps) {
  const navigate = useNavigate({ from: '/console/etl/' });

  const query = useQuery({
    ...etlRunsQueryOptions(etlRunsListParams(search)),
    placeholderData: keepPreviousData,
  });

  function updateSearch(
    patch: Partial<EtlRunsSearch>,
    options: { resetPage?: boolean } = {},
  ) {
    const resetPage = options.resetPage ?? true;
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: resetPage ? 1 : (patch.page ?? prev.page),
      }),
    });
  }

  const items = query.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Sincronização (ETL)
          </h1>
          <p className="text-sm text-muted-foreground">
            Histórico de execuções do pipeline de dados e disparo de novas
            atualizações.
          </p>
        </div>
        <EtlTriggerDialog />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select
            value={search.status ?? ALL_STATUSES}
            onValueChange={(value) =>
              updateSearch({
                status: value === ALL_STATUSES ? undefined : value,
              })
            }
          >
            <SelectTrigger
              aria-label="Filtrar por status"
              className="w-44 bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>Todos os status</SelectItem>
              {ETL_RUN_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {query.isPending ? (
        <LoadingBlock
          title="Carregando execuções..."
          caption="Consultando o histórico do ETL"
        />
      ) : query.isError ? (
        <SectionError
          title="Não foi possível carregar o histórico de sincronização"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={RefreshCw}
            title={
              search.status
                ? 'Nenhuma execução com este status'
                : 'Nenhuma sincronização registrada'
            }
            description={
              search.status
                ? 'Limpe o filtro para ver todas as execuções.'
                : 'Clique em “Sincronizar agora” para iniciar o primeiro pipeline.'
            }
            action={
              search.status ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateSearch({ status: undefined })}
                >
                  Mostrar todos
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table aria-busy={query.isFetching || undefined}>
            <TableHeader>
              <TableRow>
                <TableHead>Execução</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="hidden md:table-cell">
                  Disparado por
                </TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    <Link
                      to="/console/etl/$runId"
                      params={{ runId: run.id }}
                      search={{ tab: 'etapas', level: 'all' }}
                      className="hover:underline"
                    >
                      {formatShortRunId(run.id)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <RunStatusBadge status={run.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDateTime(run.started_at)}
                  </TableCell>
                  <TableCell>{etlRunScopeLabel(run)}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatDuration(etlRunDurationMs(run))}
                  </TableCell>
                  <TableCell className="hidden max-w-44 truncate text-muted-foreground md:table-cell">
                    <span title={run.triggered_by}>
                      {run.triggered_by || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to="/console/etl/$runId"
                        params={{ runId: run.id }}
                        search={{ tab: 'etapas', level: 'all' }}
                      >
                        Ver detalhes
                        <ArrowRight aria-hidden />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {query.data && (
        <Pagination
          pagination={query.data.pagination}
          onPageChange={(page) => updateSearch({ page }, { resetPage: false })}
          onPerPageChange={(per_page) => updateSearch({ per_page })}
          disabled={query.isFetching}
        />
      )}
    </div>
  );
}
