import { FormattedTextData } from "@/infrastructure/infobar/infobar.types";
import { TextFormatType } from "@/infrastructure/infobar/types/text-format-type";
import { DomUtils } from "../../utils/dom.utils";
import { InfobarRenderer } from "../renderer.interface";

/**
 * Renderer for formatted text data
 */
export class FormattedTextRenderer implements InfobarRenderer<FormattedTextData> {
  /**
   * Renders formatted text data into an HTML element
   * @param data The formatted text data
   * @returns The rendered HTML element
   */
  render(data: FormattedTextData): HTMLElement {
    const container = DomUtils.createElement('div', {
      classes: ['formatted-text-container']
    });
    
    switch (data.format) {
      case TextFormatType.Markdown:
        container.innerHTML = this.renderMarkdown(data.content);
        break;
      case TextFormatType.HTML:
        container.innerHTML = this.sanitizeHtml(data.content);
        break;
      case TextFormatType.JSON:
        container.innerHTML = this.formatJson(data.content);
        break;
      case TextFormatType.Code:
        container.innerHTML = this.formatCode(data.content);
        break;
      default:
        container.textContent = data.content;
        break;
    }
    
    return container;
  }
  
  /**
   * Renders markdown content into HTML
   * Uses a simple regex-based approach for basic markdown
   * @param markdown The markdown content
   * @returns The HTML representation of the markdown
   */
  private renderMarkdown(markdown: string): string {
    // Process multiline elements first
    let html = markdown
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      // Headings (h1, h2, h3)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Horizontal rule
      .replace(/^---+$/gm, '<hr>')
      // Block quotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Unordered lists
      .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Convert lists to proper HTML
    html = html
      .replace(/<li>(.+?)(?=<li>|$)/gs, '<ul><li>$1</li></ul>')
      .replace(/<\/ul><ul>/g, '');
      
    // Process inline elements
    html = html
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Code spans
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // New lines
      .replace(/\n/g, '<br>');
      
    return html;
  }
  
  /**
   * Formats JSON content with syntax highlighting
   * @param json The JSON content as a string
   * @returns The formatted HTML
   */
  private formatJson(json: string): string {
    try {
      // Parse and prettify JSON
      const parsedJson = JSON.parse(json);
      const prettyJson = JSON.stringify(parsedJson, null, 2);
      
      // Apply basic syntax highlighting
      return `<pre class="json-formatter">${
        prettyJson
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
            (match) => {
              let cls = 'json-number';
              if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                  cls = 'json-key';
                } else {
                  cls = 'json-string';
                }
              } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
              } else if (/null/.test(match)) {
                cls = 'json-null';
              }
              return `<span class="${cls}">${match}</span>`;
            }
          )
      }</pre>`;
    } catch (e) {
      return `<pre class="json-error">Invalid JSON: ${json}</pre>`;
    }
  }
  
  /**
   * Formats code with syntax highlighting
   * @param code The code content
   * @returns The formatted HTML
   */
  private formatCode(code: string): string {
    // Temporary tokens for HTML replacement - we'll replace these after escaping
    const TOKEN_KEYWORD = "##KEYWORD_TOKEN##";
    const TOKEN_STRING = "##STRING_TOKEN##";
    const TOKEN_COMMENT = "##COMMENT_TOKEN##";
    
    // First mark the syntax elements with temporary tokens
    let processedCode = code
      // Keywords - improved regex pattern to only match exact keywords
      .replace(/\b(function|return|if|for|while|else|class|interface|import|export|const|let|var|async|await)\b/g, 
        `${TOKEN_KEYWORD}$1${TOKEN_KEYWORD}`)
      // Strings - non-greedy pattern to handle multiple strings on one line
      .replace(/(".*?"|'.*?'|`.*?`)/g, `${TOKEN_STRING}$1${TOKEN_STRING}`)
      // Comments
      .replace(/(\/\/.*$)/gm, `${TOKEN_COMMENT}$1${TOKEN_COMMENT}`);
      
    // Then escape HTML characters
    processedCode = processedCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // Finally replace the tokens with actual HTML tags
    processedCode = processedCode
      .replace(new RegExp(`${TOKEN_KEYWORD}(.*?)${TOKEN_KEYWORD}`, 'g'), '<span class="code-keyword">$1</span>')
      .replace(new RegExp(`${TOKEN_STRING}(.*?)${TOKEN_STRING}`, 'g'), '<span class="code-string">$1</span>')
      .replace(new RegExp(`${TOKEN_COMMENT}(.*?)${TOKEN_COMMENT}`, 'g'), '<span class="code-comment">$1</span>');
    
    return `<pre class="code-formatter"><code>${processedCode}</code></pre>`;
  }
  
  /**
   * Sanitizes HTML to prevent XSS attacks
   * @param html The HTML content
   * @returns The sanitized HTML
   */
  private sanitizeHtml(html: string): string {
    // Basic sanitization - in a production app, use a proper library
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/onerror|onclick|onload|onmouseover|javascript:/gi, '');
  }
} 