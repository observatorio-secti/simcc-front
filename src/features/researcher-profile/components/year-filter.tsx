import { Calendar, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export interface YearFilterProps {
  yearStart?: number;
  yearEnd?: number;
  onChange: (next: { yearStart?: number; yearEnd?: number }) => void;
}

function parseYearInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!/^\d{4}$/.test(trimmed)) return undefined;
  const parsed = Number(trimmed);
  if (parsed < 1900 || parsed > 2100) return undefined;
  return parsed;
}

/** Filtro de intervalo de anos sincronizado com a URL (`year_start`, `year_end`). */
export function YearFilter({ yearStart, yearEnd, onChange }: YearFilterProps) {
  const hasFilter = yearStart !== undefined || yearEnd !== undefined;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="profile-year-start"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <Calendar className="size-4 text-muted-foreground" aria-hidden />
          Ano inicial
        </label>
        <Input
          id="profile-year-start"
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder="Ex.: 2018"
          value={yearStart ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === '') {
              onChange({ yearStart: undefined, yearEnd });
              return;
            }
            const parsed = parseYearInput(raw);
            if (parsed !== undefined) {
              onChange({ yearStart: parsed, yearEnd });
            }
          }}
          className="h-9 w-28"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="profile-year-end"
          className="text-sm font-medium text-muted-foreground"
        >
          Ano final
        </label>
        <Input
          id="profile-year-end"
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder="Ex.: 2026"
          value={yearEnd ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === '') {
              onChange({ yearStart, yearEnd: undefined });
              return;
            }
            const parsed = parseYearInput(raw);
            if (parsed !== undefined) {
              onChange({ yearStart, yearEnd: parsed });
            }
          }}
          className="h-9 w-28"
        />
      </div>

      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange({ yearStart: undefined, yearEnd: undefined })}
        >
          <X aria-hidden />
          Limpar anos
        </Button>
      )}
    </div>
  );
}
