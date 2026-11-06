// Utilitários dos blocos da Maria: texto de origem, aviso de corte e CSV.
import type { MariaBlockOrigin } from '../../types/maria';

// --- Origem e corte -----------------------------------------------------------

export function originText(origin: MariaBlockOrigin): string {
  const parts = [`Fonte: ${origin.sources.join(' e ')}`, origin.description];
  parts.push(
    `consultado em ${new Date(origin.queried_at).toLocaleDateString('pt-BR')}`,
  );
  if (origin.coverage) {
    const { found, keys } = origin.coverage;
    parts.push(
      `${found.toLocaleString('pt-BR')} de ${keys.toLocaleString('pt-BR')} encontrados`,
    );
  }
  return parts.join(' · ');
}

export function truncationText(count: number, grouped = false): string {
  if (grouped)
    return 'Mostrando só parte dos dados: o resultado foi cortado pelo limite da consulta.';
  return `Mostrando só os primeiros ${count} registros: o resultado foi cortado pelo limite da consulta.`;
}

// --- CSV ------------------------------------------------------------------------

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value).replace('.', ',');
  let text = String(value);
  // Dados de terceiros não podem virar fórmula ao abrir na planilha.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function downloadCsv(
  columns: { key: string; label: string }[],
  rows: Record<string, unknown>[],
  meta: {
    title?: string | null;
    origin?: MariaBlockOrigin | null;
    truncated?: boolean;
  },
) {
  const lines = [
    columns.map((c) => csvCell(c.label)).join(';'),
    ...rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(';')),
    '',
    csvCell(meta.title ?? ''),
  ];
  if (meta.truncated) lines.push(csvCell(truncationText(rows.length)));
  if (meta.origin) lines.push(csvCell(originText(meta.origin)));
  const blob = new Blob([`\ufeff${lines.join('\r\n')}\r\n`], {
    type: 'text/csv;charset=utf-8',
  });

  const slug = (meta.title || 'maria')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slug || 'maria'}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
