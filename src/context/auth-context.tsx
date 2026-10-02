import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authStorage } from '../lib/auth-storage';
import { authService } from '../services/auth';
import {
  LoginCredentials,
  OAuthProvider,
  UserPublic,
  UserSchema,
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

  // Login tradicional
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const data = await authService.login(credentials);
      authStorage.setToken(data.access_token);
      setToken(data.access_token);
      try {
        await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        await refetch();
      } catch (profileErr) {
        console.warn('Aviso: Perfil será carregado em background:', profileErr);
      }
      toast.success('Login realizado com sucesso! Bem-vindo(a).');
    },
    [queryClient, refetch],
  );

  // Cadastro com autologin (conforme decisão Q1)
  const register = useCallback(
    async (data: UserSchema) => {
      await authService.register(data);
      // Autologin imediato após o cadastro
      const tokenData = await authService.login({
        username: data.username,
        password: data.password,
      });
      authStorage.setToken(tokenData.access_token);
      setToken(tokenData.access_token);
      try {
        await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        await refetch();
      } catch (profileErr) {
        console.warn('Aviso: Perfil será carregado em background:', profileErr);
      }
      toast.success('Conta criada e autenticada com sucesso!');
    },
    [queryClient, refetch],
  );

  // Inicia fluxo OAuth salvando a rota atual (conforme decisão Q2)
  const loginWithOAuth = useCallback((provider: OAuthProvider) => {
    authStorage.saveRedirectUrl(
      window.location.pathname + window.location.search,
    );
    window.location.href = authService.getOAuthLoginUrl(provider);
  }, []);

  // Processa token recebido via callback OAuth
  const handleOAuthCallback = useCallback(
    async (newToken: string): Promise<string> => {
      authStorage.setToken(newToken);
      setToken(newToken);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await refetch();
      const redirectUrl = authStorage.consumeRedirectUrl('/');
      toast.success('Autenticação concluída com sucesso!');
      return redirectUrl;
    },
    [queryClient, refetch],
  );

  // Encerramento de sessão
  const logout = useCallback(() => {
    authStorage.removeToken();
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
        register,
        loginWithOAuth,
        handleOAuthCallback,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
