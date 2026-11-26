import { Factory, Sprout, Tractor, type LucideIcon } from 'lucide-react';

export interface IncitePanel {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const INCITES_PANELS: readonly IncitePanel[] = [
  {
    id: 'industria-4-0',
    title: 'INCITE Indústria 4.0',
    description:
      'Explore o panorama da Indústria 4.0 na Bahia, com dados sobre maturidade digital, tecnologias e oportunidades para o setor.',
    href: 'https://observatoriocti.secti.ba.gov.br/incite/industria4/',
    icon: Factory,
  },
  {
    id: 'agricultura-familiar',
    title: 'INCITE Agricultura Familiar',
    description:
      'Informações estratégicas sobre inovação tecnológica no setor agropecuário da Bahia.',
    href: 'https://observatoriocti.secti.ba.gov.br/incite/agricultura-familiar/',
    icon: Sprout,
  },
  {
    id: 'agroindustria',
    title: 'INCITE Agroindústria',
    description:
      'Informações estratégicas sobre inovação tecnológica no setor agroindustrial da Bahia.',
    href: 'https://simcc.uesc.br/incite/agroindustria/',
    icon: Tractor,
  },
];
