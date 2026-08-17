import { Link } from 'react-router-dom';
import { LogoConecteeWhite } from '../svg/LogoConecteeWhite';
import { LogoIaposWhite } from '../svg/LogoIaposWhite';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';

import { auth } from '../../lib/firebase';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function Password() {
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

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      toast('Erro', {
        description: 'Por favor, insira seu e-mail.',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast('E-mail enviado', {
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
      setEmail('');
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      toast('Erro', {
        description: 'Não foi possível enviar o e-mail. Tente novamente.',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
    } finally {
      setIsLoading(false);
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
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              Insira seu e-mail para receber um link de redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>
              <Button onClick={handlePasswordReset} className="w-full">
                Enviar Link de Redefinição
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
