import { apiAdmin } from '../lib/api';
import {
  LoginCredentials,
  OAuthProvider,
  Token,
  UserPublic,
  UserSchema,
} from '../types/auth';

export const authService = {
  /**
   * Realiza login tradicional via OAuth2 Password Flow na API Administrativa (Porta 8000).
   * Espera Content-Type: application/x-www-form-urlencoded
   */
  async login(credentials: LoginCredentials): Promise<Token> {
    const params = new URLSearchParams();
    params.append('username', credentials.username.trim());
    params.append('password', credentials.password);

    const { data } = await apiAdmin.post<Token>('auth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return data;
  },

  /**
   * Renova o token de acesso do usuário autenticado na API Administrativa.
   */
  async refreshToken(): Promise<Token> {
    const { data } = await apiAdmin.post<Token>('auth/refresh_token');
    return data;
  },

  /**
   * Obtém os dados cadastrais e permissões (role) do usuário logado na API Administrativa.
   */
  async getCurrentUser(): Promise<UserPublic> {
    const { data } = await apiAdmin.get<UserPublic>('users/me');
    return data;
  },

  /**
   * Cadastra um novo usuário na plataforma (role padrão: DEFAULT).
   */
  async register(data: UserSchema): Promise<UserPublic> {
    const payload = {
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
    };
    const response = await apiAdmin.post<UserPublic>('users/', payload);
    return response.data;
  },

  /**
   * Retorna a URL absoluta da API Administrativa para iniciar o fluxo OAuth (Google ou ORCID).
   */
  getOAuthLoginUrl(provider: OAuthProvider): string {
    const rawAdmin = import.meta.env.VITE_URL_ADMIN || 'http://localhost:8000/';
    let base = rawAdmin.replace(/\/$/, '');
    if (base.startsWith('/')) {
      base = 'http://localhost:8000';
    }
    return `${base}/auth/${provider}/login`;
  },
};
