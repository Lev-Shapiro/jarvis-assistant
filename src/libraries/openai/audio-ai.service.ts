import { AIVoice } from "@/types/ai-voice";
import { RecordedAudioData } from "@/types/audio/audio-data.type";
import { SpeechClient, protos as speechProtos } from "@google-cloud/speech";
import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import fs from "fs";


export class AudioAIService {
  private ttsClient: TextToSpeechClient;
  private speechClient: SpeechClient;

  constructor() {
    // Google Cloud clients will use application default credentials
    // Make sure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
    this.ttsClient = new TextToSpeechClient();
    this.speechClient = new SpeechClient();
  }

  async speechToText(
    audioPath: string,
    isPremiumQuality: boolean
  ): Promise<string> {
    const audioBytes = fs.readFileSync(audioPath).toString('base64');

    const audio: speechProtos.google.cloud.speech.v1.IRecognitionAudio = {
      content: audioBytes,
    };

    const config: speechProtos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: speechProtos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      model: isPremiumQuality ? 'latest_long' : 'latest_short',
      enableAutomaticPunctuation: true,
    };

    const request = {
      audio,
      config,
    };

    const [response] = await this.speechClient.recognize(request);
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join('\n') || '';

    return transcription;
  }

  async textToSpeech(
    text: string,
    voice: AIVoice,
  ): Promise<RecordedAudioData> {
    try {
      const startTime = Date.now();

      const languageCode = 'en-GB';

      const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
        input: { text },
        voice: { languageCode, name: voice },
        audioConfig: { 
          audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
          speakingRate: 1.0,
          sampleRateHertz: 24000,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(
        `SpeechService TTS: ${duration}ms. Using Google Cloud TTS. Voice: ${voice}`
      );

      // Convert to buffer
      const buffer = Buffer.from(response.audioContent as Uint8Array);
      return {
        buffer,
        format: "mp3",
      };
    } catch (error) {
      console.error("Error in textToSpeech:", error);
      throw error;
    }
  }
}
