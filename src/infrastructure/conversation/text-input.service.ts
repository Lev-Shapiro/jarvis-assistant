import { AudioService } from "../audio/audio.service";
import { JarvisAIService } from "../brain/jarvis-ai.service";
import { ErrorNotificationService } from "../error-notification/error-notification.service";
import { WindowManager } from "../windows/window-manager";

export class TextInputService {
  constructor(
    private jarvisAIService: JarvisAIService,
    private windowManager: WindowManager,
    private errorNotificationService: ErrorNotificationService,
    private audioService: AudioService
  ) {}

  open() {
    this.windowManager.inputPopupWindow?.show();
    this.windowManager.inputPopupWindow?.focus();

    // Access the window instance safely
    if (
      this.windowManager.inputPopupWindow?.instance &&
      this.windowManager.inputPopupWindow?.instance.webContents
    ) {
      this.windowManager.inputPopupWindow?.instance.webContents.send(
        "open-input"
      );
    }
  }

  close() {
    this.windowManager.inputPopupWindow?.close();
  }

  /**
   * Process a text query from the user using the AI service
   * @param query The text query from the user
   * @returns A promise that resolves when the query has been processed
   */
  async processTextInput(userInput: string) {
    if (!userInput || userInput.trim() === "") {
      this.errorNotificationService.notify({
        message: "I didn't catch that. Please try again.",
        isApp: true,
        isTerminal: true,
        isAudio: true,
        isCritical: false,
      });

      return;
    }

    const window = this.windowManager.inputPopupWindow?.instance;

    try {
      // Update UI to show processing status
      if (window && window.webContents) {
        window.webContents.send("query-status", "Processing your request...");
      }

      await this.jarvisAIService.askAndSpeak(userInput);

      // Send the response back to the renderer
      if (window && window.webContents) {
        window.webContents.send("hide-input-popup");
      }
    } catch (error: unknown) {
      console.error("Error processing query:", error);

      // Show error notification using the ErrorNotificationService
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      await this.errorNotificationService.notify({
        message: `Failed to process query: ${errorMessage}`,
        isApp: true,
        isTerminal: true,
        isAudio: false,
        isCritical: false,
      });

      // Rethrow the error for the caller to handle
      throw error;
    }
  }
}
