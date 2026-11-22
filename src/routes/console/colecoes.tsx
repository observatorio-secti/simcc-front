import { createFileRoute } from '@tanstack/react-router';
import { collectionListSearch } from '@/entities/academic/model';
import { academicCollectionsQueryOptions } from '@/entities/academic/queries';
import { CollectionsPage } from '@/features/console-academic';

export const Route = createFileRoute('/console/colecoes')({
  staticData: { crumb: 'Coleções' },
  validateSearch: collectionListSearch.schema,
  search: { middlewares: collectionListSearch.middlewares },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps }) => {
    void queryClient.prefetchQuery(
      academicCollectionsQueryOptions(
        collectionListSearch.toApiParams(deps.search),
      ),
    );
  },
  component: CollectionsRoute,
});

function CollectionsRoute() {
  const search = Route.useSearch();
  return <CollectionsPage search={search} />;
}
