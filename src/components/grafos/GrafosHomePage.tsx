import { ArrowRight, GitGraph, Sparkles } from 'lucide-react';

interface GrafosHomePageProps {
  readonly onGoToNew: () => void;
  readonly onGoToVisualization: () => void;
}

interface NavCardProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly onClick: () => void;
}

function NavCard({ icon, title, description, onClick }: NavCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col min-h-[160px] gap-3 p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-eng-blue/30 hover:shadow-sm transition-all duration-150 text-left"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl bg-eng-blue/10 text-eng-blue border border-eng-blue/20 group-hover:bg-eng-blue/20 transition-colors">
          {icon}
        </div>
        <span className="text-gray-300 dark:text-neutral-600 group-hover:text-eng-blue group-hover:translate-x-0.5 transition-all duration-150">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200 mb-0.5">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

export function GrafosHomePage({
  onGoToNew,
  onGoToVisualization,
}: GrafosHomePageProps) {
  return (
    <div className="max-w-xl mx-auto space-y-8 py-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-1">
          Classificador de Pesquisadores
        </h2>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Crie uma taxonomia ou explore uma já existente.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
            Ações
          </h3>
        </div>
        <div className="p-5 grid gap-5 mb-3">
          <NavCard
            onClick={onGoToNew}
            icon={<Sparkles className="w-5 h-5" />}
            title="Nova taxonomia"
            description="Descreva um domínio, revise a estrutura gerada e execute o pipeline completo."
          />
          <NavCard
            onClick={onGoToVisualization}
            icon={<GitGraph className="w-5 h-5" />}
            title="Visualização"
            description="Explore o grafo, tabelas e nuvem de palavras de uma taxonomia já processada."
          />
        </div>
      </section>
    </div>
  );
}
