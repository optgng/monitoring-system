type LogLevel = "error" | "warn" | "info" | "debug"

class Logger {
  private logLevel: LogLevel

  constructor(level: LogLevel = "info") {
    this.logLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    }

    return levels[level] <= levels[this.logLevel]
  }

  error(message: string, error?: any): void {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, error || "")

      // In production, you might want to send this to a monitoring service
      if (process.env.NODE_ENV === "production") {
        // Send to monitoring service like Sentry
        // Sentry.captureException(error);
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, data || "")
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog("info")) {
      console.info(`[INFO] ${message}`, data || "")
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, data || "")
    }
  }
}

// Create a singleton instance
export const logger = new Logger(process.env.NODE_ENV === "development" ? "debug" : "info")
