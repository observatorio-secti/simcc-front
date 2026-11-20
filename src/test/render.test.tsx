import { queryOptions, useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { simcc, unwrap } from '@/api/simcc';
import { server } from './msw/server';
import { fixture, mockGet, mockGetError } from './msw/simcc';
import { renderRoute, renderWithQueryClient } from './render';

describe('renderRoute', () => {
  it('monta uma rota real num router em memória', async () => {
    const { router } = await renderRoute('/dev/vitrine');

    expect(router.state.location.pathname).toBe('/dev/vitrine');
    // A vitrine carrega a página com `React.lazy` (todo o kit, transformado na
    // hora pelo Vitest): o primeiro render passa de 1 s com a suíte em paralelo.
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: 'Vitrine do kit' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });
});

// Exemplo de tela que busca dados: o mesmo formato de `queryOptions` que as
// entidades exportam (src/entities/<nome>/queries.ts), servido pelo MSW.
const researchersQuery = (q: string) =>
  queryOptions({
    queryKey: ['researcher', 'list', { q }],
    queryFn: ({ signal }) =>
      unwrap(simcc.GET('/researcher', { params: { query: { q } }, signal })),
  });

function ResearcherNames({ q }: { q: string }) {
  const { data, error, isPending } = useQuery(researchersQuery(q));
  if (isPending) return <p>Carregando</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return (
    <ul>
      {data.data.map((researcher) => (
        <li key={researcher.id}>{researcher.name}</li>
      ))}
    </ul>
  );
}

describe('tela com dados da API simulada', () => {
  it('mostra a resposta padrão do handler', async () => {
    renderWithQueryClient(<ResearcherNames q="solos" />);

    const [researcher] = fixture('/researcher').data;
    expect(await screen.findByText(researcher!.name)).toBeInTheDocument();
  });

  it('mostra a resposta sobrescrita no teste', async () => {
    const body = fixture('/researcher');
    body.data = body.data.map((item) => ({ ...item, name: 'Maria Silva' }));
    server.use(mockGet('/researcher', body));

    renderWithQueryClient(<ResearcherNames q="solos" />);

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument();
  });

  it('mostra o erro da API sem nova tentativa', async () => {
    server.use(
      mockGetError('/researcher', 500, { message: 'Falha no servidor.' }),
    );

    renderWithQueryClient(<ResearcherNames q="solos" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha no servidor.',
    );
  });
});
