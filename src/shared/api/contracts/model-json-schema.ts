import { z } from 'zod';

const UNSUPPORTED_KEYWORDS = new Set([
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'minimum',
  'maximum',
  'pattern',
  'format',
  'default',
]);

type JsonObject = Record<string, unknown>;

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function sanitize(node: unknown): unknown {
  if (Array.isArray(node)) return node.map((item: unknown) => sanitize(item));
  if (!isJsonObject(node)) return node;

  const result: JsonObject = {};
  for (const [name, value] of Object.entries(node)) {
    if (name === 'properties' && isJsonObject(value)) {
      result[name] = Object.fromEntries(
        Object.entries(value).map(([field, schema]) => [field, sanitize(schema)] as const),
      );
    } else if (!UNSUPPORTED_KEYWORDS.has(name)) {
      result[name] = sanitize(value);
    }
  }

  const properties = result['properties'];
  if (isJsonObject(properties)) {
    result['required'] = Object.keys(properties);
    result['additionalProperties'] = false;
  }
  return result;
}

export function toModelJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const sanitized = sanitize(z.toJSONSchema(schema));
  if (!isJsonObject(sanitized)) throw new Error('JSON Schema має бути об\u2019єктом');

  delete sanitized['$schema'];
  return sanitized;
}
