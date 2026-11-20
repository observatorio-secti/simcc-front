import { Fragment } from 'react';

const ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&apos;': "'",
  '&#39;': "'",
};

const clean = (text: string) =>
  text
    .replace(/<[^>]+>/g, '')
    .replace(
      /&(?:quot|lt|gt|amp|apos|#39);/gi,
      (entity) => ENTITIES[entity.toLowerCase()] ?? entity,
    );

/** Texto do trecho sem as marcações de destaque. */
export const plainSnippet = (snippet: string) => clean(snippet);

/**
 * Renderiza um trecho devolvido pela API com os termos entre `<b>...</b>`.
 * O trecho é quebrado nos marcadores e montado como nós React — nenhum HTML
 * vindo da API é injetado na página.
 */
export function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/<\/?b>/i);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="font-semibold text-eng-blue">
            {clean(part)}
          </span>
        ) : (
          <Fragment key={index}>{clean(part)}</Fragment>
        ),
      )}
    </>
  );
}
