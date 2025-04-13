import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export enum AudioPlayerStatus {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error'
}

export class AudioPlayerService {
  private currentProcess: any = null;
  private status: AudioPlayerStatus = AudioPlayerStatus.IDLE;
  private statusEmitter: EventEmitter = new EventEmitter();

  constructor() {
    this.statusEmitter.setMaxListeners(0);
  }

  async playAudio(audioPath: string): Promise<void> {
    try {
      // Stop any current audio playing
      await this.stopAudio();
      
      // Use afplay for MacOS
      this.currentProcess = spawn('afplay', [audioPath]);
      this.setStatus(AudioPlayerStatus.PLAYING);
      
      // Handle process completion
      this.currentProcess.on('close', (code: number) => {
        if (code === 0) {
          // Normal completion
          this.setStatus(AudioPlayerStatus.IDLE);
        } else if (code !== null) {
          // Error completion
          this.setStatus(AudioPlayerStatus.ERROR);
        }
        this.currentProcess = null;
      });
      
      // Handle process errors
      this.currentProcess.on('error', (err: Error) => {
        this.setStatus(AudioPlayerStatus.ERROR);
        this.currentProcess = null;
      });
    } catch (error) {
      this.setStatus(AudioPlayerStatus.ERROR);
      throw error;
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.currentProcess) {
        this.currentProcess.kill();
        this.currentProcess = null;
        this.setStatus(AudioPlayerStatus.IDLE);
      }
    } catch (error) {
      this.setStatus(AudioPlayerStatus.ERROR);
      throw error;
    }
  }

  getStatus(): AudioPlayerStatus {
    return this.status;
  }

  onStatusChange(callback: (status: AudioPlayerStatus) => void): void {
    this.statusEmitter.on('statusChange', callback);
  }

  private setStatus(newStatus: AudioPlayerStatus): void {
    this.status = newStatus;
    this.statusEmitter.emit('statusChange', newStatus);
  }
}