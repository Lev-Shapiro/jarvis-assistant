import { TableData } from '@/infrastructure/infobar/infobar.types';
import { DomUtils } from '../../utils/dom.utils';
import { InfobarRenderer } from '../renderer.interface';

/**
 * Renderer for table data
 */
export class TableRenderer implements InfobarRenderer<TableData> {
  /**
   * Renders table data into an HTML element
   * @param data The table data
   * @returns The rendered HTML element
   */
  render(data: TableData): HTMLElement {
    const container = DomUtils.createElement('div', {
      classes: ['table-container']
    });
    
    // Create table element
    const table = document.createElement('table');
    
    // Add responsive wrapper
    const tableResponsive = DomUtils.createElement('div', {
      classes: ['table-responsive']
    });
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    data.headers.forEach((headerText) => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.scope = 'col';
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    data.rows.forEach((rowData) => {
      const row = document.createElement('tr');
      
      rowData.forEach((cellData, colIndex) => {
        const cell = document.createElement('td');
        
        // Format cell content based on data type
        if (typeof cellData === 'boolean') {
          // Create a checkmark or X for boolean values
          const icon = DomUtils.createElement('span', {
            classes: [cellData ? 'boolean-true' : 'boolean-false'],
            content: cellData ? '✓' : '✕'
          });
          cell.appendChild(icon);
        } else if (typeof cellData === 'number') {
          // Format numbers (add thousand separators)
          cell.textContent = this.formatNumber(cellData);
        } else {
          // Handle string data
          cell.textContent = String(cellData);
        }
        
        // Add data attribute with column name for responsive view
        if (data.headers[colIndex]) {
          cell.setAttribute('data-label', data.headers[colIndex]);
        }
        
        row.appendChild(cell);
      });
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableResponsive.appendChild(table);
    container.appendChild(tableResponsive);
    
    // Add search functionality for larger tables
    if (data.rows.length > 5) {
      const searchContainer = this.createSearchBar(table);
      container.insertBefore(searchContainer, tableResponsive);
    }
    
    return container;
  }
  
  /**
   * Creates a search bar for table filtering
   * @param table The table element to filter
   * @returns The search container element
   */
  private createSearchBar(table: HTMLTableElement): HTMLElement {
    const searchContainer = DomUtils.createElement('div', {
      classes: ['table-search-container']
    });
    
    const searchInput = DomUtils.createElement('input', {
      classes: ['table-search-input'],
      attributes: {
        type: 'text',
        placeholder: 'Search table...'
      }
    }) as HTMLInputElement;
    
    // Add search functionality
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach((row) => {
        const text = row.textContent?.toLowerCase() || '';
        const htmlRow = row as HTMLElement;
        
        if (text.includes(searchTerm)) {
          htmlRow.style.display = '';
        } else {
          htmlRow.style.display = 'none';
        }
      });
    });
    
    searchContainer.appendChild(searchInput);
    return searchContainer;
  }
  
  /**
   * Formats a number with thousand separators
   */
  private formatNumber(num: number): string {
    return num.toLocaleString();
  }
} 