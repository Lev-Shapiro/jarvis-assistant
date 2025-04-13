import { WindowConfig } from '@/types/window-config';
import { BrowserWindow } from 'electron';

export abstract class BaseWindow {
  protected window: BrowserWindow | null = null;
  protected readonly config: WindowConfig;

  constructor(config: WindowConfig) {
    this.config = config;
  }

  public get isOpen(): boolean {
    return this.window !== null && !this.window.isDestroyed();
  }

  public get instance(): BrowserWindow {
    if(!this.window) {
      throw new Error('Window not found');
    }

    return this.window;
  }

  public close(): void {
    if (this.isOpen) {
      this.window!.close();
    }
  }

  public focus(): void {
    if (this.isOpen) {
      this.window!.focus();
    }
  }

  public showInactive(): void {
    if (this.isOpen) {
      this.window!.showInactive();
    }
  }

  public show(): void {
    if (this.isOpen) {
      this.window!.show();
    }
  }

  protected abstract createWindow(): void;
  protected abstract handleEvents(): void;
  
  protected loadContent(url: string): void {
    if (!this.isOpen) return;
    
    if (url.startsWith('http')) {
      this.window!.loadURL(url);
    } else {
      this.window!.loadFile(url);
    }
  }
} 