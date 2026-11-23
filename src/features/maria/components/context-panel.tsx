import { CheckCircle2, Database, Loader2 } from 'lucide-react';
import type { MariaActivity } from '@/api/maria';
import type { ConversationBlock } from '@/entities/conversation/model';
import { answerContext, formatQueriedAt } from './answer-context';
import { QuestionLives } from './question-lives';

// Coluna à direita da conversa: de onde veio a última resposta.

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export interface ContextPanelProps {
  blocks: readonly (ConversationBlock | undefined)[];
  /** Atividades ao vivo, enquanto a resposta é gerada. */
  activities?: readonly MariaActivity[];
  streaming?: boolean;
  /** Perguntas usadas e o limite da conversa (sem limite, nada aparece). */
  questions?: { used: number; limit: number } | null;
}

export function ContextPanel({
  blocks,
  activities = [],
  streaming = false,
  questions,
}: ContextPanelProps) {
  const { sources, queries } = answerContext(blocks);
  const steps = streaming
    ? activities.map((activity) => activity.description)
    : queries;

  const empty = sources.length === 0 && steps.length === 0 && !streaming;

  return (
    <div className="flex flex-col gap-6">
      {questions && (
        <PanelSection title="Perguntas">
          <QuestionLives
            used={questions.used}
            limit={questions.limit}
            pending={streaming}
          />
        </PanelSection>
      )}

      {empty && (
        <p className="text-xs text-muted-foreground">
          As fontes da resposta aparecem aqui.
        </p>
      )}

      {sources.length > 0 && (
        <PanelSection title="Fontes">
          <ul className="flex flex-col gap-2">
            {sources.map((source) => (
              <li
                key={source.name}
                className="flex items-start gap-2.5 rounded-lg border bg-card p-3"
              >
                <Database
                  className="mt-0.5 size-4 shrink-0 text-eng-blue"
                  aria-hidden
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{source.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatQueriedAt(source.queriedAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </PanelSection>
      )}

      {(steps.length > 0 || streaming) && (
        <PanelSection title="Consultas">
          <ol
            className="flex flex-col text-xs"
            aria-live={streaming ? 'polite' : undefined}
          >
            {steps.map((step, index) => {
              const running = streaming && index === steps.length - 1;
              return (
                <li
                  key={`${index}-${step}`}
                  className="flex items-start gap-2 border-b py-2 last:border-b-0"
                >
                  {running ? (
                    <Loader2
                      className="mt-px size-3.5 shrink-0 animate-spin text-eng-blue"
                      aria-hidden
                    />
                  ) : (
                    <CheckCircle2
                      className="mt-px size-3.5 shrink-0 text-eng-blue"
                      aria-hidden
                    />
                  )}
                  <span className="text-muted-foreground">{step}</span>
                </li>
              );
            })}
            {streaming && steps.length === 0 && (
              <li className="flex items-center gap-2 py-2 text-muted-foreground">
                <Loader2
                  className="size-3.5 animate-spin text-eng-blue"
                  aria-hidden
                />
                Pensando…
              </li>
            )}
          </ol>
        </PanelSection>
      )}
    </div>
  );
}
