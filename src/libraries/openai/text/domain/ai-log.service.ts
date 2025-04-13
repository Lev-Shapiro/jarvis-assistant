import { ConsoleStep } from '@shapilev/console-step';
import { AILogOptions } from '../../domain/ai-log-options';
import { AIResponse } from './ai-response';
import { AIResponseType } from './ai-response-format';


export class AILogService {
  private static instance: AILogService | null = null;

  constructor() {}

  static getInstance(): AILogService {
    if (!AILogService.instance) {
      AILogService.instance = new AILogService();
    }
    return AILogService.instance;
  }

  async log<T extends AIResponseType>(
    options: AILogOptions,
    action: () => Promise<AIResponse<T>>,
  ): Promise<AIResponse<T>> {
    try {
      if (options.logging) {
        new ConsoleStep(options.title).createStep('Status: Running');
      }

      const startTime = performance.now();
      const response = await action();
      const duration = performance.now() - startTime;

      if (options.logging) {
        new ConsoleStep(options.title).logAfter((s) => {
          s.createStep('Status: Completed');

          if (options.logPerformance)
            s.createStep('Duration: ' + duration + 'ms');
          if (options.logPricing)
            s.createStep('Pricing: ').createStepObject(
              this.loggingResponsePricing(response),
            );
        });
      }

      return response;
    } catch (err) {
      new ConsoleStep(options.title).createStep('Status: Failed');

      console.error(err);

      throw new Error('AI request failed');
    }
  }

  async logMany<T extends AIResponseType>(
    unitLogOptions: AILogOptions,
    manyLogOptions: AILogOptions,
    action: () => Promise<AIResponse<T>[]>,
  ) {
    try {
      if (manyLogOptions.logging) {
        new ConsoleStep(manyLogOptions.title).logAfter((s) =>
          s.createStep('Status: Running'),
        );
      }

      const startTime = performance.now();
      const responses = await action();
      const duration = performance.now() - startTime;

      const totalResponsePricing = this.loggingManyResponsePricing(responses);

      if (manyLogOptions.logging || unitLogOptions.logging) {
        new ConsoleStep(manyLogOptions.title).logAfter((s) => {
          s.createStep('Status: Completed');

          if (manyLogOptions.logPerformance)
            s.createStep('Duration: ' + duration + 'ms');
          if (manyLogOptions.logPricing)
            s.createStep('Pricing: ').createStepObject(totalResponsePricing);

          if (unitLogOptions.logPricing) {
            responses.forEach((response) => {
              s.createStep('Pricing: ').createStepObject(
                this.loggingResponsePricing(response),
              );
            });
          }
        });
      }

      return responses;
    } catch (err) {
      new ConsoleStep(manyLogOptions.title).logAfter((s) =>
        s.createStep('Status: Failed'),
      );

      console.error(err);

      throw new Error('AI request failed');
    }
  }

  private loggingResponsePricing(response: AIResponse<AIResponseType>) {
    return {
      completion_tokens: response.usage.completion_tokens,
      prompt_tokens: response.usage.prompt_tokens,
      total_tokens: response.usage.total_tokens,
      pricing: response.pricing,
    };
  }

  private loggingManyResponsePricing(responses: AIResponse<AIResponseType>[]) {
    if (responses.length === 0) {
      throw new Error('No responses');
    }

    const result = this.loggingResponsePricing(responses[0]);

    for (let i = 1; i < responses.length; i++) {
      const response = responses[i];
      result.completion_tokens += response.usage.completion_tokens;
      result.prompt_tokens += response.usage.prompt_tokens;
      result.total_tokens += response.usage.total_tokens;
      result.pricing += response.pricing;
    }

    return result;
  }
}
