import { z } from 'zod';

// Schemas Zod na borda da API ODA (ADR 0003 e 0007).
// A ODA não publica OpenAPI; estes schemas validam os payloads reais
// observados em `legado-v1` antes da conversão para o modelo do front.

const scalarOrArray = <T extends z.ZodType>(item: T) =>
  z.union([item, z.array(item.nullable())]);

export const odaInstitutionSchema = z.object({
  id: z.string().nullish(),
  nome: z.string().nullish(),
  sigla: z.string().nullish(),
  tipoRelacao: z.string().nullish(),
  imageUrl: z.string().nullish(),
  unidade: z
    .object({
      nome: z.string().nullish(),
      uf: z.string().nullish(),
    })
    .nullish(),
  estado: z
    .object({
      id: z.string().nullish(),
      sigla: z.string().nullish(),
      nome: z.string().nullish(),
      regiao: z.string().nullish(),
    })
    .nullish(),
});

export const odaKnowledgeAreaSchema = z.object({
  id: z.string().nullish(),
  nome: z.string().nullish(),
  nomeNormalizado: z.string().nullish(),
  tipo: z.string().nullish(),
  areaPaiId: z.string().nullish(),
  relacao: z.string().nullish(),
  metodoInferencia: z.string().nullish(),
  confianca: z.number().nullish(),
  justificativa: z.string().nullish(),
});

export const odaMemberSchema = z.object({
  id: z.string().nullish(),
  nome: z.string().nullish(),
  eLider: z.boolean().nullish(),
  lattesId: z.string().nullish(),
});

export const odaResearchLineSchema = z.object({
  titulo: z.string(),
  objetivo: z.string().nullish(),
});

export const odaGroupSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  areaPredominante: z.string().nullish(),
  dgpId: scalarOrArray(z.string()).nullish(),
  anoFormacao: scalarOrArray(z.number()).nullish(),
  situacao: z.string().nullish(),
  repercussao: z.string().nullish(),
  email: scalarOrArray(z.string()).nullish(),
  telefone: scalarOrArray(z.string()).nullish(),
  website: scalarOrArray(z.string()).nullish(),
  logradouro: scalarOrArray(z.string()).nullish(),
  numero: scalarOrArray(z.string()).nullish(),
  complemento: scalarOrArray(z.string()).nullish(),
  bairro: scalarOrArray(z.string()).nullish(),
  cidade: scalarOrArray(z.string()).nullish(),
  uf: scalarOrArray(z.string()).nullish(),
  cep: scalarOrArray(z.string()).nullish(),
  latitude: scalarOrArray(z.number()).nullish(),
  longitude: scalarOrArray(z.number()).nullish(),
  instituicoes: z.array(odaInstitutionSchema).nullish(),
  areaConhecimento: odaKnowledgeAreaSchema.nullish(),
  areasConhecimento: z.array(odaKnowledgeAreaSchema).nullish(),
  membros: z.array(odaMemberSchema).nullish(),
  linhasPesquisa: z.array(odaResearchLineSchema).nullish(),
});

export const odaPaginationMetaSchema = z.object({
  page: z.number().int().nonnegative().optional(),
  size: z.number().int().positive().optional(),
  totalItems: z.number().int().nonnegative().optional(),
  totalPages: z.number().int().nonnegative().optional(),
});

export const odaGroupListResponseSchema = z.union([
  z.object({
    data: z.array(odaGroupSchema),
    meta: odaPaginationMetaSchema.nullish(),
  }),
  z.object({
    items: z.array(odaGroupSchema),
    meta: odaPaginationMetaSchema.nullish(),
  }),
  z.array(odaGroupSchema),
]);

export const odaGroupDetailResponseSchema = z.union([
  odaGroupSchema,
  z.object({
    data: odaGroupSchema,
  }),
]);

export const odaGroupResearcherSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  formacaoAcademica: z.string().nullish(),
  lattesId: z.string().nullish(),
  orcidId: z.string().nullish(),
  imageUrl: z.string().nullish(),
  eLider: z.boolean().nullish(),
});

export const odaGroupResearchersResponseSchema = z.union([
  z.object({
    data: z.array(odaGroupResearcherSchema),
    meta: odaPaginationMetaSchema.nullish(),
  }),
  z.array(odaGroupResearcherSchema),
]);

export const odaStateSchema = z.object({
  id: z.string().min(1),
  sigla: z.string().min(1),
  nome: z.string().min(1),
  regiao: z.string().nullish(),
});

export const odaStateListResponseSchema = z.union([
  z.array(odaStateSchema),
  z.object({
    data: z.array(odaStateSchema),
    meta: odaPaginationMetaSchema.nullish(),
  }),
]);

export const odaKnowledgeAreaOptionSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  nomeNormalizado: z.string().nullish(),
  tipo: z.string().nullish(),
  areaPaiId: z.string().nullish(),
});

export const odaKnowledgeAreaListResponseSchema = z.union([
  z.object({
    data: z.array(odaKnowledgeAreaOptionSchema),
    meta: odaPaginationMetaSchema.nullish(),
  }),
  z.array(odaKnowledgeAreaOptionSchema),
]);

export const odaInstitutionOptionSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  sigla: z.string().nullish(),
  estado: z
    .object({
      id: z.string().nullish(),
      sigla: z.string().nullish(),
      nome: z.string().nullish(),
    })
    .nullish(),
});

export const odaInstitutionListResponseSchema = z.union([
  z.object({
    data: z.array(odaInstitutionOptionSchema),
    meta: odaPaginationMetaSchema.nullish(),
  }),
  z.array(odaInstitutionOptionSchema),
]);

export type OdaInstitutionRaw = z.infer<typeof odaInstitutionSchema>;
export type OdaKnowledgeAreaRaw = z.infer<typeof odaKnowledgeAreaSchema>;
export type OdaMemberRaw = z.infer<typeof odaMemberSchema>;
export type OdaResearchLineRaw = z.infer<typeof odaResearchLineSchema>;
export type OdaGroupRaw = z.infer<typeof odaGroupSchema>;
export type OdaPaginationMetaRaw = z.infer<typeof odaPaginationMetaSchema>;
export type OdaGroupListResponseRaw = z.infer<
  typeof odaGroupListResponseSchema
>;
export type OdaGroupDetailResponseRaw = z.infer<
  typeof odaGroupDetailResponseSchema
>;
export type OdaGroupResearcherRaw = z.infer<typeof odaGroupResearcherSchema>;
export type OdaGroupResearchersResponseRaw = z.infer<
  typeof odaGroupResearchersResponseSchema
>;
export type OdaStateRaw = z.infer<typeof odaStateSchema>;
export type OdaStateListResponseRaw = z.infer<
  typeof odaStateListResponseSchema
>;
export type OdaKnowledgeAreaOptionRaw = z.infer<
  typeof odaKnowledgeAreaOptionSchema
>;
export type OdaKnowledgeAreaListResponseRaw = z.infer<
  typeof odaKnowledgeAreaListResponseSchema
>;
export type OdaInstitutionOptionRaw = z.infer<
  typeof odaInstitutionOptionSchema
>;
export type OdaInstitutionListResponseRaw = z.infer<
  typeof odaInstitutionListResponseSchema
>;
