import { useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Layers, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/api/errors';
import {
  academicConflictMessage,
  collectionListSearch,
  type AcademicCollection,
  type AcademicCollectionListSearch,
} from '@/entities/academic/model';
import {
  academicCollectionsQueryOptions,
  academicKeys,
  deleteCollectionMutationOptions,
} from '@/entities/academic/queries';
import { errorMessage } from '@/shared/lib/error-message';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmImpactDialog } from '@/shared/ui/confirm-impact-dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { SectionError } from '@/shared/ui/section-error';
import { SortSelect, type SortOption } from '@/shared/ui/sort-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { CollectionDialog } from './collection-dialog';
import { ConsoleSearchBar } from './form-field';

const SORT_OPTIONS: readonly SortOption<
  'name' | 'slug' | 'researcher_count' | 'created_at'
>[] = [
  { value: 'name', label: 'Nome', defaultOrder: 'asc' },
  { value: 'slug', label: 'Slug', defaultOrder: 'asc' },
  { value: 'researcher_count', label: 'Pesquisadores', defaultOrder: 'desc' },
  { value: 'created_at', label: 'Data de cadastro', defaultOrder: 'desc' },
];

/** Listagem de coleções (`/console/colecoes`). */
export function CollectionsPage({
  search,
}: {
  search: AcademicCollectionListSearch;
}) {
  const navigate = useNavigate({ from: '/console/colecoes' });
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicCollection | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AcademicCollection | null>(
    null,
  );

  const query = useQuery({
    ...academicCollectionsQueryOptions(
      collectionListSearch.toApiParams(search),
    ),
    placeholderData: keepPreviousData,
  });

  const deletion = useMutation({
    ...deleteCollectionMutationOptions(),
    onSuccess: async () => {
      const removed = pendingDelete;
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      if (removed) {
        toast.success(`Coleção ${removed.name} excluída.`);
      }
      setPendingDelete(null);
    },
  });

  function updateSearch(
    patch: Partial<AcademicCollectionListSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = collectionListSearch.update(search, patch, options);
    void navigate({ search: () => next });
  }

  const deleteError = deletion.error
    ? isApiError(deletion.error) && deletion.error.status === 409
      ? academicConflictMessage(deletion.error.message)
      : errorMessage(deletion.error)
    : null;

  const items = query.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Coleções</h1>
          <p className="text-sm text-muted-foreground">
            Organize conjuntos de pesquisadores e frequências de atualização.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus aria-hidden />
          Nova coleção
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ConsoleSearchBar
          value={search.q}
          placeholder="Pesquisar por nome ou slug"
          ariaLabel="Pesquisar coleções por nome ou slug"
          onSubmit={(q) => updateSearch({ q })}
          onClear={() => updateSearch({ q: undefined })}
        />
        <SortSelect
          options={SORT_OPTIONS}
          value={search.sort_by}
          order={search.sort_order}
          showOrderToggle
          size="default"
          onChange={({ sort_by, sort_order }) =>
            updateSearch({ sort_by, sort_order })
          }
        />
      </div>

      {query.isPending ? (
        <LoadingBlock
          title="Carregando coleções..."
          caption="Consultando o cadastro acadêmico"
        />
      ) : query.isError ? (
        <SectionError
          title="Não foi possível carregar as coleções"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Layers}
            title={
              search.q
                ? 'Nenhuma coleção encontrada'
                : 'Nenhuma coleção cadastrada'
            }
            description={
              search.q ? `Nada corresponde a “${search.q}”.` : undefined
            }
            action={
              search.q ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateSearch({ q: undefined })}
                >
                  Limpar busca
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table aria-busy={query.isFetching || undefined}>
            <TableHeader>
              <TableRow>
                <TableHead>Coleção</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Atualização
                </TableHead>
                <TableHead className="text-right">Pesquisadores</TableHead>
                <TableHead className="w-36 text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((collection) => (
                <TableRow
                  key={collection.id}
                  className="cursor-pointer"
                  onClick={(event) => {
                    if ((event.target as Element).closest('a, button')) return;
                    void navigate({
                      to: '/console/pesquisadores',
                      search: { collection_id: collection.id },
                    });
                  }}
                >
                  <TableCell className="max-w-0 md:max-w-none">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-2 font-medium">
                        <Link
                          to="/console/pesquisadores"
                          search={{ collection_id: collection.id }}
                          className="truncate hover:underline"
                        >
                          {collection.name}
                        </Link>
                        {collection.is_default && (
                          <Badge variant="outline" size="sm">
                            Padrão
                          </Badge>
                        )}
                      </span>
                      {collection.description && (
                        <span className="truncate text-xs text-muted-foreground">
                          {collection.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {collection.slug}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums lg:table-cell">
                    {collection.refresh_interval_days === 1
                      ? '1 dia'
                      : `${collection.refresh_interval_days} dias`}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {collection.researcher_count}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Ver pesquisadores de ${collection.name}`}
                        title="Ver pesquisadores"
                      >
                        <Link
                          to="/console/pesquisadores"
                          search={{ collection_id: collection.id }}
                        >
                          <Users aria-hidden />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${collection.name}`}
                        onClick={() => {
                          setEditing(collection);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      {collection.is_default ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} className="inline-flex">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled
                                aria-label="A coleção padrão não pode ser excluída"
                              >
                                <Trash2 aria-hidden />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            A coleção padrão não pode ser excluída
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Excluir ${collection.name}`}
                          onClick={() => {
                            deletion.reset();
                            setPendingDelete(collection);
                          }}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {query.data && (
        <Pagination
          pagination={query.data.pagination}
          onPageChange={(page) => updateSearch({ page }, { resetPage: false })}
          onPerPageChange={(per_page) => updateSearch({ per_page })}
          disabled={query.isFetching}
        />
      )}

      <CollectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collection={editing}
      />

      <ConfirmImpactDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Excluir coleção?"
        description={
          pendingDelete && (
            <>
              <span className="font-medium text-foreground">
                {pendingDelete.name}
              </span>{' '}
              <span className="font-mono text-xs">({pendingDelete.slug})</span>
            </>
          )
        }
        impact={
          <p>
            A coleção será removida e os pesquisadores deixarão de pertencer a
            ela.
          </p>
        }
        confirmLabel="Excluir"
        pending={deletion.isPending}
        error={deleteError}
        onConfirm={() => {
          if (pendingDelete) deletion.mutate(pendingDelete.id);
        }}
      />
    </div>
  );
}
