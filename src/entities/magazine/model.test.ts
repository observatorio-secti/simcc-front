import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  DetailData,
  DetailResponse,
  ListItem,
  ListResponse,
  QueryOf,
  Schemas,
} from '@/api/types';
import { FALLBACK_COLOR, QUALIS_COLORS } from '@/shared/lib/design-tokens';
import {
  MAGAZINE_SORT_OPTIONS,
  formatIssn,
  formatJcr,
  formatMagazineName,
  interpretQualis,
  safeExternalHref,
  type Magazine,
  type MagazineDetail,
  type MagazineDetailResponse,
  type MagazineListResponse,
  type MagazineQuery,
  type MagazineRefData,
} from './model';

describe('tipos derivados de magazine', () => {
  it('derivam diretamente de simcc-v2.d.ts', () => {
    expectTypeOf<Magazine>().toEqualTypeOf<Schemas['Magazine']>();
    expectTypeOf<Magazine>().toEqualTypeOf<ListItem<'/magazine'>>();
    expectTypeOf<MagazineDetail>().toEqualTypeOf<
      DetailData<'/magazine/{magazine_id}'>
    >();
    expectTypeOf<MagazineRefData>().toEqualTypeOf<Schemas['MagazineRef']>();
    expectTypeOf<MagazineQuery>().toEqualTypeOf<QueryOf<'/magazine'>>();
    expectTypeOf<MagazineListResponse>().toEqualTypeOf<
      ListResponse<'/magazine'>
    >();
    expectTypeOf<MagazineDetailResponse>().toEqualTypeOf<
      DetailResponse<'/magazine/{magazine_id}'>
    >();
  });

  it('expõe opções de ordenação aceitas por /magazine', () => {
    expect(MAGAZINE_SORT_OPTIONS.map((option) => option.value)).toEqual([
      'name',
      'jcr',
    ]);
  });
});

describe('formatIssn', () => {
  it('formata ISSN de 8 caracteres com hífen e dígito X maiúsculo', () => {
    expect(formatIssn('12345678')).toBe('1234-5678');
    expect(formatIssn('1234567x')).toBe('1234-567X');
    expect(formatIssn(' 0028-0836 ')).toBe('0028-0836');
    expect(formatIssn('0028 083x')).toBe('0028-083X');
  });

  it('preserva formatos não padrão e devolve null para ausência', () => {
    expect(formatIssn('1234-5678 / 9876-5432')).toBe('1234-5678 / 9876-5432');
    expect(formatIssn(null)).toBeNull();
    expect(formatIssn(undefined)).toBeNull();
    expect(formatIssn('')).toBeNull();
    expect(formatIssn('   ')).toBeNull();
    expect(formatIssn('None')).toBeNull();
  });
});

