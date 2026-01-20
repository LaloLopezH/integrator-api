import { Injectable, OnModuleInit } from '@nestjs/common';
import { createServer, Server, Socket } from 'net';
import { LoggerService } from '../logger/logger.service';
import { Trama32RTrackerService } from './trama32r-tracker.service';
import * as iconv from 'iconv-lite';

@Injectable()
export class TcpListenerService implements OnModuleInit {
  private readonly host: string = process.env.TCP_HOST_TO_SEND;
  private readonly port: number = +process.env.KISOFT_OUT_PORT;
  private server: Server;

  constructor(private readonly logger: LoggerService,
              private readonly trama32RTrackerService: Trama32RTrackerService
    ) {};

  onModuleInit() {
    this.startTcpServer();
  }

  private startTcpServer() {
    this.server = createServer((socket: Socket) => {
        this.logger.logError(`Cliente conectado: ${socket.remoteAddress}:${socket.remotePort}`);

      socket.setKeepAlive(true, 60000);

      socket.on('data', (data) => {
        const message = data.toString().trim();
        this.logger.logError(`Mensaje recibido: ${message}`);
        let response = '';
        
        if(message.includes('3HR')){
          response = '000104HR00';
        }
        else {
          this.trama32RTrackerService.addTrama(message);
          response = '0001042R00';
        }

        response = `\n${response}\r`; // LF al inicio, CR al final
        const encodedMessage = iconv.encode(response, 'ISO-8859-15');

        socket.write(encodedMessage.toString('binary'), () => {
          this.logger.logError(`Respuesta 32R Enviada: ${encodedMessage.toString('binary')}`);
        });

        setInterval(() => {
          if (!socket.destroyed) {
            socket.write('ping');
          }
        }, 30000);
      });

      socket.on('error', (err) => {
        this.logger.logError(`Error en el socket: ${err.message}`);
      });

      socket.on('close', () => {
        this.logger.logError(`Cliente desconectado`);
      });
    });

    this.server.listen(this.port, this.host, () => {
      this.logger.logError(`Servidor TCP escuchando en: ${this.host}:${this.port}`);
    });

    this.server.on('error', (err) => {
        this.logger.logError(`Error en el servidor TCP: ${err.message}`);
    });
  }
}