export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface ILogEvent {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;      // Identifies the subsystem (e.g., 'API', 'UI-Button')
  errorDetails?: {
    name?: string;
    message?: string;
    stack?: string;      // Captured execution stack trace
  };
}

class TelemetryLogger {
  private isProduction = process.env.NODE_ENV === 'production';

  private dispatchLog(level: LogLevel, message: string, context?: string, error?: Error) {
    const event: ILogEvent = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      errorDetails: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    // 1. Development Console Output Automation
    if (!this.isProduction) {
      const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[32m';
      console.log(
        `[${event.timestamp}] ${color}[${event.level}]${color === '\x1b[32m' ? '' : '\x1b[0m'}[${event.context || 'GLOBAL'}] ${event.message}`
      );
      if (error?.stack) {
        console.error(error.stack);
      }
    }

    // 2. Production Cloud Pipeline Hook (Sentry / Datadog Sink)
    if (this.isProduction) {
      // TODO: Connect direct HTTP telemetry sink payload transmission here
      // This will run globally inside background web-workers or native threads without halting UI execution
    }
  }

  public info(message: string, context?: string) {
    this.dispatchLog('INFO', message, context);
  }

  public warn(message: string, context?: string) {
    this.dispatchLog('WARN', message, context);
  }

  public error(message: string, context?: string, error?: Error) {
    this.dispatchLog('ERROR', message, context, error);
  }
}

// Export as a unified operational Singleton instance
export const logger = new TelemetryLogger();
