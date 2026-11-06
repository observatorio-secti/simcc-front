import {
  Send,
  User,
  Square,
  Sparkles,
  RotateCcw,
  RotateCw,
  BookOpen,
  FileText,
  Lightbulb,
  Cpu,
  Bookmark,
  ExternalLink,
  Building2,
  MapPin,
  Search,
  ChevronDown,
  Layers,
  AlertCircle,
  X,
  Shuffle,
  ArrowRight,
  BadgeCheck,
  Trophy,
  HeartPulse,
  Database,
  Calendar,
  MessageCircleQuestion,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import {
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useTheme } from 'next-themes';
import { SymbolEE } from '../svg/SymbolEE';
import { SymbolEEWhite } from '../svg/SymbolEEWhite';
import { UserContext } from '../../context/context';
import { useAuth } from '../../hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useModal } from '../hooks/use-modal-store';
import { Helmet } from 'react-helmet';
import {
  MariaApiError,
  createConversation,
  getConversation,
  listMessages,
  streamMessage,
} from '../../services/maria';
import type {
  MariaActivity,
  MariaBlock,
  MariaBlockOrigin,
  MariaChartBlock,
  MariaContentDelta,
  MariaConversation,
  MariaMessage,
  MariaProduction,
  MariaProductionsBlock,
  MariaResearcher,
  MariaResearchersBlock,
  MariaSuggestionsBlock,
  MariaTableBlock,
  MariaTextBlock,
} from '../../types/maria';
import { CsvButton, MariaChart, MariaTable } from './maria-blocks';
import { downloadCsv, originText } from './maria-utils';

// --- Estado local do chat ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  blocks: MariaBlock[];
  time: string;
  // Consultas anunciadas pelo evento `activity` durante a geração.
  activities?: MariaActivity[];
  error?: string;
  // Pergunta e mensagem do usuário associadas, para tentar de novo.
  retryQuery?: string;
  pairId?: string;
  isStreaming?: boolean;
  interrupted?: boolean;
}

// Pesquisadores e produções de uma resposta, exibidos na coluna lateral.
interface MariaResults {
  researchers: MariaResearcher[];
  productions: MariaProduction[];
  researchersTotal: number;
  productionsTotal: number;
  researchersBlock?: MariaResearchersBlock;
  productionsBlock?: MariaProductionsBlock;
}

const CONVERSATION_STORAGE_KEY = 'maria:conversation-id';

