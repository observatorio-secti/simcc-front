import { describe, expect, expectTypeOf, it } from 'vitest';
import type { Schemas } from '@/api/types';
import {
  INSTITUTION_LOGOS,
  INSTITUTION_SORT_OPTIONS,
  formatInstitutionCount,
  formatInstitutionName,
  getInstitutionLogo,
  institutionPath,
  resolveInstitutionAcronym,
  stripAcronymFromName,
  type InstitutionCounts,
  type InstitutionDetail,
  type InstitutionFilters,
  type InstitutionSummary,
} from './model';

describe('tipos derivados do OpenAPI', () => {
  it('espelham os schemas da v2 sem duplicação manual', () => {
    expectTypeOf<InstitutionSummary>().toEqualTypeOf<
      Schemas['InstitutionRef']
    >();
    expectTypeOf<InstitutionDetail>().toEqualTypeOf<
      Schemas['InstitutionDetail']
    >();
    expectTypeOf<InstitutionCounts>().toEqualTypeOf<
      Schemas['InstitutionCounts']
    >();
    expectTypeOf<InstitutionFilters>().toEqualTypeOf<
      Schemas['InstitutionFilter']
    >();
  });
});

describe('resolveInstitutionAcronym', () => {
  it('prioriza a sigla explícita normalizada', () => {
    expect(
      resolveInstitutionAcronym({
        acronym: ' ufba ',
        name: 'Universidade Federal da Bahia',
      }),
    ).toBe('UFBA');
  });

  it('mapeia sigla legada quando o campo acronym traz o nome completo', () => {
    expect(
      resolveInstitutionAcronym({
        acronym: 'Fundação Oswaldo Cruz',
        name: 'FIOCRUZ - Fundação Oswaldo Cruz',
      }),
    ).toBe('FIOCRUZ');
  });

  it('infere a sigla pelo nome completo ou prefixo quando acronym é nulo', () => {
    expect(
      resolveInstitutionAcronym({
        acronym: null,
        name: 'Universidade Estadual De Santa Cruz',
      }),
    ).toBe('UESC');
    expect(
      resolveInstitutionAcronym({
        acronym: null,
        name: 'Instituto Federal De Educação, Ciência E Tecnologia Da Bahia',
      }),
    ).toBe('IFBA');
    expect(
      resolveInstitutionAcronym({
        acronym: null,
        name: 'SENAI – Serviço Nacional de Aprendizagem Industrial',
      }),
    ).toBe('SENAI');
    expect(
      resolveInstitutionAcronym({
        acronym: null,
        name: 'Universidade do Porto (UPORTO)',
      }),
    ).toBe('UPORTO');
  });

  it('devolve null quando não há sigla nem correspondência conhecida', () => {
    expect(
      resolveInstitutionAcronym({
        acronym: null,
        name: 'Instituto Baiano de Pesquisa Aplicada',
      }),
    ).toBeNull();
  });
});

describe('getInstitutionLogo', () => {
  it('mapeia todas as 11 instituições da Bahia e suas variantes escuras', () => {
    const withDark = [
      'UFBA',
      'EBMSP',
      'UESB',
      'UFOB',
      'UFSB',
      'UEFS',
      'UFRB',
      'UNEB',
      'FIOCRUZ',
    ] as const;

    for (const acronym of withDark) {
      const logo = getInstitutionLogo(acronym);
      expect(logo?.acronym).toBe(acronym);
      expect(logo?.light).toBeTruthy();
      expect(logo?.dark).toBeTruthy();
    }

    const uesc = getInstitutionLogo('UESC');
    expect(uesc?.acronym).toBe('UESC');
    expect(uesc?.light).toBeTruthy();
    expect(uesc?.dark).toBeUndefined();

    const ifba = getInstitutionLogo('IFBA');
    expect(ifba?.acronym).toBe('IFBA');
    expect(ifba?.light).toBeTruthy();
    expect(ifba?.lightSurface).toBe(true);
    expect(Object.keys(INSTITUTION_LOGOS)).toHaveLength(11);
  });

  it('aceita nome completo sem sigla e devolve null para desconhecida', () => {
    expect(
      getInstitutionLogo({
        acronym: null,
        name: 'Universidade Federal do Recôncavo da Bahia',
      })?.acronym,
    ).toBe('UFRB');
    expect(
      getInstitutionLogo({
        acronym: 'CIMATEC',
        name: 'Centro Universitário SENAI CIMATEC',
      }),
    ).toBeNull();
    expect(getInstitutionLogo(null)).toBeNull();
  });
});

describe('formatadores de instituição', () => {
  it('normaliza preposições portuguesas sem alterar siglas ou caixa alta', () => {
    expect(formatInstitutionName('Universidade Estadual De Santa Cruz')).toBe(
      'Universidade Estadual de Santa Cruz',
    );
    expect(
      formatInstitutionName('Escola Bahiana De Medicina E Saúde Pública'),
    ).toBe('Escola Bahiana de Medicina e Saúde Pública');
    expect(formatInstitutionName('UFBA - Universidade Federal Da Bahia')).toBe(
      'UFBA - Universidade Federal da Bahia',
    );
    expect(formatInstitutionName('UNIVERSIDADE FEDERAL DA BAHIA')).toBe(
      'UNIVERSIDADE FEDERAL DA BAHIA',
    );
    expect(formatInstitutionName('   ')).toBe('');
  });

  it('remove prefixo ou sufixo redundante da sigla', () => {
    expect(
      stripAcronymFromName('UFBA - Universidade Federal Da Bahia', 'UFBA'),
    ).toBe('Universidade Federal da Bahia');
    expect(
      stripAcronymFromName(
        'Universidade Estadual de Santa Cruz (UESC)',
        'UESC',
      ),
    ).toBe('Universidade Estadual de Santa Cruz');
    expect(stripAcronymFromName('UFBA', 'UFBA')).toBe('UFBA');
  });

  it('formata contagens em pt-BR e fallback para nulo', () => {
    expect(formatInstitutionCount(0)).toBe('0');
    expect(formatInstitutionCount(2450)).toBe('2.450');
    expect(formatInstitutionCount(null)).toBe('—');
  });

  it('expõe opções de ordenação alinhadas ao OpenAPI', () => {
    expect(INSTITUTION_SORT_OPTIONS.map((o) => o.value)).toEqual([
      'name',
      'acronym',
    ]);
  });

  it('constrói o caminho de detalhe respeitando BASE_URL', () => {
    expect(institutionPath('inst 1/2')).toMatch(
      /\/instituicoes\/inst%201%2F2$/,
    );
  });
});
