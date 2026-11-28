import { describe, expect, it } from 'vitest';
import {
  extractAffiliationCities,
  formatAffiliationAcronyms,
  formatAffiliationNames,
  formatCount,
  formatDegreeLabel,
  formatEducationStatus,
  formatEvidenceCount,
  formatLattesUpdate,
  lattesProfileUrl,
  linkedinSearchUrl,
  normalizeOrcid,
  normalizeResearcherText,
  openAlexProfileUrl,
  orcidProfileUrl,
  researcherHref,
  researcherInitials,
  scopusProfileUrl,
  splitHighlightSegments,
  type ResearcherAffiliation,
} from './model';

const sampleAffiliations: ResearcherAffiliation[] = [
  {
    institution: {
      id: 'inst-1',
      name: 'Universidade Federal da Bahia',
      acronym: 'UFBA',
    },
    city: { id: 'city-1', name: 'Salvador' },
    identity_territory: 'Metropolitano de Salvador',
    workload: 40,
  },
  {
    institution: {
      id: 'inst-2',
      name: 'Universidade Estadual de Santa Cruz',
      acronym: 'UESC',
    },
    city: { id: 'city-2', name: 'Ilhéus' },
  },
  {
    institution: {
      id: 'inst-1-dup',
      name: 'Universidade Federal da Bahia',
      acronym: 'UFBA',
    },
    city: { id: 'city-1', name: 'Salvador' },
  },
];

describe('researcherHref', () => {
  it('monta o caminho para o perfil respeitando encodeURIComponent', () => {
    expect(researcherHref('abc-123')).toMatch(/\/pesquisadores\/abc-123$/);
    expect(researcherHref('a/b c')).toMatch(/\/pesquisadores\/a%2Fb%20c$/);
  });
});

describe('researcherInitials', () => {
  it('extrai iniciais do primeiro e último nome', () => {
    expect(researcherInitials('Helena Duarte Ramos')).toBe('HR');
    expect(researcherInitials('  Caio   Barreto ')).toBe('CB');
    expect(researcherInitials('Maria')).toBe('MA');
    expect(researcherInitials('')).toBe('?');
  });
});

describe('afiliações e cidades', () => {
  it('formata siglas únicas separadas por barra com fallback para nome', () => {
    expect(formatAffiliationAcronyms(sampleAffiliations)).toBe('UFBA / UESC');
    expect(
      formatAffiliationAcronyms([
        { institution: { id: '1', name: 'Instituto Sem Sigla', acronym: '' } },
      ]),
    ).toBe('Instituto Sem Sigla');
    expect(formatAffiliationAcronyms([])).toBe('');
  });

  it('formata nomes completos e extrai cidades únicas', () => {
    expect(formatAffiliationNames(sampleAffiliations)).toBe(
      'Universidade Federal da Bahia · Universidade Estadual de Santa Cruz',
    );
    expect(extractAffiliationCities(sampleAffiliations)).toEqual([
      'Salvador',
      'Ilhéus',
    ]);
    expect(
      extractAffiliationCities([
        {
          institution: { id: '1', name: 'Inst' },
          city: { id: '0', name: 'None' },
        },
      ]),
    ).toEqual([]);
  });
});

describe('formatLattesUpdate', () => {
  it('formata datas ISO 8601 e preserva DD/MM/AAAA', () => {
    expect(formatLattesUpdate('2026-10-22T03:00:00Z')).toBe('22/10/2026');
    expect(formatLattesUpdate('2026-01-05')).toBe('05/01/2026');
    expect(formatLattesUpdate('14/08/2025')).toBe('14/08/2025');
    expect(formatLattesUpdate(null)).toBeNull();
    expect(formatLattesUpdate('None')).toBeNull();
  });
});

describe('contagens e evidências', () => {
  it('formata contagens e singular/plural de evidências em pt-BR', () => {
    expect(formatCount(1234)).toBe('1.234');
    expect(formatEvidenceCount(1)).toBe('1 evidência');
    expect(formatEvidenceCount(1200)).toBe('1.200 evidências');
  });
});

