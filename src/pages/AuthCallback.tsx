import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LogoIapos } from '../components/svg/LogoIapos';
import { LogoIaposWhite } from '../components/svg/LogoIaposWhite';
import { useTheme } from 'next-themes';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const { theme } = useTheme();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(
        decodeURIComponent(error) ||
          'Houve um problema durante o processo de autenticação externa.',
      );
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage(
        'Nenhum token de autenticação foi identificado no retorno do provedor.',
      );
      return;
    }

    let isMounted = true;

    const processLogin = async () => {
      try {
        const redirectUrl = await handleOAuthCallback(token);
        if (isMounted) {
          setStatus('success');
          // Pequena transição para o usuário perceber o sucesso
          setTimeout(() => {
            navigate(redirectUrl, { replace: true });
          }, 600);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(
            err?.response?.data?.detail ||
              err?.message ||
              'Não foi possível validar o token de acesso recebido.',
          );
        }
      }
    };

    processLogin();

    return () => {
      isMounted = false;
    };
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4 bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100">
      <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg flex flex-col items-center text-center space-y-6">
        <div className="h-8">
          {theme === 'dark' ? <LogoIaposWhite /> : <LogoIapos />}
        </div>

        {status === 'loading' && (
          <div className="space-y-4 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-[#559FB8] animate-spin" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Autenticando...</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Validando suas credenciais e preparando seu ambiente.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Login realizado!</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Redirecionando você de volta à plataforma...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Falha na autenticação</h2>
              <p className="text-xs text-red-600 dark:text-red-400 max-w-xs">
                {errorMessage}
              </p>
            </div>
            <Button
              onClick={() => navigate('/', { replace: true })}
              variant="outline"
              className="mt-2 text-xs h-9"
            >
              Voltar para a página inicial
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
