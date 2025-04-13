import { WindowConfig } from "@/types/window-config";
import { BrowserWindow } from "electron";
import path from "path";
import { BaseWindow } from "../base-window";

// Base configuration for all windows
export const mainWindowConfig: WindowConfig = {
  width: 800,
  height: 600,
  webPreferences: {
    preload: path.join(__dirname, '../../../preload.js'),
    nodeIntegration: true,
  },
  // Optional: Add frame: false and transparent: true later for custom window shapes
  // titleBarStyle: 'hidden', // Example for macOS title bar styling
};

export class MainWindow extends BaseWindow {
  private static instance: MainWindow | null = null;

  private constructor(config: WindowConfig = mainWindowConfig) {
    super(config);
    this.createWindow();
  }

  public static getInstance(): MainWindow {
    if (!MainWindow.instance) {
      MainWindow.instance = new MainWindow();
    }

    return MainWindow.instance;
  }

  protected createWindow(): void {
    this.window = new BrowserWindow(this.config);
    
    this.loadContent(path.join(__dirname, '../../../pages/main/main.html'));
    this.handleEvents();
  }

  protected handleEvents(): void {
    if (!this.isOpen) return;

    this.window!.on('closed', () => {
      this.window = null;
      MainWindow.instance = null;
    });
  }
}