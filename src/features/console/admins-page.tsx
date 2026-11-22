import { useState, type FormEvent } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/api/errors';
import {
  adminConflictMessage,
  adminDisplayName,
  adminListParams,
  adminListSearch,
  type Admin,
  type AdminListSearch,
} from '@/entities/admin/model';
import {
  adminKeys,
  adminListQueryOptions,
  deleteAdminMutationOptions,
} from '@/entities/admin/queries';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmImpactDialog } from '@/shared/ui/confirm-impact-dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { AddAdminDialog } from './add-admin-dialog';
import { errorMessage } from '@/shared/lib/error-message';
import { formatDate } from '@/shared/lib/format';
import { SectionError } from '@/shared/ui/section-error';

export interface AdminsPageProps {
  search: AdminListSearch;
  /** `sub` de quem está logado: a própria linha não pode ser removida. */
  currentSub: string | null;
}

function AdminIdentity({ admin, isSelf }: { admin: Admin; isSelf: boolean }) {
  const display = adminDisplayName(admin);
  const showEmail = Boolean(admin.email) && admin.email !== display;
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-2 font-medium">
        <span className="truncate">{display}</span>
        {isSelf && (
          <Badge variant="outline" size="sm">
            Você
          </Badge>
        )}
      </span>
      {showEmail && (
        <span className="truncate text-xs text-muted-foreground">
          {admin.email}
        </span>
      )}
      <span className="truncate font-mono text-xs text-muted-foreground md:hidden">
        {admin.sub}
      </span>
    </div>
  );
}

/** Gestão de administradores (`/console/admins`). */
export function AdminsPage({ search, currentSub }: AdminsPageProps) {
  const navigate = useNavigate({ from: '/console/admins' });
  const queryClient = useQueryClient();

  const [queryInput, setQueryInput] = useState(search.q ?? '');
  const [prevSearchQ, setPrevSearchQ] = useState(search.q);
  if (prevSearchQ !== search.q) {
    setPrevSearchQ(search.q);
    setQueryInput(search.q ?? '');
  }

  const [pendingRemoval, setPendingRemoval] = useState<Admin | null>(null);

  const query = useQuery({
    ...adminListQueryOptions(adminListParams(search)),
    placeholderData: keepPreviousData,
  });

  const removal = useMutation({
    ...deleteAdminMutationOptions(),
    onSuccess: async () => {
      const removed = pendingRemoval;
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
      if (removed) {
        toast.success(`${adminDisplayName(removed)} não é mais administrador.`);
      }
      setPendingRemoval(null);
    },
  });

  function updateSearch(
    patch: Partial<AdminListSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = adminListSearch.update(search, patch, options);
    void navigate({ search: () => next });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearch({ q: queryInput.trim() || undefined });
  }

  function handleClear() {
    setQueryInput('');
    if (search.q) updateSearch({ q: undefined });
  }

  function openRemoval(admin: Admin) {
    removal.reset();
    setPendingRemoval(admin);
  }

  const removalError = removal.error
    ? isApiError(removal.error) && removal.error.status === 409
      ? adminConflictMessage(removal.error.message)
      : errorMessage(removal.error)
    : null;

  const items = query.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Administradores
          </h1>
          <p className="text-sm text-muted-foreground">
            Quem está nesta lista acessa todo o console do Simcc.
          </p>
        </div>
        <AddAdminDialog />
      </div>

      <form
        role="search"
        aria-label="Buscar administradores"
        onSubmit={handleSearchSubmit}
        className="flex h-[52px] items-center gap-3 rounded-lg border bg-card px-4"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={queryInput}
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder="Pesquisar por nome, e-mail ou sub"
          aria-label="Pesquisar administradores por nome, e-mail ou sub"
          className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
        {queryInput && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            aria-label="Limpar busca"
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
        <Button type="submit" size="sm">
          Buscar
        </Button>
      </form>

      {query.isPending ? (
        <LoadingBlock
          title="Carregando administradores..."
          caption="Consultando a API de admin"
        />
      ) : query.isError ? (
        <SectionError
          title="Não foi possível carregar os administradores"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title={
              search.q
                ? 'Nenhum administrador encontrado'
                : 'Nenhum administrador cadastrado'
            }
            description={
              search.q ? `Nada corresponde a “${search.q}”.` : undefined
            }
            action={
              search.q ? (
                <Button type="button" variant="outline" onClick={handleClear}>
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
                <TableHead>Administrador</TableHead>
                <TableHead className="hidden md:table-cell">
                  Sub no IdP
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Cadastrado em
                </TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((admin) => {
                const isSelf = currentSub !== null && admin.sub === currentSub;
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="max-w-0 md:max-w-none">
                      <AdminIdentity admin={admin} isSelf={isSelf} />
                    </TableCell>
                    <TableCell className="hidden max-w-64 md:table-cell">
                      <span
                        className="block truncate font-mono text-xs"
                        title={admin.sub}
                      >
                        {admin.sub}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums lg:table-cell">
                      {formatDate(admin.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelf ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} className="inline-flex">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled
                                aria-label="Você não pode remover a si mesmo"
                              >
                                <Trash2 aria-hidden />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            Você não pode remover a si mesmo
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remover ${adminDisplayName(admin)}`}
                          onClick={() => openRemoval(admin)}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <ConfirmImpactDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
        title="Remover administrador?"
        description={
          pendingRemoval && (
            <>
              <span className="font-medium text-foreground">
                {adminDisplayName(pendingRemoval)}
              </span>{' '}
              <span className="font-mono text-xs break-all">
                ({pendingRemoval.sub})
              </span>
            </>
          )
        }
        impact={
          <>
            <p>Esta conta perde o acesso ao console na próxima ação.</p>
            <p className="text-muted-foreground">
              Para devolver o acesso, será preciso cadastrar o sub de novo.
            </p>
          </>
        }
        confirmLabel="Remover"
        pending={removal.isPending}
        error={removalError}
        onConfirm={() => {
          if (pendingRemoval) removal.mutate(pendingRemoval.id);
        }}
      />
    </div>
  );
}
