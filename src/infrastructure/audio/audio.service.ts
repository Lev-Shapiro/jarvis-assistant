import { DEFAULT_PREMIUM_QUALITY, JARVIS_VOICE } from "@/config";
import { AudioAIService } from "@/libraries/openai/audio-ai.service";
import { RecordedAudioData } from "@/types/audio/audio-data.type";
import { JarvisStorageRepository } from "../../domain/storage/storage.repository";
import { AudioPlayerService } from "./audio-player.service";

export class AudioService {
  constructor(
    private readonly audioAIService: AudioAIService,
    private readonly audioRepository: JarvisStorageRepository,
    private readonly audioPlayerService: AudioPlayerService,
  ) {}
  
  async transcribeAudio(audioPath: string): Promise<string> {
    return await this.audioAIService.speechToText(audioPath, DEFAULT_PREMIUM_QUALITY);
  }

  async speak(text: string): Promise<RecordedAudioData> {
    const audioData = await this.audioAIService.textToSpeech(text, JARVIS_VOICE);
    
    const audioId = Date.now().toString();
    const audioPath = this.audioRepository.getPath(`${audioId}.mp3`);

    this.audioRepository.save(audioPath, audioData.buffer);

    await this.audioPlayerService.playAudio(audioPath);

    return audioData;
  }

  clearAllAudioFiles() {
    this.audioRepository.clearAll();
  }
}
