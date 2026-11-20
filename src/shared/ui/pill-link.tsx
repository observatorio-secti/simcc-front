import type * as React from 'react';
import { createLink, type LinkComponent } from '@tanstack/react-router';
import { ArrowRight, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from './focus-ring';

/** Âncora com a aparência do link-pílula (`sc-pill-link`). */
export function PillAnchor({
  className,
  children,
  ...props
}: React.ComponentProps<'a'>) {
  return (
    <a
      data-slot="pill-link"
      className={cn(
        'inline-flex h-7 w-fit max-w-full items-center gap-2 rounded-lg bg-secondary px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent',
        focusRing,
        className,
      )}
      {...props}
    >
      <Info className="size-3 shrink-0" aria-hidden />
      <span aria-hidden className="h-3.5 w-px shrink-0 bg-border" />
      <span className="truncate">{children}</span>
      <ArrowRight className="size-3 shrink-0" aria-hidden />
    </a>
  );
}

const RouterPillLink = createLink(PillAnchor);

/**
 * Link-pílula "Saiba como…" do topo das páginas (`sc-pill-link`), com `to`
 * tipado pelo router: `<PillLink to="/">Saiba como usar a plataforma</PillLink>`.
 */
export const PillLink: LinkComponent<typeof PillAnchor> = (props) => (
  <RouterPillLink {...props} />
);
