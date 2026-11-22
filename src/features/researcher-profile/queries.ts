import { isApiError } from '@/api/errors';

export function isNotFoundApiError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}
