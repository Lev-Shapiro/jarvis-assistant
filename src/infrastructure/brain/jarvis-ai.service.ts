import { AILogOptions } from "@/libraries/openai/domain/ai-log-options";
import { AI_MODELS } from "@/libraries/openai/domain/ai-models";
import { AITextService } from "@/libraries/openai/text-ai.service";
import { AIRequestFormat } from "@/libraries/openai/text/domain/ai-response-format";
import { AudioService } from "../audio/audio.service";

export class JarvisAIService {
  constructor(
    private readonly aiTextService: AITextService,
    private readonly aiAudioService: AudioService
  ) {}

  async ask(query: string) {
    const response = await this.aiTextService.ask<string>([
      {
        role: "system",
        content: `You are Jarvis, an intelligent voice assistant with a distinct personality. Provide concise, accurate responses with a touch of friendliness. Focus on delivering practical information rather than lengthy explanations. When asked for instructions or how-to guidance, break down complex processes into clear, numbered steps. For factual questions, prioritize up-to-date, verified information. If you cannot provide a definitive answer, clearly acknowledge this rather than speculating. Adapt your tone to match the urgency and context of each query. DO NOT use markdown formatting, use plain text. Adjust your response to spoken language, for example do not use symbols like * or _ or #, neither can you use phrases like "e.g." or "i.e." or "etc.".`,
      },
      {
        role: "user",
        content: query,
      },
    ], {
      model: AI_MODELS.GEMINI_2_FLASH,
      responseFormat: AIRequestFormat.TEXT,
      temperature: 0.5,
    }, AILogOptions.default("Jarvis AI Service"));

    return response;
  }
  
  async askAndSpeak(query: string) {
    const response = await this.ask(query);
    await this.aiAudioService.speak(response.content);
  }
}
