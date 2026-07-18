import * as React from "react"
import {
    AArrowUp,
    AudioWaveform,
    BarChartBig,
    Blocks,
    BookOpen,
    Bot,
    Braces,
    Bug,
    Building2,
    SquarePlay,
    CalendarSearch,
    Command,
    Download,
    File,
    Frame,
    GalleryVerticalEnd,
    GraduationCap,
    Home,
    Info,
    InfoIcon,
    Link2,
    List,
    Lock,
    Map,
    Palette,
    PieChart,
    SearchCheck,
    Settings,
    Settings2,
    Sparkles,
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
import { useContext } from "react";
import { AccountSwitcher } from "./navigation/user-list"
import { DotsThree } from "phosphor-react"
import { useModal } from "./hooks/use-modal-store"
// This is sample data.

export function AppSidebarDocs({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                title: "API",
                url: "/",
                icon: Settings,
                isActive: true,
                items: [

                    {
                        title: "Produções",
                        url: "/api-producoes",
                        icon: GraduationCap
                    },
                    {
                        title: "Pesquisadores",
                        url: "/api-pesquisadores",
                        icon: Blocks
                    },
                ],
            },




        ],
        projects: [
            {
                name: "Informações",
                url: "/informacoes",
                icon: InfoIcon,
            },
            {
                name: "Termos de uso",
                url: "/termos-uso",
                icon: File,
            },
            {
                name: "Politica de privacidade",
                url: "/politica-privacidade",
                icon: Lock,
            },
            {
                name: "Dicionário de cores",
                url: "/dicionario-cores",
                icon: Palette,
            },
            {
                name: "Vídeos de apresentação",
                url: "/videos",
                icon: SquarePlay,
            }

        ],
    }

    return (
        <Sidebar collapsible='icon' className="border-0" {...props}>
            <SidebarHeader>
                <AccountSwitcher />
            </SidebarHeader>
            <SidebarContent >
                <NavProjects projects={data.projects} />
                <NavMain items={data.navMain} />

            </SidebarContent>
            <SidebarFooter>
                {loggedIn && (
                    <NavUser user={data.user} />
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
