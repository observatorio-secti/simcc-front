// Types espelhando os schemas Pydantic do backend.
// Port de prototipo-classificador-pesquisadores/frontend/src/types/graph.ts

export type NodeOrigin = 'TAXONOMY' | 'TOPIC' | 'SUBTOPIC';

export interface GrafosNodeData {
  id: string;
  label: string;
  origin: NodeOrigin;
  layer: number;
  color: string;
  size?: number;
  num_documents?: number;
  coverage?: string;
}

export interface GrafosEdgeData {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number;
  similarity_score?: number;
}

export interface GrafosGraphElement {
  data: GrafosNodeData | GrafosEdgeData;
}

export interface GrafosGraphResponse {
  taxonomy_name: string;
  elements: GrafosGraphElement[];
  summary: {
    total_nodes: number;
    total_edges: number;
    nodes_by_origin: Record<string, number>;
  };
}

export type GrafosLayoutMode = 'hierarchical' | 'force';

export interface TaxonomyItem {
  taxonomy_name: string;
  total_nodes: number;
  domain_description?: string | null;
}

export interface TaxonomyListResponse {
  items: TaxonomyItem[];
  total: number;
}

export type NodeKind = 'root' | 'area' | 'subarea' | 'topic' | 'subtopic';

export function classifyNodeKind(
  node: Pick<GrafosNodeData, 'origin' | 'layer'>,
): NodeKind {
  if (node.origin === 'TOPIC') return 'topic';
  if (node.origin === 'SUBTOPIC') return 'subtopic';
  if (node.layer === 0) return 'root';
  if (node.layer === 1) return 'area';
  return 'subarea';
}

export const NODE_KIND_LABEL: Record<NodeKind, string> = {
  root: 'Taxonomia (raiz)',
  area: 'Área',
  subarea: 'Subárea',
  topic: 'Tópico',
  subtopic: 'Subtópico',
};

export const NODE_KIND_MARKER: Record<NodeKind, string> = {
  root: '◎',
  area: '●',
  subarea: '○',
  topic: '◆',
  subtopic: '▲',
};
