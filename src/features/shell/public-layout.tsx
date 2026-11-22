import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { ConsoleShortcut } from './console-shortcut';
import { Crumbbar } from './crumbbar';
import type { NavItem } from './nav-config';
import { AppSidebar, type AppSidebarProps } from './sidebar';
import { readSidebarCollapsed, writeSidebarCollapsed } from './sidebar-storage';
import { Topbar } from './topbar';
import { MOBILE_MEDIA_QUERY, useIsMobile } from './use-is-mobile';

export type PublicLayoutProps = {
  children: ReactNode;
  /** Ações à direita da topbar; padrão: atalho "Console" (só para admin). */
  topbarActions?: ReactNode;
  /** Menu lateral próprio (o console usa o dele); padrão: menu público. */
  renderNav?: AppSidebarProps['renderNav'];
  mobileNavDescription?: string;
};

/**
 * Moldura completa: sidebar, topbar, painel e crumbbar. A área pública usa o
 * menu padrão; o console troca só o menu e as ações da topbar.
 */
export function PublicLayout({
  children,
  topbarActions = <ConsoleShortcut />,
  renderNav,
  mobileNavDescription,
}: PublicLayoutProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);
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

  const handleDesktopNavigate = useCallback((item: NavItem) => {
    if (item.url === '/') return;
    setCollapsed(true);
    writeSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (prevPathname !== '/' && pathname === '/') {
      setCollapsed(false);
      writeSidebarCollapsed(false);
    }
  }, [pathname]);

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
        onDesktopNavigate={handleDesktopNavigate}
        renderNav={renderNav}
        mobileDescription={mobileNavDescription}
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
