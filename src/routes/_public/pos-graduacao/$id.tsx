import { createFileRoute } from '@tanstack/react-router';
import { graduateProgramDetailQueryOptions } from '@/entities/graduate-program/queries';
import { GraduateProgramDetailPage } from '@/features/graduate-programs/graduate-program-detail-page';
import { graduateProgramDetailSearchSchema } from '@/features/graduate-programs/program-panels';

export const Route = createFileRoute('/_public/pos-graduacao/$id')({
  staticData: { crumb: 'Programa de pós-graduação' },
  validateSearch: graduateProgramDetailSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      graduateProgramDetailQueryOptions(params.id),
    ),
  component: GraduateProgramDetailRoute,
});

function GraduateProgramDetailRoute() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  return <GraduateProgramDetailPage programId={id} search={search} />;
}
