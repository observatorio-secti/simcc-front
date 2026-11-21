import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Search, Trash2, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { searchTypeColor } from '@/shared/lib/design-tokens';
import { Button } from '@/shared/ui/button';
import { focusRing } from '@/shared/ui/focus-ring';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  buildBuscaHref,
  SEARCH_TYPE_GROUPS,
  searchTypeBgClass,
  searchTypeLabel,
  suggestionSourceTypesFor,
  type SearchType,
} from './search-schema';
import { suggestionsQueryOptions } from './suggestions-query';

const MIN_SUGGESTION_LENGTH = 2;
const SUGGESTION_LIMIT = 8;
const DEBOUNCE_MS = 200;
const numberFormat = new Intl.NumberFormat('pt-BR');

export interface SearchBarProps {
  /** Termo ativo vindo da URL (chip exibido na barra, útil na T2). */
  initialQuery?: string;
  /** Tipo de busca inicial vindo da URL. */
  initialType?: SearchType;
  /** Modo compacto usado na barra fixa de resultados (T2). */
  compact?: boolean;
  /** Notifica mudança no seletor de tipo de busca. */
  onTypeChange?: (type: SearchType) => void;
  /** Sobrescreve a navegação padrão para `/busca` ao submeter. */
  onSearchSubmit?: (payload: { q: string; type: SearchType }) => void;
  /** Chamado ao limpar o termo ativo e o campo. */
  onClear?: () => void;
  className?: string;
}

function TypeSwatch({ type }: { type: SearchType }) {
  return (
    <span
      aria-hidden
      className={cn('size-3.5 shrink-0 rounded-[2px]', searchTypeBgClass(type))}
    />
  );
}

