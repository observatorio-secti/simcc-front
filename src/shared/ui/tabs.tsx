import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/shared/lib/cn';
import { focusRing } from './focus-ring';

// Tabs segmentadas do kit (`sc-tabs`): alternam conteúdo do MESMO objeto
// (ex.: tipos de produção do pesquisador). Para trocar a visão de um resultado
// use as tabs de visão (ou `variant="pills"` para o estilo de botões); para
// estado navegável, controle `value` pela URL.

export type TabsVariant = 'segmented' | 'pills';

const TabsVariantContext = createContext<TabsVariant>('segmented');

export function Tabs({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}

const FADE_WIDTH_PX = 40;
const SCROLL_THRESHOLD_PX = 1;
const DRAG_THRESHOLD_PX = 5;

function getFadeMask(
  canScrollLeft: boolean,
  canScrollRight: boolean,
): string | undefined {
  if (canScrollLeft && canScrollRight) {
    return `linear-gradient(to right, transparent 0%, black ${FADE_WIDTH_PX}px, black calc(100% - ${FADE_WIDTH_PX}px), transparent 100%)`;
  }
  if (canScrollRight) {
    return `linear-gradient(to right, black 0%, black calc(100% - ${FADE_WIDTH_PX}px), transparent 100%)`;
  }
  if (canScrollLeft) {
    return `linear-gradient(to right, transparent 0%, black ${FADE_WIDTH_PX}px, black 100%)`;
  }
  return undefined;
}

function TabScrollButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        direction === 'left'
          ? 'Rolar abas para a esquerda'
          : 'Rolar abas para a direita'
      }
      className={cn(
        'absolute top-1/2 z-10 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur-xs transition-colors hover:bg-accent',
        focusRing,
        'focus-visible:ring-offset-0',
        direction === 'left' ? 'left-1' : 'right-1',
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

/**
 * Controla estado de overflow horizontal, máscara de fade, botões ‹ › e
 * rolagem por arraste com o mouse em listas de abas.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHorizontalTabScroll(externalRef?: Ref<HTMLDivElement>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const suppressClickRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useImperativeHandle(
    externalRef,
    () => scrollRef.current as HTMLDivElement,
    [],
  );

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + SCROLL_THRESHOLD_PX;
    const nextLeft = hasOverflow && el.scrollLeft > SCROLL_THRESHOLD_PX;
    const nextRight =
      hasOverflow &&
      el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_THRESHOLD_PX;
    setCanScrollLeft((prev) => (prev === nextLeft ? prev : nextLeft));
    setCanScrollRight((prev) => (prev === nextRight ? prev : nextRight));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateScrollState)
        : null;
    resizeObserver?.observe(el);

    const mutationObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(updateScrollState)
        : null;
    mutationObserver?.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener('resize', updateScrollState);
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByDirection = useCallback(
    (direction: -1 | 1) => {
      const el = scrollRef.current;
      if (!el) return;
      const step = Math.max(160, Math.round(el.clientWidth * 0.6));
      const delta = direction * step;
      if (typeof el.scrollBy === 'function') {
        el.scrollBy({ left: delta, behavior: 'smooth' });
      } else {
        el.scrollLeft += delta;
      }
      updateScrollState();
    },
    [updateScrollState],
  );

  const handleMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;

    const startX = event.clientX;
    const startScrollLeft = el.scrollLeft;
    let didDrag = false;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (!didDrag && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        didDrag = true;
      }
      if (didDrag) {
        el.scrollLeft = startScrollLeft - deltaX;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (didDrag) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!suppressClickRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    },
    [],
  );

  const mask = getFadeMask(canScrollLeft, canScrollRight);
  const maskStyle: CSSProperties = mask
    ? { maskImage: mask, WebkitMaskImage: mask }
    : {};

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    maskStyle,
    scrollByDirection,
    handleScroll: updateScrollState,
    handleMouseDown,
    handleClickCapture,
  };
}

/** Wrapper que exibe os botões ‹ › apenas quando há overflow na direção. */
export function TabListScrollWrapper({
  children,
  canScrollLeft,
  canScrollRight,
  onScrollDirection,
  fullWidth = false,
  className,
}: {
  children: ReactNode;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollDirection: (direction: -1 | 1) => void;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex max-w-full min-w-0 items-center',
        fullWidth ? 'w-full' : 'w-fit',
        className,
      )}
    >
      {canScrollLeft && (
        <TabScrollButton
          direction="left"
          onClick={() => onScrollDirection(-1)}
        />
      )}
      {children}
      {canScrollRight && (
        <TabScrollButton
          direction="right"
          onClick={() => onScrollDirection(1)}
        />
      )}
    </div>
  );
}

/** A lista rola dentro do próprio container quando não cabe (sem rolar a página). */
export function TabsList({
  className,
  variant = 'segmented',
  children,
  ref,
  style,
  onScroll,
  onMouseDown,
  onClickCapture,
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant;
}) {
  const fullWidth =
    variant === 'pills' || Boolean(className?.includes('w-full'));
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    maskStyle,
    scrollByDirection,
    handleScroll,
    handleMouseDown,
    handleClickCapture,
  } = useHorizontalTabScroll(ref);

  return (
    <TabsVariantContext.Provider value={variant}>
      <TabListScrollWrapper
        canScrollLeft={canScrollLeft}
        canScrollRight={canScrollRight}
        onScrollDirection={scrollByDirection}
        fullWidth={fullWidth}
      >
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant={variant}
          data-scroll-left={canScrollLeft || undefined}
          data-scroll-right={canScrollRight || undefined}
          ref={scrollRef}
          style={{ ...maskStyle, ...style }}
          onScroll={(event) => {
            handleScroll();
            onScroll?.(event);
          }}
          onMouseDown={(event) => {
            handleMouseDown(event);
            onMouseDown?.(event);
          }}
          onClickCapture={(event) => {
            handleClickCapture(event);
            onClickCapture?.(event);
          }}
          className={cn(
            variant === 'pills'
              ? '-mx-1 scrollbar-none flex h-auto w-full min-w-0 items-center justify-start gap-2 overflow-x-auto px-1 py-0.5'
              : 'scrollbar-none inline-flex h-10 w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-md bg-secondary p-1 text-muted-foreground',
            className,
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </TabListScrollWrapper>
    </TabsVariantContext.Provider>
  );
}

export function TabsTrigger({
  className,
  variant,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: TabsVariant;
}) {
  const contextVariant = useContext(TabsVariantContext);
  const resolvedVariant = variant ?? contextVariant;

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        resolvedVariant === 'pills'
          ? "group inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-neutral-100 px-4 text-sm font-medium whitespace-nowrap text-neutral-700 transition-colors hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-eng-blue data-[state=active]:text-white data-[state=active]:hover:bg-eng-dark-blue dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          : "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm px-3 text-sm font-medium whitespace-nowrap transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        focusRing,
        'focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-hidden', className)}
      {...props}
    />
  );
}
