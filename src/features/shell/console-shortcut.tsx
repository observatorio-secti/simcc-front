import { Link } from '@tanstack/react-router';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useSession } from '@/entities/session';
import { Button } from '@/shared/ui/button';

/**
 * Ações da topbar pública: atalho "Console" (visível para visitantes anônimos
 * e administradores; oculto para usuário autenticado sem `is_admin`) e botão
 * de autenticação ("Entrar" quando anônimo com IdP configurado, ou conta + "Sair"
 * quando autenticado).
 */
export function ConsoleShortcut() {
  const { isAuthenticated, isAdmin, isIdpConfigured, user, login, logout } =
    useSession();
  const showConsole = !isAuthenticated || isAdmin;
  const label = user?.name || user?.email || user?.sub;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {showConsole && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs font-medium"
        >
          <Link to="/console">
            <ShieldCheck aria-hidden />
            <span className="sr-only sm:not-sr-only">Console</span>
          </Link>
        </Button>
      )}

      {isAuthenticated ? (
        <>
          {label && (
            <span
              className="hidden max-w-48 truncate text-xs text-muted-foreground md:inline"
              title={user?.email ?? undefined}
            >
              {label}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-medium"
            onClick={() => logout()}
          >
            <LogOut aria-hidden />
            <span className="sr-only sm:not-sr-only">Sair</span>
          </Button>
        </>
      ) : (
        isIdpConfigured && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-medium"
            onClick={() => void login()}
          >
            <LogIn aria-hidden />
            <span className="sr-only sm:not-sr-only">Entrar</span>
          </Button>
        )
      )}
    </div>
  );
}
