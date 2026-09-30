import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Incluye el `code` de Axios/Node (ECONNRESET, ETIMEDOUT, etc.) en el cuerpo del HttpException
 * para que los consumidores (p. ej. Trace) puedan leerlo vía getResponse().
 */
export function mapAxiosLikeErrorToHttpException(error: any): HttpException {
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

export function serializeWmsResponseForTrace(data: unknown): string {
  if (data === undefined) {
    return '[sin respuesta del WMS]';
  }
  if (data === null) {
    return 'null';
  }
  if (typeof data === 'string') {
    return data;
  }
  return JSON.stringify(data, null, 2);
}

export function serializeWmsErrorForTrace(error: unknown): string {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    return JSON.stringify(response, null, 2);
  }
  if (error && typeof error === 'object') {
    const e = error as Error & { response?: { data?: unknown } };
    if (e.response?.data !== undefined) {
      return typeof e.response.data === 'string'
        ? e.response.data
        : JSON.stringify(e.response.data, null, 2);
    }
    if (e.message) {
      return e.message;
    }
  }
  return String(error);
}
