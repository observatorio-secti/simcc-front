import {
  useId,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { MARIA_MESSAGE_MAX_LENGTH } from '@/api/maria';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

const numberFormat = new Intl.NumberFormat('pt-BR');

export interface ComposerProps {
  /** Texto do campo (controlado: a tela devolve a pergunta em caso de falha). */
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (question: string) => void;
  /** Uma resposta está sendo gerada: o envio vira "Parar". */
  streaming?: boolean;
  onStop?: () => void;
  /** Campo desligado (ex.: criando a conversa, limite atingido). */
  disabled?: boolean;
  /** Fica abaixo do campo: aviso fixo ou o motivo de não poder enviar. */
  notice?: ReactNode;
  placeholder?: string;
  autoFocus?: boolean;
  textareaRef?: Ref<HTMLTextAreaElement>;
  className?: string;
}

/**
 * Campo de pergunta da MarIA: Enter envia, Shift+Enter quebra a linha (e
 * Enter durante composição de IME não envia). Durante a resposta dá para
 * continuar digitando, mas não enviar.
 */
export function Composer({
  value,
  onValueChange,
  onSubmit,
  streaming = false,
  onStop,
  disabled = false,
  notice,
  placeholder = 'Pergunte sobre pesquisadores, produções, bolsas ou instituições',
  autoFocus,
  textareaRef,
  className,
}: ComposerProps) {
  const fieldId = useId();
  const noticeId = useId();
  const counterId = useId();
  const question = value.trim();
  const tooLong = value.length > MARIA_MESSAGE_MAX_LENGTH;
  const canSend = !disabled && !streaming && question !== '' && !tooLong;

  function submit() {
    if (!canSend) return;
    onSubmit(question);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      event.keyCode !== 229
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
          'flex flex-col gap-1 rounded-lg border bg-card p-2 transition-colors focus-within:border-eng-blue',
          tooLong && 'border-destructive focus-within:border-destructive',
          disabled && 'bg-muted',
        )}
      >
        <label htmlFor={fieldId} className="sr-only">
          Sua pergunta para a MarIA
        </label>
        <textarea
          id={fieldId}
          ref={textareaRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-describedby={`${counterId} ${notice ? noticeId : ''}`.trim()}
          aria-invalid={tooLong || undefined}
          className="[field-sizing:content] max-h-48 min-h-12 w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between gap-3 pl-2">
          <span
            id={counterId}
            className={cn(
              'text-xs text-muted-foreground tabular-nums',
              tooLong && 'font-medium text-destructive',
            )}
          >
            {numberFormat.format(value.length)} /{' '}
            {numberFormat.format(MARIA_MESSAGE_MAX_LENGTH)}
            <span className="hidden sm:inline">
              {' '}
              caracteres · Enter envia · Shift + Enter quebra linha
            </span>
          </span>
          {streaming ? (
            <Button type="button" size="sm" variant="outline" onClick={onStop}>
              <Square className="fill-current" aria-hidden />
              Parar
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={!canSend}>
              Enviar
              <ArrowUp aria-hidden />
            </Button>
          )}
        </div>
      </div>
      {notice && (
        <div id={noticeId} className="px-1 text-xs text-muted-foreground">
          {notice}
        </div>
      )}
    </form>
  );
}
