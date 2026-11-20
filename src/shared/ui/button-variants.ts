import { cva, type VariantProps } from 'class-variance-authority';
import { focusRing } from './focus-ring';

// Fica fora de button.tsx para o arquivo do componente exportar só componentes
// (react-refresh/only-export-components).

/** Botão do kit (`sc-btn`, components.md §Ações). */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    focusRing,
  ],
  {
    variants: {
      variant: {
        /** Ação primária: o único azul de ação. */
        default: 'bg-eng-blue text-white hover:bg-eng-dark-blue',
        /** Topbar e seletores. */
        outline: 'border bg-card text-foreground hover:bg-secondary',
        /** Ação neutra. */
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        /** Toolbar (filtros, colapsar). */
        ghost: 'text-foreground hover:bg-secondary',
        /** Excluir. */
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        link: 'text-eng-blue underline-offset-4 hover:underline',
        /**
         * Submit da busca na cor do tipo (`sc-btn--type`): o fundo vem do
         * dicionário, `className={searchTypeColor(type).bg}`.
         */
        searchType: 'bg-search-profile text-white hover:brightness-90',
      },
      size: {
        default: 'h-10 px-4',
        sm: "h-8 gap-1.5 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 px-8',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-xs': "size-7 [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
