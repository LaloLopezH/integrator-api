export class ReturnDto {
    facility_id__code: string;
    company_id__code: string;
    wave_nbr: string;
    order_nbr: string;
    item_alternate_code: string;
    load_unit_code:string;
    batch_nbr: string;
    qty: string;
    orig_invn_attr_a: string;
    invn_attr_a: string;
    from_container_nbr: string;
    to_container_nbr: string;
    mhe_system_code: string;
    pick_location: string;
    short_flg: string;
    orig_iblpn_nbr: string;
    orig_batch_nbr: string;
    send_driver: boolean;
    qty_dif: boolean;
    lot_exists?: boolean;
}