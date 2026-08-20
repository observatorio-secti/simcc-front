import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useContext } from 'react';

import { cn } from '../../lib';
import * as React from 'react';

import logo_5 from '../../assets/logo_cimatec.svg';

import { NavigationMenuLink } from '../../components/ui/navigation-menu';

import {
  CircleHelp,
  Grip,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { UserContext } from '../../context/context';
import { Button } from '../ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

import { useTheme } from 'next-themes';

import { LogoConecteeWhite } from '../svg/LogoConecteeWhite';
import { LogoConectee } from '../svg/LogoConectee';
import { Input } from '../ui/input';
import { SymbolEE } from '../svg/SymbolEE';
import { SymbolVPWhite } from '../svg/SymbolVPWhite';
import { SymbolVP } from '../svg/SymbolVp';
import { SymbolEEWhite } from '../svg/SymbolEEWhite';
import { useModal } from '../hooks/use-modal-store';
import { LogoIapos } from '../svg/LogoIapos';
import { LogoIaposWhite } from '../svg/LogoIaposWhite';
import { Funnel, MagnifyingGlass, UserCircleGear } from 'phosphor-react';
import { Badge } from '../ui/badge';
import { ModeToggle } from '../mode-toggle';
import { Separator } from '../ui/separator';

export function Header() {
  const {
    loggedIn,
    role,
    setItensSelecionados,
    searchType,
    maria,
    user,
    permission,
  } = useContext(UserContext);

  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
    setItensSelecionados([]);
  };

  const location = useLocation();
  const isVisible =
    location.pathname != '/' &&
    location.pathname != '/resultados' &&
    location.pathname != '/marIA' &&
    location.pathname != '/pos-graduacao';

  const { onOpen } = useModal();

  return (
    <div className={'top-0 w-full'}>
      <header
        className={`h-[40px] px-4 md:mb-2 flex justify-between bg-neutral-50 dark:bg-neutral-900 md:bg-neutral-100 md:dark:bg-black  gap-2 items-center w-full relative`}
      >
        <div className="flex gap-2">
          <div className="flex w-full md:gap-3 gap-1 items-center md:h-full md:justify-center">
            {false ? (
              <Link
                to={'/'}
                className="h-[18px]  "
                onClick={() => handleClick()}
              >
                {theme == 'dark' ? <LogoConecteeWhite /> : <LogoConectee />}
              </Link>
            ) : (
              <Link
                to={'/'}
                className="h-[18px]  "
                onClick={() => handleClick()}
              >
                {theme == 'dark' ? <LogoIaposWhite /> : <LogoIapos />}
              </Link>
            )}
            <Separator
              orientation="vertical"
              className="mx-2 md:mx-0 h-6 bg-slate-300"
            />
            <div className="min-w-max">
              <Link
                to={'https://www.ba.gov.br/secti/'}
                target="_blank"
                className="whitespace-nowrap "
              >
                <img
                  src={logo_5}
                  alt=""
                  className="whitespace-nowrap flex flex-1 h-[50px]"
                />
              </Link>
            </div>

            <Separator
              orientation="vertical"
              className="mx-2 md:mx-0 h-6 bg-slate-300"
            />

            <div className="min-w-max">
              <Link
                to={'https://observatoriocti.secti.ba.gov.br/'}
                target="_blank"
                className="whitespace-nowrap text-sm font-medium hover:underline"
              >
                <Button variant="outline" size="sm" className="h-8 px-2 gap-2">
                  <img
                    src="/LOGO-OBS.png"
                    alt="Logo Observatório"
                    className="h-4 w-4 object-contain"
                  />
                  Observatório
                </Button>
              </Link>
            </div>

            <span className="absolute right-2 md:relative md:ml-3 md:mb-[1px]">
              {role != '' && role != 'Visitante' && (
                <Badge className="  " variant={'outline'}>
                  {role}
                </Badge>
              )}
            </span>
          </div>
        </div>

        <div className="w-full flex items-center justify-end md:justify-end gap-1">
          {isVisible && (
            <div
              onClick={() => onOpen('search')}
              className="hidden md:flex h-8 border border-neutral-200 dark:border-neutral-800 px-1 bg-white dark:bg-neutral-950 rounded-md items-center"
            >
              <MagnifyingGlass size={16} className="w-8" />
              <Input
                className="border-0 h-full flex flex-1 dark:bg-transparent"
                placeholder="Fazer pesquisa..."
              />
              <p className="bg-neutral-100 rounded-md text-[10px] mr-1  dark:bg-neutral-800 h-6 flex items-center justify-center px-2">
                Ctrl + Q
              </p>
              <Button
                variant="outline"
                className={` h-6 w-6 ${searchType == 'article' && 'bg-blue-500 dark:bg-blue-500'} ${searchType == 'abstract' && 'bg-yellow-500 dark:bg-yellow-500'} ${maria && 'bg-eng-blue   dark:bg-eng-blue  '} ${searchType == 'speaker' && 'bg-orange-500 dark:bg-orange-500'} ${searchType == 'book' && 'bg-pink-500 dark:bg-pink-500'} ${searchType == 'patent' && 'bg-cyan-500 dark:bg-cyan-500'} ${searchType == 'name' && 'bg-red-500 dark:bg-red-500'} ${searchType == 'area' && 'bg-green-500 dark:bg-green-500'} ${searchType == '' && 'bg-blue-700 dark:bg-blue-700'} text-white border-0 `}
                size={'icon'}
              >
                <Funnel size={10} className="" />
              </Button>
            </div>
          )}

          <div className="hidden md:flex gap-3 items-center">
            {!loggedIn && (
              <Link to={'/signIn'}>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <LogIn className="h-4 w-4" />
                  Fazer login
                </Button>
              </Link>
            )}
            {!loggedIn && (
              <Link to={'/signUp'}>
                <Button size="sm" className="h-8 px-2">
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </Button>
              </Link>
            )}
          </div>

          {!loggedIn && (
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <UserCircleGear className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-5">
                  <DropdownMenuItem>
                    <Link className="flex gap-2 items-center" to={'/signIn'}>
                      <UserPlus className="h-4 w-4" />
                      <p>Criar conta</p>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link className="flex gap-2 items-center" to={'/signUp'}>
                      <LogIn className="h-4 w-4" />
                      <p>Fazer login</p>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="hidden md:flex md:gap-2">
            <div>
              {loggedIn && permission.length > 0 && (
                <Link to={'/dashboard'}>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Console
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => onOpen('user-profile-initial')}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <CircleHelp className="h-4 w-4" />
                <span className="sr-only">Dúvidas</span>
              </Button>

              <ModeToggle />
              {false && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Grip className="h-4 w-4" />
                      <span className="sr-only">Menu de ações rápidas</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="grid gap-3 grid-cols-3">
                      <Link
                        to={'https://vitrinepatrimonio.eng.ufmg.br/'}
                        target="_blank"
                      >
                        <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
                          <div className="h-8 mb-4">
                            {theme == 'dark' ? <SymbolVPWhite /> : <SymbolVP />}
                          </div>
                          <div className="flex  text-xs font-medium max-w-[70px] truncate  text-center">
                            {' '}
                            Vitrine Patrimônio
                          </div>
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        to={'https://conectee.eng.ufmg.br/'}
                        target="_blank"
                      >
                        <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
                          <div className="h-8 mb-4">
                            {theme == 'dark' ? <SymbolEEWhite /> : <SymbolEE />}
                          </div>
                          <div className="flex  text-xs font-medium max-w-[70px]  truncate text-center">
                            {' '}
                            Conectee
                          </div>
                        </DropdownMenuItem>
                      </Link>
                      <Link to={'/'}>
                        <DropdownMenuItem className="flex flex-col justify-center px-2 py-4 cursor-pointer">
                          <div className="h-8 mb-4"></div>
                          <div className="flex  text-xs font-medium max-w-[70px]  truncate text-center">
                            {' '}
                            CEGRADEE
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
