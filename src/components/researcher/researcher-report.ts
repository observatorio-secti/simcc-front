import { jsPDF } from 'jspdf';

interface ReportData {
  name?: string;
  university?: string;
  area?: string;
  city?: string;
  graduation?: string;
  abstract?: string;
  lattes_id?: string;
  lattes_update?: Date | string;
  orcid?: string;
  articles?: number | string;
  book?: number | string;
  book_chapters?: number | string;
  patent?: number | string;
  software?: number | string;
  brand?: number | string;
  h_index?: string;
  i10_index?: string;
  works_count?: string;
  cited_by_count?: string;
  cargo?: string;
  rt?: string;
  subsidy?: Array<{ modality_name?: string }>;
  graduate_programs?: Array<{ name?: string }>;
  research_groups?: Array<{ name?: string }>;
  departments?: Array<{ dep_nom?: string }>;
  id?: string;
}

interface WordCloudItem {
  term?: string | null;
  among?: number | null;
}

interface EvolutionRow {
  year?: number | string | null;
  count_article?: number | null;
  count_book?: number | null;
  count_book_chapter?: number | null;
  count_patent?: number | null;
  count_software?: number | null;
  count_brand?: number | null;
  count_guidance?: number | null;
}

interface EvolutionEntry {
  year: number;
  articles: number;
  books: number;
  chapters: number;
  patents: number;
  software: number;
  brands: number;
  guidance: number;
  total: number;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;
const ACCENT = [15, 76, 129] as const;
const TEXT = [30, 41, 59] as const;
const MUTED = [100, 116, 139] as const;
const ROW_BG = [241, 245, 249] as const;

const CLOUD_COLORS = [
  [15, 76, 129],
  [24, 120, 160],
  [13, 148, 136],
  [37, 99, 235],
  [2, 132, 199],
  [71, 85, 105],
] as const;

const formatDate = (value?: Date | string) => {
  if (!value) return '-';
  if (value instanceof Date) return value.toLocaleDateString('pt-BR');
  // Datas ISO (YYYY-MM-DD) são calendário puro: não devem sofrer fuso horário.
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;
  const parsed = new Date(value);
  return isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString('pt-BR');
};

const sanitizeFilename = (name?: string) =>
  (name ?? 'pesquisador')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-');

/**
 * Entidades HTML nomeadas mais comuns em currículos Lattes (ISO-8859-1 e
 * pontuação tipográfica). Cobre acentos, cedilha e símbolos usuais.
 */
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  iexcl: '¡',
  cent: '¢',
  pound: '£',
  curren: '¤',
  yen: '¥',
  brvbar: '¦',
  sect: '§',
  uml: '¨',
  copy: '©',
  ordf: 'ª',
  laquo: '«',
  not: '¬',
  shy: '',
  reg: '®',
  macr: '¯',
  deg: '°',
  plusmn: '±',
  sup2: '²',
  sup3: '³',
  acute: '´',
  micro: 'µ',
  para: '¶',
  middot: '·',
  cedil: '¸',
  sup1: '¹',
  ordm: 'º',
  raquo: '»',
  frac14: '¼',
  frac12: '½',
  frac34: '¾',
  iquest: '¿',
  Agrave: 'À',
  Aacute: 'Á',
  Acirc: 'Â',
  Atilde: 'Ã',
  Auml: 'Ä',
  Aring: 'Å',
  AElig: 'Æ',
  Ccedil: 'Ç',
  Egrave: 'È',
  Eacute: 'É',
  Ecirc: 'Ê',
  Euml: 'Ë',
  Igrave: 'Ì',
  Iacute: 'Í',
  Icirc: 'Î',
  Iuml: 'Ï',
  ETH: 'Ð',
  Ntilde: 'Ñ',
  Ograve: 'Ò',
  Oacute: 'Ó',
  Ocirc: 'Ô',
  Otilde: 'Õ',
  Ouml: 'Ö',
  times: '×',
  Oslash: 'Ø',
  Ugrave: 'Ù',
  Uacute: 'Ú',
  Ucirc: 'Û',
  Uuml: 'Ü',
  Yacute: 'Ý',
  THORN: 'Þ',
  szlig: 'ß',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  atilde: 'ã',
  auml: 'ä',
  aring: 'å',
  aelig: 'æ',
  ccedil: 'ç',
  egrave: 'è',
  eacute: 'é',
  ecirc: 'ê',
  euml: 'ë',
  igrave: 'ì',
  iacute: 'í',
  icirc: 'î',
  iuml: 'ï',
  eth: 'ð',
  ntilde: 'ñ',
  ograve: 'ò',
  oacute: 'ó',
  ocirc: 'ô',
  otilde: 'õ',
  ouml: 'ö',
  divide: '÷',
  oslash: 'ø',
  ugrave: 'ù',
  uacute: 'ú',
  ucirc: 'û',
  uuml: 'ü',
  yacute: 'ý',
  thorn: 'þ',
  yuml: 'ÿ',
  lt: '<',
  gt: '>',
  amp: '&',
  quot: '"',
  apos: "'",
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  sbquo: '‚',
  bdquo: '„',
  lsaquo: '‹',
  rsaquo: '›',
  bull: '•',
  hellip: '…',
  prime: '′',
  Prime: '″',
  euro: '€',
  trade: '™',
  larr: '←',
  rarr: '→',
  uarr: '↑',
  darr: '↓',
};

