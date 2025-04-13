import { InputPopupWindow } from "./main/input-popup.window";
import { MainWindow } from "./main/main.window";
import { PasswordPopupWindow } from "./main/password-popup.window";

export class WindowManager {
  public mainWindow: MainWindow | null = null;
  public inputPopupWindow: InputPopupWindow | null = null;
  public passwordPopupWindow: PasswordPopupWindow | null = null;

  public createMainWindow(): void {
    this.mainWindow = MainWindow.getInstance();
  }

  public createInputPopupWindow(): void {
    this.inputPopupWindow = InputPopupWindow.getInstance();
  }

  public createPasswordPopupWindow(): void {
    this.passwordPopupWindow = PasswordPopupWindow.getInstance();
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
} 