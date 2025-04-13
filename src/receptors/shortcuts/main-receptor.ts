import { PasswordVerificationService } from "@/domain/security/password-verification.service";
import { TextInputService } from "@/infrastructure/conversation/text-input.service";
import { ErrorNotificationService } from "@/infrastructure/error-notification/error-notification.service";
import { WindowManager } from "@/infrastructure/windows/window-manager";
import { globalShortcut, ipcMain } from "electron";

export class ShortcutMainReceptor {
  constructor(
    private readonly windowManager: WindowManager,
    private readonly textInputService: TextInputService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly passwordVerificationService: PasswordVerificationService
  ) {
    this.registerIpcHandlers();
  }

  public registerShortcuts() {
    const shortcuts = [
      { key: 'Control+I', handler: this.handleTextInputShortcut.bind(this) },
      { key: 'Control+Q', handler: this.handlePasswordVerificationShortcut.bind(this) }
    ]

    shortcuts.forEach((shortcut) => {
      const result = globalShortcut.register(shortcut.key, shortcut.handler);

      if (!result) {
        console.error(`Failed to register shortcut: ${shortcut.key}`);
      }
    });

    return null;
  }

  public unregisterShortcuts() {
    // Unregister all shortcuts when they are no longer needed
    globalShortcut.unregisterAll();
  }

  public handleTextInputShortcut() {
    const inputPopupWindow = this.windowManager.inputPopupWindow;
    
    if(!inputPopupWindow) {
      this.errorNotificationService.notify({
        message: 'Input popup window not found',
        isCritical: true,
        isTerminal: true,
        isApp: true,
        isAudio: false
      });
      return;
    }

    inputPopupWindow.show();
    inputPopupWindow.focus();
    
    // Safely send the message to the window
    if (inputPopupWindow.instance && inputPopupWindow.instance.webContents) {
      inputPopupWindow.instance.webContents.send('open-input');
    }
  }

  public handlePasswordVerificationShortcut() {
    const passwordPopupWindow = this.windowManager.passwordPopupWindow;
    
    if(!passwordPopupWindow) {
      this.errorNotificationService.notify({
        message: 'Password popup window not found',
        isCritical: true,
        isTerminal: true,
        isApp: true,
        isAudio: false
      });
      return;
    }

    passwordPopupWindow.show();
    passwordPopupWindow.focus();
    
    // Safely send the message to the window
    if (passwordPopupWindow.instance && passwordPopupWindow.instance.webContents) {
      passwordPopupWindow.instance.webContents.send('open-password');
    }
  }

  private registerIpcHandlers() {
    // Register handler for text-input IPC invocation
    ipcMain.handle('text-input', this.handleTextInput.bind(this));
    
    // Register handlers for password verification
    ipcMain.handle('verify-password', this.handlePasswordVerification.bind(this));
    ipcMain.handle('cancel-verification', this.handleCancelVerification.bind(this));
  }

  private async handleTextInput(_event: Electron.IpcMainInvokeEvent, query: string): Promise<void> {
    console.log('Received query in main receptor:', query);
    
    const inputPopupWindow = this.windowManager.inputPopupWindow;

    if(!inputPopupWindow) {
      this.errorNotificationService.notify({
        message: 'Input popup window not found',
        isCritical: true,
        isTerminal: true,
        isApp: true,
        isAudio: false
      });
      return;
    }
    
    await this.textInputService.processTextInput(query);
  }

  private async handlePasswordVerification(_event: Electron.IpcMainInvokeEvent, password: string): Promise<void> {
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
      return;
    }
    
    // Notify the renderer that verification is in progress
    if (passwordPopupWindow.instance && passwordPopupWindow.instance.webContents) {
      passwordPopupWindow.instance.webContents.send('verification-status', 'Verifying password...');
    }
    
    // Verify the password
    const isValid = await this.passwordVerificationService.verifyPassword(password);
    
    // Send the result back to the renderer
    if (passwordPopupWindow.instance && passwordPopupWindow.instance.webContents) {
      passwordPopupWindow.instance.webContents.send('verification-result', isValid);
    }
    
    // If password is valid, quit the application after a brief delay
    if (isValid) {
      setTimeout(() => {
        this.passwordVerificationService.quitApplication();
      }, 1500);
    }
  }

  private async handleCancelVerification(): Promise<void> {
    console.log('Password verification cancelled');
    
    const passwordPopupWindow = this.windowManager.passwordPopupWindow;
    
    if (passwordPopupWindow) {
      passwordPopupWindow.hide();
    }
  }

  public cleanup() {
    this.unregisterShortcuts();
    // Remove IPC handlers when not needed anymore
    ipcMain.removeHandler('text-input');
    ipcMain.removeHandler('verify-password');
    ipcMain.removeHandler('cancel-verification');
  }
}