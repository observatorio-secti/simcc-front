import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useContext } from 'react';

import { cn } from '../../lib';
import * as React from 'react';

import logo_5 from '../../assets/logo_cimatec.svg';

import { NavigationMenuLink } from '../../components/ui/navigation-menu';

import { Grip, LogIn, LogOut } from 'lucide-react';
import { UserContext } from '../../context/context';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../hooks/use-auth';
import { authStorage } from '../../lib/auth-storage';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

import { useTheme } from 'next-themes';

import { Input } from '../ui/input';
import { SymbolEE } from '../svg/SymbolEE';
import { SymbolVPWhite } from '../svg/SymbolVPWhite';
import { SymbolVP } from '../svg/SymbolVp';
import { SymbolEEWhite } from '../svg/SymbolEEWhite';
import { useModal } from '../hooks/use-modal-store';
import { LogoIapos } from '../svg/LogoIapos';
import { LogoIaposWhite } from '../svg/LogoIaposWhite';
import { LogoObservatorio } from '../svg/LogoObservatorio';
import { Funnel, MagnifyingGlass } from 'phosphor-react';
import { Badge } from '../ui/badge';
import { ModeToggle } from '../mode-toggle';
import { Separator } from '../ui/separator';
import { PROFILE_RESULTS_PATH } from '../../lib/search-types';

export function Header() {
  const { setItensSelecionados, searchType } = useContext(UserContext);

  const { user: authUser, isAuthenticated, isAdmin, logout } = useAuth();

  const { theme } = useTheme();

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
    setItensSelecionados([]);
  };

  const location = useLocation();
  const isMaria =
    location.pathname === '/resultados-ia' || location.pathname === '/marIA';
  const isVisible =
    location.pathname != '/' &&
    location.pathname != '/resultados' &&
    location.pathname != PROFILE_RESULTS_PATH &&
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
            <Link to={'/'} className="h-[18px]" onClick={() => handleClick()}>
              {theme == 'dark' ? <LogoIaposWhite /> : <LogoIapos />}
            </Link>
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
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 px-2 gap-2"
              >
                <a
                  href="https://observatoriocti.secti.ba.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap text-sm font-medium"
                >
                  <LogoObservatorio className="h-4 w-4" />
                  Observatório
                </a>
              </Button>
            </div>
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
                className={` h-6 w-6 ${searchType == 'article' && 'bg-blue-500 dark:bg-blue-500'} ${searchType == 'abstract' && 'bg-yellow-500 dark:bg-yellow-500'} ${isMaria && 'bg-eng-blue   dark:bg-eng-blue  '} ${searchType == 'speaker' && 'bg-orange-500 dark:bg-orange-500'} ${searchType == 'book' && 'bg-pink-500 dark:bg-pink-500'} ${searchType == 'patent' && 'bg-cyan-500 dark:bg-cyan-500'} ${searchType == 'name' && 'bg-red-500 dark:bg-red-500'} ${searchType == 'area' && 'bg-green-500 dark:bg-green-500'} ${searchType == '' && 'bg-blue-700 dark:bg-blue-700'} text-white border-0 `}
                size={'icon'}
              >
                <Funnel size={10} className="" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ModeToggle />

            {isAuthenticated && authUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 px-2 gap-2 rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
                  >
                    <Avatar className="h-5 w-5 text-[10px] bg-[#559FB8] text-white flex items-center justify-center font-bold">
                      <AvatarFallback className="bg-[#559FB8] text-white text-[10px] font-bold">
                        {authUser.username?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block max-w-[90px] truncate text-xs">
                      {authUser.username}
                    </span>
                    {isAdmin && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0 h-4 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-semibold"
                      >
                        ADMIN
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="px-2 py-1.5 space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {authUser.username}
                    </p>
                    {authUser.email && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {authUser.email}
                      </p>
                    )}
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {isAdmin ? 'Administrador' : 'Usuário'}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-xs text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-2 focus:bg-red-50 dark:focus:bg-red-950/30"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sair da conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  authStorage.saveRedirectUrl(
                    location.pathname + location.search,
                  );
                  onOpen('auth-modal');
                }}
                className="h-8 px-2.5 text-xs font-medium gap-1.5 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
              >
                <LogIn className="h-3.5 w-3.5 text-[#559FB8]" />
                <span className="hidden sm:inline-block">Entrar</span>
              </Button>
            )}
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
                    <Link to={'https://conectee.eng.ufmg.br/'} target="_blank">
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
