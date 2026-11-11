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
            className="w-full justify-between font-sans text-xs h-9 border-sm-wave-gray bg-white rounded-sm font-normal px-3 text-sm-navy"
          >
            {selectedInst ? (
              <span className="flex items-center gap-2 truncate">
                <span className="sm-tag font-mono text-[10px] py-0 px-1.5">
                  {selectedInst.acronym}
                </span>
                <span className="truncate text-sm-navy font-semibold">
                  {selectedInst.name}
                </span>
              </span>
            ) : (
              <span className="text-sm-navy-600 flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5" />
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 border-sm-wave-gray bg-white shadow-none rounded-sm" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por sigla ou nome..."
              value={search}
              onValueChange={setSearch}
              className="text-xs h-9"
            />
            <CommandList className="max-h-60 overflow-auto">
              {isLoading && (
                <div className="p-3 text-xs text-center text-sm-navy-600">
                  Carregando instituições...
                </div>
              )}
              {!isLoading && availableInstitutions.length === 0 && (
                <CommandEmpty className="p-3 text-xs text-center text-sm-navy-600">
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
                    className="text-xs flex items-center justify-between cursor-pointer py-2 px-2.5 hover:bg-sm-wash"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="sm-tag font-mono text-[10px] py-0 px-1.5">
                        {inst.acronym}
                      </span>
                      <span className="truncate text-sm-navy font-medium">{inst.name}</span>
                    </div>
                    {value === inst.id && (
                      <Check className="h-4 w-4 text-sm-navy shrink-0" />
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
          className="h-9 w-9 p-0 text-sm-navy-600 hover:text-sm-navy shrink-0"
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
            className="w-full justify-between font-sans text-xs h-9 border-sm-wave-gray bg-white rounded-sm font-normal px-3 text-sm-navy"
          >
            <span className="text-sm-navy-600 flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5" />
              {placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0 border-sm-wave-gray bg-white shadow-none rounded-sm" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar instituição..."
              value={search}
              onValueChange={setSearch}
              className="text-xs h-9"
            />
            <CommandList className="max-h-60 overflow-auto">
              {isLoading && (
                <div className="p-3 text-xs text-center text-sm-navy-600">
                  Carregando...
                </div>
              )}
              {!isLoading && availableInstitutions.length === 0 && (
                <CommandEmpty className="p-3 text-xs text-center text-sm-navy-600">
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
                      className="text-xs flex items-center justify-between cursor-pointer py-2 px-2.5 hover:bg-sm-wash"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="sm-tag font-mono text-[10px] py-0 px-1.5">
                          {inst.acronym}
                        </span>
                        <span className="truncate text-sm-navy font-medium">{inst.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-sm-navy shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tags das instituições selecionadas */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedIds.map((id) => {
            const inst = institutions.find((i) => i.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 text-xs font-sans pl-2 pr-1 py-0.5 rounded border border-sm-wave-gray bg-sm-wash text-sm-navy"
              >
                <b className="font-mono text-[11px]">{inst?.acronym || 'ID'}</b>
                <span className="max-w-[120px] truncate text-[11px]">
                  {inst?.name || id}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="rounded hover:bg-sm-wave-gray p-0.5 text-sm-navy-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
