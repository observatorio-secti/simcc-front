import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Home, SearchX } from 'lucide-react';
import simccLogo from '@kit/assets/logo/simcc.svg';
import simccLogoWhite from '@kit/assets/logo/simcc-white.svg';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

/** Tela definitiva de erro 404 no padrão do Simcc Design Kit. */
export function NotFoundPage() {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/' });
  };

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
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center gap-3 pb-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              <SearchX className="size-6" aria-hidden />
            </div>
            <p className="text-[10px] font-medium tracking-wider text-eng-blue uppercase">
              Erro 404
            </p>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Página não encontrada
            </CardTitle>
            <CardDescription className="text-sm">
              O endereço pode não existir ainda ou ter mudado com a nova versão
              da plataforma.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-wrap items-center justify-center gap-3">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft aria-hidden />
              Voltar
            </Button>
            <Button asChild>
              <Link to="/">
                <Home aria-hidden />
                Página inicial
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
