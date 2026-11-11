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
import { Textarea } from '../ui/textarea';
import { CollectionPublic } from '../../types/academic';
import {
  useCreateCollection,
  useUpdateCollection,
} from '../../hooks/use-academic';

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: CollectionPublic | null;
}

export function CollectionDialog({
  open,
  onOpenChange,
  collection,
}: CollectionDialogProps) {
  const isEditing = Boolean(collection);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [refreshDays, setRefreshDays] = useState('1');
  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    refreshDays?: string;
  }>({});

  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setSlug(collection.slug);
      setDescription(collection.description || '');
      setRefreshDays(String(collection.refresh_interval_days || 1));
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setRefreshDays('1');
    }
    setErrors({});
  }, [collection, open]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      // Auto gera slug simples
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(autoSlug);
    }
  };

  const validate = () => {
    const nextErrors: { name?: string; slug?: string; refreshDays?: string } = {};
    if (!name.trim()) nextErrors.name = 'Nome da coleção é obrigatório.';
    if (!isEditing && !slug.trim()) {
      nextErrors.slug = 'Identificador único (slug) é obrigatório.';
    } else if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      nextErrors.slug = 'Use apenas letras minúsculas, números e hífens.';
    }
    const days = parseInt(refreshDays, 10);
    if (isNaN(days) || days < 1) {
      nextErrors.refreshDays = 'Intervalo deve ser de pelo menos 1 dia.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const days = parseInt(refreshDays, 10);

    if (isEditing && collection) {
      await updateMutation.mutateAsync({
        id: collection.id,
        data: {
          name: name.trim(),
          description: description.trim() || null,
          refresh_interval_days: days,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        refresh_interval_days: days,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-sm-wave-gray bg-white rounded-md p-6">
        <DialogHeader className="space-y-1">
          <p className="sm-eyebrow">CADASTRO ACADÊMICO · <b>COLEÇÕES</b></p>
          <DialogTitle className="text-xl font-extrabold text-sm-navy">
            {isEditing ? 'Editar Coleção' : 'Nova Coleção'}
          </DialogTitle>
          <DialogDescription className="text-xs text-sm-navy-600">
            Coleções agrupam pesquisadores com regras específicas de atualização periódica.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="col-name" className="text-xs font-extrabold text-sm-navy">
              Nome da Coleção <span className="text-sm-red">*</span>
            </Label>
            <Input
              id="col-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Docentes Permanentes"
              className="h-9 text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-sm-red-700">{errors.name}</p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-1">
              <Label htmlFor="col-slug" className="text-xs font-extrabold text-sm-navy">
                Identificador (slug) <span className="text-sm-red">*</span>
              </Label>
              <Input
                id="col-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="Ex: docentes-permanentes"
                className="h-9 font-mono text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
              />
              {errors.slug && (
                <p className="text-[11px] text-sm-red-700">{errors.slug}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="col-desc" className="text-xs font-extrabold text-sm-navy">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a finalidade desta coleção..."
              rows={2}
              className="text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="col-interval" className="text-xs font-extrabold text-sm-navy">
              Intervalo de Atualização (em dias) <span className="text-sm-red">*</span>
            </Label>
            <Input
              id="col-interval"
              type="number"
              min={1}
              value={refreshDays}
              onChange={(e) => setRefreshDays(e.target.value)}
              className="h-9 font-mono text-xs border-sm-wave-gray focus:border-sm-sky-600 rounded-sm w-32"
            />
            <p className="text-[11px] text-sm-navy-600">
              Define a frequência com que os currículos Lattes desta coleção serão sincronizados.
            </p>
            {errors.refreshDays && (
              <p className="text-[11px] text-sm-red-700">{errors.refreshDays}</p>
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
                : 'Criar Coleção'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
