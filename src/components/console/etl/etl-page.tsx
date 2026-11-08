import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Cpu,
  History,
  Layers,
  ListTree,
  Play,
  RefreshCw,
  Server,
  Terminal,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  useEtlHealth,
  useEtlRoutines,
  useEtlRunMonitor,
  useEtlRunsHistory,
  useTriggerEtlRun,
} from '../../../hooks/use-etl';
import { EtlHeaderSummary } from './etl-header-summary';
import { EtlStepper } from './etl-stepper';
import { EtlLogTerminal } from './etl-log-terminal';
import { EtlTriggerDialog } from './etl-trigger-dialog';
import { EtlHistoryTable } from './etl-history-table';
import { TriggerRunPayload } from '../../../types/etl';

export function EtlPage() {
  const { runId: routeRunId } = useParams<{ runId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('monitor');
  const [triggerModalOpen, setTriggerModalOpen] = useState<boolean>(false);

  // Queries e Mutações
  const { data: health, isLoading: isHealthLoading, isError: isHealthError } = useEtlHealth();
  const { data: routines = [] } = useEtlRoutines();
  const {
    data: historyRuns = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useEtlRunsHistory(20);
  const triggerMutation = useTriggerEtlRun();

  // Define qual run inspecionar
  const queryRunId = searchParams.get('runId');
  const activeRunId = routeRunId || queryRunId || historyRuns[0]?.id || null;

  const {
    run: activeRunDetail,
    logs,
    isLoading: isMonitorLoading,
    isPolling,
    clearLogs,
    refetchNow,
  } = useEtlRunMonitor(activeRunId);

  // Seleciona run para monitoramento
  const handleSelectRun = (runId: string) => {
    navigate(`/console/etl/${runId}`);
    setActiveTab('monitor');
  };

  // Disparo de novo pipeline
  const handleTriggerPipeline = async (payload: TriggerRunPayload) => {
    const res = await triggerMutation.mutateAsync(payload);
    if (res?.run_id) {
      navigate(`/console/etl/${res.run_id}`);
      setActiveTab('monitor');
    }
  };

  return (
    <>
      <Helmet>
        <title>Pipeline de ETL | Console Simcc</title>
        <meta
          name="description"
          content="Gerenciamento, orquestração e monitoramento em tempo real do pipeline de ETL do SimCC"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho do Módulo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-[#559FB8] text-[#07677e] dark:text-[#559FB8] bg-[#559FB8]/10 text-xs font-semibold px-2 py-0.5"
              >
                Módulo Administrativo
              </Badge>

              {/* Status do Serviço de ETL */}
              {isHealthError ? (
                <Badge
                  variant="outline"
                  className="border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/40 text-[11px] gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  Serviço ETL Indisponível
                </Badge>
              ) : health?.status === 'ok' ? (
                <Badge
                  variant="outline"
                  className="border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] gap-1 font-mono"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  ETL Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-neutral-500 text-[11px] gap-1">
                  <Server className="w-3 h-3" />
                  Verificando saúde...
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
              Gerenciamento do Pipeline SimCC ETL
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
              Coleta SOAP Lattes, orquestração Apache Hop, saneamento, indexação de
              produções e cálculo de indicadores.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchHistory();
                refetchNow();
              }}
              className="text-xs gap-1.5 h-9"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </Button>

            <Button
              size="sm"
              onClick={() => setTriggerModalOpen(true)}
              disabled={triggerMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-9 font-medium shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Iniciar Rotinas
            </Button>
          </div>
        </div>

        {/* Abas Principais: Monitoramento, Histórico e Catálogo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="monitor" className="text-xs gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#559FB8]" />
              Monitoramento Ativo
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-2">
              <History className="w-3.5 h-3.5 text-neutral-500" />
              Histórico de Execuções
            </TabsTrigger>
            <TabsTrigger value="catalog" className="text-xs gap-2">
              <ListTree className="w-3.5 h-3.5 text-neutral-500" />
              Catálogo de Rotinas ({routines.length})
            </TabsTrigger>
          </TabsList>

          {/* Aba 1: Monitoramento Ativo */}
          <TabsContent value="monitor" className="space-y-6">
            {activeRunDetail ? (
              <>
                {/* Header Summary Macro */}
                <EtlHeaderSummary run={activeRunDetail} isPolling={isPolling} />

                {/* Seção Principal: Stepper de Etapas e Terminal de Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Stepper (Coluna da Esquerda / 5 colunas em telas grandes) */}
                  <div className="lg:col-span-5 space-y-4">
                    <EtlStepper
                      routines={activeRunDetail.routines || []}
                      steps={activeRunDetail.steps || {}}
                      currentRoutine={activeRunDetail.current_routine}
                    />
                  </div>

                  {/* Terminal de Logs (Coluna da Direita / 7 colunas em telas grandes) */}
                  <div className="lg:col-span-7 space-y-4">
                    <EtlLogTerminal
                      runId={activeRunDetail.id}
                      logs={logs}
                      onClearLogs={clearLogs}
                    />
                  </div>
                </div>
              </>
            ) : isMonitorLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-neutral-500">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#559FB8] border-t-transparent" />
                <p className="text-xs">Sincronizando execução do pipeline...</p>
              </div>
            ) : (
              <div className="p-12 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-center space-y-4 bg-white dark:bg-neutral-900">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Nenhuma execução selecionada
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Inicie um novo ciclo de rotinas pelo botão acima ou escolha uma
                    execução anterior na aba de histórico para auditar logs e métricas.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setTriggerModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Iniciar Rotinas Agora
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Aba 2: Histórico */}
          <TabsContent value="history" className="space-y-4">
            <EtlHistoryTable
              runs={historyRuns}
              selectedRunId={activeRunId}
              onSelectRun={handleSelectRun}
              onRefresh={refetchHistory}
              isLoading={isHistoryLoading}
            />
          </TabsContent>

          {/* Aba 3: Catálogo de Rotinas */}
          <TabsContent value="catalog" className="space-y-4">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Catálogo Oficial de Rotinas
                </h3>
                <p className="text-xs text-neutral-500">
                  Etapas registradas no orquestrador do SimCC ETL e sua sequência de
                  processamento.
                </p>
              </div>

              {routines.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">
                  Nenhuma rotina listada no catálogo da API.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {routines.map((routine, idx) => (
                    <div
                      key={routine.id}
                      className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          #{routine.order || idx + 1}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-[#07677e] dark:text-[#559FB8] border-[#559FB8]/40"
                        >
                          Rotina
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold font-mono text-neutral-900 dark:text-neutral-100">
                        {routine.name || routine.id}
                      </h4>
                      {routine.description && (
                        <p className="text-xs text-neutral-500">
                          {routine.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Disparo */}
        <EtlTriggerDialog
          open={triggerModalOpen}
          onOpenChange={setTriggerModalOpen}
          routines={routines}
          onTrigger={handleTriggerPipeline}
          isLoading={triggerMutation.isPending}
        />
      </div>
    </>
  );
}
