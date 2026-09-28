// Types para o fluxo de geração de taxonomia via LLM.
// Port do prototipo-classificador-pesquisadores/frontend/src/types/taxonomy_generator.ts

export type GrafosTaxonomyStep = 'prompt' | 'review' | 'confirm';

export interface TaxonomyArea {
  key: string;
  title: string;
  description: string;
}

export interface GeneratedTaxonomyConfig {
  name: string;
  domain_description: string;
  area_examples: string[];
  taxonomy_context: string;
  origin_label: string;
  node_color: string;
  area_filter_layer: number;
  areas: TaxonomyArea[];
}

export interface TaxonomyGenerateRequest {
  prompt: string;
}

export interface TaxonomyGenerateResponse {
  generated: GeneratedTaxonomyConfig;
}

export interface TaxonomySaveRequest {
  config: GeneratedTaxonomyConfig;
}

export interface TaxonomySaveResponse {
  taxonomy_name: string;
  config_path: string;
  taxonomy_path: string;
  message: string;
}
