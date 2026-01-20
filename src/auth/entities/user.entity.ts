import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class User {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text', { 
        nullable: true,
        unique: true
    })
    email: string;

    @Column('text', { 
        nullable: false,
        select: false
    })
    password: string;

    @Column('text', { 
        nullable: true,
    })
    fullName: string;

    @Column('bool', { 
        default: true,
    })
    isActive: boolean;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }
}
