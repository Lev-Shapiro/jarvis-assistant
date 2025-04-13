import { AIChat } from '@/types/chat/chat.type';
import { SomeObject } from '@/types/some-object';
import { z } from 'zod';
import { AIOptions } from '../domain/ai-options';
import { AIResponse } from '../domain/ai-response';
import { AIResponseType } from '../domain/ai-response-format';
import { AIService } from './ai.service';


export class AIConcurrentService {
  private static instance: AIConcurrentService | null = null;

  constructor(private readonly aiService: AIService) {}

  static getInstance(aiService: AIService): AIConcurrentService {
    if (!AIConcurrentService.instance) {
      AIConcurrentService.instance = new AIConcurrentService(aiService);
    }
    return AIConcurrentService.instance;
  }

  async askMany<T extends AIResponseType>(
    conversations: AIChat[],
    options: AIOptions<T>,
  ): Promise<AIResponse<T>[]> {
    const requests = conversations.map((conversation) =>
      this.aiService.ask(conversation, options),
    );
    return await Promise.all(requests);
  }

  async askManyStructured<T extends z.ZodType>(
    conversations: AIChat[],
    options: AIOptions<T>,
  ): Promise<AIResponse<T>[]> {
    const requests = conversations.map((conversation) =>
      this.aiService.askStructured(conversation, options),
    );
    return await Promise.all(requests);
  }

  async askManyJson<T extends SomeObject>(
    conversations: AIChat[],
    options: AIOptions<T>,
  ): Promise<AIResponse<T>[]> {
    const requests = conversations.map((conversation) =>
      this.aiService.askJson<T>(conversation, options),
    );
    return await Promise.all(requests);
  }
}
