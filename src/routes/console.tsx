import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAdmin } from '@/entities/session';
import { ErrorPage } from '@/features/errors/error-page';
import { ConsoleLayout } from '@/features/shell/console-layout';

// Console administrativo (T12). A guarda exige sessão e `is_admin` de
// `GET <admin>/me` (ADR 0008): sem sessão, retoma com `prompt=none`; sem
// permissão, vai para "sem acesso".
export const Route = createFileRoute('/console')({
  staticData: { crumb: 'Console' },
  beforeLoad: requireAdmin,
  errorComponent: ErrorPage,
  component: ConsoleRoute,
});

function ConsoleRoute() {
  const { session } = Route.useRouteContext();
  return (
    <ConsoleLayout session={session}>
      <Outlet />
    </ConsoleLayout>
  );
}
