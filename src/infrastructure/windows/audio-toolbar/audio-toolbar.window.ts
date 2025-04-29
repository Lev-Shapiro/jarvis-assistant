import { BaseWindow } from '@/infrastructure/windows/base-window';
import { WindowConfig } from '@/types/window-config';
import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

export const audioToolbarWindowConfig: WindowConfig = {
  width: 400,
  height: 100,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  skipTaskbar: true,
  resizable: false,
  show: false,
  webPreferences: {
    preload: path.join(__dirname, '../../../preload.js'),
    nodeIntegration: true,
    contextIsolation: false,
  },
  // Optional: Add frame: false and transparent: true later for custom window shapes
  // titleBarStyle: 'hidden', // Example for macOS title bar styling
};

export class AudioToolbarWindow extends BaseWindow {
  private static instance: AudioToolbarWindow | null = null;
  private trackProgress: number = 0;
  private trackDuration: number = 0;
  private trackTitle: string = '';

  constructor(config: WindowConfig = audioToolbarWindowConfig) {
    super(config);

    this.createWindow();
  }

  public static getInstance(): AudioToolbarWindow {
    if (!AudioToolbarWindow.instance) {
      AudioToolbarWindow.instance = new AudioToolbarWindow();
    }
    return AudioToolbarWindow.instance;
  }

  protected createWindow(): void {
    this.window = new BrowserWindow(this.config);
    this.loadContent(path.join(__dirname, '../../../pages/audio-toolbar/audio-toolbar.html'));
    this.positionWindowAtBottom();
    this.handleEvents();
  }

  private positionWindowAtBottom(): void {
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = this.config.width || 400;
    
    this.window!.setPosition(
      Math.floor((screenWidth - windowWidth) / 2),
      screen.getPrimaryDisplay().workAreaSize.height - 120
    );
  }

  protected handleEvents(): void {
    this.window!.on('blur', () => {
      // Optional: You could auto-hide the toolbar when it loses focus
      // this.window!.hide();
    });
  }

  public updateProgress(currentTime: number, duration: number): void {
    this.trackProgress = currentTime;
    this.trackDuration = duration;
    
    this.window!.webContents.send('update-progress', {
      currentTime,
      duration
    });
  }

  public updateTrackInfo(title: string): void {
    this.trackTitle = title;
    this.window!.webContents.send('update-track-info', { title });
  }

  public showToolbar(): void {
    this.positionWindowAtBottom();
    this.window!.show();
    this.window!.focus();
  }

  public hideToolbar(): void {
    this.window!.hide();
  }
}
