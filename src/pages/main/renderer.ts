// Initialize error display
const errorDisplay = ErrorDisplay.getInstance();

// Initialize jarvis circle
const jarvisCircle = JarvisCircle.getInstance();

window.mainWindowAPI.onMessage('notification:show-error', (message: string) => {
  errorDisplay.showError(message);

  setTimeout(() => {
    errorDisplay.hideError();
  }, 3000);
});

window.mainWindowAPI.onMessage('security:activate-protocol', () => {
  jarvisCircle.activateSecurityProtocol();
});

window.mainWindowAPI.onMessage('security:deactivate-protocol', () => {
  jarvisCircle.deactivateSecurityProtocol();
});