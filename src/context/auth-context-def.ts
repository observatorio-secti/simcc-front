import { createContext } from 'react';
import {
  LoginCredentials,
  OAuthProvider,
  UserPublic,
  UserSchema,
} from '../types/auth';

export interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: UserSchema) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => void;
  handleOAuthCallback: (token: string) => Promise<string>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
