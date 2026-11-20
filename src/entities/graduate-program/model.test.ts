import { afterEach, describe, expect, it, vi } from 'vitest';
import { AREA_COLORS, FALLBACK_COLOR } from '@/shared/lib/design-tokens';
import {
  cleanProgramText,
  formatCapesRating,
  formatCount,
  formatInstitutionLabel,
  formatProgramArea,
  formatProgramLocation,
  formatProgramModality,
  formatProgramType,
  formatResearchLinePeriod,
  formatResearchLinesCount,
  formatResearchersCount,
  isActiveResearchLine,
  parseCapesRating,
  programHref,
  resolveProgramAreaColor,
} from './model';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('programHref', () => {
  it('monta a URL respeitando BASE_URL com ou sem barra final e codifica o id', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(programHref('prog-1')).toBe('/pos-graduacao/prog-1');

    vi.stubEnv('BASE_URL', '/simcc/');
    expect(programHref('prog/1')).toBe('/simcc/pos-graduacao/prog%2F1');

    vi.stubEnv('BASE_URL', '/simcc');
    expect(programHref('prog-2')).toBe('/simcc/pos-graduacao/prog-2');
  });
});

describe('cleanProgramText', () => {
  it('remove espaços extras e trata sentinelas como null', () => {
    expect(cleanProgramText('  PGCOMP   UFBA  ')).toBe('PGCOMP UFBA');
    expect(cleanProgramText('')).toBeNull();
    expect(cleanProgramText('   ')).toBeNull();
    expect(cleanProgramText('none')).toBeNull();
    expect(cleanProgramText('NULL')).toBeNull();
    expect(cleanProgramText('undefined')).toBeNull();
    expect(cleanProgramText(null)).toBeNull();
  });
});

describe('conceito CAPES', () => {
  it('extrai valor numérico válido entre 1 e 7', () => {
    expect(parseCapesRating('5')).toBe(5);
    expect(parseCapesRating('Conceito 7')).toBe(7);
    expect(parseCapesRating('Nota 4')).toBe(4);
    expect(parseCapesRating('A')).toBeNull();
    expect(parseCapesRating('9')).toBeNull();
    expect(parseCapesRating('none')).toBeNull();
  });

  it('formata conceito CAPES em pt-BR', () => {
    expect(formatCapesRating('5')).toBe('Conceito 5');
    expect(formatCapesRating('Conceito 6')).toBe('Conceito 6');
    expect(formatCapesRating('a')).toBe('Conceito A');
    expect(formatCapesRating(null)).toBeNull();
  });
});

describe('modalidade e tipo', () => {
  it('normaliza rótulos de modalidade em sentence case', () => {
    expect(formatProgramModality('ACADÊMICO')).toBe('Acadêmico');
    expect(formatProgramModality('profissional')).toBe('Profissional');
    expect(formatProgramModality('EAD')).toBe('A distância');
    expect(formatProgramModality('A DISTÂNCIA')).toBe('A distância');
    expect(formatProgramModality('Misto Especial')).toBe('Misto Especial');
    expect(formatProgramModality('')).toBeNull();
  });

  it('normaliza tipos de curso', () => {
    expect(formatProgramType('MESTRADO')).toBe('Mestrado');
    expect(formatProgramType('MESTRADO/DOUTORADO')).toBe(
      'Mestrado e doutorado',
    );
    expect(formatProgramType('DOUTORADO PROFISSIONAL')).toBe(
      'Doutorado profissional',
    );
    expect(formatProgramType(undefined)).toBeNull();
  });
});

