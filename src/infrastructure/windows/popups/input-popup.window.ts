import { BaseWindowConfig, WindowConfig } from "@/types/window-config";
import { BrowserWindow } from "electron";
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

export const textInputPopupConfig = (screenWidth: number): WindowConfig => ({
  ...baseConfig,
  width: 600,
  height: 80,
  x: Math.round((screenWidth - 600) / 2),
  y: 0,
  resizable: false,
  webPreferences: {
    ...baseConfig.webPreferences,
    nodeIntegration: true,
    preload: path.join(__dirname, '../../../preload.js'),
  },
});

export class InputPopupWindow extends BaseWindow {  
  private static instance: InputPopupWindow | null = null;
  constructor(config: WindowConfig = textInputPopupConfig(1440)) {
    super(config);

    this.createWindow();
  }

  public static getInstance(): InputPopupWindow {
    if (!InputPopupWindow.instance) {
      InputPopupWindow.instance = new InputPopupWindow();
    }
    return InputPopupWindow.instance;
  }

  protected createWindow(): void {
    this.window = new BrowserWindow(this.config);

    this.loadContent(path.join(__dirname, '../../../pages/input-popup/input-popup.html'));
    this.handleEvents();
  }
  

  protected handleEvents(): void {
    if (!this.isOpen) return;

    this.window!.on('closed', () => {
      this.window = null;
      InputPopupWindow.instance = null;
    });
  }
}

