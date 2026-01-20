import { Injectable } from '@nestjs/common';
import { ReturnDto } from './dto/return.dto';
import { Socket } from 'socket.io';
import { CreateWoaResponseDto } from './dto/create-woa-response.dto';
import { WoaService } from 'src/woa/woa.service';
import { ArticleService } from 'src/article/article.service';
import { XmlService } from 'src/shared/service/xml.service';
import { LoggerService } from 'src/shared/logger/logger.service';
import { ApiService } from 'src/shared/service/api.service';
import { TraceService } from 'src/trace/trace.service';
import { Trama32RTrackerService } from 'src/shared/service/trama32r-tracker.service';
import { Woa } from 'src/woa/entities/woa.entity';
import * as _ from 'lodash';
import { ProcessReturnService } from './process-return.service';

interface ConnectedClientes {
  [id: string]: Socket
}

enum Interface32 {
  Return = 1,
  LinkAsset = 2,
  Divert = 3
}

interface LoteCantidad {
  lote: string,
  qty: number
}

interface WoaResumen {
  woaId: number,
  returnId: number
}

interface WoaActualizado {
  woaId: number,
  qty: number
}

interface OblpnArticle {
  to_container_nbr: string;
  item_alternate_code: string;
  returnId: number
}

@Injectable()
export class ReturnService {
  private colaPorOblpn = new Map<string, Promise<void>>();
  
   constructor(
      private readonly woaService: WoaService,
      private readonly articleService: ArticleService,
      private readonly xmlService: XmlService,
      private readonly apiService: ApiService,
      private readonly logger: LoggerService,
      private readonly traceService: TraceService,
      private readonly trama32RTrackerService: Trama32RTrackerService,
      private readonly processReturnService: ProcessReturnService
    ){}

  private connectedCLientes: ConnectedClientes = {};

  registerClient( client: Socket ) {
    this.connectedCLientes[client.id] = client;
  }

  removeClient( client: Socket ) {
    delete this.connectedCLientes[client.id];
  }

  async iniciarProceso(trama: string) {
    const oblpn = this.extraerOblpn(trama);
    const time = Date.now().toString();
    this.logger.logError(`oblpn recibido = ${oblpn}, hora: ${ time }, trama: ${trama}`);

    const trabajoAnterior = this.colaPorOblpn.get(oblpn) || Promise.resolve();

    const trabajoActual = trabajoAnterior.then(() => {
      return new Promise<void>((resolve) => {
        setImmediate(async () => {
          try {
            await this.procesaTrama(trama);
          } catch (error) {
            console.error(`Error procesando trama para OBLPN ${oblpn}:`, error);
          } finally {
            resolve();
          }
        });
      });
    });

    this.logger.logError(`oblpn procesado = ${oblpn}, hora: ${ time }, trama: ${trama}`);

    this.colaPorOblpn.set(oblpn, trabajoActual);

    trabajoActual.finally(() => {
      if (this.colaPorOblpn.get(oblpn) === trabajoActual) {
        this.colaPorOblpn.delete(oblpn);
      }
    });
  }

  async procesaTrama(trama: string) {
    try{
      this.trama32RTrackerService.removeItem(trama);

      //Se identifica a qué interface debe ir: Return, LinkAsset, Divert
      const interface32R = this.identifyInterface(trama);

      this.logger.logError(`interface32R ${interface32R}`);
      trama = trama.substring(5, trama.length);
      this.logger.logError(`trama ${trama}`);

      if(interface32R == Interface32.Return) {  
        await this.processReturnService.processReturn(trama);
      }

      if(interface32R == Interface32.LinkAsset) {
        const traceId = await this.traceService.create("32R-LINKASSET", trama, '');
        await this.processLinkAsset(trama, traceId);      
      }

      if(interface32R == Interface32.Divert) {
        const traceId = await this.traceService.create("32R-DIVERT", trama, '');
        await this.processDivert(trama, traceId);
      }

    }
    catch(error) {
      this.logger.logError(`Ocurrió un error al procesar procesar la trama 32R, error: ${error.message}`, error.stack);
    }
    //const dispatchRampNumber = trama.substring(73, 78);
    //this.logger.logError(`dispatchRampNumber ${dispatchRampNumber}`);
  }

  extraerOblpn(trama: string){
    trama = trama.substring(5, trama.length);
    return trama.substring(9, 23).replace(/\s+/g, '');
  }



