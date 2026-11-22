import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

const FADE_EDGE_PX = 32;
const SCROLL_EPSILON_PX = 1;
const DRAG_THRESHOLD_PX = 5;

interface ScrollFadeState {
  left: boolean;
  right: boolean;
}

function getScrollFadeMask(fade: ScrollFadeState): string | undefined {
  if (fade.left && fade.right) {
    return `linear-gradient(to right, transparent 0%, black ${FADE_EDGE_PX}px, black calc(100% - ${FADE_EDGE_PX}px), transparent 100%)`;
  }
  if (fade.left) {
    return `linear-gradient(to right, transparent 0%, black ${FADE_EDGE_PX}px, black 100%)`;
  }
  if (fade.right) {
    return `linear-gradient(to right, black 0%, black calc(100% - ${FADE_EDGE_PX}px), transparent 100%)`;
  }
  return undefined;
}

export function centerTabInList(
  list: HTMLElement,
  tab: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
) {
  const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth);
  if (maxScrollLeft === 0) return;

  const listRect = list.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  const tabOffsetLeft = tabRect.left - listRect.left + list.scrollLeft;
  const idealScrollLeft =
    tabOffsetLeft + tabRect.width / 2 - list.clientWidth / 2;
  const targetScrollLeft = Math.min(
    maxScrollLeft,
    Math.max(0, idealScrollLeft),
  );

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const resolvedBehavior = prefersReducedMotion ? 'auto' : behavior;

  if (typeof list.scrollTo === 'function') {
    list.scrollTo({ left: targetScrollLeft, behavior: resolvedBehavior });
  } else {
    list.scrollLeft = targetScrollLeft;
  }
}

/**
 * Habilita comportamento de carrossel horizontal para listas de tabs:
 * - fade nas bordas quando há conteúdo oculto à esquerda e/ou à direita;
 * - arraste com o mouse (mantendo toque nativo e Shift + roda);
 * - centralização da aba clicada/ativa respeitando as extremidades.
 */
export function useScrollableTabs<T extends HTMLElement = HTMLDivElement>() {
  const listRef = useRef<T | null>(null);
  const [fade, setFade] = useState<ScrollFadeState>({
    left: false,
    right: false,
  });

  const updateFade = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const left = list.scrollLeft > SCROLL_EPSILON_PX;
    const right =
      list.scrollLeft + list.clientWidth < list.scrollWidth - SCROLL_EPSILON_PX;

    setFade((prev) =>
      prev.left === left && prev.right === right ? prev : { left, right },
    );
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    updateFade();

    const initialActive = list.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]',
    );
    if (initialActive) {
      centerTabInList(list, initialActive, 'auto');
    }

    const handleScroll = () => updateFade();
    list.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateFade())
        : null;
    resizeObserver?.observe(list);

    const mutationObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver((mutations) => {
            let shouldUpdateFade = false;
            let newlyActiveTab: HTMLElement | null = null;

            for (const mutation of mutations) {
              if (mutation.type === 'childList') {
                shouldUpdateFade = true;
              } else if (
                mutation.type === 'attributes' &&
                mutation.target instanceof HTMLElement &&
                mutation.target.getAttribute('role') === 'tab' &&
                (mutation.target.getAttribute('aria-selected') === 'true' ||
                  mutation.target.getAttribute('data-state') === 'active')
              ) {
                newlyActiveTab = mutation.target;
              }
            }

            if (shouldUpdateFade) updateFade();
            if (newlyActiveTab) {
              centerTabInList(list, newlyActiveTab, 'smooth');
            }
          })
        : null;

    mutationObserver?.observe(list, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected', 'data-state'],
    });

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const tab = target.closest<HTMLElement>('[role="tab"]');
      if (tab && list.contains(tab)) {
        centerTabInList(list, tab, 'smooth');
      }
    };
    list.addEventListener('click', handleClick);

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;

      const startX = event.clientX;
      const startScrollLeft = list.scrollLeft;
      let moved = false;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        if (!moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
          moved = true;
          list.dataset.dragging = 'true';
        }
        if (moved) {
          list.scrollLeft = startScrollLeft - dx;
        }
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', cleanup);
        window.removeEventListener('pointercancel', cleanup);
        delete list.dataset.dragging;

        if (moved) {
          const suppressClick = (clickEvent: MouseEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
          };
          list.addEventListener('click', suppressClick, {
            capture: true,
            once: true,
          });
          window.setTimeout(() => {
            list.removeEventListener('click', suppressClick, {
              capture: true,
            });
          }, 0);
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', cleanup);
      window.addEventListener('pointercancel', cleanup);
    };
    list.addEventListener('pointerdown', handlePointerDown);

    return () => {
      list.removeEventListener('scroll', handleScroll);
      list.removeEventListener('click', handleClick);
      list.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [updateFade]);

  const maskImage = getScrollFadeMask(fade);
  const fadeStyle: CSSProperties | undefined = maskImage
    ? { maskImage, WebkitMaskImage: maskImage }
    : undefined;

  return {
    listRef,
    fade,
    fadeStyle,
    fadeDataAttrs: {
      'data-fade-left': fade.left ? 'true' : undefined,
      'data-fade-right': fade.right ? 'true' : undefined,
    } as const,
  };
}
