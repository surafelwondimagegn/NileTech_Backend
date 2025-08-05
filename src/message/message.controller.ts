import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('message')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiQuery({
    name: 'type',
    enum: ['direct', 'group'],
    description: 'Type of conversation',
  })
  @ApiQuery({ name: 'targetId', description: 'Target user ID or group ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of messages to fetch (default: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of messages to skip (default: 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          content: 'Hello!',
          senderId: 1,
          receiverId: 2,
          type: 'direct',
          timestamp: '2025-07-26T12:00:00.000Z',
          isRead: true,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid parameters' })
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Request() req,
    @Query('type') type: 'direct' | 'group',
    @Query('targetId') targetId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    const userId = req.user.id;

    if (!type || !targetId) {
      throw new Error('Type and targetId are required');
    }

    if (type === 'direct') {
      const targetUserId = parseInt(targetId);
      if (isNaN(targetUserId)) {
        throw new Error('Invalid targetId for direct message');
      }

      const messages = await this.messageService.getDirectMessages(
        userId,
        targetUserId,
        limit,
        offset,
      );

      // Convert backend format to frontend format
      return messages.map((message) => ({
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
      }));
    } else if (type === 'group') {
      return await this.messageService.getGroupMessages(
        targetId,
        userId,
        limit,
        offset,
      );
    } else {
      throw new Error('Invalid message type. Must be "direct" or "group"');
    }
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
    schema: {
      example: [
        {
          id: 'direct_1_2',
          type: 'direct',
          participants: [1, 2],
          lastMessage: {
            id: '1',
            content: 'Hello!',
            senderId: 1,
            timestamp: '2025-07-26T12:00:00.000Z',
          },
          unreadCount: 0,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getConversations(@Request() req) {
    const userId = req.user.id;
    return await this.messageService.getUserConversations(userId);
  }
}
