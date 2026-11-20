import img_2 from '../../assets/logo_email_2.png';
import img_1 from '../../assets/logo_email_4.png';
import { LogoIaposWhite } from '../svg/LogoIaposWhite';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { Copyright, File, Info } from 'lucide-react';
import { Badge } from '../ui/badge';

export function FooterHome() {
  return (
    <div className="w-full">
      <div
        className="
                    flex flex-col w-full gap-8 mb-8

                    sm:grid
                    
                    lg:grid-cols-3
                "
      >
        <div className="flex items-center justify-center bg-eng-blue min-h-[50vh] rounded-lg">
          <div className="w-full max-w-[200px]">{<LogoIaposWhite />}</div>
        </div>

        <div className="rounded-lg bg-neutral-200 flex flex-col justify-between min-h-[50vh] gap-8 p-4 md:p-8 dark:bg-neutral-800 lg:col-span-2">
          <div>
            <Badge
              className="flex items-center gap-2 w-fit border-neutral-300"
              variant={'outline'}
            >
              <Copyright size={12} /> Todos os direitos reservados
            </Badge>
          </div>

          {false ? (
            <div className="w-full relative flex justify-between">
              <div
                className="
                                    flex absolute bottom-14 left-4 gap-6

                                    sm:absolute sm:bottom-0 sm:right-2 sm:left-auto
                                "
              >
                <img src={img_2} className="h-8" alt="Logo" />
                <img src={img_1} className="h-8" alt="Logo" />
              </div>

              <div className="flex gap-3">
                <Link to={'/informacoes'}>
                  {' '}
                  <Button variant={'link'}>
                    <Info size={16} />
                    Informações
                  </Button>
                </Link>
                <Link to={'/termos-uso'}>
                  {' '}
                  <Button variant={'link'}>
                    <File size={16} />
                    Termos de Uso
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <div className="flex gap-6"></div>

              <div className="flex gap-3">
                <Link to={'/informacoes'}>
                  {' '}
                  <Button variant={'link'}>
                    <Info size={16} />
                    Informações
                  </Button>
                </Link>
                <Link to={'/termos-uso'}>
                  {' '}
                  <Button variant={'link'}>
                    <File size={16} />
                    Termos de Uso
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-neutral-200 flex flex-col justify-between mb-8 gap-8 p-4 md:p-8 dark:bg-neutral-800 lg:col-span-2"></div>
    </div>
  );
}
