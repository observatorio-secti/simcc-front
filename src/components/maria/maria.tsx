import {
  Info,
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
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useModal } from '../hooks/use-modal-store';
import { Helmet } from 'react-helmet';

// --- Contratos de Domínio & Tipos ---

export interface MariaResearcher {
  id: string;
  name: string;
  institution?: string;
  institution_acronym?: string;
  lattes_id?: string;
  abstract?: string;
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
  };
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
  sources?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  metadata?: MariaMetadata;
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

// --- Sugestões Iniciais de Busca ---
const STARTER_PROMPTS = [
  { icon: Search, label: 'Pesquisadores em IA na UNEB', query: 'Pesquisadores em inteligência artificial na UNEB' },
  { icon: Lightbulb, label: 'Patentes registradas na UFBA', query: 'Quais patentes foram desenvolvidas e registradas na UFBA?' },
  { icon: Layers, label: 'Compare UFBA e UNEB em saúde pública', query: 'Compare a produção científica entre UFBA e UNEB na área de saúde pública' },
  { icon: FileText, label: 'Artigos sobre leishmaniose', query: 'Artigos científicos publicados sobre leishmaniose na Bahia' },
  { icon: Cpu, label: 'Softwares desenvolvidos na Bahia', query: 'Softwares e soluções computacionais desenvolvidas por pesquisadores baianos' },
  { icon: BookOpen, label: 'Livros e capítulos em biotecnologia', query: 'Livros e capítulos publicados em biotecnologia' },
];

// --- Utilitário de Renderização Markdown Simples & Seguro ---
function SimpleMarkdownRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const rendered = useMemo(() => {
    if (!content) return '';

    // Escapa caracteres perigosos mantendo segurança
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Parser em camadas
    const parsed = escaped
      // Títulos
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-1.5 font-lexend">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-5 mb-2 font-lexend border-b border-slate-200 dark:border-neutral-800 pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2.5 font-lexend">$1</h1>')
      // Blocos de citação
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#719CB8] pl-3 py-1 my-2 bg-slate-50 dark:bg-neutral-800/50 text-slate-700 dark:text-slate-300 italic text-sm rounded-r">$1</blockquote>')
      // Formatadores inline
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-neutral-800 text-[#07677e] dark:text-[#559FB8] rounded font-mono text-xs font-medium">$1</code>')
      // Links
      .replace(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#07677e] dark:text-[#559FB8] hover:underline font-medium inline-flex items-center gap-0.5">$1</a>')
      // Listas não ordenadas
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 mb-1">$1</li>')
      // Listas numeradas
      .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300 mb-1">$1</li>')
      // Quebras de linha
      .replace(/\n\n/g, '<div class="h-3"></div>')
      .replace(/\n/g, '<br />');

    return parsed;
  }, [content]);

  return (
    <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-lexend space-y-1">
      <span dangerouslySetInnerHTML={{ __html: rendered }} />
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-[#07677e] dark:bg-[#559FB8] animate-pulse align-middle rounded-sm" />
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
    <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-3 border-b border-dashed border-slate-200 dark:border-neutral-800">
      {intent && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
          🎯 {INTENT_LABELS[intent] || intent}
        </span>
      )}

      {f.institutions && f.institutions.length > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <Building2 className="w-3 h-3" />
          {f.institutions.join(', ')}
        </span>
      )}

      {f.researcher_name && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          <User className="w-3 h-3" />
          {f.researcher_name}
        </span>
      )}

      {f.production_types && f.production_types.length > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
          <Bookmark className="w-3 h-3" />
          {f.production_types.join(', ')}
        </span>
      )}

      {f.period && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
          <Calendar className="w-3 h-3" />
          {f.period}
        </span>
      )}

      {f.city && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
          <MapPin className="w-3 h-3" />
          {f.city}
        </span>
      )}
    </div>
  );
}

