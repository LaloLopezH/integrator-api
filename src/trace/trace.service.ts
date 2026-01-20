import { Injectable } from '@nestjs/common';
import { CreateTraceDto } from './dto/create-trace.dto';
import { UpdateTraceDto } from './dto/update-trace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Trace } from './entities/trace.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TraceService {
  constructor(
      @InjectRepository(Trace)
      private readonly traceRepository:  Repository<Trace>)
  {}

  async create(interfaceIntegrator: string, tramaSent: string, detail) 
  {
    const dto: CreateTraceDto = {
      Interface: interfaceIntegrator,
      TramaSent: tramaSent,
      Detail: detail,
      CreatedDate: new Date(),
      CreatedUser: 3
    };

    const articleEntity = this.traceRepository.create(dto);
    await this.traceRepository.save(articleEntity);
    return articleEntity.Id;
  }

  async update(id:number, trama: string) {
    const trace = await this.traceRepository.findOne({ 
      where: { 
        Id: id
      } 
    });

    if(trace != undefined) {
      trace.TramaReceived = trama;
      await this.traceRepository.save(trace);
    }    
  }

  async updateDetail(id:number, detail: string) {
    const trace = await this.traceRepository.findOne({ 
      where: { 
        Id: id
      } 
    });

    if(trace != undefined) {
      trace.Detail = detail;
      await this.traceRepository.save(trace);
    }    
  }
}
