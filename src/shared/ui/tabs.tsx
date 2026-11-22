import { createContext, useContext, type ComponentProps } from 'react';
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

/** A lista rola dentro do próprio container quando não cabe (sem rolar a página). */
export function TabsList({
  className,
  variant = 'segmented',
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant;
}) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          variant === 'pills'
            ? '-mx-1 flex h-auto w-full min-w-0 [scrollbar-width:none] items-center justify-start gap-2 overflow-x-auto px-1 py-0.5'
            : 'inline-flex h-10 w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-md bg-secondary p-1 text-muted-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
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
        resolvedVariant === 'segmented' && 'focus-visible:ring-offset-0',
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
