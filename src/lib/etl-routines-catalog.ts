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
    title: 'Coleta de Currículos Lattes (SOAP)',
    shortDescription:
      'Conecta ao serviço oficial do CNPq para baixar e atualizar os currículos XML dos pesquisadores cadastrados. Garante que as informações acadêmicas estejam sincronizadas com a fonte primária.',
    category: 'Coleta',
    icon: CloudDownload,
  },
  sanitize_lattes_data: {
    title: 'Saneamento e Limpeza de Dados',
    shortDescription:
      'Padroniza e higieniza os dados brutos extraídos dos currículos Lattes. Remove duplicidades, corrige inconsistências cadastrais e normaliza caracteres especiais.',
    category: 'Tratamento',
    icon: Sparkles,
  },
  aggregate_researcher_production: {
    title: 'Consolidação de Produções Acadêmicas',
    shortDescription:
      'Organiza e unifica todas as publicações bibliográficas, técnicas e artísticas de cada docente. Estrutura os vínculos entre pesquisadores, departamentos e programas.',
    category: 'Consolidação',
    icon: Database,
  },
  index_productions: {
    title: 'Indexação para Busca Rápida',
    shortDescription:
      'Atualiza os índices de pesquisa em tempo real do Observatório. Permite que as novas publicações e termos-chave fiquem instantaneamente pesquisáveis na plataforma.',
    category: 'Consolidação',
    icon: Search,
  },
  index_search: {
    title: 'Indexação dos Perfis e Publicações',
    shortDescription:
      'Gera os índices otimizados para busca textual rápida. Facilita a recuperação instantânea de pesquisadores, produções e áreas de conhecimento.',
    category: 'Consolidação',
    icon: Search,
  },
  calculate_indicators: {
    title: 'Cálculo de Indicadores Bibliométricos',
    shortDescription:
      'Processa as métricas quantitativas e índices de produtividade acadêmica da instituição. Alimenta os gráficos, relatórios e painéis analíticos do portal.',
    category: 'Indicadores',
    icon: BarChart3,
  },
  hop_orchestration: {
    title: 'Orquestração e Pipelines Hop',
    shortDescription:
      'Executa as rotinas de transformação analítica automatizadas no Apache Hop. Enriquece as informações cruzando múltiplas bases acadêmicas.',
    category: 'Integração',
    icon: Workflow,
  },
  sync_institution_data: {
    title: 'Sincronização de Vínculos Institucionais',
    shortDescription:
      'Mapeia a lotação dos docentes em centros, departamentos e programas de pós-graduação. Mantém a hierarquia acadêmica atualizada.',
    category: 'Consolidação',
    icon: Building2,
  },
  update_foments: {
    title: 'Atualização de Fomento e Bolsas',
    shortDescription:
      'Atualiza dados de bolsas de produtividade e projetos de fomento das agências financiadoras. Vincula os auxílios diretamente aos pesquisadores contemplados.',
    category: 'Indicadores',
    icon: Coins,
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
