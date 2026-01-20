import { Injectable } from "@nestjs/common";
import { PrintFileService } from "./printFile.service";
import { LoggerService } from "src/shared/logger/logger.service";
import { CreateWoaDto } from "./dto/create-woa.dto";
import { pickOrderConfig } from "./mapping/pickorder-config";
import * as csvParse from 'csv-parse/sync';
import { WoaService } from "./woa.service";

@Injectable()
export class ProcessFilesService {
    
    constructor(private readonly printFileService: PrintFileService,
                private readonly logger: LoggerService,
                private readonly woaService: WoaService) {}

    async iniciarProceso(trama: string) {
        setImmediate(async () => {
        await this.procesarTrama(trama);
        });
    }

    async procesarTrama(trama: string) {
        try
        {
            this.logger.logError("Inicio de reproceso de archivos de impresión de WOA");
            const createWoaList = await this.procesarTramaWAO(trama);

            if(createWoaList && createWoaList.length > 0) {
                const dataSaved = await this.woaService.calculateVolumenLinea(createWoaList);
                
                if(dataSaved && dataSaved.length > 0) {
                    await this.printFileService.generatePrintFile(dataSaved);
                }
            }
        }
        catch(error) {
        this.logger.logError(`ProcessFilesService - Ocurrió un error en procesarTrama, error: ${error.message}`, error.stack);
        }
    }

    private async procesarTramaWAO(trama: string): Promise<CreateWoaDto[]> {
        try {
            const createWoaList: CreateWoaDto[] = [];
            const waoMappingConfig = pickOrderConfig;
        
            const records = csvParse.parse(trama, {
            delimiter: '|',
            quote: '"',
            escape: '"',
            relax_quotes: true,
            relax_column_count: true,
            skip_empty_lines: true,
            });
        
            for (const woaData of records) {
                const createWoaDto = new CreateWoaDto();
            
                for (let index = 0; index < waoMappingConfig.length; index++) {
                    const config = waoMappingConfig[index];
                    if (woaData[index] !== undefined) {
                        if (config.type && (config.type === 'date' || config.type === 'numeric')) {
                            if (woaData[index] !== '') {
                            createWoaDto[config.field] = woaData[index];
                            }
                        } else {
                            createWoaDto[config.field] = woaData[index];
                        }
                    }
                }
            
                createWoaList.push(createWoaDto);
            }
        
            return createWoaList;
        } catch (error) {
            this.logger.logError(`ProcessFilesService - Ocurrió un error en procesarTramaWAO, error: ${error.message}`, error.stack);
            throw error;
        }
    }
}