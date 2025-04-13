import { AIPrice } from '@/types/ai-price';
import { AIProvider } from './ai-provider';

export class AIModel {
  constructor(
    public readonly name: string, // gpt-4o, etc.
    public readonly inputPrice: AIPrice,
    public readonly outputPrice: AIPrice,
    public readonly type: 'built-in' | 'fine-tuned',
    public readonly structuredResponseFormat: boolean,
    public readonly provider: AIProvider = AIProvider.OPENAI,
  ) {}

  calculateCost(inputTokens: number, outputTokens: number): number {
    return (
      this.inputPrice.calculateCost(inputTokens) +
      this.outputPrice.calculateCost(outputTokens)
    );
  }
}
