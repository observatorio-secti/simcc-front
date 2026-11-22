import { useId, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  slugifyCollectionName,
  type AcademicCollection,
} from '@/entities/academic/model';
import {
  academicKeys,
  createCollectionMutationOptions,
  updateCollectionMutationOptions,
} from '@/entities/academic/queries';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { FormField } from './form-field';
import { resolveMutationErrors } from './mutation-errors';

type FieldName = 'name' | 'slug' | 'description' | 'refresh_interval_days';
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES = new Set<string>([
  'name',
  'slug',
  'description',
  'refresh_interval_days',
]);

/**
 * Diálogo efêmero para criar ou editar coleção (ADR 0004).
 * Na criação, o slug é gerado do nome até ser editado manualmente; na edição,
 * o slug é imutável. Mantém aberto em `409` e `422`.
 */
export function CollectionDialog({
  open,
  onOpenChange,
  collection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: AcademicCollection | null;
}) {
  const isEditing = Boolean(collection);
  const [name, setName] = useState(collection?.name ?? '');
  const [slug, setSlug] = useState(collection?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(collection?.description ?? '');
  const [refreshDays, setRefreshDays] = useState(
    String(collection?.refresh_interval_days ?? 1),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevId, setPrevId] = useState(collection?.id);
  if (open !== prevOpen || collection?.id !== prevId) {
    setPrevOpen(open);
    setPrevId(collection?.id);
    if (open) {
      setName(collection?.name ?? '');
      setSlug(collection?.slug ?? '');
      setSlugTouched(false);
      setDescription(collection?.description ?? '');
      setRefreshDays(String(collection?.refresh_interval_days ?? 1));
      setFieldErrors({});
      setFormError(null);
    }
  }

  const baseId = useId();
  const queryClient = useQueryClient();

  function handleError(error: unknown) {
    const resolved = resolveMutationErrors<FieldName>(error, {
      allowedFields: FIELD_NAMES,
      conflictField: 'slug',
    });
    setFieldErrors(resolved.fieldErrors);
    setFormError(resolved.formError);
  }

  const createMutation = useMutation({
    ...createCollectionMutationOptions(),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success(`Coleção ${created.name} criada.`);
      onOpenChange(false);
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    ...updateCollectionMutationOptions(),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success(`Coleção ${updated.name} atualizada.`);
      onOpenChange(false);
    },
    onError: handleError,
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleNameChange(value: string) {
    setName(value);
    if (!isEditing && !slugTouched) {
      setSlug(slugifyCollectionName(value));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const trimmedDesc = description.trim();
    const parsedDays = Number(refreshDays);

    const errors: FieldErrors = {};
    if (!trimmedName) {
      errors.name = 'Informe o nome da coleção.';
    }
    if (!isEditing && !trimmedSlug) {
      errors.slug = 'Informe o slug da coleção.';
    }
    if (!Number.isInteger(parsedDays) || parsedDays < 1) {
      errors.refresh_interval_days =
        'Informe um intervalo inteiro maior ou igual a 1 dia.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    if (collection) {
      updateMutation.mutate({
        collectionId: collection.id,
        input: {
          name: trimmedName,
          description: trimmedDesc || null,
          refresh_interval_days: parsedDays,
        },
      });
    } else {
      createMutation.mutate({
        name: trimmedName,
        slug: trimmedSlug,
        description: trimmedDesc || null,
        refresh_interval_days: parsedDays,
      });
    }
  }

  const nameId = `${baseId}-name`;
  const slugId = `${baseId}-slug`;
  const descId = `${baseId}-description`;
  const daysId = `${baseId}-days`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar coleção' : 'Nova coleção'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Atualize os dados da coleção. O slug não pode ser alterado.'
                : 'Agrupe pesquisadores por programa, edital ou recorte de atualização.'}
            </DialogDescription>
          </DialogHeader>

          <FormField id={nameId} label="Nome" error={fieldErrors.name}>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              autoComplete="off"
              required
              aria-invalid={Boolean(fieldErrors.name) || undefined}
              aria-describedby={
                fieldErrors.name ? `${nameId}-error` : undefined
              }
            />
          </FormField>

          <FormField
            id={slugId}
            label="Slug"
            hint={
              isEditing
                ? 'Identificador imutável da coleção.'
                : 'Gerado automaticamente a partir do nome.'
            }
            error={fieldErrors.slug}
          >
            <Input
              id={slugId}
              value={slug}
              disabled={isEditing}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              autoComplete="off"
              spellCheck={false}
              required
              className="font-mono text-xs"
              aria-invalid={Boolean(fieldErrors.slug) || undefined}
              aria-describedby={
                fieldErrors.slug ? `${slugId}-error` : `${slugId}-hint`
              }
            />
          </FormField>

          <FormField
            id={descId}
            label="Descrição (opcional)"
            error={fieldErrors.description}
          >
            <Input
              id={descId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.description) || undefined}
              aria-describedby={
                fieldErrors.description ? `${descId}-error` : undefined
              }
            />
          </FormField>

          <FormField
            id={daysId}
            label="Intervalo de atualização (dias)"
            error={fieldErrors.refresh_interval_days}
          >
            <Input
              id={daysId}
              type="number"
              min={1}
              step={1}
              value={refreshDays}
              onChange={(event) => setRefreshDays(event.target.value)}
              aria-invalid={
                Boolean(fieldErrors.refresh_interval_days) || undefined
              }
              aria-describedby={
                fieldErrors.refresh_interval_days
                  ? `${daysId}-error`
                  : undefined
              }
            />
          </FormField>

          {formError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" aria-hidden />}
              {isEditing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
