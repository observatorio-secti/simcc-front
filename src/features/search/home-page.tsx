import { useState } from 'react';
import { Link, useRouter, type RegisteredRouter } from '@tanstack/react-router';
import {
  BarChart3,
  Building2,
  Download,
  GraduationCap,
  Landmark,
  PanelsTopLeft,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/card';
import { focusRing } from '@/shared/ui/focus-ring';
import { PillAnchor } from '@/shared/ui/pill-link';
import { SectionHeader } from '@/shared/ui/section-header';
import { SearchBar } from './search-bar';
import { buildBuscaHref, type SearchType } from './search-schema';

const OBSERVATORIO_INFO_URL = 'https://observatoriocti.secti.ba.gov.br/';

const SUGGESTED_WORDS = [
  'robótica',
  'saúde coletiva',
  'energias renováveis',
  'aprendizado de máquina',
  'agricultura familiar',
  'educação',
  'bioinformática',
  'semiárido',
] as const;

interface PageShortcut {
  title: string;
  href: string;
  icon: LucideIcon;
}

const PAGE_SHORTCUTS: readonly PageShortcut[] = [
  {
    title: 'Grupos de pesquisa',
    href: '/grupos-pesquisa',
    icon: Users,
  },
  {
    title: 'Indicadores de produção',
    href: '/indicadores',
    icon: BarChart3,
  },
  {
    title: 'Instituições',
    href: '/instituicoes',
    icon: Building2,
  },
  {
    title: 'Institutos de CT&I',
    href: '/incites',
    icon: Landmark,
  },
  {
    title: 'Pós-graduação',
    href: '/pos-graduacao',
    icon: GraduationCap,
  },
  {
    title: 'Listagens',
    href: '/listagens',
    icon: Download,
  },
  {
    title: 'Pesquisar com IA',
    href: '/maria',
    icon: Sparkles,
  },
];

export interface HomePageProps {
  initialQuery?: string;
  initialType?: SearchType;
}

export function HomePage({
  initialQuery = '',
  initialType = 'profile',
}: HomePageProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<SearchType>(initialType);

  function handleSuggestedWordClick(term: string) {
    void router.navigate({
      href: buildBuscaHref({ q: term, type: selectedType }),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 py-4 md:py-8">
      <section className="flex flex-col items-center gap-6 py-4 md:py-8">
        <PillAnchor
          href={OBSERVATORIO_INFO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Saiba como utilizar a plataforma
        </PillAnchor>

        <h1 className="max-w-[800px] text-center text-3xl leading-snug font-medium tracking-tight text-slate-800 md:text-[2.6rem] md:leading-[1.5] dark:text-neutral-50">
          Experimente{' '}
          <span className="border-b-2 border-brand-teal pb-1 font-semibold text-brand-teal">
            pesquisar um tema
          </span>
          <br className="hidden md:block" /> e veja o que a plataforma pode
          <br className="hidden md:block" /> filtrar para{' '}
          <span className="font-semibold text-brand-wine">você.</span>
        </h1>

        <div className="w-full max-w-[860px]">
          <SearchBar
            initialQuery={initialQuery}
            initialType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>

        <div
          role="group"
          aria-label="Termos mais buscados"
          className="flex w-full max-w-[860px] flex-wrap justify-center gap-2.5 md:justify-start md:gap-3"
        >
          {SUGGESTED_WORDS.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => handleSuggestedWordClick(word)}
              className={cn(
                'h-8 cursor-pointer rounded-md bg-neutral-100 px-3 text-xs font-medium text-foreground capitalize transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                focusRing,
              )}
            >
              {word}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 pb-6" aria-labelledby="explore-pages-title">
        <SectionHeader
          id="explore-pages-title"
          title="Explore por página"
          icon={PanelsTopLeft}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PAGE_SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link<RegisteredRouter, string, string>
                key={shortcut.href}
                href={shortcut.href}
                className={cn('group rounded-lg', focusRing)}
              >
                <Card className="flex min-h-[120px] flex-col items-center justify-center gap-2.5 p-4 text-center text-xs font-medium transition-colors group-hover:bg-neutral-100/70 dark:group-hover:bg-neutral-900/70">
                  <Icon
                    className="size-5 text-muted-foreground transition-colors group-hover:text-eng-blue"
                    aria-hidden
                  />
                  <span>{shortcut.title}</span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
