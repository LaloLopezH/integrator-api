import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { LoggerService } from 'src/shared/logger/logger.service';
import { TraceService } from 'src/trace/trace.service';
import { TcpService } from 'src/shared/service/tcp-service';
import { ReturnService } from 'src/return/return.service';

@Injectable()
export class TestService {
  
  constructor(private readonly logger: LoggerService,
              private readonly traceService: TraceService,
              private readonly tcpService: TcpService,
              private readonly returnService: ReturnService
  ) {}

  async iniciarProceso(trama: string) {
    setImmediate(async () => {
      await this.create(trama);
    });
  }
  
  async create(trama: string) {
    try {
      const traceId = await this.traceService.create("TEST", trama, '');
  
      await this.tcpService.sendMessage(traceId, trama, 'TEST');
    }
    catch(error) {
      this.logger.logError(`Ocurrió un error en create, error: ${error.message}`, error.stack);
    }
  }

  async sendReturn(trama: string) {
    try {
      const traceId = await this.traceService.create("TEST", trama, '');
  
      await this.tcpService.sendMessage(traceId, trama, 'TEST');

      await this.returnService.procesaTrama(trama);
    }
    catch(error) {
      this.logger.logError(`Ocurrió un error en create, error: ${error.message}`, error.stack);
    }
  }

  async createSeparator(trama: string) {
    try {
      const traceId = await this.traceService.create("TEST", trama, '');
      this.logger.logError(`Registro de trama test, trace id: ${traceId}`);
    }
    catch(error) {
      this.logger.logError(`Ocurrió un error en create, error: ${error.message}`, error.stack);
    }
  }
}
