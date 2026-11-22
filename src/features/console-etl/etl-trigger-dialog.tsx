import { useId, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Play, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import {
  etlTriggerErrorMessage,
  normalizeEtlRoutines,
  parseLattesIdsInput,
} from '@/entities/etl/model';
import {
  etlKeys,
  etlRoutinesQueryOptions,
  triggerEtlRunMutationOptions,
} from '@/entities/etl/queries';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

/**
 * Diálogo efêmero (ADR 0004) para disparar uma execução do ETL pela API de
 * admin (`POST /etl/runs`). Base completa por padrão, com modo avançado para
 * selecionar rotinas e/ou informar Lattes IDs de 16 dígitos.
 */
export function EtlTriggerDialog() {
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [lattesInput, setLattesInput] = useState('');
  const [force, setForce] = useState(false);
  const [lattesError, setLattesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const baseId = useId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const routinesQuery = useQuery({
    ...etlRoutinesQueryOptions(),
    enabled: open && advanced,
  });

  const routines = useMemo(
    () => normalizeEtlRoutines(routinesQuery.data),
    [routinesQuery.data],
  );

  const mutation = useMutation({
    ...triggerEtlRunMutationOptions(),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: etlKeys.all });
      toast.success('Sincronização iniciada.');
      setOpen(false);
      resetForm();
      void navigate({
        to: '/console/etl/$runId',
        params: { runId: result.run_id },
        search: { tab: 'etapas', level: 'all' },
      });
    },
    onError: (error) => {
      setSubmitError(etlTriggerErrorMessage(error));
    },
  });

  function resetForm() {
    setAdvanced(false);
    setSelectedRoutines([]);
    setLattesInput('');
    setForce(false);
    setLattesError(null);
    setSubmitError(null);
    mutation.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next && mutation.isPending) return;
    setOpen(next);
    if (!next) resetForm();
  }

  function toggleRoutine(routineId: string, checked: boolean) {
    setSelectedRoutines((prev) =>
      checked
        ? prev.includes(routineId)
          ? prev
          : [...prev, routineId]
        : prev.filter((id) => id !== routineId),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLattesError(null);
    setSubmitError(null);

    if (!advanced) {
      mutation.mutate({
        routines: null,
        lattes_ids: null,
        force: false,
      });
      return;
    }

    const { valid, invalid } = parseLattesIdsInput(lattesInput);
    if (invalid.length > 0) {
      setLattesError(
        `Cada ID Lattes deve ter exatamente 16 dígitos numéricos. Inválido(s): ${invalid.join(', ')}`,
      );
      return;
    }

    mutation.mutate({
      routines: selectedRoutines.length > 0 ? selectedRoutines : null,
      lattes_ids: valid.length > 0 ? valid : null,
      force,
    });
  }

  const lattesFieldId = `${baseId}-lattes`;
  const forceFieldId = `${baseId}-force`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button type="button" onClick={() => setOpen(true)}>
        <Play aria-hidden />
        Sincronizar agora
      </Button>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={!mutation.isPending}
      >
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Disparar sincronização (ETL)</DialogTitle>
            <DialogDescription>
              Por padrão, executa o pipeline completo para toda a base de
              pesquisadores.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {advanced ? 'Modo avançado' : 'Base completa'}
              </span>
              <span className="text-xs text-muted-foreground">
                {advanced
                  ? 'Escolha rotinas específicas ou informe IDs Lattes.'
                  : 'Todas as rotinas e todos os currículos cadastrados.'}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdvanced((prev) => !prev)}
            >
              <SlidersHorizontal aria-hidden />
              {advanced ? 'Usar padrão' : 'Modo avançado'}
            </Button>
          </div>

          {advanced && (
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    Rotinas (opcional)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedRoutines(routines.map((r) => r.id))
                      }
                      disabled={routines.length === 0}
                    >
                      Selecionar todas
                    </Button>
                    {selectedRoutines.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRoutines([])}
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se nenhuma rotina for marcada, todas serão executadas.
                </p>

                {routinesQuery.isPending ? (
                  <div className="flex items-center gap-2 rounded-md border p-3 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Carregando catálogo de rotinas...
                  </div>
                ) : (
                  <div className="max-h-44 overflow-y-auto rounded-md border p-2">
                    <div className="flex flex-col gap-1.5 pr-1">
                      {routines.map((routine) => {
                        const checked = selectedRoutines.includes(routine.id);
                        const itemId = `${baseId}-routine-${routine.id}`;
                        return (
                          <label
                            key={routine.id}
                            htmlFor={itemId}
                            className="flex cursor-pointer items-start gap-2.5 rounded-sm p-1.5 hover:bg-muted/60"
                          >
                            <Checkbox
                              id={itemId}
                              checked={checked}
                              onCheckedChange={(value) =>
                                toggleRoutine(routine.id, value === true)
                              }
                              className="mt-0.5"
                            />
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="flex flex-wrap items-center gap-1.5 text-sm leading-tight font-medium">
                                <span>{routine.title}</span>
                                <Badge variant="outline" size="sm">
                                  {routine.category}
                                </Badge>
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {routine.shortDescription}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={lattesFieldId} className="text-sm font-medium">
                  IDs Lattes específicos (opcional)
                </label>
                <textarea
                  id={lattesFieldId}
                  rows={3}
                  value={lattesInput}
                  onChange={(event) => {
                    setLattesInput(event.target.value);
                    if (lattesError) setLattesError(null);
                  }}
                  placeholder="Ex.: 1234567890123456, 6543210987654321"
                  aria-invalid={Boolean(lattesError) || undefined}
                  aria-describedby={
                    lattesError
                      ? `${lattesFieldId}-error`
                      : `${lattesFieldId}-hint`
                  }
                  className="w-full rounded-md border border-input bg-card px-3 py-2 font-mono text-xs shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                />
                {lattesError ? (
                  <p
                    id={`${lattesFieldId}-error`}
                    className="text-xs text-destructive"
                  >
                    {lattesError}
                  </p>
                ) : (
                  <p
                    id={`${lattesFieldId}-hint`}
                    className="text-xs text-muted-foreground"
                  >
                    Informe IDs de 16 dígitos separados por vírgula, espaço ou
                    quebra de linha.
                  </p>
                )}
              </div>

              <label
                htmlFor={forceFieldId}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  id={forceFieldId}
                  checked={force}
                  onCheckedChange={(value) => setForce(value === true)}
                />
                <span>Forçar início mesmo com lock ativo</span>
              </label>
            </div>
          )}

          {submitError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              Iniciar sincronização
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
