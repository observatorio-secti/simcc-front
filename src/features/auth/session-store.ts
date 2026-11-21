import { useSyncExternalStore } from 'react';
import { admin, type AdminClient, type AdminUser } from '@/api/admin';
import { ApiError, isAbortError, isApiError } from '@/api/errors';
import {
  clearPkceTransaction,
  consumePkceTransaction,
  decodeOAuthState,
  idp,
  type IdpClient,
  readJwtIdentity,
  sanitizeReturnTo,
} from '@/api/idp';

export type SessionStatus = 'anonymous' | 'loading' | 'authenticated';

export interface SessionSnapshot {
  status: SessionStatus;
  user: AdminUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  error: ApiError | Error | null;
}

export interface LoginOptions {
  prompt?: 'none' | 'login';
  returnTo?: string;
  redirect?: boolean;
}

export interface LogoutOptions {
  returnTo?: string;
}

export interface CallbackParams {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}

export type CallbackOutcome =
  | { kind: 'success'; returnTo: string }
  | { kind: 'redirect_login'; url: string; returnTo: string }
  | {
      kind: 'error';
      code: string;
      message: string;
      returnTo: string;
      canRetryProfile?: boolean;
    };

export interface SessionStoreDeps {
  idp?: IdpClient;
  admin?: AdminClient;
  navigateExternal?: (url: string) => void;
  getCurrentHref?: () => string;
  getBaseUrl?: () => string;
}

const ANONYMOUS_SNAPSHOT: SessionSnapshot = {
  status: 'anonymous',
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  error: null,
};

function defaultNavigateExternal(url: string): void {
  window.location.assign(url);
}

function defaultGetBaseUrl(): string {
  return import.meta.env.BASE_URL || '/';
}

function defaultGetCurrentHref(baseUrl: string): string {
  if (typeof window === 'undefined') return '/';
  return sanitizeReturnTo(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
    baseUrl,
  );
}

function isCallbackLocation(baseUrl: string): boolean {
  if (typeof window === 'undefined') return false;
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const callbackPath = `${normalizedBase}auth/callback`;
  return window.location.pathname.startsWith(callbackPath);
}

function formatCallbackError(error: string, description?: string): string {
  if (description && description.trim() !== '') {
    return description;
  }
  switch (error) {
    case 'access_denied':
      return 'O acesso foi cancelado ou negado no provedor de identidade.';
    case 'login_required':
      return 'É necessário entrar novamente para continuar.';
    case 'invalid_request':
    case 'unauthorized_client':
      return 'Requisição de autenticação inválida. Tente entrar novamente.';
    case 'server_error':
    case 'temporarily_unavailable':
      return 'O provedor de identidade está temporariamente indisponível. Tente em instantes.';
    default:
      return 'Não foi possível concluir a autenticação externa.';
  }
}

/**
 * Cria uma store de sessão em memória (sem tokens em storage), assinável via
 * `useSyncExternalStore` e pelo `beforeLoad` do TanStack Router.
 */
