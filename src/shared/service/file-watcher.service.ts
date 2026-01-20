import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import csvParser  from 'csv-parser';
import { FileRemoveService } from './file-remove.service';
import { FileTrackerService } from './file-tracker.service';
import { LoggerService } from '../logger/logger.service';
import * as readline from 'readline';

@Injectable()
export class FileWatcherService implements OnModuleInit {
  private readonly directoryPath = './' + process.env.DIRECTORY_FILES;
  private readonly processedFilePath = './' + process.env.DIRECTORY_FILES_PROCESSED;
  private readonly intervalExecution = +process.env.EXECUTION_INTERVAL * 1000;
  private readonly processedFiles = new Set<string>();
  //private readonly logger = new Logger(FileWatcherService.name);
  delimiters = [',', ';', '\t', '|']; // Lista de delimitadores comunes

  constructor(private readonly fileRemoveService: FileRemoveService,
              private readonly fileTrackerService: FileTrackerService,
              private readonly logger: LoggerService)
  {}

  async onModuleInit() {
    
    if (!fs.existsSync(this.directoryPath)) {
      fs.mkdirSync(this.directoryPath);
    }

    this.fileRemoveService.fileList$.subscribe(async fileList => {
      console.log('Lista de archivos para eliminar:', fileList);

      for (const fileName of fileList) {
        const filePath = path.join(this.directoryPath, fileName);
        this.fileRemoveService.removeFile(fileName);
        await this.copyFileToAnotherDirectory(filePath, fileName);
      };          
    });
    
    this.watchDirectory();
  }

  private watchDirectory() {
    setInterval(() => {
      fs.readdir(this.directoryPath, (err, files) => {
        if (err) {
          this.logger.logError(`Ocurrió un error al leer archivos del SFTP, error: ${err.message}`, err.stack);
          return;
        }
        
        files.forEach(async (file) => {
          await this.processCSVFile(file);
        });
      });
      
    }, this.intervalExecution);
  }

  private async processCSVFile(fileName: any) {
    const filePath = path.join(this.directoryPath, fileName);

    if (fileName.endsWith('.csv') && !this.processedFiles.has(filePath)) {
      try {
        const delimiter = ",";// await this.detectDelimiter(filePath);
        const cleanedFilePath = path.join(this.directoryPath, 'cleaned.csv');
        this.logger.logError(`processCSVFile - cleanedFilePath: ${cleanedFilePath}`);
        this.logger.logError(`processCSVFile - filePath: ${filePath}`);
        
        await this.cleanCsvFile(filePath, cleanedFilePath);

        await this.readCSVFile(cleanedFilePath, delimiter, fileName);
        
        await this.copyFileToAnotherDirectory(filePath, fileName);
        await this.copyFileToAnotherDirectory(cleanedFilePath, 'cleaned.csv');
        return { message: 'CSV procesado y movido exitosamente' };
      } catch (error) {
        this.logger.logError(`OHubo un error procesando el CSV error: ${error.message}`, error.stack);
      }            
    }
  }

  private async readCSVFile(filePath: string, delimiter: string, fileName: string) {
    this.logger.logError(`Procesando archivo CSV: ${filePath}`);
  
    const results = [];    
    //const delimiter = ';';
    //const aa = await this.detectDelimiter(filePath);
    //console.log("delimiter", delimiter);

    return new Promise<void>((resolve, reject) => {
      let isFirstRow = true;
      let index = 1;
      const headers: string[] = [];
      
      // Leer el archivo CSV
      fs.createReadStream(filePath)
        .pipe(csvParser({ 
          separator: ',',
          skipLines: 1, 
          quote: '"',
          escape: '"',
        }))
        .on('headers', (headerList: string[]) => {
          headers.push(...headerList); // Guardamos los encabezados esperados
          console.log('Expected headers:', headers);
        })
        .on('data', row => {
          //this.logger.logError(`index: ${index}`);
          index++;

          try {
            const columnsInRow = Object.keys(row);
            if (columnsInRow.length !== headers.length) {
              this.logger.logError(`Line ${index} has a column mismatch: expected ${headers.length}, got ${columnsInRow.length}.`);
              
              this.logger.logError(`Problematic row:`, JSON.stringify(row, null, 2));

              //return; // Saltamos esta línea pero seguimos procesando las demás
            }
            else {
              results.push(row);
            }

          } catch (err) {
            this.logger.logError(`Problematic error: ${err.message}`, err.stack);
            this.logger.logError(`Problematic error row:`, JSON.stringify(row, null, 2));
          }
          
        })
        .on('end', async () => {
          try {
            this.logger.logError(`iArchivo procesado con éxito: ${filePath}`);
            //this.logger.debug(results);
            //console.log("results", results);
            //this.logger.logError(`buildDTOFromDataFile - results`, JSON.stringify(results, null, 2));
            this.fileTrackerService.addItem(fileName, results);
            //if(filePath.includes('TPRO')) {
              //await this.articleService.processFileWMS(results, fileName); 
            //}

            //if(filePath.includes('RUTAS')) {
              //await this.routeService.processFileWMS(results, fileName); 
            //}

            resolve();
          } catch (err) {
            this.logger.logError(`Error al procesar el archivo: ${err.message}`, err.stack);
            resolve();
          }
        })
        .on('error', (err) => {
          this.logger.logError(`Error al procesar el archivo: ${err.message}`, err.stack);
          reject(err);
        });
    });
  }

  private async copyFileToAnotherDirectory(filePath: string, fileName: string) {
    console.log(`MOVER ARCHIVO ${fileName}`);
    try {
      // Verifica si la carpeta de salida existe, si no, la crea
      console.log("this.processedFilePath", this.processedFilePath);
      await fsExtra.ensureDir(path.dirname(this.processedFilePath));
      
      // Mueve el archivo CSV a otro directorio
      console.log("filePath", filePath);
      console.log("fileName", fileName);
      await fsExtra.move(filePath, path.join(this.processedFilePath, fileName), { overwrite: true });
      console.log(`Archivo movido a: ${this.processedFilePath}`);
    } catch (err) {
      console.error('Error al mover el archivo:', err);
    }
  }

  private async cleanCsvFile(originalPath: string, cleanedPath: string): Promise<void> {
    const inputStream = fs.createReadStream(originalPath, { encoding: 'utf8' });
    const outputStream = fs.createWriteStream(cleanedPath, { encoding: 'utf8' });

    const rl = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity,
    });

    const invalidCharsRegex = /[^\x20-\x7E]/g; // Regex para detectar caracteres no imprimibles ASCII

    for await (const line of rl) {
      const cleanedLine = line
        .replace(invalidCharsRegex, '') // Eliminar caracteres no imprimibles
        .replace(/\\n/g, ' ') // Reemplazar saltos de línea escapados por espacios
        .replace(/\\"/g, '"') // Reemplazar comillas escapadas
        .replace(/\r/g, ''); // Eliminar retornos de carro (\r)

      outputStream.write(cleanedLine + '\n');
    }

    outputStream.end();
  }
}