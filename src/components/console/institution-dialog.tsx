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
import { InstitutionPublic } from '../../types/academic';
import {
  useCreateInstitution,
  useUpdateInstitution,
} from '../../hooks/use-academic';

interface InstitutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institution?: InstitutionPublic | null;
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
      <DialogContent className="max-w-md border-sm-wave-gray bg-white rounded-md p-6">
        <DialogHeader className="space-y-1">
          <p className="sm-eyebrow">CADASTRO ACADÊMICO · <b>INSTITUIÇÕES</b></p>
          <DialogTitle className="text-xl font-extrabold text-sm-navy">
            {isEditing ? 'Editar Instituição' : 'Nova Instituição'}
          </DialogTitle>
          <DialogDescription className="text-xs text-sm-navy-600">
            {isEditing
              ? 'Atualize os dados institucionais cadastrados.'
              : 'Cadastre uma nova universidade, faculdade ou instituto de pesquisa.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="inst-acronym" className="text-xs font-extrabold text-sm-navy">
              Sigla <span className="text-sm-red">*</span>
            </Label>
            <Input
              id="inst-acronym"
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              placeholder="Ex: UFBA, UESC, SENAI CIMATEC"
              className="h-9 font-mono text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm uppercase"
              maxLength={20}
              autoFocus
            />
            {errors.acronym && (
              <p className="text-[11px] text-sm-red-700">{errors.acronym}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="inst-name" className="text-xs font-extrabold text-sm-navy">
              Nome Completo <span className="text-sm-red">*</span>
            </Label>
            <Input
              id="inst-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Universidade Federal da Bahia"
              className="h-9 text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
            />
            {errors.name && (
              <p className="text-[11px] text-sm-red-700">{errors.name}</p>
            )}
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 text-xs border-sm-wave-gray text-sm-navy rounded-sm"
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="sm-btn text-xs py-2 px-4"
            >
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                ? 'Salvar Alterações'
                : 'Cadastrar Instituição'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