describe('área e cor semântica', () => {
  it('formata áreas em caixa alta preservando algarismos romanos', () => {
    expect(formatProgramArea('CIÊNCIA DA COMPUTAÇÃO')).toBe(
      'Ciência da computação',
    );
    expect(formatProgramArea('ENGENHARIA III')).toBe('Engenharia III');
    expect(formatProgramArea('MEDICINA II')).toBe('Medicina II');
    expect(formatProgramArea('Ciência da Computação')).toBe(
      'Ciência da Computação',
    );
    expect(formatProgramArea('null')).toBeNull();
  });

  it('resolve cores de grande área diretamente e via áreas CAPES sem confundir regras específicas', () => {
    expect(resolveProgramAreaColor('Ciências da Saúde')).toEqual(
      AREA_COLORS.saude,
    );
    expect(resolveProgramAreaColor('CIÊNCIA DA COMPUTAÇÃO')).toEqual(
      AREA_COLORS.exatas,
    );
    expect(resolveProgramAreaColor('CIÊNCIA DA COMPUTAÇÃO').light).toBe(true);
    expect(resolveProgramAreaColor('ENGENHARIA III')).toEqual(
      AREA_COLORS.engenharias,
    );
    expect(resolveProgramAreaColor('EDUCAÇÃO FÍSICA')).toEqual(
      AREA_COLORS.saude,
    );
    expect(resolveProgramAreaColor('EDUCAÇÃO')).toEqual(AREA_COLORS.humanas);
    expect(resolveProgramAreaColor('MEDICINA VETERINÁRIA')).toEqual(
      AREA_COLORS.agrarias,
    );
    expect(resolveProgramAreaColor('MEDICINA I')).toEqual(AREA_COLORS.saude);
    expect(resolveProgramAreaColor('INTERDISCIPLINAR')).toEqual(
      AREA_COLORS.outros,
    );
    expect(resolveProgramAreaColor('Área Desconhecida')).toEqual(
      FALLBACK_COLOR,
    );
  });
});

describe('localização, instituição, contagens e vigência', () => {
  it('formata cidade e UF', () => {
    expect(formatProgramLocation('SALVADOR', 'ba')).toBe('Salvador, BA');
    expect(formatProgramLocation('FEIRA DE SANTANA', 'BA')).toBe(
      'Feira de Santana, BA',
    );
    expect(formatProgramLocation('Vitória da Conquista', null)).toBe(
      'Vitória da Conquista',
    );
    expect(formatProgramLocation(null, 'ba')).toBe('BA');
    expect(formatProgramLocation('', '')).toBeNull();
  });

  it('prioriza sigla da instituição e cai para nome ou fallback', () => {
    expect(
      formatInstitutionLabel({
        id: '1',
        name: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
      }),
    ).toBe('UFBA');
    expect(
      formatInstitutionLabel({
        id: '2',
        name: 'Instituto Sem Sigla',
        acronym: null,
      }),
    ).toBe('Instituto Sem Sigla');
    expect(formatInstitutionLabel(null, 'UESC')).toBe('UESC');
  });

  it('formata contagens em pt-BR com singular e plural', () => {
    expect(formatCount(1240)).toBe('1.240');
    expect(formatResearchersCount(0)).toBe('0 docentes');
    expect(formatResearchersCount(1)).toBe('1 docente');
    expect(formatResearchersCount(1042)).toBe('1.042 docentes');
    expect(formatResearchersCount(null)).toBeNull();
    expect(formatResearchLinesCount(1)).toBe('1 linha de pesquisa');
    expect(formatResearchLinesCount(5)).toBe('5 linhas de pesquisa');
  });

  it('formata período e identifica linhas ativas', () => {
    expect(formatResearchLinePeriod(2018, null)).toBe('2018 – atual');
    expect(formatResearchLinePeriod(2015, 2022)).toBe('2015 – 2022');
    expect(formatResearchLinePeriod(null, 2020)).toBe('Até 2020');
    expect(formatResearchLinePeriod(null, null)).toBeNull();

    expect(isActiveResearchLine({ start_year: 2018, end_year: null })).toBe(
      true,
    );
    expect(isActiveResearchLine({ start_year: 2018, end_year: 2023 })).toBe(
      false,
    );
    expect(isActiveResearchLine({ start_year: null, end_year: null })).toBe(
      false,
    );
  });
});
