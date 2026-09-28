// Port de prototipo-classificador-pesquisadores/frontend/src/types/pipeline.ts

export interface PipelineMessage {
  text: string;
  kind: 'info' | 'success' | 'error';
  step?: number;
}
