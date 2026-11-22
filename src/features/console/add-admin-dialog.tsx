import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { isApiError } from '@/api/errors';
import { adminConflictMessage, adminDisplayName } from '@/entities/admin/model';
import {
  adminKeys,
  createAdminMutationOptions,
} from '@/entities/admin/queries';
import { errorMessage } from '@/shared/lib/error-message';
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

type FieldName = 'sub' | 'name' | 'email';
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES = new Set<string>(['sub', 'name', 'email']);

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Cadastro de administrador pelo `sub` do IdP (diálogo efêmero, ADR 0004).
 * Em `409` (sub já cadastrado) ou `422`, o erro aparece no campo e o diálogo
 * continua aberto com o que foi digitado.
 */
export function AddAdminDialog() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const baseId = useId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...createAdminMutationOptions(),
    onSuccess: async (admin) => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(`${adminDisplayName(admin)} agora é administrador.`);
      // `isPending` ainda é true aqui: fecha direto, sem a trava do cancelar.
      setOpen(false);
      reset();
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409) {
        setFieldErrors({ sub: adminConflictMessage(error.message) });
        return;
      }
      if (isApiError(error) && error.status === 422) {
        const next: FieldErrors = {};
        for (const detail of error.details) {
          if (detail.field && FIELD_NAMES.has(detail.field)) {
            next[detail.field as FieldName] = detail.message;
          }
        }
        if (Object.keys(next).length > 0) {
          setFieldErrors(next);
          return;
        }
      }
      setFormError(errorMessage(error));
    },
  });

  function reset() {
    setSub('');
    setName('');
    setEmail('');
    setFieldErrors({});
    setFormError(null);
    mutation.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next && mutation.isPending) return;
    setOpen(next);
    if (!next) reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedSub = sub.trim();
    if (!trimmedSub) {
      setFieldErrors({ sub: 'Informe o sub do usuário no IdP.' });
      return;
    }
    setFieldErrors({});
    setFormError(null);
    mutation.mutate({
      sub: trimmedSub,
      name: name.trim() || null,
      email: email.trim() || null,
    });
  }

  const subId = `${baseId}-sub`;
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const describedBy = (id: string, field: FieldName, hasHint = false) =>
    fieldErrors[field] ? `${id}-error` : hasHint ? `${id}-hint` : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button type="button" onClick={() => setOpen(true)}>
        <UserPlus aria-hidden />
        Adicionar administrador
      </Button>
      <DialogContent showCloseButton={!mutation.isPending}>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Adicionar administrador</DialogTitle>
            <DialogDescription>
              Peça à pessoa o sub dela no IdP: ele aparece na tela “Sem acesso”
              quando ela tenta abrir o console.
            </DialogDescription>
          </DialogHeader>

          <Field
            id={subId}
            label="Sub no IdP"
            hint="Identificador único da conta no provedor de identidade."
            error={fieldErrors.sub}
          >
            <Input
              id={subId}
              value={sub}
              onChange={(event) => setSub(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              required
              aria-invalid={Boolean(fieldErrors.sub) || undefined}
              aria-describedby={describedBy(subId, 'sub', true)}
              className="font-mono text-xs"
            />
          </Field>

          <Field id={nameId} label="Nome (opcional)" error={fieldErrors.name}>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.name) || undefined}
              aria-describedby={describedBy(nameId, 'name')}
            />
          </Field>

          <Field
            id={emailId}
            label="E-mail (opcional)"
            error={fieldErrors.email}
          >
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.email) || undefined}
              aria-describedby={describedBy(emailId, 'email')}
            />
          </Field>

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
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
