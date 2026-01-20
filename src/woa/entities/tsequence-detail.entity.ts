import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TSequenceDetail {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text', { 
        nullable: true,
    })
    ob_lpn_type_wms: string;

    @Column('text', { 
        nullable: true,
    })
    ob_lpn_type_kisoft: string;

    @Column('text', { 
        nullable: true,
    })
    description: string;

    @Column('numeric', { 
        nullable: true,
    })
    sequenceId: number;
}