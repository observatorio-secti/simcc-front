import { describe, expect, it } from 'vitest';
import {
  cleanProfileSearch,
  researcherProfileSearchSchema,
} from './search-schema';

describe('researcherProfileSearchSchema', () => {
  it('aplica valores padrão quando a URL está vazia', () => {
    const parsed = researcherProfileSearchSchema.parse({});
    expect(parsed).toEqual({
      tab: 'articles',
      qualis: undefined,
      year_start: undefined,
      year_end: undefined,
      page: 1,
      view: 'grid',
      sort_by: undefined,
      sort_order: undefined,
      q: undefined,
      search_type: undefined,
    });
  });

  it('valida e normaliza parâmetros válidos da URL', () => {
    const parsed = researcherProfileSearchSchema.parse({
      tab: 'guidance',
      qualis: ['A1', 'A2', 'invalid'],
      year_start: '2020',
      year_end: 2025,
      page: '3',
      view: 'list',
      sort_by: 'citations',
      sort_order: 'desc',
      q: 'robotica',
      search_type: 'profile',
    });

    expect(parsed.tab).toBe('guidance');
    expect(parsed.qualis).toEqual(['A1', 'A2']);
    expect(parsed.year_start).toBe(2020);
    expect(parsed.year_end).toBe(2025);
    expect(parsed.page).toBe(3);
    expect(parsed.view).toBe('list');
    expect(parsed.sort_by).toBe('citations');
    expect(parsed.sort_order).toBe('desc');
    expect(parsed.q).toBe('robotica');
    expect(parsed.search_type).toBe('profile');
  });

  it('faz fallback seguro para valores inválidos', () => {
    const parsed = researcherProfileSearchSchema.parse({
      tab: 'nao_existe',
      page: -5,
      view: 'cards',
      sort_by: 'unknown',
    });

    expect(parsed.tab).toBe('articles');
    expect(parsed.page).toBe(1);
    expect(parsed.view).toBe('grid');
    expect(parsed.sort_by).toBeUndefined();
  });

  it('remove valores padrão em cleanProfileSearch', () => {
    const cleaned = cleanProfileSearch({
      tab: 'articles',
      page: 1,
      view: 'grid',
      qualis: ['A1'],
    });
    expect(cleaned).toEqual({ qualis: ['A1'] });
  });
});
