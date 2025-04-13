import fs from "fs";
import path from "path";

export class JarvisStorageRepository {
  constructor(private readonly storagePath: string) {}

  save(audioPath: string, buffer: Buffer): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(audioPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(audioPath, buffer);
    } catch (error) {
      console.error(`Failed to save audio to ${audioPath}:`, error);
      throw new Error(`Failed to save audio file: ${error}`);
    }
  }

  getPath(filename: string): string {
    return path.join(this.storagePath, filename);
  }

  clearAll() {
    fs.readdirSync(this.storagePath).forEach((file) => {
      fs.unlinkSync(path.join(this.storagePath, file));
    });
  }
}
