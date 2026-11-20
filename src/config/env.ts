import { z } from 'zod';

// Variáveis de ambiente validadas uma única vez. Nenhum outro arquivo lê
// import.meta.env.VITE_* diretamente: importe `env` daqui.
//
// Toda variável VITE_* vai para o navegador. Nunca adicione segredo aqui.

/** Vazio no .env conta como ausente. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    schema.optional(),
  );

/** URL base sempre terminada em barra, para `new URL('rota', base)` funcionar. */
const baseUrl = z
  .url()
  .transform((url) => (url.endsWith('/') ? url : `${url}/`));

const schema = z.object({
  VITE_SIMCC_API_URL: baseUrl,
  VITE_ODA_API_URL: optional(baseUrl),
  VITE_ADMIN_API_URL: optional(baseUrl),
  VITE_IDP_URL: optional(baseUrl),
  VITE_MARIA_API_URL: optional(baseUrl),
  VITE_GA_MEASUREMENT_ID: optional(z.string()),
});

export function parseEnv(raw: Record<string, unknown>) {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Variáveis de ambiente inválidas (veja .env.example):\n${z.prettifyError(result.error)}`,
    );
  }
  const values = result.data;
  return {
    simccApiUrl: values.VITE_SIMCC_API_URL,
    odaApiUrl: values.VITE_ODA_API_URL,
    adminApiUrl: values.VITE_ADMIN_API_URL,
    idpUrl: values.VITE_IDP_URL,
    mariaApiUrl: values.VITE_MARIA_API_URL,
    gaMeasurementId: values.VITE_GA_MEASUREMENT_ID,
  };
}

export type Env = ReturnType<typeof parseEnv>;

/**
 * Avaliado na primeira importação (hoje, pelo cliente da v2 em
 * `src/api/simcc.ts`). Testes que importam quem usa `env` precisam de
 * `vi.stubEnv` antes do import, porque a CI não tem .env.
 */
export const env: Env = parseEnv(import.meta.env);
