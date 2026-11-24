import type * as React from 'react';
import { cn } from '@/shared/lib/cn';
import {
  parseMarkdownBlocks,
  safeHttpHref,
  type TableAlign,
} from '@/shared/lib/markdown';
import { focusRing } from './focus-ring';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// Markdown curto (respostas de IA) renderizado como elementos React, sem
// `dangerouslySetInnerHTML`: HTML do texto aparece como texto. Cobre o que a
// MarIA usa (o prompt pede listas, tabelas e negrito; a demo dela usa GFM):
// parágrafos, títulos, listas, citações, tabelas, negrito, itálico, riscado,
// código em linha e links http(s), inclusive URLs soltas. Funciona com texto
// parcial durante o streaming.

// Ordem importa: código antes de ênfase, para `**` dentro de código ficar cru.
const INLINE = new RegExp(
  [
    '(?<code>`[^`]+`)',
    '\\[(?<linkText>[^\\]]+)\\]\\((?<linkUrl>[^)\\s]+)\\)',
    // URL solta, sem a pontuação final da frase.
    '(?<url>https?:\\/\\/[^\\s<>()]*[^\\s<>().,;:!?\'"])',
    '(?<strongMark>\\*\\*|__)(?<strong>.+?)\\k<strongMark>',
    '~~(?<strike>.+?)~~',
    '(?<emMark>\\*|_)(?!\\s)(?<emphasis>.+?)\\k<emMark>',
  ].join('|'),
);

const linkClass = cn(
  'rounded-sm text-eng-blue underline underline-offset-2 hover:text-eng-dark-blue dark:hover:text-brand-soft',
  focusRing,
);

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let rest = text;
  let position = 0;

  while (rest.length > 0) {
    const match = INLINE.exec(rest);
    if (!match) {
      nodes.push(rest);
      break;
    }
    if (match.index > 0) nodes.push(rest.slice(0, match.index));
    const key = `${keyPrefix}-${position}`;
    position += 1;

    const [whole] = match;
    const { code, linkText, linkUrl, url, strong, strike, emphasis } =
      match.groups ?? {};
    if (code) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-neutral-800"
        >
          {code.slice(1, -1)}
        </code>,
      );
    } else if (linkText !== undefined && linkUrl !== undefined) {
      const href = safeHttpHref(linkUrl);
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {renderInline(linkText, key)}
          </a>
        ) : (
          <span key={key}>{renderInline(linkText, key)}</span>
        ),
      );
    } else if (url !== undefined) {
      const href = safeHttpHref(url);
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClass, 'break-all')}
          >
            {url}
          </a>
        ) : (
          url
        ),
      );
    } else if (strong !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {renderInline(strong, key)}
        </strong>,
      );
    } else if (strike !== undefined) {
      nodes.push(<s key={key}>{renderInline(strike, key)}</s>);
    } else if (emphasis !== undefined) {
      nodes.push(<em key={key}>{renderInline(emphasis, key)}</em>);
    } else {
      nodes.push(whole);
    }
    rest = rest.slice(match.index + whole.length);
  }

  return nodes;
}

function renderLines(lines: string[], key: string): React.ReactNode[] {
  return lines.flatMap((line, index) => {
    const content = renderInline(line, `${key}-${index}`);
    return index === 0
      ? content
      : [<br key={`${key}-br-${index}`} />, ...content];
  });
}

const alignClass: Record<NonNullable<TableAlign>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right tabular-nums',
};

/** Tabela GFM: cabeçalho, alinhamento da linha `|---:|` e células com Markdown. */
function MarkdownTable({
  align,
  header,
  rows,
  id,
}: {
  align: TableAlign[];
  header: string[];
  rows: string[][];
  id: string;
}) {
  return (
    <div data-slot="markdown-table" className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {header.map((cell, column) => {
              const cellAlign = align[column];
              return (
                <TableHead
                  key={column}
                  className={cn(
                    'whitespace-normal',
                    cellAlign && alignClass[cellAlign],
                  )}
                >
                  {renderInline(cell, `${id}-h${column}`)}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, column) => {
                const cellAlign = align[column];
                return (
                  <TableCell
                    key={column}
                    className={cn(
                      'min-w-24 py-2 whitespace-normal',
                      cellAlign && alignClass[cellAlign],
                    )}
                  >
                    {renderInline(cell, `${id}-${rowIndex}-${column}`)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const headingClass: Record<number, string> = {
  1: 'text-lg font-semibold',
  2: 'text-base font-semibold',
  3: 'text-sm font-semibold',
};

export function Markdown({
  source,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & { source: string }) {
  const blocks = parseMarkdownBlocks(source);

  return (
    <div
      data-slot="markdown"
      className={cn(
        'flex flex-col gap-3 text-sm leading-relaxed break-words',
        className,
      )}
      {...props}
    >
      {blocks.map((block, index) => {
        const key = `b${index}`;
        switch (block.kind) {
          case 'heading': {
            const level = Math.min(block.level + 2, 6);
            const Tag = `h${level}` as 'h3';
            return (
              <Tag
                key={key}
                className={headingClass[block.level] ?? 'text-sm font-semibold'}
              >
                {renderInline(block.text, key)}
              </Tag>
            );
          }
          case 'list': {
            const items = block.items.map((item, itemIndex) => (
              <li key={`${key}-${itemIndex}`}>
                {renderInline(item, `${key}-${itemIndex}`)}
              </li>
            ));
            return block.ordered ? (
              <ol
                key={key}
                start={block.start}
                className="flex list-decimal flex-col gap-1 pl-5"
              >
                {items}
              </ol>
            ) : (
              <ul key={key} className="flex list-disc flex-col gap-1 pl-5">
                {items}
              </ul>
            );
          }
          case 'quote':
            return (
              <blockquote
                key={key}
                className="border-l-2 border-neutral-300 pl-3 text-muted-foreground dark:border-neutral-700"
              >
                {renderLines(block.lines, key)}
              </blockquote>
            );
          case 'code':
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-md bg-neutral-100 p-3 font-mono text-xs dark:bg-neutral-800"
              >
                <code>{block.text}</code>
              </pre>
            );
          case 'rule':
            return <hr key={key} className="border-border" />;
          case 'table':
            return (
              <MarkdownTable
                key={key}
                id={key}
                align={block.align}
                header={block.header}
                rows={block.rows}
              />
            );
          default:
            return <p key={key}>{renderLines(block.lines, key)}</p>;
        }
      })}
    </div>
  );
}