const decodeEntitiesOnce = (text: string) =>
  text.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const isHex = entity[1] === 'x' || entity[1] === 'X';
      const code = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (!Number.isFinite(code)) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return (
      NAMED_ENTITIES[entity] ?? NAMED_ENTITIES[entity.toLowerCase()] ?? match
    );
  });

/** Decodifica entidades HTML, inclusive quando o HTML veio escapado. */
const decodeEntities = (text: string) => {
  let output = text;
  // Duas passadas resolvem resumos com HTML escapado (&lt;p&gt;...).
  for (let pass = 0; pass < 2; pass += 1) {
    const next = decodeEntitiesOnce(output);
    if (next === output) break;
    output = next;
  }
  return output;
};

/**
 * Limpa e reorganiza o resumo: remove tags HTML, normaliza espaços e
 * transforma quebras de linha em parágrafos legíveis.
 */
const normalizeAbstract = (raw?: string): string[] => {
  if (!raw) return [];

  const cleaned = decodeEntities(String(raw))
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/?\s*(p|div|li|tr|h[1-6]|blockquote)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n');

  const paragraphs = cleaned
    .split(/\n\s*\n+/)
    .map((paragraph) =>
      paragraph
        .replace(/\n+/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .trim(),
    )
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs;

  const fallback = cleaned.replace(/\s+/g, ' ').trim();
  return fallback ? [fallback] : [];
};

/** Quebra um texto em linhas que cabem na largura de conteúdo. */
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (doc.getTextWidth(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = '';
    }

    // Palavras muito longas (URLs, códigos) são quebradas por caractere.
    if (doc.getTextWidth(word) > maxWidth) {
      let chunk = '';
      for (const char of word) {
        if (doc.getTextWidth(chunk + char) > maxWidth && chunk) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk += char;
        }
      }
      current = chunk;
    } else {
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
};

interface PdfCursor {
  doc: jsPDF;
  y: number;
}

/** Se não couber na página, adiciona uma nova e reinicia o cursor. */
const ensureSpace = (ctx: PdfCursor, needed: number) => {
  if (ctx.y + needed > PAGE_HEIGHT - MARGIN) {
    ctx.doc.addPage();
    ctx.y = MARGIN;
  }
};

const drawSectionTitle = (ctx: PdfCursor, title: string) => {
  const { doc } = ctx;
  // Reserva espaço para o título e para o início do conteúdo da seção,
  // evitando títulos órfãos no fim da página.
  ensureSpace(ctx, LINE_HEIGHT * 4);
  const y = ctx.y;

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...ACCENT);
  doc.text(title.toUpperCase(), MARGIN, y + 9);

  ctx.y += 9 + LINE_HEIGHT;
};

const drawSubtitle = (ctx: PdfCursor, text: string) => {
  const { doc } = ctx;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const lines = wrapText(doc, text, CONTENT_WIDTH);
  for (const line of lines) {
    ensureSpace(ctx, 4.5);
    doc.text(line, MARGIN, ctx.y);
    ctx.y += 4.5;
  }
  ctx.y += 1.5;
};

