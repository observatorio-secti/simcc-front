import type { ReactNode } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { ConversationMessage } from '@/entities/conversation/model';
import { cn } from '@/shared/lib/cn';
import { formatDateTime } from '@/shared/lib/format';
import type { ConversationStreamState } from '../conversation-stream';
import { activitySteps, researchContext } from '../research-context';

const numberFormat = new Intl.NumberFormat('pt-BR');

function plural(count: number, one: string, many: string) {
  return `${numberFormat.format(count)} ${count === 1 ? one : many}`;
}

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ContextCard({ value, label }: { value: string; label: string }) {
  return (
    <li className="flex flex-col gap-0.5 rounded-md border bg-card px-3 py-2">
      <strong className="text-sm font-medium break-words">{value}</strong>
      <span className="text-xs text-muted-foreground">{label}</span>
    </li>
  );
}

export interface ContextPanelProps {
  messages: readonly ConversationMessage[];
  stream?: ConversationStreamState;
  className?: string;
}

/** Coluna direita: fontes e datas consultadas, atividade e notas de leitura. */
export function ContextPanel({
  messages,
  stream,
  className,
}: ContextPanelProps) {
  const streaming = stream?.status === 'streaming';
  const context = researchContext(messages, streaming ? stream.activities : []);
  const steps = activitySteps(messages, stream);
  const results = [
    context.charts && plural(context.charts, 'gráfico', 'gráficos'),
    context.tables && plural(context.tables, 'tabela', 'tabelas'),
    context.researchers &&
      plural(context.researchers, 'pesquisador', 'pesquisadores'),
    context.productions && plural(context.productions, 'produção', 'produções'),
  ].filter(Boolean);

  return (
    <div
      data-slot="maria-context-panel"
      className={cn('flex flex-col gap-6', className)}
    >
      <PanelSection title="Contexto da pesquisa">
        {context.sources.length === 0 && results.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            As fontes consultadas e a data das consultas aparecem aqui depois da
            primeira resposta.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {context.sources.map((source) => (
              <ContextCard
                key={source}
                value={source}
                label="Fonte consultada"
              />
            ))}
            {context.lastQueriedAt && (
              <ContextCard
                value={formatDateTime(context.lastQueriedAt)}
                label="Consulta mais recente"
              />
            )}
            {results.length > 0 && (
              <ContextCard
                value={results.join(' · ')}
                label="Resultados nesta conversa"
              />
            )}
            {context.truncated > 0 && (
              <ContextCard
                value={plural(
                  context.truncated,
                  'resultado limitado',
                  'resultados limitados',
                )}
                label="Cortados pelo limite de linhas da consulta"
              />
            )}
          </ul>
        )}
      </PanelSection>

      <PanelSection title="Atividade da MarIA">
        {steps.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma consulta ainda nesta conversa.
          </p>
        ) : (
          <ol
            className="flex flex-col gap-2"
            aria-live={streaming ? 'polite' : undefined}
          >
            {steps.map((step, index) => (
              <li
                key={`${index}-${step.description}`}
                className="flex items-start gap-2 text-xs"
              >
                {step.status === 'running' ? (
                  <Loader2
                    className="mt-0.5 size-3.5 shrink-0 animate-spin text-eng-blue"
                    aria-hidden
                  />
                ) : (
                  <CheckCircle2
                    className="mt-0.5 size-3.5 shrink-0 text-status-concluida"
                    aria-hidden
                  />
                )}
                <span className="flex flex-col">
                  <span className="font-medium">
                    {step.status === 'running' ? 'Em andamento' : 'Concluído'}
                  </span>
                  <span className="text-muted-foreground">
                    {step.description}
                    {step.source && ` · ${step.source}`}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </PanelSection>

      <PanelSection title="Notas de leitura">
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <p>
            Cada bloco de dados mostra a fonte e a data da consulta. Resultados
            cortados pelo limite de linhas trazem um aviso.
          </p>
          <p>
            Em rankings de pesquisadores, a MarIA informa o termo buscado, os
            campos usados na ordem e a data de referência dos dados.
          </p>
        </div>
      </PanelSection>
    </div>
  );
}
