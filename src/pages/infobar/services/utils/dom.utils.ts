/**
 * Utility functions for DOM manipulation
 */
export class DomUtils {
  /**
   * Creates an HTML element with optional attributes, content, and classes
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: {
      attributes?: Record<string, string>;
      content?: string;
      classes?: string[];
      children?: HTMLElement[];
    }
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    // Add attributes
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    // Set content
    if (options?.content !== undefined) {
      element.textContent = options.content;
    }
    
    // Add classes
    if (options?.classes && options.classes.length > 0) {
      element.classList.add(...options.classes);
    }
    
    // Append children
    if (options?.children && options.children.length > 0) {
      options.children.forEach(child => {
        element.appendChild(child);
      });
    }
    
    return element;
  }
} 