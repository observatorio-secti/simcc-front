import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import type { MagazineLike } from '@/entities/magazine/model';
import { magazineQueries } from '@/entities/magazine/queries';
import { JcrMark } from '@/entities/magazine/ui/jcr-mark';
import { MagazineRef } from '@/entities/magazine/ui/magazine-ref';
import { QualisMark } from '@/entities/magazine/ui/qualis-mark';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import type { VitrineSection } from '../showcase';
import { Demo, Showcase } from '../showcase';

// Exemplos com o formato das respostas reais da v2 (artigo e catálogo).
const EXAMPLES: { label: string; magazine: MagazineLike }[] = [
  {
    label: 'Artigo: Qualis, JCR e ISSN válido',
    magazine: {
      name: 'Nature Reviews. Drug Discovery (print)',
      issn: '14741776',
      qualis: 'A1',
      qualis_status: null,
      jcr: 122.7,
    },
  },
  {
    label: 'Artigo: sem Qualis (not_rated), com JCR',
    magazine: {
      name: 'Waste Management',
      issn: '18792456',
      qualis: null,
      qualis_status: 'not_rated',
      jcr: 7.1,
    },
  },
  {
    label: 'Catálogo: período de referência',
    magazine: {
      id: '06828386-8814-435e-9d3b-dc70fa306f05',
      name: '2d Materials',
      issn: '20531583',
      qualis: 'A1',
      qualis_status: null,
      jcr: 4.5,
      jcr_link: null,
      reference_period: '2021-2025',
    },
  },
  {
    label: 'Catálogo: link do JCR',
    magazine: {
      name: 'Revista com jcr_link',
      issn: '01406736',
      qualis: 'A3',
      qualis_status: null,
      jcr: 2.345,
      jcr_link: 'https://jcr.clarivate.com/',
      reference_period: '2017-2020',
    },
  },
  {
    label: 'ISSN fora do padrão (sem link)',
    magazine: {
      name: '19&20 (rio De Janeiro)',
      issn: '1981030',
      qualis: 'C',
      qualis_status: null,
      jcr: null,
    },
  },
  {
    label: 'Qualis não se aplica, sem ISSN',
    magazine: {
      name: 'Anais de congresso',
      issn: null,
      qualis: null,
      qualis_status: 'not_applicable',
      jcr: null,
    },
  },
];

const STRATA = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'C',
] as const;

function LiveMagazines() {
  const query = useQuery(magazineQueries.list({ per_page: 4, sort_by: 'jcr' }));

  if (query.isPending) {
    return (
      <LoadingBlock
        title="Carregando revistas..."
        caption="/v2/magazine?sort_by=jcr"
      />
    );
  }
  if (query.isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Não foi possível carregar as revistas"
        description={query.error.message}
      />
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {query.data.data.map((magazine) => (
        <MagazineRef key={magazine.id} magazine={magazine} />
      ))}
    </div>
  );
}

function MagazineShowcase() {
  return (
    <Showcase
      id="revista"
      title="Revista"
      description="MagazineRef (src/entities/magazine): veículo com Qualis, JCR e ISSN. Revista não tem rota; o ISSN válido abre o portal do ISSN."
    >
      <Demo label="MagazineRef" className="grid gap-6 sm:grid-cols-2">
        {EXAMPLES.map(({ label, magazine }) => (
          <div key={label} className="flex min-w-0 flex-col gap-1.5">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <MagazineRef magazine={magazine} />
          </div>
        ))}
      </Demo>
      <Demo label="QualisMark" className="text-xs text-muted-foreground">
        {STRATA.map((qualis) => (
          <QualisMark key={qualis} qualis={qualis} />
        ))}
        <QualisMark qualis={null} qualis_status="not_rated" />
        <QualisMark qualis={null} qualis_status="not_applicable" />
      </Demo>
      <Demo label="JcrMark" className="text-xs text-muted-foreground">
        <JcrMark jcr={98.4} />
        <JcrMark jcr={0.512} />
        <JcrMark jcr={4.5} jcr_link="https://jcr.clarivate.com/" />
      </Demo>
      <Demo label="Da API (maiores JCR)" className="block">
        <LiveMagazines />
      </Demo>
    </Showcase>
  );
}

export const section: VitrineSection = {
  id: 'revista',
  label: 'Revista',
  Component: MagazineShowcase,
};
