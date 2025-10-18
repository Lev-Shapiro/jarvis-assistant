import { JarvisStorageRepository } from '@/domain/storage/storage.repository';
import { exec } from 'child_process';
import * as fs from 'fs';

export interface CameraOptions {
  deviceId?: string;
  outputPath?: string;
}

export class ComputerVisionService {
  constructor(private readonly storageRepository: JarvisStorageRepository) {
    this.ensureOutputDirectory();
  }

  /**
   * Lists available camera devices on macOS
   */
  async listCameraDevices(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec('system_profiler SPCameraDataType', (error, stdout) => {
        if (error) {
          reject(new Error(`Failed to list camera devices: ${error.message}`));
          return;
        }

        const cameraNames: string[] = [];
        const lines = stdout.split('\n');

        for (const line of lines) {
          const match = line.match(/^\s{4}(.+):/);
          if (match && !line.includes('Model')) {
            cameraNames.push(match[1].trim());
          }
        }

        resolve(cameraNames);
      });
    });
  }

  /**
   * Captures a single image from the camera
   */
  // !!! TODO: Imagesnap is small and is used PURELY for MVP-Display purposes. Replace with a more robust solution later.
  async captureImage(): Promise<string> {
    const outputFilePath = this.storageRepository.getPath(`capture-${Date.now()}.jpg`)

    return new Promise((resolve, reject) => {
      // Using imagesnap, a common command-line tool for macOS camera capture
      const command = `imagesnap -w 1 ${outputFilePath}`;

      exec(command, (error) => {
        if (error) {
          reject(new Error(`Failed to capture image: ${error.message}`));
          return;
        }

        resolve(outputFilePath);
      });
    });
  }

  /**
   * Starts a video stream from the camera
   * Returns a function that can be called to stop the stream
   */
  async startVideoStream(
    frameCallback: (imagePath: string) => Promise<void>
  ): Promise<() => Promise<void>> {
    let isRunning = true;

    const streamProcess = async () => {
      while (isRunning) {
        try {
          const imagePath = await this.captureImage();
          await frameCallback(imagePath);
          // Small delay between frames
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error('Error in camera stream:', error);
          if (isRunning) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
    };

    // Start the streaming process
    streamProcess();

    // Return a function to stop the stream
    return async () => {
      isRunning = false;
    };
  }

  private ensureOutputDirectory(): void {
    const directory = this.storageRepository.getPath('');
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
}