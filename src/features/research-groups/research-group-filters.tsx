import { useId, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import {
  researchGroupAreasQueryOptions,
  researchGroupInstitutionsQueryOptions,
  researchGroupStatesQueryOptions,
} from '@/entities/research-group/queries';
import { cn } from '@/shared/lib/cn';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  GROUP_STATUS_VALUES,
  researchGroupsSearch,
  type GroupStatusFilterValue,
  type ResearchGroupsSearch,
} from './search';

interface FilterOption {
  value: string;
  label: string;
}

const STATUS_LABELS: Record<GroupStatusFilterValue, string> = {
  CERTIFICADO: 'Certificado',
  EM_PREENCHIMENTO: 'Em preenchimento',
  AGUARDANDO_CERTIFICACAO: 'Aguardando certificação',
  EM_ANALISE: 'Em análise',
  INATIVO: 'Inativo',
  EXCLUIDO: 'Excluído',
};

const STATUS_OPTIONS: readonly FilterOption[] = GROUP_STATUS_VALUES.map(
  (value) => ({
    value,
    label: STATUS_LABELS[value],
  }),
);

function SingleSelectFilterSection({
  sectionKey,
  title,
  options,
  selected,
  onSelect,
  searchable = false,
  searchPlaceholder = 'Filtrar opções',
  loading = false,
}: {
  sectionKey: string;
  title: string;
  options: readonly FilterOption[];
  selected?: string;
  onSelect: (value: string | undefined) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
}) {
  const [filterText, setFilterText] = useState('');
  const searchId = useId();
  const normalizedFilter = filterText.trim().toLowerCase();
  const visibleOptions = normalizedFilter
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(normalizedFilter),
      )
    : options;

  return (
    <AccordionItem value={sectionKey}>
      <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-0 break-words">{title}</span>
          {selected && (
            <span className="rounded-full bg-eng-blue px-1.5 text-[10px] leading-4 font-bold text-white">
              1
            </span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        {loading && options.length === 0 ? (
          <div className="flex flex-col gap-2 py-1">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {searchable && options.length > 6 && (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id={searchId}
                  type="search"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            )}

            {visibleOptions.length === 0 ? (
              <p className="py-1 text-xs text-muted-foreground">
                Nenhuma opção encontrada.
              </p>
            ) : (
              <ScrollArea className={visibleOptions.length > 7 ? 'h-48' : ''}>
                <div className="flex flex-col gap-1.5 pr-2">
                  {visibleOptions.map((option) => {
                    const isChecked = selected === option.value;
                    const optionId = `${sectionKey}-${option.value}`;
                    return (
                      <label
                        key={option.value}
                        htmlFor={optionId}
                        className="flex cursor-pointer items-start gap-2 rounded-sm py-0.5 text-xs leading-snug text-foreground hover:text-eng-blue"
                      >
                        <Checkbox
                          id={optionId}
                          checked={isChecked}
                          onCheckedChange={() =>
                            onSelect(isChecked ? undefined : option.value)
                          }
                          className="mt-0.5 shrink-0"
                        />
                        <span className="min-w-0 flex-1 break-words">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function CityFilterSection({
  value,
  onApply,
}: {
  value?: string;
  onApply: (next: string | undefined) => void;
}) {
  const [prevValue, setPrevValue] = useState(value);
  const [input, setInput] = useState(value ?? '');

  if (prevValue !== value) {
    setPrevValue(value);
    setInput(value ?? '');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    onApply(trimmed.length > 0 ? trimmed : undefined);
  }

  return (
    <AccordionItem value="cidade">
      <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
        <span className="flex items-center gap-2">
          <span>Cidade</span>
          {value && (
            <span className="rounded-full bg-eng-blue px-1.5 text-[10px] leading-4 font-bold text-white">
              1
            </span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex.: Salvador"
            aria-label="Filtrar por cidade"
            className="h-8 flex-1 text-xs"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => {
                setInput('');
                onApply(undefined);
              }}
              aria-label="Limpar cidade"
            >
              <X className="size-3.5" aria-hidden />
            </Button>
          )}
          <Button type="submit" size="sm" variant="outline" className="h-8">
            Aplicar
          </Button>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
}

function YearFilterSection({
  value,
  onApply,
}: {
  value?: number;
  onApply: (next: number | undefined) => void;
}) {
  const [prevValue, setPrevValue] = useState(value);
  const [input, setInput] = useState(value !== undefined ? String(value) : '');

  if (prevValue !== value) {
    setPrevValue(value);
    setInput(value !== undefined ? String(value) : '');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      onApply(undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isInteger(parsed) && parsed >= 1900 && parsed <= 2100) {
      onApply(parsed);
    }
  }

  return (
    <AccordionItem value="ano">
      <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
        <span className="flex items-center gap-2">
          <span>Ano de formação</span>
          {value !== undefined && (
            <span className="rounded-full bg-eng-blue px-1.5 text-[10px] leading-4 font-bold text-white">
              1
            </span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <Input
            type="number"
            min={1900}
            max={2100}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex.: 2019"
            aria-label="Filtrar por ano de formação"
            className="h-8 flex-1 text-xs"
          />
          {value !== undefined && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => {
                setInput('');
                onApply(undefined);
              }}
              aria-label="Limpar ano de formação"
            >
              <X className="size-3.5" aria-hidden />
            </Button>
          )}
          <Button type="submit" size="sm" variant="outline" className="h-8">
            Aplicar
          </Button>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
}

export interface ResearchGroupFiltersProps {
  search: ResearchGroupsSearch;
  onUpdateSearch: (
    patch: Partial<ResearchGroupsSearch> | Record<string, unknown>,
    options?: { resetPage?: boolean },
  ) => void;
  onClearFilters: () => void;
  hideHeader?: boolean;
  className?: string;
}

/**
 * Painel lateral de filtros para grupos de pesquisa (API ODA).
 * Usa seleção única por critério (alinhado ao contrato da ODA).
 */
export function ResearchGroupFilters({
  search,
  onUpdateSearch,
  onClearFilters,
  hideHeader = false,
  className,
}: ResearchGroupFiltersProps) {
  const statesQuery = useQuery(researchGroupStatesQueryOptions());
  const areasQuery = useQuery(researchGroupAreasQueryOptions());
  const institutionsQuery = useQuery(
    researchGroupInstitutionsQueryOptions(search.uf ? { uf: search.uf } : {}),
  );

  const activeFiltersCount = researchGroupsSearch.countActiveFilters(search);

  const areaOptions: FilterOption[] = (areasQuery.data ?? []).map((area) => ({
    value: area.id,
    label: area.name,
  }));

  const stateOptions: FilterOption[] = (statesQuery.data ?? []).map(
    (state) => ({
      value: state.acronym,
      label: `${state.acronym} — ${state.name}`,
    }),
  );

  const institutionOptions: FilterOption[] = (institutionsQuery.data ?? []).map(
    (inst) => ({
      value: inst.id,
      label: inst.label,
    }),
  );

  return (
    <div
      data-slot="research-group-filters"
      className={cn('flex flex-col', className)}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between gap-2 pt-2 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <SlidersHorizontal className="size-5 shrink-0" aria-hidden />
            <span>Filtros</span>
          </h2>
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              aria-label="Limpar filtros"
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 aria-hidden />
              Limpar
            </Button>
          )}
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={['area', 'uf', 'situacao']}
        className="w-full"
      >
        <SingleSelectFilterSection
          sectionKey="area"
          title="Área do conhecimento"
          options={areaOptions}
          selected={search.area}
          onSelect={(area) => onUpdateSearch({ area })}
          searchable
          searchPlaceholder="Filtrar área"
          loading={areasQuery.isPending}
        />

        <SingleSelectFilterSection
          sectionKey="uf"
          title="Estado (UF)"
          options={stateOptions}
          selected={search.uf}
          onSelect={(uf) => onUpdateSearch({ uf })}
          searchable
          searchPlaceholder="Filtrar estado"
          loading={statesQuery.isPending}
        />

        <SingleSelectFilterSection
          sectionKey="instituicao"
          title="Instituição"
          options={institutionOptions}
          selected={search.instituicao}
          onSelect={(instituicao) => onUpdateSearch({ instituicao })}
          searchable
          searchPlaceholder="Filtrar instituição"
          loading={institutionsQuery.isPending}
        />

        <SingleSelectFilterSection
          sectionKey="situacao"
          title="Situação"
          options={STATUS_OPTIONS}
          selected={search.situacao}
          onSelect={(situacao) => onUpdateSearch({ situacao })}
        />

        <CityFilterSection
          value={search.cidade}
          onApply={(cidade) => onUpdateSearch({ cidade })}
        />

        <YearFilterSection
          value={search.ano}
          onApply={(ano) => onUpdateSearch({ ano })}
        />
      </Accordion>
    </div>
  );
}

/** Gaveta lateral de filtros para mobile (`< lg`). */
export function ResearchGroupFilterSheet({
  open,
  onOpenChange,
  ...panelProps
}: ResearchGroupFiltersProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const activeFiltersCount = researchGroupsSearch.countActiveFilters(
    panelProps.search,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-80 flex-col gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between gap-2 pr-6">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
              Filtros
            </SheetTitle>
            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={panelProps.onClearFilters}
                aria-label="Limpar filtros"
              >
                <Trash2 aria-hidden />
                Limpar
              </Button>
            )}
          </div>
          <SheetDescription className="sr-only">
            Filtros de pesquisa para grupos de pesquisa
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-5 py-3">
          <ResearchGroupFilters {...panelProps} hideHeader />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
