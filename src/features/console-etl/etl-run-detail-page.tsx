import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileText, Layers } from 'lucide-react';
import {
  formatShortRunId,
  isEtlRunActive,
  type EtlRunDetailSearch,
} from '@/entities/etl/model';
import { etlRunQueryOptions } from '@/entities/etl/queries';
import { Button } from '@/shared/ui/button';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { SectionError } from '@/shared/ui/section-error';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { EtlHeaderSummary } from './etl-header-summary';
import { EtlLogsViewer } from './etl-logs-viewer';
import { EtlStepper } from './etl-stepper';

const ACTIVE_RUN_POLL_MS = 4_000;

export interface EtlRunDetailPageProps {
  runId: string;
  search: EtlRunDetailSearch;
}

/** Detalhes de uma execução do ETL (`/console/etl/$runId`). */
export function EtlRunDetailPage({ runId, search }: EtlRunDetailPageProps) {
  const navigate = useNavigate({ from: '/console/etl/$runId' });

  const query = useQuery({
    ...etlRunQueryOptions(runId),
    refetchInterval: (q) =>
      isEtlRunActive(q.state.data?.status) ? ACTIVE_RUN_POLL_MS : false,
  });

  function updateSearch(patch: Partial<EtlRunDetailSearch>) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  }

  const run = query.data;
  const active = isEtlRunActive(run?.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link to="/console/etl" search={{ page: 1, per_page: 20 }}>
                <ArrowLeft aria-hidden />
                Voltar ao histórico
              </Link>
            </Button>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Execução {formatShortRunId(runId)}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">{runId}</p>
        </div>
      </div>

      {query.isPending ? (
        <LoadingBlock
          title="Carregando execução..."
          caption="Consultando o status do pipeline"
        />
      ) : query.isError ? (
        <SectionError
          title="Não foi possível carregar a execução"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : run ? (
        <>
          <EtlHeaderSummary run={run} />

          <Tabs
            value={search.tab}
            onValueChange={(value) =>
              updateSearch({ tab: value as EtlRunDetailSearch['tab'] })
            }
          >
            <TabsList>
              <TabsTrigger value="etapas">
                <Layers aria-hidden />
                Etapas
              </TabsTrigger>
              <TabsTrigger value="logs">
                <FileText aria-hidden />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="etapas">
              <EtlStepper run={run} />
            </TabsContent>

            <TabsContent value="logs">
              <EtlLogsViewer
                runId={runId}
                isActive={active}
                level={search.level}
                q={search.q}
                onFilterChange={updateSearch}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
