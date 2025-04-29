import * as InfobarTypes from "@/infrastructure/infobar/infobar.types";
import { RendererFactory } from "./services/renderer/renderer.factory";
// Assume a Renderer Service exists for handling specific rendering logic
// import * as InfobarRendererService from '../../infrastructure/infobar/infobar-renderer.service';

// --- DOM Elements ---
const infobarContent = document.getElementById(
  "infobar-content"
) as HTMLDivElement;

// Type definition for the data expected from the main process
// This assumes the main process sends an object with a 'type' and 'data' property
type InfobarUpdatePayload =
  | InfobarTypes.PlannerData
  | InfobarTypes.ProgressTrackingData
  | InfobarTypes.TableData
  | InfobarTypes.FormattedTextData
  | InfobarTypes.ImageData
  | InfobarTypes.VideoData
  | InfobarTypes.ListItemsData
  | InfobarTypes.GalleryItem; // Assuming GalleryItem should be GalleryData, check infobar.types.ts
// TODO: Add other potential types if necessary

// --- Message Handling ---

/**
 * Updates the infobar content with the appropriate renderer for the given payload
 * @param payload The payload containing the data to render
 */
const updateInfobarContent = (payload: InfobarUpdatePayload) => {
  if (!infobarContent) {
    console.error("Infobar content area not found!");
    return;
  }

  try {
    // Get the renderer factory instance
    const rendererFactory = RendererFactory.getInstance();

    // Get appropriate renderer based on payload type
    const renderer = rendererFactory.getRenderer(payload.type);

    // Render content
    const newContentElement = renderer.render(payload);

    if (!newContentElement) {
      console.error("Failed to render content for payload:", payload);
      return;
    }

    infobarContent.innerHTML = "";

    // Append the new content element
    infobarContent.appendChild(newContentElement);

    // Scroll to top
    infobarContent.scrollTop = 0;
  } catch (error: any) {
    console.error("Error rendering infobar content:", error);

    // Clear previous content
    infobarContent.innerHTML = "";

    // Create error element
    const errorElement = document.createElement("div");
    errorElement.className = "infobar-error";
    errorElement.textContent = `Error: Failed to render content (${
      error?.message || "Unknown error"
    })`;

    // Append error element
    infobarContent.appendChild(errorElement);
  }
};

/**
 * Clears the infobar content
 */
const clearInfobarContent = () => {
  if (!infobarContent) {
    console.error("Infobar content area not found!");
    return;
  }

  infobarContent.innerHTML = "";
};

// --- Initialization ---

/**
 * Initializes the infobar and sets up event listeners
 */
const initializeInfobar = () => {
  if (!infobarContent) {
    console.error("Failed to initialize Infobar: Required elements not found.");
    return;
  }

  console.log("Infobar Initialized. Waiting for messages...");

  // Listen for messages from the main process
  if (window.mainWindowAPI) {
    // Listen for updates
    window.mainWindowAPI.onMessage(
      "update-infobar",
      (payload: InfobarUpdatePayload) => {
        console.log("Received update-infobar message:", payload);
        if (payload && payload.type) {
          updateInfobarContent(payload);
        } else {
          console.warn("Received invalid infobar update payload:", payload);
        }
      }
    );

    // Listen for clear messages
    window.mainWindowAPI.onMessage("clear-infobar", () => {
      console.log("Received clear-infobar message");
      clearInfobarContent();
    });
  } else {
    console.warn(
      "window.mainWindowAPI not found. Cannot receive messages from main process."
    );

    // Display a warning in development mode
    if (process.env.NODE_ENV === "development") {
      const warningElement = document.createElement("div");
      warningElement.className = "infobar-warning";
      warningElement.textContent =
        "Infobar ready. No connection to main process.";
      infobarContent.appendChild(warningElement);
    }
  }
};

// Run initialization when the DOM is ready
document.addEventListener("DOMContentLoaded", initializeInfobar);
