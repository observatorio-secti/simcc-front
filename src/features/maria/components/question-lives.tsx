import { Heart } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface QuestionLivesProps {
  /** Perguntas já gravadas na conversa. */
  used: number;
  limit: number;
  /** Uma pergunta está sendo respondida: a próxima vida pisca. */
  pending?: boolean;
  className?: string;
}

/**
 * Perguntas restantes como vidas de videogame: um coração por pergunta, que
 * se apaga quando ela é usada (da direita para a esquerda).
 */
export function QuestionLives({
  used,
  limit,
  pending = false,
  className,
}: QuestionLivesProps) {
  const remaining = Math.max(0, limit - used);
  const shown = pending ? Math.max(0, remaining - 1) : remaining;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <ol
        className="flex flex-wrap gap-1"
        role="img"
        aria-label={`${shown} de ${limit} perguntas restantes`}
      >
        {Array.from({ length: limit }, (_, index) => {
          const alive = index < remaining;
          const spending = pending && index === remaining - 1;
          return (
            <li key={index} aria-hidden>
              <Heart
                className={cn(
                  'size-4 transition-all duration-500 ease-out',
                  alive
                    ? 'scale-100 fill-rose-500 text-rose-500'
                    : 'scale-75 fill-transparent text-muted-foreground/40',
                  spending && 'animate-pulse',
                )}
              />
            </li>
          );
        })}
      </ol>
      <span className="text-xs text-muted-foreground tabular-nums">
        {shown === 0
          ? 'Sem perguntas nesta conversa'
          : shown === 1
            ? 'Resta 1 pergunta'
            : `Restam ${shown} perguntas`}
      </span>
    </div>
  );
}
