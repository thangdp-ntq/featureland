import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: true,
  namespace: 'socket.io',
  path: '/socket.io',
})
export class EventsGateway {
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('EventsGateway');

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  sendMessage(event: any, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Send event=${event}, data=${JSON.stringify(data)}`);
  }
}
