import { createFileRoute } from '@tanstack/react-router';
import { adminListParams, adminListSearch } from '@/entities/admin/model';
import { adminListQueryOptions } from '@/entities/admin/queries';
import { useSession } from '@/entities/session';
import { AdminsPage } from '@/features/console/admins-page';

export const Route = createFileRoute('/console/admins')({
  staticData: { crumb: 'Administradores' },
  validateSearch: adminListSearch.schema,
  search: { middlewares: adminListSearch.middlewares },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps }) => {
    void queryClient.prefetchQuery(
      adminListQueryOptions(adminListParams(deps.search)),
    );
  },
  component: AdminsRoute,
});

function AdminsRoute() {
  const search = Route.useSearch();
  const { session } = Route.useRouteContext();
  const { user } = useSession(session);
  return <AdminsPage search={search} currentSub={user?.sub ?? null} />;
}
