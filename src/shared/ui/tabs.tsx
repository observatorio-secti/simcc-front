import type * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '@/shared/lib/cn';
import { focusRing } from './focus-ring';

// Tabs segmentadas do kit (`sc-tabs`): alternam conteúdo do MESMO objeto
// (ex.: tipos de produção do pesquisador). Para trocar a visão de um resultado
// use as tabs de visão; para estado navegável, controle `value` pela URL.

export function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
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
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-10 w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-md bg-secondary p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm px-3 text-sm font-medium whitespace-nowrap transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
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
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-hidden', className)}
      {...props}
    />
  );
}
