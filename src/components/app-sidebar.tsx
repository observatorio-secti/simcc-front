import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AArrowUp,
  ArrowLeft,
  BarChart3,
  Building2,
  Database,
  Download,
  GraduationCap,
  Home,
  Landmark,
  Layers,
  LayoutDashboard,
  Link2,
  PanelsTopLeft,
  SearchCheck,
  Settings,
  ShieldCheck,
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
import { DotsThree } from 'phosphor-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const isConsole = location.pathname.startsWith('/console');

  // Navegação enxuta da área do Console (Administrativo)
  const consoleData = {
    projects: [
      {
        name: 'Métricas de Acesso',
        url: '/console',
        icon: BarChart3,
      },
      {
        name: 'Voltar ao Observatório',
        url: '/',
        icon: ArrowLeft,
      },
    ],
    navMain: [],
  };

  // Navegação da área pública (Observatório Simcc)
  const platformData = {
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
  };

  const data = isConsole ? consoleData : platformData;

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
