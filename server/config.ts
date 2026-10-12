import { z } from 'zod';

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_MODEL: z.string().min(1).default('openai/gpt-4o-mini'),
  /** Необов'язково: сильніша модель для генерації справ (за замовчуванням OPENROUTER_MODEL) */
  OPENROUTER_CASE_MODEL: z.string().min(1).optional(),
  PORT: z.coerce.number().int().positive().default(8787),
  /** Ліміт однієї спроби до OpenRouter (відповіді NPC) */
  AI_ATTEMPT_TIMEOUT_MS: z.coerce.number().int().positive().default(6000),
  /** Загальний дедлайн відповіді NPC з усіма повторами */
  AI_TOTAL_TIMEOUT_MS: z.coerce.number().int().positive().default(14000),
  AI_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(5).default(3),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(30),
  /** Генерація справи: довгий запит, тому окремі ліміти (клієнтський таймаут має бути більшим за загальний) */
  CASE_ATTEMPT_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  CASE_TOTAL_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
  /** Скільки разів просимо модель виправити справу, що не пройшла перевірку */
  CASE_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(5).default(3),
  CASE_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(3),
});

export type ServerConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Некоректне середовище сервера:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
