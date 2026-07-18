import { Toaster } from "sonner";
import { Header } from "../components/header/Header";
import { NavigationSidebar } from "../components/navigation/navigation-sidebar";

import { TooltipProvider } from "../components/ui/tooltip"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import { cn } from "../lib"
import bg_popup from '../assets/bg_welcome.png';

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/context";
import { AccountSwitcher } from "../components/navigation/user-list";
import { BarChartBig, Blocks, BookOpen, Bug, Building2, Check, Cookie, Download, GraduationCap, Home, Info, InfoIcon, LayoutDashboard, Link2, List, LogIn, PanelLeftDashed, SearchCheck, Sparkles, UserPlus, X } from "lucide-react";
import logo_4 from '../assets/logo_4.png';
import logo_4_white from '../assets/logo_4_white.png';

import logo_5 from '../assets/logo_cimatec.svg';
import logo_5_white from '../assets/logo_cimatec_white.png';


import { Footer } from "../components/footer/footer";
import { useModal } from "../components/hooks/use-modal-store";
import { Button } from "../components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useModalSecundary } from "../components/hooks/use-modal-store-secundary";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { Separator } from "../components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { ModeToggle } from "../components/mode-toggle";
import { LogoConecteeWhite } from "../components/svg/LogoConecteeWhite";
import { LogoConectee } from "../components/svg/LogoConectee";
import { LogoIapos } from "../components/svg/LogoIapos";
import { LogoIaposWhite } from "../components/svg/LogoIaposWhite";
import { Badge } from "../components/ui/badge";
import { useTheme } from "next-themes";
import { UserProfileInitialModal } from "../components/modals/user-profile-initial";

