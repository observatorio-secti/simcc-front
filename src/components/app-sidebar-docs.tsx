import * as React from 'react';
import {
  Blocks,
  SquarePlay,
  File,
  GraduationCap,
  InfoIcon,
  Lock,
  Palette,
  Settings,
} from 'lucide-react';

import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from './ui/sidebar';

export function AppSidebarDocs({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: 'API',
        url: '/',
        icon: Settings,
        isActive: true,
        items: [
          {
            title: 'Produções',
            url: '/api-producoes',
            icon: GraduationCap,
          },
          {
            title: 'Pesquisadores',
            url: '/api-pesquisadores',
            icon: Blocks,
          },
        ],
      },
    ],
    projects: [
      {
        name: 'Informações',
        url: '/informacoes',
        icon: InfoIcon,
      },
      {
        name: 'Termos de uso',
        url: '/termos-uso',
        icon: File,
      },
      {
        name: 'Politica de privacidade',
        url: '/politica-privacidade',
        icon: Lock,
      },
      {
        name: 'Dicionário de cores',
        url: '/dicionario-cores',
        icon: Palette,
      },
      {
        name: 'Vídeos de apresentação',
        url: '/videos',
        icon: SquarePlay,
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
