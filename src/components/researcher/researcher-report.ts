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

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;
const ACCENT = [15, 76, 129] as const;
const TEXT = [30, 41, 59] as const;
const MUTED = [100, 116, 139] as const;

const formatDate = (value?: Date | string) => {
  if (!value) return '-';
  if (value instanceof Date) return value.toLocaleDateString('pt-BR');
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString('pt-BR');
};

const sanitizeFilename = (name?: string) =>
  (name ?? 'pesquisador')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-');

/** Quebra um texto em linhas que cabem na largura de conteúdo. */
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (doc.getTextWidth(candidate) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
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
  const { doc, y } = ctx;
  ensureSpace(ctx, LINE_HEIGHT * 3);

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...ACCENT);
  doc.text(title.toUpperCase(), MARGIN, y + 9);

  ctx.y += 9 + LINE_HEIGHT;
};

const drawParagraph = (ctx: PdfCursor, text: string, indent = 0) => {
  const { doc } = ctx;
  const lines = wrapText(doc, text, CONTENT_WIDTH - indent);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);

  for (const line of lines) {
    ensureSpace(ctx, LINE_HEIGHT);
    doc.text(line, MARGIN + indent, ctx.y);
    ctx.y += LINE_HEIGHT;
  }
};

const drawKeyValue = (ctx: PdfCursor, label: string, value: string) => {
  const { doc, y } = ctx;
  ensureSpace(ctx, LINE_HEIGHT + 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT);
  const valueX = MARGIN + 52;
  const lines = wrapText(doc, value || '-', CONTENT_WIDTH - 52);
  doc.text(lines, valueX, y);

  ctx.y += LINE_HEIGHT * Math.max(1, lines.length) + 1.5;
};

/**
 * Gera e baixa o PDF do relatório de um pesquisador direto pela API do jsPDF:
 * texto vetorial selecionável + foto embutida, sem depender de captura de DOM.
 */
export async function generateResearcherReportPdf(
  researcher: ReportData,
  urlGeral: string,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const ctx: PdfCursor = { doc, y: MARGIN };

  // Foto: busca e embute como JPEG (fallback: caixa com iniciais)
  let photoDataUrl: string | null = null;
  try {
    const response = await fetch(
      `${urlGeral}ResearcherData/Image?researcher_id=${researcher.id ?? ''}`,
    );
    if (response.ok) {
      const blob = await response.blob();
      photoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    photoDataUrl = null;
  }

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

  // Foto + identificação
  const photoSize = 26;
  if (photoDataUrl) {
    try {
      doc.addImage(photoDataUrl, 'JPEG', MARGIN, ctx.y, photoSize, photoSize);
    } catch {
      photoDataUrl = null;
    }
  }
  if (!photoDataUrl) {
    doc.setDrawColor(...MUTED);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, ctx.y, photoSize, photoSize);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const initials = (researcher.name ?? '??')
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
    doc.text(initials || '?', MARGIN + photoSize / 2, ctx.y + photoSize / 2 + 1.5, {
      align: 'center',
    });
  }

  const identityX = MARGIN + photoSize + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...TEXT);
  doc.text(doc.splitTextToSize(researcher.name ?? '-', CONTENT_WIDTH - photoSize - 6), identityX, ctx.y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(researcher.university ?? '', identityX, ctx.y + 11);
  doc.setFontSize(9);
  const subtitle = [researcher.area, researcher.city, researcher.graduation]
    .filter(Boolean)
    .join(' · ');
  doc.text(subtitle, identityX, ctx.y + 16);

  ctx.y += photoSize + 10;

  // Resumo do currículo
  drawSectionTitle(ctx, 'Resumo do currículo');
  drawParagraph(ctx, researcher.abstract || 'Resumo do currículo não disponível.');
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

  // Métricas
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

  // Vínculos acadêmicos
  const programs = researcher.graduate_programs ?? [];
  const groups = researcher.research_groups ?? [];
  const departments = researcher.departments ?? [];
  if (researcher.cargo || researcher.rt || programs.length || groups.length || departments.length) {
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
    ctx.y += 3;
  }

  // Bolsas
  const subsidyList = Array.isArray(researcher.subsidy) ? researcher.subsidy : [];
  if (subsidyList.length > 0) {
    drawSectionTitle(ctx, 'Bolsas');
    for (const subsidyItem of subsidyList) {
      drawKeyValue(ctx, 'Modalidade', subsidyItem?.modality_name ?? '-');
    }
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
