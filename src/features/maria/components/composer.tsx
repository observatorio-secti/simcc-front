import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { MARIA_MESSAGE_MAX_LENGTH } from '@/api/maria';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { focusRing } from '@/shared/ui/focus-ring';

const numberFormat = new Intl.NumberFormat('pt-BR');

export interface ComposerProps {
  onSubmit: (question: string) => void;
  /** Uma resposta está sendo gerada: o envio vira "parar". */
  streaming?: boolean;
  onStop?: () => void;
  /** Envio indisponível (ex.: criando a conversa, limite atingido). */
  disabled?: boolean;
  /** Explica por que não dá para enviar (fica abaixo do campo). */
  notice?: React.ReactNode;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

/** Campo de pergunta da MarIA: Enter envia, Shift+Enter quebra a linha. */
export function Composer({
  onSubmit,
  streaming = false,
  onStop,
  disabled = false,
  notice,
  placeholder = 'Pergunte sobre pesquisadores, produções ou instituições',
  autoFocus,
  className,
}: ComposerProps) {
  const [value, setValue] = useState('');
  const fieldId = useId();
  const noticeId = useId();
  const question = value.trim();
  const tooLong = value.length > MARIA_MESSAGE_MAX_LENGTH;
  const canSend = !disabled && !streaming && question !== '' && !tooLong;
  const nearLimit = value.length > MARIA_MESSAGE_MAX_LENGTH * 0.9;

  function submit() {
    if (!canSend) return;
    onSubmit(question);
    setValue('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      data-slot="maria-composer"
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-1.5', className)}
    >
      <div
        className={cn(
          'flex items-end gap-2 rounded-lg border bg-card p-2 transition-colors focus-within:border-eng-blue',
          tooLong && 'border-destructive focus-within:border-destructive',
        )}
      >
        <label htmlFor={fieldId} className="sr-only">
          Sua pergunta para a MarIA
        </label>
        <textarea
          id={fieldId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          disabled={disabled && !streaming}
          autoFocus={autoFocus}
          aria-describedby={notice ? noticeId : undefined}
          aria-invalid={tooLong || undefined}
          className={cn(
            '[field-sizing:content] max-h-48 min-h-12 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60',
          )}
        />
        {streaming ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onStop}
            aria-label="Parar resposta"
            className={focusRing}
          >
            <Square className="fill-current" aria-hidden />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            aria-label="Enviar pergunta"
          >
            <ArrowUp aria-hidden />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        <span id={noticeId}>{notice}</span>
        {nearLimit && (
          <span
            className={cn('tabular-nums', tooLong && 'text-destructive')}
            aria-live="polite"
          >
            {numberFormat.format(value.length)} de{' '}
            {numberFormat.format(MARIA_MESSAGE_MAX_LENGTH)} caracteres
          </span>
        )}
      </div>
    </form>
  );
}
