// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  AREA_COLORS,
  CHART_NEUTRAL_BG,
  FALLBACK_COLOR,
  GENDER_COLORS,
  INDEX_LEVEL_COLORS,
  ORIENTATION_COLORS,
  PRODUCTION_COLORS,
  QUALIS_COLORS,
  QUALIS_STATUS_COLORS,
  RUN_STATUS_COLORS,
  SCHOLARSHIP_COLORS,
  SEARCH_TYPE_COLORS,
  STATUS_COLORS,
  areaColor,
  areaKey,
  chartNeutralBg,
  eventNatureKey,
  genderKey,
  indexLevelColor,
  indexLevelKey,
  normalizeKey,
  orientationKey,
  productionKey,
  qualisColor,
  qualisFacetColor,
  qualisKey,
  qualisStatusKey,
  runStatusColor,
  runStatusKey,
  scholarshipKey,
  searchTypeColor,
  searchTypeKey,
  statusKey,
  type DictionaryColor,
} from './design-tokens';

const DICTIONARIES: Record<string, Record<string, DictionaryColor>> = {
  search: SEARCH_TYPE_COLORS,
  area: AREA_COLORS,
  qualis: QUALIS_COLORS,
  prod: PRODUCTION_COLORS,
  orient: ORIENTATION_COLORS,
  status: STATUS_COLORS,
  bolsa: SCHOLARSHIP_COLORS,
  gender: GENDER_COLORS,
  index: INDEX_LEVEL_COLORS,
  run: RUN_STATUS_COLORS,
};

// O tema é lido do disco: no Vitest, `import '...css?raw'` chega vazio (CSS
// desligado). O import dinâmico por variável evita depender dos tipos do Node
// no tsconfig do app, que só carrega `vite/client`.
const fsModule = 'node:fs';
const { readFileSync } = (await import(/* @vite-ignore */ fsModule)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
};
const themeCss = readFileSync(
  new URL('../../../design-kit/tokens/tailwind.css', import.meta.url),
  'utf8',
);

/** Cores declaradas no `@theme` do kit (`--color-area-saude` → `area-saude`). */
const themeColors = new Set(
  [...themeCss.matchAll(/--color-([\w-]+)\s*:/g)].map((match) => match[1]),
);

