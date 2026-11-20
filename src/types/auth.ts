export type UserRole = 'DEFAULT' | 'ADMIN';

export interface UserPublic {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
}

export interface Token {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserSchema {
  username: string;
  email: string;
  password: string;
}

export type OAuthProvider = 'google' | 'orcid';
