// Modern Notification System
// Creative and modern design for alerts throughout the project

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  showProgress?: boolean;
}

class NotificationManager {
  private container: HTMLDivElement | null = null;
  private notifications: Set<HTMLDivElement> = new Set();

  private getContainer(): HTMLDivElement {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private getIcon(type: NotificationType): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type];
  }

  private getColors(type: NotificationType) {
    const colors = {
      success: {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        bgSolid: '#667eea',
        icon: '#fff',
        text: '#fff'
      },
      error: {
        bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        bgSolid: '#f5576c',
        icon: '#fff',
        text: '#fff'
      },
      warning: {
        bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        bgSolid: '#fa709a',
        icon: '#fff',
        text: '#fff'
      },
      info: {
        bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        bgSolid: '#4facfe',
        icon: '#fff',
        text: '#fff'
      }
    };
    return colors[type];
  }

  show(message: string, options: NotificationOptions = {}): void {
    const {
      type = 'info',
      duration = 4000,
      position = 'top-right',
      showProgress = true
    } = options;

    const container = this.getContainer();
    const colors = this.getColors(type);
    const icon = this.getIcon(type);

    // Update container position based on options
    this.updateContainerPosition(position);

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: relative;
      min-width: 320px;
      max-width: 420px;
      background: ${colors.bg};
      color: ${colors.text};
      padding: 18px 22px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                  0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 14px;
      opacity: 0;
      transform: translateX(100px) scale(0.9);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: all;
      cursor: pointer;
      overflow: hidden;
      backdrop-filter: blur(10px);
    `;

    // Icon container
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
      animation: iconPulse 2s ease-in-out infinite;
    `;
    iconContainer.textContent = icon;

    // Message container
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
      flex: 1;
      font-size: 15px;
      line-height: 1.5;
      font-weight: 500;
      letter-spacing: 0.2px;
    `;
    messageContainer.textContent = message;

    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      width: 28px;
      height: 28px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      color: ${colors.text};
      font-size: 22px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
      font-weight: 300;
      line-height: 1;
      padding: 0;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
      closeButton.style.transform = 'rotate(90deg) scale(1.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
      closeButton.style.transform = 'rotate(0deg) scale(1)';
    });

    notification.appendChild(iconContainer);
    notification.appendChild(messageContainer);
    notification.appendChild(closeButton);

    // Progress bar
    if (showProgress && duration > 0) {
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.6);
        width: 100%;
        transform-origin: left;
        animation: progressBarShrink ${duration}ms linear;
      `;
      notification.appendChild(progressBar);
    }

    // Add animations to head if not already present
    if (!document.getElementById('notification-animations')) {
      const style = document.createElement('style');
      style.id = 'notification-animations';
      style.textContent = `
        @keyframes progressBarShrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes notificationShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Remove notification function
    const removeNotification = () => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px) scale(0.9)';
      setTimeout(() => {
        if (container.contains(notification)) {
          container.removeChild(notification);
          this.notifications.delete(notification);
        }
      }, 400);
    };

    // Click to dismiss
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      removeNotification();
    });

    // Click notification to dismiss
    notification.addEventListener('click', removeNotification);

    // Add to container
    container.appendChild(notification);
    this.notifications.add(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0) scale(1)';
    });

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(removeNotification, duration);
    }
  }

  private updateContainerPosition(position: string): void {
    if (!this.container) return;

    const positions = {
      'top-right': 'top: 20px; right: 20px; left: auto; bottom: auto;',
      'top-center': 'top: 20px; left: 50%; transform: translateX(-50%); right: auto; bottom: auto;',
      'top-left': 'top: 20px; left: 20px; right: auto; bottom: auto;',
      'bottom-right': 'bottom: 20px; right: 20px; left: auto; top: auto;',
      'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%); right: auto; top: auto;',
      'bottom-left': 'bottom: 20px; left: 20px; right: auto; top: auto;'
    };

    const positionStyle = positions[position as keyof typeof positions] || positions['top-right'];
    this.container.style.cssText = `
      position: fixed;
      ${positionStyle}
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
  }

  success(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'error' });
  }

  warning(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'warning' });
  }

  info(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'info' });
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.forEach(notification => {
      if (this.container && this.container.contains(notification)) {
        this.container.removeChild(notification);
      }
    });
    this.notifications.clear();
  }
}

// Export singleton instance
export const notification = new NotificationManager();

// Convenience function for backwards compatibility with alert()
export const showNotification = (
  message: string,
  type: NotificationType = 'info',
  duration?: number
): void => {
  notification.show(message, { type, duration });
};
