import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import simccLogo from '@kit/assets/logo/simcc.svg';
import simccLogoWhite from '@kit/assets/logo/simcc-white.svg';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

/** Moldura minimalista compartilhada pelas telas de autenticação e acesso. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-deco-home bg-contain bg-right bg-no-repeat opacity-60 lg:block dark:opacity-10"
      />

      <header className="flex h-14 items-center justify-between px-4 md:px-8">
        <Link to="/" aria-label="Página inicial do Simcc">
          <img
            src={simccLogo}
            alt="Simcc"
            className="h-[18px] w-auto dark:hidden"
          />
          <img
            src={simccLogoWhite}
            alt="Simcc"
            className="hidden h-[18px] w-auto dark:block"
          />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 md:px-8">
        {children}
      </main>
    </div>
  );
}