interface MailProps {

  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  children: React.ReactNode
}
export default function SearchLayout({

  defaultLayout = [265, 440, 655],
  defaultCollapsed = true,
  navCollapsedSize,
  children
}: MailProps) {

  const { isCollapsed, loggedIn, setIsCollapsed, version, permission, pesquisadoresSelecionados, setItensSelecionados } = useContext(UserContext)


  const { onOpen, isOpen, type: typeModal } = useModal()
  const { onOpen: onOpenSecundary } = useModalSecundary()

  useEffect(() => {
    // Função que será chamada quando o evento de teclado ocorrer
    const handleKeyDown = (event: any) => {
      // Verifica se Ctrl + Y foi pressionado
      if (event.ctrlKey && event.key === 'q') {
        onOpen('search')
      }
    };

    // Adiciona o listener de evento quando o componente é montado
    window.addEventListener('keydown', handleKeyDown);

    // Remove o listener de evento quando o componente é desmontado
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  ///popup
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    // Verifica no localStorage se o modal já foi exibido
    const hasVisited = localStorage.getItem('hasVisited');

    if (!hasVisited && (!isOpen)) {
      // Se não foi exibido, abre o modal
      setIsModalOpen(true);

    }
  }, []);


  const handleClose = () => {
    setIsModalOpen(false);
    // Marca no localStorage que o modal foi exibido
    localStorage.setItem('hasVisited', 'true');
  };




  ///BUG
  const location = useLocation();

  useEffect(() => {
    if (location.pathname == '/relatar-problema') {
      onOpen('relatar-problema')
    } else if (location.pathname == '/pesquisadores-selecionados') {
      onOpen('pesquisadores-selecionados')
    }
  }, [location]);

  const links = [
    {
      title: "Página inicial",
      label: "",
      icon: Home,
      link: "/",
    },
    {
      title: "Pesquisar",
      label: "",
      icon: SearchCheck,
      link: "/resultados",
    },
    {
      title: "Pesquisar com IA",
      label: "",
      icon: Sparkles,
      link: "/resultados-ia",
    },
    {
      title: "Indicadores",
      label: "",
      icon: BarChartBig,
      link: "/indicadores",
    },
    {
      title: "Dicionário",
      label: "",
      icon: List,
      link: "/dicionario",
    },
    {
      title: "Listagens",
      label: "",
      icon: Download,
      link: "/listagens",
    },
    {
      title: "Produções recentes",
      label: "",
      icon: BookOpen,
      link: "/producoes-recentes",
    },
  ]

  const links2 = [

    ...(version
      ? [
        {
          title: "Departamentos",
          label: "",
          icon: Building2,
          link: "/departamentos",
        },
      ]
      : []),

    {
      title: "Pós-graduação",
      label: "",
      icon: GraduationCap,
      link: "/pos-graduacao",
    },

    {
      title: "Grupos de pesquisa",
      label: "",
      icon: Blocks,
      link: "/grupos-pesquisa",
    },
    {
      title: "Painéis de dados externos",
      label: "",
      icon: Link2,
      link: "/paines-dados-externos",
    },
  ]

  const hasBaremaAvaliacao = permission.some(
    (perm) => perm.permission === 'criar_barema_avaliacao'
  );


  const links3 = [
    ...(hasBaremaAvaliacao
      ? [
        {
          title: "Pesquisadores selecionados",
          label: `${pesquisadoresSelecionados.length == 0 ? ('') : (pesquisadoresSelecionados.length)}`,
          icon: UserPlus,
          link: "/pesquisadores-selecionados",
        },
      ]
      : []),

    {
      title: "Relatar problema",
      label: "",
      icon: Bug,
      link: "/relatar-problema",
    },
    {
      title: "Informações",
      label: "",
      icon: Info,
      link: "/informacoes",
    },
  ]

  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/')
    setItensSelecionados([])
  }

  const { theme, setTheme } = useTheme()

  const router = useLocation();
  const pathSegments = router.pathname.split('/').filter(Boolean); // Divide a URL em segmentos e remove a primeira parte vazia

  // Verifica se veio da página de instituição através dos parâmetros de query
  const queryParams = new URLSearchParams(router.search);
  const fromInstitution = queryParams.get('from_institution') === 'true';
  const institutionId = queryParams.get('institution_id');
  const institutionName = queryParams.get('institution_name');

  // Se a URL estiver vazia, mostramos "Página Inicial"
  let breadcrumbItems = pathSegments.length === 0 ? ['Página inicial'] : ['Página inicial', ...pathSegments];

  // Se veio da página de instituição e está em pos-graduacao ou grupos-pesquisa, insere "instituicao" no breadcrumb
  if (fromInstitution && (router.pathname === '/pos-graduacao' || router.pathname === '/grupos-pesquisa')) {
    breadcrumbItems = ['Página inicial', 'instituicao', pathSegments[0]];
  }

  return (
    <div>


      <SidebarProvider className="    " defaultOpen={true} open={isCollapsed} onOpenChange={() => setIsCollapsed((prev) => !prev)} >

        <AppSidebar />

        <SidebarInset className=" ">
          <main className="h-full flex flex-col flex-1 ">


            <div className="flex p-8 pt-8 pb-2 h-[68px] items-center justify-between top-0 sticky z-[3] supports-[backdrop-filter]:bg-neutral-50/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 backdrop-blur ">
              <div className="flex  pb-0 items-center gap-2">
                <SidebarTrigger className="" />
                <Separator orientation="vertical" className="mr-2 h-4" />


                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbItems.map((segment, index) => {
                      const isLastItem = index === breadcrumbItems.length - 1;

                      // Construir o caminho parcial para cada segmento
                      let href = index === 0
                        ? '/' // O primeiro item sempre vai para a página inicial
                        : `/${pathSegments.slice(0, index + 1).join('/')}`;

                      // Se for o segmento "instituicao", criar link para a página de instituição
                      if (segment === 'instituicao' && fromInstitution && institutionId) {
                        href = `/instituicao?institution_id=${institutionId}`;
                      }

                      return (
                        <React.Fragment key={index}>
                          <BreadcrumbItem className="hidden md:block capitalize">
                            {/* Se for o último item, não criamos um link, é apenas texto */}
                            {isLastItem ? (
                              <span>{segment}</span>
                            ) : (
                              <BreadcrumbLink to={href} className="capitalize">
                                {segment}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLastItem && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center gap-2">


              </div>
            </div>

            <div className="h-full ">
              {children}
            </div>
          </main>

        </SidebarInset>
        <Toaster />


        <UserProfileInitialModal />

      </SidebarProvider >


    </div>
  );
};
