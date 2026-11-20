import { describe, expect, it } from 'vitest';
import {
  locationLabel,
  modalityLabel,
  programDisplayName,
  programHref,
  programSiteUrl,
  programStartLabel,
  ratingLabel,
  researchLinePeriod,
  researcherCountLabel,
} from './model';

describe('programHref', () => {
  it('aponta para o detalhe em /pos-graduacao', () => {
    expect(programHref('abc-123')).toBe('/pos-graduacao/abc-123');
    expect(programHref('a/b')).toBe('/pos-graduacao/a%2Fb');
  });
});

describe('programDisplayName', () => {
  it('junta a sigla quando houver', () => {
    expect(programDisplayName({ name: 'Educação', acronym: 'PPGE' })).toBe(
      'Educação (PPGE)',
    );
    expect(programDisplayName({ name: 'Educação', acronym: ' ' })).toBe(
      'Educação',
    );
    expect(programDisplayName({ name: 'Educação', acronym: null })).toBe(
      'Educação',
    );
  });
});

describe('modalityLabel', () => {
  it('converte a caixa alta da v2 em sentence case', () => {
    expect(modalityLabel('ACADÊMICO')).toBe('Acadêmico');
    expect(modalityLabel('ACADEMICO')).toBe('Acadêmico');
    expect(modalityLabel('PROFISSIONAL')).toBe('Profissional');
    expect(modalityLabel('EM REDE')).toBe('Em rede');
  });

  it('devolve null sem valor', () => {
    expect(modalityLabel(null)).toBeNull();
    expect(modalityLabel('  ')).toBeNull();
  });
});

describe('ratingLabel', () => {
  it('formata o conceito CAPES', () => {
    expect(ratingLabel('5')).toBe('Conceito 5');
    expect(ratingLabel(undefined)).toBeNull();
  });
});

describe('locationLabel', () => {
  it('junta cidade e UF', () => {
    expect(locationLabel({ city: 'Ilhéus', state: 'BA' })).toBe('Ilhéus, BA');
    expect(locationLabel({ city: null, state: 'BA' })).toBe('BA');
    expect(locationLabel({ city: 'Ilhéus' })).toBe('Ilhéus');
    expect(locationLabel({})).toBeNull();
  });
});

describe('researcherCountLabel', () => {
  it('flexiona e formata o número', () => {
    expect(researcherCountLabel(0)).toBe('Nenhum pesquisador');
    expect(researcherCountLabel(1)).toBe('1 pesquisador');
    expect(researcherCountLabel(1204)).toBe('1.204 pesquisadores');
  });
});

describe('researchLinePeriod', () => {
  it('descreve o período da linha', () => {
    expect(researchLinePeriod({ start_year: 2010, end_year: 2020 })).toBe(
      '2010–2020',
    );
    expect(researchLinePeriod({ start_year: 2010, end_year: 2010 })).toBe(
      '2010',
    );
    expect(researchLinePeriod({ start_year: 2010, end_year: null })).toBe(
      'Desde 2010',
    );
    expect(researchLinePeriod({ end_year: 2020 })).toBe('Até 2020');
    expect(researchLinePeriod({})).toBeNull();
  });
});

describe('programStartLabel', () => {
  it('formata a data de início sem deslocar o fuso', () => {
    expect(programStartLabel('2015-08-01')).toBe('agosto de 2015');
    expect(programStartLabel('2015-08')).toBe('agosto de 2015');
  });

  it('mantém valor que não é data e ignora vazio', () => {
    expect(programStartLabel('2º semestre')).toBe('2º semestre');
    expect(programStartLabel(null)).toBeNull();
  });
});

describe('programSiteUrl', () => {
  it('completa o protocolo de endereços sem ele', () => {
    expect(programSiteUrl('www.uesc.br/ppgmc')).toBe(
      'https://www.uesc.br/ppgmc',
    );
    expect(programSiteUrl('http://www.usp.br')).toBe('http://www.usp.br/');
  });

  it('recusa protocolos que não são http(s)', () => {
    expect(programSiteUrl('javascript:alert(1)')).toBeNull();
    expect(programSiteUrl('mailto:a@b.br')).toBeNull();
    expect(programSiteUrl('')).toBeNull();
  });
});
