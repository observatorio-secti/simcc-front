import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ExternalLink,
  FilterX,
  Loader2,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  researcherListSearch,
  type AcademicResearcherListSearch,
} from '@/entities/academic/model';
import {
  academicCollectionDetailQueryOptions,
  academicInstitutionDetailQueryOptions,
  academicResearchersQueryOptions,
} from '@/entities/academic/queries';
import { triggerEtlRunMutationOptions } from '@/entities/etl/queries';
import { errorMessage } from '@/shared/lib/error-message';
import { isPlainLeftClick } from '@/shared/lib/plain-click';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
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
import { CollectionCombobox, InstitutionCombobox } from './academic-combobox';
import { ConsoleSearchBar } from './form-field';
import { ResearcherCreateDialog } from './researcher-create-dialog';

const SORT_OPTIONS: readonly SortOption<'name' | 'lattes_id' | 'created_at'>[] =
  [
    { value: 'name', label: 'Nome', defaultOrder: 'asc' },
    { value: 'lattes_id', label: 'Lattes ID', defaultOrder: 'asc' },
    { value: 'created_at', label: 'Data de cadastro', defaultOrder: 'desc' },
  ];

/** Listagem de pesquisadores (`/console/pesquisadores`). */
export function ResearchersPage({
  search,
  onOpenResearcher,
}: {
  search: AcademicResearcherListSearch;
  onOpenResearcher: (researcherId: string) => void;
}) {
  const navigate = useNavigate({ from: '/console/pesquisadores/' });
  const [createOpen, setCreateOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<{
    runId: string;
    name: string;
  } | null>(null);

  const query = useQuery({
    ...academicResearchersQueryOptions(
      researcherListSearch.toApiParams(search),
    ),
    placeholderData: keepPreviousData,
  });

  const selectedInstitutionQuery = useQuery({
    ...academicInstitutionDetailQueryOptions(search.institution_id ?? ''),
    enabled: Boolean(search.institution_id),
  });

  const selectedCollectionQuery = useQuery({
    ...academicCollectionDetailQueryOptions(search.collection_id ?? ''),
    enabled: Boolean(search.collection_id),
  });

  const syncMutation = useMutation({
    ...triggerEtlRunMutationOptions(),
    onSuccess: (result, variables) => {
      const triggeredLattes = variables.lattes_ids?.[0];
      const matched = items.find((item) => item.lattes_id === triggeredLattes);
      setLastSync({
        runId: result.run_id,
        name: matched?.name ?? triggeredLattes ?? 'Pesquisador',
      });
      toast.success('Sincronização iniciada.');
      setSyncingId(null);
    },
    onError: (error) => {
      toast.error(errorMessage(error));
      setSyncingId(null);
    },
  });

  function updateSearch(
    patch: Partial<AcademicResearcherListSearch>,
    options?: { resetPage?: boolean },
  ) {
    const next = researcherListSearch.update(search, patch, options);
    void navigate({ search: () => next });
  }

  const hasFilters = Boolean(
    search.q || search.institution_id || search.collection_id,
  );
  const items = query.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Pesquisadores
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie pesquisadores, vínculos institucionais, coleções e
            sincronização do Lattes.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden />
          Novo pesquisador
        </Button>
      </div>

      {lastSync && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-eng-blue/40 bg-brand-soft p-3 text-sm dark:bg-eng-blue/20"
        >
          <span>
            Sincronização de <strong>{lastSync.name}</strong> enviada para a
            fila.
          </span>
          <a
            href={`/console/etl/${lastSync.runId}`}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Ver execução no ETL
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ConsoleSearchBar
            value={search.q}
            placeholder="Pesquisar por nome ou Lattes ID"
            ariaLabel="Pesquisar pesquisadores por nome ou Lattes ID"
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <InstitutionCombobox
              value={search.institution_id}
              selectedLabel={
                selectedInstitutionQuery.data
                  ? `${selectedInstitutionQuery.data.acronym} — ${selectedInstitutionQuery.data.name}`
                  : undefined
              }
              onChange={(institution_id) => updateSearch({ institution_id })}
            />
          </div>
          <div className="w-full sm:w-64">
            <CollectionCombobox
              value={search.collection_id}
              selectedLabel={selectedCollectionQuery.data?.name}
              onChange={(collection_id) => updateSearch({ collection_id })}
            />
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                updateSearch({
                  q: undefined,
                  institution_id: undefined,
                  collection_id: undefined,
                })
              }
            >
              <FilterX aria-hidden />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {query.isPending ? (
        <LoadingBlock
          title="Carregando pesquisadores..."
          caption="Consultando o cadastro acadêmico"
        />
      ) : query.isError ? (
        <SectionError
          title="Não foi possível carregar os pesquisadores"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={
              hasFilters
                ? 'Nenhum pesquisador encontrado'
                : 'Nenhum pesquisador cadastrado'
            }
            description={
              hasFilters
                ? 'Ajuste a busca ou remova os filtros ativos.'
                : undefined
            }
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    updateSearch({
                      q: undefined,
                      institution_id: undefined,
                      collection_id: undefined,
                    })
                  }
                >
                  Limpar filtros
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
                <TableHead>Pesquisador</TableHead>
                <TableHead className="hidden md:table-cell">
                  Lattes ID
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Instituições
                </TableHead>
                <TableHead className="hidden xl:table-cell">Coleções</TableHead>
                <TableHead className="w-32 text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((researcher) => {
                const isSyncing =
                  syncMutation.isPending && syncingId === researcher.id;
                const affiliations = researcher.affiliations ?? [];
                const collections = researcher.collections ?? [];

                return (
                  <TableRow
                    key={researcher.id}
                    className="cursor-pointer"
                    onClick={(event) => {
                      if ((event.target as Element).closest('a, button'))
                        return;
                      onOpenResearcher(researcher.id);
                    }}
                  >
                    <TableCell className="max-w-0 font-medium md:max-w-none">
                      <Link
                        to="/console/pesquisadores/$researcherId"
                        params={{ researcherId: researcher.id }}
                        onClick={(event) => {
                          if (!isPlainLeftClick(event)) return;
                          event.preventDefault();
                          onOpenResearcher(researcher.id);
                        }}
                        className="block truncate hover:underline"
                      >
                        {researcher.name}
                      </Link>
                      <span className="block truncate font-mono text-xs text-muted-foreground md:hidden">
                        {researcher.lattes_id}
                      </span>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                      {researcher.lattes_id}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {affiliations.slice(0, 2).map((aff) => (
                          <Badge
                            key={aff.institution.id}
                            variant="outline"
                            size="sm"
                          >
                            {aff.institution.acronym}
                          </Badge>
                        ))}
                        {affiliations.length > 2 && (
                          <Badge variant="outline" size="sm">
                            +{affiliations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {collections.slice(0, 2).map((col) => (
                          <Badge
                            key={col.collection.id}
                            variant="outline"
                            size="sm"
                          >
                            {col.collection.name}
                          </Badge>
                        ))}
                        {collections.length > 2 && (
                          <Badge variant="outline" size="sm">
                            +{collections.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSyncing}
                        aria-label={`Sincronizar ${researcher.name}`}
                        onClick={() => {
                          setSyncingId(researcher.id);
                          syncMutation.mutate({
                            lattes_ids: [researcher.lattes_id],
                            force: false,
                          });
                        }}
                      >
                        {isSyncing ? (
                          <Loader2 className="animate-spin" aria-hidden />
                        ) : (
                          <RefreshCw aria-hidden />
                        )}
                        Sincronizar
                      </Button>
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

      <ResearcherCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          void navigate({
            to: '/console/pesquisadores/$researcherId',
            params: { researcherId: created.id },
          });
        }}
      />
    </div>
  );
}
