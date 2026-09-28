import { ArrowLeft, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchTaxonomyAreas } from '../../services/grafos-taxonomy';

const PIPELINE_STEPS = [
  'Construção do grafo inicial da taxonomia',
  'Carregamento dos documentos de entrada',
  'Agrupamento dos documentos em tópicos temáticos via BERTopic',
  'Estruturação e classificação dos tópicos via LLM',
  'Integração dos tópicos ao grafo inicial, e construção do grafo final',
  'Salvamento do grafo final',
  'Mapeamento dos documentos em áreas, tópicos e subtópicos',
];

interface GrafosConfirmStepProps {
  readonly onStart: () => void;
  readonly onEdit: () => void;
  readonly onRestart: () => void;
  readonly config?: any;
}

export function GrafosConfirmStep({
  onStart,
  onEdit,
  onRestart,
  config,
}: GrafosConfirmStepProps) {
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (config?.name) {
      fetchTaxonomyAreas(config.name)
        .then(({ items }) => {
          setAreas(items.map((i: any) => i.area));
        })
        .catch(() => {
          setAreas(config.areas?.map((a: any) => a.title ?? a) ?? []);
        })
        .finally(() => setLoading(false));
    } else {
      setAreas(config?.areas?.map((a: any) => a.title ?? a) ?? []);
      setLoading(false);
    }
  }, [config]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-eng-blue/10 mb-4">
          <Play className="w-5 h-5 text-eng-blue" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-1">
          Configuração da taxonomia pronta
        </h2>
      </div>

      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
            Resumo
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mb-0.5">
              Descrição
            </p>
            <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed">
              {config?.domain_description ?? 'Taxonomia gerada'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mb-1.5">
              Áreas ({loading ? '...' : areas.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {loading ? (
                <span className="text-xs text-gray-400">Carregando...</span>
              ) : (
                areas.map((area) => (
                  <span
                    key={area}
                    className="text-xs px-2.5 py-1 rounded-full bg-eng-blue/10 text-eng-dark-blue dark:text-eng-blue border border-eng-blue/20"
                  >
                    {area}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
            O que será executado
          </h3>
        </div>
        <div className="p-5 space-y-2">
          {PIPELINE_STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 text-xs flex items-center justify-center flex-shrink-0 font-medium">
                {i + 1}
              </span>
              <span className="text-xs text-gray-600 dark:text-neutral-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={onRestart}
            className="text-xs font-medium text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
          >
            Recomeçar
          </button>
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-eng-blue text-white text-sm font-medium hover:bg-eng-dark-blue transition-colors"
        >
          <Play className="w-4 h-4" />
          Executar pipeline
        </button>
      </div>
    </div>
  );
}
