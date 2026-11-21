import { readStorage, writeStorage } from '@/shared/lib/storage';

export const SIDEBAR_STORAGE_KEY = 'simcc:sidebar-collapsed';

export function readSidebarCollapsed(): boolean {
  return readStorage<boolean>(SIDEBAR_STORAGE_KEY, false);
}

export function writeSidebarCollapsed(collapsed: boolean): void {
  writeStorage(SIDEBAR_STORAGE_KEY, collapsed);
}
