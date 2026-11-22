import {
  BarChartBig,
  GraduationCap,
  Search,
  type LucideIcon,
} from 'lucide-react';

export const INDICATOR_PANEL_IDS = [
  'producao',
  'busca',
  'pos-graduacao',
] as const;
export type IndicatorPanelId = (typeof INDICATOR_PANEL_IDS)[number];

export interface IndicatorPanel {
  id: IndicatorPanelId;
  title: string;
  description: string;
  /** Link "publicar na web" do Power BI (público por natureza, ADR 0012). */
  src: string;
  icon: LucideIcon;
  unavailable?: boolean;
}

/** Painéis gerais do Power BI, os mesmos de `/indicadores` no legado. */
export const INDICATOR_PANELS: readonly IndicatorPanel[] = [
  {
    id: 'producao',
    title: 'Indicadores de produção',
    description:
      'Produção bibliográfica e técnica dos pesquisadores da Bahia, por ano, área e instituição.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiMDhmMDg2ZjQtZGExMy00ZGQ4LTlkZTgtZDdhZTYzMmQ0MWQ2IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    icon: BarChartBig,
  },
  {
    id: 'busca',
    title: 'Busca de informações',
    description:
      'Consulta interativa às informações de pesquisadores, produções e instituições.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiMDJjZDg1OTQtNjZiZi00NWFkLThkMGItOTk2MWM4YTJiYTFkIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    icon: Search,
  },
  {
    id: 'pos-graduacao',
    title: 'Programas de pós-graduação',
    description:
      'Programas de pós-graduação da Bahia: docentes, discentes, conceitos e produção.',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiNDYyMTRhYjQtZjA3MC00YjRhLTgxOGQtODM0YWZiNmNhN2JjIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    icon: GraduationCap,
  },
];
