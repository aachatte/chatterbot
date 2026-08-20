/**
 * Logger service for structured logging
 * Sends logs to backend for monitoring and debugging
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  /**
   * Format log message with timestamp
   */
  formatMessage(level, message, data) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Send log to backend
   */
  async sendToBackend(logData) {
    try {
      // Don't send logs if in development (unless explicitly enabled)
      if (this.isDevelopment && !import.meta.env.VITE_LOG_TO_BACKEND) {
        return;
      }

      await fetch(`${this.apiUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });
    } catch (error) {
      // Silently fail to avoid infinite loops
      console.error('Failed to send log to backend:', error);
    }
  }

  /**
   * Debug level logging
   */
  debug(message, data = {}) {
    const logData = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
    if (this.isDevelopment) {
      console.debug(`[${logData.timestamp}] ${message}`, data);
    }
    this.sendToBackend(logData);
  }

  /**
   * Info level logging
   */
  info(message, data = {}) {
    const logData = this.formatMessage(LOG_LEVELS.INFO, message, data);
    console.log(`[${logData.timestamp}] ${message}`, data);
    this.sendToBackend(logData);
  }

  /**
   * Warning level logging
   */
  warn(message, data = {}) {
    const logData = this.formatMessage(LOG_LEVELS.WARN, message, data);
    console.warn(`[${logData.timestamp}] ${message}`, data);
    this.sendToBackend(logData);
  }

  /**
   * Error level logging
   */
  error(message, data = {}) {
    const logData = this.formatMessage(LOG_LEVELS.ERROR, message, data);
    console.error(`[${logData.timestamp}] ${message}`, data);
    this.sendToBackend(logData);
  }
}

const logger = new Logger();
export default logger;
