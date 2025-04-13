import { wait } from '@/scripts/wait';
import { AudioService } from '../audio/audio.service';
import { WindowManager } from '../windows/window-manager';
import { ErrorNotification } from './error-notification.type';

export class ErrorNotificationService {
  constructor(
    private readonly audioService: AudioService,
    private readonly windowManager: WindowManager
  ) {}

  async notify(notification: ErrorNotification) {
    // Handle all notifications concurrently
    const notificationPromises: Promise<void>[] = [];
    
    if(notification.isTerminal) {
      notificationPromises.push(this.sendTerminalError(notification.message));
    }

    if(notification.isApp) {
      notificationPromises.push(this.sendAppError(notification.message));
    }

    if(notification.isAudio) {
      notificationPromises.push(this.sendAudioError(notification.message));
    }

    // Wait for all notifications to complete concurrently
    await Promise.all(notificationPromises);

    if(notification.isCritical) {
      await wait(3000);
      
      await this.exitApp();
    }
  }
  
  /**
   * Send a terminal error notification
   * @param message - The message to send
   */
  private async sendTerminalError(message: string) {
    console.error(message);
  }

  /**
   * Send an app error notification
   * @param message - The message to send
   */
  private async sendAppError(message: string) {
    const mainWindow = this.windowManager.mainWindow?.instance;

    if(mainWindow) {
      mainWindow.webContents.send('notification:show-error', message);
    } else {
      throw new Error('Main window not found');
    }
  }

  /**
   * Send an audio error notification
   * @param message - The message to send
   */
  private async sendAudioError(message: string) {
    await this.audioService.speak(message);
  }

  private async exitApp() {
    try {
      console.error('Application terminated due to a critical error');
      process.exit(1);
    } catch (error) {
      // In case process.exit fails for some reason (e.g., in a browser environment)
      console.error('Failed to exit application:', error);
      // Attempt to terminate in a different way if in browser context
      if (typeof window !== 'undefined') {
        window.close();
      }
    }
  }
}