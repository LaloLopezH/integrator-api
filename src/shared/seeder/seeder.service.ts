import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TSequence } from 'src/woa/entities/tsequence.entity';
import { TSequenceDetail } from 'src/woa/entities/tsequence-detail.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(TSequence) private readonly tsecuenceRepository: Repository<TSequence>,
    @InjectRepository(TSequenceDetail) private readonly tsecuenceDetailsRepository: Repository<TSequenceDetail>,
  ) {}

  async seed(): Promise<void> {
    console.log("CARGANDO SEEDERS");
    //await this.createSequences();
    //await this.createSequenceDetails();
  }

  private async createSequences(): Promise<void> {
    const sequences = [
        { 
            id: 1,
            ob_lpn_type_kisoft: '01', 
            description: 'Excesos Mal Estado',
            SEC1: '125',
            SEC5: 'R1',
            percentage: 100
        },
        { 
            id: 2,
            ob_lpn_type_kisoft: '31', 
            description: 'Excesos Mal Estado',
            SEC5: 'R2',
            percentage: 100
        },
        { 
            id: 3,
            ob_lpn_type_kisoft: '32', 
            description: 'P04-Split (Int_Tox_Hosp)',
            SEC5: 'R1',
            percentage: 100
        },
        { 
            id: 4,
            ob_lpn_type_kisoft: '01', 
            description: '06-PK Cadena No bono',
            SEC1: '125',
            SEC2: '121',
            SEC3: '152',
            SEC4: '181',
            SEC5: 'R1',
            percentage: 50
        },
        { 
            id: 5,
            ob_lpn_type_kisoft: '01', 
            description: '07-PK Excesos',
            SEC0: '040',
            SEC1: '125',
            SEC5: 'R1',
            percentage: 100
        },
        { 
          id: 6,
          ob_lpn_type_kisoft: '01', 
          description: '11-PK Excesos ME',
          SEC0: '041',
          SEC1: '125',
          SEC5: 'R1',
          percentage: 100
        },
        { 
          id: 7,
          ob_lpn_type_kisoft: '01', 
          description: '08-PK Ruteo',
          SEC1: '125',
          SEC2: '121',
          SEC3: '152',
          SEC4: '181',
          SEC5: 'R1',
          percentage: 100
        }
    ];

    for (const sequence of sequences) {
      const existingSecuence = await this.tsecuenceRepository.findOneBy({ id: sequence.id,  ob_lpn_type_kisoft: sequence.ob_lpn_type_kisoft });
      if (!existingSecuence) {
        const newSequence = this.tsecuenceRepository.create(sequence);
        await this.tsecuenceRepository.save(newSequence);
      }
    }    
  }

  private async createSequenceDetails(): Promise<void> {
    const sequenceDetails = [
        { 
            ob_lpn_type_wms: '02',
            ob_lpn_type_kisoft: '01', 
            description: 'Droguería',
            sequenceId: 1
        },
        { 
            ob_lpn_type_wms: '03',
            ob_lpn_type_kisoft: '31', 
            description: 'Droguería/Cadena',
            sequenceId: 2
        },
        { 
            ob_lpn_type_wms: '04',
            ob_lpn_type_kisoft: '32', 
            description: 'Droguería/Cadena',
            sequenceId: 3
        },
        { 
            ob_lpn_type_wms: '01',
            ob_lpn_type_kisoft: '31', 
            description: 'Full Original',
            sequenceId: 2
        },
        { 
            ob_lpn_type_wms: '05',
            ob_lpn_type_kisoft: '01', 
            description: 'Cadena - Si Bono',
            sequenceId: 1
        },
        { 
            ob_lpn_type_wms: '06',
            ob_lpn_type_kisoft: '01', 
            description: 'Cadena - No Bono (llena)',
            sequenceId: 4
        },
        { 
            ob_lpn_type_wms: '07',
            ob_lpn_type_kisoft: '01', 
            description: 'Excesos',
            sequenceId: 5
        },
        { 
            ob_lpn_type_wms: '08',
            ob_lpn_type_kisoft: '01', 
            description: 'Ruteo',
            sequenceId: 7
        },
        { 
            ob_lpn_type_wms: '09',
            ob_lpn_type_kisoft: '31', 
            description: 'Ruteo',
            sequenceId: 2
        },
        { 
          ob_lpn_type_wms: '11',
          ob_lpn_type_kisoft: '01', 
          description: 'Excesos Mal Estado',
          sequenceId: 6
      },
    ];

    for (const sequenceDetail of sequenceDetails) {
      const existing = await this.tsecuenceDetailsRepository.findOneBy({ ob_lpn_type_wms: sequenceDetail.ob_lpn_type_wms,  ob_lpn_type_kisoft: sequenceDetail.ob_lpn_type_kisoft });
      if (!existing) {
        const newSequenceDetail = this.tsecuenceDetailsRepository.create(sequenceDetail);
        await this.tsecuenceDetailsRepository.save(newSequenceDetail);
      }
    }    
  }
}