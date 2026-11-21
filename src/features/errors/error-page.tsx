import {
  Link,
  useCanGoBack,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { AlertTriangle, ChevronLeft, Home, RotateCcw } from 'lucide-react';
import simccLogo from '@kit/assets/logo/simcc.svg';
import simccLogoWhite from '@kit/assets/logo/simcc-white.svg';
import { isApiError } from '@/api/errors';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

function getErrorDescription(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado ao carregar esta página. Tente novamente ou volte para a página inicial.';
}

/** Tela definitiva de erro (`errorComponent`) no padrão do Simcc Design Kit. */
export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleRetry = () => {
    reset();
    void router.invalidate();
  };

  const handleBack = () => {
    if (canGoBack) {
      router.history.back();
      return;
    }
    void router.navigate({ to: '/' });
  };

  const message = getErrorDescription(error);
  const devDetail =
    import.meta.env.DEV && error instanceof Error && !isApiError(error)
      ? error.message
      : null;

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
        <Card className="w-full max-w-lg">
          <CardHeader className="gap-3 pb-4">
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">Falha ao carregar o conteúdo</p>
                {devDetail && (
                  <p className="mt-1 font-mono text-xs break-all opacity-90">
                    {devDetail}
                  </p>
                )}
              </div>
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Algo deu errado
            </CardTitle>
            <CardDescription className="text-sm">{message}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleRetry}>
              <RotateCcw aria-hidden />
              Tentar novamente
            </Button>
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft aria-hidden />
              Voltar
            </Button>
            <Button variant="ghost" asChild>
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
