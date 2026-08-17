import { Link } from 'react-router-dom';
import { LogoConecteeWhite } from '../svg/LogoConecteeWhite';
import { LogoIaposWhite } from '../svg/LogoIaposWhite';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { confirmPasswordReset } from 'firebase/auth';

import { auth } from '../../lib/firebase';
import { toast } from 'sonner';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function UpdatePassword() {
  const { setLoggedIn, urlGeralAdm } = useContext(UserContext);

  //frases

  const quotesWithAuthors = [
    {
      quote:
        'A gente continua apaixonado pela Escola de Engenharia e pelas pessoas que flutuam nela',
      author:
        'Newton Urias Pinto, técnico em metalurgia aposentado. Na escola desde os 11 anos de idade.',
    },
    {
      quote:
        'Às vezes eles me perguntaravam onde que eu tinha estudado, simplesmente o nome da Escola quase que já bastava, né? Aquilo ali já falava tudo por você.',
      author:
        'Maria da Fátima Solis Ribeiro. Engenheira Civil formada pela Escola em 1986.',
    },
    {
      quote:
        'É difícil definir o que eu vou levar. Acho que o que pode resumir é minha formação. Enquanto pessoa e enquanto profissional.',
      author:
        'Paloma de Assis Ribeiro Batista, Aluna do 4º periodo de Engenharia de Produção e mebro da PJ Consultoria & Assesoria, empresa junior do seu curso. Na escola desde 2010.',
    },
    {
      quote:
        'Aqui a gente procura participar dos eventos, das coisas mesmo, por causa desse encontro com os colegas',
      author:
        'Iracema Alves Torres. Funcionária Técnico-administrativo do Departamento de Engenharia de Estruturas. Na escola desde 1991.',
    },
    {
      quote: 'Assim que eu cheguei na Escola foi tipo amor à primeira vista',
      author:
        'Fátima Aparecida de Carvalho. Funcionária Técnico-administrativo do Departamento de Engenharia de Estruturas. Na escola desde 1983.',
    },
  ];

  // Estado para a frase e autor atuais
  const [currentQuote, setCurrentQuote] = useState({ quote: '', author: '' });

  // Função para selecionar uma frase aleatória
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotesWithAuthors.length);
    return quotesWithAuthors[randomIndex];
  };

  // Efeito para definir uma nova frase quando o componente é montado
  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, []);

  //

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token'); // Obtém o token de redefinição de senha

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage('Token de redefinição inválido ou ausente.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    try {
      await confirmPasswordReset(auth, token, password);
      setSuccessMessage('Senha atualizada com sucesso!');

      toast('Senha atualizada', {
        description: 'Senha atualizada com sucesso!',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });

      setErrorMessage(null);

      // Redireciona para a página de login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(
        error.message || 'Ocorreu um erro ao tentar atualizar a senha.',
      );

      toast('Erro', {
        description: 'Ocorreu um erro ao tentar atualizar a senha.',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
    }
  };

  return (
    <div className="w-full h-screen flex">
      <div className="w-1/2 h-full p-16 md:flex justify-between flex-col hidden bg-cover bg-center bg-no-repeat bg-[#719CB8]">
        {false ? (
          <Link to={'/'} className="w-fit">
            <div className="h-[28px]">
              <LogoConecteeWhite />
            </div>
          </Link>
        ) : (
          <Link to={'/'} className="w-fit">
            <div className="h-[28px]">
              <LogoIaposWhite />
            </div>
          </Link>
        )}
        <div>
          {false && (
            <div>
              <p className="font-medium text-white max-w-[500px]">
                "{currentQuote.quote}"
              </p>
              <p className="text-white mt-2 text-sm">{currentQuote.author}</p>
            </div>
          )}
        </div>
      </div>

      <div className="md:w-1/2 w-full h-full flex md:px-16 items-center justify-center flex-col">
        <div className="max-w-[400px] w-full">
          <CardHeader>
            <CardTitle>Atualizar Senha</CardTitle>
            <CardDescription>
              Insira seu e-mail para receber um link de redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Nova Senha</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Confirmar Senha</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Enviar Link de Redefinição
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
