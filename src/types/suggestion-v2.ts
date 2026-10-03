// Contrato da rota GET /v2/suggestion (termos do dicionário de pesquisa por prefixo).

/** Dicionários disponíveis para sugestão; sem valor, a API soma todos. */
export type SuggestionSourceTypeV2 =
  | 'ARTICLE'
  | 'BOOK'
  | 'BOOK_CHAPTER'
  | 'PATENT'
  | 'SPEAKER'
  | 'ABSTRACT';

export interface SuggestionV2 {
  term: string;
  /** Quantidade de textos em que o termo aparece. */
  frequency: number;
  /** Tipos de produções/documentos onde o termo ocorre. */
  source_types?: SuggestionSourceTypeV2[];
}

export interface SuggestionResponseV2 {
  /** Sugestões, da mais para a menos frequente. */
  data: SuggestionV2[];
  meta: {
    took_ms: number;
    cached: boolean;
    timestamp: string;
    data_as_of: string | null;
  };
}
