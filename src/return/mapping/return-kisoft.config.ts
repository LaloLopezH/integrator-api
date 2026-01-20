import { MappingConfigDTO } from "src/shared/config-mapping/mapping-request";

export const ReturnKisoftConfig: MappingConfigDTO[] = [
    {
        field: 'to_container_nbr',
        index: 10,
        longitud: 14
    },
    {
        field: 'item_alternate_code',
        index: 176,
        longitud: 10
    },
]

export const ReturnKisoftArticlesConfig: MappingConfigDTO[] = [
    {
        field: 'item_alternate_code',
        longitud: 10
    },
    {
        value: '0001',
        longitud: 4
    },
    {
        field: 'batch_nbr',
        longitud: 30
    },
    {
        field: 'qty',
        longitud: 4
    },
    {
        longitud: 2
    },
    {
        longitud: 4
    },
    {
        field: 'pick_location',
        longitud: 4
    },
]