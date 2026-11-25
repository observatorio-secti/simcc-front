import { useId, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export interface YearFilterProps {
  yearStart?: number;
  yearEnd?: number;
  /** Ano inicial padrão restaurado ao limpar (padrão: `anoCorrente - 10`). */
  defaultYearStart?: number;
  onChange: (next: { yearStart?: number; yearEnd?: number }) => void;
}

interface DraftOverride {
  base: number | undefined;
  value: string;
}

function parseYearInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!/^\d{4}$/.test(trimmed)) return undefined;
  const parsed = Number(trimmed);
  if (parsed < 1900 || parsed > 2100) return undefined;
  return parsed;
}

function resolveDraftValue(
  propValue: number | undefined,
  override: DraftOverride | null,
): string {
  if (override && override.base === propValue) {
    return override.value;
  }
  return propValue !== undefined ? String(propValue) : '';
}

/** Filtro de intervalo de anos sincronizado com a URL (`year_start`, `year_end`). */
export function YearFilter({
  yearStart,
  yearEnd,
  defaultYearStart = getDefaultYearStart(),
  onChange,
}: YearFilterProps) {
  const baseId = useId();
  const startId = `${baseId}-year-start`;
  const endId = `${baseId}-year-end`;

  const [startOverride, setStartOverride] = useState<DraftOverride | null>(
    null,
  );
  const [endOverride, setEndOverride] = useState<DraftOverride | null>(null);

  const startValue = resolveDraftValue(yearStart, startOverride);
  const endValue = resolveDraftValue(yearEnd, endOverride);
  const hasFilter =
    (yearStart !== undefined && yearStart !== defaultYearStart) ||
    yearEnd !== undefined;

  function handleFieldChange(
    field: 'start' | 'end',
    raw: string,
    currentBase: number | undefined,
    setOverride: (next: DraftOverride | null) => void,
  ) {
    setOverride({ base: currentBase, value: raw });
    if (raw.trim() === '') {
      if (field === 'end' && currentBase !== undefined) {
        onChange({ yearStart, yearEnd: undefined });
      }
      return;
    }
    const parsed = parseYearInput(raw);
    if (parsed !== undefined) {
      onChange(
        field === 'start'
          ? { yearStart: parsed, yearEnd }
          : { yearStart, yearEnd: parsed },
      );
    }
  }

  function handleFieldBlur(
    value: string,
    setOverride: (next: DraftOverride | null) => void,
  ) {
    if (parseYearInput(value) === undefined) {
      setOverride(null);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={startId}
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <Calendar className="size-4 text-muted-foreground" aria-hidden />
          Ano inicial
        </label>
        <Input
          id={startId}
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder={`Ex.: ${defaultYearStart}`}
          value={startValue}
          onChange={(event) =>
            handleFieldChange(
              'start',
              event.target.value,
              yearStart,
              setStartOverride,
            )
          }
          onBlur={() => handleFieldBlur(startValue, setStartOverride)}
          className="h-9 w-28"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={endId}
          className="text-sm font-medium text-muted-foreground"
        >
          Ano final
        </label>
        <Input
          id={endId}
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder={`Ex.: ${new Date().getFullYear()}`}
          value={endValue}
          onChange={(event) =>
            handleFieldChange(
              'end',
              event.target.value,
              yearEnd,
              setEndOverride,
            )
          }
          onBlur={() => handleFieldBlur(endValue, setEndOverride)}
          className="h-9 w-28"
        />
      </div>

      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setStartOverride(null);
            setEndOverride(null);
            onChange({ yearStart: defaultYearStart, yearEnd: undefined });
          }}
        >
          <X aria-hidden />
          Limpar anos
        </Button>
      )}
    </div>
  );
}
