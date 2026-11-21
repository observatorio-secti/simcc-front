import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Crumbbar } from './crumbbar';
import { AppSidebar } from './sidebar';
import { readSidebarCollapsed, writeSidebarCollapsed } from './sidebar-storage';
import { Topbar } from './topbar';
import { MOBILE_MEDIA_QUERY, useIsMobile } from './use-is-mobile';

export type PublicLayoutProps = {
  children: ReactNode;
  /** Slot opcional para ações à direita da topbar (reservado à F1.4). */
  topbarActions?: ReactNode;
};

/** Moldura completa da área pública: sidebar, topbar, painel e crumbbar. */
export function PublicLayout({ children, topbarActions }: PublicLayoutProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
      return;
    }

    setCollapsed((prev) => {
      const next = !prev;
      writeSidebarCollapsed(next);
      return next;
    });
  }, [isMobile]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(MOBILE_MEDIA_QUERY);
    if (!mediaQuery) return;

    const handleChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setMobileOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b' || (!event.metaKey && !event.ctrlKey))
        return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      handleToggleSidebar();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleSidebar]);

  return (
    <div className="flex h-dvh w-full overflow-x-hidden bg-neutral-100 dark:bg-black">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={isMobile && mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col md:gap-2 md:pt-1 md:pr-2 md:pb-2">
        <Topbar actions={topbarActions} />

        <div
          data-slot="shell-panel"
          className="relative flex min-h-0 flex-1 flex-col overflow-y-auto border-t bg-neutral-50 md:rounded-xl md:border dark:bg-neutral-900"
        >
          <Crumbbar
            sidebarCollapsed={collapsed}
            mobileOpen={isMobile && mobileOpen}
            isMobile={isMobile}
            onToggleSidebar={handleToggleSidebar}
          />

          <main
            id="main-content"
            className="flex flex-1 flex-col px-4 pt-4 pb-12 md:px-8"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
