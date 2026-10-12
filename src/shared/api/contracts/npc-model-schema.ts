import { z } from 'zod';
import { toModelJsonSchema } from './model-json-schema';

const npcModelOutputSchema = z.object({
  statement: z.string().describe('Репліка NPC від першої особи, 1–2 короткі речення'),
});

export const npcModelJsonSchema = toModelJsonSchema(npcModelOutputSchema);