import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Route {
    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text', { 
        nullable: true,
    })
    RUTA: string;

    @Column('text', { 
        nullable: true,
    })
    Activo: string;

    @Column('text', { 
        nullable: true,
    })
    HDR_CUST1: string;

    @Column('text', { 
        nullable: true,
    })
    HDR_CUST2: string;

    @Column('text', { 
        nullable: true,
    })
    HDR_CUST3: string;

    @Column('text', { 
        nullable: true,
    })
    HDR_CUST4: string;

    @Column('text', { 
        nullable: true,
    })
    Mod: string;

    @Column('text', { 
        nullable: true,
    })
    Parada: string;

    @Column('text', { 
        nullable: true,
    })
    DTL_CUST_1: string;

    @Column('text', { 
        nullable: true,
    })
    DTL_CUST_2: string;

    @Column({ 
        type: 'timestamp',
        nullable: true,
    })
    CreatedDate: Date;

    @Column('numeric', { 
        nullable: true,
    })
    CreatedUser: number;

    @Column({
        type: 'timestamp', 
        nullable: true,
    })
    ModifiedDate: Date;

    @Column('numeric', { 
        nullable: true,
    })
    ModifiedUser: number;
}
