import { describe, expect, it } from 'vitest';
import {
  decodeProductionRef,
  encodeProductionRef,
  productionHref,
  productionKindFromSlug,
  productionRefParam,
  productionSlug,
} from './links';
import { PRODUCTION_KINDS } from './model';

describe('links da produção (T13)', () => {
  it('cada tipo da v2 tem um slug único, em kebab-case e sem acento', () => {
    const slugs = PRODUCTION_KINDS.map(productionSlug);
    expect(new Set(slugs).size).toBe(PRODUCTION_KINDS.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
    for (const kind of PRODUCTION_KINDS) {
      expect(productionKindFromSlug(productionSlug(kind))).toBe(kind);
    }
  });

  it('mapeia os slugs públicos', () => {
    expect(productionSlug('article')).toBe('artigo');
    expect(productionSlug('book_chapter')).toBe('capitulo-de-livro');
    expect(productionSlug('magazine_text')).toBe('texto-em-revista');
    expect(productionSlug('event_work')).toBe('trabalho-em-evento');
    expect(productionKindFromSlug('article')).toBeNull();
    expect(productionHref('research_project', 'a b')).toBe(
      '/producoes/projeto-de-pesquisa/a%20b',
    );
  });

  it('codifica e valida o search param `production`', () => {
    expect(encodeProductionRef({ kind: 'book', id: 'x1' })).toBe('book:x1');
    expect(decodeProductionRef('event_work:abc')).toEqual({
      kind: 'event_work',
      id: 'abc',
    });
    expect(decodeProductionRef('livro:abc')).toBeUndefined();
    expect(decodeProductionRef('book:')).toBeUndefined();
    expect(productionRefParam.parse('article:1')).toBe('article:1');
    expect(productionRefParam.parse('xyz')).toBeUndefined();
    expect(productionRefParam.parse(undefined)).toBeUndefined();
  });
});
