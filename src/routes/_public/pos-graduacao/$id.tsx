import { createFileRoute } from '@tanstack/react-router';
import { graduateProgramDetailQueryOptions } from '@/entities/graduate-program/queries';
import { GraduateProgramDetailPage } from '@/features/graduate-programs/graduate-program-detail-page';

export const Route = createFileRoute('/_public/pos-graduacao/$id')({
  staticData: { crumb: 'Programa de pós-graduação' },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      graduateProgramDetailQueryOptions(params.id),
    ),
  component: GraduateProgramDetailRoute,
});

function GraduateProgramDetailRoute() {
  const { id } = Route.useParams();
  return <GraduateProgramDetailPage programId={id} />;
}
