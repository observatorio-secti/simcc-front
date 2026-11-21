import { waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import type { FacetResult } from '@/api/types';
import { v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import { renderRoute } from './render-route';

const scholarship = v2Fixtures['/scholarship'].data[0]!;
const magazine = v2Fixtures['/magazine'].data[0]!;

const modalityFacet: FacetResult = {
  param: 'modality',
  total: 2,
  items: [
    {
      value: 'Produtividade em Pesquisa - 2',
      label: 'Produtividade em Pesquisa - 2',
      count: 150,
      acronym: null,
      selected: false,
    },
    {
      value: 'Produtividade Desen. Tec. e Extensão Inovadora - C',
      label: 'Produtividade Desen. Tec. e Extensão Inovadora - C',
      count: 12,
      acronym: null,
      selected: false,
    },
  ],
};

const qualisFacet: FacetResult = {
  param: 'qualis',
  total: 2,
  items: [
    { value: 'A1', label: 'A1', count: 30, acronym: null, selected: false },
    { value: 'B2', label: 'B2', count: 10, acronym: null, selected: false },
  ],
};

/** Registra as chamadas a uma listagem da v2 e responde com a fixture e as facetas. */
function captureList(
  path: '/scholarship' | '/magazine',
  facets: Record<string, FacetResult>,
) {
  const calls: URLSearchParams[] = [];
  const handler = http.get(simccV2Url(path), ({ request }) => {
    calls.push(new URL(request.url).searchParams);
    return HttpResponse.json({ ...v2Fixtures[path], facets });
  });
  return { calls, handler };
}

describe('Listagens: /busca sem termo (D1.4)', () => {
  it('mostra uma aba por catálogo da v2', async () => {
    const { findByRole } = await renderRoute('/busca');

    const tablist = await findByRole('tablist', { name: 'Visão do resultado' });
    const labels = within(tablist)
      .getAllByRole('tab')
      .map((tab) => tab.textContent);
    expect(labels).toEqual([
      'Pesquisadores',
      'Bolsistas',
      'Artigos',
      'Livros',
      'Capítulos de livros',
      'Patentes',
      'Softwares',
      'Participação em eventos',
      'Projetos de pesquisa',
      'Marcas',
      'Orientações',
      'Relatórios técnicos',
      'Revistas',
    ]);
  }, 15000);

  it('troca para bolsistas com o motor da F1.5 e filtra por faceta', async () => {
    const scholarships = captureList('/scholarship', {
      modality: modalityFacet,
    });
    const { container, findByRole, findByText, findAllByRole, router, user } =
      await renderRoute('/busca?page=2', {
        handlers: [scholarships.handler],
      });

    const tablist = await findByRole('tablist', { name: 'Visão do resultado' });
    await user.click(within(tablist).getByRole('tab', { name: 'Bolsistas' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        tab: 'scholarships',
      });
    });
    expect(router.state.location.search).not.toHaveProperty('page');

    expect(await findByText('Total de bolsas')).toBeInTheDocument();
    const card = await waitFor(() => {
      const element = container.querySelector('[data-slot="scholarship-card"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(
      within(card).getByRole('link', { name: scholarship.researcher.name }),
    ).toHaveAttribute('href', `/pesquisadores/${scholarship.researcher.id}`);

    const first = scholarships.calls.at(-1)!;
    expect(first.get('sort_by')).toBe('researcher_name');
    expect(first.getAll('facets')).toEqual(['modality', 'category_level']);
    expect(first.has('q')).toBe(false);

    const [checkbox] = await findAllByRole('checkbox', {
      name: /Produtividade em Pesquisa - 2/,
    });
    await user.click(checkbox!);
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        tab: 'scholarships',
        modality: ['Produtividade em Pesquisa - 2'],
      });
    });
    await waitFor(() => {
      expect(scholarships.calls.at(-1)!.getAll('modality')).toEqual([
        'Produtividade em Pesquisa - 2',
      ]);
    });
  }, 20000);

  it('troca para revistas e filtra por Qualis', async () => {
    const magazines = captureList('/magazine', { qualis: qualisFacet });
    const { container, findByRole, findByText, findAllByRole, router, user } =
      await renderRoute('/busca', { handlers: [magazines.handler] });

    const tablist = await findByRole('tablist', { name: 'Visão do resultado' });
    await user.click(within(tablist).getByRole('tab', { name: 'Revistas' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        tab: 'magazines',
      });
    });

    expect(await findByText('Total de revistas')).toBeInTheDocument();
    const card = await waitFor(() => {
      const element = container.querySelector('[data-slot="magazine-card"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(card).toHaveTextContent(magazine.name!);
    expect(magazines.calls.at(-1)!.get('sort_by')).toBe('name');

    const [checkbox] = await findAllByRole('checkbox', { name: /A1/ });
    await user.click(checkbox!);
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        tab: 'magazines',
        qualis: ['A1'],
      });
    });
    await waitFor(() => {
      expect(magazines.calls.at(-1)!.getAll('qualis')).toEqual(['A1']);
    });
  }, 20000);

  it('com termo, bolsistas e revistas saem das abas', async () => {
    const { findByRole } = await renderRoute('/busca?q=solos&tab=magazines');
    const tablist = await findByRole('tablist', { name: 'Visão do resultado' });
    const labels = within(tablist)
      .getAllByRole('tab')
      .map((tab) => tab.textContent);
    expect(labels).not.toContain('Revistas');
    expect(labels).not.toContain('Bolsistas');
    expect(
      within(tablist).getByRole('tab', { name: 'Pesquisadores' }),
    ).toHaveAttribute('aria-selected', 'true');
  }, 15000);
});

describe('Rota /listagens (D1.4)', () => {
  it('redireciona para /busca', async () => {
    const { router, findByRole } = await renderRoute('/listagens');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/busca');
    });
    expect(router.state.location.search).not.toHaveProperty('tab');
    expect(
      await findByRole('tablist', { name: 'Visão do resultado' }),
    ).toBeInTheDocument();
  }, 15000);

  it('preserva a aba do legado no redirect', async () => {
    const { router } = await renderRoute('/listagens?tab=bolsistas');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/busca');
    });
    expect(router.state.location.search).toMatchObject({
      tab: 'scholarships',
    });
  }, 15000);
});
