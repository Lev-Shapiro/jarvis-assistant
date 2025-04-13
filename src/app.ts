import { JARVIS_AUDIO_PATH, JARVIS_CAMERA_PATH } from "./config";
import { PasswordVerificationService } from "./domain/security/password-verification.service";
import { JarvisStorageRepository } from "./domain/storage/storage.repository";
import { AudioPlayerService } from "./infrastructure/audio/audio-player.service";
import { AudioService } from "./infrastructure/audio/audio.service";
import { JarvisAIService } from "./infrastructure/brain/jarvis-ai.service";
import { TextInputService } from "./infrastructure/conversation/text-input.service";
import { ErrorNotificationService } from "./infrastructure/error-notification/error-notification.service";
import { ComputerVisionService } from "./infrastructure/security/computer-vision.service";
import { SecurityProtocolService } from "./infrastructure/security/security-protocol.service";
import { SecurityService } from "./infrastructure/security/security.service";
import { WindowManager } from "./infrastructure/windows/window-manager";
import { Launcher } from "./launcher";
import { FaceApiService } from "./libraries/faceapi/faceapi.service";
import { AudioAIService } from "./libraries/openai/audio-ai.service";
import { AudioAILibraryService } from "./libraries/openai/audio/infra/ai.service";
import { AITextService } from "./libraries/openai/text-ai.service";
import { AILogService } from "./libraries/openai/text/domain/ai-log.service";
import { AIConcurrentService } from "./libraries/openai/text/infra/ai-concurrent.service";
import { AIService } from "./libraries/openai/text/infra/ai.service";
import { YoutubePlayerService } from "./libraries/youtube/youtube-player.service";
import { YoutubeSearchService } from "./libraries/youtube/youtube-search.service";
import { ShortcutMainReceptor } from "./receptors/shortcuts/main-receptor";

export class Application {
  private audioAILibraryService = AudioAILibraryService.getInstance();
  private audioAIService = new AudioAIService(this.audioAILibraryService);

  private aiService = AIService.getInstance();
  private aiConcurrentService = new AIConcurrentService(this.aiService);
  private aiLogService = new AILogService();
  private aiTextService = new AITextService(this.aiService, this.aiConcurrentService, this.aiLogService);

  private audioStorageRepository = new JarvisStorageRepository(JARVIS_AUDIO_PATH);
  private audioPlayerService = new AudioPlayerService();
  private audioService = new AudioService(
    this.audioAIService,
    this.audioStorageRepository,
    this.audioPlayerService
  );

  private windowManager = new WindowManager();
  private cameraStorageRepository = new JarvisStorageRepository(JARVIS_CAMERA_PATH);
  private computerVisionService = new ComputerVisionService(this.cameraStorageRepository);
  private errorNotificationService = new ErrorNotificationService(this.audioService, this.windowManager);
  private securityProtocolService = new SecurityProtocolService(this.windowManager, this.errorNotificationService);
  private faceApiService = new FaceApiService();
  private securityService = new SecurityService(this.computerVisionService, this.securityProtocolService, this.faceApiService, this.errorNotificationService);

  private jarvisAIService = new JarvisAIService(this.aiTextService, this.audioService);
  private textInputService = new TextInputService(this.jarvisAIService, this.windowManager, this.errorNotificationService, this.audioService);
  private passwordVerificationService = new PasswordVerificationService(this.windowManager, this.errorNotificationService);
  private shortcutReceptor = new ShortcutMainReceptor(
    this.windowManager, 
    this.textInputService, 
    this.errorNotificationService,
    this.passwordVerificationService,
  );

  private youtubeSearchService = new YoutubeSearchService();
  private youtubePlayerService = new YoutubePlayerService(
    this.youtubeSearchService,
    this.audioPlayerService
  );

  private launcher = new Launcher(
    this.windowManager,
    this.shortcutReceptor,
    this.audioService,
    this.securityService,
    this.youtubePlayerService
  );

  constructor() {
    this.launcher.initialize();
  }
}
