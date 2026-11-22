import { useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/api/errors';
import {
  academicConflictMessage,
  institutionListSearch,
  type AcademicInstitution,
  type AcademicInstitutionListSearch,
} from '@/entities/academic/model';
import {
  academicInstitutionsQueryOptions,
  academicKeys,
  deleteInstitutionMutationOptions,
} from '@/entities/academic/queries';
import { errorMessage } from '@/shared/lib/error-message';
import { formatDate } from '@/shared/lib/format';
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
import { ConsoleSearchBar } from './form-field';
import { InstitutionDialog } from './institution-dialog';

const SORT_OPTIONS: readonly SortOption<'name' | 'acronym' | 'created_at'>[] = [
  { value: 'name', label: 'Nome', defaultOrder: 'asc' },
  { value: 'acronym', label: 'Sigla', defaultOrder: 'asc' },
  { value: 'created_at', label: 'Data de cadastro', defaultOrder: 'desc' },
];

/** Listagem de instituições (`/console/instituicoes`). */
export function InstitutionsPage({
  search,
}: {
  search: AcademicInstitutionListSearch;
}) {
  const navigate = useNavigate({ from: '/console/instituicoes/' });
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicInstitution | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<AcademicInstitution | null>(null);

  const query = useQuery({
    ...academicInstitutionsQueryOptions(
      institutionListSearch.toApiParams(search),
    ),
    placeholderData: keepPreviousData,
  });

  const deletion = useMutation({
    ...deleteInstitutionMutationOptions(),
    onSuccess: async () => {
      const removed = pendingDelete;
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      if (removed) {
        toast.success(`Instituição ${removed.acronym} excluída.`);
      }
      setPendingDelete(null);
    },
  });

  function updateSearch(
    patch: Partial<AcademicInstitutionListSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = institutionListSearch.update(search, patch, options);
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
          <h1 className="text-xl font-semibold tracking-tight">Instituições</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre instituições e gerencie os pesquisadores vinculados.
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
          Nova instituição
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ConsoleSearchBar
          value={search.q}
          placeholder="Pesquisar por sigla ou nome"
          ariaLabel="Pesquisar instituições por sigla ou nome"
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
          title="Carregando instituições..."
          caption="Consultando o cadastro acadêmico"
        />
      ) : query.isError ? (
        <SectionError
          title="Não foi possível carregar as instituições"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title={
              search.q
                ? 'Nenhuma instituição encontrada'
                : 'Nenhuma instituição cadastrada'
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
                <TableHead className="w-28">Sigla</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">
                  Cadastrada em
                </TableHead>
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((institution) => (
                <TableRow
                  key={institution.id}
                  className="cursor-pointer"
                  onClick={(event) => {
                    if ((event.target as Element).closest('a, button')) return;
                    void navigate({
                      to: '/console/instituicoes/$institutionId',
                      params: { institutionId: institution.id },
                    });
                  }}
                >
                  <TableCell>
                    <Badge variant="outline">{institution.acronym}</Badge>
                  </TableCell>
                  <TableCell className="max-w-0 font-medium md:max-w-none">
                    <Link
                      to="/console/instituicoes/$institutionId"
                      params={{ institutionId: institution.id }}
                      className="block truncate hover:underline"
                    >
                      {institution.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                    {formatDate(institution.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${institution.acronym}`}
                        onClick={() => {
                          setEditing(institution);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${institution.acronym}`}
                        onClick={() => {
                          deletion.reset();
                          setPendingDelete(institution);
                        }}
                      >
                        <Trash2 aria-hidden />
                      </Button>
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

      <InstitutionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        institution={editing}
      />

      <ConfirmImpactDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Excluir instituição?"
        description={
          pendingDelete && (
            <>
              <span className="font-medium text-foreground">
                {pendingDelete.acronym}
              </span>{' '}
              — {pendingDelete.name}
            </>
          )
        }
        impact={
          <p>
            Esta ação remove a instituição e desfaz seus vínculos com
            pesquisadores cadastrados.
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
