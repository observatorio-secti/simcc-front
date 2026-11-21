import { useSyncExternalStore } from 'react';

export const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

function subscribe(listener: () => void): () => void {
  const mediaQuery = window.matchMedia?.(MOBILE_MEDIA_QUERY);
  if (!mediaQuery) return () => {};

  mediaQuery.addEventListener('change', listener);
  return () => mediaQuery.removeEventListener('change', listener);
}

function getSnapshot(): boolean {
  return window.matchMedia?.(MOBILE_MEDIA_QUERY).matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

/** Retorna `true` abaixo do breakpoint `md` (`< 768px`). */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
