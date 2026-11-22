import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

function mockHorizontalMetrics(
  element: HTMLElement,
  metrics: { scrollWidth: number; clientWidth: number; scrollLeft?: number },
) {
  let currentScrollLeft = metrics.scrollLeft ?? 0;
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    get: () => metrics.scrollWidth,
  });
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get: () => metrics.clientWidth,
  });
  Object.defineProperty(element, 'scrollLeft', {
    configurable: true,
    get: () => currentScrollLeft,
    set: (value: number) => {
      currentScrollLeft = value;
    },
  });
  element.scrollBy = vi.fn((options?: ScrollToOptions | number) => {
    const left = typeof options === 'number' ? options : (options?.left ?? 0);
    currentScrollLeft = Math.max(
      0,
      Math.min(
        metrics.scrollWidth - metrics.clientWidth,
        currentScrollLeft + left,
      ),
    );
    fireEvent.scroll(element);
  }) as unknown as HTMLElement['scrollBy'];
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

  it('oculta a barra de rolagem e não mostra setas nem fade sem overflow', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Aba A</TabsTrigger>
          <TabsTrigger value="b">Aba B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    expect(list.className).toContain('scrollbar-none');
    expect(
      screen.queryByRole('button', { name: 'Rolar abas para a esquerda' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Rolar abas para a direita' }),
    ).not.toBeInTheDocument();
    expect(list).not.toHaveAttribute('data-scroll-left');
    expect(list).not.toHaveAttribute('data-scroll-right');
  });

  it('mostra setas e fade conforme a posição de rolagem quando há overflow', () => {
    render(
      <Tabs defaultValue="1">
        <TabsList variant="pills">
          <TabsTrigger value="1">Aba 1</TabsTrigger>
          <TabsTrigger value="2">Aba 2</TabsTrigger>
          <TabsTrigger value="3">Aba 3</TabsTrigger>
          <TabsTrigger value="4">Aba 4</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    mockHorizontalMetrics(list, {
      scrollWidth: 500,
      clientWidth: 200,
      scrollLeft: 0,
    });

    // Dispara recálculo após simular overflow no JSDOM
    fireEvent(window, new Event('resize'));

    const rightButton = screen.getByRole('button', {
      name: 'Rolar abas para a direita',
    });
    expect(rightButton).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Rolar abas para a esquerda' }),
    ).not.toBeInTheDocument();
    expect(list).not.toHaveAttribute('data-scroll-left');
    expect(list).toHaveAttribute('data-scroll-right', 'true');

    // Rola para o meio: ambos os botões e ambos os fades aparecem
    fireEvent.click(rightButton);
    expect(list.scrollLeft).toBeGreaterThan(0);
    expect(list.scrollLeft).toBeLessThan(300);

    const leftButton = screen.getByRole('button', {
      name: 'Rolar abas para a esquerda',
    });
    expect(leftButton).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Rolar abas para a direita' }),
    ).toBeInTheDocument();
    expect(list).toHaveAttribute('data-scroll-left', 'true');
    expect(list).toHaveAttribute('data-scroll-right', 'true');

    // Rola até o final: apenas seta esquerda e fade esquerdo
    list.scrollLeft = 300;
    fireEvent.scroll(list);
    expect(
      screen.getByRole('button', { name: 'Rolar abas para a esquerda' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Rolar abas para a direita' }),
    ).not.toBeInTheDocument();
    expect(list).toHaveAttribute('data-scroll-left', 'true');
    expect(list).not.toHaveAttribute('data-scroll-right');
  });

  it('permite arrastar com o mouse sem ativar a aba ao soltar', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="1">Aba 1</TabsTrigger>
          <TabsTrigger value="2">Aba 2</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const list = screen.getByRole('tablist');
    mockHorizontalMetrics(list, {
      scrollWidth: 500,
      clientWidth: 200,
      scrollLeft: 50,
    });

    const tab2 = screen.getByRole('tab', { name: 'Aba 2' });
    fireEvent.mouseDown(list, { button: 0, clientX: 150 });
    fireEvent.mouseMove(window, { clientX: 100 });
    fireEvent.mouseUp(window);
    fireEvent.click(tab2);

    expect(list.scrollLeft).toBe(100);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
