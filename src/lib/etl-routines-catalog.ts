import React from 'react';
import {
  BarChart3,
  Building2,
  CloudDownload,
  Coins,
  Database,
  FileCheck2,
  Layers,
  Search,
  Sparkles,
  Workflow,
} from 'lucide-react';

export interface RoutineMetadata {
  id: string;
  title: string;
  shortDescription: string;
  category: 'Coleta' | 'Tratamento' | 'Consolidação' | 'Indicadores' | 'Integração';
  icon: React.ComponentType<{ className?: string }>;
}

export const ROUTINE_METADATA_MAP: Record<string, Omit<RoutineMetadata, 'id'>> = {
  soap_lattes: {
    title: 'Coleta de Currículos Lattes',
    shortDescription:
      'Sincroniza os currículos oficiais do CNPq com a base de dados.',
    category: 'Coleta',
    icon: CloudDownload,
  },
  hop_seed: {
    title: 'Carga Inicial de Dados',
    shortDescription:
      'Prepara o ambiente inicial de extração de dados.',
    category: 'Coleta',
    icon: Database,
  },
  hop_index: {
    title: 'Extração Estruturada dos Currículos',
    shortDescription:
      'Processa os arquivos Lattes e organiza produções, vínculos e artigos.',
    category: 'Tratamento',
    icon: Workflow,
  },
  import_capes_programs: {
    title: 'Programas de Pós-Graduação',
    shortDescription:
      'Atualiza informações e áreas dos programas de pós-graduação.',
    category: 'Coleta',
    icon: Building2,
  },
  import_capes_ratings: {
    title: 'Conceitos CAPES',
    shortDescription:
      'Atualiza notas e avaliações dos programas de pós-graduação.',
    category: 'Indicadores',
    icon: BarChart3,
  },
  import_capes_researchers: {
    title: 'Docentes da Pós-Graduação',
    shortDescription:
      'Mapeia os pesquisadores vinculados a programas de pós-graduação.',
    category: 'Consolidação',
    icon: Building2,
  },
  sanitize_lattes_data: {
    title: 'Padronização e Limpeza',
    shortDescription:
      'Higieniza dados, normaliza caracteres e remove duplicidades.',
    category: 'Tratamento',
    icon: Sparkles,
  },
  aggregate_researcher_production: {
    title: 'Consolidação de Produções',
    shortDescription:
      'Unifica produções bibliográficas, técnicas e artísticas por autor.',
    category: 'Consolidação',
    icon: Database,
  },
  calculate_researcher_indprod: {
    title: 'Produtividade de Pesquisadores',
    shortDescription:
      'Calcula índices de produtividade individuais.',
    category: 'Indicadores',
    icon: BarChart3,
  },
  calculate_graduate_program_indprod: {
    title: 'Produtividade de Programas',
    shortDescription:
      'Calcula índices agregados dos programas de pós-graduação.',
    category: 'Indicadores',
    icon: BarChart3,
  },
  calculate_research_group_indprod: {
    title: 'Produtividade de Grupos',
    shortDescription:
      'Calcula índices dos grupos de pesquisa cadastrados.',
    category: 'Indicadores',
    icon: BarChart3,
  },
  calculate_production_index: {
    title: 'Cálculo de Indicadores',
    shortDescription:
      'Consolida os indicadores de produção científica de toda a plataforma.',
    category: 'Indicadores',
    icon: BarChart3,
  },
  indprod: {
    title: 'Cálculo de Indicadores',
    shortDescription:
      'Consolida os indicadores de produção científica.',
    category: 'Indicadores',
    icon: BarChart3,
  },
  classify_researchers: {
    title: 'Classificação de Especialidades',
    shortDescription:
      'Identifica áreas e especialidades predominantes de cada pesquisador.',
    category: 'Consolidação',
    icon: Sparkles,
  },
  build_search_dictionary: {
    title: 'Dicionário de Termos e Busca',
    shortDescription:
      'Otimiza o vocabulário para buscas instantâneas na plataforma.',
    category: 'Consolidação',
    icon: Search,
  },
  resolve_cnpq_lattes_id: {
    title: 'Resolução de Identificadores',
    shortDescription:
      'Confirma identificadores Lattes junto às bases de referência.',
    category: 'Tratamento',
    icon: Sparkles,
  },
  enrich_from_openalex: {
    title: 'Enriquecimento com OpenAlex',
    shortDescription:
      'Cruza dados com a base global OpenAlex para ampliar métricas e citações.',
    category: 'Integração',
    icon: CloudDownload,
  },
  import_program_research_lines: {
    title: 'Linhas de Pesquisa',
    shortDescription:
      'Importa as linhas de pesquisa associadas a cada programa.',
    category: 'Consolidação',
    icon: Building2,
  },
  export_oda_research_groups: {
    title: 'Sincronização com ODA',
    shortDescription:
      'Atualiza grupos de pesquisa e dados de interoperabilidade do observatório.',
    category: 'Integração',
    icon: Workflow,
  },
  classify_article_themes: {
    title: 'Classificação Temática',
    shortDescription:
      'Categoriza publicações conforme áreas temáticas e de inovação.',
    category: 'Consolidação',
    icon: Sparkles,
  },
  publish_to_read_db: {
    title: 'Publicação na Base de Consulta',
    shortDescription:
      'Publica os dados atualizados para acesso dos usuários na plataforma.',
    category: 'Consolidação',
    icon: Database,
  },
  refresh_search_views: {
    title: 'Atualização de Visualizações',
    shortDescription:
      'Atualiza tabelas e visualizações otimizadas de consulta.',
    category: 'Consolidação',
    icon: Search,
  },
};

