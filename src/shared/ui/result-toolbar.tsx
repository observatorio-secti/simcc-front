import type * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';
import { CollapseButton } from './collapse-button';

/**
 * Toolbar de resultados (`sc-toolbar`): conteúdo à esquerda (ex.: tabs de
 * visão) e ações à direita. Sem "Baixar resultado": o front não exporta CSV
 * (ADR 0006).
 */
export function ResultToolbar({
  onFiltersClick,
  filtersCount,
  open,
  onOpenChange,
  controls,
  actions,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Mostra o botão "Filtros" (abre o Sheet de filtros no mobile). */
  onFiltersClick?: () => void;
  /** Quantidade de filtros aplicados, exibida no botão. */
  filtersCount?: number;
  /** Com `onOpenChange`, mostra o botão de recolher. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  controls?: string;
  /** Ações extras, antes de "Filtros". */
  actions?: React.ReactNode;
}) {
  return (
    <div
      data-slot="result-toolbar"
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        className,
      )}
      {...props}
    >
      {children}
      <div className="ml-auto flex items-center gap-1">
        {actions}
        {onFiltersClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFiltersClick}
            className="lg:hidden"
          >
            <SlidersHorizontal aria-hidden />
            Filtros
            {filtersCount ? (
              <span className="rounded-full bg-eng-blue px-1.5 text-[10px] leading-4 font-bold text-white">
                {filtersCount}
                <span className="sr-only"> aplicados</span>
              </span>
            ) : null}
          </Button>
        )}
        {onOpenChange && (
          <CollapseButton
            open={open ?? true}
            onOpenChange={onOpenChange}
            controls={controls}
          />
        )}
      </div>
    </div>
  );
}
