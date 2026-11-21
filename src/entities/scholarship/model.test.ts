import { describe, expect, it } from 'vitest';
import {
  formatScholarshipLevel,
  formatScholarshipModality,
  formatScholarshipQuantities,
  scholarshipModalityColor,
  scholarshipModalityKey,
} from './model';

describe('scholarshipModalityKey', () => {
  it('reconhece os nomes de modalidade da v2 e as siglas', () => {
    expect(scholarshipModalityKey('Produtividade em Pesquisa - 2')).toBe('PQ');
    expect(
      scholarshipModalityKey(
        'Produtividade Desen. Tec. e Extensão Inovadora - C',
      ),
    ).toBe('DT');
    expect(scholarshipModalityKey('PQ-1A')).toBe('PQ');
    expect(scholarshipModalityKey('DT 2')).toBe('DT');
    expect(scholarshipModalityKey('Iniciação científica')).toBeNull();
    expect(scholarshipModalityKey(null)).toBeNull();
  });

  it('usa as classes do tema bolsa-* e a neutra fora do dicionário', () => {
    expect(scholarshipModalityColor('Produtividade em Pesquisa - 1A').bg).toBe(
      'bg-bolsa-PQ',
    );
    expect(
      scholarshipModalityColor('Produtividade Desen. Tec. - B').borderLeft,
    ).toBe('border-l-bolsa-DT');
    expect(scholarshipModalityColor(undefined).bg).toBe('bg-neutral-400');
  });
});

describe('formatação', () => {
  it('tira o nível repetido do fim da modalidade', () => {
    expect(
      formatScholarshipModality({
        modality: 'Produtividade em Pesquisa - 1A',
        category_level: '1A',
        funding_program: null,
      }),
    ).toBe('Produtividade em Pesquisa');
    expect(
      formatScholarshipModality({
        modality: 'Produtividade em Pesquisa',
        category_level: '2',
        funding_program: null,
      }),
    ).toBe('Produtividade em Pesquisa');
    expect(
      formatScholarshipModality({
        modality: null,
        category_level: null,
        funding_program: 'Bolsas no País',
      }),
    ).toBe('Bolsas no País');
    expect(
      formatScholarshipModality({
        modality: ' ',
        category_level: null,
        funding_program: null,
      }),
    ).toBe('Bolsa');
  });

  it('formata nível e quantidades em pt-BR', () => {
    expect(formatScholarshipLevel('1A')).toBe('Nível 1A');
    expect(formatScholarshipLevel('  ')).toBeNull();
    expect(
      formatScholarshipQuantities({ scholarship_quantity: 1, aid_quantity: 2 }),
    ).toBe('1 bolsa · 2 auxílios');
    expect(
      formatScholarshipQuantities({
        scholarship_quantity: null,
        aid_quantity: 0,
      }),
    ).toBeNull();
  });
});
