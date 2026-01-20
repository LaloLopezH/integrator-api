import { Injectable } from '@nestjs/common';
import { TcpService } from 'src/shared/service/tcp-service';
import { XmlService } from 'src/shared/service/xml.service';
import { RouteInstructionDto } from './dto/route-instruction.dto';
import { RouteInstructionsKisoftConfig } from './mapping/route-instruction-kisoft.config';
import { TextService } from 'src/shared/service/text.service';
import { InductionService } from './tinduction.service';
import { SequenceDetailService } from 'src/woa/secuence-detail.service';
import { LoggerService } from 'src/shared/logger/logger.service';
import { ApiService } from 'src/shared/service/api.service';
import { ResponseDataAllocationDto } from './dto/response-data-allocation.dto';
import { CreateTInductionDto } from './dto/create-tinduction.dto';
import { RouteService } from 'src/route/route.service';
import { TraceService } from 'src/trace/trace.service';

@Injectable()
export class RouteInstructionService {
  private readonly delayMs = 2000;

  constructor(
      private readonly tcpService: TcpService,
      private readonly xmlService: XmlService,
      private readonly routeService: RouteService,
      private readonly textService: TextService,
      private readonly sequenceDetailService: SequenceDetailService,
      private readonly inductionService: InductionService,
      private readonly apiService: ApiService,
      private readonly traceService: TraceService,
      private readonly logger: LoggerService
    ){}

  async iniciarProceso(xml: string) {
    setImmediate(async () => {
      await this.processRouteInstruction(xml);
    });
  }

  async processRouteInstruction(xml: string) {

    try
    {
      this.logger.logError(`Xml recibido = ${xml}`);

      var routeInstructionDtoList = await this.mapData(xml);

      this.logger.logError("processRouteInstruction - routeInstructionDtoList", JSON.stringify(routeInstructionDtoList, null, 2));

      await this.sendToKisoft(routeInstructionDtoList);
    }
    catch(error) {
      this.logger.logError(`Ocurrió un error al procesar Route Instruction, error: ${error.message}`, error.stack);
    }  
  }

  private async mapData(xml: string): Promise<RouteInstructionDto[]> {
    try
    {
      const parsedData = await this.xmlService.processXml(xml);

      const items = Array.isArray(parsedData.data.LgfData.ListOfRouteInstructions.route_instruction)
        ? parsedData.data.LgfData.ListOfRouteInstructions.route_instruction
        : [parsedData.data.LgfData.ListOfRouteInstructions.route_instruction];

      const dtos: RouteInstructionDto[] = items.map(
        (load: any) => ({
          mhe_system_code: load.mhe_system_code,
          facility_code: load.facility_code,
          company_code: load.company_code,
          lpn_nbr: load.lpn_nbr,
          divert_lane: load.divert_lane,
          dest_locn_str: load.dest_locn_str,
          dest_locn_brcd: load.dest_locn_brcd
        } as RouteInstructionDto),
      );

      return dtos;
    }
    catch(error) {
      this.logger.logError(`Error al obtener datos de trama, error: ${error.message}`, error.stack);
    }    
  }
  
  private async sendToKisoft(data: RouteInstructionDto[]) {
    if(data) {
      try {
        for(const dto of data) {
          try {
            const tramaKisoft = await this.buildTramaKisoft(dto);
  
            if(tramaKisoft.length > 0) {
              const tramaLentgh = tramaKisoft.length + 5;
              const formatKisoft = `${this.textService.padText(tramaLentgh.toString(), 5, '0')}${tramaKisoft}`;    
              const traceId = await this.traceService.create("ROUTE_INSTRUCTION", formatKisoft, JSON.stringify(dto, null, 2));
    
              await new Promise((resolve) => setTimeout(resolve, this.delayMs));
              await this.tcpService.sendMessage(traceId, formatKisoft, 'ROUTE_INSTRUCTION');            
            }
          }
          catch(error) {
            this.logger.logError(`Ocurrió un el método sendToKisoft, error: ${error.message}`, error.stack);
          }
        }
      }
      catch(error) {
        this.logger.logError(`Ocurrió un el método sendToKisoft, error: ${error.message}`, error.stack);
      }
    }    
  }

