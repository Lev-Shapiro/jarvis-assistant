import { SomeObject } from '@/types/some-object';
import { z } from 'zod';

// 'text' U 'json_object' U z.ZodType
export enum AIRequestFormat {
  TEXT = 'text',
  JSON_OBJECT = 'json_object',
  SCHEMA = 'schema',
}

export type AIResponseType = string | SomeObject | z.ZodType;

export type DeriveRequestFormat<T extends AIResponseType> = T extends string
  ? AIRequestFormat.TEXT
  : T extends z.ZodType
    ? AIRequestFormat.SCHEMA // Order very important
    : T extends SomeObject
      ? AIRequestFormat.JSON_OBJECT
      : never;

export type DeriveResponseType<T extends AIRequestFormat> =
  T extends AIRequestFormat.TEXT
    ? string
    : T extends AIRequestFormat.SCHEMA // Order very important
      ? z.ZodType
      : T extends AIRequestFormat.JSON_OBJECT
        ? SomeObject
        : never;

export const inferAIFormat = (response: AIResponseType): AIRequestFormat => {
  if (typeof response === 'string') {
    return AIRequestFormat.TEXT;
  }

  if (response instanceof z.ZodType) {
    return AIRequestFormat.SCHEMA;
  }

  if (typeof response === 'object') {
    if (Array.isArray(response)) {
      throw new Error('Arrays are not supported yet');
    }

    return AIRequestFormat.JSON_OBJECT;
  }

  throw new Error('Invalid response format');
};
