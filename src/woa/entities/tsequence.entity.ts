import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TSequence {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text', { 
        nullable: true,
    })
    ob_lpn_type_kisoft: string;

    @Column('text', { 
        nullable: true,
    })
    description: string;

    @Column('text', { 
        nullable: true,
    })
    SEC0: string;

    @Column('text', { 
        nullable: true,
    })
    SEC1: string;

    @Column('text', { 
        nullable: true,
    })
    SEC2: string;

    @Column('text', { 
        nullable: true,
    })
    SEC3: string;

    @Column('text', { 
        nullable: true,
    })
    SEC4: string;

    @Column('text', { 
        nullable: true,
    })
    SEC5: string;

    @Column('numeric', { 
        nullable: true,
    })
    percentage: number;
}