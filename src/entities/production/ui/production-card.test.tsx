import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductionCard } from './production-card';

describe('ProductionCard', () => {
  it('renderiza artigo no padrão sc-prod com borda Qualis, metadados e sem sombra', () => {
    const { container } = render(
      <ProductionCard
        kind="article"
        item={{
          id: 'art-1',
          title: 'Controle preditivo para veículos autônomos',
          year: 2025,
          doi: '10.1016/j.robot.2025.01',
          magazine: {
            name: 'Robotics and Autonomous Systems',
            issn: '0921-8890',
            qualis: 'A1',
            jcr: 4.3,
          },
          platform_authors: [
            { id: 'res-1', name: 'Helena Duarte' },
            { id: 'res-2', name: 'Caio Barreto' },
          ],
          citations_count: 12,
          has_abstract: true,
          has_open_access_pdf: true,
        }}
      />,
    );

    const card = container.querySelector('[data-slot="production-card"]');
    expect(card).toHaveClass(
      'rounded-lg',
      'border',
      'border-l-[6px]',
      'border-l-qualis-A1',
      'bg-white',
      'p-4',
    );
    expect(card?.className).not.toMatch(/\bshadow/);

    expect(screen.getByText('Robotics and Autonomous Systems')).toHaveClass(
      'text-sm',
      'font-semibold',
    );
    expect(
      screen.getByRole('heading', {
        name: 'Controle preditivo para veículos autônomos',
      }),
    ).toHaveClass('text-sm', 'uppercase');

    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByText('Qualis A1')).toBeInTheDocument();
    expect(screen.getByText('JCR 4,3')).toBeInTheDocument();
    expect(screen.getByText('Citações 12')).toBeInTheDocument();
    expect(screen.getByText('Acesso aberto')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Helena Duarte' })).toHaveAttribute(
      'href',
      expect.stringMatching(/\/pesquisadores\/res-1$/),
    );
    expect(screen.getByRole('link', { name: 'DOI' })).toHaveAttribute(
      'href',
      'https://doi.org/10.1016/j.robot.2025.01',
    );
  });

  it('usa apenas marcador (borda esquerda e Dot) para cores claras, nunca texto branco sobre fundo claro', () => {
    const { container } = render(
      <div className="flex flex-col gap-4">
        <ProductionCard
          kind="article"
          item={{
            id: 'art-a3',
            title: 'Artigo A3',
            year: 2024,
            magazine: { name: 'Revista X', qualis: 'A3' },
            citations_count: 0,
            has_abstract: false,
            has_open_access_pdf: false,
          }}
        />
        <ProductionCard
          kind="book_chapter"
          item={{
            id: 'cap-1',
            title: 'Capítulo claro',
            book_title: 'Livro Y',
            year: 2024,
          }}
        />
        <ProductionCard
          kind="event"
          item={{
            id: 'evt-1',
            title: null,
            event_name: 'Oficina de Dados',
            year: 2025,
            nature: 'Oficina',
          }}
        />
        <ProductionCard
          kind="guidance"
          item={{
            id: 'gui-1',
            title: 'Pesquisa IC',
            year: 2025,
            nature: 'Iniciação Científica',
            status: 'Em andamento',
            oriented: 'Lucas Silva',
          }}
        />
      </div>,
    );

    const cards = container.querySelectorAll('[data-slot="production-card"]');
    expect(cards[0]).toHaveClass('border-l-qualis-A3');
    expect(cards[1]).toHaveClass('border-l-prod-capitulo');
    expect(cards[2]).toHaveClass('border-l-prod-oficina');
    expect(cards[3]).toHaveClass('border-l-orient-ic');

    // Nenhuma cor clara vira fundo de texto branco dentro dos cards.
    expect(
      container.querySelectorAll(
        '.bg-qualis-A3.text-white, .bg-prod-capitulo.text-white, .bg-prod-oficina.text-white, .bg-orient-ic.text-white',
      ),
    ).toHaveLength(0);

    // Evento sem título promove o nome do evento para título sem duplicá-lo.
    expect(
      screen.getByRole('heading', { name: 'Oficina de Dados' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Oficina de Dados')).toHaveLength(1);
    expect(screen.getByText('Orientando: Lucas Silva')).toBeInTheDocument();
  });

  it('destaca trechos UTF-16 de matches sem injetar HTML', () => {
    render(
      <ProductionCard
        kind="software"
        item={{
          id: 'soft-1',
          title: 'Plataforma Simcc',
          year: 2025,
          platform: 'Web',
          code: 'BR512025',
          matches: [
            {
              field: 'description',
              snippet: 'Análise de <script>dados</script> científicos',
              highlights: [[11, 25]],
            },
          ],
        }}
      />,
    );

    const mark = screen.getByText('<script>dados<');
    expect(mark.tagName).toBe('MARK');
  });

  it('exibe projeto de pesquisa com período, status e resumo de autores +N', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    const { container } = render(
      <ProductionCard
        kind="research_project"
        onOpen={onOpen}
        maxAuthors={2}
        item={{
          id: 'proj-1',
          title: 'Rede de sensores marinhos',
          start_year: 2022,
          end_year: null,
          status: 'EM_ANDAMENTO',
          nature: 'PESQUISA',
          agency_name: 'FAPESB',
          platform_authors: [
            { id: '1', name: 'Autora 1' },
            { id: '2', name: 'Autora 2' },
            { id: '3', name: 'Autora 3' },
          ],
        }}
      />,
    );

    const card = container.querySelector('[data-slot="production-card"]');
    expect(card).toHaveClass('border-l-status-andamento');
    expect(screen.getByText('2022–atual')).toBeInTheDocument();
    expect(screen.getByText('Em andamento')).toBeInTheDocument();
    expect(screen.getByText('Pesquisa')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Rede de sensores marinhos' }),
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('renderiza livro, patente, marca e relatório técnico', () => {
    const { container } = render(
      <>
        <ProductionCard
          kind="book"
          item={{
            id: 'b1',
            title: 'Livro 1',
            year: 2021,
            publishing_company: 'EDUFBA',
            isbn: '978-85',
          }}
        />
        <ProductionCard
          kind="patent"
          item={{
            id: 'p1',
            title: 'Patente 1',
            year: 2022,
            category: 'Inovação',
            code: 'BR102022',
          }}
        />
        <ProductionCard
          kind="brand"
          item={{
            id: 'm1',
            title: 'Marca 1',
            year: 2023,
            nature: 'Nominativa',
          }}
        />
        <ProductionCard
          kind="report"
          item={{
            id: 'r1',
            title: 'Relatório 1',
            year: 2024,
            project_name: 'Projeto Z',
          }}
        />
      </>,
    );

    const cards = container.querySelectorAll('[data-slot="production-card"]');
    expect(cards[0]).toHaveClass('border-l-prod-livro');
    expect(cards[1]).toHaveClass('border-l-prod-patente');
    expect(cards[2]).toHaveClass('border-l-prod-marca');
    expect(cards[3]).toHaveClass('border-l-prod-relatorio');
  });
});
