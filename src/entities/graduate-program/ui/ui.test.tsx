import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { programDetailFixture, programSummaryFixture } from '../fixtures';
import { ProgramCard } from './program-card';
import { ProgramFacts } from './program-facts';
import { ProgramRef } from './program-ref';
import { ResearchLineList } from './research-line-list';

describe('ProgramRef', () => {
  it('mostra nome e sigla com link para o detalhe', () => {
    render(<ProgramRef program={programSummaryFixture} />);
    const link = screen.getByRole('link', {
      name: 'Modelagem Computacional em Ciência e Tecnologia (PPGMC)',
    });
    expect(link).toHaveAttribute(
      'href',
      `/pos-graduacao/${programSummaryFixture.id}`,
    );
  });

  it('aceita texto próprio', () => {
    render(<ProgramRef program={programSummaryFixture}>PPGMC</ProgramRef>);
    expect(screen.getByRole('link', { name: 'PPGMC' })).toBeInTheDocument();
  });
});

describe('ProgramCard', () => {
  it('mostra o item da lista: nome com link, local, conceito, modalidade e área', () => {
    render(<ProgramCard program={programSummaryFixture} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Modelagem Computacional em Ciência e Tecnologia (PPGMC)',
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/pos-graduacao/${programSummaryFixture.id}`,
    );
    expect(screen.getByText('Ilhéus, BA')).toBeInTheDocument();
    expect(screen.getByText('Conceito 4')).toBeInTheDocument();
    expect(
      screen.getByText('Acadêmico · INTERDISCIPLINAR'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/pesquisador/)).not.toBeInTheDocument();
  });

  it('com o detalhe, mostra instituição e pesquisadores', () => {
    render(<ProgramCard program={programDetailFixture} />);
    expect(screen.getByText('UESC')).toBeInTheDocument();
    expect(screen.getByText('27 pesquisadores')).toBeInTheDocument();
  });

  it('usa o nome da instituição quando não há sigla', () => {
    render(
      <ProgramCard
        program={{
          ...programSummaryFixture,
          institution: {
            id: programSummaryFixture.institution_id ?? '',
            name: 'Universidade Federal da Bahia',
            acronym: null,
          },
        }}
      />,
    );
    expect(
      screen.getByText('Universidade Federal da Bahia'),
    ).toBeInTheDocument();
  });
});

describe('ResearchLineList', () => {
  it('lista as linhas com área e período', () => {
    render(
      <ResearchLineList lines={programDetailFixture.research_lines ?? []} />,
    );
    const list = screen.getByRole('list', { name: 'Linhas de pesquisa' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent(
      'Modelagem de sistemas biológicos e ambientais',
    );
    expect(items[0]).toHaveTextContent('Desde 2006');
    expect(items[1]).toHaveTextContent('Ciência da Computação');
    expect(items[1]).toHaveTextContent('2006–2018');
    expect(items[2]).toHaveTextContent(/^Física computacional$/);
  });

  it('mostra o estado vazio sem linhas', () => {
    render(<ResearchLineList lines={[]} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText('Nenhuma linha de pesquisa')).toBeInTheDocument();
  });
});

describe('ProgramFacts', () => {
  const fact = (label: string) =>
    screen.getByText(label, { selector: 'dt' }).nextElementSibling;

  it('mostra instituição, ficha e contato', () => {
    render(<ProgramFacts program={programDetailFixture} />);
    expect(fact('Instituição')).toHaveTextContent(
      'Universidade Estadual de Santa Cruz (UESC)',
    );
    expect(fact('Modalidade')).toHaveTextContent('Acadêmico');
    expect(fact('Conceito CAPES')).toHaveTextContent('4');
    expect(fact('Início')).toHaveTextContent('março de 2006');
    expect(fact('Pesquisadores')).toHaveTextContent('27 pesquisadores');
    expect(
      screen.getByRole('link', { name: /uesc\.br\/cursos/ }),
    ).toHaveAttribute(
      'href',
      'https://www.uesc.br/cursos/pos_graduacao/mestrado/modelagem',
    );
    expect(screen.getByRole('link', { name: 'ppgmc@uesc.br' })).toHaveAttribute(
      'href',
      'mailto:ppgmc@uesc.br',
    );
  });

  it('omite campos vazios', () => {
    render(
      <ProgramFacts
        program={{
          ...programDetailFixture,
          institution: null,
          site: 'javascript:alert(1)',
          email: '',
          coordinator: null,
        }}
      />,
    );
    for (const label of ['Instituição', 'Site', 'E-mail', 'Coordenação']) {
      expect(screen.queryByText(label, { selector: 'dt' })).toBeNull();
    }
    expect(screen.queryByRole('link')).toBeNull();
  });
});
