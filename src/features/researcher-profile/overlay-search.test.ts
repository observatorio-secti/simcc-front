import { describe, expect, it } from 'vitest';
import {
  decodeProfileOverlaySearch,
  encodeProfileOverlaySearch,
} from './overlay-search';

describe('overlay-search (ADR 0010)', () => {
  it('codifica só o estado próprio do perfil e devolve a busca da rota', () => {
    const current = decodeProfileOverlaySearch(undefined, {
      q: 'solos',
      searchType: 'article',
    });
    expect(current).toMatchObject({
      tab: 'articles',
      page: 1,
      q: 'solos',
      search_type: 'article',
    });

    const next = encodeProfileOverlaySearch(current, {
      tab: 'books',
      year_start: 2020,
    });
    expect(next.encoded).toBe('tab=books&year_start=2020');
    expect(next.routeSearch).toEqual({
      tab: 'books',
      year_start: 2020,
      q: 'solos',
      search_type: 'article',
    });
  });

  it('faz o round-trip do parâmetro codificado, com o termo vindo da lista', () => {
    const decoded = decodeProfileOverlaySearch('tab=guidance&page=3', {
      q: 'redes',
      searchType: 'profile',
    });
    expect(decoded).toMatchObject({
      tab: 'guidance',
      page: 3,
      q: 'redes',
      search_type: 'profile',
    });
    expect(encodeProfileOverlaySearch(decoded).encoded).toBe(
      'tab=guidance&page=3',
    );
  });

  it('sem nada além dos padrões, não gera parâmetro', () => {
    const decoded = decodeProfileOverlaySearch(undefined);
    expect(decoded.search_type).toBeUndefined();
    expect(encodeProfileOverlaySearch(decoded)).toEqual({
      encoded: undefined,
      routeSearch: {},
    });
  });
});
