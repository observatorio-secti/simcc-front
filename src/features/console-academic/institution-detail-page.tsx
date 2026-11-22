import { useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Unlink,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/api/errors';
import {
  academicConflictMessage,
  institutionDetailResearcherSearch,
  type AcademicResearcher,
  type InstitutionDetailResearcherSearch,
} from '@/entities/academic/model';
import {
  academicInstitutionDetailQueryOptions,
  academicKeys,
  academicResearchersQueryOptions,
  addResearcherAffiliationMutationOptions,
  deleteInstitutionMutationOptions,
  removeResearcherAffiliationMutationOptions,
} from '@/entities/academic/queries';
import { errorMessage } from '@/shared/lib/error-message';
import { formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmImpactDialog } from '@/shared/ui/confirm-impact-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
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
import { ResearcherCombobox } from './academic-combobox';
import { ConsoleSearchBar } from './form-field';
import { InstitutionDialog } from './institution-dialog';
import { ResearcherCreateDialog } from './researcher-create-dialog';

const SORT_OPTIONS: readonly SortOption<'name' | 'lattes_id' | 'created_at'>[] =
  [
    { value: 'name', label: 'Nome', defaultOrder: 'asc' },
    { value: 'lattes_id', label: 'Lattes ID', defaultOrder: 'asc' },
    { value: 'created_at', label: 'Data de cadastro', defaultOrder: 'desc' },
  ];

/** Detalhe da instituição (`/console/instituicoes/$institutionId`). */
export function InstitutionDetailPage({
  institutionId,
  search,
}: {
  institutionId: string;
  search: InstitutionDetailResearcherSearch;
}) {
  const navigate = useNavigate({
    from: '/console/instituicoes/$institutionId',
  });
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createResearcherOpen, setCreateResearcherOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedResearcherId, setSelectedResearcherId] = useState<
    string | undefined
  >(undefined);
  const [pendingUnlink, setPendingUnlink] = useState<AcademicResearcher | null>(
    null,
  );

  const institutionQuery = useQuery(
    academicInstitutionDetailQueryOptions(institutionId),
  );

  const researchersQuery = useQuery({
    ...academicResearchersQueryOptions({
      ...institutionDetailResearcherSearch.toApiParams(search),
      institution_id: institutionId,
    }),
    placeholderData: keepPreviousData,
  });

  const deleteInstitutionMutation = useMutation({
    ...deleteInstitutionMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success('Instituição excluída.');
      setDeleteOpen(false);
      void navigate({ to: '/console/instituicoes' });
    },
  });

  const linkMutation = useMutation({
    ...addResearcherAffiliationMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success('Pesquisador vinculado à instituição.');
      setSelectedResearcherId(undefined);
      setLinkOpen(false);
    },
    onError: (error) => {
      const msg =
        isApiError(error) && error.status === 409
          ? academicConflictMessage(error.message)
          : errorMessage(error);
      toast.error(msg);
    },
  });

  const unlinkMutation = useMutation({
    ...removeResearcherAffiliationMutationOptions(),
    onSuccess: async () => {
      const unlinked = pendingUnlink;
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      if (unlinked) {
        toast.success(`${unlinked.name} desvinculado da instituição.`);
      }
      setPendingUnlink(null);
    },
  });

  function updateSearch(
    patch: Partial<InstitutionDetailResearcherSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = institutionDetailResearcherSearch.update(
      search,
      patch,
      options,
    );
    void navigate({ search: () => next });
  }

  if (institutionQuery.isPending) {
    return (
      <LoadingBlock
        title="Carregando instituição..."
        caption="Consultando o cadastro acadêmico"
      />
    );
  }

  if (institutionQuery.isError || !institutionQuery.data) {
    return (
      <SectionError
        title="Não foi possível carregar a instituição"
        error={institutionQuery.error}
        onRetry={() => void institutionQuery.refetch()}
      />
    );
  }

  const institution = institutionQuery.data;
  const researchers = researchersQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{institution.acronym}</Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              Cadastrada em {formatDate(institution.created_at)}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {institution.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil aria-hidden />
            Editar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              deleteInstitutionMutation.reset();
              setDeleteOpen(true);
            }}
          >
            <Trash2 aria-hidden />
            Excluir
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Pesquisadores vinculados</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedResearcherId(undefined);
              setLinkOpen(true);
            }}
          >
            <Link2 aria-hidden />
            Vincular existente
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateResearcherOpen(true)}
          >
            <Plus aria-hidden />
            Novo pesquisador
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ConsoleSearchBar
          value={search.q}
          placeholder="Pesquisar pesquisador por nome ou Lattes ID"
          ariaLabel="Pesquisar pesquisadores vinculados"
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

      {researchersQuery.isPending ? (
        <LoadingBlock
          title="Carregando pesquisadores..."
          caption="Consultando os vínculos da instituição"
        />
      ) : researchersQuery.isError ? (
        <SectionError
          title="Não foi possível carregar os pesquisadores vinculados"
          error={researchersQuery.error}
          onRetry={() => void researchersQuery.refetch()}
        />
      ) : researchers.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={
              search.q
                ? 'Nenhum pesquisador encontrado'
                : 'Nenhum pesquisador vinculado'
            }
            description={
              search.q
                ? `Nada corresponde a “${search.q}”.`
                : 'Vincule um pesquisador existente ou cadastre um novo.'
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
          <Table aria-busy={researchersQuery.isFetching || undefined}>
            <TableHeader>
              <TableRow>
                <TableHead>Pesquisador</TableHead>
                <TableHead className="hidden md:table-cell">
                  Lattes ID
                </TableHead>
                <TableHead className="hidden lg:table-cell">Coleções</TableHead>
                <TableHead className="w-28 text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {researchers.map((researcher) => (
                <TableRow key={researcher.id}>
                  <TableCell className="max-w-0 font-medium md:max-w-none">
                    <Link
                      to="/console/pesquisadores/$researcherId"
                      params={{ researcherId: researcher.id }}
                      className="block truncate hover:underline"
                    >
                      {researcher.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {researcher.lattes_id}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(researcher.collections ?? []).map((col) => (
                        <Badge
                          key={col.collection.id}
                          variant="outline"
                          size="sm"
                        >
                          {col.collection.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        unlinkMutation.reset();
                        setPendingUnlink(researcher);
                      }}
                    >
                      <Unlink aria-hidden />
                      Desvincular
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {researchersQuery.data && (
        <Pagination
          pagination={researchersQuery.data.pagination}
          onPageChange={(page) => updateSearch({ page }, { resetPage: false })}
          onPerPageChange={(per_page) => updateSearch({ per_page })}
          disabled={researchersQuery.isFetching}
        />
      )}

      <InstitutionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        institution={institution}
      />

      <ResearcherCreateDialog
        open={createResearcherOpen}
        onOpenChange={setCreateResearcherOpen}
        defaultInstitution={institution}
      />

      <Dialog
        open={linkOpen}
        onOpenChange={(next) => {
          if (!next && linkMutation.isPending) return;
          setLinkOpen(next);
        }}
      >
        <DialogContent showCloseButton={!linkMutation.isPending}>
          <DialogHeader>
            <DialogTitle>Vincular pesquisador existente</DialogTitle>
            <DialogDescription>
              Selecione um pesquisador já cadastrado para vincular a{' '}
              <strong>{institution.acronym}</strong>.
            </DialogDescription>
          </DialogHeader>

          <ResearcherCombobox
            value={selectedResearcherId}
            onChange={setSelectedResearcherId}
            excludeInstitutionId={institution.id}
            disabled={linkMutation.isPending}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={linkMutation.isPending}
              onClick={() => setLinkOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!selectedResearcherId || linkMutation.isPending}
              onClick={() => {
                if (!selectedResearcherId) return;
                linkMutation.mutate({
                  researcherId: selectedResearcherId,
                  institutionId: institution.id,
                });
              }}
            >
              {linkMutation.isPending && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmImpactDialog
        open={pendingUnlink !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUnlink(null);
        }}
        tone="default"
        title="Desvincular pesquisador?"
        description={
          pendingUnlink && (
            <>
              <span className="font-medium text-foreground">
                {pendingUnlink.name}
              </span>{' '}
              deixará de estar vinculado a {institution.acronym}.
            </>
          )
        }
        confirmLabel="Desvincular"
        pending={unlinkMutation.isPending}
        error={unlinkMutation.error ? errorMessage(unlinkMutation.error) : null}
        onConfirm={() => {
          if (pendingUnlink) {
            unlinkMutation.mutate({
              researcherId: pendingUnlink.id,
              institutionId: institution.id,
            });
          }
        }}
      />

      <ConfirmImpactDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir instituição?"
        description={
          <>
            <span className="font-medium text-foreground">
              {institution.acronym}
            </span>{' '}
            — {institution.name}
          </>
        }
        impact={
          <p>
            Esta ação remove a instituição e desfaz seus vínculos com
            pesquisadores cadastrados.
          </p>
        }
        confirmLabel="Excluir"
        pending={deleteInstitutionMutation.isPending}
        error={
          deleteInstitutionMutation.error
            ? errorMessage(deleteInstitutionMutation.error)
            : null
        }
        onConfirm={() => deleteInstitutionMutation.mutate(institution.id)}
      />
    </div>
  );
}
