import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Trace {
    @PrimaryGeneratedColumn('increment')
    Id: number;
        
    @Column('text', { 
        nullable: true,
    })
    Interface: string;

    @Column('text', { 
        nullable: true,
    })
    TramaSent: string;

    @Column('text', { 
        nullable: true,
    })
    TramaReceived: string;

    @Column('text', { 
        nullable: true,
    })
    Detail: string;

    @Column({
        type: 'timestamp', 
        nullable: true,
    })
    CreatedDate: Date;

    @Column('numeric', { 
        nullable: true,
    })
    CreatedUser: number;
}
