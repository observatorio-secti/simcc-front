import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Cpu,
  History,
  Layers,
  ListTree,
  Play,
  RefreshCw,
  Server,
  Sparkles,
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
import { EtlActivityFeed } from './etl-activity-feed';
import { EtlTechnicalSheet } from './etl-technical-sheet';
import { EtlTriggerDialog } from './etl-trigger-dialog';
import { EtlHistoryTable } from './etl-history-table';
import { TriggerRunPayload } from '../../../types/etl';
import {
  ROUTINE_METADATA_MAP,
  getRoutineMetadata,
} from '../../../lib/etl-routines-catalog';

export function EtlPage() {
  const { runId: routeRunId } = useParams<{ runId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Histórico Recente de Execuções como tela inicial padrão SEMPRE
  const [activeTab, setActiveTab] = useState<string>('history');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [triggerModalOpen, setTriggerModalOpen] = useState<boolean>(false);
  const [technicalSheetOpen, setTechnicalSheetOpen] = useState<boolean>(false);

  // Queries e Mutações
  const { data: health, isLoading: isHealthLoading, isError: isHealthError } = useEtlHealth();
  const { data: rawRoutines = [] } = useEtlRoutines();
  const {
    data: historyRuns = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useEtlRunsHistory(20);
  const triggerMutation = useTriggerEtlRun();

  // Limpa qualquer ID na rota para garantir que o reload permaneça sempre no Histórico
  useEffect(() => {
    if (routeRunId) {
      setSelectedRunId(routeRunId);
      navigate('/console/etl', { replace: true });
    }
  }, [routeRunId, navigate]);

  // Define qual run inspecionar
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

  // Seleciona run no histórico e alterna para o monitor mantendo rota limpa
  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId);
    setActiveTab('monitor');
  };

  // Disparo de novo pipeline
  const handleTriggerPipeline = async (payload: TriggerRunPayload) => {
    const res = await triggerMutation.mutateAsync(payload);
    if (res?.run_id) {
      setSelectedRunId(res.run_id);
      setActiveTab('monitor');
    }
  };

  // Catálogo consolidado: une rotinas da API com o dicionário traduzido
  const catalogList = React.useMemo(() => {
    if (rawRoutines.length > 0) {
      return rawRoutines.map((r) => getRoutineMetadata(r.id));
    }
    // Fallback caso a API ainda esteja iniciando
    return Object.keys(ROUTINE_METADATA_MAP).map((key) =>
      getRoutineMetadata(key),
    );
  }, [rawRoutines]);

  return (
    <>
      <Helmet>
        <title>Pipeline de Atualização | Console Simcc</title>
        <meta
          name="description"
          content="Gerenciamento, histórico e monitoramento do pipeline de atualização de dados acadêmicos do SimCC"
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
                  className="border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/40 text-xs gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  Serviço de Atualização Indisponível
                </Badge>
              ) : health?.status === 'ok' ? (
                <Badge
                  variant="outline"
                  className="border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-xs gap-1 font-mono"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Serviço Operacional
                </Badge>
              ) : (
                <Badge variant="outline" className="text-neutral-500 text-xs gap-1">
                  <Server className="w-3 h-3" />
                  Conectando...
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
              Pipeline de Atualização de Dados
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
              Gerencie a sincronização de currículos Lattes, orquestração e
              consolidação de indicadores acadêmicos.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2.5">
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
              Iniciar Atualização
            </Button>
          </div>
        </div>

        {/* Abas Principais: 1º Histórico (Padrão), 2º Monitoramento, 3º Catálogo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="history" className="text-xs gap-2 font-medium">
              <History className="w-3.5 h-3.5 text-[#559FB8]" />
              Histórico de Execuções
            </TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs gap-2 font-medium">
              <Activity className="w-3.5 h-3.5 text-neutral-500" />
              Monitoramento da Execução
              {activeRunDetail?.status === 'RUNNING' && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-0.5" />
              )}
            </TabsTrigger>
            <TabsTrigger value="catalog" className="text-xs gap-2 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
              Catálogo de Rotinas ({catalogList.length})
            </TabsTrigger>
          </TabsList>

          {/* Aba 1: Histórico de Execuções (Primeira tela) */}
          <TabsContent value="history" className="space-y-4">
            <EtlHistoryTable
              runs={historyRuns}
              selectedRunId={activeRunId}
              onSelectRun={handleSelectRun}
              onRefresh={refetchHistory}
              isLoading={isHistoryLoading}
            />
          </TabsContent>

          {/* Aba 2: Monitoramento Ativo (Reformulado, sem terminal escuro) */}
          <TabsContent value="monitor" className="space-y-6">
            {activeRunDetail ? (
              <>
                {/* Resumo Macro Amigável */}
                <EtlHeaderSummary
                  run={activeRunDetail}
                  isPolling={isPolling}
                  onOpenTechnicalSheet={() => setTechnicalSheetOpen(true)}
                />

                {/* Estrutura Limpa: Stepper de Etapas + Feed de Atividades Recentes */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Stepper com nomes em português e detalhes sob demanda */}
                  <div className="lg:col-span-7 space-y-4">
                    <EtlStepper
                      routines={activeRunDetail.routines || []}
                      steps={activeRunDetail.steps || {}}
                      currentRoutine={activeRunDetail.current_routine}
                    />
                  </div>

                  {/* Feed de Atividades Amigável */}
                  <div className="lg:col-span-5 space-y-4">
                    <EtlActivityFeed
                      logs={logs}
                      onOpenTechnicalSheet={() => setTechnicalSheetOpen(true)}
                    />
                  </div>
                </div>
              </>
            ) : isMonitorLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-neutral-500 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#559FB8] border-t-transparent" />
                <p className="text-xs">Sincronizando detalhes da execução...</p>
              </div>
            ) : (
              <div className="p-12 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl text-center space-y-4 bg-white dark:bg-neutral-900">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Nenhuma execução em foco
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Selecione uma execução na aba de Histórico para acompanhar seu
                    andamento ou inicie um novo ciclo no botão acima.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setTriggerModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Iniciar Atualização Agora
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Aba 3: Catálogo de Rotinas (Cartões Ampliados com Explicações em 1-2 sentenças) */}
          <TabsContent value="catalog" className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Catálogo de Rotinas do Pipeline
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Entenda o papel de cada etapa no processamento, enriquecimento e
                indexação dos dados acadêmicos do Observatório.
              </p>
            </div>

            {/* Cartões Ampliados em Grid de 2 Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {catalogList.map((routine, idx) => {
                const Icon = routine.icon;

                return (
                  <div
                    key={routine.id}
                    className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#559FB8]/50 transition-all shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Topo do Cartão: Número, Ícone e Categoria */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#559FB8]/10 text-[#07677e] dark:text-[#559FB8] flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-400 font-semibold">
                            Etapa #{idx + 1}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                          >
                            {routine.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Título em Português */}
                      <div>
                        <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                          {routine.title}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                          ID Técnico: {routine.id}
                        </span>
                      </div>

                      {/* Explicação Curta de 1 a 2 sentenças */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {routine.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                      <span>Execução automatizada</span>
                      <span className="font-mono text-[11px] text-[#559FB8]">
                        Pipeline SimCC
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal para Disparo de Novo Pipeline */}
        <EtlTriggerDialog
          open={triggerModalOpen}
          onOpenChange={setTriggerModalOpen}
          routines={rawRoutines}
          onTrigger={handleTriggerPipeline}
          isLoading={triggerMutation.isPending}
        />

        {/* Gaveta Lateral de Auditoria e Logs Técnicos (Progressive Disclosure) */}
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
