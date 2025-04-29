import { InfobarType } from '@/infrastructure/infobar/infobar-type';
import { FormattedTextRenderer } from './implementations/formatted-text.renderer';
import { GalleryRenderer } from './implementations/gallery.renderer';
import { ImageRenderer } from './implementations/image.renderer';
import { ListItemsRenderer } from './implementations/list-items.renderer';
import { PlannerRenderer } from './implementations/planner.renderer';
import { ProgressTrackingRenderer } from './implementations/progress-tracking.renderer';
import { TableRenderer } from './implementations/table.renderer';
import { VideoRenderer } from './implementations/video.renderer';
import { InfobarRenderer } from './renderer.interface';

/**
 * Factory for creating infobar renderers
 * Follows DDD by implementing the Factory pattern for domain services
 */
export class RendererFactory {
  // Singleton instance
  private static instance: RendererFactory;

  // Renderers instances (creating them once)
  private readonly plannerRenderer = new PlannerRenderer();
  private readonly progressTrackingRenderer = new ProgressTrackingRenderer();
  private readonly tableRenderer = new TableRenderer();
  private readonly formattedTextRenderer = new FormattedTextRenderer();
  private readonly imageRenderer = new ImageRenderer();
  private readonly videoRenderer = new VideoRenderer();
  private readonly listItemsRenderer = new ListItemsRenderer();
  private readonly galleryRenderer = new GalleryRenderer();
  
  // Private constructor to enforce singleton pattern
  private constructor() {}
  
  /**
   * Gets the singleton instance of the renderer factory
   */
  public static getInstance(): RendererFactory {
    if (!RendererFactory.instance) {
      RendererFactory.instance = new RendererFactory();
    }
    return RendererFactory.instance;
  }
  
  /**
   * Gets the appropriate renderer for the given infobar type
   * @param type The type of infobar content
   * @returns The renderer for the specified type
   */
  public getRenderer<T>(type: InfobarType): InfobarRenderer<T> {
    switch (type) {
      case InfobarType.Planner:
        return this.plannerRenderer as InfobarRenderer<T>;
      case InfobarType.ProgressTracking:
        return this.progressTrackingRenderer as InfobarRenderer<T>;
      case InfobarType.Table:
        return this.tableRenderer as InfobarRenderer<T>;
      case InfobarType.FormattedText:
        return this.formattedTextRenderer as InfobarRenderer<T>;
      case InfobarType.Image:
        return this.imageRenderer as InfobarRenderer<T>;
      case InfobarType.Video:
        return this.videoRenderer as InfobarRenderer<T>;
      case InfobarType.ListItems:
        return this.listItemsRenderer as InfobarRenderer<T>;
      case InfobarType.GalleryItems:
        return this.galleryRenderer as InfobarRenderer<T>;
      default:
        throw new Error(`Renderer not implemented for type: ${type}`);
    }
  }
} 