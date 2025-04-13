import { SomeObject } from '@/types/some-object';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { AIChat } from '@/types/chat/chat.type';
import { AIProvider } from '../../domain/ai-provider';
import { AIOptions } from '../domain/ai-options';
import { AIResponse } from '../domain/ai-response';
import { AIRequestFormat, AIResponseType } from '../domain/ai-response-format';

// Custom error classes for better error handling
export class AIServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class ModelNotSupportedError extends AIServiceError {
  constructor(model: string) {
    super(`Model ${model} is not supported`);
    this.name = 'ModelNotSupportedError';
  }
}

export class AIProviderError extends AIServiceError {
  constructor(provider: string, originalError: unknown) {
    super(`Error from AI provider ${provider}: ${originalError instanceof Error ? originalError.message : String(originalError)}`);
    this.name = 'AIProviderError';
    this.cause = originalError;
  }
}

export class AIService {
  private openai: OpenAI;
  private googleAI: GoogleGenAI;
  private readonly maxRetries = 2;
  private readonly retryDelay = 1000; // 1 second

  private constructor() {
    try {
      // Initialize OpenAI
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new AIServiceError('OPENAI_API_KEY environment variable not set');
      }
      this.openai = new OpenAI({ apiKey: openaiApiKey });

      // Initialize Google Gemini
      const googleApiKey = process.env.GOOGLE_API_KEY;
      if (!googleApiKey) {
        throw new AIServiceError('GOOGLE_API_KEY environment variable not set');
      }
      this.googleAI = new GoogleGenAI({ apiKey: googleApiKey });
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(`Failed to initialize AIService: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static getInstance(): AIService {
    try {
      return new AIService();
    } catch (error) {
      console.error('Failed to create AIService instance:', error);
      throw error;
    }
  }

  private async withRetry<T>(operation: () => Promise<T>, retries = this.maxRetries): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.warn(`Operation failed, retrying... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  async ask<T extends AIResponseType>(
    conversation: AIChat,
    options: AIOptions<T>,
  ) {
    try {
      if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
        throw new AIServiceError('Invalid conversation: Conversation must be a non-empty array');
      }

      if (!options || !options.model) {
        throw new AIServiceError('Invalid options: Model must be specified');
      }

      if (options.responseFormat === AIRequestFormat.TEXT) {
        return this.askText<T>(conversation, options);
      }

      if (options.responseFormat === AIRequestFormat.JSON_OBJECT) {
        return this.askJson<T>(conversation, options);
      }

      if (options.responseFormat === AIRequestFormat.SCHEMA) {
        return this.askStructured(
          conversation,
          options as AIOptions<z.ZodType>,
        ) as Promise<AIResponse<T>>;
      }

      throw new AIServiceError(`Unsupported response format: ${options.responseFormat}`);
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(`Error in ask: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Ask method to prompt the AI model
  async askText<T extends AIResponseType = string>(
    conversation: AIChat,
    options: AIOptions<T>,
  ): Promise<AIResponse<T>> {
    try {
      const { model, temperature } = options;

      if (!model.structuredResponseFormat) {
        throw new ModelNotSupportedError(model.name);
      }

      if (model.provider === AIProvider.GOOGLE) {        
        // Convert OpenAI chat format to Gemini format
        const geminiMessages = conversation.map(msg => {
          // Handle system message by converting to user message (Gemini doesn't have system)
          if (msg.role === 'system') {
            return {
              role: 'user',
              parts: [{ text: msg.content as string }]
            };
          }
          
          return {
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content as string }]
          };
        });
        
        const response = await this.withRetry(async () => {
          try {
            return await this.googleAI.models.generateContent({
              model: model.name,
              contents: geminiMessages,
            });
          } catch (error) {
            throw new AIProviderError('Google Gemini', error);
          }
        });

        return new AIResponse<T>(model, response.text ?? '', false);
      } else {
        // OpenAI implementation
        const res = await this.withRetry(async () => {
          try {
            return await this.openai.chat.completions.create({
              model: model.name,
              messages: conversation,
              temperature,
            });
          } catch (error) {
            throw new AIProviderError('OpenAI', error);
          }
        });

        return new AIResponse<T>(model, res.choices[0]?.message.content ?? '', false);
      }
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(`Error in askText: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // AskJson method, marked as deprecated
  /**
   * @deprecated
   * Use askStructured for structured responses. This method will be removed in the future.
   */
  async askJson<T extends AIResponseType = SomeObject>(
    conversation: AIChat,
    options: AIOptions<T>,
  ): Promise<AIResponse<T>> {
    console.warn(
      'askJson is deprecated. Use askStructured for structured JSON responses.',
    );

    try {
      const { model, temperature } = options;

      if (model.provider === AIProvider.GOOGLE) {        
        // Convert OpenAI chat format to Gemini format
        const geminiMessages = conversation.map(msg => {
          // Handle system message by converting to user message (Gemini doesn't have system)
          if (msg.role === 'system') {
            return {
              role: 'user',
              parts: [{ text: `${msg.content as string} Respond with valid JSON only.` }]
            };
          }
          
          return {
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content as string }]
          };
        });
        
        const response = await this.withRetry(async () => {
          try {
            return await this.googleAI.models.generateContent({
              model: model.name,
              contents: geminiMessages,
            });
          } catch (error) {
            throw new AIProviderError('Google Gemini', error);
          }
        });

        return new AIResponse<T>(model, response.text ?? '', true);
      } else {
        // OpenAI implementation
        const res = await this.withRetry(async () => {
          try {
            return await this.openai.chat.completions.create({
              model: model.name,
              messages: conversation,
              temperature,
              response_format: { type: 'json_object' },
            });
          } catch (error) {
            throw new AIProviderError('OpenAI', error);
          }
        });

        return new AIResponse<T>(model, res.choices[0]?.message.content ?? '', true);
      }
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(`Error in askJson: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Structured AI prompting
  async askStructured<T extends AIResponseType = z.ZodType>(
    conversation: AIChat,
    options: AIOptions<T>,
  ): Promise<AIResponse<T>> {
    try {
      const { model, temperature } = options;

      if (!options.schema) {
        throw new AIServiceError('Schema must be provided for structured responses');
      }

      if (model.provider === AIProvider.GOOGLE) {        
        // Convert OpenAI chat format to Gemini format
        const geminiMessages = conversation.map(msg => {
          // Handle system message by converting to user message (Gemini doesn't have system)
          if (msg.role === 'system') {
            return {
              role: 'user',
              parts: [{ text: `${msg.content as string} Respond with valid JSON matching the following schema: ${this.getSchemaDescription(options.schema!)}` }]
            };
          }
          
          return {
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content as string }]
          };
        });
        
        const response = await this.withRetry(async () => {
          try {
            return await this.googleAI.models.generateContent({
              model: model.name,
              contents: geminiMessages,
            });
          } catch (error) {
            throw new AIProviderError('Google Gemini', error);
          }
        });

        return new AIResponse<T>(model, response.text ?? '', true);
      } else {
        // OpenAI implementation
        const res = await this.withRetry(async () => {
          try {
            return await this.openai.chat.completions.create({
              model: model.name,
              messages: conversation,
              temperature,
              response_format: zodResponseFormat(options.schema!, 'result'),
            });
          } catch (error) {
            console.error('OpenAI API error:', error);
            throw new AIProviderError('OpenAI', error);
          }
        });

        return new AIResponse<T>(model, res.choices[0]?.message.content ?? '', true);
      }
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(`Error in askStructured: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Helper to safely extract schema description
  private getSchemaDescription(schema: z.ZodType): string {
    try {
      // For Zod schemas, try to create a sample structure description
      const description = schema.description || 'a valid JSON object';
      // Don't try to access shape directly as it may not be available on all ZodTypes
      return description;
    } catch (error) {
      console.warn('Failed to get schema description:', error);
      // Fallback to a more generic description
      return 'a valid JSON object';
    }
  }
}
