import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import SftpClient from 'ssh2-sftp-client';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class SftpPrintService implements OnModuleInit, OnModuleDestroy {
  private client: SftpClient;

  constructor(private readonly logger: LoggerService) {
    this.client = new SftpClient();
  }

  async onModuleInit() {
    this.logger.logError('Inicio de SftpPrintService');
    await this.connectToSftp();
  }

  async onModuleDestroy() {
    await this.disconnectFromSftp();
  }

  private async connectToSftp(): Promise<void> {
    try {
      await this.reconnectToSftp();
    } catch (error) {
      this.logger.logError(
        `Error al conectar al servidor SFTP Print: ${error.message}`,
        error.stack,
      );
    }
  }

  private async disconnectFromSftp(): Promise<void> {
    try {
      if (this.client) {
        await this.client.end();
        this.logger.logError('Conexión SFTP Print cerrada');
      }
    } catch (error) {
      this.logger.logError(
        `Error al cerrar la conexión SFTP Print ${error.message}`,
        error.stack,
      );
    }
  }

  private async reconnectToSftp(): Promise<void> {
    await this.disconnectFromSftp();
    this.client = new SftpClient();
    await this.client.connect({
      host: process.env.SFTP_PRINT_SERVER,
      port: Number(process.env.SFTP_PRINT_PORT),
      username: process.env.SFTP_PRINT_USER,
      password: process.env.SFTP_PRINT_PASSWORD,
    });
    this.logger.logError('Conexión SFTP Print establecida');
  }

  private async ensureConnection(): Promise<void> {
    if (!this.client.sftp) {
      this.logger.logError('Cliente SFTP no está conectado. Reintentando conexión...');
      await this.reconnectToSftp();
    }
  }

  async uploadFile(remotePath: string, localPath: string): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.ensureConnection();

        this.logger.logError(
          `Intentando subir archivo (intento ${attempt + 1}): ${localPath} -> ${remotePath}`,
        );
        await this.client.put(localPath, remotePath);

        this.logger.logError(`Archivo subido exitosamente al SFTP: ${remotePath}`);
        return 'Archivo subido exitosamente al SFTP Print.';
      } catch (error) {
        attempt++;
        this.logger.logError(
          `Error al subir archivo al SFTP (intento ${attempt}/${maxRetries}): ${localPath} -> ${remotePath}. Error: ${error.message}`,
          error.stack,
        );

        if (attempt >= maxRetries) {
          throw new Error(
            `Fallo permanente al subir el archivo al SFTP después de ${maxRetries} intentos`,
          );
        }

        await new Promise((res) => setTimeout(res, 1000 * attempt));
        try {
          await this.reconnectToSftp();
        } catch (reconnectError) {
          this.logger.logError(
            `Error al reconectar al servidor SFTP Print: ${reconnectError.message}`,
            reconnectError.stack,
          );
        }
      }
    }

    return 'Error desconocido al subir archivo al SFTP Print.';
  }
}
