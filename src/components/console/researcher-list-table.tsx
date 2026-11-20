import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AffiliationChipsGroup } from './institution-chip';
import { InstitutionCombobox } from './institution-combobox';
import { ResearcherDetailDrawer } from './researcher-detail-drawer';
import { ResearcherCreateDialog } from './researcher-create-dialog';
import { useCollections, useResearchers } from '../../hooks/use-academic';
import { useTriggerEtlRun } from '../../hooks/use-etl';
import { useAuth } from '../../hooks/use-auth';
import { ResearcherItem } from '../../types/academic';
import { toast } from 'sonner';

interface ResearcherListTableProps {
  fixedInstitutionId?: string;
  fixedInstitutionName?: string;
  onRemoveFromInstitution?: (researcher: ResearcherItem) => void;
  isRemoving?: boolean;
}

export function ResearcherListTable({
  fixedInstitutionId,
  fixedInstitutionName,
  onRemoveFromInstitution,
  isRemoving,
}: ResearcherListTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const initialSearch = searchParams.get('q') || '';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSortBy = (searchParams.get('sort_by') as any) || 'name';
  const initialSortOrder = (searchParams.get('sort_order') as any) || 'asc';
  const initialInstId =
    fixedInstitutionId || searchParams.get('institution_id') || '';
  const initialColId = searchParams.get('collection_id') || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [institutionId, setInstitutionId] = useState(initialInstId);
  const [collectionId, setCollectionId] = useState(initialColId);
  const [sortBy, setSortBy] = useState<'name' | 'lattes_id' | 'created_at'>(
    initialSortBy,
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const [selectedResearcherId, setSelectedResearcherId] = useState<
    string | null
  >(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [syncingLattesId, setSyncingLattesId] = useState<string | null>(null);

  const triggerMutation = useTriggerEtlRun();
  const { data: collectionsData } = useCollections({ per_page: 50 });
  const collections = collectionsData?.data || [];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!fixedInstitutionId) {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.q = debouncedSearch;
      if (institutionId) params.institution_id = institutionId;
      if (collectionId) params.collection_id = collectionId;
      if (page > 1) params.page = String(page);
      if (sortBy !== 'name') params.sort_by = sortBy;
      if (sortOrder !== 'asc') params.sort_order = sortOrder;
      setSearchParams(params, { replace: true });
    }
  }, [
    debouncedSearch,
    institutionId,
    collectionId,
    page,
    sortBy,
    sortOrder,
    fixedInstitutionId,
    setSearchParams,
  ]);

  const { data: response, isLoading, isError, refetch } = useResearchers({
    q: debouncedSearch || undefined,
    institution_id: fixedInstitutionId || institutionId || undefined,
    collection_id: collectionId || undefined,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const researchers = response?.data || [];
  const pagination = response?.pagination;

  const handleSort = (column: 'name' | 'lattes_id' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (researcher: ResearcherItem) => {
    setSelectedResearcherId(researcher.researcher_id);
    setIsDetailDrawerOpen(true);
  };

  const handleQuickSync = async (res: ResearcherItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncingLattesId(res.lattes_id);
    try {
      await triggerMutation.mutateAsync({
        lattes_ids: [res.lattes_id],
        triggered_by: user?.email || user?.username || 'admin',
      });
      toast.success(`Sincronização iniciada para ${res.name}`);
    } catch {
      // toast tratado no hook
    } finally {
      setSyncingLattesId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações & Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sm-navy-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou Lattes ID..."
              className="pl-9 h-9 text-xs border-sm-wave-gray focus:border-sm-sky-600 bg-white rounded-sm text-sm-navy"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm-navy-600 hover:text-sm-navy"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Instituição */}
          {!fixedInstitutionId && (
            <div className="w-[200px]">
              <InstitutionCombobox
                value={institutionId}
                onChange={(val) => {
                  setInstitutionId(val);
                  setPage(1);
                }}
                placeholder="Instituição"
              />
            </div>
          )}

          {/* Filtro por Coleção */}
          {collections.length > 0 && (
            <div className="w-[180px]">
              <select
                value={collectionId}
                onChange={(e) => {
                  setCollectionId(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 text-xs border border-sm-wave-gray rounded-sm bg-white px-2.5 text-sm-navy focus:border-sm-sky-600"
              >
                <option value="">Todas as coleções</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Botão de Criação */}
        <button
          type="button"
          onClick={() => setIsCreateDialogOpen(true)}
          className="sm-btn text-xs py-2 px-4 gap-1.5 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Novo Pesquisador
        </button>
      </div>

      {/* Tabela de Pesquisadores */}
      <div className="rounded-md border border-sm-wave-gray bg-white overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <Table className="sm-table">
            <thead>
              <tr>
                <TableHead
                  onClick={() => handleSort('name')}
                  className="cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Nome do Pesquisador
                    <ArrowUpDown className="w-3 h-3 text-sm-navy-600" />
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort('lattes_id')}
                  className="cursor-pointer select-none w-36"
                >
                  <div className="flex items-center gap-1.5">
                    Lattes ID
                    <ArrowUpDown className="w-3 h-3 text-sm-navy-600" />
                  </div>
                </TableHead>

                <TableHead>
                  Vínculos
                </TableHead>

                <TableHead>
                  Coleções
                </TableHead>

                <TableHead
                  onClick={() => handleSort('created_at')}
                  className="cursor-pointer select-none hidden md:table-cell w-36"
                >
                  <div className="flex items-center gap-1.5">
                    Data de Cadastro
                    <ArrowUpDown className="w-3 h-3 text-sm-navy-600" />
                  </div>
                </TableHead>

                <TableHead className="text-right w-28">
                  Ação
                </TableHead>
              </tr>
            </thead>

            <TableBody>
              {/* Loading */}
              {isLoading &&
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14 ml-auto" /></TableCell>
                  </TableRow>
                ))}

              {/* Erro */}
              {!isLoading && isError && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="p-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-sm-red-700">
                        Não foi possível carregar os pesquisadores.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="text-xs h-7 border-sm-wave-gray text-sm-navy"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Vazio */}
              {!isLoading && !isError && researchers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="p-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 rounded-full bg-sm-wash text-sm-navy">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-extrabold text-sm-navy">
                        Nenhum pesquisador encontrado
                      </p>
                      <p className="text-xs text-sm-navy-600 max-w-sm">
                        {debouncedSearch || institutionId || collectionId
                          ? 'Tente ajustar ou limpar seus filtros de busca.'
                          : 'Nenhum pesquisador cadastrado nesta seleção.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Linhas */}
              {!isLoading &&
                !isError &&
                researchers.map((res) => {
                  const isSyncing = syncingLattesId === res.lattes_id;

                  return (
                    <TableRow
                      key={res.researcher_id}
                      onClick={() => handleRowClick(res)}
                      className="cursor-pointer hover:bg-sm-wash/50 transition-colors"
                    >
                      {/* Nome */}
                      <TableCell className="py-3">
                        <span className="font-extrabold text-xs text-sm-navy block">
                          {res.name}
                        </span>
                      </TableCell>

                      {/* Lattes ID */}
                      <TableCell className="font-mono text-xs text-sm-navy-600">
                        {res.lattes_id}
                      </TableCell>

                      {/* Vínculos */}
                      <TableCell>
                        <AffiliationChipsGroup
                          affiliations={res.affiliations}
                          maxVisible={2}
                        />
                      </TableCell>

                      {/* Coleções */}
                      <TableCell>
                        {res.collections && res.collections.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {res.collections.slice(0, 2).map((c, idx) => (
                              <span
                                key={idx}
                                className="sm-tag text-[10px] py-0.5 px-1.5"
                              >
                                {c.collection.name}
                              </span>
                            ))}
                            {res.collections.length > 2 && (
                              <span className="sm-tag text-[10px] py-0.5 px-1.5 bg-sm-wash text-sm-navy-600">
                                +{res.collections.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-sm-navy-600 italic">-</span>
                        )}
                      </TableCell>

                      {/* Data de Cadastro */}
                      <TableCell className="font-mono text-[11px] text-sm-navy-600 hidden md:table-cell">
                        {new Date(res.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>

                      {/* Ação */}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSyncing || triggerMutation.isPending}
                            onClick={(e) => handleQuickSync(res, e)}
                            className="h-7 text-xs text-sm-navy hover:bg-sm-wash px-2 gap-1"
                            title="Sincronizar Lattes deste pesquisador"
                          >
                            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Sincronizar</span>
                          </Button>
                          {onRemoveFromInstitution && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isRemoving}
                              onClick={() => onRemoveFromInstitution(res)}
                              className="h-7 text-[11px] text-sm-red-700 hover:bg-sm-red-100/50 px-2"
                            >
                              Desvincular
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé de Paginação */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-sm-wave-gray text-xs text-sm-navy-600 bg-white">
            <div>
              Mostrando{' '}
              <strong className="font-mono text-sm-navy">
                {(page - 1) * pagination.per_page + 1}
              </strong>{' '}
              a{' '}
              <strong className="font-mono text-sm-navy">
                {Math.min(page * pagination.per_page, pagination.total_items)}
              </strong>{' '}
              de{' '}
              <strong className="font-mono text-sm-navy">
                {pagination.total_items}
              </strong>{' '}
              pesquisadores
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_prev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 text-xs border-sm-wave-gray text-sm-navy px-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </Button>
              <span className="font-mono px-2 text-xs">
                {page} / {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 text-xs border-sm-wave-gray text-sm-navy px-2"
              >
                Próxima
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer de Detalhes do Pesquisador */}
      <ResearcherDetailDrawer
        researcherId={selectedResearcherId}
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      />

      {/* Modal de Criação de Pesquisador */}
      <ResearcherCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        preselectedInstitutionId={fixedInstitutionId}
        onCreatedSuccess={(newId) => {
          setSelectedResearcherId(newId);
          setIsDetailDrawerOpen(true);
        }}
      />
    </div>
  );
}
