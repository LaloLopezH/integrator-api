import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import SftpClient from 'ssh2-sftp-client';
import * as path from 'path';
import { FileRemoveService } from '../file-remove.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class SftpService implements OnModuleInit, OnModuleDestroy {
  private client: SftpClient;
  private readonly localPath = './' + process.env.DIRECTORY_FILES;
  private readonly remotePath = process.env.SFTP_PATH;
  private readonly remoteFileProcessedPath = process.env.SFTP_PATH_FILEPROCESSED;
  private readonly intervalExecution = +process.env.EXECUTION_INTERVAL * 1000;
  
  constructor(private readonly fileRemoveService: FileRemoveService,
              private readonly logger: LoggerService
  ) {
    this.client = new SftpClient();
  }

  async onModuleInit() {

    this.logger.logError("Inicio de SftpService");

    await this.connectToSftp();

    await this.watchDirectory(process.env.SFTP_PATH);

    this.fileRemoveService.fileList$.subscribe(async fileList => {
      this.logger.logError(`'Lista de archivos remotos:', ${JSON.stringify(fileList, null, 2)}`);

      for (const fileName of fileList) {
        const remoteFilePath = path.join(this.remotePath, fileName);
        const remoteFileProcessedPath = path.join(this.remoteFileProcessedPath, fileName);
        await this.moveFile(remoteFilePath, remoteFileProcessedPath);
      };
      
    });
  }

  async onModuleDestroy() {
    await this.disconnectFromSftp();
  }

  private async connectToSftp() {
    try {
      await this.client.connect({
        host: process.env.SFTP_SERVER,
        port: process.env.SFTP_PORT,
        username:  process.env.SFTP_USER,
        password: process.env.SFTP_PASSWORD,
      });

      this.logger.logError('Conexión SFTP establecida');
    } catch (error) {
      this.logger.logError(`Error al conectar al servidor SFTP: ${error.message}`, error.stack);
    }
  }

  private async disconnectFromSftp() {
    try {
      await this.client.end();
      this.logger.logError('Conexión SFTP cerrada');
    } catch (error) {
      this.logger.logError(`Error al cerrar la conexión SFTP: ${error.message}`, error.stack);
    }
  }

  async listFiles(directory: string): Promise<string[]> {
    try {
      const fileList = await this.client.list(directory);
      return fileList.map(file => file.name);
    } catch (error) {
      this.logger.logError(`Error al listar archivos: ${error.message}`, error.stack);
      return [];
    }
  }

  async watchDirectory(directory: string, interval: number = 10000): Promise<void> {
    const observedFiles = new Set<string>();

    setInterval(async () => {
      try {
        const currentFiles = await this.listFiles(directory);
        const newFiles = currentFiles.filter(file => !observedFiles.has(file));
        
        newFiles.forEach(async file => {
          if(file.includes('.csv')) {
            this.logger.logError(`Nuevo archivo encontrado: ${file}`);
            const remoteFilePath = path.join(this.remotePath, file);
            const localFilePath = path.join(this.localPath, file);
            await this.downloadFile(remoteFilePath, localFilePath);            
          }         
        });

      } catch (error) {
        this.logger.logError(`Error al observar la carpeta: ${error.message}`, error.stack);
      }
    }, this.intervalExecution);
  }

  private async downloadFile(remoteFilePath: string, localFilePath: string) {
    try {
      await this.client.get(remoteFilePath, localFilePath);
      this.logger.logError(`Archivo descargado: ${remoteFilePath}`);
    } catch (error) {
      this.logger.logError(`Error descargando archivo: ${remoteFilePath} - ${error.message}`, error.stack);
    }
  }

  async copyFile(fromPath: string, toPath: string): Promise<string> {
    try {
      // Leer el archivo desde la ruta origen
      const fileBuffer = await this.client.get(fromPath);

      // Subir el archivo al destino
      await this.client.put(fileBuffer, toPath);
      
      return `Archivo copiado de ${fromPath} a ${toPath}`;
    } catch (error) {      
      this.logger.logError(`No se pudo copiar el archivo - ${error.message}`, error.stack);
    }
  }

  private async moveFile(fromPath: string, toPath: string): Promise<string> {
    try {
      // Mover el archivo del directorio origen al directorio destino
      this.logger.logError(`Archivo movido de ${fromPath} a ${toPath}`);
      await this.client.rename(fromPath, toPath);      

      return `Archivo movido de ${fromPath} a ${toPath}`;
    } catch (error) {
      this.logger.logError(`Error al mover archivo - ${error.message}`, error.stack);
      //throw new Error('No se pudo mover el archivo');
    }
  }

  private async deleteFile(filePath: string): Promise<string> {
    try {
      await this.client.delete(filePath);
      
      return `Archivo eliminado: ${filePath}`;
    } catch (error) {
      this.logger.logError(`Error al eliminar archivo - ${error.message}`, error.stack);
      //throw new Error('No se pudo eliminar el archivo');
    }
  }

  async uploadFile(
    remotePath: string,
    localPath: string,
  ): Promise<string> {
    try {

      await this.client.put(localPath, remotePath);
      //await this.client.end();

      return 'Archivo subido exitosamente.';
    } catch (error) {
      this.logger.logError(`Error al subir el archivo - ${error.message}`, error.stack);
      //throw new Error(`Error al subir el archivo: ${error.message}`);
    }
  }
}