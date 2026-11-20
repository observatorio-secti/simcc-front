import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cn } from '@/shared/lib/cn';
import { toggleVariants, type ToggleVariantProps } from './toggle-variants';

// Alternância do kit (`sc-toggle`), ex.: grade/lista. Com `type="single"` o
// Radix expõe os itens como `role="radio"` com `aria-checked`. Quando a escolha
// for navegável (visão da lista), controle `value` pela URL.

const ToggleGroupContext = React.createContext<ToggleVariantProps>({
  size: 'icon',
});

export function ToggleGroup({
  className,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  ToggleVariantProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('inline-flex w-fit items-center gap-0.5', className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

export function ToggleGroupItem({
  className,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  ToggleVariantProps) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants({ size: size ?? context.size }), className)}
      {...props}
    />
  );
}
