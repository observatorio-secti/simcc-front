import type { Magazine, MagazineRefData } from '@/entities/magazine/model';
import { MagazineCard } from '@/entities/magazine/ui/magazine-card';
import { MagazineRef, QualisBadge } from '@/entities/magazine/ui/magazine-ref';
import { Demo, Showcase } from './showcase';

const QUALIS_SAMPLES: ReadonlyArray<MagazineRefData> = [
  { qualis: 'A1', qualis_status: null },
  { qualis: 'A2', qualis_status: null },
  { qualis: 'A3', qualis_status: null },
  { qualis: 'A4', qualis_status: null },
  { qualis: 'B1', qualis_status: null },
  { qualis: 'B2', qualis_status: null },
  { qualis: 'B3', qualis_status: null },
  { qualis: 'B4', qualis_status: null },
  { qualis: 'B5', qualis_status: null },
  { qualis: 'C', qualis_status: null },
  { qualis: null, qualis_status: 'not_rated' },
  { qualis: null, qualis_status: 'not_applicable' },
];

const MAGAZINE_CARDS: ReadonlyArray<Magazine> = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Cadernos de Saúde Pública',
    issn: '0102311X',
    qualis: 'A1',
    qualis_status: null,
    jcr: 3.15,
    jcr_link: 'https://jcr.clarivate.com/journals/cad-saude-publica',
    reference_period: '2017-2020',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Revista Brasileira de Inovação',
    issn: '1677-2504',
    qualis: 'A3',
    qualis_status: null,
    jcr: 1.45,
    jcr_link: null,
    reference_period: '2017-2020',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Ciência & Educação (Bauru)',
    issn: '15167313',
    qualis: 'A4',
    qualis_status: null,
    jcr: null,
    jcr_link: null,
    reference_period: '2017-2020',
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'Revista Baiana de Tecnologia e Gestão',
    issn: '2237-9118',
    qualis: 'B5',
    qualis_status: null,
    jcr: 0.42,
    jcr_link: 'https://jcr.clarivate.com/journals/rbtg',
    reference_period: '2017-2020',
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: 'Boletim Regional de Pesquisa Aplicada',
    issn: '1981-4429',
    qualis: null,
    qualis_status: 'not_rated',
    jcr: null,
    jcr_link: null,
    reference_period: '2017-2020',
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    name: 'Anais de Congresso Nacional de Computação',
    issn: null,
    qualis: null,
    qualis_status: 'not_applicable',
    jcr: null,
    jcr_link: null,
    reference_period: null,
  },
];

export function MagazineShowcase() {
  return (
    <Showcase
      id="revista"
      title="Revista (E6)"
      description="Referência e card de revista com ISSN formatado, Qualis + qualis_status (cores claras apenas em outline + Dot ou borda lateral) e JCR."
    >
      <Demo label="Marcadores Qualis (escuros vs claros / B5 / qualis_status)">
        {QUALIS_SAMPLES.map((sample, index) => (
          <QualisBadge
            key={sample.qualis ?? sample.qualis_status ?? index}
            magazine={sample}
          />
        ))}
      </Demo>

      <Demo
        label="MagazineRef (padrão e compacto)"
        className="flex-col items-start gap-3"
      >
        <MagazineRef magazine={MAGAZINE_CARDS[0]!} />
        <MagazineRef
          magazine={MAGAZINE_CARDS[1]!}
          variant="compact"
          showIssn={false}
        />
        <MagazineRef magazine={MAGAZINE_CARDS[3]!} />
        <MagazineRef magazine={MAGAZINE_CARDS[4]!} />
        <MagazineRef magazine={MAGAZINE_CARDS[5]!} />
      </Demo>

      <Demo
        label="MagazineCard"
        className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {MAGAZINE_CARDS.map((magazine) => (
          <MagazineCard key={magazine.id} magazine={magazine} />
        ))}
      </Demo>
    </Showcase>
  );
}
