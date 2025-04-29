import { GalleryItem, ImageData } from '@/infrastructure/infobar/infobar.types';
import { DomUtils } from '../../utils/dom.utils';
import { InfobarRenderer } from '../renderer.interface';

/**
 * Renderer for gallery data
 */
export class GalleryRenderer implements InfobarRenderer<GalleryItem> {
  /**
   * Renders gallery data into an HTML element
   * @param data The gallery data
   * @returns The rendered HTML element
   */
  render(data: GalleryItem): HTMLElement {
    const container = DomUtils.createElement('div', {
      classes: ['gallery-container']
    });
    
    // Add header section
    const header = DomUtils.createElement('div', {
      classes: ['gallery-header']
    });
    
    const title = DomUtils.createElement('h2', {
      content: 'Gallery',
      classes: ['gallery-title']
    });
    
    const counter = DomUtils.createElement('span', {
      content: `${data.items.length} images`,
      classes: ['gallery-counter']
    });
    
    header.appendChild(title);
    header.appendChild(counter);
    container.appendChild(header);
    
    // Create view mode controls
    const viewControls = this.createViewControls(container);
    container.appendChild(viewControls);
    
    // Create gallery content
    const galleryContent = DomUtils.createElement('div', {
      classes: ['gallery-content', 'grid-view']
    });
    
    // Create thumbnail grid with all images
    const thumbnailGrid = this.createThumbnailGrid(data.items);
    galleryContent.appendChild(thumbnailGrid);
    
    // Create lightbox for fullscreen view
    const lightbox = this.createLightbox(data.items);
    
    container.appendChild(galleryContent);
    container.appendChild(lightbox);
    
    return container;
  }
  
  /**
   * Creates view mode controls (grid/carousel)
   * @param container The gallery container
   * @returns The view controls container
   */
  private createViewControls(container: HTMLElement): HTMLElement {
    const viewControls = DomUtils.createElement('div', {
      classes: ['gallery-view-controls']
    });
    
    const gridViewButton = DomUtils.createElement('button', {
      classes: ['view-button', 'grid-view-button', 'active'],
      content: 'Grid'
    });
    
    const carouselViewButton = DomUtils.createElement('button', {
      classes: ['view-button', 'carousel-view-button'],
      content: 'Slideshow'
    });
    
    viewControls.appendChild(gridViewButton);
    viewControls.appendChild(carouselViewButton);
    
    // Toggle view mode when buttons are clicked
    gridViewButton.addEventListener('click', () => {
      const galleryContentEl = container.querySelector('.gallery-content') as HTMLElement;
      if (galleryContentEl) {
        galleryContentEl.classList.remove('carousel-view');
        galleryContentEl.classList.add('grid-view');
        
        // Update button states
        gridViewButton.classList.add('active');
        carouselViewButton.classList.remove('active');
        
        // Hide carousel controls if present
        const carouselControls = container.querySelector('.carousel-controls');
        if (carouselControls) {
          (carouselControls as HTMLElement).classList.add('hidden');
        }
      }
    });
    
    carouselViewButton.addEventListener('click', () => {
      const galleryContentEl = container.querySelector('.gallery-content') as HTMLElement;
      if (galleryContentEl) {
        galleryContentEl.classList.remove('grid-view');
        galleryContentEl.classList.add('carousel-view');
        
        // Update button states
        gridViewButton.classList.remove('active');
        carouselViewButton.classList.add('active');
        
        // Show carousel controls if present
        const carouselControls = container.querySelector('.carousel-controls');
        if (carouselControls) {
          (carouselControls as HTMLElement).classList.remove('hidden');
        } else {
          this.addCarouselControls(container, galleryContentEl);
        }
        
        // Set the first item as active if none is active
        const items = galleryContentEl.querySelectorAll('.gallery-item');
        const activeItem = galleryContentEl.querySelector('.gallery-item.active');
        if (!activeItem && items.length > 0) {
          items[0].classList.add('active');
        }
      }
    });
    
    return viewControls;
  }
  
