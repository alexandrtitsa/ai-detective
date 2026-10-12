import { z } from 'zod';

const KEY_PATTERN = /^[a-z][a-z0-9-]*$/;

const key = z
  .string()
  .min(2)
  .max(32)
  .regex(KEY_PATTERN)
  .describe(
    'Ключ: латиниця в нижньому регістрі, цифри й дефіс, наприклад "andriy" або "server-room"',
  );

const text = (max: number) => z.string().min(1).max(max).regex(/\S/);

const entitySchema = z.object({
  key,
  name: text(60),
  description: text(240).describe('Публічний опис без натяків на вину'),
});

const characterSchema = entitySchema.extend({
  role: text(80).describe('Посада або роль персонажа'),
});

const clueSchema = z.object({
  key,
  text: text(240).describe('Нейтральний факт, а не звинувачення'),
  relatedKeys: z
    .array(key)
    .min(1)
    .max(4)
    .describe('Ключі персонажів, локацій, предметів чи подій, яких стосується доказ'),
});

const knowledgeSchema = z.object({
  characterKey: key,
  clueKey: key,
  lie: z
    .string()
    .max(240)
    .describe(
      'Порожній рядок, якщо персонаж каже правду. Інакше правдоподібна неправда від першої особи замість доказу',
    ),
});

export const caseBlueprintSchema = z.object({
  title: text(80),
  premise: text(400).describe('Зав\u2019язка без вказівки на винного'),
  characters: z.array(characterSchema).min(3).max(5),
  locations: z.array(entitySchema).min(1).max(3),
  objects: z.array(entitySchema).min(1).max(3),
  events: z.array(entitySchema).min(1).max(3),
  clues: z.array(clueSchema).min(4).max(8),
  knowledge: z.array(knowledgeSchema).min(4).max(30),
  culpritKey: key.describe('Ключ персонажа-винного'),
});
export type CaseBlueprint = z.infer<typeof caseBlueprintSchema>;

export const caseGenerationRequestSchema = z.object({
  theme: z.string().trim().max(120).optional(),
  castSize: z.number().int().min(3).max(5),
});
export type CaseGenerationRequest = z.infer<typeof caseGenerationRequestSchema>;
