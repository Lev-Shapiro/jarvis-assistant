import { app, globalShortcut } from 'electron';
import { ErrorNotificationService } from '../error-notification/error-notification.service';
import { WindowManager } from "../windows/window-manager";

export class SecurityProtocolService {
  private registeredShortcuts: string[] = [];
  private _isProtocolActive = false;

  constructor(private readonly windowManager: WindowManager, private errorNotificationService: ErrorNotificationService) {}

  get isProtocolActive(): boolean {
    return this._isProtocolActive;
  }

  async activateProtocol() {
    const mainWindow = this.windowManager.mainWindow?.instance;

    if(mainWindow) {
      this._isProtocolActive = true;

      this.errorNotificationService.notify({
        message: "Protocol activated",
        isCritical: false,
        isTerminal: false,
        isApp: true,
        isAudio: true
      });

      // Send event to frontend
      mainWindow.webContents.send('security:activate-protocol');
      
      // Make window full screen
      mainWindow.setFullScreen(true);
      
      // Make window always on top with highest z-index
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      
      // Disable mouse events for clicking outside the app
      mainWindow.setIgnoreMouseEvents(false, { forward: true });
      
      // Prevent window from being closed
      mainWindow.setClosable(false);
      
      // Enable kiosk mode to prevent some system gestures
      mainWindow.setKiosk(true);
      
      // Block common tab switching shortcuts
      this.blockTabSwitchingShortcuts();
      
      // Prevent navigation events
      mainWindow.webContents.on('will-navigate', this.preventNavigation);
      
      // Disable the swipe navigation gesture (macOS)
      app.commandLine.appendSwitch('disable-pinch');
      app.commandLine.appendSwitch('disable-threaded-scrolling');
      
      // Focus the window to ensure it receives keyboard events
      mainWindow.focus();
    } else {
      throw new Error('Main window not found');
    }
  }

  async deactivateProtocol() {
    const mainWindow = this.windowManager.mainWindow?.instance;

    if(mainWindow) {
      this._isProtocolActive = false;
      // Send event to frontend
      mainWindow.webContents.send('security:deactivate-protocol');
      
      // Restore window to normal state
      mainWindow.setFullScreen(false);
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setClosable(true);
      mainWindow.setKiosk(false);
      
      // Unblock tab switching shortcuts
      this.unblockTabSwitchingShortcuts();
      
      // Remove navigation event prevention
      mainWindow.webContents.removeListener('will-navigate', this.preventNavigation);
    } else {
      throw new Error('Main window not found');
    }
  }
  
  private blockTabSwitchingShortcuts() {
    // Common tab switching shortcuts
    const shortcuts = [
      'CommandOrControl+Tab',
      'CommandOrControl+Shift+Tab',
      'Alt+Tab',
      'Alt+Shift+Tab',
      'Command+`',
      'Command+Shift+`',
      'F11'
    ];
    
    // Register all shortcuts
    shortcuts.forEach(shortcut => {
      try {
        globalShortcut.register(shortcut, () => {
          // Do nothing, effectively blocking the shortcut
          return false;
        });
        this.registeredShortcuts.push(shortcut);
      } catch (error) {
        console.error(`Failed to register shortcut: ${shortcut}`, error);
      }
    });
  }
  
  private unblockTabSwitchingShortcuts() {
    // Unregister all previously registered shortcuts
    this.registeredShortcuts.forEach(shortcut => {
      try {
        globalShortcut.unregister(shortcut);
      } catch (error) {
        console.error(`Failed to unregister shortcut: ${shortcut}`, error);
      }
    });
    this.registeredShortcuts = [];
  }
  
  private preventNavigation = (event: Electron.Event) => {
    event.preventDefault();
  }
}