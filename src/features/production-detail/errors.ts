import { isApiError } from '@/api/errors';

/** A v2 respondeu 404 para o detalhe da produção. */
export function isProductionNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}
