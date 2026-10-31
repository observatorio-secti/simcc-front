import axios from 'axios';
import { authStorage } from '../lib/auth-storage';
import { baseURLIdp } from '../lib/api';
import { OAuthProvider, Token, UserPublic } from '../types/auth';

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function generatePKCE() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = base64UrlEncode(array);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64UrlEncode(digest);

  return { codeVerifier, codeChallenge };
}

export const authService = {
  getCallbackUrl(): string {
    const origin = window.location.origin;
    const base = import.meta.env.BASE_URL || '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${origin}${normalizedBase}auth/callback`;
  },

  /**
   * Inicia o fluxo de autorização OIDC / PKCE redirecionando o usuário para o Observatório IdP.
   */
  async redirectToLogin(provider?: OAuthProvider): Promise<void> {
    authStorage.saveRedirectUrl(window.location.pathname + window.location.search);
    const { codeVerifier, codeChallenge } = await generatePKCE();
    const state = Math.random().toString(36).substring(2, 15);
    authStorage.savePkceVerifier(codeVerifier, state);

    const redirectUri = this.getCallbackUrl();

    if (provider) {
      // Inicia direto com o provedor social preservando PKCE
      const pkcePayload = {
        client_id: 'simcc',
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        orig_state: state,
      };
      const b64 = btoa(JSON.stringify(pkcePayload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      window.location.href = `${baseURLIdp}auth/${provider}/login?state=pkce_${b64}`;
      return;
    }

    // Redireciona para a tela central de autorização do IdP
    const params = new URLSearchParams({
      client_id: 'simcc',
      redirect_uri: redirectUri,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    window.location.href = `${baseURLIdp}authorize?${params.toString()}`;
  },

  /**
   * Troca o authorization code pelo access token e refresh token no IdP com validação PKCE.
   */
  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<Token> {
    const redirectUri = this.getCallbackUrl();
    const { data } = await axios.post<Token>(
      `${baseURLIdp}token`,
      {
        grant_type: 'authorization_code',
        client_id: 'simcc',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return data;
  },

  /**
   * Renova o token de acesso utilizando o refresh token no IdP.
   */
  async refreshToken(): Promise<Token> {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    const { data } = await axios.post<Token>(
      `${baseURLIdp}token`,
      {
        grant_type: 'refresh_token',
        client_id: 'simcc',
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return data;
  },

  /**
   * Consulta os dados cadastrais e o papel do usuário no endpoint /me do IdP.
   */
  async getCurrentUser(): Promise<UserPublic> {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const { data } = await axios.get(`${baseURLIdp}me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      id: data.id,
      username: data.name || (data.email ? data.email.split('@')[0] : 'Usuário'),
      email: data.email,
      role: (data.role || 'DEFAULT') as 'DEFAULT' | 'ADMIN',
    };
  },
};