/**
 * Retorna os metadados amigáveis de uma rotina pelo seu ID técnico
 */
export function getRoutineMetadata(routineId: string): RoutineMetadata {
  const normalizedId = routineId.trim().toLowerCase();
  const found = ROUTINE_METADATA_MAP[normalizedId];

  if (found) {
    return {
      id: routineId,
      ...found,
    };
  }

  // Fallback humanizado para rotinas dinâmicas não mapeadas
  const formattedTitle = routineId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: routineId,
    title: formattedTitle,
    shortDescription:
      'Rotina de processamento e atualização automatizada integrada ao pipeline do SimCC.',
    category: 'Integração',
    icon: Layers,
  };
}

/**
 * Contrai um identificador longo (UUID) para os primeiros 6 caracteres (#abcdef)
 */
export function formatShortRunId(runId?: string | null): string {
  if (!runId) return '#------';
  const clean = runId.replace(/[^a-zA-Z0-9]/g, '');
  return `#${clean.slice(0, 6)}`;
}

/**
 * Traduz o status do pipeline para texto amigável e legível
 */
export function getFriendlyStatusText(status?: string): {
  label: string;
  description: string;
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
  colorClass: string;
} {
  switch (status) {
    case 'RUNNING':
      return {
        label: 'Em andamento',
        description: 'O pipeline está sendo executado ativamente.',
        badgeVariant: 'secondary',
        colorClass: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
      };
    case 'ACCEPTED':
      return {
        label: 'Aguardando início',
        description: 'Na fila de processamento, aguardando início.',
        badgeVariant: 'outline',
        colorClass: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
      };
    case 'SUCCEEDED':
      return {
        label: 'Concluído com sucesso',
        description: 'Todas as rotinas foram executadas com êxito.',
        badgeVariant: 'outline',
        colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
      };
    case 'FAILED':
      return {
        label: 'Falha na execução',
        description: 'Ocorreu um erro durante a execução da etapa.',
        badgeVariant: 'destructive',
        colorClass: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
      };
    default:
      return {
        label: status || 'Desconhecido',
        description: 'Estado da execução não identificado.',
        badgeVariant: 'outline',
        colorClass: 'text-neutral-500 bg-neutral-100 border-neutral-200',
      };
  }
}
