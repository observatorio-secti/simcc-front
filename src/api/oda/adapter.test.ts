// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  adaptOdaGroup,
  adaptOdaGroupDetail,
  adaptOdaGroupList,
  adaptOdaGroupResearcher,
  adaptOdaGroupResearchers,
  cleanOdaText,
  firstOdaValue,
  formatInstitutionLabel,
  resolveOdaAssetUrl,
} from './adapter';
import {
  odaGroupDetailResponseSchema,
  odaGroupListResponseSchema,
  odaGroupResearchersResponseSchema,
  odaGroupSchema,
} from './schemas';

describe('cleanOdaText & firstOdaValue', () => {
  it('descarta strings vazias e marcadores nulos legados', () => {
    expect(cleanOdaText('  ')).toBeNull();
    expect(cleanOdaText('null')).toBeNull();
    expect(cleanOdaText('NaN')).toBeNull();
    expect(cleanOdaText('None')).toBeNull();
    expect(cleanOdaText('  UFBA  ')).toBe('UFBA');
  });

  it('extrai o primeiro valor válido de escalar ou array', () => {
    expect(firstOdaValue('123')).toBe('123');
    expect(firstOdaValue(['', null, '456', '789'])).toBe('456');
    expect(firstOdaValue([2015, 2020])).toBe(2015);
    expect(firstOdaValue([null, Number.NaN])).toBeNull();
    expect(firstOdaValue(undefined)).toBeNull();
  });
});

describe('formatInstitutionLabel', () => {
  it('evita duplicar a sigla quando o nome já a contém', () => {
    expect(formatInstitutionLabel('UFBA', 'UFBA')).toBe('UFBA');
    expect(
      formatInstitutionLabel('UFBA', 'UFBA - Universidade Federal da Bahia'),
    ).toBe('UFBA - Universidade Federal da Bahia');
    expect(
      formatInstitutionLabel('UFBA', 'UFBA Universidade Federal da Bahia'),
    ).toBe('UFBA - Universidade Federal da Bahia');
    expect(
      formatInstitutionLabel(
        'UESC',
        'Universidade Estadual de Santa Cruz (UESC)',
      ),
    ).toBe('UESC - Universidade Estadual de Santa Cruz');
    expect(
      formatInstitutionLabel('UNEB', 'Universidade do Estado da Bahia'),
    ).toBe('UNEB - Universidade do Estado da Bahia');
    expect(formatInstitutionLabel(null, 'Instituto Gonçalo Moniz')).toBe(
      'Instituto Gonçalo Moniz',
    );
    expect(formatInstitutionLabel('IFBA', null)).toBe('IFBA');
  });
});

describe('resolveOdaAssetUrl', () => {
  it('resolve URL relativa contra a base da ODA e preserva absoluta', () => {
    expect(
      resolveOdaAssetUrl(
        '/arquivos/foto.jpg',
        'https://observatoriocti.secti.ba.gov.br/oda/v1/',
      ),
    ).toBe('https://observatoriocti.secti.ba.gov.br/oda/v1/arquivos/foto.jpg');
    expect(
      resolveOdaAssetUrl(
        'https://cdn.exemplo.br/foto.jpg',
        'https://observatoriocti.secti.ba.gov.br/oda/v1/',
      ),
    ).toBe('https://cdn.exemplo.br/foto.jpg');
    expect(resolveOdaAssetUrl('null', 'https://oda.test/')).toBeNull();
  });
});