function readStoredConversationId(): string | null {
  try {
    return localStorage.getItem(CONVERSATION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeConversationId(id: string | null) {
  try {
    if (id) localStorage.setItem(CONVERSATION_STORAGE_KEY, id);
    else localStorage.removeItem(CONVERSATION_STORAGE_KEY);
  } catch {
    // Armazenamento indisponível (aba anônima): a conversa só não é retomada.
  }
}

function formatTime(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fromApiMessage(message: MariaMessage): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    blocks: message.content,
    time: formatTime(message.created_at),
  };
}

function blocksText(blocks: MariaBlock[]): string {
  return blocks
    .filter((b): b is MariaTextBlock => b?.type === 'text')
    .map((b) => b.text)
    .join('\n\n');
}

function collectResults(blocks: MariaBlock[]): MariaResults | null {
  const researchersBlocks = blocks.filter(
    (b): b is MariaResearchersBlock => b?.type === 'researchers',
  );
  const productionsBlocks = blocks.filter(
    (b): b is MariaProductionsBlock => b?.type === 'productions',
  );
  if (!researchersBlocks.length && !productionsBlocks.length) return null;

  const researchers = researchersBlocks.flatMap((b) => b.researchers || []);
  const productions = productionsBlocks.flatMap((b) => b.productions || []);
  return {
    researchers,
    productions,
    researchersTotal: Math.max(
      researchers.length,
      researchersBlocks.reduce((s, b) => s + (b.total || 0), 0),
    ),
    productionsTotal: Math.max(
      productions.length,
      productionsBlocks.reduce((s, b) => s + (b.total || 0), 0),
    ),
    researchersBlock: researchersBlocks[0],
    productionsBlock: productionsBlocks[0],
  };
}

// Aplica um `content.delta` ao bloco `index` da resposta em geração.
function applyDelta(
  message: ChatMessage,
  delta: MariaContentDelta,
): ChatMessage {
  const blocks = [...message.blocks];
  if (delta.type === 'text' && delta.text) {
    const current = blocks[delta.index];
    const previous =
      current?.type === 'text' ? (current as MariaTextBlock).text : '';
    blocks[delta.index] = { type: 'text', text: previous + delta.text };
  } else if (delta.block) {
    blocks[delta.index] = delta.block;
  }
  return { ...message, blocks };
}

function errorMessage(error: unknown): { text: string; canRetry: boolean } {
  if (error instanceof MariaApiError) {
    if (error.status === 429) {
      return {
        text: 'Limite de perguntas desta conversa atingido. Inicie uma nova conversa para continuar.',
        canRetry: false,
      };
    }
    if (error.status === 503) {
      return {
        text: 'A MarIA está indisponível no momento. Tente novamente mais tarde.',
        canRetry: false,
      };
    }
    const detail = error.message.replace(/[.\s]+$/, '');
    return { text: `${detail}. Nada foi gravado na conversa.`, canRetry: true };
  }
  return {
    text: 'Desculpe, ocorreu uma instabilidade ao conectar com os serviços da MarIA. Por favor, tente novamente.',
    canRetry: true,
  };
}

// --- Sugestões de perguntas (produção científica e pesquisadores do Simcc) ---
export interface MariaPromptRecommendation {
  query: string;
  label: string;
  category: string;
  icon: any;
}

const ALL_RECOMMENDATIONS: MariaPromptRecommendation[] = [
  {
    query: 'Quantos artigos foram publicados por ano desde 2020?',
    label: 'Artigos publicados por ano desde 2020',
    category: 'Série Histórica',
    icon: Calendar,
  },
  {
    query: 'Quantos artigos Qualis A1 foram publicados desde 2022?',
    label: 'Artigos Qualis A1 desde 2022',
    category: 'Produção Científica',
    icon: BadgeCheck,
  },
  {
    query: 'Quais pesquisadores têm mais artigos?',
    label: 'Pesquisadores com mais artigos',
    category: 'Pesquisadores',
    icon: Trophy,
  },
  {
    query: 'Que artigos tratam de inteligência artificial?',
    label: 'Artigos sobre inteligência artificial',
    category: 'Produção Científica',
    icon: Cpu,
  },
  {
    query: 'Quantas patentes foram concedidas desde 2020?',
    label: 'Patentes concedidas desde 2020',
    category: 'Patentes',
    icon: Lightbulb,
  },
  {
    query: 'Quais instituições têm mais pesquisadores no Simcc?',
    label: 'Instituições com mais pesquisadores',
    category: 'Pesquisadores',
    icon: Building2,
  },
  {
    query: 'Que projetos de pesquisa do currículo Lattes tratam de educação?',
    label: 'Projetos de pesquisa sobre educação',
    category: 'Projetos',
    icon: BookOpen,
  },
  {
    query: 'Quantos projetos sobre dengue existem?',
    label: 'Projetos sobre dengue',
    category: 'Projetos',
    icon: HeartPulse,
  },
];

function getRandomRecommendations(count = 6): MariaPromptRecommendation[] {
  const shuffled = [...ALL_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// --- Parser de Markdown Otimizado ---
function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let text = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Blocos de código
  text = text.replace(
    /```([\s\S]*?)```/g,
    '<pre class="p-3 my-2 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto font-mono text-xs"><code>$1</code></pre>',
  );

  // Código inline
  text = text.replace(
    /`([^`\n]+)`/g,
    '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-neutral-800 text-[#07677e] dark:text-[#559FB8] rounded font-mono text-xs font-medium">$1</code>',
  );

  // Cabeçalhos
  text = text.replace(
    /^### (.*$)/gim,
    '<h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-3 mb-1 font-lexend">$1</h3>',
  );
  text = text.replace(
    /^## (.*$)/gim,
    '<h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 mt-3.5 mb-1.5 font-lexend border-b border-slate-200 dark:border-neutral-800 pb-1">$1</h2>',
  );
  text = text.replace(
    /^# (.*$)/gim,
    '<h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 font-lexend">$1</h1>',
  );

  // Citações
  text = text.replace(
    /^> (.*$)/gim,
    '<blockquote class="border-l-4 border-[#719CB8] pl-3 py-1 my-2 bg-slate-50 dark:bg-neutral-800/50 text-slate-700 dark:text-slate-300 italic text-sm rounded-r">$1</blockquote>',
  );

  // Negrito e Itálico
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>',
  );
  text = text.replace(
    /\*(.*?)\*/g,
    '<em class="italic text-slate-800 dark:text-slate-200">$1</em>',
  );

  // Links
  text = text.replace(
    /\[(.*?)\]\((https?:\/\/[^\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#07677e] dark:text-[#559FB8] hover:underline font-medium inline-flex items-center gap-0.5">$1</a>',
  );

  // Listas agrupadas compactas
  const lines = text.split('\n');
  const resultLines: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isUnordered = /^\s*[-*]\s+(.*)$/.test(line);
    const isOrdered = /^\s*\d+\.\s+(.*)$/.test(line);

    if (isUnordered) {
      if (inOrderedList) {
        resultLines.push('</ol>');
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        resultLines.push('<ul class="my-1 pl-4 list-disc space-y-0.5">');
        inUnorderedList = true;
      }
      const itemContent = line.replace(/^\s*[-*]\s+/, '');
      resultLines.push(
        `<li class="my-0.5 leading-normal text-slate-700 dark:text-slate-300">${itemContent}</li>`,
      );
    } else if (isOrdered) {
      if (inUnorderedList) {
        resultLines.push('</ul>');
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        resultLines.push('<ol class="my-1 pl-4 list-decimal space-y-0.5">');
        inOrderedList = true;
      }
      const itemContent = line.replace(/^\s*\d+\.\s+/, '');
      resultLines.push(
        `<li class="my-0.5 leading-normal text-slate-700 dark:text-slate-300">${itemContent}</li>`,
      );
    } else {
      if (inUnorderedList) {
        resultLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        resultLines.push('</ol>');
        inOrderedList = false;
      }

      if (line.trim() === '') {
        resultLines.push('<div class="h-1.5"></div>');
      } else if (
        line.startsWith('<h1') ||
        line.startsWith('<h2') ||
        line.startsWith('<h3') ||
        line.startsWith('<blockquote') ||
        line.startsWith('<pre')
      ) {
        resultLines.push(line);
      } else {
        resultLines.push(
          `<p class="my-1 leading-relaxed text-slate-800 dark:text-slate-200">${line}</p>`,
        );
      }
    }
  }

  if (inUnorderedList) resultLines.push('</ul>');
  if (inOrderedList) resultLines.push('</ol>');

  return resultLines.join('\n');
}

// --- Componente de Renderização Markdown ---
function SimpleMarkdownRenderer({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  const renderedHtml = useMemo(() => parseMarkdownToHtml(content), [content]);

  return (
    <div className="markdown-container text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-lexend [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_li]:leading-normal [&_li>p]:my-0 [&_li>p]:inline [&_p]:my-1 [&_p]:leading-relaxed">
      <span dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-[#07677e] dark:bg-[#559FB8] animate-pulse align-middle rounded-xs" />
      )}
    </div>
  );
}

// --- Consultas e fontes de uma resposta ---
// Durante a geração vêm do evento `activity`; em mensagens gravadas, do `origin` dos blocos.
function consultedEntries(msg: ChatMessage): {
  sources: string[];
  lines: string[];
} {
  if (msg.activities?.length) {
    return {
      sources: [...new Set(msg.activities.map((a) => a.source))],
      lines: [
        ...new Set(msg.activities.map((a) => `${a.source} · ${a.description}`)),
      ],
    };
  }
  const origins = msg.blocks
    .map((b) => (b as { origin?: MariaBlockOrigin | null })?.origin)
    .filter((o): o is MariaBlockOrigin => !!o);
  return {
    sources: [...new Set(origins.flatMap((o) => o.sources))],
    lines: [...new Set(origins.map(originText))],
  };
}

function SourcesBadges({ sources }: { sources: string[] }) {
  if (!sources.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-slate-200/80 dark:border-neutral-800">
      {sources.map((source) => (
        <span
          key={source}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
        >
          <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {source}
        </span>
      ))}
    </div>
  );
}

function SourcesSection({ lines }: { lines: string[] }) {
  if (!lines.length) return null;

  return (
    <details className="group mt-2 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs transition-colors">
      <summary className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer list-none flex items-center justify-between select-none">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
          Consultas Realizadas ({lines.length})
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-neutral-900">
        <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400">
          {lines.map((s, idx) => (
            <li key={idx} className="leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

// --- Configuração Visual dos Tipos de Produção ---
const PRODUCTION_TYPE_CONFIG: Record<
  string,
  { icon: any; badgeClass: string }
> = {
  article: {
    icon: FileText,
    badgeClass:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  book: {
    icon: BookOpen,
    badgeClass:
      'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  book_chapter: {
    icon: Bookmark,
    badgeClass:
      'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  },
  patent: {
    icon: Lightbulb,
    badgeClass:
      'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  software: {
    icon: Cpu,
    badgeClass:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  event: {
    icon: Layers,
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border-slate-200 dark:border-neutral-700',
  },
};

const DEFAULT_PRODUCTION_TYPE = {
  icon: FileText,
  badgeClass:
    'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border-slate-200',
};

const doiUrl = (doi: string) =>
  doi.startsWith('http') ? doi : `https://doi.org/${doi}`;

const researcherInstitution = (r: MariaResearcher) =>
  (r.affiliations || [])
    .map((a) => a.institution_acronym || a.institution_name)
    .filter(Boolean)
    .join(', ');

const productionAuthors = (p: MariaProduction) =>
  (p.authors || [])
    .map((a) => a.name)
    .filter(Boolean)
    .join(', ');

function exportResearchers(
  researchers: MariaResearcher[],
  block?: MariaResearchersBlock,
) {
  downloadCsv(
    [
      { key: 'name', label: 'Nome' },
      { key: 'lattes_id', label: 'Lattes' },
      { key: 'territory', label: 'Território' },
      { key: 'institutions', label: 'Instituições' },
      { key: 'articles', label: 'Artigos' },
      { key: 'total_productions', label: 'Total de Produções' },
    ],
    researchers.map((r) => ({
      name: r.name,
      lattes_id: r.lattes_id || '',
      territory: r.territory || '',
      institutions: researcherInstitution(r),
      articles: r.metrics?.articles || 0,
      total_productions: r.metrics?.total_productions || 0,
    })),
    {
      title: block?.title || 'Pesquisadores',
      origin: block?.origin,
      truncated: block?.truncated,
    },
  );
}

function exportProductions(
  productions: MariaProduction[],
  block?: MariaProductionsBlock,
) {
  downloadCsv(
    [
      { key: 'title', label: 'Título' },
      { key: 'type', label: 'Tipo' },
      { key: 'year', label: 'Ano' },
      { key: 'authors', label: 'Autores' },
      { key: 'qualis', label: 'Qualis' },
      { key: 'doi', label: 'DOI' },
      { key: 'magazine', label: 'Periódico/Evento' },
    ],
    productions.map((p) => ({
      title: p.title,
      type: p.type_label || p.type,
      year: p.year || '',
      authors: (p.authors || []).map((a) => a.name).join('; '),
      qualis: p.details?.qualis || '',
      doi: p.details?.doi || '',
      magazine: p.details?.magazine || p.details?.event_name || '',
    })),
    {
      title: block?.title || 'Produções',
      origin: block?.origin,
      truncated: block?.truncated,
    },
  );
}

// --- Segunda Coluna: Painel de Itens Retornados da Consulta ---
interface MariaResultsColumnProps {
  results: MariaResults;
  onClose: () => void;
  urlGeral?: string;
  onOpenResearcherModal: (name: string) => void;
}

function MariaResultsColumn({
  results,
  onClose,
  urlGeral,
  onOpenResearcherModal,
}: MariaResultsColumnProps) {
  const [activeTab, setActiveTab] = useState<
    'all' | 'researchers' | 'productions'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { researchers, productions } = results;
  const totalCount = researchers.length + productions.length;
  const totalInBase = results.researchersTotal + results.productionsTotal;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredResearchers = useMemo(() => {
    if (!normalizedSearch) return researchers;
    return researchers.filter(
      (r) =>
        r.name.toLowerCase().includes(normalizedSearch) ||
        researcherInstitution(r).toLowerCase().includes(normalizedSearch) ||
        (r.territory && r.territory.toLowerCase().includes(normalizedSearch)),
    );
  }, [researchers, normalizedSearch]);

  const filteredProductions = useMemo(() => {
    if (!normalizedSearch) return productions;
    return productions.filter(
      (p) =>
        p.title.toLowerCase().includes(normalizedSearch) ||
        productionAuthors(p).toLowerCase().includes(normalizedSearch) ||
        (p.type_label && p.type_label.toLowerCase().includes(normalizedSearch)),
    );
  }, [productions, normalizedSearch]);

  const tabClass = (tab: typeof activeTab) =>
    `flex-1 py-1 px-2 rounded-md text-center transition-all ${
      activeTab === tab
        ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
    }`;

  return (
    <aside className="w-full sm:w-80 md:w-96 lg:w-[420px] shrink-0 border-l border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full overflow-hidden min-h-0 transition-all duration-300 z-10 shadow-lg md:shadow-none">
      {/* Cabeçalho da Coluna de Resultados */}
      <div className="p-3 md:p-3.5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-neutral-900/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-md bg-[#07677e]/10 dark:bg-[#559FB8]/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-[#07677e] dark:text-[#559FB8]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 font-lexend truncate">
                Itens retornados
              </h3>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#07677e] text-white">
                {totalCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {totalInBase > totalCount
                ? `Exibindo ${totalCount} de ${totalInBase.toLocaleString('pt-BR')} encontrados`
                : 'Registros consultados pela MarIA'}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
          title="Fechar painel de itens retornados"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs & Busca interna rápida */}
      <div className="p-2.5 border-b border-slate-100 dark:border-neutral-800/80 space-y-2 bg-white dark:bg-neutral-900 shrink-0">
        <div className="flex rounded-lg bg-slate-100 dark:bg-neutral-800 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={tabClass('all')}
          >
            Tudo ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('researchers')}
            className={tabClass('researchers')}
          >
            Pesquisadores ({researchers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('productions')}
            className={tabClass('productions')}
          >
            Produções ({productions.length})
          </button>
        </div>

        {totalCount > 4 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome, título, instituição ou tipo..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/80 focus:outline-none focus:ring-1 focus:ring-[#07677e] dark:focus:ring-[#559FB8]"
            />
          </div>
        )}
      </div>

      {/* Lista de Registros com Scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {/* Pesquisadores */}
        {(activeTab === 'all' || activeTab === 'researchers') &&
          filteredResearchers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-lexend">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
                  Pesquisadores ({filteredResearchers.length})
                </span>
                <span className="normal-case tracking-normal">
                  <CsvButton
                    onClick={() =>
                      exportResearchers(
                        filteredResearchers,
                        results.researchersBlock,
                      )
                    }
                  />
                </span>
              </div>

              <div className="space-y-2">
                {filteredResearchers.map((r, idx) => {
                  const instText = researcherInstitution(r) || 'Instituição';
                  const location = [r.city, r.state]
                    .filter(Boolean)
                    .join(' - ');
                  const m = r.metrics || {};
                  const photo =
                    r.photo_url ||
                    (urlGeral
                      ? `${urlGeral}ResearcherData/Image?name=${encodeURIComponent(r.name)}`
                      : undefined);

                  return (
                    <div
                      key={r.id || `${r.name}-${idx}`}
                      onClick={() => onOpenResearcherModal(r.name)}
                      className="group bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg p-2.5 hover:border-[#07677e]/60 dark:hover:border-[#559FB8]/60 hover:shadow-xs transition-all cursor-pointer space-y-1.5 border-l-4 border-l-[#719CB8]"
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="h-7 w-7 rounded-md shrink-0 border border-slate-200 dark:border-neutral-800">
                          <AvatarImage
                            src={photo}
                            alt={r.name}
                            className="rounded-md object-cover"
                          />
                          <AvatarFallback className="rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                            {r.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#07677e] dark:group-hover:text-[#559FB8] transition-colors font-lexend">
                            {r.name}
                          </h5>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#07677e] dark:text-[#559FB8] font-medium truncate max-w-full">
                            <Building2 className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{instText}</span>
                          </span>
                          {(r.territory || location) && (
                            <span className="flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">
                                {[r.territory, location]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {r.abstract && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                          {r.abstract}
                        </p>
                      )}

                      {/* Badges de métricas de carreira */}
                      <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100 dark:border-neutral-900 text-[10px]">
                        {!!m.articles && (
                          <span className="px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                            {m.articles.toLocaleString('pt-BR')} art.
                          </span>
                        )}
                        {!!m.books && (
                          <span className="px-1.5 py-0.5 rounded font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                            {m.books} liv.
                          </span>
                        )}
                        {!!m.patents && (
                          <span className="px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                            {m.patents} pat.
                          </span>
                        )}
                        {m.h_index !== null &&
                          m.h_index !== undefined &&
                          m.h_index > 0 && (
                            <span className="px-1.5 py-0.5 rounded font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                              H-index: {m.h_index}
                            </span>
                          )}
                        {r.lattes_id && (
                          <a
                            href={`http://lattes.cnpq.br/${r.lattes_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-auto inline-flex items-center gap-0.5 text-[#07677e] dark:text-[#559FB8] hover:underline font-medium"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Lattes
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Produções */}
        {(activeTab === 'all' || activeTab === 'productions') &&
          filteredProductions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-lexend">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
                  Produções ({filteredProductions.length})
                </span>
                <span className="normal-case tracking-normal">
                  <CsvButton
                    onClick={() =>
                      exportProductions(
                        filteredProductions,
                        results.productionsBlock,
                      )
                    }
                  />
                </span>
              </div>

              <div className="space-y-2">
                {filteredProductions.map((p, idx) => {
                  const config =
                    PRODUCTION_TYPE_CONFIG[p.type] || DEFAULT_PRODUCTION_TYPE;
                  const IconComp = config.icon;
                  const authors = productionAuthors(p);
                  const d = p.details || {};
                  const venue = d.magazine || d.event_name || d.status || '';

                  return (
                    <div
                      key={p.id || `${p.title}-${idx}`}
                      className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg p-2.5 hover:border-[#07677e]/40 dark:hover:border-[#559FB8]/40 hover:shadow-xs transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${config.badgeClass}`}
                        >
                          <IconComp className="w-2.5 h-2.5 shrink-0" />
                          {p.type_label || p.type}
                        </span>
                        <div className="flex items-center gap-1">
                          {d.qualis && (
                            <span className="px-1.5 py-0.5 bg-[#559FB8]/15 text-[#07677e] dark:text-[#559FB8] rounded text-[10px] font-bold">
                              Qualis {d.qualis}
                            </span>
                          )}
                          {p.year && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
                              {p.year}
                            </span>
                          )}
                        </div>
                      </div>

                      <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug font-lexend line-clamp-2">
                        {p.title}
                      </h5>

                      {authors && (
                        <p
                          className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1"
                          title={authors}
                        >
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            Autores:
                          </span>{' '}
                          {authors}
                        </p>
                      )}

                      {/* Metadados adicionais e DOI */}
                      {(venue || d.doi || d.issn || d.isbn) && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-neutral-900 text-[10.5px] text-slate-400">
                          <span className="truncate" title={venue}>
                            {venue ||
                              (d.issn
                                ? `ISSN ${d.issn}`
                                : d.isbn
                                  ? `ISBN ${d.isbn}`
                                  : '')}
                          </span>
                          {d.doi && (
                            <a
                              href={doiUrl(d.doi)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-0.5 text-[#07677e] dark:text-[#559FB8] hover:underline font-medium"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              DOI
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {totalCount === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">
            Nenhum registro associado a esta consulta.
          </div>
        )}

        {/* Origem dos registros */}
        {[results.researchersBlock?.origin, results.productionsBlock?.origin]
          .filter((o): o is MariaBlockOrigin => !!o)
          .map((origin, i) => (
            <p key={i} className="text-[10.5px] text-slate-400 leading-relaxed">
              {originText(origin)}
            </p>
          ))}
      </div>
    </aside>
  );
}

// --- Blocos de conteúdo de uma resposta da MarIA ---
interface AssistantBlocksProps {
  msg: ChatMessage;
  isDark: boolean;
  disabled: boolean;
  onOpenResults: (results: MariaResults) => void;
  onAsk: (question: string) => void;
}

function AssistantBlocks({
  msg,
  isDark,
  disabled,
  onOpenResults,
  onAsk,
}: AssistantBlocksProps) {
  const blocks = msg.blocks.filter(Boolean);
  const results = collectResults(blocks);
  const lastTextIndex = blocks.map((b) => b.type).lastIndexOf('text');
  const currentActivity = msg.activities?.[msg.activities.length - 1];
  let resultsShown = false;

  return (
    <>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'text':
            return (
              <div
                key={idx}
                className="bg-white dark:bg-neutral-950 p-3.5 md:p-4 rounded-lg border border-slate-200/80 dark:border-neutral-800/80 mt-2"
              >
                <SimpleMarkdownRenderer
                  content={(block as MariaTextBlock).text}
                  isStreaming={
                    msg.isStreaming &&
                    idx === lastTextIndex &&
                    idx === blocks.length - 1
                  }
                />
              </div>
            );
          case 'chart':
            return (
              <MariaChart
                key={idx}
                block={block as MariaChartBlock}
                isDark={isDark}
              />
            );
          case 'table':
            return <MariaTable key={idx} block={block as MariaTableBlock} />;
          case 'researchers':
          case 'productions': {
            // Um único atalho para a coluna lateral, mesmo com os dois tipos de bloco.
            if (resultsShown || !results) return null;
            resultsShown = true;
            const shownCount =
              results.researchers.length + results.productions.length;
            const totalCount =
              results.researchersTotal + results.productionsTotal;
            const parts = [
              results.researchers.length
                ? `${results.researchers.length} pesquisadores`
                : '',
              results.productions.length
                ? `${results.productions.length} produções`
                : '',
            ].filter(Boolean);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onOpenResults(results)}
                className="w-full text-left p-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-[#07677e] dark:hover:border-[#559FB8] hover:shadow-xs transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-4 h-4 text-[#07677e] dark:text-[#559FB8] shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {parts.join(' e ')} retornados
                  </span>
                  {totalCount > shownCount && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                      ({totalCount.toLocaleString('pt-BR')} totais na base)
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-[#07677e] dark:text-[#559FB8] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Ver na coluna lateral <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          }
          case 'suggestions':
            return (
              <div key={idx} className="space-y-1.5 pt-1">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <MessageCircleQuestion className="w-3.5 h-3.5" />
                  Continue a conversa
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(block as MariaSuggestionsBlock).questions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={disabled}
                      onClick={() => onAsk(q)}
                      className="text-left px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-200 hover:border-[#07677e] dark:hover:border-[#559FB8] hover:text-[#07677e] dark:hover:text-[#559FB8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            );
          default:
            // Tipos futuros da API são ignorados com segurança.
            return null;
        }
      })}

      {msg.isStreaming && (blocks.length === 0 || currentActivity) && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-[#559FB8]" />
          <span>
            {currentActivity
              ? currentActivity.description ||
                `Consultando ${currentActivity.source}…`
              : 'Sintetizando análise científica com IA...'}
          </span>
        </div>
      )}
    </>
  );
}

// --- Componente Principal da MarIA ---
export function Maria() {
  const { urlGeral, setIsCollapsed } = useContext(UserContext);
  const { user } = useAuth();
  const { theme } = useTheme();
  const { onOpen } = useModal();
  const isDark = theme === 'dark';

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<MariaConversation | null>(
    null,
  );

  // Segunda coluna: resultados associados
  const [activeResults, setActiveResults] = useState<MariaResults | null>(null);
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(false);

  // Recomendações iniciais sorteadas aleatoriamente do catálogo oficial
  const [starterPrompts, setStarterPrompts] = useState<
    MariaPromptRecommendation[]
  >(() => getRandomRecommendations(6));

  const handleShufflePrompts = () => {
    setStarterPrompts(getRandomRecommendations(6));
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userName = user?.username || 'Você';
  const userPhoto = undefined;

  const questionsLimit = conversation?.questions_limit ?? null;
  const questionsAsked = conversation?.questions_asked ?? 0;
  const remainingQuestions = questionsLimit
    ? Math.max(questionsLimit - questionsAsked, 0)
    : null;
  const limitReached = remainingQuestions === 0;

  // Ao abrir o chat da IA, contrai a barra lateral do layout principal
  useEffect(() => {
    setIsCollapsed(false);
  }, [setIsCollapsed]);

  // Retoma a última conversa deste navegador, gravada pela API da Maria.
  useEffect(() => {
    const storedId = readStoredConversationId();
    if (!storedId) return;
    let cancelled = false;
    Promise.all([getConversation(storedId), listMessages(storedId)])
      .then(([conv, { messages: stored }]) => {
        if (cancelled) return;
        setConversation(conv);
        const restored = stored.map(fromApiMessage);
        setMessages(restored);
        const lastWithResults = [...restored]
          .reverse()
          .find((m) => collectResults(m.blocks));
        if (lastWithResults)
          setActiveResults(collectResults(lastWithResults.blocks));
      })
      .catch(() => {
        if (!cancelled) storeConversationId(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const openResults = (results: MariaResults) => {
    setActiveResults(results);
    setIsResultsPanelOpen(true);
  };

  // --- Envio e Streaming SSE (POST /conversations/{id}/messages/stream) ---
  const handleSendMessage = async (queryToSend?: string) => {
    const query = (queryToSend ?? question).trim();
    if (!query || isGenerating || limitReached) return;

    const userMsgId = 'user_' + Date.now();
    const botMsgId = 'bot_' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        blocks: [{ type: 'text', text: query }],
        time: formatTime(),
      },
      {
        id: botMsgId,
        role: 'assistant',
        blocks: [],
        time: formatTime(),
        isStreaming: true,
      },
    ]);
    setQuestion('');
    setIsGenerating(true);

    const updateBot = (fn: (msg: ChatMessage) => ChatMessage) =>
      setMessages((prev) =>
        prev.map((msg) => (msg.id === botMsgId ? fn(msg) : msg)),
      );

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let currentConversation = conversation;

    try {
      // Sem conversa ativa, a primeira pergunta cria uma nova.
      if (!currentConversation) {
        currentConversation = await createConversation();
        setConversation(currentConversation);
        storeConversationId(currentConversation.id);
      }

      for await (const { event, data } of streamMessage(
        currentConversation.id,
        query,
        controller.signal,
      )) {
        if (event === 'message.user') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === userMsgId
                ? { ...msg, time: formatTime(data.created_at) }
                : msg,
            ),
          );
        } else if (event === 'activity') {
          updateBot((msg) => ({
            ...msg,
            activities: [...(msg.activities ?? []), data],
          }));
        } else if (event === 'content.delta') {
          updateBot((msg) => applyDelta(msg, data));
        } else if (event === 'message.assistant') {
          // A versão persistida substitui o conteúdo parcial.
          updateBot((msg) => ({
            ...msg,
            blocks: data.content,
            time: formatTime(data.created_at),
            isStreaming: false,
          }));
          const results = collectResults(data.content);
          if (results) openResults(results);
        } else if (event === 'error') {
          throw new MariaApiError(data.detail, 'stream');
        }
      }

      // Atualiza o contador de perguntas da conversa.
      getConversation(currentConversation.id)
        .then(setConversation)
        .catch(() => undefined);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        updateBot((msg) => ({ ...msg, isStreaming: false, interrupted: true }));
      } else if (
        err instanceof MariaApiError &&
        err.status === 404 &&
        currentConversation
      ) {
        // A conversa gravada não existe mais: a próxima pergunta cria outra.
        setConversation(null);
        storeConversationId(null);
        updateBot((msg) => ({
          ...msg,
          isStreaming: false,
          error:
            'A conversa anterior não está mais disponível. Tente novamente para iniciar uma nova.',
          retryQuery: query,
          pairId: userMsgId,
        }));
      } else {
        console.error('Erro na requisição MarIA:', err);
        const { text, canRetry } = errorMessage(err);
        updateBot((msg) => ({
          ...msg,
          isStreaming: false,
          error: text,
          ...(canRetry ? { retryQuery: query, pairId: userMsgId } : {}),
        }));
        if (
          err instanceof MariaApiError &&
          err.status === 429 &&
          currentConversation
        ) {
          getConversation(currentConversation.id)
            .then(setConversation)
            .catch(() => undefined);
        }
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      textareaRef.current?.focus();
    }
  };

  // Nada foi gravado na falha: remove a tentativa e envia a pergunta de novo.
  const handleRetry = (msg: ChatMessage) => {
    if (!msg.retryQuery || isGenerating) return;
    setMessages((prev) =>
      prev.filter((m) => m.id !== msg.id && m.id !== msg.pairId),
    );
    handleSendMessage(msg.retryQuery);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = () => {
    if (isGenerating) {
      handleStopGeneration();
    }
    setMessages([]);
    setConversation(null);
    storeConversationId(null);
    setActiveResults(null);
    setIsResultsPanelOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const totalResultsCount = activeResults
    ? activeResults.researchers.length + activeResults.productions.length
    : 0;

  return (
    <main className="w-full h-full max-h-full flex-1 flex flex-col font-lexend overflow-hidden min-h-0 p-2 md:p-3 pb-1">
      <Helmet>
        <title>MarIA - Assistente Científica | Simcc</title>
        <meta
          name="description"
          content="Pesquisa com inteligência artificial sobre produções científicas, patentes e pesquisadores da Bahia no Simcc."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Container Principal: Chat + Segunda Coluna de Resultados */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 w-full relative">
        {/* Coluna 1: Chat Principal */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 min-h-0">
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto min-h-0 px-1 md:px-4 space-y-4 max-w-5xl w-full mx-auto"
          >
            {messages.length === 0 ? (
              /* Estado Inicial Hero */
              <div className="h-full flex flex-col justify-center items-center text-center py-6 md:py-12">
                <div className="max-w-3xl space-y-4 w-full">
                  <div className="flex justify-center mb-1">
                    <div className="h-14 w-14 p-2 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center justify-center">
                      {isDark ? <SymbolEEWhite /> : <SymbolEE />}
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 font-lexend tracking-tight">
                    <span className="bg-gradient-to-r from-blue-700 to-red-600 text-transparent bg-clip-text">
                      Olá,
                    </span>{' '}
                    como posso apoiar sua pesquisa científica hoje?
                  </h2>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Pergunte em linguagem natural sobre artigos, patentes,
                    projetos e pesquisadores da Bahia. A MarIA responde com
                    textos, gráficos e tabelas.
                  </p>

                  {/* Sugestões de Consulta Alternadas Aleatoriamente */}
                  <div className="pt-2 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Sugestões de Consulta
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleShufflePrompts}
                        className="h-7 px-2 text-[11px] text-[#07677e] dark:text-[#559FB8] hover:bg-[#07677e]/10 gap-1.5"
                      >
                        <Shuffle className="w-3 h-3" />
                        Sortear outras
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {starterPrompts.map((starter, idx) => {
                        const StarterIcon = starter.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(starter.query)}
                            className="group flex flex-col justify-between text-left p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-[#07677e] dark:hover:border-[#559FB8] hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300">
                                {starter.category}
                              </span>
                              <StarterIcon className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8] shrink-0" />
                            </div>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#07677e] dark:group-hover:text-[#559FB8] transition-colors leading-snug line-clamp-2">
                              {starter.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Histórico de Mensagens */
              <div className="space-y-4 pb-4">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const consulted = isUser
                    ? { sources: [], lines: [] }
                    : consultedEntries(msg);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center shrink-0 p-1 mt-0.5">
                          {isDark ? <SymbolEEWhite /> : <SymbolEE />}
                        </div>
                      )}

                      <div
                        className={`flex flex-col ${isUser ? 'items-end max-w-2xl' : 'w-full min-w-0'}`}
                      >
                        <div
                          className={`p-4 md:p-5 rounded-xl shadow-xs transition-all ${
                            isUser
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-slate-900 dark:text-blue-50 rounded-tr-xs'
                              : 'bg-slate-50/60 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-slate-100 rounded-tl-xs w-full space-y-3'
                          }`}
                        >
                          {/* Cabeçalho da Mensagem */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-lexend">
                              {isUser ? userName : 'MarIA'}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {msg.time}
                            </span>
                          </div>

                          {/* Fontes consultadas pela MarIA */}
                          {!isUser && (
                            <SourcesBadges sources={consulted.sources} />
                          )}

                          {isUser ? (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 font-lexend">
                              {blocksText(msg.blocks)}
                            </p>
                          ) : (
                            <AssistantBlocks
                              msg={msg}
                              isDark={isDark}
                              disabled={isGenerating || limitReached}
                              onOpenResults={openResults}
                              onAsk={(q) => handleSendMessage(q)}
                            />
                          )}

                          {/* Aviso de Interrupção */}
                          {msg.interrupted && (
                            <p className="text-xs italic text-slate-500 dark:text-slate-400">
                              (Geração interrompida pelo usuário. Nada foi
                              gravado na conversa.)
                            </p>
                          )}

                          {/* Erros se houver */}
                          {msg.error && (
                            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span className="flex-1">{msg.error}</span>
                              {msg.retryQuery && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isGenerating}
                                  onClick={() => handleRetry(msg)}
                                  className="h-6 px-2 text-[11px] gap-1 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 bg-transparent hover:bg-red-100 dark:hover:bg-red-900/40 shrink-0"
                                >
                                  <RotateCw className="w-3 h-3" />
                                  Tentar novamente
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Consultas realizadas */}
                          {!isUser && !msg.isStreaming && (
                            <SourcesSection lines={consulted.lines} />
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <Avatar className="h-8 w-8 rounded-md shrink-0 border border-slate-200 dark:border-neutral-800 mt-0.5">
                          <AvatarImage
                            src={userPhoto}
                            alt={userName}
                            className="rounded-md"
                          />
                          <AvatarFallback className="rounded-md bg-blue-100 dark:bg-blue-950 text-[#07677e] dark:text-[#559FB8] text-xs font-semibold">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Barra Inferior de Entrada */}
          <footer className="pt-1 max-w-[95%] lg:max-w-4xl w-full mx-auto shrink-0">
            {limitReached && (
              <div className="mb-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Limite de perguntas desta conversa atingido.
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-6 px-2 text-[11px] bg-[#07677e] hover:bg-[#024A60] text-white"
                >
                  Nova conversa
                </Button>
              </div>
            )}

            <div className="relative border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-xs focus-within:ring-2 focus-within:ring-[#559FB8]/40 focus-within:border-[#559FB8] transition-all">
              <Label htmlFor="maria-prompt-input" className="sr-only">
                Pergunta para a MarIA
              </Label>

              <Textarea
                ref={textareaRef}
                id="maria-prompt-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating || limitReached}
                maxLength={10000}
                placeholder={
                  limitReached
                    ? 'Limite de perguntas atingido. Inicie uma nova conversa.'
                    : 'Pergunte sobre pesquisadores, artigos, patentes, projetos...'
                }
                className="min-h-[46px] max-h-32 resize-none border-0 px-3 py-2 text-xs md:text-sm font-lexend focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              />

              <div className="flex items-center justify-between p-2 pt-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {messages.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          onClick={handleClearHistory}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 gap-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-md shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            Nova conversa
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Reiniciar conversa
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {activeResults && !isResultsPanelOpen && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsResultsPanelOpen(true)}
                      className="h-7 px-2 text-xs font-medium text-[#07677e] dark:text-[#559FB8] border-[#07677e]/30 hover:bg-[#07677e]/10 gap-1.5 rounded-md shrink-0"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        Ver itens retornados
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#07677e] text-white">
                        {totalResultsCount}
                      </span>
                    </Button>
                  )}

                  {remainingQuestions !== null && remainingQuestions > 0 && (
                    <span
                      className={`text-[11px] pl-1 truncate ${
                        remainingQuestions <= 1
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {remainingQuestions === 1
                        ? 'Última pergunta desta conversa'
                        : `Restam ${remainingQuestions} de ${questionsLimit} perguntas`}
                    </span>
                  )}

                  <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 pl-1">
                    <span>Pressione</span>
                    <kbd className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-[10px] font-mono">
                      Enter
                    </kbd>
                    <span>para enviar</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isGenerating ? (
                    <Button
                      onClick={handleStopGeneration}
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-7 md:h-8 gap-1.5 text-xs rounded-lg font-medium"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      Parar geração
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!question.trim() || limitReached}
                      type="button"
                      size="sm"
                      className="h-7 md:h-8 gap-1.5 text-xs rounded-lg bg-[#07677e] hover:bg-[#024A60] text-white font-medium shadow-xs disabled:opacity-50 transition-colors"
                    >
                      Enviar
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-[10.5px] text-slate-400 dark:text-slate-500 mt-1">
              A MarIA pode apresentar informações imprecisas. Por favor, confira
              as fontes oficiais e currículos Lattes.
            </p>
          </footer>
        </div>

        {/* Coluna 2: Segunda Coluna com a Lista de Itens Retornados */}
        {isResultsPanelOpen && activeResults && (
          <MariaResultsColumn
            results={activeResults}
            onClose={() => setIsResultsPanelOpen(false)}
            urlGeral={urlGeral}
            onOpenResearcherModal={(name) =>
              onOpen('researcher-modal', { name })
            }
          />
        )}
      </div>
    </main>
  );
}
