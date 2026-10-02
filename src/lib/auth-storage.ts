import Cookies from 'js-cookie';

const TOKEN_KEY = 'simcc_access_token';
const REDIRECT_KEY = 'simcc_auth_redirect';

export const authStorage = {
  getToken: (): string | null => {
    try {
      const localToken = localStorage.getItem(TOKEN_KEY);
      if (localToken) return localToken;
      return Cookies.get(TOKEN_KEY) || null;
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
      });
    } catch (err) {
      console.error('Falha ao salvar token no storage:', err);
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      Cookies.remove(TOKEN_KEY);
    } catch (err) {
      console.error('Falha ao remover token do storage:', err);
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
