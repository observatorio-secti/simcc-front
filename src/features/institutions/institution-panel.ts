import preview from './assets/painel-instituicao.png';

/**
 * Painel do Power BI do detalhe de instituição ("Indicadores de avaliação" no
 * legado). É geral, não filtrado pela instituição: a filtragem é feita dentro
 * do próprio painel.
 */
export const INSTITUTION_PANEL = {
  title: 'Indicadores de avaliação',
  description:
    'Indicadores de avaliação das instituições: docentes, programas e produção.',
  src: 'https://app.powerbi.com/view?r=eyJrIjoiYTk2YmEwNjctMGM5Zi00Mzg5LTlhNjItYzA1NWM1YWMxMjNjIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
  previewSrc: preview,
  // Despublicado no Power BI ("Este conteúdo não está disponível") em 2026-11-22.
  unavailable: true,
} as const;
