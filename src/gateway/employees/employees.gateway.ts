import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server } from 'socket.io'

@WebSocketGateway()
export class EmployeesGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {

    this.server.emit('message', { msg: "test"})
    
    return 'Hello world!';
  }
}