const drawParagraph = (ctx: PdfCursor, text: string, indent = 0) => {
  const { doc } = ctx;
  const paragraphs = normalizeAbstract(text);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);

  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (paragraphIndex > 0) ctx.y += 2;
    const lines = wrapText(doc, paragraph, CONTENT_WIDTH - indent);

    for (const line of lines) {
      ensureSpace(ctx, LINE_HEIGHT);
      doc.text(line, MARGIN + indent, ctx.y);
      ctx.y += LINE_HEIGHT;
    }
  });
};

const drawKeyValue = (ctx: PdfCursor, label: string, value: string) => {
  const { doc } = ctx;
  ensureSpace(ctx, LINE_HEIGHT + 1);
  const y = ctx.y;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT);
  const valueX = MARGIN + 52;
  const lines = wrapText(doc, value || '-', CONTENT_WIDTH - 52);
  doc.text(lines, valueX, y);

  ctx.y += LINE_HEIGHT * Math.max(1, lines.length) + 1;
};

const apiBase = () => {
  const raw = import.meta.env.VITE_URL_GERAL || '';
  if (!raw) return '';
  return raw.endsWith('/') ? raw : `${raw}/`;
};

const fetchJson = async <T>(
  url: string,
  timeoutMs = 10000,
): Promise<T | null> => {
  if (!url) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      mode: 'cors',
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const extractList = <T>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const withData = raw as { data?: unknown; items?: unknown };
    if (Array.isArray(withData.data)) return withData.data as T[];
    if (Array.isArray(withData.items)) return withData.items as T[];
  }
  return [];
};

const loadWordCloud = async (researcherId?: string) => {
  if (!researcherId) return [] as WordCloudItem[];
  const base = apiBase();
  if (!base) return [] as WordCloudItem[];

  const raw = await fetchJson<unknown>(
    `${base}lists_word_researcher?researcher_id=${encodeURIComponent(researcherId)}`,
  );
  return extractList<WordCloudItem>(raw);
};

const loadEvolution = async (researcherId?: string) => {
  if (!researcherId) return [] as EvolutionRow[];
  const base = apiBase();
  if (!base) return [] as EvolutionRow[];

  const raw = await fetchJson<unknown>(
    `${base}researcher/DadosGerais?researcher_id=${encodeURIComponent(researcherId)}`,
  );
  return extractList<EvolutionRow>(raw);
};

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeEvolution = (rows: EvolutionRow[]): EvolutionEntry[] =>
  rows
    .map((row) => {
      const articles = toNumber(row.count_article);
      const books = toNumber(row.count_book);
      const chapters = toNumber(row.count_book_chapter);
      const patents = toNumber(row.count_patent);
      const software = toNumber(row.count_software);
      const brands = toNumber(row.count_brand);
      const guidance = toNumber(row.count_guidance);
      return {
        year: toNumber(row.year),
        articles,
        books,
        chapters,
        patents,
        software,
        brands,
        guidance,
        total: articles + books + chapters + patents + software + brands,
      };
    })
    .filter((row) => row.year > 0)
    .filter((row) => row.total > 0 || row.guidance > 0)
    .sort((a, b) => a.year - b.year);

const drawEvolutionChart = (ctx: PdfCursor, rows: EvolutionEntry[]) => {
  const { doc } = ctx;
  const chartHeight = 32;
  const chartWidth = CONTENT_WIDTH;
  const maxTotal = Math.max(...rows.map((row) => row.total), 1);
  const slot = chartWidth / rows.length;
  const barWidth = Math.max(2.2, Math.min(11, slot * 0.55));

  ensureSpace(ctx, chartHeight + 18);
  drawSubtitle(
    ctx,
    'Produções por ano (bibliográficas + técnicas). Barras representam o total anual.',
  );

  ensureSpace(ctx, chartHeight + 12);
  const top = ctx.y;
  const baseY = top + chartHeight;

  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, baseY, MARGIN + chartWidth, baseY);

  rows.forEach((row, index) => {
    const centerX = MARGIN + slot * index + slot / 2;
    const height = (row.total / maxTotal) * chartHeight;

    if (height > 0) {
      doc.setFillColor(...ACCENT);
      doc.rect(centerX - barWidth / 2, baseY - height, barWidth, height, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);

    const showLabel = rows.length <= 14 || index % 2 === 0;
    if (showLabel) {
      doc.text(String(row.year), centerX, baseY + 4, { align: 'center' });
    }

    if (row.total > 0 && slot >= 7) {
      doc.setFontSize(6);
      doc.text(String(row.total), centerX, baseY - height - 1.5, {
        align: 'center',
      });
    }
  });

  ctx.y = baseY + 8;
};

