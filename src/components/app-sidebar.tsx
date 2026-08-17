import * as React from 'react';
import {
  AArrowUp,
  Bug,
  Building2,
  Download,
  Home,
  Link2,
  List,
  PanelsTopLeft,
  SearchCheck,
  Sparkles,
  SquarePlay,
  UserPlus,
  Wrench,
} from 'lucide-react';

import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from './ui/sidebar';
import { UserContext } from '../context/context';
import { useContext } from 'react';
import { AccountSwitcher } from './navigation/user-list';
import { DotsThree } from 'phosphor-react';
import { useModal } from './hooks/use-modal-store';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { urlGeral, user, loggedIn } = useContext(UserContext);
  const { onOpen } = useModal();

  const data = {
    user: {
      name: user?.display_name || '',
      email: user?.email || '',
      avatar: user?.photo_url || '',
    },

    navMain: [
      {
        title: 'Ferramentas',
        url: '/',
        icon: Wrench,
        isActive: true,
        items: [
          {
            title: 'Dicionário',
            url: '/dicionario',
            icon: List,
          },
          {
            title: 'Listagens',
            url: '/listagens',
            icon: Download,
          },
          {
            title: 'Dados',
            url: '/paines-dados-externos',
            icon: Link2,
          },
        ],
      },
      {
        title: 'Páginas',
        url: '/',
        icon: PanelsTopLeft,
        isActive: true,
        items: [
          {
            title: 'Instituições',
            url: '/instituicao',
            icon: Building2,
          },
          {
            title: 'Vídeos',
            url: '/videos',
            icon: SquarePlay,
          },
        ],
      },
      {
        title: 'Outros',
        url: '/',
        icon: DotsThree,
        isActive: true,
        items: [
          {
            title: 'Selecionados',
            icon: UserPlus,
            onClick: () => onOpen('pesquisadores-selecionados'),
          },
          {
            title: 'Relatar problema',
            icon: Bug,
            onClick: () => onOpen('relatar-problema'),
          },
          {
            title: 'Índice pesquisador',
            url: '/indice-pesquisador',
            icon: AArrowUp,
          },
        ],
      },
    ],
    projects: [
      {
        name: 'Página Inicial',
        url: '/',
        icon: Home,
      },
      {
        name: 'Pesquisar',
        url: '/resultados',
        icon: SearchCheck,
      },
      {
        name: 'Pesquisar com IA',
        url: '/resultados-ia',
        icon: Sparkles,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" className="border-0" {...props}>
      <SidebarHeader>
        <AccountSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{loggedIn && <NavUser user={data.user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
