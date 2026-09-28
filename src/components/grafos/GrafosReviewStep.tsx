import { Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { saveTaxonomy } from '../../services/grafos-taxonomy-generator';

interface GrafosReviewStepProps {
  readonly onNext: () => void;
  readonly onBack: () => void;
  readonly config?: any;
}

export function GrafosReviewStep({ onNext, onBack, config }: GrafosReviewStepProps) {
  const [name, setName] = useState(config?.name ?? 'Arboviroses');
  const [nodeColor, setNodeColor] = useState(config?.node_color ?? '#559FB8');
  const [domainDescription, setDomainDescription] = useState(config?.domain_description ?? '');
  const [taxonomyContext, setTaxonomyContext] = useState(config?.taxonomy_context ?? '');
  const [areas, setAreas] = useState<{title: string; description: string}[]>(config?.areas ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setName(config.name ?? 'Arboviroses');
      setNodeColor(config.node_color ?? '#559FB8');
      setDomainDescription(config.domain_description ?? '');
      setTaxonomyContext(config.taxonomy_context ?? '');
      setAreas(config.areas ?? []);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTaxonomy({
        name,
        domain_description: domainDescription,
        area_examples: areas.map(a => a.title),
        taxonomy_context: taxonomyContext,
        origin_label: 'Generated',
        node_color: nodeColor,
        area_filter_layer: 1,
        areas: areas.map(a => ({key: a.title.toLowerCase(), ...a})),
      });
    } finally {
      setSaving(false);
      onNext();
    }
  };

  const addArea = () => {
    setAreas([...areas, { title: 'Nova Área', description: '' }]);
  };

  const removeArea = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  const updateArea = (index: number, field: keyof {title: string; description: string}, value: string) => {
    const updated = [...areas];
    updated[index] = { ...updated[index], [field]: value };
    setAreas(updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-1">
          Revise e edite a taxonomia gerada
        </h2>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Todos os campos podem ser editados antes de salvar.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
            Configuração geral
          </h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="taxonomy-name" className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
              Nome
            </label>
            <input
              id="taxonomy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-eng-blue focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="taxonomy-node-color" className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
              Cor dos nós
            </label>
            <div className="flex items-center gap-2">
              <input
                id="taxonomy-node-color"
                type="color"
                value={nodeColor}
                onChange={(e) => setNodeColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-neutral-700"
              />
              <input
                value={nodeColor}
                onChange={(e) => setNodeColor(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-700 dark:text-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-eng-blue"
              />
            </div>
          </div>
          <div className="col-span-2">
            <label htmlFor="taxonomy-domain-description" className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
              Descrição do domínio
            </label>
            <input
              id="taxonomy-domain-description"
              value={domainDescription}
              onChange={(e) => setDomainDescription(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-eng-blue focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="taxonomy-context" className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
              Contexto da taxonomia{' '}
              <span className="text-gray-400 dark:text-neutral-500 font-normal">
                (injetado no prompt do LLM)
              </span>
            </label>
            <textarea
              id="taxonomy-context"
              value={taxonomyContext}
              onChange={(e) => setTaxonomyContext(e.target.value)}
              rows={5}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-700 dark:text-neutral-300 resize-y focus:outline-none focus:ring-2 focus:ring-eng-blue focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
            Áreas da taxonomia{' '}
            <span className="text-gray-400 dark:text-neutral-500 font-normal">
              ({areas.length})
            </span>
          </h3>
          <button
            onClick={addArea}
            className="flex items-center gap-1 text-xs font-medium text-eng-blue hover:text-eng-dark-blue dark:hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar área
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
          {areas.map((area, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  value={area.title}
                  onChange={(e) => updateArea(i, 'title', e.target.value)}
                  className="text-sm font-medium text-gray-800 dark:text-neutral-200 bg-transparent focus:outline-none focus:ring-1 focus:ring-eng-blue rounded px-1 flex-1"
                  placeholder="Nome da área"
                />
                <button
                  onClick={() => removeArea(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={area.description}
                onChange={(e) => updateArea(i, 'description', e.target.value)}
                placeholder="Descrição da área"
                className="w-full text-xs text-gray-500 dark:text-neutral-400 bg-transparent focus:outline-none focus:ring-1 focus:ring-eng-blue rounded px-1"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 transition-colors"
        >
          ← Voltar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || areas.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-eng-blue text-white text-sm font-medium hover:bg-eng-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Confirmar e salvar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
