import type { ChartBlock, TableBlock } from '@/entities/conversation/model';

// Exportação dos blocos de dados da MarIA (ADR 0013): CSV das linhas que já
// vieram no bloco e PNG do gráfico. Nada é buscado de novo.

export interface CsvColumn {
  key: string;
  label: string;
}

export const TRUNCATED_CSV_NOTE =
  '# Resultado limitado pela consulta da MarIA: o bloco não traz todas as linhas.';

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let text: string;
  if (typeof value === 'number') {
    // Excel em pt-BR: decimal com vírgula, sem separador de milhar.
    text = Number.isFinite(value) ? String(value).replace('.', ',') : '';
  } else if (typeof value === 'string') {
    text = value;
  } else if (typeof value === 'boolean') {
    text = value ? 'sim' : 'não';
  } else {
    text = JSON.stringify(value);
  }
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV com `;` (Excel pt-BR). Sem BOM: ele entra só no arquivo baixado. */
export function toCsv(
  columns: readonly CsvColumn[],
  rows: readonly Record<string, unknown>[],
  { truncated = false }: { truncated?: boolean } = {},
): string {
  const lines = [
    columns.map((column) => csvCell(column.label)).join(';'),
    ...rows.map((row) =>
      columns.map((column) => csvCell(row[column.key])).join(';'),
    ),
  ];
  if (truncated) lines.push(TRUNCATED_CSV_NOTE);
  return `${lines.join('\r\n')}\r\n`;
}

/** Colunas do CSV de um gráfico: `x` e cada série (com a unidade). */
export function chartCsvColumns(block: ChartBlock): CsvColumn[] {
  return [
    { key: block.x.key, label: block.x.label },
    ...block.series.map((series) => ({
      key: series.key,
      label: series.unit ? `${series.label} (${series.unit})` : series.label,
    })),
  ];
}

export function chartCsv(block: ChartBlock): string {
  return toCsv(chartCsvColumns(block), block.data, {
    truncated: block.truncated,
  });
}

export function tableCsv(block: TableBlock): string {
  return toCsv(block.columns, block.rows, { truncated: block.truncated });
}

/** Nome de arquivo a partir do título: "bolsas-por-ano-2021-2024". */
export function fileSlug(title: string | null | undefined): string {
  const slug = (title ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return slug || 'dados-maria';
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  // Dá tempo ao navegador de começar o download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(csv: string, title: string | null | undefined) {
  downloadBlob(
    new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }),
    `${fileSlug(title)}.csv`,
  );
}

// --- PNG ---------------------------------------------------------------------

const PAINT_PROPERTIES = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'font-family',
  'font-size',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
] as const;

/** Copia as cores calculadas (variáveis CSS, tema escuro) para o clone. */
function inlinePaint(source: Element, target: Element) {
  const computed = getComputedStyle(source);
  const style = PAINT_PROPERTIES.map(
    (property) => `${property}:${computed.getPropertyValue(property)}`,
  ).join(';');
  target.setAttribute('style', style);
  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let index = 0; index < sourceChildren.length; index += 1) {
    const from = sourceChildren[index];
    const to = targetChildren[index];
    if (from && to) inlinePaint(from, to);
  }
}

