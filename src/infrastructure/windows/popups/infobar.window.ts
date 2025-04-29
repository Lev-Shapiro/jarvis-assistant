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

export const infobarConfig = (): WindowConfig => {
  // Get screen dimensions to position the window
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  // Info popup dimensions (example: larger than password popup)
  const popupWidth = screenWidth * 0.25;
  const popupHeight = screenHeight;

  // Center the popup on screen (adjust position as needed)
  return {
    ...baseConfig,
    width: popupWidth,
    height: popupHeight,
    x: 0,
    y: 0,
    resizable: false, // Or true if resizing is desired
    webPreferences: {
      ...baseConfig.webPreferences,
      nodeIntegration: true, // Assuming nodeIntegration is needed for results page
      preload: path.join(__dirname, '../../../preload.js'), // Adjust path if needed
    },
  };
};

export class InfobarWindow extends BaseWindow {
  private static instance: InfobarWindow | null = null;

  constructor(config: WindowConfig = infobarConfig()) {
    super(config);
    this.createWindow();
  }

  public static getInstance(): InfobarWindow {
    if (!InfobarWindow.instance) {
      InfobarWindow.instance = new InfobarWindow();
    }
    return InfobarWindow.instance;
  }

  protected createWindow(): void {
    this.window = new BrowserWindow(this.config);
    // Update path to the info popup HTML file
    this.loadContent(path.join(__dirname, '../../../pages/infobar/infobar.html'));
    this.handleEvents();
  }

  protected handleEvents(): void {
    if (!this.isOpen) return;

    this.window!.on('closed', () => {
      this.window = null;
      InfobarWindow.instance = null;
    });
  }

  public hide(): void {
    if (this.window) {
      this.window.hide();
    }
  }
} 