import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TInduction } from './entities/tinduction.entity';
import { CreateTInductionDto } from './dto/create-tinduction.dto';

@Injectable()
export class InductionService {
  
  constructor(
    @InjectRepository(TInduction)
    private readonly inductionRepository:  Repository<TInduction>
  ){}

  async findByObLpnType(obLpnType: string) {
    return await this.inductionRepository.findOne({ 
        where: { 
          oblpn_type_wms: obLpnType
        } 
      });
  }

  async saveInduction(dto: CreateTInductionDto){
      const inductionEntity = this.inductionRepository.create(dto);
      await this.inductionRepository.save(inductionEntity);   
  }
}
