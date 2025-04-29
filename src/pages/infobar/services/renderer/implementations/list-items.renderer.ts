import { ListItem, ListItemsData } from '@/infrastructure/infobar/infobar.types';
import { DomUtils } from '../../utils/dom.utils';
import { InfobarRenderer } from '../renderer.interface';

/**
 * Renderer for list items data
 */
export class ListItemsRenderer implements InfobarRenderer<ListItemsData> {
  /**
   * Renders list items data into an HTML element
   * @param data The list items data
   * @returns The rendered HTML element
   */
  render(data: ListItemsData): HTMLElement {
    const container = DomUtils.createElement('div', {
      classes: ['list-items-container']
    });
    
    // Add header section
    const header = DomUtils.createElement('div', {
      classes: ['list-header']
    });
    
    const title = DomUtils.createElement('h2', {
      content: 'List Items',
      classes: ['list-title']
    });
    
    const counter = DomUtils.createElement('span', {
      content: `${data.items.length} items`,
      classes: ['list-counter']
    });
    
    header.appendChild(title);
    header.appendChild(counter);
    container.appendChild(header);
    
    // Check if this is a checklist or plain list
    const hasCheckableItems = data.items.some(item => item.checked !== undefined);
    
    // Create list container
    const listElement = document.createElement(data.ordered ? 'ol' : 'ul');
    listElement.className = hasCheckableItems ? 'checklist' : 'plain-list';
    
    // Use a set to track checked items
    const checkedItemsSet = new Set<string>();
    
    // Add list items
    data.items.forEach(item => {
      const listItem = this.createListItem(item, hasCheckableItems);
      listElement.appendChild(listItem);
      
      // If item is checked, add to set
      if (item.checked) {
        checkedItemsSet.add(item.id);
      }
    });
    
    container.appendChild(listElement);
    
    // Add filter controls for checklists
    if (hasCheckableItems && data.items.length > 3) {
      const filterControls = this.createFilterControls(listElement);
      container.insertBefore(filterControls, listElement);
    }
    
    return container;
  }
  
  /**
   * Creates an HTML element for a single list item
   * @param item The list item data
   * @param isCheckable Whether the list is a checklist
   * @returns The list item element
   */
  private createListItem(item: ListItem, isCheckable: boolean): HTMLElement {
    const listItem = document.createElement('li');
    listItem.className = 'list-item';
    listItem.dataset.id = item.id;
    
    if (isCheckable) {
      // Create checkbox container
      const checkboxContainer = DomUtils.createElement('div', {
        classes: ['checkbox-container']
      });
      
      // Create checkbox
      const checkbox = DomUtils.createElement('input', {
        attributes: {
          type: 'checkbox',
          id: `checkbox-${item.id}`,
          ...(item.checked ? { checked: 'checked' } : {})
        },
        classes: ['item-checkbox']
      }) as HTMLInputElement;
      
      // Add checkbox event listener
      checkbox.addEventListener('change', () => {
        const isChecked = checkbox.checked;
        if (isChecked) {
          listItem.classList.add('checked');
        } else {
          listItem.classList.remove('checked');
        }
      });
      
      // Create label for checkbox
      const label = DomUtils.createElement('label', {
        attributes: {
          for: `checkbox-${item.id}`
        },
        classes: ['item-label'],
        content: item.text
      });
      
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      listItem.appendChild(checkboxContainer);
      
      // Add checked class if item is checked
      if (item.checked) {
        listItem.classList.add('checked');
      }
    } else {
      // Simple list item without checkbox
      listItem.textContent = item.text;
    }
    
    return listItem;
  }
  
  /**
   * Creates filter controls for checklist
   * @param listElement The list element
   * @returns The filter controls container
   */
  private createFilterControls(listElement: HTMLElement): HTMLElement {
    const filterContainer = DomUtils.createElement('div', {
      classes: ['list-filter-controls']
    });
    
    const showAllButton = DomUtils.createElement('button', {
      classes: ['filter-button', 'filter-all', 'active'],
      content: 'All'
    });
    
    const showActiveButton = DomUtils.createElement('button', {
      classes: ['filter-button', 'filter-active'],
      content: 'Active'
    });
    
    const showCompletedButton = DomUtils.createElement('button', {
      classes: ['filter-button', 'filter-completed'],
      content: 'Completed'
    });
    
    // Add search input
    const searchInput = DomUtils.createElement('input', {
      classes: ['list-search-input'],
      attributes: {
        type: 'text',
        placeholder: 'Search items...'
      }
    }) as HTMLInputElement;
    
    filterContainer.appendChild(showAllButton);
    filterContainer.appendChild(showActiveButton);
    filterContainer.appendChild(showCompletedButton);
    filterContainer.appendChild(searchInput);
    
    // Filter function helper
    const filterItems = (filterType: 'all' | 'active' | 'completed', searchTerm: string = '') => {
      // Remove active class from all buttons
      [showAllButton, showActiveButton, showCompletedButton].forEach(button => {
        button.classList.remove('active');
      });
      
      // Add active class to selected button
      if (filterType === 'all') showAllButton.classList.add('active');
      else if (filterType === 'active') showActiveButton.classList.add('active');
      else if (filterType === 'completed') showCompletedButton.classList.add('active');
      
      // Show/hide items based on filter
      const listItems = listElement.querySelectorAll('li');
      listItems.forEach(li => {
        const htmlLi = li as HTMLElement;
        const checkbox = li.querySelector('input[type="checkbox"]') as HTMLInputElement;
        const label = li.querySelector('label');
        const text = label ? label.textContent?.toLowerCase() || '' : htmlLi.textContent?.toLowerCase() || '';
        
        const matchesFilter = (
          filterType === 'all' ||
          (filterType === 'active' && !checkbox.checked) ||
          (filterType === 'completed' && checkbox.checked)
        );
        
        const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
        
        htmlLi.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
      });
    };
    
    // Add event listeners
    showAllButton.addEventListener('click', () => filterItems('all', searchInput.value));
    showActiveButton.addEventListener('click', () => filterItems('active', searchInput.value));
    showCompletedButton.addEventListener('click', () => filterItems('completed', searchInput.value));
    
    searchInput.addEventListener('input', () => {
      const activeButton = filterContainer.querySelector('.filter-button.active');
      const filterType = activeButton?.classList.contains('filter-all') ? 'all' :
                        activeButton?.classList.contains('filter-active') ? 'active' : 'completed';
      
      filterItems(filterType as 'all' | 'active' | 'completed', searchInput.value);
    });
    
    return filterContainer;
  }
} 