import { Check, GitGraph, Home, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { parseEdgeCount, parseNodeCount, runPipelineStream } from '../../services/grafos-pipeline';
import type { PipelineMessage } from '../../types/grafos-pipeline';

const MILESTONE_LABELS = [
  'Grafo inicial',
  'Documentos',
  'Agrupamento (BERTopic)',
  'Hierarquização (LLM)',
  'Integração no grafo',
  'Grafo final',
  'Rastreabilidade',
];

interface GrafosExecutionStepProps {
  readonly onViewGraph: () => void;
  readonly onGoHome: () => void;
  readonly config?: any;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds}s`;
}

export function GrafosExecutionStep({
  onViewGraph,
  onGoHome,
  config,
}: GrafosExecutionStepProps) {
  const [messages, setMessages] = useState<PipelineMessage[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState(-1);
  const [done, setDone] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config?.name) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessages([]);
    setCurrentMilestone(-1);
    setElapsedMs(0);
    startTimeRef.current = Date.now();
    setDone(false);

    runPipelineStream(
      config.name,
      (msg) => {
        setMessages((prev) => [...prev, msg]);
        if (msg.kind === 'success') {
          setCurrentMilestone((prev) => Math.min(prev + 1, MILESTONE_LABELS.length - 1));
        }
      },
      () => {
        setDone(true);
        setElapsedMs(Date.now() - startTimeRef.current);
        setLoading(false);
      },
      (msg) => {
        setMessages((prev) => [...prev, msg]);
        setLoading(false);
      },
    );
  }, [config?.name]);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 500);
    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    if (done) {
      setElapsedMs(Date.now() - startTimeRef.current);
    }
  }, [done]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const statusLabel = done ? 'Pipeline concluído!' : 'Pipeline em execução';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${done ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-eng-blue/10'}`}
        >
          {done ? (
            <Check className="w-6 h-6 text-emerald-600" />
          ) : (
            <Loader2 className="animate-spin w-5 h-5 text-eng-blue" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-1">
          {statusLabel}
        </h2>
      </div>

      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-6">
        <div className="flex items-center">
          {MILESTONE_LABELS.map((label, i) => {
            const isDone = i <= currentMilestone;
            const isCurrent = i === currentMilestone + 1 && !done;

            let circleClass =
              'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-300 dark:text-neutral-600';
            if (isDone) circleClass = 'bg-eng-blue border-eng-blue text-white';
            else if (isCurrent)
              circleClass =
                'bg-white dark:bg-neutral-900 border-eng-blue/50 text-eng-blue';

            return (
              <div
                key={label}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors duration-500 ${circleClass} ${isCurrent ? 'animate-pulse' : ''}`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] text-center leading-tight w-16 ${isDone || isCurrent ? 'text-gray-600 dark:text-neutral-400' : 'text-gray-300 dark:text-neutral-600'}`}
                  >
                    {label}
                  </span>
                </div>
                {i < MILESTONE_LABELS.length - 1 && (
                  <div className="flex-1 h-1 mx-1 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden -mt-4">
                    <div
                      className={`h-full bg-eng-blue transition-all duration-700 ease-out ${isDone ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 dark:border-neutral-700 bg-gray-900 dark:bg-neutral-950 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-800 dark:border-neutral-700 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
            Log de execução
          </h3>
          <span className="text-xs text-gray-500 tabular-nums">
            {messages.length} mensagens
          </span>
        </div>
        <div className="p-4 h-56 overflow-y-auto space-y-1.5 font-mono">
          {messages.length === 0 && !loading ? (
            <p className="text-xs text-gray-600 text-center py-8">
              Aguardando início...
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    msg.kind === 'success' ? 'bg-emerald-400' :
                    msg.kind === 'error' ? 'bg-red-400' : 'bg-gray-500'
                  }`}
                />
                <span
                  className={`text-xs leading-relaxed ${
                    msg.kind === 'success' ? 'text-emerald-400' :
                    msg.kind === 'error' ? 'text-red-400' : 'text-gray-300 dark:text-neutral-500'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </section>

      {!done && (
        <p className="text-xs text-gray-400 dark:text-neutral-500 text-center">
          Não feche esta página enquanto o pipeline estiver em execução.
        </p>
      )}

      {done && (
        <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
              Resumo
            </h3>
          </div>
          <div className="flex divide-x divide-gray-100 dark:divide-neutral-800">
            <div className="flex-1 px-5 py-4 text-center">
              <p className="text-2xl font-bold text-eng-blue tabular-nums">
                58
              </p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                nós no grafo
              </p>
            </div>
            <div className="flex-1 px-5 py-4 text-center">
              <p className="text-2xl font-bold text-eng-blue tabular-nums">
                72
              </p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                arestas
              </p>
            </div>
            <div className="flex-1 px-5 py-4 text-center">
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">
                7
              </p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                etapas concluídas
              </p>
            </div>
            <div className="flex-1 px-5 py-4 text-center">
              <p className="text-2xl font-bold text-gray-700 dark:text-neutral-300 tabular-nums">
                {formatDuration(elapsedMs)}
              </p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                tempo total
              </p>
            </div>
          </div>
        </section>
      )}

      {done && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={onGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Página inicial
          </button>
          <button
            onClick={onViewGraph}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-eng-blue text-white text-sm font-medium hover:bg-eng-dark-blue transition-colors"
          >
            <GitGraph className="w-4 h-4" />
            Ver grafo
          </button>
        </div>
      )}
    </div>
  );
}
