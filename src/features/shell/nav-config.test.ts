import { describe, expect, it } from 'vitest';
import { isActive, PLATFORM_NAV_SECTIONS, QUICK_NAV_ITEMS } from './nav-config';

describe('isActive', () => {
  it('ativa a raiz apenas em correspondência exata', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/', '/?q=ia')).toBe(true);
    expect(isActive('/', '/busca')).toBe(false);
    expect(isActive('/', '/instituicoes')).toBe(false);
  });

  it('ativa rotas exatas e suas subrotas', () => {
    expect(isActive('/instituicoes', '/instituicoes')).toBe(true);
    expect(isActive('/instituicoes', '/instituicoes/')).toBe(true);
    expect(isActive('/instituicoes', '/instituicoes/ufba')).toBe(true);
    expect(isActive('/instituicoes', '/instituicoes/ufba/programas')).toBe(
      true,
    );
    expect(isActive('/busca', '/busca?q=saude#resultados')).toBe(true);
  });

  it('não confunde prefixos parciais fora da fronteira de segmento', () => {
    expect(isActive('/indicadores', '/indicadores-novos')).toBe(false);
    expect(isActive('/busca', '/buscador')).toBe(false);
    expect(isActive('/pos-graduacao', '/pos-graduacao-teste')).toBe(false);
  });
});

describe('nav-config', () => {
  it('não inclui rotas descontinuadas', () => {
    const allUrls = [
      ...QUICK_NAV_ITEMS.map((item) => item.url),
      ...PLATFORM_NAV_SECTIONS.flatMap((section) =>
        section.items.map((item) => item.url),
      ),
    ];

    const discontinued = [
      '/videos',
      '/termos-uso',
      '/politica-privacidade',
      '/api-docs',
      '/informacoes',
      '/dicionario-cores',
      '/observatorio',
      '/tv',
      '/sobre',
      '/provimento-cargo',
      '/producoes-recentes',
    ];

    for (const path of discontinued) {
      expect(allUrls).not.toContain(path);
    }

    expect(allUrls).toContain('/busca');
    expect(allUrls).toContain('/instituicoes');
    expect(allUrls).toContain('/paineis-dados-externos');
  });
});

describe('isActive com exact (menu do console)', () => {
  it('a visão geral do console não fica ativa nas subrotas', () => {
    expect(isActive('/console', '/console', { exact: true })).toBe(true);
    expect(isActive('/console', '/console/admins', { exact: true })).toBe(
      false,
    );
    expect(isActive('/console/admins', '/console/admins?q=ana')).toBe(true);
  });
});
