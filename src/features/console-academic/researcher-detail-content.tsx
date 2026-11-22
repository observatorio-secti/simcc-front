import { useId, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ExternalLink,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/api/errors';
import {
  LATTES_ID_REGEX,
  academicConflictMessage,
  type AcademicAffiliation,
  type AcademicCollectionMembership,
} from '@/entities/academic/model';
import {
  academicKeys,
  academicResearcherDetailQueryOptions,
  addResearcherAffiliationMutationOptions,
  addResearcherCollectionMutationOptions,
  deleteResearcherMutationOptions,
  removeResearcherAffiliationMutationOptions,
  removeResearcherCollectionMutationOptions,
  updateResearcherMutationOptions,
} from '@/entities/academic/queries';
import { triggerEtlRunMutationOptions } from '@/entities/etl/queries';
import { errorMessage } from '@/shared/lib/error-message';
import { formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ConfirmImpactDialog } from '@/shared/ui/confirm-impact-dialog';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { SectionError } from '@/shared/ui/section-error';
import { Separator } from '@/shared/ui/separator';
import { CollectionCombobox, InstitutionCombobox } from './academic-combobox';
import { FormField } from './form-field';
import { resolveMutationErrors } from './mutation-errors';

type FieldName = 'name' | 'lattes_id';
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES = new Set<string>(['name', 'lattes_id']);

/**
 * Conteúdo de detalhe e edição do pesquisador, compartilhado entre o overlay
 * (`Sheet`) sobre `/console/pesquisadores` e a rota direta
 * `/console/pesquisadores/$researcherId`.
 */
export function ResearcherDetailContent({
  researcherId,
  onDeleted,
}: {
  researcherId: string;
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  const query = useQuery(academicResearcherDetailQueryOptions(researcherId));
  const researcher = query.data;

  const [name, setName] = useState(researcher?.name ?? '');
  const [lattesId, setLattesId] = useState(researcher?.lattes_id ?? '');
  const [prevDataKey, setPrevDataKey] = useState<string | undefined>(undefined);
  const currentDataKey = researcher
    ? `${researcher.id}:${researcher.name}:${researcher.lattes_id}`
    : undefined;
  if (currentDataKey !== prevDataKey && researcher) {
    setPrevDataKey(currentDataKey);
    setName(researcher.name);
    setLattesId(researcher.lattes_id);
  }

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | undefined
  >(undefined);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | undefined
  >(undefined);
  const [lastRunId, setLastRunId] = useState<string | null>(null);

  const [pendingUnlinkAff, setPendingUnlinkAff] =
    useState<AcademicAffiliation | null>(null);
  const [pendingUnlinkCol, setPendingUnlinkCol] =
    useState<AcademicCollectionMembership | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const baseId = useId();

  const updateMutation = useMutation({
    ...updateResearcherMutationOptions(),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success(`Dados de ${updated.name} salvos.`);
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

  const syncMutation = useMutation({
    ...triggerEtlRunMutationOptions(),
    onSuccess: (result) => {
      setLastRunId(result.run_id);
      toast.success('Sincronização iniciada para o Lattes.');
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });

  const addAffMutation = useMutation({
    ...addResearcherAffiliationMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      setSelectedInstitutionId(undefined);
      toast.success('Instituição vinculada ao pesquisador.');
    },
    onError: (error) => {
      const msg =
        isApiError(error) && error.status === 409
          ? academicConflictMessage(error.message)
          : errorMessage(error);
      toast.error(msg);
    },
  });

  const removeAffMutation = useMutation({
    ...removeResearcherAffiliationMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      setPendingUnlinkAff(null);
      toast.success('Vínculo institucional removido.');
    },
  });

  const addColMutation = useMutation({
    ...addResearcherCollectionMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      setSelectedCollectionId(undefined);
      toast.success('Pesquisador adicionado à coleção.');
    },
    onError: (error) => {
      const msg =
        isApiError(error) && error.status === 409
          ? academicConflictMessage(error.message)
          : errorMessage(error);
      toast.error(msg);
    },
  });

  const removeColMutation = useMutation({
    ...removeResearcherCollectionMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      setPendingUnlinkCol(null);
      toast.success('Pesquisador removido da coleção.');
    },
  });

  const deleteMutation = useMutation({
    ...deleteResearcherMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: academicKeys.all });
      toast.success('Pesquisador excluído.');
      setDeleteOpen(false);
      onDeleted();
    },
  });

  const affiliatedIds = useMemo(
    () =>
      new Set((researcher?.affiliations ?? []).map((a) => a.institution.id)),
    [researcher],
  );
  const collectionIds = useMemo(
    () => new Set((researcher?.collections ?? []).map((c) => c.collection.id)),
    [researcher],
  );

  if (query.isPending) {
    return (
      <LoadingBlock
        title="Carregando pesquisador..."
        caption="Consultando o cadastro acadêmico"
      />
    );
  }

  if (query.isError || !researcher) {
    return (
      <SectionError
        title="Não foi possível carregar o pesquisador"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
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
    updateMutation.mutate({
      researcherId,
      input: { name: trimmedName, lattes_id: trimmedLattes },
    });
  }

  const nameId = `${baseId}-name`;
  const lattesInputId = `${baseId}-lattes`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground tabular-nums">
          Cadastrado em {formatDate(researcher.created_at)}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={syncMutation.isPending}
          onClick={() =>
            syncMutation.mutate({
              lattes_ids: [researcher.lattes_id],
              force: false,
            })
          }
        >
          {syncMutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <RefreshCw aria-hidden />
          )}
          Sincronizar Lattes
        </Button>
      </div>

      {lastRunId && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-eng-blue/40 bg-brand-soft p-3 text-sm dark:bg-eng-blue/20"
        >
          <span>Sincronização enviada para a fila.</span>
          <a
            href={`/console/etl/${lastRunId}`}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Acompanhar execução
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      )}

      <form onSubmit={handleSave} noValidate className="grid gap-4">
        <FormField id={nameId} label="Nome" error={fieldErrors.name}>
          <Input
            id={nameId}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.name) || undefined}
            aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
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

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="animate-spin" aria-hidden />
            )}
            Salvar alterações
          </Button>
        </div>
      </form>

      <Separator />

      <section className="flex flex-col gap-3" aria-label="Instituições">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-medium">Instituições vinculadas</h3>
        </div>

        {(researcher.affiliations ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma instituição vinculada.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(researcher.affiliations ?? []).map((aff) => (
              <Badge
                key={aff.institution.id}
                variant="outline"
                className="gap-1.5 pr-1"
              >
                <span>
                  {aff.institution.acronym} — {aff.institution.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    removeAffMutation.reset();
                    setPendingUnlinkAff(aff);
                  }}
                  aria-label={`Desvincular ${aff.institution.acronym}`}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <InstitutionCombobox
              value={selectedInstitutionId}
              placeholder="Vincular instituição..."
              onChange={setSelectedInstitutionId}
              excludeIds={affiliatedIds}
              disabled={addAffMutation.isPending}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selectedInstitutionId || addAffMutation.isPending}
            onClick={() => {
              if (!selectedInstitutionId) return;
              addAffMutation.mutate({
                researcherId: researcher.id,
                institutionId: selectedInstitutionId,
              });
            }}
          >
            {addAffMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Plus aria-hidden />
            )}
            Vincular
          </Button>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3" aria-label="Coleções">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-medium">Coleções</h3>
        </div>

        {(researcher.collections ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Não pertence a nenhuma coleção.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(researcher.collections ?? []).map((membership) => (
              <Badge
                key={membership.collection.id}
                variant="outline"
                className="gap-1.5 pr-1"
              >
                <span>{membership.collection.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    removeColMutation.reset();
                    setPendingUnlinkCol(membership);
                  }}
                  aria-label={`Remover da coleção ${membership.collection.name}`}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <CollectionCombobox
              value={selectedCollectionId}
              placeholder="Adicionar a uma coleção..."
              onChange={setSelectedCollectionId}
              excludeIds={collectionIds}
              disabled={addColMutation.isPending}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selectedCollectionId || addColMutation.isPending}
            onClick={() => {
              if (!selectedCollectionId) return;
              addColMutation.mutate({
                researcherId: researcher.id,
                collectionId: selectedCollectionId,
              });
            }}
          >
            {addColMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Plus aria-hidden />
            )}
            Adicionar
          </Button>
        </div>
      </section>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Remover o pesquisador desfaz vínculos institucionais e coleções.
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => {
            deleteMutation.reset();
            setDeleteOpen(true);
          }}
        >
          <Trash2 aria-hidden />
          Excluir pesquisador
        </Button>
      </div>

      <ConfirmImpactDialog
        open={pendingUnlinkAff !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUnlinkAff(null);
        }}
        tone="default"
        title="Desvincular instituição?"
        description={
          pendingUnlinkAff && (
            <>
              {researcher.name} deixará de estar vinculado a{' '}
              <span className="font-medium text-foreground">
                {pendingUnlinkAff.institution.acronym}
              </span>
              .
            </>
          )
        }
        confirmLabel="Desvincular"
        pending={removeAffMutation.isPending}
        error={
          removeAffMutation.error ? errorMessage(removeAffMutation.error) : null
        }
        onConfirm={() => {
          if (pendingUnlinkAff) {
            removeAffMutation.mutate({
              researcherId: researcher.id,
              institutionId: pendingUnlinkAff.institution.id,
            });
          }
        }}
      />

      <ConfirmImpactDialog
        open={pendingUnlinkCol !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUnlinkCol(null);
        }}
        tone="default"
        title="Remover da coleção?"
        description={
          pendingUnlinkCol && (
            <>
              {researcher.name} será removido da coleção{' '}
              <span className="font-medium text-foreground">
                {pendingUnlinkCol.collection.name}
              </span>
              .
            </>
          )
        }
        confirmLabel="Remover"
        pending={removeColMutation.isPending}
        error={
          removeColMutation.error ? errorMessage(removeColMutation.error) : null
        }
        onConfirm={() => {
          if (pendingUnlinkCol) {
            removeColMutation.mutate({
              researcherId: researcher.id,
              collectionId: pendingUnlinkCol.collection.id,
            });
          }
        }}
      />

      <ConfirmImpactDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir pesquisador?"
        description={
          <>
            <span className="font-medium text-foreground">
              {researcher.name}
            </span>{' '}
            <span className="font-mono text-xs">({researcher.lattes_id})</span>
          </>
        }
        impact={
          <p>
            Esta ação remove o pesquisador do cadastro acadêmico e todos os seus
            vínculos.
          </p>
        }
        confirmLabel="Excluir"
        pending={deleteMutation.isPending}
        error={deleteMutation.error ? errorMessage(deleteMutation.error) : null}
        onConfirm={() => deleteMutation.mutate(researcher.id)}
      />
    </div>
  );
}
