import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto, MessageType } from './dto/send-message.dto';
import { ChatMessageDto, ChatRoomDto } from './dto/chat-response.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(dto: SendMessageDto, senderId: number): Promise<ChatMessageDto> {
    // Validate that either receiverId or projectId is provided
    if (!dto.receiverId && !dto.projectId) {
      throw new BadRequestException(
        'Either receiverId or projectId must be provided',
      );
    }

    // For direct messages, validate receiver exists
    if (dto.receiverId) {
      const receiver = await this.prisma.user.findUnique({
        where: { id: dto.receiverId },
      });
      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }
    }

    // For project messages, validate project exists and user has access
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        include: { client: true, assignedTo: true },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Check if user has access to project (client or assigned user)
      if (project.clientId !== senderId && project.assignedToId !== senderId) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    // Validate reply message exists if provided
    if (dto.replyToId) {
      const replyMessage = await this.prisma.message.findUnique({
        where: { id: dto.replyToId },
      });
      if (!replyMessage) {
        throw new NotFoundException('Reply message not found');
      }
    }

    // Create the message
    const message = await (this.prisma.message.create as any)({
      data: {
        senderId,
        ...(dto.receiverId && { receiverId: dto.receiverId }),
        ...(dto.projectId && { projectId: dto.projectId }),
        content: dto.content,
        messageType: dto.messageType || MessageType.TEXT,
        ...(dto.fileUrl && { fileUrl: dto.fileUrl }),
        ...(dto.fileName && { fileName: dto.fileName }),
        ...(dto.fileSize && { fileSize: dto.fileSize }),
        ...(dto.replyToId && { replyToId: dto.replyToId }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return this.formatMessageResponse(message);
  }

  async getProjectMessages(
    projectId: number,
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ChatMessageDto[]> {
    // Validate project access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true, assignedTo: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId !== userId && project.assignedToId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const messages = await (this.prisma.message.findMany as any)({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return messages.reverse().map((msg) => this.formatMessageResponse(msg));
  }

  async getDirectMessages(
    userId1: number,
    userId2: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ChatMessageDto[]> {
    // Validate both users exist
    const [user1, user2] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId1 } }),
      this.prisma.user.findUnique({ where: { id: userId2 } }),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('User not found');
    }

    const messages = await (this.prisma.message.findMany as any)({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return messages.reverse().map((msg) => this.formatMessageResponse(msg));
  }

  async getUserChatRooms(userId: number): Promise<ChatRoomDto[]> {
    // Get user's projects (as client or assigned)
    const userProjects = await this.prisma.project.findMany({
      where: {
        OR: [{ clientId: userId }, { assignedToId: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      } as any,
    });

    // Get direct message conversations
    const directMessages = await (this.prisma.message.findMany as any)({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group direct messages by conversation
    const conversationMap = new Map<number, any>();
    directMessages.forEach((msg) => {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (otherUserId && !conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, msg);
      }
    });

    const rooms: ChatRoomDto[] = [];

    // Add project rooms
    for (const project of userProjects) {
      if (project.messages.length > 0) {
        const lastMessage = project.messages[0];
        const unreadCount = await this.getUnreadCount(
          project.id,
          userId,
          'project',
        );

        rooms.push({
          type: 'project',
          id: project.id,
          name: project.title,
          lastMessage: this.formatMessageResponse(lastMessage),
          unreadCount,
          lastActivity: (lastMessage as any).createdAt,
        });
      }
    }

    // Add direct message rooms
    for (const [otherUserId, lastMessage] of conversationMap) {
      const otherUser =
        lastMessage.senderId === userId
          ? lastMessage.receiver
          : lastMessage.sender;
      const unreadCount = await this.getUnreadCount(
        otherUserId,
        userId,
        'direct',
      );

      rooms.push({
        type: 'direct',
        id: otherUserId,
        name: otherUser.name,
        lastMessage: this.formatMessageResponse(lastMessage),
        unreadCount,
        lastActivity: lastMessage.createdAt,
      });
    }

    // Sort by last activity
    return rooms.sort(
      (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime(),
    );
  }

  // Alias for getUserChatRooms to match controller expectations
  async getUserConversations(userId: number) {
    return this.getUserChatRooms(userId);
  }

  // Get group messages (for future group chat functionality)
  async getGroupMessages(
    groupId: string,
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ChatMessageDto[]> {
    // For now, return empty array as group functionality is not implemented
    // This can be extended when group chat is added
    return [];
  }

  async markAsRead(messageId: number, userId: number): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only mark as read if user is the receiver
    if (message.receiverId === userId) {
      await this.prisma.message.update({
        where: { id: messageId },
        data: { read: true },
      });
    }
  }

  async markProjectAsRead(projectId: number, userId: number): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        projectId,
        receiverId: userId,
        read: false,
      } as any,
      data: { read: true },
    });
  }

  async markConversationAsRead(
    otherUserId: number,
    userId: number,
  ): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async editMessage(
    messageId: number,
    content: string,
    userId: number,
  ): Promise<ChatMessageDto> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const updatedMessage = await (this.prisma.message.update as any)({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return this.formatMessageResponse(updatedMessage);
  }

  async findOne(messageId: number): Promise<ChatMessageDto | null> {
    const message = await (this.prisma.message.findUnique as any)({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return message ? this.formatMessageResponse(message) : null;
  }

  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  private async getUnreadCount(
    roomId: number,
    userId: number,
    type: 'project' | 'direct',
  ): Promise<number> {
    if (type === 'project') {
      return this.prisma.message.count({
        where: {
          projectId: roomId,
          senderId: { not: userId },
          read: false,
        } as any,
      });
    } else {
      return this.prisma.message.count({
        where: {
          senderId: roomId,
          receiverId: userId,
          read: false,
        },
      });
    }
  }

  private formatMessageResponse(message: any): ChatMessageDto {
    return {
      id: message.id,
      content: message.content,
      messageType: message.messageType as MessageType,
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
      project: message.project,
      replyTo: message.replyTo
        ? this.formatMessageResponse(message.replyTo)
        : undefined,
    };
  }
}
