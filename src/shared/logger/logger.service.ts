import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { createLogger } from './logger.config';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor(moduleName: string) {
    this.logger = createLogger(moduleName);
  }

  logError(message: string, trace?: string) {
    console.log("logError", message);
    this.logger.error(message + (trace ? ` | Trace: ${trace}` : ''));
  }
}