/**
 * Base interface for all infobar renderers
 * Follows DDD principles by defining domain service contracts
 */
export interface InfobarRenderer<T> {
  /**
   * Renders the provided data into an HTMLElement
   * @param data The data to render
   * @returns HTMLElement representation of the data
   */
  render(data: T): HTMLElement;
} 