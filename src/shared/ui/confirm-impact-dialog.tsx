import type * as React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export interface ConfirmImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pergunta direta: "Remover administrador?". */
  title: React.ReactNode;
  /** O que será afetado (nome, sigla, sub…). */
  description?: React.ReactNode;
  /** Consequências da ação, mostradas no alerta de impacto. */
  impact?: React.ReactNode;
  /** Rótulo do botão de confirmação (verbo da ação: "Remover"). */
  confirmLabel: string;
  cancelLabel?: string;
  /** Chamado ao confirmar. O diálogo não fecha sozinho: quem abre decide. */
  onConfirm: () => void;
  /** Ação em andamento: trava os botões e mostra o spinner. */
  pending?: boolean;
  /** Erro da última tentativa, mostrado dentro do diálogo. */
  error?: React.ReactNode;
  /** Ação destrutiva (padrão) ou só de impacto (ex.: desvincular). */
  tone?: 'destructive' | 'default';
}

/**
 * Confirmação antes de uma ação irreversível ou de impacto (excluir,
 * desvincular, remover acesso). É diálogo efêmero (ADR 0004): o estado aberto
 * é local de quem abre. Em erro, o diálogo continua aberto mostrando a causa.
 */
export function ConfirmImpactDialog({
  open,
  onOpenChange,
  title,
  description,
  impact,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  pending = false,
  error,
  tone = 'destructive',
}: ConfirmImpactDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogContent role="alertdialog" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {impact && (
          <div
            data-slot="impact"
            className={cn(
              'flex items-start gap-3 rounded-md border p-3 text-sm',
              tone === 'destructive'
                ? 'border-destructive/40 bg-destructive/10 text-foreground'
                : 'border-eng-blue/40 bg-brand-soft text-foreground dark:bg-eng-blue/20',
            )}
          >
            <AlertTriangle
              className={cn(
                'mt-0.5 size-4 shrink-0',
                tone === 'destructive' ? 'text-destructive' : 'text-eng-blue',
              )}
              aria-hidden
            />
            <div className="flex flex-col gap-1">{impact}</div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={onConfirm}
          >
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
