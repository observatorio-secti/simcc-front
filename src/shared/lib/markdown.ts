// Leitura de Markdown curto (respostas de IA) em blocos. A renderização fica
// em `shared/ui/markdown.tsx`.

export type MarkdownBlock =
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'list'; ordered: boolean; start: number; items: string[] }
  | { kind: 'quote'; lines: string[] }
  | { kind: 'code'; text: string }
  | { kind: 'table'; align: TableAlign[]; header: string[]; rows: string[][] }
  | { kind: 'rule' };

export type TableAlign = 'left' | 'center' | 'right' | null;

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*(\d+)[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const FENCE = /^\s*```/;
// Linha separadora de tabela GFM: `|---|:---:|---:|`.
const TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

/**
 * Células de uma linha de tabela GFM. `\|` e `|` dentro de código em linha
 * não separam colunas; as bordas `|` do começo e do fim são opcionais.
 */
export function splitTableRow(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inCode = false;
  const text = line.trim().replace(/^\|/, '');
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '\\' && text[index + 1] === '|') {
      current += '|';
      index += 1;
    } else if (char === '`') {
      inCode = !inCode;
      current += char;
    } else if (char === '|' && !inCode) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  // Sem `|` no fim, a última célula ainda conta (inclusive no streaming).
  if (current.trim() !== '') cells.push(current.trim());
  return cells;
}

function tableAlign(cell: string): TableAlign {
  const left = cell.startsWith(':');
  const right = cell.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  if (left) return 'left';
  return null;
}

/** Começa uma tabela: linha com `|` seguida da linha separadora. */
function isTableStart(lines: readonly string[], index: number): boolean {
  const line = lines[index] ?? '';
  const next = lines[index + 1] ?? '';
  return line.includes('|') && next.includes('-') && TABLE_SEPARATOR.test(next);
}

export function parseMarkdownBlocks(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (line.trim() === '') {
      index += 1;
      continue;
    }

    if (FENCE.test(line)) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !FENCE.test(lines[index] ?? '')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      index += 1;
      blocks.push({ kind: 'code', text: code.join('\n') });
      continue;
    }

    if (isTableStart(lines, index)) {
      const header = splitTableRow(line);
      const align = splitTableRow(lines[index + 1] ?? '').map(tableAlign);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length) {
        const current = lines[index] ?? '';
        if (current.trim() === '' || !current.includes('|')) break;
        const cells = splitTableRow(current);
        // Cada linha fica com o número de colunas do cabeçalho.
        rows.push(header.map((_, column) => cells[column] ?? ''));
        index += 1;
      }
      blocks.push({
        kind: 'table',
        align: header.map((_, column) => align[column] ?? null),
        header,
        rows,
      });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        kind: 'heading',
        level: heading[1]?.length ?? 1,
        text: heading[2] ?? '',
      });
      index += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ kind: 'rule' });
      index += 1;
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = ORDERED.exec(line);
    if (bullet || ordered) {
      const isOrdered = !bullet;
      const pattern = isOrdered ? ORDERED : BULLET;
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index] ?? '';
        const match = pattern.exec(current);
        if (match) {
          items.push((isOrdered ? match[2] : match[1]) ?? '');
        } else if (
          current.trim() !== '' &&
          /^\s{2,}/.test(current) &&
          items.length
        ) {
          // Continuação recuada do item anterior.
          items[items.length - 1] += ` ${current.trim()}`;
        } else {
          break;
        }
        index += 1;
      }
      blocks.push({
        kind: 'list',
        ordered: isOrdered,
        start: isOrdered ? Number(ordered?.[1] ?? 1) : 1,
        items,
      });
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length) {
        const match = QUOTE.exec(lines[index] ?? '');
        if (!match) break;
        quoted.push(match[1] ?? '');
        index += 1;
      }
      blocks.push({ kind: 'quote', lines: quoted });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? '';
      if (
        current.trim() === '' ||
        HEADING.test(current) ||
        BULLET.test(current) ||
        ORDERED.test(current) ||
        QUOTE.test(current) ||
        FENCE.test(current) ||
        isTableStart(lines, index)
      ) {
        break;
      }
      paragraph.push(current);
      index += 1;
    }
    blocks.push({ kind: 'paragraph', lines: paragraph });
  }

  return blocks;
}

export function safeHttpHref(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}
