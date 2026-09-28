import { useState } from 'react';
import { GrafosConfirmStep } from './GrafosConfirmStep';
import { GrafosExecutionStep } from './GrafosExecutionStep';
import { GrafosFlowStepper } from './GrafosFlowStepper';
import { GrafosHomePage } from './GrafosHomePage';
import { GrafosPromptStep } from './GrafosPromptStep';
import { GrafosReviewStep } from './GrafosReviewStep';
import { GrafosVisualizationStep } from './GrafosVisualizationStep';

type MainStep =
  | 'home'
  | 'prompt'
  | 'review'
  | 'confirm'
  | 'execution'
  | 'visualization';

export function GrafosFlow() {
  const [step, setStep] = useState<MainStep>('home');
  const [config, setConfig] = useState<any>(null);
  const [done, setDone] = useState(false);

  let currentFlowStep = 3;
  if (step === 'prompt') {
    currentFlowStep = 1;
  } else if (step === 'review') {
    currentFlowStep = 2;
  }

  let subLabel: string | undefined;
  if (step === 'confirm' || step === 'execution' || step === 'visualization') {
    if (step === 'visualization' || done) subLabel = 'Concluído ✓';
    else if (step === 'execution') subLabel = 'Executando...';
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {step !== 'home' && step !== 'visualization' && (
        <div className="px-8 py-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-end">
          <GrafosFlowStepper current={currentFlowStep} subLabel={subLabel} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8">
        {step === 'home' && (
          <GrafosHomePage
            onGoToNew={() => setStep('prompt')}
            onGoToVisualization={() => {
              setDone(true);
              setStep('visualization');
            }}
          />
        )}
        {step === 'prompt' && (
          <GrafosPromptStep onNext={(c) => { setConfig(c); setStep('review'); }} />
        )}
        {step === 'review' && (
          <GrafosReviewStep
            config={config}
            onNext={() => setStep('confirm')}
            onBack={() => setStep('prompt')}
          />
        )}
        {step === 'confirm' && (
          <GrafosConfirmStep
            config={config}
            onStart={() => setStep('execution')}
            onEdit={() => setStep('review')}
            onRestart={() => setStep('prompt')}
          />
        )}
        {step === 'execution' && (
          <GrafosExecutionStep
            config={config}
            onViewGraph={() => {
              setDone(true);
              setStep('visualization');
            }}
            onGoHome={() => setStep('home')}
          />
        )}
        {step === 'visualization' && (
          <GrafosVisualizationStep onBack={() => setStep('home')} initialTaxonomy={config?.name} />
        )}
      </div>
    </div>
  );
}
