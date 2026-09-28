import { ArrowLeft, FileText, GitGraph, RefreshCw, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchTaxonomyGraph, fetchTaxonomyList } from '../../services/grafos-taxonomy';
import { fetchArticleTrace, fetchResearcherTrace } from '../../services/grafos-trace';
import type { GrafosGraphResponse, TaxonomyItem } from '../../types/grafos-graph';
import type { ArticleTraceItem, ResearcherTraceItem } from '../../types/grafos-trace';
import { ClassifierGraph } from './ClassifierGraph';

interface Props { readonly onBack: () => void; readonly initialTaxonomy?: string; }

export function GrafosVisualizationStep({ onBack, initialTaxonomy }: Props) {
  const [taxonomies, setTaxonomies] = useState<TaxonomyItem[]>([]);
  const [name, setName] = useState<string>(initialTaxonomy ?? '');
  const [graph, setGraph] = useState<GrafosGraphResponse | null>(null);
  const [researchers, setResearchers] = useState<ResearcherTraceItem[]>([]);
  const [articles, setArticles] = useState<ArticleTraceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'graph' | 'researchers' | 'articles'>('graph');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [traceLoading, setTraceLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchTaxonomyList().then(({ items }) => {
      setTaxonomies(items);
      const target = initialTaxonomy ?? items.find((item) => item.taxonomy_name.toLowerCase() === 'cnpq')?.taxonomy_name ?? items[0]?.taxonomy_name;
      if (target) setName(target);
    }).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    setError(null);
    fetchTaxonomyGraph(name)
      .then(setGraph)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));

    setTraceLoading(true);
    Promise.all([
      fetchResearcherTrace({ taxonomyName: name }).catch(() => ({ items: [], total: 0 })),
      fetchArticleTrace({ taxonomyName: name }).catch(() => ({ items: [], total: 0 })),
    ]).then(([resData, artData]) => {
      setResearchers(resData.items);
      setArticles(artData.items);
    }).finally(() => setTraceLoading(false));
  }, [name]);

  const filteredResearchers = researchers.filter((r) =>
    searchFilter ? r.researcher_name.toLowerCase().includes(searchFilter.toLowerCase()) || r.area_labels.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  const filteredArticles = articles.filter((a) =>
    searchFilter ? a.title.toLowerCase().includes(searchFilter.toLowerCase()) || a.researcher_name.toLowerCase().includes(searchFilter.toLowerCase()) || a.topic_label.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} aria-label="Voltar" className="text-gray-500 hover:text-eng-blue transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-100">Visualização da taxonomia</h2>
          <p className="text-xs text-gray-500">Resultados do pipeline, dados do banco e grafo interativo Cytoscape.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 text-gray-800 dark:text-neutral-200"
          >
            {taxonomies.map((item) => (
              <option key={item.taxonomy_name} value={item.taxonomy_name}>
                {item.taxonomy_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          Não foi possível carregar o grafo: {error}
        </div>
      )}

      {/* Navegação por abas */}
      <div className="flex border-b border-gray-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'graph'
              ? 'border-eng-blue text-eng-blue dark:text-sky-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300'
          }`}
        >
          <GitGraph className="h-4 w-4" />
          Grafo Interativo
        </button>

        <button
          onClick={() => setActiveTab('researchers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'researchers'
              ? 'border-eng-blue text-eng-blue dark:text-sky-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300'
          }`}
        >
          <Users className="h-4 w-4" />
          Pesquisadores ({researchers.length})
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'articles'
              ? 'border-eng-blue text-eng-blue dark:text-sky-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Artigos Classificados ({articles.length})
        </button>
      </div>

      {/* Conteúdo da Aba 1: Grafo */}
      {activeTab === 'graph' && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-neutral-800">
            <GitGraph className="h-5 w-5 text-eng-blue" />
            <div>
              <h3 className="font-semibold">{graph?.taxonomy_name ?? name.toUpperCase()}</h3>
              <p className="text-xs text-gray-500">
                {graph
                  ? `${graph.summary.total_nodes.toLocaleString('pt-BR')} nós · ${graph.summary.total_edges.toLocaleString('pt-BR')} arestas`
                  : 'Carregando estrutura...'}
              </p>
            </div>
            {loading && <RefreshCw className="ml-auto h-4 w-4 animate-spin text-gray-400" />}
          </div>
          {graph && <ClassifierGraph elements={graph.elements} />}
        </section>
      )}

      {/* Conteúdo da Aba 2: Pesquisadores */}
      {activeTab === 'researchers' && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filtrar por nome do pesquisador ou área..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-neutral-900 dark:border-neutral-800 flex-1"
            />
            {traceLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200 dark:bg-neutral-800/50 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Pesquisador</th>
                  <th className="px-5 py-3.5">Área</th>
                  <th className="px-5 py-3.5">Tópico</th>
                  <th className="px-5 py-3.5">Subtópico</th>
                  <th className="px-5 py-3.5 text-right">Artigos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredResearchers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      {traceLoading ? 'Carregando dados de rastreabilidade...' : 'Nenhum pesquisador encontrado para esta taxonomia. Execute o pipeline para gerar.'}
                    </td>
                  </tr>
                ) : (
                  filteredResearchers.slice(0, 100).map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30">
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-neutral-200">{r.researcher_name}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-neutral-400">{r.area_labels}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-neutral-400">{r.topic_label}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-neutral-400">{r.subtopic_label}</td>
                      <td className="px-5 py-3 text-right font-semibold text-eng-blue tabular-nums">{r.article_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Conteúdo da Aba 3: Artigos */}
      {activeTab === 'articles' && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filtrar por título, pesquisador ou tópico..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-neutral-900 dark:border-neutral-800 flex-1"
            />
            {traceLoading && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200 dark:bg-neutral-800/50 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Título do Artigo</th>
                  <th className="px-5 py-3.5">Ano</th>
                  <th className="px-5 py-3.5">Pesquisador</th>
                  <th className="px-5 py-3.5">Tópico Atribuído</th>
                  <th className="px-5 py-3.5">Subtópico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      {traceLoading ? 'Carregando dados dos artigos...' : 'Nenhum artigo rastreado para esta taxonomia. Execute o pipeline para gerar.'}
                    </td>
                  </tr>
                ) : (
                  filteredArticles.slice(0, 100).map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30">
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-neutral-200 max-w-md truncate" title={a.title}>
                        {a.title}
                      </td>
                      <td className="px-5 py-3 text-gray-500 tabular-nums">{a.year ?? '-'}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-neutral-400">{a.researcher_name}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-neutral-400">{a.topic_label}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-neutral-400">{a.subtopic_label}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
