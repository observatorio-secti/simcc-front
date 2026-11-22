import discentesPreview from './assets/painel-discentes-programa.png';

export interface DiscentesPanelConfig {
  title: string;
  description: string;
  src: string;
  previewSrc: string;
  /** Painel despublicado no Power BI: a tela mostra um aviso no lugar do iframe. */
  unavailable?: boolean;
}

/**
 * Incorporação do Power BI de discentes no detalhe do programa.
 * Como no legado, é geral (não filtrado pelo programa).
 */
export const DISCENTES_PANEL: DiscentesPanelConfig = {
  title: 'Discentes',
  description: 'Discentes dos programas de pós-graduação.',
  src: 'https://app.powerbi.com/view?r=eyJrIjoiMjA2NzFlMDEtNGQ2My00MzgzLTk5OTUtNjhmNzZkMmU1MGI4IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
  previewSrc: discentesPreview,
  // Despublicado no Power BI ("Este conteúdo não está disponível") em 2026-11-22.
  unavailable: true,
};
