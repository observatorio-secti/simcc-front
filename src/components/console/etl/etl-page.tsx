import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Play,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  useEtlRoutines,
  useEtlRunMonitor,
  useEtlRunsHistory,
  useTriggerEtlRun,
} from '../../../hooks/use-etl';
import { EtlHeaderSummary } from './etl-header-summary';
import { EtlStepper } from './etl-stepper';
import { EtlTechnicalSheet } from './etl-technical-sheet';
import { EtlTriggerDialog } from './etl-trigger-dialog';
import { EtlHistoryTable } from './etl-history-table';
import { TriggerRunPayload } from '../../../types/etl';

export function EtlPage() {
  const { runId: routeRunId } = useParams<{ runId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [triggerModalOpen, setTriggerModalOpen] = useState<boolean>(false);
  const [technicalSheetOpen, setTechnicalSheetOpen] = useState<boolean>(false);

  const { data: rawRoutines = [] } = useEtlRoutines();
  const {
    data: historyRuns = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useEtlRunsHistory(20);
  const triggerMutation = useTriggerEtlRun();

  useEffect(() => {
    if (routeRunId) {
      setSelectedRunId(routeRunId);
      navigate('/console/etl', { replace: true });
    }
  }, [routeRunId, navigate]);

  const queryRunId = searchParams.get('runId');
  const activeRunId = selectedRunId || queryRunId || historyRuns[0]?.id || null;

  const {
    run: activeRunDetail,
    logs,
    isLoading: isMonitorLoading,
    isPolling,
    clearLogs,
    refetchNow,
  } = useEtlRunMonitor(activeRunId);

  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId);
  };

  const handleTriggerPipeline = async (payload: TriggerRunPayload) => {
    const res = await triggerMutation.mutateAsync(payload);
    if (res?.run_id) {
      setSelectedRunId(res.run_id);
      refetchHistory();
    }
  };

  return (
    <>
      <Helmet>
        <title>Sincronização da Base | Console Simcc</title>
        <meta
          name="description"
          content="Sincronização de dados acadêmicos e atualização de currículos Lattes da plataforma Simcc"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto bg-sm-canvas min-h-screen">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sm-wave-gray pb-5">
          <div className="space-y-1">
            <p className="sm-eyebrow">OPERAÇÃO · <b>SINCRONIZAÇÃO</b></p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-sm-navy font-sans">
              Atualização de Dados
            </h1>
            <p className="text-xs md:text-sm text-sm-navy-600">
              Sincronize os currículos Lattes e consolide a produção bibliográfica e indicadores da plataforma.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchHistory();
                refetchNow();
              }}
              className="text-xs gap-1.5 h-9 border-sm-wave-gray text-sm-navy rounded-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </Button>

            <button
              type="button"
              onClick={() => setTriggerModalOpen(true)}
              disabled={triggerMutation.isPending}
              className="sm-btn text-xs py-2 px-4 gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Sincronizar Agora
            </button>
          </div>
        </div>

        {/* Execução em Foco (quando selecionada ou ativa) */}
        {activeRunDetail && (
          <div className="space-y-4">
            <EtlHeaderSummary
              run={activeRunDetail}
              isPolling={isPolling}
              onOpenTechnicalSheet={() => setTechnicalSheetOpen(true)}
            />

            <EtlStepper
              routines={activeRunDetail.routines || []}
              steps={activeRunDetail.steps || {}}
              currentRoutine={activeRunDetail.current_routine}
            />
          </div>
        )}

        {/* Histórico Recente de Execuções */}
        <EtlHistoryTable
          runs={historyRuns}
          selectedRunId={activeRunId}
          onSelectRun={handleSelectRun}
          onRefresh={refetchHistory}
          isLoading={isHistoryLoading}
        />

        {/* Modal de Disparo */}
        <EtlTriggerDialog
          open={triggerModalOpen}
          onOpenChange={setTriggerModalOpen}
          routines={rawRoutines}
          onTrigger={handleTriggerPipeline}
          isLoading={triggerMutation.isPending}
        />

        {/* Gaveta de Auditoria Técnica */}
        {activeRunDetail && (
          <EtlTechnicalSheet
            open={technicalSheetOpen}
            onOpenChange={setTechnicalSheetOpen}
            runId={activeRunDetail.id}
            logs={logs}
            onClearLogs={clearLogs}
          />
        )}
      </div>
    </>
  );
}
