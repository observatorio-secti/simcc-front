import { useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from '@/shared/lib/storage';
import { isConversationId } from './model';

// Conversas abertas neste navegador. A API da MarIA não tem login nem dono de
// conversa, e a listagem `GET /conversations` traz as de todo mundo: cada
// visitante vê só os ids que guardou aqui. Os dados (título, data) vêm da API.

export const BROWSER_CONVERSATIONS_KEY = 'maria:conversations';
const MAX_CONVERSATIONS = 50;
const CHANGE_EVENT = 'simcc:maria-conversations';

const EMPTY: readonly string[] = [];
// Última leitura, para o `useSyncExternalStore` receber a mesma referência
// enquanto a lista não muda.
let snapshot: readonly string[] = EMPTY;

function readIds(): readonly string[] {
  const raw = readStorage<unknown>(BROWSER_CONVERSATIONS_KEY, []);
  if (!Array.isArray(raw)) return EMPTY;
  const ids = raw.filter(
    (value): value is string =>
      typeof value === 'string' && isConversationId(value),
  );
  return [...new Set(ids)];
}

function write(ids: readonly string[]) {
  writeStorage(BROWSER_CONVERSATIONS_KEY, ids.slice(0, MAX_CONVERSATIONS));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Ids das conversas deste navegador, da mais recente para a mais antiga. */
export function readBrowserConversationIds(): readonly string[] {
  const ids = readIds();
  const same =
    ids.length === snapshot.length &&
    ids.every((id, index) => id === snapshot[index]);
  if (!same) snapshot = ids;
  return snapshot;
}

/** Guarda (ou sobe para o topo) uma conversa aberta neste navegador. */
export function addBrowserConversation(id: string) {
  if (!isConversationId(id)) return;
  const current = readBrowserConversationIds();
  if (current[0] === id) return;
  write([id, ...current.filter((item) => item !== id)]);
}

/** Tira a conversa da lista local. Não apaga nada na API. */
export function removeBrowserConversation(id: string) {
  const current = readBrowserConversationIds();
  if (!current.includes(id)) return;
  write(current.filter((item) => item !== id));
}

function subscribe(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    // Outra aba mexeu na lista.
    if (event.key === null || event.key === BROWSER_CONVERSATIONS_KEY) {
      onChange();
    }
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', handleStorage);
  };
}

/** Lista reativa das conversas deste navegador. */
export function useBrowserConversationIds(): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    readBrowserConversationIds,
    () => EMPTY,
  );
}
