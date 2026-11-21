import { describe, expect, expectTypeOf, it } from 'vitest';
import type { DetailData, ListItem, QueryOf, Schemas } from '@/api/types';
import {
  PRODUCTION_ENDPOINTS,
  PRODUCTION_KINDS,
  doiUrl,
  formatAuthorsList,
  formatCountNoun,
  formatJcr,
  formatNatureLabel,
  formatPageRange,
  formatProjectStudents,
  formatQualisDetail,
  formatQualisLabel,
  formatStatusLabel,
  formatYearRange,
  normalizeProductionKind,
  researcherHref,
  safeHttpUrl,
  type ProductionDetailByKind,
  type ProductionKind,
  type ProductionQueryByKind,
  type ProductionSummaryByKind,
} from './model';

describe('tipos derivados do contrato OpenAPI v2', () => {
  it('cobre exatamente os 10 tipos de produção da v2', () => {
    expect(PRODUCTION_KINDS).toHaveLength(10);
    expectTypeOf<
      (typeof PRODUCTION_KINDS)[number]
    >().toEqualTypeOf<ProductionKind>();
    expect(Object.keys(PRODUCTION_ENDPOINTS)).toEqual([...PRODUCTION_KINDS]);
  });

  it('deriva resumos e detalhes diretamente de ListItem / DetailData', () => {
    expectTypeOf<ProductionSummaryByKind['article']>().toEqualTypeOf<
      ListItem<'/production/article'>
    >();
    expectTypeOf<ProductionSummaryByKind['book']>().toEqualTypeOf<
      ListItem<'/production/book'>
    >();
    expectTypeOf<ProductionSummaryByKind['book_chapter']>().toEqualTypeOf<
      ListItem<'/production/book-chapter'>
    >();
    expectTypeOf<ProductionSummaryByKind['software']>().toEqualTypeOf<
      ListItem<'/production/software'>
    >();
    expectTypeOf<ProductionSummaryByKind['patent']>().toEqualTypeOf<
      ListItem<'/production/patent'>
    >();
    expectTypeOf<ProductionSummaryByKind['event']>().toEqualTypeOf<
      ListItem<'/production/event'>
    >();
    expectTypeOf<ProductionSummaryByKind['research_project']>().toEqualTypeOf<
      ListItem<'/production/research-project'>
    >();
    expectTypeOf<ProductionSummaryByKind['brand']>().toEqualTypeOf<
      ListItem<'/production/brand'>
    >();
    expectTypeOf<ProductionSummaryByKind['guidance']>().toEqualTypeOf<
      ListItem<'/production/guidance'>
    >();
    expectTypeOf<ProductionSummaryByKind['report']>().toEqualTypeOf<
      ListItem<'/production/report'>
    >();

    expectTypeOf<ProductionDetailByKind['article']>().toEqualTypeOf<
      DetailData<'/production/article/{article_id}'>
    >();
    expectTypeOf<ProductionDetailByKind['research_project']>().toEqualTypeOf<
      DetailData<'/production/research-project/{project_id}'>
    >();
    expectTypeOf<ProductionDetailByKind['guidance']>().toEqualTypeOf<
      DetailData<'/production/guidance/{item_id}'>
    >();
    expectTypeOf<ProductionQueryByKind['article']>().toEqualTypeOf<
      QueryOf<'/production/article'>
    >();
    expectTypeOf<ProductionSummaryByKind['brand']>().toEqualTypeOf<
      Schemas['BrandSummary']
    >();
    expectTypeOf<ProductionDetailByKind['report']>().toEqualTypeOf<
      Schemas['ReportDetail']
    >();
  });
});

