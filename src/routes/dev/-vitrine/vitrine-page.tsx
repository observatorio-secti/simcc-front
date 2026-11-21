import { Toaster } from '@/shared/ui/sonner';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { DictionariesShowcase } from './dictionaries';
import { GraduateProgramShowcase } from './graduate-program';
import { InstitutionShowcase } from './institution';
import { KitComponentsShowcase } from './kit-components';
import { PrimitivesShowcase } from './primitives';
import { ProductionShowcase } from './production';
import { ResearchGroupShowcase } from './research-group';
import { ResearcherShowcase } from './researcher';

const SECTIONS = [
  ['botao', 'Botão'],
  ['marcadores', 'Badge'],
  ['card', 'Card'],
  ['formulario', 'Formulário'],
  ['tabs', 'Tabs'],
  ['acordeao', 'Acordeão'],
  ['sobreposicoes', 'Sobreposições'],
  ['tabela', 'Tabela'],
  ['rolagem', 'Rolagem'],
  ['pill-link', 'PillLink'],
  ['stat-card', 'StatCard'],
  ['section-header', 'SectionHeader'],
  ['result-toolbar', 'ResultToolbar'],
  ['estados', 'Estados'],
  ['dicionarios', 'Dicionários'],
  ['pesquisador', 'Pesquisador'],
  ['producao', 'Produção'],
  ['instituicao', 'Instituição'],
  ['programa', 'Programa'],
  ['grupo-pesquisa', 'Grupo de pesquisa'],
] as const;

/** Vitrine do kit (só em desenvolvimento). Ver src/routes/dev/vitrine.tsx. */
export function VitrinePage() {
  return (
    <div className="min-h-dvh p-0 md:p-4">
      <main className="flex min-h-dvh flex-col gap-10 bg-background px-4 py-8 md:min-h-[calc(100dvh-2rem)] md:rounded-panel md:border md:px-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                Só em desenvolvimento
              </p>
              <h1 className="text-xl font-semibold tracking-tight">
                Vitrine do kit
              </h1>
              <p className="text-sm text-muted-foreground">
                Primitivos de src/shared/ui e dicionários de
                src/shared/lib/design-tokens.ts. Confira nos temas claro e
                escuro, em 1440px e 375px.
              </p>
            </div>
            <ThemeToggle className="shrink-0" />
          </div>
          <nav aria-label="Seções da vitrine">
            <ul className="flex flex-wrap gap-2">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex h-8 items-center rounded-md bg-secondary px-3 text-xs transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <PrimitivesShowcase />
        <KitComponentsShowcase />
        <DictionariesShowcase />
        <ResearcherShowcase />
        <ProductionShowcase />
        <InstitutionShowcase />
        <GraduateProgramShowcase />
        <ResearchGroupShowcase />
      </main>
      <Toaster />
    </div>
  );
}
