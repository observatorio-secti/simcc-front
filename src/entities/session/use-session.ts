import {
  type SessionStore,
  sessionStore,
  useSessionState,
} from './session-store';

/**
 * Lê o estado reativo da sessão em memória e expõe as ações de autenticação.
 * `isAdmin` reflete exclusivamente `GET <admin>/me`.
 */
export function useSession(store: SessionStore = sessionStore) {
  const state = useSessionState(store);

  return {
    ...state,
    isIdpConfigured: store.isIdpConfigured(),
    login: store.login,
    logout: store.logout,
    ensureSession: store.ensureSession,
    handleCallback: store.handleCallback,
  };
}
