import { ExternalLink, Landmark } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { focusRing } from '@/shared/ui/focus-ring';
import { INCITES_PANELS, type IncitePanel } from './incites-data';

function IncitePanelCard({ panel }: { panel: IncitePanel }) {
  const Icon = panel.icon;

  return (
    <a
      href={panel.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('group block h-full rounded-lg', focusRing)}
    >
      <Card className="h-full justify-between transition-colors group-hover:border-eng-blue">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {panel.title}
          </CardTitle>
          <CardAction>
            <Icon className="size-5 text-muted-foreground" aria-hidden />
          </CardAction>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {panel.description}
          </p>
        </CardContent>

        <CardFooter className="pt-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-eng-blue transition-colors group-hover:text-eng-dark-blue dark:group-hover:text-brand-soft">
            Acessar painel
            <ExternalLink className="size-4" aria-hidden />
            <span className="sr-only"> (abre em nova aba)</span>
          </span>
        </CardFooter>
      </Card>
    </a>
  );
}

/** Página pública dos painéis InCites (Template F — Documento). */
export function IncitesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Institutos de Ciência, Inovação e Tecnologia (INCITES)
        </h1>
        <p className="text-sm text-muted-foreground">
          Observatório dos Institutos de Ciência, Inovação e Tecnologia do
          Estado da Bahia.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Sobre os painéis INCITES</CardTitle>
          <Landmark className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Plataformas interativas que apresentam diagnósticos e informações
            estratégicas sobre setores produtivos relevantes para o
            desenvolvimento da Bahia.
          </p>
        </CardContent>
      </Card>

      <section
        aria-label="Painéis disponíveis"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {INCITES_PANELS.map((panel) => (
          <IncitePanelCard key={panel.id} panel={panel} />
        ))}
      </section>
    </div>
  );
}
