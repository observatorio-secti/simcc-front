import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { areaColor, qualisColor } from '@/shared/lib/design-tokens';
import {
  FacetPanel,
  FacetSheet,
  FacetSidebar,
  type FacetsMap,
} from './facet-panel';

const SAMPLE_FACETS: FacetsMap = {
  area: {
    param: 'area',
    total: 3,
    items: [
      {
        value: 'Engenharias',
        label: 'Engenharias',
        count: 1204,
        selected: false,
      },
      {
        value: 'Ciências da Saúde',
        label: 'Ciências da Saúde',
        count: 64,
        selected: false,
      },
    ],
  },
  institution: {
    param: 'institution_id',
    total: 2,
    items: [
      {
        value: 'ufba-id',
        label: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
        count: 520,
        selected: true,
      },
      {
        value: 'uesc-id',
        label: 'Universidade Estadual de Santa Cruz',
        acronym: 'UESC',
        count: 120,
        selected: false,
      },
    ],
  },
  qualis: {
    param: 'qualis',
    total: 2,
    items: [
      { value: 'A1', label: 'A1', count: 80, selected: false },
      { value: 'B1', label: 'B1', count: 35, selected: false },
    ],
  },
  year: {
    param: ['year_start', 'year_end'],
    total: 3,
    items: [
      { value: '2024', label: '2024', count: 40, selected: false },
      { value: '2021', label: '2021', count: 25, selected: false },
      { value: '2018', label: '2018', count: 12, selected: false },
    ],
  },
};

