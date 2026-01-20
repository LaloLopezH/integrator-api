import { Injectable } from '@nestjs/common';
import { TcpService } from 'src/shared/service/tcp-service';
import { LoggerService } from 'src/shared/logger/logger.service';
import { TraceService } from 'src/trace/trace.service';

@Injectable()
export class PartnerService {

  constructor(
    private readonly tcpService: TcpService,
    private readonly traceService: TraceService,
    private readonly logger: LoggerService
  ){}

  async iniciarProceso(tramas: string[]) {
    setImmediate(async () => {
      await this.procesaTramas(tramas);
    });
  }

  async procesaTramas(tramas: string[]) {   
    if(tramas) {
       this.logger.logError("tramas", JSON.stringify(tramas, null, 2));
      try {
        await this.tcpService.sendMessage(0, '00008151', 'PARTNER');
        await this.traceService.create("PARTNER", '00008151', null);
  
        for(const trama of tramas) {
          try
          {
            this.logger.logError(`tramaKisoft enviada = ${trama}`);
  
            const traceId = await this.traceService.create("PARTNER", trama, '');
            this.logger.logError(`traceId = ${traceId}`);
            
            await this.tcpService.sendMessage(traceId, trama, 'PARTNER');
          }
          catch(error) {
            this.logger.logError(`Error al procesar trama para enviar a kisoft, error: ${error.message}`, error.stack);
          } 
        }
  
        await this.tcpService.sendMessage(0, '00008159', 'PARTNER');
        await this.traceService.create("PARTNER", '00008159', null);
      }
      catch(error) {
        this.logger.logError(`Error al procesar trama para enviar a kisoft, error: ${error.message}`, error.stack);
      }
    }
  }
}