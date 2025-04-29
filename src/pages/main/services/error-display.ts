export class ErrorDisplay {
  private static instance: ErrorDisplay;
  private errorContainer: HTMLElement;
  private errorMessage: HTMLElement;
  private closeButton: HTMLElement;

  private constructor() {
    this.errorContainer = document.getElementById('error-container')!;
    this.errorMessage = document.querySelector('.error-message')!;
    this.closeButton = document.querySelector('.error-close')!;

    this.closeButton.addEventListener('click', () => this.hideError());
  }

  static getInstance(): ErrorDisplay {
    if (!ErrorDisplay.instance) {
      ErrorDisplay.instance = new ErrorDisplay();
    }
    return ErrorDisplay.instance;
  }

  showError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorContainer.classList.remove('hidden');
  }

  hideError(): void {
    this.errorContainer.classList.add('hidden');
  }

  showErrorFor3Seconds(message: string): void {
    this.showError(message);
    setTimeout(() => {
      this.hideError();
    }, 3000);
  }
}