import { ImageData } from '@/infrastructure/infobar/infobar.types';
import { DomUtils } from '../../utils/dom.utils';
import { InfobarRenderer } from '../renderer.interface';

/**
 * Renderer for image data
 */
export class ImageRenderer implements InfobarRenderer<ImageData> {
  /**
   * Renders image data into an HTML element
   * @param data The image data
   * @returns The rendered HTML element
   */
  render(data: ImageData): HTMLElement {
    const container = DomUtils.createElement('figure', {
      classes: ['image-container']
    });
    
    // Create the image element
    const img = DomUtils.createElement('img', {
      attributes: {
        src: data.src,
        alt: data.alt || 'Infobar Image',
        width: String(data.width),
        height: String(data.height)
      },
      classes: ['image-content']
    });
    
    // Add loading indicator and error handling
    img.addEventListener('load', () => {
      img.classList.add('image-loaded');
      const loadingIndicator = container.querySelector('.image-loading');
      if (loadingIndicator) {
        container.removeChild(loadingIndicator);
      }
    });
    
    img.addEventListener('error', () => {
      const errorIndicator = DomUtils.createElement('div', {
        classes: ['image-error'],
        content: 'Failed to load image'
      });
      container.innerHTML = '';
      container.appendChild(errorIndicator);
    });
    
    // Add loading indicator
    const loadingIndicator = DomUtils.createElement('div', {
      classes: ['image-loading'],
      content: 'Loading image...'
    });
    
    container.appendChild(loadingIndicator);
    container.appendChild(img);
    
    // Add caption if provided
    if (data.caption) {
      const figcaption = DomUtils.createElement('figcaption', {
        content: data.caption,
        classes: ['image-caption']
      });
      container.appendChild(figcaption);
    }
    
    // Add zoom functionality
    this.addZoomFunctionality(container, img);
    
    return container;
  }
  
  /**
   * Adds zoom functionality to the image
   * @param container The container element
   * @param img The image element
   */
  private addZoomFunctionality(container: HTMLElement, img: HTMLImageElement): void {
    // Create zoom controls
    const zoomControls = DomUtils.createElement('div', {
      classes: ['image-zoom-controls']
    });
    
    const zoomInButton = DomUtils.createElement('button', {
      classes: ['zoom-in'],
      content: '+'
    });
    
    const zoomOutButton = DomUtils.createElement('button', {
      classes: ['zoom-out'],
      content: '−'
    });
    
    const resetZoomButton = DomUtils.createElement('button', {
      classes: ['zoom-reset'],
      content: '↺'
    });
    
    // Zoom factor tracking
    let currentZoom = 1;
    const maxZoom = 3;
    const minZoom = 0.5;
    const zoomStep = 0.25;
    
    // Apply zoom
    const applyZoom = () => {
      img.style.transform = `scale(${currentZoom})`;
      
      // Update button states
      zoomInButton.disabled = currentZoom >= maxZoom;
      zoomOutButton.disabled = currentZoom <= minZoom;
    };
    
    // Add event listeners
    zoomInButton.addEventListener('click', () => {
      if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        applyZoom();
      }
    });
    
    zoomOutButton.addEventListener('click', () => {
      if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        applyZoom();
      }
    });
    
    resetZoomButton.addEventListener('click', () => {
      currentZoom = 1;
      applyZoom();
    });
    
    // Assemble and add controls
    zoomControls.appendChild(zoomOutButton);
    zoomControls.appendChild(resetZoomButton);
    zoomControls.appendChild(zoomInButton);
    container.appendChild(zoomControls);
  }
} 