export function SearchBar({
  initialQuery = '',
  initialType = 'profile',
  compact = false,
  onTypeChange,
  onSearchSubmit,
  onClear,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<SearchType>(initialType);
  const [prevInitialType, setPrevInitialType] =
    useState<SearchType>(initialType);
  const [activeTerm, setActiveTerm] = useState<string>(initialQuery.trim());
  const [prevInitialQuery, setPrevInitialQuery] = useState<string>(
    initialQuery.trim(),
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  if (prevInitialType !== initialType) {
    setPrevInitialType(initialType);
    setType(initialType);
  }

  const normalizedInitialQuery = initialQuery.trim();
  if (prevInitialQuery !== normalizedInitialQuery) {
    setPrevInitialQuery(normalizedInitialQuery);
    setActiveTerm(normalizedInitialQuery);
  }

  const trimmedInput = inputValue.trim();
  const canSuggest = trimmedInput.length >= MIN_SUGGESTION_LENGTH;

  useEffect(() => {
    if (!canSuggest) return;
    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmedInput);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [canSuggest, trimmedInput]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const effectiveQuery = canSuggest ? debouncedQuery : '';
  const sourceTypes = suggestionSourceTypesFor(type);
  const suggestionQuery = useQuery({
    ...suggestionsQueryOptions({
      q: effectiveQuery,
      ...(sourceTypes ? { source_type: sourceTypes } : {}),
      limit: SUGGESTION_LIMIT,
    }),
    enabled: effectiveQuery.length >= MIN_SUGGESTION_LENGTH,
  });

  const suggestions = suggestionQuery.data?.data ?? [];
  const showSuggestions =
    dropdownOpen &&
    inputValue.trim().length >= MIN_SUGGESTION_LENGTH &&
    suggestions.length > 0;

  function submitTerm(rawTerm: string, nextType: SearchType = type) {
    const trimmed = rawTerm.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setDropdownOpen(false);
    setActiveIndex(-1);
    if (onSearchSubmit) {
      onSearchSubmit({ q: trimmed, type: nextType });
      return;
    }
    void router.navigate({
      href: buildBuscaHref({ q: trimmed, type: nextType }),
    });
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
      const selected = suggestions[activeIndex].term;
      setInputValue(selected);
      submitTerm(selected);
      return;
    }
    submitTerm(inputValue || activeTerm);
  }

  function handleTypeSelect(nextValue: string) {
    const nextType = nextValue as SearchType;
    setType(nextType);
    setActiveIndex(-1);
    onTypeChange?.(nextType);
  }

  function handleClear() {
    setInputValue('');
    setDebouncedQuery('');
    setActiveTerm('');
    setDropdownOpen(false);
    setActiveIndex(-1);
    onClear?.();
    inputRef.current?.focus();
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setDropdownOpen(false);
      setActiveIndex(-1);
    }
  }

  const hasContent = inputValue.length > 0 || activeTerm.length > 0;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form
        role="search"
        onSubmit={handleFormSubmit}
        className="flex min-h-14 flex-wrap items-center gap-2 rounded-lg border bg-card p-2 md:flex-nowrap"
      >
        <div className="w-full shrink-0 md:w-auto">
          <Select value={type} onValueChange={handleTypeSelect}>
            <SelectTrigger
              aria-label="Tipo de busca"
              className="h-10 w-full gap-2 whitespace-nowrap md:w-auto"
            >
              <SelectValue>
                <span className="flex items-center gap-2">
                  <TypeSwatch type={type} />
                  <span>{searchTypeLabel(type)}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SEARCH_TYPE_GROUPS.primary.map((item) => (
                <SelectItem key={item} value={item}>
                  <span className="flex items-center gap-2.5">
                    <TypeSwatch type={item} />
                    <span>{searchTypeLabel(item)}</span>
                  </span>
                </SelectItem>
              ))}
              <SelectSeparator />
              {SEARCH_TYPE_GROUPS.secondary.map((item) => (
                <SelectItem key={item} value={item}>
                  <span className="flex items-center gap-2.5">
                    <TypeSwatch type={item} />
                    <span>{searchTypeLabel(item)}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {activeTerm && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-md text-xs font-medium text-white capitalize',
                compact ? 'h-7 px-2.5' : 'h-10 px-4',
                searchTypeBgClass(type),
              )}
            >
              <span className="max-w-40 truncate">{activeTerm}</span>
              <button
                type="button"
                onClick={handleClear}
                aria-label={`Remover termo ${activeTerm}`}
                className={cn(
                  'rounded-xs p-0.5 text-white/90 hover:bg-black/15 hover:text-white',
                  focusRing,
                )}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          )}

          <Input
            ref={inputRef}
            type="search"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              setDropdownOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setDropdownOpen(true)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar..."
            aria-label="Buscar"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? listboxId : undefined}
            aria-activedescendant={
              showSuggestions && activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
          />

          {hasContent && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              aria-label="Limpar busca"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          )}

          <Button
            type="submit"
            size="icon"
            aria-label="Pesquisar"
            className={cn(
              'shrink-0 text-white hover:opacity-90',
              searchTypeBgClass(type),
            )}
          >
            <Search className="size-4" aria-hidden />
          </Button>
        </div>
      </form>

      {showSuggestions && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Sugestões de termos"
          className="absolute right-0 left-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {suggestions.map((suggestion, index) => {
            const isSelected = index === activeIndex;
            const sources = suggestion.source_types ?? [];
            return (
              <li
                key={suggestion.term}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => {
                  event.preventDefault();
                  setInputValue(suggestion.term);
                  submitTerm(suggestion.term);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/60',
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Search
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="truncate font-medium">
                    {suggestion.term}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {sources.length > 0 && (
                    <span className="flex items-center gap-1" aria-hidden>
                      {sources.slice(0, 4).map((source) => (
                        <span
                          key={source}
                          title={searchTypeColor(source).label}
                          className={cn(
                            'size-2 rounded-full',
                            searchTypeColor(source).bg,
                          )}
                        />
                      ))}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {numberFormat.format(suggestion.frequency)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
