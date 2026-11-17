import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MultiInstitutionSelect } from './institution-combobox';
import { useCollections, useCreateResearcher } from '../../hooks/use-academic';

interface ResearcherCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedInstitutionId?: string;
  onCreatedSuccess?: (newResearcherId: string) => void;
}

export function ResearcherCreateDialog({
  open,
  onOpenChange,
  preselectedInstitutionId,
  onCreatedSuccess,
}: ResearcherCreateDialogProps) {
  const [name, setName] = useState('');
  const [lattesId, setLattesId] = useState('');
  const [institutionIds, setInstitutionIds] = useState<string[]>([]);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    lattesId?: string;
    general?: string;
  }>({});

  const { data: collectionsData } = useCollections({ per_page: 50 });
  const collections = collectionsData?.data || [];

  const createMutation = useCreateResearcher();

  useEffect(() => {
    if (open) {
      setName('');
      setLattesId('');
      setInstitutionIds(
        preselectedInstitutionId ? [preselectedInstitutionId] : [],
      );
      setCollectionIds([]);
      setErrors({});
    }
  }, [open, preselectedInstitutionId]);

  const validate = () => {
    const nextErrors: { name?: string; lattesId?: string } = {};
    if (!name.trim()) {
      nextErrors.name = 'Nome do pesquisador é obrigatório.';
    }

    const cleanLattes = lattesId.trim().replace(/\D/g, '');
    if (!cleanLattes) {
      nextErrors.lattesId = 'Lattes ID é obrigatório.';
    } else if (cleanLattes.length !== 16) {
      nextErrors.lattesId = `O Lattes ID deve ter exatamente 16 dígitos (atual: ${cleanLattes.length}).`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const cleanLattes = lattesId.trim().replace(/\D/g, '');
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        lattes_id: cleanLattes,
        institution_ids: institutionIds.length > 0 ? institutionIds : undefined,
        collection_ids: collectionIds.length > 0 ? collectionIds : undefined,
      });

      onOpenChange(false);
      if (onCreatedSuccess) {
        onCreatedSuccess(result.researcher_id);
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          lattesId: 'Este Lattes ID já está cadastrado no sistema.',
        }));
      }
    }
  };

  const handleToggleCollection = (colId: string) => {
    setCollectionIds((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-sm-wave-gray bg-white rounded-md p-6">
        <DialogHeader className="space-y-1">
          <p className="sm-eyebrow">CADASTRO ACADÊMICO · <b>PESQUISADORES</b></p>
          <DialogTitle className="text-xl font-extrabold text-sm-navy">
            Novo Pesquisador
          </DialogTitle>
          <DialogDescription className="text-xs text-sm-navy-600 font-sans">
            Cadastre o docente e seu identificador Lattes de 16 dígitos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errors.general && (
            <div className="p-2.5 rounded bg-sm-red-100/40 border border-sm-red-100 text-xs text-sm-red-700">
              {errors.general}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="res-name" className="text-xs font-extrabold text-sm-navy">
              Nome Completo <span className="text-sm-red">*</span>
            </Label>
            <Input
              id="res-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Augusto dos Santos"
              className="h-9 text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-sm-red-700 font-sans">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="res-lattes" className="text-xs font-extrabold text-sm-navy">
                Lattes ID (16 dígitos) <span className="text-sm-red">*</span>
              </Label>
              <span className="text-[10px] text-sm-navy-600 font-mono">
                {lattesId.replace(/\D/g, '').length}/16
              </span>
            </div>
            <Input
              id="res-lattes"
              value={lattesId}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '').slice(0, 16);
                setLattesId(numeric);
              }}
              placeholder="Ex: 8527394158294719"
              className="h-9 font-mono text-xs tracking-wider border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
              maxLength={16}
            />
            {errors.lattesId && (
              <p className="text-[11px] text-sm-red-700 font-sans">
                {errors.lattesId}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-extrabold text-sm-navy">
              Vínculo Institucional Inicial (Opcional)
            </Label>
            <MultiInstitutionSelect
              selectedIds={institutionIds}
              onChange={setInstitutionIds}
              placeholder="Selecione as instituições..."
            />
          </div>

          {collections.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-extrabold text-sm-navy">
                Coleções (Opcional)
              </Label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 border border-sm-wave-gray rounded-sm bg-sm-wash/40">
                {collections.map((col) => {
                  const isChecked = collectionIds.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleToggleCollection(col.id)}
                      className={`sm-tag cursor-pointer transition-colors ${
                        isChecked ? 'sm-tag--strong' : 'bg-white text-sm-navy'
                      }`}
                    >
                      {col.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="h-9 text-xs border-sm-wave-gray text-sm-navy rounded-sm"
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="sm-btn text-xs py-2 px-4"
            >
              {createMutation.isPending
                ? 'Cadastrando...'
                : 'Cadastrar Pesquisador'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
