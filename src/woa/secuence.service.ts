import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TSequence } from './entities/tsequence.entity';

@Injectable()
export class SequenceService {
  
  constructor(
    @InjectRepository(TSequence)
    private readonly sequenceRepository:  Repository<TSequence>
  ){}

  async findByObLpnType(obLpnType: string) {
    return await this.sequenceRepository.findOne({ 
        where: { 
            ob_lpn_type_kisoft: obLpnType
        } 
      });
  }

  async findById(id: number) {
    return await this.sequenceRepository.findOne({ 
        where: { 
            id: id
        } 
      });
  }
}
