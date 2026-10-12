import { analyzeCase, blueprintToCase, limitRivalExposure } from '../../src/entities/case';
import {
  caseBlueprintSchema,
  type CaseBlueprint,
} from '../../src/shared/api/contracts/case-contract';

export type BlueprintEvaluation =
  | { readonly ok: true; readonly blueprint: CaseBlueprint }
  | { readonly ok: false; readonly problems: readonly string[] };

export function evaluateBlueprint(raw: string): BlueprintEvaluation {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, problems: ['Відповідь не є коректним JSON'] };
  }

  const parsed = caseBlueprintSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      problems: parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || '(корінь)'}: ${issue.message}`,
      ),
    };
  }

  const blueprint = limitRivalExposure(parsed.data);

  const converted = blueprintToCase(blueprint, 'validation');
  if (!converted.ok) return converted;

  const problems = analyzeCase(converted.value);
  return problems.length === 0 ? { ok: true, blueprint } : { ok: false, problems };
}
