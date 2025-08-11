import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MessageService } from './message.service';
import { SendMessageDto, MessageType } from './dto/send-message.dto';
import { ChatMessageDto, ChatRoomDto } from './dto/chat-response.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  user?: any;
  data: {
    user?: any;
  };
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      'https://niletech-five.vercel.app',
      'https://niletech-rlrkcwyra-surafellls-projects.vercel.app',
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, string>(); // userId -> socketId
  private typingUsers = new Map<string, Set<number>>(); // roomId -> Set of typing userIds
  private userPresence = new Map<
    number,
    { status: 'online' | 'away' | 'offline'; lastSeen: Date }
  >(); // userId -> presence data

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Manually authenticate the connection
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      try {
        // Verify JWT and get user data
        const payload = await this.jwtService.verifyAsync(token);

        // Fetch full user data from database
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: { profile: true },
        });

        if (!user) {
          client.disconnect();
          return;
        }

        // Attach user data to socket
        client.data.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
        };

        client.userId = user.id;
        client.user = client.data.user;
        this.userSockets.set(client.userId, client.id);

        // Update user presence to online
        this.userPresence.set(client.userId, {
          status: 'online',
          lastSeen: new Date(),
        });

        // Join user's personal room
        await client.join(`user:${client.userId}`);

        // Emit presence update to all connected clients
        this.server.emit('presence_update', {
          userId: client.userId,
          status: 'online',
          lastSeen: new Date(),
        });
      } catch (authError) {
        client.disconnect();
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);

      // Update user presence to offline
      this.userPresence.set(client.userId, {
        status: 'offline',
        lastSeen: new Date(),
      });

      // Emit presence update to all connected clients
      this.server.emit('presence_update', {
        userId: client.userId,
        status: 'offline',
        lastSeen: new Date(),
      });

      // Remove from all typing indicators
      this.typingUsers.forEach((users, roomId) => {
        if (client.userId) {
          users.delete(client.userId);
        }
        if (users.size === 0) {
          this.typingUsers.delete(roomId);
        }
      });


    }
  }

  // Handle the event name that frontend is sending
  @SubscribeMessage('send_message')
  @UseGuards(WsJwtGuard)
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Convert frontend data format to DTO format
      const dto: SendMessageDto = {
        content: data.content,
        receiverId: data.receiverId,
        messageType: MessageType.TEXT,
      };

      const message = await this.messageService.create(dto, client.userId);

      // Convert backend message format to frontend format
      const frontendMessage = {
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        receiverId: message.receiver?.id,
        type: 'direct',
        timestamp: message.createdAt,
        isRead: message.read,
        messageType: message.messageType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        read: message.read,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: message.sender,
        receiver: message.receiver,
      };

      // Determine room to emit to
      if (data.receiverId) {
        // Direct message
        const roomId = `direct_${Math.min(client.userId, data.receiverId)}_${Math.max(client.userId, data.receiverId)}`;

        // Emit to the room
        this.server.to(roomId).emit('new_message', frontendMessage);

        // Send to receiver's personal room if online
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
          this.server.to(receiverSocketId).emit('new_message', frontendMessage);
        }

        // Send back to sender's personal room for optimistic message replacement
        const senderSocketId = this.userSockets.get(client.userId);
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('new_message', frontendMessage);
        }
      }

      return { status: 'ok', message: frontendMessage };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Handle message editing
  @SubscribeMessage('edit_message')
  @UseGuards(WsJwtGuard)
  async handleEditMessage(
    @MessageBody() data: { messageId: string; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messageService.editMessage(
        parseInt(data.messageId),
        data.content,
        client.userId,
      );

      // Convert backend message format to frontend format
      const frontendMessage = {
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        receiverId: message.receiver?.id,
        type: 'direct',
        timestamp: message.createdAt,
        isRead: message.read,
        messageType: message.messageType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        read: message.read,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: message.sender,
        receiver: message.receiver,
      };

      // Emit to appropriate room
      if (message.receiver) {
        const roomId = `direct_${Math.min(client.userId, message.receiver.id)}_${Math.max(client.userId, message.receiver.id)}`;

        this.server.to(roomId).emit('message_edited', {
          messageId: data.messageId,
          content: data.content,
        });
      }

      return { status: 'ok', message: frontendMessage };
    } catch (error) {
      console.error('❌ Error editing message:', error);
      return { error: error.message };
    }
  }

  // Handle message deletion
  @SubscribeMessage('delete_message')
  @UseGuards(WsJwtGuard)
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.messageService.deleteMessage(
        parseInt(data.messageId),
        client.userId,
      );

      // Emit to all connected clients
      this.server.emit('message_deleted', { messageId: data.messageId });

      return { status: 'ok' };
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      return { error: error.message };
    }
  }

  // Handle marking message as read
  @SubscribeMessage('mark_as_read')
  @UseGuards(WsJwtGuard)
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.messageService.markAsRead(
        parseInt(data.messageId),
        client.userId,
      );

      // Emit read receipt to message sender
      const message = await this.messageService.findOne(
        parseInt(data.messageId),
      );
      if (message && message.sender.id !== client.userId) {
        const senderSocketId = this.userSockets.get(message.sender.id);
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('message_read', {
            messageId: data.messageId,
            readBy: client.userId,
          });
        }
      }

      return { status: 'ok' };
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      return { error: error.message };
    }
  }

  // Handle the event name that frontend is sending
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      console.log(`📥 User ${client.userId} joining room: ${data.roomId}`);
      await client.join(data.roomId);
      console.log(
        `✅ User ${client.userId} successfully joined room: ${data.roomId}`,
      );

      return { status: 'ok', roomId: data.roomId };
    } catch (error) {
      console.error('❌ Error joining room:', error);
      return { error: error.message };
    }
  }

  // Handle the event name that frontend is sending
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {

      await client.leave(data.roomId);
      return { status: 'ok' };
    } catch (error) {

      return { error: error.message };
    }
  }

  // Handle the event name that frontend is sending
  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      if (!this.typingUsers.has(data.roomId)) {
        this.typingUsers.set(data.roomId, new Set());
      }
      this.typingUsers.get(data.roomId)!.add(client.userId);

      client.to(data.roomId).emit('typing_indicator', {
        userId: client.userId,
        roomId: data.roomId,
        isTyping: true,
      });

      return { status: 'ok' };
    } catch (error) {

      return { error: error.message };
    }
  }

  // Handle the event name that frontend is sending
  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const typingUsers = this.typingUsers.get(data.roomId);
      if (typingUsers) {
        typingUsers.delete(client.userId);
        if (typingUsers.size === 0) {
          this.typingUsers.delete(data.roomId);
        }
      }

      client.to(data.roomId).emit('typing_indicator', {
        userId: client.userId,
        roomId: data.roomId,
        isTyping: false,
      });

      return { status: 'ok' };
    } catch (error) {

      return { error: error.message };
    }
  }

  // Keep the original handlers for backward compatibility
  @SubscribeMessage('message:send')
  async handleSendMessageOriginal(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    return this.handleSendMessage(dto, client);
  }

  @SubscribeMessage('room:join')
  async handleJoinRoomOriginal(
    @MessageBody() data: { type: 'project' | 'direct'; id: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      let roomId: string;

      if (data.type === 'project') {
        // Validate project access
        const project = await this.messageService.getProjectMessages(
          data.id,
          client.userId,
          1,
          0,
        );
        roomId = `project:${data.id}`;
      } else {
        // Validate user exists for direct message
        const messages = await this.messageService.getDirectMessages(
          client.userId,
          data.id,
          1,
          0,
        );
        roomId = `direct:${Math.min(client.userId, data.id)}:${Math.max(client.userId, data.id)}`;
      }

      await client.join(roomId);

      // Mark messages as read
      if (data.type === 'project') {
        await this.messageService.markProjectAsRead(data.id, client.userId);
      } else {
        await this.messageService.markConversationAsRead(
          data.id,
          client.userId,
        );
      }

      // Emit read status to other users in room
      client.to(roomId).emit('messages:read', {
        userId: client.userId,
        roomId: data.id,
        roomType: data.type,
      });

      return { status: 'ok', roomId };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoomOriginal(
    @MessageBody() data: { type: 'project' | 'direct'; id: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    let roomId: string;
    if (data.type === 'project') {
      roomId = `project:${data.id}`;
    } else {
      roomId = `direct:${Math.min(client.userId, data.id)}:${Math.max(client.userId, data.id)}`;
    }

    await client.leave(roomId);
    return { status: 'ok' };
  }

  @SubscribeMessage('messages:get')
  async handleGetMessages(
    @MessageBody()
    data: {
      type: 'project' | 'direct';
      id: number;
      limit?: number;
      offset?: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      let messages: ChatMessageDto[];

      if (data.type === 'project') {
        messages = await this.messageService.getProjectMessages(
          data.id,
          client.userId,
          data.limit || 50,
          data.offset || 0,
        );
      } else {
        messages = await this.messageService.getDirectMessages(
          client.userId,
          data.id,
          data.limit || 50,
          data.offset || 0,
        );
      }

      return { status: 'ok', messages };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('rooms:get')
  async handleGetRooms(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const rooms = await this.messageService.getUserChatRooms(client.userId);
      return { status: 'ok', rooms };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStartOriginal(
    @MessageBody() data: { type: 'project' | 'direct'; id: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    let roomId: string;
    if (data.type === 'project') {
      roomId = `project:${data.id}`;
    } else {
      roomId = `direct:${Math.min(client.userId, data.id)}:${Math.max(client.userId, data.id)}`;
    }

    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    this.typingUsers.get(roomId)!.add(client.userId);

    client.to(roomId).emit('typing:start', {
      userId: client.userId,
      userName: client.user?.name,
    });

    return { status: 'ok' };
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStopOriginal(
    @MessageBody() data: { type: 'project' | 'direct'; id: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    let roomId: string;
    if (data.type === 'project') {
      roomId = `project:${data.id}`;
    } else {
      roomId = `direct:${Math.min(client.userId, data.id)}:${Math.max(client.userId, data.id)}`;
    }

    const typingUsers = this.typingUsers.get(roomId);
    if (typingUsers) {
      typingUsers.delete(client.userId);
      if (typingUsers.size === 0) {
        this.typingUsers.delete(roomId);
      }
    }

    client.to(roomId).emit('typing:stop', { userId: client.userId });

    return { status: 'ok' };
  }

  // Handle presence updates
  @SubscribeMessage('update_presence')
  @UseGuards(WsJwtGuard)
  async handlePresenceUpdate(
    @MessageBody() data: { status: 'online' | 'away' | 'offline' },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    // Update user presence
    this.userPresence.set(client.userId, {
      status: data.status,
      lastSeen: new Date(),
    });

    // Emit presence update to all connected clients
    this.server.emit('presence_update', {
      userId: client.userId,
      status: data.status,
      lastSeen: new Date(),
    });

    return { status: 'ok' };
  }

  // Get all user presence
  @SubscribeMessage('get_presence')
  @UseGuards(WsJwtGuard)
  async handleGetPresence(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    // Convert presence data to array format
    const presenceData = Array.from(this.userPresence.entries()).map(
      ([userId, data]) => ({
        userId,
        status: data.status,
        lastSeen: data.lastSeen,
      }),
    );

    return { status: 'ok', presence: presenceData };
  }

  // Get presence for specific users
  @SubscribeMessage('get_user_presence')
  @UseGuards(WsJwtGuard)
  async handleGetUserPresence(
    @MessageBody() data: { userIds: number[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    const presenceData = data.userIds.map((userId) => {
      const presence = this.userPresence.get(userId);
      return {
        userId,
        status: presence?.status || 'offline',
        lastSeen: presence?.lastSeen || new Date(0),
      };
    });

    return { status: 'ok', presence: presenceData };
  }
}
