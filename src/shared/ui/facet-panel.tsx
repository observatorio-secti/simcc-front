import { useId, useState, type ComponentProps, type FormEvent } from 'react';
import { Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
import { Dot, Tag } from './badge';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './sheet';
import { Skeleton } from './skeleton';

/** Opção individual de uma faceta (compatível com `FacetItem` da API v2). */
export interface FacetOptionItem {
  value: string;
  label: string;
  count: number;
  acronym?: string | null;
  selected?: boolean;
}

/** Grupo de faceta retornado pela API v2 (compatível com `FacetResult`). */
export interface FacetGroupData {
  param?: string | string[] | null;
  total: number;
  items: FacetOptionItem[];
}

export type FacetsMap = Record<string, FacetGroupData>;

/** Configuração opcional de apresentação para uma chave de faceta. */
export interface FacetFieldConfig {
  /** Título exibido no acordeão. */
  label?: string;
  /** Classe de cor para o `Dot` da opção (ex.: `areaColor(value).bg`). */
  dotClassName?: (value: string, item: FacetOptionItem) => string | undefined;
  /** Formatação customizada do rótulo de cada opção. */
  formatItemLabel?: (item: FacetOptionItem) => string;
  /** Força o tipo de controle (`range` para intervalo numérico). */
  kind?: 'checkbox' | 'range';
  /** Exibe campo de busca local para filtrar opções da faceta. */
  searchable?: boolean;
}

export interface FacetPanelProps {
  /** Mapa `facets` vindo do envelope de listagem da API v2. */
  facets?: FacetsMap;
  /** Estado atual de busca/filtros (ex.: objeto validado pelos search params). */
  values?: Record<string, unknown>;
  /** Configuração opcional por chave de faceta (rótulos, `Dot`, busca local). */
  config?: Record<string, FacetFieldConfig>;
  /** Resolvedor genérico de classe do `Dot` por faceta/valor (cor vinda de fora). */
  getDotClassName?: (
    facetKey: string,
    value: string,
    item: FacetOptionItem,
  ) => string | undefined;
  /** Ordem preferencial das chaves de faceta. */
  order?: readonly string[];
  /** Seções abertas inicialmente (controlado internamente quando `openSections` não é passado). */
  defaultOpen?: readonly string[];
  /** Estado controlado das seções abertas do acordeão. */
  openSections?: string[];
  onOpenSectionsChange?: (open: string[]) => void;
  /** Callback unificado com o patch para atualizar a busca/URL (reseta `page` fora). */
  onSearchChange?: (
    patch: Record<string, string[] | number | undefined>,
  ) => void;
  /** Callback específico ao alternar opções de uma faceta de checkbox. */
  onFilterChange?: (param: string, values: string[]) => void;
  /** Callback específico ao aplicar/limpar intervalo (ex.: `year_start` / `year_end`). */
  onRangeChange?: (range: {
    startParam: string;
    endParam: string;
    start?: number;
    end?: number;
  }) => void;
  /** Limpa todos os filtros ativos. */
  onClear?: () => void;
  title?: string;
  hideHeader?: boolean;
  loading?: boolean;
  className?: string;
}

const DEFAULT_FACET_LABELS: Record<string, string> = {
  area: 'Grandes áreas do conhecimento',
  institution: 'Instituições',
  graduate_program: 'Programas de pós-graduação',
  city: 'Cidades',
  identity_territory: 'Territórios de identidade',
  graduation: 'Maior titulação',
  classification: 'Classificação',
  modality: 'Modalidade',
  source_type: 'Tipo de produção',
  qualis: 'Qualis',
  rating: 'Conceito CAPES',
  state: 'UF',
  year: 'Ano',
  category: 'Categoria',
  category_level: 'Nível da bolsa',
  nature: 'Natureza',
  status: 'Situação',
  type: 'Tipo',
  type_participation: 'Tipo de participação',
  form_participation: 'Forma de participação',
  magazine_name: 'Periódico',
  issn: 'ISSN',
};

const NUMBER_FORMAT = new Intl.NumberFormat('pt-BR');
const SCROLL_THRESHOLD = 8;

function humanizeFacetKey(key: string): string {
  const spaced = key.replace(/_/g, ' ').trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function readStringValues(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item)).filter((item) => item.length > 0);
  }
  if (typeof raw === 'string' && raw.length > 0) return [raw];
  if (typeof raw === 'number' && Number.isFinite(raw)) return [String(raw)];
  return [];
}

