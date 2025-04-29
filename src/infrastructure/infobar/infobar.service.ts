import { WindowManager } from "../windows/window-manager";
import {
    FormattedTextData,
    GalleryItem // Assuming this represents the gallery data structure
    ,


    ImageData,
    ListItemsData,
    PlannerData,
    ProgressTrackingData,
    TableData,
    VideoData
} from "./infobar.types";

// Union type for all possible infobar data payloads
export type InfobarUpdatePayload = 
    | PlannerData
    | ProgressTrackingData
    | TableData
    | FormattedTextData
    | ImageData
    | VideoData
    | ListItemsData
    | GalleryItem; // Adjust if GalleryItem is not the intended data structure

export class InfobarService {
    constructor(private windowManager: WindowManager) {}

    /**
     * Displays data in the Infobar window.
     * Ensures the window is visible and sends the data payload to the renderer.
     * @param data The structured data payload to display.
     */
    display(data: InfobarUpdatePayload): void {
        const window = this.windowManager.infobarWindow?.instance;

        if (window && window.webContents) {
            try {
                // Ensure the window is visible before sending content
                if (!window.isVisible()) {
                    window.show();
                }
                // Send the data to the infobar renderer process
                window.webContents.send('update-infobar', data);
                console.log('InfobarService: Sent update-infobar with payload:', data);
            } catch (error) {
                console.error("InfobarService: Failed to send 'update-infobar' IPC message:", error);
                // Optionally, add more robust error handling/notification
            }
        } else {
            console.warn("InfobarService: Infobar window or webContents not available. Cannot display content.");
        }
    }

    /**
     * Clears the content of the Infobar window and hides it.
     */
    clear(): void {
        const window = this.windowManager.infobarWindow?.instance;

        if (window && window.webContents) {
            try {
                // Send a message to the renderer to clear its content
                window.webContents.send('clear-infobar');
                console.log('InfobarService: Sent clear-infobar message.');
                
                // Hide the window after clearing
                if (window.isVisible()) {
                     window.hide();
                }
            } catch (error) {
                 console.error("InfobarService: Failed to send 'clear-infobar' IPC message or hide window:", error);
            }

        } else {
            console.warn("InfobarService: Infobar window or webContents not available. Cannot clear content.");
        }
    }
}
