import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RESEARCHER_INDEX_LEVELS } from './researcher-index-data';
import { ResearcherIndexPage } from './researcher-index-page';

function renderResearcherIndexPage() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/indice-pesquisador',
    component: ResearcherIndexPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/indice-pesquisador'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('ResearcherIndexPage', () => {
  it('renderiza o cabeçalho, a tabela de níveis com cores do kit e as seções explicativas', async () => {
    renderResearcherIndexPage();

    expect(
      await screen.findByRole('heading', {
        name: 'Índice do pesquisador',
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Saiba mais sobre o cálculo do índice do pesquisador/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', { name: 'Nível' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Tempo de doutorado/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Produção acadêmica/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Experiência PG/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /Regra combinada/i }),
    ).toBeInTheDocument();

    for (const row of RESEARCHER_INDEX_LEVELS) {
      expect(screen.getByText(row.level, { exact: true })).toBeInTheDocument();
    }

    expect(
      screen.getByText(/Chamada pública CNPq 04\/2021/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/substituir parte da produção acadêmica/i),
    ).toBeInTheDocument();
  });
});