function readYearValue(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isInteger(raw)) return raw;
  if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
    const parsed = Number(raw.trim());
    return Number.isSafeInteger(parsed) ? parsed : undefined;
  }
  return undefined;
}

function resolveRangeParams(
  facet: FacetGroupData,
): readonly [startParam: string, endParam: string] {
  if (Array.isArray(facet.param) && facet.param.length >= 2) {
    const [first, second] = facet.param;
    if (first && second) return [first, second];
  }
  return ['year_start', 'year_end'];
}

function isRangeFacet(
  facetKey: string,
  facet: FacetGroupData,
  fieldConfig?: FacetFieldConfig,
): boolean {
  if (fieldConfig?.kind) return fieldConfig.kind === 'range';
  return Array.isArray(facet.param) || facetKey === 'year';
}

function getOrderedEntries(
  facets: FacetsMap,
  order?: readonly string[],
): Array<[string, FacetGroupData]> {
  const entries = Object.entries(facets);
  if (!order || order.length === 0) return entries;
  const orderMap = new Map(order.map((key, index) => [key, index]));
  return [...entries].sort(([keyA], [keyB]) => {
    const indexA = orderMap.get(keyA) ?? Number.MAX_SAFE_INTEGER;
    const indexB = orderMap.get(keyB) ?? Number.MAX_SAFE_INTEGER;
    return indexA - indexB;
  });
}

