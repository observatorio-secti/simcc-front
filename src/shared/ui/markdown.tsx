import type * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { parseMarkdownBlocks, safeHttpHref } from '@/shared/lib/markdown';
import { focusRing } from './focus-ring';

// Markdown curto (respostas de IA) renderizado como elementos React, sem
// `dangerouslySetInnerHTML`: HTML do texto aparece como texto. Cobre o que a
// MarIA usa: parágrafos, títulos, listas, citações, negrito, itálico, código
// em linha e links http(s). Funciona com texto parcial durante o streaming.

// Ordem importa: código antes de ênfase, para `**` dentro de código ficar cru.
const INLINE =
  /(`[^`]+`)|\[([^\]]+)\]\(([^)\s]+)\)|(\*\*|__)(.+?)\4|(\*|_)(?!\s)(.+?)\6/;

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

    const [whole, code, linkText, linkUrl, , strong, , emphasis] = match;
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
            className={cn(
              'rounded-sm text-eng-blue underline underline-offset-2 hover:text-eng-dark-blue dark:hover:text-brand-soft',
              focusRing,
            )}
          >
            {renderInline(linkText, key)}
          </a>
        ) : (
          <span key={key}>{renderInline(linkText, key)}</span>
        ),
      );
    } else if (strong !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {renderInline(strong, key)}
        </strong>,
      );
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
          default:
            return <p key={key}>{renderLines(block.lines, key)}</p>;
        }
      })}
    </div>
  );
}
