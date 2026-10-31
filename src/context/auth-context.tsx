import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authStorage } from '../lib/auth-storage';
import { authService } from '../services/auth';
import {
  OAuthProvider,
  UserPublic,
} from '../types/auth';
import { AuthContext } from './auth-context-def';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    authStorage.getToken(),
  );

  // Consulta reativa do perfil via TanStack Query (Estado de Servidor com Cache)
  const {
    data: user = null,
    isLoading: isUserLoading,
    refetch,
  } = useQuery<UserPublic | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const activeToken = authStorage.getToken();
      if (!activeToken) return null;
      try {
        return await authService.getCurrentUser();
      } catch (err) {
        return null;
      }
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    retry: false,
  });

  // Inicia fluxo de login centralizado via Observatório IdP com PKCE
  const login = useCallback((provider?: OAuthProvider) => {
    authService.redirectToLogin(provider);
  }, []);

  const loginWithOAuth = useCallback((provider: OAuthProvider) => {
    authService.redirectToLogin(provider);
  }, []);

  // Processa retorno da autenticação (code PKCE ou token direto)
  const handleAuthCallback = useCallback(
    async ({
      code,
      token: directToken,
    }: {
      code?: string | null;
      token?: string | null;
    }): Promise<string> => {
      let activeAccessToken = directToken;

      if (code) {
        const existingToken = authStorage.getToken();
        const verifier = authStorage.getPkceVerifier();

        if (!verifier) {
          if (existingToken) {
            activeAccessToken = existingToken;
          } else {
            throw new Error(
              'Sessão de autorização inválida ou expirada (código PKCE ausente).',
            );
          }
        } else {
          try {
            const tokenResponse = await authService.exchangeCodeForToken(
              code,
              verifier,
            );
            activeAccessToken = tokenResponse.access_token;
            if (tokenResponse.refresh_token) {
              authStorage.setRefreshToken(tokenResponse.refresh_token);
            }
            authStorage.consumePkceVerifier();
          } catch (err) {
            if (existingToken) {
              activeAccessToken = existingToken;
            } else {
              throw err;
            }
          }
        }
      }

      if (!activeAccessToken) {
        throw new Error('Nenhum código ou token de autorização fornecido.');
      }

      authStorage.setToken(activeAccessToken);
      setToken(activeAccessToken);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      try {
        const profile = await authService.getCurrentUser(activeAccessToken);
        queryClient.setQueryData(['auth', 'me'], profile);
      } catch (profileErr) {
        console.warn('Perfil será carregado em background:', profileErr);
      }
      const redirectUrl = authStorage.consumeRedirectUrl('/');
      toast.success('Autenticação concluída com sucesso!');
      return redirectUrl;
    },
    [queryClient],
  );

  // Compatibilidade com chamada passando apenas string
  const handleOAuthCallback = useCallback(
    async (codeOrToken: string): Promise<string> => {
      return handleAuthCallback({ token: codeOrToken });
    },
    [handleAuthCallback],
  );

  // Encerramento de sessão
  const logout = useCallback(() => {
    authStorage.removeToken();
    authStorage.removeRefreshToken();
    setToken(null);
    queryClient.setQueryData(['auth', 'me'], null);
    toast.info('Sessão encerrada.');
  }, [queryClient]);

  // Listener para evento customizado de sessão expirada emitido pelo axios interceptor
  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      queryClient.setQueryData(['auth', 'me'], null);
      toast.error('Sua sessão expirou. Por favor, faça login novamente.');
    };

    window.addEventListener('simcc:auth-expired', handleExpired);
    return () =>
      window.removeEventListener('simcc:auth-expired', handleExpired);
  }, [queryClient]);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading: isUserLoading,
        login,
        loginWithOAuth,
        handleAuthCallback,
        handleOAuthCallback,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