function YearRangeControl({
  startParam,
  endParam,
  startValue,
  endValue,
  minAvailable,
  maxAvailable,
  onApply,
}: {
  startParam: string;
  endParam: string;
  startValue?: number;
  endValue?: number;
  minAvailable?: number;
  maxAvailable?: number;
  onApply: (range: { start?: number; end?: number }) => void;
}) {
  const baseId = useId();
  const startId = `${baseId}-${startParam}`;
  const endId = `${baseId}-${endParam}`;

  const [startDraft, setStartDraft] = useState(
    startValue !== undefined ? String(startValue) : '',
  );
  const [endDraft, setEndDraft] = useState(
    endValue !== undefined ? String(endValue) : '',
  );

  const hasValue = startValue !== undefined || endValue !== undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    let parsedStart = readYearValue(startDraft);
    let parsedEnd = readYearValue(endDraft);
    if (
      parsedStart !== undefined &&
      parsedEnd !== undefined &&
      parsedStart > parsedEnd
    ) {
      [parsedStart, parsedEnd] = [parsedEnd, parsedStart];
    }
    setStartDraft(parsedStart !== undefined ? String(parsedStart) : '');
    setEndDraft(parsedEnd !== undefined ? String(parsedEnd) : '');
    onApply({ start: parsedStart, end: parsedEnd });
  }

  function handleClear() {
    setStartDraft('');
    setEndDraft('');
    onApply({ start: undefined, end: undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={startId}
            className="text-xs font-medium text-muted-foreground"
          >
            Ano inicial
          </label>
          <Input
            id={startId}
            type="number"
            inputMode="numeric"
            min={1000}
            max={9999}
            placeholder={
              minAvailable !== undefined ? String(minAvailable) : 'Ex.: 2015'
            }
            value={startDraft}
            onChange={(event) => setStartDraft(event.target.value)}
            className="h-9 tabular-nums"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor={endId}
            className="text-xs font-medium text-muted-foreground"
          >
            Ano final
          </label>
          <Input
            id={endId}
            type="number"
            inputMode="numeric"
            min={1000}
            max={9999}
            placeholder={
              maxAvailable !== undefined ? String(maxAvailable) : 'Ex.: 2026'
            }
            value={endDraft}
            onChange={(event) => setEndDraft(event.target.value)}
            className="h-9 tabular-nums"
          />
        </div>
      </div>

      {minAvailable !== undefined && maxAvailable !== undefined && (
        <p className="text-xs text-muted-foreground tabular-nums">
          Disponível: {minAvailable}–{maxAvailable}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" variant="secondary" className="flex-1">
          Aplicar
        </Button>
        {hasValue && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleClear}
            aria-label="Limpar período"
          >
            Limpar
          </Button>
        )}
      </div>
    </form>
  );
}

function CheckboxFacetList({
  facetKey,
  paramName,
  items,
  selectedValues,
  controlled,
  searchable,
  formatItemLabel,
  resolveDotClass,
  onToggle,
}: {
  facetKey: string;
  paramName: string;
  items: FacetOptionItem[];
  selectedValues: readonly string[];
  controlled: boolean;
  searchable?: boolean;
  formatItemLabel?: (item: FacetOptionItem) => string;
  resolveDotClass: (item: FacetOptionItem) => string | undefined;
  onToggle: (value: string) => void;
}) {
  const baseId = useId();
  const [filterText, setFilterText] = useState('');
  const selectedSet = new Set(selectedValues);

  const normalizedQuery = filterText.trim().toLowerCase();
  const visibleItems = normalizedQuery
    ? items.filter((item) => {
        const label = (formatItemLabel?.(item) ?? item.label).toLowerCase();
        const acronym = item.acronym?.toLowerCase() ?? '';
        return (
          label.includes(normalizedQuery) || acronym.includes(normalizedQuery)
        );
      })
    : items;

  const listContent = (
    <div className="flex flex-col gap-2.5">
      {visibleItems.map((item) => {
        const checkboxId = `${baseId}-${facetKey}-${paramName}-${item.value}`;
        const displayLabel = formatItemLabel?.(item) ?? item.label;
        const checked = controlled
          ? selectedSet.has(item.value)
          : Boolean(item.selected);
        const dotClass = resolveDotClass(item);

        return (
          <div key={item.value} className="flex items-center gap-2.5 text-sm">
            <Checkbox
              id={checkboxId}
              checked={checked}
              onCheckedChange={() => onToggle(item.value)}
            />
            {dotClass && <Dot className={dotClass} />}
            <label
              htmlFor={checkboxId}
              className="min-w-0 flex-1 cursor-pointer truncate"
              title={displayLabel}
            >
              {displayLabel}
            </label>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {NUMBER_FORMAT.format(item.count)}
            </span>
          </div>
        );
      })}
      {visibleItems.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhuma opção encontrada.
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {searchable && items.length > 5 && (
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            placeholder="Filtrar opções..."
            aria-label="Filtrar opções"
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}
      {visibleItems.length > SCROLL_THRESHOLD ? (
        <ScrollArea className="h-60 pr-2">{listContent}</ScrollArea>
      ) : (
        listContent
      )}
    </div>
  );
}

/**
 * Painel de filtros por facetas (`sc-filters`, DESIGN.md §7 / components.md):
 * renderiza qualquer mapa `FacetResult` da v2 usando `facet.param` e converte
 * facetas de intervalo (`year` → `year_start` / `year_end`) automaticamente.
 */
export function FacetPanel({
  facets,
  values,
  config,
  getDotClassName,
  order,
  defaultOpen,
  openSections,
  onOpenSectionsChange,
  onSearchChange,
  onFilterChange,
  onRangeChange,
  onClear,
  title = 'Filtros',
  hideHeader = false,
  loading = false,
  className,
}: FacetPanelProps) {
  const orderedEntries = facets ? getOrderedEntries(facets, order) : [];

  const visibleEntries = orderedEntries.filter(([key, facet]) => {
    const fieldConfig = config?.[key];
    if (isRangeFacet(key, facet, fieldConfig)) {
      const [startParam, endParam] = resolveRangeParams(facet);
      const hasRangeValue =
        readYearValue(values?.[startParam]) !== undefined ||
        readYearValue(values?.[endParam]) !== undefined;
      return facet.items.length > 0 || facet.total > 0 || hasRangeValue;
    }
    const paramName =
      typeof facet.param === 'string' && facet.param ? facet.param : key;
    const selectedCount = values
      ? readStringValues(values[paramName]).length
      : facet.items.filter((item) => item.selected).length;
    return facet.items.length > 0 || selectedCount > 0;
  });

  let activeFiltersCount = 0;
  for (const [key, facet] of visibleEntries) {
    const fieldConfig = config?.[key];
    if (isRangeFacet(key, facet, fieldConfig)) {
      const [startParam, endParam] = resolveRangeParams(facet);
      if (
        readYearValue(values?.[startParam]) !== undefined ||
        readYearValue(values?.[endParam]) !== undefined
      ) {
        activeFiltersCount += 1;
      }
    } else {
      const paramName =
        typeof facet.param === 'string' && facet.param ? facet.param : key;
      const selectedCount = values
        ? readStringValues(values[paramName]).length
        : facet.items.filter((item) => item.selected).length;
      activeFiltersCount += selectedCount;
    }
  }

  const computedDefaultOpen =
    defaultOpen !== undefined
      ? [...defaultOpen]
      : visibleEntries.reduce<string[]>((acc, [key, facet], index) => {
          const fieldConfig = config?.[key];
          if (isRangeFacet(key, facet, fieldConfig)) {
            const [startParam, endParam] = resolveRangeParams(facet);
            if (
              index === 0 ||
              readYearValue(values?.[startParam]) !== undefined ||
              readYearValue(values?.[endParam]) !== undefined
            ) {
              acc.push(key);
            }
          } else {
            const paramName =
              typeof facet.param === 'string' && facet.param
                ? facet.param
                : key;
            const hasSelection = values
              ? readStringValues(values[paramName]).length > 0
              : facet.items.some((item) => item.selected);
            if (index === 0 || hasSelection) {
              acc.push(key);
            }
          }
          return acc;
        }, []);

  function handleCheckboxToggle(
    paramName: string,
    value: string,
    selectedValues: readonly string[],
  ) {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    onFilterChange?.(paramName, next);
    onSearchChange?.({
      [paramName]: next.length > 0 ? next : undefined,
    });
  }

  function handleRangeApply(
    startParam: string,
    endParam: string,
    range: { start?: number; end?: number },
  ) {
    onRangeChange?.({
      startParam,
      endParam,
      start: range.start,
      end: range.end,
    });
    onSearchChange?.({
      [startParam]: range.start,
      [endParam]: range.end,
    });
  }

  return (
    <div data-slot="facet-panel" className={cn('flex flex-col', className)}>
      {!hideHeader && (
        <div className="flex items-center justify-between gap-2 pt-2 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <SlidersHorizontal className="size-5 shrink-0" aria-hidden />
            <span>{title}</span>
          </h2>
          {onClear && activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              aria-label="Limpar filtros"
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 aria-hidden />
              Limpar
            </Button>
          )}
        </div>
      )}

      {hideHeader && onClear && activeFiltersCount > 0 && (
        <div className="flex justify-end pb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="Limpar filtros"
          >
            <Trash2 aria-hidden />
            Limpar filtros ({activeFiltersCount})
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4 py-2" aria-busy="true">
          <span className="sr-only">Carregando filtros</span>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2 border-b pb-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : visibleEntries.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          Nenhum filtro disponível.
        </p>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={
            openSections === undefined ? computedDefaultOpen : undefined
          }
          value={openSections}
          onValueChange={onOpenSectionsChange}
        >
          {visibleEntries.map(([facetKey, facet]) => {
            const fieldConfig = config?.[facetKey];
            const sectionLabel =
              fieldConfig?.label ??
              DEFAULT_FACET_LABELS[facetKey] ??
              humanizeFacetKey(facetKey);
            const rangeMode = isRangeFacet(facetKey, facet, fieldConfig);

            if (rangeMode) {
              const [startParam, endParam] = resolveRangeParams(facet);
              const startValue = readYearValue(values?.[startParam]);
              const endValue = readYearValue(values?.[endParam]);
              const years = facet.items
                .map((item) => readYearValue(item.value))
                .filter((year): year is number => year !== undefined);
              const minAvailable =
                years.length > 0 ? Math.min(...years) : undefined;
              const maxAvailable =
                years.length > 0 ? Math.max(...years) : undefined;
              const hasActiveRange =
                startValue !== undefined || endValue !== undefined;

              return (
                <AccordionItem key={facetKey} value={facetKey}>
                  <AccordionTrigger>
                    <span className="min-w-0 flex-1 truncate">
                      {sectionLabel}
                    </span>
                    {hasActiveRange && (
                      <Tag className="h-5 px-2 text-[11px] font-semibold tabular-nums">
                        1
                      </Tag>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <YearRangeControl
                      key={`${startValue ?? ''}-${endValue ?? ''}`}
                      startParam={startParam}
                      endParam={endParam}
                      startValue={startValue}
                      endValue={endValue}
                      minAvailable={minAvailable}
                      maxAvailable={maxAvailable}
                      onApply={(range) =>
                        handleRangeApply(startParam, endParam, range)
                      }
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            }

            const paramName =
              typeof facet.param === 'string' && facet.param
                ? facet.param
                : facetKey;
            const selectedValues = values
              ? readStringValues(values[paramName])
              : facet.items
                  .filter((item) => item.selected)
                  .map((item) => item.value);

            return (
              <AccordionItem key={facetKey} value={facetKey}>
                <AccordionTrigger>
                  <span className="min-w-0 flex-1 truncate">
                    {sectionLabel}
                  </span>
                  {selectedValues.length > 0 && (
                    <Tag className="h-5 px-2 text-[11px] font-semibold tabular-nums">
                      {selectedValues.length}
                    </Tag>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <CheckboxFacetList
                    facetKey={facetKey}
                    paramName={paramName}
                    items={facet.items}
                    selectedValues={selectedValues}
                    controlled={values !== undefined}
                    searchable={fieldConfig?.searchable}
                    formatItemLabel={fieldConfig?.formatItemLabel}
                    resolveDotClass={(item) =>
                      fieldConfig?.dotClassName?.(item.value, item) ??
                      getDotClassName?.(facetKey, item.value, item)
                    }
                    onToggle={(value) =>
                      handleCheckboxToggle(paramName, value, selectedValues)
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

/**
 * Coluna lateral de 260px para desktop (`DESIGN.md` §6.2 Template D / `components.md`
 * `sc-filters`): visível a partir de `lg`, sticky e com rolagem própria.
 */
export function FacetSidebar({
  className,
  children,
  'aria-label': ariaLabel = 'Filtros',
  ...props
}: ComponentProps<'aside'>) {
  return (
    <aside
      data-slot="facet-sidebar"
      aria-label={ariaLabel}
      className={cn(
        'hidden w-[260px] shrink-0 border-r pr-4 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto',
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

/**
 * Gaveta lateral para mobile (`< lg`), composta com `Sheet` + `FacetPanel`.
 */
export function FacetSheet({
  open,
  onOpenChange,
  title = 'Filtros',
  description = 'Refine os resultados selecionando os filtros abaixo.',
  ...panelProps
}: FacetPanelProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
            {title}
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4 py-2">
          <FacetPanel {...panelProps} hideHeader />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
