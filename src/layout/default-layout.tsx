import { ThemeProvider } from "../components/provider/theme-provider";
import { cn } from "../lib/utils";
import { ModalProvider } from "../components/provider/modal-provider";
import { ModalProviderSecundary } from "../components/provider/modal-provider-secundary";

export default function DefaultLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return(
        <body className={cn(
            "  h-screen bg-neutral-50 dark:bg-black "
            )}>
            <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            storageKey="discord-theme"
            >
              <ModalProvider/>
              <ModalProviderSecundary/>
     
            {children}
            </ThemeProvider>
            
             
            </body>
    )
}