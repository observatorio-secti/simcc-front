import type { MouseEvent } from 'react';

/**
 * Clique simples (botão esquerdo, sem modificador): pode virar navegação
 * interna. Ctrl/Cmd/Shift/Alt+clique e o botão do meio seguem o link normal.
 */
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
