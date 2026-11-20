import React, { useContext, useEffect, useRef, useState, Suspense } from 'react';
import { UserContext } from '../context/context';

import { useModal } from '../components/hooks/use-modal-store';

import { Outlet, useLocation } from 'react-router-dom';
import { useModalSecundary } from '../components/hooks/use-modal-store-secundary';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar';
import { AppSidebar } from '../components/app-sidebar';
import { Separator } from '../components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import { cn } from '../lib';
import { ErrorBoundary } from '../components/errors/error-boundary';
import { PROFILE_RESULTS_PATH } from '../lib/search-types';

function PageFallback() {
  return (
    <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006699] border-t-transparent" />
    </div>
  );
}

interface SearchLayoutProps {
  children?: React.ReactNode;
}
export default function SearchLayout({ children }: SearchLayoutProps = {}) {
  const { isCollapsed, setIsCollapsed } = useContext(UserContext);

  const { onOpen, isOpen, type: typeModal } = useModal();
  const { onOpen: onOpenSecundary } = useModalSecundary();

  useEffect(() => {
    // Função que será chamada quando o evento de teclado ocorrer
    const handleKeyDown = (event: any) => {
      // Verifica se Ctrl + Y foi pressionado
      if (event.ctrlKey && event.key === 'q') {
        onOpen('search');
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

    if (!hasVisited && !isOpen) {
      // Se não foi exibido, abre o modal
      setIsModalOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    // Marca no localStorage que o modal foi exibido
    localStorage.setItem('hasVisited', 'true');
  };

  const router = useLocation();
  const pathSegments = router.pathname.split('/').filter(Boolean); // Divide a URL em segmentos e remove a primeira parte vazia

  // Verifica se veio da página de instituição através dos parâmetros de query
  const queryParams = new URLSearchParams(router.search);
  const fromInstitution = queryParams.get('from_institution') === 'true';
  const institutionId = queryParams.get('institution_id');
  const institutionName = queryParams.get('institution_name');

  // Se a URL estiver vazia, mostramos "Página Inicial"
  let breadcrumbItems =
    pathSegments.length === 0
      ? ['Página inicial']
      : ['Página inicial', ...pathSegments];

  // Se veio da página de instituição e está em pos-graduacao ou grupos-pesquisa, insere "instituicao" no breadcrumb
  if (
    fromInstitution &&
    (router.pathname === '/pos-graduacao' ||
      router.pathname === '/grupos-pesquisa')
  ) {
    breadcrumbItems = ['Página inicial', 'instituicao', pathSegments[0]];
  }

  const isMariaChat =
    router.pathname === '/resultados-ia' || router.pathname === '/marIA';

  // Contrai o menu lateral apenas ao transicionar vindo de uma rota normal para resultados ou IA
  const prevPathnameRef = useRef(router.pathname);
  useEffect(() => {
    const isCollapseRoute = (path: string) =>
      path === '/resultados' ||
      path === PROFILE_RESULTS_PATH ||
      path === '/resultados-ia' ||
      path === '/marIA';

    const wasCollapse = isCollapseRoute(prevPathnameRef.current);
    const nowCollapse = isCollapseRoute(router.pathname);

    if (!wasCollapse && nowCollapse) {
      setIsCollapsed(false);
    }
    prevPathnameRef.current = router.pathname;
  }, [router.pathname, setIsCollapsed]);

  return (
    <div>
      <SidebarProvider
        className="    "
        defaultOpen={true}
        open={isCollapsed}
        onOpenChange={() => setIsCollapsed((prev) => !prev)}
      >
        <AppSidebar />

        <SidebarInset className={cn(isMariaChat && 'overflow-hidden')}>
          <main
            className={cn(
              'h-full flex flex-col flex-1',
              isMariaChat && 'min-h-0 overflow-hidden',
            )}
          >
            <div className="flex p-8 pt-8 pb-2 h-[68px] shrink-0 items-center justify-between top-0 sticky z-[3] supports-[backdrop-filter]:bg-neutral-50/60 supports-[backdrop-filter]:dark:bg-neutral-900/60 backdrop-blur ">
              <div className="flex  pb-0 items-center gap-2">
                <SidebarTrigger className="" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbItems.map((segment, index) => {
                      const isLastItem = index === breadcrumbItems.length - 1;

                      // Construir o caminho parcial para cada segmento
                      let href =
                        index === 0
                          ? '/' // O primeiro item sempre vai para a página inicial
                          : `/${pathSegments.slice(0, index + 1).join('/')}`;

                      if (
                        segment === 'instituicao' &&
                        fromInstitution &&
                        institutionId
                      ) {
                        href = `/instituicao/${institutionId}`;
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
                          {!isLastItem && (
                            <BreadcrumbSeparator className="hidden md:block" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center gap-2"></div>
            </div>

            <div
              className={cn(
                'h-full',
                isMariaChat &&
                  'flex-1 min-h-0 overflow-hidden h-[calc(100%-68px)]',
              )}
            >
              <ErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  {children ?? <Outlet />}
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
