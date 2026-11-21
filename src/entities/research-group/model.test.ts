import { afterEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_COLOR } from '@/shared/lib/design-tokens';
import {
  formatGroupCount,
  formatGroupLeaders,
  formatGroupLocation,
  formatGroupStatus,
  formatLinesLabel,
  formatMembersLabel,
  researchGroupDgpUrl,
  researchGroupHref,
  resolveGroupArea,
} from './model';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('researchGroupHref & researchGroupDgpUrl', () => {
  it('monta o link interno respeitando BASE_URL', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(researchGroupHref('grp-1')).toBe('/grupos-pesquisa/grp-1');

    vi.stubEnv('BASE_URL', '/simcc/');
    expect(researchGroupHref('grp/1')).toBe('/simcc/grupos-pesquisa/grp%2F1');
  });

  it('monta URL do espelho DGP CNPq apenas quando há dgpId válido', () => {
    expect(researchGroupDgpUrl('123456')).toBe(
      'https://dgp.cnpq.br/dgp/espelhogrupo/123456',
    );
    expect(researchGroupDgpUrl('  ')).toBeNull();
    expect(researchGroupDgpUrl(null)).toBeNull();
  });
});

describe('resolveGroupArea', () => {
  it('resolve grande área escura e grande área clara do kit', () => {
    const saude = resolveGroupArea({
      area: 'Ciências da Saúde',
      knowledgeArea: null,
      knowledgeAreas: [],
    });
    expect(saude?.color.bg).toBe('bg-area-saude');
    expect(saude?.color.light).toBeUndefined();
    expect(saude?.matched).toBe(true);

    const exatas = resolveGroupArea({
      area: 'Ciências Exatas e da Terra',
      knowledgeArea: null,
      knowledgeAreas: [],
    });
    expect(exatas?.color.bg).toBe('bg-area-exatas');
    expect(exatas?.color.light).toBe(true);
    expect(exatas?.matched).toBe(true);
  });

  it('usa knowledgeArea como fallback de cor quando area é subárea específica', () => {
    const resolved = resolveGroupArea({
      area: 'Ciência da Computação',
      knowledgeArea: 'Ciências Exatas e da Terra',
      knowledgeAreas: ['Ciência da Computação'],
    });
    expect(resolved).toMatchObject({
      label: 'Ciência da Computação',
      matched: true,
      color: { bg: 'bg-area-exatas', light: true },
    });
  });

  it('devolve FALLBACK_COLOR quando não há correspondência e null quando vazia', () => {
    expect(
      resolveGroupArea({
        area: 'Área Interdisciplinar Especial',
        knowledgeArea: null,
        knowledgeAreas: [],
      }),
    ).toEqual({
      label: 'Área Interdisciplinar Especial',
      color: FALLBACK_COLOR,
      matched: false,
    });

    expect(
      resolveGroupArea({
        area: null,
        knowledgeArea: null,
        knowledgeAreas: [],
      }),
    ).toBeNull();
  });
});

describe('formatadores de grupo de pesquisa', () => {
  it('formata líderes deduplicados com indicador de excedentes', () => {
    expect(formatGroupLeaders([])).toBeNull();
    expect(formatGroupLeaders([{ name: 'Ana Souza' }])).toBe('Ana Souza');
    expect(
      formatGroupLeaders([
        { name: 'Ana Souza' },
        { name: 'ana souza' },
        { name: 'Bruno Lima' },
        { name: 'Carla Dias' },
      ]),
    ).toBe('Ana Souza, Bruno Lima (+1)');
  });

  it('formata situação cadastral, localização e contagens em pt-BR', () => {
    expect(formatGroupStatus('ATIVO')).toEqual({
      label: 'Ativo',
      isActive: true,
    });
    expect(formatGroupStatus('NAO_ATUALIZADO')).toEqual({
      label: 'Não atualizado',
      isActive: false,
    });
    expect(formatGroupStatus('NAO_ATUALIZADO_TEST')).toEqual({
      label: 'Nao atualizado test',
      isActive: false,
    });
    expect(formatGroupStatus(null)).toBeNull();

    expect(formatGroupLocation({ city: 'Ilhéus', state: 'BA' })).toBe(
      'Ilhéus - BA',
    );
    expect(formatGroupLocation({ city: 'Salvador', state: null })).toBe(
      'Salvador',
    );
    expect(formatGroupLocation({ city: null, state: null })).toBeNull();

    expect(formatGroupCount(1250)).toBe('1.250');
    expect(formatMembersLabel(1)).toBe('1 membro');
    expect(formatMembersLabel(12)).toBe('12 membros');
    expect(formatLinesLabel(1)).toBe('1 linha de pesquisa');
    expect(formatLinesLabel(4)).toBe('4 linhas de pesquisa');
  });
});