describe('formatJcr', () => {
  it('formata JCR numérico em pt-BR', () => {
    expect(formatJcr(4.25)).toBe('4,25');
    expect(formatJcr(12.345)).toBe('12,345');
    expect(formatJcr(1234.5)).toBe('1.234,5');
    expect(formatJcr(0)).toBe('0');
  });

  it('devolve null para valores ausentes ou inválidos', () => {
    expect(formatJcr(null)).toBeNull();
    expect(formatJcr(undefined)).toBeNull();
    expect(formatJcr(Number.NaN)).toBeNull();
    expect(formatJcr(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('formatMagazineName e safeExternalHref', () => {
  it('aplica fallback para nome ausente', () => {
    expect(formatMagazineName('  Nature  ')).toBe('Nature');
    expect(formatMagazineName(null)).toBe('Revista não informada');
    expect(formatMagazineName('')).toBe('Revista não informada');
    expect(formatMagazineName('None')).toBe('Revista não informada');
  });

  it('aceita apenas URLs http/https válidas para jcr_link', () => {
    expect(safeExternalHref('https://jcr.clarivate.com/journal/123')).toBe(
      'https://jcr.clarivate.com/journal/123',
    );
    expect(safeExternalHref('http://exemplo.br/jcr')).toBe(
      'http://exemplo.br/jcr',
    );
    expect(safeExternalHref('javascript:alert(1)')).toBeNull();
    expect(safeExternalHref('nao-e-url')).toBeNull();
    expect(safeExternalHref(null)).toBeNull();
  });
});

describe('interpretQualis', () => {
  it('interpreta estratos escuros avaliados com os tokens do kit', () => {
    expect(interpretQualis({ qualis: 'A1', qualis_status: null })).toEqual({
      status: 'rated',
      stratum: 'A1',
      key: 'A1',
      color: QUALIS_COLORS.A1,
      label: 'Qualis A1',
      shortLabel: 'A1',
      isLight: false,
    });
    expect(
      interpretQualis({ qualis: 'B2', qualis_status: null }),
    ).toMatchObject({
      status: 'rated',
      stratum: 'B2',
      key: 'B2',
      color: QUALIS_COLORS.B2,
      isLight: false,
    });
    expect(interpretQualis({ qualis: 'C', qualis_status: null })).toMatchObject(
      {
        status: 'rated',
        stratum: 'C',
        key: 'C',
        color: QUALIS_COLORS.C,
        isLight: false,
      },
    );
  });

  it('marca estratos claros (A3, A4) para não receberem texto branco', () => {
    expect(interpretQualis({ qualis: 'A3', qualis_status: null })).toEqual({
      status: 'rated',
      stratum: 'A3',
      key: 'A3',
      color: QUALIS_COLORS.A3,
      label: 'Qualis A3',
      shortLabel: 'A3',
      isLight: true,
    });
    expect(interpretQualis({ qualis: 'A4', qualis_status: null }).isLight).toBe(
      true,
    );
  });

  it('trata B5 como avaliado mantendo rótulo e cor neutra sem token no kit', () => {
    expect(interpretQualis({ qualis: 'B5', qualis_status: null })).toEqual({
      status: 'rated',
      stratum: 'B5',
      key: null,
      color: FALLBACK_COLOR,
      label: 'Qualis B5',
      shortLabel: 'B5',
      isLight: true,
    });
    expect(interpretQualis('b5').stratum).toBe('B5');
  });

  it('diferencia not_rated/SQ de not_applicable usando qualis_status', () => {
    expect(
      interpretQualis({ qualis: null, qualis_status: 'not_rated' }),
    ).toEqual({
      status: 'not_rated',
      stratum: null,
      key: 'SQ',
      color: QUALIS_COLORS.SQ,
      label: 'Sem Qualis',
      shortLabel: 'SQ',
      isLight: false,
    });

    expect(
      interpretQualis({ qualis: null, qualis_status: 'not_applicable' }),
    ).toEqual({
      status: 'not_applicable',
      stratum: null,
      key: 'SQ',
      color: QUALIS_COLORS.SQ,
      label: 'Não se aplica',
      shortLabel: 'Não se aplica',
      isLight: false,
    });

    expect(interpretQualis({ qualis: null, qualis_status: null })).toEqual(
      interpretQualis({ qualis: null, qualis_status: 'not_rated' }),
    );
  });

  it('aceita valores de faceta/legado como string (SQ, NP, not_rated, not_applicable)', () => {
    expect(interpretQualis('SQ').status).toBe('not_rated');
    expect(interpretQualis('NP').key).toBe('SQ');
    expect(interpretQualis('not_rated').label).toBe('Sem Qualis');
    expect(interpretQualis('not_applicable').status).toBe('not_applicable');
    expect(interpretQualis(undefined).label).toBe('Sem Qualis');
    expect(interpretQualis('desconhecido')).toMatchObject({
      status: 'not_rated',
      key: null,
      color: FALLBACK_COLOR,
      isLight: true,
    });
  });
});
