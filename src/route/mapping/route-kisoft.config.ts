import { MappingConfigDTO } from "src/shared/config-mapping/mapping-request";

export const RouteKisoftConfig: MappingConfigDTO[] = [
    {
        value: '16N',
        longitud: 3
    },
    {
        value: '00',
        longitud: 2
    },
    {
        value: '08',
        longitud: 2
    },
    {
        field: 'RUTA',
        longitud: 8
    },
    {
        value: 'Z',
        longitud: 1
    },
    {
        value: '06',
        longitud: 2
    },
    {
        value: '06',
        longitud: 2
    },
    {
        value: '00',
        longitud: 2
    },
    {
        field: 'Mod',
        longitud: 6
    },
    {
        value: '134000',
        longitud: 6
    },
    {
        value: 'R',
        longitud: 1
    },
    {
        value: '02',
        longitud: 2
    },
    {
        value: '05',
        longitud: 2
    },
    {
        field: 'HDR_CUST1',
        longitud: 5
    },
]