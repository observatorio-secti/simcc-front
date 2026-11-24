const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

/** "22/11/2026, 10:30"; valor inválido vira "—". */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const time = Date.parse(value);
  return Number.isNaN(time) ? '—' : dateTimeFormat.format(time);
}

/** "22/11/2026"; valor inválido vira "—". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const time = Date.parse(value);
  return Number.isNaN(time) ? '—' : dateFormat.format(time);
}

const LOWERCASE_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

/** "METROPOLITANA DE SALVADOR" → "Metropolitana de Salvador". */
export function titleCaseLabel(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1),
    )
    .join(' ');
}
