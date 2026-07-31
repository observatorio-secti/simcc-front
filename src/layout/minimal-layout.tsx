import { Header } from "../components/header/Header";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/provider/theme-provider";
import { ModalProvider } from "../components/provider/modal-provider";
import { ModalProviderSecundary } from "../components/provider/modal-provider-secundary";
import { UserProfileInitialModal } from "../components/modals/user-profile-initial";
import { cn } from "../lib/utils";

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-neutral-50")}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <ModalProvider />
        <ModalProviderSecundary />
        
        <Header />
        
        <main className="flex-1 w-full">
          {children}
        </main>
        
        <Toaster />
        <UserProfileInitialModal />
      </ThemeProvider>
    </div>
  );
}