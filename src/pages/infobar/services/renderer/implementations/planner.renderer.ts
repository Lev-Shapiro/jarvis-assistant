import { PlannerData } from '@/infrastructure/infobar/infobar.types';
import { ProgressStatus } from '@/infrastructure/infobar/types/progress-status';
import { DomUtils } from '../../utils/dom.utils';
import { InfobarRenderer } from '../renderer.interface';

/**
 * Renderer for planner data
 */
export class PlannerRenderer implements InfobarRenderer<PlannerData> {
  /**
   * Renders planner data into an HTML element
   * @param data The planner data
   * @returns The rendered HTML element
   */
  render(data: PlannerData): HTMLElement {
    const container = DomUtils.createElement('div', {
      classes: ['planner-container']
    });
    
    // Create header
    const header = DomUtils.createElement('div', {
      classes: ['planner-header']
    });
    
    const title = DomUtils.createElement('h2', {
      content: 'Task Planner',
      classes: ['planner-title']
    });
    
    const taskCount = DomUtils.createElement('span', {
      content: `${data.tasks.length} tasks`,
      classes: ['planner-task-count']
    });
    
    header.appendChild(title);
    header.appendChild(taskCount);
    container.appendChild(header);
    
    // Add task list
    const taskList = DomUtils.createElement('div', {
      classes: ['planner-tasks']
    });
    
    // Group tasks by completion status
    const completedTasks = data.tasks.filter(task => task.status === ProgressStatus.Done);
    const pendingTasks = data.tasks.filter(task => task.status !== ProgressStatus.Done);
    
    // Render pending tasks first
    if (pendingTasks.length > 0) {
      const pendingSection = DomUtils.createElement('div', {
        classes: ['task-section', 'pending-tasks']
      });
      
      const pendingSectionTitle = DomUtils.createElement('h3', {
        content: 'Pending Tasks',
        classes: ['section-title']
      });
      pendingSection.appendChild(pendingSectionTitle);
      
      pendingTasks.forEach(task => {
        const taskElement = this.createTaskElement(task);
        pendingSection.appendChild(taskElement);
      });
      
      taskList.appendChild(pendingSection);
    }
    
    // Render completed tasks
    if (completedTasks.length > 0) {
      const completedSection = DomUtils.createElement('div', {
        classes: ['task-section', 'completed-tasks']
      });
      
      const completedSectionTitle = DomUtils.createElement('h3', {
        content: 'Completed Tasks',
        classes: ['section-title']
      });
      completedSection.appendChild(completedSectionTitle);
      
      completedTasks.forEach(task => {
        const taskElement = this.createTaskElement(task);
        completedSection.appendChild(taskElement);
      });
      
      taskList.appendChild(completedSection);
    }
    
    container.appendChild(taskList);
    return container;
  }
  
  /**
   * Creates an HTML element for a single task
   * @param task The task to render
   * @returns The task element
   */
  private createTaskElement(task: any): HTMLElement {
    const isCompleted = task.status === ProgressStatus.Done;
    
    const taskElement = DomUtils.createElement('div', {
      classes: ['task-item', isCompleted ? 'task-completed' : 'task-pending']
    });
    
    // Create status indicator
    const statusIndicator = DomUtils.createElement('div', {
      classes: ['task-status-indicator', `status-${task.status.toLowerCase()}`]
    });
    
    // Create task content container (title, description, due date)
    const taskContent = DomUtils.createElement('div', {
      classes: ['task-content']
    });
    
    const taskTitle = DomUtils.createElement('div', {
      content: task.title,
      classes: ['task-title']
    });
    
    taskContent.appendChild(taskTitle);
    
    if (task.description) {
      const taskDescription = DomUtils.createElement('div', {
        content: task.description,
        classes: ['task-description']
      });
      taskContent.appendChild(taskDescription);
    }
    
    // Add status badge
    const statusBadge = DomUtils.createElement('div', {
      content: this.getStatusLabel(task.status),
      classes: ['task-status-badge', `status-${task.status.toLowerCase()}`]
    });
    taskContent.appendChild(statusBadge);
    
    // Add metadata like due date
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const formattedDate = dueDate.toLocaleDateString();
      const dueDateElement = DomUtils.createElement('div', {
        content: `Due: ${formattedDate}`,
        classes: ['task-due-date']
      });
      taskContent.appendChild(dueDateElement);
    }
    
    // Add to the task element
    taskElement.appendChild(statusIndicator);
    taskElement.appendChild(taskContent);
    
    return taskElement;
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