  /**
   * Creates a thumbnail grid of images
   * @param images The image data array
   * @returns The thumbnail grid element
   */
  private createThumbnailGrid(images: ImageData[]): HTMLElement {
    const grid = DomUtils.createElement('div', {
      classes: ['thumbnail-grid']
    });
    
    images.forEach((image, index) => {
      const thumbnailContainer = DomUtils.createElement('div', {
        classes: ['gallery-item'],
        attributes: {
          'data-index': String(index)
        }
      });
      
      const thumbnail = DomUtils.createElement('img', {
        attributes: {
          src: image.src,
          alt: image.alt || `Image ${index + 1}`,
          width: '150',
          height: '150'
        },
        classes: ['thumbnail-image']
      });
      
      // Add caption overlay if available
      if (image.caption) {
        const captionOverlay = DomUtils.createElement('div', {
          classes: ['thumbnail-caption'],
          content: image.caption
        });
        thumbnailContainer.appendChild(captionOverlay);
      }
      
      thumbnailContainer.appendChild(thumbnail);
      
      // Add click event to open lightbox
      thumbnailContainer.addEventListener('click', () => {
        const lightbox = document.querySelector('.gallery-lightbox') as HTMLElement;
        if (lightbox) {
          lightbox.classList.add('active');
          this.showLightboxImage(lightbox, index);
        }
      });
      
      grid.appendChild(thumbnailContainer);
    });
    
    return grid;
  }
  
  /**
   * Adds carousel controls to the gallery
   * @param container The gallery container
   * @param galleryContent The gallery content element
   */
  private addCarouselControls(container: HTMLElement, galleryContent: HTMLElement): void {
    const carouselControls = DomUtils.createElement('div', {
      classes: ['carousel-controls']
    });
    
    const prevButton = DomUtils.createElement('button', {
      classes: ['carousel-prev'],
      content: '◄'
    });
    
    const nextButton = DomUtils.createElement('button', {
      classes: ['carousel-next'],
      content: '►'
    });
    
    const indicators = DomUtils.createElement('div', {
      classes: ['carousel-indicators']
    });
    
    const items = galleryContent.querySelectorAll('.gallery-item');
    items.forEach((_, index) => {
      const indicator = DomUtils.createElement('button', {
        classes: ['carousel-indicator'],
        attributes: {
          'data-index': String(index)
        }
      });
      
      // Make first indicator active
      if (index === 0) {
        indicator.classList.add('active');
      }
      
      // Add click event to switch to specific image
      indicator.addEventListener('click', () => {
        this.showCarouselItem(galleryContent, index);
      });
      
      indicators.appendChild(indicator);
    });
    
    // Add click events for prev/next buttons
    prevButton.addEventListener('click', () => {
      const activeItem = galleryContent.querySelector('.gallery-item.active');
      if (activeItem) {
        const currentIndex = parseInt(activeItem.getAttribute('data-index') || '0', 10);
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        this.showCarouselItem(galleryContent, prevIndex);
      }
    });
    
    nextButton.addEventListener('click', () => {
      const activeItem = galleryContent.querySelector('.gallery-item.active');
      if (activeItem) {
        const currentIndex = parseInt(activeItem.getAttribute('data-index') || '0', 10);
        const nextIndex = (currentIndex + 1) % items.length;
        this.showCarouselItem(galleryContent, nextIndex);
      }
    });
    
    carouselControls.appendChild(prevButton);
    carouselControls.appendChild(indicators);
    carouselControls.appendChild(nextButton);
    
    // Hide controls initially if not in carousel view
    if (!galleryContent.classList.contains('carousel-view')) {
      carouselControls.classList.add('hidden');
    }
    
    container.appendChild(carouselControls);
  }
  
