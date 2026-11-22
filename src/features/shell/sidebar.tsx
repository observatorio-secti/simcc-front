import { useId, useState, type ReactNode } from 'react';
import {
  Link,
  useLocation,
  type RegisteredRouter,
} from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import { Separator } from '@/shared/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import {
  isActive,
  PLATFORM_NAV_SECTIONS,
  QUICK_NAV_ITEMS,
  type NavItem,
} from './nav-config';

export type SidebarNavRenderProps = {
  pathname: string;
  collapsed: boolean;
  onNavigate?: (item: NavItem) => void;
};

export type AppSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  /** Callback disparado ao clicar em um item do menu no desktop. */
  onDesktopNavigate?: (item: NavItem) => void;
  /** Navegação própria (ex.: menu do console); padrão: menu público. */
  renderNav?: (props: SidebarNavRenderProps) => ReactNode;
  /** Descrição do menu no sheet do mobile, para leitores de tela. */
  mobileDescription?: string;
};

const ACTIVE_ITEM_CLASS =
  'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white';
const INACTIVE_ITEM_CLASS =
  'text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800';

export function SidebarLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: (item: NavItem) => void;
}) {
  const active = isActive(item.url, pathname, { exact: item.exact });
  const Icon = item.icon;

  const link = (
    <Link<RegisteredRouter, string, string>
      href={item.url}
      activeOptions={{ exact: item.exact || item.url === '/' }}
      activeProps={{}}
      inactiveProps={{}}
      aria-label={collapsed ? item.title : undefined}
      aria-current={active ? 'page' : undefined}
      onClick={() => onNavigate?.(item)}
      className={cn(
        'flex h-8 items-center rounded-md text-sm transition-colors',
        focusRing,
        collapsed ? 'w-8 justify-center px-0' : 'w-full gap-2 px-2',
        active ? ACTIVE_ITEM_CLASS : INACTIVE_ITEM_CLASS,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}

function SidebarNavContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: (item: NavItem) => void;
}) {
  const baseId = useId();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        PLATFORM_NAV_SECTIONS.map((section) => [
          section.id,
          section.defaultOpen ?? true,
        ]),
      ),
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (collapsed) {
    const allPlatformItems = PLATFORM_NAV_SECTIONS.flatMap(
      (section) => section.items,
    );

    return (
      <nav
        aria-label="Menu principal"
        className="flex flex-col items-center gap-1"
      >
        <ul className="flex flex-col items-center gap-1">
          {QUICK_NAV_ITEMS.map((item) => (
            <li key={item.url}>
              <SidebarLink
                item={item}
                pathname={pathname}
                collapsed
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        <Separator className="my-2 w-6 bg-neutral-200 dark:bg-neutral-800" />

        <ul className="flex flex-col items-center gap-1">
          {allPlatformItems.map((item) => (
            <li key={item.url}>
              <SidebarLink
                item={item}
                pathname={pathname}
                collapsed
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-4">
      <div>
        <p className="flex h-8 items-center px-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Acesso rápido
        </p>
        <ul className="flex flex-col gap-0.5">
          {QUICK_NAV_ITEMS.map((item) => (
            <li key={item.url}>
              <SidebarLink
                item={item}
                pathname={pathname}
                collapsed={false}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="flex h-8 items-center px-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Plataforma
        </p>
        <ul className="flex flex-col gap-0.5">
          {PLATFORM_NAV_SECTIONS.map((section) => {
            const isOpen = openSections[section.id] ?? true;
            const panelId = `${baseId}-${section.id}`;
            const SectionIcon = section.icon;

            return (
              <li key={section.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    'flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-foreground transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800',
                    focusRing,
                  )}
                >
                  <SectionIcon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{section.title}</span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'ml-auto size-3.5 shrink-0 text-neutral-500 transition-transform duration-150 dark:text-neutral-400',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>

                {isOpen && (
                  <ul
                    id={panelId}
                    className="mt-0.5 ml-3.5 flex flex-col gap-0.5 border-l border-neutral-200 pl-2.5 dark:border-neutral-800"
                  >
                    {section.items.map((item) => (
                      <li key={item.url}>
                        <SidebarLink
                          item={item}
                          pathname={pathname}
                          collapsed={false}
                          onNavigate={onNavigate}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/**
 * Barra lateral pública: colapsável no desktop (`16rem` ↔ `3rem`) e
 * apresentada em `Sheet` no mobile (`< md`).
 */
function PublicSidebarNav(props: SidebarNavRenderProps) {
  return <SidebarNavContent {...props} />;
}

export function AppSidebar({
  collapsed,
  mobileOpen,
  onMobileOpenChange,
  onDesktopNavigate,
  renderNav = PublicSidebarNav,
  mobileDescription = 'Menu principal da plataforma Simcc',
}: AppSidebarProps) {
  const { pathname } = useLocation();

  return (
    <>
      <aside
        data-slot="sidebar"
        data-state={collapsed ? 'collapsed' : 'expanded'}
        aria-label="Navegação lateral"
        className={cn(
          'hidden h-full shrink-0 flex-col overflow-y-auto bg-neutral-100 p-2 transition-[width] duration-150 ease-in-out md:flex dark:bg-black',
          collapsed ? 'w-[3rem]' : 'w-[16rem]',
        )}
      >
        {renderNav({ pathname, collapsed, onNavigate: onDesktopNavigate })}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-[16rem] gap-0 border-r bg-neutral-100 p-2 sm:max-w-[16rem] dark:bg-black"
        >
          <SheetHeader className="border-b border-neutral-200 px-2 pt-2 pb-3 dark:border-neutral-800">
            <SheetTitle className="text-sm font-semibold">Navegação</SheetTitle>
            <SheetDescription className="sr-only">
              {mobileDescription}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto pt-2">
            {renderNav({
              pathname,
              collapsed: false,
              onNavigate: () => onMobileOpenChange(false),
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
