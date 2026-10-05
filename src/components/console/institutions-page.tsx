import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Landmark,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import {
  useDeleteInstitution,
  useInstitutions,
} from '../../hooks/use-academic';
import { InstitutionPublic } from '../../types/academic';
import { InstitutionDialog } from './institution-dialog';
import { ConfirmImpactDialog } from './confirm-impact-dialog';

export function InstitutionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  const initialSearch = searchParams.get('q') || '';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSortBy = (searchParams.get('sort_by') as any) || 'acronym';
  const initialSortOrder = (searchParams.get('sort_order') as any) || 'asc';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<'name' | 'acronym' | 'created_at'>(
    initialSortBy,
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Modais de Criação/Edição e Exclusão
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] =
    useState<InstitutionPublic | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] =
    useState<InstitutionPublic | null>(null);

  const deleteMutation = useDeleteInstitution();

  // Debounce de busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // URL sync
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (page > 1) params.page = String(page);
    if (sortBy !== 'acronym') params.sort_by = sortBy;
    if (sortOrder !== 'asc') params.sort_order = sortOrder;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, page, sortBy, sortOrder, setSearchParams]);

  const { data: response, isLoading, isError, refetch } = useInstitutions({
    q: debouncedSearch || undefined,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const institutions = response?.data || [];
  const pagination = response?.pagination;

  const handleSort = (column: 'name' | 'acronym' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleOpenEdit = (inst: InstitutionPublic, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingInstitution(inst);
    setDialogOpen(true);
  };

  const handleOpenDelete = (inst: InstitutionPublic, e: React.MouseEvent) => {
    e.stopPropagation();
    setInstitutionToDelete(inst);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!institutionToDelete) return;
    await deleteMutation.mutateAsync(institutionToDelete.id);
    setDeleteConfirmOpen(false);
    setInstitutionToDelete(null);
  };

  return (
    <>
      <Helmet>
        <title>Instituições | Console Simcc</title>
        <meta
          name="description"
          content="Gerenciamento de instituições acadêmicas cadastradas no observatório"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-[#559FB8] text-[#07677e] dark:text-[#559FB8] bg-[#559FB8]/10 text-xs font-semibold px-2 py-0.5"
              >
                Plataforma
              </Badge>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Módulo Acadêmico
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
              Instituições de Ensino & Pesquisa
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
              Universidades, institutos e centros de pesquisa conveniados e
              monitorados pelo observatório.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditingInstitution(null);
                setDialogOpen(true);
              }}
              className="h-9 gap-1.5 bg-[#559FB8] hover:bg-[#024A60] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Nova Instituição
            </Button>
          </div>
        </div>

        {/* Barra de Filtro de Busca */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por sigla ou nome da instituição..."
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
        </div>

        {/* Tabela de Instituições */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50 dark:bg-neutral-800/60">
                <TableRow className="hover:bg-transparent border-b border-neutral-200 dark:border-neutral-800">
                  <TableHead
                    onClick={() => handleSort('acronym')}
                    className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none w-36"
                  >
                    <div className="flex items-center gap-1.5">
                      Sigla
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    onClick={() => handleSort('name')}
                    className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Nome da Instituição
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    onClick={() => handleSort('created_at')}
                    className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none hidden sm:table-cell w-44"
                  >
                    <div className="flex items-center gap-1.5">
                      Data de Cadastro
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </TableHead>

                  <TableHead className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right w-28">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Loading */}
                {isLoading &&
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28 font-mono" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))}

                {/* Erro */}
                {!isLoading && isError && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Não foi possível carregar as instituições cadastradas.
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
                {!isLoading && !isError && institutions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                          <Landmark className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                          Nenhuma instituição encontrada
                        </p>
                        <p className="text-xs text-neutral-500 max-w-sm">
                          {debouncedSearch
                            ? 'Nenhum resultado corresponde à sua pesquisa.'
                            : 'Cadastre a primeira instituição para iniciar os vínculos dos pesquisadores.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Linhas */}
                {!isLoading &&
                  !isError &&
                  institutions.map((inst) => (
                    <TableRow
                      key={inst.id}
                      onClick={() => navigate(`/console/instituicoes/${inst.id}`)}
                      className="cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800/60"
                    >
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs px-2.5 py-0.5 border-[#559FB8]/40 bg-[#559FB8]/10 text-[#07677e] dark:text-[#559FB8] font-bold"
                        >
                          {inst.acronym}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 font-sans">
                        {inst.name}
                      </TableCell>

                      <TableCell className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">
                        {new Date(inst.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>

                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleOpenEdit(inst, e)}
                            className="h-7 w-7 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                            title="Editar dados da instituição"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenDelete(inst, e)}
                              className="h-7 w-7 p-0 text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Excluir instituição"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                instituições
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

        {/* Modal de Criação / Edição */}
        <InstitutionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          institution={editingInstitution}
        />

        {/* Diálogo de Confirmação de Exclusão */}
        <ConfirmImpactDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Excluir Instituição"
          description={`Deseja realmente excluir a instituição "${institutionToDelete?.acronym} - ${institutionToDelete?.name}"?`}
          impactMessage="Todos os vínculos dos pesquisadores associados a esta instituição serão removidos."
          confirmLabel="Sim, excluir instituição"
          destructive
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </>
  );
}
