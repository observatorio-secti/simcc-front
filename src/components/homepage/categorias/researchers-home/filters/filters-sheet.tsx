import { useEffect, useState } from 'react';
import { FadersHorizontal } from 'phosphor-react';
import { SlidersHorizontal, Trash, X } from 'lucide-react';
import bg_user from '../../../../../assets/user.png';
import { Button } from '../../../../ui/button';
import { DialogFooter, DialogHeader } from '../../../../ui/dialog';
import { Sheet, SheetContent } from '../../../../ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../ui/tooltip';
import { useModal } from '../../../../hooks/use-modal-store';
import { useResearcherFilters } from '../hooks/use-researcher-filters';
import { FilterSections } from './filter-sections';

function useMediaQueryLg() {
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

interface FiltersSheetProps {
  filters: ReturnType<typeof useResearcherFilters>;
}

export function FiltersSheet({ filters }: FiltersSheetProps) {
  const { onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = isOpen && typeModal === 'filters';
  const isDesktop = useMediaQueryLg();

  return (
    <Sheet open={isModalOpen && !isDesktop} onOpenChange={onClose}>
      <SheetContent
        className="p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[60vw]"
      >
        <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-gray-600">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 w-8"
                    variant={'outline'}
                    onClick={() => {
                      onClose();
                    }}
                    size={'icon'}
                  >
                    <X size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fechar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="relative flex">
          <div>
            <div className="hidden lg:block p-8 pr-0 h-full">
              <div
                style={{ backgroundImage: `url(${bg_user})` }}
                className="h-full w-[270px] bg-cover bg-no-repeat bg-left rounded-md bg-eng-blue p-8"
              />
            </div>
          </div>
          <div className="relative h-[calc(100vh-50px)] p-8 w-full overflow-y-auto">
            <div>
              <h1 className="mb-8 flex items-center gap-3 max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
                <SlidersHorizontal size={32} className="shrink-0" />
                Filtros
              </h1>
            </div>

            <div className="w-full">
              <FilterSections filters={filters} />
            </div>

            <DialogFooter className="py-4">
              <Button
                variant="ghost"
                onClick={filters.clearFilters}
                className="gap-2"
              >
                <Trash size={16} />
                Limpar Filtros
              </Button>

              <Button
                onClick={() => {
                  onClose();
                }}
                className="gap-2"
              >
                <FadersHorizontal size={16} />
                Mostrar {filters.filteredCount} resultados
              </Button>
            </DialogFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
