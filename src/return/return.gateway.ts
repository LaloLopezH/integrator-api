import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ReturnService } from './return.service';
import { Server, Socket } from 'socket.io';
import { LoggerService } from 'src/shared/logger/logger.service';

@WebSocketGateway({ cors: true, namespace: '/', port: process.env.KISOFT_OUT_PORT })
//@WebSocketGateway(+process.env.KISOFT_OUT_PORT, { transports: ['websocket', 'polling'] })
export class ReturnGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly returnService: ReturnService,
              private readonly logger: LoggerService) {}

  @WebSocketServer()
    server: Server;

  handleDisconnect(client: Socket) {
    //this.logger.logError(`Cliente conectado ${client.id} - ${process.env.KISOFT_OUT_PORT}`);
    //this.returnService.registerClient(client);
  }

  handleConnection(client: Socket) {
    //this.logger.logError(`Cliente desconectado ${client.id} - ${process.env.KISOFT_OUT_PORT}`);
    //this.returnService.removeClient(client);
  }

  /*@SubscribeMessage('message')
  async onMessageFromClient( client: Socket, payload: string){
    this.logger.logError(`payload recibido ${payload}`);

    await this.returnService.procesaTrama(payload);
  }*/

  /*@SubscribeMessage('message')
  async handleMessage(@MessageBody() data: any): Promise<void> {
    console.log('Trama recibida:', data);

    this.logger.logError(`Trama recibida ${data}`);

    await this.returnService.procesaTrama(data);

    this.server.emit('response', '0001042R00');
  }
    */
}
