import React, { useState } from 'react';
import {
  AlertTriangle,
  Play,
  RotateCcw,
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
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { RoutineCatalogItem, TriggerRunPayload } from '../../../types/etl';
import { useAuth } from '../../../hooks/use-auth';
import { getRoutineMetadata } from '../../../lib/etl-routines-catalog';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [lattesIdsRaw, setLattesIdsRaw] = useState<string>('');

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

    const lattesIds = lattesIdsRaw
      .split(/[\n,;]+/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    const payload: TriggerRunPayload = {
      triggered_by: user?.email || user?.username || 'admin',
    };

    if (showAdvanced && selectedRoutines.length > 0) {
      payload.routines = selectedRoutines;
    }

    if (showAdvanced && lattesIds.length > 0) {
      payload.lattes_ids = lattesIds;
    }

    await onTrigger(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border-sm-wave-gray rounded-md p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1">
            <p className="sm-eyebrow">OPERAÇÃO · <b>SINCRONIZAÇÃO</b></p>
            <DialogTitle className="text-xl font-extrabold text-sm-navy">
              Atualizar Base de Dados
            </DialogTitle>
            <DialogDescription className="text-xs text-sm-navy-600">
              Sincroniza os currículos Lattes com a plataforma e recalcula produções e indicadores.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-3 bg-sm-wash rounded border border-sm-wave-gray text-xs text-sm-navy space-y-1">
              <p className="font-extrabold">Atualização em segundo plano</p>
              <p className="text-[11px] text-sm-navy-600">
                O processo será executado de forma assíncrona. Você poderá continuar navegando na plataforma normalmente.
              </p>
            </div>

            {/* Alternar opções avançadas */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-xs font-extrabold text-sm-navy hover:text-sm-red-700 underline"
              >
                {showAdvanced ? 'Ocultar opções avançadas' : 'Configurações avançadas (opcional)'}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 border-t border-sm-wave-gray pt-3">
                {/* Filtro Opcional de Pesquisadores */}
                <div className="space-y-1">
                  <Label className="text-xs font-extrabold text-sm-navy">
                    Lattes IDs Específicos (Opcional)
                  </Label>
                  <Textarea
                    value={lattesIdsRaw}
                    onChange={(e) => setLattesIdsRaw(e.target.value)}
                    placeholder="Deixe em branco para toda a base ou digite IDs separados por vírgula"
                    rows={2}
                    className="text-xs font-mono border-sm-wave-gray rounded-sm"
                  />
                </div>

                {/* Checklist de Rotinas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-sm-wave-gray">
                    <span className="text-xs font-semibold text-sm-navy">
                      Rotinas Específicas ({selectedRoutines.length} selecionadas)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAllRoutines}
                        className="h-6 text-[11px] text-sm-navy px-1.5"
                      >
                        Todas
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDeselectAllRoutines}
                        className="h-6 text-[11px] text-sm-navy-600 px-1.5"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                    {routines.map((routine) => {
                      const isChecked = selectedRoutines.includes(routine.id);
                      const meta = getRoutineMetadata(routine.id);

                      return (
                        <label
                          key={routine.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-sm-wash cursor-pointer text-xs"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleRoutine(routine.id)}
                          />
                          <span className="font-medium text-sm-navy">
                            {meta.title}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs border-sm-wave-gray text-sm-navy rounded-sm h-9"
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isLoading}
              className="sm-btn text-xs py-2 px-4 gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isLoading ? 'Iniciando...' : 'Iniciar Atualização'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
