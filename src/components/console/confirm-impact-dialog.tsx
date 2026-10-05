import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  impactMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmImpactDialog({
  open,
  onOpenChange,
  title,
  description,
  impactMessage,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = true,
  onConfirm,
  isLoading = false,
}: ConfirmImpactDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full ${
                destructive
                  ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold font-sans text-neutral-900 dark:text-neutral-100">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            {description}
          </AlertDialogDescription>

          {impactMessage && (
            <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 font-sans">
              <strong>Impacto:</strong> {impactMessage}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="text-xs font-medium border-neutral-200 dark:border-neutral-800"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`text-xs font-semibold ${
              destructive
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600'
                : 'bg-[#559FB8] hover:bg-[#024A60] text-white'
            }`}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
