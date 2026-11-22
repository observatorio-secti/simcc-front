import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import { PillAnchor } from '@/shared/ui/pill-link';
import { HomeBackgroundChart } from './components/home-background-chart';
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
    <div className="relative isolate flex w-full flex-1 flex-col">
      <HomeBackgroundChart />
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-10 py-4 md:py-8">
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
      </div>
    </div>
  );
}