export function createSessionStore(deps: SessionStoreDeps = {}) {
  const idpClient = deps.idp ?? idp;
  const adminClient = deps.admin ?? admin;
  const navigateExternal = deps.navigateExternal ?? defaultNavigateExternal;
  const getBaseUrl = deps.getBaseUrl ?? defaultGetBaseUrl;
  const getCurrentHref =
    deps.getCurrentHref ?? (() => defaultGetCurrentHref(getBaseUrl()));

  let snapshot: SessionSnapshot = ANONYMOUS_SNAPSHOT;
  let profileLoaded = false;
  let inFlightEnsure: Promise<SessionSnapshot> | null = null;
  let inFlightEnsureId: symbol | null = null;
  let handlingCallback = false;
  let resumingSilentLogin = false;
  let lastCallback: { key: string; promise: Promise<CallbackOutcome> } | null =
    null;

  const listeners = new Set<() => void>();

  function setSnapshot(next: SessionSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getSnapshot(): SessionSnapshot {
    return snapshot;
  }

  async function login(options: LoginOptions = {}): Promise<string> {
    const returnTo = options.returnTo ?? getCurrentHref();
    const { url } = await idpClient.prepareAuthorization({
      prompt: options.prompt,
      returnTo,
    });
    if (options.redirect !== false) {
      navigateExternal(url);
    }
    return url;
  }

  function logout(options: LogoutOptions = {}): string | null {
    profileLoaded = false;
    handlingCallback = false;
    resumingSilentLogin = false;
    lastCallback = null;
    idpClient.clearTokens();
    clearPkceTransaction();
    setSnapshot(ANONYMOUS_SNAPSHOT);

    if (!idpClient.isConfigured()) {
      return null;
    }

    const endSessionUrl = idpClient.buildEndSessionUrl(options.returnTo);
    navigateExternal(endSessionUrl);
    return endSessionUrl;
  }

  async function loadUserProfile(
    signal?: AbortSignal,
  ): Promise<SessionSnapshot> {
    const accessToken = await idpClient.ensureAccessToken(signal);
    if (!accessToken) {
      profileLoaded = false;
      setSnapshot(ANONYMOUS_SNAPSHOT);
      return snapshot;
    }

    try {
      const me = await adminClient.fetchMe(signal);
      profileLoaded = true;
      setSnapshot({
        status: 'authenticated',
        user: me.user,
        // `is_admin` vem exclusivamente de GET <admin>/me (ADR 0008).
        isAdmin: me.is_admin,
        isAuthenticated: true,
        error: null,
      });
      return snapshot;
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      if (isApiError(error) && error.status === 403) {
        profileLoaded = true;
        const currentToken = idpClient.getAccessToken();
        setSnapshot({
          status: 'authenticated',
          user: currentToken ? readJwtIdentity(currentToken) : null,
          isAdmin: false,
          isAuthenticated: true,
          error: null,
        });
        return snapshot;
      }

      if (isApiError(error) && error.status === 401) {
        profileLoaded = false;
        idpClient.clearTokens();
        setSnapshot({
          status: 'anonymous',
          user: null,
          isAdmin: false,
          isAuthenticated: false,
          error,
        });
        return snapshot;
      }

      // 502/504 ou indisponibilidade transitória: mantém tokens em memória sem encerrar sessão.
      const resolvedError =
        error instanceof Error
          ? error
          : new ApiError({
              status: 0,
              code: 'profile_error',
              message: 'Não foi possível validar as permissões do usuário.',
            });
      const currentToken = idpClient.getAccessToken();
      setSnapshot({
        status: profileLoaded ? 'authenticated' : 'anonymous',
        user:
          snapshot.user ??
          (currentToken ? readJwtIdentity(currentToken) : null),
        isAdmin: false,
        isAuthenticated: profileLoaded,
        error: resolvedError,
      });
      return snapshot;
    }
  }

  async function ensureSession(signal?: AbortSignal): Promise<SessionSnapshot> {
    if (
      profileLoaded &&
      snapshot.status === 'authenticated' &&
      idpClient.hasSession() &&
      !idpClient.isAccessTokenExpired()
    ) {
      return snapshot;
    }

    if (inFlightEnsure !== null) {
      return inFlightEnsure;
    }

    if (!idpClient.hasSession()) {
      profileLoaded = false;
      if (snapshot.status !== 'anonymous' || snapshot.error !== null) {
        setSnapshot(ANONYMOUS_SNAPSHOT);
      }
      return snapshot;
    }

    setSnapshot({
      ...snapshot,
      status: 'loading',
      error: null,
    });

    const ensureId = Symbol('ensure');
    inFlightEnsureId = ensureId;
    const promise = (async () => {
      try {
        return await loadUserProfile(signal);
      } finally {
        if (inFlightEnsureId === ensureId) {
          inFlightEnsure = null;
          inFlightEnsureId = null;
        }
      }
    })();

    inFlightEnsure = promise;
    return promise;
  }

  async function handleCallback(
    params: CallbackParams,
  ): Promise<CallbackOutcome> {
    resumingSilentLogin = false;
    const baseUrl = getBaseUrl();
    const dedupeKey = params.error
      ? `error:${params.error}:${params.state ?? ''}`
      : params.code
        ? `code:${params.code}:${params.state ?? ''}`
        : null;

    if (dedupeKey && lastCallback?.key === dedupeKey) {
      return lastCallback.promise;
    }

    const run = async (): Promise<CallbackOutcome> => {
      if (params.error) {
        const storedTx = consumePkceTransaction();
        const decodedState = decodeOAuthState(params.state, baseUrl);
        const returnTo = sanitizeReturnTo(
          storedTx?.returnTo ?? decodedState?.returnTo ?? '/',
          baseUrl,
        );

        if (params.error === 'login_required') {
          if (storedTx && storedTx.prompt !== 'none') {
            setSnapshot(ANONYMOUS_SNAPSHOT);
            return {
              kind: 'error',
              code: 'login_required',
              message: formatCallbackError('login_required'),
              returnTo,
            };
          }
          const url = await login({ returnTo });
          return { kind: 'redirect_login', url, returnTo };
        }

        setSnapshot(ANONYMOUS_SNAPSHOT);
        return {
          kind: 'error',
          code: params.error,
          message: formatCallbackError(params.error, params.errorDescription),
          returnTo,
        };
      }

      if (!params.code) {
        clearPkceTransaction();
        setSnapshot(ANONYMOUS_SNAPSHOT);
        return {
          kind: 'error',
          code: 'missing_code',
          message:
            'Nenhum código de autorização foi informado no retorno do login.',
          returnTo: '/',
        };
      }

      const storedTx = consumePkceTransaction();
      const decodedState = decodeOAuthState(params.state, baseUrl);
      const fallbackReturnTo = sanitizeReturnTo(
        decodedState?.returnTo ?? '/',
        baseUrl,
      );

      if (!storedTx || !params.state || params.state !== storedTx.state) {
        setSnapshot(ANONYMOUS_SNAPSHOT);
        return {
          kind: 'error',
          code: 'invalid_state',
          message:
            'Sessão de autenticação inválida ou expirada. Tente entrar novamente.',
          returnTo: fallbackReturnTo,
        };
      }

      handlingCallback = true;
      setSnapshot({
        ...snapshot,
        status: 'loading',
        error: null,
      });

      try {
        await idpClient.exchangeCodeForTokens({
          code: params.code,
          codeVerifier: storedTx.codeVerifier,
        });

        const next = await loadUserProfile();
        if (next.status === 'authenticated') {
          return { kind: 'success', returnTo: storedTx.returnTo };
        }

        if (next.error && idpClient.hasSession()) {
          return {
            kind: 'error',
            code: isApiError(next.error) ? next.error.code : 'profile_error',
            message: next.error.message,
            returnTo: storedTx.returnTo,
            canRetryProfile: true,
          };
        }

        return {
          kind: 'error',
          code: isApiError(next.error) ? next.error.code : 'unauthorized',
          message:
            next.error?.message ?? 'Não foi possível validar sua sessão.',
          returnTo: storedTx.returnTo,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível concluir a autenticação.';
        setSnapshot(ANONYMOUS_SNAPSHOT);
        return {
          kind: 'error',
          code: isApiError(error) ? error.code : 'callback_error',
          message,
          returnTo: storedTx.returnTo,
        };
      } finally {
        handlingCallback = false;
      }
    };

    const promise = run();
    if (dedupeKey) {
      lastCallback = { key: dedupeKey, promise };
    }
    return promise;
  }

  function handleAdminAuthFailure() {
    profileLoaded = false;
    idpClient.clearTokens();
    setSnapshot(ANONYMOUS_SNAPSHOT);

    if (
      handlingCallback ||
      resumingSilentLogin ||
      !idpClient.isConfigured() ||
      isCallbackLocation(getBaseUrl())
    ) {
      return;
    }

    resumingSilentLogin = true;
    void login({ prompt: 'none', returnTo: getCurrentHref() }).catch(() => {
      resumingSilentLogin = false;
    });
  }

  adminClient.setAuthFailureHandler(handleAdminAuthFailure);

  function reset() {
    profileLoaded = false;
    inFlightEnsure = null;
    inFlightEnsureId = null;
    handlingCallback = false;
    resumingSilentLogin = false;
    lastCallback = null;
    idpClient.clearTokens();
    clearPkceTransaction();
    setSnapshot(ANONYMOUS_SNAPSHOT);
  }

  return {
    subscribe,
    getSnapshot,
    isIdpConfigured: () => idpClient.isConfigured(),
    isAdminApiConfigured: () => adminClient.isConfigured(),
    hasTokensInMemory: () => idpClient.hasSession(),
    login,
    logout,
    ensureSession,
    handleCallback,
    reset,
  };
}

export type SessionStore = ReturnType<typeof createSessionStore>;

export const sessionStore = createSessionStore();

export function useSessionState(store: SessionStore = sessionStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
