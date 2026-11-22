import { useEffect, type ReactNode } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import {
  type SessionStore,
  sessionStore,
  useSession,
} from '@/entities/session';
import { Button } from '@/shared/ui/button';
import { ConsoleSidebarNav } from './console-sidebar-nav';
import { PublicLayout } from './public-layout';

export type ConsoleLayoutProps = {
  children: ReactNode;
  session?: SessionStore;
};

function ConsoleAccount({ session }: { session: SessionStore }) {
  const { user, logout } = useSession(session);
  const label = user?.name || user?.email || user?.sub;

  return (
    <div className="flex min-w-0 items-center gap-2">
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
    </div>
  );
}

/**
 * Moldura do console: a mesma do kit público, com o menu administrativo e a
 * conta na topbar. Se uma chamada da API de admin responder 403 no meio da
 * sessão, a store marca `isAdmin = false` e a tela cai para "sem acesso".
 */
export function ConsoleLayout({
  children,
  session = sessionStore,
}: ConsoleLayoutProps) {
  const { status, isAdmin } = useSession(session);
  const lostAccess = status === 'authenticated' && !isAdmin;
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (!lostAccess) return;
    void navigate({
      to: '/auth/sem-acesso',
      search: { from: router.latestLocation.href },
      replace: true,
    });
  }, [lostAccess, navigate, router]);

  if (lostAccess) return null;

  return (
    <PublicLayout
      renderNav={ConsoleSidebarNav}
      mobileNavDescription="Menu do console administrativo"
      topbarActions={<ConsoleAccount session={session} />}
    >
      {children}
    </PublicLayout>
  );
}
