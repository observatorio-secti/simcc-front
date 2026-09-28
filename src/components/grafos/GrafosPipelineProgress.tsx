import { Check } from 'lucide-react';
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

function currentMilestoneIndex(messages: PipelineMessage[]): number {
  let reached = -1;
  for (const msg of messages) {
    if (typeof msg.step === 'number') reached = Math.max(reached, msg.step);
  }
  return reached;
}

interface GrafosPipelineProgressProps {
  readonly messages: PipelineMessage[];
  readonly hasError: boolean;
  readonly done: boolean;
}

export function GrafosPipelineProgress({
  messages,
  hasError,
  done,
}: GrafosPipelineProgressProps) {
  const reachedIndex = done
    ? MILESTONE_LABELS.length - 1
    : currentMilestoneIndex(messages);

  return (
    <div className="flex items-center">
      {MILESTONE_LABELS.map((label, i) => {
        const isDone = i <= reachedIndex;
        const isCurrent = i === reachedIndex + 1 && !done && !hasError;

        let circleClass =
          'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-300 dark:text-neutral-600';
        if (isDone) circleClass = 'bg-eng-blue border-eng-blue text-white';
        else if (isCurrent)
          circleClass =
            'bg-white dark:bg-neutral-900 border-eng-blue/50 text-eng-blue';

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
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
  );
}
