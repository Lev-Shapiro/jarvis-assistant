import { app, ipcMain } from "electron";
import { AudioService } from "./infrastructure/audio/audio.service";
import { BrowserConnectionService } from "./infrastructure/browser/browser-connection.service";
import { SecurityService } from "./infrastructure/security/security.service";
import { WindowManager } from "./infrastructure/windows/window-manager";
import { YoutubePlayerService } from "./libraries/youtube/youtube-player.service";
import { ShortcutMainReceptor } from "./receptors/shortcuts/main-receptor";

export class Launcher {
  constructor(
    private readonly windowManager: WindowManager,
    private readonly shortcutReceptor: ShortcutMainReceptor,
    private readonly audioService: AudioService,
    private readonly securityService: SecurityService,
    private readonly youtubePlayerService: YoutubePlayerService,
    private readonly browserConnectionService: BrowserConnectionService,
  ) { }

  initialize(): void {
    app.whenReady().then(async () => {
      this.windowManager.createMainWindow();
      this.windowManager.createInfobarWindow();
      this.windowManager.createInputPopupWindow();
      this.windowManager.createPasswordPopupWindow();
      this.windowManager.createAudioToolbarWindow();
      this.shortcutReceptor.registerShortcuts();

      this.setupEventHandlers();

      await this.securityService.loadTrainingData();
      await this.securityService.activate();

      console.log("======================================================");
      console.log("Jarvis app is ready!");
      console.log("- Press Alt+D to run system diagnostics");
      console.log("- Press Ctrl+I to open text input");
      console.log("- Press Ctrl+Q to open quit confirmation");
      console.log("======================================================");

      // await this.browserConnectionService.connect({ waitUntilConnected: true });
    });
  }

  async cleanup(): Promise<void> {
    ipcMain.removeHandler('app-quit');

    this.shortcutReceptor.unregisterShortcuts();
    this.audioService.clearAllAudioFiles();
    await this.securityService.deactivate();
  }

  private setupEventHandlers(): void {
    ipcMain.handle('app-quit', async () => {
      await this.cleanup();
      app.quit();
    });

    // Unregister shortcuts when the app quits
    app.on("will-quit", async () => {
      await this.cleanup();
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
}