  agruparYLiquidarCantidades(datos: LoteCantidad[]): LoteCantidad[] {
    return datos.reduce((acc, item) => {
      const existente = acc.find((x) => x.lote === item.lote);
      if (existente) {
        existente.qty += item.qty;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as LoteCantidad[]);
  }

  async processLinkAsset(trama: string, id: number) {
    try {
      let index = trama.indexOf('O');
      this.logger.logError(`index ${index}`);
      index = index + 5;
      this.logger.logError(`index + 5 ${index}`);
      const status = trama.substring(index, index + 4);

      this.logger.logError(`status ${status}`);

      if(status == '0001') {
        const toContainerNbr = trama.substring(9, 23).replace(/\s+/g, '');
        this.logger.logError(`toContainerNbr ${toContainerNbr}`);

        const seccionT = trama.substring(23, 24);
        let indexTrama = seccionT == 'T' ? 28 : 23;
        this.logger.logError(`seccionT ${seccionT}`);
        this.logger.logError(`indexTrama ${indexTrama}`);
        const seccionC = trama.substring(indexTrama, indexTrama + 1);
        indexTrama = seccionC == 'C' ? indexTrama + 15 : indexTrama;
        this.logger.logError(`seccionC ${seccionC}`);
        this.logger.logError(`indexTrama ${indexTrama}`);

        const loadUnitCode = trama.substring(indexTrama + 3, indexTrama + 9);
        this.logger.logError(`loadUnitCode ${loadUnitCode}`);

        const jsonLinkAssetObject = this.buildJsonLinkAssetStructure(toContainerNbr, loadUnitCode);

        this.logger.logError(`jsonLinkAssetObject - traceId:${id} -`, JSON.stringify(jsonLinkAssetObject, null, 2));

        this.logger.logError("URL LinkAsset", process.env.LINK_ASSET_URL);

        await this.traceService.update(id, JSON.stringify(jsonLinkAssetObject, null, 2));

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${process.env.API_WMS_USER}:${process.env.API_WMS_PASSWORD}`).toString('base64')}`
        };
        await this.apiService.requestWithRetries('POST', process.env.LINK_ASSET_URL, { data : jsonLinkAssetObject, headers : headers });    
      }
    }
    catch(error) {
      this.logger.logError(`Ocurrió un error al procesar procesar la trama LinkAsset, error: ${error.message}`, error.stack);
    }  
  }

  async processDivert(trama: string, id: number) {
    try {
      const indexG = trama.indexOf('G');
      this.logger.logError(`indexG ${indexG}`);

      if(indexG > -1) {
        const toContainerNbr = trama.substring(9, 23).replace(/\s+/g, '');
        this.logger.logError(`toContainerNbr ${toContainerNbr}`);

        const dispatchRampNumber = trama.substring(indexG + 3, indexG + 8);
        this.logger.logError(`dispatchRampNumber ${dispatchRampNumber}`);

        await this.sendDivert(toContainerNbr, dispatchRampNumber, id);
      }
    }
    catch(error) {
      this.logger.logError(`Ocurrió un error al procesar procesar la trama Divert, error: ${error.message}`, error.stack);
    }    
  }

  identifyInterface(trama: string): Interface32 {
    let indexO = trama.indexOf('O');
    this.logger.logError(`index O ${indexO}`);

    if(indexO > -1) {
      indexO = indexO + 5;
      const status = trama.substring(indexO, indexO + 4);
      this.logger.logError(`status ${status}`);

      if(status == '0001') {
        return 2; //Interface LinkAsset
      }
    }

    if(trama.includes('Z')) {
      const indexZ = trama.indexOf('Z');
      const seccionZ = trama.substring(indexZ, trama.length);

      this.logger.logError(`seccionZ ${seccionZ}`);
      if (seccionZ.length > 35) { //Validar si la sección viene con detalle
        return 1; //Interface Return
      }
    }
    
    if(trama.includes('G')) {
      return 3; //Interface Divert
    }
  }




  async procesaCasosTipo1(woa: Woa, dto: CreateWoaResponseDto, id: number) {
    const list: ReturnDto[] = [];
    let detail = '';

    if(woa != null) {
      this.logger.logError(`procesaCasosTipo1 - item_alternate_code = ${dto.item_alternate_code}`);
      //this.logger.logError(`procesaCasosTipo1 - woa.batch_nbr = ${woa.batch_nbr}`);

      /*let origBatchNbr = dto.batch_nbr.replace(/\s+/g, '');

      if(!this.validateNullString(woa.batch_nbr) && woa.batch_nbr != null) {
        if(woa.batch_nbr.replace(/\s+/g, '') != dto.batch_nbr.replace(/\s+/g, '')) {
          origBatchNbr = woa.batch_nbr;
        }
      }      
      */

      const article = await this.articleService.findByCodBarraUbicacion(woa.allocated_location);


      let dtoReturn: ReturnDto = {
        facility_id__code: woa.facility_code,
        company_id__code: process.env.COMPANY_CODE,
        wave_nbr: woa.wave_number,
        order_nbr: woa.order_number,
        item_alternate_code: dto.item_alternate_code,
        batch_nbr: woa.batch_nbr,
        load_unit_code: dto.load_unit_code,
        qty: dto.qty,
        orig_invn_attr_a: woa.invn_attr_a,
        invn_attr_a: woa.invn_attr_a,
        from_container_nbr: woa.oblpn,
        to_container_nbr: dto.to_container_nbr,
        mhe_system_code: 'KISOFT',//woa.mhe_system_code,
        pick_location: article != undefined ? article.Cod_Barra_2 : ' ',
        short_flg: 'false',
        orig_batch_nbr: '',//origBatchNbr,
        orig_iblpn_nbr: '',
        send_driver: false,
        qty_dif: (woa.allocated_qty != undefined ? woa.allocated_qty : 0) != parseInt(dto.qty),
        lot_exists: true
      };

      list.push(dtoReturn);

      woa.wworker = dto.wworker;
      woa.asset_nbr = dto.load_unit_code;

      if(woa.allocated_qty != undefined) {
        const loteQty = Number(woa.allocated_qty) - Number(woa.cant_return ?? 0);

        if(loteQty < Number(dto.qty)) {
          woa.cant_return = Number(woa.allocated_qty);

          const diff = Number(dto.qty) - Number(loteQty);
          woa.qty_surplus = diff;
          woa.qty_dif = diff > 0;
        }
        else {
          woa.cant_return = Number(woa.cant_return ?? 0) + Number(dto.qty);

          if(Number(dto.qty) < Number(loteQty)) {              
            woa.qty_missing = Number(loteQty) - Number(dto.qty);
            woa.qty_dif = true;
          }
          else {
            woa.qty_missing = 0;
            woa.qty_surplus = 0;
            woa.qty_dif = false;
            dto.Processed = true;
          }
        }
      }
      else {
        this.logger.logError(`ERROR EN woa.allocated_qty = ${woa.allocated_qty}`);
      }

      if(article != undefined) {
        woa.volumen_linea = (woa.allocated_qty != undefined ? woa.allocated_qty : 0) * (article.Volumen_Unidad != undefined ? article.Volumen_Unidad : 0);
      }
      
      await this.woaService.updateWOA(woa);

      this.logger.logError(`woa.allocated_qty = ${woa.allocated_qty}`);
      this.logger.logError(`dto.qty = ${dto.qty}`);

      const qty = +woa.allocated_qty - +dto.qty;
      this.logger.logError(`qty dif resultado = ${qty}`);
      
      /*
      if(qty > 0) {
        /*const dtoReturn: ReturnDto = {
          facility_id__code: '',
          company_id__code: '',
          wave_nbr: '',
          order_nbr: '',
          item_alternate_code: '',
          batch_nbr: '',
          load_unit_code: '',
          qty: qty.toString(),
          orig_invn_attr_a: '',
          invn_attr_a: '',
          from_container_nbr: '',
          to_container_nbr: '',
          mhe_system_code: '',
          pick_location: '',
          short_flg: 'false',
          orig_batch_nbr: '',
          orig_iblpn_nbr: '',
          send_driver: false
        };
          */

        //dtoReturn.qty = qty.toString(),
        //dtoReturn.short_flg = 'true';

        //this.logger.logError(`getDataToSend - dtoReturn ADICIONAL`, JSON.stringify(dtoReturn, null, 2));

        //list.push(dtoReturn);
      //}
    }
    else {

      const woaList = await this.woaService.findByOblpnAlternativeCode(dto.to_container_nbr, dto.item_alternate_code);

      const woaTmp = (woaList != undefined && woaList.length > 0) ? woaList[0] : undefined;

      if(woaTmp != undefined) {
        const article = await this.articleService.findByCodBarraUbicacion(woaTmp.allocated_location);

        let dtoReturn: ReturnDto = {
          facility_id__code: woaTmp.facility_code,
          company_id__code: process.env.COMPANY_CODE,
          wave_nbr: woaTmp.wave_number,
          order_nbr: woaTmp.order_number,
          item_alternate_code: dto.item_alternate_code,
          batch_nbr: dto.batch_nbr,
          load_unit_code: dto.load_unit_code,
          qty: dto.qty,
          orig_invn_attr_a: woaTmp.invn_attr_a,
          invn_attr_a: woaTmp.invn_attr_a,
          from_container_nbr: woaTmp.oblpn,
          to_container_nbr: dto.to_container_nbr,
          mhe_system_code: 'KISOFT',//woaTmp.mhe_system_code,
          pick_location: article != undefined ? article.Cod_Barra_2 : ' ',
          short_flg: 'false',
          orig_batch_nbr: '',//woaTmp.batch_nbr,
          orig_iblpn_nbr: '',
          send_driver: false,
          qty_dif: false,
          lot_exists: false
        };

        list.push(dtoReturn);
      }
      else {
        detail = detail + `[No se encontró WOA con oblpn=${dto.to_container_nbr}, item_alternate_code=${dto.item_alternate_code} el lote = ${dto.batch_nbr}],`;
        await this.traceService.updateDetail(id, JSON.stringify(detail, null, 2));
      }        
    }

    return list;
  }

  async procesaCasosTipo2(woaList: Woa[], data: CreateWoaResponseDto[]) {
    const woaListOrdered = [...woaList].sort((a, b) => a.id - b.id);
    //const woaListProcessed = [];
    const list: ReturnDto[] = [];
    const woaUpdated: WoaResumen[] = [];
    const oblpnArticleProcessed: OblpnArticle[] = [];

    this.logger.logError(`procesaCasosTipo2 - PARTE 1 - ******************************************************************************************************************************`);
    //Buscar los que coninciden hasta con la cantidad
    for (const woa of woaListOrdered) {
        const returnDto = data.find(x => x.to_container_nbr == woa.oblpn && 
                                x.item_alternate_code == woa.item_alternate_code &&
                                Number(x.qty) == woa.allocated_qty && 
                                !x.Processed);

        this.logger.logError(`procesaCasosTipo2 - PARTE 1 - returnDto`, JSON.stringify(returnDto, null, 2));

        if(returnDto != null) {
          const articleProcessed = oblpnArticleProcessed.some(
            item =>
              item.to_container_nbr === returnDto.to_container_nbr &&
              item.item_alternate_code === returnDto.item_alternate_code,
          );

          if(!articleProcessed) {
            oblpnArticleProcessed.push({
              to_container_nbr: returnDto.to_container_nbr,
              item_alternate_code: returnDto.item_alternate_code,
              returnId: returnDto.id
            });

            const article = await this.articleService.findByCodBarraUbicacion(woa.allocated_location);
  
            let dtoReturn: ReturnDto = {
              facility_id__code: woa.facility_code,
              company_id__code: process.env.COMPANY_CODE,
              wave_nbr: woa.wave_number,
              order_nbr: woa.order_number,
              item_alternate_code: returnDto.item_alternate_code,
              batch_nbr: woa.batch_nbr,
              load_unit_code: returnDto.load_unit_code,
              qty: returnDto.qty,
              orig_invn_attr_a: woa.invn_attr_a,
              invn_attr_a: woa.invn_attr_a,
              from_container_nbr: woa.oblpn,
              to_container_nbr: returnDto.to_container_nbr,
              mhe_system_code: 'KISOFT',//woa.mhe_system_code,
              pick_location: article != undefined ? article.Cod_Barra_2 : ' ',
              short_flg: 'false',
              orig_batch_nbr: '',//returnDto.batch_nbr,
              orig_iblpn_nbr: '',
              send_driver: false,
              qty_dif: false,
              lot_exists: true
            };
  
            list.push(dtoReturn);
  
            woaUpdated.push({
              woaId: woa.id,
              returnId: returnDto.id
            });
  
            woa.cant_return = woa.allocated_qty;
            await this.woaService.updateWOA(woa);
          }          
        }

        this.logger.logError(`procesaCasosTipo2 - woaUpdated`, JSON.stringify(woaUpdated, null, 2));
    };

    this.logger.logError(`getDataToSend - ReturnDto - procesaCasosTipo2 AFTER PASO 1`, JSON.stringify(list, null, 2));

    this.logger.logError(`procesaCasosTipo2 - PARTE 2 - ******************************************************************************************************************************`);
    //Se valida si llegaron dos arctículos con el mismo código para completar a dos registros de woa

    const woaListOrderedUpdated = [...woaList].sort((a, b) => a.id - b.id);
    const woaUpdatedId = new Set(woaUpdated.map(x => x.woaId));
    const woaListUpdate = woaListOrderedUpdated.filter(y => !woaUpdatedId.has(y.id));
    const returnUpdated1 = new Set(woaUpdated.map(x => x.returnId));

    for (const woa of woaListUpdate) {
      const returnDto = data.find(x => !returnUpdated1.has(x.id) &&
                                      x.to_container_nbr == woa.oblpn && 
                                      x.item_alternate_code == woa.item_alternate_code &&
                                      Number(x.qty) == woa.allocated_qty && 
                                      !x.Processed);

      if(returnDto != null) {
        this.logger.logError(`procesaCasosTipo2 - PARTE 2 - returnDto`, JSON.stringify(returnDto, null, 2));

        const article = await this.articleService.findByCodBarraUbicacion(woa.allocated_location);
  
        let dtoReturn: ReturnDto = {
          facility_id__code: woa.facility_code,
          company_id__code: process.env.COMPANY_CODE,
          wave_nbr: woa.wave_number,
          order_nbr: woa.order_number,
          item_alternate_code: returnDto.item_alternate_code,
          batch_nbr: woa.batch_nbr,
          load_unit_code: returnDto.load_unit_code,
          qty: returnDto.qty,
          orig_invn_attr_a: woa.invn_attr_a,
          invn_attr_a: woa.invn_attr_a,
          from_container_nbr: woa.oblpn,
          to_container_nbr: returnDto.to_container_nbr,
          mhe_system_code: 'KISOFT',//woa.mhe_system_code,
          pick_location: article != undefined ? article.Cod_Barra_2 : ' ',
          short_flg: 'false',
          orig_batch_nbr: '',//returnDto.batch_nbr,
          orig_iblpn_nbr: '',
          send_driver: false,
          qty_dif: false,
          lot_exists: true
        };
  
        list.push(dtoReturn);
  
        woaUpdated.push({
          woaId: woa.id,
          returnId: returnDto.id
        });
  
        woa.cant_return = woa.allocated_qty;
        await this.woaService.updateWOA(woa);
      }
    }

    this.logger.logError(`getDataToSend - ReturnDto - procesaCasosTipo2 AFTER PASO 2`, JSON.stringify(list, null, 2));

    this.logger.logError(`procesaCasosTipo2 - PARTE 3 - ******************************************************************************************************************************`);

    //Se recorren los R32 que llegaron pero no coinciden en cantidad de artículos con los woa registrados
    const returnUpdatedIds = new Set(woaUpdated.map(x => x.returnId));
    const returnPendientes = (woaUpdated && woaUpdated.length > 0) ? data.filter(r => !returnUpdatedIds.has(r.id) && !r.Processed) : data;
    const returnAgrupado = this.groupAndSum(returnPendientes);
    const returnFaltante = returnAgrupado.sort((a, b) => Number(b.qty) - Number(a.qty));

    const woaUpdatedIds = woaUpdated.length > 0 ? new Set(woaUpdated.map(x => x.woaId)) : null;

    if(returnFaltante) {
      this.logger.logError(`procesaCasosTipo2 - returnFaltante.length = ${returnFaltante.length}`);
    }
    
    this.logger.logError(`procesaCasosTipo2 - returnFaltante`, JSON.stringify(returnFaltante, null, 2));    

    if(returnFaltante != null && returnFaltante.length > 0) {
      
      let woaIdCompletado: number[] = [];

      this.logger.logError(`procesaCasosTipo2 - woaUpdatedIds`, JSON.stringify(woaUpdatedIds, null, 2));

      for(const returnDto of returnFaltante) {
        let qtySobrante = 0;
        let woaActualizado: WoaActualizado[] = [];
        //this.logger.logError(`procesaCasosTipo2 - RETURN A VALIDAR  - eturnDto.id = ${returnDto.id}`);
        //this.logger.logError(`procesaCasosTipo2 - qtySobrante = ${qtySobrante}`);

       // const woaPendientes = woaListOrdered.filter(woa => (!woaUpdatedIds.has(woa.id)) && 
       //                                                   woa.oblpn == returnDto.to_container_nbr &&
       //                                                   woa.item_alternate_code == returnDto.item_alternate_code);

        const woaPendientes = woaListOrdered.filter(woa => {
                              if (woa.oblpn !== returnDto.to_container_nbr) return false;
                              if (woa.item_alternate_code !== returnDto.item_alternate_code) return false;
                              if (woaUpdatedIds && woaUpdatedIds.has(woa.id)) return false;
                              if(woaIdCompletado.includes(woa.id)) return false;
                              return true;
                            });
        
        if(woaPendientes) {
          const woaPendienteIds = woaPendientes.map(x => x.id);
          //this.logger.logError(`procesaCasosTipo2 - woaPendienteIds`, JSON.stringify(woaPendienteIds, null, 2));
          //this.logger.logError(`procesaCasosTipo2 - woaActualizado`, JSON.stringify(woaActualizado, null, 2));

          
          for (const woa of woaPendientes) { 
            
            const returnQty = (qtySobrante > 0 ? qtySobrante : Number(returnDto.qty));
            //this.logger.logError(`procesaCasosTipo2 - returnDto.qty = ${returnDto.qty}`);
            //this.logger.logError(`procesaCasosTipo2 - returnQty = ${returnQty}`);

            
            //this.logger.logError(`procesaCasosTipo2 - woa.id = ${woa.id}`);
            //this.logger.logError(`procesaCasosTipo2 - woa.allocated_qty = ${woa.allocated_qty}`);
            //this.logger.logError(`procesaCasosTipo2 - woa.cant_return = ${woa.cant_return}`);
    
            //Para los R32 que llegaron con cantidades menores a los del woa          
            
            //this.logger.logError(`procesaCasosTipo2 - woa.cant_return = ${woa.cant_return}`);
            //this.logger.logError(`procesaCasosTipo2 - returnDto.id = ${returnDto.id}`);
            //this.logger.logError(`procesaCasosTipo2 - returnDto.item_alternate_code = ${returnDto.item_alternate_code}`);
            //this.logger.logError(`procesaCasosTipo2 - returnQty = ${returnQty}`);
            let returnFaltante = Number(woa.allocated_qty) - Number(woa.cant_return);
            //this.logger.logError(`procesaCasosTipo2 - returnFaltante = ${returnFaltante}`);
            let woaCantReturn = Number(woa.cant_return) + returnQty;            

            if(woaActualizado.length > 0) {
              //this.logger.logError(`procesaCasosTipo2 - woa.id buscado en woaActualizado = ${woa.id}`);
              const woaBuscado = woaActualizado.find(x => x.woaId == woa.id);
              //this.logger.logError(`procesaCasosTipo2 - woaBuscado`, JSON.stringify(woaBuscado, null, 2));

              if(woaBuscado != null) {
                woaCantReturn = Number(woaBuscado.qty) + returnQty; 
              }            
            }
            
            //this.logger.logError(`procesaCasosTipo2 - woaCantReturn = ${woaCantReturn}`);

            qtySobrante =  Number(woaCantReturn) > Number(woa.allocated_qty) ? Number(woaCantReturn) - Number(woa.allocated_qty) : 0;

            //this.logger.logError(`procesaCasosTipo2 - qtySobrante = ${qtySobrante}`);

            woaCantReturn = Number(woaCantReturn) >= Number(woa.allocated_qty) ? Number(woa.allocated_qty) : Number(woaCantReturn);

            const qtyUtilizado = returnQty - qtySobrante;

            //this.logger.logError(`procesaCasosTipo2 - qtyUtilizado = ${qtyUtilizado}`);

            if(Number(woa.allocated_qty) >= Number(woaCantReturn)) {
              //this.logger.logError(`procesaCasosTipo2 - AÑADIR A LISTA********************************************`);
              //this.logger.logError(`procesaCasosTipo2 - woaCantReturn = ${woaCantReturn}`);
              //this.logger.logError(`procesaCasosTipo2 - qtyUtilizado = ${qtyUtilizado}`);
              //this.logger.logError(`procesaCasosTipo2 - ********************************************`);
              
              const article = await this.articleService.findByCodBarraUbicacion(woa.allocated_location);
    
              let dtoReturn: ReturnDto = {
                facility_id__code: woa.facility_code,
                company_id__code: process.env.COMPANY_CODE,
                wave_nbr: woa.wave_number,
                order_nbr: woa.order_number,
                item_alternate_code: returnDto.item_alternate_code,
                batch_nbr: woa.batch_nbr,
                load_unit_code: returnDto.load_unit_code,
                qty: qtyUtilizado.toString(),
                orig_invn_attr_a: woa.invn_attr_a,
                invn_attr_a: woa.invn_attr_a,
                from_container_nbr: woa.oblpn,
                to_container_nbr: returnDto.to_container_nbr,
                mhe_system_code: 'KISOFT',//woa.mhe_system_code,
                pick_location: article != undefined ? article.Cod_Barra_2 : ' ',
                short_flg: 'false',
                orig_batch_nbr: '',//returnDto.batch_nbr,
                orig_iblpn_nbr: '',
                send_driver: false,
                qty_dif: false,
                lot_exists: true
              };
    
              list.push(dtoReturn);

              this.logger.logError(`procesaCasosTipo2 - SE ACTUALIZAR WOA ID = ${woa.id} con cant_return = ${woaCantReturn}`);
              woa.cant_return = woaCantReturn;
              await this.woaService.updateWOA(woa);

              const index = woaActualizado.findIndex(x => x.woaId == woa.id);
                
              if(index > 0) {
                woaActualizado[index].qty = woaCantReturn;
              }
              else {
                woaActualizado.push({
                  woaId: woa.id,
                  qty: woaCantReturn
                });
              }

              if(woa.allocated_qty == woaCantReturn) {
                woaIdCompletado.push(woa.id);
              }

              woaUpdated.push({
                woaId: woa.id,
                returnId: returnDto.id
              });
            }

            if(qtySobrante == 0)
              break;
          }
        }
       
      }

/*
      this.logger.logError(`procesaCasosTipo2 - PARA QTY FALTANTE ********************************************`);
      
      if(qtyFaltante > 0) {
          const dto = returnFaltante[0];

          const article = await this.articleService.findByCodBarraUbicacion(dto.pick_location);
          const woa = woaListOrdered.find(woa => woa.oblpn == dto.to_container_nbr &&
                                                woa.item_alternate_code == dto.item_alternate_code);
          this.logger.logError(`procesaCasosTipo2 - article != null is ${article != null}`);
          this.logger.logError(`procesaCasosTipo2 - woa != null is ${woa != null}`);

            let dtoReturn: ReturnDto = {
              facility_id__code: woa.facility_code,
              company_id__code: process.env.COMPANY_CODE,
              wave_nbr: woa.wave_number,
              order_nbr: woa.order_number,
              item_alternate_code: dto.item_alternate_code,
              batch_nbr: '',
              load_unit_code: dto.load_unit_code,
              qty: qtyFaltante.toString(),
              orig_invn_attr_a: woa.invn_attr_a,
              invn_attr_a: woa.invn_attr_a,
              from_container_nbr: woa.oblpn,
              to_container_nbr: dto.to_container_nbr,
              mhe_system_code: 'KISOFT',//woa.mhe_system_code,
              pick_location: article != undefined ? article.Cod_Barra_2 : ' ',
              short_flg: 'false',
              orig_batch_nbr: '',
              orig_iblpn_nbr: '',
              send_driver: false,
              qty_dif: false,
              lot_exists: true
            };
  
            list.push(dtoReturn);
      }
      */
    }

/*
    this.logger.logError(`procesaCasosTipo2 - PARTE 3 - ******************************************************************************************************************************`);
    //Se recorren los R32 que llegaron pero no coinciden en cantidad de artículos ni con batch_nbr

    const returnIds = new Set(woaUpdated.map(x => x.returnId));
    const returnList = data.filter(r => !returnIds.has(r.id));   

    this.logger.logError(`procesaCasosTipo2 - returnList`, JSON.stringify(returnList, null, 2));

    if(returnIds != null && returnList.length > 0) {

      const returnPorProcesarAgrupado = this.groupAndSum(returnList);
      const returnPorProcesar = returnPorProcesarAgrupado.sort((a, b) => Number(b.qty) - Number(a.qty));
      const returnDtoPP = returnPorProcesar[0];

      this.logger.logError(`procesaCasosTipo2 - returnPorProcesar`, JSON.stringify(returnPorProcesar, null, 2));

      const woaLista = await this.woaService.findByOblpnAlternativeCode(returnDtoPP.to_container_nbr, returnDtoPP.item_alternate_code);
      const woaPendiente = woaLista.filter(w => Number(w.allocated_qty) > Number(w.cant_return));

      this.logger.logError(`procesaCasosTipo2 - woaPendiente`, JSON.stringify(woaPendiente, null, 2));

      if(woaPendiente != null && woaPendiente.length > 0) {
        for(const returnDto of returnFaltante) {

          for (const woa of woaPendiente) {
            const article = await this.articleService.findByCodBarraUbicacion(returnDto.pick_location);

            this.logger.logError(`procesaCasosTipo2 - woaActualizado`, JSON.stringify(woaActualizado, null, 2));
          
            this.logger.logError(`procesaCasosTipo2 - woa.cant_return = ${woa.cant_return}`);
            let woaCantReturn = Number(woa.cant_return) + Number(returnDto.qty);
  
            if(woaActualizado.length > 0) {
              const newqty = woaActualizado.find(x => x.woaId == woa.id);

              if(newqty) {
                woaCantReturn = Number(newqty.qty) + Number(returnDto.qty);
              }
            }

            this.logger.logError(`procesaCasosTipo2 - woa.allocated_qty = ${woa.allocated_qty}`);
            this.logger.logError(`procesaCasosTipo2 - woaCantReturn = ${woaCantReturn}`);

            if(Number(woa.allocated_qty) >= Number(woaCantReturn)) {
              let dtoReturn: ReturnDto = {
                facility_id__code: woa.facility_code,
                company_id__code: process.env.COMPANY_CODE,
                wave_nbr: woa.wave_number,
                order_nbr: woa.order_number,
                item_alternate_code: returnDto.item_alternate_code,
                batch_nbr: returnDto.batch_nbr,
                load_unit_code: returnDto.load_unit_code,
                qty: returnDto.qty,
                orig_invn_attr_a: woa.invn_attr_a,
                invn_attr_a: woa.invn_attr_a,
                from_container_nbr: woa.oblpn,
                to_container_nbr: returnDto.to_container_nbr,
                mhe_system_code: 'KISOFT',//woa.mhe_system_code,
                pick_location: article != undefined ? article.Cod_Barra_2 : ' ',
                short_flg: 'false',
                orig_batch_nbr: woa.batch_nbr,
                orig_iblpn_nbr: '',
                send_driver: false,
                qty_dif: false,
                lot_exists: true
              };
    
              list.push(dtoReturn);
  
              if(woaActualizado.length > 0)
              {
                const index = woaActualizado.findIndex(x => x.woaId == woa.id);

                if(index >= 0){
                  woaActualizado[index].qty = woaCantReturn;
                }                
              }
              else {
                woaActualizado.push({
                  woaId: woa.id,
                  qty: woaCantReturn
                });
              }
  
              woa.cant_return = woaCantReturn;
              await this.woaService.updateWOA(woa);
            }
          }
        }
      }
    }
    */

    /*const returnList = data.filter(x => x.to_container_nbr == woa.oblpn && 
      x.item_alternate_code == woa.item_alternate_code && 
      x.batch_nbr == woa.batch_nbr);

    if(returnList != null) {


    }
    */
    return list;
  }

  copyUniqueObjects(sourceArray: Woa[], targetArray: Woa[]): any[] {
    const targetIds = new Set(targetArray.map(item => item.id));
    
    sourceArray.forEach(item => {
      if (!targetIds.has(item.id)) {
        targetArray.push(item);
        targetIds.add(item.id);
      }
    });
    
    return targetArray;
  }
  


  

  buildJsonLinkAssetStructure(to_container_nbr: string, load_unit_code: string) {
    /*const xmlStructure = {
      Envelope: {
        $: { xmlns: 'http://schemas.xmlsoap.org/soap/envelope/' },
        Body: {
          Request: {
              parameters: {
                  "list-item": list.map((obj) => ({
                      parameters: "1",
                      company_id: "239",
                      container_nbr: obj.to_container_nbr,
                      asset_nbr: obj.load_unit_code,
                      replace_container_nbr_with_asset_flg: 'false',
                      validate_lpn_type_flg: 'false'
                  })),
            },
          },
        },
      },
    };*/

    this.logger.logError(`buildJsonLinkAssetStructure - to_container_nbr ${to_container_nbr}`);
    this.logger.logError(`buildJsonLinkAssetStructure - load_unit_code ${load_unit_code}`);

    const linkAssetJson = {
      parameters: 
      {
          facility_id: "1",
          company_id: "239",
          container_nbr: to_container_nbr
      },
      options: 
      {
          asset_nbr: load_unit_code,
          replace_container_nbr_with_asset_flg: 'false',
          validate_lpn_type_flg: 'false'
      },
    };

    //console.log(xmlStructure);
    return linkAssetJson;
  }

  async sendDivert(to_container_nbr: string, dispatchRampNumber: string, id: number) {
    const date = new Date();
    const timeStampText = `${date.toISOString().split('T')[0]}`;

    this.logger.logError(`sendDivert - traceId: ${id} - timeStampText ${timeStampText}`);
    this.logger.logError(`sendDivert - traceId: ${id} - to_container_nbr ${to_container_nbr}`);
    this.logger.logError(`sendDivert - traceId: ${id} - dispatchRampNumber ${dispatchRampNumber}`);

    const woaList = await this.woaService.findByOblpn(to_container_nbr);
    
    //this.logger.logError("woaList", JSON.stringify(woaList, null, 2));

    for(const woaEntity of woaList) {
      woaEntity.dispatch_ramp_number = dispatchRampNumber;
      await this.woaService.updateWOA(woaEntity);
    }

    if(woaList != undefined) {
      const xmlStructure = {
        LgfData: {
          Header: {
            DocumentVersion: "24A",
            OriginSystem: "Host",
            ClientEnvCode: "bofasa_test",
            ParentCompanyCode: "GB",
            Entity: "divert_confirmation",
            TimeStamp: timeStampText,
            MessageId: "1234567890"
          },
          ListOfDivertConfirmations: {
            divert_confirmation: {
              facility_code: "CD01",
              company_code: process.env.COMPANY_CODE,
              mhe_system_code: "CNV",
              lpn_nbr: to_container_nbr,
              divert_lane: dispatchRampNumber,
              dest_locn_brcd: null
            }
          },
        },
      };
  
      //this.logger.logError(`xmlStructure ${xmlStructure}`);
  
      //this.logger.logError("DrivertXmlStructure", JSON.stringify(xmlStructure, null, 2));

      this.logger.logError("URL Divert", process.env.LINK_DIVERT_URL);

      await this.traceService.update(id, JSON.stringify(xmlStructure, null, 2));
  
      await this.xmlService.sendSoapRequestByForm(xmlStructure, process.env.LINK_DIVERT_URL, id);
    }   
  }



  validateNullString(text: string | undefined) {
    return text === undefined || (typeof text === 'string' && text.replace(/^\s+/, '').length == 0);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  private groupAndSum(items: CreateWoaResponseDto[]): CreateWoaResponseDto[] {
        const grouped = new Map<string, CreateWoaResponseDto>();
    
        for (const item of items) {
        // Creamos una clave única para cada combinación de campos, excepto 'qty' y 'id' (ya que 'id' es único por registro)
        const key = JSON.stringify({
            to_container_nbr: item.to_container_nbr,
            load_unit_code: item.load_unit_code,
            item_alternate_code: item.item_alternate_code,
            batch_nbr: item.batch_nbr,
            wworker: item.wworker,
            pick_location: item.pick_location,
            CreatedDate: item.CreatedDate,
            CreatedUser: item.CreatedUser,
        });
    
        if (!grouped.has(key)) {
            // Clonamos el objeto base y lo inicializamos
            grouped.set(key, { ...item, qty: Number(item.qty).toString() });
        } else {
            const existing = grouped.get(key)!;
            const newQty = Number(existing.qty) + Number(item.qty);
            grouped.set(key, { ...existing, qty: newQty.toString() });
        }
        }
    
        return Array.from(grouped.values());
    }
}