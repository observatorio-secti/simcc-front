import { Check } from 'lucide-react';

export interface GrafosFlowStepperProps {
  readonly current: number;
  readonly subLabel?: string;
}

const STEPS = [
  { number: 1, label: 'Descrição' },
  { number: 2, label: 'Revisão' },
  { number: 3, label: 'Execução do Pipeline' },
];

export function GrafosFlowStepper({
  current,
  subLabel,
}: GrafosFlowStepperProps) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const isCompleted = step.number < current;
        const isCurrent = step.number === current;

        let circleClass =
          'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500';
        if (isCompleted) circleClass = 'bg-eng-blue text-white';
        else if (isCurrent)
          circleClass =
            'bg-eng-blue/10 text-eng-dark-blue dark:text-eng-blue ring-2 ring-eng-blue';

        const labelClass = isCurrent
          ? 'text-eng-dark-blue dark:text-eng-blue font-medium'
          : isCompleted
            ? 'text-gray-600 dark:text-neutral-400'
            : 'text-gray-400 dark:text-neutral-500';

        const circle = (
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${circleClass}`}
          >
            {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.number}
          </div>
        );

        return (
          <div key={step.number} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              {circle}
              <span className={`text-xs hidden sm:inline ${labelClass}`}>
                {step.label}
              </span>
              {isCurrent && subLabel && (
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 italic hidden md:inline">
                  — {subLabel}
                </span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-4 sm:w-6 h-px ${step.number < current ? 'bg-eng-blue/50' : 'bg-gray-200 dark:bg-neutral-700'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