describe('dicionários de cor', () => {
  it.each(Object.entries(DICTIONARIES))(
    '%s usa classes completas com o mesmo token em bg, text e borda',
    (prefix, dictionary) => {
      for (const entry of Object.values(dictionary)) {
        const token = entry.bg.replace(/^bg-/, '');
        expect(token.startsWith(`${prefix}-`)).toBe(true);
        expect(entry.text).toBe(`text-${token}`);
        expect(entry.borderLeft).toBe(`border-l-${token}`);
        expect(entry.label.length).toBeGreaterThan(0);
      }
    },
  );

  it('toda classe aponta para uma cor que existe no tema do kit', () => {
    const tokens = [
      ...Object.values(DICTIONARIES).flatMap((dictionary) =>
        Object.values(dictionary).map((entry) => entry.bg),
      ),
      ...CHART_NEUTRAL_BG,
    ].map((className) => className.replace(/^bg-/, ''));

    const missing = tokens.filter((token) => !themeColors.has(token));
    expect(missing).toEqual([]);
  });

  it('cobre todas as cores de dicionário do tema', () => {
    const covered = new Set(
      [
        ...Object.values(DICTIONARIES).flatMap((dictionary) =>
          Object.values(dictionary).map((entry) => entry.bg),
        ),
        ...CHART_NEUTRAL_BG,
      ].map((className) => className.replace(/^bg-/, '')),
    );
    const dictionaryTokens = [...themeColors].filter((token) =>
      /^(search|area|prod|qualis|orient|status|bolsa|gender|chart-neutral|index)-/.test(
        token ?? '',
      ),
    );

    expect(dictionaryTokens.filter((token) => !covered.has(token!))).toEqual(
      [],
    );
  });

  it('a cor neutra não usa hex', () => {
    expect(Object.values(FALLBACK_COLOR).join(' ')).not.toMatch(/#|\[/);
  });
});

describe('normalizeKey', () => {
  it('remove acento, pontuação e caixa', () => {
    expect(normalizeKey('Linguística, Letras e Artes')).toBe(
      'LINGUISTICA LETRAS E ARTES',
    );
    expect(normalizeKey('CIENCIAS_DA_SAUDE')).toBe('CIENCIAS DA SAUDE');
    expect(normalizeKey(null)).toBe('');
  });
});

describe('searchTypeKey', () => {
  it('aceita as chaves do kit e os source_type da v2', () => {
    expect(searchTypeKey('article')).toBe('article');
    expect(searchTypeKey('book_chapter')).toBe('book');
    expect(searchTypeKey('event')).toBe('speaker');
    expect(searchTypeKey('area_specialty')).toBe('area');
    expect(searchTypeKey('maria')).toBe('maria');
  });

  it('devolve a cor neutra para tipo desconhecido', () => {
    expect(searchTypeKey('xyz')).toBeNull();
    expect(searchTypeColor('xyz')).toBe(FALLBACK_COLOR);
    expect(searchTypeColor('patent').bg).toBe('bg-search-patent');
  });
});

describe('areaKey', () => {
  it.each([
    ['CIÊNCIAS AGRÁRIAS', 'agrarias'],
    ['Ciências Exatas e da Terra', 'exatas'],
    ['CIENCIAS_DA_SAUDE', 'saude'],
    ['Ciências Humanas', 'humanas'],
    ['ciências biológicas', 'biologicas'],
    ['ENGENHARIAS', 'engenharias'],
    ['Ciências Sociais Aplicadas', 'sociais'],
    ['LINGUÍSTICA, LETRAS E ARTES', 'linguistica'],
    ['OUTROS', 'outros'],
  ] as const)('%s → %s', (value, key) => {
    expect(areaKey(value)).toBe(key);
  });

  it('valor vazio ou desconhecido usa a cor neutra', () => {
    expect(areaKey('')).toBeNull();
    expect(areaKey(undefined)).toBeNull();
    expect(areaColor('Astrologia')).toBe(FALLBACK_COLOR);
    expect(areaColor('Ciências da Saúde').bg).toBe('bg-area-saude');
  });
});

describe('qualisKey', () => {
  it('aceita os estratos com o nome do token', () => {
    expect(qualisKey('A1')).toBe('A1');
    expect(qualisKey('b2')).toBe('B2');
    expect(qualisKey('C')).toBe('C');
    expect(qualisColor('A1').borderLeft).toBe('border-l-qualis-A1');
  });

  it('trata a ausência de Qualis como SQ', () => {
    expect(qualisKey(null)).toBe('SQ');
    expect(qualisKey('not_rated')).toBe('SQ');
    expect(qualisKey('not_applicable')).toBe('SQ');
    expect(qualisKey('NP')).toBe('SQ');
    expect(qualisKey('SQ')).toBe('SQ');
  });

  it('not_rated vira "Sem estrato" na faceta, com a cor SQ do kit', () => {
    expect(qualisStatusKey('not_rated')).toBe('not_rated');
    expect(qualisStatusKey('A1')).toBeNull();
    expect(qualisFacetColor('not_rated')).toMatchObject({
      label: 'Sem estrato',
      bg: QUALIS_COLORS.SQ.bg,
    });
    expect(qualisFacetColor('not_applicable').label).toBe('Não se aplica');
    for (const entry of Object.values(QUALIS_STATUS_COLORS)) {
      expect(entry.text).toBe(QUALIS_COLORS.SQ.text);
      expect(entry.borderLeft).toBe(QUALIS_COLORS.SQ.borderLeft);
    }
    expect(qualisFacetColor('A2')).toBe(QUALIS_COLORS.A2);
  });

  it('B5 ainda não tem cor no kit', () => {
    expect(qualisKey('B5')).toBeNull();
    expect(qualisColor('B5')).toBe(FALLBACK_COLOR);
  });
});

describe('productionKey', () => {
  it('converte o kind da v2', () => {
    expect(productionKey('article')).toBe('artigo');
    expect(productionKey('book')).toBe('livro');
    expect(productionKey('book_chapter')).toBe('capitulo');
    expect(productionKey('book-chapter')).toBe('capitulo');
    expect(productionKey('patent')).toBe('patente');
    expect(productionKey('software')).toBe('software');
    expect(productionKey('brand')).toBe('marca');
    expect(productionKey('report')).toBe('relatorio');
    expect(productionKey('magazine_text')).toBe('texto-revista');
    expect(productionKey('magazine-text')).toBe('texto-revista');
    expect(productionKey('event_work')).toBe('trabalho-evento');
  });

  it('aceita a chave do kit', () => {
    expect(productionKey('livro-capitulo')).toBe('livro-capitulo');
  });

  it('kinds sem cor própria devolvem null', () => {
    expect(productionKey('event')).toBeNull();
    expect(productionKey('research_project')).toBeNull();
    expect(productionKey('guidance')).toBeNull();
  });
});

describe('eventNatureKey', () => {
  it.each([
    ['Congresso', 'congresso'],
    ['Simpósio', 'simposio'],
    ['SEMINARIO', 'seminario'],
    ['Oficina', 'oficina'],
  ] as const)('%s → %s', (value, key) => {
    expect(eventNatureKey(value)).toBe(key);
  });

  it('naturezas sem token devolvem null', () => {
    expect(eventNatureKey('Encontro')).toBeNull();
    expect(eventNatureKey('Outra')).toBeNull();
  });
});

describe('orientationKey', () => {
  it.each([
    ['Iniciação Científica', 'ic'],
    ['Iniciacao Cientifica', 'ic'],
    ['Dissertação De Mestrado', 'mestrado'],
    ['Tese De Doutorado', 'doutorado'],
    ['Trabalho De Conclusão De Curso De Graduação', 'tcc'],
    ['Trabalho de Conclusao de Curso Graduacao', 'tcc'],
    ['Orientacao-De-Outra-Natureza', 'outra'],
    [
      'Monografia de Conclusao de Curso Aperfeicoamento e Especializacao',
      'monografia',
    ],
    ['Supervisão De Pós-Doutorado', 'posdoc'],
  ] as const)('%s → %s', (value, key) => {
    expect(orientationKey(value)).toBe(key);
  });

  it('valor desconhecido devolve null', () => {
    expect(orientationKey('Estágio')).toBeNull();
  });
});

describe('statusKey', () => {
  it('reconhece concluída e em andamento', () => {
    expect(statusKey('Concluída')).toBe('concluida');
    expect(statusKey('CONCLUIDA')).toBe('concluida');
    expect(statusKey('Em andamento')).toBe('andamento');
    expect(statusKey('in_progress')).toBe('andamento');
    expect(statusKey('cancelada')).toBeNull();
  });
});

describe('scholarshipKey', () => {
  it('ignora o nível da bolsa', () => {
    expect(scholarshipKey('PQ')).toBe('PQ');
    expect(scholarshipKey('PQ-1A')).toBe('PQ');
    expect(scholarshipKey('pq2')).toBe('PQ');
    expect(scholarshipKey('DT-2')).toBe('DT');
    expect(scholarshipKey('IC')).toBeNull();
  });
});

describe('genderKey', () => {
  it('usa a inicial', () => {
    expect(genderKey('Feminino')).toBe('F');
    expect(genderKey('m')).toBe('M');
    expect(genderKey('')).toBeNull();
  });
});

describe('chartNeutralBg', () => {
  it('percorre a escala de forma cíclica', () => {
    expect(chartNeutralBg(0)).toBe('bg-chart-neutral-1');
    expect(chartNeutralBg(5)).toBe('bg-chart-neutral-6');
    expect(chartNeutralBg(6)).toBe('bg-chart-neutral-1');
    expect(chartNeutralBg(-1)).toBe('bg-chart-neutral-6');
  });
});

describe('indexLevelKey', () => {
  it.each([
    ['A+', 'A+'],
    ['a+', 'A+'],
    ['A', 'A'],
    ['B+', 'B+'],
    ['B', 'B'],
    ['C+', 'C+'],
    ['C', 'C'],
    ['D+', 'D+'],
    ['D', 'D'],
    ['E+', 'E+'],
    ['e', 'E'],
  ] as const)('%s → %s', (value, key) => {
    expect(indexLevelKey(value)).toBe(key);
  });

  it('valor desconhecido usa a cor neutra', () => {
    expect(indexLevelKey('')).toBeNull();
    expect(indexLevelKey('F')).toBeNull();
    expect(indexLevelColor('F')).toBe(FALLBACK_COLOR);
    expect(indexLevelColor('A+').bg).toBe('bg-index-a-plus');
  });
});

describe('runStatusKey', () => {
  it.each([
    ['SUCCEEDED', 'succeeded'],
    ['FAILED', 'failed'],
    ['RUNNING', 'running'],
    ['PENDING', 'queued'],
    ['ACCEPTED', 'queued'],
    ['running', 'running'],
  ] as const)('%s → %s', (value, key) => {
    expect(runStatusKey(value)).toBe(key);
  });

  it('status desconhecido usa o neutro com rótulo próprio', () => {
    expect(runStatusKey('')).toBeNull();
    expect(runStatusKey('CANCELLED')).toBeNull();
    expect(runStatusColor('CANCELLED')).toMatchObject({
      bg: FALLBACK_COLOR.bg,
      label: 'Desconhecido',
    });
    expect(runStatusColor('FAILED').bg).toBe('bg-run-failed');
  });
});
