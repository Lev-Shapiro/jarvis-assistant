import { AudioToolbarWindow } from "./audio-toolbar/audio-toolbar.window";
import { InfobarWindow } from "./popups/infobar.window";
import { InputPopupWindow } from "./popups/input-popup.window";
import { MainWindow } from "./popups/main.window";
import { PasswordPopupWindow } from "./popups/password-popup.window";

export class WindowManager {
  public mainWindow: MainWindow | null = null;
  public inputPopupWindow: InputPopupWindow | null = null;
  public passwordPopupWindow: PasswordPopupWindow | null = null;
  public audioToolbarWindow: AudioToolbarWindow | null = null;
  public infobarWindow: InfobarWindow | null = null;

  public createMainWindow(): void {
    this.mainWindow = MainWindow.getInstance();
  }

  public createInputPopupWindow(): void {
    this.inputPopupWindow = InputPopupWindow.getInstance();
  }

  public createPasswordPopupWindow(): void {
    this.passwordPopupWindow = PasswordPopupWindow.getInstance();
  }

  public createAudioToolbarWindow(): void {
    this.audioToolbarWindow = AudioToolbarWindow.getInstance();
  }

  public createInfobarWindow(): void {
    this.infobarWindow = InfobarWindow.getInstance();
  }

  public closeInputPopupWindow(): void {
    if (this.inputPopupWindow) {
      this.inputPopupWindow.close();
    }
  }

  public closePasswordPopupWindow(): void {
    if (this.passwordPopupWindow) {
      this.passwordPopupWindow.close();
    }
  }

  public closeAudioToolbarWindow(): void {
    if (this.audioToolbarWindow) {
      this.audioToolbarWindow.close();
    }
  }

  public closeInfobarWindow(): void {
    if (this.infobarWindow) {
      this.infobarWindow.close();
    }
  }
} 