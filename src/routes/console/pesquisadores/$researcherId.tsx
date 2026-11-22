import { createFileRoute } from '@tanstack/react-router';
import { academicResearcherDetailQueryOptions } from '@/entities/academic/queries';
import { ResearcherDetailPage } from '@/features/console-academic';

export const Route = createFileRoute('/console/pesquisadores/$researcherId')({
  staticData: { crumb: 'Pesquisador' },
  loader: ({ context: { queryClient }, params }) => {
    void queryClient.prefetchQuery(
      academicResearcherDetailQueryOptions(params.researcherId),
    );
  },
  component: ResearcherDetailRoute,
});

function ResearcherDetailRoute() {
  const { researcherId } = Route.useParams();
  return <ResearcherDetailPage researcherId={researcherId} />;
}
