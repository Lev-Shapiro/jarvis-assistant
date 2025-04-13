import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

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

  async playAudioStream(audioStream: Readable): Promise<void> {
    try {
      // Stop any current audio playing
      await this.stopAudio();

      // Use 'play' from sox for MacOS, reading from stdin
      // Assumes raw 16-bit signed PCM, 44.1kHz, stereo, little-endian.
      // Adjust parameters (-t, -r, -e, -b, -c, -L) if your stream format differs.
      const command = 'play';
      const args = [
        '-t', 'raw',       // Type: raw PCM data
        '-r', '44100',     // Rate: 44.1 kHz
        '-e', 'signed',    // Encoding: signed integer
        '-b', '16',        // Bits: 16-bit
        '-c', '2',         // Channels: 2 (stereo)
        '-L',              // Endianness: Little-endian
        '-'                // Input: stdin
      ];
      this.currentProcess = spawn(command, args);
      this.setStatus(AudioPlayerStatus.PLAYING);

      // Handle EPIPE errors, which occur if play closes stdin unexpectedly
      this.currentProcess.stdin.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EPIPE') {
          // End the stream gracefully instead of just logging
          audioStream.unpipe(this.currentProcess.stdin);
          audioStream.destroy();
          
          // Only set to ERROR if the process isn't already closing normally
          if (this.status === AudioPlayerStatus.PLAYING) {
            this.setStatus(AudioPlayerStatus.ERROR);
            console.warn(`"${command}" process closed stdin unexpectedly (EPIPE). This might be due to an incorrect audio format or the process crashing.`);
          }
          
          // Ensure the process is terminated if it's still running
          if (this.currentProcess) {
            this.currentProcess.kill();
            this.currentProcess = null;
          }
        } else {
          console.error(`Error writing to ${command} stdin:`, err);
          // Propagate other stdin errors if needed, though less common
          this.setStatus(AudioPlayerStatus.ERROR);
          this.currentProcess?.kill();
          this.currentProcess = null;
        }
      });

      // Pipe the stream to play's stdin
      audioStream.pipe(this.currentProcess.stdin);

      // Create a promise that resolves when the process completes
      const processCompletionPromise = new Promise<number>((resolve, reject) => {
        // Handle stream errors during piping
        audioStream.on('error', (err) => {
          console.error('Error piping audio stream:', err);
          this.setStatus(AudioPlayerStatus.ERROR);
          this.currentProcess?.kill(); // Ensure process is killed on stream error
          this.currentProcess = null;
          reject(err);
        });

        // Handle process completion
        this.currentProcess!.on('close', (code: number | null) => { // code can be null if killed
          // Check if the process pointer still exists before setting status
          if (this.currentProcess === null && this.status === AudioPlayerStatus.ERROR) {
             // Already handled by stream error or spawn error
             resolve(code ?? 1); // Resolve with error code if killed
             return;
          }

          if (code === 0) {
            // Normal completion
            this.setStatus(AudioPlayerStatus.IDLE);
          } else {
            // Error completion or killed
            // Check if status isn't already ERROR (set by stream/spawn error handler)
             if (this.status !== AudioPlayerStatus.ERROR) {
               console.error(`'${command}' process exited with code: ${code}`);
               this.setStatus(AudioPlayerStatus.ERROR);
             }
          }
          this.currentProcess = null;
          resolve(code ?? 1); // Resolve with error code if killed
        });

        // Handle process spawn errors
        this.currentProcess!.on('error', (err: Error) => {
          console.error(`Error spawning '${command}':`, err);
          // Check if sox is installed and in PATH
          if ((err as any).code === 'ENOENT') {
            console.error(`'${command}' command not found. Make sure 'sox' is installed and in your PATH.`);
          }
          this.setStatus(AudioPlayerStatus.ERROR);
          this.currentProcess = null; // Ensure currentProcess is nulled on spawn error
          reject(err);
        });
      });

      // Wait for the process to complete
      await processCompletionPromise;

    } catch (error) {
      console.error('Error in playAudioStream:', error);
      // Ensure status is set to ERROR if an exception occurred outside the promise
      if (this.status !== AudioPlayerStatus.ERROR) {
          this.setStatus(AudioPlayerStatus.ERROR);
      }
      if (this.currentProcess) {
        this.currentProcess.kill();
        this.currentProcess = null;
      }
      // Re-throw the error to allow calling code to handle it
      throw error;
    }
  }
}