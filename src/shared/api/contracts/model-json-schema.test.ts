import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { toModelJsonSchema } from './model-json-schema';

describe('toModelJsonSchema', () => {
  const schema = z.object({
    name: z.string().min(1).max(5).regex(/\S/),
    items: z
      .array(z.object({ pattern: z.string() }))
      .min(1)
      .max(3),
  });
  const json = toModelJsonSchema(schema);

  it('прибирає ключові слова, які strict-режими підтримують не всюди', () => {
    const text = JSON.stringify(json);

    for (const keyword of ['minLength', 'maxLength', 'minItems', 'maxItems', '"$schema"']) {
      expect(text).not.toContain(keyword);
    }
  });

  it("закриває об'єкти й робить усі властивості обов'язковими", () => {
    expect(json).toMatchObject({
      type: 'object',
      required: ['name', 'items'],
      additionalProperties: false,
    });
  });

  it('не чіпає поле, назва якого збігається з ключовим словом', () => {
    expect(JSON.stringify(json)).toContain('"pattern":{"type":"string"}');
  });
});
