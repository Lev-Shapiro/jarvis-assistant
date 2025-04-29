import { ProgressTrackingData } from '@/infrastructure/infobar/infobar.types';
import { ProgressStatus } from '@/infrastructure/infobar/types/progress-status';
import { DomUtils } from '../../utils/dom.utils';
import { InfobarRenderer } from '../renderer.interface';

/**
 * Renderer for progress tracking data
 */
export class ProgressTrackingRenderer implements InfobarRenderer<ProgressTrackingData> {
  /**
   * Renders progress tracking data into an HTML element
   * @param data The progress tracking data
   * @returns The rendered HTML element
   */
  render(data: ProgressTrackingData): HTMLElement {
    const container = DomUtils.createElement('div', {
      classes: ['progress-container']
    });
    
    // Create header with label
    const header = DomUtils.createElement('div', {
      classes: ['progress-header']
    });
    
    const title = DomUtils.createElement('h2', {
      content: data.label,
      classes: ['progress-title']
    });
    header.appendChild(title);
    
    // Add description if available
    if (data.description) {
      const description = DomUtils.createElement('p', {
        content: data.description,
        classes: ['progress-description']
      });
      header.appendChild(description);
    }
    
    container.appendChild(header);
    
    // Calculate percentage
    const currentValue = this.getProgressValue(data.currentValue);
    const targetValue = this.getProgressValue(data.targetValue);
    const percentage = Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
    
    // Create progress information
    const progressInfo = DomUtils.createElement('div', {
      classes: ['progress-info']
    });
    
    const progressValues = DomUtils.createElement('div', {
      classes: ['progress-values']
    });
    
    const currentValueEl = DomUtils.createElement('span', {
      content: `${currentValue}${data.unit ? ` ${data.unit}` : ''}`,
      classes: ['current-value']
    });
    
    const separator = DomUtils.createElement('span', {
      content: ' / ',
      classes: ['value-separator']
    });
    
    const targetValueEl = DomUtils.createElement('span', {
      content: `${targetValue}${data.unit ? ` ${data.unit}` : ''}`,
      classes: ['target-value']
    });
    
    const percentageEl = DomUtils.createElement('span', {
      content: `${Math.round(percentage)}%`,
      classes: ['percentage-value']
    });
    
    progressValues.appendChild(currentValueEl);
    progressValues.appendChild(separator);
    progressValues.appendChild(targetValueEl);
    progressValues.appendChild(percentageEl);
    
    progressInfo.appendChild(progressValues);
    
    // Create progress bar
    const progressBarContainer = DomUtils.createElement('div', {
      classes: ['progress-bar-container']
    });
    
    const progressBar = DomUtils.createElement('div', {
      classes: ['progress-bar', this.getProgressColorClass(percentage)]
    });
    
    progressBar.style.width = `${percentage}%`;
    
    // Add transition for smooth animation
    progressBar.style.transition = 'width 0.5s ease-in-out';
    
    progressBarContainer.appendChild(progressBar);
    
    // Add status indicator
    const statusIndicator = DomUtils.createElement('div', {
      classes: ['progress-status-indicator', `status-${data.currentValue.toLowerCase()}`],
      content: this.getStatusLabel(data.currentValue as ProgressStatus)
    });
    
    // Combine all elements
    container.appendChild(progressInfo);
    container.appendChild(progressBarContainer);
    container.appendChild(statusIndicator);
    
    return container;
  }
  
  /**
   * Converts ProgressStatus to a numeric value for calculation
   */
  private getProgressValue(status: ProgressStatus | number): number {
    if (typeof status === 'number') {
      return status;
    }
    
    switch (status) {
      case ProgressStatus.Todo:
        return 0;
      case ProgressStatus.InProgress:
        return 0.5;
      case ProgressStatus.Done:
        return 1;
      case ProgressStatus.Error:
        return 0;
      default:
        return 0;
    }
  }
  
  /**
   * Gets a color class based on the progress percentage
   */
  private getProgressColorClass(percentage: number): string {
    if (percentage < 25) {
      return 'progress-danger';
    } else if (percentage < 75) {
      return 'progress-warning';
    } else {
      return 'progress-success';
    }
  }
  
  /**
   * Gets a user-friendly label for a progress status
   */
  private getStatusLabel(status: ProgressStatus): string {
    switch (status) {
      case ProgressStatus.Todo:
        return 'To Do';
      case ProgressStatus.InProgress:
        return 'In Progress';
      case ProgressStatus.Done:
        return 'Done';
      case ProgressStatus.Error:
        return 'Error';
      default:
        return 'Unknown';
    }
  }
} 