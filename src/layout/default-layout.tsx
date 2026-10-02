import { ThemeProvider } from '../components/provider/theme-provider';
import { cn } from '../lib/utils';
import { ModalProvider } from '../components/provider/modal-provider';
import { ModalProviderSecundary } from '../components/provider/modal-provider-secundary';
import { Toaster } from '../components/ui/sonner';

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={cn('  h-screen bg-neutral-50 dark:bg-black ')}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={true}
        storageKey="discord-theme"
      >
        <ModalProvider />
        <ModalProviderSecundary />
        <Toaster richColors position="top-right" />

        {children}
      </ThemeProvider>
    </main>
  );
}
