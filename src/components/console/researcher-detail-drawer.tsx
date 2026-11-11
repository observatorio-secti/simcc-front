import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import {
  ExternalLink,
  Landmark,
  Layers,
  Plus,
  RefreshCw,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  useAddAffiliation,
  useAddResearcherToCollection,
  useCollections,
  useDeleteResearcher,
  useRemoveAffiliation,
  useRemoveResearcherFromCollection,
  useResearcher,
  useUpdateResearcher,
} from '../../hooks/use-academic';
import { useTriggerEtlRun } from '../../hooks/use-etl';
import { useAuth } from '../../hooks/use-auth';
import { InstitutionCombobox } from './institution-combobox';
import { ConfirmImpactDialog } from './confirm-impact-dialog';
import { toast } from 'sonner';

interface ResearcherDetailDrawerProps {
  researcherId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function ResearcherDetailDrawer({
  researcherId,
  open,
  onOpenChange,
  onDeleted,
}: ResearcherDetailDrawerProps) {
  const { isAdmin, user } = useAuth();
  const { data: researcher, isLoading, isError } = useResearcher(
    researcherId || undefined,
  );

  const [name, setName] = useState('');
  const [lattesId, setLattesId] = useState('');
  const [isEditingData, setIsEditingData] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; lattesId?: string }>({});

  const [selectedInstToAdd, setSelectedInstToAdd] = useState('');
  const [isAddingAffiliation, setIsAddingAffiliation] = useState(false);

  const [selectedColToAdd, setSelectedColToAdd] = useState('');
  const [isAddingCollection, setIsAddingCollection] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const updateMutation = useUpdateResearcher();
  const deleteMutation = useDeleteResearcher();
  const addAffiliationMutation = useAddAffiliation();
  const removeAffiliationMutation = useRemoveAffiliation();
  const addColMutation = useAddResearcherToCollection();
  const removeColMutation = useRemoveResearcherFromCollection();
  const triggerMutation = useTriggerEtlRun();

  const { data: collectionsData } = useCollections({ per_page: 50 });
  const allCollections = collectionsData?.data || [];

