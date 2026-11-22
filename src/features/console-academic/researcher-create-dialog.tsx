import { useId, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  LATTES_ID_REGEX,
  type AcademicInstitutionRef,
  type AcademicResearcherDetail,
} from '@/entities/academic/model';
import {
  academicKeys,
  createResearcherMutationOptions,
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
import {
  MultiCollectionSelect,
  MultiInstitutionSelect,
  type ComboboxOption,
} from './academic-combobox';
import { FormField } from './form-field';
import { resolveMutationErrors } from './mutation-errors';

type FieldName = 'name' | 'lattes_id';
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES = new Set<string>(['name', 'lattes_id']);

function toInstitutionOption(inst: AcademicInstitutionRef): ComboboxOption {
  return {
    id: inst.id,
    label: `${inst.acronym} — ${inst.name}`,
    secondary: inst.acronym,
  };
}

/**
 * Diálogo efêmero para cadastrar pesquisador (ADR 0004).
 * Valida nome e Lattes ID (16 dígitos numéricos). Mantém aberto em `409`/`422`.
 */
export function ResearcherCreateDialog({
  open,
  onOpenChange,
  defaultInstitution,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultInstitution?: AcademicInstitutionRef;
  onCreated?: (researcher: AcademicResearcherDetail) => void;
}) {
  const [name, setName] = useState('');
  const [lattesId, setLattesId] = useState('');
  const [institutions, setInstitutions] = useState<ComboboxOption[]>(() =>
    defaultInstitution ? [toInstitutionOption(defaultInstitution)] : [],
  );
  const [collections, setCollections] = useState<ComboboxOption[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName('');
      setLattesId('');
      setInstitutions(
        defaultInstitution ? [toInstitutionOption(defaultInstitution)] : [],
      );
      setCollections([]);
      setFieldErrors({});
      setFormError(null);
    }
  }

  const baseId = useId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...createResearcherMutationOptions(),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success(`Pesquisador ${created.name} cadastrado.`);
      onOpenChange(false);
      onCreated?.(created);
    },
    onError: (error) => {
      const resolved = resolveMutationErrors<FieldName>(error, {
        allowedFields: FIELD_NAMES,
        conflictField: 'lattes_id',
      });
      setFieldErrors(resolved.fieldErrors);
      setFormError(resolved.formError);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedLattes = lattesId.trim();
    const errors: FieldErrors = {};

    if (!trimmedName) {
      errors.name = 'Informe o nome do pesquisador.';
    }
    if (!LATTES_ID_REGEX.test(trimmedLattes)) {
      errors.lattes_id =
        'O Lattes ID deve ter exatamente 16 dígitos numéricos.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    mutation.mutate({
      name: trimmedName,
      lattes_id: trimmedLattes,
      institution_ids: institutions.map((item) => item.id),
      collection_ids: collections.map((item) => item.id),
    });
  }

  const nameId = `${baseId}-name`;
  const lattesInputId = `${baseId}-lattes`;
  const instId = `${baseId}-institutions`;
  const colId = `${baseId}-collections`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && mutation.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!mutation.isPending}>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Novo pesquisador</DialogTitle>
            <DialogDescription>
              Informe os dados básicos e os vínculos iniciais do pesquisador.
            </DialogDescription>
          </DialogHeader>

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

          <FormField
            id={lattesInputId}
            label="Lattes ID"
            hint="Exatamente 16 dígitos numéricos."
            error={fieldErrors.lattes_id}
          >
            <Input
              id={lattesInputId}
              value={lattesId}
              onChange={(event) => setLattesId(event.target.value)}
              inputMode="numeric"
              maxLength={16}
              autoComplete="off"
              spellCheck={false}
              required
              className="font-mono text-xs"
              aria-invalid={Boolean(fieldErrors.lattes_id) || undefined}
              aria-describedby={
                fieldErrors.lattes_id
                  ? `${lattesInputId}-error`
                  : `${lattesInputId}-hint`
              }
            />
          </FormField>

          <FormField id={instId} label="Instituições (opcional)">
            <MultiInstitutionSelect
              id={instId}
              selected={institutions}
              onChange={setInstitutions}
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField id={colId} label="Coleções (opcional)">
            <MultiCollectionSelect
              id={colId}
              selected={collections}
              onChange={setCollections}
              disabled={mutation.isPending}
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
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
