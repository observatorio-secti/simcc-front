import { Header } from "../components/header/Header";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/provider/theme-provider";
import { ModalProvider } from "../components/provider/modal-provider";
import { ModalProviderSecundary } from "../components/provider/modal-provider-secundary";
import { UserProfileInitialModal } from "../components/modals/user-profile-initial";
import { cn } from "../lib/utils";
import { AppSidebar } from "../components/app-sidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { useLocation } from "react-router-dom";

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  const location = useLocation();

  // Rotas que utilizam o DocsLayout e não devem exibir o Header global duplicado
  const docsRoutes = [
    '/videos', 
    '/termos-uso', 
    '/politica-privacidade', 
    '/api-docs', 
    '/informacoes', 
    '/dicionario-cores'
  ];

  const isDocsPage = docsRoutes.includes(location.pathname);

  return (
    <div className={cn("h-screen w-full bg-neutral-50 flex overflow-hidden")}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <ModalProvider />
        <ModalProviderSecundary />
        
        <SidebarProvider>
          <AppSidebar />
          
          <div className="flex flex-col flex-1 w-full overflow-hidden h-screen">
            {/* Só exibe o Header global se NÃO for uma página de Docs/Vídeos */}
            {!isDocsPage && <Header />}
            
            <main className="flex-1 w-full overflow-y-auto flex flex-col">
              {children}
            </main>
          </div>
        </SidebarProvider>
        
        <Toaster />
        <UserProfileInitialModal />
      </ThemeProvider>
    </div>
  );
}