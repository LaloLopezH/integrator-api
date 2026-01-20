import { MappingConfigDTO } from "src/shared/config-mapping/mapping-request";

export const pickOrderConfig: MappingConfigDTO[] = [
    {
        field: 'facility_code',
        longitud: 3
    },
    {
        field: 'wave_number',
        longitud: 14
    },
    {
        field: 'action_code',
        longitud: 2
    },
    {
        field: 'order_number',
        longitud: 3
    },
    {
        field: 'oblpn',
        longitud: 10
    },
    {
        field: 'carton_weight',
        longitud: 10,
        type: 'numeric'
    },
    {
        field: 'carton_length',
        longitud: 3,
        type: 'numeric'
    },
    {
        field: 'carton_width',
        longitud: 14,
        type: 'numeric'
    },
    {
        field: 'carton_height',
        longitud: 3,
        type: 'numeric'
    },
    {
        field: 'tracking_number',
        longitud: 7
    },
    {
        field: 'ship_via',
        longitud: 4
    },
    {
        field: 'route_nbr',
        longitud: 4
    },
    {
        field: 'order_seq_nbr1',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'part_a',
        longitud: 4
    },
    {
        field: 'part_b',
        longitud: 4
    },
    {
        field: 'part_c',
        longitud: 4
    },
    {
        field: 'part_d',
        longitud: 4
    },
    {
        field: 'part_e',
        longitud: 4
    },
    {
        field: 'part_f',
        longitud: 4
    },
    {
        field: 'order_qty',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'allocated_qty',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'allocated_location',
        longitud: 4
    },
    {
        field: 'allocated_area',
        longitud: 4
    },
    {
        field: 'allocated_zone',
        longitud: 4
    },
    {
        field: 'create_ts',
        longitud: 4
    },
    {
        field: 'order_status',
        longitud: 4
    },
    {
        field: 'item_alternate_code',
        longitud: 4
    },
    {
        field: 'iblpn',
        longitud: 4
    },
    {
        field: 'order_priority',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'item_barcode',
        longitud: 4
    },
    {
        field: 'dest_facility_code',
        longitud: 4
    },
    {
        field: 'item_short_descr',
        longitud: 4
    },
    {
        field: 'ob_lpn_type',
        longitud: 4
    },
    {
        field: 'mhe_system_code',
        longitud: 4
    },
    {
        field: 'dummy_sku_flg',
        longitud: 4
    },
    {
        field: 'hazmat',
        longitud: 4
    },
    {
        field: 'external_style',
        longitud: 4
    },
    {
        field: 'un_class',
        longitud: 4
    },
    {
        field: 'un_number',
        longitud: 4
    },
    {
        field: 'conveyable',
        longitud: 4
    },
    {
        field: 'sortable',
        longitud: 4
    },
    {
        field: 'group_code',
        longitud: 4
    },
    {
        field: 'hierarchy_code_1',
        longitud: 4
    },
    {
        field: 'hierarchy_code_2',
        longitud: 4
    },
    {
        field: 'hierarchy_code_3',
        longitud: 4
    },
    {
        field: 'hierarchy_code_4',
        longitud: 4
    },
    {
        field: 'hierarchy_code_5',
        longitud: 4
    },
    {
        field: 'vas_activity_code',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_field_1',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_field_2',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_field_3',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_field_4',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_field_5',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_date_1',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_hdr_cust_date_2',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_hdr_cust_date_3',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_hdr_cust_date_4',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_hdr_cust_date_5',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_hdr_cust_number_1',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_number_2',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_number_3',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_number_4',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_number_5',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_decimal_1',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_decimal_2',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_decimal_3',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_decimal_4',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_decimal_5',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_hdr_cust_short_text_1',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_2',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_3',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_4',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_5',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_6',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_7',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_8',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_9',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_10',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_11',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_short_text_12',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_long_text_1',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_long_text_2',
        longitud: 4
    },
    {
        field: 'order_hdr_cust_long_text_3',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_field_1',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_field_2',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_field_3',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_field_4',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_field_5',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_date_1',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_dtl_cust_date_2',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_dtl_cust_date_3',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_dtl_cust_date_4',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_dtl_cust_date_5',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'order_dtl_cust_number_1',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_number_2',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_number_3',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_number_4',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_number_5',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_decimal_1',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_decimal_2',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_decimal_3',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_decimal_4',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_decimal_5',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'order_dtl_cust_short_text_1',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_2',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_3',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_4',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_5',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_6',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_7',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_8',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_9',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_10',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_11',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_short_text_12',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_long_text_1',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_long_text_2',
        longitud: 4
    },
    {
        field: 'order_dtl_cust_long_text_3',
        longitud: 4
    },
    {
        field: 'batch_nbr',
        longitud: 4
    },
    {
        field: 'allocation_uom',
        longitud: 4
    },
    {
        field: 'uom_qty',
        longitud: 4,
        type: 'numeric'
    },
    {
        field: 'shipto_facility_code',
        longitud: 4
    },
    {
        field: 'shipto_name',
        longitud: 4
    },
    {
        field: 'shipto_addr',
        longitud: 4
    },
    {
        field: 'shipto_addr2',
        longitud: 4
    },
    {
        field: 'shipto_addr3',
        longitud: 4
    },
    {
        field: 'shipto_city',
        longitud: 4
    },
    {
        field: 'shipto_state',
        longitud: 4
    },
    {
        field: 'shipto_zip',
        longitud: 4
    },
    {
        field: 'shipto_country',
        longitud: 4
    },
    {
        field: 'shipto_phone_nbr',
        longitud: 4
    },
    {
        field: 'shipto_email',
        longitud: 4
    },
    {
        field: 'shipto_contact',
        longitud: 4
    },
    {
        field: 'dest_company_code',
        longitud: 4
    },
    {
        field: 'cust_name',
        longitud: 4
    },
    {
        field: 'cust_addr',
        longitud: 4
    },
    {
        field: 'cust_addr2',
        longitud: 4
    },
    {
        field: 'cust_addr3',
        longitud: 4
    },
    {
        field: 'cust_city',
        longitud: 4
    },
    {
        field: 'cust_state',
        longitud: 4
    },
    {
        field: 'cust_zip',
        longitud: 4
    },
    {
        field: 'cust_country',
        longitud: 4
    },
    {
        field: 'cust_phone_nbr',
        longitud: 4
    },
    {
        field: 'cust_email',
        longitud: 4
    },
    {
        field: 'cust_contact',
        longitud: 4
    },
    {
        field: 'cust_nbr',
        longitud: 4
    },
    {
        field: 'task_number',
        longitud: 4
    },
    {
        field: 'wave_group_run_number',
        longitud: 4
    },
    {
        field: 'invn_attr_a',
        longitud: 4
    },
    {
        field: 'invn_attr_b',
        longitud: 4
    },
    {
        field: 'invn_attr_c',
        longitud: 4
    },
    {
        field: 'invn_attr_d',
        longitud: 4
    },
    {
        field: 'invn_attr_e',
        longitud: 4
    },
    {
        field: 'invn_attr_f',
        longitud: 4
    },
    {
        field: 'invn_attr_g',
        longitud: 4
    },
    {
        field: 'invn_attr_h',
        longitud: 4
    },
    {
        field: 'invn_attr_i',
        longitud: 4
    },
    {
        field: 'invn_attr_j',
        longitud: 4
    },
    {
        field: 'invn_attr_k',
        longitud: 4
    },
    {
        field: 'invn_attr_l',
        longitud: 4
    },
    {
        field: 'invn_attr_m',
        longitud: 4
    },
    {
        field: 'invn_attr_n',
        longitud: 4
    },
    {
        field: 'invn_attr_o',
        longitud: 4
    },
    {
        field: 'expiry_date',
        longitud: 4,
        type: 'date'
    },
    {
        field: 'qty_uom_code',
        longitud: 4
    },
    {
        field: 'weight_uom_code',
        longitud: 4,
    },
    {
        field: 'dimension_uom_code',
        longitud: 4
    },
    {
        field: 'order_dtl_original_seq_nbr',
        longitud: 4
    }
]