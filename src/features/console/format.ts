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
