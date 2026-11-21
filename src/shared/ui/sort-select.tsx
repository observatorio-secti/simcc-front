import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export type SortDirection = 'asc' | 'desc';

/** Opção de ordenação compatível com `sort_by` e `sort_order` da API v2. */
export interface SortOption<TBy extends string = string> {
  value: TBy;
  label: string;
  defaultOrder?: SortDirection;
  disabled?: boolean;
}

export interface SortSelection<TBy extends string = string> {
  sort_by: TBy;
  sort_order?: SortDirection;
}

export interface SortSelectProps<TBy extends string = string> {
  options: readonly SortOption<TBy>[];
  value?: TBy;
  order?: SortDirection;
  /** Dispara atualização dos parâmetros de ordenação na URL. */
  onChange: (next: SortSelection<TBy>) => void;
  /** Exibe botão para inverter `asc` / `desc` ao lado do seletor. */
  showOrderToggle?: boolean;
  size?: 'sm' | 'default';
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Seletor de ordenação do kit (`Select` + alternância opcional de direção
 * `asc`/`desc`), pronto para plugar nos search params da listagem.
 */
export function SortSelect<TBy extends string = string>({
  options,
  value,
  order,
  onChange,
  showOrderToggle = false,
  size = 'sm',
  placeholder = 'Ordenar por',
  label = 'Ordenar por',
  disabled = false,
  className,
}: SortSelectProps<TBy>) {
  const activeOption = options.find((option) => option.value === value);
  const currentOrder = order ?? activeOption?.defaultOrder;

  function handleSelectChange(nextBy: string) {
    const chosen = options.find((option) => option.value === nextBy);
    if (!chosen) return;
    onChange({
      sort_by: chosen.value,
      sort_order: chosen.defaultOrder ?? order,
    });
  }

  function handleToggleOrder() {
    if (!value) return;
    const nextOrder: SortDirection = currentOrder === 'asc' ? 'desc' : 'asc';
    onChange({
      sort_by: value,
      sort_order: nextOrder,
    });
  }

  const OrderIcon =
    currentOrder === 'asc'
      ? ArrowUp
      : currentOrder === 'desc'
        ? ArrowDown
        : ArrowUpDown;

  const toggleLabel =
    currentOrder === 'asc'
      ? 'Ordem crescente — alternar para decrescente'
      : 'Ordem decrescente — alternar para crescente';

  return (
    <div
      data-slot="sort-select"
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      <Select
        value={value}
        onValueChange={handleSelectChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger
          size={size}
          aria-label={label}
          className="min-w-40 justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <ArrowUpDown
              aria-hidden
              className="size-3.5 shrink-0 text-muted-foreground"
            />
            <SelectValue placeholder={placeholder} />
          </span>
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showOrderToggle && value && (
        <Button
          type="button"
          variant="outline"
          size={size === 'sm' ? 'icon-sm' : 'icon'}
          disabled={disabled}
          onClick={handleToggleOrder}
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          <OrderIcon aria-hidden />
        </Button>
      )}
    </div>
  );
}
