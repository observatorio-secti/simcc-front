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
import { Landmark } from 'lucide-react';
import { InstitutionPublic } from '../../types/academic';
import {
  useCreateInstitution,
  useUpdateInstitution,
} from '../../hooks/use-academic';

interface InstitutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institution?: InstitutionPublic | null; // Se fornecido, é modo de edição
}

export function InstitutionDialog({
  open,
  onOpenChange,
  institution,
}: InstitutionDialogProps) {
  const isEditing = Boolean(institution);
  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [errors, setErrors] = useState<{ name?: string; acronym?: string }>({});

  const createMutation = useCreateInstitution();
  const updateMutation = useUpdateInstitution();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (institution) {
      setName(institution.name);
      setAcronym(institution.acronym);
    } else {
      setName('');
      setAcronym('');
    }
    setErrors({});
  }, [institution, open]);

  const validate = () => {
    const nextErrors: { name?: string; acronym?: string } = {};
    if (!name.trim()) nextErrors.name = 'Nome da instituição é obrigatório.';
    if (!acronym.trim()) nextErrors.acronym = 'Sigla é obrigatória.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && institution) {
      await updateMutation.mutateAsync({
        id: institution.id,
        data: { name: name.trim(), acronym: acronym.trim().toUpperCase() },
      });
    } else {
      await createMutation.mutateAsync({
        name: name.trim(),
        acronym: acronym.trim().toUpperCase(),
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg shadow-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#559FB8]/10 text-[#07677e] dark:text-[#559FB8]">
              <Landmark className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold font-sans text-neutral-900 dark:text-neutral-100">
              {isEditing ? 'Editar Instituição' : 'Nova Instituição'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
            {isEditing
              ? 'Atualize os dados institucionais cadastrados.'
              : 'Cadastre uma nova universidade, faculdade ou instituto de pesquisa.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="inst-acronym" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Sigla <span className="text-red-500">*</span>
            </Label>
            <Input
              id="inst-acronym"
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              placeholder="Ex: UFBA, UESC, SENAI CIMATEC"
              className="h-10 font-mono text-sm border-neutral-300 dark:border-neutral-700 uppercase"
              maxLength={20}
              autoFocus
            />
            {errors.acronym && (
              <p className="text-[11px] text-red-500 font-sans">{errors.acronym}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inst-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="inst-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Universidade Federal da Bahia"
              className="h-10 text-sm border-neutral-300 dark:border-neutral-700"
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 font-sans">{errors.name}</p>
            )}
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs border-neutral-300 dark:border-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-[#559FB8] hover:bg-[#024A60] text-white font-medium"
            >
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                ? 'Salvar Alterações'
                : 'Cadastrar Instituição'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
