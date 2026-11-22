import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import type {
  AcademicCollection,
  AcademicInstitution,
  AcademicResearcher,
} from '@/entities/academic/model';
import {
  academicCollectionsQueryOptions,
  academicInstitutionsQueryOptions,
  academicResearchersQueryOptions,
} from '@/entities/academic/queries';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

export interface ComboboxOption {
  id: string;
  label: string;
  secondary?: string;
}

function institutionOption(inst: AcademicInstitution): ComboboxOption {
  return {
    id: inst.id,
    label: `${inst.acronym} — ${inst.name}`,
    secondary: inst.acronym,
  };
}

function collectionOption(col: AcademicCollection): ComboboxOption {
  return {
    id: col.id,
    label: col.name,
    secondary: col.slug,
  };
}

function researcherOption(res: AcademicResearcher): ComboboxOption {
  return {
    id: res.id,
    label: res.name,
    secondary: res.lattes_id,
  };
}

function RemoteSingleCombobox({
  id,
  value,
  selectedLabel,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  isLoading,
  search,
  onSearchChange,
  onSelect,
  allowClear = true,
  disabled = false,
  className,
}: {
  id?: string;
  value?: string;
  selectedLabel?: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  options: ComboboxOption[];
  isLoading: boolean;
  search: string;
  onSearchChange: (q: string) => void;
  onSelect: (option: ComboboxOption | null) => void;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const resolvedLabel = useMemo(() => {
    if (!value) return undefined;
    const found = options.find((opt) => opt.id === value);
    return found?.label ?? selectedLabel ?? value;
  }, [value, options, selectedLabel]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{resolvedLabel ?? placeholder}</span>
          <ChevronsUpDown
            className="ml-2 size-4 shrink-0 opacity-50"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-64 p-2">
        <div className="flex items-center gap-2 border-b pb-2">
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="mt-2 max-h-56 overflow-y-auto">
          {allowClear && value && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="size-3.5" aria-hidden />
              Limpar seleção
            </button>
          )}
          {isLoading ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Carregando...
            </p>
          ) : options.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </p>
          ) : (
            options.map((option) => {
              const selected = option.id === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                    selected && 'bg-accent/50 font-medium',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && (
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RemoteMultiCombobox({
  id,
  selected,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  isLoading,
  search,
  onSearchChange,
  onChange,
  disabled = false,
}: {
  id?: string;
  selected: ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  options: ComboboxOption[];
  isLoading: boolean;
  search: string;
  onSearchChange: (q: string) => void;
  onChange: (next: ComboboxOption[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.id)),
    [selected],
  );

  function toggle(option: ComboboxOption) {
    if (selectedIds.has(option.id)) {
      onChange(selected.filter((item) => item.id !== option.id));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal text-muted-foreground"
          >
            <span className="truncate">
              {selected.length > 0
                ? `${selected.length} selecionado(s)`
                : placeholder}
            </span>
            <ChevronsUpDown
              className="ml-2 size-4 shrink-0 opacity-50"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-64 p-2">
          <div className="flex items-center gap-2 border-b pb-2">
            <Search
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="mt-2 max-h-56 overflow-y-auto">
            {isLoading ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Carregando...
              </p>
            ) : options.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              options.map((option) => {
                const isSelected = selectedIds.has(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggle(option)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent/50 font-medium',
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check
                        className="size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge
              key={item.id}
              variant="outline"
              size="sm"
              className="gap-1 pr-1"
            >
              <span className="max-w-48 truncate">
                {item.secondary ?? item.label}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(selected.filter((entry) => entry.id !== item.id))
                }
                aria-label={`Remover ${item.label}`}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function InstitutionCombobox({
  id,
  value,
  selectedLabel,
  placeholder = 'Todas as instituições',
  onChange,
  allowClear = true,
  disabled = false,
  excludeIds,
  className,
}: {
  id?: string;
  value?: string;
  selectedLabel?: string;
  placeholder?: string;
  onChange: (institutionId: string | undefined) => void;
  allowClear?: boolean;
  disabled?: boolean;
  excludeIds?: ReadonlySet<string>;
  className?: string;
}) {
  const [search, setSearch] = useState('');
  const query = useQuery(
    academicInstitutionsQueryOptions({
      q: search.trim() || undefined,
      per_page: 50,
      sort_by: 'name',
      sort_order: 'asc',
    }),
  );

  const options = useMemo(() => {
    const list = query.data?.data ?? [];
    return list
      .filter((inst) => !excludeIds?.has(inst.id))
      .map(institutionOption);
  }, [query.data, excludeIds]);

  return (
    <RemoteSingleCombobox
      id={id}
      value={value}
      selectedLabel={selectedLabel}
      placeholder={placeholder}
      searchPlaceholder="Buscar instituição por sigla ou nome"
      emptyText="Nenhuma instituição encontrada"
      options={options}
      isLoading={query.isPending}
      search={search}
      onSearchChange={setSearch}
      onSelect={(option) => onChange(option?.id)}
      allowClear={allowClear}
      disabled={disabled}
      className={className}
    />
  );
}

export function MultiInstitutionSelect({
  id,
  selected,
  onChange,
  disabled = false,
}: {
  id?: string;
  selected: ComboboxOption[];
  onChange: (next: ComboboxOption[]) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState('');
  const query = useQuery(
    academicInstitutionsQueryOptions({
      q: search.trim() || undefined,
      per_page: 50,
      sort_by: 'name',
      sort_order: 'asc',
    }),
  );

  const options = useMemo(
    () => (query.data?.data ?? []).map(institutionOption),
    [query.data],
  );

  return (
    <RemoteMultiCombobox
      id={id}
      selected={selected}
      placeholder="Selecionar instituições"
      searchPlaceholder="Buscar instituição por sigla ou nome"
      emptyText="Nenhuma instituição encontrada"
      options={options}
      isLoading={query.isPending}
      search={search}
      onSearchChange={setSearch}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

export function CollectionCombobox({
  id,
  value,
  selectedLabel,
  placeholder = 'Todas as coleções',
  onChange,
  allowClear = true,
  disabled = false,
  excludeIds,
  className,
}: {
  id?: string;
  value?: string;
  selectedLabel?: string;
  placeholder?: string;
  onChange: (collectionId: string | undefined) => void;
  allowClear?: boolean;
  disabled?: boolean;
  excludeIds?: ReadonlySet<string>;
  className?: string;
}) {
  const [search, setSearch] = useState('');
  const query = useQuery(
    academicCollectionsQueryOptions({
      q: search.trim() || undefined,
      per_page: 50,
      sort_by: 'name',
      sort_order: 'asc',
    }),
  );

  const options = useMemo(() => {
    const list = query.data?.data ?? [];
    return list.filter((col) => !excludeIds?.has(col.id)).map(collectionOption);
  }, [query.data, excludeIds]);

  return (
    <RemoteSingleCombobox
      id={id}
      value={value}
      selectedLabel={selectedLabel}
      placeholder={placeholder}
      searchPlaceholder="Buscar coleção por nome ou slug"
      emptyText="Nenhuma coleção encontrada"
      options={options}
      isLoading={query.isPending}
      search={search}
      onSearchChange={setSearch}
      onSelect={(option) => onChange(option?.id)}
      allowClear={allowClear}
      disabled={disabled}
      className={className}
    />
  );
}

export function MultiCollectionSelect({
  id,
  selected,
  onChange,
  disabled = false,
}: {
  id?: string;
  selected: ComboboxOption[];
  onChange: (next: ComboboxOption[]) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState('');
  const query = useQuery(
    academicCollectionsQueryOptions({
      q: search.trim() || undefined,
      per_page: 50,
      sort_by: 'name',
      sort_order: 'asc',
    }),
  );

  const options = useMemo(
    () => (query.data?.data ?? []).map(collectionOption),
    [query.data],
  );

  return (
    <RemoteMultiCombobox
      id={id}
      selected={selected}
      placeholder="Selecionar coleções"
      searchPlaceholder="Buscar coleção por nome ou slug"
      emptyText="Nenhuma coleção encontrada"
      options={options}
      isLoading={query.isPending}
      search={search}
      onSearchChange={setSearch}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

export function ResearcherCombobox({
  id,
  value,
  placeholder = 'Selecionar pesquisador',
  onChange,
  disabled = false,
  excludeInstitutionId,
}: {
  id?: string;
  value?: string;
  placeholder?: string;
  onChange: (researcherId: string | undefined) => void;
  disabled?: boolean;
  excludeInstitutionId?: string;
}) {
  const [search, setSearch] = useState('');
  const query = useQuery(
    academicResearchersQueryOptions({
      q: search.trim() || undefined,
      per_page: 50,
      sort_by: 'name',
      sort_order: 'asc',
    }),
  );

  const options = useMemo(() => {
    const list = query.data?.data ?? [];
    return list
      .filter((res) =>
        excludeInstitutionId
          ? !(res.affiliations ?? []).some(
              (aff) => aff.institution.id === excludeInstitutionId,
            )
          : true,
      )
      .map(researcherOption);
  }, [query.data, excludeInstitutionId]);

  return (
    <RemoteSingleCombobox
      id={id}
      value={value}
      placeholder={placeholder}
      searchPlaceholder="Buscar pesquisador por nome ou Lattes ID"
      emptyText="Nenhum pesquisador disponível"
      options={options}
      isLoading={query.isPending}
      search={search}
      onSearchChange={setSearch}
      onSelect={(option) => onChange(option?.id)}
      disabled={disabled}
    />
  );
}