const EVOLUTION_COLUMNS: Array<{
  label: string;
  width: number;
  key: keyof Omit<EvolutionEntry, 'year'>;
  isYear?: boolean;
}> = [
  { label: 'Ano', width: 16, key: 'total', isYear: true },
  { label: 'Artigos', width: 19, key: 'articles' },
  { label: 'Livros', width: 17, key: 'books' },
  { label: 'Capítulos', width: 21, key: 'chapters' },
  { label: 'Patentes', width: 19, key: 'patents' },
  { label: 'Softwares', width: 19, key: 'software' },
  { label: 'Marcas', width: 17, key: 'brands' },
  { label: 'Orientações', width: 21, key: 'guidance' },
  { label: 'Total', width: 21, key: 'total' },
];

const TABLE_ROW_HEIGHT = 5.4;

const drawEvolutionTable = (ctx: PdfCursor, rows: EvolutionEntry[]) => {
  const { doc } = ctx;

  const drawHeader = () => {
    ensureSpace(ctx, TABLE_ROW_HEIGHT);
    doc.setFillColor(...ACCENT);
    doc.rect(MARGIN, ctx.y, CONTENT_WIDTH, TABLE_ROW_HEIGHT, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);

    let x = MARGIN;
    for (const column of EVOLUTION_COLUMNS) {
      doc.text(
        column.label.toUpperCase(),
        column.isYear ? x + 2 : x + column.width - 2,
        ctx.y + 3.7,
        { align: column.isYear ? 'left' : 'right' },
      );
      x += column.width;
    }

    ctx.y += TABLE_ROW_HEIGHT;
  };

  const drawRow = (row: EvolutionEntry, index: number, bold = false) => {
    ensureSpace(ctx, TABLE_ROW_HEIGHT);
    if (Math.abs(ctx.y - MARGIN) < 0.01) drawHeader();

    if (index % 2 === 0) {
      doc.setFillColor(...ROW_BG);
      doc.rect(MARGIN, ctx.y, CONTENT_WIDTH, TABLE_ROW_HEIGHT, 'F');
    }

    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(...TEXT);

    let x = MARGIN;
    for (const column of EVOLUTION_COLUMNS) {
      const value = column.isYear ? String(row.year) : String(row[column.key]);
      doc.text(
        value,
        column.isYear ? x + 2 : x + column.width - 2,
        ctx.y + 3.7,
        { align: column.isYear ? 'left' : 'right' },
      );
      x += column.width;
    }

    ctx.y += TABLE_ROW_HEIGHT;
  };

  ensureSpace(ctx, TABLE_ROW_HEIGHT * 3);
  drawHeader();
  rows.forEach((row, index) => drawRow(row, index));

  const totals = rows.reduce(
    (accumulator, row) => ({
      year: 0,
      articles: accumulator.articles + row.articles,
      books: accumulator.books + row.books,
      chapters: accumulator.chapters + row.chapters,
      patents: accumulator.patents + row.patents,
      software: accumulator.software + row.software,
      brands: accumulator.brands + row.brands,
      guidance: accumulator.guidance + row.guidance,
      total: accumulator.total + row.total,
    }),
    {
      year: 0,
      articles: 0,
      books: 0,
      chapters: 0,
      patents: 0,
      software: 0,
      brands: 0,
      guidance: 0,
      total: 0,
    },
  );

  ensureSpace(ctx, TABLE_ROW_HEIGHT);
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, ctx.y, MARGIN + CONTENT_WIDTH, ctx.y);
  ctx.y += 1.2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...ACCENT);

  let x = MARGIN;
  const totalValues: Array<string> = [
    'Total',
    String(totals.articles),
    String(totals.books),
    String(totals.chapters),
    String(totals.patents),
    String(totals.software),
    String(totals.brands),
    String(totals.guidance),
    String(totals.total),
  ];

  EVOLUTION_COLUMNS.forEach((column, index) => {
    doc.text(
      totalValues[index],
      column.isYear ? x + 2 : x + column.width - 2,
      ctx.y + 3.4,
      { align: column.isYear ? 'left' : 'right' },
    );
    x += column.width;
  });

  ctx.y += TABLE_ROW_HEIGHT + 3;
};

