import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class TWoaResponse {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text', { 
        nullable: true,
    })
    item_alternate_code: string;

    @Column('text', { 
        nullable: true,
    })
    load_unit_code: string;

    @Column('text', { 
        nullable: true,
    })
    batch_nbr: string;

    @Column('text', { 
        nullable: true,
    })
    qty: string;

    @Column('text', { 
        nullable: true,
    })
    to_container_nbr: string;

    @Column('text', { 
        nullable: true,
    })
    pick_location: string;

    @Column('text', { 
        nullable: true,
    })
    wworker: string;

    @Column('text', { 
        nullable: true,
    })
    dispatch_ramp_number: string;

    @Column('text', { 
        nullable: true,
    })
    station_number: string;

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