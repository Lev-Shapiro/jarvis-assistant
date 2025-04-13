import { z, ZodType } from 'zod';
import { AIModel } from '../../domain/ai-model';
import { AIResponseType } from './ai-response-format';

// Create a more generic usage interface that works for both providers
export interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export class AIResponse<T extends AIResponseType> {
  content: T extends ZodType ? z.infer<T> : T;
  usage: AIUsage;
  model: AIModel;

  constructor(model: AIModel, content: string, isJson: boolean) {
    const usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    
    if (!content) throw new Error('Missing content result');

    this.usage = usage;
    this.content = isJson ? JSON.parse(content) : content;
    this.model = model;
  }

  get pricing() {
    return this.model.calculateCost(
      this.usage.prompt_tokens,
      this.usage.completion_tokens,
    );
  }
}
