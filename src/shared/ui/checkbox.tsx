import type * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { cn } from '@/shared/lib/cn';
import { focusRing } from './focus-ring';

/** Checkbox do kit (`sc-checkbox`): 16px, marcado em `eng-blue`. */
export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer group/checkbox size-4 shrink-0 cursor-pointer rounded-sm border border-neutral-400 bg-card text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-eng-blue data-[state=checked]:bg-eng-blue data-[state=indeterminate]:border-eng-blue data-[state=indeterminate]:bg-eng-blue',
        focusRing,
        'focus-visible:ring-offset-1',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center"
      >
        <Check
          aria-hidden
          className="size-3 group-data-[state=indeterminate]/checkbox:hidden"
          strokeWidth={3}
        />
        <Minus
          aria-hidden
          className="hidden size-3 group-data-[state=indeterminate]/checkbox:block"
          strokeWidth={3}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
