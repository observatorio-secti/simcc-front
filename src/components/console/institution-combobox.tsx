import React, { useState } from 'react';
import { Check, ChevronsUpDown, Landmark, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Badge } from '../ui/badge';
import { useInstitutions } from '../../hooks/use-academic';
import { InstitutionPublic } from '../../types/academic';

interface InstitutionComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  excludeIds?: string[];
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

export function InstitutionCombobox({
  value,
  onChange,
  excludeIds = [],
  placeholder = 'Selecione uma instituição...',
  allowClear = true,
  className = '',
}: InstitutionComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Busca lista de instituições (limite de 100 para autocomplete)
  const { data: institutionsData, isLoading } = useInstitutions({
    q: search || undefined,
    per_page: 50,
  });

  const institutions: InstitutionPublic[] = institutionsData?.data || [];
  const availableInstitutions = institutions.filter(
    (inst) => !excludeIds.includes(inst.id),
  );

  const selectedInst = institutions.find((inst) => inst.id === value);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-sans text-xs h-9 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-normal px-3"
          >
            {selectedInst ? (
              <span className="flex items-center gap-2 truncate">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] px-1.5 py-0 border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                >
                  {selectedInst.acronym}
                </Badge>
                <span className="truncate text-neutral-900 dark:text-neutral-100">
                  {selectedInst.name}
                </span>
              </span>
            ) : (
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5" />
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por sigla ou nome..."
              value={search}
              onValueChange={setSearch}
              className="text-xs h-9"
            />
            <CommandList className="max-h-60 overflow-auto">
              {isLoading && (
                <div className="p-3 text-xs text-center text-neutral-400">
                  Carregando instituições...
                </div>
              )}
              {!isLoading && availableInstitutions.length === 0 && (
                <CommandEmpty className="p-3 text-xs text-center text-neutral-500">
                  Nenhuma instituição encontrada.
                </CommandEmpty>
              )}
              <CommandGroup>
                {availableInstitutions.map((inst) => (
                  <CommandItem
                    key={inst.id}
                    value={inst.id}
                    onSelect={() => {
                      onChange(inst.id === value ? '' : inst.id);
                      setOpen(false);
                    }}
                    className="text-xs flex items-center justify-between cursor-pointer py-2 px-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] px-1.5 py-0 border-neutral-300 dark:border-neutral-700"
                      >
                        {inst.acronym}
                      </Badge>
                      <span className="truncate">{inst.name}</span>
                    </div>
                    {value === inst.id && (
                      <Check className="h-4 w-4 text-[#559FB8] shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {allowClear && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="h-9 w-9 p-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shrink-0"
          title="Limpar filtro"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

interface MultiInstitutionSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function MultiInstitutionSelect({
  selectedIds,
  onChange,
  excludeIds = [],
  placeholder = 'Vincular instituições...',
}: MultiInstitutionSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: institutionsData, isLoading } = useInstitutions({
    q: search || undefined,
    per_page: 50,
  });

  const institutions: InstitutionPublic[] = institutionsData?.data || [];
  const availableInstitutions = institutions.filter(
    (inst) => !excludeIds.includes(inst.id),
  );

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-sans text-xs h-9 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-normal px-3"
          >
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5" />
              {placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar instituição..."
              value={search}
              onValueChange={setSearch}
              className="text-xs h-9"
            />
            <CommandList className="max-h-60 overflow-auto">
              {isLoading && (
                <div className="p-3 text-xs text-center text-neutral-400">
                  Carregando...
                </div>
              )}
              {!isLoading && availableInstitutions.length === 0 && (
                <CommandEmpty className="p-3 text-xs text-center text-neutral-500">
                  Nenhuma instituição encontrada.
                </CommandEmpty>
              )}
              <CommandGroup>
                {availableInstitutions.map((inst) => {
                  const isSelected = selectedIds.includes(inst.id);
                  return (
                    <CommandItem
                      key={inst.id}
                      value={inst.id}
                      onSelect={() => handleToggle(inst.id)}
                      className="text-xs flex items-center justify-between cursor-pointer py-2 px-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] px-1.5 py-0"
                        >
                          {inst.acronym}
                        </Badge>
                        <span className="truncate">{inst.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-[#559FB8] shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Chips das instituições selecionadas */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedIds.map((id) => {
            const inst = institutions.find((i) => i.id === id);
            return (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1.5 text-xs font-sans pl-2.5 pr-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
              >
                <span className="font-mono font-bold text-[#07677e] dark:text-[#559FB8]">
                  {inst?.acronym || 'ID'}
                </span>
                <span className="max-w-[120px] truncate text-[11px]">
                  {inst?.name || id}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
