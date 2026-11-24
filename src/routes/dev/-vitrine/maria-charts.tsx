import type {
  ChartBlock,
  ResearchersBlock,
} from '@/entities/conversation/model';
import { ChartBlockView } from '@/features/maria/components/chart-block';
import { MessageBlocks } from '@/features/maria/components/message-blocks';
import { QuestionLives } from '@/features/maria/components/question-lives';
import { Showcase } from './showcase';

// Um bloco `chart` de cada forma que a MarIA pode mandar, com dados de exemplo.

const ORIGIN = {
  sources: ['Fomento à pesquisa'],
  description: 'Exemplo da vitrine',
  queried_at: '2026-11-22T16:11:16Z',
  coverage: null,
};

const YEARS = [
  { ano: 2021, ic: 1399, mestrado: 393, doutorado: 241, mp: 57 },
  { ano: 2022, ic: 1426, mestrado: 385, doutorado: 206, mp: 64 },
  { ano: 2023, ic: 1478, mestrado: 410, doutorado: 210, mp: 91 },
  { ano: 2024, ic: 1402, mestrado: 398, doutorado: 222, mp: 107 },
];

const MODALITY_SERIES = [
  { key: 'ic', label: 'Iniciação científica', unit: 'bolsas' },
  { key: 'mestrado', label: 'Mestrado', unit: 'bolsas' },
  { key: 'doutorado', label: 'Doutorado', unit: 'bolsas' },
  { key: 'mp', label: 'Mestrado profissional', unit: 'bolsas' },
];

const TERRITORIES = [
  ['Metropolitano de Salvador', 1512],
  ['Recôncavo', 402],
  ['Litoral Sul', 351],
  ['Sudoeste Baiano', 298],
  ['Portal do Sertão', 260],
  ['Sertão do São Francisco', 188],
  ['Velho Chico', 97],
  ['Chapada Diamantina', 74],
].map(([territorio, bolsas]) => ({ territorio, bolsas }));

const base = {
  type: 'chart' as const,
  orientation: 'vertical' as const,
  stacking: null,
  truncated: false,
  origin: ORIGIN,
};

const CHARTS: ChartBlock[] = [
  {
    ...base,
    chart_type: 'line',
    title: 'Linha: bolsas por ano',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: [{ key: 'ic', label: 'Bolsas', unit: 'bolsas' }],
    data: YEARS,
  },
  {
    ...base,
    chart_type: 'line',
    title: 'Linha com várias séries',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: MODALITY_SERIES.slice(1),
    data: YEARS,
  },
  {
    ...base,
    chart_type: 'bar',
    title: 'Barras agrupadas',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: MODALITY_SERIES.slice(1),
    group: { key: 'modalidade', label: 'Modalidade' },
    data: YEARS,
  },
  {
    ...base,
    chart_type: 'bar',
    stacking: 'absolute',
    title: 'Barras empilhadas',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: MODALITY_SERIES,
    data: YEARS,
  },
  {
    ...base,
    chart_type: 'bar',
    stacking: 'percent',
    title: 'Barras empilhadas em percentual',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: MODALITY_SERIES,
    data: YEARS,
  },
  {
    ...base,
    chart_type: 'bar',
    orientation: 'horizontal',
    title: 'Barras horizontais (ranking)',
    x: { key: 'territorio', label: 'Território', type: 'category' },
    series: [{ key: 'bolsas', label: 'Bolsas', unit: 'bolsas' }],
    data: TERRITORIES,
    truncated: true,
  },
  {
    ...base,
    chart_type: 'area',
    title: 'Área',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: [{ key: 'mestrado', label: 'Mestrado', unit: 'bolsas' }],
    data: YEARS,
  },
  {
    ...base,
    chart_type: 'area',
    stacking: 'absolute',
    title: 'Área empilhada',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: MODALITY_SERIES,
    data: YEARS,
  },
  {
    ...base,
    chart_type: 'pie',
    title: 'Pizza (acima de 6 fatias, o resto vira "Outros")',
    x: { key: 'territorio', label: 'Território', type: 'category' },
    series: [{ key: 'bolsas', label: 'Bolsas', unit: 'bolsas' }],
    data: TERRITORIES,
  },
  {
    ...base,
    chart_type: 'donut',
    title: 'Rosca',
    x: { key: 'modalidade', label: 'Modalidade', type: 'category' },
    series: [{ key: 'bolsas', label: 'Bolsas', unit: 'bolsas' }],
    data: [
      { modalidade: 'Iniciação científica', bolsas: 1402 },
      { modalidade: 'Mestrado', bolsas: 398 },
      { modalidade: 'Doutorado', bolsas: 222 },
      { modalidade: 'Mestrado profissional', bolsas: 107 },
    ],
  },
  {
    ...base,
    chart_type: 'scatter',
    title: 'Dispersão: artigos × citações',
    x: { key: 'artigos', label: 'Artigos', type: 'number' },
    series: [{ key: 'citacoes', label: 'Citações', unit: null }],
    data: [
      [12, 210],
      [30, 640],
      [8, 95],
      [45, 1320],
      [22, 380],
      [60, 1710],
      [17, 150],
      [38, 900],
    ].map(([artigos, citacoes]) => ({ artigos, citacoes })),
  },
  {
    ...base,
    chart_type: 'line',
    title: 'Datas no eixo x',
    x: { key: 'dia', label: 'Dia', type: 'date' },
    series: [{ key: 'n', label: 'Consultas', unit: null }],
    data: [
      { dia: '2026-11-18', n: 12 },
      { dia: '2026-11-19', n: 18 },
      { dia: '2026-11-20', n: 9 },
      { dia: '2026-11-21', n: 22 },
    ],
  },
];

