import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.printMessage(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.printMessage(LogLevel.ERROR, message, context, trace);
  }

  warn(message: string, context?: string) {
    this.printMessage(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: string) {
    this.printMessage(LogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string) {
    this.printMessage(LogLevel.INFO, message, context);
  }

  private printMessage(
    level: LogLevel,
    message: string,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';

    const logObject = {
      timestamp,
      level,
      context: ctx,
      message,
      ...(trace && { trace }),
    };

    const formattedLog = JSON.stringify(logObject);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
  }

  logRequest(method: string, url: string, userId?: string) {
    this.log(`${method} ${url}${userId ? ` - User: ${userId}` : ''}`, 'HTTP');
  }

  logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
  ) {
    this.log(`${method} ${url} - ${statusCode} - ${duration}ms`, 'HTTP');
  }
}
