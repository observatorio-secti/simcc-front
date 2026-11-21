import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductionDetail } from './production-detail';

describe('ProductionDetail', () => {
  it('renderiza dossiê completo de artigo usando PRODUCTION_REGISTRY', () => {
    const { container } = render(
      <ProductionDetail
        kind="article"
        item={{
          id: 'art-1',
          title: 'Simulação HIL de veículos autônomos',
          year: 2025,
          doi: '10.1016/j.robot.2025.01',
          magazine: {
            name: 'Robotics and Autonomous Systems',
            issn: '0921-8890',
            qualis: 'A2',
            jcr: 3.7,
          },
          platform_authors: [{ id: 'res-1', name: 'Helena Duarte' }],
          citations_count: 1500,
          has_abstract: true,
          has_open_access_pdf: true,
          abstract: 'Resumo científico completo do artigo.',
          landing_page_url: 'https://exemplo.org/artigo',
          pdf_url: 'https://exemplo.org/artigo.pdf',
          keywords: ['Robótica', 'Controle preditivo'],
          authors: [{ name: 'Helena Duarte' }, { name: 'Caio Barreto' }],
          language: 'Inglês',
        }}
      />,
    );

    expect(
      container.querySelector('[data-slot="production-detail"]'),
    ).toBeInTheDocument();
    expect(screen.getByText('Artigo')).toBeInTheDocument();
    expect(screen.getByText('Qualis A2')).toBeInTheDocument();
    expect(screen.getByText('JCR 3,7')).toBeInTheDocument();
    expect(screen.getByText('Citações 1.500')).toBeInTheDocument();
    expect(
      screen.getByText('Resumo científico completo do artigo.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Robótica')).toBeInTheDocument();
    expect(screen.getByText('Controle preditivo')).toBeInTheDocument();
    expect(screen.getByText('Helena Duarte; Caio Barreto')).toBeInTheDocument();
    expect(screen.getByText('0921-8890')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Helena Duarte' })).toHaveAttribute(
      'href',
      expect.stringMatching(/\/pesquisadores\/res-1$/),
    );
    expect(
      screen.getByRole('link', { name: 'PDF em acesso aberto' }),
    ).toHaveAttribute('href', 'https://exemplo.org/artigo.pdf');
  });

  it('renderiza seções estruturadas de projeto de pesquisa (fomento, integrantes, produções)', () => {
    render(
      <ProductionDetail
        kind="research_project"
        item={{
          id: 'proj-1',
          title: 'Monitoramento costeiro inteligente',
          start_year: 2023,
          end_year: null,
          status: 'EM_ANDAMENTO',
          nature: 'PESQUISA',
          agency_name: 'FAPESB',
          agency_code: 'APP0042/2023',
          description: 'Descrição detalhada do projeto.',
          number_undergraduates: 3,
          number_phd: 1,
          foment: [
            { agency_name: 'CNPq', agency_code: 'CNPQ', nature: 'Bolsa IC' },
          ],
          components: [
            { name: 'Helena Duarte', coordinator: true },
            { name: 'Caio Barreto', coordinator: false },
          ],
          productions: [{ title: 'Artigo vinculado', type: 'Artigo' }],
        }}
      />,
    );

    expect(screen.getByText('Projeto de pesquisa')).toBeInTheDocument();
    expect(
      screen.getByText('Descrição detalhada do projeto.'),
    ).toBeInTheDocument();
    expect(screen.getByText('FAPESB (APP0042/2023)')).toBeInTheDocument();
    expect(screen.getByText('Graduação: 3 · Doutorado: 1')).toBeInTheDocument();
    expect(screen.getByText('CNPq')).toBeInTheDocument();
    expect(screen.getByText('Coordenador')).toBeInTheDocument();
    expect(screen.getByText('Artigo vinculado')).toBeInTheDocument();
  });

  it('respeita cores claras usando marcador outline + Dot no cabeçalho', () => {
    const { container } = render(
      <ProductionDetail
        kind="guidance"
        item={{
          id: 'gui-1',
          title: 'Mapeamento costeiro',
          year: 2025,
          nature: 'Iniciação Científica',
          type: 'Orientador principal',
          status: 'Concluída',
          oriented: 'Lucas Andrade',
        }}
      />,
    );

    expect(
      container.querySelector('[data-slot="card"].border-l-orient-ic'),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.bg-orient-ic.text-white')).toHaveLength(
      0,
    );
    expect(screen.getByText('Lucas Andrade')).toBeInTheDocument();
    expect(screen.getByText('Iniciação Científica')).toBeInTheDocument();
  });
});
