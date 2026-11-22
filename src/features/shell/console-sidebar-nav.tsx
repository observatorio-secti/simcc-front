import { Separator } from '@/shared/ui/separator';
import { CONSOLE_BACK_ITEM, CONSOLE_NAV_ITEMS } from './nav-config';
import { SidebarLink, type SidebarNavRenderProps } from './sidebar';

/** Menu lateral do console: marca o ambiente administrativo e volta ao público. */
export function ConsoleSidebarNav({
  pathname,
  collapsed,
  onNavigate,
}: SidebarNavRenderProps) {
  return (
    <nav
      aria-label="Menu do console"
      className={
        collapsed ? 'flex flex-col items-center gap-1' : 'flex flex-col'
      }
    >
      {!collapsed && (
        <p className="flex h-8 items-center px-2 text-[10px] font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          Console administrativo
        </p>
      )}
      <ul
        className={
          collapsed
            ? 'flex flex-col items-center gap-1'
            : 'flex flex-col gap-0.5'
        }
      >
        {CONSOLE_NAV_ITEMS.map((item) => (
          <li key={item.url}>
            <SidebarLink
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>

      <Separator
        className={
          collapsed
            ? 'my-2 w-6 bg-neutral-200 dark:bg-neutral-800'
            : 'my-3 bg-neutral-200 dark:bg-neutral-800'
        }
      />

      <SidebarLink
        item={CONSOLE_BACK_ITEM}
        pathname={pathname}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
