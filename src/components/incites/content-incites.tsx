import { Link } from 'react-router-dom';
import { ArrowRight, Factory, Info, Sprout, Tractor } from 'lucide-react';
import { Helmet } from 'react-helmet';
import bg_popup from '../../assets/bg_graduate.png';
import industriaLogo from '../../../assets/industria-4.png';
import agroLogo from '../../../assets/agricultura-familiar.png';
import agroindustriaLogo from '../../../assets/agroindustria.png';
import { Badge } from '../ui/badge';

interface Incite {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: React.ElementType;
  imageUrl?: string;
  status: 'active' | 'soon';
}

const incitesList: Incite[] = [
  {
    id: 'industria-4-0',
    title: 'INCITE Indústria 4.0',
    description:
      'Explore o panorama da Indústria 4.0 na Bahia, com dados sobre maturidade digital, tecnologias e oportunidades para o setor.',
    link: 'https://simcc.uesc.br/incite/industria4/',
    icon: Factory,
    status: 'active',
    imageUrl: industriaLogo,
  },
  {
    id: 'agricultura-familiar',
    title: 'INCITE Agricultura Familiar',
    description:
      'Informações estratégicas sobre inovação tecnológica no setor agropecuário da Bahia.',
    link: 'https://simcc.uesc.br/incite/agricultura-familiar/',
    icon: Sprout,
    status: 'active',
    imageUrl: agroLogo,
  },
  {
    id: 'agroindustria',
    title: 'INCITE Agroindústria',
    description:
      'Informações estratégicas sobre inovação tecnológica no setor agroindustrial da Bahia.',
    link: 'https://simcc.uesc.br/incite/agroindustria/',
    icon: Tractor,
    status: 'active',
    imageUrl: agroindustriaLogo,
  },
];

export function IncitesPage() {
  const renderInciteCard = (incite: Incite) => {
    const isComingSoon = incite.status === 'soon';

    const cardContent = (
      <div
        className={`group relative flex flex-col justify-between w-full h-full p-6 rounded-lg border dark:border-neutral-800 shadow-sm transition-all overflow-hidden bg-cover bg-center`}
        style={{ backgroundImage: `url(${incite.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            {isComingSoon && (
              <Badge
                variant="secondary"
                className="absolute top-4 right-4 z-20"
              >
                Em Breve
              </Badge>
            )}
            <div className="mb-4">
              <incite.icon
                className={`h-8 w-8 ${isComingSoon ? 'text-neutral-400' : 'text-white'}`}
              />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              {incite.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-300">
              {incite.description}
            </p>
          </div>
          {!isComingSoon && (
            <div className="mt-6 flex items-center text-sm font-semibold text-white">
              Acessar painel
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </div>
    );

    if (isComingSoon) {
      return (
        <div key={incite.id} className="opacity-60 cursor-not-allowed">
          {cardContent}
        </div>
      );
    }

    return (
      <Link
        to={incite.link}
        target="_blank"
        rel="noopener noreferrer"
        key={incite.id}
        className="no-underline"
      >
        {cardContent}
      </Link>
    );
  };

  return (
    <main
      className="relative flex flex-col items-end justify-center min-h-screen p-4 md:p-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_popup})` }}
    >
      <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-6xl">
        <Helmet>
          <title>INCITES da Bahia | Observatório de Inovação</title>
          <meta
            name="description"
            content="Explore os painéis interativos com dados e informações estratégicas sobre os setores produtivos da Bahia."
          />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <div className="flex items-center gap-6 mb-8 justify-end">
          <div className="flex-1 text-right">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-neutral-900 dark:text-neutral-100">
              Observatório de Iniciativas de C&T&I (INCITES)
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-3xl ml-auto">
              Plataformas interativas que apresentam diagnósticos e informações
              estratégicas sobre setores produtivos relevantes para o
              desenvolvimento da Bahia.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-end">
          {incitesList.map(renderInciteCard)}
        </div>

        <div className="mt-12 text-right">
          <Link
            to={'/informacoes'}
            className="inline-flex items-center rounded-lg gap-2 px-3 py-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Info size={14} />
            <span>Saiba mais sobre a plataforma e a origem dos dados</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