interface CloudWord {
  term: string;
  among: number;
}

const drawWordCloud = (ctx: PdfCursor, rawWords: WordCloudItem[]) => {
  const { doc } = ctx;

  const seen = new Set<string>();
  const words: CloudWord[] = [];
  for (const item of rawWords) {
    const term = (item.term ?? '').trim();
    const among = toNumber(item.among);
    const key = term.toLowerCase();
    if (!term || among <= 0 || seen.has(key)) continue;
    seen.add(key);
    words.push({ term, among });
  }

  words.sort((a, b) => b.among - a.among);
  const selected = words.slice(0, 30);
  if (selected.length === 0) return;

  drawSubtitle(
    ctx,
    'Termos mais recorrentes nas produções do pesquisador (tamanho proporcional à frequência).',
  );

  const maxWeight = selected[0].among;
  const minWeight = selected[selected.length - 1].among;
  const weightRange = Math.max(1, maxWeight - minWeight);
  const gap = 4;
  const colorCount = CLOUD_COLORS.length;

  let row: Array<{
    term: string;
    size: number;
    width: number;
    color: readonly number[];
    bold: boolean;
  }> = [];
  let rowWidth = 0;

  const flushRow = () => {
    if (row.length === 0) return;

    const maxSize = Math.max(...row.map((item) => item.size));
    const rowHeight = maxSize * 0.3528 + 2;
    ensureSpace(ctx, rowHeight);

    const baseline = ctx.y + maxSize * 0.3528;
    let x = MARGIN + Math.max(0, (CONTENT_WIDTH - rowWidth) / 2);

    for (const item of row) {
      doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
      doc.setFontSize(item.size);
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.text(item.term, x, baseline);
      x += item.width + gap;
    }

    ctx.y += rowHeight;
    row = [];
    rowWidth = 0;
  };

  selected.forEach((word, index) => {
    const ratio = (word.among - minWeight) / weightRange;
    let size = 9 + ratio * 13;
    const bold = ratio >= 0.55;

    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    let width = doc.getTextWidth(word.term);

    // Encolhe termos gigantes para não estourar a largura da página.
    while (width > CONTENT_WIDTH && size > 6) {
      size -= 0.5;
      doc.setFontSize(size);
      width = doc.getTextWidth(word.term);
    }

    if (rowWidth + (row.length > 0 ? gap : 0) + width > CONTENT_WIDTH) {
      flushRow();
    }

    row.push({
      term: word.term,
      size,
      width,
      color: CLOUD_COLORS[index % colorCount],
      bold,
    });
    rowWidth += (row.length > 1 ? gap : 0) + width;
  });

  flushRow();
  ctx.y += 4;
};

/**
 * Gera e baixa o PDF do relatório de um pesquisador direto pela API do jsPDF:
 * texto vetorial selecionável, sem depender de captura de DOM.
 */
