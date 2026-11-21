import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Database, Globe, Info } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/section-header';
import { ExternalPanelCard } from './external-panel-card';
import { EXTERNAL_PANEL_GROUPS } from './external-panels-data';

const GROUP_ICONS = {
  platform: Database,
  other: Globe,
} as const;

/** Tela de painéis de dados externos (Template F — Documento). */
export function ExternalPanelsPage() {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/' });
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={handleBack}
          aria-label="Voltar"
        >
          <ChevronLeft aria-hidden />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          Painéis de dados externos
        </h1>
      </header>

      <Card>
        <CardContent className="flex items-start gap-3 p-4 md:p-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-eng-blue dark:bg-eng-blue/20">
            <Info className="size-4" aria-hidden />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">
              Fontes externas integradas e plataformas de referência
            </p>
            <p className="text-muted-foreground">
              Estes são os links para fontes de dados públicos que a plataforma
              acessa de forma autorizada, além de outras plataformas de CT&amp;I
              com objetivos semelhantes. Bases marcadas com acesso institucional
              dependem de vínculo acadêmico (CAFe) ou assinatura para consulta
              completa.
            </p>
          </div>
        </CardContent>
      </Card>

      {EXTERNAL_PANEL_GROUPS.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`section-${group.id}`}
          className="flex flex-col gap-4"
        >
          <SectionHeader
            id={`section-${group.id}`}
            title={group.title}
            icon={GROUP_ICONS[group.id]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.map((panel) => (
              <ExternalPanelCard key={panel.id} panel={panel} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