describe('schemas Zod da ODA e adaptadores', () => {
  const sampleOdaGroup = {
    id: 'grp-1',
    nome: 'Laboratório de Sistemas Distribuídos',
    areaPredominante: 'Ciências Exatas e da Terra',
    dgpId: ['1234567890'],
    anoFormacao: [2012],
    situacao: 'ATIVO',
    repercussao: 'Impacto regional em computação de alto desempenho.',
    email: ['lsd@ufba.br'],
    telefone: '71 3283-0000',
    website: ['https://lsd.ufba.br'],
    logradouro: 'Av. Adhemar de Barros',
    numero: 's/n',
    bairro: 'Ondina',
    cidade: ['Salvador'],
    uf: ['BA'],
    cep: '40170-110',
    latitude: [-13.001],
    longitude: -38.507,
    instituicoes: [
      {
        id: 'inst-parceira',
        nome: 'Universidade Estadual de Feira de Santana',
        sigla: 'UEFS',
        tipoRelacao: 'PARCEIRA',
      },
      {
        id: 'inst-sede',
        nome: 'Universidade Federal da Bahia',
        sigla: 'UFBA',
        tipoRelacao: 'SEDE',
        imageUrl: '/logos/ufba.png',
        unidade: { nome: 'Instituto de Computação', uf: 'BA' },
        estado: { id: '29', sigla: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
      },
    ],
    areaConhecimento: { nome: 'Ciências Exatas e da Terra' },
    areasConhecimento: [
      { nome: 'Ciência da Computação' },
      { nome: 'Ciências Exatas e da Terra' },
    ],
    membros: [
      { id: 'm-1', nome: 'Ana Souza', eLider: true, lattesId: '111' },
      { id: 'm-2', nome: 'Bruno Lima', eLider: false, lattesId: '222' },
      { id: 'm-3', nome: 'Carla Dias', eLider: true, lattesId: null },
      { id: 'm-empty', nome: '   ', eLider: false },
    ],
    linhasPesquisa: [
      { titulo: 'Sistemas Paralelos', objetivo: 'Escalabilidade em nuvem' },
      { titulo: 'Engenharia de Software', objetivo: null },
    ],
  };

  it('valida e adapta um grupo completo para o modelo limpo do front', () => {
    const parsed = odaGroupSchema.parse(sampleOdaGroup);
    const group = adaptOdaGroup(
      parsed,
      'https://observatoriocti.secti.ba.gov.br/oda/v1/',
    );

    expect(group).toMatchObject({
      id: 'grp-1',
      name: 'Laboratório de Sistemas Distribuídos',
      area: 'Ciências Exatas e da Terra',
      knowledgeArea: 'Ciências Exatas e da Terra',
      knowledgeAreas: ['Ciências Exatas e da Terra', 'Ciência da Computação'],
      dgpId: '1234567890',
      foundedYear: 2012,
      status: 'ATIVO',
      repercussion: 'Impacto regional em computação de alto desempenho.',
      institutionLabel: 'UFBA - Universidade Federal da Bahia',
      institutionAcronym: 'UFBA',
      memberCount: 3,
      researchLineCount: 2,
      contact: {
        email: 'lsd@ufba.br',
        phone: '71 3283-0000',
        website: 'https://lsd.ufba.br',
      },
      address: {
        street: 'Av. Adhemar de Barros',
        number: 's/n',
        neighborhood: 'Ondina',
        city: 'Salvador',
        state: 'BA',
        postalCode: '40170-110',
        latitude: -13.001,
        longitude: -38.507,
      },
    });
    expect(group.headquarters?.isHeadquarters).toBe(true);
    expect(group.headquarters?.imageUrl).toBe(
      'https://observatoriocti.secti.ba.gov.br/oda/v1/logos/ufba.png',
    );
    expect(group.partnerInstitutions).toHaveLength(1);
    expect(group.partnerInstitutions[0]?.acronym).toBe('UEFS');
    expect(group.leaders.map((leader) => leader.name)).toEqual([
      'Ana Souza',
      'Carla Dias',
    ]);
    expect(group.researchLines).toEqual([
      { title: 'Sistemas Paralelos', objective: 'Escalabilidade em nuvem' },
      { title: 'Engenharia de Software', objective: null },
    ]);
  });

  it('usa a primeira instituição como fallback quando nenhuma vem marcada como SEDE', () => {
    const parsed = odaGroupSchema.parse({
      id: 'grp-2',
      nome: 'Grupo de Bioinformática',
      instituicoes: [
        { id: 'i-1', nome: 'Instituto Gonçalo Moniz', sigla: 'Fiocruz' },
      ],
    });
    const group = adaptOdaGroup(parsed);
    expect(group.headquarters?.acronym).toBe('Fiocruz');
    expect(group.institutionLabel).toBe('Fiocruz - Instituto Gonçalo Moniz');
    expect(group.partnerInstitutions).toEqual([]);
  });

  it('aceita envelopes paginados, `{ items }` e array direto na lista', () => {
    const paginated = odaGroupListResponseSchema.parse({
      data: [sampleOdaGroup],
      meta: { page: 2, size: 50, totalItems: 120, totalPages: 3 },
    });
    expect(adaptOdaGroupList(paginated, 1, 100).meta).toEqual({
      page: 2,
      size: 50,
      totalItems: 120,
      totalPages: 3,
    });

    const arrayOnly = odaGroupListResponseSchema.parse([sampleOdaGroup]);
    expect(adaptOdaGroupList(arrayOnly, 1, 20)).toMatchObject({
      meta: { page: 1, size: 20, totalItems: 1, totalPages: 1 },
    });

    const itemsEnvelope = odaGroupListResponseSchema.parse({
      items: [sampleOdaGroup],
    });
    expect(adaptOdaGroupList(itemsEnvelope).items).toHaveLength(1);
  });

  it('aceita detalhe direto ou embrulhado em `{ data }`', () => {
    const direct = odaGroupDetailResponseSchema.parse(sampleOdaGroup);
    expect(adaptOdaGroupDetail(direct).id).toBe('grp-1');

    const wrapped = odaGroupDetailResponseSchema.parse({
      data: sampleOdaGroup,
    });
    expect(adaptOdaGroupDetail(wrapped).id).toBe('grp-1');
  });

  it('adapta pesquisadores do grupo e resolve foto relativa', () => {
    const payload = odaGroupResearchersResponseSchema.parse({
      data: [
        {
          id: 'r-1',
          nome: 'Ana Souza',
          formacaoAcademica: 'Doutorado',
          lattesId: '12345',
          orcidId: '0000-0001-2345-6789',
          imageUrl: '/pesquisadores/r-1.jpg',
          eLider: true,
        },
      ],
      meta: { page: 1, size: 100, totalItems: 1, totalPages: 1 },
    });
    const result = adaptOdaGroupResearchers(
      payload,
      1,
      100,
      'https://oda.test/oda/v1/',
    );
    expect(result.items).toEqual([
      {
        id: 'r-1',
        name: 'Ana Souza',
        graduation: 'Doutorado',
        lattesId: '12345',
        orcid: '0000-0001-2345-6789',
        imageUrl: 'https://oda.test/oda/v1/pesquisadores/r-1.jpg',
        isLeader: true,
      },
    ]);
    expect(
      adaptOdaGroupResearcher({ id: 'r-2', nome: 'João' }).graduation,
    ).toBeNull();
  });

  it('rejeita payloads inválidos no schema Zod', () => {
    expect(odaGroupSchema.safeParse({ id: '', nome: 'Grupo' }).success).toBe(
      false,
    );
    expect(
      odaGroupSchema.safeParse({ id: 'g-1', nome: 'Grupo', anoFormacao: 'abc' })
        .success,
    ).toBe(false);
    expect(
      odaGroupListResponseSchema.safeParse({ unexpected: [] }).success,
    ).toBe(false);
  });
});
