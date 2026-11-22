import { useId, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AcademicInstitution } from '@/entities/academic/model';
import {
  academicKeys,
  createInstitutionMutationOptions,
  updateInstitutionMutationOptions,
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

type FieldName = 'acronym' | 'name';
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES = new Set<string>(['acronym', 'name']);

/**
 * Diálogo efêmero para criar ou editar instituição (ADR 0004).
 * Mantém aberto em `409` e `422` exibindo os erros inline.
 */
export function InstitutionDialog({
  open,
  onOpenChange,
  institution,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institution?: AcademicInstitution | null;
}) {
  const isEditing = Boolean(institution);
  const [acronym, setAcronym] = useState(institution?.acronym ?? '');
  const [name, setName] = useState(institution?.name ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevId, setPrevId] = useState(institution?.id);
  if (open !== prevOpen || institution?.id !== prevId) {
    setPrevOpen(open);
    setPrevId(institution?.id);
    if (open) {
      setAcronym(institution?.acronym ?? '');
      setName(institution?.name ?? '');
      setFieldErrors({});
      setFormError(null);
    }
  }

  const baseId = useId();
  const queryClient = useQueryClient();

  function handleError(error: unknown) {
    const resolved = resolveMutationErrors<FieldName>(error, {
      allowedFields: FIELD_NAMES,
      conflictField: 'acronym',
    });
    setFieldErrors(resolved.fieldErrors);
    setFormError(resolved.formError);
  }

  const createMutation = useMutation({
    ...createInstitutionMutationOptions(),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success(`Instituição ${created.acronym} cadastrada.`);
      onOpenChange(false);
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    ...updateInstitutionMutationOptions(),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success(`Instituição ${updated.acronym} atualizada.`);
      onOpenChange(false);
    },
    onError: handleError,
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedAcronym = acronym.trim().toUpperCase();
    const trimmedName = name.trim();
    const errors: FieldErrors = {};

    if (!trimmedAcronym) {
      errors.acronym = 'Informe a sigla da instituição.';
    } else if (trimmedAcronym.length > 20) {
      errors.acronym = 'A sigla deve ter no máximo 20 caracteres.';
    }
    if (!trimmedName) {
      errors.name = 'Informe o nome da instituição.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    if (institution) {
      updateMutation.mutate({
        institutionId: institution.id,
        input: { acronym: trimmedAcronym, name: trimmedName },
      });
    } else {
      createMutation.mutate({ acronym: trimmedAcronym, name: trimmedName });
    }
  }

  const acronymId = `${baseId}-acronym`;
  const nameId = `${baseId}-name`;

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
              {isEditing ? 'Editar instituição' : 'Nova instituição'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Atualize a sigla ou o nome oficial da instituição.'
                : 'Cadastre uma instituição para vincular pesquisadores.'}
            </DialogDescription>
          </DialogHeader>

          <FormField
            id={acronymId}
            label="Sigla"
            hint="Até 20 caracteres, em maiúsculas (ex.: UFBA)."
            error={fieldErrors.acronym}
          >
            <Input
              id={acronymId}
              value={acronym}
              onChange={(event) => setAcronym(event.target.value.toUpperCase())}
              maxLength={20}
              autoComplete="off"
              required
              aria-invalid={Boolean(fieldErrors.acronym) || undefined}
              aria-describedby={
                fieldErrors.acronym ? `${acronymId}-error` : `${acronymId}-hint`
              }
            />
          </FormField>

          <FormField id={nameId} label="Nome" error={fieldErrors.name}>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
              required
              aria-invalid={Boolean(fieldErrors.name) || undefined}
              aria-describedby={
                fieldErrors.name ? `${nameId}-error` : undefined
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
