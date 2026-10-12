import { z } from 'zod';
import type { DetectiveCase } from './types';

const id = z.string().min(1).max(80);
const text = (max: number) => z.string().min(1).max(max);

const baseEntity = { id, name: text(80), description: z.string().max(400) };

const entitySchema = z.discriminatedUnion('kind', [
  z.object({
    ...baseEntity,
    kind: z.literal('character'),
    role: text(120),
    knownClueIds: z.array(id),
    lies: z.record(z.string(), z.string()),
  }),
  z.object({ ...baseEntity, kind: z.literal('location') }),
  z.object({ ...baseEntity, kind: z.literal('object') }),
  z.object({ ...baseEntity, kind: z.literal('event') }),
]);

export const detectiveCaseSchema = z.object({
  id,
  title: text(120),
  premise: text(600),
  entities: z.array(entitySchema).min(1),
  clues: z.array(z.object({ id, text: text(400), relatedEntityIds: z.array(id) })),
  culpritId: id,
  maxQuestions: z.number().int().min(1).max(50),
}) satisfies z.ZodType<DetectiveCase>;