export interface ChartPngOptions {
  title: string;
  /** Itens da legenda: rótulo e cor (variável CSS) da série. */
  legend: { label: string; color: string; detail?: string }[];
  footer?: string;
  filename: string;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgText(
  content: string,
  x: number,
  y: number,
  attributes: Record<string, string>,
) {
  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', String(x));
  text.setAttribute('y', String(y));
  for (const [name, value] of Object.entries(attributes)) {
    text.setAttribute(name, value);
  }
  text.textContent = content;
  return text;
}

/**
 * Gera o PNG do gráfico: título, o SVG com as cores do tema, a legenda e a
 * fonte. Resolve as variáveis CSS a partir do SVG que está na tela.
 */
export async function downloadChartPng(
  svg: SVGSVGElement,
  { title, legend, footer, filename }: ChartPngOptions,
) {
  const width = svg.viewBox.baseVal.width || svg.clientWidth;
  const height = svg.viewBox.baseVal.height || svg.clientHeight;
  const rootStyle = getComputedStyle(svg);
  const panel = getComputedStyle(
    svg.closest('[data-slot="maria-chart"]') ?? svg,
  );
  const background = panel.backgroundColor || '#ffffff';
  const ink = rootStyle.color || '#171717';
  const font = rootStyle.fontFamily || 'sans-serif';

  const padding = 16;
  const titleHeight = 28;
  const legendRow = 20;
  const legendText = (item: ChartPngOptions['legend'][number]) =>
    item.detail ? `${item.label} · ${item.detail}` : item.label;
  const longest = Math.max(0, ...legend.map((item) => legendText(item).length));
  const columnWidth = Math.min(width, Math.max(140, longest * 6.6 + 28));
  const perRow = Math.max(1, Math.floor(width / columnWidth));
  const legendRows = legend.length > 1 ? Math.ceil(legend.length / perRow) : 0;
  const footerHeight = footer ? 22 : 0;
  const total =
    padding +
    titleHeight +
    height +
    (legendRows ? 8 + legendRows * legendRow : 0) +
    footerHeight +
    padding;
  const fullWidth = width + padding * 2;

  const out = document.createElementNS(SVG_NS, 'svg');
  out.setAttribute('xmlns', SVG_NS);
  out.setAttribute('width', String(fullWidth));
  out.setAttribute('height', String(total));
  out.setAttribute('viewBox', `0 0 ${fullWidth} ${total}`);

  const backdrop = document.createElementNS(SVG_NS, 'rect');
  backdrop.setAttribute('width', '100%');
  backdrop.setAttribute('height', '100%');
  backdrop.setAttribute('fill', background);
  out.append(backdrop);

  out.append(
    svgText(title, padding, padding + 16, {
      fill: ink,
      'font-family': font,
      'font-size': '15',
      'font-weight': '600',
    }),
  );

  const chart = svg.cloneNode(true) as SVGSVGElement;
  inlinePaint(svg, chart);
  // `opacity` só marca o destaque do ponteiro: a imagem sai sem ele.
  for (const element of chart.querySelectorAll('[opacity]')) {
    element.removeAttribute('opacity');
  }
  chart.setAttribute('x', String(padding));
  chart.setAttribute('y', String(padding + titleHeight));
  chart.setAttribute('width', String(width));
  chart.setAttribute('height', String(height));
  out.append(chart);

  let y = padding + titleHeight + height + 8;
  if (legendRows) {
    const probe = document.createElement('span');
    document.body.append(probe);
    legend.forEach((item, index) => {
      const column = index % perRow;
      const row = Math.floor(index / perRow);
      const x = padding + column * columnWidth;
      const top = y + row * legendRow;
      probe.style.color = item.color;
      const swatch = document.createElementNS(SVG_NS, 'rect');
      swatch.setAttribute('x', String(x));
      swatch.setAttribute('y', String(top + 3));
      swatch.setAttribute('width', '10');
      swatch.setAttribute('height', '10');
      swatch.setAttribute('rx', '2');
      swatch.setAttribute('fill', getComputedStyle(probe).color);
      out.append(swatch);
      out.append(
        svgText(legendText(item), x + 16, top + 12, {
          fill: ink,
          'font-family': font,
          'font-size': '12',
        }),
      );
    });
    probe.remove();
    y += legendRows * legendRow;
  }
  if (footer) {
    out.append(
      svgText(footer, padding, y + 14, {
        fill: ink,
        'fill-opacity': '0.65',
        'font-family': font,
        'font-size': '11',
      }),
    );
  }

  const markup = new XMLSerializer().serializeToString(out);
  const url = URL.createObjectURL(
    new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }),
  );
  try {
    const image = new Image();
    image.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error('Não foi possível gerar a imagem.'));
      image.src = url;
    });
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = fullWidth * scale;
    canvas.height = total * scale;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível gerar a imagem.');
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, fullWidth, total);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (!blob) throw new Error('Não foi possível gerar a imagem.');
    downloadBlob(blob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
