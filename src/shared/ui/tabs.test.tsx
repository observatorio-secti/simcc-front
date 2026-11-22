import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

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
});
