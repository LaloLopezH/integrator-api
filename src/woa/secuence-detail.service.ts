import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TSequenceDetail } from './entities/tsequence-detail.entity';

@Injectable()
export class SequenceDetailService {
  
  constructor(
    @InjectRepository(TSequenceDetail)
    private readonly sequenceDetailRepository:  Repository<TSequenceDetail>
  ){}

  async findByObLpnType(obLpnTypeWms: string) {
    return await this.sequenceDetailRepository.findOne({ 
        where: { 
            ob_lpn_type_wms: obLpnTypeWms
        } 
      });
  }
}