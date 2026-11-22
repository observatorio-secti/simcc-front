import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import type * as TanstackRouter from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { researcherKeys } from '@/entities/researcher/queries';
import { ResearcherProfileOverlay } from './researcher-profile-overlay';
import { researcherProfileSearchSchema } from './search-schema';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof TanstackRouter>();
  return {
    ...actual,
    CatchBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
    Link: ({
      children,
      to,
      ...props
    }: {
      children: ReactNode;
      to: string;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock('./researcher-profile-page', () => ({
  ResearcherProfilePage: ({ researcherId }: { researcherId: string }) => (
    <div data-testid="researcher-profile-page">{researcherId}</div>
  ),
}));

describe('ResearcherProfileOverlay', () => {
  const defaultSearch = researcherProfileSearchSchema.parse({});

  function createQueryClient() {
    return new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  }

  it('abre o painel de baixo para cima quando há pesquisador selecionado', () => {
    const queryClient = createQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ResearcherProfileOverlay
          researcherId="res-123"
          search={defaultSearch}
          routeSearch={{}}
          onUpdateSearch={vi.fn()}
          onOpenProduction={vi.fn()}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-slot', 'sheet-content');
    expect(dialog).toHaveClass(
      'inset-x-0',
      'bottom-0',
      'data-[state=open]:slide-in-from-bottom',
      'data-[state=closed]:slide-out-to-bottom',
    );
    expect(dialog).not.toHaveClass('right-0', 'slide-in-from-right');
    expect(screen.getByTestId('researcher-profile-page')).toHaveTextContent(
      'res-123',
    );
  });

  it('não renderiza o painel quando researcherId é undefined', () => {
    const queryClient = createQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ResearcherProfileOverlay
          researcherId={undefined}
          search={defaultSearch}
          routeSearch={{}}
          onUpdateSearch={vi.fn()}
          onOpenProduction={vi.fn()}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exibe foto, nome, universidade, atualização do Lattes e ações no header sem botão de imprimir', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(researcherKeys.detail('res-123'), {
      data: {
        id: 'res-123',
        name: 'Maria Silva',
        lattes_update: '2026-05-10',
        image_url: null,
        affiliations: [
          {
            institution: {
              name: 'Universidade Federal da Bahia',
              acronym: 'UFBA',
            },
          },
        ],
        identifiers: { orcid: '0000-0001-2345-6789', lattes_id: '1234567890' },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ResearcherProfileOverlay
          researcherId="res-123"
          search={defaultSearch}
          routeSearch={{}}
          onUpdateSearch={vi.fn()}
          onOpenProduction={vi.fn()}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    const dialog = screen.getByRole('dialog');
    const header = dialog.querySelector('[data-slot="sheet-header"]');
    expect(header).not.toBeNull();

    const headerScope = within(header as HTMLElement);
    const avatar = dialog.querySelector('[data-slot="researcher-avatar"]');
    expect(avatar).not.toBeNull();
    expect(avatar).toHaveAttribute('data-size', 'lg');
    expect(headerScope.getByText('Maria Silva')).toBeInTheDocument();
    expect(
      headerScope.getByText(/Universidade Federal da Bahia/),
    ).toBeInTheDocument();
    expect(
      headerScope.getByText(/Atualização do Lattes: 10\/05\/2026/),
    ).toBeInTheDocument();
    expect(
      headerScope.getByRole('button', { name: 'Copiar link do perfil' }),
    ).toBeInTheDocument();
    expect(
      headerScope.getByRole('button', { name: 'Mais ações' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Imprimir perfil' }),
    ).not.toBeInTheDocument();
  });
});
