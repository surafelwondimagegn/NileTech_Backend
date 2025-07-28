import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@WebSocketGateway({ namespace: '/notification', cors: true })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationService: NotificationService) {}

  @SubscribeMessage('notification:send')
  async handleSend(
    @MessageBody() dto: SendNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const notification = await this.notificationService.create(dto);

    // Emit to specific user or room
    this.server
      .to(`user:${dto.receiverId}`)
      .emit('notification:new', notification);

    return { status: 'ok', notification };
  }

  @SubscribeMessage('notification:read')
  async handleRead(
    @MessageBody() data: { id: number },
    @ConnectedSocket() client: Socket,
  ) {
    await this.notificationService.markAsRead(data.id);
    return { status: 'ok' };
  }
}
