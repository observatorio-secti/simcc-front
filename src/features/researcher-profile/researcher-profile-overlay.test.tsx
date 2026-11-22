import { render, screen } from '@testing-library/react';
import type * as TanstackRouter from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
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

  it('abre o painel de baixo para cima quando há pesquisador selecionado', () => {
    render(
      <ResearcherProfileOverlay
        researcherId="res-123"
        search={defaultSearch}
        routeSearch={{}}
        onUpdateSearch={vi.fn()}
        onOpenProduction={vi.fn()}
        onClose={vi.fn()}
      />,
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
    render(
      <ResearcherProfileOverlay
        researcherId={undefined}
        search={defaultSearch}
        routeSearch={{}}
        onUpdateSearch={vi.fn()}
        onOpenProduction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
