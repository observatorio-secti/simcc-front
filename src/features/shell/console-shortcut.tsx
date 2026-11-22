import { Link } from '@tanstack/react-router';
import { ShieldCheck } from 'lucide-react';
import { useSession } from '@/entities/session';
import { Button } from '@/shared/ui/button';

/**
 * Atalho "Console" da topbar pública: só aparece para quem tem `is_admin`
 * (lido de `GET <admin>/me`, nunca do token). Anônimo e logado sem permissão
 * não veem o botão.
 */
export function ConsoleShortcut() {
  const { isAuthenticated, isAdmin } = useSession();
  if (!isAuthenticated || !isAdmin) return null;

  return (
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
  );
}
