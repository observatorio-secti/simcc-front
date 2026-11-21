import type { MouseEvent } from 'react';

/** Clique simples (sem modificador): pode ser tratado como navegação interna. */
export function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

const RESEARCHER_PATH = /\/pesquisadores\/([^/?#]+)\/?$/;

/**
 * Extrai o id de um link para `/pesquisadores/$id` da própria aplicação
 * (ex.: os chips de autor do `ProductionCard`).
 */
export function researcherIdFromHref(
  href: string,
  origin: string = window.location.origin,
): string | null {
  try {
    const url = new URL(href, origin);
    if (url.origin !== origin) return null;
    const match = RESEARCHER_PATH.exec(url.pathname);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * Delegação de clique: um link de pesquisador dentro do container abre o
 * overlay em vez de recarregar a página. Ctrl/Cmd+clique segue o link normal.
 */
export function interceptResearcherLink(
  event: MouseEvent<HTMLElement>,
  onOpenResearcher: (id: string) => void,
): void {
  if (!isPlainLeftClick(event)) return;
  const target = event.target as Element | null;
  const anchor = target?.closest?.('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.target && anchor.target !== '_self') return;
  const id = researcherIdFromHref(anchor.href);
  if (!id) return;
  event.preventDefault();
  onOpenResearcher(id);
}
