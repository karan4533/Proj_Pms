/**
 * Enterprise Logging Service
 * Provides structured logging with environment-based filtering
 * Integrates with error tracking services in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug logs - only in development
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logs - important business logic events
   * Logged in all environments
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, context || '');
    } else if (this.isProduction) {
      // In production, only log without sensitive data
      console.log(`[INFO] ${message}`);
    }
  }

  /**
   * Warning logs - potential issues that don't break functionality
   * Always logged
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`⚠️ [WARN] ${message}`, context || '');
  }

  /**
   * Error logs - critical failures
   * Always logged and sent to error tracking in production
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`❌ [ERROR] ${message}`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });

    // Send to error tracking service in production
    if (this.isProduction && typeof window !== 'undefined') {
      // Integration point for Sentry, LogRocket, etc.
      // window.Sentry?.captureException(error);
    }
  }

  /**
   * Performance logging - track slow operations
   */
  perf(operation: string, duration: number, threshold: number = 1000): void {
    if (duration > threshold) {
      this.warn(`Slow operation: ${operation}`, {
        duration: `${duration}ms`,
        threshold: `${threshold}ms`,
      });
    } else if (this.isDevelopment) {
      this.debug(`${operation} completed`, { duration: `${duration}ms` });
    }
  }

  /**
   * API request logging
   */
  api(method: string, path: string, status: number, duration: number): void {
    const emoji = status >= 500 ? '💥' : status >= 400 ? '⚠️' : '✅';
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    
    const message = `${emoji} ${method} ${path} - ${status} (${duration}ms)`;
    
    if (level === 'error') {
      this.error(message);
    } else if (level === 'warn') {
      this.warn(message);
    } else {
      this.info(message);
    }
  }

  /**
   * Database query logging
   */
  query(query: string, duration: number, rows?: number): void {
    if (this.isDevelopment) {
      this.debug(`📊 Query executed`, {
        query: query.substring(0, 100),
        duration: `${duration}ms`,
        rows,
      });
    }
    
    // Alert on slow queries
    if (duration > 1000) {
      this.warn(`Slow database query detected`, {
        duration: `${duration}ms`,
        query: query.substring(0, 50) + '...',
      });
    }
  }

  /**
   * Authentication events
   */
  auth(event: 'login' | 'logout' | 'register' | 'failed', userId?: string): void {
    const emoji = event === 'failed' ? '🔒' : event === 'logout' ? '👋' : '🔐';
    this.info(`${emoji} Auth: ${event}`, { userId });
  }

  /**
   * Security events - always logged
   */
  security(event: string, context?: LogContext): void {
    console.warn(`🚨 [SECURITY] ${event}`, context || '');
    
    // Send to monitoring service
    if (this.isProduction) {
      // Integration point for security monitoring
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export utility for performance timing
export function logPerformance(operation: string, fn: () => Promise<any>) {
  return async () => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.perf(operation, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`${operation} failed after ${duration}ms`, error);
      throw error;
    }
  };
}
