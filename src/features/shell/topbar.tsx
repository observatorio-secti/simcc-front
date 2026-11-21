import type { ReactNode } from 'react';
import { Link, type RegisteredRouter } from '@tanstack/react-router';
import govBaLogo from '@kit/assets/logo/governo-bahia-secti.png';
import observatorioLogo from '@kit/assets/logo/observatorio.svg';
import simccLogo from '@kit/assets/logo/simcc.svg';
import simccLogoWhite from '@kit/assets/logo/simcc-white.svg';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { focusRing } from '@/shared/ui/focus-ring';
import { Separator } from '@/shared/ui/separator';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { GOV_BA_URL, OBSERVATORIO_URL } from './nav-config';

export type TopbarProps = {
  /** Slot opcional à direita (ex.: ações de sessão entregues pela F1.4). */
  actions?: ReactNode;
};

/** Barra superior da moldura pública (`h-10` sobre `bg-neutral-100 dark:bg-black`). */
export function Topbar({ actions }: TopbarProps) {
  return (
    <header
      data-slot="topbar"
      className="flex h-10 shrink-0 items-center justify-between gap-2 bg-neutral-100 px-2 md:px-3 dark:bg-black"
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Link<RegisteredRouter, string, string>
          href="/"
          aria-label="Página inicial do Simcc"
          className={cn(
            'flex shrink-0 items-center rounded-md py-1',
            focusRing,
          )}
        >
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

        <Separator
          orientation="vertical"
          className="hidden bg-slate-300 data-[orientation=vertical]:h-6 md:block dark:bg-neutral-700"
        />

        <a
          href={GOV_BA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Governo da Bahia — Secretaria de Ciência, Tecnologia e Inovação"
          className={cn(
            'hidden shrink-0 items-center rounded-md md:inline-flex',
            focusRing,
          )}
        >
          <img
            src={govBaLogo}
            alt="Governo da Bahia — SECTI"
            className="h-8 w-auto object-contain"
          />
        </a>

        <Separator
          orientation="vertical"
          className="bg-slate-300 data-[orientation=vertical]:h-6 dark:bg-neutral-700"
        />

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 shrink-0 gap-2 px-2.5 text-xs font-medium"
        >
          <a href={OBSERVATORIO_URL} target="_blank" rel="noopener noreferrer">
            <img
              src={observatorioLogo}
              alt=""
              aria-hidden
              className="size-4 shrink-0"
            />
            <span className="sr-only sm:not-sr-only">Observatório</span>
          </a>
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
