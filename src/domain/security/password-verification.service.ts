import { ErrorNotificationService } from "@/infrastructure/error-notification/error-notification.service";
import { WindowManager } from "@/infrastructure/windows/window-manager";

/**
 * Handles security password verification for sensitive actions
 * following domain-driven design principles
 */
export class PasswordVerificationService {
  private readonly defaultPassword: string = "jarvis2024"; // For demonstration. In production, use a secure method.
  
  constructor(
    private readonly windowManager: WindowManager,
    private readonly errorNotificationService: ErrorNotificationService,
  ) {}

  async handlePasswordVerification(_event: Electron.IpcMainInvokeEvent, password: string): Promise<boolean> {
    console.log('Received password verification request');
    
    const passwordPopupWindow = this.windowManager.passwordPopupWindow;

    if(!passwordPopupWindow) {
      this.errorNotificationService.notify({
        message: 'Password popup window not found',
        isCritical: true,
        isTerminal: true,
        isApp: true,
        isAudio: false
      });

      return false;
    }
    
    // Notify the renderer that verification is in progress
    if (passwordPopupWindow.instance && passwordPopupWindow.instance.webContents) {
      passwordPopupWindow.instance.webContents.send('verification-status', 'Verifying password...');
    }
    
    // Verify the password
    const isValid = password === this.defaultPassword;
    
    // Send the result back to the renderer
    if (passwordPopupWindow.instance && passwordPopupWindow.instance.webContents) {
      passwordPopupWindow.instance.webContents.send('verification-result', isValid);
    }
    
    return isValid;
  }

  async handleCancelVerification(): Promise<void> {
    console.log('Password verification cancelled');
    
    const passwordPopupWindow = this.windowManager.passwordPopupWindow;
    
    if (passwordPopupWindow) {
      passwordPopupWindow.hide();
    }
  }
} 