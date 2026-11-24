import { describe, expect, it } from 'vitest';
import {
  isUuid,
  legacyInstitutionTab,
  legacyParams,
  legacyResultsToBusca,
  matchByAcronymOrName,
  matchByName,
  termsToQuery,
} from './legacy-params';

describe('termsToQuery', () => {
  it('converte `;` em e e `|` em ou, sem parênteses', () => {
    expect(termsToQuery('(solos;agua)|clima')).toBe('solos agua or clima');
    expect(termsToQuery(' redes ')).toBe('redes');
  });

  it('termo vazio vira undefined', () => {
    expect(termsToQuery('')).toBeUndefined();
    expect(termsToQuery(';|')).toBeUndefined();
    expect(termsToQuery(undefined)).toBeUndefined();
  });
});

describe('legacyParams', () => {
  it('volta listas e números do parser do router para texto', () => {
    const params = legacyParams({
      area: ['A', 'B'],
      year_start: 2020,
      open_access: true,
      empty: '',
    });
    expect(params.getAll('area')).toEqual(['A', 'B']);
    expect(params.get('year_start')).toBe('2020');
    expect(params.get('open_access')).toBe('true');
    expect(params.has('empty')).toBe(false);
  });
});

describe('resolução de identificadores', () => {
  it('reconhece UUID com ou sem hífens', () => {
    expect(isUuid('3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90')).toBe(true);
    expect(isUuid('3f2a9c1e5b7d4e8a9c217d4e5f6a8b90')).toBe(true);
    expect(isUuid('UFBA')).toBe(false);
    expect(isUuid('0273462762077753')).toBe(false);
  });

  it('casa sigla antes de nome, sem caixa nem acento', () => {
    const items = [
      { id: '1', acronym: null, name: 'Escola De Dança Da Ufba' },
      { id: '2', acronym: 'UFBA', name: 'Universidade Federal Da Bahia' },
    ];
    expect(matchByAcronymOrName(items, 'ufba')?.id).toBe('2');
    expect(matchByAcronymOrName(items, 'escola de danca da ufba')?.id).toBe(
      '1',
    );
    expect(matchByAcronymOrName(items, 'UFRB')).toBeUndefined();
  });

  it('casa nome de pesquisador exato', () => {
    const items = [{ id: '1', name: 'Ana Souza Lima' }];
    expect(matchByName(items, 'ANA SOUZA LIMA')?.id).toBe('1');
    expect(matchByName(items, 'Ana Souza')).toBeUndefined();
  });

  it('traduz a aba da instituição só quando existe', () => {
    expect(legacyInstitutionTab('programas_pos')).toBe('programs');
    expect(legacyInstitutionTab('docentes')).toBeUndefined();
    expect(legacyInstitutionTab('bolsistas')).toBeUndefined();
  });
});

describe('legacyResultsToBusca: territórios', () => {
  it('troca o nome do território pelo código SEI e mantém o desconhecido', () => {
    const search = legacyResultsToBusca(
      new URLSearchParams(
        'terms=solos&identity_territory=EXTREMO SUL&identity_territory=Atlântida',
      ),
    );
    expect(search.identity_territory).toEqual(['7', 'Atlântida']);
  });

  it('`tab=mapa` abre a visão de mapa da aba de pesquisadores', () => {
    const search = legacyResultsToBusca(
      new URLSearchParams('terms=solos&tab=mapa'),
    );
    expect(search.view).toBe('map');
    expect(search.tab).toBeUndefined();
  });
});
