import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import L from 'leaflet';
import { describe, expect, it, vi } from 'vitest';
import type { FacetResult } from '@/api/types';
import type { TerritoryGeoJson } from '../geo';
import { territoryKeys } from '../queries';
import { TerritoryDetailPanel } from './territory-detail-panel';
import TerritoryMap from './territory-map';

const testGeoJson: TerritoryGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: '2913606',
        name: 'Ilhéus',
        territorio_id: '5',
        territorio_identidade: 'LITORAL SUL',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-39.1, -14.8],
            [-39.0, -14.8],
            [-39.0, -14.7],
            [-39.1, -14.7],
            [-39.1, -14.8],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: '2927408',
        name: 'Salvador',
        territorio_id: '26',
        territorio_identidade: 'METROPOLITANA DE SALVADOR',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-38.5, -13.0],
            [-38.4, -13.0],
            [-38.4, -12.9],
            [-38.5, -12.9],
            [-38.5, -13.0],
          ],
        ],
      },
    },
  ],
};

const testFacet: FacetResult = {
  param: ['identity_territory', 'city_code'],
  total: 2,
  covered: 12,
  items: [
    {
      value: '26',
      code: 26,
      label: 'METROPOLITANA DE SALVADOR',
      count: 8,
      selected: false,
      children: [
        {
          value: '2927408',
          code: 2927408,
          label: 'Salvador',
          count: 8,
          selected: false,
        },
      ],
    },
    {
      value: '5',
      code: 5,
      label: 'LITORAL SUL',
      count: 4,
      selected: false,
      children: [
        {
          value: '2913606',
          code: 2913606,
          label: 'Ilhéus',
          count: 4,
          selected: false,
        },
      ],
    },
  ],
};

function renderMap(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(territoryKeys.geoJson(), testGeoJson);
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe('TerritoryMap', () => {
  it('centraliza o território ao clicar, exibe cidades com contagem e permite voltar para toda a Bahia', async () => {
    const user = userEvent.setup();
    const setViewSpy = vi.spyOn(L.Map.prototype, 'setView');

    renderMap(
      <TerritoryMap
        facet={testFacet}
        noun={['pesquisador', 'pesquisadores']}
        listTitle="Territórios com pesquisadores"
        renderSelectionPanel={({
          selection,
          onBackToTerritories,
          onBackToTerritory,
          onSelectCity,
        }) => (
          <TerritoryDetailPanel
            selection={selection}
            onBackToTerritories={onBackToTerritories}
            onBackToTerritory={onBackToTerritory}
            onSelectCity={onSelectCity}
            noun={['pesquisador', 'pesquisadores']}
            onPageChange={vi.fn()}
          >
            <p>
              Conteúdo:{' '}
              {selection.kind === 'territory' ? selection.code : selection.ibge}
            </p>
          </TerritoryDetailPanel>
        )}
      />,
    );

    setViewSpy.mockClear();
    await user.click(screen.getByRole('button', { name: /Litoral Sul/ }));

    expect(screen.getByText('Conteúdo: 5')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ver toda a Bahia' }),
    ).toBeInTheDocument();
    expect(setViewSpy).toHaveBeenCalledTimes(1);
    const [center, zoomArg] = setViewSpy.mock.calls[0]!;
    expect((center as L.LatLng).lat).toBeCloseTo(-14.75, 1);
    expect((center as L.LatLng).lng).toBeCloseTo(-39.05, 1);
    expect(zoomArg).toBeGreaterThanOrEqual(8);

    await user.click(screen.getByRole('button', { name: /Ilhéus/ }));
    expect(screen.getByText('Conteúdo: 2913606')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Territórios' }));

    expect(screen.queryByText('Conteúdo: 2913606')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Metropolitana de Salvador/ }),
    ).toBeInTheDocument();

    setViewSpy.mockRestore();
  });

  it('mantém callback legado onToggleTerritory quando renderSelectionPanel não é informado', async () => {
    const user = userEvent.setup();
    const onToggleTerritory = vi.fn();

    renderMap(
      <TerritoryMap
        facet={testFacet}
        noun={['programa', 'programas']}
        onToggleTerritory={onToggleTerritory}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Litoral Sul/ }));
    expect(onToggleTerritory).toHaveBeenCalledWith('5');
  });

  it('renderiza navegação hierárquica território -> município no TerritoryDetailPanel', async () => {
    const user = userEvent.setup();
    const onBackToTerritories = vi.fn();
    const onBackToTerritory = vi.fn();

    render(
      <TerritoryDetailPanel
        selection={{
          kind: 'city',
          ibge: '2913606',
          label: 'Ilhéus',
          territoryCode: '5',
          territoryLabel: 'LITORAL SUL',
          count: 4,
        }}
        onBackToTerritories={onBackToTerritories}
        onBackToTerritory={onBackToTerritory}
        noun={['pesquisador', 'pesquisadores']}
        onPageChange={vi.fn()}
      >
        <div>Item da cidade</div>
      </TerritoryDetailPanel>,
    );

    expect(screen.getByRole('heading', { name: 'Ilhéus' })).toBeInTheDocument();
    expect(screen.getByText('4 pesquisadores')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Litoral Sul' }));
    expect(onBackToTerritory).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Territórios' }));
    expect(onBackToTerritories).toHaveBeenCalledTimes(1);
  });
});
