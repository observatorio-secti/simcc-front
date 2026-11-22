import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { parseMarkdownBlocks } from '@/shared/lib/markdown';
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
});
