import { createContext } from 'react';
import {
  OAuthProvider,
  UserPublic,
} from '../types/auth';

export interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (provider?: OAuthProvider) => void;
  loginWithOAuth: (provider: OAuthProvider) => void;
  handleAuthCallback: (params: {
    code?: string | null;
    token?: string | null;
  }) => Promise<string>;
  handleOAuthCallback: (token: string) => Promise<string>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
