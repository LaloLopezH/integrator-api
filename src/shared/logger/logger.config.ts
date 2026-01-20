import { join } from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export function createLogger(moduleName: string): winston.Logger {
  return winston.createLogger({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${moduleName}] ${level.toUpperCase()}: ${message}`;
      }),
    ),
    transports: [
      new DailyRotateFile({
        //dirname: join(__dirname, '../../', 'logs', moduleName), // Ruta de los logs
        dirname: join(process.env.LOG_DIRECTORY, 'logs', moduleName), // Ruta de los logs
        filename: `${moduleName}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d', // Conserva 14 días de logs
        level: 'error',
      }),
      new winston.transports.Console(), // Para logs en la consola
    ],
  });
}