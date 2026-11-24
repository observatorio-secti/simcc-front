import { describe, expect, it } from 'vitest';
import { fileSlug, toCsv } from './download';

describe('fileSlug', () => {
  it('tira acentos e pontuação', () => {
    expect(fileSlug('Bolsas iniciadas por ano (2021–2024)')).toBe(
      'bolsas-iniciadas-por-ano-2021-2024',
    );
  });

  it('usa o padrão quando não sobra nada', () => {
    expect(fileSlug('—', 'grafico')).toBe('grafico');
  });
});

describe('toCsv', () => {
  it('usa ponto e vírgula, vírgula decimal e BOM', () => {
    const csv = toCsv(
      [
        { key: 'nome', label: 'Território' },
        { key: 'valor', label: 'Valor' },
      ],
      [
        { nome: 'Recôncavo', valor: 1.5 },
        { nome: 'Sul; "Litoral"', valor: null },
      ],
    );
    expect(csv).toBe(
      '﻿Território;Valor\r\nRecôncavo;1,5\r\n"Sul; ""Litoral""";\r\n',
    );
  });
});
