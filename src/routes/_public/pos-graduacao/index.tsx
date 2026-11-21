import { createFileRoute } from '@tanstack/react-router';
import { graduateProgramListQueryOptions } from '@/entities/graduate-program/queries';
import { GraduateProgramsPage } from '@/features/graduate-programs/graduate-programs-page';
import {
  graduateProgramListSearch,
  toGraduateProgramQueryParams,
} from '@/features/graduate-programs/search';

export const Route = createFileRoute('/_public/pos-graduacao/')({
  staticData: { crumb: 'Pós-graduação' },
  validateSearch: graduateProgramListSearch.schema,
  search: {
    middlewares: graduateProgramListSearch.middlewares,
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      graduateProgramListQueryOptions(toGraduateProgramQueryParams(deps)),
    ),
  component: GraduateProgramsRoute,
});

function GraduateProgramsRoute() {
  const search = Route.useSearch();
  return <GraduateProgramsPage search={search} />;
}
