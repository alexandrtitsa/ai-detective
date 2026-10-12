import { caseBlueprintSchema } from './case-contract';
import { toModelJsonSchema } from './model-json-schema';

export const caseModelJsonSchema = toModelJsonSchema(caseBlueprintSchema);
