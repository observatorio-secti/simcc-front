import { useMemo, useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Plus } from 'phosphor-react';
import { useProductionSearch } from '../../../hooks/use-production-search';
import {
  ProductionKindV2,
  ProductionSortByV2,
} from '../../../types/production-v2';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import { Alert } from '../../ui/alert';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { Switch } from '../../ui/switch';
import { HeaderResultTypeHome } from '../categorias/header-result-type-home';
import { ProductionCard } from './production-card';
import { ProductionDetailDialog } from './production-detail-dialog';
import {
  PRODUCTION_DEFINITIONS,
  QUALIS_OPTIONS,
  SORT_LABELS,
} from './production-registry';
import { ProductionParams } from './use-production-params';

interface ProductionListProps {
  kind: ProductionKindV2;
  params: ProductionParams;
  /** Há busca textual: libera a ordenação por relevância. */
  hasQuery: boolean;
  icon: React.ReactNode;
}

const masonryBreakpoints = { 350: 1, 900: 2, 1400: 3 };

export function ProductionList({
  kind,
  params,
  hasQuery,
  icon,
}: ProductionListProps) {
  const definition = PRODUCTION_DEFINITIONS[kind];
  const [selected, setSelected] = useState<any | null>(null);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    fetchNextPage,
    hasNextPage,
  } = useProductionSearch(kind, params.paramsFor(kind));

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data as any[]) ?? [],
    [data],
  );
  const total = data?.pages[0]?.pagination.total_items;
  // Troca de filtros: o resultado anterior segue na tela, esmaecido, até a resposta chegar.
  const refreshing = isFetching && !isFetchingNextPage && isPlaceholderData;

  const sortOptions = definition.sortOptions.filter(
    (option) => option !== 'relevance' || hasQuery,
  );
  const [singular, plural] = definition.noun;

  return (
    <>
      <Accordion defaultValue="item-1" type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex mb-2">
            <HeaderResultTypeHome
              title={
                total === undefined
                  ? definition.title
                  : `${definition.title} · ${total.toLocaleString('pt-BR')}`
              }
              icon={icon}
            >
              <div className="mr-3 flex flex-wrap items-center justify-end gap-3">
                {kind === 'article' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="open-access"
                        checked={params.openAccess}
                        onCheckedChange={params.setOpenAccess}
                      />
                      <Label htmlFor="open-access" className="text-xs">
                        Acesso aberto
                      </Label>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9 gap-2">
                          Qualis
                          {params.qualis.length > 0 &&
                            ` (${params.qualis.length})`}
                          <ChevronDown size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {QUALIS_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option}
                            checked={params.qualis.includes(option)}
                            onCheckedChange={() => params.toggleQualis(option)}
                            onSelect={(event) => event.preventDefault()}
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                <Select
                  value={params.sortFor(kind)}
                  onValueChange={(value) =>
                    params.setSort(value as ProductionSortByV2)
                  }
                >
                  <SelectTrigger className="w-[170px] h-9">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {SORT_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </HeaderResultTypeHome>
            <AccordionTrigger />
          </div>

          <AccordionContent>
            {isError ? (
              <Alert className="p-6 text-sm">
                Não foi possível carregar {plural}. Tente novamente em
                instantes.
              </Alert>
            ) : isLoading ? (
              <ResponsiveMasonry columnsCountBreakPoints={masonryBreakpoints}>
                <Masonry gutter="16px">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton
                      key={index}
                      className="w-full rounded-md h-[170px]"
                    />
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum resultado em {definition.title.toLowerCase()} para esta
                busca.
              </p>
            ) : (
              <div
                className={`transition-opacity ${refreshing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <ResponsiveMasonry columnsCountBreakPoints={masonryBreakpoints}>
                  <Masonry gutter="16px">
                    {items.map((item) => (
                      <ProductionCard
                        key={item.id}
                        definition={definition}
                        item={item}
                        onOpen={() => setSelected(item)}
                      />
                    ))}
                  </Masonry>
                </ResponsiveMasonry>

                <div className="w-full flex flex-col items-center gap-3 mt-8">
                  <p className="text-xs text-muted-foreground">
                    Exibindo {items.length.toLocaleString('pt-BR')} de{' '}
                    {(total ?? 0).toLocaleString('pt-BR')}{' '}
                    {total === 1 ? singular : plural}
                  </p>
                  {hasNextPage && (
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="gap-2"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Carregando mais...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Mostrar mais
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ProductionDetailDialog
        definition={definition}
        item={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
