import * as React from "react"
import {
  AudioWaveform,
  BarChartBig,
  Blocks,
  BookOpen,
  Bot,
  Bug,
  Building2,
  ClipboardEdit,
  Command,
  Contact,
  Download,
  File,
  FlaskConical,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,

  Mail,
  Map,
  Pencil,

  PieChart,

  SlidersHorizontal,
  Sparkles,
  SquareTerminal,
  TextSearch,
  UserPlus,
  Users,
  Weight,
  Wrench,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar"
import { UserContext } from "../context/context"
import { useContext } from "react";
import { AccountSwitcher } from "./navigation/user-list"
import { DotsThree } from "phosphor-react"
import { useModal } from "./hooks/use-modal-store"
// This is sample data.

export function AppSidebarAdmin({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { urlGeral, user, version, permission } = useContext(UserContext)

  const hasBaremaAvaliacao = permission.some(
    (perm) => perm.permission === 'criar_barema_avaliacao'
  );

  const hasNotificacoes = permission.some(
    (perm) => perm.permission === 'enviar_notificacoes'
  );

  const has_visualizar_pesquisadores = permission.some(
    (perm) => perm.permission === 'visualizar_pesquisadores'
  );

  const has_visualizar_todos_departamentos = permission.some(
    (perm) => perm.permission === 'visualizar_todos_departamentos'
  );

  const has_visualizar_modulo_administrativo = permission.some(
    (perm) => perm.permission === 'visualizar_modulo_administrativo'
  );

  const has_visualizar_gerencia_modulo_administrativo = permission.some(
    (perm) => perm.permission === 'visualizar_gerencia_modulo_administrativo'
  );

  const has_visualizar_todos_programas = permission.some(
    (perm) => perm.permission === 'visualizar_todos_programas'
  );

  const has_visualizar_grupos_pesquisa = permission.some(
    (perm) => perm.permission === 'visualizar_grupos_pesquisa'
  );

  const has_visualizar_inct = permission.some(
    (perm) => perm.permission === 'visualizar_inct'
  );

  const has_editar_pesos_avaliacao = permission.some(
    (perm) => perm.permission === 'editar_pesos_avaliacao'
  );

  const has_visualizar_indicadores_instituicao = permission.some(
    (perm) => perm.permission === 'visualizar_indicadores_instituicao'
  );

  const has_atualizar_apache_hop = permission.some(
    (perm) => perm.permission === 'atualizar_apache_hop'
  );

  const {onOpen} = useModal()

  const data = {
    user: {
      name: user?.display_name || '',
      email: user?.email || '',
      avatar: user?.photo_url || '',
    },

    navMain: [
      {
        title: "Administrativo",
        url: "/",
        icon: DotsThree,
        isActive: true,
        items: [
          ...(version
            ? [
              {
                title: "Seção de pessoal",
                url: "/dashboard/secao-pessoal",
                icon: Contact
              },
            ]
            : []),

          {
            title: "Parâmetros",
            url: "/dashboard/parametros-pesquisa",
            icon: TextSearch
          },

          ...(has_editar_pesos_avaliacao
            ? [
              {
                title: "Pesos de avaliação",

                icon: Weight,
                url: "/dashboard/pesos-avaliacao",
              },
            ]
            : []),
        ],
      },

      {
        title: "Editar informações",
        url: "/",
        icon: Pencil,
        isActive: true,
        items: [
          ...(has_visualizar_pesquisadores
            ? [

              {
                title: "Pesquisadores",
                url: "/dashboard/pesquisadores",
                icon: Users
              },
            ]
            : []),

          ...(has_visualizar_todos_programas
            ? [

              {
                title: "Programas",
                url: "/dashboard/programas",
                icon: GraduationCap,
              },
            ]
            : []),

          ...(has_visualizar_todos_departamentos
            ? [

              {
                title: "Departamentos",
                url: "/dashboard/departamentos",
                icon: Building2,
              },
            ]
            : []),
         
        ],
      },
      {
        title: "Ferramentas",
        url: "/",
        icon: Wrench,
        isActive: true,
        items: [

          ...(hasBaremaAvaliacao
            ? [
              {
                title: "Baremas",
                icon: ClipboardEdit,
                url: "/dashboard/baremas",
              },
            ]
            : []),
          ...(hasNotificacoes
            ? [
              {
                title: "Enviar notificações",
                icon: Mail,
                url: "/dashboard/enviar-notificacoes",
              },
            ]
            : []),
        ],
      },

      {
        title: "Outros",
        url: "/",
        icon: DotsThree,
        isActive: true,
        items: [
             {
                      title: "Selecionados",
                      icon: UserPlus,
                      onClick: () => onOpen('pesquisadores-selecionados'), // Chama a função onOpen() ao clicar
                    },
                    {
                      title: "Relatar problema",
                      icon: Bug,
                      onClick: () => onOpen( 'relatar-problema'), // Chama a função onOpen() ao clicar
                    },
       
        ],
      },

    ],
    projects: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      ...(has_visualizar_gerencia_modulo_administrativo
        ? [
          {
            name: "Administrativo",
            url: "/dashboard/administrativo",
            icon: SlidersHorizontal
          },
        ]
        : []),

      ...(has_visualizar_indicadores_instituicao
        ? [
          {
            name: "Indicadores",
            icon: PieChart,
            url: "/dashboard/indicadores",
          },
        ]
        : []),

    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AccountSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
