import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { focusRing } from '@/shared/ui/focus-ring';
import { PowerBiEmbed } from '@/shared/ui/power-bi-embed';
import { INDICATOR_PANELS, type IndicatorPanel } from './indicators-data';
import type { IndicatorsSearch } from './search-schema';

function IndicatorPanelCard({ panel }: { panel: IndicatorPanel }) {
  const Icon = panel.icon;

  return (
    <Link
      to="/indicadores"
      search={{ painel: panel.id }}
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
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

/**
 * Tela pública de Indicadores (`/indicadores`, Template F): lista os painéis
 * do Power BI em cartões (estilo INCITES) e exibe o painel embutido ao
 * selecionar um cartão via `?painel=<id>` (ADR 0012).
 */
export function IndicatorsPage({ search }: { search: IndicatorsSearch }) {
  const activePanel = search.painel
    ? INDICATOR_PANELS.find((panel) => panel.id === search.painel)
    : undefined;

  if (activePanel) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link to="/indicadores" search={{}}>
              <ArrowLeft aria-hidden />
              Voltar aos painéis
            </Link>
          </Button>
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              {activePanel.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activePanel.description}
            </p>
          </header>
        </div>

        <PowerBiEmbed
          src={activePanel.src}
          title={activePanel.title}
          description={activePanel.description}
          unavailable={activePanel.unavailable}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Indicadores
        </h1>
        <p className="text-sm text-muted-foreground">
          Painéis do Power BI do Observatório de CT&amp;I da Bahia.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Sobre os painéis de indicadores</CardTitle>
          <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Painéis interativos que reúnem diagnósticos e indicadores
            estratégicos sobre a produção científica, pesquisadores e programas
            de pós-graduação da Bahia.
          </p>
        </CardContent>
      </Card>

      <section
        aria-label="Painéis disponíveis"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {INDICATOR_PANELS.map((panel) => (
          <IndicatorPanelCard key={panel.id} panel={panel} />
        ))}
      </section>
    </div>
  );
}
