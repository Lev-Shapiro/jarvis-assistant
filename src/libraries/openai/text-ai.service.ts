import { SomeObject } from "@/types/some-object";
import { z } from "zod";

import { AIChat } from "@/types/chat/chat.type";
import { AILogOptions } from "./domain/ai-log-options";
import { AILogService } from "./text/domain/ai-log.service";
import { AIOptions } from "./text/domain/ai-options";
import { AIResponse } from "./text/domain/ai-response";
import { AIResponseType } from "./text/domain/ai-response-format";
import { AIConcurrentService } from "./text/infra/ai-concurrent.service";
import { AIService } from "./text/infra/ai.service";


export class AITextService {
  constructor(
    private readonly aiService: AIService,
    private readonly aiConcurrentService: AIConcurrentService,
    private readonly aiLogService: AILogService
  ) {}

  /**
   * Asks the AI service with logging enabled.
   *
   * @param conversation - The conversation to ask the AI about.
   * @param aiOptions - The options for the AI request.
   * @param logOptions - The options for logging.
   * @returns The response from the AI request.
   * @throws HttpException if the AI request fails.
   */
  async ask<T extends string | SomeObject>(
    chat: AIChat,
    aiOptions: AIOptions<T>,
    logOptions: AILogOptions
  ): Promise<AIResponse<T>> {
    return await this.aiLogService.log(logOptions, () =>
      this.aiService.ask(chat, aiOptions)
    );
  }

  async askStructured<T extends z.ZodType>(
    chat: AIChat,
    aiOptions: AIOptions<T>,
    logOptions: AILogOptions
  ): Promise<AIResponse<T>> {
    return await this.aiLogService.log(logOptions, () =>
      this.aiService.askStructured(chat, aiOptions)
    );
  }

  async askMany<T extends AIResponseType>(
    chats: AIChat[],
    aiOptions: AIOptions<T>,
    logOptions: AILogOptions
  ): Promise<AIResponse<T>[]> {
    return await this.aiLogService.logMany(logOptions, logOptions, () =>
      this.aiConcurrentService.askMany(chats, aiOptions)
    );
  }
}
