import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerServiceOLD {
  private logsDirectory = path.resolve(__dirname, '../log');

  constructor() {
    if (!fs.existsSync(this.logsDirectory)) {
      fs.mkdirSync(this.logsDirectory, { recursive: true });
    }
  }

  async saveLog(data: string): Promise<void> {
    const date = new Date();
    const fileName = `${date.toISOString().split('T')[0]}.txt`;
    const filePath = path.join(this.logsDirectory, fileName);
    const logEntry = `[${date.toISOString()}] ${data}\n`;

    // Escribe los datos en el archivo, creándolo si no existe
    fs.appendFile(filePath, logEntry, (err) => {
      if (err) {
        console.error('Error writing log:', err);
      }
    });
  }
}