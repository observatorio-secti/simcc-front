import * as React from "react"
import {
    AArrowUp,
    AudioWaveform,
    BarChartBig,
    Beaker,
    Blocks,
    BookOpen,
    Bot,
    Boxes,
    Bug,
    Building2,
    CalendarSearch,
    Command,
    Download,
    Frame,
    GalleryVerticalEnd,
    GraduationCap,
    Home,
    Info,
    Link2,
    List,
    Map,
    PanelsTopLeft,
    PieChart,
    SearchCheck,
    Settings2,
    Sparkles,
    SquarePlay,
    SquareTerminal,
    UserPlus,
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
import { useContext } from "react"
import { DotsThree } from "phosphor-react"
import { useModal } from "./hooks/use-modal-store"

import logo_observatorio from "../assets/logo_observatorio.png";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { urlGeral, user, version, loggedIn } = useContext(UserContext)
    const { onOpen } = useModal()

    const data = {
        user: {
            name: user?.display_name || '',
            email: user?.email || '',
            avatar: user?.photo_url || '',
        },

        navMain: [
            {
                title: "Ferramentas",
                url: "/",
                icon: Wrench,
                isActive: true,
                items: [
                    {
                        title: "Dicionário",
                        url: "/dicionario",
                        icon: List
                    },
                    {
                        title: "Listagens",
                        url: "/listagens",
                        icon: Download
                    },
                    {
                        title: "Dados",
                        url: "/paines-dados-externos",
                        icon: Link2
                    },
                ],
            },
            {
                title: "Páginas",
                url: "/",
                icon: PanelsTopLeft,
                isActive: true,
                items: [
                    {
                        title: "Vídeos",
                        url: "/videos",
                        icon: SquarePlay,
                    },
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
                        onClick: () => onOpen('pesquisadores-selecionados'),
                    },
                    {
                        title: "Relatar problema",
                        icon: Bug,
                        onClick: () => onOpen('relatar-problema'),
                    },
                    {
                        title: "Índice pesquisador",
                        url: "/indice-pesquisador",
                        icon: AArrowUp
                    },
                ],
            },
        ],
        projects: [
            {
                name: "Página Inicial",
                url: "/",
                icon: Home,
            },
            {
                name: "Pesquisar",
                url: "/resultados",
                icon: SearchCheck,
            },
            {
                name: "Pesquisar com IA",
                url: "/resultados-ia",
                icon: Sparkles,
            },
        ],
    }

    return (
        // Aplicando o fundo branco, borda leve e texto base azul escuro no container principal
        <Sidebar collapsible='icon' className="border-r border-gray-200 bg-white text-blue-900" {...props}>
            <SidebarHeader>
                <div className="flex items-center justify-center py-6 w-full">
                    <img 
                        src={logo_observatorio} 
                        alt="Logo Observatório" 
                        className="h-48 w-auto object-contain drop-shadow-sm" 
                    />
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-white">
                <NavProjects projects={data.projects} />
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter className="bg-white border-t border-gray-100">
                {loggedIn && <NavUser user={data.user} />}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}