describe('FacetPanel', () => {
  it('renderiza qualquer FacetResult da v2 com contagem tabular-nums e Dot externo', async () => {
    const user = userEvent.setup();

    render(
      <FacetPanel
        facets={{
          ...SAMPLE_FACETS,
          custom_tag: {
            param: 'custom_tag',
            total: 1,
            items: [
              { value: 'x', label: 'Especial', count: 9, selected: false },
            ],
          },
        }}
        values={{ institution_id: ['ufba-id'] }}
        defaultOpen={['area', 'institution', 'qualis', 'year', 'custom_tag']}
        config={{
          area: {
            dotClassName: (value) => areaColor(value).bg,
          },
          qualis: {
            dotClassName: (value) => qualisColor(value).bg,
          },
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Filtros' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Grandes áreas do conhecimento'),
    ).toBeInTheDocument();
    expect(screen.getByText('Instituições')).toBeInTheDocument();
    expect(screen.getByText('Qualis')).toBeInTheDocument();
    expect(screen.getByText('Ano')).toBeInTheDocument();
    // Faceta desconhecida é humanizada automaticamente.
    expect(screen.getByText('Custom tag')).toBeInTheDocument();

    // Formatação pt-BR com tabular-nums.
    const countEl = screen.getByText('1.204');
    expect(countEl).toHaveClass('tabular-nums');

    // Dot vindo do dicionário via config externa.
    const engenhariasRow = screen.getByLabelText('Engenharias').closest('div')!;
    expect(engenhariasRow.querySelector('[data-slot="dot"]')).toHaveClass(
      'bg-area-engenharias',
    );

    // Accordion type="multiple": clicar no trigger recolhe só a seção clicada.
    await user.click(screen.getByRole('button', { name: /Qualis/i }));
    expect(screen.queryByLabelText('A1')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Engenharias')).toBeInTheDocument();
  });

  it('usa facet.param ao alternar checkboxes e emite patch para busca/URL', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <FacetPanel
        facets={SAMPLE_FACETS}
        values={{ institution_id: ['ufba-id'] }}
        defaultOpen={['institution']}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
      />,
    );

    const ufbaCheckbox = screen.getByRole('checkbox', {
      name: 'Universidade Federal da Bahia',
    });
    const uescCheckbox = screen.getByRole('checkbox', {
      name: 'Universidade Estadual de Santa Cruz',
    });

    expect(ufbaCheckbox).toBeChecked();
    expect(uescCheckbox).not.toBeChecked();

    // Marca segunda instituição: deve usar `institution_id` (de `facet.param`).
    await user.click(uescCheckbox);
    expect(onFilterChange).toHaveBeenLastCalledWith('institution_id', [
      'ufba-id',
      'uesc-id',
    ]);
    expect(onSearchChange).toHaveBeenLastCalledWith({
      institution_id: ['ufba-id', 'uesc-id'],
    });

    // Desmarca a única instituição marcada: remove o parâmetro (`undefined`).
    await user.click(ufbaCheckbox);
    expect(onFilterChange).toHaveBeenLastCalledWith('institution_id', []);
    expect(onSearchChange).toHaveBeenLastCalledWith({
      institution_id: undefined,
    });
  });

  it('converte a faceta year em filtro de intervalo (year_start / year_end)', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <FacetPanel
        facets={SAMPLE_FACETS}
        values={{ year_start: 2020, year_end: 2023 }}
        defaultOpen={['year']}
        onRangeChange={onRangeChange}
        onSearchChange={onSearchChange}
      />,
    );

    const startInput = screen.getByLabelText('Ano inicial');
    const endInput = screen.getByLabelText('Ano final');
    expect(startInput).toHaveValue(2020);
    expect(endInput).toHaveValue(2023);
    expect(screen.getByText('Disponível: 2018–2024')).toBeInTheDocument();

    // Envia intervalo invertido e confirma normalização min..max.
    await user.clear(startInput);
    await user.type(startInput, '2024');
    await user.clear(endInput);
    await user.type(endInput, '2019');
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onRangeChange).toHaveBeenLastCalledWith({
      startParam: 'year_start',
      endParam: 'year_end',
      start: 2019,
      end: 2024,
    });
    expect(onSearchChange).toHaveBeenLastCalledWith({
      year_start: 2019,
      year_end: 2024,
    });
    expect(startInput).toHaveValue(2019);
    expect(endInput).toHaveValue(2024);

    // Limpar período remove ambos parâmetros.
    await user.click(screen.getByRole('button', { name: 'Limpar período' }));
    expect(onSearchChange).toHaveBeenLastCalledWith({
      year_start: undefined,
      year_end: undefined,
    });
  });

  it('exibe botão limpar filtros quando há filtros ativos e suporta busca local', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(
      <FacetPanel
        facets={{
          institution: {
            param: 'institution_id',
            total: 6,
            items: [
              { value: '1', label: 'UFBA', count: 100 },
              { value: '2', label: 'UESC', count: 90 },
              { value: '3', label: 'UNEB', count: 80 },
              { value: '4', label: 'UEFS', count: 70 },
              { value: '5', label: 'UFRB', count: 60 },
              { value: '6', label: 'IFBA', count: 50 },
            ],
          },
        }}
        values={{ institution_id: ['1'] }}
        defaultOpen={['institution']}
        config={{ institution: { searchable: true } }}
        onClear={onClear}
      />,
    );

    await user.type(screen.getByLabelText('Filtrar opções'), 'uesc');
    expect(screen.getByLabelText('UESC')).toBeInTheDocument();
    expect(screen.queryByLabelText('UFBA')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renderiza coluna lateral de 260px no desktop e Sheet no mobile', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <>
        <FacetSidebar>
          <FacetPanel facets={SAMPLE_FACETS} />
        </FacetSidebar>
        <FacetSheet
          open={false}
          onOpenChange={onOpenChange}
          facets={SAMPLE_FACETS}
        />
      </>,
    );

    const aside = screen.getByRole('complementary', { name: 'Filtros' });
    expect(aside).toHaveClass('w-[260px]', 'lg:block', 'hidden');

    rerender(
      <FacetSheet
        open
        onOpenChange={onOpenChange}
        facets={SAMPLE_FACETS}
        values={{ area: ['Engenharias'] }}
        defaultOpen={['area']}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Filtros')).toBeInTheDocument();
    expect(
      within(dialog).getByRole('checkbox', { name: 'Engenharias' }),
    ).toBeChecked();

    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renderiza estado de carregamento', () => {
    const { container } = render(<FacetPanel loading />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('quebra rótulos longos sem truncar com reticências em listas curtas e com rolagem', () => {
    const longLabel =
      'Instituto Federal de Educação, Ciência e Tecnologia da Bahia';
    const manyItems = Array.from({ length: 10 }, (_, index) => ({
      value: `inst-${index}`,
      label: index === 0 ? longLabel : `Instituição ${index + 1}`,
      count: 100 - index,
    }));

    render(
      <FacetPanel
        facets={{
          institution: {
            param: 'institution_id',
            total: manyItems.length,
            items: manyItems,
          },
        }}
        defaultOpen={['institution']}
      />,
    );

    const labelEl = screen.getByText(longLabel);
    expect(labelEl).toHaveClass('break-words');
    expect(labelEl).not.toHaveClass('truncate');
    expect(labelEl.parentElement).toHaveClass('items-start');
  });

  it('trata defaultValues de intervalo como estado padrão e restaura ao limpar', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    const { rerender } = render(
      <FacetPanel
        facets={SAMPLE_FACETS}
        values={{ year_start: 2016 }}
        defaultValues={{ year_start: 2016 }}
        defaultOpen={['year']}
        onClear={vi.fn()}
        onSearchChange={onSearchChange}
      />,
    );

    expect(screen.getByLabelText('Ano inicial')).toHaveValue(2016);
    expect(
      screen.queryByRole('button', { name: 'Limpar filtros' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Limpar período' }),
    ).not.toBeInTheDocument();

    rerender(
      <FacetPanel
        facets={SAMPLE_FACETS}
        values={{ year_start: 2012, year_end: 2022 }}
        defaultValues={{ year_start: 2016 }}
        defaultOpen={['year']}
        onClear={vi.fn()}
        onSearchChange={onSearchChange}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Limpar filtros' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar período' }));
    expect(onSearchChange).toHaveBeenLastCalledWith({
      year_start: 2016,
      year_end: undefined,
    });
  });
});
