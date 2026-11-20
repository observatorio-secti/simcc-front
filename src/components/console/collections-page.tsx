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
import { Skeleton } from '../ui/skeleton';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Layers,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import {
  useCollections,
  useDeleteCollection,
} from '../../hooks/use-academic';
import { CollectionPublic } from '../../types/academic';
import { CollectionDialog } from './collection-dialog';
import { ConfirmImpactDialog } from './confirm-impact-dialog';

export function CollectionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  const initialSearch = searchParams.get('q') || '';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSortBy = (searchParams.get('sort_by') as any) || 'name';
  const initialSortOrder = (searchParams.get('sort_order') as any) || 'asc';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<'name' | 'slug' | 'created_at'>(
    initialSortBy,
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Modais de Criação/Edição e Exclusão
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionPublic | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] =
    useState<CollectionPublic | null>(null);

  const deleteMutation = useDeleteCollection();

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
    if (sortBy !== 'name') params.sort_by = sortBy;
    if (sortOrder !== 'asc') params.sort_order = sortOrder;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, page, sortBy, sortOrder, setSearchParams]);

  const { data: response, isLoading, isError, refetch } = useCollections({
    q: debouncedSearch || undefined,
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const collections = response?.data || [];
  const pagination = response?.pagination;

  const handleSort = (column: 'name' | 'slug' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleOpenEdit = (col: CollectionPublic, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(col);
    setDialogOpen(true);
  };

  const handleOpenDelete = (col: CollectionPublic, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionToDelete(col);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;
    await deleteMutation.mutateAsync(collectionToDelete.id);
    setDeleteConfirmOpen(false);
    setCollectionToDelete(null);
  };

  return (
    <>
      <Helmet>
        <title>Coleções | Console Simcc</title>
        <meta
          name="description"
          content="Gerenciamento de coleções e grupos de monitoramento do Simcc"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto bg-sm-canvas min-h-screen">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sm-wave-gray pb-5">
          <div className="space-y-1">
            <p className="sm-eyebrow">CADASTRO ACADÊMICO · <b>COLEÇÕES</b></p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-sm-navy font-sans">
              Coleções de Pesquisadores
            </h1>
            <p className="text-xs md:text-sm text-sm-navy-600">
              Agrupamentos temáticos ou institucionais com frequências programadas de atualização.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                setEditingCollection(null);
                setDialogOpen(true);
              }}
              className="sm-btn text-xs py-2 px-4 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nova Coleção
            </button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sm-navy-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou slug da coleção..."
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
        </div>

        {/* Tabela de Coleções */}
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
                      Nome da Coleção
                      <ArrowUpDown className="w-3 h-3 text-sm-navy-600" />
                    </div>
                  </TableHead>

                  <TableHead
                    onClick={() => handleSort('slug')}
                    className="cursor-pointer select-none w-44"
                  >
                    <div className="flex items-center gap-1.5">
                      Identificador
                      <ArrowUpDown className="w-3 h-3 text-sm-navy-600" />
                    </div>
                  </TableHead>

                  <TableHead className="w-36">
                    Frequência
                  </TableHead>

                  <TableHead className="w-32 text-center">
                    Pesquisadores
                  </TableHead>

                  <TableHead className="w-24 text-center">
                    Tipo
                  </TableHead>

                  <TableHead className="text-right w-24">
                    Ações
                  </TableHead>
                </tr>
              </thead>

              <TableBody>
                {/* Loading */}
                {isLoading &&
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28 font-mono" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-14 ml-auto" /></TableCell>
                    </TableRow>
                  ))}

                {/* Erro */}
                {!isLoading && isError && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-sm-red-700">
                          Não foi possível carregar as coleções.
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
                {!isLoading && !isError && collections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 rounded-full bg-sm-wash text-sm-navy">
                          <Layers className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-extrabold text-sm-navy">
                          Nenhuma coleção encontrada
                        </p>
                        <p className="text-xs text-sm-navy-600 max-w-sm">
                          {debouncedSearch
                            ? 'Nenhum resultado corresponde à sua pesquisa.'
                            : 'Cadastre a primeira coleção para agrupar pesquisadores.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Linhas */}
                {!isLoading &&
                  !isError &&
                  collections.map((col) => (
                    <TableRow
                      key={col.id}
                      onClick={() => navigate(`/console/pesquisadores?collection_id=${col.id}`)}
                      className="cursor-pointer hover:bg-sm-wash/50 transition-colors"
                    >
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-xs text-sm-navy block">
                            {col.name}
                          </span>
                          {col.description && (
                            <span className="text-[11px] text-sm-navy-600 block line-clamp-1">
                              {col.description}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-sm-navy-600">
                        {col.slug}
                      </TableCell>

                      <TableCell className="text-xs text-sm-navy-600">
                        A cada {col.refresh_interval_days} {col.refresh_interval_days === 1 ? 'dia' : 'dias'}
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs font-extrabold text-sm-navy">
                        {col.researcher_count || 0}
                      </TableCell>

                      <TableCell className="text-center">
                        {col.is_default ? (
                          <span className="sm-tag sm-tag--strong text-[10px]">Padrão</span>
                        ) : (
                          <span className="sm-tag text-[10px]">Normal</span>
                        )}
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
                            onClick={(e) => handleOpenEdit(col, e)}
                            className="h-7 w-7 p-0 text-sm-navy-600 hover:text-sm-navy"
                            title="Editar coleção"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && !col.is_default && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenDelete(col, e)}
                              className="h-7 w-7 p-0 text-sm-navy-600 hover:text-sm-red-700"
                              title="Excluir coleção"
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
                coleções
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

        {/* Modal de Criação / Edição */}
        <CollectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          collection={editingCollection}
        />

        {/* Diálogo de Confirmação de Exclusão */}
        <ConfirmImpactDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Excluir Coleção"
          description={`Deseja realmente excluir a coleção "${collectionToDelete?.name}"?`}
          impactMessage="Pesquisadores perderão o vínculo com esta coleção, mas seus cadastros permanecerão na plataforma."
          confirmLabel="Sim, excluir coleção"
          destructive
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </>
  );
}
