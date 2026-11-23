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
 * em duas linhas, com uma onda sutil de dentro para fora. O bloco se apaga
 * quando a pergunta é usada (do fim para o começo).
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
        className="grid gap-1.5"
        // Duas linhas, qualquer que seja o limite.
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(limit / 2)}, minmax(0, 1fr))`,
        }}
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
                'relative h-6 overflow-hidden rounded-sm transition-all duration-500 ease-out',
                alive ? 'bg-eng-blue' : 'scale-90 bg-muted-foreground/20',
                spending && 'animate-pulse',
              )}
            >
              {alive && (
                // Onda de gota: um anel que nasce no centro e se abre até a borda.
                <span
                  className="absolute top-1/2 left-1/2 aspect-square w-full animate-[maria-ripple_3.6s_ease-out_infinite] rounded-full border border-white/50 opacity-0"
                  style={{ animationDelay: `${(index * 700) % 3600}ms` }}
                />
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
