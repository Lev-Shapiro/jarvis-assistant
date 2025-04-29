import { BaseWindowConfig, WindowConfig } from "@/types/window-config";
import { BrowserWindow, screen } from "electron";
import path from "path";
import { BaseWindow } from "../base-window";

// Base configuration for all windows
const baseConfig: BaseWindowConfig = {
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  skipTaskbar: true,
  show: false,
  focusable: true,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    // Disable specific Chrome DevTools Protocol domains to prevent errors
    additionalArguments: ['--disable-features=Autofill'],
  }
};

export const passwordPopupConfig = (): WindowConfig => {
  // Get screen dimensions to position the window in the center
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  // Password popup should be centered on screen
  const popupWidth = 400;
  const popupHeight = 280;
  
  return {
    ...baseConfig,
    width: popupWidth,
    height: popupHeight,
    x: Math.round((screenWidth - popupWidth) / 2),
    y: Math.round((screenHeight - popupHeight) / 2),
    resizable: false,
    webPreferences: {
      ...baseConfig.webPreferences,
      nodeIntegration: true,
      preload: path.join(__dirname, '../../../preload.js'),
    },
  };
};

export class PasswordPopupWindow extends BaseWindow {  
  private static instance: PasswordPopupWindow | null = null;
  
  constructor(config: WindowConfig = passwordPopupConfig()) {
    super(config);
    this.createWindow();
  }

  public static getInstance(): PasswordPopupWindow {
    if (!PasswordPopupWindow.instance) {
      PasswordPopupWindow.instance = new PasswordPopupWindow();
    }
    return PasswordPopupWindow.instance;
  }

  protected createWindow(): void {
    this.window = new BrowserWindow(this.config);
    this.loadContent(path.join(__dirname, '../../../pages/password-popup/password-popup.html'));
    this.handleEvents();
  }
  
  protected handleEvents(): void {
    if (!this.isOpen) return;

    this.window!.on('closed', () => {
      this.window = null;
      PasswordPopupWindow.instance = null;
    });
  }

  /**
   * Hides the password popup window
   */
  public hide(): void {
    if (this.window) {
      this.window.hide();
      
      // Send a message to the renderer to reset the form
      if (this.window.webContents) {
        this.window.webContents.send('hide-password-popup');
      }
    }
  }
} 