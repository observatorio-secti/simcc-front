import { createFileRoute } from '@tanstack/react-router';
import { HomePage, homeSearchSchema } from '@/features/search';

export const Route = createFileRoute('/_public/')({
  validateSearch: homeSearchSchema,
  staticData: { crumb: 'Página inicial' },
  component: PublicHomeRoute,
});

function PublicHomeRoute() {
  const { q, type } = Route.useSearch();
  return <HomePage initialQuery={q} initialType={type} />;
}
