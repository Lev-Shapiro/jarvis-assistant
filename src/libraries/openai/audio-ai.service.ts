import { AIVoice } from "@/types/ai-voice";
import { RecordedAudioData } from "@/types/audio/audio-data.type";
import { AudioAILibraryService } from "./audio/infra/ai.service";
export class AudioAIService {
  constructor(private readonly audioAILibraryService: AudioAILibraryService) {}

  async textToSpeech(
    text: string,
    voice: AIVoice,
  ): Promise<RecordedAudioData> {
    return await this.audioAILibraryService.textToSpeech(text, voice);
  }

  async speechToText(
    audioPath: string,
    isPremiumQuality: boolean
  ): Promise<string> {
    return await this.audioAILibraryService.speechToText(audioPath, isPremiumQuality);
  }
}
