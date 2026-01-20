import { IsOptional } from "class-validator";

export class CreateArticleDto {
    @IsOptional()
    Area?: string;

    @IsOptional()
    Pasillo?: string;

    @IsOptional()
    Bahia?: string;

    @IsOptional()
    Posicion?: string;

    @IsOptional()
    Nivel?: string;

    @IsOptional()
    Zona_Asig?: string;

    @IsOptional()
    Cod_Barra_Ubicacion?: string;

    @IsOptional()
    Cod_Alt_Producto?: string;

    @IsOptional()
    Cod_Eyeccion?: number;

    @IsOptional()
    Cantidad_Max?: number;

    @IsOptional()
    Cod_Barra_Producto?: string;

    @IsOptional()
    Longitud?: number;

    @IsOptional()
    Ancho?: number;

    @IsOptional()
    Altura?: number;

    @IsOptional()
    Descripcion?: string;

    @IsOptional()
    Unds_Min?: number;

    @IsOptional()
    Unds_Max?: number;

    @IsOptional()
    Texto_Corto?: string;

    @IsOptional()
    Pick_Sequence?: number;

    @IsOptional()
    Mascara?: string;

    @IsOptional()
    Cod_Barra_2?: string;

    @IsOptional()
    Volumen_Unidad?: number;

    @IsOptional()
    Cant_Codigos?: number;

    @IsOptional()
    Send14D?: boolean;

    @IsOptional()
    Delete_Cod_Alt_Producto?: string;

    @IsOptional()
    Delete_Zona_Asig?: string;

    @IsOptional()
    CreatedDate: Date;

    @IsOptional()
    CreatedUser: number;

    @IsOptional()
    ModifiedDate?: Date;

    @IsOptional()
    ModifiedUser?: number;
}
