import { z } from 'zod';
import discentesPreview from './assets/painel-discentes-programa.png';
import producaoPreview from './assets/painel-producao-programa.png';

export const PROGRAM_PANEL_IDS = ['producao', 'discentes'] as const;
export type ProgramPanelId = (typeof PROGRAM_PANEL_IDS)[number];

export interface ProgramPanel {
  id: ProgramPanelId;
  title: string;
  description: string;
  src: string;
  previewSrc: string;
  /** Painel despublicado no Power BI: a tela mostra um aviso no lugar do iframe. */
  unavailable?: boolean;
}

/**
 * Painéis do Power BI do detalhe de programa. Como no legado, são gerais (não
 * filtrados pelo programa): a filtragem é feita dentro do próprio painel.
 */
export const PROGRAM_PANELS: readonly ProgramPanel[] = [
  {
    id: 'producao',
    title: 'Produção geral',
    description:
      'Produção bibliográfica e técnica dos programas de pós-graduação.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiZWYwOGJjZjctMjUwZi00MmViLTllYzQtNGI5OTgxMzVhMjFmIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9&pageName=ReportSection309e0a94f2ddc295a361',
    previewSrc: producaoPreview,
    // Despublicado no Power BI ("Este conteúdo não está disponível") em 2026-11-22.
    unavailable: true,
  },
  {
    id: 'discentes',
    title: 'Discentes',
    description: 'Discentes dos programas de pós-graduação.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiMjA2NzFlMDEtNGQ2My00MzgzLTk5OTUtNjhmNzZkMmU1MGI4IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    previewSrc: discentesPreview,
    // Despublicado no Power BI ("Este conteúdo não está disponível") em 2026-11-22.
    unavailable: true,
  },
];

export const graduateProgramDetailSearchSchema = z.object({
  painel: z.enum(PROGRAM_PANEL_IDS).optional().catch(undefined),
});

export type GraduateProgramDetailSearch = z.infer<
  typeof graduateProgramDetailSearchSchema
>;
