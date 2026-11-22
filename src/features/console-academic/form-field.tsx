import { useState, type FormEvent, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Barra de busca padrão das listagens do console. */
export function ConsoleSearchBar({
  value,
  placeholder,
  ariaLabel,
  onSubmit,
  onClear,
}: {
  value?: string;
  placeholder: string;
  ariaLabel: string;
  onSubmit: (q: string | undefined) => void;
  onClear: () => void;
}) {
  const [input, setInput] = useState(value ?? '');
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setInput(value ?? '');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(input.trim() || undefined);
  }

  function handleClear() {
    setInput('');
    if (value) onClear();
  }

  return (
    <form
      role="search"
      aria-label={ariaLabel}
      onSubmit={handleSubmit}
      className="flex h-[52px] min-w-0 flex-1 items-center gap-3 rounded-lg border bg-card px-4"
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
      {input && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <X className="size-4" aria-hidden />
        </Button>
      )}
      <Button type="submit" size="sm">
        Buscar
      </Button>
    </form>
  );
}
