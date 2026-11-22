import { z } from 'zod';

/** Parâmetro de `/maria/$conversationId`: a MarIA usa UUID (8-4-4-4-12). */
export const conversationParamsSchema = z.object({
  conversationId: z.guid(),
});
