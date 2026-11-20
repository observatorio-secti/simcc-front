import { cva, type VariantProps } from 'class-variance-authority';
import { focusRing } from './focus-ring';

// Fica fora de toggle.tsx para o arquivo do componente exportar só componentes.

/** Botão de alternância do kit (`sc-toggle`): ativo branco com borda. */
export const toggleVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:border-border data-[state=on]:bg-card data-[state=on]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    focusRing,
    'focus-visible:ring-offset-0',
  ],
  {
    variants: {
      size: {
        /** Quadrado de 32px (grade/lista). */
        icon: 'size-8',
        default: 'h-8 px-3',
      },
    },
    defaultVariants: {
      size: 'icon',
    },
  },
);

export type ToggleVariantProps = VariantProps<typeof toggleVariants>;
