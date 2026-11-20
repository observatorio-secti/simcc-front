// Único ponto de acesso a localStorage/sessionStorage (o lint bloqueia o resto).
//
// Use só para preferências do visitante (ex.: sidebar recolhida). Token de
// sessão não fica aqui: veja docs/decisoes/0008-autenticacao.md.

type StorageKind = 'local' | 'session';

function getStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    // Navegação privada ou armazenamento bloqueado.
    return null;
  }
}

export function readStorage<T>(
  key: string,
  fallback: T,
  kind: StorageKind = 'local',
): T {
  try {
    const raw = getStorage(kind)?.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(
  key: string,
  value: T,
  kind: StorageKind = 'local',
) {
  try {
    getStorage(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    // Cota cheia ou armazenamento bloqueado: a preferência só não persiste.
  }
}

export function removeStorage(key: string, kind: StorageKind = 'local') {
  try {
    getStorage(kind)?.removeItem(key);
  } catch {
    // Idem.
  }
}
