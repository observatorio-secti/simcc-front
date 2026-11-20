import { describe, expect, it } from 'vitest';
import {
  formatIssn,
  formatJcr,
  isValidIssn,
  issnPortalUrl,
  qualisLabel,
} from './model';

describe('qualisLabel', () => {
  it('mostra o estrato', () => {
    expect(qualisLabel({ qualis: 'A1', qualis_status: null })).toBe(
      'Qualis A1',
    );
    expect(qualisLabel({ qualis: 'B5' })).toBe('Qualis B5');
  });

  it('mostra o motivo da ausência', () => {
    expect(qualisLabel({ qualis: null, qualis_status: 'not_rated' })).toBe(
      'Sem Qualis',
    );
    expect(qualisLabel({ qualis: null, qualis_status: 'not_applicable' })).toBe(
      'Qualis não se aplica',
    );
  });

  it('sem estrato nem motivo conta como "Sem Qualis"', () => {
    expect(qualisLabel({ qualis: null, qualis_status: null })).toBe(
      'Sem Qualis',
    );
    expect(qualisLabel({})).toBe('Sem Qualis');
  });
});

describe('formatJcr', () => {
  it('formata em pt-BR com 1 a 3 casas', () => {
    expect(formatJcr(4.5)).toBe('4,5');
    expect(formatJcr(122.7)).toBe('122,7');
    expect(formatJcr(3)).toBe('3,0');
    expect(formatJcr(2.3456)).toBe('2,346');
  });

  it('devolve null sem valor', () => {
    expect(formatJcr(null)).toBeNull();
    expect(formatJcr(undefined)).toBeNull();
    expect(formatJcr(Number.NaN)).toBeNull();
  });
});

describe('ISSN', () => {
  it('valida o dígito verificador', () => {
    expect(isValidIssn('20531583')).toBe(true);
    expect(isValidIssn('0140-6736')).toBe(true);
    expect(isValidIssn('1474547x')).toBe(true);
    expect(isValidIssn('20531584')).toBe(false);
    expect(isValidIssn('1474547')).toBe(false);
    expect(isValidIssn(null)).toBe(false);
  });

  it('formata com hífen só quando tem oito caracteres', () => {
    expect(formatIssn('20531583')).toBe('2053-1583');
    expect(formatIssn(' 1474547x ')).toBe('1474-547X');
    expect(formatIssn('1981030')).toBe('1981030');
    expect(formatIssn('')).toBeNull();
    expect(formatIssn(null)).toBeNull();
  });

  it('só gera link do portal para ISSN válido', () => {
    expect(issnPortalUrl('01406736')).toBe(
      'https://portal.issn.org/resource/ISSN/0140-6736',
    );
    expect(issnPortalUrl('20531584')).toBeNull();
    expect(issnPortalUrl(undefined)).toBeNull();
  });
});
