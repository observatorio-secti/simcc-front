import Cookies from 'js-cookie';

const TOKEN_KEY = 'obs_access_token';
const LEGACY_TOKEN_KEY = 'simcc_access_token';
const REFRESH_TOKEN_KEY = 'obs_refresh_token';
const REDIRECT_KEY = 'obs_auth_redirect';
const PKCE_VERIFIER_KEY = 'obs_pkce_verifier';
const PKCE_STATE_KEY = 'obs_pkce_state';

export const authStorage = {
  getToken: (): string | null => {
    try {
      const localToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
      if (localToken) return localToken;
      return Cookies.get(TOKEN_KEY) || Cookies.get(LEGACY_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      Cookies.set(TOKEN_KEY, token, {
        expires: 7,
        sameSite: 'lax',
        path: '/',
      });
    } catch (err) {
      console.error('Falha ao salvar token no storage:', err);
    }
  },

  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY) || Cookies.get(REFRESH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },

  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      Cookies.set(REFRESH_TOKEN_KEY, token, {
        expires: 30,
        sameSite: 'lax',
        path: '/',
      });
    } catch (err) {
      console.error('Falha ao salvar refresh token no storage:', err);
    }
  },

  removeRefreshToken: (): void => {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
    } catch (err) {
      console.error('Falha ao remover refresh token do storage:', err);
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      Cookies.remove(TOKEN_KEY, { path: '/' });
      Cookies.remove(LEGACY_TOKEN_KEY, { path: '/' });
      Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
    } catch (err) {
      console.error('Falha ao remover tokens do storage:', err);
    }
  },

  savePkceVerifier: (verifier: string, state?: string): void => {
    try {
      sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
      if (state) {
        sessionStorage.setItem(PKCE_STATE_KEY, state);
      }
    } catch (err) {
      console.error('Falha ao salvar PKCE verifier:', err);
    }
  },

  getPkceVerifier: (): string | null => {
    try {
      return sessionStorage.getItem(PKCE_VERIFIER_KEY);
    } catch {
      return null;
    }
  },

  consumePkceVerifier: (): string | null => {
    try {
      const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
      sessionStorage.removeItem(PKCE_VERIFIER_KEY);
      sessionStorage.removeItem(PKCE_STATE_KEY);
      return verifier;
    } catch {
      return null;
    }
  },

  saveRedirectUrl: (url?: string): void => {
    try {
      const target = url || window.location.pathname + window.location.search;
      if (target && !target.includes('/auth/callback')) {
        sessionStorage.setItem(REDIRECT_KEY, target);
      }
    } catch (err) {
      console.error('Falha ao salvar URL de redirecionamento:', err);
    }
  },

  consumeRedirectUrl: (fallback = '/'): string => {
    try {
      const saved = sessionStorage.getItem(REDIRECT_KEY);
      if (saved) {
        sessionStorage.removeItem(REDIRECT_KEY);
        if (!saved.includes('/auth/callback')) {
          return saved;
        }
      }
      return fallback;
    } catch {
      return fallback;
    }
  },
};