describe('helpers do modelo de produção', () => {
  it('normaliza slugs com hífen e caixa variada em normalizeProductionKind', () => {
    expect(normalizeProductionKind('article')).toBe('article');
    expect(normalizeProductionKind('book-chapter')).toBe('book_chapter');
    expect(normalizeProductionKind('RESEARCH-PROJECT')).toBe(
      'research_project',
    );
    expect(normalizeProductionKind(' guidance ')).toBe('guidance');
    expect(normalizeProductionKind('unknown')).toBeNull();
    expect(normalizeProductionKind(null)).toBeNull();
  });

  it('normaliza DOI e valida URLs externas seguras', () => {
    expect(doiUrl('10.1000/xyz')).toBe('https://doi.org/10.1000/xyz');
    expect(doiUrl('https://dx.doi.org/10.1000/xyz')).toBe(
      'https://doi.org/10.1000/xyz',
    );
    expect(doiUrl('doi:10.1000/xyz')).toBe('https://doi.org/10.1000/xyz');
    expect(doiUrl('   ')).toBeNull();

    expect(safeHttpUrl('https://exemplo.org/artigo')).toBe(
      'https://exemplo.org/artigo',
    );
    expect(safeHttpUrl('http://exemplo.org/pdf')).toBe(
      'http://exemplo.org/pdf',
    );
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('ftp://exemplo.org/file')).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
  });

  it('monta caminho público do pesquisador respeitando BASE_URL', () => {
    expect(researcherHref('abc-123')).toMatch(/\/pesquisadores\/abc-123$/);
  });

  it('formata períodos, páginas, contagens, JCR e Qualis', () => {
    expect(formatYearRange(2020, 2024)).toBe('2020–2024');
    expect(formatYearRange(2022, 2022)).toBe('2022');
    expect(formatYearRange(2023, null)).toBe('2023–atual');
    expect(formatYearRange(null, 2021)).toBe('até 2021');
    expect(formatYearRange(null, null)).toBeNull();

    expect(formatPageRange('10', '25')).toBe('10–25');
    expect(formatPageRange('10', '10')).toBe('10');
    expect(formatPageRange('10', null)).toBe('10');
    expect(formatPageRange(null, null)).toBeNull();

    expect(formatCountNoun(1, ['artigo', 'artigos'])).toBe('1 artigo');
    expect(formatCountNoun(1200, ['artigo', 'artigos'])).toBe('1.200 artigos');

    expect(formatJcr(3.7)).toBe('3,7');
    expect(formatJcr(null)).toBeNull();

    expect(formatQualisLabel({ qualis: 'A2' })).toBe('Qualis A2');
    expect(
      formatQualisLabel({ qualis: null, qualis_status: 'not_rated' }),
    ).toBe('Sem Qualis');
    expect(formatQualisLabel(null)).toBe('Sem Qualis');

    expect(formatQualisDetail({ qualis: 'A1' })).toBe('A1');
    expect(
      formatQualisDetail({ qualis: null, qualis_status: 'not_applicable' }),
    ).toBe('Não se aplica');
    expect(formatQualisDetail({ qualis: null })).toBe('Sem Qualis');
    expect(formatQualisDetail(null)).toBeNull();
  });

  it('formata status, naturezas, autores e discentes', () => {
    expect(formatStatusLabel('EM_ANDAMENTO')).toBe('Em andamento');
    expect(formatStatusLabel('CONCLUIDO')).toBe('Concluída');
    expect(formatStatusLabel('Em andamento')).toBe('Em andamento');
    expect(formatStatusLabel(null)).toBeNull();

    expect(formatNatureLabel('PESQUISA')).toBe('Pesquisa');
    expect(formatNatureLabel('EXTENSAO')).toBe('Extensão');
    expect(formatNatureLabel('Inovação')).toBe('Inovação');
    expect(formatNatureLabel('')).toBeNull();

    expect(
      formatAuthorsList(
        [{ name: 'Ana Silva' }, { name: 'João Costa' }],
        'SILVA, A.; COSTA, J.',
      ),
    ).toBe('Ana Silva; João Costa');
    expect(formatAuthorsList([], 'SILVA, A.')).toBe('SILVA, A.');
    expect(formatAuthorsList(undefined, null)).toBeNull();

    expect(
      formatProjectStudents({
        number_undergraduates: 3,
        number_specialists: 0,
        number_academic_masters: 2,
        number_phd: 1,
      }),
    ).toBe('Graduação: 3 · Mestrado: 2 · Doutorado: 1');
    expect(formatProjectStudents({})).toBeNull();
  });
});
