import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckSquare,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Square,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { RoutineCatalogItem, TriggerRunPayload } from '../../../types/etl';
import { useAuth } from '../../../hooks/use-auth';

interface EtlTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routines: RoutineCatalogItem[];
  onTrigger: (payload: TriggerRunPayload) => Promise<any>;
  isLoading?: boolean;
}

export function EtlTriggerDialog({
  open,
  onOpenChange,
  routines,
  onTrigger,
  isLoading = false,
}: EtlTriggerDialogProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'all' | 'custom'>('all');
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [lattesIdsRaw, setLattesIdsRaw] = useState<string>('');
  const [triggeredBy, setTriggeredBy] = useState<string>(
    user?.email || user?.username || 'admin',
  );

  // Sincroniza operador quando usuário carrega
  React.useEffect(() => {
    if (user?.email || user?.username) {
      setTriggeredBy(user.email || user.username);
    }
  }, [user]);

  const handleToggleRoutine = (id: string) => {
    setSelectedRoutines((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleSelectAllRoutines = () => {
    setSelectedRoutines(routines.map((r) => r.id));
  };

  const handleDeselectAllRoutines = () => {
    setSelectedRoutines([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Processa lista de Lattes IDs (dividido por vírgula, ponto-e-vírgula ou nova linha)
    const lattesIds = lattesIdsRaw
      .split(/[\n,;]+/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    const payload: TriggerRunPayload = {
      triggered_by: triggeredBy.trim() || 'operador_simcc',
    };

    if (mode === 'custom' && selectedRoutines.length > 0) {
      payload.routines = selectedRoutines;
    }

    if (lattesIds.length > 0) {
      payload.lattes_ids = lattesIds;
    }

    await onTrigger(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <Play className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              Iniciar Pipeline de Rotinas ETL
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Dispara o pipeline assíncrono de coleta, saneamento, orquestração e
              indexação de dados do SimCC.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            {/* Aviso de Lock Concorrente */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">PostgreSQL Advisory Lock:</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  Apenas 1 pipeline pode ser executado por vez. Se outro processo
                  estiver ativo, a solicitação entrará em estado de conflito até a
                  liberação.
                </p>
              </div>
            </div>

            {/* Modo de Seleção: Todas vs Personalizado */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Escopo de Rotinas
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('all')}
                  className={`p-3 rounded-lg border text-left transition ${
                    mode === 'all'
                      ? 'border-[#559FB8] bg-[#559FB8]/10 text-neutral-900 dark:text-white font-medium ring-1 ring-[#559FB8]'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <p className="text-xs font-semibold">Todas as Rotinas Padrão</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Executa o pipeline completo recomendado em ordem de dependência.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className={`p-3 rounded-lg border text-left transition ${
                    mode === 'custom'
                      ? 'border-[#559FB8] bg-[#559FB8]/10 text-neutral-900 dark:text-white font-medium ring-1 ring-[#559FB8]'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <p className="text-xs font-semibold">Seleção Personalizada</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Escolha etapas específicas (ex: apenas saneamento ou cálculo).
                  </p>
                </button>
              </div>
            </div>

            {/* Seleção de Rotinas se Custom */}
            {mode === 'custom' && (
              <div className="space-y-2 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Rotinas Disponíveis ({selectedRoutines.length} selecionadas)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllRoutines}
                      className="h-6 text-[11px] text-[#559FB8] px-1.5"
                    >
                      Selecionar todas
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDeselectAllRoutines}
                      className="h-6 text-[11px] text-neutral-400 px-1.5"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 pt-1">
                  {routines.map((routine) => {
                    const isChecked = selectedRoutines.includes(routine.id);
                    return (
                      <label
                        key={routine.id}
                        className="flex items-center gap-2.5 p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-xs"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleRoutine(routine.id)}
                        />
                        <span className="font-mono text-neutral-800 dark:text-neutral-200">
                          {routine.name || routine.id}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtro Opcional de Pesquisadores (Lattes IDs) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Filtro por IDs Lattes (Opcional)</span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  Vazio = todos os pesquisadores
                </span>
              </Label>
              <Textarea
                value={lattesIdsRaw}
                onChange={(e) => setLattesIdsRaw(e.target.value)}
                placeholder="Ex: 1234567890123456, 9876543210987654 (um por linha ou separados por vírgula)"
                rows={2}
                className="text-xs font-mono bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
              />
            </div>

            {/* Identificação do Operador */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Operador Responsável (`triggered_by`)
              </Label>
              <Input
                value={triggeredBy}
                onChange={(e) => setTriggeredBy(e.target.value)}
                placeholder="Ex: admin@dominio.com"
                className="text-xs bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || (mode === 'custom' && selectedRoutines.length === 0)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Iniciando pipeline...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Iniciar Execução
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
