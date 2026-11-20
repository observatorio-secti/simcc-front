import { useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from './storage';

// Tema claro/escuro pela classe .dark no <html> (é o que o design kit espera).
// O index.html aplica a classe antes do primeiro paint, com a mesma chave e o
// mesmo formato usados aqui, para não piscar o tema errado.

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'simcc:theme';

const listeners = new Set<() => void>();

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function getPreference(): ThemePreference {
  return readStorage<ThemePreference>(THEME_STORAGE_KEY, 'system');
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light';
  return preference;
}

function applyTheme() {
  const resolved = resolveTheme(getPreference(), systemPrefersDark());
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

function notify() {
  applyTheme();
  listeners.forEach((listener) => listener());
}

/** Chamar uma vez na inicialização: acompanha a troca de tema do sistema. */
export function initTheme() {
  applyTheme();
  window
    .matchMedia?.('(prefers-color-scheme: dark)')
    .addEventListener('change', notify);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  const preference = getPreference();
  return `${preference}:${resolveTheme(preference, systemPrefersDark())}`;
}

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const [preference, resolvedTheme] = snapshot.split(':') as [
    ThemePreference,
    ResolvedTheme,
  ];

  const setTheme = (next: ThemePreference) => {
    writeStorage(THEME_STORAGE_KEY, next);
    notify();
  };

  return { preference, resolvedTheme, setTheme };
}
