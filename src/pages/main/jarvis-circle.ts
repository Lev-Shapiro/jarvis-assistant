class JarvisCircle {
  private static instance: JarvisCircle;
  private circle: HTMLElement;
  private isSecurityActive: boolean = false;

  private constructor() {
    this.circle = document.getElementById('jarvis-circle')!;
  }

  static getInstance(): JarvisCircle {
    if (!JarvisCircle.instance) {
      JarvisCircle.instance = new JarvisCircle();
    }
    return JarvisCircle.instance;
  }

  activateSecurityProtocol(): void {
    if (this.isSecurityActive) return;
    
    this.isSecurityActive = true;
    
    // Remove the default pulse-glow animation
    this.circle.style.animation = 'none';
    
    // Apply red security styles
    this.circle.style.background = 'radial-gradient(circle at center, hsla(0, 100%, 70%, 0.8) 0%, hsla(0, 100%, 50%, 0.9) 40%, hsla(0, 100%, 30%, 1) 100%)';
    this.circle.style.boxShadow = '0 0 15px hsla(0, 100%, 60%, 0.6), 0 0 30px hsla(0, 100%, 50%, 0.4), inset 0 0 10px hsla(0, 100%, 70%, 0.5)';
    
    // Add security pulse animation
    this.circle.style.animation = 'security-pulse 1.5s infinite ease-in-out';
  }

  deactivateSecurityProtocol(): void {
    if (!this.isSecurityActive) return;
    
    this.isSecurityActive = false;
    
    // Remove the security animation
    this.circle.style.animation = 'none';
    
    // Reset to default styles
    this.circle.style.background = 'radial-gradient(circle at center, hsla(195, 100%, 70%, 0.8) 0%, hsla(195, 100%, 50%, 0.9) 40%, hsla(210, 100%, 30%, 1) 100%)';
    this.circle.style.boxShadow = '0 0 15px hsla(195, 100%, 60%, 0.6), 0 0 30px hsla(195, 100%, 50%, 0.4), inset 0 0 10px hsla(195, 100%, 70%, 0.5)';
    
    // Restore default animation
    this.circle.style.animation = 'pulse-glow 4s infinite ease-in-out';
  }
} 