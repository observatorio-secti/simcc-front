import { describe, expect, it } from 'vitest';
import {
  buildBuscaHref,
  homeSearchSchema,
  suggestionSourceTypesFor,
} from './search-schema';

describe('search-schema', () => {
  it('monta URL de /busca omitindo type quando é o padrão profile', () => {
    expect(buildBuscaHref({ q: '  inteligência artificial  ' })).toBe(
      '/busca?q=intelig%C3%AAncia+artificial',
    );
    expect(buildBuscaHref({ q: 'solos', type: 'profile' })).toBe(
      '/busca?q=solos',
    );
  });

  it('inclui type na URL de /busca quando diferente de profile', () => {
    expect(buildBuscaHref({ q: 'redes neurais', type: 'article' })).toBe(
      '/busca?q=redes+neurais&type=article',
    );
    expect(buildBuscaHref({ q: '', type: 'patent' })).toBe(
      '/busca?type=patent',
    );
  });

  it('mapeia tipos de busca da UI para source_type de /v2/suggestion', () => {
    expect(suggestionSourceTypesFor('profile')).toBeUndefined();
    expect(suggestionSourceTypesFor('article')).toEqual(['article']);
    expect(suggestionSourceTypesFor('book')).toEqual(['book', 'book_chapter']);
    expect(suggestionSourceTypesFor('patent')).toEqual(['patent']);
    expect(suggestionSourceTypesFor('speaker')).toEqual(['speaker']);
    expect(suggestionSourceTypesFor('abstract')).toEqual(['abstract']);
    expect(suggestionSourceTypesFor('software')).toBeUndefined();
  });

  it('faz fallback seguro de type inválido em homeSearchSchema', () => {
    expect(homeSearchSchema.parse({ type: 'desconhecido' })).toEqual({
      type: 'profile',
    });
    expect(homeSearchSchema.parse({ q: 'bahia', type: 'article' })).toEqual({
      q: 'bahia',
      type: 'article',
    });
  });
});
