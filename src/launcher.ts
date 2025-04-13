import { app } from "electron";
import { AudioService } from "./infrastructure/audio/audio.service";
import { SecurityService } from "./infrastructure/security/security.service";
import { WindowManager } from "./infrastructure/windows/window-manager";
import { ShortcutMainReceptor } from "./receptors/shortcuts/main-receptor";
import { wait } from "./scripts/wait";

export class Launcher {
  constructor(
    private readonly windowManager: WindowManager,
    private readonly shortcutReceptor: ShortcutMainReceptor,
    private readonly audioService: AudioService,
    private readonly securityService: SecurityService
  ) {}

  initialize(): void {
    // Wait until the app is ready before creating windows
    app.whenReady().then(async () => {
      this.windowManager.createMainWindow();
      this.windowManager.createInputPopupWindow();
      this.windowManager.createPasswordPopupWindow();
      this.shortcutReceptor.registerShortcuts();
      
      this.setupEventHandlers();

      // await this.securityService.loadTrainingData();
      // await this.securityService.observe();

      // Log that the app is ready and provide instructions
      console.log("======================================================");
      console.log("Jarvis app is ready!");
      console.log("- Press Alt+D to run system diagnostics");
      console.log("- Press Ctrl+I to open text input");
      console.log("- Press Ctrl+Q to open quit confirmation");
      console.log("======================================================");

      await wait(2000);
      await this.testing();
    });
  }

  cleanup(): void {
    this.shortcutReceptor.unregisterShortcuts();
    this.audioService.clearAllAudioFiles();
    this.securityService.stop();
  }

  private setupEventHandlers(): void {
    // Unregister shortcuts when the app quits
    app.on("will-quit", () => {
      this.cleanup();
    });

    // Quit when all windows are closed, except on macOS
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    app.on("activate", () => {
      if (app.isReady()) {
        this.windowManager.createMainWindow();
      }
    });
  }

  private async testing(): Promise<void> {
    // await this.errorNotificationService.notify({
    //   message: "Detected suspicious activity",
    //   isCritical: false,
    //   isApp: false,
    //   isTerminal: true,
    //   isAudio: true,
    // });

    // await this.securityService.activateProtocol();

    // await wait(10000);

    // await this.securityService.deactivateProtocol();
  }
}