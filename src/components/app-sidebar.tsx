import * as React from 'react';
import {
  AArrowUp,
  BarChart3,
  Building2,
  Download,
  GraduationCap,
  Home,
  Landmark,
  Link2,
  PanelsTopLeft,
  SearchCheck,
  Sparkles,
  SquarePlay,
  Users,
  Wrench,
} from 'lucide-react';

import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from './ui/sidebar';
import { UserContext } from '../context/context';
import { useContext } from 'react';
import { DotsThree } from 'phosphor-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { urlGeral } = useContext(UserContext);

  const data = {

    navMain: [
      {
        title: 'Ferramentas',
        url: '/',
        icon: Wrench,
        isActive: true,
        items: [
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
            title: 'Grupos de Pesquisa',
            url: '/grupos-pesquisa',
            icon: Users,
          },
          {
            title: 'Indicadores',
            url: '/indicadores',
            icon: BarChart3,
          },
          {
            title: 'Instituições',
            url: '/instituicao',
            icon: Building2,
          },
          {
            title: 'Institutos de CT&I',
            url: '/incites',
            icon: Landmark,
          },
          {
            title: 'Pós-Graduação',
            url: '/pos-graduacao',
            icon: GraduationCap,
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
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
