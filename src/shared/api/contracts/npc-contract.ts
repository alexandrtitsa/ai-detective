import { z } from 'zod';

export const npcRephraseRequestSchema = z.object({
  persona: z.object({
    name: z.string().min(1).max(80),
    role: z.string().min(1).max(120),
    description: z.string().max(400),
  }),
  topic: z.string().min(1).max(120),
  statement: z.string().min(1).max(400),
});
export type NpcRephraseRequest = z.infer<typeof npcRephraseRequestSchema>;

export const npcRephraseResponseSchema = z.object({
  statement: z.string().trim().min(1).max(400),
});
export type NpcRephraseResponse = z.infer<typeof npcRephraseResponseSchema>;