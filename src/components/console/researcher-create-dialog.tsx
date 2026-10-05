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
import { UserPlus } from 'lucide-react';
import { MultiInstitutionSelect } from './institution-combobox';
import { useCreateResearcher } from '../../hooks/use-academic';

interface ResearcherCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedInstitutionId?: string; // Caso aberto a partir de uma instituição específica
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
  const [errors, setErrors] = useState<{
    name?: string;
    lattesId?: string;
    general?: string;
  }>({});

  const createMutation = useCreateResearcher();

  useEffect(() => {
    if (open) {
      setName('');
      setLattesId('');
      setInstitutionIds(
        preselectedInstitutionId ? [preselectedInstitutionId] : [],
      );
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#559FB8]/10 text-[#07677e] dark:text-[#559FB8]">
              <UserPlus className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold font-sans text-neutral-900 dark:text-neutral-100">
              Novo Pesquisador
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
            Cadastre os dados primários do pesquisador. Os dados de produção
            científica serão enriquecidos automaticamente pelo pipeline ELT.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errors.general && (
            <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {errors.general}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="res-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="res-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Augusto dos Santos"
              className="h-10 text-sm border-neutral-300 dark:border-neutral-700"
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 font-sans">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="res-lattes" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Lattes ID (16 dígitos) <span className="text-red-500">*</span>
              </Label>
              <span className="text-[10px] text-neutral-400 font-mono">
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
              className="h-10 font-mono text-sm tracking-wider border-neutral-300 dark:border-neutral-700"
              maxLength={16}
            />
            {errors.lattesId && (
              <p className="text-[11px] text-red-500 font-sans">
                {errors.lattesId}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Vínculo Institucional Inicial (Opcional)
            </Label>
            <MultiInstitutionSelect
              selectedIds={institutionIds}
              onChange={setInstitutionIds}
              placeholder="Selecione as instituições..."
            />
            <p className="text-[11px] text-neutral-400 font-sans">
              Você também poderá vincular ou remover outras instituições no
              detalhe do pesquisador.
            </p>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="text-xs border-neutral-300 dark:border-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="text-xs bg-[#559FB8] hover:bg-[#024A60] text-white font-medium"
            >
              {createMutation.isPending
                ? 'Cadastrando...'
                : 'Cadastrar Pesquisador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
