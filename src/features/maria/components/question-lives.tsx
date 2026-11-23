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
 * Perguntas restantes como vidas de videogame: um bloco azul por pergunta,
 * com um brilho de gota escorrendo, que se apaga quando ela é usada (da
 * direita para a esquerda).
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
        className="flex gap-1"
        role="img"
        aria-label={`${shown} de ${limit} perguntas restantes`}
      >
        {Array.from({ length: limit }, (_, index) => {
          const alive = index < remaining;
          const spending = pending && index === remaining - 1;
          return (
            <li
              key={index}
              aria-hidden
              className={cn(
                'relative h-3 flex-1 overflow-hidden rounded-[3px] transition-all duration-500 ease-out',
                alive ? 'bg-eng-blue' : 'scale-y-75 bg-muted-foreground/20',
                spending && 'animate-pulse',
              )}
            >
              {alive && (
                <>
                  {/* Reflexo no topo, como numa gota. */}
                  <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-[3px] bg-gradient-to-b from-white/35 to-transparent" />
                  {/* Brilho que passa de um bloco ao outro. */}
                  <span
                    className="absolute inset-0 animate-[maria-drop_4.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ animationDelay: `${index * 110}ms` }}
                  />
                </>
              )}
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
