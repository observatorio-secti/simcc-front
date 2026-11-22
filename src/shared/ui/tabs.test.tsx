import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

function mockHorizontalOverflow(
  list: HTMLElement,
  {
    clientWidth,
    scrollWidth,
    scrollLeft = 0,
    tabRects,
  }: {
    clientWidth: number;
    scrollWidth: number;
    scrollLeft?: number;
    tabRects?: Record<string, { left: number; width: number }>;
  },
) {
  let currentScrollLeft = scrollLeft;

  Object.defineProperty(list, 'clientWidth', {
    configurable: true,
    value: clientWidth,
  });
  Object.defineProperty(list, 'scrollWidth', {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(list, 'scrollLeft', {
    configurable: true,
    get: () => currentScrollLeft,
    set: (value: number) => {
      currentScrollLeft = value;
    },
  });

  const scrollToMock = vi.fn((options?: ScrollToOptions | number) => {
    if (typeof options === 'object' && options?.left !== undefined) {
      currentScrollLeft = options.left;
    }
  });
  list.scrollTo = scrollToMock as typeof list.scrollTo;

  list.getBoundingClientRect = () =>
    ({
      left: 0,
      right: clientWidth,
      width: clientWidth,
      top: 0,
      bottom: 40,
      height: 40,
      x: 0,
      y: 0,
      toJSON: () => {},
    }) as DOMRect;

  if (tabRects) {
    const tabs = list.querySelectorAll<HTMLElement>('[role="tab"]');
    for (const tab of tabs) {
      const label = tab.textContent ?? '';
      const rect = tabRects[label];
      if (!rect) continue;
      tab.getBoundingClientRect = () =>
        ({
          left: rect.left - currentScrollLeft,
          right: rect.left - currentScrollLeft + rect.width,
          width: rect.width,
          top: 0,
          bottom: 40,
          height: 40,
          x: rect.left - currentScrollLeft,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;
    }
  }

  return { scrollToMock, getScrollLeft: () => currentScrollLeft };
}

describe('Tabs', () => {
  it('usa a variante segmented por padrão', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Aba A</TabsTrigger>
          <TabsTrigger value="b">Aba B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Conteúdo A</TabsContent>
        <TabsContent value="b">Conteúdo B</TabsContent>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    expect(list).toHaveAttribute('data-variant', 'segmented');
    const triggerA = screen.getByRole('tab', { name: 'Aba A' });
    expect(triggerA.className).toContain('data-[state=active]:bg-card');
    expect(triggerA.className).not.toContain('data-[state=active]:bg-eng-blue');
  });

  it('aplica o estilo de botões da busca quando variant="pills"', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="articles">
        <TabsList variant="pills">
          <TabsTrigger value="articles">Artigos</TabsTrigger>
          <TabsTrigger value="books">Livros</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">Lista de artigos</TabsContent>
        <TabsContent value="books">Lista de livros</TabsContent>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    expect(list).toHaveAttribute('data-variant', 'pills');
    expect(list.className).toContain('gap-2');

    const articlesTab = screen.getByRole('tab', { name: 'Artigos' });
    const booksTab = screen.getByRole('tab', { name: 'Livros' });
    expect(articlesTab.className).toContain('data-[state=active]:bg-eng-blue');
    expect(articlesTab.className).toContain('bg-neutral-100');

    await user.click(booksTab);
    expect(booksTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Lista de livros')).toBeVisible();
  });

  it('esconde a scrollbar e aplica fade apenas nas bordas com conteúdo oculto', () => {
    render(
      <Tabs defaultValue="t1">
        <TabsList>
          <TabsTrigger value="t1">Tab 1</TabsTrigger>
          <TabsTrigger value="t2">Tab 2</TabsTrigger>
          <TabsTrigger value="t3">Tab 3</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    expect(list.className).toContain('[scrollbar-width:none]');
    expect(list.className).toContain('[&::-webkit-scrollbar]:hidden');

    // Sem overflow: sem fade em nenhuma borda.
    expect(list).not.toHaveAttribute('data-fade-left');
    expect(list).not.toHaveAttribute('data-fade-right');

    // Com overflow no início (scrollLeft = 0): fade apenas à direita.
    const { getScrollLeft } = mockHorizontalOverflow(list, {
      clientWidth: 200,
      scrollWidth: 500,
      scrollLeft: 0,
    });
    fireEvent.scroll(list);
    expect(list).not.toHaveAttribute('data-fade-left');
    expect(list).toHaveAttribute('data-fade-right', 'true');

    // No meio da rolagem: fade à esquerda e à direita.
    list.scrollLeft = 100;
    expect(getScrollLeft()).toBe(100);
    fireEvent.scroll(list);
    expect(list).toHaveAttribute('data-fade-left', 'true');
    expect(list).toHaveAttribute('data-fade-right', 'true');

    // No fim da rolagem: fade apenas à esquerda.
    list.scrollLeft = 300;
    fireEvent.scroll(list);
    expect(list).toHaveAttribute('data-fade-left', 'true');
    expect(list).not.toHaveAttribute('data-fade-right');
  });

  it('centraliza a tab clicada respeitando as extremidades esquerda e direita', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="t1">
        <TabsList variant="pills">
          <TabsTrigger value="t1">Tab 1</TabsTrigger>
          <TabsTrigger value="t2">Tab 2</TabsTrigger>
          <TabsTrigger value="t3">Tab 3</TabsTrigger>
          <TabsTrigger value="t4">Tab 4</TabsTrigger>
          <TabsTrigger value="t5">Tab 5</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    const { scrollToMock } = mockHorizontalOverflow(list, {
      clientWidth: 200,
      scrollWidth: 500,
      tabRects: {
        'Tab 1': { left: 0, width: 100 },
        'Tab 2': { left: 100, width: 100 },
        'Tab 3': { left: 200, width: 100 },
        'Tab 4': { left: 300, width: 100 },
        'Tab 5': { left: 400, width: 100 },
      },
    });

    // Tab do meio (centro em 250, metade da viewport = 100 -> target 150).
    await user.click(screen.getByRole('tab', { name: 'Tab 3' }));
    expect(scrollToMock).toHaveBeenLastCalledWith({
      left: 150,
      behavior: 'smooth',
    });

    // Extremidade direita (centro em 450 -> ideal 350, limitado a maxScrollLeft = 300).
    await user.click(screen.getByRole('tab', { name: 'Tab 5' }));
    expect(scrollToMock).toHaveBeenLastCalledWith({
      left: 300,
      behavior: 'smooth',
    });

    // Extremidade esquerda (centro em 50 -> ideal -50, limitado a 0).
    await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
    expect(scrollToMock).toHaveBeenLastCalledWith({
      left: 0,
      behavior: 'smooth',
    });
  });

  it('permite arraste com mouse sem acionar clique na tab ao soltar', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="t1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="t1">Tab 1</TabsTrigger>
          <TabsTrigger value="t2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    const { getScrollLeft } = mockHorizontalOverflow(list, {
      clientWidth: 200,
      scrollWidth: 500,
      scrollLeft: 50,
    });

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    fireEvent.pointerDown(tab2, {
      pointerType: 'mouse',
      button: 0,
      clientX: 150,
    });
    fireEvent.pointerMove(window, {
      pointerType: 'mouse',
      clientX: 100,
    });

    expect(list.dataset.dragging).toBe('true');
    expect(getScrollLeft()).toBe(100);

    fireEvent.pointerUp(window, { pointerType: 'mouse', clientX: 100 });
    expect(list.dataset.dragging).toBeUndefined();

    // O clique disparado logo após o arraste deve ser suprimido.
    fireEvent.click(tab2);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
