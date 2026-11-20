import { cva, type VariantProps } from 'class-variance-authority';

// Fica fora de badge.tsx para o arquivo do componente exportar só componentes.

/**
 * Badge sólido do kit (`sc-badge`): texto branco e bold sobre a cor do
 * dicionário, passada por `className` (ex.: `areaColor(area).bg`).
 */
export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md font-bold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: 'bg-neutral-900 text-white',
        outline: 'border bg-card font-medium text-muted-foreground',
      },
      size: {
        default: 'h-7 px-3 text-xs',
        sm: 'h-5 px-2 text-[10px] [&>svg]:size-3',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;

/** Tag suave do kit (`sc-tag`): contadores e métricas, número em bold. */
export const tagVariants = cva(
  'inline-flex h-6 w-fit shrink-0 items-center gap-1.5 px-2.5 text-xs font-medium whitespace-nowrap text-foreground [&_b]:font-bold [&>svg]:size-3 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        // O kit (simcc.css) escurece o brand-soft no tema escuro, mas o token
        // não existe no tema Tailwind; eng-blue/20 é a aproximação disponível.
        brand: 'rounded-full bg-brand-soft dark:bg-eng-blue/20',
        neutral: 'rounded-full bg-secondary',
        outline: 'rounded-md border bg-card',
      },
    },
    defaultVariants: {
      variant: 'brand',
    },
  },
);

export type TagVariantProps = VariantProps<typeof tagVariants>;
