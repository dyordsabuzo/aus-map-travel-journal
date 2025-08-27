import { createConsola } from "consola";

// Create logger instance with configuration
export const logger = createConsola({
  level: import.meta.env.DEV ? 4 : 2, // 4=debug in dev, 2=info in prod
  formatOptions: {
    date: true,
    colors: true,
  },
});

// Utility class for structured logging with common patterns
export class Logger {
  /**
   * Wraps async operations with automatic logging
   */
  static async withTryCatch<T>(
    operation: () => Promise<T>,
    context: string,
    meta?: Record<string, any>
  ): Promise<T> {
    try {
      logger.start(`Starting ${context}`, meta);
      const startTime = Date.now();

      const result = await operation();

      const duration = Date.now() - startTime;
      logger.success(`Completed ${context} in ${duration}ms`, {
        ...meta,
        duration,
      });

      return result;
    } catch (error) {
      logger.error(`Failed ${context}`, error, meta);
      throw error; // Re-throw to maintain error flow
    }
  }

  /**
   * Wraps sync operations with automatic logging
   */
  static withTryCatchSync<T>(
    operation: () => T,
    context: string,
    meta?: Record<string, any>
  ): T {
    try {
      logger.start(`Starting ${context}`, meta);
      const result = operation();
      logger.success(`Completed ${context}`, meta);
      return result;
    } catch (error) {
      logger.error(`Failed ${context}`, error, meta);
      throw error;
    }
  }

  // Direct logging methods
  static info(message: string, ...args: any[]) {
    logger.info(message, ...args);
  }

  static error(message: string, error?: unknown, meta?: Record<string, any>) {
    logger.error(message, error, meta);
  }

  static warn(message: string, ...args: any[]) {
    logger.warn(message, ...args);
  }

  static debug(message: string, ...args: any[]) {
    logger.debug(message, ...args);
  }

  static success(message: string, ...args: any[]) {
    logger.success(message, ...args);
  }
}