   private async buildTramaKisoft(routeInstructionDto: RouteInstructionDto): Promise<string> {
    try 
    {
      const riConfig = RouteInstructionsKisoftConfig;

      let ob_lpn_type_kisoft = ''
      let olpn_nbr_F29_value = '';
      let partsTrama: string[] = [];

      for (const config of riConfig) {
        if(config.field != undefined) {

          switch (config.field) {
            case 'lpn_nbr': {
              partsTrama.push(this.textService.padText(routeInstructionDto.lpn_nbr, config.longitud));
              break;
            }
            case 'oblpn_type_wms': {
              await new Promise((resolve) => setTimeout(resolve, this.delayMs));
              const allocation = await this.getOblpnTypeKisoft(routeInstructionDto.lpn_nbr);
              const secuenceDetail = await this.sequenceDetailService.findByObLpnType(allocation.oblpn_type_wms);
              ob_lpn_type_kisoft = secuenceDetail.ob_lpn_type_kisoft;
              
              const newInduction: CreateTInductionDto = {
                oblpn_nbr: ob_lpn_type_kisoft,
                oblpn_type_wms: routeInstructionDto.lpn_nbr,
                route_nbr: allocation.route_nbr,
                consolidation: allocation.consolidation,
                asset: allocation.asset_nbr
              }

              await this.saveInduction(newInduction);

              partsTrama.push(this.textService.padText(ob_lpn_type_kisoft, config.longitud));
              
              break;
            }
            case 'oblpn_type_kisoft': {
              const trama = ob_lpn_type_kisoft == '31' ? 'FULL' : 'LARGE';
              partsTrama.push(this.textService.padText(trama, config.longitud, ' '));
              break;
            }
            case 'olpn_nbr_F29': {
              const induction = await this.inductionService.findByObLpnType(routeInstructionDto.lpn_nbr);

              if(induction != null && !this.validateNullString(induction.asset)) {
                partsTrama.push(this.textService.padText('06', 2));
                olpn_nbr_F29_value = '06';
              }
              else {
                if(routeInstructionDto.lpn_nbr.replace(/^\s+/, '').length > 6){
                  partsTrama.push(this.textService.padText('10', 2));
                  olpn_nbr_F29_value = '10';
                }
                else {
                  partsTrama.push(this.textService.padText('06', 2));
                  olpn_nbr_F29_value = '06';
                }
              }
              break;
            }
            case 'olpn_nbr_F30': {
              const induction = await this.inductionService.findByObLpnType(routeInstructionDto.lpn_nbr);

              if(induction != null && !this.validateNullString(induction.asset)) {
                partsTrama.push(this.textService.padText(induction.asset.replace(/^\s+/, ''), Number(olpn_nbr_F29_value)));
              }
              else {
                partsTrama.push(this.textService.padText(routeInstructionDto.lpn_nbr, Number(olpn_nbr_F29_value)));
              }
              break;
            }
            case 'route_nbr': {
              const induction = await this.inductionService.findByObLpnType(routeInstructionDto.lpn_nbr);

              if(induction != null) {
                if(induction.route_nbr != undefined && induction.route_nbr.length > 0) {
                  partsTrama.push(this.textService.padText(induction.route_nbr.trimStart().substring(0, 3), config.longitud));
                }
                else {
                  if(induction.consolidation != undefined && induction.consolidation.length > 0) {
                    partsTrama.push(this.textService.padText(induction.consolidation.trimStart().substring(0, 3), config.longitud));
                  }
                  else {
                    partsTrama.push(this.textService.padText('339', config.longitud));
                  }
                }
              }
              else {
                partsTrama.push(this.textService.padText('0', config.longitud));
              }
              break;
            }
            case 'driver_lane': {
              partsTrama.push(this.textService.padText(routeInstructionDto.divert_lane, config.longitud, '0'));
              break;
            }
            case 'oblpn_type_kisoft_31_32': {
              if(ob_lpn_type_kisoft && ob_lpn_type_kisoft == '32') {
                const induction = await this.inductionService.findByObLpnType(routeInstructionDto.lpn_nbr);
                partsTrama.push('K0103');
                
                if(induction != null) {
                    const keySearch = induction.route_nbr != undefined  ? induction.route_nbr : induction.consolidation;
                    const route = await this.routeService.findByRuta(keySearch.trimStart().substring(0, 3));

                    if(route) {
                      partsTrama.push(this.textService.padText(route.HDR_CUST4, config.longitud, '0'));
                    }
                    else {
                      partsTrama.push(this.textService.padText('0', config.longitud, '0'));
                    }
                  }
                  else {
                    partsTrama.push(this.textService.padText('0', 5, '0'));
                  }
              }
              
              break;
            }
          }
        }
        else {
          partsTrama.push(config.value);
        }
      }

      return partsTrama.join('');
    }
    catch(error) {
      this.logger.logError(`Error al construir trama kisoft, error: ${error.message}`, error.stack);
    }
   }
   
  async getOblpnTypeKisoft(lpn_nbr: string) {
    const data = await this.getAllotation(lpn_nbr);
    const allocation = data.results[0];
    return allocation;
  }

  async getAllotation(lpn_nbr: string) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${process.env.API_WMS_USER}:${process.env.API_WMS_PASSWORD}`).toString('base64')}`
      };
  
      const url = `${process.env.ALLOCATION_URL}?to_inventory_id__container_id__container_nbr=${lpn_nbr}&values_list=${process.env.ALLOCATION_PARAM_VALUES}&distinct=1`;
      
      this.logger.logError(`mapResponse - url = ${url}`);      
      const resp = await this.apiService.requestWithRetries('GET', url, { headers: headers });
      this.logger.logError("getAllotation - response", JSON.stringify(resp, null, 2));

      if(resp) {
        return this.mapResponse(resp);
      }
  
      return null;
    }
    catch(error) {
      this.logger.logError(`Error al obtener datos de wms del api ${process.env.ALLOCATION_URL} , error: ${error.message}`, error.stack);
    }
    
  }

  mapResponse(response: any): ResponseDataAllocationDto {

    this.logger.logError(`mapResponse - response = `, JSON.stringify(response, null, 2));

    const mappedResponse: ResponseDataAllocationDto = {
      result_count: response.result_count,
      page_count: response.page_count,
      page_nbr: response.page_nbr,
      next_page: response.next_page,
      previous_page: response.previous_page,
      results: response.results.map((item) => ({
        oblpn_nbr: item.oblpn_nbr,
        oblpn_type_wms: item.oblpn_type_wms,
        route_nbr: item.route_nbr,
        consolidation: item.consolidation,
        asset_nbr: item.asset_nbr,
      })),
    };
    
    return mappedResponse;
  }

  async saveInduction(dto: CreateTInductionDto){
    await this.inductionService.saveInduction(dto);
  }

  validateNullString(text: string | undefined) {
    return text === undefined || (typeof text === 'string' && text.replace(/^\s+/, '').length == 0);
  }
}
