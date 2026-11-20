import { Link } from '@tanstack/react-router';
import { Home, LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { sanitizeReturnTo } from '@/api/idp';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/ui/card';
import { AuthShell } from './auth-shell';
import { type SessionStore, sessionStore } from './session-store';
import { useSession } from './use-session';

export interface AccessDeniedPageProps {
  from?: string;
  reason?: 'idp_unconfigured';
  session?: SessionStore;
}

/**
 * Tela de "sem acesso" exibida quando o usuário está autenticado no IdP mas
 * não possui `is_admin` em `GET <admin>/me`, ou quando o login não está
 * configurado no ambiente.
 */
export function AccessDeniedPage({
  from,
  reason,
  session = sessionStore,
}: AccessDeniedPageProps) {
  const { user, isAuthenticated, isIdpConfigured, login, logout } =
    useSession(session);
  const safeFrom = sanitizeReturnTo(from ?? '/');

  const accountLabel = user?.name || user?.email || user?.sub || null;
  const showSecondaryEmail =
    Boolean(user?.name) && Boolean(user?.email) && user?.name !== user?.email;

  const description =
    reason === 'idp_unconfigured'
      ? 'A autenticação administrativa não está configurada neste ambiente.'
      : 'Sua conta está autenticada, mas não possui permissão de administrador para acessar o console do Simcc.';

  return (
    <AuthShell>
      <Card className="w-full max-w-lg">
        <CardHeader className="gap-3 pb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldAlert className="size-4 text-eng-blue" aria-hidden />
            <span>Acesso restrito</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Sem acesso</h1>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {isAuthenticated && accountLabel && (
            <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Conta conectada</p>
              <p className="mt-0.5 break-all">
                {accountLabel}
                {showSecondaryEmail ? ` (${user?.email})` : ''}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/">
                <Home aria-hidden />
                Página inicial
              </Link>
            </Button>

            {isIdpConfigured && reason !== 'idp_unconfigured' && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void login({ prompt: 'login', returnTo: safeFrom })
                }
              >
                <LogIn aria-hidden />
                Trocar de conta
              </Button>
            )}

            {isAuthenticated && (
              <Button type="button" variant="ghost" onClick={() => logout()}>
                <LogOut aria-hidden />
                Sair
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
