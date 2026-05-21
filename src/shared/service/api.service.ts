import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, delay, firstValueFrom, lastValueFrom, map, mergeMap, of, retry, retryWhen, take, throwError, timer } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ApiService {
  private readonly throttleDelay = 40000; // 30 segundos entre llamadas
  private readonly maxRetries = 4; // Máximo de reintentos por llamada
  private readonly maxRetriesWMS = 4;
  private readonly throttleExtraDelay = 40000;

  constructor(private readonly httpService: HttpService,
              private readonly logger: LoggerService
  ) {}

  async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      data?: any;
    },
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          params: options?.params,
          headers: options?.headers,
          data: options?.data,
        }),
      );

      try {
        if(response.data) {
          this.logger.logError(`api service response, URL=${url}`, JSON.stringify(response.data, null, 2));
        }
      } catch (error) {
          this.logger.logError("Error al imprimir response.data", error);
      }      

      return response.data;
    } catch (error) {
      this.logger.logError("Error connecting to API", error);
      throw this.mapAxiosLikeErrorToHttpException(error);
    }
  }

  async requestWithRetries(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      data?: any;
    },
  ): Promise<any> {
    return lastValueFrom(
      this.httpService.request({
        method,
        url,
        params: options?.params,
        headers: options?.headers,
        data: options?.data,
      }).pipe(
        map(response => response.data),
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {            
            this.logger.logError(
              `Error en intento ${retryCount}, reintentando en ${this.throttleDelay}ms...   - url:${url}`,
              error.message,
            );
            this.logger.logError(`requestWithRetries error: ${JSON.stringify(error, null, 2)}`);
            return timer(this.throttleDelay);
          },
          resetOnSuccess: true, // Opcional, por si quieres que al tener éxito se reinicie el contador
        }),
        catchError((error) => {
          this.logger.logError(`Error final después de reintentos - requestWithRetries - url:${url} - error:`, error.message);
          this.logger.logError(`requestWithRetries error: ${JSON.stringify(error, null, 2)}`);
          throw this.mapAxiosLikeErrorToHttpException(error);
        }),
      )
    );
  }

  async requestWithRetriesTime(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      data?: any;
    },
    isApiBusy?: boolean
  ): Promise<any> {
    return lastValueFrom(
      this.httpService.request({
        method,
        url,
        params: options?.params,
        headers: options?.headers,
        data: options?.data,
      }).pipe(
        map(response => response.data),
        retry({
          count: this.maxRetriesWMS,
          delay: (error, retryCount) => {            
            const time = isApiBusy ? retryCount * this.throttleExtraDelay : this.throttleExtraDelay;

            if (error.code === 'ECONNRESET') {
              this.logger.logError(
                `⚠️ Socket hang up detectado en intento ${retryCount}, reintentando en ${time}ms...`,
                error.message,
              );
            } else {
              this.logger.logError(
                `Error en intento ${retryCount}, reintentando en ${time}ms...`,
                error.message,
              );
            }

            this.logger.logError(JSON.stringify(error, null, 2));
            
            return timer(time);
          },
          resetOnSuccess: true, // Opcional, por si quieres que al tener éxito se reinicie el contador
        }),
        catchError((error) => {
          if (error.code === 'ECONNRESET') {
            this.logger.logError(`❌ Error final: socket hang up`, error.message);
          } else if (error.code === 'ETIMEDOUT') {
            this.logger.logError(`❌ Error final: timeout`, error.message);
          } else {
            this.logger.logError(`❌ Error final después de reintentos`, error.message);
          }
          
          this.logger.logError(JSON.stringify(error, null, 2));
          throw this.mapAxiosLikeErrorToHttpException(error);
        }),
      )
    );
  }

  /**
   * Incluye el `code` de Axios/Node (ECONNRESET, ETIMEDOUT, etc.) en el cuerpo del HttpException
   * para que los consumidores (p. ej. Trace) puedan leerlo vía getResponse().
   */
  private mapAxiosLikeErrorToHttpException(error: any): HttpException {
    const status = error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const axiosCode = typeof error?.code === 'string' && error.code.length > 0 ? error.code : undefined;

    if (error?.response?.data !== undefined && error?.response?.data !== null) {
      const data = error.response.data;
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        return new HttpException(
          axiosCode ? { ...data, axiosErrorCode: axiosCode } : data,
          status,
        );
      }
      return new HttpException(
        axiosCode ? { code: axiosCode, data } : data,
        status,
      );
    }

    return new HttpException(
      {
        message: 'Error connecting to API',
        ...(axiosCode ? { code: axiosCode } : {}),
        ...(typeof error?.message === 'string' ? { errorMessage: error.message } : {}),
      },
      status,
    );
  }
}