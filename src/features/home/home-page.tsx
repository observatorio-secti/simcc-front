import simccLogo from '@kit/assets/logo/simcc.svg';
import simccLogoWhite from '@kit/assets/logo/simcc-white.svg';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

// Página provisória da Fase 0: prova que o tema do kit, o roteamento e o
// tema escuro funcionam. Será substituída pela home real (tarefa T1).

const DICTIONARIES = [
  {
    title: 'Tipo de busca',
    items: [
      { label: 'Pesquisador', className: 'bg-search-profile' },
      { label: 'Artigo', className: 'bg-search-article' },
      { label: 'Livro', className: 'bg-search-book' },
      { label: 'Patente', className: 'bg-search-patent' },
    ],
  },
  {
    title: 'Grande área',
    items: [
      { label: 'Saúde', className: 'bg-area-saude' },
      { label: 'Exatas e da Terra', className: 'bg-area-exatas' },
      { label: 'Humanas', className: 'bg-area-humanas' },
      { label: 'Engenharias', className: 'bg-area-engenharias' },
    ],
  },
  {
    title: 'Qualis',
    items: [
      { label: 'A1', className: 'bg-qualis-A1' },
      { label: 'A2', className: 'bg-qualis-A2' },
      { label: 'B1', className: 'bg-qualis-B1' },
      { label: 'C', className: 'bg-qualis-C' },
    ],
  },
] as const;

export function HomePage() {
  return (
    <div className="min-h-dvh p-0 md:p-4">
      <main className="relative flex min-h-dvh flex-col overflow-hidden border bg-background md:min-h-[calc(100dvh-2rem)] md:rounded-panel">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-deco-home bg-contain bg-right bg-no-repeat opacity-60 lg:block dark:opacity-10"
        />

        <header className="relative flex items-center justify-between px-4 py-4 md:px-8">
          <img src={simccLogo} alt="Simcc" className="h-6 dark:hidden" />
          <img
            src={simccLogoWhite}
            alt="Simcc"
            className="hidden h-6 dark:block"
          />
          <ThemeToggle />
        </header>

        <section className="relative flex flex-1 flex-col justify-center gap-6 px-4 py-12 md:px-8">
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Nova plataforma
          </p>
          <h1 className="max-w-[800px] text-hero font-bold">
            O Simcc está sendo{' '}
            <span className="text-eng-blue">reconstruído</span>
          </h1>
          <p className="max-w-[640px] text-lg font-light">
            Esta é a base limpa da nova versão, construída sobre a API v2 e o
            Simcc Design Kit. As telas chegam por etapas, conforme o roadmap do
            projeto.
          </p>

          <div className="grid max-w-[800px] gap-3 sm:grid-cols-3">
            {DICTIONARIES.map((dictionary) => (
              <div
                key={dictionary.title}
                className="rounded-lg border bg-card p-4"
              >
                <h2 className="mb-3 text-sm font-medium">{dictionary.title}</h2>
                <ul className="space-y-2">
                  {dictionary.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        aria-hidden
                        className={`size-2.5 rounded-full ${item.className}`}
                      />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
