import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useModal } from '../hooks/use-modal-store';
import { useAuth } from '../../hooks/use-auth';
import { GoogleIcon } from '../svg/GoogleIcon';
import { OrcidIcon } from '../svg/OrcidIcon';
import { Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AuthModal: React.FC = () => {
  const { isOpen, type, onClose } = useModal();
  const { login, register, loginWithOAuth } = useAuth();

  const isModalOpen = isOpen && type === 'auth-modal';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados do formulário de login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados do formulário de cadastro
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Limpa estados ao fechar ou trocar de aba
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null);
      setLoginIdentifier('');
      setLoginPassword('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      onClose();
    }
  };

  const handleTabChange = (val: string) => {
    setErrorMessage(null);
    setActiveTab(val as 'login' | 'register');
  };

  // Submissão do login tradicional
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Informe o usuário/e-mail e a senha.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login({
        username: loginIdentifier.trim(),
        password: loginPassword,
      });
      handleOpenChange(false);
    } catch (err: any) {
      console.error('Erro no login:', err);
      const detail =
        err?.response?.data?.detail ||
        (err?.message === 'Network Error'
          ? 'Erro de conexão com o servidor. Verifique se o backend está acessível.'
          : 'Não foi possível entrar. Verifique suas credenciais e tente novamente.');
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submissão de cadastro com autologin
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setIsRegistering(true);
    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      handleOpenChange(false);
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      const detail =
        err?.response?.data?.detail ||
        'Não foi possível criar a conta. Verifique os dados informados.';
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl">
        <DialogHeader className="text-center sm:text-center space-y-1.5 mb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
            Acesse sua conta
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            Conecte-se para explorar e gerenciar os dados da plataforma Simcc.
          </DialogDescription>
        </DialogHeader>

        {/* Botões de Login OAuth */}
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loginWithOAuth('google')}
            className="w-full flex items-center justify-center gap-2 h-10 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium"
          >
            <GoogleIcon className="w-4 h-4 flex-shrink-0" />
            <span>Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => loginWithOAuth('orcid')}
            className="w-full flex items-center justify-center gap-2 h-10 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium"
          >
            <OrcidIcon className="w-4 h-4 flex-shrink-0" />
            <span>ORCID</span>
          </Button>
        </div>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-400 font-medium tracking-wider">
              ou continue com
            </span>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="p-3 mb-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Abas: Entrar / Cadastrar */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md">
            <TabsTrigger
              value="login"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-950 dark:data-[state=active]:text-neutral-50 rounded-sm transition-all"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 dark:data-[state=active]:bg-neutral-950 dark:data-[state=active]:text-neutral-50 rounded-sm transition-all"
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>

          {/* Aba Login */}
          <TabsContent value="login" className="space-y-3 mt-3">
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="login-identifier"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Usuário ou E-mail
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="ex: admin ou usuario@simcc.org"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    disabled={isLoggingIn}
                    className="pl-9 h-9 text-xs"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="login-password"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoggingIn}
                    className="pl-9 h-9 text-xs"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-9 text-xs font-medium mt-1 bg-[#559FB8] hover:bg-[#024A60] text-white transition-colors"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar na plataforma'
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Aba Cadastrar */}
          <TabsContent value="register" className="space-y-3 mt-3">
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="reg-username"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Nome de Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="ex: maria.souza"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    disabled={isRegistering}
                    className="pl-9 h-9 text-xs"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="reg-email"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="ex: maria@universidade.br"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={isRegistering}
                    className="pl-9 h-9 text-xs"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="reg-password"
                    className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={isRegistering}
                      className="pl-9 h-9 text-xs"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="reg-confirm-password"
                    className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      id="reg-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      disabled={isRegistering}
                      className="pl-9 h-9 text-xs"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full h-9 text-xs font-medium mt-1 bg-[#559FB8] hover:bg-[#024A60] text-white transition-colors"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta e autenticando...
                  </>
                ) : (
                  'Criar conta e entrar'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
