import { useState } from 'react';
import {
  Building2,
  GraduationCap,
  ListOrdered,
  Map,
  MapPin,
  Users,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock, Spinner } from '@/shared/ui/loading-block';
import { PillLink } from '@/shared/ui/pill-link';
import { ResultToolbar } from '@/shared/ui/result-toolbar';
import { SectionHeader } from '@/shared/ui/section-header';
import { StatCard } from '@/shared/ui/stat-card';
import { Demo, Showcase } from './showcase';

export function KitComponentsShowcase() {
  const [sectionOpen, setSectionOpen] = useState(true);
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [filtersClicks, setFiltersClicks] = useState(0);

  return (
    <>
      <Showcase id="pill-link" title="PillLink">
        <Demo label="Link interno tipado">
          <PillLink to="/">Saiba como utilizar a plataforma</PillLink>
        </Demo>
      </Showcase>

      <Showcase
        id="stat-card"
        title="StatCard"
        description="KPI com legenda que explica o recorte. Carregando: skeleton no lugar do número."
        bare
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Instituições"
            icon={Building2}
            value={13}
            caption="com pesquisadores no resultado"
          />
          <StatCard
            title="Programas de pós-graduação"
            icon={GraduationCap}
            value={1042}
            caption="com pesquisadores no resultado"
          />
          <StatCard
            title="Territórios de identidade"
            icon={MapPin}
            loading
            caption="com pesquisadores no resultado"
          />
        </div>
      </Showcase>

      <Showcase
        id="section-header"
        title="SectionHeader"
        description="Ícone 20px, título e ferramentas. O recolher é estado local."
      >
        <div className="flex flex-col gap-4">
          <SectionHeader
            icon={ListOrdered}
            title="Pesquisadores com mais ocorrências"
            open={sectionOpen}
            onOpenChange={setSectionOpen}
            controls="vitrine-section-content"
          />
          {sectionOpen && (
            <p id="vitrine-section-content" className="text-sm">
              Conteúdo da seção.
            </p>
          )}
          <SectionHeader icon={Users} title="Seção sem recolher" as="h3">
            <Button size="sm" variant="ghost">
              Ver todos
            </Button>
          </SectionHeader>
        </div>
      </Showcase>

      <Showcase
        id="result-toolbar"
        title="ResultToolbar"
        description='Sem "Baixar resultado" (ADR 0006). Filtros e recolher são opcionais.'
      >
        <ResultToolbar
          onFiltersClick={() => setFiltersClicks((count) => count + 1)}
          filtersCount={filtersClicks}
          open={toolbarOpen}
          onOpenChange={setToolbarOpen}
        >
          <div className="flex flex-wrap gap-2">
            <Button size="sm" aria-pressed>
              <Users aria-hidden />
              Pesquisadores
            </Button>
            <Button size="sm" variant="secondary" aria-pressed={false}>
              <Building2 aria-hidden />
              Instituições
            </Button>
            <Button size="sm" variant="secondary" aria-pressed={false}>
              <Map aria-hidden />
              Mapa
            </Button>
          </div>
        </ResultToolbar>
        <ResultToolbar onFiltersClick={() => undefined} />
      </Showcase>

      <Showcase id="estados" title="LoadingBlock, Spinner e EmptyState">
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingBlock />
          <div className="grid place-items-center rounded-md border">
            <Spinner />
          </div>
        </div>
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Tente outro termo ou remova alguns filtros."
          action={<Button variant="outline">Limpar filtros</Button>}
        />
      </Showcase>
    </>
  );
}