describe('formação acadêmica', () => {
  it('traduz os níveis do Lattes para pt-BR', () => {
    expect(formatDegreeLabel('DOCTORATE')).toBe('Doutorado');
    expect(formatDegreeLabel('MASTERS-DEGREE')).toBe('Mestrado');
    expect(formatDegreeLabel('UNDERGRADUATE')).toBe('Graduação');
    expect(formatDegreeLabel('SPECIALIZATION')).toBe('Especialização');
    expect(formatDegreeLabel('POST-DOCTORATE')).toBe('Pós-Doutorado');
    expect(formatDegreeLabel('technical course')).toBe('Curso técnico');
  });

  it('preserva valores já traduzidos ou desconhecidos', () => {
    expect(formatDegreeLabel('Doutorado')).toBe('Doutorado');
    expect(formatDegreeLabel('OUTRO-NIVEL')).toBe('OUTRO-NIVEL');
    expect(formatDegreeLabel(null)).toBeNull();
  });

  it('traduz a situação da formação acadêmica', () => {
    expect(formatEducationStatus('CONCLUIDO')).toBe('Concluído');
    expect(formatEducationStatus('EM_ANDAMENTO')).toBe('Em andamento');
    expect(formatEducationStatus('IN PROGRESS')).toBe('Em andamento');
    expect(formatEducationStatus('Concluído')).toBe('Concluído');
    expect(formatEducationStatus('OUTRO')).toBe('OUTRO');
    expect(formatEducationStatus('')).toBeNull();
  });
});

describe('identificadores externos', () => {
  it('normaliza ORCID em dígitos ou URL e rejeita valores inválidos', () => {
    expect(normalizeOrcid('0000-0001-2345-678x')).toBe('0000-0001-2345-678X');
    expect(normalizeOrcid('https://orcid.org/0000-0001-2345-6789')).toBe(
      '0000-0001-2345-6789',
    );
    expect(normalizeOrcid('0000000123456789')).toBe('0000-0001-2345-6789');
    expect(normalizeOrcid('0')).toBeNull();
    expect(normalizeOrcid('')).toBeNull();
    expect(orcidProfileUrl('0000-0001-2345-6789')).toBe(
      'https://orcid.org/0000-0001-2345-6789',
    );
  });

  it('monta URLs de Scopus, Lattes, OpenAlex e LinkedIn', () => {
    expect(scopusProfileUrl('57200012345')).toBe(
      'https://www.scopus.com/authid/detail.uri?authorId=57200012345',
    );
    expect(scopusProfileUrl('https://www.scopus.com/authid/foo')).toBe(
      'https://www.scopus.com/authid/foo',
    );
    expect(scopusProfileUrl('0')).toBeNull();

    expect(lattesProfileUrl('1234567890123456')).toBe(
      'https://lattes.cnpq.br/1234567890123456',
    );
    expect(lattesProfileUrl('')).toBeNull();

    expect(openAlexProfileUrl('A12345')).toBe('https://openalex.org/A12345');
    expect(linkedinSearchUrl('Helena Duarte')).toBe(
      'https://www.linkedin.com/search/results/people/?keywords=Helena%20Duarte',
    );
  });
});

describe('normalizeResearcherText e splitHighlightSegments', () => {
  it('remove HTML e decodifica entidades comuns', () => {
    expect(
      normalizeResearcherText(
        '<p>Pesquisa em &quot;Robótica&quot; &amp; IA.</p>',
      ),
    ).toBe('Pesquisa em "Robótica" & IA.');
    expect(normalizeResearcherText('None')).toBe('');
  });

  it('destaca termos ignorando acentos e caixa preservando texto original', () => {
    expect(
      splitHighlightSegments(
        'Atua em Robótica móvel e visão computacional.',
        'robotica visao',
      ),
    ).toEqual([
      { text: 'Atua em ', highlighted: false },
      { text: 'Robótica', highlighted: true },
      { text: ' móvel e ', highlighted: false },
      { text: 'visão', highlighted: true },
      { text: ' computacional.', highlighted: false },
    ]);
  });

  it('lida com termos vazios ou caracteres especiais de expressão regular', () => {
    expect(splitHighlightSegments('Texto simples', '')).toEqual([
      { text: 'Texto simples', highlighted: false },
    ]);
    expect(splitHighlightSegments('Linguagem C++ (avançado).', 'c++')).toEqual([
      { text: 'Linguagem ', highlighted: false },
      { text: 'C++', highlighted: true },
      { text: ' (avançado).', highlighted: false },
    ]);
  });
});
