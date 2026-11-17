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
      <AlertDialogContent className="max-w-md border-sm-wave-gray bg-white rounded-md p-6">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                destructive
                  ? 'bg-sm-red-100 text-sm-red-700'
                  : 'bg-sm-wash text-sm-navy'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-extrabold font-sans text-sm-navy">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-sm-navy-600 font-sans leading-relaxed">
            {description}
          </AlertDialogDescription>

          {impactMessage && (
            <div className="p-3 rounded border border-sm-wave-gray bg-sm-wash text-xs text-sm-navy font-sans">
              <b>Impacto:</b> {impactMessage}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="text-xs font-semibold border-sm-wave-gray text-sm-navy rounded-sm h-9"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`text-xs font-extrabold rounded-sm h-9 px-4 ${
              destructive
                ? 'bg-sm-red-700 hover:bg-sm-red text-white'
                : 'sm-btn'
            }`}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