const NAMES = [
  ['Ana Beatriz Santos', 'UFBA', 12],
  ['Carlos Henrique de Oliveira Sampaio', 'UESC', 7],
  ['Juliana Moura', 'UNEB', 4],
  ['Rafael Teixeira Lima', 'UEFS', 3],
  ['Marina Costa', 'IFBA', 2],
] as const;

const RESEARCHERS: ResearchersBlock = {
  type: 'researchers',
  title: 'Especialistas em dengue',
  total: 42,
  truncated: false,
  origin: ORIGIN,
  researchers: NAMES.map(([name, acronym, evidence], index) => ({
    id: `00000000-0000-4000-8000-00000000030${index}`,
    name,
    affiliations: [
      {
        institution_id: String(index),
        institution_name: acronym,
        institution_acronym: acronym,
      },
    ],
    evidence: { total: evidence, by_type: {}, items: [] },
  })) as ResearchersBlock['researchers'],
};

// Texto como a MarIA escreve (tabela GFM com coluna numérica à direita).
const MARKDOWN_TEXT = [
  'Segue a lista com a **instituição sede** e o número de bolsistas de produtividade (PQ/DT), conforme o Simcc:',
  '',
  '| Programa de pós-graduação | Instituição | Bolsistas |',
  '|---|---|---:|',
  '| Química | Universidade Federal da Bahia (UFBA) | 17 |',
  '| Ecologia e Conservação da Biodiversidade | Universidade Estadual de Santa Cruz (UESC) | 14 |',
  '| Desenvolvimento e Meio Ambiente — UFPI-UFRN-FUFSE-UESC-UFPB/JP-UFERSA | Universidade Federal do Ceará (UFC) | 8 |',
  '',
  'Fonte completa em https://observatoriocti.secti.ba.gov.br. ~~Dado antigo~~ corrigido.',
].join('\n');

export function MariaChartsShowcase() {
  return (
    <Showcase
      id="maria-graficos"
      title="Gráficos da MarIA"
      description="Cada forma do bloco chart (features/maria/components/chart-block.tsx)."
      bare
    >
      <>
        <div className="flex max-w-[640px] flex-col gap-4">
          <QuestionLives used={3} limit={10} className="w-60" />
          <QuestionLives used={3} limit={10} pending className="w-60" />
          <MessageBlocks
            blocks={[{ type: 'text', text: MARKDOWN_TEXT }, RESEARCHERS]}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {CHARTS.map((block) => (
            <ChartBlockView key={block.title} block={block} />
          ))}
        </div>
      </>
    </Showcase>
  );
}
