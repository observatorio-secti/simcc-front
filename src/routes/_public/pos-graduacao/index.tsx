import { createFileRoute, redirect } from '@tanstack/react-router';
import { graduateProgramListQueryOptions } from '@/entities/graduate-program/queries';
import { GraduateProgramsPage } from '@/features/graduate-programs/graduate-programs-page';
import {
  graduateProgramListSearch,
  toGraduateProgramQueryParams,
} from '@/features/graduate-programs/search';
import { firstParam, legacyParams } from '../../-redirects/legacy-params';

export const Route = createFileRoute('/_public/pos-graduacao/')({
  staticData: { crumb: 'Pós-graduação' },
  validateSearch: graduateProgramListSearch.schema,
  search: {
    middlewares: graduateProgramListSearch.middlewares,
  },
  // Legado (V2): `/pos-graduacao?graduate_program_id=…` abria o programa.
  beforeLoad: ({ location }) => {
    const id = firstParam(legacyParams(location.search), 'graduate_program_id');
    if (id) {
      throw redirect({
        to: '/pos-graduacao/$id',
        params: { id },
        search: {},
        replace: true,
      });
    }
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