export async function generateResearcherReportPdf(
  researcher: ReportData,
): Promise<void> {
  const [wordCloudRaw, evolutionRaw] = await Promise.all([
    loadWordCloud(researcher.id),
    loadEvolution(researcher.id),
  ]);

  const wordCloud = wordCloudRaw;
  const evolution = normalizeEvolution(evolutionRaw);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const ctx: PdfCursor = { doc, y: MARGIN };

  // Cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...ACCENT);
  doc.text('SIMCC | OBSERVATÓRIO DE CT&I DA BAHIA', MARGIN, ctx.y + 2);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    PAGE_WIDTH - MARGIN,
    ctx.y + 2,
    { align: 'right' },
  );

  ctx.y += 8;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, ctx.y, PAGE_WIDTH - MARGIN, ctx.y);
  ctx.y += 8;

  // Identificação
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...TEXT);
  doc.text(
    doc.splitTextToSize(researcher.name ?? '-', CONTENT_WIDTH),
    MARGIN,
    ctx.y,
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(researcher.university ?? '', MARGIN, ctx.y + 7);
  doc.setFontSize(9);
  const subtitle = [researcher.area, researcher.city, researcher.graduation]
    .filter(Boolean)
    .join(' · ');
  doc.text(subtitle, MARGIN, ctx.y + 12);

  ctx.y += 16;

  // Resumo do currículo
  drawSectionTitle(ctx, 'Resumo do currículo');
  drawParagraph(
    ctx,
    researcher.abstract || 'Resumo do currículo não disponível.',
  );
  ctx.y += 3;

  // Identificação
  drawSectionTitle(ctx, 'Identificação');
  drawKeyValue(ctx, 'Lattes ID', researcher.lattes_id ?? '-');
  drawKeyValue(ctx, 'Atualização', formatDate(researcher.lattes_update));
  drawKeyValue(ctx, 'ORCID', researcher.orcid ?? '-');
  ctx.y += 3;

  // Produções
  drawSectionTitle(ctx, 'Produções');
  const productions: Array<[string, number | string | undefined]> = [
    ['Artigos', researcher.articles],
    ['Livros', researcher.book],
    ['Capítulos', researcher.book_chapters],
    ['Patentes', researcher.patent],
    ['Softwares', researcher.software],
    ['Marcas', researcher.brand],
  ];
  for (const [label, value] of productions) {
    drawKeyValue(ctx, label, String(value ?? 0));
  }
  ctx.y += 3;

  // Nuvem de palavras
  if (wordCloud.length > 0) {
    ensureSpace(ctx, 46);
    drawSectionTitle(ctx, 'Palavras-chave mais recorrentes');
    drawWordCloud(ctx, wordCloud);
  }

  // Métricas
  ensureSpace(ctx, 44);
  drawSectionTitle(ctx, 'Métricas');
  const metrics: Array<[string, string | number | undefined]> = [
    ['Índice H', researcher.h_index],
    ['Índice i10', researcher.i10_index],
    ['Obras (OpenAlex)', researcher.works_count],
    ['Citações (OpenAlex)', researcher.cited_by_count],
  ];
  for (const [label, value] of metrics) {
    drawKeyValue(ctx, label, value ? String(value) : '-');
  }
  ctx.y += 3;

  // Evolução da produção
  if (evolution.length > 0) {
    ensureSpace(ctx, 80);
    drawSectionTitle(ctx, 'Evolução da produção');
    drawEvolutionChart(ctx, evolution);
    drawEvolutionTable(ctx, evolution);
  }

  // Vínculos acadêmicos
  const programs = researcher.graduate_programs ?? [];
  const groups = researcher.research_groups ?? [];
  const departments = researcher.departments ?? [];
  const subsidyList = Array.isArray(researcher.subsidy)
    ? researcher.subsidy
    : [];
  if (
    researcher.cargo ||
    researcher.rt ||
    programs.length ||
    groups.length ||
    departments.length ||
    subsidyList.length
  ) {
    drawSectionTitle(ctx, 'Vínculos acadêmicos');
    if (researcher.cargo) drawKeyValue(ctx, 'Cargo', researcher.cargo);
    if (researcher.rt) drawKeyValue(ctx, 'Regime', researcher.rt);
    for (const program of programs) {
      drawKeyValue(ctx, 'Programa', program?.name ?? '-');
    }
    for (const group of groups) {
      drawKeyValue(ctx, 'Grupo de pesquisa', group?.name ?? '-');
    }
    for (const department of departments) {
      drawKeyValue(ctx, 'Departamento', department?.dep_nom ?? '-');
    }
    for (const subsidyItem of subsidyList) {
      drawKeyValue(ctx, 'Bolsa', subsidyItem?.modality_name ?? '-');
    }
    ctx.y += 3;
  }

  // Rodapé na última página
  const lastPage = doc.getNumberOfPages();
  doc.setPage(lastPage);
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    'Fonte: SIMCC — dados do currículo Lattes, OpenAlex e Scopus · Relatório gerado automaticamente',
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 10,
    { align: 'center' },
  );

  doc.save(`relatorio-${sanitizeFilename(researcher.name)}.pdf`);
}
