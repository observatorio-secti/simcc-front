import { z } from 'zod';
import { INDICATOR_PANEL_IDS } from './indicators-data';

export const indicatorsSearchSchema = z.object({
  painel: z.enum(INDICATOR_PANEL_IDS).optional().catch(undefined),
});

export type IndicatorsSearch = z.infer<typeof indicatorsSearchSchema>;
