import { useEffect, useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import {
  AlertTriangle,
  CheckCircle2,
  Home,
  LogIn,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/ui/card';
import { Spinner } from '@/shared/ui/loading-block';
import { AuthShell } from './auth-shell';
import {
  type SessionStore,
  sessionStore,
  useSession,
} from '@/entities/session';

export interface AuthCallbackPageProps {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
  session?: SessionStore;
}

type CallbackViewState =
  | { status: 'loading' }
  | { status: 'success' }
  | {
      status: 'error';
      message: string;
      returnTo: string;
      canRetryProfile: boolean;
    };

/**
 * Trata o retorno do IdP (`/auth/callback`), trocando o `code` via PKCE,
 * retomando o login interativo em `error=login_required` ou exibindo o erro
 * no padrão do Simcc Design Kit.
 */
export function AuthCallbackPage({
  code,
  state,
  error,
  errorDescription,
  session = sessionStore,
}: AuthCallbackPageProps) {
  const router = useRouter();
  const { isIdpConfigured, login, ensureSession, handleCallback } =
    useSession(session);
  const [view, setView] = useState<CallbackViewState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    void handleCallback({
      code,
      state,
      error,
      errorDescription,
    }).then((outcome) => {
      if (cancelled) return;

      if (outcome.kind === 'success') {
        setView({ status: 'success' });
        void router.navigate({ href: outcome.returnTo, replace: true });
        return;
      }

      if (outcome.kind === 'error') {
        setView({
          status: 'error',
          message: outcome.message,
          returnTo: outcome.returnTo,
          canRetryProfile: Boolean(outcome.canRetryProfile),
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, state, error, errorDescription, handleCallback, router]);

  async function handleRetryProfile() {
    if (view.status !== 'error') return;
    const target = view.returnTo;
    setView({ status: 'loading' });

    const next = await ensureSession();
    if (next.status === 'authenticated') {
      setView({ status: 'success' });
      void router.navigate({ href: target, replace: true });
      return;
    }

    setView({
      status: 'error',
      message: next.error?.message ?? 'Não foi possível validar as permissões.',
      returnTo: target,
      canRetryProfile: true,
    });
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md">
        {view.status === 'loading' && (
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <Spinner label="Autenticando" />
            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight">
                Autenticando...
              </h1>
              <p className="text-sm text-muted-foreground">
                Validando suas credenciais e preparando sua sessão.
              </p>
            </div>
          </CardContent>
        )}

        {view.status === 'success' && (
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle2 className="size-8 text-eng-blue" aria-hidden />
            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight">
                Sessão confirmada
              </h1>
              <p className="text-sm text-muted-foreground">
                Redirecionando você de volta à plataforma...
              </p>
            </div>
          </CardContent>
        )}

        {view.status === 'error' && (
          <>
            <CardHeader className="gap-3 pb-4">
              <div
                role="alert"
                className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p className="font-medium">Falha na autenticação</p>
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Não foi possível entrar
              </h1>
              <CardDescription className="text-sm">
                {view.message}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-wrap items-center gap-3">
              {view.canRetryProfile ? (
                <Button type="button" onClick={() => void handleRetryProfile()}>
                  <RotateCcw aria-hidden />
                  Tentar novamente
                </Button>
              ) : (
                isIdpConfigured && (
                  <Button
                    type="button"
                    onClick={() => void login({ returnTo: view.returnTo })}
                  >
                    <LogIn aria-hidden />
                    Tentar entrar novamente
                  </Button>
                )
              )}

              <Button variant="outline" asChild>
                <Link to="/">
                  <Home aria-hidden />
                  Página inicial
                </Link>
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
