import { ipcMain } from 'electron';
import { EventEmitter } from 'events';
import { WindowManager } from '../windows/window-manager';
import { AudioPlayerService, AudioPlayerStatus } from './audio-player.service';

export class AudioToolbarService {
  private isActive: boolean = false;
  private progressUpdateInterval: NodeJS.Timeout | null = null;
  private currentTrackTitle: string = 'Now Playing';
  private currentTrackDuration: number = 0;
  private progressEmitter: EventEmitter = new EventEmitter();

  constructor(private readonly windowManager: WindowManager, private readonly audioPlayerService: AudioPlayerService) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen to status changes from the audio player
    this.audioPlayerService.onStatusChange((status) => {
      if (status === AudioPlayerStatus.PLAYING) {
        this.startProgressUpdates();
      } else if (status === AudioPlayerStatus.PAUSED) {
        // Handle paused state
      } else if ([AudioPlayerStatus.IDLE, AudioPlayerStatus.ERROR].includes(status)) {
        this.stopProgressUpdates();
        
        if (this.isActive) {
          this.deactivateToolbar();
        }
      }
    });

    // Listen for toolbar actions from the renderer process
    ipcMain.on('audio-toolbar-action', (event, data) => {
      switch (data.action) {
        case 'resume':
          // Placeholder for resume functionality
          // Would need to be implemented in AudioPlayerService
          break;
        case 'pause':
          // Placeholder for pause functionality
          // Would need to be implemented in AudioPlayerService
          break;
        case 'stop':
          this.audioPlayerService.stopAudio();
          break;
        case 'exit':
          this.deactivateToolbar();
          break;
        case 'seek':
          // Placeholder for seek functionality
          // Would need to be implemented in AudioPlayerService
          break;
        default:
          console.error(`Unknown audio toolbar action: ${data.action}`);
      }
    });
  }

  public activateToolbar(trackTitle?: string): void {
    this.isActive = true;
    
    if (trackTitle) {
      this.currentTrackTitle = trackTitle;
      this.windowManager.audioToolbarWindow?.updateTrackInfo(trackTitle);
    }
    
    this.windowManager.audioToolbarWindow?.showToolbar();
    this.startProgressUpdates();
  }

  public deactivateToolbar(): void {
    this.isActive = false;
    this.stopProgressUpdates();
    this.windowManager.audioToolbarWindow?.hideToolbar();
  }

  public updateTrackInfo(title: string, duration: number = 0): void {
    this.currentTrackTitle = title;
    this.currentTrackDuration = duration;
    
    if (this.isActive) {
      this.windowManager.audioToolbarWindow?.updateTrackInfo(title);
    }
  }

  private startProgressUpdates(): void {
    // Stop any existing interval
    this.stopProgressUpdates();
    
    // Start a new progress update interval (every 500ms)
    this.progressUpdateInterval = setInterval(() => {
      // This is a placeholder. In a real implementation, you would get the
      // current time from the audio player service
      const currentTime = 0; // Should be replaced with actual current playback time
      const duration = this.currentTrackDuration || 100; // Fallback duration
      
      if (this.isActive) {
        this.windowManager.audioToolbarWindow?.updateProgress(currentTime, duration);
      }
    }, 500);
  }

  private stopProgressUpdates(): void {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }
  }

  public get isToolbarActive(): boolean {
    return this.isActive;
  }

  public onProgressUpdate(callback: (currentTime: number, duration: number) => void): void {
    this.progressEmitter.on('progress', callback);
  }
} 