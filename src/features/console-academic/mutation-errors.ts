import { isApiError } from '@/api/errors';
import { academicConflictMessage } from '@/entities/academic/model';
import { errorMessage } from '@/shared/lib/error-message';

/**
 * Extrai erros de validação (422) ou conflito (409) de uma `ApiError` para
 * exibição inline sem fechar o diálogo.
 */
export function resolveMutationErrors<TField extends string>(
  error: unknown,
  options: {
    allowedFields: ReadonlySet<string>;
    conflictField?: TField;
  },
): { fieldErrors: Partial<Record<TField, string>>; formError: string | null } {
  if (isApiError(error) && error.status === 409) {
    const translated = academicConflictMessage(error.message);
    if (options.conflictField) {
      return {
        fieldErrors: { [options.conflictField]: translated } as Partial<
          Record<TField, string>
        >,
        formError: null,
      };
    }
    return { fieldErrors: {}, formError: translated };
  }

  if (isApiError(error) && error.status === 422) {
    const next: Partial<Record<TField, string>> = {};
    for (const detail of error.details) {
      if (detail.field && options.allowedFields.has(detail.field)) {
        next[detail.field as TField] = detail.message;
      }
    }
    if (Object.keys(next).length > 0) {
      return { fieldErrors: next, formError: null };
    }
  }

  return { fieldErrors: {}, formError: errorMessage(error) };
}
