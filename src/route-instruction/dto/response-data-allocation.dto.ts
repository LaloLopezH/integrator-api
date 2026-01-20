export class ResponseDataAllocationDto {
    result_count?: number;
    page_count?: number;
    page_nbr?: number;
    next_page?: null;
    previous_page?: null;
    results?: ResultAllocationDto[]
}

export class ResultAllocationDto {
    oblpn_nbr?: string;
    oblpn_type_wms?: string;
    route_nbr?: string;
    consolidation?: string;
    asset_nbr?: string;
}