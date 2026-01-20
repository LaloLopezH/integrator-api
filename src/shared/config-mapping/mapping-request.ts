export class MappingConfigDTO {
    field?: string;
    value?: string;
    longitud: number;
    type?: string;
    maxLength?: number;
    index?:number;
}

export class WMSConfigDTO {
    field: string;
    type: string;
}

export class ResultadoDTO {
    [key: string]: string;
}