  /**
   * Shows a specific carousel item
   * @param galleryContent The gallery content element
   * @param index The index of the item to show
   */
  private showCarouselItem(galleryContent: HTMLElement, index: number): void {
    const items = galleryContent.querySelectorAll('.gallery-item');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    // Hide all items and remove active class
    items.forEach(item => item.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show selected item and mark indicator as active
    if (items[index]) {
      items[index].classList.add('active');
    }
    
    if (indicators[index]) {
      indicators[index].classList.add('active');
    }
  }
  
  /**
   * Creates a lightbox for fullscreen image viewing
   * @param images The image data array
   * @returns The lightbox element
   */
  private createLightbox(images: ImageData[]): HTMLElement {
    const lightbox = DomUtils.createElement('div', {
      classes: ['gallery-lightbox']
    });
    
    const lightboxContent = DomUtils.createElement('div', {
      classes: ['lightbox-content']
    });
    
    const closeButton = DomUtils.createElement('button', {
      classes: ['lightbox-close'],
      content: '×'
    });
    
    const prevButton = DomUtils.createElement('button', {
      classes: ['lightbox-prev'],
      content: '◄'
    });
    
    const nextButton = DomUtils.createElement('button', {
      classes: ['lightbox-next'],
      content: '►'
    });
    
    const imageContainer = DomUtils.createElement('div', {
      classes: ['lightbox-image-container']
    });
    
    const caption = DomUtils.createElement('div', {
      classes: ['lightbox-caption']
    });
    
    // Create hidden image elements for each image
    images.forEach((image, index) => {
      const imgElement = DomUtils.createElement('img', {
        attributes: {
          src: image.src,
          alt: image.alt || `Image ${index + 1}`,
          'data-index': String(index)
        },
        classes: ['lightbox-image', 'hidden']
      });
      
      imageContainer.appendChild(imgElement);
    });
    
    lightboxContent.appendChild(closeButton);
    lightboxContent.appendChild(prevButton);
    lightboxContent.appendChild(nextButton);
    lightboxContent.appendChild(imageContainer);
    lightboxContent.appendChild(caption);
    lightbox.appendChild(lightboxContent);
    
    // Add event listeners
    closeButton.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
    
    prevButton.addEventListener('click', () => {
      const activeImg = imageContainer.querySelector('.lightbox-image:not(.hidden)');
      if (activeImg) {
        const currentIndex = parseInt(activeImg.getAttribute('data-index') || '0', 10);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        this.showLightboxImage(lightbox, prevIndex);
      }
    });
    
    nextButton.addEventListener('click', () => {
      const activeImg = imageContainer.querySelector('.lightbox-image:not(.hidden)');
      if (activeImg) {
        const currentIndex = parseInt(activeImg.getAttribute('data-index') || '0', 10);
        const nextIndex = (currentIndex + 1) % images.length;
        this.showLightboxImage(lightbox, nextIndex);
      }
    });
    
    // Close lightbox when clicking outside content
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
    
    return lightbox;
  }
  
  /**
   * Shows a specific image in the lightbox
   * @param lightbox The lightbox element
   * @param index The index of the image to show
   */
  private showLightboxImage(lightbox: HTMLElement, index: number): void {
    const images = lightbox.querySelectorAll('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    
    // Hide all images
    images.forEach(img => img.classList.add('hidden'));
    
    // Show selected image
    const selectedImage = images[index];
    if (selectedImage) {
      selectedImage.classList.remove('hidden');
      
      // Update caption if available
      if (caption) {
        const imageData = this.getImageDataFromElement(selectedImage as HTMLImageElement);
        caption.textContent = imageData.caption || '';
      }
    }
  }
  
  /**
   * Gets image data from an HTML image element
   * @param imgElement The image element
   * @returns Basic image data extracted from the element
   */
  private getImageDataFromElement(imgElement: HTMLImageElement): Partial<ImageData> {
    return {
      src: imgElement.src,
      alt: imgElement.alt,
      caption: imgElement.dataset.caption
    };
  }
} 