// --- Componente de Cards de Pesquisadores Identificados ---
function ResearchersSection({ researchers }: { researchers: MariaResearcher[] }) {
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();

  if (!researchers || researchers.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-lexend">
          Pesquisadores Identificados ({researchers.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {researchers.map((r, idx) => {
          const instText = r.institution_acronym
            ? `${r.institution || ''} (${r.institution_acronym})`
            : r.institution || 'Instituição não informada';

          return (
            <div
              key={r.id || `${r.name}-${idx}`}
              onClick={() => onOpen('researcher-modal', { name: r.name })}
              className="group bg-slate-50/80 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 rounded-lg p-3 border-l-4 border-l-[#719CB8] hover:border-l-[#07677e] hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Avatar className="h-8 w-8 rounded-md shrink-0 border border-slate-200 dark:border-neutral-800">
                    <AvatarImage
                      src={`${urlGeral}ResearcherData/Image?name=${encodeURIComponent(r.name)}`}
                      alt={r.name}
                      className="rounded-md object-cover"
                    />
                    <AvatarFallback className="rounded-md bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {r.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#07677e] dark:group-hover:text-[#559FB8] transition-colors font-lexend">
                      {r.name}
                    </h5>
                    <p className="text-xs font-medium text-[#07677e] dark:text-[#559FB8] truncate">
                      {instText}
                    </p>
                  </div>
                </div>

                {r.abstract && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {r.abstract}
                  </p>
                )}
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-neutral-800/60 flex items-center justify-end text-[11px] font-medium text-slate-500 group-hover:text-[#07677e] dark:group-hover:text-[#559FB8]">
                <span>Ver perfil completo &rarr;</span>
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
    label: 'Patente / Registro',
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

// --- Componente de Cards de Produções Científicas ---
function ProductionsSection({ productions }: { productions: MariaProduction[] }) {
  if (!productions || productions.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-lexend">
          Produções Científicas e Tecnológicas ({productions.length})
        </h4>
      </div>

      <div className="space-y-2">
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
              className="bg-slate-50/80 dark:bg-neutral-950/70 border border-slate-200 dark:border-neutral-800 rounded-lg p-3.5 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${config.badgeClass}`}
                >
                  <IconComp className="w-3 h-3" />
                  {config.label}
                </span>

                {p.year && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {p.year}
                  </span>
                )}
              </div>

              <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug font-lexend mb-1">
                {p.title}
              </h5>

              {(p.authors || rName) && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Autores/Responsável:</span>{' '}
                  {p.authors || rName}
                </p>
              )}

              {p.details && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/70 dark:border-neutral-800/70">
                  {p.details.periodical && (
                    <span>
                      <strong>Periódico:</strong> {p.details.periodical}
                      {p.details.qualis && (
                        <span className="ml-1.5 px-1.5 py-0.2 bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-slate-200 rounded text-[10px] font-bold">
                          Qualis {p.details.qualis}
                        </span>
                      )}
                    </span>
                  )}
                  {p.details.publisher && (
                    <span>
                      <strong>Editora:</strong> {p.details.publisher}
                      {p.details.isbn && ` (ISBN: ${p.details.isbn})`}
                    </span>
                  )}
                  {p.details.code && (
                    <span>
                      <strong>Registro/INPI:</strong> {p.details.code}
                      {p.details.category && ` (${p.details.category})`}
                    </span>
                  )}
                  {p.details.platform && (
                    <span>
                      <strong>Plataforma:</strong> {p.details.platform}
                      {p.details.environment && ` [${p.details.environment}]`}
                    </span>
                  )}
                </div>
              )}

              {p.doi && (
                <div className="mt-2">
                  <a
                    href={`https://doi.org/${p.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#07677e] dark:text-[#559FB8] hover:underline font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    DOI: {p.doi}
                  </a>
                </div>
              )}
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
    <details className="group mt-3 bg-slate-50/90 dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs transition-colors">
      <summary className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer list-none flex items-center justify-between select-none">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8]" />
          Fontes e Citações Consultadas ({sources.length})
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-3 pb-3 pt-1 border-t border-slate-200/60 dark:border-neutral-800/60">
        <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
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

// --- Componente Principal da MarIA ---
export function Maria() {
  const { urlGeral, user } = useContext(UserContext);
  const { theme } = useTheme();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userName = user?.display_name || 'Você';
  const userPhoto = user?.photo_url;

  // Session ID persistente por sessão da aplicação
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Interrompe streaming ativo ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // --- Função Central de Envio e Streaming SSE ---
  const handleSendMessage = async (queryToSend?: string) => {
    const query = (queryToSend || question).trim();
    if (!query || isGenerating) return;

    // 1. Cria a mensagem do usuário
    const userMsgId = 'user_' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      time: getCurrentTime(),
    };

    // 2. Prepara a mensagem do assistente que receberá streaming
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

    // Ajusta URL do backend (remove barras extras)
    const baseUrl = urlGeral ? (urlGeral.endsWith('/') ? urlGeral.slice(0, -1) : urlGeral) : '';
    const streamEndpoint = `${baseUrl}/ai/chat/ask/stream`;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';
    let accumulatedMetadata: MariaMetadata | undefined = undefined;

    try {
      const response = await fetch(streamEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          session_id: sessionId,
        }),
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
        sseBuffer = lines.pop() || ''; // Guarda linha incompleta para a próxima iteração

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const payload = trimmed.slice(6);
            if (!payload) continue;

            try {
              const event = JSON.parse(payload);

              if (event.type === 'metadata' && event.data) {
                accumulatedMetadata = event.data;
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
              console.error('Falha no parse do evento SSE:', e, payload);
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="w-full h-full p-3 md:p-6 pb-2 flex flex-col font-lexend overflow-hidden">
      <Helmet>
        <title>MarIA - Assistente Científica | Simcc</title>
        <meta
          name="description"
          content="Pesquisa com inteligência artificial sobre produções científicas, patentes e pesquisadores da Bahia no Simcc."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Header com Identidade Visual & Ações */}
      <header className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 p-1 rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center">
            {theme === 'dark' ? <SymbolEEWhite /> : <SymbolEE />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 font-lexend">
                MarIA
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                RAG Híbrido & Streaming Ativo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assistente Científica e Tecnológica da Bahia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleClearHistory}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nova conversa</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Reiniciar conversa com a MarIA</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/informacoes">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                  <Info className="w-4 h-4" />
                  <span className="sr-only">Informações</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sobre a plataforma</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Área Central de Conversa */}
      <div className="flex-1 overflow-y-auto px-1 md:px-4 space-y-4 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          /* Estado Inicial Hero */
          <div className="h-full flex flex-col justify-center items-center text-center py-8 md:py-16">
            <div className="max-w-2xl space-y-4">
              <div className="flex justify-center mb-2">
                <div className="h-16 w-16 p-2.5 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-sm flex items-center justify-center">
                  {theme === 'dark' ? <SymbolEEWhite /> : <SymbolEE />}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 font-lexend tracking-tight">
                <span className="bg-gradient-to-r from-blue-700 to-red-600 text-transparent bg-clip-text">
                  Olá,
                </span>{' '}
                como posso apoiar sua pesquisa científica hoje?
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                Consulte em linguagem natural artigos, livros, patentes, softwares ou compare
                linhas de pesquisa e competências acadêmicas entre instituições da Bahia.
              </p>

              {/* Sugestões de Perguntas Iniciais */}
              <div className="pt-4">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                  Sugestões de Consulta
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {STARTER_PROMPTS.map((starter, idx) => {
                    const StarterIcon = starter.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(starter.query)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:border-[#559FB8] hover:text-[#07677e] dark:hover:text-[#559FB8] hover:bg-slate-50 dark:hover:bg-neutral-800 shadow-xs transition-all text-left"
                      >
                        <StarterIcon className="w-3.5 h-3.5 text-[#559FB8]" />
                        {starter.label}
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

                  <div className={`flex flex-col ${isUser ? 'items-end max-w-[85%]' : 'w-full'}`}>
                    {/* Bubble */}
                    <div
                      className={`p-4 rounded-xl shadow-xs transition-all ${
                        isUser
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-slate-900 dark:text-blue-50 rounded-tr-xs'
                          : 'bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-slate-100 rounded-tl-xs w-full'
                      }`}
                    >
                      {/* Cabeçalho da Mensagem */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-lexend">
                          {isUser ? userName : 'MarIA'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {msg.time}
                        </span>
                      </div>

                      {/* Metadados (apenas assistente) */}
                      {!isUser && msg.metadata && <MetadataBadges metadata={msg.metadata} />}

                      {/* Conteúdo de Texto Markdown */}
                      <div className="mt-2">
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
                            <span>Consultando base científica e formulando resposta...</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Notificação de Interrupção pelo Usuário */}
                      {msg.interrupted && (
                        <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-2">
                          (Geração interrompida pelo usuário)
                        </p>
                      )}

                      {/* Erros se houver */}
                      {msg.error && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{msg.error}</span>
                        </div>
                      )}

                      {/* Cards de Pesquisadores */}
                      {!isUser && msg.metadata?.researchers && (
                        <ResearchersSection researchers={msg.metadata.researchers} />
                      )}

                      {/* Cards de Produções */}
                      {!isUser && msg.metadata?.productions && (
                        <ProductionsSection productions={msg.metadata.productions} />
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

      {/* Barra Inferior de Entrada de Pergunta */}
      <footer className="pt-2 max-w-4xl w-full mx-auto">
        <div className="relative border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#559FB8]/40 focus-within:border-[#559FB8] transition-all">
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
            className="min-h-[56px] max-h-36 resize-none border-0 p-3.5 text-sm font-lexend focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />

          <div className="flex items-center justify-between p-2 pt-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2">
              <span className="hidden sm:inline">Pressione</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-[10px] font-mono">
                Enter
              </kbd>
              <span className="hidden sm:inline">para enviar ou</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-[10px] font-mono">
                Shift+Enter
              </kbd>
              <span className="hidden sm:inline">para nova linha</span>
            </div>

            <div className="flex items-center gap-2">
              {isGenerating ? (
                <Button
                  onClick={handleStopGeneration}
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8 gap-1.5 text-xs rounded-lg font-medium"
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
                  className="h-8 gap-1.5 text-xs rounded-lg bg-[#07677e] hover:bg-[#024A60] text-white font-medium shadow-xs disabled:opacity-50 transition-colors"
                >
                  Enviar
                  <Send className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
          A MarIA pode apresentar informações imprecisas. Por favor, confira as fontes oficiais e
          currículos Lattes.
        </p>
      </footer>
    </main>
  );
}
