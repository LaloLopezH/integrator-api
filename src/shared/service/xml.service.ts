import { Injectable } from '@nestjs/common';
import * as xml2js from 'xml2js';
import axios from 'axios';
import { LoggerService } from '../logger/logger.service';
import util from 'util';
import { from, lastValueFrom, retry, timer } from 'rxjs';
import { mapAxiosLikeErrorToHttpException } from '../utils/wms-trace.util';

@Injectable()
export class XmlService {
  private sendXml = false;
  private readonly maxRetries = 4;
  private readonly throttleDelay = 40000;
  
constructor(private readonly logger: LoggerService){}

  async processXml(xml: string): Promise<any> {
    try {
      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true, trim: true });
      const result = await parser.parseStringPromise(xml);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error al procesar el XML:', error);
      //throw new Error('No se pudo procesar el XML');
    }
  }

  public async sendSoapRequest(xmlObject: any, wsdlUrl: string, traceId: number): Promise<any> {
    const maxRetries = this.readPositiveInt('WMS_SOAP_MAX_RETRIES', 3);
    const delayMs = this.readPositiveInt('WMS_SOAP_RETRY_DELAY_MS', 30000);
    const timeoutMs = this.readPositiveInt('WMS_SOAP_TIMEOUT_MS', 25000);

    this.logger.logError(`sendSoapRequest - traceId:${traceId} - wsdlUrl = ${wsdlUrl}`);
    this.logger.logError(
      `sendSoapRequest - traceId:${traceId} - timeoutMs=${timeoutMs}, maxRetries=${maxRetries}, retryDelayMs=${delayMs}`,
    );

    const builder = new xml2js.Builder({ headless: true });
    const xml = builder.buildObject(xmlObject);
    const xmlClean = xml.replace(/\n/g, '').trim();

    this.logger.logError(`xml - traceId:${traceId}  - `, xmlClean);
    const xmlSizeKb = Buffer.byteLength(xmlClean, 'utf8') / 1024;
    this.logger.logError(`traceId:${traceId} - Tamaño del XML a enviar: ${xmlSizeKb.toFixed(2)} KB`);
    this.logger.logError(`sendSoapRequest - traceId:${traceId} - paso antes de enviar xml`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.logError(`traceId:${traceId} - Intento ${attempt} de envío SOAP`);

        if(this.sendXml) {
          await this.delay(3000);
        }

        this.sendXml = true;
        const response = await axios.post(wsdlUrl, xmlClean, {
          timeout: timeoutMs,
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.API_WMS_USER}:${process.env.API_WMS_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/xml; text/xml; charset=utf-8',
            'SOAPAction': 'urn:tuAccionSOAP'
          }
        });

        if(response) {
          this.sendXml = false;

          if (response.status === 202) {
            this.logger.logError(`****ERROR: - traceId:${traceId} - Respuesta 202 recibida`);
          }
          else {
            this.logger.logError(`Respuesta del api - traceId:${traceId}, URL=${wsdlUrl}`, util.inspect(response, { depth: null }));
          }
          return response.data;
        }

        this.logger.logError(`****ERROR: traceId:${traceId} - No se obtuvo respuesta del api`);
        this.logger.logError(`sendSoapRequest - finalizando - traceId:${traceId}`);
        this.sendXml = false;
        return null;

      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.logger.logError(`****ERROR: traceId:${traceId} - Error al enviar xml en intento ${attempt}`, JSON.stringify({
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
          }, null, 2));
        } else {
          this.logger.logError(`****ERROR: traceId:${traceId} - Error desconocido al enviar xml en intento ${attempt}`, error);
        }

        if (attempt < maxRetries) {
          this.logger.logError(`traceId:${traceId} - Reintentando envia de xml al api en ${delayMs / 1000} segundos...`);
          await this.delay(delayMs);
        } else {
          this.logger.logError(`traceId:${traceId} - Se alcanzó el número máximo de intentos (${maxRetries}) de enviar el xml al api.`);
          throw mapAxiosLikeErrorToHttpException(error);
        }
      }
      finally {
        this.sendXml = false;
      }
    }
  }

  public async sendSoapRequestByForm(
    xmlObject: any,
    wsdlUrl: string,
    traceId: number,
  ): Promise<any> {
    const builder = new xml2js.Builder({ headless: true });
    const xml = builder.buildObject(xmlObject);
    const xmlClean = xml.replace(/\n/g, '').trim();

    this.logger.logError(`xml - traceId=${traceId} - `, xmlClean);

    const formData = new URLSearchParams();
    formData.append('xml_data', xmlClean);

    const request$ = from(
      axios.post(wsdlUrl, formData.toString(), {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.API_WMS_USER}:${process.env.API_WMS_PASSWORD}`,
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    ).pipe(
      retry({
        count: this.maxRetries,
        delay: (error, retryCount) => {
          this.logger.logError(
            `Reintentando SOAP request... intento #${retryCount} traceId=${traceId}`,
          );
          return timer(this.throttleDelay);
        },
      }),
    );

    try {
      const response = await lastValueFrom(request$);
      return response.data;
    } catch (error) {
      this.logger.logError(
        `Error sending SOAP request - url:${wsdlUrl} - traceId:${traceId} - error:`,
        error,
      );
      throw error;
    }
  }

  private readPositiveInt(envKey: string, defaultValue: number): number {
    const raw = process.env[envKey];
    if (raw == null || raw === '') {
      return defaultValue;
    }
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : defaultValue;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}