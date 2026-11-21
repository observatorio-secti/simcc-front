import { describe, expect, it } from 'vitest';
import { buildBreadcrumbs } from './breadcrumbs';

describe('buildBreadcrumbs', () => {
  it('retorna apenas Página inicial quando está na raiz', () => {
    expect(
      buildBreadcrumbs([
        { routeId: '__root__', pathname: '/' },
        { routeId: '/_public', pathname: '/' },
        {
          routeId: '/_public/',
          pathname: '/',
          staticData: { crumb: 'Página inicial' },
        },
      ]),
    ).toEqual([{ href: '/', label: 'Página inicial' }]);
  });

  it('adiciona Página inicial antes das rotas filhas usando staticData.crumb', () => {
    expect(
      buildBreadcrumbs([
        { routeId: '__root__', pathname: '/' },
        { routeId: '/_public', pathname: '/pos-graduacao' },
        {
          routeId: '/_public/pos-graduacao',
          pathname: '/pos-graduacao',
          staticData: { crumb: 'Pós-graduação' },
        },
      ]),
    ).toEqual([
      { href: '/', label: 'Página inicial' },
      { href: '/pos-graduacao', label: 'Pós-graduação' },
    ]);
  });

  it('monta cadeia hierárquica completa sem exibir slug cru quando falta crumb', () => {
    expect(
      buildBreadcrumbs([
        { routeId: '__root__', pathname: '/' },
        {
          routeId: '/_public/instituicoes',
          pathname: '/instituicoes',
          staticData: { crumb: 'Instituições' },
        },
        {
          routeId: '/_public/instituicoes/$id',
          pathname: '/instituicoes/ufba-123',
        },
      ]),
    ).toEqual([
      { href: '/', label: 'Página inicial' },
      { href: '/instituicoes', label: 'Instituições' },
    ]);
  });

  it('mapeia _public para a raiz e evita duplicatas consecutivas', () => {
    expect(
      buildBreadcrumbs([
        {
          routeId: '/_public',
          pathname: '/busca',
          staticData: { crumb: 'Página inicial' },
        },
        {
          routeId: '/_public/',
          pathname: '/',
          staticData: { crumb: 'Página inicial' },
        },
      ]),
    ).toEqual([{ href: '/', label: 'Página inicial' }]);
  });
});
