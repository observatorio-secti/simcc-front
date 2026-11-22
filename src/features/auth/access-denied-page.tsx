import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  Check,
  Copy,
  LogIn,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeReturnTo } from '@/api/idp';
import {
  type SessionStore,
  sessionStore,
  useSession,
} from '@/entities/session';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/ui/card';
import { AuthShell } from './auth-shell';

export interface AccessDeniedPageProps {
  from?: string;
  reason?: 'idp_unconfigured';
  session?: SessionStore;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function SubField({ sub }: { sub: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(sub);
    if (ok) {
      setCopied(true);
      toast.success('Sub copiado.');
    } else {
      toast.error('Não foi possível copiar. Selecione o texto e copie.');
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-foreground">Seu sub no IdP</p>
      <div className="flex items-center gap-2 rounded-md border bg-card py-1 pr-1 pl-3">
        <code
          data-testid="session-sub"
          className="min-w-0 flex-1 font-mono text-xs break-all text-foreground select-all"
        >
          {sub}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copied ? 'Sub copiado' : 'Copiar sub'}
          onClick={() => void handleCopy()}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Envie este identificador a um administrador do Simcc para pedir acesso.
      </p>
    </div>
  );
}

/**
 * Tela de "sem acesso": o usuário está autenticado no IdP, mas
 * `GET <admin>/me` diz que não é admin (ou a API respondeu 403). Também cobre
 * o ambiente sem login configurado.
 */
export function AccessDeniedPage({
  from,
  reason,
  session = sessionStore,
}: AccessDeniedPageProps) {
  const { user, isAuthenticated, isIdpConfigured, login, logout } =
    useSession(session);
  const safeFrom = sanitizeReturnTo(from ?? '/');

  const accountLabel = user?.name || user?.email || null;
  const showSecondaryEmail =
    Boolean(user?.name) && Boolean(user?.email) && user?.name !== user?.email;

  const description =
    reason === 'idp_unconfigured'
      ? 'A autenticação administrativa não está configurada neste ambiente.'
      : isAuthenticated
        ? 'Sua conta está autenticada, mas não tem permissão de administrador no console do Simcc.'
        : 'O console do Simcc é restrito a administradores. Entre com uma conta que tenha permissão.';

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

          {isAuthenticated && user?.sub && reason !== 'idp_unconfigured' && (
            <SubField sub={user.sub} />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/">
                <ArrowLeft aria-hidden />
                Voltar ao observatório
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
