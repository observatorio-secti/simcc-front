import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { generateTaxonomy } from '../../services/grafos-taxonomy-generator';

const EXAMPLES = [
  'Crie uma taxonomia para arboviroses, incluindo dengue, zika, chikungunya e febre amarela.',
  'Quero uma taxonomia para energias renováveis: solar, eólica, hidrelétrica e biomassa.',
  'Gere uma taxonomia para neurociências clínicas e cognitivas.',
];

interface GrafosPromptStepProps {
  readonly onNext: (config: any) => void;
}

export function GrafosPromptStep({ onNext }: GrafosPromptStepProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = prompt.trim().length >= 3;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const response = await generateTaxonomy(prompt);
      onNext(response.generated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-eng-blue/10 mb-4">
          <Sparkles className="w-6 h-6 text-eng-blue" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-1">
          Descreva a taxonomia desejada
        </h2>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          A IA irá gerar automaticamente a estrutura de configuração e as áreas
          iniciais da taxonomia.
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Crie uma taxonomia para arboviroses, cobrindo doenças transmitidas por mosquitos como dengue, zika e chikungunya..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-800 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-eng-blue focus:border-transparent resize-none transition-shadow"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-eng-blue text-white text-sm font-medium hover:bg-eng-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Gerando estrutura...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Gerar taxonomia
            </>
          )}
        </button>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="pt-2">
          <p className="text-xs text-gray-400 dark:text-neutral-500 mb-2 font-medium uppercase tracking-wide">
            Exemplos
          </p>
          <div className="space-y-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-800 hover:bg-eng-blue/10 hover:text-eng-dark-blue dark:hover:text-eng-blue transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
