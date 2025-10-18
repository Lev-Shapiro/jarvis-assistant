import { JARVIS_AUDIO_PATH, JARVIS_CAMERA_PATH } from "./config";
import { JarvisStorageRepository } from "./domain/storage/storage.repository";
import { AudioPlayerService } from "./infrastructure/audio/audio-player.service";
import { AudioToolbarService } from "./infrastructure/audio/audio-toolbar.service";
import { AudioService } from "./infrastructure/audio/audio.service";
import { JarvisAIService } from "./infrastructure/brain/jarvis-ai.service";
import { ActionExecutor } from "./infrastructure/browser/action/executor";
import { BrowserConnectionService } from "./infrastructure/browser/browser-connection.service";
import { ConnectionRepository } from "./infrastructure/browser/connection-repository";
import { ContrastTestingService } from "./infrastructure/contrast-testing/contrast-testing.service";
import { TextInputService } from "./infrastructure/conversation/text-input.service";
import { ErrorNotificationService } from "./infrastructure/error-notification/error-notification.service";
import { InfobarService } from "./infrastructure/infobar/infobar.service";
import { ComputerVisionService } from "./infrastructure/security/computer-vision.service";
import { PasswordVerificationService } from "./infrastructure/security/password-verification.service";
import { SecurityProtocolService } from "./infrastructure/security/security-protocol.service";
import { SecurityService } from "./infrastructure/security/security.service";
import { WindowManager } from "./infrastructure/windows/window-manager";
import { Launcher } from "./launcher";
import { FaceApiService } from "./libraries/faceapi/faceapi.service";
import { AudioAIService } from "./libraries/openai/audio-ai.service";
import { YoutubePlayerService } from "./libraries/youtube/youtube-player.service";
import { YoutubeSearchService } from "./libraries/youtube/youtube-search.service";
import { BrowserReceptors } from "./receptors/shortcuts/browser-receptors";
import { ShortcutMainReceptor } from "./receptors/shortcuts/main-receptor";

export class Application {
  private audioAIService = new AudioAIService();

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

  private passwordVerificationService = new PasswordVerificationService(this.windowManager, this.errorNotificationService);
  private youtubeSearchService = new YoutubeSearchService();
  private youtubePlayerService = new YoutubePlayerService(
    this.youtubeSearchService,
    this.audioPlayerService
  );

  private connectionRepository = new ConnectionRepository();
  private browserReceptors = new BrowserReceptors();
  private browserConnectionService = new BrowserConnectionService(this.connectionRepository, this.browserReceptors);
  private browserActionsService = new ActionExecutor(this.browserConnectionService);

  private audioToolbarService = new AudioToolbarService(this.windowManager, this.audioPlayerService);
  private jarvisAIService = new JarvisAIService(this.audioService, this.youtubePlayerService, this.audioPlayerService, this.audioToolbarService);
  private textInputService = new TextInputService(this.jarvisAIService, this.windowManager, this.errorNotificationService);
  private infobarService = new InfobarService(this.windowManager);

  private contrastTestingService = new ContrastTestingService(this.browserConnectionService, this.browserActionsService, this.jarvisAIService, this.infobarService);

  private shortcutReceptor = new ShortcutMainReceptor(
    this.windowManager,
    this.textInputService,
    this.errorNotificationService,
    this.passwordVerificationService,
    this.contrastTestingService,
  );

  private launcher = new Launcher(
    this.windowManager,
    this.shortcutReceptor,
    this.audioService,
    this.securityService,
    this.youtubePlayerService,
    this.browserConnectionService,
  );

  constructor() {
    this.launcher.initialize();
  }
}
