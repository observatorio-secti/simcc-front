import { useState } from 'react';
import { SlidersHorizontal, Trash } from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import { Button } from '../../../../ui/button';
import { useResearcherFilters } from '../hooks/use-researcher-filters';
import { FilterSections } from './filter-sections';

interface FiltersSidebarProps {
  filters: ReturnType<typeof useResearcherFilters>;
}

export function FiltersSidebar({ filters }: FiltersSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="group relative hidden lg:block shrink-0 sticky top-[calc(68px+var(--sticky-header-h,0px))] h-[calc(100vh-68px-var(--sticky-header-h,0px))]"
      data-state={collapsed ? 'collapsed' : 'expanded'}
      data-side="left"
    >
      <aside
        className={cn(
          'h-full overflow-hidden transition-[width] duration-200 ease-linear',
          collapsed ? 'w-0' : 'w-72',
        )}
      >
        <div className="h-full w-72 overflow-y-auto border-r border-neutral-200 bg-card p-4 dark:border-neutral-800">
          <div className="mb-4">
            <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold leading-tight tracking-tighter">
              <SlidersHorizontal size={24} />
              Filtros
            </h1>
          </div>

          <FilterSections filters={filters} />

          <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <Button
              variant="ghost"
              onClick={filters.clearFilters}
              className="gap-2 w-full"
            >
              <Trash size={16} />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Ocultar ou mostrar filtros"
        tabIndex={-1}
        title="Ocultar ou mostrar filtros"
        className={cn(
          'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border lg:flex -right-4',
          collapsed
            ? 'cursor-e-resize after:bg-sidebar-border'
            : 'cursor-w-resize',
        )}
      />
    </div>
  );
}
