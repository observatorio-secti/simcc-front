import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import { switchTab, type ResultsSearch } from '../results-search';
import type { SearchTabDefinition } from '../search-tabs';

export interface ResultsTabsProps {
  search: ResultsSearch;
  tabs: readonly SearchTabDefinition[];
  active: SearchTabDefinition;
}

/**
 * Tabs de visão do resultado (`sc-viewtabs`). Cada aba é um link: trocar de
 * aba é navegar, e a aba fica na URL. Tabs longas rolam no próprio container.
 */
export function ResultsTabs({ search, tabs, active }: ResultsTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Com muitas abas (listagens sem termo, D1.4), a ativa pode ficar fora da
  // área visível no mobile: rola só o container, sem mexer na página.
  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector('[aria-selected="true"]');
    if (!list || !selected) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = selected.getBoundingClientRect();
    if (tabBox.left < listBox.left) {
      list.scrollLeft -= listBox.left - tabBox.left;
    } else if (tabBox.right > listBox.right) {
      list.scrollLeft += tabBox.right - listBox.right;
    }
  }, [active.id]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Visão do resultado"
      className="-mx-1 flex min-w-0 flex-1 [scrollbar-width:none] gap-2 overflow-x-auto px-1 py-0.5"
    >
      {tabs.map((tab) => {
        const selected = tab.id === active.id;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            to="/busca"
            search={switchTab(search, tab.id)}
            resetScroll={false}
            role="tab"
            aria-selected={selected}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors',
              selected
                ? 'bg-eng-blue text-white hover:bg-eng-dark-blue'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
              focusRing,
            )}
          >
            <Icon className="size-4" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
