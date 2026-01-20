import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TInduction {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text', { 
        nullable: true,
    })
    oblpn_nbr: string;

    @Column('text', { 
        nullable: true,
    })
    oblpn_type_wms: string;

    @Column('text', { 
        nullable: true,
    })
    route_nbr: string;

    @Column('text', { 
        nullable: true,
    })
    consolidation: string;

    @Column('text', { 
        nullable: true,
    })
    asset: string;
}