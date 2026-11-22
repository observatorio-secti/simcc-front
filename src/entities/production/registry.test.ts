import { describe, expect, it } from 'vitest';
import {
  FALLBACK_COLOR,
  PRODUCTION_COLORS,
  QUALIS_COLORS,
  STATUS_COLORS,
} from '@/shared/lib/design-tokens';
import { PRODUCTION_KINDS } from './model';
import {
  MATCH_FIELD_LABELS,
  PRODUCTION_REGISTRY,
  PRODUCTION_SORT_LABELS,
  getProductionDefinition,
  getProductionSortOptions,
} from './registry';

describe('PRODUCTION_REGISTRY', () => {
  it('registra todos os 12 tipos de produção da v2 com ícone, rótulos e sem CSV', () => {
    expect(Object.keys(PRODUCTION_REGISTRY)).toEqual([...PRODUCTION_KINDS]);

    for (const kind of PRODUCTION_KINDS) {
      const def = getProductionDefinition(kind);
      expect(def.kind).toBe(kind);
      expect(def.title.length).toBeGreaterThan(0);
      expect(def.noun[0].length).toBeGreaterThan(0);
      expect(def.noun[1].length).toBeGreaterThan(0);
      expect(def.icon).toBeDefined();
      expect(def.sortOptions).toContain('year');
      expect(def.sortOptions).toContain('title');
      expect('csv' in def).toBe(false);
      expect('csvFileName' in def).toBe(false);
    }
  });

  it('expõe ordenação com citations apenas em article e relevance apenas com busca', () => {
    expect(PRODUCTION_REGISTRY.article.sortOptions).toEqual([
      'relevance',
      'year',
      'citations',
      'title',
    ]);
    expect(getProductionSortOptions('article', true)).toContain('relevance');
    expect(getProductionSortOptions('article', false)).not.toContain(
      'relevance',
    );
    expect(getProductionSortOptions('book', true)).toEqual([
      'relevance',
      'year',
      'title',
    ]);
    expect(PRODUCTION_SORT_LABELS.citations).toBe('Mais citados');
    expect(MATCH_FIELD_LABELS.abstract).toBe('Resumo');
  });

  it('calcula cores de card via design-tokens.ts para todos os tipos', () => {
    expect(
      PRODUCTION_REGISTRY.article.itemColor({
        id: '1',
        title: 'A',
        citations_count: 0,
        has_abstract: false,
        has_open_access_pdf: false,
        magazine: { qualis: 'A1' },
      }),
    ).toBe(QUALIS_COLORS.A1);

    expect(
      PRODUCTION_REGISTRY.article.itemColor({
        id: '1',
        title: 'A',
        citations_count: 0,
        has_abstract: false,
        has_open_access_pdf: false,
        magazine: { qualis: 'A3' },
      }),
    ).toMatchObject({ ...QUALIS_COLORS.A3, light: true });

    expect(
      PRODUCTION_REGISTRY.article.itemColor({
        id: '1',
        title: 'A',
        citations_count: 0,
        has_abstract: false,
        has_open_access_pdf: false,
        magazine: null,
      }),
    ).toBe(QUALIS_COLORS.SQ);

    expect(
      PRODUCTION_REGISTRY.book_chapter.itemColor({
        id: '2',
        title: 'Cap',
      }),
    ).toMatchObject({ ...PRODUCTION_COLORS.capitulo, light: true });

    expect(
      PRODUCTION_REGISTRY.event.itemColor({
        id: '3',
        nature: 'Oficina',
      }),
    ).toMatchObject({ ...PRODUCTION_COLORS.oficina, light: true });

    expect(
      PRODUCTION_REGISTRY.event.itemColor({
        id: '4',
        nature: 'Encontro',
      }),
    ).toBe(FALLBACK_COLOR);

    expect(
      PRODUCTION_REGISTRY.research_project.itemColor({
        id: '5',
        title: 'Proj',
        status: 'EM_ANDAMENTO',
      }),
    ).toBe(STATUS_COLORS.andamento);

    expect(
      PRODUCTION_REGISTRY.guidance.itemColor({
        id: '6',
        title: 'Orient',
        nature: 'Iniciação Científica',
      }),
    ).toMatchObject({ light: true, borderLeft: 'border-l-orient-ic' });
  });

  it('extrai subtítulos, tags, links externos e detalhes para cada tipo', () => {
    const articleLinks = PRODUCTION_REGISTRY.article.externalLinks({
      id: '1',
      title: 'Artigo',
      doi: '10.1000/abc',
      landing_page_url: 'https://exemplo.org/artigo',
      pdf_url: 'javascript:alert(1)',
      citations_count: 5,
      has_abstract: true,
      has_open_access_pdf: true,
    });
    expect(articleLinks).toEqual([
      { label: 'DOI', href: 'https://doi.org/10.1000/abc' },
      { label: 'Página do artigo', href: 'https://exemplo.org/artigo' },
    ]);

    expect(
      PRODUCTION_REGISTRY.event.itemTitle({
        id: 'e1',
        title: null,
        event_name: 'Simpósio Baiano de Computação',
      }),
    ).toBe('Simpósio Baiano de Computação');
    expect(
      PRODUCTION_REGISTRY.event.subtitle({
        id: 'e1',
        title: null,
        event_name: 'Simpósio Baiano de Computação',
      }),
    ).toBeNull();

    const chapterDetails = PRODUCTION_REGISTRY.book_chapter.details({
      id: 'c1',
      title: 'Capítulo',
      book_title: 'Livro X',
      organizers: 'Org Y',
      start_page: '12',
      end_page: '28',
      publishing_company: 'EDUFBA',
      isbn: '978-0-00',
      doi: '10.1000/cap',
      authors: [{ name: 'Autor A' }],
    });
    expect(chapterDetails).toEqual(
      expect.arrayContaining([
        { label: 'Livro', value: 'Livro X' },
        { label: 'Páginas', value: '12–28' },
        {
          label: 'DOI',
          value: '10.1000/cap',
          href: 'https://doi.org/10.1000/cap',
        },
      ]),
    );

    const guidanceTags = PRODUCTION_REGISTRY.guidance.tags({
      id: 'g1',
      title: 'TCC',
      nature: 'Iniciação Científica',
      status: 'Concluída',
      type: 'Orientador principal',
    });
    expect(guidanceTags.map((t) => t.label)).toEqual([
      'Iniciação Científica',
      'Concluída',
      'Orientador principal',
    ]);
  });

  it('texto em revista e trabalho em evento usam as cores e campos da v2 (V4.1)', () => {
    const text = {
      id: 't1',
      title: 'Texto',
      year: 2024,
      nature: 'JORNAL_DE_NOTICIAS',
      language: 'Português',
      means_divulgation: 'MEIO_DIGITAL',
    };
    const textDef = PRODUCTION_REGISTRY.magazine_text;
    expect(textDef.color).toBe(PRODUCTION_COLORS['texto-revista']);
    expect(textDef.itemColor(text)).toBe(PRODUCTION_COLORS['texto-revista']);
    expect(textDef.subtitle(text)).toBe('Jornal de noticias');
    expect(textDef.tags(text).map((tag) => tag.label)).toEqual([
      'Meio digital',
      'Português',
    ]);
    expect(
      textDef.details({
        ...text,
        homepage: 'https://exemplo.org/t1',
        scientific_divulgation: true,
      }),
    ).toEqual(
      expect.arrayContaining([
        { label: 'Divulgação científica', value: 'Sim' },
        {
          label: 'Página do texto',
          value: 'https://exemplo.org/t1',
          href: 'https://exemplo.org/t1',
        },
      ]),
    );

    const work = {
      id: 'w1',
      title: 'Trabalho',
      year: 2023,
      nature: 'RESUMO_EXPANDIDO',
      event_name: 'Congresso X',
      event_classification: 'INTERNACIONAL',
    };
    const workDef = PRODUCTION_REGISTRY.event_work;
    expect(workDef.itemColor(work)).toBe(PRODUCTION_COLORS['trabalho-evento']);
    expect(workDef.subtitle(work)).toBe('Congresso X');
    expect(workDef.tags(work).map((tag) => tag.label)).toEqual([
      'Resumo expandido',
      'Internacional',
    ]);
    expect(
      workDef.details({
        ...work,
        proceedings_title: 'Anais X',
        start_page: '10',
        end_page: '14',
      }),
    ).toEqual(
      expect.arrayContaining([
        { label: 'Anais', value: 'Anais X' },
        { label: 'Páginas', value: '10–14' },
        { label: 'Classificação do evento', value: 'Internacional' },
      ]),
    );
  });
});
