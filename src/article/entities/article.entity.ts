import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Article {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text', { 
        nullable: true,
    })
    Area: string;

    @Column('text', { 
        nullable: true,
    })
    Pasillo: string;

    @Column('text', { 
        nullable: true,
    })
    Bahia: string;

    @Column('text', { 
        nullable: true,
    })
    Posicion: string;

    @Column('text', { 
        nullable: true,
    })
    Nivel: string;

    @Column('text', { 
        nullable: true,
    })
    Zona_Asig: string;

    @Column('text', { 
        nullable: true,
    })
    Cod_Barra_Ubicacion: string;

    @Column('text', { 
        nullable: true,
    })
    Cod_Alt_Producto: string;

    @Column('numeric', { 
        nullable: true,
        default: 0
    })
    Cod_Eyeccion: number;

    @Column('numeric', { 
        nullable: true,
        default: 0
    })
    Cantidad_Max: number;

    @Column('text', { 
        nullable: true,
    })
    Cod_Barra_Producto: string;

    @Column('numeric', { 
        nullable: true,
    })
    Longitud: number;

    @Column('numeric', { 
        nullable: true,
    })
    Ancho: number;

    @Column('numeric', { 
        nullable: true,
    })
    Altura: number;

    @Column('text', { 
        nullable: true,
    })
    Descripcion: string;

    @Column('numeric', { 
        nullable: true,
    })
    Unds_Min: number;

    @Column('numeric', { 
        nullable: true,
    })
    Unds_Max: number;

    @Column('text', { 
        nullable: true,
    })
    Texto_Corto: string;

    @Column('numeric', { 
        nullable: true,
    })
    Pick_Sequence: number;

    @Column('text', { 
        nullable: true,
    })
    Mascara: string;

    @Column('text', { 
        nullable: true,
    })
    Cod_Barra_2: string;

    @Column('numeric', { 
        nullable: true,
    })
    Volumen_Unidad: number;

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
