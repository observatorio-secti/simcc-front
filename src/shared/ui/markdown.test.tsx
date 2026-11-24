import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { parseMarkdownBlocks, splitTableRow } from '@/shared/lib/markdown';
import { Markdown } from './markdown';

describe('Markdown', () => {
  it('separa parágrafos, listas e títulos', () => {
    expect(
      parseMarkdownBlocks(
        '## Título\n\nTexto\ncontinua\n\n- um\n- dois\n\n1. a',
      ),
    ).toEqual([
      { kind: 'heading', level: 2, text: 'Título' },
      { kind: 'paragraph', lines: ['Texto', 'continua'] },
      { kind: 'list', ordered: false, start: 1, items: ['um', 'dois'] },
      { kind: 'list', ordered: true, start: 1, items: ['a'] },
    ]);
  });

  it('renderiza ênfase e links seguros, e HTML como texto', () => {
    const { container } = render(
      <Markdown source="**forte** e *leve* [site](https://simcc.test) [x](javascript:alert(1)) <img src=x>" />,
    );
    expect(screen.getByText('forte').tagName).toBe('STRONG');
    expect(screen.getByText('leve').tagName).toBe('EM');
    expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute(
      'href',
      'https://simcc.test/',
    );
    expect(screen.queryByRole('link', { name: 'x' })).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x>');
  });

  it('lê tabelas GFM com alinhamento, como a MarIA escreve', () => {
    expect(
      parseMarkdownBlocks(
        'Lista:\n| Programa | Bolsistas |\n|---|---:|\n| Química | 17 |\n| Zoologia | 10\n\nFim',
      ),
    ).toEqual([
      { kind: 'paragraph', lines: ['Lista:'] },
      {
        kind: 'table',
        align: [null, 'right'],
        header: ['Programa', 'Bolsistas'],
        rows: [
          ['Química', '17'],
          ['Zoologia', '10'],
        ],
      },
      { kind: 'paragraph', lines: ['Fim'] },
    ]);
  });

  it('não separa colunas em \\| nem dentro de código', () => {
    expect(splitTableRow('| a \\| b | `x | y` | c |')).toEqual([
      'a | b',
      '`x | y`',
      'c',
    ]);
  });

  it('completa linhas curtas e não vira tabela sem a linha separadora', () => {
    expect(parseMarkdownBlocks('| a | b |\n|:-:|-|\n| 1 |')).toEqual([
      {
        kind: 'table',
        align: ['center', null],
        header: ['a', 'b'],
        rows: [['1', '']],
      },
    ]);
    expect(parseMarkdownBlocks('| a | b |')).toEqual([
      { kind: 'paragraph', lines: ['| a | b |'] },
    ]);
  });

  it('renderiza a tabela com Markdown nas células e números à direita', () => {
    render(
      <Markdown
        source={'| Programa | Total |\n|---|---:|\n| **Química** | 17 |'}
      />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Programa' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Química').tagName).toBe('STRONG');
    expect(screen.getByRole('cell', { name: '17' })).toHaveClass('text-right');
  });

  it('riscado e URL solta sem a pontuação final', () => {
    render(<Markdown source="~~antigo~~ veja https://simcc.test/a_b." />);
    expect(screen.getByText('antigo').tagName).toBe('S');
    expect(
      screen.getByRole('link', { name: 'https://simcc.test/a_b' }),
    ).toHaveAttribute('href', 'https://simcc.test/a_b');
  });
});
