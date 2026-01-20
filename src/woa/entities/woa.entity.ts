import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Woa {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text', { 
        nullable: true,
    })
    facility_code: string;

    @Column('text', { 
        nullable: true,
    })
    wave_number: string;
    
    @Column('text', { 
        nullable: true,
    })
    action_code: string;

    @Column('text', { 
        nullable: true,
    })
    order_number: string;

    @Column('text', { 
        nullable: true,
    })
    oblpn: string;

    @Column('numeric', { 
        nullable: true,
    })
    carton_weight: number;

    @Column('numeric', { 
        nullable: true,
    })
    carton_length: number;

    @Column('numeric', { 
        nullable: true,
    })
    carton_width: number;

    @Column('numeric', { 
        nullable: true,
    })
    carton_height: number;

    @Column('text', { 
        nullable: true,
    })
    tracking_number: string;

    @Column('text', { 
        nullable: true,
    })
    ship_via: string;

    @Column('text', { 
        nullable: true,
    })
    route_nbr: string;

    @Column('numeric', { 
        nullable: true,
    })
    order_seq_nbr1: number;

    @Column('text', { 
        nullable: true,
    })
    part_a: string;

    @Column('text', { 
        nullable: true,
    })
    part_b: string;

    @Column('text', { 
        nullable: true,
    })
    part_c: string;

    @Column('text', { 
        nullable: true,
    })
    part_d: string;
    
    @Column('text', { 
        nullable: true,
    })
    part_e: string;

    @Column('text', { 
        nullable: true,
    })
    part_f: string;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_qty: number;

    @Column('numeric', {
        nullable: true
    })
    allocated_qty: number;

    @Column('text', { 
        nullable: true,
    })
    allocated_location: string;

    @Column('text', { 
        nullable: true,
    })
    allocated_area: string;

    @Column('text', { 
        nullable: true,
    })
    allocated_zone: string;

    @Column('text', {
        nullable: true
    })
    create_ts: string;

    @Column('text', { 
        nullable: true,
    })
    order_status: string;

    @Column('text', { 
        nullable: true,
    })
    item_alternate_code: string;

    @Column('text', { 
        nullable: true,
    })
    iblpn: string;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_priority: number;

    @Column('text', { 
        nullable: true,
    })
    item_barcode: string;

    @Column('text', { 
        nullable: true,
    })
    dest_facility_code: string;

    @Column('text', { 
        nullable: true,
    })
    item_short_descr: string;

    @Column('text', { 
        nullable: true,
    })
    ob_lpn_type: string;

    @Column('text', { 
        nullable: true,
    })
    mhe_system_code: string;

    @Column('boolean', {
        nullable: true,
        default: false
    })
    dummy_sku_flg: boolean;

    @Column('boolean', { 
        nullable: true,
    })
    hazmat: boolean;

    @Column('text', { 
        nullable: true,
    })
    external_style: string;

    @Column('text', { 
        nullable: true,
    })
    un_class: string;

    @Column('text', { 
        nullable: true,
    })
    un_number: string;

    @Column('boolean', {
        nullable: true,
        default: false
    })
    conveyable: boolean;

    @Column('boolean', {
        nullable: true,
        default: false
    })
    sortable: boolean;

    @Column('text', { 
        nullable: true,
    })
    group_code: string;

    @Column('text', { 
        nullable: true,
    })
    hierarchy_code_1: string;

    @Column('text', { 
        nullable: true,
    })
    hierarchy_code_2: string;

    @Column('text', { 
        nullable: true,
    })
    hierarchy_code_3: string;

    @Column('text', { 
        nullable: true,
    })
    hierarchy_code_4: string;

    @Column('text', { 
        nullable: true,
    })
    hierarchy_code_5: string;

    @Column('text', { 
        nullable: true,
    })
    vas_activity_code: string;

    @Column('text', { 
        nullable: true,
    })
    order_hdr_cust_field_1: string;

    @Column('text', { 
        nullable: true,
    })
    order_hdr_cust_field_2: string;

    @Column('text', { 
        nullable: true,
    })
    order_hdr_cust_field_3: string;

    @Column('text', { 
        nullable: true,
    })
    order_hdr_cust_field_4: string;

    @Column('text', { 
        nullable: true,
    })
    order_hdr_cust_field_5: string;

    @Column('timestamp', {
        nullable: true
    })
    order_hdr_cust_date_1: Date;

    @Column('timestamp', {
        nullable: true
    })
    order_hdr_cust_date_2: Date;

    @Column('timestamp', {
        nullable: true
    })
    order_hdr_cust_date_3: Date;

    @Column('timestamp', {
        nullable: true
    })
    order_hdr_cust_date_4: Date;

    @Column('timestamp', {
        nullable: true
    })
    order_hdr_cust_date_5: Date;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_number_1: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_number_2: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_number_3: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_number_4: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_number_5: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_decimal_1: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_decimal_2: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_decimal_3: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_decimal_4: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
    order_hdr_cust_decimal_5: number;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_1: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_2: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_3: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_4: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_5: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_6: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_7: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_8: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_9: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_10: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_11: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_short_text_12: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_long_text_1: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_long_text_2: string;

    @Column('text', { 
        nullable: true,
    })
	order_hdr_cust_long_text_3: string;

    @Column('text', { 
        nullable: true,
    })
	order_dtl_cust_field_1: string;

    @Column('text', { 
        nullable: true,
    })
	order_dtl_cust_field_2: string;

    @Column('text', { 
        nullable: true,
    })
	order_dtl_cust_field_3: string;

    @Column('text', { 
        nullable: true,
    })
	order_dtl_cust_field_4: string;

    @Column('text', { 
        nullable: true,
    })
	order_dtl_cust_field_5: string;

    @Column('timestamp', {
        nullable: true
    })
	order_dtl_cust_date_1: Date;

    @Column('timestamp', {
        nullable: true
    })
	order_dtl_cust_date_2: Date;

    @Column('timestamp', {
        nullable: true
    })
	order_dtl_cust_date_3: Date;

    @Column('timestamp', {
        nullable: true
    })
	order_dtl_cust_date_4: Date;

    @Column('timestamp', {
        nullable: true
    })
	order_dtl_cust_date_5: Date;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_number_1: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_number_2: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_number_3: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_number_4: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_number_5: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_decimal_1: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_decimal_2: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_decimal_3: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_decimal_4: number;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	order_dtl_cust_decimal_5: number;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_1: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_2: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_3: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_4: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_5: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_6: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_7: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_8: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_9: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_10: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_11: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_short_text_12: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_long_text_1: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_long_text_2: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_cust_long_text_3: string;

    @Column('text', {
        nullable: true
    })
	batch_nbr: string;

    @Column('text', {
        nullable: true
    })
	allocation_uom: string;

    @Column('numeric', {
        nullable: true,
        default: 0
    })
	uom_qty: number;

    @Column('text', {
        nullable: true
    })
	shipto_facility_code: string;

    @Column('text', {
        nullable: true
    })
	shipto_name: string;

    @Column('text', {
        nullable: true
    })
	shipto_addr: string;

    @Column('text', {
        nullable: true
    })
	shipto_addr2: string;

    @Column('text', {
        nullable: true
    })
	shipto_addr3: string;

    @Column('text', {
        nullable: true
    })
	shipto_city: string;

    @Column('text', {
        nullable: true
    })
	shipto_state: string;

    @Column('text', {
        nullable: true
    })
	shipto_zip: string;

    @Column('text', {
        nullable: true
    })
	shipto_country: string;

    @Column('text', {
        nullable: true
    })
	shipto_phone_nbr: string;

    @Column('text', {
        nullable: true
    })
	shipto_email: string;

    @Column('text', {
        nullable: true
    })
	shipto_contact: string;

    @Column('text', {
        nullable: true
    })
	dest_company_code: string;

    @Column('text', {
        nullable: true
    })
	cust_name: string;

    @Column('text', {
        nullable: true
    })
	cust_addr: string;

    @Column('text', {
        nullable: true
    })
	cust_addr2: string;

    @Column('text', {
        nullable: true
    })
	cust_addr3: string;

    @Column('text', {
        nullable: true
    })
	cust_city: string;

    @Column('text', {
        nullable: true
    })
	cust_state: string;

    @Column('text', {
        nullable: true
    })
	cust_zip: string;

    @Column('text', {
        nullable: true
    })
	cust_country: string;

    @Column('text', {
        nullable: true
    })
	cust_phone_nbr: string;

    @Column('text', {
        nullable: true
    })
	cust_email: string;

    @Column('text', {
        nullable: true
    })
	cust_contact: string;

    @Column('text', {
        nullable: true
    })
	cust_nbr: string;

    @Column('text', {
        nullable: true
    })
	task_number: string;

    @Column('text', {
        nullable: true
    })
	wave_group_run_number: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_a: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_b: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_c: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_d: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_e: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_f: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_g: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_h: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_i: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_j: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_k: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_l: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_m: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_n: string;

    @Column('text', {
        nullable: true
    })
	invn_attr_o: string;

    @Column('timestamp', {
        nullable: true
    })
	expiry_date: Date;

    @Column('text', {
        nullable: true
    })
	qty_uom_code: string;

    @Column('text', {
        nullable: true
    })
	weight_uom_code: string;

    @Column('text', {
        nullable: true
    })
	dimension_uom_code: string;

    @Column('text', {
        nullable: true
    })
	order_dtl_original_seq_nbr: string;

    @Column('text', {
        nullable: true
    })
	asset_nbr: string;

    @Column('numeric', {
        nullable: true
    })
	cant_return: number;

    @Column('text', {
        nullable: true
    })
	wworker: string;

    @Column('text', {
        nullable: true
    })
	dispatch_ramp_number: string;

    @Column('boolean', {
        nullable: true,
        default: false
    })
    send_route_instruction: boolean;

    @Column('numeric', {
        nullable: true
    })
    volumen_linea: number;

    @Column('boolean', {
        nullable: true
    })
    qty_dif: boolean;

    @Column('numeric', {
        nullable: true
    })
	qty_surplus: number;

    @Column('numeric', {
        nullable: true
    })
	qty_missing: number;

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
