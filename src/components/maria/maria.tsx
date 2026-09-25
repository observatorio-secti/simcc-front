import {
  Send,
  User,
  Square,
  Sparkles,
  RotateCcw,
  BookOpen,
  FileText,
  Lightbulb,
  Cpu,
  Bookmark,
  ExternalLink,
  Building2,
  Calendar,
  MapPin,
  Search,
  ChevronDown,
  Layers,
  AlertCircle,
  Target,
  Hash,
  HelpCircle,
  X,
  Shuffle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { SymbolEE } from '../svg/SymbolEE';
import { SymbolEEWhite } from '../svg/SymbolEEWhite';
import { UserContext } from '../../context/context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useModal } from '../hooks/use-modal-store';
import { Helmet } from 'react-helmet';

// --- Contratos de Domínio & Tipos ---

export interface MariaResearcherMetrics {
  articles?: number;
  patents?: number;
  h_index?: number | string;
  software?: number;
  books?: number;
}

export interface MariaResearcher {
  id: string;
  name: string;
  institution?: string;
  institution_acronym?: string;
  lattes_id?: string;
  abstract?: string;
  metrics?: MariaResearcherMetrics;
}

export interface MariaProduction {
  id: string;
  type: 'ARTICLE' | 'BOOK' | 'BOOK_CHAPTER' | 'PATENT' | 'SOFTWARE' | 'REPORT' | string;
  title: string;
  year?: string;
  authors?: string;
  doi?: string | null;
  details?: {
    periodical?: string;
    qualis?: string;
    jcr?: string;
    issn?: string;
    publisher?: string;
    city?: string;
    isbn?: string;
    book_title?: string;
    organizers?: string;
    code?: string;
    category?: string;
    grant_date?: string;
    platform?: string;
    environment?: string;
    goal?: string;
    funding?: string;
    project_name?: string;
  };
  researcher?: {
    id?: string;
    name?: string;
    institution?: string;
    metrics?: MariaResearcherMetrics;
  };
}

export interface MariaGlobalMetrics {
  total_matched?: number;
  sample_count?: number;
  institution_shares?: Record<string, { share?: string; count?: number }>;
}

export interface MariaClarificationOption {
  id: string;
  label: string;
  description?: string;
}

export interface MariaClarification {
  question: string;
  field_to_bind: string;
  options: MariaClarificationOption[];
}

export interface MariaFilters {
  institutions?: string[];
  researcher_name?: string;
  production_types?: string[];
  period?: string;
  city?: string;
}

export interface MariaMetadata {
  intent?: string;
  filters?: MariaFilters;
  researchers?: MariaResearcher[];
  productions?: MariaProduction[];
  global_metrics?: MariaGlobalMetrics;
  sources?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  metadata?: MariaMetadata;
  clarification?: MariaClarification;
  clarificationSelectedOption?: string;
  error?: string;
  isStreaming?: boolean;
  interrupted?: boolean;
}

// --- Dicionário de Mapeamento de Intenções ---
const INTENT_LABELS: Record<string, string> = {
  production_search: 'Busca por Produções',
  researcher_profile: 'Perfil Biográfico',
  researcher_comparison: 'Comparação Institucional',
  researcher_search: 'Busca por Pesquisadores',
  aggregation: 'Métricas e Estatísticas',
  general_question: 'Consulta Geral',
};

// --- Sugestões Oficiais e Categorizadas da MarIA ---
export interface MariaPromptRecommendation {
  query: string;
  label: string;
  category: string;
  icon: any;
}

export const ALL_RECOMMENDATIONS: MariaPromptRecommendation[] = [
  {
    query: 'Quais artigos sobre saúde coletiva e epidemiologia foram publicados a partir de 2021 na UFBA?',
    label: 'Saúde coletiva na UFBA (a partir de 2021)',
    category: 'Filtro Temporal',
    icon: Calendar,
  },
  {
    query: 'Livros publicados até 2012 sobre biodiversidade e processos ecológicos na Bahia',
    label: 'Livros sobre biodiversidade até 2012',
    category: 'Filtro Temporal',
    icon: BookOpen,
  },
  {
    query: 'Produções científicas sobre biopolímeros e reaproveitamento de resíduos entre 2015 e 2022',
    label: 'Biopolímeros e resíduos (2015 a 2022)',
    category: 'Filtro Temporal',
    icon: Layers,
  },
  {
    query: 'Como está o perfil de Eduardo Jorge na plataforma?',
    label: 'Perfil de Eduardo Jorge',
    category: 'Memória e Continuidade',
    icon: User,
  },
  {
    query: 'Quem é a pesquisadora Silvia Lúcia Ferreira da UFBA?',
    label: 'Silvia Lúcia Ferreira (UFBA)',
    category: 'Memória e Continuidade',
    icon: User,
  },
  {
    query: 'Quem é Claudia Brodskyn e quais patentes ela tem registradas?',
    label: 'Claudia Brodskyn e patentes registradas',
    category: 'Desambiguação',
    icon: Search,
  },
  {
    query: 'Quais os trabalhos do pesquisador Ricardo Brugger?',
    label: 'Trabalhos de Ricardo Brugger (UFRB)',
    category: 'Tolerância a Erros',
    icon: Search,
  },
  {
    query: 'O que Adilson pesquisa?',
    label: 'O que Adilson pesquisa? (Clarificação)',
    category: 'Clarificação',
    icon: HelpCircle,
  },
  {
    query: 'Existem softwares, aplicativos ou sistemas desenvolvidos voltados para idosos ou gestantes na Bahia?',
    label: 'Softwares para idosos ou gestantes',
    category: 'Softwares',
    icon: Cpu,
  },
  {
    query: 'Quais patentes e registros em odontologia ou próteses foram depositados na UFBA?',
    label: 'Patentes em odontologia na UFBA',
    category: 'Patentes',
    icon: Lightbulb,
  },
  {
    query: 'Quais pesquisadores trabalham com a cultura do cacau e polifenóis no sul da Bahia?',
    label: 'Cacau e polifenóis no sul da Bahia',
    category: 'Contexto Regional',
    icon: Building2,
  },
  {
    query: 'Pesquisas e relatórios sobre bandas, filarmônicas e música tradicional no Recôncavo Baiano',
    label: 'Bandas e filarmônicas no Recôncavo',
    category: 'Relatórios Técnicos',
    icon: FileText,
  },
  {
    query: 'Quais estudos da UNEB e UEFS abordam história das mulheres negras e comunidades quilombolas ou indígenas no sertão?',
    label: 'Mulheres negras e quilombolas no sertão',
    category: 'História e Sociedade',
    icon: Bookmark,
  },
  {
    query: 'Artigos publicados sobre clima urbano e mapeamento de ilhas de calor em Salvador',
    label: 'Ilhas de calor e clima em Salvador',
    category: 'Cidades Baianas',
    icon: MapPin,
  },
];

export function getRandomRecommendations(count = 6): MariaPromptRecommendation[] {
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
    '<pre class="p-3 my-2 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto font-mono text-xs"><code>$1</code></pre>'
  );

  // Código inline
  text = text.replace(
    /`([^`\n]+)`/g,
    '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-neutral-800 text-[#07677e] dark:text-[#559FB8] rounded font-mono text-xs font-medium">$1</code>'
  );

  // Cabeçalhos
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-3 mb-1 font-lexend">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 mt-3.5 mb-1.5 font-lexend border-b border-slate-200 dark:border-neutral-800 pb-1">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 font-lexend">$1</h1>');

  // Citações
  text = text.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#719CB8] pl-3 py-1 my-2 bg-slate-50 dark:bg-neutral-800/50 text-slate-700 dark:text-slate-300 italic text-sm rounded-r">$1</blockquote>');

  // Negrito e Itálico
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>');

  // Links
  text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#07677e] dark:text-[#559FB8] hover:underline font-medium inline-flex items-center gap-0.5">$1</a>');

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
      resultLines.push(`<li class="my-0.5 leading-normal text-slate-700 dark:text-slate-300">${itemContent}</li>`);
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
      resultLines.push(`<li class="my-0.5 leading-normal text-slate-700 dark:text-slate-300">${itemContent}</li>`);
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
        resultLines.push(`<p class="my-1 leading-relaxed text-slate-800 dark:text-slate-200">${line}</p>`);
      }
    }
  }

  if (inUnorderedList) resultLines.push('</ul>');
  if (inOrderedList) resultLines.push('</ol>');

  return resultLines.join('\n');
}

// --- Componente de Renderização Markdown ---
function SimpleMarkdownRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
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

// --- Componente de Badges de Metadados ---
function MetadataBadges({ metadata }: { metadata: MariaMetadata }) {
  const { intent, filters } = metadata;
  const f = filters || {};

  const hasBadges =
    intent ||
    (f.institutions && f.institutions.length > 0) ||
    f.researcher_name ||
    (f.production_types && f.production_types.length > 0) ||
    f.period ||
    f.city;

  if (!hasBadges) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-slate-200/80 dark:border-neutral-800">
      {intent && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
          <Target className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          {INTENT_LABELS[intent] || intent}
        </span>
      )}

      {f.institutions && f.institutions.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {f.institutions.join(', ')}
        </span>
      )}

      {f.researcher_name && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          {f.researcher_name}
        </span>
      )}

      {f.production_types && f.production_types.length > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
          <Bookmark className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          {f.production_types.join(', ')}
        </span>
      )}

      {f.period && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
          <Calendar className="w-3 h-3 text-slate-600 dark:text-slate-400" />
          {f.period}
        </span>
      )}

      {f.city && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
          <MapPin className="w-3 h-3 text-slate-600 dark:text-slate-400" />
          {f.city}
        </span>
      )}
    </div>
  );
}

// --- Componente de Bento Grid: Pesquisadores Identificados ---
function ResearchersBentoGrid({ researchers }: { researchers: MariaResearcher[] }) {
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();

  if (!researchers || researchers.length === 0) return null;

  return (
    <div className="space-y-2 mt-1">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-lexend flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
          Pesquisadores Identificados ({researchers.length})
        </h4>
        <span className="text-[11px] text-slate-400">Clique para abrir o perfil</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {researchers.map((r, idx) => {
          const instText = r.institution_acronym
            ? `${r.institution_acronym}`
            : r.institution || 'Instituição';

          return (
            <div
              key={r.id || `${r.name}-${idx}`}
              onClick={() => onOpen('researcher-modal', { name: r.name })}
              style={{
                animationDelay: `${Math.min(idx * 70, 500)}ms`,
                animationFillMode: 'backwards',
              }}
              className="group animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg p-2.5 border-l-4 border-l-[#719CB8] hover:border-l-[#07677e] hover:border-slate-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-2 mb-1.5">
                  <Avatar className="h-7 w-7 rounded-md shrink-0 border border-slate-200 dark:border-neutral-800">
                    <AvatarImage
                      src={`${urlGeral}ResearcherData/Image?name=${encodeURIComponent(r.name)}`}
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
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#07677e] dark:text-[#559FB8] font-medium truncate">
                      <Building2 className="w-2.5 h-2.5 shrink-0" />
                      {instText}
                    </span>
                  </div>
                </div>

                {r.abstract && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                    {r.abstract}
                  </p>
                )}
              </div>

              <div className="mt-2 pt-1 border-t border-slate-100 dark:border-neutral-900 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-[#07677e] dark:group-hover:text-[#559FB8]">
                <span>Lattes ID: {r.lattes_id ? r.lattes_id.slice(0, 10) + '...' : 'Disponível'}</span>
                <span className="font-semibold">&rarr;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Configuração Visual dos Tipos de Produção ---
const PRODUCTION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: any; badgeClass: string }
> = {
  ARTICLE: {
    label: 'Artigo',
    icon: FileText,
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  BOOK: {
    label: 'Livro',
    icon: BookOpen,
    badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  BOOK_CHAPTER: {
    label: 'Capítulo de Livro',
    icon: Bookmark,
    badgeClass: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  },
  PATENT: {
    label: 'Patente / INPI',
    icon: Lightbulb,
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  SOFTWARE: {
    label: 'Software',
    icon: Cpu,
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  REPORT: {
    label: 'Relatório Técnico',
    icon: Layers,
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border-slate-200 dark:border-neutral-700',
  },
};

// --- Componente Bento Grid: Produções Científicas e Tecnológicas Densas ---
function ProductionsBentoGrid({ productions }: { productions: MariaProduction[] }) {
  if (!productions || productions.length === 0) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-lexend flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
          Produções Científicas e Tecnológicas ({productions.length})
        </h4>
        <span className="text-[11px] text-slate-400">Distribuição em grade compacta</span>
      </div>

      {/* Grid Bento Multi-coluna Horizontal com animação escalonada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {productions.map((p, idx) => {
          const config = PRODUCTION_TYPE_CONFIG[p.type] || {
            label: p.type,
            icon: FileText,
            badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border-slate-200',
          };
          const IconComp = config.icon;
          const rName = p.researcher ? `${p.researcher.name} (${p.researcher.institution || ''})` : '';

          return (
            <div
              key={p.id || `${p.title}-${idx}`}
              style={{
                animationDelay: `${Math.min(idx * 60, 600)}ms`,
                animationFillMode: 'backwards',
              }}
              className="group animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg p-3 hover:border-[#559FB8]/60 hover:shadow-xs transition-all flex flex-col justify-between space-y-2"
            >
              <div>
                {/* Topo do Card: Tipo & Badge de Ano */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.badgeClass}`}
                  >
                    <IconComp className="w-3 h-3 shrink-0" />
                    {config.label}
                  </span>

                  {p.year && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
                      <Calendar className="w-2.5 h-2.5 text-slate-400" />
                      {p.year}
                    </span>
                  )}
                </div>

                {/* Título da Produção */}
                <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug font-lexend line-clamp-2 mb-1">
                  {p.title}
                </h5>

                {/* Autores */}
                {(p.authors || rName) && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Autores:</span>{' '}
                    {p.authors || rName}
                  </p>
                )}
              </div>

              {/* Metadados Técnicos Densos */}
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-900 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-ubuntu">
                {p.details && (
                  <div className="space-y-1">
                    {p.details.periodical && (
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate" title={p.details.periodical}>
                          {p.details.periodical}
                        </span>
                        {p.details.qualis && (
                          <span className="shrink-0 px-1.5 py-0.2 bg-[#559FB8]/15 text-[#07677e] dark:text-[#559FB8] rounded text-[10px] font-bold">
                            Qualis {p.details.qualis}
                          </span>
                        )}
                      </div>
                    )}

                    {p.details.publisher && (
                      <div className="truncate" title={p.details.publisher}>
                        <span className="font-medium text-slate-500">Editora:</span> {p.details.publisher}
                      </div>
                    )}

                    {p.details.code && (
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-medium">Reg:</span> {p.details.code}
                        {p.details.category && ` (${p.details.category})`}
                      </div>
                    )}

                    {p.details.platform && (
                      <div className="truncate">
                        <span className="font-medium">Plat:</span> {p.details.platform}
                      </div>
                    )}
                  </div>
                )}

                {/* Link DOI se disponível */}
                {p.doi && (
                  <div className="pt-0.5 flex justify-end">
                    <a
                      href={`https://doi.org/${p.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#07677e] dark:text-[#559FB8] hover:underline font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      DOI
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Componente de Fontes e Citações Consultadas ---
function SourcesSection({ sources }: { sources: string[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <details className="group mt-2 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs transition-colors">
      <summary className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer list-none flex items-center justify-between select-none">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
          Fontes e Citações Consultadas ({sources.length})
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-neutral-900">
        <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400">
          {sources.map((s, idx) => (
            <li key={idx} className="leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

// --- Segunda Coluna: Painel de Itens Retornados da Consulta ---
interface MariaResultsColumnProps {
  metadata: MariaMetadata;
  onClose: () => void;
  urlGeral?: string;
  onOpenResearcherModal: (name: string) => void;
}

function MariaResultsColumn({
  metadata,
  onClose,
  urlGeral,
  onOpenResearcherModal,
}: MariaResultsColumnProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'researchers' | 'productions'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const researchers = metadata.researchers || [];
  const productions = metadata.productions || [];

  const totalCount = researchers.length + productions.length;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredResearchers = useMemo(() => {
    if (!normalizedSearch) return researchers;
    return researchers.filter(
      (r) =>
        r.name.toLowerCase().includes(normalizedSearch) ||
        (r.institution && r.institution.toLowerCase().includes(normalizedSearch)) ||
        (r.institution_acronym && r.institution_acronym.toLowerCase().includes(normalizedSearch))
    );
  }, [researchers, normalizedSearch]);

  const filteredProductions = useMemo(() => {
    if (!normalizedSearch) return productions;
    return productions.filter(
      (p) =>
        p.title.toLowerCase().includes(normalizedSearch) ||
        (p.authors && p.authors.toLowerCase().includes(normalizedSearch)) ||
        (p.type && p.type.toLowerCase().includes(normalizedSearch)) ||
        (p.researcher?.name && p.researcher.name.toLowerCase().includes(normalizedSearch))
    );
  }, [productions, normalizedSearch]);

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
              Registros da consulta ao SIMCC
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
            className={`flex-1 py-1 px-2 rounded-md text-center transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tudo ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('researchers')}
            className={`flex-1 py-1 px-2 rounded-md text-center transition-all ${
              activeTab === 'researchers'
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pesquisadores ({researchers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('productions')}
            className={`flex-1 py-1 px-2 rounded-md text-center transition-all ${
              activeTab === 'productions'
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
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
              placeholder="Filtrar por nome, título ou tipo..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/80 focus:outline-none focus:ring-1 focus:ring-[#07677e] dark:focus:ring-[#559FB8]"
            />
          </div>
        )}
      </div>

      {/* Lista de Registros com Scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {/* Pesquisadores */}
        {(activeTab === 'all' || activeTab === 'researchers') && filteredResearchers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-lexend">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
                Pesquisadores ({filteredResearchers.length})
              </span>
            </div>

            <div className="space-y-2">
              {filteredResearchers.map((r, idx) => {
                const instText = r.institution_acronym
                  ? `${r.institution_acronym}`
                  : r.institution || 'Instituição';

                return (
                  <div
                    key={r.id || `${r.name}-${idx}`}
                    onClick={() => onOpenResearcherModal(r.name)}
                    className="group bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg p-2.5 hover:border-[#07677e]/60 dark:hover:border-[#559FB8]/60 hover:shadow-xs transition-all cursor-pointer space-y-1.5 border-l-4 border-l-[#719CB8]"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="h-7 w-7 rounded-md shrink-0 border border-slate-200 dark:border-neutral-800">
                        <AvatarImage
                          src={
                            urlGeral
                              ? `${urlGeral}ResearcherData/Image?name=${encodeURIComponent(r.name)}`
                              : undefined
                          }
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
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#07677e] dark:text-[#559FB8] font-medium truncate">
                          <Building2 className="w-2.5 h-2.5 shrink-0" />
                          {instText}
                        </span>
                      </div>
                    </div>

                    {/* Badges de métricas de carreira */}
                    {r.metrics && (
                      <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100 dark:border-neutral-900 text-[10px]">
                        {r.metrics.articles !== undefined && (
                          <span className="px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                            {r.metrics.articles} art.
                          </span>
                        )}
                        {r.metrics.patents !== undefined && (
                          <span className="px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                            {r.metrics.patents} pat.
                          </span>
                        )}
                        {r.metrics.h_index !== undefined && (
                          <span className="px-1.5 py-0.5 rounded font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                            H-index: {r.metrics.h_index}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Produções */}
        {(activeTab === 'all' || activeTab === 'productions') && filteredProductions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-lexend">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
                Produções ({filteredProductions.length})
              </span>
            </div>

            <div className="space-y-2">
              {filteredProductions.map((p, idx) => {
                const config = PRODUCTION_TYPE_CONFIG[p.type] || {
                  label: p.type,
                  icon: FileText,
                  badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border-slate-200',
                };
                const IconComp = config.icon;
                const authorName = p.researcher?.name || p.authors || '';
                const rm = p.researcher?.metrics;

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
                        {config.label}
                      </span>
                      {p.year && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
                          {p.year}
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug font-lexend line-clamp-2">
                      {p.title}
                    </h5>

                    {authorName && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        <span className="font-medium text-slate-600 dark:text-slate-300">Autores:</span>{' '}
                        {authorName}
                        {rm && (rm.articles !== undefined || rm.h_index !== undefined) && (
                          <span className="text-[#07677e] dark:text-[#559FB8] font-medium ml-1">
                            [{[
                              rm.articles !== undefined ? `${rm.articles} art.` : null,
                              rm.h_index !== undefined ? `H: ${rm.h_index}` : null,
                            ]
                              .filter(Boolean)
                              .join(', ')}]
                          </span>
                        )}
                      </p>
                    )}

                    {/* Metadados adicionais e DOI */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-neutral-900 text-[10.5px] text-slate-400">
                      <span className="truncate max-w-[220px]">
                        {p.details?.periodical || p.details?.publisher || p.details?.code || ''}
                      </span>
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[#07677e] dark:text-[#559FB8] hover:underline font-medium"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          DOI
                        </a>
                      )}
                    </div>
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
      </div>
    </aside>
  );
}

// --- Componente Principal da MarIA ---
export function Maria() {
  const { urlGeral, user, setIsCollapsed } = useContext(UserContext);
  const { theme } = useTheme();
  const { onOpen } = useModal();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Segunda coluna: resultados associados
  const [activeResults, setActiveResults] = useState<MariaMetadata | null>(null);
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(false);

  // Recomendações iniciais sorteadas aleatoriamente do catálogo oficial
  const [starterPrompts, setStarterPrompts] = useState<MariaPromptRecommendation[]>(() =>
    getRandomRecommendations(6)
  );

  const handleShufflePrompts = () => {
    setStarterPrompts(getRandomRecommendations(6));
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userName = user?.display_name || 'Você';
  const userPhoto = user?.photo_url;

  // Session ID persistente
  const sessionId = useMemo(() => {
    return 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }, []);

  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Ao abrir o chat da IA, contrai a barra lateral do layout principal
  useEffect(() => {
    setIsCollapsed(false);
  }, [setIsCollapsed]);

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

  // --- Envio e Streaming SSE ---
  const handleSendMessage = async (
    queryToSend?: string,
    clarificationResponse?: { field: string; value: string }
  ) => {
    const query = (queryToSend || question).trim();
    if (!query || isGenerating) return;

    const userMsgId = 'user_' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: clarificationResponse ? `[Selecionado]: ${query}` : query,
      time: getCurrentTime(),
    };

    const botMsgId = 'bot_' + Date.now();
    const newBotMessage: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      time: getCurrentTime(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, newUserMessage, newBotMessage]);
    setQuestion('');
    setIsGenerating(true);

    const baseUrl = urlGeral ? (urlGeral.endsWith('/') ? urlGeral.slice(0, -1) : urlGeral) : '';
    const streamEndpoint = `${baseUrl}/ai/chat/ask/stream`;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';
    let accumulatedMetadata: MariaMetadata | undefined = undefined;

    try {
      const payload: any = {
        query: query,
        session_id: sessionId,
      };

      if (clarificationResponse) {
        payload.clarification_response = clarificationResponse;
      }

      const response = await fetch(streamEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Falha na comunicação com o servidor (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let sseBuffer = '';

      if (!reader) {
        throw new Error('ReadableStream não suportado pelo navegador.');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const payloadStr = trimmed.slice(6);
            if (!payloadStr) continue;

            try {
              const event = JSON.parse(payloadStr);

              if (event.type === 'metadata' && event.data) {
                accumulatedMetadata = event.data;

                // Quando a IA retornar algo, abre a segunda coluna automaticamente
                const hasResults =
                  (event.data.researchers && event.data.researchers.length > 0) ||
                  (event.data.productions && event.data.productions.length > 0) ||
                  !!event.data.global_metrics;

                if (hasResults) {
                  setActiveResults(event.data);
                  setIsResultsPanelOpen(true);
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? {
                          ...msg,
                          metadata: accumulatedMetadata,
                        }
                      : msg
                  )
                );
              } else if (event.type === 'clarification' && event.clarification) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? {
                          ...msg,
                          clarification: event.clarification,
                          isStreaming: false,
                        }
                      : msg
                  )
                );
              } else if (event.type === 'delta' && event.content) {
                accumulatedText += event.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? {
                          ...msg,
                          content: accumulatedText,
                        }
                      : msg
                  )
                );
              } else if (event.type === 'done') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? {
                          ...msg,
                          isStreaming: false,
                        }
                      : msg
                  )
                );
              } else if (event.type === 'error') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId
                      ? {
                          ...msg,
                          error: event.message || 'Erro durante a geração da resposta.',
                          isStreaming: false,
                        }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Falha no parse do evento SSE:', e, payloadStr);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  isStreaming: false,
                  interrupted: true,
                }
              : msg
          )
        );
      } else {
        console.error('Erro na requisição MarIA:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  error:
                    'Desculpe, ocorreu uma instabilidade ao conectar com os serviços da MarIA. Por favor, tente novamente.',
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const handleSelectClarification = (
    messageId: string,
    option: MariaClarificationOption,
    clarification: MariaClarification
  ) => {
    if (isGenerating) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, clarificationSelectedOption: option.id }
          : msg
      )
    );

    handleSendMessage(option.label, {
      field: clarification.field_to_bind,
      value: option.id,
    });
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
    ? (activeResults.researchers?.length || 0) + (activeResults.productions?.length || 0)
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
                      {theme === 'dark' ? <SymbolEEWhite /> : <SymbolEE />}
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 font-lexend tracking-tight">
                    <span className="bg-gradient-to-r from-blue-700 to-red-600 text-transparent bg-clip-text">
                      Olá,
                    </span>{' '}
                    como posso apoiar sua pesquisa científica hoje?
                  </h2>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Consulte em linguagem natural artigos, livros, patentes, softwares ou explore
                    linhas de pesquisa e competências acadêmicas entre instituições da Bahia.
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
                  const msgTotalResults = msg.metadata
                    ? (msg.metadata.researchers?.length || 0) + (msg.metadata.productions?.length || 0)
                    : 0;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center shrink-0 p-1 mt-0.5">
                          {theme === 'dark' ? <SymbolEEWhite /> : <SymbolEE />}
                        </div>
                      )}

                      <div className={`flex flex-col ${isUser ? 'items-end max-w-2xl' : 'w-full'}`}>
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

                          {/* Metadados Identificados (Pílulas de Intenção/Filtros) */}
                          {!isUser && msg.metadata && <MetadataBadges metadata={msg.metadata} />}

                          {/* Botão de Atalho para Abrir a Segunda Coluna com os Resultados */}
                          {!isUser && msg.metadata && (msgTotalResults > 0 || msg.metadata.global_metrics) && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveResults(msg.metadata!);
                                setIsResultsPanelOpen(true);
                              }}
                              className="w-full text-left p-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 hover:border-[#07677e] dark:hover:border-[#559FB8] hover:shadow-xs transition-all flex items-center justify-between text-xs cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#07677e] dark:text-[#559FB8]" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {msgTotalResults} itens associados retornados
                                </span>
                                {msg.metadata.global_metrics?.total_matched && (
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                                    ({msg.metadata.global_metrics.total_matched} totais na base)
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-semibold text-[#07677e] dark:text-[#559FB8] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                Ver na coluna lateral <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </button>
                          )}

                          {/* Bloco de Síntese Textual Markdown */}
                          <div className={!isUser ? 'bg-white dark:bg-neutral-950 p-3.5 md:p-4 rounded-lg border border-slate-200/80 dark:border-neutral-800/80 mt-2' : ''}>
                            {isUser ? (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 font-lexend">
                                {msg.content}
                              </p>
                            ) : msg.content ? (
                              <SimpleMarkdownRenderer
                                content={msg.content}
                                isStreaming={msg.isStreaming}
                              />
                            ) : msg.isStreaming ? (
                              <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#559FB8]" />
                                <span>Sintetizando análise científica com IA...</span>
                              </div>
                            ) : null}
                          </div>

                          {/* Clarificação Interativa Human-in-the-Loop */}
                          {!isUser && msg.clarification && (
                            <div className="mt-3 p-3.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                              <div className="flex items-start gap-2">
                                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-lexend">
                                    Clarificação necessária
                                  </h5>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                                    {msg.clarification.question}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 pt-1">
                                {msg.clarification.options.map((opt) => {
                                  const isSelected = msg.clarificationSelectedOption === opt.id;
                                  const isAnswered = !!msg.clarificationSelectedOption;

                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      disabled={isGenerating || isAnswered}
                                      onClick={() => handleSelectClarification(msg.id, opt, msg.clarification!)}
                                      className={`text-left p-2.5 rounded-md border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-indigo-100 dark:bg-indigo-900/60 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-xs'
                                          : isAnswered
                                          ? 'opacity-60 bg-white/50 dark:bg-neutral-900/50 border-slate-200 dark:border-neutral-800 cursor-not-allowed'
                                          : 'bg-white dark:bg-neutral-900 border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-500 hover:shadow-xs'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-lexend">
                                          {opt.label}
                                        </span>
                                        {isSelected && (
                                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                      </div>
                                      {opt.description && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                          {opt.description}
                                        </p>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Aviso de Interrupção */}
                          {msg.interrupted && (
                            <p className="text-xs italic text-slate-500 dark:text-slate-400">
                              (Geração interrompida pelo usuário)
                            </p>
                          )}

                          {/* Erros se houver */}
                          {msg.error && (
                            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{msg.error}</span>
                            </div>
                          )}

                          {/* Fontes Consultadas */}
                          {!isUser && msg.metadata?.sources && (
                            <SourcesSection sources={msg.metadata.sources} />
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <Avatar className="h-8 w-8 rounded-md shrink-0 border border-slate-200 dark:border-neutral-800 mt-0.5">
                          <AvatarImage src={userPhoto} alt={userName} className="rounded-md" />
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
                disabled={isGenerating}
                placeholder="Faça uma pergunta sobre pesquisadores, artigos, patentes, softwares..."
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
                          <span className="hidden sm:inline">Nova conversa</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Reiniciar conversa</TooltipContent>
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
                      <span className="hidden sm:inline">Ver itens retornados</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#07677e] text-white">
                        {totalResultsCount}
                      </span>
                    </Button>
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
                      disabled={!question.trim()}
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
              A MarIA pode apresentar informações imprecisas. Por favor, confira as fontes oficiais e
              currículos Lattes.
            </p>
          </footer>
        </div>

        {/* Coluna 2: Segunda Coluna com a Lista de Itens Retornados */}
        {isResultsPanelOpen && activeResults && (
          <MariaResultsColumn
            metadata={activeResults}
            onClose={() => setIsResultsPanelOpen(false)}
            urlGeral={urlGeral}
            onOpenResearcherModal={(name) => onOpen('researcher-modal', { name })}
          />
        )}
      </div>
    </main>
  );
}
