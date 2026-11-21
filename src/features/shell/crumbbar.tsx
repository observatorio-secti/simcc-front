import { Fragment } from 'react';
import {
  Link,
  useMatches,
  type RegisteredRouter,
} from '@tanstack/react-router';
import { ChevronRight, PanelLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { focusRing } from '@/shared/ui/focus-ring';
import { Separator } from '@/shared/ui/separator';
import { buildBreadcrumbs } from './breadcrumbs';

export type CrumbbarProps = {
  sidebarCollapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
};

/**
 * Faixa fixa (`sticky top-0 h-[68px] backdrop-blur`) com o gatilho do menu
 * lateral e breadcrumb alimentado por `staticData.crumb` das rotas ativas.
 */
export function Crumbbar({
  sidebarCollapsed,
  mobileOpen,
  isMobile,
  onToggleSidebar,
}: CrumbbarProps) {
  const matches = useMatches();
  const breadcrumbs = buildBreadcrumbs(matches);

  const triggerLabel = isMobile
    ? mobileOpen
      ? 'Fechar menu'
      : 'Abrir menu'
    : sidebarCollapsed
      ? 'Expandir menu'
      : 'Recolher menu';

  return (
    <div
      data-slot="crumbbar"
      className="sticky top-0 z-[3] flex h-[68px] shrink-0 items-center gap-2 bg-neutral-50/60 px-4 pt-4 pb-2 backdrop-blur md:px-8 md:pt-8 dark:bg-neutral-900/60"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onToggleSidebar}
        aria-label={triggerLabel}
        aria-expanded={isMobile ? mobileOpen : !sidebarCollapsed}
      >
        <PanelLeft className="size-4" aria-hidden />
      </Button>

      <Separator
        orientation="vertical"
        className="mr-2 bg-neutral-200 data-[orientation=vertical]:h-4 dark:bg-neutral-800"
      />

      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {breadcrumbs.map((segment, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <Fragment key={`${segment.href}-${segment.label}`}>
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    className="flex shrink-0 items-center text-neutral-400 dark:text-neutral-500"
                  >
                    <ChevronRight className="size-3.5" />
                  </li>
                )}
                <li className="min-w-0">
                  {isLast ? (
                    <span
                      aria-current="page"
                      className="block truncate text-foreground"
                    >
                      {segment.label}
                    </span>
                  ) : (
                    <Link<RegisteredRouter, string, string>
                      href={segment.href}
                      className={cn(
                        'block truncate rounded-md px-1 py-0.5 transition-colors hover:text-foreground',
                        focusRing,
                      )}
                    >
                      {segment.label}
                    </Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
