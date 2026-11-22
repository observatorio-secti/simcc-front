import { useNavigate } from '@tanstack/react-router';
import { PowerBiEmbed } from '@/shared/ui/power-bi-embed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { INDICATOR_PANELS, type IndicatorPanelId } from './indicators-data';
import {
  DEFAULT_INDICATOR_PANEL,
  type IndicatorsSearch,
} from './search-schema';

function isPanelId(value: string): value is IndicatorPanelId {
  return INDICATOR_PANELS.some((panel) => panel.id === value);
}

/**
 * Tela pública de Indicadores (`/indicadores`, Template F): os painéis do
 * Power BI do observatório, um por aba (ADR 0012).
 */
export function IndicatorsPage({ search }: { search: IndicatorsSearch }) {
  const navigate = useNavigate({ from: '/indicadores' });
  const active = search.painel ?? DEFAULT_INDICATOR_PANEL;

  function handleChange(value: string) {
    if (!isPanelId(value)) return;
    void navigate({
      search: {
        painel: value === DEFAULT_INDICATOR_PANEL ? undefined : value,
      },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Indicadores
        </h1>
        <p className="text-sm text-muted-foreground">
          Painéis do Power BI do Observatório de CT&amp;I da Bahia.
        </p>
      </header>

      <Tabs
        value={active}
        onValueChange={handleChange}
        className="flex flex-col gap-4"
      >
        <TabsList
          aria-label="Painéis"
          className="w-full justify-start overflow-x-auto bg-neutral-100 dark:bg-neutral-800"
        >
          {INDICATOR_PANELS.map((panel) => {
            const Icon = panel.icon;
            return (
              <TabsTrigger key={panel.id} value={panel.id} className="gap-2">
                <Icon className="size-3.5" aria-hidden />
                <span>{panel.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {INDICATOR_PANELS.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} className="mt-0">
            <PowerBiEmbed
              src={panel.src}
              title={panel.title}
              description={panel.description}
              unavailable={panel.unavailable}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
