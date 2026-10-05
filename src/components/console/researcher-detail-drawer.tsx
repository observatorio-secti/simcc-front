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
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  ExternalLink,
  Landmark,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  useAddAffiliation,
  useDeleteResearcher,
  useRemoveAffiliation,
  useResearcher,
  useUpdateResearcher,
} from '../../hooks/use-academic';
import { useAuth } from '../../hooks/use-auth';
import { InstitutionCombobox } from './institution-combobox';
import { ConfirmImpactDialog } from './confirm-impact-dialog';

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
  const { isAdmin } = useAuth();
  const { data: researcher, isLoading, isError } = useResearcher(
    researcherId || undefined,
  );

  // Formulário de dados cadastrais
  const [name, setName] = useState('');
  const [lattesId, setLattesId] = useState('');
  const [isEditingData, setIsEditingData] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; lattesId?: string }>({});

  // Seleção de nova instituição para vínculo
  const [selectedInstToAdd, setSelectedInstToAdd] = useState('');
  const [isAddingAffiliation, setIsAddingAffiliation] = useState(false);

  // Dialog de confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const updateMutation = useUpdateResearcher();
  const deleteMutation = useDeleteResearcher();
  const addAffiliationMutation = useAddAffiliation();
  const removeAffiliationMutation = useRemoveAffiliation();

  useEffect(() => {
    if (researcher) {
      setName(researcher.name);
      setLattesId(researcher.lattes_id);
      setIsEditingData(false);
      setErrors({});
      setSelectedInstToAdd('');
      setIsAddingAffiliation(false);
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

  const handleDeleteResearcher = async () => {
    if (!researcherId) return;
    await deleteMutation.mutateAsync(researcherId);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
    if (onDeleted) onDeleted();
  };

  const existingInstitutionIds =
    researcher?.affiliations?.map((a) => a.institution.id) || [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800">
          <SheetHeader className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-semibold text-[#07677e] dark:text-[#559FB8] border-[#559FB8]/40 bg-[#559FB8]/10 px-2 py-0.5"
              >
                Detalhes do Pesquisador
              </Badge>
              {researcher && (
                <span className="text-[11px] text-neutral-400 font-mono">
                  ID: {researcher.researcher_id.slice(0, 8)}...
                </span>
              )}
            </div>
            <SheetTitle className="text-xl font-bold font-sans text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <User className="w-5 h-5 text-[#559FB8]" />
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                researcher?.name || 'Pesquisador'
              )}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
              Gerencie os dados de cadastro e vínculos institucionais deste
              pesquisador.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            )}

            {isError && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                Não foi possível carregar os detalhes do pesquisador.
              </div>
            )}

            {!isLoading && researcher && (
              <>
                {/* Bloco 1: Dados Cadastrais */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 border-l-4 border-l-[#559FB8] p-4 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Dados Cadastrais
                    </h3>
                    {!isEditingData && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingData(true)}
                        className="h-7 text-xs text-[#07677e] dark:text-[#559FB8] hover:bg-[#559FB8]/10 px-2"
                      >
                        Editar
                      </Button>
                    )}
                  </div>

                  {isEditingData ? (
                    <form onSubmit={handleSaveData} className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="edit-name" className="text-xs font-semibold">
                          Nome
                        </Label>
                        <Input
                          id="edit-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-8 text-xs border-neutral-300 dark:border-neutral-700"
                        />
                        {errors.name && (
                          <p className="text-[10px] text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="edit-lattes" className="text-xs font-semibold">
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
                          className="h-8 font-mono text-xs border-neutral-300 dark:border-neutral-700"
                          maxLength={16}
                        />
                        {errors.lattesId && (
                          <p className="text-[10px] text-red-500">
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
                          className="h-7 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={updateMutation.isPending}
                          className="h-7 text-xs bg-[#559FB8] hover:bg-[#024A60] text-white"
                        >
                          {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">
                          Nome Completo:
                        </span>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {researcher.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">
                            Currículo Lattes:
                          </span>
                          <span className="font-mono text-neutral-800 dark:text-neutral-200">
                            {researcher.lattes_id}
                          </span>
                        </div>
                        <a
                          href={`http://lattes.cnpq.br/${researcher.lattes_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#559FB8] hover:underline"
                        >
                          Acessar Lattes <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bloco 2: Afiliações Institucionais */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-neutral-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Vínculos Institucionais ({researcher.affiliations?.length || 0})
                      </h3>
                    </div>

                    {!isAddingAffiliation && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingAffiliation(true)}
                        className="h-7 text-xs gap-1 border-neutral-300 dark:border-neutral-700 text-[#07677e] dark:text-[#559FB8]"
                      >
                        <Plus className="w-3 h-3" />
                        Vincular
                      </Button>
                    )}
                  </div>

                  {isAddingAffiliation && (
                    <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                      <Label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                        Selecione a nova instituição:
                      </Label>
                      <InstitutionCombobox
                        value={selectedInstToAdd}
                        onChange={setSelectedInstToAdd}
                        excludeIds={existingInstitutionIds}
                        placeholder="Buscar instituição para vincular..."
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
                          className="h-7 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            !selectedInstToAdd ||
                            addAffiliationMutation.isPending
                          }
                          onClick={handleAddAffiliation}
                          className="h-7 text-xs bg-[#559FB8] hover:bg-[#024A60] text-white"
                        >
                          {addAffiliationMutation.isPending
                            ? 'Vinculando...'
                            : 'Confirmar Vínculo'}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(!researcher.affiliations ||
                      researcher.affiliations.length === 0) && (
                      <p className="text-xs text-neutral-400 italic py-2">
                        Nenhum vínculo cadastrado para este pesquisador.
                      </p>
                    )}

                    {researcher.affiliations?.map((aff, idx) => (
                      <div
                        key={`${aff.institution.id}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] px-1.5 py-0 border-neutral-300 dark:border-neutral-700"
                          >
                            {aff.institution.acronym}
                          </Badge>
                          <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
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
                          className="h-6 w-6 p-0 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-full"
                          title="Remover este vínculo institucional"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloco 3: Exclusão (Admin Only) */}
                {isAdmin && (
                  <div className="rounded-lg border border-red-200 dark:border-red-950 p-4 bg-red-50/20 dark:bg-red-950/10 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                      Zona Crítica
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Excluir permanentemente o pesquisador e desvincular todas as
                      afiliações cadastradas.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="text-xs border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 gap-1.5"
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
        impactMessage="O pesquisador perderá todos os vínculos institucionais e deixará de ser monitorado pelo observatório."
        confirmLabel="Sim, excluir pesquisador"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteResearcher}
      />
    </>
  );
}
