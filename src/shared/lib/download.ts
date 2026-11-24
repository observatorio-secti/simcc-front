// Baixar um arquivo gerado no navegador (imagem de gráfico, CSV de um bloco).

/** Nome de arquivo a partir de um título: sem acento, minúsculo, com hífens. */
export function fileSlug(title: string, fallback = 'arquivo'): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug || fallback;
}

/** Dispara o download de um `Blob` ou de uma URL `data:`. */
export function downloadFile(content: Blob | string, filename: string): void {
  const url =
    typeof content === 'string' ? content : URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  if (typeof content !== 'string') {
    // Dá tempo ao navegador de começar o download antes de soltar a URL.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** Marca de ordem de bytes: faz o Excel ler o arquivo como UTF-8. */
const BOM = String.fromCharCode(0xfeff);

export interface CsvColumn {
  key: string;
  label: string;
}

function csvCell(value: unknown): string {
  if (value == null) return '';
  // Planilhas em pt-BR leem vírgula como separador decimal.
  const text =
    typeof value === 'number' ? String(value).replace('.', ',') : String(value);
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * CSV no formato que o Excel em pt-BR abre direto: `;` entre colunas,
 * vírgula decimal e BOM UTF-8 (para os acentos).
 */
export function toCsv(
  columns: readonly CsvColumn[],
  rows: readonly Record<string, unknown>[],
): string {
  const lines = [
    columns.map((column) => csvCell(column.label)).join(';'),
    ...rows.map((row) =>
      columns.map((column) => csvCell(row[column.key])).join(';'),
    ),
  ];
  return `${BOM}${lines.join('\r\n')}\r\n`;
}
