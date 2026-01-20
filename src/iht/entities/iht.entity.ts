import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Iht {
    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text', { 
        nullable: true,
    })
    group_nbr: string;

    @Column('numeric', { 
        nullable: true,
    })
    seq_nbr: number;

    @Column('text', { 
        nullable: true,
    })
    lock_code: string;

    @Column('text', { 
        nullable: true,
    })
    activity_code: string;

    @Column('text', { 
        nullable: true,
    })
    lpn_nbr: string;

    @Column('text', { 
        nullable: true,
    })
    location: string;

    @Column('text', { 
        nullable: true,
    })
    item_code: string;

    @Column('numeric', { 
        nullable: true,
    })
    orig_qty: number;

    @Column('numeric', { 
        nullable: true,
    })
    adj_qty: number;

    @Column('text', { 
        nullable: true,
    })
    ref_value_1: string;

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
