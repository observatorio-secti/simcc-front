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
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AffiliationChipsGroup } from './institution-chip';
import { InstitutionCombobox } from './institution-combobox';
import { ResearcherDetailDrawer } from './researcher-detail-drawer';
import { ResearcherCreateDialog } from './researcher-create-dialog';
import { useResearchers } from '../../hooks/use-academic';
import { ResearcherItem } from '../../types/academic';

interface ResearcherListTableProps {
  fixedInstitutionId?: string; // Se presente, fixa e oculta o seletor de instituição
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

  // Estados de busca e paginação (sincronizados com URL se não for fixedInstitution)
  const initialSearch = searchParams.get('q') || '';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSortBy = (searchParams.get('sort_by') as any) || 'name';
  const initialSortOrder = (searchParams.get('sort_order') as any) || 'asc';
  const initialInstId =
    fixedInstitutionId || searchParams.get('institution_id') || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [institutionId, setInstitutionId] = useState(initialInstId);
  const [sortBy, setSortBy] = useState<'name' | 'lattes_id' | 'created_at'>(
    initialSortBy,
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Controle de drawers e modais
  const [selectedResearcherId, setSelectedResearcherId] = useState<
    string | null
  >(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Debounce na busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Atualiza URL apenas se não for fixedInstitution
  useEffect(() => {
    if (!fixedInstitutionId) {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.q = debouncedSearch;
      if (institutionId) params.institution_id = institutionId;
      if (page > 1) params.page = String(page);
      if (sortBy !== 'name') params.sort_by = sortBy;
      if (sortOrder !== 'asc') params.sort_order = sortOrder;
      setSearchParams(params, { replace: true });
    }
  }, [
    debouncedSearch,
    institutionId,
    page,
    sortBy,
    sortOrder,
    fixedInstitutionId,
    setSearchParams,
  ]);

  // Consulta paginada via TanStack Query
  const { data: response, isLoading, isError, refetch } = useResearchers({
    q: debouncedSearch || undefined,
    institution_id: fixedInstitutionId || institutionId || undefined,
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

  return (
    <div className="space-y-4">
      {/* Barra de Ações & Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou Lattes ID..."
              className="pl-9 h-9 text-xs border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Instituição (apenas na visão global) */}
          {!fixedInstitutionId && (
            <div className="w-[240px]">
              <InstitutionCombobox
                value={institutionId}
                onChange={(val) => {
                  setInstitutionId(val);
                  setPage(1);
                }}
                placeholder="Filtrar por instituição"
              />
            </div>
          )}
        </div>

        {/* Botão de Criação */}
        <Button
          type="button"
          size="sm"
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-9 gap-1.5 bg-[#559FB8] hover:bg-[#024A60] text-white text-xs font-semibold shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Novo Pesquisador
        </Button>
      </div>

      {/* Tabela de Pesquisadores */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50 dark:bg-neutral-800/60">
              <TableRow className="hover:bg-transparent border-b border-neutral-200 dark:border-neutral-800">
                <TableHead
                  onClick={() => handleSort('name')}
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Nome do Pesquisador
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort('lattes_id')}
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Lattes ID
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </TableHead>

                <TableHead className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Instituições Vinculadas
                </TableHead>

                <TableHead
                  onClick={() => handleSort('created_at')}
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none hidden md:table-cell"
                >
                  <div className="flex items-center gap-1.5">
                    Data de Cadastro
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </TableHead>

                <TableHead className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Status
                </TableHead>

                {onRemoveFromInstitution && (
                  <TableHead className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right">
                    Ações
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading */}
              {isLoading &&
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    {onRemoveFromInstitution && <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>}
                  </TableRow>
                ))}

              {/* Erro */}
              {!isLoading && isError && (
                <TableRow>
                  <TableCell
                    colSpan={onRemoveFromInstitution ? 6 : 5}
                    className="p-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Não foi possível carregar os pesquisadores.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="text-xs h-7 border-neutral-300 dark:border-neutral-700"
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
                    colSpan={onRemoveFromInstitution ? 6 : 5}
                    className="p-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        Nenhum pesquisador encontrado
                      </p>
                      <p className="text-xs text-neutral-500 max-w-sm">
                        {debouncedSearch || institutionId
                          ? 'Tente ajustar ou limpar seus filtros de busca.'
                          : 'Nenhum pesquisador foi cadastrado nesta instituição ainda.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Linhas */}
              {!isLoading &&
                !isError &&
                researchers.map((res) => {
                  const isMultiAffiliated =
                    (res.affiliations?.length || 0) > 1;

                  return (
                    <TableRow
                      key={res.researcher_id}
                      onClick={() => handleRowClick(res)}
                      className="cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800/60"
                    >
                      {/* Nome */}
                      <TableCell className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 font-sans py-3.5">
                        <div className="space-y-0.5">
                          <p>{res.name}</p>
                          {fixedInstitutionId && isMultiAffiliated && (
                            <p className="text-[10px] text-neutral-400 font-normal">
                              Também em:{' '}
                              {res.affiliations
                                ?.filter(
                                  (a) =>
                                    a.institution.id !== fixedInstitutionId,
                                )
                                .map((a) => a.institution.acronym)
                                .join(', ')}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Lattes ID */}
                      <TableCell className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        {res.lattes_id}
                      </TableCell>

                      {/* Vínculos */}
                      <TableCell>
                        <AffiliationChipsGroup
                          affiliations={res.affiliations}
                          maxVisible={2}
                        />
                      </TableCell>

                      {/* Data de Cadastro */}
                      <TableCell className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 hidden md:table-cell">
                        {new Date(res.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>

                      {/* Status ELT */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="gap-1 font-mono text-[10px] px-2 py-0 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400"
                        >
                          <Clock className="w-2.5 h-2.5" />
                          Aguardando ELT
                        </Badge>
                      </TableCell>

                      {/* Ação específica (desvincular desta instituição) */}
                      {onRemoveFromInstitution && (
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isRemoving}
                            onClick={() => onRemoveFromInstitution(res)}
                            className="h-7 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-2"
                          >
                            Remover da instituição
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé de Paginação */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
            <div>
              Mostrando{' '}
              <strong className="font-mono text-neutral-800 dark:text-neutral-200">
                {(page - 1) * pagination.per_page + 1}
              </strong>{' '}
              a{' '}
              <strong className="font-mono text-neutral-800 dark:text-neutral-200">
                {Math.min(page * pagination.per_page, pagination.total_items)}
              </strong>{' '}
              de{' '}
              <strong className="font-mono text-neutral-800 dark:text-neutral-200">
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
                className="h-8 text-xs border-neutral-300 dark:border-neutral-700 px-2.5 gap-1"
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
                className="h-8 text-xs border-neutral-300 dark:border-neutral-700 px-2.5 gap-1"
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
