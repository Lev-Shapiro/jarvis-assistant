import { z, ZodType } from 'zod';
import { AIModel } from '../../domain/ai-model';
import {
  AIRequestFormat,
  AIResponseType,
  DeriveRequestFormat,
  DeriveResponseType,
} from './ai-response-format';

interface OptionProps<T extends AIRequestFormat> {
  responseFormat: T;
  temperature?: number;
  model: AIModel;
}
// TODO: add JSON SUPPORT (NOT CRITICAL)

export class AIOptions<T extends AIResponseType> {
  constructor(
    public readonly temperature: number = 0.7,
    public readonly model: AIModel,
    public readonly responseFormat: DeriveRequestFormat<T>,
    public readonly schema?: T extends z.ZodType ? T : never,
  ) {
    if (responseFormat === AIRequestFormat.SCHEMA && !schema) {
      throw new Error('Missing schema in structured mode');
    }
  }

  static init<F extends AIRequestFormat.TEXT | AIRequestFormat.JSON_OBJECT>(
    options: OptionProps<F>,
  ): AIOptions<DeriveResponseType<F>> {
    return new AIOptions<DeriveResponseType<F>>(
      options.temperature,
      options.model,
      options.responseFormat as unknown as DeriveRequestFormat<
        DeriveResponseType<F>
      >,
    );
  }

  static initStructured<T extends z.ZodType>(
    options: OptionProps<AIRequestFormat.SCHEMA>,
    schema: T,
  ): AIOptions<T> {
    return new AIOptions<T>(
      options.temperature,
      options.model,
      AIRequestFormat.SCHEMA as DeriveRequestFormat<T>,
      schema as T extends ZodType ? T : never,
    );
  }
}

// const a = AIOptions.init({
//   temperature: 0.5,
//   model: AI_MODELS.COST_EFFECTIVE_MODEL,
//   responseFormat: AIRequestFormat.JSON_OBJECT,
// });

// console.log(a.responseFormat); // SHOWS JSON_OBJECT, BUT MUST BE SCHEMA.
// console.log(a.schema); // SHOWS UNDEFINED

// const b = AIOptions.initStructured(
//   {
//     temperature: 0.5,
//     model: AI_MODELS.COST_EFFECTIVE_MODEL,
//     responseFormat: AIRequestFormat.SCHEMA,
//   },
//   z.object({
//     name: z.string(),
//   }),
// );

// console.log(b.responseFormat); // SHOWS JSON_OBJECT, BUT MUST BE SCHEMA.
// console.log(b.schema); // SHOWS UNDEFINED
