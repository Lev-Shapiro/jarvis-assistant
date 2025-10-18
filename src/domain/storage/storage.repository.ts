import fs from "fs";
import path from "path";

export class JarvisStorageRepository {
  constructor(private readonly storagePath: string) { }

  save(filePath: string, buffer: Buffer): void {
    try {
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);
    } catch (error) {
      console.error(`Failed to save audio to ${filePath}:`, error);
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
