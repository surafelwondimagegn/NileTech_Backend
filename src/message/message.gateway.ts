import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ namespace: '/message', cors: true })
@UseGuards(WsJwtGuard)

export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('message:send')
  async handleSend(@MessageBody() dto: SendMessageDto, @ConnectedSocket() client: Socket) {
    const message = await this.messageService.create(dto);
    
    // Emit to specific user or room
    this.server.to(`user:${dto.receiverId}`).emit('message:new', message);
    
    return { status: 'ok', message };
  }

  @SubscribeMessage('message:read')
  async handleRead(@MessageBody() data: { id: number }, @ConnectedSocket() client: Socket) {
    await this.messageService.markAsRead(data.id);
    return { status: 'ok' };
  }
}