  useEffect(() => {
    if (researcher) {
      setName(researcher.name);
      setLattesId(researcher.lattes_id);
      setIsEditingData(false);
      setErrors({});
      setSelectedInstToAdd('');
      setIsAddingAffiliation(false);
      setSelectedColToAdd('');
      setIsAddingCollection(false);
    }
  }, [researcher, open]);

  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researcherId) return;

    const nextErrors: { name?: string; lattesId?: string } = {};
    if (!name.trim()) nextErrors.name = 'Nome é obrigatório.';
    const cleanLattes = lattesId.trim().replace(/\D/g, '');
    if (cleanLattes.length !== 16) {
      nextErrors.lattesId = 'Lattes ID deve ter exatamente 16 dígitos.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await updateMutation.mutateAsync({
      id: researcherId,
      data: { name: name.trim(), lattes_id: cleanLattes },
    });
    setIsEditingData(false);
  };

  const handleAddAffiliation = async () => {
    if (!researcherId || !selectedInstToAdd) return;
    await addAffiliationMutation.mutateAsync({
      researcherId,
      institutionId: selectedInstToAdd,
    });
    setSelectedInstToAdd('');
    setIsAddingAffiliation(false);
  };

  const handleRemoveAffiliation = async (institutionId: string) => {
    if (!researcherId) return;
    await removeAffiliationMutation.mutateAsync({
      researcherId,
      institutionId,
    });
  };

  const handleAddCollection = async () => {
    if (!researcherId || !selectedColToAdd) return;
    await addColMutation.mutateAsync({
      researcherId,
      collectionId: selectedColToAdd,
    });
    setSelectedColToAdd('');
    setIsAddingCollection(false);
  };

  const handleRemoveCollection = async (collectionId: string) => {
    if (!researcherId) return;
    await removeColMutation.mutateAsync({
      researcherId,
      collectionId,
    });
  };

  const handleSyncLattes = async () => {
    if (!researcher?.lattes_id) return;
    try {
      await triggerMutation.mutateAsync({
        lattes_ids: [researcher.lattes_id],
        triggered_by: user?.email || user?.username || 'admin',
      });
      toast.success(`Atualização do Lattes iniciada para ${researcher.name}`);
    } catch {
      // toast de erro tratado no hook
    }
  };

  const handleDeleteResearcher = async () => {
    if (!researcherId) return;
    await deleteMutation.mutateAsync(researcherId);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
    if (onDeleted) onDeleted();
  };

  const existingInstitutionIds =
    researcher?.affiliations?.map((a) => a.institution.id) || [];
  const existingCollectionIds =
    researcher?.collections?.map((c) => c.collection.id) || [];
  const availableCollections = allCollections.filter(
    (c) => !existingCollectionIds.includes(c.id),
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-white border-l border-sm-wave-gray shadow-none">
          <SheetHeader className="p-6 border-b border-sm-wave-gray bg-sm-canvas/50">
            <p className="sm-eyebrow">DETALHES DO <b>PESQUISADOR</b></p>
            <SheetTitle className="text-xl font-extrabold text-sm-navy">
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                researcher?.name || 'Pesquisador'
              )}
            </SheetTitle>
            <SheetDescription className="text-xs text-sm-navy-600 font-sans">
              Dados de cadastro, vínculos institucionais e coleções associadas.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded" />
                <Skeleton className="h-28 w-full rounded" />
              </div>
            )}

            {isError && (
              <div className="p-4 rounded bg-sm-red-100/40 border border-sm-red-100 text-xs text-sm-red-700">
                Não foi possível carregar os detalhes do pesquisador.
              </div>
            )}

            {!isLoading && researcher && (
              <>
                {/* Bloco 1: Dados Cadastrais */}
                <div className="sm-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-sm-wave-gray pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sm-navy">
                      Dados Cadastrais
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSyncLattes}
                        disabled={triggerMutation.isPending}
                        className="h-7 text-xs text-sm-navy hover:bg-sm-wash px-2 gap-1"
                        title="Disparar sincronização do Lattes"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${triggerMutation.isPending ? 'animate-spin' : ''}`} />
                        Atualizar Lattes
                      </Button>
                      {!isEditingData && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingData(true)}
                          className="h-7 text-xs text-sm-navy-600 hover:text-sm-navy px-2"
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>

                  {isEditingData ? (
                    <form onSubmit={handleSaveData} className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <Label htmlFor="edit-name" className="text-xs font-extrabold text-sm-navy">
                          Nome
                        </Label>
                        <Input
                          id="edit-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-8 text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
                        />
                        {errors.name && (
                          <p className="text-[10px] text-sm-red-700">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="edit-lattes" className="text-xs font-extrabold text-sm-navy">
                          Lattes ID (16 dígitos)
                        </Label>
                        <Input
                          id="edit-lattes"
                          value={lattesId}
                          onChange={(e) =>
                            setLattesId(
                              e.target.value.replace(/\D/g, '').slice(0, 16),
                            )
                          }
                          className="h-8 font-mono text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
                          maxLength={16}
                        />
                        {errors.lattesId && (
                          <p className="text-[10px] text-sm-red-700">
                            {errors.lattesId}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setName(researcher.name);
                            setLattesId(researcher.lattes_id);
                            setIsEditingData(false);
                            setErrors({});
                          }}
                          className="h-7 text-xs border-sm-wave-gray text-sm-navy"
                        >
                          Cancelar
                        </Button>
                        <button
                          type="submit"
                          disabled={updateMutation.isPending}
                          className="sm-btn text-xs py-1.5 px-3"
                        >
                          {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-sm-navy-600 block text-[11px]">
                          Nome Completo:
                        </span>
                        <p className="font-extrabold text-sm-navy">
                          {researcher.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-sm-navy-600 block text-[11px]">
                            Currículo Lattes:
                          </span>
                          <span className="font-mono text-sm-navy font-semibold">
                            {researcher.lattes_id}
                          </span>
                        </div>
                        <a
                          href={`http://lattes.cnpq.br/${researcher.lattes_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sm-navy hover:text-sm-red-700"
                        >
                          Abrir Lattes <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bloco 2: Afiliações Institucionais */}
                <div className="sm-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-sm-wave-gray pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sm-navy">
                      Vínculos Institucionais ({researcher.affiliations?.length || 0})
                    </h3>

                    {!isAddingAffiliation && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingAffiliation(true)}
                        className="h-7 text-xs gap-1 text-sm-navy hover:bg-sm-wash px-2"
                      >
                        <Plus className="w-3 h-3" />
                        Vincular
                      </Button>
                    )}
                  </div>

                  {isAddingAffiliation && (
                    <div className="p-2.5 rounded bg-sm-wash border border-sm-wave-gray space-y-2">
                      <Label className="text-[11px] font-semibold text-sm-navy">
                        Selecione a instituição:
                      </Label>
                      <InstitutionCombobox
                        value={selectedInstToAdd}
                        onChange={setSelectedInstToAdd}
                        excludeIds={existingInstitutionIds}
                        placeholder="Buscar instituição..."
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInstToAdd('');
                            setIsAddingAffiliation(false);
                          }}
                          className="h-7 text-xs text-sm-navy-600"
                        >
                          Cancelar
                        </Button>
                        <button
                          type="button"
                          disabled={
                            !selectedInstToAdd ||
                            addAffiliationMutation.isPending
                          }
                          onClick={handleAddAffiliation}
                          className="sm-btn text-xs py-1.5 px-3"
                        >
                          {addAffiliationMutation.isPending
                            ? 'Vinculando...'
                            : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {(!researcher.affiliations ||
                      researcher.affiliations.length === 0) && (
                      <p className="text-xs text-sm-navy-600 italic py-1">
                        Nenhum vínculo cadastrado para este pesquisador.
                      </p>
                    )}

                    {researcher.affiliations?.map((aff, idx) => (
                      <div
                        key={`${aff.institution.id}-${idx}`}
                        className="flex items-center justify-between p-2 rounded border border-sm-wave-gray bg-white text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="sm-tag font-mono text-[10px]">
                            {aff.institution.acronym}
                          </span>
                          <span className="truncate text-sm-navy font-medium">
                            {aff.institution.name}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveAffiliation(aff.institution.id)
                          }
                          disabled={removeAffiliationMutation.isPending}
                          className="h-6 w-6 p-0 text-sm-navy-600 hover:text-sm-red-700"
                          title="Remover vínculo institucional"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloco 3: Coleções */}
                <div className="sm-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-sm-wave-gray pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sm-navy">
                      Coleções ({researcher.collections?.length || 0})
                    </h3>

                    {!isAddingCollection && availableCollections.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingCollection(true)}
                        className="h-7 text-xs gap-1 text-sm-navy hover:bg-sm-wash px-2"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar
                      </Button>
                    )}
                  </div>

                  {isAddingCollection && (
                    <div className="p-2.5 rounded bg-sm-wash border border-sm-wave-gray space-y-2">
                      <Label className="text-[11px] font-semibold text-sm-navy">
                        Selecione a coleção:
                      </Label>
                      <select
                        value={selectedColToAdd}
                        onChange={(e) => setSelectedColToAdd(e.target.value)}
                        className="w-full h-8 text-xs border border-sm-wave-gray rounded bg-white px-2 text-sm-navy"
                      >
                        <option value="">Selecione...</option>
                        {availableCollections.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name} ({col.slug})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedColToAdd('');
                            setIsAddingCollection(false);
                          }}
                          className="h-7 text-xs text-sm-navy-600"
                        >
                          Cancelar
                        </Button>
                        <button
                          type="button"
                          disabled={!selectedColToAdd || addColMutation.isPending}
                          onClick={handleAddCollection}
                          className="sm-btn text-xs py-1.5 px-3"
                        >
                          {addColMutation.isPending ? 'Adicionando...' : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {(!researcher.collections ||
                      researcher.collections.length === 0) && (
                      <p className="text-xs text-sm-navy-600 italic py-1">
                        Nenhuma coleção associada.
                      </p>
                    )}

                    {researcher.collections?.map((colLink, idx) => (
                      <div
                        key={`${colLink.collection.id}-${idx}`}
                        className="flex items-center justify-between p-2 rounded border border-sm-wave-gray bg-white text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="sm-tag font-mono text-[10px]">
                            {colLink.collection.slug}
                          </span>
                          <span className="truncate text-sm-navy font-medium">
                            {colLink.collection.name}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveCollection(colLink.collection.id)
                          }
                          disabled={removeColMutation.isPending}
                          className="h-6 w-6 p-0 text-sm-navy-600 hover:text-sm-red-700"
                          title="Remover desta coleção"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloco 4: Exclusão (Admin Only) */}
                {isAdmin && (
                  <div className="sm-card p-4 space-y-2 border-sm-red-100 bg-sm-red-100/20">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-sm-red-700">
                      Zona Crítica
                    </h3>
                    <p className="text-xs text-sm-navy-600">
                      Excluir permanentemente o pesquisador e desvincular todas as
                      afiliações cadastradas.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="text-xs border-sm-red-700 text-sm-red-700 hover:bg-sm-red-100 gap-1.5 rounded-sm h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir Pesquisador
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmação de exclusão */}
      <ConfirmImpactDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Pesquisador"
        description={`Tem certeza que deseja remover o cadastro de "${researcher?.name}"?`}
        impactMessage="O pesquisador perderá todos os vínculos institucionais e coleções cadastradas."
        confirmLabel="Sim, excluir pesquisador"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteResearcher}
      />
    </>
  );
}
